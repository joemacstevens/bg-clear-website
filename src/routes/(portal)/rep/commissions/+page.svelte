<script lang="ts">
	import StatCard from '$lib/components/portal/StatCard.svelte';
	import StatusBadge from '$lib/components/portal/StatusBadge.svelte';
	import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '$lib/utils/statuses';
	import { formatCurrency, formatDate } from '$lib/utils/format';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head><title>Commissions | BG Clear</title></svelte:head>

<div class="commissions-page">
	<h1>Commission Dashboard</h1>

	<div class="stats-grid">
		<StatCard value={formatCurrency(data.totals.earned)} label="Earned (Awaiting Payout)" color="#059669" />
		<StatCard value={formatCurrency(data.totals.pending)} label="Pending (In Progress)" color="#f59e0b" />
		<StatCard value={formatCurrency(data.totals.paid)} label="Paid Out" color="#6366f1" />
		<StatCard value={formatCurrency(data.totals.total)} label="Total All-Time" />
	</div>

	<div class="section">
		<h2>Commission by Order</h2>
		<div class="table-wrap">
			<table>
				<thead>
					<tr>
						<th>Order</th>
						<th>Status</th>
						<th>Date</th>
						<th class="num">Items</th>
						<th class="num">Revenue</th>
						<th class="num">Commission</th>
					</tr>
				</thead>
				<tbody>
					{#each data.orders as order}
						<tr>
							<td><a href="/rep/orders/{order.id}" class="order-link">{order.orderNumber}</a></td>
							<td><StatusBadge status={order.status} labels={ORDER_STATUS_LABELS} colors={ORDER_STATUS_COLORS} /></td>
							<td class="muted">{formatDate(order.date)}</td>
							<td class="num">{order.items}</td>
							<td class="num mono">{formatCurrency(order.revenue)}</td>
							<td class="num mono commission">{formatCurrency(order.commission)}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</div>

	<div class="payout-note">
		Commission is paid on collected revenue. Capital equipment uses split payout: 50% at deposit, 50% at final payment.
	</div>
</div>

<style>
	.commissions-page h1 { font-family: var(--font-heading); font-size: var(--text-h2); font-weight: 700; margin: 0 0 var(--space-4); }
	.stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: var(--space-3); margin-bottom: var(--space-5); }
	.section { margin-bottom: var(--space-5); }
	.section h2 { font-family: var(--font-heading); font-size: var(--text-h3); font-weight: 700; margin: 0 0 var(--space-3); }
	.table-wrap { overflow-x: auto; background: var(--color-surface); border: 1px solid var(--color-border); border-radius: var(--radius-md); }
	table { width: 100%; border-collapse: collapse; font-size: var(--text-small); }
	th { text-align: left; padding: 0.75rem; border-bottom: 2px solid var(--color-border); font-weight: 600; background: var(--color-border-subtle); white-space: nowrap; }
	td { padding: 0.75rem; border-bottom: 1px solid var(--color-border-subtle); }
	.num { text-align: right; }
	.mono { font-variant-numeric: tabular-nums; }
	.muted { color: var(--color-muted); }
	.commission { color: #059669; font-weight: 600; }
	.order-link { color: var(--color-primary); font-weight: 600; }
	.payout-note { font-size: var(--text-small); color: var(--color-muted); background: var(--color-border-subtle); padding: var(--space-2) var(--space-3); border-radius: var(--radius-sm); }
</style>
