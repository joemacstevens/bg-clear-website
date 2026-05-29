<script lang="ts">
	import { enhance } from '$app/forms';
	import StatusBadge from '$lib/components/portal/StatusBadge.svelte';
	import ProductThumb from '$lib/components/ProductThumb.svelte';
	import { QUOTE_STATUS_LABELS, QUOTE_STATUS_COLORS } from '$lib/utils/statuses';
	import { formatCurrency, formatDateTime } from '$lib/utils/format';
	import { categoryLabel } from '$lib/utils/categories';
	import { computeCommission, priceGuardrailLevel } from '$lib/utils/pricing';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	// Track quoted prices reactively
	let quotedPrices = $state<Record<string, number>>({});

	// Initialize from existing data (skip during submission to avoid flash of empty inputs)
	$effect(() => {
		if (submitState === 'sending') return;
		const initial: Record<string, number> = {};
		for (const item of data.quote.quote_request_items ?? []) {
			if (item.quoted_price) initial[item.id] = item.quoted_price;
			else if (item.pricing) initial[item.id] = item.pricing.suggested_price;
		}
		quotedPrices = initial;
	});

	function getGuardrail(itemId: string, pricing: any) {
		const price = quotedPrices[itemId] ?? 0;
		if (!pricing) return 'suggested';
		return priceGuardrailLevel(price, pricing.bg_cost, pricing.target_price, pricing.suggested_price);
	}

	function getCommission(itemId: string, pricing: any) {
		const price = quotedPrices[itemId] ?? 0;
		if (!pricing) return 0;
		return computeCommission(price, pricing.bg_cost, pricing.target_price, 50, 65);
	}

	const guardrailColors: Record<string, string> = {
		'suggested': '#059669',
		'above-target': '#16a34a',
		'at-target': '#f59e0b',
		'below-target': '#ef4444',
		'below-cost': '#991b1b'
	};

	const guardrailLabels: Record<string, string> = {
		'suggested': 'At/above suggested',
		'above-target': 'Above target',
		'at-target': 'At target (floor)',
		'below-target': 'Below target — needs approval',
		'below-cost': 'Below BG cost — no commission, exception only'
	};

	const totalCommission = $derived(
		(data.quote.quote_request_items ?? []).reduce((sum: number, item: any) =>
			sum + getCommission(item.id, item.pricing) * (item.quantity ?? 1), 0
		)
	);

	const anyBelowTarget = $derived(
		(data.quote.quote_request_items ?? []).some((item: any) =>
			getGuardrail(item.id, item.pricing) === 'below-target' ||
			getGuardrail(item.id, item.pricing) === 'below-cost'
		)
	);

	const isQuotable = $derived(
		data.quote.status === 'pending' || data.quote.status === 'in_progress'
	);

	const isOrderable = $derived(data.quote.status === 'quoted');

	const hasItems = $derived((data.quote.quote_request_items ?? []).length > 0);

	let submitState = $state<'idle' | 'sending' | 'sent' | 'error'>('idle');
</script>

<svelte:head>
	<title>Quote Builder | BG Clear</title>
</svelte:head>

