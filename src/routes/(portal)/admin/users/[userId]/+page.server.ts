import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getProfile } from '$lib/api/profiles';
import { getOrders } from '$lib/api/orders';
import { getQuoteRequests } from '$lib/api/quotes';

export const load: PageServerLoad = async ({ params, locals }) => {
	const userId = params.userId;

	const { data: profile, error: profileError } = await getProfile(locals.supabase, userId);

	if (profileError || !profile) {
		throw error(404, 'User not found');
	}

	const isCustomer = profile.role === 'customer';
	const isRep = profile.role === 'sales_rep';

	let orders = [];
	let quotes = [];

	if (isCustomer) {
		const [ordersRes, quotesRes] = await Promise.all([
			getOrders(locals.supabase, { customerId: userId }),
			getQuoteRequests(locals.supabase, { customerId: userId })
		]);
		orders = ordersRes.data || [];
		quotes = quotesRes.data || [];
	} else if (isRep) {
		const [ordersRes, quotesRes] = await Promise.all([
			getOrders(locals.supabase, { repId: userId }),
			getQuoteRequests(locals.supabase, { repId: userId })
		]);
		orders = ordersRes.data || [];
		quotes = quotesRes.data || [];
	}

	return {
		profile,
		orders,
		quotes
	};
};
