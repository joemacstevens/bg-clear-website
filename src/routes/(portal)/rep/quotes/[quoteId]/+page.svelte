<script lang="ts">
	import { enhance } from '$app/forms';
	import StatusBadge from '$lib/components/portal/StatusBadge.svelte';
	import { QUOTE_STATUS_LABELS, QUOTE_STATUS_COLORS } from '$lib/utils/statuses';
	import { formatCurrency, formatDateTime } from '$lib/utils/format';
	import { categoryLabel } from '$lib/utils/categories';
	import { computeCommission, priceGuardrailLevel } from '$lib/utils/pricing';
	import type { PageData, ActionData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	const items = $derived(data.quote.quote_request_items ?? []);
	const isEditable = $derived(
		['pending', 'in_progress', 'quoted'].includes(data.quote.status)
	);
	const isQuoted = $derived(data.quote.status === 'quoted');
	const hasItems = $derived(items.length > 0);

	// Live per-row price/qty state for guardrails + commission preview.
	let quotedPrices = $state<Record<string, number>>({});
	let quantities = $state<Record<string, number>>({});
	let busy = $state(false);

	$effect(() => {
		const p: Record<string, number> = {};
		const q: Record<string, number> = {};
		for (const item of items) {
			p[item.id] = Number(item.quoted_price ?? item.pricing?.suggested_price ?? 0);
			q[item.id] = Number(item.quantity ?? 1);
		}
		quotedPrices = p;
		quantities = q;
	});

	function guardrail(itemId: string, pricing: any) {
		const price = quotedPrices[itemId] ?? 0;
		if (!pricing) return 'suggested';
		return priceGuardrailLevel(price, pricing.bg_cost, pricing.target_price, pricing.suggested_price);
	}
	function commission(itemId: string, pricing: any) {
		const price = quotedPrices[itemId] ?? 0;
		if (!pricing) return 0;
		return computeCommission(price, pricing.bg_cost, pricing.target_price, 50, 65);
	}

	const guardrailColors: Record<string, string> = {
		suggested: '#059669', 'above-target': '#16a34a', 'at-target': '#f59e0b',
		'below-target': '#ef4444', 'below-cost': '#991b1b'
	};
	const guardrailLabels: Record<string, string> = {
		suggested: 'At/above suggested', 'above-target': 'Above target', 'at-target': 'At target (floor)',
		'below-target': 'Below target — needs approval', 'below-cost': 'Below BG cost — exception only'
	};

	const totalCommission = $derived(
		items.reduce((s: number, it: any) => s + commission(it.id, it.pricing) * (quantities[it.id] ?? it.quantity ?? 1), 0)
	);
	const grandTotal = $derived(
		items.reduce((s: number, it: any) => s + (quotedPrices[it.id] ?? 0) * (quantities[it.id] ?? it.quantity ?? 1), 0)
	);
	const anyBelowTarget = $derived(
		items.some((it: any) => ['below-target', 'below-cost'].includes(guardrail(it.id, it.pricing)))
	);

	const handle = () => {
		busy = true;
		return async ({ update }: any) => { await update(); busy = false; };
	};
</script>

<svelte:head><title>Quote Builder | BG Clear</title></svelte:head>

<div class="quote-builder">
	<div class="header">
		<div>
			<a href="/rep/quotes" class="back-link">← Back to Quotes</a>
			<h1>Quote Builder</h1>
		</div>
		<StatusBadge status={data.quote.status} labels={QUOTE_STATUS_LABELS} colors={QUOTE_STATUS_COLORS} />
	</div>

	<div class="customer-card">
		<h3>{data.customer?.company_name || data.customer?.full_name || 'Unknown Customer'}</h3>
		<div class="customer-meta">
			{#if data.customer?.email}<span>{data.customer.email}</span>{/if}
			{#if data.customer?.phone}<span>{data.customer.phone}</span>{/if}
		</div>
		<span class="quote-date">Requested {formatDateTime(data.quote.created_at)}</span>
	</div>

	{#if isQuoted}
		<div class="info-banner">
			This quote was sent to the customer. You can still revise prices, quantities, and items, then re-send.
		</div>
	{/if}
	{#if form?.error}<div class="error-banner">{form.error}</div>{/if}
	{#if form?.sent}<div class="success-banner">Quote sent to the customer.</div>
	{:else if form?.saved}<div class="success-banner">Changes saved.</div>{/if}

	<!-- Editor grid: one form; remove buttons override the action via formaction. -->
	<form method="POST" action="?/saveQuote" use:enhance={handle}>
		<div class="items-table-wrap">
			<table class="items-table">
				<thead>
					<tr>
						<th>Product</th><th>Category</th><th>Qty</th>
						<th class="num">BG Cost</th><th class="num">Target</th><th class="num">Suggested</th>
						<th class="num">Your Price</th><th class="num">Commission</th><th>Status</th><th></th>
					</tr>
				</thead>
				<tbody>
					{#each items as item (item.id)}
						{@const pricing = item.pricing}
						{@const g = guardrail(item.id, pricing)}
						<tr>
							<td class="product-name">{item.products?.name ?? 'Unknown'}</td>
							<td><span class="cat-badge">{categoryLabel(item.products?.category ?? '', true)}</span></td>
							<td class="center">
								<input type="hidden" name="item_id" value={item.id} />
								{#if isEditable}
									<input class="qty-input" type="number" name="quantity" min="1"
										bind:value={quantities[item.id]} />
								{:else}{item.quantity}{/if}
							</td>
							<td class="num mono">{pricing ? formatCurrency(pricing.bg_cost) : '—'}</td>
							<td class="num mono target-col">{pricing ? formatCurrency(pricing.target_price) : '—'}</td>
							<td class="num mono suggested-col">{pricing ? formatCurrency(pricing.suggested_price) : '—'}</td>
							<td class="num">
								{#if isEditable}
									<input class="price-input" type="number" name="quoted_price" step="0.01" min="0"
										style="border-color: {guardrailColors[g]}"
										bind:value={quotedPrices[item.id]} />
								{:else}<span class="mono">{item.quoted_price ? formatCurrency(item.quoted_price) : '—'}</span>{/if}
							</td>
							<td class="num mono" style="color: {g === 'below-cost' ? '#991b1b' : '#059669'}">
								{formatCurrency(commission(item.id, pricing) * (quantities[item.id] ?? item.quantity ?? 1))}
							</td>
							<td>
								<span class="guardrail-badge" style="color: {guardrailColors[g]}; background: {guardrailColors[g]}18">
									{guardrailLabels[g] ?? g}
								</span>
							</td>
							<td>
								{#if isEditable}
									<button class="remove-btn" type="submit" formaction="?/removeItem"
										name="remove_item_id" value={item.id} disabled={busy}>Remove</button>
								{/if}
							</td>
						</tr>
					{/each}
					{#if !hasItems}
						<tr><td colspan="10" class="empty-row">No items yet — add one below.</td></tr>
					{/if}
				</tbody>
				{#if hasItems}
					<tfoot>
						<tr>
							<td colspan="6" class="total-label">Quote total</td>
							<td class="num mono total-value">{formatCurrency(grandTotal)}</td>
							<td class="num mono total-value">{formatCurrency(totalCommission)}</td>
							<td colspan="2"></td>
						</tr>
					</tfoot>
				{/if}
			</table>
		</div>

		{#if anyBelowTarget}
			<div class="approval-warning">
				One or more items are below target — the resulting order will require manager approval.
			</div>
		{/if}

		{#if isEditable && hasItems}
			<div class="actions">
				<button type="submit" class="btn-secondary" disabled={busy}>Save</button>
				<button type="submit" class="btn-primary" formaction="?/sendQuote" disabled={busy}>
					{busy ? 'Working…' : isQuoted ? 'Re-send to Customer' : 'Send Quote to Customer'}
				</button>
			</div>
		{/if}
	</form>

	<!-- Add item -->
	{#if isEditable}
		<form method="POST" action="?/addItem" class="add-form" use:enhance={handle}>
			<h3>Add an item</h3>
			<div class="add-row">
				<select name="product_id" required>
					<option value="" disabled selected>Select a product…</option>
					{#each data.catalog as p}
						<option value={p.id}>{p.name} — {categoryLabel(p.category, true)}</option>
					{/each}
				</select>
				<input class="qty-input" type="number" name="add_quantity" min="1" value="1" />
				<button type="submit" class="btn-secondary" disabled={busy}>+ Add</button>
			</div>
		</form>
	{/if}

	{#if isQuoted}
		<form method="POST" action="?/createOrder" use:enhance class="order-form">
			<button type="submit" class="btn-primary btn-green">
				Create Order Now {anyBelowTarget ? '(Requires Approval)' : ''}
			</button>
			<p class="order-note">Use this only for in-person closes — normally the customer accepts &amp; pays.</p>
		</form>
	{/if}
</div>

<style>
	.quote-builder { padding-bottom: var(--space-8); }
	.header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: var(--space-4); }
	.back-link { font-size: var(--text-small); color: var(--color-muted); display: block; margin-bottom: 0.25rem; }
	.header h1 { font-family: var(--font-heading); font-size: var(--text-h2); font-weight: 700; margin: 0; }

	.customer-card { background: var(--color-surface); border: 1px solid var(--color-border); border-radius: var(--radius-md); padding: var(--space-3); margin-bottom: var(--space-4); }
	.customer-card h3 { font-family: var(--font-heading); font-size: 1rem; font-weight: 700; margin: 0 0 0.25rem; }
	.customer-meta { display: flex; gap: var(--space-3); font-size: var(--text-small); color: var(--color-muted); }
	.quote-date { font-size: 0.75rem; color: var(--color-muted); }

	.items-table-wrap { overflow-x: auto; background: var(--color-surface); border: 1px solid var(--color-border); border-radius: var(--radius-md); margin-bottom: var(--space-3); }
	.items-table { width: 100%; border-collapse: collapse; font-size: var(--text-small); }
	.items-table th { text-align: left; padding: 0.75rem; border-bottom: 2px solid var(--color-border); font-weight: 600; white-space: nowrap; background: var(--color-border-subtle); }
	.items-table td { padding: 0.75rem; border-bottom: 1px solid var(--color-border-subtle); vertical-align: middle; }
	.items-table tfoot td { padding: 0.75rem; font-weight: 700; border-top: 2px solid var(--color-border); }
	.product-name { font-weight: 500; }
	.num { text-align: right; }
	.center { text-align: center; }
	.mono { font-variant-numeric: tabular-nums; }
	.cat-badge { font-size: 0.65rem; font-weight: 600; padding: 0.1rem 0.5rem; border-radius: var(--radius-pill); background: var(--color-border-subtle); white-space: nowrap; }
	.target-col { color: #b45309; }
	.suggested-col { color: #16a34a; }
	.empty-row { text-align: center; color: var(--color-muted); font-style: italic; }

	.price-input { width: 100px; padding: 0.375rem 0.5rem; border: 2px solid var(--color-border); border-radius: var(--radius-sm); font-size: var(--text-small); font-variant-numeric: tabular-nums; text-align: right; }
	.qty-input { width: 56px; padding: 0.375rem 0.4rem; border: 1px solid var(--color-border); border-radius: var(--radius-sm); font-size: var(--text-small); text-align: center; }
	.price-input:focus, .qty-input:focus { outline: none; box-shadow: 0 0 0 3px rgba(30, 58, 95, 0.1); }

	.guardrail-badge { font-size: 0.65rem; font-weight: 600; padding: 0.1rem 0.5rem; border-radius: var(--radius-pill); white-space: nowrap; }
	.remove-btn { background: none; border: none; color: #b3261e; font-size: 0.75rem; cursor: pointer; padding: 0.25rem; }
	.remove-btn:disabled { opacity: 0.4; cursor: not-allowed; }

	.total-label { text-align: right; }
	.total-value { font-size: 1rem; color: #059669; }

	.approval-warning { background: #fef3c7; color: #92400e; padding: var(--space-2) var(--space-3); border-radius: var(--radius-sm); font-size: var(--text-small); font-weight: 500; margin-bottom: var(--space-3); }
	.info-banner { background: var(--color-border-subtle); color: var(--color-text); padding: var(--space-2) var(--space-3); border-radius: var(--radius-sm); font-size: var(--text-small); margin-bottom: var(--space-3); }
	.success-banner { background: #d1fae5; color: #065f46; padding: var(--space-2) var(--space-3); border-radius: var(--radius-sm); font-size: var(--text-small); font-weight: 500; margin-bottom: var(--space-3); }
	.error-banner { background: #fee2e2; color: #991b1b; padding: var(--space-2) var(--space-3); border-radius: var(--radius-sm); font-size: var(--text-small); font-weight: 500; margin-bottom: var(--space-3); }

	.actions { display: flex; gap: var(--space-2); }
	.btn-primary, .btn-secondary { padding: 0.625rem 1.5rem; border: none; border-radius: var(--radius-sm); font-size: var(--text-small); font-weight: 600; font-family: var(--font-heading); cursor: pointer; }
	.btn-primary { background: var(--color-primary); color: white; }
	.btn-secondary { background: var(--color-surface); color: var(--color-ink); border: 1px solid var(--color-border); }
	.btn-primary:disabled, .btn-secondary:disabled { opacity: 0.6; cursor: not-allowed; }
	.btn-green { background: #059669; color: #fff; }

	.add-form { margin-top: var(--space-4); padding: var(--space-3); background: var(--color-surface); border: 1px solid var(--color-border); border-radius: var(--radius-md); }
	.add-form h3 { font-family: var(--font-heading); font-size: 0.9rem; font-weight: 700; margin: 0 0 var(--space-2); }
	.add-row { display: flex; gap: var(--space-2); align-items: center; flex-wrap: wrap; }
	.add-row select { flex: 1; min-width: 220px; padding: 0.45rem 0.5rem; border: 1px solid var(--color-border); border-radius: var(--radius-sm); font-size: var(--text-small); }

	.order-form { margin-top: var(--space-4); }
	.order-note { font-size: 0.7rem; color: var(--color-muted); margin: var(--space-1) 0 0; }
</style>
