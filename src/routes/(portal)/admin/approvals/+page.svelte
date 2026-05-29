<script lang="ts">
	import type { PageData, ActionData } from './$types';
	import { enhance } from '$app/forms';
	import { toasts } from '$lib/stores/toast';
	import EmptyState from '$lib/components/portal/EmptyState.svelte';
	import { formatDate, formatCurrency } from '$lib/utils/format';
	import { isPriceBelowTarget, isPriceBelowBgCost } from '$lib/utils/pricing';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	$effect(() => {
		if (form?.success) {
			if (form.action === 'approve') toasts.success('Order approved successfully');
			else toasts.success('Order rejected successfully');
		}
		if (form?.error) {
			toasts.error(form.error);
		}
	});

	let activeOrderId = $state<string | null>(null);
	let notes = $state<string>('');

	function toggleDetails(orderId: string) {
		activeOrderId = activeOrderId === orderId ? null : orderId;
		notes = ''; // Reset notes when switching orders
	}
</script>

<div class="approvals-page">
	<header class="page-header">
		<div>
			<h1>Approval Queue</h1>
			<p class="text-muted">Review orders flagged for below-target pricing.</p>
		</div>
		<div class="header-stats">
			<span class="count-badge">{data.orders?.length || 0} Pending</span>
		</div>
	</header>

	{#if data.orders && data.orders.length > 0}
		<div class="orders-list">
			{#each data.orders as order}
				<div class="order-card {activeOrderId === order.id ? 'active' : ''}">
					<div class="order-header" role="button" tabindex="0" onclick={() => toggleDetails(order.id)} onkeydown={(e) => e.key === 'Enter' && toggleDetails(order.id)}>
						<div class="order-main">
							<div class="order-title">
								<h2>Order #{order.order_number}</h2>
								<span class="date">{formatDate(order.created_at)}</span>
							</div>
							<div class="order-meta">
								<span class="rep-name">Rep: {order.profiles?.full_name || order.profiles?.email || 'Unknown'}</span>
								<span class="subtotal">Total: {formatCurrency(order.subtotal || 0)}</span>
								{#if (order as any).isNewCustomer}
									<span class="new-customer-pill" title="First-time customer">NEW CUSTOMER</span>
								{/if}
								<a href="/admin/orders/{order.id}" class="detail-link" onclick={(e) => e.stopPropagation()}>View detail →</a>
							</div>
						</div>
						<div class="order-toggle">
							<svg class="chevron {activeOrderId === order.id ? 'open' : ''}" viewBox="0 0 20 20" fill="currentColor">
								<path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
							</svg>
						</div>
					</div>

					{#if activeOrderId === order.id}
						<div class="order-details">
							<div class="items-table-container">
								<table class="items-table">
									<thead>
										<tr>
											<th>Product</th>
											<th class="text-right">Qty</th>
											<th class="text-right">Unit Price</th>
											<th class="text-right">Target Price</th>
											<th class="text-right">BG Cost</th>
											<th>Status</th>
										</tr>
									</thead>
									<tbody>
										{#each order.order_items as item}
											{@const belowTarget = isPriceBelowTarget(item.unit_price, item.target_price)}
											{@const belowCost = isPriceBelowBgCost(item.unit_price, item.bg_cost)}
											<tr class="{belowCost ? 'row-critical' : belowTarget ? 'row-warning' : ''}">
												<td>
													<div class="product-info">
														<strong>{item.products?.name || 'Unknown Product'}</strong>
														<span class="sku">{item.products?.sku || ''}</span>
													</div>
												</td>
												<td class="text-right">{item.quantity}</td>
												<td class="text-right"><strong>{formatCurrency(item.unit_price)}</strong></td>
												<td class="text-right">{formatCurrency(item.target_price)}</td>
												<td class="text-right">{formatCurrency(item.bg_cost)}</td>
												<td>
													{#if belowCost}
														<span class="status-pill critical">Below Cost</span>
													{:else if belowTarget}
														<span class="status-pill warning">Below Target</span>
													{:else}
														<span class="status-pill ok">OK</span>
													{/if}
												</td>
											</tr>
										{/each}
									</tbody>
								</table>
							</div>

							<div class="approval-actions-card">
								<div class="notes-field">
									<label for="notes-{order.id}">Approval Notes (Required for Rejection)</label>
									<textarea 
										id="notes-{order.id}" 
										bind:value={notes} 
										placeholder="Add context for approval or reason for rejection..."
										rows="3"
									></textarea>
								</div>
								<div class="action-buttons">
									<form method="POST" action="?/reject" use:enhance class="inline-form">
										<input type="hidden" name="orderId" value={order.id} />
										<input type="hidden" name="notes" value={notes} />
										<button type="submit" class="btn btn-danger" disabled={!notes.trim()}>
											Reject Order
										</button>
									</form>
									<form method="POST" action="?/approve" use:enhance class="inline-form">
										<input type="hidden" name="orderId" value={order.id} />
										<input type="hidden" name="notes" value={notes} />
										<button type="submit" class="btn btn-success">
											Approve Order
										</button>
									</form>
								</div>
							</div>
						</div>
					{/if}
				</div>
			{/each}
		</div>
	{:else}
		<EmptyState 
			message="No orders currently pending approval." 
			actionLabel="View All Orders" 
			actionHref="/admin" 
		/>
	{/if}
</div>

<style>
	.approvals-page {
		display: flex;
		flex-direction: column;
		gap: var(--space-6);
	}

	.page-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.page-header h1 {
		margin: 0;
		font-family: var(--font-heading);
		font-size: 1.5rem;
		color: var(--color-ink);
	}

	.text-muted {
		color: var(--color-muted);
		margin: 0;
	}

	.count-badge {
		background: #f9731618;
		color: #c2410c;
		padding: var(--space-1) var(--space-3);
		border-radius: 999px;
		font-size: 0.875rem;
		font-weight: 600;
		border: 1px solid #f9731633;
	}

	.orders-list {
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
	}

	.order-card {
		background: var(--color-surface);
		border-radius: var(--radius-md);
		border: 1px solid var(--color-border);
		overflow: hidden;
		transition: border-color 0.2s;
	}

	.order-card.active {
		border-color: var(--color-primary);
		box-shadow: var(--shadow-sm);
	}

	.order-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: var(--space-4);
		cursor: pointer;
		user-select: none;
		background: var(--color-surface);
	}

	.order-header:hover {
		background: var(--color-bg);
	}

	.order-main {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
	}

	.order-title {
		display: flex;
		align-items: baseline;
		gap: var(--space-3);
	}

	.order-title h2 {
		margin: 0;
		font-size: 1.125rem;
		color: var(--color-ink);
	}

	.date {
		font-size: 0.875rem;
		color: var(--color-muted);
	}

	.order-meta {
		display: flex;
		gap: var(--space-4);
		font-size: 0.875rem;
	}

	.rep-name {
		color: var(--color-muted);
	}

	.subtotal {
		font-weight: 600;
		color: var(--color-ink);
	}

	.detail-link {
		color: var(--color-primary);
		font-size: var(--text-small);
		text-decoration: none;
		font-weight: 500;
	}
	.detail-link:hover {
		text-decoration: underline;
	}

	.new-customer-pill {
		display: inline-block;
		padding: 0.125rem 0.5rem;
		border-radius: var(--radius-pill);
		background: var(--color-accent, #d4a234);
		color: white;
		font-size: 0.6rem;
		font-weight: 700;
		letter-spacing: 0.05em;
		text-transform: uppercase;
	}

	.chevron {
		width: 1.25rem;
		height: 1.25rem;
		color: var(--color-muted);
		transition: transform 0.2s;
	}

	.chevron.open {
		transform: rotate(180deg);
	}

	.order-details {
		border-top: 1px solid var(--color-border);
		padding: var(--space-4);
		background: var(--color-bg);
		display: flex;
		flex-direction: column;
		gap: var(--space-6);
	}

	.items-table-container {
		background: var(--color-surface);
		border-radius: var(--radius-sm);
		border: 1px solid var(--color-border);
		overflow-x: auto;
	}

	.items-table {
		width: 100%;
		border-collapse: collapse;
		text-align: left;
		font-size: 0.875rem;
	}

	.items-table th,
	.items-table td {
		padding: var(--space-3) var(--space-4);
		border-bottom: 1px solid var(--color-border);
	}

	.items-table th {
		background: var(--color-bg);
		font-weight: 600;
		font-size: 0.75rem;
		color: var(--color-muted);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.text-right {
		text-align: right;
	}

	.product-info {
		display: flex;
		flex-direction: column;
	}

	.sku {
		font-size: 0.75rem;
		color: var(--color-muted);
	}

	.row-warning {
		background: #fef3c7;
	}

	.row-critical {
		background: #fee2e2;
	}

	.status-pill {
		display: inline-flex;
		padding: 0.125rem 0.5rem;
		border-radius: 999px;
		font-size: 0.7rem;
		font-weight: 600;
		white-space: nowrap;
	}

	.status-pill.ok {
		background: #dcfce7;
		color: #166534;
	}

	.status-pill.warning {
		background: #ffedd5;
		color: #9a3412;
	}

	.status-pill.critical {
		background: #fecaca;
		color: #991b1b;
	}

	.approval-actions-card {
		background: var(--color-surface);
		padding: var(--space-4);
		border-radius: var(--radius-sm);
		border: 1px solid var(--color-border);
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
	}

	.notes-field {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	.notes-field label {
		font-size: 0.875rem;
		font-weight: 600;
		color: var(--color-ink);
	}

	textarea {
		width: 100%;
		padding: var(--space-3);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-sm);
		font-family: inherit;
		font-size: 0.875rem;
		resize: vertical;
	}

	textarea:focus {
		outline: none;
		border-color: var(--color-primary);
		box-shadow: 0 0 0 1px var(--color-primary);
	}

	.action-buttons {
		display: flex;
		justify-content: flex-end;
		gap: var(--space-3);
	}

	.inline-form {
		margin: 0;
	}

	.btn {
		padding: var(--space-2) var(--space-4);
		border-radius: var(--radius-md);
		font-weight: 600;
		cursor: pointer;
		font-size: 0.875rem;
		border: none;
		transition: opacity 0.2s;
	}

	.btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.btn:not(:disabled):hover {
		opacity: 0.9;
	}

	.btn-success {
		background: #10b981;
		color: white;
	}

	.btn-danger {
		background: #ef4444;
		color: white;
	}
</style>
