import { createClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL } from '$env/static/public';
import { env } from '$env/dynamic/private';
import type { Database } from '../database.types';

export function createSupabaseAdminClient() {
	const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;
	if (!serviceRoleKey) {
		throw new Error('SUPABASE_SERVICE_ROLE_KEY is required for admin operations');
	}
	return createClient<Database>(PUBLIC_SUPABASE_URL, serviceRoleKey, {
		auth: { autoRefreshToken: false, persistSession: false }
	});
}
