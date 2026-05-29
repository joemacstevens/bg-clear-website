import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '$lib/database.types';

type WithCustomerId = { id: string; customer_id: string; created_at: string };

/**
 * Attaches an `isNewCustomer` flag to each row in `rows` by checking
 * whether the row's customer has any earlier `quote_requests`.
 *
 * Page-scoped: only customer_ids present in `rows` are queried, so this
 * is a single round-trip regardless of dataset size.
 */
export async function enrichWithNewCustomerFlag<R extends WithCustomerId>(
	supabase: SupabaseClient<Database>,
	rows: R[]
): Promise<Array<R & { isNewCustomer: boolean }>> {
	if (!rows.length) return [];

	const customerIds = Array.from(new Set(rows.map((r) => r.customer_id)));

	const { data: priorQuotes } = await supabase
		.from('quote_requests')
		.select('id, customer_id, created_at')
		.in('customer_id', customerIds);

	const priors = priorQuotes ?? [];

	return rows.map((r) => {
		const earlier = priors.find(
			(p: any) =>
				p.customer_id === r.customer_id &&
				p.id !== r.id &&
				p.created_at < r.created_at
		);
		return { ...r, isNewCustomer: !earlier };
	});
}
