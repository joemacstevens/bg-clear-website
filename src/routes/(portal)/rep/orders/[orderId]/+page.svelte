<script lang="ts">
	import { enhance } from '$app/forms';
	import StatusBadge from '$lib/components/portal/StatusBadge.svelte';
	import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '$lib/utils/statuses';
	import { formatCurrency, formatDateTime } from '$lib/utils/format';
	import { categoryLabel } from '$lib/utils/categories';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const order = $derived(data.order);
	const items = $derived(order.order_items ?? []);
	const subtotal = $derived(items.reduce((s: number, i: any) => s + i.unit_price * i.quantity, 0));
	const totalCommission = $derived(items.reduce((s: number, i: any) => s + (i.commission_amount ?? 0), 0));
</script>

<svelte:head><title>Order {order.order_number} | BG Clear</title></svelte:head>

<div class="order-detail">
	<a href="/rep/orders" class="back-link">← Back to Orders</a>

	<div class="header">
		<div>
			<h1>{order.order_number}</h1>
			<span class="date">Created {formatDateTime(order.created_at)}</span>
		</div>
		<StatusBadge status={order.status} labels={ORDER_STATUS_LABELS} colors={ORDER_STATUS_COLORS} />
	</div>

	<!-- Customer Info -->
	<div class="info-card">
		<h3>Customer</h3>
		<p class="bold">{data.customer?.company_name || data.customer?.full_name}</p>
		{#if data.customer?.email}<p class="muted">{data.customer.email}</p>{/if}
		{#if data.customer?.phone}<p class="muted">{data.customer.phone}</p>{/if}
	</div>

	<!-- Order Items -->
	<div class="table-wrap">
		<table>
			<thead>
				<tr>
					<th>Product</th>
					<th>Category</th>
					<th class="num">Qty</th>
					<th class="num">Unit Price</th>
					<th class="num">BG Cost</th>
					<th class="num">Target</th>
					<th class="num">Line Total</th>
					<th class="num">Commission</th>
				</tr>
			</thead>
			<tbody>
				{#each items as item}
					{@const belowTarget = item.unit_price < item.target_price}
					<tr class:below-target={belowTarget}>
						<td class="product-name">{item.products?.name ?? '—'}</td>
						<td><span class="cat-badge">{categoryLabel(item.products?.category ?? '', true)}</span></td>
						<td class="num">{item.quantity}</td>
						<td class="num mono" class:red={belowTarget}>{formatCurrency(item.unit_price)}</td>
						<td class="num mono muted">{formatCurrency(item.bg_cost)}</td>
						<td class="num mono muted">{formatCurrency(item.target_price)}</td>
						<td class="num mono bold">{formatCurrency(item.unit_price * item.quantity)}</td>
						<td class="num mono commission">{formatCurrency(item.commission_amount ?? 0)}</td>
					</tr>
				{/each}
			</tbody>
			<tfoot>
				<tr>
					<td colspan="6" class="total-label">Totals</td>
					<td class="num mono bold">{formatCurrency(subtotal)}</td>
					<td class="num mono commission bold">{formatCurrency(totalCommission)}</td>
				</tr>
			</tfoot>
		</table>
	</div>

	{#if order.requires_approval}
		<div class="approval-banner" class:approved={order.approval_status === 'approved'} class:rejected={order.approval_status === 'rejected'}>
			{#if order.approval_status === 'pending'}
				This order requires manager approval (pricing below target).
			{:else if order.approval_status === 'approved'}
				Approved by manager.{#if order.approval_notes} Note: {order.approval_notes}{/if}
			{:else}
				Rejected.{#if order.approval_notes} Reason: {order.approval_notes}{/if}
			{/if}
		</div>
	{/if}

	<!-- Status Actions -->
	{#if data.nextStatuses.length > 0}
		<div class="status-actions">
			<h3>Advance Order Status</h3>
			<div class="action-buttons">
				{#each data.nextStatuses as nextStatus}
					<form method="POST" action="?/updateStatus" use:enhance>
						<input type="hidden" name="status" value={nextStatus} />
						<button type="submit" class="btn-primary">
							Mark as {ORDER_STATUS_LABELS[nextStatus] ?? nextStatus}
						</button>
					</form>
				{/each}
			</div>
		</div>
	{/if}
</div>

<style>
	.order-detail { padding-bottom: var(--space-8); }
	.back-link { font-size: var(--text-small); color: var(--color-muted); display: block; margin-bottom: 0.25rem; }
	.header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: var(--space-4); }
	.header h1 { font-family: var(--font-heading); font-size: var(--text-h2); font-weight: 700; margin: 0; }
	.date { font-size: var(--text-small); color: var(--color-muted); }

	.info-card {
		background: var(--color-surface); border: 1px solid var(--color-border); border-radius: var(--radius-md);
		padding: var(--space-3); margin-bottom: var(--space-4);
	}
	.info-card h3 { font-family: var(--font-heading); font-size: 0.8rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: var(--color-muted); margin: 0 0 0.5rem; }
	.info-card p { margin: 0; font-size: var(--text-small); }
	.bold { font-weight: 600; }
	.muted { color: var(--color-muted); }

	.table-wrap {
		overflow-x: auto; background: var(--color-surface); border: 1px solid var(--color-border);
		border-radius: var(--radius-md); margin-bottom: var(--space-4);
	}
	table { width: 100%; border-collapse: collapse; font-size: var(--text-small); }
	th { text-align: left; padding: 0.75rem; border-bottom: 2px solid var(--color-border); font-weight: 600; background: var(--color-border-subtle); white-space: nowrap; }
	td { padding: 0.75rem; border-bottom: 1px solid var(--color-border-subtle); vertical-align: middle; }
	tfoot td { border-top: 2px solid var(--color-border); font-weight: 700; }
	.product-name { font-weight: 500; }
	.num { text-align: right; }
	.mono { font-variant-numeric: tabular-nums; }
	.red { color: #ef4444; }
	.commission { color: #059669; }
	.total-label { text-align: right; }
	.cat-badge { font-size: 0.65rem; font-weight: 600; padding: 0.1rem 0.5rem; border-radius: var(--radius-pill); background: var(--color-border-subtle); white-space: nowrap; }
	tr.below-target { background: #fef3c7; }

	.approval-banner {
		padding: var(--space-2) var(--space-3); border-radius: var(--radius-sm); font-size: var(--text-small); font-weight: 500;
		background: #fef3c7; color: #92400e; margin-bottom: var(--space-4);
	}
	.approval-banner.approved { background: #dcfce7; color: #166534; }
	.approval-banner.rejected { background: #fef2f2; color: #991b1b; }

	.status-actions { margin-top: var(--space-3); }
	.status-actions h3 { font-family: var(--font-heading); font-size: var(--text-small); font-weight: 600; margin: 0 0 var(--space-2); }
	.action-buttons { display: flex; gap: var(--space-2); }
	.btn-primary {
		padding: 0.5rem 1.25rem; background: var(--color-primary); color: white; border: none;
		border-radius: var(--radius-sm); font-size: var(--text-small); font-weight: 600;
		font-family: var(--font-heading); cursor: pointer;
	}
	.btn-primary:hover { background: var(--color-primary-dark); }
</style>
