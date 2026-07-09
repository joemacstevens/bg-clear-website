import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { createSupabaseAdminClient } from '$lib/server/supabase-admin';

// Public, unauthenticated branded pay page. The invoice id (a v4 uuid) is the
// bearer token in the URL. RLS blocks anon reads, so we fetch with the
// service-role admin client and expose ONLY the fields a payer needs — never
// the client email or internal ids.
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const load: PageServerLoad = async ({ params }) => {
	if (!UUID_RE.test(params.token)) throw error(404, 'Invoice not found');

	const admin = createSupabaseAdminClient();
	const { data: invoice } = await admin
		.from('manual_invoices')
		.select('id, invoice_number, description, amount, status, pay_url, customer_name')
		.eq('id', params.token)
		.maybeSingle();

	if (!invoice) throw error(404, 'Invoice not found');

	return { invoice };
};
