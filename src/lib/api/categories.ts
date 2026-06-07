import type { SupabaseClient } from '@supabase/supabase-js';

export interface CategoryNode {
	id: string;
	parent_id: string | null;
	name: string;
	slug: string;
	description: string | null;
	icon: string | null;
	sort_order: number;
	children: CategoryNode[];
}

interface FlatCategory {
	id: string;
	parent_id: string | null;
	name: string;
	slug: string;
	description: string | null;
	icon: string | null;
	sort_order: number;
}

/** Fetch every active category as a flat list (sorted). */
async function fetchFlatCategories(supabase: SupabaseClient): Promise<FlatCategory[]> {
	const { data } = await supabase
		.from('product_categories')
		.select('id, parent_id, name, slug, description, icon, sort_order')
		.eq('is_active', true)
		.order('sort_order')
		.order('name');
	return (data as FlatCategory[]) ?? [];
}

/** Build a nested tree (top-level nodes with their children). */
export function buildTree(flat: FlatCategory[]): CategoryNode[] {
	const byId = new Map<string, CategoryNode>();
	for (const c of flat) byId.set(c.id, { ...c, children: [] });
	const roots: CategoryNode[] = [];
	for (const node of byId.values()) {
		if (node.parent_id && byId.has(node.parent_id)) {
			byId.get(node.parent_id)!.children.push(node);
		} else {
			roots.push(node);
		}
	}
	const sortRec = (nodes: CategoryNode[]) => {
		nodes.sort((a, b) => a.sort_order - b.sort_order || a.name.localeCompare(b.name));
		nodes.forEach((n) => sortRec(n.children));
	};
	sortRec(roots);
	return roots;
}

/** The full nested category tree for navigation. */
export async function getCategoryTree(supabase: SupabaseClient): Promise<CategoryNode[]> {
	return buildTree(await fetchFlatCategories(supabase));
}

/** A category + its ancestors (breadcrumb), direct children, and the descendant ids. */
export async function getCategoryContext(supabase: SupabaseClient, slug: string) {
	const flat = await fetchFlatCategories(supabase);
	const bySlug = new Map(flat.map((c) => [c.slug, c]));
	const byId = new Map(flat.map((c) => [c.id, c]));
	const node = bySlug.get(slug);
	if (!node) return null;

	// Ancestors (root → … → node) for breadcrumb
	const ancestors: FlatCategory[] = [];
	let cur: FlatCategory | undefined = node;
	while (cur?.parent_id) {
		const parent = byId.get(cur.parent_id);
		if (!parent) break;
		ancestors.unshift(parent);
		cur = parent;
	}

	// Descendant ids (node + all nested children)
	const childrenByParent = new Map<string, FlatCategory[]>();
	for (const c of flat) {
		if (!c.parent_id) continue;
		const arr = childrenByParent.get(c.parent_id) ?? [];
		arr.push(c);
		childrenByParent.set(c.parent_id, arr);
	}
	const descendantIds: string[] = [];
	const collect = (id: string) => {
		descendantIds.push(id);
		for (const ch of childrenByParent.get(id) ?? []) collect(ch.id);
	};
	collect(node.id);

	const children = (childrenByParent.get(node.id) ?? []).sort(
		(a, b) => a.sort_order - b.sort_order
	);

	return { node, ancestors, children, descendantIds, tree: buildTree(flat) };
}

/** Products mapped to a category or any of its descendants. */
export async function getProductsInCategories(
	supabase: SupabaseClient,
	categoryIds: string[]
) {
	if (!categoryIds.length) return [];
	const { data } = await supabase
		.from('products')
		.select('*, product_category_map!inner(category_id)')
		.eq('is_active', true)
		.in('product_category_map.category_id', categoryIds)
		.order('name');
	// Dedupe (a product can map to multiple ids in the set)
	const seen = new Set<string>();
	const out: any[] = [];
	for (const p of (data as any[]) ?? []) {
		if (seen.has(p.id)) continue;
		seen.add(p.id);
		out.push(p);
	}
	return out;
}
