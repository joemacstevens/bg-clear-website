import type { PageServerLoad, Actions } from './$types';
import { error, fail } from '@sveltejs/kit';
import { createSupabaseAdminClient } from '$lib/server/supabase-admin';
import { getCategoryTree, getCategoryContext, getProductsInCategories } from '$lib/api/categories';

const EDITABLE = ['pending', 'in_progress', 'quoted'];

export const load: PageServerLoad = async ({ locals, params, url }) => {
	const { profile } = await locals.safeGetSession();
	if (!profile || !['sales_rep', 'manager', 'admin'].includes(profile.role ?? '')) {
		throw error(403, 'Not allowed');
	}

	const { data: quote } = await locals.supabase
		.from('quote_requests')
		.select(
			'id, status, customer:profiles!quote_requests_customer_id_fkey(full_name, company_name, account_number)'
		)
		.eq('id', params.quoteId)
		.single();
	if (!quote) throw error(404, 'Quote not found');

	const categorySlug = url.searchParams.get('category');
	const treeP = getCategoryTree(locals.supabase);

	let products: any[] = [];
	let activeCategory: { name: string; slug: string } | null = null;

	if (categorySlug) {
		const ctx = await getCategoryContext(locals.supabase, categorySlug);
		if (ctx) {
			activeCategory = { name: ctx.node.name, slug: ctx.node.slug };
			products = await getProductsInCategories(locals.supabase, ctx.descendantIds);
		}
	}
	if (!activeCategory) {
		const { data } = await locals.supabase
			.from('products')
			.select('id, name, description, vendor_name, sku, image_url, category')
			.eq('is_active', true)
			.order('name');
		products = data ?? [];
	}

	const { data: items } = await locals.supabase
		.from('quote_request_items')
		.select('product_id')
		.eq('quote_request_id', params.quoteId);

	return {
		quoteId: params.quoteId,
		customer: (quote as any).customer,
		editable: EDITABLE.includes((quote as any).status),
		tree: await treeP,
		products,
		activeCategory,
		inQuoteIds: (items ?? []).map((i: any) => i.product_id)
	};
};

export const actions: Actions = {
	// Add a product to THIS quote (the one the rep is building for the customer).
	addToQuote: async ({ request, locals, params }) => {
		const { profile } = await locals.safeGetSession();
		if (!profile || !['sales_rep', 'manager', 'admin'].includes(profile.role ?? '')) {
			return fail(403, { error: 'Not allowed' });
		}
		const form = await request.formData();
		const productId = String(form.get('product_id') ?? '');
		const quantity = Math.max(1, Math.floor(Number(form.get('quantity')) || 1));
		if (!productId) return fail(400, { error: 'No product selected' });

		const admin = createSupabaseAdminClient();

		const { data: q } = await admin
			.from('quote_requests')
			.select('status')
			.eq('id', params.quoteId)
			.single();
		if (!q || !EDITABLE.includes((q as any).status)) {
			return fail(400, { error: 'This quote can no longer be edited.' });
		}

		// Don't add the same product twice — bump quantity instead.
		const { data: existing } = await admin
			.from('quote_request_items')
			.select('id, quantity')
			.eq('quote_request_id', params.quoteId)
			.eq('product_id', productId)
			.maybeSingle();

		if (existing) {
			await admin
				.from('quote_request_items')
				.update({ quantity: (existing as any).quantity + quantity })
				.eq('id', (existing as any).id);
		} else {
			const { error: insErr } = await admin
				.from('quote_request_items')
				.insert({ quote_request_id: params.quoteId, product_id: productId, quantity });
			if (insErr) return fail(500, { error: insErr.message });
		}

		return { success: true, productId };
	}
};
