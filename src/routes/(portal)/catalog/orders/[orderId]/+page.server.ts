import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { getOrderById } from '$lib/api/orders';

export const load: PageServerLoad = async ({ locals, params }) => {
	const { data: order, error: err } = await getOrderById(locals.supabase, params.orderId);

	if (err || !order) {
		throw error(404, 'Order not found');
	}

	return { order };
};
