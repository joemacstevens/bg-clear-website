import type { PageServerLoad, Actions } from './$types';
import { fail } from '@sveltejs/kit';
import { createSupabaseAdminClient } from '$lib/server/supabase-admin';
import { sendCustomerInvite } from '$lib/server/email';
import crypto from 'node:crypto';

export const load: PageServerLoad = async ({ locals }) => {
	const { profile } = await locals.safeGetSession();

	const { data: customers } = await locals.supabase
		.from('profiles')
		.select('*')
		.eq('assigned_rep_id', profile?.id ?? '')
		.order('company_name');

	return { customers: customers ?? [] };
};

export const actions: Actions = {
	// Staff (rep/manager/admin) create a customer account on the customer's
	// behalf — e.g. a rep closing in person. Uses the admin client to create the
	// auth user (the handle_new_user trigger makes the base profile), then fills
	// in company/phone and assigns the customer to the creating rep.
	createCustomer: async ({ request, locals, url }) => {
		const { profile } = await locals.safeGetSession();
		if (!profile || !['sales_rep', 'manager', 'admin'].includes(profile.role ?? '')) {
			return fail(403, { error: 'Not allowed' });
		}

		const form = await request.formData();
		const email = String(form.get('email') ?? '').trim().toLowerCase();
		const fullName = String(form.get('full_name') ?? '').trim();
		const company = String(form.get('company_name') ?? '').trim();
		const phone = String(form.get('phone') ?? '').trim();

		const values = { email, full_name: fullName, company_name: company, phone };
		if (!email || !fullName) {
			return fail(400, { error: 'Customer name and email are required.', values });
		}

		const admin = createSupabaseAdminClient();
		// Temporary password to hand to the customer; they can reset it later.
		const tempPassword = 'Bg' + crypto.randomBytes(6).toString('base64url') + '#7';

		const { data: created, error: createErr } = await admin.auth.admin.createUser({
			email,
			password: tempPassword,
			email_confirm: true,
			user_metadata: { full_name: fullName }
		});

		if (createErr || !created?.user) {
			return fail(400, { error: createErr?.message ?? 'Could not create the account.', values });
		}

		// The trigger created the base profile (id, email, full_name, role=customer).
		// Fill in the rest and assign to the creating rep (reps own their customers;
		// admin/manager-created customers are left unassigned for routing).
		const { error: updErr } = await admin
			.from('profiles')
			.update({
				company_name: company || null,
				phone: phone || null,
				assigned_rep_id: profile.role === 'sales_rep' ? profile.id : null
			})
			.eq('id', created.user.id);

		if (updErr) {
			return fail(500, { error: `Account created, but saving details failed: ${updErr.message}`, values });
		}

		// Email the customer their invite + temp password. Fire-and-forget; the
		// temp password is also shown to staff in case email isn't configured yet.
		let emailed = false;
		try {
			const result = await sendCustomerInvite({ to: email, origin: url.origin, fullName, tempPassword });
			emailed = !result.skipped && !result.error;
		} catch (e) {
			console.error('[notify] customer invite email failed', e);
		}

		return { success: true, createdEmail: email, tempPassword, createdId: created.user.id, emailed };
	}
};
