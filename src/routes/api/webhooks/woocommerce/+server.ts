import type { RequestHandler } from './$types';
import { json, text } from '@sveltejs/kit';
import { verifyWooWebhook } from '$lib/server/woocommerce';
import { createSupabaseAdminClient } from '$lib/server/supabase-admin';
import { env } from '$env/dynamic/private';
import { notifyPaymentReceipt, notifyOrderPaid } from '$lib/server/email';

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
export const POST: RequestHandler = async ({ request, url }) => {
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

	// Payment is its own axis — set the paid flag ONLY, never the fulfillment
	// status. Customers usually pay up front (right after approval), so writing
	// status here would clobber the fulfillment pipeline (placed → shipped →
	// delivered) and suppress the shipped email. The `payment_collected` boolean
	// is the single source of truth for "paid".
	let query = admin
		.from('orders')
		.update({
			payment_collected: true,
			payment_collected_at: new Date().toISOString()
		})
		.eq('payment_collected', false) // idempotent: only the first paid event sticks
		.select('id, order_number, subtotal, customer_id, rep_id');

	query = bgOrderId ? query.eq('id', bgOrderId) : query.eq('woo_order_id', wooOrderId);

	const { data: updated, error } = await query;
	if (error) return text('Update failed', { status: 500 });

	// Only the FIRST paid event flips a row (idempotent guard above), so emails
	// fire exactly once. A repeat webhook updates nothing → updated is empty.
	const order = (updated ?? [])[0];
	if (order) {
		try {
			const [{ data: cust }, { data: rep }] = await Promise.all([
				admin
					.from('profiles')
					.select('email, full_name, company_name')
					.eq('id', (order as any).customer_id)
					.single(),
				(order as any).rep_id
					? admin.from('profiles').select('email, full_name').eq('id', (order as any).rep_id).single()
					: Promise.resolve({ data: null })
			]);
			const orderNumber = (order as any).order_number ?? (order as any).id;
			const total = (order as any).subtotal ?? 0;
			const customerName = (cust as any)?.company_name || (cust as any)?.full_name || 'there';

			if ((cust as any)?.email) {
				await notifyPaymentReceipt({
					to: (cust as any).email,
					origin: url.origin,
					orderId: (order as any).id,
					orderNumber,
					customerName,
					total
				});
			}

			// Notify the rep + the internal fulfillment inbox.
			const staffTo = [(rep as any)?.email, env.INTERNAL_NOTIFY_EMAIL].filter(Boolean) as string[];
			if (staffTo.length) {
				await notifyOrderPaid({
					to: staffTo,
					origin: url.origin,
					orderId: (order as any).id,
					orderNumber,
					customerName,
					total
				});
			}
		} catch (e) {
			console.error('[notify] payment emails failed', e);
		}
	}

	// TODO(salesforce): push "paid / pending fulfillment" to Salesforce here
	// once Claire provides credentials (see project_salesforce_integration).

	return json({ ok: true });
};
