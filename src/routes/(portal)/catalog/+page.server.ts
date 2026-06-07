import type { PageServerLoad } from './$types';
import { getCategoryTree } from '$lib/api/categories';

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

	const [{ data: products }, tree] = await Promise.all([
		query,
		getCategoryTree(locals.supabase)
	]);

	return {
		products: products ?? [],
		selectedCategory: category,
		tree
	};
};
