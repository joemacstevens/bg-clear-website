/**
 * Cybersource Secure Acceptance server-to-server callback receiver.
 *
 * Configure your Secure Acceptance profile's `merchant_post_url` to point
 * here. This route is the authoritative writer for payment decisions.
 *
 * This endpoint is NOT covered by the portal auth guard in
 * `hooks.server.ts` (which only matches /catalog, /admin, /rep, /account).
 * We use the service-role admin client to write the payment row — RLS does
 * not apply.
 *
 * Hardening:
 *  - HMAC signature must verify (constant-time)
 *  - Amount in the response must match the order's recorded total
 *  - Replays are silently absorbed via UNIQUE on cybersource_transaction_id
 */
import { json, type RequestHandler } from '@sveltejs/kit';
import { processCallback } from './_process';

export const POST: RequestHandler = async ({ request }) => {
	const formData = await request.formData();
	const body: Record<string, string> = {};
	for (const [key, value] of formData.entries()) {
		body[key] = String(value);
	}

	const result = await processCallback(body);
	if (result.status === 'invalid_signature') return json({ error: 'invalid signature' }, { status: 400 });
	if (result.status === 'missing_fields') return json({ error: 'missing required fields' }, { status: 400 });
	if (result.status === 'unknown_order') return json({ error: 'order not found' }, { status: 404 });
	if (result.status === 'amount_mismatch') return json({ error: 'amount mismatch' }, { status: 400 });
	if (result.status === 'persist_failed') return json({ error: 'persist failed' }, { status: 500 });
	if (result.status === 'duplicate') return json({ ok: true, duplicate: true });
	return json({ ok: true });
};
