import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database, UserRole } from '$lib/database.types';

export async function getProfile(supabase: SupabaseClient<Database>, userId: string) {
	return supabase.from('profiles').select('*').eq('id', userId).single();
}

export async function updateProfile(supabase: SupabaseClient<Database>, userId: string, data: Record<string, unknown>) {
	return supabase.from('profiles').update(data).eq('id', userId);
}

export async function getAllProfiles(supabase: SupabaseClient<Database>, filters: { role?: UserRole } = {}) {
	let query = supabase.from('profiles').select('*').order('created_at', { ascending: false });
	if (filters.role) query = query.eq('role', filters.role);
	return query;
}

export async function getCustomersByRep(supabase: SupabaseClient<Database>, repId: string) {
	return supabase.from('profiles').select('*').eq('assigned_rep_id', repId).order('company_name');
}

export async function assignRep(supabase: SupabaseClient<Database>, customerId: string, repId: string) {
	return supabase.from('profiles').update({ assigned_rep_id: repId }).eq('id', customerId);
}

export async function changeRole(supabase: SupabaseClient<Database>, userId: string, role: UserRole) {
	return supabase.from('profiles').update({ role }).eq('id', userId);
}
