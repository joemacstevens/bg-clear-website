import type { PageServerLoad, Actions } from './$types';
import { fail } from '@sveltejs/kit';
import { createSupabaseAdminClient } from '$lib/server/supabase-admin';
import { notifyQuoteReady } from '$lib/server/email';
import { logAuditEvent } from '$lib/api/audit';

export const load: PageServerLoad = async ({ locals }) => {
	const { data: quotes } = await locals.supabase
		.from('quote_requests')
		.select(
			`id, created_at, approval_status,
			 customer:profiles!quote_requests_customer_id_fkey(full_name, company_name, email),
			 quote_request_items(id, quantity, quoted_price, products(id, name))`
		)
		.eq('approval_status', 'pending')
		.order('created_at', { ascending: true });

	const list = (quotes as any[]) ?? [];

	// Attach target prices so the admin can see how far below target each line is.
	const productIds = list.flatMap((q) =>
		(q.quote_request_items ?? []).map((i: any) => i.products?.id).filter(Boolean)
	);
	let pricingMap = new Map<string, any>();
	if (productIds.length) {
		const { data: pricing } = await locals.supabase
			.from('product_pricing')
			.select('id, target_price, bg_cost')
			.in('id', productIds);
		pricingMap = new Map((pricing as any[] ?? []).map((p) => [p.id, p]));
	}

	const quotesOut = list.map((q) => {
		const items = (q.quote_request_items ?? []).map((i: any) => {
			const pr = pricingMap.get(i.products?.id);
			const target = pr?.target_price ?? null;
			return {
				...i,
				target_price: target,
				below_target: target != null && i.quoted_price != null && i.quoted_price < target
			};
		});
		const total = items.reduce((s: number, i: any) => s + (i.quoted_price ?? 0) * i.quantity, 0);
		return { ...q, quote_request_items: items, total };
	});

	return { quotes: quotesOut };
};

export const actions: Actions = {
	approve: async ({ request, locals, url }) => {
		const { user } = await locals.safeGetSession();
		if (!user) return fail(401, { error: 'Unauthorized' });
		const admin = createSupabaseAdminClient();
		const form = await request.formData();
		const quoteId = String(form.get('quote_id') ?? '');
		const notes = (form.get('notes') as string) || null;
		if (!quoteId) return fail(400, { error: 'Missing quote' });

		// Mark approved + send to the customer.
		await admin
			.from('quote_requests')
			.update({
				approval_status: 'approved',
				approved_by: user.id,
				approved_at: new Date().toISOString(),
				approval_notes: notes,
				status: 'quoted'
			})
			.eq('id', quoteId);

		// Notify the customer (fire-and-forget).
		try {
			const { data: q } = await admin
				.from('quote_requests')
				.select('customer:profiles!quote_requests_customer_id_fkey(email, full_name, company_name)')
				.eq('id', quoteId)
				.single();
			const customer = (q as any)?.customer;
			if (customer?.email) {
				await notifyQuoteReady({
					to: customer.email,
					origin: url.origin,
					quoteId,
					customerName: customer.full_name || customer.company_name || 'there'
				});
			}
		} catch (e) {
			console.error('[notify] quote-ready email failed', e);
		}

		await logAuditEvent(locals.supabase, user.id, 'approve_quote', 'quote_requests', quoteId, { notes });
		return { success: true, action: 'approve' };
	},

	reject: async ({ request, locals }) => {
		const { user } = await locals.safeGetSession();
		if (!user) return fail(401, { error: 'Unauthorized' });
		const admin = createSupabaseAdminClient();
		const form = await request.formData();
		const quoteId = String(form.get('quote_id') ?? '');
		const notes = (form.get('notes') as string) || '';
		if (!quoteId) return fail(400, { error: 'Missing quote' });
		if (!notes.trim()) return fail(400, { error: 'Please add a note explaining the rejection.' });

		// Send back to the rep to revise (editable again).
		await admin
			.from('quote_requests')
			.update({
				approval_status: 'rejected',
				approved_by: user.id,
				approval_notes: notes,
				status: 'in_progress'
			})
			.eq('id', quoteId);

		await logAuditEvent(locals.supabase, user.id, 'reject_quote', 'quote_requests', quoteId, { notes });
		return { success: true, action: 'reject' };
	}
};
