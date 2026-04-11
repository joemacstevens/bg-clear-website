import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const { profile } = await locals.safeGetSession();

	const { data: quotes } = await locals.supabase
		.from('quote_requests')
		.select('*, quote_request_items(id, quantity, products(name, category)), profiles!quote_requests_customer_id_fkey(full_name, company_name, email)')
		.or(profile?.id ? `assigned_rep_id.eq.${profile.id},assigned_rep_id.is.null` : 'assigned_rep_id.is.null')
		.order('created_at', { ascending: false });

	return { quotes: quotes ?? [] };
};
