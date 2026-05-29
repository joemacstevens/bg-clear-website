/**
 * WooCommerce order export.
 *
 * One-way push: when a BG Clear order is approved we POST it into a
 * WooCommerce site so the fulfillment team can pick it up in their
 * existing Woo workflow. Supabase remains the catalog source of truth;
 * Woo receives ad-hoc line items (no Woo product_id matching) tagged
 * with `bg_product_id`/`bg_sku`/`vendor_name` in `meta_data`.
 *
 * Idempotency: a row-claim update flips `woo_sync_status` from
 * `not_synced`/`failed` to `in_progress` atomically. Concurrent callers
 * lose the race in Postgres (WHERE clause re-evaluates against current
 * state) and exit with status='skipped'.
 *
 * Failure mode: never throws. Network/timeout/non-2xx leaves the BG
 * order in its current state with `woo_sync_status='failed'` plus an
 * error string an admin can read on the order detail page.
 */
import type { SupabaseClient } from '@supabase/supabase-js';
import { env } from '$env/dynamic/private';
import type { Database } from '$lib/database.types';
import { logAuditEvent } from '$lib/api/audit';

const TIMEOUT_MS = 3000;

export interface WooSyncResult {
	wooOrderId: string | null;
	status: 'synced' | 'failed' | 'skipped';
	error?: string;
}

interface WooLineItem {
	name: string;
	quantity: number;
	subtotal: string;
	total: string;
	meta_data: Array<{ key: string; value: string }>;
}

interface WooAddress {
	first_name: string;
	last_name: string;
	company: string;
	address_1: string;
	address_2: string;
	city: string;
	state: string;
	postcode: string;
	country: string;
	email: string;
	phone: string;
}

interface WooOrderPayload {
	status: string;
	set_paid: boolean;
	currency: string;
	customer_id: number;
	billing: WooAddress;
	shipping: WooAddress;
	line_items: WooLineItem[];
	shipping_lines: Array<{ method_id: string; method_title: string; total: string }>;
	fee_lines: unknown[];
	meta_data: Array<{ key: string; value: string }>;
}

interface WooOrderResponse {
	id: number;
	number: string;
	status: string;
}

function splitName(fullName: string | null): { first: string; last: string } {
	const trimmed = (fullName ?? '').trim();
	if (!trimmed) return { first: '', last: '' };
	const parts = trimmed.split(/\s+/);
	if (parts.length === 1) return { first: parts[0], last: '' };
	return { first: parts[0], last: parts.slice(1).join(' ') };
}

function money(n: number): string {
	return n.toFixed(2);
}

function basicAuthHeader(key: string, secret: string): string {
	return 'Basic ' + Buffer.from(`${key}:${secret}`).toString('base64');
}

