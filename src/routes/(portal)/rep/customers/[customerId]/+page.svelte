<script lang="ts">
	import StatusBadge from '$lib/components/portal/StatusBadge.svelte';
	import { QUOTE_STATUS_LABELS, QUOTE_STATUS_COLORS, ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '$lib/utils/statuses';
	import { formatCurrency, formatDate } from '$lib/utils/format';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head><title>{data.customer.company_name || data.customer.full_name} | BG Clear</title></svelte:head>

<div class="customer-detail">
	<a href="/rep/customers" class="back-link">← Back to Customers</a>

	<div class="header">
		<div class="avatar">{(data.customer.company_name || data.customer.full_name || '?').charAt(0).toUpperCase()}</div>
		<div class="header-text">
			<h1>{data.customer.company_name || data.customer.full_name}</h1>
			{#if data.customer.company_name}<p class="subname">{data.customer.full_name}</p>{/if}
			{#if (data.customer as any).account_number}<p class="acct">{(data.customer as any).account_number}</p>{/if}
		</div>
		<form method="POST" action="?/createQuote" class="build-form">
			<button type="submit" class="build-btn">+ Build a Quote</button>
		</form>
	</div>

	<div class="info-grid">
		<div class="info-card">
			<h3>Contact</h3>
			<p>{data.customer.email}</p>
			{#if data.customer.phone}<p>{data.customer.phone}</p>{/if}
		</div>
		<div class="info-card">
			<h3>Address</h3>
			{#if data.customer.address_line1}
				<p>{data.customer.address_line1}</p>
				{#if data.customer.address_line2}<p>{data.customer.address_line2}</p>{/if}
				<p>{data.customer.city}, {data.customer.state} {data.customer.zip}</p>
			{:else}
				<p class="muted">No address on file</p>
			{/if}
		</div>
	</div>

	<div class="section">
		<h2>Quote Requests ({data.quotes.length})</h2>
		{#if data.quotes.length === 0}
			<p class="muted">No quotes yet.</p>
		{:else}
			{#each data.quotes as quote}
				<a href="/rep/quotes/{quote.id}" class="list-row">
					<StatusBadge status={quote.status} labels={QUOTE_STATUS_LABELS} colors={QUOTE_STATUS_COLORS} />
					<span>{quote.quote_request_items?.length ?? 0} items</span>
					<span class="muted">{formatDate(quote.created_at)}</span>
				</a>
			{/each}
		{/if}
	</div>

	<div class="section">
		<h2>Orders ({data.orders.length})</h2>
		{#if data.orders.length === 0}
			<p class="muted">No orders yet.</p>
		{:else}
			{#each data.orders as order}
				<a href="/rep/orders/{order.id}" class="list-row">
					<span class="bold">{order.order_number}</span>
					<StatusBadge status={order.status} labels={ORDER_STATUS_LABELS} colors={ORDER_STATUS_COLORS} />
					<span>{formatCurrency(order.subtotal ?? 0)}</span>
					<span class="muted">{formatDate(order.created_at)}</span>
				</a>
			{/each}
		{/if}
	</div>
</div>

<style>
	.customer-detail { padding-bottom: var(--space-8); }
	.back-link { font-size: var(--text-small); color: var(--color-muted); display: block; margin-bottom: var(--space-2); }
	.header { display: flex; align-items: center; gap: var(--space-3); margin-bottom: var(--space-4); }
	.header-text { flex: 1; min-width: 0; }
	.acct { margin: 0.15rem 0 0; font-size: 0.75rem; font-weight: 700; color: var(--color-primary); font-variant-numeric: tabular-nums; }
	.build-form { flex-shrink: 0; }
	.build-btn { padding: 0.7rem 1.3rem; background: var(--color-accent); color: var(--color-ink); border: none; border-radius: var(--radius-pill); font-family: var(--font-heading); font-weight: 700; font-size: var(--text-small); cursor: pointer; white-space: nowrap; }
	.build-btn:hover { filter: brightness(0.96); }
	.header h1 { font-family: var(--font-heading); font-size: var(--text-h2); font-weight: 700; margin: 0; }
	.subname { color: var(--color-muted); font-size: var(--text-small); margin: 0; }
	.avatar {
		width: 56px; height: 56px; border-radius: 50%; background: var(--color-primary); color: white;
		display: flex; align-items: center; justify-content: center; font-family: var(--font-heading);
		font-weight: 700; font-size: 1.5rem; flex-shrink: 0;
	}
	.info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-3); margin-bottom: var(--space-5); }
	.info-card {
		background: var(--color-surface); border: 1px solid var(--color-border); border-radius: var(--radius-md); padding: var(--space-3);
	}
	.info-card h3 { font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: var(--color-muted); margin: 0 0 0.5rem; }
	.info-card p { margin: 0; font-size: var(--text-small); }
	.section { margin-bottom: var(--space-5); }
	.section h2 { font-family: var(--font-heading); font-size: var(--text-h3); font-weight: 700; margin: 0 0 var(--space-2); }
	.muted { color: var(--color-muted); }
	.bold { font-weight: 600; }
	.list-row {
		display: flex; align-items: center; gap: var(--space-2); padding: var(--space-2) var(--space-3);
		background: var(--color-surface); border: 1px solid var(--color-border); border-radius: var(--radius-sm);
		text-decoration: none; color: inherit; font-size: var(--text-small); margin-bottom: 0.375rem; transition: all 0.1s;
	}
	.list-row:hover { border-color: var(--color-primary); }
	@media (max-width: 640px) { .info-grid { grid-template-columns: 1fr; } }
</style>
