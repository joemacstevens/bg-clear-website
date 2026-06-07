import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { getCategoryContext, getProductsInCategories } from '$lib/api/categories';

export const load: PageServerLoad = async ({ locals, params }) => {
	const ctx = await getCategoryContext(locals.supabase, params.slug);
	if (!ctx) throw error(404, 'Category not found');

	const products = await getProductsInCategories(locals.supabase, ctx.descendantIds);

	return {
		node: ctx.node,
		ancestors: ctx.ancestors,
		children: ctx.children,
		tree: ctx.tree,
		products
	};
};
