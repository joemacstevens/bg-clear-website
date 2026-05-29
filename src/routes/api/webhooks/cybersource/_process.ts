/**
 * Shared processing for Cybersource Secure Acceptance callbacks.
 * Used by both the S2S webhook and the browser-return endpoint, since
 * Cybersource sends the same signed body to both `merchant_post_url`
 * (S2S) and `transaction_response_url` (browser POST).
 *
 * Idempotent: re-processing the same callback returns 'duplicate' rather
 * than creating a second payment row, thanks to UNIQUE on
 * `cybersource_transaction_id`.
 */
import {
	verifyResponseSignature,
	parseAmountCents
} from '$lib/server/integrations/cybersource';
import { createSupabaseAdminClient } from '$lib/server/supabase-admin';
import { logAuditEvent } from '$lib/api/audit';
import type { CybersourceDecision } from '$lib/database.types';

const TERMINAL_DECISIONS = ['ACCEPT', 'DECLINE', 'REVIEW', 'ERROR', 'CANCEL'] as const;

function asDecision(raw: string | undefined): CybersourceDecision | null {
	if (!raw) return null;
	const upper = raw.toUpperCase();
	return (TERMINAL_DECISIONS as readonly string[]).includes(upper)
		? (upper as CybersourceDecision)
		: null;
}

export type CallbackResult =
	| { status: 'ok'; orderId: string; orderNumber: string; decision: CybersourceDecision }
	| { status: 'duplicate'; orderId: string; orderNumber: string; decision: CybersourceDecision }
	| { status: 'invalid_signature' }
	| { status: 'missing_fields' }
	| { status: 'unknown_order'; orderNumber: string }
	| { status: 'amount_mismatch'; orderId: string; orderNumber: string }
	| { status: 'persist_failed'; orderId: string; orderNumber: string };

export async function processCallback(body: Record<string, string>): Promise<CallbackResult> {
	if (!verifyResponseSignature(body)) {
		return { status: 'invalid_signature' };
	}

	const orderNumber = body.req_reference_number;
	const transactionId = body.transaction_id || body.req_transaction_uuid;
	const decision = asDecision(body.decision);

	if (!orderNumber || !transactionId || !decision) {
		return { status: 'missing_fields' };
	}

	const supabase = createSupabaseAdminClient();

	const { data: order, error: orderErr } = await supabase
		.from('orders')
		.select('id, customer_id, subtotal, payment_collected')
		.eq('order_number', orderNumber)
		.single();

	if (orderErr || !order) {
		return { status: 'unknown_order', orderNumber };
	}

	const expectedCents = Math.round(Number(order.subtotal ?? 0) * 100);
	const receivedCents = parseAmountCents(body.req_amount);
	if (receivedCents === null || receivedCents !== expectedCents) {
		await logAuditEvent(
			supabase,
			order.customer_id,
			'payment_callback_amount_mismatch',
			'orders',
			order.id,
			{
				expected_cents: expectedCents,
				received_amount: body.req_amount,
				transaction_id: transactionId
			}
		);
		return { status: 'amount_mismatch', orderId: order.id, orderNumber };
	}

	const decisionAt = new Date().toISOString();
	const { data: inserted, error: insertErr } = await supabase
		.from('payments')
		.upsert(
			{
				order_id: order.id,
				cybersource_transaction_id: transactionId,
				amount_cents: expectedCents,
				currency: body.req_currency ?? 'USD',
				status: decision === 'ACCEPT' ? 'completed' : 'failed',
				decision,
				decision_at: decisionAt,
				reason_code: body.reason_code ?? null,
				auth_code: body.auth_code ?? null,
				card_last_four: body.req_card_number ? body.req_card_number.slice(-4) : null,
				card_brand: body.req_card_type ?? null,
				raw_response: body
			},
			{ onConflict: 'cybersource_transaction_id', ignoreDuplicates: true }
		)
		.select('id')
		.maybeSingle();

	if (insertErr) {
		await logAuditEvent(supabase, order.customer_id, 'payment_insert_failure', 'orders', order.id, {
			error: insertErr.message,
			transaction_id: transactionId
		});
		return { status: 'persist_failed', orderId: order.id, orderNumber };
	}

	// `inserted` is null when the UNIQUE conflict fired — i.e. a replay.
	// First-write side flips the order; replay side just acks.
	if (!inserted) {
		return { status: 'duplicate', orderId: order.id, orderNumber, decision };
	}

	if (decision === 'ACCEPT' && !order.payment_collected) {
		await supabase
			.from('orders')
			.update({ payment_collected: true, payment_collected_at: decisionAt })
			.eq('id', order.id);
	}

	await logAuditEvent(supabase, order.customer_id, 'payment_received', 'orders', order.id, {
		decision,
		transaction_id: transactionId,
		amount_cents: expectedCents,
		reason_code: body.reason_code ?? null
	});

	return { status: 'ok', orderId: order.id, orderNumber, decision };
}
