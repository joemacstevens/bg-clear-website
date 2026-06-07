<script lang="ts">
	import type { PageData, ActionData } from './$types';
	import { enhance } from '$app/forms';
	import StatusBadge from '$lib/components/portal/StatusBadge.svelte';
	import { QUOTE_STATUS_LABELS, QUOTE_STATUS_COLORS } from '$lib/utils/statuses';
	import { formatDate, formatCurrency } from '$lib/utils/format';
	import { categoryLabel } from '$lib/utils/categories';

	let { data, form }: { data: PageData; form: ActionData } = $props();
	const quote = $derived(data.quote);
	const items = $derived(quote.quote_request_items ?? []);

	// Customer may review/edit/accept only while the quote is 'quoted'.
	const isEditable = $derived(quote.status === 'quoted');
	const allPriced = $derived(
		items.length > 0 && items.every((i: any) => i.quoted_price != null)
	);
	const grandTotal = $derived(
		items.reduce((sum: number, i: any) => sum + (i.quoted_price ?? 0) * i.quantity, 0)
	);

	let submitting = $state(false);
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
		<StatusBadge status={quote.status} labels={QUOTE_STATUS_LABELS} colors={QUOTE_STATUS_COLORS} />
	</div>

	{#if isEditable && allPriced}
		<div class="review-banner">
			Your rep has priced this quote. Review below — you can adjust quantities or remove items,
			then accept to continue to payment.
		</div>
	{/if}

	{#if form?.error}
		<div class="form-error">{form.error}</div>
	{/if}

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
				<span class="col-price">Unit Price</span>
				<span class="col-total">Total</span>
				{#if isEditable && allPriced}<span class="col-actions"></span>{/if}
			</div>
			{#each items as item (item.id)}
				<div class="table-row">
					<div class="col-product">
						{#if item.products?.image_url}
							<img class="thumb" src={item.products.image_url} alt={item.products?.name ?? ''} />
						{:else}
							<div class="thumb thumb-placeholder" aria-hidden="true"></div>
						{/if}
						<span class="product-info">
							<span class="product-name">{item.products?.name ?? 'Unknown Product'}</span>
							<span class="product-category">{categoryLabel(item.products?.category ?? '', true)}</span>
						</span>
					</div>

					<span class="col-qty">
						{#if isEditable && allPriced}
							<form
								method="POST"
								action="?/updateItemQty"
								class="qty-form"
								use:enhance={() => {
									submitting = true;
									return async ({ update }) => { await update(); submitting = false; };
								}}
							>
								<input type="hidden" name="item_id" value={item.id} />
								<button
									class="qty-btn"
									type="submit"
									name="quantity"
									value={item.quantity - 1}
									disabled={submitting || item.quantity <= 1}
									aria-label="Decrease quantity"
								>−</button>
								<span class="qty-value">{item.quantity}</span>
								<button
									class="qty-btn"
									type="submit"
									name="quantity"
									value={item.quantity + 1}
									disabled={submitting}
									aria-label="Increase quantity"
								>+</button>
							</form>
						{:else}
							{item.quantity}
						{/if}
					</span>

					<span class="col-price">
						{#if item.quoted_price != null}
							{formatCurrency(item.quoted_price)}
						{:else}
							<span class="pending-price">Pending</span>
						{/if}
					</span>

					<span class="col-total">
						{#if item.quoted_price != null}
							{formatCurrency(item.quoted_price * item.quantity)}
						{:else}
							—
						{/if}
					</span>

					{#if isEditable && allPriced}
						<span class="col-actions">
							<form
								method="POST"
								action="?/removeItem"
								use:enhance={() => {
									submitting = true;
									return async ({ update }) => { await update(); submitting = false; };
								}}
							>
								<input type="hidden" name="item_id" value={item.id} />
								<button
									class="remove-btn"
									type="submit"
									disabled={submitting || items.length <= 1}
									title={items.length <= 1 ? 'A quote must keep at least one item' : 'Remove item'}
								>Remove</button>
							</form>
						</span>
					{/if}
				</div>
			{/each}
		</div>
	</div>

	{#if allPriced}
		<div class="quote-total">
			<div class="total-row">
				<span>Quoted Total</span>
				<strong>{formatCurrency(grandTotal)}</strong>
			</div>
		</div>
	{/if}

	{#if isEditable && allPriced}
		<form
			method="POST"
			action="?/accept"
			class="accept-form"
			use:enhance={() => {
				submitting = true;
				return async ({ update }) => { await update(); submitting = false; };
			}}
		>
			<button class="accept-btn" type="submit" disabled={submitting}>
				Accept &amp; Continue to Payment
			</button>
			<p class="accept-note">
				Accepting locks in these items and prices and creates your order.
			</p>
		</form>
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

	.review-banner {
		margin-bottom: var(--space-4);
		padding: var(--space-3) var(--space-4);
		background: var(--color-primary);
		color: #fff;
		border-radius: var(--radius-md);
		font-size: var(--text-small);
		line-height: 1.5;
	}

	.form-error {
		margin-bottom: var(--space-4);
		padding: var(--space-3) var(--space-4);
		background: #fdecea;
		color: #b3261e;
		border: 1px solid #f5c2c0;
		border-radius: var(--radius-md);
		font-size: var(--text-small);
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
		grid-template-columns: 1fr 110px 110px 110px;
		gap: var(--space-2);
		padding: var(--space-2) var(--space-3);
		background: var(--color-border-subtle);
		font-size: 0.7rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--color-muted);
	}

	.table-header:has(.col-actions),
	.table-row:has(.col-actions) {
		grid-template-columns: 1fr 110px 110px 110px 90px;
	}

	.table-row {
		display: grid;
		grid-template-columns: 1fr 110px 110px 110px;
		gap: var(--space-2);
		padding: var(--space-3);
		border-top: 1px solid var(--color-border);
		align-items: center;
	}

	.col-product {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		min-width: 0;
	}

	.thumb {
		width: 44px;
		height: 44px;
		border-radius: var(--radius-sm);
		object-fit: cover;
		background: var(--color-border-subtle);
		flex-shrink: 0;
	}

	.thumb-placeholder {
		border: 1px dashed var(--color-border);
	}

	.product-info {
		display: flex;
		flex-direction: column;
		min-width: 0;
	}

	.product-name {
		font-weight: 600;
		color: var(--color-ink);
	}

	.product-category {
		font-size: 0.7rem;
		color: var(--color-muted);
	}

	.col-qty {
		text-align: center;
		font-size: var(--text-small);
		color: var(--color-text);
	}

	.qty-form {
		display: inline-flex;
		align-items: center;
		gap: var(--space-1);
	}

	.qty-btn {
		width: 26px;
		height: 26px;
		border: 1px solid var(--color-border);
		background: var(--color-surface);
		border-radius: var(--radius-sm);
		font-size: 1rem;
		line-height: 1;
		cursor: pointer;
		color: var(--color-ink);
	}

	.qty-btn:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}

	.qty-value {
		min-width: 1.5rem;
		text-align: center;
		font-weight: 600;
	}

	.col-price,
	.col-total {
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

	.col-actions {
		text-align: right;
	}

	.remove-btn {
		background: none;
		border: none;
		color: #b3261e;
		font-size: var(--text-small);
		cursor: pointer;
		padding: var(--space-1);
	}

	.remove-btn:disabled {
		opacity: 0.4;
		cursor: not-allowed;
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

	.accept-form {
		margin-top: var(--space-4);
		text-align: center;
	}

	.accept-btn {
		width: 100%;
		padding: var(--space-3) var(--space-4);
		background: var(--color-accent);
		color: var(--color-ink);
		border: none;
		border-radius: var(--radius-pill);
		font-family: var(--font-heading);
		font-size: 1rem;
		font-weight: 700;
		cursor: pointer;
	}

	.accept-btn:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.accept-note {
		margin: var(--space-2) 0 0;
		font-size: 0.75rem;
		color: var(--color-muted);
	}

	@media (max-width: 640px) {
		.detail-header {
			flex-direction: column;
			gap: var(--space-2);
		}
		.table-header,
		.table-row,
		.table-header:has(.col-actions),
		.table-row:has(.col-actions) {
			grid-template-columns: 1fr 90px 90px;
		}
		.col-total,
		.col-actions {
			display: none;
		}
	}
</style>
