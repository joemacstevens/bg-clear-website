import { error, redirect, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { createSupabaseAdminClient } from '$lib/server/supabase-admin';

export const load: PageServerLoad = async ({ params, locals }) => {
	const { data: customer, error: err } = await locals.supabase
		.from('profiles')
		.select('*')
		.eq('id', params.customerId)
		.single();

	if (err || !customer) throw error(404, 'Customer not found');

	const [quotesRes, ordersRes] = await Promise.all([
		locals.supabase.from('quote_requests')
			.select('id, status, created_at, quote_request_items(id)')
			.eq('customer_id', params.customerId)
			.order('created_at', { ascending: false })
			.limit(10),
		locals.supabase.from('orders')
			.select('id, order_number, status, subtotal, created_at')
			.eq('customer_id', params.customerId)
			.order('created_at', { ascending: false })
			.limit(10)
	]);

	return {
		customer,
		quotes: quotesRes.data ?? [],
		orders: ordersRes.data ?? []
	};
};

export const actions: Actions = {
	// Rep originates a draft quote for this customer and jumps into the builder.
	// status 'in_progress' = a rep-built draft (distinct from customer-submitted
	// 'pending'); the customer stays hands-off until it's time to pay.
	createQuote: async ({ params, locals }) => {
		const { profile } = await locals.safeGetSession();
		if (!profile || !['sales_rep', 'manager', 'admin'].includes(profile.role ?? '')) {
			return fail(403, { error: 'Not allowed' });
		}
		const admin = createSupabaseAdminClient();
		const { data: quote, error: insErr } = await admin
			.from('quote_requests')
			.insert({
				customer_id: params.customerId,
				assigned_rep_id: profile.id,
				status: 'in_progress'
			})
			.select('id')
			.single();

		if (insErr || !quote) {
			return fail(500, { error: insErr?.message ?? 'Could not start a quote' });
		}
		throw redirect(303, `/rep/quotes/${quote.id}`);
	}
};
