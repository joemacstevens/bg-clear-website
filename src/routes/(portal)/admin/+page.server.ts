import { redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const { data: products } = await locals.supabase
		.from('products')
		.select('*')
		.order('category')
		.order('name');

	const { data: pricingRules } = await locals.supabase
		.from('category_pricing_rules')
		.select('*')
		.order('category');

	return {
		products: products ?? [],
		pricingRules: pricingRules ?? []
	};
};

export const actions: Actions = {
	addProduct: async ({ request, locals }) => {
		const form = await request.formData();
		const { error } = await locals.supabase.from('products').insert({
			name: form.get('name') as string,
			description: form.get('description') as string,
			category: form.get('category') as string,
			vendor_name: form.get('vendor_name') as string,
			vendor_sku: form.get('vendor_sku') as string || null,
			vendor_cost: parseFloat(form.get('vendor_cost') as string),
			sku: form.get('sku') as string || null,
			is_active: true
		});
		if (error) return { success: false, error: error.message };
		return { success: true };
	},

	toggleProduct: async ({ request, locals }) => {
		const form = await request.formData();
		const id = form.get('id') as string;
		const is_active = form.get('is_active') === 'true';
		await locals.supabase.from('products').update({ is_active: !is_active }).eq('id', id);
		return { success: true };
	},

	deleteProduct: async ({ request, locals }) => {
		const form = await request.formData();
		const id = form.get('id') as string;
		await locals.supabase.from('products').delete().eq('id', id);
		return { success: true };
	}
};
