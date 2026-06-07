import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { env } from '$env/dynamic/private';
import { createOrderFromQuote, buildOrderItemsFromQuote } from '$lib/api/orders';
import { createSupabaseAdminClient } from '$lib/server/supabase-admin';
import { notifyQuoteReady } from '$lib/server/email';

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
	updatePrices: async ({ request, locals, params, url }) => {
		const { profile } = await locals.safeGetSession();
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

		// Mark quoted and record the pricing rep as the assigned rep — the rep
		// who quotes the price owns the quote (and the resulting commission).
		// This ensures customer acceptance always has a rep to attribute the order to.
		const statusUpdate: { status: string; assigned_rep_id?: string } = { status: 'quoted' };
		if (profile?.id) statusUpdate.assigned_rep_id = profile.id;

		const { error: statusErr } = await locals.supabase
			.from('quote_requests')
			.update(statusUpdate)
			.eq('id', params.quoteId);

		if (statusErr) errors.push(`Status update failed: ${statusErr.message}`);

		if (errors.length > 0) {
			return { success: false, error: errors.join('; ') };
		}

		// Notify the customer that their quote is priced and ready. Fire-and-forget.
		try {
			const admin = createSupabaseAdminClient();
			const { data: q } = await admin
				.from('quote_requests')
				.select('customer:profiles!quote_requests_customer_id_fkey(email, full_name, company_name)')
				.eq('id', params.quoteId)
				.single();
			const customer = (q as any)?.customer;
			if (customer?.email) {
				await notifyQuoteReady({
					to: customer.email,
					origin: url.origin,
					quoteId: params.quoteId,
					customerName: customer.full_name || customer.company_name || 'there'
				});
			}
		} catch (e) {
			console.error('[notify] quote-ready email failed', e);
		}

		return { success: true };
	},

	createOrder: async ({ locals, params }) => {
		const { profile } = await locals.safeGetSession();
		if (!profile) return { success: false, error: 'Not authenticated' };

		const { quote, orderItems, requiresApproval, error: buildErr } = await buildOrderItemsFromQuote(
			locals.supabase,
			params.quoteId
		);

		if (buildErr || !quote) {
			return { success: false, error: (buildErr as any)?.message ?? 'Quote not found' };
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
