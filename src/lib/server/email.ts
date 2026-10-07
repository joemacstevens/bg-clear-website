// Server-only transactional email via Resend.
//
// Temporary setup (Option A): no domain needed — Resend's sandbox sender
// `onboarding@resend.dev` works with just RESEND_API_KEY, but only delivers to
// your own Resend account email. Once a domain is verified (ajeo.design now, or
// bgclear.com later), set RESEND_FROM to a branded address and it sends to anyone.
//
// Env:
//   RESEND_API_KEY        (required to actually send; no-ops + logs if absent)
//   RESEND_FROM           (optional; default "BG Clear <onboarding@resend.dev>")
//   INTERNAL_NOTIFY_EMAIL (optional; internal inbox for staff alerts — invoices,
//                          payments, approvals)
import { env } from '$env/dynamic/private';

const RESEND_ENDPOINT = 'https://api.resend.com/emails';

function fromAddress() {
	return env.RESEND_FROM || 'BG Clear <onboarding@resend.dev>';
}

export async function sendEmail(opts: {
	to: string | string[];
	subject: string;
	html: string;
	replyTo?: string;
}): Promise<{ id?: string; skipped?: boolean; error?: string }> {
	const apiKey = env.RESEND_API_KEY;
	if (!apiKey) {
		console.warn(`[email] RESEND_API_KEY not set — skipping "${opts.subject}"`);
		return { skipped: true };
	}

	const res = await fetch(RESEND_ENDPOINT, {
		method: 'POST',
		headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
		body: JSON.stringify({
			from: fromAddress(),
			to: Array.isArray(opts.to) ? opts.to : [opts.to],
			subject: opts.subject,
			html: opts.html,
			...(opts.replyTo ? { reply_to: opts.replyTo } : {})
		})
	});

	if (!res.ok) {
		const text = await res.text();
		console.error('[email] send failed', res.status, text);
		return { error: text };
	}
	const data = await res.json();
	return { id: data.id };
}

/** INTERNAL_NOTIFY_EMAIL plus any extra staff addresses, de-duplicated. */
export function staffRecipients(...extra: (string | null | undefined)[]): string[] {
	const seen = new Set<string>();
	return [env.INTERNAL_NOTIFY_EMAIL, ...extra]
		.map((e) => e?.trim())
		.filter((e): e is string => !!e && !seen.has(e.toLowerCase()) && !!seen.add(e.toLowerCase()));
}

// ---- Branded HTML shell -----------------------------------------------------

function layout(bodyHtml: string): string {
	return `<!doctype html><html><body style="margin:0;background:#f4f6f8;font-family:Arial,Helvetica,sans-serif;color:#1a1a1a;">
	<div style="max-width:560px;margin:0 auto;padding:24px;">
		<div style="background:#1e3a5f;color:#fff;padding:18px 24px;border-radius:12px 12px 0 0;font-weight:700;font-size:18px;">BG Clear</div>
		<div style="background:#fff;padding:24px;border:1px solid #e3e8ee;border-top:none;border-radius:0 0 12px 12px;line-height:1.5;font-size:14px;">
			${bodyHtml}
		</div>
		<p style="color:#8a94a6;font-size:11px;text-align:center;margin:16px 0;">BG Clear — durable medical equipment</p>
	</div>
</body></html>`;
}

function button(href: string, label: string): string {
	return `<a href="${href}" style="display:inline-block;background:#d4a234;color:#1a1a1a;font-weight:700;text-decoration:none;padding:11px 22px;border-radius:999px;">${label}</a>`;
}

function money(n: number): string {
	return `$${(Number(n) || 0).toFixed(2)}`;
}

// ---- Notification templates -------------------------------------------------

