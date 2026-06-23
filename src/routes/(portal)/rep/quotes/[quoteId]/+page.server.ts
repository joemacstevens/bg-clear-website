import { error, redirect, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { env } from '$env/dynamic/private';
import { createOrderFromQuote, buildOrderItemsFromQuote } from '$lib/api/orders';
import { createSupabaseAdminClient } from '$lib/server/supabase-admin';
import { notifyQuoteReady } from '$lib/server/email';

const EDITABLE = ['pending', 'in_progress', 'quoted'];

export const load: PageServerLoad = async ({ params, locals }) => {
	const { data: quote, error: quoteErr } = await locals.supabase
		.from('quote_requests')
		.select(`
			*,
			profiles!quote_requests_customer_id_fkey(full_name, company_name, email, phone),
			quote_request_items(
				id, quantity, quoted_price,
				products(id, name, category, vendor_name, image_url, specs)
			)
		`)
		.eq('id', params.quoteId)
		.single();

	if (quoteErr || !quote) throw error(404, 'Quote not found');

	// Full pricing catalog: powers both the line-item guardrails and the
	// "add item" picker.
	const { data: pricing } = await locals.supabase
		.from('product_pricing')
		.select('id, name, category, vendor_name, image_url, bg_cost, target_price, suggested_price, commission_at_target, commission_at_suggested')
		.order('category')
		.order('name');

	const pricingMap = new Map((pricing ?? []).map((p) => [p.id, p]));

	const itemsWithPricing = (quote.quote_request_items ?? []).map((item: any) => ({
		...item,
		pricing: item.products ? pricingMap.get(item.products.id) ?? null : null
	}));

	// Products available to add (everything in the catalog; the rep can dedupe by eye).
	const catalog = (pricing ?? []).map((p) => ({ id: p.id, name: p.name, category: p.category }));

	return {
		quote: { ...quote, quote_request_items: itemsWithPricing },
		customer: (quote as any).profiles,
		catalog
	};
};

/** Guard: quote exists and is in an editable state. Returns the quote or a fail. */
async function loadEditable(locals: App.Locals, quoteId: string) {
	const { profile } = await locals.safeGetSession();
	if (!profile || !['sales_rep', 'manager', 'admin'].includes(profile.role ?? '')) {
		return { fail: fail(403, { error: 'Not allowed' }) } as const;
	}
	const { data: quote } = await locals.supabase
		.from('quote_requests')
		.select('id, status, customer_id, assigned_rep_id')
		.eq('id', quoteId)
		.single();
	if (!quote) return { fail: fail(404, { error: 'Quote not found' }) } as const;
	if (!EDITABLE.includes(quote.status)) {
		return { fail: fail(400, { error: `A ${quote.status} quote can no longer be edited` }) } as const;
	}
	return { profile, quote } as const;
}

/** Save price + quantity for every line on the quote (from the editor grid). */
async function persistLines(admin: ReturnType<typeof createSupabaseAdminClient>, form: FormData, quoteId: string) {
	const itemIds = form.getAll('item_id') as string[];
	const prices = form.getAll('quoted_price') as string[];
	const quantities = form.getAll('quantity') as string[];

	for (let i = 0; i < itemIds.length; i++) {
		const patch: { quoted_price?: number; quantity?: number } = {};
		const price = parseFloat(prices[i]);
		if (!isNaN(price) && price > 0) patch.quoted_price = price;
		const qty = Math.max(1, Math.floor(Number(quantities[i])));
		if (Number.isFinite(qty)) patch.quantity = qty;
		if (Object.keys(patch).length) {
			await admin.from('quote_request_items').update(patch).eq('id', itemIds[i]).eq('quote_request_id', quoteId);
		}
	}
}

/** Mark a quote sent + notify the customer (reused by send and admin-approve paths). */
async function sendQuoteToCustomer(
	admin: ReturnType<typeof createSupabaseAdminClient>,
	quoteId: string,
	repId: string,
	origin: string
) {
	await admin
		.from('quote_requests')
		.update({ status: 'quoted', assigned_rep_id: repId })
		.eq('id', quoteId);

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
				origin,
				quoteId,
				customerName: customer.full_name || customer.company_name || 'there'
			});
		}
	} catch (e) {
		console.error('[notify] quote-ready email failed', e);
	}
}

