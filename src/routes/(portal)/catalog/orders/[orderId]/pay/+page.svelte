<script lang="ts">
	import type { PageData } from './$types';
	import { onMount } from 'svelte';
	import { formatCurrency } from '$lib/utils/format';

	let { data }: { data: PageData } = $props();
	let formEl: HTMLFormElement | undefined = $state();

	onMount(() => {
		// Auto-submit to Cybersource on mount. Customer sees the "redirecting"
		// state for a beat, then the hosted payment page takes over.
		formEl?.submit();
	});
</script>

<svelte:head>
	<title>Redirecting to secure payment | BG Clear</title>
</svelte:head>

<div class="redirect-page">
	<div class="card">
		<div class="spinner"></div>
		<h1>Redirecting to secure payment…</h1>
		<p>
			You're being sent to our Bank of America secure payment page to pay invoice
			<strong>{data.orderNumber}</strong> for
			<strong>{formatCurrency(data.amountCents / 100)}</strong>.
		</p>
		<p class="muted">
			If you are not redirected automatically, click the button below.
		</p>

		<form bind:this={formEl} method="POST" action={data.formAction}>
			{#each Object.entries(data.fields) as [name, value]}
				<input type="hidden" {name} {value} />
			{/each}
			<button type="submit" class="btn-pay">Continue to Payment</button>
		</form>
	</div>
</div>

<style>
	.redirect-page {
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
		font-size: 1.25rem;
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
		margin-bottom: var(--space-3);
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

	.btn-pay {
		background: var(--color-accent, #0d9488);
		color: white;
		padding: var(--space-2) var(--space-4);
		border: none;
		border-radius: var(--radius-sm);
		font-weight: 600;
		font-size: var(--text-base);
		cursor: pointer;
	}
	.btn-pay:hover {
		background: var(--color-primary-dark, #0f2744);
	}
</style>
