import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database, ProductCategory } from '$lib/database.types';

export interface ProductFilters {
	category?: ProductCategory;
	vendor?: string;
	search?: string;
	activeOnly?: boolean;
}

export async function getProducts(supabase: SupabaseClient<Database>, filters: ProductFilters = {}) {
	let query = supabase.from('products').select('*').order('category').order('name');

	if (filters.activeOnly !== false) query = query.eq('is_active', true);
	if (filters.category) query = query.eq('category', filters.category);
	if (filters.vendor) query = query.eq('vendor_name', filters.vendor);
	if (filters.search) query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);

	return query;
}

export async function getProductById(supabase: SupabaseClient<Database>, id: string) {
	return supabase.from('products').select('*').eq('id', id).single();
}

export async function getProductPricing(supabase: SupabaseClient<Database>, filters: ProductFilters = {}) {
	let query = supabase.from('product_pricing').select('*').order('category').order('name');

	if (filters.activeOnly !== false) query = query.eq('is_active', true);
	if (filters.category) query = query.eq('category', filters.category);
	if (filters.search) query = query.or(`name.ilike.%${filters.search}%`);

	return query;
}

export async function createProduct(supabase: SupabaseClient<Database>, data: Record<string, unknown>) {
	return supabase.from('products').insert(data).select().single();
}

export async function updateProduct(supabase: SupabaseClient<Database>, id: string, data: Record<string, unknown>) {
	return supabase.from('products').update(data).eq('id', id).select().single();
}

export async function deleteProduct(supabase: SupabaseClient<Database>, id: string) {
	return supabase.from('products').delete().eq('id', id);
}

export async function toggleProductActive(supabase: SupabaseClient<Database>, id: string, currentActive: boolean) {
	return supabase.from('products').update({ is_active: !currentActive }).eq('id', id);
}
