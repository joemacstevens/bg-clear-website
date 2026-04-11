import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ locals, params }) => {
	const { data: product, error: err } = await locals.supabase
		.from('products')
		.select('*')
		.eq('id', params.productId)
		.eq('is_active', true)
		.single();

	if (err || !product) {
		throw error(404, 'Product not found');
	}

	return { product };
};
