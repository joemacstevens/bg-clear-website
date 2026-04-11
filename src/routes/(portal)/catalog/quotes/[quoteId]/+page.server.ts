import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { getQuoteRequestById } from '$lib/api/quotes';

export const load: PageServerLoad = async ({ locals, params }) => {
	const { data: quote, error: err } = await getQuoteRequestById(locals.supabase, params.quoteId);

	if (err || !quote) {
		throw error(404, 'Quote request not found');
	}

	return { quote };
};
