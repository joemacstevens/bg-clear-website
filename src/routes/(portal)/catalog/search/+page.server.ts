import type { PageServerLoad } from './$types';
import { getCategoryTree } from '$lib/api/categories';

export const load: PageServerLoad = async ({ locals, url }) => {
	const raw = (url.searchParams.get('q') ?? '').trim();
	const q = raw.replace(/[,()%*]/g, ' ').trim();

	const treeP = getCategoryTree(locals.supabase);

	let products: any[] = [];
	let categories: any[] = [];
	if (q) {
		const like = `%${q}%`;
		const [{ data: prod }, { data: cats }] = await Promise.all([
			locals.supabase
				.from('products')
				.select('*')
				.eq('is_active', true)
				.or(`name.ilike.${like},vendor_name.ilike.${like},sku.ilike.${like},description.ilike.${like}`)
				.order('name'),
			locals.supabase
				.from('product_categories')
				.select('id, name, slug')
				.eq('is_active', true)
				.ilike('name', like)
				.limit(8)
		]);
		products = prod ?? [];
		categories = cats ?? [];
	}

	return { q: raw, products, categories, tree: await treeP };
};
