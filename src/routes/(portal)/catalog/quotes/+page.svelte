<script lang="ts">
	import type { PageData } from './$types';
	import StatusBadge from '$lib/components/portal/StatusBadge.svelte';
	import EmptyState from '$lib/components/portal/EmptyState.svelte';
	import { QUOTE_STATUS_LABELS, QUOTE_STATUS_COLORS } from '$lib/utils/statuses';
	import { formatDate } from '$lib/utils/format';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>Quote History | BG Clear</title>
</svelte:head>

<div class="quotes-page">
	<div class="page-header">
		<a href="/catalog" class="back-link">&larr; Back to Catalog</a>
		<h1>Quote History</h1>
		<p>View your submitted quote requests and their status.</p>
	</div>

	{#if data.quotes.length === 0}
		<EmptyState
			message="No quote requests yet. Browse the catalog to get started."
			actionLabel="Browse Products"
			actionHref="/catalog"
		/>
	{:else}
		<div class="quotes-list">
			{#each data.quotes as quote}
				<a href="/catalog/quotes/{quote.id}" class="quote-card">
					<div class="quote-header">
						<span class="quote-date">{formatDate(quote.created_at)}</span>
						<StatusBadge
							status={quote.status}
							labels={QUOTE_STATUS_LABELS}
							colors={QUOTE_STATUS_COLORS}
						/>
					</div>
					<div class="quote-body">
						<span class="quote-items">
							{quote.quote_request_items?.length ?? 0} item{(quote.quote_request_items?.length ?? 0) !== 1 ? 's' : ''}
						</span>
						{#if quote.quote_request_items?.length}
							<span class="quote-products">
								{quote.quote_request_items.map((i: any) => i.products?.name).filter(Boolean).join(', ')}
							</span>
						{/if}
					</div>
				</a>
			{/each}
		</div>
	{/if}
</div>

<style>
	.quotes-page {
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

	.quotes-list {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	.quote-card {
		display: block;
		padding: var(--space-3) var(--space-4);
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		text-decoration: none;
		transition: box-shadow 0.15s, border-color 0.15s;
	}

	.quote-card:hover {
		box-shadow: var(--shadow-sm);
		border-color: var(--color-primary);
	}

	.quote-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: var(--space-1);
	}

	.quote-date {
		font-size: var(--text-small);
		font-weight: 600;
		color: var(--color-ink);
	}

	.quote-body {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.quote-items {
		font-size: var(--text-small);
		color: var(--color-muted);
	}

	.quote-products {
		font-size: var(--text-small);
		color: var(--color-muted);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
</style>
