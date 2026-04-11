import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, url }) => {
	const category = url.searchParams.get('category');

	let query = locals.supabase
		.from('product_pricing')
		.select('id, name, description, category, sku, vendor_name, image_url, image_urls, specs, is_active, is_featured, bg_cost, target_price, suggested_price, commission_at_target, commission_at_suggested')
		.eq('is_active', true)
		.order('category')
		.order('name');

	if (category) query = query.eq('category', category);

	const { data: products } = await query;

	return { products: products ?? [], selectedCategory: category };
};
