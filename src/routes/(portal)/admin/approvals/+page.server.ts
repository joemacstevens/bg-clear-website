import { fail, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { logAuditEvent } from '$lib/api/audit';

export const load: PageServerLoad = async ({ locals }) => {
	const { data: orders, error } = await locals.supabase
		.from('orders')
		.select('*, order_items(*, products(id, name, sku, category)), profiles!orders_rep_id_fkey(full_name, email)')
		.eq('requires_approval', true)
		.eq('approval_status', 'pending')
		.order('created_at', { ascending: true });

	if (error) {
		console.error('Error fetching approval queue:', error);
		return { orders: [] };
	}

	return { orders };
};

export const actions: Actions = {
	approve: async ({ request, locals }) => {
		const session = await locals.safeGetSession();
		if (!session.user) return fail(401, { error: 'Unauthorized' });

		const form = await request.formData();
		const orderId = form.get('orderId') as string;
		const notes = form.get('notes') as string;

		const { error } = await locals.supabase
			.from('orders')
			.update({ 
				approval_status: 'approved',
				status: 'approved',
				approved_by: session.user.id,
				approval_notes: notes || null
			})
			.eq('id', orderId);

		if (error) return fail(500, { error: error.message });

		await logAuditEvent(
			locals.supabase,
			session.user.id,
			'approve_order',
			'orders',
			orderId,
			{ notes }
		);

		return { success: true, action: 'approve' };
	},
	reject: async ({ request, locals }) => {
		const session = await locals.safeGetSession();
		if (!session.user) return fail(401, { error: 'Unauthorized' });

		const form = await request.formData();
		const orderId = form.get('orderId') as string;
		const notes = form.get('notes') as string;

		if (!notes) {
			return fail(400, { error: 'Notes are required when rejecting an order' });
		}

		const { error } = await locals.supabase
			.from('orders')
			.update({ 
				approval_status: 'rejected',
				status: 'cancelled',
				approved_by: session.user.id,
				approval_notes: notes
			})
			.eq('id', orderId);

		if (error) return fail(500, { error: error.message });

		await logAuditEvent(
			locals.supabase,
			session.user.id,
			'reject_order',
			'orders',
			orderId,
			{ notes }
		);

		return { success: true, action: 'reject' };
	}
};
