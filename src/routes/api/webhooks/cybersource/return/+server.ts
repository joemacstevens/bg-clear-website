/**
 * Cybersource Secure Acceptance browser-return endpoint.
 *
 * Configure your Secure Acceptance profile's `transaction_response_url`
 * to point here. Cybersource POSTs the same signed body that the S2S
 * webhook receives, but with the customer's browser — so we redirect
 * to the order's payment-result page after processing.
 *
 * Processing is shared with the S2S endpoint via `_process.ts`. The
 * UNIQUE constraint on `cybersource_transaction_id` means whichever
 * call arrives second short-circuits as a duplicate — the result is
 * the same payment row no matter which fires first.
 */
import { redirect, type RequestHandler } from '@sveltejs/kit';
import { processCallback } from '../_process';

export const POST: RequestHandler = async ({ request }) => {
	const formData = await request.formData();
	const body: Record<string, string> = {};
	for (const [key, value] of formData.entries()) {
		body[key] = String(value);
	}

	const result = await processCallback(body);

	// If we know which order this is for, send the customer there even on
	// error states — the result page renders the decision (decline, review,
	// error) for them. Only signature/missing-fields/unknown-order have
	// no order to redirect to.
	const orderNumber = body.req_reference_number;
	const supabaseLookupAttempted =
		result.status !== 'invalid_signature' &&
		result.status !== 'missing_fields' &&
		result.status !== 'unknown_order';

	if (supabaseLookupAttempted && 'orderId' in result) {
		throw redirect(303, `/catalog/orders/${result.orderId}/payment-result`);
	}

	// Couldn't resolve to a known order. Send them to their order list with
	// a generic error rather than 500ing — the S2S webhook will have logged
	// the issue and an admin can investigate from audit_log.
	throw redirect(303, '/catalog/orders' + (orderNumber ? `?error=payment&ref=${encodeURIComponent(orderNumber)}` : '?error=payment'));
};
