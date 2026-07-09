import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { createSupabaseAdminClient } from '$lib/server/supabase-admin';
import { createWooOrder } from '$lib/server/woocommerce';

// Public, unauthenticated "pay an invoice" page. The payer types the invoice
// number (from their paper/emailed invoice) and the amount, then we spin up the
// WooCommerce order and forward them straight to the card form. Anon can't write
// manual_invoices (staff-only RLS), so the insert runs through the service-role
// admin client — same pattern as customer-initiated writes elsewhere.
function splitName(name: string): { first_name: string; last_name: string } {
	const parts = name.trim().split(/\s+/);
	if (parts.length <= 1) return { first_name: name.trim(), last_name: '' };
	return { first_name: parts.slice(0, -1).join(' '), last_name: parts[parts.length - 1] };
}

export const actions: Actions = {
	start: async ({ request }) => {
		const form = await request.formData();

		// Honeypot: real users never fill this hidden field; bots do.
		if ((form.get('company_url') as string)?.trim()) {
			return fail(400, { error: 'Something went wrong. Please try again.' });
		}

		const invoiceNumber = (form.get('invoice_number') as string)?.trim() ?? '';
		const amountRaw = (form.get('amount') as string)?.trim() ?? '';
		const customerName = (form.get('customer_name') as string)?.trim() ?? '';
		const customerEmail = (form.get('customer_email') as string)?.trim() ?? '';
		const values = {
			invoice_number: invoiceNumber,
			amount: amountRaw,
			customer_name: customerName,
			customer_email: customerEmail
		};

		if (!invoiceNumber) return fail(400, { error: 'Enter your invoice number.', values });
		const amount = Number(amountRaw);
		if (!amountRaw || !Number.isFinite(amount) || amount <= 0) {
			return fail(400, { error: 'Enter the amount shown on your invoice.', values });
		}
		if (customerEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) {
			return fail(400, { error: 'That email address does not look valid.', values });
		}

		const admin = createSupabaseAdminClient();
		const { data: invoice, error: insertErr } = await admin
			.from('manual_invoices')
			.insert({
				invoice_number: invoiceNumber,
				amount,
				description: `Invoice ${invoiceNumber}`,
				customer_name: customerName || null,
				customer_email: customerEmail || null
			})
			.select()
			.single();

		if (insertErr || !invoice) {
			return fail(500, { error: 'Could not start the payment. Please try again.', values });
		}

		let payUrl: string;
		try {
			const { first_name, last_name } = splitName(customerName);
			const res = await createWooOrder({
				bgOrderId: invoice.id,
				bgOrderNumber: invoiceNumber,
				orderType: 'manual_invoice',
				billing: { first_name, last_name, email: customerEmail || undefined },
				items: [{ name: `Invoice ${invoiceNumber}`, quantity: 1, unitPrice: amount }]
			});
			payUrl = res.payUrl;
			await admin
				.from('manual_invoices')
				.update({ woo_order_id: String(res.wooOrderId), pay_url: res.payUrl })
				.eq('id', invoice.id);
		} catch {
			// Roll back the dangling row if the payment system is unreachable.
			await admin.from('manual_invoices').delete().eq('id', invoice.id);
			return fail(502, {
				error: 'The payment system is temporarily unavailable. Please try again shortly.',
				values
			});
		}

		// Full-page redirect to the Woo/CyberSource card form (external origin).
		throw redirect(303, payUrl);
	}
};