export const actions: Actions = {
	// Save prices + quantities without sending.
	saveQuote: async ({ request, locals, params }) => {
		const guard = await loadEditable(locals, params.quoteId);
		if ('fail' in guard) return guard.fail;
		const admin = createSupabaseAdminClient();
		await persistLines(admin, await request.formData(), params.quoteId);
		return { success: true, saved: true };
	},

	// Send to customer — BLOCKED if any line is below target and the quote
	// hasn't been admin-approved yet.
	sendQuote: async ({ request, locals, params, url }) => {
		const guard = await loadEditable(locals, params.quoteId);
		if ('fail' in guard) return guard.fail;
		const { profile } = guard;
		const admin = createSupabaseAdminClient();

		await persistLines(admin, await request.formData(), params.quoteId);

		const { requiresApproval } = await buildOrderItemsFromQuote(admin, params.quoteId);
		const { data: qrow } = await admin
			.from('quote_requests')
			.select('approval_status')
			.eq('id', params.quoteId)
			.single();

		if (requiresApproval && (qrow as any)?.approval_status !== 'approved') {
			return fail(400, {
				error:
					'This quote has prices below target — submit it for admin approval before sending to the customer.'
			});
		}

		await sendQuoteToCustomer(admin, params.quoteId, profile.id, url.origin);
		return { success: true, sent: true };
	},

	// Rep submits a below-target quote for admin approval (instead of sending).
	submitForApproval: async ({ request, locals, params, url }) => {
		const guard = await loadEditable(locals, params.quoteId);
		if ('fail' in guard) return guard.fail;
		const { profile } = guard;
		const admin = createSupabaseAdminClient();

		await persistLines(admin, await request.formData(), params.quoteId);

		const { requiresApproval } = await buildOrderItemsFromQuote(admin, params.quoteId);

		// Nothing below target → no approval needed, just send it.
		if (!requiresApproval) {
			await admin
				.from('quote_requests')
				.update({ requires_approval: false, approval_status: 'none' })
				.eq('id', params.quoteId);
			await sendQuoteToCustomer(admin, params.quoteId, profile.id, url.origin);
			return { success: true, sent: true };
		}

		await admin
			.from('quote_requests')
			.update({
				status: 'pending_approval',
				requires_approval: true,
				approval_status: 'pending',
				approval_notes: null,
				assigned_rep_id: profile.id
			})
			.eq('id', params.quoteId);

		return { success: true, submitted: true };
	},

	// Add a catalog product to the quote.
	addItem: async ({ request, locals, params }) => {
		const guard = await loadEditable(locals, params.quoteId);
		if ('fail' in guard) return guard.fail;
		const form = await request.formData();
		const productId = String(form.get('product_id') ?? '');
		const quantity = Math.max(1, Math.floor(Number(form.get('add_quantity')) || 1));
		if (!productId) return fail(400, { error: 'Pick a product to add' });

		const admin = createSupabaseAdminClient();
		const { error: insErr } = await admin
			.from('quote_request_items')
			.insert({ quote_request_id: params.quoteId, product_id: productId, quantity });
		if (insErr) return fail(500, { error: insErr.message });
		return { success: true, added: true };
	},

	// Remove a line from the quote.
	removeItem: async ({ request, locals, params }) => {
		const guard = await loadEditable(locals, params.quoteId);
		if ('fail' in guard) return guard.fail;
		const form = await request.formData();
		const itemId = String(form.get('remove_item_id') ?? '');
		if (!itemId) return fail(400, { error: 'Missing item' });

		const admin = createSupabaseAdminClient();
		const { error: delErr } = await admin
			.from('quote_request_items')
			.delete()
			.eq('id', itemId)
			.eq('quote_request_id', params.quoteId);
		if (delErr) return fail(500, { error: delErr.message });
		return { success: true, removed: true };
	},

	// Rep creates the order directly (in-person close).
	// In-person close: turn the (possibly still-draft) quote directly into an order.
	createOrder: async ({ request, locals, params }) => {
		const { profile } = await locals.safeGetSession();
		if (!profile || !['sales_rep', 'manager', 'admin'].includes(profile.role ?? '')) {
			return fail(403, { error: 'Not allowed' });
		}

		// Reps have no direct RLS write on quotes/orders — go through the
		// service-role client, gated by the role check above.
		const admin = createSupabaseAdminClient();

		// Persist the on-screen prices/quantities first (the form may never have
		// been saved), so the order is built from what the rep sees.
		await persistLines(admin, await request.formData(), params.quoteId);

		const { quote, orderItems, requiresApproval, error: buildErr } = await buildOrderItemsFromQuote(
			admin,
			params.quoteId
		);
		if (buildErr || !quote) return fail(500, { error: (buildErr as any)?.message ?? 'Quote not found' });
		if (!EDITABLE.includes((quote as any).status)) {
			return fail(400, { error: `A ${(quote as any).status} quote can no longer be turned into an order.` });
		}
		if (!orderItems.length) {
			return fail(400, { error: 'Price all items before creating an order.' });
		}

		// Below-target pricing requires manager approval — UNLESS this quote was
		// already approved at the quote stage (don't double-gate the same prices).
		const needsApproval = requiresApproval && (quote as any).approval_status !== 'approved';

		const { data: order, error: orderErr } = await createOrderFromQuote(
			admin,
			params.quoteId,
			quote.customer_id,
			profile.id,
			orderItems,
			needsApproval
		);
		if (orderErr || !order) return fail(500, { error: (orderErr as any)?.message ?? 'Failed to create order' });

		throw redirect(303, `/rep/orders/${order.id}`);
	}
};
