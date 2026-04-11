import type { PageServerLoad, Actions } from './$types';
import { fail, redirect } from '@sveltejs/kit';
import { createQuoteRequest } from '$lib/api/quotes';

export const load: PageServerLoad = async ({ locals }) => {
	const { profile } = await locals.safeGetSession();
	return { profile };
};

export const actions: Actions = {
	submit: async ({ request, locals }) => {
		const { user, profile } = await locals.safeGetSession();
		if (!user) return fail(401, { error: 'Not authenticated' });

		const form = await request.formData();
		const itemsJson = form.get('items') as string;

		let items: { productId: string; quantity: number }[];
		try {
			items = JSON.parse(itemsJson);
		} catch {
			return fail(400, { error: 'Invalid cart data' });
		}

		if (!items.length) {
			return fail(400, { error: 'Cart is empty' });
		}

		if (items.some((i) => !Number.isInteger(i.quantity) || i.quantity <= 0)) {
			return fail(400, { error: 'All quantities must be positive integers' });
		}

		const { data: quote, error } = await createQuoteRequest(
			locals.supabase,
			user.id,
			profile?.assigned_rep_id ?? null,
			items
		);

		if (error) {
			return fail(500, { error: error.message });
		}

		return { success: true, quoteId: quote?.id };
	}
};
