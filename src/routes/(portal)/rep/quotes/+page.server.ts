import type { PageServerLoad, Actions } from './$types';
import { fail } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ locals }) => {
	const { profile } = await locals.safeGetSession();
	const role = profile?.role ?? '';
	const isManagerOrAdmin = role === 'admin' || role === 'manager';

	let query = locals.supabase
		.from('quote_requests')
		.select(
			`*,
			quote_request_items(id, quantity, products(name, category)),
			customer:profiles!quote_requests_customer_id_fkey(full_name, company_name, email),
			assigned_rep:profiles!quote_requests_assigned_rep_id_fkey(id, full_name)`
		)
		.order('created_at', { ascending: false });

	// Reps see their own + unassigned; managers/admins see everything (to route).
	if (!isManagerOrAdmin) {
		query = query.or(
			profile?.id
				? `assigned_rep_id.eq.${profile.id},assigned_rep_id.is.null`
				: 'assigned_rep_id.is.null'
		);
	}

	const { data: quotes } = await query;

	// Assignable reps for the manager/admin dropdown.
	let reps: { id: string; full_name: string | null }[] = [];
	if (isManagerOrAdmin) {
		const { data } = await locals.supabase
			.from('profiles')
			.select('id, full_name')
			.in('role', ['sales_rep', 'manager'])
			.order('full_name');
		reps = data ?? [];
	}

	return { quotes: quotes ?? [], reps, myId: profile?.id ?? null, role };
};

export const actions: Actions = {
	// A rep claims an unassigned quote for themselves.
	claim: async ({ request, locals }) => {
		const { profile } = await locals.safeGetSession();
		if (!profile) return fail(401, { error: 'Not signed in' });

		const form = await request.formData();
		const quoteId = String(form.get('quote_id') ?? '');
		if (!quoteId) return fail(400, { error: 'Missing quote' });

		const { error } = await locals.supabase
			.from('quote_requests')
			.update({ assigned_rep_id: profile.id })
			.eq('id', quoteId);

		if (error) return fail(500, { error: error.message });
		return { success: true };
	},

	// A manager/admin assigns (or reassigns) a quote to a specific rep.
	assign: async ({ request, locals }) => {
		const { profile } = await locals.safeGetSession();
		if (!profile || !['admin', 'manager'].includes(profile.role ?? '')) {
			return fail(403, { error: 'Only managers or admins can assign quotes' });
		}

		const form = await request.formData();
		const quoteId = String(form.get('quote_id') ?? '');
		const repId = String(form.get('rep_id') ?? '');
		if (!quoteId || !repId) return fail(400, { error: 'Missing quote or rep' });

		const { error } = await locals.supabase
			.from('quote_requests')
			.update({ assigned_rep_id: repId })
			.eq('id', quoteId);

		if (error) return fail(500, { error: error.message });
		return { success: true };
	}
};