<div class="quote-builder">
	<div class="header">
		<div>
			<a href="/rep/quotes" class="back-link">← Back to Quotes</a>
			<h1>Quote Builder</h1>
		</div>
		<StatusBadge status={data.quote.status} labels={QUOTE_STATUS_LABELS} colors={QUOTE_STATUS_COLORS} />
	</div>

	<!-- Customer Info -->
	<div class="customer-card">
		<h3>{data.customer?.company_name || data.customer?.full_name || 'Unknown Customer'}</h3>
		<div class="customer-meta">
			{#if data.customer?.email}<span>{data.customer.email}</span>{/if}
			{#if data.customer?.phone}<span>{data.customer.phone}</span>{/if}
		</div>
		<span class="quote-date">Requested {formatDateTime(data.quote.created_at)}</span>
	</div>

	<!-- Quote Items -->
	<form method="POST" action="?/updatePrices" use:enhance={() => {
		submitState = 'sending';
		return async ({ update, result }) => {
			if (result.type === 'success' && result.data?.success) {
				submitState = 'sent';
				await update();
			} else {
				submitState = 'error';
				await update({ reset: false });
			}
		};
	}}>
		<div class="items-table-wrap">
			<table class="items-table">
				<thead>
					<tr>
						<th>Product</th>
						<th>Category</th>
						<th>Qty</th>
						<th class="num">BG Cost</th>
						<th class="num">Target</th>
						<th class="num">Suggested</th>
						<th class="num">Your Price</th>
						<th class="num">Commission</th>
						<th>Status</th>
					</tr>
				</thead>
				<tbody>
					{#each data.quote.quote_request_items ?? [] as item}
						{@const pricing = item.pricing}
						{@const guardrail = getGuardrail(item.id, pricing)}
						{@const commission = getCommission(item.id, pricing)}
						<tr>
							<td class="product-name">
								<div class="product-cell">
									<ProductThumb
										imageUrl={item.products?.image_url}
										name={item.products?.name ?? 'Unknown'}
										category={item.products?.category}
										size={40}
									/>
									<span>{item.products?.name ?? 'Unknown'}</span>
								</div>
							</td>
							<td><span class="cat-badge">{categoryLabel(item.products?.category ?? '', true)}</span></td>
							<td class="center">{item.quantity}</td>
							<td class="num mono">{pricing ? formatCurrency(pricing.bg_cost) : '—'}</td>
							<td class="num mono target-col">{pricing ? formatCurrency(pricing.target_price) : '—'}</td>
							<td class="num mono suggested-col">{pricing ? formatCurrency(pricing.suggested_price) : '—'}</td>
							<td class="num">
								<input type="hidden" name="item_id" value={item.id} />
								{#if isQuotable}
									<input
										type="number"
										name="quoted_price"
										step="0.01"
										min="0"
										class="price-input"
										style="border-color: {guardrailColors[guardrail]}"
										value={quotedPrices[item.id] ?? ''}
										oninput={(e) => { quotedPrices[item.id] = parseFloat((e.target as HTMLInputElement).value) || 0; }}
									/>
								{:else}
									<span class="mono">{item.quoted_price ? formatCurrency(item.quoted_price) : '—'}</span>
								{/if}
							</td>
							<td class="num mono" style="color: {guardrail === 'below-cost' ? '#991b1b' : '#059669'}">
								{formatCurrency(commission * (item.quantity ?? 1))}
							</td>
							<td>
								<span class="guardrail-badge" style="color: {guardrailColors[guardrail]}; background: {guardrailColors[guardrail]}18">
									{guardrailLabels[guardrail] ?? guardrail}
								</span>
							</td>
						</tr>
					{/each}
				</tbody>
				<tfoot>
					<tr>
						<td colspan="7" class="total-label">Total Estimated Commission</td>
						<td class="num mono total-value">{formatCurrency(totalCommission)}</td>
						<td></td>
					</tr>
				</tfoot>
			</table>
		</div>

		{#if anyBelowTarget}
			<div class="approval-warning">
				One or more items are priced below target. This order will require manager approval.
			</div>
		{/if}

		{#if submitState === 'sent'}
			<div class="success-banner">
				Quote sent to customer successfully. Status has been updated to "Quoted".
			</div>
		{:else if submitState === 'error'}
			<div class="error-banner">
				Failed to send quote. Please try again.
			</div>
		{/if}

		<div class="actions">
			{#if isQuotable && hasItems}
				<button type="submit" class="btn-primary" disabled={submitState === 'sending'}>
					{submitState === 'sending' ? 'Sending...' : 'Send Quote to Customer'}
				</button>
			{:else if isQuotable && !hasItems}
				<p class="empty-warning">This quote has no line items. Items must be added before sending.</p>
			{/if}
		</div>
	</form>

	{#if isOrderable}
		<form method="POST" action="?/createOrder" use:enhance>
			<div class="actions">
				<button type="submit" class="btn-primary btn-green">
					Create Order from Quote {anyBelowTarget ? '(Requires Approval)' : ''}
				</button>
			</div>
		</form>
	{/if}
</div>

<style>
	.quote-builder { padding-bottom: var(--space-8); }
	.header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: var(--space-4);
	}
	.back-link {
		font-size: var(--text-small);
		color: var(--color-muted);
		display: block;
		margin-bottom: 0.25rem;
	}
	.header h1 {
		font-family: var(--font-heading);
		font-size: var(--text-h2);
		font-weight: 700;
		margin: 0;
	}

	.customer-card {
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		padding: var(--space-3);
		margin-bottom: var(--space-4);
	}
	.customer-card h3 {
		font-family: var(--font-heading);
		font-size: 1rem;
		font-weight: 700;
		margin: 0 0 0.25rem;
	}
	.customer-meta {
		display: flex;
		gap: var(--space-3);
		font-size: var(--text-small);
		color: var(--color-muted);
	}
	.quote-date { font-size: 0.75rem; color: var(--color-muted); }

	.items-table-wrap {
		overflow-x: auto;
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		margin-bottom: var(--space-3);
	}
	.items-table { width: 100%; border-collapse: collapse; font-size: var(--text-small); }
	.items-table th {
		text-align: left;
		padding: 0.75rem;
		border-bottom: 2px solid var(--color-border);
		font-weight: 600;
		white-space: nowrap;
		background: var(--color-border-subtle);
	}
	.items-table td {
		padding: 0.75rem;
		border-bottom: 1px solid var(--color-border-subtle);
		vertical-align: middle;
	}
	.items-table tfoot td {
		padding: 0.75rem;
		font-weight: 700;
		border-top: 2px solid var(--color-border);
	}
	.product-name { font-weight: 500; }
	.product-cell {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}
	.num { text-align: right; }
	.center { text-align: center; }
	.mono { font-variant-numeric: tabular-nums; }
	.cat-badge {
		font-size: 0.65rem;
		font-weight: 600;
		padding: 0.1rem 0.5rem;
		border-radius: var(--radius-pill);
		background: var(--color-border-subtle);
		white-space: nowrap;
	}
	.target-col { color: #b45309; }
	.suggested-col { color: #16a34a; }

	.price-input {
		width: 100px;
		padding: 0.375rem 0.5rem;
		border: 2px solid var(--color-border);
		border-radius: var(--radius-sm);
		font-size: var(--text-small);
		font-family: var(--font-body);
		font-variant-numeric: tabular-nums;
		text-align: right;
		transition: border-color 0.15s;
	}
	.price-input:focus {
		outline: none;
		box-shadow: 0 0 0 3px rgba(30, 58, 95, 0.1);
	}

	.guardrail-badge {
		font-size: 0.65rem;
		font-weight: 600;
		padding: 0.1rem 0.5rem;
		border-radius: var(--radius-pill);
		white-space: nowrap;
	}

	.total-label { text-align: right; }
	.total-value { font-size: 1rem; color: #059669; }

	.approval-warning {
		background: #fef3c7;
		color: #92400e;
		padding: var(--space-2) var(--space-3);
		border-radius: var(--radius-sm);
		font-size: var(--text-small);
		font-weight: 500;
		margin-bottom: var(--space-3);
	}

	.actions {
		display: flex;
		gap: var(--space-2);
	}
	.btn-primary {
		padding: 0.625rem 1.5rem;
		background: var(--color-primary);
		color: white;
		border: none;
		border-radius: var(--radius-sm);
		font-size: var(--text-small);
		font-weight: 600;
		font-family: var(--font-heading);
		cursor: pointer;
	}
	.btn-primary:hover { background: var(--color-primary-dark); }
	.btn-green { background: #059669; }
	.btn-green:hover { background: #047857; }

	.success-banner {
		background: #d1fae5;
		color: #065f46;
		padding: var(--space-2) var(--space-3);
		border-radius: var(--radius-sm);
		font-size: var(--text-small);
		font-weight: 500;
		margin-bottom: var(--space-3);
	}
	.error-banner {
		background: #fee2e2;
		color: #991b1b;
		padding: var(--space-2) var(--space-3);
		border-radius: var(--radius-sm);
		font-size: var(--text-small);
		font-weight: 500;
		margin-bottom: var(--space-3);
	}
	.empty-warning {
		color: var(--color-muted);
		font-size: var(--text-small);
		font-style: italic;
		margin: 0;
	}
	.btn-primary:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}
</style>