/** Staff alert: a new quote request came in. */
export async function notifyNewQuote(opts: {
	to: string | string[];
	origin: string;
	quoteId: string;
	customerName: string;
	itemCount: number;
}) {
	const link = `${opts.origin}/rep/quotes/${opts.quoteId}`;
	return sendEmail({
		to: opts.to,
		subject: `New quote request — ${opts.customerName}`,
		html: layout(`
			<h2 style="margin:0 0 12px;">New quote request</h2>
			<p><strong>${opts.customerName}</strong> just submitted a quote request with ${opts.itemCount} item(s).</p>
			<p style="margin:20px 0;">${button(link, 'Review & price the quote')}</p>
			<p style="color:#8a94a6;font-size:12px;">Respond quickly — the goal is first contact within 20–30 minutes.</p>
		`)
	});
}

/** Customer email: your rep priced the quote, come review & pay. */
export async function notifyQuoteReady(opts: {
	to: string;
	origin: string;
	quoteId: string;
	customerName: string;
}) {
	const link = `${opts.origin}/catalog/quotes/${opts.quoteId}`;
	return sendEmail({
		to: opts.to,
		subject: 'Your BG Clear quote is ready',
		html: layout(`
			<h2 style="margin:0 0 12px;">Your quote is ready</h2>
			<p>Hi ${opts.customerName}, your sales rep has priced your quote. You can review it, adjust quantities or remove items, and continue to payment.</p>
			<p style="margin:20px 0;">${button(link, 'View your quote')}</p>
		`)
	});
}

/** New customer invite: account created on their behalf by staff. */
export async function sendCustomerInvite(opts: {
	to: string;
	origin: string;
	fullName: string;
	tempPassword: string;
}) {
	const link = `${opts.origin}/login`;
	return sendEmail({
		to: opts.to,
		subject: 'Welcome to BG Clear — your account is ready',
		html: layout(`
			<h2 style="margin:0 0 12px;">Welcome to BG Clear</h2>
			<p>Hi ${opts.fullName}, an account has been created for you so you can view pricing and place orders.</p>
			<p style="background:#f4f6f8;border:1px solid #e3e8ee;border-radius:8px;padding:12px;">
				Email: <strong>${opts.to}</strong><br>
				Temporary password: <strong>${opts.tempPassword}</strong>
			</p>
			<p style="margin:20px 0;">${button(link, 'Sign in')}</p>
			<p style="color:#8a94a6;font-size:12px;">Please change your password after signing in.</p>
		`)
	});
}

/** Admin alert: a rep submitted a below-target quote that needs approval. */
export async function notifyApprovalNeeded(opts: {
	to: string;
	origin: string;
	customerName: string;
	repName?: string;
	total?: number;
}) {
	const link = `${opts.origin}/admin/quote-approvals`;
	return sendEmail({
		to: opts.to,
		subject: `Quote approval needed — ${opts.customerName}`,
		html: layout(`
			<h2 style="margin:0 0 12px;">A quote needs your approval</h2>
			<p>${opts.repName ? `<strong>${opts.repName}</strong>` : 'A rep'} submitted a <strong>below-target</strong> quote for <strong>${opts.customerName}</strong>${opts.total != null ? ` totaling <strong>${money(opts.total)}</strong>` : ''}. It can't be sent to the customer until it's approved.</p>
			<p style="margin:20px 0;">${button(link, 'Review the approval queue')}</p>
		`)
	});
}

/** Rep email: an admin rejected the quote's pricing. */
export async function notifyQuoteRejected(opts: {
	to: string;
	origin: string;
	quoteId: string;
	customerName: string;
	notes?: string;
}) {
	const link = `${opts.origin}/rep/quotes/${opts.quoteId}`;
	return sendEmail({
		to: opts.to,
		subject: `Quote pricing rejected — ${opts.customerName}`,
		html: layout(`
			<h2 style="margin:0 0 12px;">Pricing needs revision</h2>
			<p>An admin rejected the pricing on your quote for <strong>${opts.customerName}</strong>.</p>
			${opts.notes ? `<p style="background:#fff7ed;border:1px solid #fed7aa;border-radius:8px;padding:12px;"><strong>Reason:</strong> ${opts.notes}</p>` : ''}
			<p style="margin:20px 0;">${button(link, 'Revise & resubmit')}</p>
		`)
	});
}

