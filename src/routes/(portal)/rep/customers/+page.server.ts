import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const { profile } = await locals.safeGetSession();

	const { data: customers } = await locals.supabase
		.from('profiles')
		.select('*')
		.eq('assigned_rep_id', profile?.id ?? '')
		.order('company_name');

	return { customers: customers ?? [] };
};
