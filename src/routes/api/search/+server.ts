import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url, locals }) => {
	const raw = (url.searchParams.get('q') ?? '').trim();
	// Strip characters that would break PostgREST or()/ilike filters.
	const q = raw.replace(/[,()%*]/g, ' ').trim();
	const supabase = locals.supabase;

	if (!q) {
		// Empty query → popular (top-level) categories for the "browse" panel.
		const { data: cats } = await supabase
			.from('product_categories')
			.select('id, name, slug')
			.eq('is_active', true)
			.is('parent_id', null)
			.order('sort_order');
		return json({ q: '', products: [], categories: cats ?? [] });
	}

	const like = `%${q}%`;
	const [{ data: products }, { data: categories }] = await Promise.all([
		supabase
			.from('products')
			.select('id, name, image_url, vendor_name')
			.eq('is_active', true)
			.or(`name.ilike.${like},vendor_name.ilike.${like},sku.ilike.${like}`)
			.order('name')
			.limit(8),
		supabase
			.from('product_categories')
			.select('id, name, slug')
			.eq('is_active', true)
			.ilike('name', like)
			.limit(6)
	]);

	return json({ q, products: products ?? [], categories: categories ?? [] });
};
