<script lang="ts">
	import type { PageData } from './$types';
	import StatusBadge from '$lib/components/portal/StatusBadge.svelte';
	import EmptyState from '$lib/components/portal/EmptyState.svelte';
	import { QUOTE_STATUS_LABELS, QUOTE_STATUS_COLORS } from '$lib/utils/statuses';
	import { formatDate, formatCurrency } from '$lib/utils/format';

	let { data }: { data: PageData } = $props();

	const ready = $derived(data.quotes.filter((q: any) => q.status === 'quoted'));
	const awaiting = $derived(
		data.quotes.filter((q: any) => ['pending', 'in_progress'].includes(q.status))
	);
	const past = $derived(
		data.quotes.filter((q: any) => !['quoted', 'pending', 'in_progress'].includes(q.status))
	);

	function total(q: any): number {
		return (q.quote_request_items ?? []).reduce(
			(s: number, i: any) => s + (i.quoted_price ?? 0) * i.quantity,
			0
		);
	}
	function products(q: any): string {
		return (q.quote_request_items ?? [])
			.map((i: any) => i.products?.name)
			.filter(Boolean)
			.join(', ');
	}
	function count(q: any): number {
		return q.quote_request_items?.length ?? 0;
	}
</script>

<svelte:head><title>Your Quotes | BG Clear</title></svelte:head>

<div class="quotes-page">
	<div class="page-header">
		<a href="/catalog" class="back-link">
			<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" width="16" height="16">
				<path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
			</svg>
			<span>Back to Catalog</span>
		</a>
		<h1>Your Quotes</h1>
		<p>Quotes your rep has priced are ready to order below.</p>
	</div>

	{#if data.quotes.length === 0}
		<EmptyState
			message="No quote requests yet. Browse the catalog to get started."
			actionLabel="Browse Products"
			actionHref="/catalog"
		/>
	{:else}
		{#if ready.length}
			<section class="group">
				<h2 class="group-title ready-title">Ready to order ({ready.length})</h2>
				<div class="quotes-list">
					{#each ready as quote}
						<div class="quote-card ready-card">
							<div class="quote-info">
								<div class="quote-top">
									<span class="quote-products">{products(quote) || `${count(quote)} item(s)`}</span>
									<StatusBadge status={quote.status} labels={QUOTE_STATUS_LABELS} colors={QUOTE_STATUS_COLORS} />
								</div>
								<span class="quote-meta">{count(quote)} item{count(quote) !== 1 ? 's' : ''} · Priced {formatDate(quote.updated_at ?? quote.created_at)}</span>
							</div>
							<div class="quote-action">
								<span class="quote-total">{formatCurrency(total(quote))}</span>
								<a class="order-btn" href="/catalog/quotes/{quote.id}">Review &amp; Order</a>
							</div>
						</div>
					{/each}
				</div>
			</section>
		{/if}

		{#if awaiting.length}
			<section class="group">
				<h2 class="group-title">Awaiting pricing ({awaiting.length})</h2>
				<div class="quotes-list">
					{#each awaiting as quote}
						<a href="/catalog/quotes/{quote.id}" class="quote-card muted">
							<div class="quote-info">
								<div class="quote-top">
									<span class="quote-products">{products(quote) || `${count(quote)} item(s)`}</span>
									<StatusBadge status={quote.status} labels={QUOTE_STATUS_LABELS} colors={QUOTE_STATUS_COLORS} />
								</div>
								<span class="quote-meta">{count(quote)} item{count(quote) !== 1 ? 's' : ''} · Submitted {formatDate(quote.created_at)} · Your rep is preparing pricing</span>
							</div>
						</a>
					{/each}
				</div>
			</section>
		{/if}

		{#if past.length}
			<section class="group">
				<h2 class="group-title">History ({past.length})</h2>
				<div class="quotes-list">
					{#each past as quote}
						<a href="/catalog/quotes/{quote.id}" class="quote-card muted">
							<div class="quote-info">
								<div class="quote-top">
									<span class="quote-products">{products(quote) || `${count(quote)} item(s)`}</span>
									<StatusBadge status={quote.status} labels={QUOTE_STATUS_LABELS} colors={QUOTE_STATUS_COLORS} />
								</div>
								<span class="quote-meta">{count(quote)} item{count(quote) !== 1 ? 's' : ''} · {formatDate(quote.created_at)}</span>
							</div>
							{#if quote.status === 'accepted'}
								<span class="go-pay">Continue to payment →</span>
							{/if}
						</a>
					{/each}
				</div>
			</section>
		{/if}
	{/if}
</div>

<style>
	.quotes-page { padding-bottom: var(--space-8); }
	.page-header { margin-bottom: var(--space-5); }
	.back-link {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		margin-bottom: var(--space-2);
		color: var(--color-muted);
		font-size: var(--text-small);
		font-weight: 600;
		text-decoration: none;
		transition: color 0.15s ease, transform 0.15s ease;
	}
	.back-link:hover {
		color: var(--color-primary);
		transform: translateX(-4px);
	}
	.page-header h1 { font-family: var(--font-heading); font-size: var(--text-h2); font-weight: 700; color: var(--color-ink); margin: 0 0 var(--space-1); }
	.page-header p { color: var(--color-muted); margin: 0; }

	.group { margin-bottom: var(--space-5); }
	.group-title { font-family: var(--font-heading); font-size: 0.95rem; font-weight: 700; color: var(--color-ink); margin: 0 0 var(--space-2); }
	.ready-title { color: #047857; }

	.quotes-list { display: flex; flex-direction: column; gap: var(--space-2); }

	.quote-card {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: var(--space-3);
		padding: var(--space-3) var(--space-4);
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		text-decoration: none;
		color: inherit;
		transition: box-shadow 0.15s, border-color 0.15s;
	}
	a.quote-card:hover { box-shadow: var(--shadow-sm); border-color: var(--color-primary); }
	.quote-card.muted { background: var(--color-bg); }
	.ready-card { border-color: #6ee7b7; border-left: 4px solid #059669; background: #f0fdf4; }

	.quote-info { display: flex; flex-direction: column; gap: 0.25rem; min-width: 0; flex: 1; }
	.quote-top { display: flex; align-items: center; gap: var(--space-2); }
	.quote-products { font-weight: 600; font-size: var(--text-small); color: var(--color-ink); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 420px; }
	.quote-meta { font-size: 0.75rem; color: var(--color-muted); }

	.quote-action { display: flex; flex-direction: column; align-items: flex-end; gap: 0.375rem; flex-shrink: 0; }
	.quote-total { font-weight: 700; font-size: 1.05rem; color: var(--color-ink); }
	.order-btn { padding: 0.5rem 1.1rem; border-radius: var(--radius-pill); background: var(--color-accent); color: var(--color-ink); font-weight: 700; font-size: 0.8rem; text-decoration: none; white-space: nowrap; }
	.go-pay { font-size: 0.75rem; font-weight: 600; color: var(--color-primary); white-space: nowrap; flex-shrink: 0; }

	@media (max-width: 640px) {
		.quote-card { flex-direction: column; align-items: stretch; }
		.quote-action { align-items: stretch; }
		.order-btn { text-align: center; }
		.quote-products { max-width: none; }
	}
</style>
