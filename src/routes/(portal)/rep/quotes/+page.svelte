<script lang="ts">
	import StatusBadge from '$lib/components/portal/StatusBadge.svelte';
	import EmptyState from '$lib/components/portal/EmptyState.svelte';
	import { QUOTE_STATUS_LABELS, QUOTE_STATUS_COLORS } from '$lib/utils/statuses';
	import { formatDateTime } from '$lib/utils/format';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let statusFilter = $state('');

	const filtered = $derived(
		statusFilter ? data.quotes.filter((q: any) => q.status === statusFilter) : data.quotes
	);
</script>

<svelte:head>
	<title>Quote Requests | BG Clear</title>
</svelte:head>

<div class="quotes-page">
	<h1>Quote Requests</h1>

	<div class="controls">
		<div class="filter-pills">
			<button class="pill" class:active={!statusFilter} onclick={() => statusFilter = ''}>All ({data.quotes.length})</button>
			{#each ['pending', 'in_progress', 'quoted', 'accepted', 'declined'] as s}
				{@const count = data.quotes.filter((q: any) => q.status === s).length}
				{#if count > 0}
					<button class="pill" class:active={statusFilter === s} onclick={() => statusFilter = s}>
						{QUOTE_STATUS_LABELS[s]} ({count})
					</button>
				{/if}
			{/each}
		</div>
	</div>

	{#if filtered.length === 0}
		<EmptyState message="No quote requests found." />
	{:else}
		<div class="quote-list">
			{#each filtered as quote}
				{@const customer = (quote as any).profiles}
				<a href="/rep/quotes/{quote.id}" class="quote-card">
					<div class="quote-left">
						<StatusBadge status={quote.status} labels={QUOTE_STATUS_LABELS} colors={QUOTE_STATUS_COLORS} />
						<div class="quote-details">
							<span class="customer-name">{customer?.company_name || customer?.full_name || 'Unknown Customer'}</span>
							<span class="item-count">{quote.quote_request_items?.length ?? 0} items</span>
						</div>
					</div>
					<div class="quote-right">
						<span class="quote-date">{formatDateTime(quote.created_at)}</span>
						<span class="arrow">→</span>
					</div>
				</a>
			{/each}
		</div>
	{/if}
</div>

<style>
	.quotes-page h1 {
		font-family: var(--font-heading);
		font-size: var(--text-h2);
		font-weight: 700;
		margin: 0 0 var(--space-4);
	}
	.controls { margin-bottom: var(--space-3); }
	.filter-pills { display: flex; gap: 0.375rem; flex-wrap: wrap; }
	.pill {
		padding: 0.3rem 0.75rem;
		border-radius: var(--radius-pill);
		font-size: 0.75rem;
		font-weight: 500;
		color: var(--color-muted);
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		cursor: pointer;
		font-family: var(--font-body);
		transition: all 0.15s;
	}
	.pill:hover { border-color: var(--color-primary); color: var(--color-primary); }
	.pill.active { background: var(--color-primary); color: white; border-color: var(--color-primary); }

	.quote-list {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}
	.quote-card {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: var(--space-3);
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		text-decoration: none;
		color: inherit;
		transition: all 0.15s;
	}
	.quote-card:hover { box-shadow: var(--shadow-sm); border-color: var(--color-primary); }
	.quote-left { display: flex; align-items: center; gap: var(--space-2); }
	.quote-details { display: flex; flex-direction: column; }
	.customer-name { font-weight: 600; font-size: var(--text-small); }
	.item-count { font-size: 0.75rem; color: var(--color-muted); }
	.quote-right { display: flex; align-items: center; gap: var(--space-2); }
	.quote-date { font-size: var(--text-small); color: var(--color-muted); }
	.arrow { color: var(--color-muted); font-size: 1.1rem; }
</style>
