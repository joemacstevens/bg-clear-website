<script lang="ts">
	import type { PageData, ActionData } from './$types';
	import { enhance } from '$app/forms';
	import StatusBadge from '$lib/components/portal/StatusBadge.svelte';
	import { formatDate, formatDateTime, formatCurrency } from '$lib/utils/format';
	import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '$lib/utils/statuses';

	let { data, form }: { data: PageData; form: ActionData } = $props();
	const order = $derived(data.order);
	const payments = $derived(data.payments);

	let retrying = $state(false);

	const wooStatusColors: Record<string, string> = {
		not_synced: '#94a3b8',
		in_progress: '#0891b2',
		synced: '#059669',
		failed: '#dc2626'
	};
	const wooStatusLabels: Record<string, string> = {
		not_synced: 'Not Synced',
		in_progress: 'In Progress',
		synced: 'Synced',
		failed: 'Failed'
	};

	const paymentColors: Record<string, string> = {
		ACCEPT: '#059669',
		DECLINE: '#dc2626',
		REVIEW: '#d97706',
		ERROR: '#dc2626',
		CANCEL: '#94a3b8'
	};
</script>

<svelte:head>
	<title>Order {order.order_number} | Admin | BG Clear</title>
</svelte:head>

<div class="order-detail-page">
	<header class="page-header">
		<div>
			<div class="breadcrumbs">
				<a href="/admin/approvals">Approvals</a>
				<span class="separator">/</span>
				{order.order_number}
			</div>
			<h1>Order {order.order_number}</h1>
			<p class="meta">Placed {formatDate(order.created_at)}</p>
		</div>
		<StatusBadge
			status={order.status}
			labels={ORDER_STATUS_LABELS}
			colors={ORDER_STATUS_COLORS}
		/>
	</header>

	<section class="card">
		<h2>WooCommerce Sync</h2>
		<div class="woo-status-row">
			<StatusBadge
				status={order.woo_sync_status}
				labels={wooStatusLabels}
				colors={wooStatusColors}
			/>
			{#if order.woo_order_id}
				<span class="muted">Woo order #{order.woo_order_id}</span>
			{/if}
			{#if order.woo_synced_at}
				<span class="muted">Synced {formatDateTime(order.woo_synced_at)}</span>
			{/if}
		</div>

		<div class="woo-meta">
			<div>
				<span class="label-text">Attempts</span>
				<span>{order.woo_sync_attempts}</span>
			</div>
			<div>
				<span class="label-text">Last Attempt</span>
				<span>{order.woo_last_attempt_at ? formatDateTime(order.woo_last_attempt_at) : '-'}</span>
			</div>
		</div>

		{#if order.woo_sync_error}
			<div class="error-box">
				<span class="label-text">Last Error</span>
				<pre>{order.woo_sync_error}</pre>
			</div>
		{/if}

		{#if order.woo_sync_status === 'failed'}
			<form
				method="POST"
				action="?/retryWooSync"
				use:enhance={() => {
					retrying = true;
					return async ({ update }) => {
						await update();
						retrying = false;
					};
				}}
			>
				<input type="hidden" name="orderId" value={order.id} />
				<button type="submit" class="btn-primary" disabled={retrying}>
					{retrying ? 'Retrying…' : 'Retry Woo Sync'}
				</button>
			</form>
		{/if}

		{#if form?.success && form?.wooSync === 'synced'}
			<p class="success-msg">Successfully pushed to WooCommerce.</p>
		{:else if form?.error}
			<p class="error-msg">{form.error}</p>
		{/if}
	</section>

	<section class="card">
		<h2>Customer</h2>
		<div class="info-grid">
			<div>
				<span class="label-text">Name</span>
				<span>{order.customer?.full_name ?? '-'}</span>
			</div>
			<div>
				<span class="label-text">Company</span>
				<span>{order.customer?.company_name ?? '-'}</span>
			</div>
			<div>
				<span class="label-text">Email</span>
				<span>{order.customer?.email ?? '-'}</span>
			</div>
			<div>
				<span class="label-text">Phone</span>
				<span>{order.customer?.phone ?? '-'}</span>
			</div>
			<div>
				<span class="label-text">Rep</span>
				<span>{order.rep?.full_name ?? order.rep?.email ?? '-'}</span>
			</div>
		</div>
	</section>

	<section class="card">
		<h2>Items</h2>
		<table class="items-table">
			<thead>
				<tr>
					<th>Product</th>
					<th>Vendor</th>
					<th>SKU</th>
					<th class="num">Qty</th>
					<th class="num">Unit Price</th>
					<th class="num">Subtotal</th>
				</tr>
			</thead>
			<tbody>
				{#each order.order_items ?? [] as item}
					<tr>
						<td>{item.products?.name ?? 'Unknown'}</td>
						<td>{item.products?.vendor_name ?? '-'}</td>
						<td><code>{item.products?.sku ?? '-'}</code></td>
						<td class="num">{item.quantity}</td>
						<td class="num">{formatCurrency(item.unit_price)}</td>
						<td class="num">{formatCurrency(item.unit_price * item.quantity)}</td>
					</tr>
				{/each}
			</tbody>
			<tfoot>
				<tr>
					<td colspan="5" class="num"><strong>Total</strong></td>
					<td class="num"><strong>{formatCurrency(order.subtotal ?? 0)}</strong></td>
				</tr>
			</tfoot>
		</table>
	</section>

	<section class="card">
		<h2>Payments</h2>
		{#if payments.length === 0}
			<p class="muted">No payments recorded.</p>
		{:else}
			<table class="items-table">
				<thead>
					<tr>
						<th>Date</th>
						<th>Decision</th>
						<th class="num">Amount</th>
						<th>Card</th>
						<th>Transaction</th>
					</tr>
				</thead>
				<tbody>
					{#each payments as p}
						<tr>
							<td>{p.decision_at ? formatDateTime(p.decision_at) : formatDateTime(p.created_at)}</td>
							<td>
								{#if p.decision}
									<span class="pill" style="background:{paymentColors[p.decision] ?? '#94a3b8'}">
										{p.decision}
									</span>
								{:else}
									<span class="muted">{p.status}</span>
								{/if}
							</td>
							<td class="num">{formatCurrency(p.amount_cents / 100)}</td>
							<td>{p.card_brand ?? '-'} {p.card_last_four ? `••${p.card_last_four}` : ''}</td>
							<td><code>{p.cybersource_transaction_id ?? '-'}</code></td>
						</tr>
					{/each}
				</tbody>
			</table>
		{/if}
	</section>
</div>

<style>
	.order-detail-page {
		padding-bottom: var(--space-8);
	}

	.page-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: var(--space-5);
		gap: var(--space-3);
	}

	.breadcrumbs {
		color: var(--color-muted);
		font-size: var(--text-small);
		margin-bottom: var(--space-1);
	}
	.breadcrumbs a {
		color: var(--color-primary);
		text-decoration: none;
	}
	.breadcrumbs a:hover {
		text-decoration: underline;
	}
	.separator {
		margin: 0 var(--space-1);
	}

	h1 {
		font-family: var(--font-heading);
		font-size: var(--text-h2);
		font-weight: 700;
		color: var(--color-ink);
		margin: 0;
	}
	.meta {
		color: var(--color-muted);
		font-size: var(--text-small);
		margin: var(--space-1) 0 0;
	}

	.card {
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		padding: var(--space-4);
		margin-bottom: var(--space-3);
	}

	.card h2 {
		font-family: var(--font-heading);
		font-size: 1rem;
		font-weight: 700;
		color: var(--color-ink);
		margin: 0 0 var(--space-3);
	}

	.woo-status-row {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		margin-bottom: var(--space-3);
		flex-wrap: wrap;
	}

	.woo-meta {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: var(--space-2);
		margin-bottom: var(--space-3);
	}

	.label-text {
		display: block;
		font-size: 0.7rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--color-muted);
		margin-bottom: 0.125rem;
	}

	.error-box {
		background: #fef2f2;
		border: 1px solid #fecaca;
		border-radius: var(--radius-sm);
		padding: var(--space-2);
		margin-bottom: var(--space-3);
	}
	.error-box pre {
		margin: 0;
		font-family: monospace;
		font-size: 0.75rem;
		white-space: pre-wrap;
		word-break: break-word;
		color: #991b1b;
	}

	.btn-primary {
		background: var(--color-primary);
		color: white;
		border: none;
		padding: var(--space-2) var(--space-3);
		border-radius: var(--radius-sm);
		font-weight: 600;
		cursor: pointer;
		font-size: var(--text-small);
	}
	.btn-primary:hover:not(:disabled) {
		background: var(--color-primary-dark);
	}
	.btn-primary:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.success-msg {
		color: #059669;
		font-size: var(--text-small);
		margin: var(--space-2) 0 0;
	}
	.error-msg {
		color: #dc2626;
		font-size: var(--text-small);
		margin: var(--space-2) 0 0;
	}

	.info-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
		gap: var(--space-3);
	}

	.items-table {
		width: 100%;
		border-collapse: collapse;
		font-size: var(--text-small);
	}
	.items-table th {
		text-align: left;
		font-weight: 600;
		font-size: 0.7rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--color-muted);
		padding: var(--space-2);
		border-bottom: 1px solid var(--color-border);
	}
	.items-table td {
		padding: var(--space-2);
		border-bottom: 1px solid var(--color-border);
	}
	.items-table th.num,
	.items-table td.num {
		text-align: right;
	}
	.items-table tfoot td {
		border-bottom: none;
		padding-top: var(--space-3);
	}
	.items-table code {
		font-family: monospace;
		font-size: 0.75rem;
		color: var(--color-text);
	}

	.muted {
		color: var(--color-muted);
		font-size: var(--text-small);
	}

	.pill {
		display: inline-block;
		padding: 0.125rem 0.5rem;
		border-radius: var(--radius-pill);
		color: white;
		font-size: 0.7rem;
		font-weight: 600;
	}
</style>
