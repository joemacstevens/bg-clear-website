import { error } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import type { OrderStatus } from '$lib/database.types';

const STATUS_TRANSITIONS: Record<string, string[]> = {
	approved: ['placed_with_supplier'],
	placed_with_supplier: ['shipped'],
	shipped: ['delivered'],
	delivered: ['payment_collected'],
	payment_collected: ['commission_paid']
};

export const load: PageServerLoad = async ({ params, locals }) => {
	const { data: order, error: err } = await locals.supabase
		.from('orders')
		.select(`
			*,
			order_items(*, products(id, name, category, vendor_name)),
			profiles!orders_customer_id_fkey(full_name, company_name, email, phone)
		`)
		.eq('id', params.orderId)
		.single();

	if (err || !order) throw error(404, 'Order not found');

	const nextStatuses = STATUS_TRANSITIONS[order.status] ?? [];

	return { order, customer: (order as any).profiles, nextStatuses };
};

export const actions: Actions = {
	updateStatus: async ({ request, locals, params }) => {
		const form = await request.formData();
		const newStatus = form.get('status') as OrderStatus;

		const { error: err } = await locals.supabase
			.from('orders')
			.update({ status: newStatus })
			.eq('id', params.orderId);

		if (err) return { success: false, error: err.message };
		return { success: true };
	}
};
