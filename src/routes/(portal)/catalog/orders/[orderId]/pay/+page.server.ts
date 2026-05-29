import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { buildSignedPaymentRequest } from '$lib/server/integrations/cybersource';

export const load: PageServerLoad = async ({ params, locals }) => {
	const { user } = await locals.safeGetSession();
	if (!user) throw redirect(303, '/login?redirect=/catalog/orders/' + params.orderId);

	const { data: order, error: orderErr } = await locals.supabase
		.from('orders')
		.select('id, order_number, customer_id, status, subtotal, payment_collected')
		.eq('id', params.orderId)
		.single();

	if (orderErr || !order) throw error(404, 'Order not found');
	if (order.customer_id !== user.id) throw error(403, 'Not your order');
	if (order.payment_collected) throw redirect(303, `/catalog/orders/${params.orderId}`);

	// Same gate as the "Pay Invoice" button on the order detail page.
	const blockedStatuses = [
		'quote_requested',
		'quote_sent',
		'customer_accepted',
		'pending_approval',
		'cancelled'
	];
	if (blockedStatuses.includes(order.status)) {
		throw error(400, 'This order is not yet ready for payment');
	}

	const subtotal = Number(order.subtotal ?? 0);
	const amountCents = Math.round(subtotal * 100);
	if (!Number.isFinite(amountCents) || amountCents <= 0) {
		throw error(400, 'Order total is invalid');
	}

	// Customer email comes from the profile, not from the auth user — the
	// auth.users email could be a personal address while the billing email
	// belongs to the company.
	const { data: profile } = await locals.supabase
		.from('profiles')
		.select('email')
		.eq('id', user.id)
		.single();

	const customerEmail = profile?.email ?? user.email ?? '';

	const form = buildSignedPaymentRequest({
		orderNumber: order.order_number,
		amountCents,
		currency: 'USD',
		customerEmail,
		customerId: user.id
	});

	return {
		orderNumber: order.order_number,
		amountCents,
		formAction: form.formAction,
		fields: form.fields
	};
};
