<script lang="ts">
	import logo from '$lib/assets/bg-clear-logo-640.png';
	import { formatCurrency } from '$lib/utils/format';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	const inv = $derived(data.invoice);
</script>

<svelte:head><title>Pay Invoice {inv.invoice_number} | BG Clear</title></svelte:head>

<main class="pay-wrap">
	<div class="card">
		<img class="logo" src={logo} alt="BG Clear" />

		{#if inv.status === 'paid'}
			<div class="state paid">
				<div class="check">✓</div>
				<h1>This invoice is paid</h1>
				<p>Invoice {inv.invoice_number} has been paid in full. Thank you.</p>
			</div>
		{:else if inv.status === 'void'}
			<div class="state">
				<h1>This invoice is no longer available</h1>
				<p>Please contact your BG Clear representative for an updated link.</p>
			</div>
		{:else}
			<p class="eyebrow">Invoice {inv.invoice_number}</p>
			<h1>Pay your invoice</h1>
			<div class="summary">
				{#if inv.description}<p class="desc">{inv.description}</p>{/if}
				<div class="amount-row">
					<span>Amount due</span>
					<span class="amount">{formatCurrency(inv.amount)}</span>
				</div>
			</div>
			<a class="pay-btn" href={inv.pay_url} rel="external">Pay {formatCurrency(inv.amount)} securely →</a>
			<p class="secure">
				<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
				Card payments are processed securely by Bank of America.
			</p>
		{/if}
	</div>
	<p class="footer">Questions? Email <a href="mailto:customercare@bgclear.com">customercare@bgclear.com</a> or call (201) 765-7171.</p>
</main>

<style>
	.pay-wrap {
		min-height: 100vh;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: var(--space-4);
		padding: var(--space-4);
		background: var(--color-bg);
	}
	.card {
		width: 100%;
		max-width: 440px;
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		box-shadow: var(--shadow-md);
		padding: var(--space-6) var(--space-5);
		text-align: center;
	}
	.logo {
		height: 40px;
		width: auto;
		margin-bottom: var(--space-5);
	}
	.eyebrow {
		margin: 0 0 0.25rem;
		font-size: var(--text-small);
		font-weight: 600;
		color: var(--color-muted);
		text-transform: uppercase;
		letter-spacing: 0.04em;
	}
	h1 {
		font-family: var(--font-heading);
		font-size: var(--text-h3, 1.35rem);
		font-weight: 700;
		margin: 0 0 var(--space-4);
		color: var(--color-ink);
	}
	.summary {
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		padding: var(--space-3) var(--space-4);
		margin-bottom: var(--space-4);
		text-align: left;
		background: var(--color-bg);
	}
	.desc {
		margin: 0 0 var(--space-3);
		font-size: var(--text-small);
		color: var(--color-text);
	}
	.amount-row {
		display: flex;
		justify-content: space-between;
		align-items: baseline;
		border-top: 1px solid var(--color-border);
		padding-top: var(--space-3);
		font-size: var(--text-small);
		color: var(--color-muted);
	}
	.amount {
		font-family: var(--font-heading);
		font-size: 1.6rem;
		font-weight: 800;
		color: var(--color-primary);
		font-variant-numeric: tabular-nums;
	}
	.pay-btn {
		display: block;
		width: 100%;
		padding: 0.9rem 1rem;
		background: var(--color-accent);
		color: var(--color-ink);
		border-radius: var(--radius-pill);
		font-weight: 700;
		font-size: 1rem;
		text-decoration: none;
		transition: filter 0.15s;
	}
	.pay-btn:hover {
		filter: brightness(0.95);
	}
	.secure {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.4rem;
		margin: var(--space-3) 0 0;
		font-size: 0.75rem;
		color: var(--color-muted);
	}
	.state h1 {
		margin-top: var(--space-2);
	}
	.state p {
		font-size: var(--text-small);
		color: var(--color-muted);
		margin: 0;
	}
	.check {
		width: 48px;
		height: 48px;
		margin: 0 auto;
		border-radius: 50%;
		background: #e6f4ea;
		color: #1e7e34;
		font-size: 1.5rem;
		font-weight: 700;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	.footer {
		font-size: 0.75rem;
		color: var(--color-muted);
		text-align: center;
		margin: 0;
	}
	.footer a {
		color: var(--color-primary);
	}
</style>
