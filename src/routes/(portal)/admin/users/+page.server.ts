import { fail, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getAllProfiles, changeRole, assignRep } from '$lib/api/profiles';
import { logAuditEvent } from '$lib/api/audit';
import { createSupabaseAdminClient } from '$lib/supabase';
import type { UserRole } from '$lib/database.types';

export const load: PageServerLoad = async ({ locals }) => {
	const [profilesRes, repsRes] = await Promise.all([
		getAllProfiles(locals.supabase),
		getAllProfiles(locals.supabase, { role: 'sales_rep' })
	]);

	return {
		profiles: profilesRes.data ?? [],
		reps: repsRes.data ?? []
	};
};

export const actions: Actions = {
	changeRole: async ({ request, locals }) => {
		const session = await locals.safeGetSession();
		if (!session.user) return fail(401, { error: 'Unauthorized' });

		const form = await request.formData();
		const userId = form.get('userId') as string;
		const newRole = form.get('role') as UserRole;

		const adminClient = createSupabaseAdminClient();
		const { error } = await changeRole(locals.supabase, adminClient, userId, newRole);

		if (error) {
			return fail(500, { error: error.message });
		}

		await logAuditEvent(
			locals.supabase,
			session.user.id,
			'change_user_role',
			'profiles',
			userId,
			{ new_role: newRole }
		);

		return { success: true };
	},
	assignRep: async ({ request, locals }) => {
		const session = await locals.safeGetSession();
		if (!session.user) return fail(401, { error: 'Unauthorized' });

		const form = await request.formData();
		const userId = form.get('userId') as string;
		const repId = form.get('repId') as string;

		const finalRepId = repId === 'none' ? null : repId;

		const { error } = finalRepId 
			? await assignRep(locals.supabase, userId, finalRepId)
			: await locals.supabase.from('profiles').update({ assigned_rep_id: null }).eq('id', userId);

		if (error) {
			return fail(500, { error: error.message });
		}

		await logAuditEvent(
			locals.supabase,
			session.user.id,
			'assign_rep',
			'profiles',
			userId,
			{ assigned_rep_id: finalRepId }
		);

		return { success: true };
	}
};
