<script lang="ts">
	import StatusBadge from '$lib/components/portal/StatusBadge.svelte';
	import EmptyState from '$lib/components/portal/EmptyState.svelte';
	import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '$lib/utils/statuses';
	import { formatCurrency, formatDate } from '$lib/utils/format';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	function orderTotal(order: any) {
		return (order.order_items ?? []).reduce((s: number, i: any) => s + (i.unit_price * i.quantity), 0);
	}

	function orderCommission(order: any) {
		return (order.order_items ?? []).reduce((s: number, i: any) => s + (i.commission_amount ?? 0), 0);
	}
</script>

<svelte:head><title>Orders | BG Clear</title></svelte:head>

<div class="orders-page">
	<h1>Orders</h1>

	<div class="status-pills">
		<a href="/rep/orders" class="pill" class:active={!data.statusFilter}>All</a>
		{#each ['pending_approval', 'approved', 'placed_with_supplier', 'shipped', 'delivered', 'payment_collected'] as s}
			<a href="/rep/orders?status={s}" class="pill" class:active={data.statusFilter === s}>
				{ORDER_STATUS_LABELS[s]?.split(' ').slice(0,2).join(' ') ?? s}
			</a>
		{/each}
	</div>

	{#if data.orders.length === 0}
		<EmptyState message="No orders found. Orders are created from accepted quotes." />
	{:else}
		<div class="orders-list">
			{#each data.orders as order}
				{@const customer = (order as any).profiles}
				<a href="/rep/orders/{order.id}" class="order-card">
					<div class="order-left">
						<span class="order-number">{order.order_number}</span>
						<span class="customer">{customer?.company_name || customer?.full_name || '—'}</span>
					</div>
					<div class="order-center">
						<StatusBadge status={order.status} labels={ORDER_STATUS_LABELS} colors={ORDER_STATUS_COLORS} />
						<span class="item-count">{order.order_items?.length ?? 0} items</span>
					</div>
					<div class="order-right">
						<span class="order-total">{formatCurrency(orderTotal(order))}</span>
						<span class="commission">Comm: {formatCurrency(orderCommission(order))}</span>
						<span class="order-date">{formatDate(order.created_at)}</span>
					</div>
				</a>
			{/each}
		</div>
	{/if}
</div>

<style>
	.orders-page h1 { font-family: var(--font-heading); font-size: var(--text-h2); font-weight: 700; margin: 0 0 var(--space-4); }
	.status-pills { display: flex; gap: 0.375rem; flex-wrap: wrap; margin-bottom: var(--space-4); }
	.pill {
		padding: 0.3rem 0.75rem; border-radius: var(--radius-pill); font-size: 0.75rem; font-weight: 500;
		color: var(--color-muted); background: var(--color-surface); border: 1px solid var(--color-border);
		text-decoration: none; transition: all 0.15s;
	}
	.pill:hover { border-color: var(--color-primary); color: var(--color-primary); }
	.pill.active { background: var(--color-primary); color: white; border-color: var(--color-primary); }
	.orders-list { display: flex; flex-direction: column; gap: 0.5rem; }
	.order-card {
		display: flex; justify-content: space-between; align-items: center; padding: var(--space-3);
		background: var(--color-surface); border: 1px solid var(--color-border); border-radius: var(--radius-md);
		text-decoration: none; color: inherit; transition: all 0.15s;
	}
	.order-card:hover { box-shadow: var(--shadow-sm); border-color: var(--color-primary); }
	.order-left { display: flex; flex-direction: column; }
	.order-number { font-weight: 700; font-family: var(--font-heading); font-size: var(--text-small); }
	.customer { font-size: 0.75rem; color: var(--color-muted); }
	.order-center { display: flex; align-items: center; gap: var(--space-2); }
	.item-count { font-size: 0.75rem; color: var(--color-muted); }
	.order-right { text-align: right; display: flex; flex-direction: column; gap: 0.125rem; }
	.order-total { font-weight: 600; font-variant-numeric: tabular-nums; }
	.commission { font-size: 0.75rem; color: #059669; }
	.order-date { font-size: 0.75rem; color: var(--color-muted); }
</style>
