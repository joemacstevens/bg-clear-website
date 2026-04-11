import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, url }) => {
	const { profile } = await locals.safeGetSession();
	const statusFilter = url.searchParams.get('status');

	let query = locals.supabase
		.from('orders')
		.select('*, order_items(id, quantity, unit_price, commission_amount, products(name, category)), profiles!orders_customer_id_fkey(full_name, company_name)')
		.eq('rep_id', profile?.id ?? '')
		.order('created_at', { ascending: false });

	if (statusFilter) query = query.eq('status', statusFilter);

	const { data: orders } = await query;

	return { orders: orders ?? [], statusFilter };
};
