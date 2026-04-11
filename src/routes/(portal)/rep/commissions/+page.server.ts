import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const { profile } = await locals.safeGetSession();

	const { data: orders } = await locals.supabase
		.from('orders')
		.select('id, order_number, status, created_at, order_items(commission_amount, quantity, unit_price, products(name))')
		.eq('rep_id', profile?.id ?? '')
		.not('status', 'eq', 'cancelled')
		.order('created_at', { ascending: false });

	let earned = 0, pending = 0, paid = 0;
	const orderSummaries = [];

	for (const order of (orders ?? [])) {
		let orderCommission = 0;
		let orderRevenue = 0;
		for (const item of (order.order_items ?? []) as any[]) {
			orderCommission += item.commission_amount ?? 0;
			orderRevenue += (item.unit_price ?? 0) * (item.quantity ?? 1);
		}

		if (['commission_paid'].includes(order.status)) paid += orderCommission;
		else if (['delivered', 'payment_collected'].includes(order.status)) earned += orderCommission;
		else pending += orderCommission;

		orderSummaries.push({
			id: order.id,
			orderNumber: order.order_number,
			status: order.status,
			date: order.created_at,
			revenue: Math.round(orderRevenue * 100) / 100,
			commission: Math.round(orderCommission * 100) / 100,
			items: order.order_items?.length ?? 0
		});
	}

	return {
		totals: {
			earned: Math.round(earned * 100) / 100,
			pending: Math.round(pending * 100) / 100,
			paid: Math.round(paid * 100) / 100,
			total: Math.round((earned + pending + paid) * 100) / 100
		},
		orders: orderSummaries
	};
};