/** Customer email: their order has been created. */
export async function notifyOrderConfirmation(opts: {
	to: string;
	origin: string;
	orderId: string;
	orderNumber: string;
	customerName: string;
	total: number;
}) {
	const link = `${opts.origin}/catalog/orders/${opts.orderId}`;
	return sendEmail({
		to: opts.to,
		subject: `Order confirmed — ${opts.orderNumber}`,
		html: layout(`
			<h2 style="margin:0 0 12px;">Your order is confirmed</h2>
			<p>Hi ${opts.customerName}, your order <strong>${opts.orderNumber}</strong> has been created for <strong>${money(opts.total)}</strong>. The next step is payment — you can complete it securely from your portal.</p>
			<p style="margin:20px 0;">${button(link, 'View order & pay')}</p>
		`)
	});
}

/** Staff email (rep + internal inbox): an order was placed. */
export async function notifyOrderPlacedToRep(opts: {
	to: string | string[];
	origin: string;
	orderId: string;
	orderNumber: string;
	customerName: string;
	total: number;
}) {
	const link = `${opts.origin}/rep/orders/${opts.orderId}`;
	return sendEmail({
		to: opts.to,
		subject: `Order placed — ${opts.customerName} (${opts.orderNumber})`,
		html: layout(`
			<h2 style="margin:0 0 12px;">Order placed 🎉</h2>
			<p><strong>${opts.customerName}</strong> now has order <strong>${opts.orderNumber}</strong> for <strong>${money(opts.total)}</strong>. They'll complete payment from their portal.</p>
			<p style="margin:20px 0;">${button(link, 'View the order')}</p>
		`)
	});
}

/** Customer email: payment received — receipt. */
export async function notifyPaymentReceipt(opts: {
	to: string;
	origin: string;
	orderId: string;
	orderNumber: string;
	customerName: string;
	total: number;
}) {
	const link = `${opts.origin}/catalog/orders/${opts.orderId}`;
	return sendEmail({
		to: opts.to,
		subject: `Payment received — ${opts.orderNumber}`,
		html: layout(`
			<h2 style="margin:0 0 12px;">Thank you — payment received</h2>
			<p>Hi ${opts.customerName}, we've received your payment of <strong>${money(opts.total)}</strong> for order <strong>${opts.orderNumber}</strong>. It's now being processed for fulfillment.</p>
			<p style="margin:20px 0;">${button(link, 'View your order')}</p>
		`)
	});
}

/** Rep/internal email: an order was paid. */
export async function notifyOrderPaid(opts: {
	to: string | string[];
	origin: string;
	orderId: string;
	orderNumber: string;
	customerName: string;
	total: number;
}) {
	const link = `${opts.origin}/rep/orders/${opts.orderId}`;
	return sendEmail({
		to: opts.to,
		subject: `Paid — ${opts.orderNumber} (${opts.customerName})`,
		html: layout(`
			<h2 style="margin:0 0 12px;">Order paid 💳</h2>
			<p><strong>${opts.customerName}</strong> paid <strong>${money(opts.total)}</strong> for order <strong>${opts.orderNumber}</strong>. Time to fulfill.</p>
			<p style="margin:20px 0;">${button(link, 'View the order')}</p>
		`)
	});
}

/** Customer email: order shipped (+ optional tracking number). */
export async function notifyOrderShipped(opts: {
	to: string;
	origin: string;
	orderId: string;
	orderNumber: string;
	customerName: string;
	trackingNumber?: string | null;
}) {
	const link = `${opts.origin}/catalog/orders/${opts.orderId}`;
	return sendEmail({
		to: opts.to,
		subject: `Your order shipped — ${opts.orderNumber}`,
		html: layout(`
			<h2 style="margin:0 0 12px;">Your order is on the way 📦</h2>
			<p>Hi ${opts.customerName}, order <strong>${opts.orderNumber}</strong> has shipped.</p>
			${opts.trackingNumber ? `<p style="background:#f4f6f8;border:1px solid #e3e8ee;border-radius:8px;padding:12px;">Tracking number: <strong>${opts.trackingNumber}</strong></p>` : ''}
			<p style="margin:20px 0;">${button(link, 'Track your order')}</p>
		`)
	});
}

