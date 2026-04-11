import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

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
		.select('*')
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

		for (let i = 0; i < itemIds.length; i++) {
			const price = parseFloat(prices[i]);
			if (!isNaN(price) && price > 0) {
				await locals.supabase
					.from('quote_request_items')
					.update({ quoted_price: price })
					.eq('id', itemIds[i]);
			}
		}

		// Update quote status to 'quoted'
		await locals.supabase
			.from('quote_requests')
			.update({ status: 'quoted' })
			.eq('id', params.quoteId);

		return { success: true };
	},

	createOrder: async ({ request, locals, params }) => {
		const form = await request.formData();
		const { profile } = await locals.safeGetSession();
		if (!profile) return { success: false, error: 'Not authenticated' };

		// Get the quote with items and pricing
		const { data: quote } = await locals.supabase
			.from('quote_requests')
			.select('*, quote_request_items(*, products(id))')
			.eq('id', params.quoteId)
			.single();

		if (!quote) return { success: false, error: 'Quote not found' };

		// Get pricing for all products
		const productIds = quote.quote_request_items
			?.map((item: any) => item.products?.id)
			.filter(Boolean) ?? [];

		const { data: pricing } = await locals.supabase
			.from('product_pricing')
			.select('*')
			.in('id', productIds);

		const pricingMap = new Map((pricing ?? []).map((p: any) => [p.id, p]));

		let requiresApproval = false;
		const orderItems = [];

		for (const item of (quote.quote_request_items ?? []) as any[]) {
			const p = pricingMap.get(item.products?.id);
			if (!p || !item.quoted_price) continue;

			if (item.quoted_price < p.target_price) requiresApproval = true;

			// Calculate commission
			const markupDollars = Math.max(0, Math.min(item.quoted_price, p.target_price) - p.bg_cost);
			const aboveDollars = Math.max(0, item.quoted_price - p.target_price);
			const commission = markupDollars * 0.5 + aboveDollars * 0.65;

			orderItems.push({
				productId: item.products.id,
				quantity: item.quantity,
				unitPrice: item.quoted_price,
				vendorCost: p.vendor_cost,
				bgCost: p.bg_cost,
				targetPrice: p.target_price,
				commissionAmount: Math.round(commission * 100) / 100
			});
		}

		const subtotal = orderItems.reduce((s, i) => s + i.unitPrice * i.quantity, 0);

		const { data: order, error: orderErr } = await locals.supabase
			.from('orders')
			.insert({
				customer_id: quote.customer_id,
				rep_id: profile.id,
				quote_request_id: quote.id,
				status: requiresApproval ? 'pending_approval' : 'approved',
				subtotal: Math.round(subtotal * 100) / 100,
				requires_approval: requiresApproval,
				approval_status: requiresApproval ? 'pending' : 'approved'
			})
			.select()
			.single();

		if (orderErr || !order) return { success: false, error: orderErr?.message ?? 'Failed to create order' };

		// Insert order items
		await locals.supabase.from('order_items').insert(
			orderItems.map((i) => ({
				order_id: order.id,
				product_id: i.productId,
				quantity: i.quantity,
				unit_price: i.unitPrice,
				vendor_cost: i.vendorCost,
				bg_cost: i.bgCost,
				target_price: i.targetPrice,
				commission_amount: i.commissionAmount
			}))
		);

		// Update quote status
		await locals.supabase
			.from('quote_requests')
			.update({ status: 'accepted' })
			.eq('id', params.quoteId);

		throw redirect(303, `/rep/orders/${order.id}`);
	}
};
