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
//   INTERNAL_NOTIFY_EMAIL (optional; fallback recipient for staff alerts)
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

// ---- Notification templates -------------------------------------------------

/** Staff alert: a new quote request came in. */
export async function notifyNewQuote(opts: {
	to: string;
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
