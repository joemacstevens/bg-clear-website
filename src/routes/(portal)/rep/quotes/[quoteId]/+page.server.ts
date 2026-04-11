import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { createOrderFromQuote } from '$lib/api/orders';
import { computeCommission, isPriceBelowTarget } from '$lib/utils/pricing';

export const load: PageServerLoad = async ({ params, locals }) => {
	// Get quote with items + product pricing
	const { data: quote, error: quoteErr } = await locals.supabase
		.from('quote_requests')
		.select(`
			*,
			profiles!quote_requests_customer_id_fkey(full_name, company_name, email, phone),
			quote_request_items(
				id, quantity, quoted_price,
				products(id, name, category, vendor_name, image_url, specs)
			)
		`)
		.eq('id', params.quoteId)
		.single();

	if (quoteErr || !quote) throw error(404, 'Quote not found');

	// Get pricing data for the products in this quote
	const productIds = quote.quote_request_items
		?.map((item: any) => item.products?.id)
		.filter(Boolean) ?? [];

	const { data: pricing } = await locals.supabase
		.from('product_pricing')
		.select('id, name, category, vendor_name, image_url, bg_cost, target_price, suggested_price, commission_at_target, commission_at_suggested')
		.in('id', productIds.length ? productIds : ['none']);

	// Merge pricing into items
	const pricingMap = new Map((pricing ?? []).map((p) => [p.id, p]));

	const itemsWithPricing = (quote.quote_request_items ?? []).map((item: any) => ({
		...item,
		pricing: item.products ? pricingMap.get(item.products.id) ?? null : null
	}));

	return {
		quote: { ...quote, quote_request_items: itemsWithPricing },
		customer: (quote as any).profiles
	};
};

export const actions: Actions = {
	updatePrices: async ({ request, locals, params }) => {
		const form = await request.formData();
		const itemIds = form.getAll('item_id') as string[];
		const prices = form.getAll('quoted_price') as string[];

		const errors: string[] = [];

		for (let i = 0; i < itemIds.length; i++) {
			const price = parseFloat(prices[i]);
			if (!isNaN(price) && price > 0) {
				const { error: itemErr } = await locals.supabase
					.from('quote_request_items')
					.update({ quoted_price: price })
					.eq('id', itemIds[i]);
				if (itemErr) errors.push(`Item update failed: ${itemErr.message}`);
			}
		}

		// Update quote status to 'quoted'
		const { error: statusErr } = await locals.supabase
			.from('quote_requests')
			.update({ status: 'quoted' })
			.eq('id', params.quoteId);

		if (statusErr) errors.push(`Status update failed: ${statusErr.message}`);

		if (errors.length > 0) {
			return { success: false, error: errors.join('; ') };
		}

		return { success: true };
	},

	createOrder: async ({ request, locals, params }) => {
		const { profile } = await locals.safeGetSession();
		if (!profile) return { success: false, error: 'Not authenticated' };

		// Get the quote with items and pricing
		const { data: quote } = await locals.supabase
			.from('quote_requests')
			.select('*, quote_request_items(*, products(id))')
			.eq('id', params.quoteId)
			.single();

		if (!quote) return { success: false, error: 'Quote not found' };

		// Get pricing for all products (including commission rate percentages)
		const productIds = quote.quote_request_items
			?.map((item: any) => item.products?.id)
			.filter(Boolean) ?? [];

		const { data: pricing } = await locals.supabase
			.from('product_pricing')
			.select('id, bg_cost, target_price, suggested_price, vendor_cost, commission_at_target_pct, commission_above_target_pct')
			.in('id', productIds);

		const pricingMap = new Map((pricing ?? []).map((p: any) => [p.id, p]));

		let requiresApproval = false;
		const orderItems = [];

		for (const item of (quote.quote_request_items ?? []) as any[]) {
			const p = pricingMap.get(item.products?.id);
			if (!p || !item.quoted_price) continue;

			if (isPriceBelowTarget(item.quoted_price, p.target_price)) requiresApproval = true;

			const commissionAmount = computeCommission(
				item.quoted_price,
				p.bg_cost,
				p.target_price,
				p.commission_at_target_pct,
				p.commission_above_target_pct
			);

			orderItems.push({
				productId: item.products.id,
				quantity: item.quantity,
				unitPrice: item.quoted_price,
				vendorCost: p.vendor_cost,
				bgCost: p.bg_cost,
				targetPrice: p.target_price,
				commissionAmount
			});
		}

		const { data: order, error: orderErr } = await createOrderFromQuote(
			locals.supabase,
			params.quoteId,
			quote.customer_id,
			profile.id,
			orderItems,
			requiresApproval
		);

		if (orderErr || !order) {
			return { success: false, error: (orderErr as any)?.message ?? 'Failed to create order' };
		}

		throw redirect(303, `/rep/orders/${order.id}`);
	}
};
