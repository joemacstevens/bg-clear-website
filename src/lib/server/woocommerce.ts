// Server-only WooCommerce REST client. Woo is the PAYMENT step only — the BG
// Clear catalog/quotes/orders live in Supabase. We push a pending Woo order
// with custom line items (quoted prices), then redirect the customer to the
// Woo order-pay page where the Bank of America / CyberSource gateway collects
// the card. A Woo webhook tells us when it's paid.
//
// Env (already set in Vercel for Dev + Production):
//   WOOCOMMERCE_STORE_URL, WOOCOMMERCE_CONSUMER_KEY,
//   WOOCOMMERCE_CONSUMER_SECRET, WOOCOMMERCE_WEBHOOK_SECRET
import { env } from '$env/dynamic/private';
import crypto from 'node:crypto';

function wooConfig() {
	const storeUrl = env.WOOCOMMERCE_STORE_URL;
	const key = env.WOOCOMMERCE_CONSUMER_KEY;
	const secret = env.WOOCOMMERCE_CONSUMER_SECRET;
	if (!storeUrl || !key || !secret) {
		throw new Error(
			'WooCommerce env vars are required (WOOCOMMERCE_STORE_URL, WOOCOMMERCE_CONSUMER_KEY, WOOCOMMERCE_CONSUMER_SECRET)'
		);
	}
	return {
		base: `${storeUrl.replace(/\/$/, '')}/wp-json/wc/v3`,
		storeUrl: storeUrl.replace(/\/$/, ''),
		auth: 'Basic ' + Buffer.from(`${key}:${secret}`).toString('base64')
	};
}

export interface WooOrderInput {
	bgOrderId: string;
	bgOrderNumber: string;
	billing: {
		first_name?: string;
		last_name?: string;
		email?: string;
		phone?: string;
		company?: string;
	};
	items: {
		name: string;
		quantity: number;
		unitPrice: number;
		imageUrl?: string | null;
		bgProductId?: string;
	}[];
}

function payUrlFrom(storeUrl: string, data: any): string {
	// Woo returns `payment_url` for pending orders; fall back to the order-pay route.
	return (
		data.payment_url ||
		`${storeUrl}/checkout/order-pay/${data.id}/?pay_for_order=true&key=${data.order_key}`
	);
}

/**
 * Create a pending Woo order from a BG Clear order and return the pay URL.
 *
 * We use `fee_lines` (name + total), NOT `line_items`: the BG Clear catalog is
 * not mirrored into Woo, and Woo's REST API rejects product-less line_items with
 * "Product ID or SKU is required". Fee lines let us push the quoted amounts as
 * named lines with no Woo product. Quantity is folded into the line name and the
 * total. The product image rides along as fee meta (`_thumbnail_url`) for an
 * optional theme snippet to render a thumbnail on the pay page.
 */
export async function createWooOrder(
	input: WooOrderInput
): Promise<{ wooOrderId: number; payUrl: string }> {
	const { base, storeUrl, auth } = wooConfig();

	const fee_lines = input.items.map((it) => ({
		name: it.quantity > 1 ? `${it.name}  ×${it.quantity}` : it.name,
		total: (it.unitPrice * it.quantity).toFixed(2),
		tax_status: 'none',
		meta_data: [
			{ key: 'bg_unit_price', value: it.unitPrice.toFixed(2) },
			{ key: 'bg_quantity', value: String(it.quantity) },
			...(it.imageUrl ? [{ key: '_thumbnail_url', value: it.imageUrl }] : []),
			...(it.bgProductId ? [{ key: 'bg_product_id', value: it.bgProductId }] : [])
		]
	}));

	const body = {
		status: 'pending',
		set_paid: false,
		currency: 'USD',
		billing: input.billing,
		fee_lines,
		meta_data: [
			{ key: 'bg_order_id', value: input.bgOrderId },
			{ key: 'bg_order_number', value: input.bgOrderNumber }
		]
	};

	const res = await fetch(`${base}/orders`, {
		method: 'POST',
		headers: { Authorization: auth, 'Content-Type': 'application/json' },
		body: JSON.stringify(body)
	});

	if (!res.ok) {
		const text = await res.text();
		throw new Error(`WooCommerce order creation failed (${res.status}): ${text.slice(0, 300)}`);
	}

	const data = await res.json();
	return { wooOrderId: data.id, payUrl: payUrlFrom(storeUrl, data) };
}

/** Re-fetch the pay URL for an existing Woo order (avoids creating duplicates). */
export async function getWooOrderPayUrl(wooOrderId: string): Promise<string | null> {
	const { base, storeUrl, auth } = wooConfig();
	const res = await fetch(`${base}/orders/${wooOrderId}`, { headers: { Authorization: auth } });
	if (!res.ok) return null;
	const data = await res.json();
	if (data.status && data.status !== 'pending' && data.status !== 'failed') {
		// Already processing/paid — no payable URL to return.
		return null;
	}
	return payUrlFrom(storeUrl, data);
}

/**
 * Verify a WooCommerce webhook signature.
 * Woo signs the raw request body with HMAC-SHA256(secret) and base64-encodes it
 * in the `x-wc-webhook-signature` header.
 */
export function verifyWooWebhook(rawBody: string, signature: string | null): boolean {
	const secret = env.WOOCOMMERCE_WEBHOOK_SECRET;
	if (!secret || !signature) return false;
	const expected = crypto.createHmac('sha256', secret).update(rawBody, 'utf8').digest('base64');
	try {
		return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
	} catch {
		return false;
	}
}
