<script lang="ts">
	import type { PageData } from './$types';
	import StatusBadge from '$lib/components/portal/StatusBadge.svelte';
	import { QUOTE_STATUS_LABELS, QUOTE_STATUS_COLORS } from '$lib/utils/statuses';
	import { formatDate, formatCurrency } from '$lib/utils/format';
	import { categoryLabel } from '$lib/utils/categories';

	let { data }: { data: PageData } = $props();
	const quote = data.quote;
</script>

<svelte:head>
	<title>Quote Detail | BG Clear</title>
</svelte:head>

<div class="quote-detail">
	<a href="/catalog/quotes" class="back-link">&larr; Back to Quote History</a>

	<div class="detail-header">
		<div>
			<h1>Quote Request</h1>
			<p class="detail-date">Submitted {formatDate(quote.created_at)}</p>
		</div>
		<StatusBadge
			status={quote.status}
			labels={QUOTE_STATUS_LABELS}
			colors={QUOTE_STATUS_COLORS}
		/>
	</div>

	{#if quote.notes}
		<div class="notes-section">
			<h3>Notes</h3>
			<p>{quote.notes}</p>
		</div>
	{/if}

	<div class="items-section">
		<h3>Items</h3>
		<div class="items-table">
			<div class="table-header">
				<span class="col-product">Product</span>
				<span class="col-qty">Qty</span>
				<span class="col-price">Quoted Price</span>
			</div>
			{#each quote.quote_request_items ?? [] as item}
				<div class="table-row">
					<div class="col-product">
						<span class="product-name">{item.products?.name ?? 'Unknown Product'}</span>
						<span class="product-category">{categoryLabel(item.products?.category ?? '', true)}</span>
					</div>
					<span class="col-qty">{item.quantity}</span>
					<span class="col-price">
						{#if item.quoted_price != null}
							{formatCurrency(item.quoted_price)}
						{:else}
							<span class="pending-price">Pending</span>
						{/if}
					</span>
				</div>
			{/each}
		</div>
	</div>

	{#if quote.status === 'quoted'}
		{@const totalItems = quote.quote_request_items?.filter((i: any) => i.quoted_price != null) ?? []}
		{#if totalItems.length === (quote.quote_request_items?.length ?? 0)}
			{@const total = totalItems.reduce((sum: number, i: any) => sum + (i.quoted_price * i.quantity), 0)}
			<div class="quote-total">
				<div class="total-row">
					<span>Quoted Total</span>
					<strong>{formatCurrency(total)}</strong>
				</div>
			</div>
		{/if}
	{/if}
</div>

<style>
	.quote-detail {
		padding-bottom: var(--space-8);
	}

	.back-link {
		display: inline-block;
		margin-bottom: var(--space-3);
		color: var(--color-primary);
		font-size: var(--text-small);
		font-weight: 500;
		text-decoration: none;
	}

	.back-link:hover {
		text-decoration: underline;
	}

	.detail-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: var(--space-5);
	}

	.detail-header h1 {
		font-family: var(--font-heading);
		font-size: var(--text-h2);
		font-weight: 700;
		color: var(--color-ink);
		margin: 0;
	}

	.detail-date {
		color: var(--color-muted);
		font-size: var(--text-small);
		margin: var(--space-1) 0 0;
	}

	.notes-section {
		margin-bottom: var(--space-4);
		padding: var(--space-3);
		background: var(--color-border-subtle);
		border-radius: var(--radius-md);
	}

	.notes-section h3 {
		font-family: var(--font-heading);
		font-size: var(--text-small);
		font-weight: 700;
		color: var(--color-ink);
		margin: 0 0 var(--space-1);
	}

	.notes-section p {
		margin: 0;
		font-size: var(--text-small);
		color: var(--color-text);
	}

	.items-section h3 {
		font-family: var(--font-heading);
		font-size: 1rem;
		font-weight: 700;
		color: var(--color-ink);
		margin: 0 0 var(--space-2);
	}

	.items-table {
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		overflow: hidden;
	}

	.table-header {
		display: grid;
		grid-template-columns: 1fr 80px 120px;
		gap: var(--space-2);
		padding: var(--space-2) var(--space-3);
		background: var(--color-border-subtle);
		font-size: 0.7rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--color-muted);
	}

	.table-row {
		display: grid;
		grid-template-columns: 1fr 80px 120px;
		gap: var(--space-2);
		padding: var(--space-3);
		border-top: 1px solid var(--color-border);
		align-items: center;
	}

	.col-product .product-name {
		font-weight: 600;
		color: var(--color-ink);
		display: block;
	}

	.col-product .product-category {
		font-size: 0.7rem;
		color: var(--color-muted);
	}

	.col-qty {
		text-align: center;
		font-size: var(--text-small);
		color: var(--color-text);
	}

	.col-price {
		text-align: right;
		font-weight: 600;
		font-size: var(--text-small);
		color: var(--color-ink);
	}

	.pending-price {
		color: var(--color-muted);
		font-style: italic;
		font-weight: 400;
	}

	.quote-total {
		margin-top: var(--space-3);
		padding: var(--space-3) var(--space-4);
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
	}

	.total-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		font-size: 1.125rem;
	}

	.total-row span {
		color: var(--color-muted);
	}

	.total-row strong {
		color: var(--color-ink);
	}

	@media (max-width: 640px) {
		.detail-header {
			flex-direction: column;
			gap: var(--space-2);
		}
		.table-header,
		.table-row {
			grid-template-columns: 1fr 60px 90px;
		}
	}
</style>
