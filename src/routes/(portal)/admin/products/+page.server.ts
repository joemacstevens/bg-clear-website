import { error, fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { getProducts, createProduct, updateProduct, deleteProduct, toggleProductActive } from '$lib/api/products';
import { logAuditEvent } from '$lib/api/audit';

export const load: PageServerLoad = async ({ locals }) => {
	const [productsRes, pricingRulesRes] = await Promise.all([
		getProducts(locals.supabase, { activeOnly: false }),
		locals.supabase.from('category_pricing_rules').select('*')
	]);

	if (productsRes.error) {
		console.error('Error loading products:', productsRes.error);
	}
	if (pricingRulesRes.error) {
		console.error('Error loading pricing rules:', pricingRulesRes.error);
	}

	return {
		products: productsRes.data ?? [],
		pricingRules: pricingRulesRes.data ?? []
	};
};

export const actions: Actions = {
	addProduct: async ({ request, locals }) => {
		const form = await request.formData();
		const name = form.get('name') as string;
		const category = form.get('category') as any;
		const vendor_name = form.get('vendor_name') as string;
		const vendor_cost = parseFloat(form.get('vendor_cost') as string);
		const vendor_sku = form.get('vendor_sku') as string;
		const sku = form.get('sku') as string;
		const description = form.get('description') as string;
		const image_url = form.get('image_url') as string;

		if (!name || !category || !vendor_name || isNaN(vendor_cost)) {
			return fail(400, { error: 'Missing required fields' });
		}

		const data = {
			name,
			category,
			vendor_name,
			vendor_cost,
			vendor_sku: vendor_sku || null,
			sku: sku || null,
			description: description || null,
			image_url: image_url || null,
			is_active: true
		};

		const { data: product, error: insertError } = await createProduct(locals.supabase, data);

		if (insertError) {
			console.error('Error creating product:', insertError);
			return fail(500, { error: 'Failed to create product' });
		}

		await logAuditEvent(
			locals.supabase,
			locals.user?.id ?? '',
			'create',
			'product',
			product.id,
			{ name: product.name, sku: product.sku }
		);

		return { success: true };
	},

	updateProduct: async ({ request, locals }) => {
		const form = await request.formData();
		const id = form.get('id') as string;
		const name = form.get('name') as string;
		const category = form.get('category') as any;
		const vendor_name = form.get('vendor_name') as string;
		const vendor_cost = parseFloat(form.get('vendor_cost') as string);
		const vendor_sku = form.get('vendor_sku') as string;
		const sku = form.get('sku') as string;
		const description = form.get('description') as string;
		const image_url = form.get('image_url') as string;

		if (!id || !name || !category || !vendor_name || isNaN(vendor_cost)) {
			return fail(400, { error: 'Missing required fields' });
		}

		const data = {
			name,
			category,
			vendor_name,
			vendor_cost,
			vendor_sku: vendor_sku || null,
			sku: sku || null,
			description: description || null,
			image_url: image_url || null
		};

		const { error: updateError, data: product } = await updateProduct(locals.supabase, id, data);

		if (updateError) {
			console.error('Error updating product:', updateError);
			return fail(500, { error: 'Failed to update product' });
		}

		await logAuditEvent(
			locals.supabase,
			locals.user?.id ?? '',
			'update',
			'product',
			id,
			{ name }
		);

		return { success: true };
	},

	toggleProduct: async ({ request, locals }) => {
		const form = await request.formData();
		const id = form.get('id') as string;
		const is_active = form.get('is_active') === 'true';

		if (!id) return fail(400, { error: 'Missing product ID' });

		const { error: updateError } = await toggleProductActive(locals.supabase, id, is_active);

		if (updateError) {
			console.error('Error toggling product:', updateError);
			return fail(500, { error: 'Failed to toggle product status' });
		}

		await logAuditEvent(
			locals.supabase,
			locals.user?.id ?? '',
			'status_change',
			'product',
			id,
			{ is_active: !is_active }
		);

		return { success: true };
	},

	deleteProduct: async ({ request, locals }) => {
		const form = await request.formData();
		const id = form.get('id') as string;

		if (!id) return fail(400, { error: 'Missing product ID' });

		const { error: deleteError } = await deleteProduct(locals.supabase, id);

		if (deleteError) {
			console.error('Error deleting product:', deleteError);
			return fail(500, { error: 'Failed to delete product' });
		}

		await logAuditEvent(
			locals.supabase,
			locals.user?.id ?? '',
			'delete',
			'product',
			id,
			{}
		);

		return { success: true };
	}
};