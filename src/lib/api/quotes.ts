import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '$lib/database.types';

export async function getQuoteRequests(supabase: SupabaseClient<Database>, filters: { customerId?: string; repId?: string; status?: string } = {}) {
	let query = supabase
		.from('quote_requests')
		.select('*, quote_request_items(*, products(id, name, category, image_url))')
		.order('created_at', { ascending: false });

	if (filters.customerId) query = query.eq('customer_id', filters.customerId);
	if (filters.repId) query = query.eq('assigned_rep_id', filters.repId);
	if (filters.status) query = query.eq('status', filters.status);

	return query;
}

export async function getQuoteRequestById(supabase: SupabaseClient<Database>, id: string) {
	return supabase
		.from('quote_requests')
		.select('*, quote_request_items(*, products(id, name, category, vendor_name, image_url, specs))')
		.eq('id', id)
		.single();
}

export async function createQuoteRequest(
	supabase: SupabaseClient<Database>,
	customerId: string,
	assignedRepId: string | null,
	items: { productId: string; quantity: number }[]
) {
	const { data: quote, error: quoteError } = await supabase
		.from('quote_requests')
		.insert({ customer_id: customerId, assigned_rep_id: assignedRepId, status: 'pending' })
		.select()
		.single();

	if (quoteError || !quote) return { data: null, error: quoteError };

	const itemRows = items.map((item) => ({
		quote_request_id: quote.id,
		product_id: item.productId,
		quantity: item.quantity
	}));

	const { error: itemsError } = await supabase.from('quote_request_items').insert(itemRows);

	if (itemsError) return { data: null, error: itemsError };

	return { data: quote, error: null };
}

export async function updateQuoteStatus(supabase: SupabaseClient<Database>, id: string, status: string) {
	return supabase.from('quote_requests').update({ status }).eq('id', id);
}

export async function setQuotedPrice(supabase: SupabaseClient<Database>, itemId: string, quotedPrice: number) {
	return supabase.from('quote_request_items').update({ quoted_price: quotedPrice }).eq('id', itemId);
}
