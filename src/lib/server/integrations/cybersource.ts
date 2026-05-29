/**
 * Cybersource Secure Acceptance Hosted Checkout (Bank of America Merchant Services).
 *
 * Flow:
 *   1. Server builds a signed form (this module's `buildSignedPaymentRequest`)
 *   2. Customer's browser POSTs to formAction (Cybersource hosted page)
 *   3. Customer enters card on Cybersource — never on our domain
 *   4. Cybersource POSTs the signed decision back to our webhook
 *   5. Webhook verifies signature (this module's `verifyResponseSignature`),
 *      asserts the amount matches the order, writes the payment row.
 *
 * PCI scope stays at SAQ-A — no card data ever touches our servers.
 *
 * Signing reference: Cybersource Secure Acceptance Hosted Checkout
 * Integration Guide §"Creating the signature".
 */
import crypto from 'node:crypto';
import { env } from '$env/dynamic/private';

const TEST_URL = 'https://testsecureacceptance.cybersource.com/pay';
const PROD_URL = 'https://secureacceptance.cybersource.com/pay';

function getFormAction(): string {
	return env.CYBERSOURCE_ENV === 'prod' ? PROD_URL : TEST_URL;
}

function sign(input: string, secretKey: string): string {
	return crypto.createHmac('sha256', secretKey).update(input).digest('base64');
}

/**
 * Build the comma-joined `name=value` string that gets HMAC'd.
 * Order is dictated by `signed_field_names` itself.
 */
function buildSignedString(
	fields: Record<string, string>,
	signedFieldNames: string
): string {
	return signedFieldNames
		.split(',')
		.map((name) => `${name}=${fields[name] ?? ''}`)
		.join(',');
}

export interface PaymentRequest {
	orderNumber: string;
	amountCents: number;
	currency: string;
	customerEmail: string;
	customerId: string;
}

export interface PaymentRequestForm {
	formAction: string;
	fields: Record<string, string>;
}

export function buildSignedPaymentRequest(req: PaymentRequest): PaymentRequestForm {
	const accessKey = env.CYBERSOURCE_ACCESS_KEY;
	const profileId = env.CYBERSOURCE_PROFILE_ID;
	const secretKey = env.CYBERSOURCE_SECRET_KEY;
	if (!accessKey || !profileId || !secretKey) {
		throw new Error('Cybersource credentials not configured');
	}

	const amount = (req.amountCents / 100).toFixed(2);
	const transactionUuid = crypto.randomUUID();
	// Cybersource requires UTC and rejects fractional seconds.
	const signedDateTime = new Date().toISOString().replace(/\.\d{3}Z$/, 'Z');

	const fields: Record<string, string> = {
		access_key: accessKey,
		profile_id: profileId,
		transaction_uuid: transactionUuid,
		signed_date_time: signedDateTime,
		locale: 'en',
		transaction_type: 'sale',
		reference_number: req.orderNumber,
		amount,
		currency: req.currency,
		bill_to_email: req.customerEmail,
		// Track BG identity so the webhook can resolve the customer fast.
		merchant_defined_data1: req.customerId,
		unsigned_field_names: ''
	};

	// `signed_field_names` is itself signed, so list it last in the names list
	// and include the entry in the fields dict before computing the HMAC.
	const baseFieldNames = Object.keys(fields).filter((k) => k !== 'unsigned_field_names');
	const signedFieldNames = [...baseFieldNames, 'unsigned_field_names', 'signed_field_names'].join(
		','
	);
	fields.signed_field_names = signedFieldNames;

	const signedString = buildSignedString(fields, signedFieldNames);
	fields.signature = sign(signedString, secretKey);

	return { formAction: getFormAction(), fields };
}

/**
 * Constant-time verification of a Cybersource response POST body.
 * Returns false on any malformed input — never throws.
 */
export function verifyResponseSignature(formBody: Record<string, string>): boolean {
	const secretKey = env.CYBERSOURCE_SECRET_KEY;
	if (!secretKey) return false;

	const signedFieldNames = formBody.signed_field_names;
	const providedSignature = formBody.signature;
	if (!signedFieldNames || !providedSignature) return false;

	const signedString = buildSignedString(formBody, signedFieldNames);
	const expectedSignature = sign(signedString, secretKey);

	const a = Buffer.from(providedSignature, 'utf8');
	const b = Buffer.from(expectedSignature, 'utf8');
	if (a.length !== b.length) return false;
	try {
		return crypto.timingSafeEqual(a, b);
	} catch {
		return false;
	}
}

/**
 * Convert Cybersource's decimal `req_amount` string ("100.00") to cents.
 * Returns null on parse failure so callers can reject the callback.
 */
export function parseAmountCents(reqAmount: string | undefined): number | null {
	if (!reqAmount) return null;
	const n = Number(reqAmount);
	if (!Number.isFinite(n) || n <= 0) return null;
	return Math.round(n * 100);
}
