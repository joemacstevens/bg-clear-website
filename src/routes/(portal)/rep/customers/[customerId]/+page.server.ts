import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

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
