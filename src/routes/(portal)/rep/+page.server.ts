import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	// Reps see the full pricing view
	const { data: products } = await locals.supabase
		.from('product_pricing')
		.select('*')
		.eq('is_active', true)
		.order('category')
		.order('name');

	const { data: quoteRequests } = await locals.supabase
		.from('quote_requests')
		.select('*, quote_request_items(*, products(name, category))')
		.order('created_at', { ascending: false })
		.limit(20);

	return {
		products: products ?? [],
		quoteRequests: quoteRequests ?? []
	};
};
