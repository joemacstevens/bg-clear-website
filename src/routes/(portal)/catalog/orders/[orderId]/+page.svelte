<script lang="ts">
	import type { PageData, ActionData } from './$types';
	import { enhance, applyAction } from '$app/forms';
	import StatusBadge from '$lib/components/portal/StatusBadge.svelte';
	import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '$lib/utils/statuses';
	import { formatDate, formatCurrency, formatOrderNumber } from '$lib/utils/format';

	let { data, form }: { data: PageData; form: ActionData } = $props();
	const order = $derived(data.order);

	// Payment state for the WooCommerce/CyberSource handoff.
	const isPaid = $derived(order.payment_collected || order.status === 'payment_collected');
	const canPay = $derived(order.status === 'approved' && !order.payment_collected);
	const awaitingApproval = $derived(order.status === 'pending_approval');

	let paying = $state(false);

	const statusTimeline = [
		'approved',
		'placed_with_supplier',
		'shipped',
		'delivered',
		'payment_collected'
	];

	const statusIndex = statusTimeline.indexOf(order.status);
</script>

<svelte:head>
	<title>Order {formatOrderNumber(order.order_number)} | BG Clear</title>
</svelte:head>

<div class="order-detail">
	<a href="/catalog/orders" class="back-link">&larr; Back to Orders</a>

	<div class="detail-header">
		<div>
			<h1>{formatOrderNumber(order.order_number)}</h1>
			<p class="detail-date">Placed {formatDate(order.created_at)}</p>
		</div>
		<StatusBadge
			status={order.status}
			labels={ORDER_STATUS_LABELS}
			colors={ORDER_STATUS_COLORS}
		/>
	</div>

	{#if order.status !== 'cancelled' && statusIndex >= 0}
		<div class="status-timeline">
			{#each statusTimeline as step, i}
				<div class="timeline-step" class:active={i <= statusIndex} class:current={i === statusIndex}>
					<div class="step-dot"></div>
					<span class="step-label">{ORDER_STATUS_LABELS[step as keyof typeof ORDER_STATUS_LABELS] ?? step}</span>
				</div>
			{/each}
		</div>
	{/if}

	{#if order.tracking_number}
		<div class="info-card">
			<h3>Tracking</h3>
			<p class="tracking-number">{order.tracking_number}</p>
		</div>
	{/if}

	{#if order.notes}
		<div class="info-card">
			<h3>Notes</h3>
			<p>{order.notes}</p>
		</div>
	{/if}

	<div class="items-section">
		<h3>Items</h3>
		<div class="items-table">
			<div class="table-header">
				<span class="col-product">Product</span>
				<span class="col-qty">Qty</span>
				<span class="col-price">Unit Price</span>
				<span class="col-subtotal">Subtotal</span>
			</div>
			{#each order.order_items ?? [] as item}
				<div class="table-row">
					<div class="col-product">
						<span class="product-name">{item.products?.name ?? 'Unknown'}</span>
						{#if item.products?.vendor_name}
							<span class="product-vendor">{item.products.vendor_name}</span>
						{/if}
					</div>
					<span class="col-qty">{item.quantity}</span>
					<span class="col-price">{formatCurrency(item.unit_price)}</span>
					<span class="col-subtotal">{formatCurrency(item.unit_price * item.quantity)}</span>
				</div>
			{/each}
		</div>
	</div>

	{#if order.subtotal != null}
		<div class="order-total">
			<div class="total-row">
				<span>Order Total</span>
				<strong>{formatCurrency(order.subtotal)}</strong>
			</div>
		</div>
	{/if}

	{#if form?.error}
		<div class="form-error">{form.error}</div>
	{/if}

	{#if isPaid}
		<div class="pay-card pay-paid">
			<span class="pay-check">✓</span> Payment received — your order is being processed.
		</div>
	{:else if awaitingApproval}
		<div class="pay-card pay-pending">
			This order is awaiting manager approval. You'll be able to pay once it's approved.
		</div>
	{:else if canPay}
		<form
			method="POST"
			action="?/payNow"
			class="pay-form"
			use:enhance={() => {
				paying = true;
				return async ({ result }) => {
					// The pay URL is on the Woo store (external origin) — do a full
					// browser navigation, since SvelteKit's goto() is same-origin only.
					if (result.type === 'redirect') {
						window.location.href = result.location;
						return;
					}
					await applyAction(result);
					paying = false;
				};
			}}
		>
			<button class="pay-btn" type="submit" disabled={paying}>
				{paying ? 'Connecting to secure checkout…' : 'Continue to Payment'}
			</button>
			<p class="pay-note">You'll be taken to our secure payment page to complete your order.</p>
		</form>
	{/if}
</div>

<style>
	.order-detail {
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

	.status-timeline {
		display: flex;
		justify-content: space-between;
		margin-bottom: var(--space-5);
		padding: var(--space-3) var(--space-4);
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		overflow-x: auto;
	}

	.timeline-step {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.5rem;
		flex: 1;
		position: relative;
	}

	.timeline-step:not(:last-child)::after {
		content: '';
		position: absolute;
		top: 0.5rem;
		left: calc(50% + 0.75rem);
		right: calc(-50% + 0.75rem);
		height: 2px;
		background: var(--color-border);
	}

	.timeline-step.active:not(:last-child)::after {
		background: var(--color-accent);
	}

	.step-dot {
		width: 1rem;
		height: 1rem;
		border-radius: 50%;
		background: var(--color-border);
		border: 2px solid var(--color-border);
		position: relative;
		z-index: 1;
	}

	.timeline-step.active .step-dot {
		background: var(--color-accent);
		border-color: var(--color-accent);
	}

	.timeline-step.current .step-dot {
		box-shadow: 0 0 0 4px var(--color-accent-light);
	}

	.step-label {
		font-size: 0.65rem;
		font-weight: 500;
		color: var(--color-muted);
		text-align: center;
		white-space: nowrap;
	}

	.timeline-step.active .step-label {
		color: var(--color-accent);
		font-weight: 600;
	}

	.info-card {
		padding: var(--space-3);
		margin-bottom: var(--space-3);
		background: var(--color-border-subtle);
		border-radius: var(--radius-md);
	}

	.info-card h3 {
		font-family: var(--font-heading);
		font-size: var(--text-small);
		font-weight: 700;
		color: var(--color-ink);
		margin: 0 0 var(--space-1);
	}

	.info-card p {
		margin: 0;
		font-size: var(--text-small);
		color: var(--color-text);
	}

	.tracking-number {
		font-family: monospace;
		font-weight: 600;
	}

	.items-section {
		margin-top: var(--space-4);
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
		grid-template-columns: 1fr 60px 100px 100px;
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
		grid-template-columns: 1fr 60px 100px 100px;
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

	.col-product .product-vendor {
		font-size: 0.7rem;
		color: var(--color-muted);
	}

	.col-qty {
		text-align: center;
		font-size: var(--text-small);
	}

	.col-price, .col-subtotal {
		text-align: right;
		font-size: var(--text-small);
		font-weight: 500;
		color: var(--color-ink);
	}

	.order-total {
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

	.form-error {
		margin-top: var(--space-3);
		padding: var(--space-3) var(--space-4);
		background: #fdecea;
		color: #b3261e;
		border: 1px solid #f5c2c0;
		border-radius: var(--radius-md);
		font-size: var(--text-small);
	}

	.pay-form {
		margin-top: var(--space-4);
		text-align: center;
	}

	.pay-btn {
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

	.pay-btn:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.pay-note {
		margin: var(--space-2) 0 0;
		font-size: 0.75rem;
		color: var(--color-muted);
	}

	.pay-card {
		margin-top: var(--space-4);
		padding: var(--space-3) var(--space-4);
		border-radius: var(--radius-md);
		font-size: var(--text-small);
		line-height: 1.5;
	}

	.pay-paid {
		background: #e6f4ea;
		color: #1e7e34;
		border: 1px solid #b7dfc2;
	}

	.pay-check {
		font-weight: 700;
	}

	.pay-pending {
		background: var(--color-border-subtle);
		color: var(--color-text);
		border: 1px solid var(--color-border);
	}

	@media (max-width: 640px) {
		.detail-header {
			flex-direction: column;
			gap: var(--space-2);
		}
		.table-header,
		.table-row {
			grid-template-columns: 1fr 50px 80px 80px;
			font-size: 0.75rem;
		}
		.status-timeline {
			gap: 0;
		}
		.step-label {
			font-size: 0.6rem;
		}
	}
</style>
