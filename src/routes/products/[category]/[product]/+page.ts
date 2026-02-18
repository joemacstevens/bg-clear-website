import { error } from '@sveltejs/kit';
import { categories, getProductBySlug, getRelatedProducts } from '$lib/data/products';
import type { PageLoad } from './$types';

export const load: PageLoad = ({ params }) => {
	const category = categories[params.category];
	if (!category) {
		throw error(404, 'Category not found');
	}

	const product = getProductBySlug(params.product);
	if (!product || product.category !== params.category) {
		throw error(404, 'Product not found');
	}

	const related = getRelatedProducts(product, 3);

	return {
		product,
		category,
		categorySlug: params.category,
		related
	};
};
