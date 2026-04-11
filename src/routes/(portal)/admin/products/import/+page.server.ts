import { fail } from '@sveltejs/kit';
import type { Actions } from './$types';
import { logAuditEvent } from '$lib/api/audit';

const ALLOWED_FIELDS = [
	'name', 'description', 'category', 'sku',
	'vendor_name', 'vendor_sku', 'vendor_cost',
	'image_url', 'image_urls', 'specs',
	'is_active', 'is_featured',
	'margin_reserve_pct', 'markup_to_target_pct', 'suggested_premium_pct'
];

const REQUIRED_FIELDS = ['name', 'category', 'vendor_name', 'vendor_cost'];

function validateProduct(p: unknown, index: number): string | null {
	if (typeof p !== 'object' || p === null || Array.isArray(p)) {
		return `Item ${index + 1}: must be an object`;
	}
	const obj = p as Record<string, unknown>;
	for (const field of REQUIRED_FIELDS) {
		if (obj[field] == null || obj[field] === '') {
			return `Item ${index + 1}: missing required field "${field}"`;
		}
	}
	if (typeof obj.vendor_cost !== 'number' || obj.vendor_cost <= 0) {
		return `Item ${index + 1} ("${obj.name}"): vendor_cost must be a positive number`;
	}
	return null;
}

function sanitizeProduct(p: Record<string, unknown>): Record<string, unknown> {
	return Object.fromEntries(
		Object.entries(p).filter(([k]) => ALLOWED_FIELDS.includes(k))
	);
}

export const actions: Actions = {
	bulkInsert: async ({ request, locals }) => {
		const form = await request.formData();
		const productsJson = form.get('products') as string;

		if (!productsJson) {
			return fail(400, { error: 'No products data provided' });
		}

		let products: unknown[];
		try {
			products = JSON.parse(productsJson);
		} catch (e) {
			return fail(400, { error: 'Invalid products data format' });
		}

		if (!Array.isArray(products) || products.length === 0) {
			return fail(400, { error: 'Empty products list' });
		}

		// Validate each product
		for (let i = 0; i < products.length; i++) {
			const err = validateProduct(products[i], i);
			if (err) return fail(400, { error: err });
		}

		// Strip unknown fields to prevent injection
		const sanitized = products.map((p) => sanitizeProduct(p as Record<string, unknown>));

		const { data, error: insertError } = await locals.supabase
			.from('products')
			.insert(sanitized)
			.select();

		if (insertError) {
			console.error('Error in bulk insert:', insertError);
			return fail(500, { error: `Failed to import products: ${insertError.message}` });
		}

		const { user } = await locals.safeGetSession();
		await logAuditEvent(
			locals.supabase,
			user?.id ?? '',
			'bulk_create',
			'product',
			null,
			{ count: sanitized.length }
		);

		return { success: true, count: sanitized.length };
	}
};
