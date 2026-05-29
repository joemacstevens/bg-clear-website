import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, locals }) => {
	const { user } = await locals.safeGetSession();
	if (!user) throw redirect(303, '/login');

	const { data: order, error: orderErr } = await locals.supabase
		.from('orders')
		.select('id, order_number, customer_id, payment_collected, payment_collected_at, subtotal')
		.eq('id', params.orderId)
		.single();

	if (orderErr || !order) throw error(404, 'Order not found');
	if (order.customer_id !== user.id) throw error(403, 'Not your order');

	// Latest payment for this order. The webhook may not have arrived yet —
	// in that case `payment` is null and the client polls via invalidate().
	const { data: payment } = await locals.supabase
		.from('payments')
		.select('id, status, decision, decision_at, amount_cents, card_brand, card_last_four, reason_code')
		.eq('order_id', params.orderId)
		.order('created_at', { ascending: false })
		.limit(1)
		.maybeSingle();

	return { order, payment };
};
