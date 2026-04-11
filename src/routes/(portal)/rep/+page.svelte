<script lang="ts">
	import StatCard from '$lib/components/portal/StatCard.svelte';
	import StatusBadge from '$lib/components/portal/StatusBadge.svelte';
	import { QUOTE_STATUS_LABELS, QUOTE_STATUS_COLORS } from '$lib/utils/statuses';
	import { formatCurrency, formatDateTime } from '$lib/utils/format';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>Rep Dashboard | BG Clear</title>
</svelte:head>

<div class="dashboard">
	<h1>Dashboard</h1>

	<div class="stats-grid">
		<StatCard value={data.stats.assignedCustomers} label="Assigned Customers" />
		<StatCard value={data.stats.pendingQuotes} label="Pending Quotes" color="#f59e0b" />
		<StatCard value={data.stats.activeOrders} label="Active Orders" color="#3b82f6" />
		<StatCard value={formatCurrency(data.stats.totalCommission)} label="Total Commission" color="#059669" />
	</div>

	<div class="section">
		<div class="section-header">
			<h2>Quotes Needing Attention</h2>
			<a href="/rep/quotes" class="view-all">View all quotes</a>
		</div>

		{#if data.recentQuotes.length === 0}
			<div class="empty-card">
				<p>No pending quotes. New quote requests from customers will appear here.</p>
			</div>
		{:else}
			<div class="quote-list">
				{#each data.recentQuotes as quote}
					<a href="/rep/quotes/{quote.id}" class="quote-row">
						<div class="quote-info">
							<StatusBadge status={quote.status} labels={QUOTE_STATUS_LABELS} colors={QUOTE_STATUS_COLORS} />
							<span class="quote-items">
								{quote.quote_request_items?.length ?? 0} items
								{#if quote.quote_request_items?.[0]?.products}
									— {quote.quote_request_items[0].products.name}{quote.quote_request_items.length > 1 ? ` +${quote.quote_request_items.length - 1} more` : ''}
								{/if}
							</span>
						</div>
						<span class="quote-date">{formatDateTime(quote.created_at)}</span>
					</a>
				{/each}
			</div>
		{/if}
	</div>

	<div class="quick-links">
		<a href="/rep/pricing" class="quick-link">Pricing Table</a>
		<a href="/rep/orders" class="quick-link">Manage Orders</a>
		<a href="/rep/commissions" class="quick-link">Commission Report</a>
		<a href="/rep/customers" class="quick-link">My Customers</a>
	</div>
</div>

<style>
	.dashboard h1 {
		font-family: var(--font-heading);
		font-size: var(--text-h2);
		font-weight: 700;
		color: var(--color-ink);
		margin: 0 0 var(--space-4);
	}
	.stats-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
		gap: var(--space-3);
		margin-bottom: var(--space-5);
	}
	.section { margin-bottom: var(--space-5); }
	.section-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: var(--space-3);
	}
	.section-header h2 {
		font-family: var(--font-heading);
		font-size: var(--text-h3);
		font-weight: 700;
		margin: 0;
	}
	.view-all { font-size: var(--text-small); font-weight: 600; color: var(--color-primary); }
	.empty-card {
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		padding: var(--space-4);
		text-align: center;
		color: var(--color-muted);
	}
	.empty-card p { margin: 0 auto; }
	.quote-list {
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		overflow: hidden;
	}
	.quote-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: var(--space-2) var(--space-3);
		border-bottom: 1px solid var(--color-border-subtle);
		text-decoration: none;
		color: inherit;
		transition: background 0.1s;
	}
	.quote-row:last-child { border-bottom: none; }
	.quote-row:hover { background: var(--color-border-subtle); }
	.quote-info { display: flex; align-items: center; gap: var(--space-2); }
	.quote-items { font-size: var(--text-small); color: var(--color-muted); }
	.quote-date { font-size: var(--text-small); color: var(--color-muted); }
	.quick-links { display: flex; gap: var(--space-2); flex-wrap: wrap; }
	.quick-link {
		padding: 0.5rem 1.25rem;
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-sm);
		font-size: var(--text-small);
		font-weight: 600;
		color: var(--color-primary);
		text-decoration: none;
		transition: all 0.15s;
	}
	.quick-link:hover { background: var(--color-primary); color: white; border-color: var(--color-primary); }
</style>