export async function pushOrderToWoo(
	supabase: SupabaseClient<Database>,
	orderId: string,
	actorUserId: string
): Promise<WooSyncResult> {
	const wooUrl = env.WOO_API_URL;
	const wooKey = env.WOO_CONSUMER_KEY;
	const wooSecret = env.WOO_CONSUMER_SECRET;
	if (!wooUrl || !wooKey || !wooSecret) {
		return {
			wooOrderId: null,
			status: 'failed',
			error: 'WooCommerce credentials not configured'
		};
	}

	// 1. Claim the row. WHERE clause is the synchronization point.
	const { data: claimed, error: claimErr } = await supabase
		.from('orders')
		.update({
			woo_sync_status: 'in_progress',
			woo_last_attempt_at: new Date().toISOString(),
			woo_sync_error: null
		})
		.eq('id', orderId)
		.in('woo_sync_status', ['not_synced', 'failed'])
		.select('*')
		.single();

	if (claimErr || !claimed) {
		return {
			wooOrderId: null,
			status: 'skipped',
			error: 'Order already in progress or synced'
		};
	}

	// Bump attempts. Not safe against concurrent retries, but the row-claim
	// above ensures only one writer at a time, so this is fine.
	await supabase
		.from('orders')
		.update({ woo_sync_attempts: (claimed.woo_sync_attempts ?? 0) + 1 })
		.eq('id', orderId);

	try {
		// 2. Load items + products + customer profile
		const { data: items, error: itemsErr } = await supabase
			.from('order_items')
			.select('*, products(id, name, sku, vendor_name)')
			.eq('order_id', orderId);

		if (itemsErr || !items || items.length === 0) {
			throw new Error(`No order items: ${itemsErr?.message ?? 'empty'}`);
		}

		const { data: profile, error: profileErr } = await supabase
			.from('profiles')
			.select('*')
			.eq('id', claimed.customer_id)
			.single();

		if (profileErr || !profile) {
			throw new Error(`Customer profile not found: ${profileErr?.message ?? 'missing'}`);
		}

		// 3. Build payload
		const { first, last } = splitName(profile.full_name);
		const address: WooAddress = {
			first_name: first,
			last_name: last,
			company: profile.company_name ?? '',
			address_1: profile.address_line1 ?? '',
			address_2: profile.address_line2 ?? '',
			city: profile.city ?? '',
			state: profile.state ?? '',
			postcode: profile.zip ?? '',
			country: 'US',
			email: profile.email,
			phone: profile.phone ?? ''
		};

		const lineItems: WooLineItem[] = items.map((it) => ({
			name: it.products?.name ?? 'Item',
			quantity: it.quantity,
			subtotal: money(Number(it.unit_price)),
			total: money(Number(it.unit_price) * it.quantity),
			meta_data: [
				{ key: 'bg_product_id', value: String(it.product_id) },
				{ key: 'bg_sku', value: it.products?.sku ?? '' },
				{ key: 'vendor_name', value: it.products?.vendor_name ?? '' }
			]
		}));

		const payload: WooOrderPayload = {
			status: 'processing',
			set_paid: false,
			currency: 'USD',
			customer_id: 0, // guest checkout — embedded billing/shipping
			billing: address,
			shipping: address,
			line_items: lineItems,
			shipping_lines: [{ method_id: 'flat_rate', method_title: 'Standard', total: '0.00' }],
			fee_lines: [],
			meta_data: [
				{ key: 'bg_order_number', value: claimed.order_number },
				{ key: 'bg_order_id', value: claimed.id },
				{ key: 'bg_rep_id', value: claimed.rep_id }
			]
		};

		// 4. POST with abort-on-timeout
		const controller = new AbortController();
		const timeoutHandle = setTimeout(() => controller.abort(), TIMEOUT_MS);

		let response: Response;
		try {
			response = await fetch(`${wooUrl.replace(/\/$/, '')}/wp-json/wc/v3/orders`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: basicAuthHeader(wooKey, wooSecret)
				},
				body: JSON.stringify(payload),
				signal: controller.signal
			});
		} finally {
			clearTimeout(timeoutHandle);
		}

		if (!response.ok) {
			const text = await response.text().catch(() => '');
			throw new Error(`Woo returned ${response.status}: ${text.slice(0, 500)}`);
		}

		const wooOrder = (await response.json()) as WooOrderResponse;

		// 5. Mark synced
		await supabase
			.from('orders')
			.update({
				woo_order_id: String(wooOrder.id),
				woo_synced_at: new Date().toISOString(),
				woo_sync_status: 'synced',
				woo_sync_error: null
			})
			.eq('id', orderId);

		await logAuditEvent(supabase, actorUserId, 'woo_sync_success', 'orders', orderId, {
			woo_order_id: wooOrder.id,
			woo_order_number: wooOrder.number
		});

		return { wooOrderId: String(wooOrder.id), status: 'synced' };
	} catch (err) {
		const message =
			err instanceof Error
				? err.name === 'AbortError'
					? `Timeout after ${TIMEOUT_MS}ms`
					: err.message
				: String(err);

		await supabase
			.from('orders')
			.update({ woo_sync_status: 'failed', woo_sync_error: message })
			.eq('id', orderId);

		await logAuditEvent(supabase, actorUserId, 'woo_sync_failure', 'orders', orderId, {
			error: message
		});

		return { wooOrderId: null, status: 'failed', error: message };
	}
}
