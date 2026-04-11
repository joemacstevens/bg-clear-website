import type { PageServerLoad, Actions } from './$types';
import { fail } from '@sveltejs/kit';
import { getProfile, updateProfile } from '$lib/api/profiles';

export const load: PageServerLoad = async ({ locals }) => {
	const { user } = await locals.safeGetSession();
	if (!user) return { profile: null };

	const { data: profile } = await getProfile(locals.supabase, user.id);
	return { profile };
};

export const actions: Actions = {
	update: async ({ request, locals }) => {
		const { user } = await locals.safeGetSession();
		if (!user) return fail(401, { error: 'Not authenticated' });

		const form = await request.formData();
		const full_name = form.get('full_name') as string;
		const company_name = form.get('company_name') as string;
		const phone = form.get('phone') as string;
		const address_line1 = form.get('address_line1') as string;
		const address_line2 = form.get('address_line2') as string;
		const city = form.get('city') as string;
		const state = form.get('state') as string;
		const zip = form.get('zip') as string;

		if (!full_name?.trim()) {
			return fail(400, { error: 'Full name is required' });
		}

		const { error } = await updateProfile(locals.supabase, user.id, {
			full_name: full_name.trim(),
			company_name: company_name?.trim() || null,
			phone: phone?.trim() || null,
			address_line1: address_line1?.trim() || null,
			address_line2: address_line2?.trim() || null,
			city: city?.trim() || null,
			state: state?.trim() || null,
			zip: zip?.trim() || null
		});

		if (error) {
			return fail(500, { error: error.message });
		}

		return { success: true };
	}
};
