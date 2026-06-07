import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database, OrderStatus } from '$lib/database.types';
import { computeCommission, isPriceBelowTarget } from '$lib/utils/pricing';

export interface BuiltOrderItem {
	productId: string;
	quantity: number;
	unitPrice: number;
	vendorCost: number;
	bgCost: number;
	targetPrice: number;
	commissionAmount: number;
}

/**
 * Reconstruct order line items from a quote's current items + live pricing.
 * Used by both the rep's direct create-order action and the customer's
 * accept-quote action so the commission / approval logic lives in one place.
 */
export async function buildOrderItemsFromQuote(supabase: SupabaseClient<Database>, quoteId: string) {
	const { data: quote, error: quoteErr } = await supabase
		.from('quote_requests')
		.select('*, quote_request_items(*, products(id))')
		.eq('id', quoteId)
		.single();

	if (quoteErr || !quote) {
		return { quote: null, orderItems: [] as BuiltOrderItem[], requiresApproval: false, error: quoteErr ?? { message: 'Quote not found' } };
	}

	const productIds = (quote.quote_request_items ?? [])
		.map((item: any) => item.products?.id)
		.filter(Boolean);

	const { data: pricing } = await supabase
		.from('product_pricing')
		.select('id, bg_cost, target_price, suggested_price, vendor_cost, commission_at_target_pct, commission_above_target_pct')
		.in('id', productIds.length ? productIds : ['none']);

	const pricingMap = new Map((pricing ?? []).map((p: any) => [p.id, p]));

	let requiresApproval = false;
	const orderItems: BuiltOrderItem[] = [];

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

	return { quote, orderItems, requiresApproval, error: null };
}

export async function getOrders(supabase: SupabaseClient<Database>, filters: { customerId?: string; repId?: string; status?: OrderStatus } = {}) {
	let query = supabase
		.from('orders')
		.select('*, order_items(*, products(id, name, category))')
		.order('created_at', { ascending: false });

	if (filters.customerId) query = query.eq('customer_id', filters.customerId);
	if (filters.repId) query = query.eq('rep_id', filters.repId);
	if (filters.status) query = query.eq('status', filters.status);

	return query;
}

export async function getOrderById(supabase: SupabaseClient<Database>, id: string) {
	return supabase
		.from('orders')
		.select('*, order_items(*, products(id, name, category, vendor_name, image_url))')
		.eq('id', id)
		.single();
}

export async function createOrderFromQuote(
	supabase: SupabaseClient<Database>,
	quoteRequestId: string,
	customerId: string,
	repId: string,
	items: {
		productId: string;
		quantity: number;
		unitPrice: number;
		vendorCost: number;
		bgCost: number;
		targetPrice: number;
		commissionAmount: number;
	}[],
	requiresApproval: boolean
) {
	// Lock the quote by updating status — only succeeds if currently 'quoted'
	const { data: updated, error: lockErr } = await supabase
		.from('quote_requests')
		.update({ status: 'accepted' })
		.eq('id', quoteRequestId)
		.eq('status', 'quoted')
		.select()
		.single();

	if (lockErr || !updated) {
		return { data: null, error: lockErr ?? { message: 'Quote already processed or not in quoted state' } };
	}

	const subtotal = items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);

	const { data: order, error: orderError } = await supabase
		.from('orders')
		.insert({
			customer_id: customerId,
			rep_id: repId,
			quote_request_id: quoteRequestId,
			status: requiresApproval ? 'pending_approval' : 'approved',
			subtotal: Math.round(subtotal * 100) / 100,
			requires_approval: requiresApproval,
			approval_status: requiresApproval ? 'pending' : 'approved'
		})
		.select()
		.single();

	if (orderError || !order) return { data: null, error: orderError };

	const itemRows = items.map((i) => ({
		order_id: order.id,
		product_id: i.productId,
		quantity: i.quantity,
		unit_price: i.unitPrice,
		vendor_cost: i.vendorCost,
		bg_cost: i.bgCost,
		target_price: i.targetPrice,
		commission_amount: i.commissionAmount
	}));

	const { error: itemsError } = await supabase.from('order_items').insert(itemRows);
	if (itemsError) return { data: null, error: itemsError };

	return { data: order, error: null };
}

export async function updateOrderStatus(supabase: SupabaseClient<Database>, id: string, status: OrderStatus) {
	return supabase.from('orders').update({ status }).eq('id', id);
}
