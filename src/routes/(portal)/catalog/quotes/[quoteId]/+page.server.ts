import type { PageServerLoad, Actions } from './$types';
import { error, fail, redirect } from '@sveltejs/kit';
import { getQuoteRequestById } from '$lib/api/quotes';
import { buildOrderItemsFromQuote, createOrderFromQuote } from '$lib/api/orders';
import { createSupabaseAdminClient } from '$lib/server/supabase-admin';

export const load: PageServerLoad = async ({ locals, params }) => {
	const { data: quote, error: err } = await getQuoteRequestById(locals.supabase, params.quoteId);

	if (err || !quote) {
		throw error(404, 'Quote request not found');
	}

	// Once accepted, an order exists — surface it so the customer can pay.
	let orderId: string | null = null;
	if (quote.status === 'accepted') {
		const { data: ord } = await locals.supabase
			.from('orders')
			.select('id')
			.eq('quote_request_id', params.quoteId)
			.maybeSingle();
		orderId = ord?.id ?? null;
	}

	return { quote, orderId };
};

/**
 * Guard: load the quote and confirm the current user owns it and it is still
 * in the 'quoted' state (the only state in which a customer may edit/accept).
 */
async function loadEditableQuote(locals: App.Locals, quoteId: string) {
	const { profile } = await locals.safeGetSession();
	if (!profile) return { error: fail(401, { error: 'Not signed in' }) } as const;

	const { data: quote } = await locals.supabase
		.from('quote_requests')
		.select('id, customer_id, assigned_rep_id, status')
		.eq('id', quoteId)
		.single();

	if (!quote) return { error: fail(404, { error: 'Quote not found' }) } as const;
	if (quote.customer_id !== profile.id) return { error: fail(403, { error: 'Not your quote' }) } as const;
	if (quote.status !== 'quoted') {
		return { error: fail(400, { error: 'This quote can no longer be edited' }) } as const;
	}

	return { quote } as const;
}

export const actions: Actions = {
	// Change the quantity of a quoted item (price stays; total scales).
	// Writes run with the service-role client because customers have no RLS
	// write access to quote items — the guard above is the security boundary.
	updateItemQty: async ({ request, locals, params }) => {
		const guard = await loadEditableQuote(locals, params.quoteId);
		if ('error' in guard) return guard.error;

		const form = await request.formData();
		const itemId = String(form.get('item_id') ?? '');
		const quantity = Math.max(1, Math.floor(Number(form.get('quantity'))));

		if (!itemId || !Number.isFinite(quantity)) {
			return fail(400, { error: 'Invalid quantity' });
		}

		const admin = createSupabaseAdminClient();
		const { error: updErr } = await admin
			.from('quote_request_items')
			.update({ quantity })
			.eq('id', itemId)
			.eq('quote_request_id', params.quoteId);

		if (updErr) return fail(500, { error: updErr.message });
		return { success: true };
	},

	// Remove an item from the quote — but never the last one.
	removeItem: async ({ request, locals, params }) => {
		const guard = await loadEditableQuote(locals, params.quoteId);
		if ('error' in guard) return guard.error;

		const form = await request.formData();
		const itemId = String(form.get('item_id') ?? '');
		if (!itemId) return fail(400, { error: 'Missing item' });

		const admin = createSupabaseAdminClient();
		const { count } = await admin
			.from('quote_request_items')
			.select('id', { count: 'exact', head: true })
			.eq('quote_request_id', params.quoteId);

		if ((count ?? 0) <= 1) {
			return fail(400, { error: 'A quote must have at least one item. Remove the quote instead.' });
		}

		const { error: delErr } = await admin
			.from('quote_request_items')
			.delete()
			.eq('id', itemId)
			.eq('quote_request_id', params.quoteId);

		if (delErr) return fail(500, { error: delErr.message });
		return { success: true };
	},

	// Accept the quote → create the order → proceed toward checkout.
	// Order creation touches orders/order_items and flips the quote status —
	// all staff-only under RLS, so it runs server-side with the admin client
	// after the ownership + 'quoted' status guard passes.
	accept: async ({ locals, params }) => {
		const guard = await loadEditableQuote(locals, params.quoteId);
		if ('error' in guard) return guard.error;
		const { quote } = guard;

		if (!quote.assigned_rep_id) {
			return fail(400, { error: 'This quote has no assigned rep yet. Please contact us.' });
		}

		const admin = createSupabaseAdminClient();

		const { orderItems, requiresApproval, error: buildErr } = await buildOrderItemsFromQuote(
			admin,
			params.quoteId
		);

		if (buildErr) return fail(500, { error: (buildErr as any)?.message ?? 'Could not build order' });
		if (!orderItems.length) {
			return fail(400, { error: 'No priced items to accept' });
		}

		// Approval now happens at the QUOTE stage (a rep can't send a below-target
		// quote without admin sign-off), so an accepted quote is already cleared —
		// the resulting order does not need a second approval gate.
		const { data: order, error: orderErr } = await createOrderFromQuote(
			admin,
			params.quoteId,
			quote.customer_id,
			quote.assigned_rep_id,
			orderItems,
			false
		);

		if (orderErr || !order) {
			return fail(500, { error: (orderErr as any)?.message ?? 'Could not create order' });
		}

		// Order created — head to the order page (checkout/payment lands here next).
		throw redirect(303, `/catalog/orders/${order.id}`);
	}
};
