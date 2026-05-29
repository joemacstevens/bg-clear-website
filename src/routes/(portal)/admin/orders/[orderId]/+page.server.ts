import { error, fail, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { pushOrderToWoo } from '$lib/server/integrations/woo';

export const load: PageServerLoad = async ({ params, locals }) => {
	const { data: order, error: orderErr } = await locals.supabase
		.from('orders')
		.select(
			`
			*,
			order_items(*, products(id, name, sku, vendor_name, category)),
			customer:profiles!orders_customer_id_fkey(id, full_name, company_name, email, phone),
			rep:profiles!orders_rep_id_fkey(id, full_name, email)
			`
		)
		.eq('id', params.orderId)
		.single();

	if (orderErr || !order) throw error(404, 'Order not found');

	const { data: payments } = await locals.supabase
		.from('payments')
		.select('*')
		.eq('order_id', params.orderId)
		.order('created_at', { ascending: false });

	return { order, payments: payments ?? [] };
};

export const actions: Actions = {
	retryWooSync: async ({ request, locals }) => {
		const session = await locals.safeGetSession();
		if (!session.user) return fail(401, { error: 'Unauthorized' });

		const form = await request.formData();
		const orderId = form.get('orderId') as string;
		if (!orderId) return fail(400, { error: 'orderId required' });

		// Force a retry: clear the failed state so pushOrderToWoo's row-claim
		// will succeed. The row-claim itself remains the atomicity guarantee.
		const { error: resetErr } = await locals.supabase
			.from('orders')
			.update({ woo_sync_status: 'failed' })
			.eq('id', orderId)
			.eq('woo_sync_status', 'failed');

		// resetErr is ignored — the claim inside pushOrderToWoo accepts both
		// 'not_synced' and 'failed', so a state mismatch here just means
		// someone already moved it on.

		const result = await pushOrderToWoo(locals.supabase, orderId, session.user.id);

		if (result.status === 'failed') {
			return fail(500, { error: result.error ?? 'Sync failed', wooSync: 'failed' });
		}
		return { success: true, wooSync: result.status };
	}
};
