<script lang="ts">
	import type { PageData } from './$types';
	import { invalidate } from '$app/navigation';
	import { page } from '$app/state';
	import { onMount, onDestroy } from 'svelte';
	import { formatCurrency, formatDateTime } from '$lib/utils/format';

	let { data }: { data: PageData } = $props();

	const order = $derived(data.order);
	const payment = $derived(data.payment);

	// Terminal decisions stop polling. REVIEW we treat as terminal-for-now —
	// it'll get resolved out-of-band and the customer can refresh later.
	const isTerminal = $derived(
		payment?.decision === 'ACCEPT' ||
			payment?.decision === 'DECLINE' ||
			payment?.decision === 'REVIEW' ||
			payment?.decision === 'CANCEL' ||
			payment?.decision === 'ERROR'
	);

	// Poll: server-to-server callback from Cybersource races with the browser
	// landing here. If no payment row yet, refresh load() every 2s for up to
	// 30s. invalidate() re-runs the server load; SvelteKit re-renders.
	const POLL_INTERVAL_MS = 2000;
	const MAX_POLL_MS = 30_000;
	let pollTimer: ReturnType<typeof setInterval> | undefined;
	let pollStartedAt = 0;

	onMount(() => {
		if (isTerminal) return;
		pollStartedAt = Date.now();
		pollTimer = setInterval(async () => {
			if (Date.now() - pollStartedAt > MAX_POLL_MS) {
				clearInterval(pollTimer);
				return;
			}
			await invalidate(page.url.pathname);
			if (isTerminal) clearInterval(pollTimer);
		}, POLL_INTERVAL_MS);
	});

	onDestroy(() => {
		if (pollTimer) clearInterval(pollTimer);
	});
</script>

<svelte:head>
	<title>Payment Result | BG Clear</title>
</svelte:head>

<div class="result-page">
	<div class="card">
		{#if !payment}
			<div class="spinner"></div>
			<h1>Processing your payment…</h1>
			<p>
				We're waiting on confirmation from the bank. This usually takes a few seconds — please don't
				close this page.
			</p>
		{:else if payment.decision === 'ACCEPT'}
			<div class="icon success">✓</div>
			<h1>Payment received</h1>
			<p>
				Thank you. We've received <strong>{formatCurrency(payment.amount_cents / 100)}</strong> for invoice
				<strong>{order.order_number}</strong>.
			</p>
			{#if payment.card_brand || payment.card_last_four}
				<p class="muted">
					{payment.card_brand ?? 'Card'}{payment.card_last_four ? ` ending ••${payment.card_last_four}` : ''}
				</p>
			{/if}
			{#if payment.decision_at}
				<p class="muted">{formatDateTime(payment.decision_at)}</p>
			{/if}
			<a href="/catalog/orders/{order.id}" class="btn-secondary">Back to order</a>
		{:else if payment.decision === 'DECLINE'}
			<div class="icon fail">✕</div>
			<h1>Payment declined</h1>
			<p>The bank declined this transaction. No money has been taken.</p>
			{#if payment.reason_code}
				<p class="muted">Reason code: {payment.reason_code}</p>
			{/if}
			<a href="/catalog/orders/{order.id}/pay" class="btn-pay">Try again</a>
			<a href="/catalog/orders/{order.id}" class="back-link">Back to order</a>
		{:else if payment.decision === 'REVIEW'}
			<div class="icon review">!</div>
			<h1>Payment under review</h1>
			<p>
				Your payment is being reviewed by the bank. We'll update this page once a final decision
				comes through. No need to retry.
			</p>
			<a href="/catalog/orders/{order.id}" class="btn-secondary">Back to order</a>
		{:else}
			<div class="icon fail">✕</div>
			<h1>Payment could not be completed</h1>
			<p>
				Something went wrong with the payment ({payment.decision ?? payment.status}). You can try
				again or contact your sales rep.
			</p>
			<a href="/catalog/orders/{order.id}/pay" class="btn-pay">Try again</a>
		{/if}
	</div>
</div>

<style>
	.result-page {
		display: flex;
		justify-content: center;
		padding: var(--space-6) var(--space-3);
	}
	.card {
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		padding: var(--space-6);
		max-width: 500px;
		text-align: center;
		box-shadow: var(--shadow-md);
	}
	h1 {
		font-family: var(--font-heading);
		font-size: 1.5rem;
		font-weight: 700;
		color: var(--color-ink);
		margin: var(--space-3) 0 var(--space-2);
	}
	p {
		color: var(--color-text);
		font-size: var(--text-small);
		line-height: 1.5;
		margin: 0 0 var(--space-2);
	}
	.muted {
		color: var(--color-muted);
	}
	.icon {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 3rem;
		height: 3rem;
		border-radius: 50%;
		color: white;
		font-size: 1.5rem;
		font-weight: bold;
	}
	.icon.success {
		background: #059669;
	}
	.icon.fail {
		background: #dc2626;
	}
	.icon.review {
		background: #d97706;
	}
	.spinner {
		width: 2.5rem;
		height: 2.5rem;
		margin: 0 auto;
		border: 3px solid var(--color-border);
		border-top-color: var(--color-accent, #0d9488);
		border-radius: 50%;
		animation: spin 0.8s linear infinite;
	}
	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}
	.btn-pay,
	.btn-secondary {
		display: inline-block;
		padding: var(--space-2) var(--space-4);
		border-radius: var(--radius-sm);
		font-weight: 600;
		text-decoration: none;
		margin-top: var(--space-3);
	}
	.btn-pay {
		background: var(--color-accent, #0d9488);
		color: white;
	}
	.btn-secondary {
		background: var(--color-primary, #1e3a5f);
		color: white;
	}
	.back-link {
		display: block;
		margin-top: var(--space-2);
		color: var(--color-primary);
		font-size: var(--text-small);
		text-decoration: none;
	}
	.back-link:hover {
		text-decoration: underline;
	}
</style>
