import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const [
		{ count: productCount },
		{ count: activeOrderCount },
		{ count: pendingApprovalCount },
		{ data: recentOrders },
		{ data: auditEntries }
	] = await Promise.all([
		locals.supabase.from('products').select('*', { count: 'exact', head: true }),
		locals.supabase.from('orders').select('*', { count: 'exact', head: true }).not('status', 'in', '(cancelled,commission_paid,delivered)'),
		locals.supabase.from('orders').select('*', { count: 'exact', head: true }).eq('requires_approval', true).eq('approval_status', 'pending'),
		locals.supabase.from('orders').select('subtotal').not('subtotal', 'is', null),
		locals.supabase.from('audit_log').select('*').order('created_at', { ascending: false }).limit(10)
	]);

	const totalRevenue = (recentOrders ?? []).reduce((sum, o) => sum + (o.subtotal ?? 0), 0);

	return {
		productCount: productCount ?? 0,
		activeOrderCount: activeOrderCount ?? 0,
		pendingApprovalCount: pendingApprovalCount ?? 0,
		totalRevenue,
		auditEntries: auditEntries ?? []
	};
};
