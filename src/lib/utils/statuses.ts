import type { OrderStatus } from '$lib/database.types';

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
	quote_requested: 'Quote Requested',
	quote_sent: 'Quote Sent',
	customer_accepted: 'Customer Accepted',
	pending_approval: 'Pending Approval',
	approved: 'Approved',
	placed_with_supplier: 'Placed with Supplier',
	shipped: 'Shipped',
	delivered: 'Delivered',
	payment_collected: 'Payment Collected',
	commission_paid: 'Commission Paid',
	cancelled: 'Cancelled'
};

export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
	quote_requested: '#f59e0b',
	quote_sent: '#3b82f6',
	customer_accepted: '#10b981',
	pending_approval: '#f97316',
	approved: '#22c55e',
	placed_with_supplier: '#6366f1',
	shipped: '#8b5cf6',
	delivered: '#059669',
	payment_collected: '#047857',
	commission_paid: '#065f46',
	cancelled: '#ef4444'
};

export const QUOTE_STATUS_LABELS: Record<string, string> = {
	pending: 'Pending',
	in_progress: 'In Progress',
	pending_approval: 'Pending Approval',
	quoted: 'Quoted',
	accepted: 'Accepted',
	declined: 'Declined',
	cancelled: 'Cancelled'
};

export const QUOTE_STATUS_COLORS: Record<string, string> = {
	pending: '#f59e0b',
	in_progress: '#3b82f6',
	pending_approval: '#f97316',
	quoted: '#6366f1',
	accepted: '#22c55e',
	declined: '#ef4444',
	cancelled: '#ef4444'
};
