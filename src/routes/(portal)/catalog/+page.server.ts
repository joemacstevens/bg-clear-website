import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, url }) => {
	const category = url.searchParams.get('category');

	let query = locals.supabase
		.from('products')
		.select('*')
		.eq('is_active', true)
		.order('category')
		.order('name');

	if (category) {
		query = query.eq('category', category);
	}

	const { data: products, error } = await query;

	return {
		products: products ?? [],
		selectedCategory: category
	};
};
