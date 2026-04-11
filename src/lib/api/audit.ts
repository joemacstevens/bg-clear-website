import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '$lib/database.types';

export async function logAuditEvent(
	supabase: SupabaseClient<Database>,
	userId: string,
	action: string,
	entityType: string,
	entityId: string | null,
	details: Record<string, unknown> = {}
) {
	return supabase.from('audit_log').insert({
		user_id: userId,
		action,
		entity_type: entityType,
		entity_id: entityId,
		details
	});
}

export async function getAuditLog(
	supabase: SupabaseClient<Database>,
	filters: { entityType?: string; userId?: string; limit?: number } = {}
) {
	let query = supabase.from('audit_log').select('*').order('created_at', { ascending: false });

	if (filters.entityType) query = query.eq('entity_type', filters.entityType);
	if (filters.userId) query = query.eq('user_id', filters.userId);

	return query.limit(filters.limit ?? 100);
}
