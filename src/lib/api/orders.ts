import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database, OrderStatus } from '$lib/database.types';

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
