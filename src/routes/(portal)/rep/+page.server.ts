import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const { profile } = await locals.safeGetSession();
	const userId = profile?.id;

	const [productsRes, quotesRes, ordersRes, customersRes] = await Promise.all([
		locals.supabase.from('product_pricing').select('id', { count: 'exact' }).eq('is_active', true),
		locals.supabase.from('quote_requests').select('id, status')
			.or(userId ? `assigned_rep_id.eq.${userId},assigned_rep_id.is.null` : 'assigned_rep_id.is.null'),
		locals.supabase.from('orders').select('id, status, order_items(commission_amount)')
			.eq('rep_id', userId ?? ''),
		locals.supabase.from('profiles').select('id', { count: 'exact' })
			.eq('assigned_rep_id', userId ?? '')
	]);

	const pendingQuotes = quotesRes.data?.filter((q) => q.status === 'pending').length ?? 0;

	let totalCommission = 0;
	for (const order of (ordersRes.data ?? [])) {
		for (const item of (order.order_items ?? []) as any[]) {
			totalCommission += item.commission_amount ?? 0;
		}
	}

	const { data: recentQuotes } = await locals.supabase
		.from('quote_requests')
		.select('id, status, created_at, notes, quote_request_items(id, quantity, products(name))')
		.or(userId ? `assigned_rep_id.eq.${userId},assigned_rep_id.is.null` : 'assigned_rep_id.is.null')
		.in('status', ['pending', 'in_progress'])
		.order('created_at', { ascending: false })
		.limit(5);

	return {
		stats: {
			activeProducts: productsRes.count ?? 0,
			totalQuotes: quotesRes.data?.length ?? 0,
			pendingQuotes,
			activeOrders: (ordersRes.data ?? []).filter((o) =>
				!['commission_paid', 'cancelled'].includes(o.status)
			).length,
			totalCommission: Math.round(totalCommission * 100) / 100,
			assignedCustomers: customersRes.count ?? 0
		},
		recentQuotes: recentQuotes ?? []
	};
};
