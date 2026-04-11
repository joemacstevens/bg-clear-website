import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url, locals }) => {
	const actionFilter = url.searchParams.get('action');
	const entityFilter = url.searchParams.get('entityType');
	const dateFrom = url.searchParams.get('dateFrom');
	const dateTo = url.searchParams.get('dateTo');
	const page = parseInt(url.searchParams.get('page') || '1', 10);
	const limit = 50;
	const offset = (page - 1) * limit;

	let query = locals.supabase
		.from('audit_log')
		.select('*, profiles(full_name, email)', { count: 'exact' })
		.order('created_at', { ascending: false })
		.range(offset, offset + limit - 1);

	if (actionFilter) query = query.eq('action', actionFilter);
	if (entityFilter) query = query.eq('entity_type', entityFilter);
	if (dateFrom) query = query.gte('created_at', `${dateFrom}T00:00:00Z`);
	if (dateTo) query = query.lte('created_at', `${dateTo}T23:59:59Z`);

	const { data: logs, count, error } = await query;

	if (error) {
		console.error('Error fetching audit logs:', error);
	}

	// Fetch distinct actions and entities for filters
	const { data: filterData } = await locals.supabase
		.from('audit_log')
		.select('action, entity_type');

	const uniqueActions = [...new Set(filterData?.map(d => d.action) || [])].sort();
	const uniqueEntities = [...new Set(filterData?.map(d => d.entity_type) || [])].sort();

	return {
		logs: logs || [],
		totalCount: count || 0,
		page,
		limit,
		totalPages: Math.ceil((count || 0) / limit),
		uniqueActions,
		uniqueEntities,
		filters: {
			action: actionFilter || '',
			entityType: entityFilter || '',
			dateFrom: dateFrom || '',
			dateTo: dateTo || ''
		}
	};
};
