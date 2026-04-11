import { fail, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { logAuditEvent } from '$lib/api/audit';

export const load: PageServerLoad = async ({ locals }) => {
	const { data: rules, error } = await locals.supabase
		.from('category_pricing_rules')
		.select('*')
		.order('category');

	if (error) {
		console.error('Error fetching pricing rules:', error);
		return { rules: [] };
	}

	return { rules };
};

export const actions: Actions = {
	update: async ({ request, locals }) => {
		const session = await locals.safeGetSession();
		if (!session.user) return fail(401, { error: 'Unauthorized' });

		const form = await request.formData();
		const id = form.get('id') as string;
		const category = form.get('category') as string;

		const ruleData = {
			margin_reserve_min: parseFloat(form.get('margin_reserve_min') as string),
			margin_reserve_default: parseFloat(form.get('margin_reserve_default') as string),
			margin_reserve_max: parseFloat(form.get('margin_reserve_max') as string),
			
			markup_to_target_min: parseFloat(form.get('markup_to_target_min') as string),
			markup_to_target_default: parseFloat(form.get('markup_to_target_default') as string),
			markup_to_target_max: parseFloat(form.get('markup_to_target_max') as string),
			
			suggested_premium_min: parseFloat(form.get('suggested_premium_min') as string),
			suggested_premium_default: parseFloat(form.get('suggested_premium_default') as string),
			suggested_premium_max: parseFloat(form.get('suggested_premium_max') as string),

			commission_at_target: parseFloat(form.get('commission_at_target') as string),
			commission_above_target: parseFloat(form.get('commission_above_target') as string),
		};

		// Validation: min <= default <= max
		if (ruleData.margin_reserve_min > ruleData.margin_reserve_default || ruleData.margin_reserve_default > ruleData.margin_reserve_max) {
			return fail(400, { error: 'Margin Reserve must follow: Min <= Default <= Max' });
		}
		if (ruleData.markup_to_target_min > ruleData.markup_to_target_default || ruleData.markup_to_target_default > ruleData.markup_to_target_max) {
			return fail(400, { error: 'Markup to Target must follow: Min <= Default <= Max' });
		}
		if (ruleData.suggested_premium_min > ruleData.suggested_premium_default || ruleData.suggested_premium_default > ruleData.suggested_premium_max) {
			return fail(400, { error: 'Suggested Premium must follow: Min <= Default <= Max' });
		}

		const { error } = await locals.supabase
			.from('category_pricing_rules')
			.update(ruleData)
			.eq('id', id);

		if (error) {
			return fail(500, { error: error.message });
		}

		await logAuditEvent(
			locals.supabase,
			session.user.id,
			'update_pricing_rule',
			'category_pricing_rules',
			id,
			{ category, updated_fields: ruleData }
		);

		return { success: true };
	}
};
