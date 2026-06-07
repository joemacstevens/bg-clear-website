import type { RequestHandler } from './$types';
import { json, text } from '@sveltejs/kit';
import { verifyWooWebhook } from '$lib/server/woocommerce';
import { createSupabaseAdminClient } from '$lib/server/supabase-admin';

// Woo order statuses that mean the money was captured.
const PAID_STATUSES = new Set(['processing', 'completed']);

/**
 * WooCommerce order webhook. When Woo reports an order as paid, mark the
 * matching BG Clear order paid in Supabase. This is the one place data flows
 * back FROM Woo (everything else is site → Woo).
 *
 * Configure in Woo: WooCommerce → Settings → Advanced → Webhooks →
 *   Topic: "Order updated", Delivery URL: https://<site>/api/webhooks/woocommerce,
 *   Secret: WOOCOMMERCE_WEBHOOK_SECRET.
 */
export const POST: RequestHandler = async ({ request }) => {
	// Read the raw body for HMAC verification (don't use request.json()).
	const raw = await request.text();
	const signature = request.headers.get('x-wc-webhook-signature');

	if (!verifyWooWebhook(raw, signature)) {
		return text('Invalid signature', { status: 401 });
	}

	let payload: any;
	try {
		payload = JSON.parse(raw);
	} catch {
		return text('Bad payload', { status: 400 });
	}

	// Setup ping / non-order payloads.
	if (!payload || !payload.id) return json({ ok: true });

	if (!PAID_STATUSES.has(payload.status)) {
		return json({ ok: true, ignored: payload.status });
	}

	const admin = createSupabaseAdminClient();

	const bgOrderId = (payload.meta_data ?? []).find((m: any) => m.key === 'bg_order_id')?.value;
	const wooOrderId = String(payload.id);

	let query = admin
		.from('orders')
		.update({
			payment_collected: true,
			payment_collected_at: new Date().toISOString(),
			status: 'payment_collected'
		})
		.eq('payment_collected', false); // idempotent: only the first paid event sticks

	query = bgOrderId ? query.eq('id', bgOrderId) : query.eq('woo_order_id', wooOrderId);

	const { error } = await query;
	if (error) return text('Update failed', { status: 500 });

	// TODO(salesforce): push "paid / pending fulfillment" to Salesforce here
	// once Claire provides credentials (see project_salesforce_integration).

	return json({ ok: true });
};
