<script lang="ts">
	import type { PageData } from './$types';
	import StatusBadge from '$lib/components/portal/StatusBadge.svelte';
	import EmptyState from '$lib/components/portal/EmptyState.svelte';
	import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '$lib/utils/statuses';
	import { formatDate, formatCurrency, formatOrderNumber } from '$lib/utils/format';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>Order History | BG Clear</title>
</svelte:head>

<div class="orders-page">
	<div class="page-header">
		<a href="/catalog" class="back-link">&larr; Back to Catalog</a>
		<h1>Order History</h1>
		<p>Track the status of your orders.</p>
	</div>

	{#if data.orders.length === 0}
		<EmptyState
			message="No orders yet. Once your quotes are accepted and processed, orders will appear here."
			actionLabel="View Quotes"
			actionHref="/catalog/quotes"
		/>
	{:else}
		<div class="orders-list">
			{#each data.orders as order}
				<a href="/catalog/orders/{order.id}" class="order-card">
					<div class="order-header">
						<div class="order-id">
							<strong>{formatOrderNumber(order.order_number)}</strong>
							<span class="order-date">{formatDate(order.created_at)}</span>
						</div>
						<StatusBadge
							status={order.status}
							labels={ORDER_STATUS_LABELS}
							colors={ORDER_STATUS_COLORS}
						/>
					</div>
					<div class="order-body">
						<span class="order-items">
							{order.order_items?.length ?? 0} item{(order.order_items?.length ?? 0) !== 1 ? 's' : ''}
						</span>
						{#if order.subtotal != null}
							<span class="order-total">{formatCurrency(order.subtotal)}</span>
						{/if}
					</div>
				</a>
			{/each}
		</div>
	{/if}
</div>

<style>
	.orders-page {
		padding-bottom: var(--space-8);
	}

	.page-header {
		margin-bottom: var(--space-5);
	}

	.back-link {
		display: inline-block;
		margin-bottom: var(--space-2);
		color: var(--color-primary);
		font-size: var(--text-small);
		font-weight: 500;
		text-decoration: none;
	}

	.back-link:hover {
		text-decoration: underline;
	}

	.page-header h1 {
		font-family: var(--font-heading);
		font-size: var(--text-h2);
		font-weight: 700;
		color: var(--color-ink);
		margin: 0 0 var(--space-1);
	}

	.page-header p {
		color: var(--color-muted);
		margin: 0;
	}

	.orders-list {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	.order-card {
		display: block;
		padding: var(--space-3) var(--space-4);
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		text-decoration: none;
		transition: box-shadow 0.15s, border-color 0.15s;
	}

	.order-card:hover {
		box-shadow: var(--shadow-sm);
		border-color: var(--color-primary);
	}

	.order-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: var(--space-1);
	}

	.order-id strong {
		color: var(--color-ink);
		font-family: var(--font-heading);
	}

	.order-date {
		margin-left: var(--space-2);
		font-size: var(--text-small);
		color: var(--color-muted);
	}

	.order-body {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.order-items {
		font-size: var(--text-small);
		color: var(--color-muted);
	}

	.order-total {
		font-weight: 600;
		color: var(--color-ink);
	}
</style>
