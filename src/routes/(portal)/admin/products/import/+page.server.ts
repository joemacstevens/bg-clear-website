import { fail } from '@sveltejs/kit';
import type { Actions } from './$types';
import { logAuditEvent } from '$lib/api/audit';

export const actions: Actions = {
	bulkInsert: async ({ request, locals }) => {
		const form = await request.formData();
		const productsJson = form.get('products') as string;

		if (!productsJson) {
			return fail(400, { error: 'No products data provided' });
		}

		let products = [];
		try {
			products = JSON.parse(productsJson);
		} catch (e) {
			return fail(400, { error: 'Invalid products data format' });
		}

		if (!Array.isArray(products) || products.length === 0) {
			return fail(400, { error: 'Empty products list' });
		}

		// Insert multiple products
		const { data, error: insertError } = await locals.supabase
			.from('products')
			.insert(products)
			.select();

		if (insertError) {
			console.error('Error in bulk insert:', insertError);
			return fail(500, { error: 'Failed to import products' });
		}

		await logAuditEvent(
			locals.supabase,
			locals.user?.id ?? '',
			'bulk_create',
			'product',
			null,
			{ count: products.length }
		);

		return { success: true, count: products.length };
	}
};
