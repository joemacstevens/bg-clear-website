import type { PageServerLoad } from './$types';
import { getQuoteRequests } from '$lib/api/quotes';

export const load: PageServerLoad = async ({ locals }) => {
	const { user } = await locals.safeGetSession();
	if (!user) return { quotes: [] };

	const { data: quotes } = await getQuoteRequests(locals.supabase, { customerId: user.id });

	return { quotes: quotes ?? [] };
};
