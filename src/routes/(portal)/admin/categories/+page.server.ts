import type { PageServerLoad, Actions } from './$types';
import { fail } from '@sveltejs/kit';
import { createSupabaseAdminClient } from '$lib/server/supabase-admin';
import { buildTree } from '$lib/api/categories';

export const load: PageServerLoad = async ({ locals }) => {
	const [{ data: cats }, { data: maps }] = await Promise.all([
		locals.supabase
			.from('product_categories')
			.select('id, parent_id, name, slug, description, icon, sort_order, is_active')
			.order('sort_order'),
		locals.supabase.from('product_category_map').select('category_id')
	]);

	const counts: Record<string, number> = {};
	for (const m of (maps as any[]) ?? []) {
		counts[m.category_id] = (counts[m.category_id] ?? 0) + 1;
	}

	const active = (cats as any[])?.filter((c) => c.is_active) ?? [];
	const tree = buildTree(active);

	return {
		flat: (cats as any[]) ?? [],
		tree,
		counts
	};
};

function slugify(name: string): string {
	return name
		.toLowerCase()
		.trim()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '');
}

export const actions: Actions = {
	create: async ({ request }) => {
		const admin = createSupabaseAdminClient();
		const form = await request.formData();
		const name = String(form.get('name') ?? '').trim();
		const parent_id = (form.get('parent_id') as string) || null;
		const sort_order = Number(form.get('sort_order')) || 0;
		if (!name) return fail(400, { error: 'Name is required' });

		let slug = slugify(name);
		// ensure unique slug
		const { data: existing } = await admin
			.from('product_categories')
			.select('slug')
			.ilike('slug', `${slug}%`);
		if ((existing as any[])?.some((e) => e.slug === slug)) {
			slug = `${slug}-${Math.floor((Date.now() % 100000) / 1)}`.slice(0, 60);
		}

		const { error } = await admin
			.from('product_categories')
			.insert({ name, slug, parent_id, sort_order });
		if (error) return fail(500, { error: error.message });
		return { success: true };
	},

	update: async ({ request }) => {
		const admin = createSupabaseAdminClient();
		const form = await request.formData();
		const id = String(form.get('id') ?? '');
		const name = String(form.get('name') ?? '').trim();
		const sort_order = Number(form.get('sort_order')) || 0;
		const parent_id = (form.get('parent_id') as string) || null;
		const is_active = form.get('is_active') === 'on' || form.get('is_active') === 'true';
		if (!id || !name) return fail(400, { error: 'Missing fields' });
		if (parent_id === id) return fail(400, { error: 'A category cannot be its own parent' });

		const { error } = await admin
			.from('product_categories')
			.update({ name, sort_order, parent_id, is_active })
			.eq('id', id);
		if (error) return fail(500, { error: error.message });
		return { success: true };
	},

	remove: async ({ request }) => {
		const admin = createSupabaseAdminClient();
		const form = await request.formData();
		const id = String(form.get('id') ?? '');
		if (!id) return fail(400, { error: 'Missing id' });

		const { count } = await admin
			.from('product_categories')
			.select('id', { count: 'exact', head: true })
			.eq('parent_id', id);
		if ((count ?? 0) > 0) {
			return fail(400, { error: 'This category has sub-categories. Remove or move them first.' });
		}

		// Mappings cascade-delete via FK; the category row is removed.
		const { error } = await admin.from('product_categories').delete().eq('id', id);
		if (error) return fail(500, { error: error.message });
		return { success: true };
	}
};