// ---- Manual pay-invoice links ----------------------------------------------

function esc(s: string): string {
	return s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
}

type InvoiceSummary = {
	invoiceNumber: string;
	customerName?: string | null;
	customerEmail?: string | null;
	description: string;
	amount: number;
};

function invoiceDetails(inv: InvoiceSummary): string {
	const client = [inv.customerName, inv.customerEmail].filter(Boolean).map((s) => esc(s!)).join(' · ');
	return `<table style="width:100%;background:#f4f6f8;border:1px solid #e3e8ee;border-radius:8px;padding:12px;font-size:14px;">
		<tr><td style="color:#5a6577;padding:2px 0;">Invoice</td><td style="text-align:right;"><strong>${esc(inv.invoiceNumber)}</strong></td></tr>
		<tr><td style="color:#5a6577;padding:2px 0;">Client</td><td style="text-align:right;">${client || '—'}</td></tr>
		<tr><td style="color:#5a6577;padding:2px 0;">For</td><td style="text-align:right;">${esc(inv.description)}</td></tr>
		<tr><td style="color:#5a6577;padding:2px 0;">Amount</td><td style="text-align:right;"><strong>${money(inv.amount)}</strong></td></tr>
	</table>`;
}

/** Internal email: a rep/admin generated a pay-invoice link. */
export async function notifyInvoiceCreated(
	opts: InvoiceSummary & { to: string | string[]; origin: string; payUrl?: string | null; createdBy?: string | null }
) {
	return sendEmail({
		to: opts.to,
		subject: `Invoice sent — ${opts.invoiceNumber} · ${money(opts.amount)}${opts.customerName ? ` (${opts.customerName})` : ''}`,
		html: layout(`
			<h2 style="margin:0 0 12px;">New invoice issued 🧾</h2>
			<p>${opts.createdBy ? `<strong>${esc(opts.createdBy)}</strong> generated` : 'A new'} pay-by-card invoice link.</p>
			${invoiceDetails(opts)}
			${opts.payUrl ? `<p style="font-size:12px;color:#5a6577;margin:12px 0 0;">Pay link: <a href="${esc(opts.payUrl)}">${esc(opts.payUrl)}</a></p>` : ''}
			<p style="margin:20px 0;">${button(`${opts.origin}/rep/invoices`, 'View invoices')}</p>
		`)
	});
}

/** Internal email: a client paid a pay-invoice link — payment receipt. */
export async function notifyInvoicePaid(
	opts: InvoiceSummary & { to: string | string[]; origin: string; wooOrderId?: string | null; paidAt?: string }
) {
	return sendEmail({
		to: opts.to,
		subject: `Payment received — ${opts.invoiceNumber} · ${money(opts.amount)}${opts.customerName ? ` (${opts.customerName})` : ''}`,
		html: layout(`
			<h2 style="margin:0 0 12px;">Invoice paid 💳</h2>
			<p>A card payment cleared for this invoice.</p>
			${invoiceDetails(opts)}
			<p style="font-size:12px;color:#5a6577;margin:12px 0 0;">${opts.paidAt ? `Paid ${new Date(opts.paidAt).toLocaleString('en-US', { timeZone: 'America/New_York' })} ET` : ''}${opts.wooOrderId ? ` · WooCommerce order #${esc(opts.wooOrderId)}` : ''}</p>
			<p style="margin:20px 0;">${button(`${opts.origin}/rep/invoices`, 'View invoices')}</p>
		`)
	});
}
