import type { PageServerLoad } from './$types';
import { getOrders } from '$lib/api/orders';

export const load: PageServerLoad = async ({ locals }) => {
	const { user } = await locals.safeGetSession();
	if (!user) return { orders: [] };

	const { data: orders } = await getOrders(locals.supabase, { customerId: user.id });

	return { orders: orders ?? [] };
};
