import type { PageServerLoad, Actions } from './$types';
import { createWooOrder } from '$lib/server/woocommerce';

export const load: PageServerLoad = async ({ locals }) => {
	// Staff-only page (RLS restricts the table to admin/manager/sales_rep).
	const { data: invoices } = await locals.supabase
		.from('manual_invoices')
		.select('*')
		.order('created_at', { ascending: false });

	return { invoices: invoices ?? [] };
};

function splitName(name: string): { first_name: string; last_name: string } {
	const parts = name.trim().split(/\s+/);
	if (parts.length <= 1) return { first_name: name.trim(), last_name: '' };
	return { first_name: parts.slice(0, -1).join(' '), last_name: parts[parts.length - 1] };
}

export const actions: Actions = {
	create: async ({ request, locals }) => {
		const form = await request.formData();
		const customerName = (form.get('customer_name') as string)?.trim() ?? '';
		const customerEmail = (form.get('customer_email') as string)?.trim() ?? '';
		const description = (form.get('description') as string)?.trim() ?? '';
		const amountRaw = (form.get('amount') as string)?.trim() ?? '';
		let invoiceNumber = (form.get('invoice_number') as string)?.trim() ?? '';

		const values = {
			customer_name: customerName,
			customer_email: customerEmail,
			description,
			amount: amountRaw,
			invoice_number: invoiceNumber
		};

		const amount = Number(amountRaw);
		if (!amountRaw || !Number.isFinite(amount) || amount <= 0) {
			return { success: false, error: 'Enter an amount greater than $0.', values };
		}
		if (!description) {
			return { success: false, error: 'Add a short description so the client knows what they are paying for.', values };
		}
		if (customerEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) {
			return { success: false, error: 'That email address does not look valid.', values };
		}

		// Auto-generate an invoice number if the rep didn't supply one.
		if (!invoiceNumber) {
			invoiceNumber = 'INV-' + Math.floor(100000 + Math.random() * 900000);
		}

		const { profile } = await locals.safeGetSession();

		// Insert the invoice row first so we have an id to tag the Woo order with.
		const { data: invoice, error: insertErr } = await locals.supabase
			.from('manual_invoices')
			.insert({
				invoice_number: invoiceNumber,
				customer_name: customerName || null,
				customer_email: customerEmail || null,
				description,
				amount,
				created_by: profile?.id ?? null
			})
			.select()
			.single();

		if (insertErr || !invoice) {
			return { success: false, error: insertErr?.message ?? 'Could not save the invoice.', values };
		}

		// Create the pending Woo order (one fee line = the invoice amount) and grab
		// the pay URL. If Woo is unreachable, roll back the row so it doesn't dangle.
		try {
			const { first_name, last_name } = splitName(customerName);
			const { wooOrderId, payUrl } = await createWooOrder({
				bgOrderId: invoice.id,
				bgOrderNumber: invoiceNumber,
				orderType: 'manual_invoice',
				billing: { first_name, last_name, email: customerEmail || undefined },
				items: [{ name: description, quantity: 1, unitPrice: amount }]
			});

			const { data: finalized } = await locals.supabase
				.from('manual_invoices')
				.update({ woo_order_id: String(wooOrderId), pay_url: payUrl })
				.eq('id', invoice.id)
				.select()
				.single();

			return { success: true, invoice: finalized ?? { ...invoice, woo_order_id: String(wooOrderId), pay_url: payUrl } };
		} catch (e) {
			await locals.supabase.from('manual_invoices').delete().eq('id', invoice.id);
			const msg = e instanceof Error ? e.message : 'WooCommerce order creation failed.';
			return { success: false, error: `Could not generate the pay link: ${msg}`, values };
		}
	}
};
