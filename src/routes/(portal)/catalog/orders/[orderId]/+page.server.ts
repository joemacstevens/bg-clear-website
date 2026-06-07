import type { PageServerLoad, Actions } from './$types';
import { error, fail, redirect } from '@sveltejs/kit';
import { getOrderById } from '$lib/api/orders';
import { createSupabaseAdminClient } from '$lib/server/supabase-admin';
import { createWooOrder, getWooOrderPayUrl } from '$lib/server/woocommerce';

export const load: PageServerLoad = async ({ locals, params }) => {
	const { data: order, error: err } = await getOrderById(locals.supabase, params.orderId);

	if (err || !order) {
		throw error(404, 'Order not found');
	}

	return { order };
};

// Statuses where an unpaid order can still be paid (must match the order page UI).
const PAYABLE = ['approved', 'placed_with_supplier', 'shipped', 'delivered'];

export const actions: Actions = {
	// Hand off to WooCommerce for payment. Creates (or re-uses) a pending Woo
	// order from this BG Clear order and redirects to the Woo/CyberSource pay page.
	payNow: async ({ locals, params }) => {
		const { profile } = await locals.safeGetSession();
		if (!profile) return fail(401, { error: 'Not signed in' });

		const admin = createSupabaseAdminClient();

		const { data: order, error: orderErr } = await admin
			.from('orders')
			.select('*, order_items(*, products(id, name, image_url))')
			.eq('id', params.orderId)
			.single();

		if (orderErr || !order) return fail(404, { error: 'Order not found' });
		if (order.customer_id !== profile.id) return fail(403, { error: 'Not your order' });
		if (order.payment_collected) return fail(400, { error: 'This order is already paid' });
		if (!PAYABLE.includes(order.status)) {
			return fail(400, { error: 'This order is not ready for payment yet.' });
		}

		// If we already created a Woo order, reuse its pay URL (no duplicates).
		if (order.woo_order_id) {
			const existing = await getWooOrderPayUrl(order.woo_order_id);
			if (existing) throw redirect(303, existing);
		}

		// Billing details from the customer profile.
		const [firstName, ...rest] = (profile.full_name ?? '').trim().split(/\s+/);
		const billing = {
			first_name: firstName || undefined,
			last_name: rest.join(' ') || undefined,
			email: profile.email ?? undefined,
			phone: profile.phone ?? undefined,
			company: profile.company_name ?? undefined
		};

		const items = (order.order_items ?? []).map((it: any) => ({
			name: it.products?.name ?? 'Item',
			quantity: it.quantity,
			unitPrice: it.unit_price,
			imageUrl: it.products?.image_url ?? null,
			bgProductId: it.products?.id
		}));

		let payUrl: string;
		let wooOrderId: number;
		try {
			const result = await createWooOrder({
				bgOrderId: order.id,
				bgOrderNumber: order.order_number,
				billing,
				items
			});
			payUrl = result.payUrl;
			wooOrderId = result.wooOrderId;
		} catch (e: any) {
			return fail(502, { error: e?.message ?? 'Could not reach the payment provider' });
		}

		await admin
			.from('orders')
			.update({ woo_order_id: String(wooOrderId) })
			.eq('id', order.id);

		throw redirect(303, payUrl);
	}
};
