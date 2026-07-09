<script lang="ts">
	import logo from '$lib/assets/bg-clear-logo-640.png';
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();
	let submitting = $state(false);
</script>

<svelte:head><title>Pay an Invoice | BG Clear</title></svelte:head>

<main class="pay-wrap">
	<div class="card">
		<img class="logo" src={logo} alt="BG Clear" />
		<h1>Pay an invoice</h1>
		<p class="lead">Enter your invoice number and the amount due, then continue to enter your card details.</p>

		{#if form?.error}
			<div class="form-error">{form.error}</div>
		{/if}

		<form method="POST" action="?/start" onsubmit={() => (submitting = true)}>
			<!-- Honeypot: hidden from real users, catches bots. -->
			<input class="hp" type="text" name="company_url" tabindex="-1" autocomplete="off" aria-hidden="true" />

			<label>
				Invoice number
				<input name="invoice_number" required placeholder="INV-123456" value={form?.values?.invoice_number ?? ''} />
			</label>
			<label>
				Amount due (USD)
				<div class="amount-input">
					<span>$</span>
					<input name="amount" type="number" step="0.01" min="0.01" required placeholder="0.00" value={form?.values?.amount ?? ''} />
				</div>
			</label>
			<label>
				Name <span class="opt">(optional)</span>
				<input name="customer_name" placeholder="Jane Doe" value={form?.values?.customer_name ?? ''} />
			</label>
			<label>
				Email <span class="opt">(optional — for your receipt)</span>
				<input name="customer_email" type="email" placeholder="jane@example.com" value={form?.values?.customer_email ?? ''} />
			</label>

			<button class="pay-btn" type="submit" disabled={submitting}>
				{submitting ? 'Starting secure checkout…' : 'Continue to payment →'}
			</button>
		</form>

		<p class="secure">
			<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
			Card payments are processed securely by Bank of America.
		</p>
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
	h1 {
		font-family: var(--font-heading);
		font-size: var(--text-h3, 1.35rem);
		font-weight: 700;
		margin: 0 0 0.5rem;
		color: var(--color-ink);
	}
	.lead {
		margin: 0 0 var(--space-4);
		font-size: var(--text-small);
		color: var(--color-muted);
	}
	.form-error {
		margin-bottom: var(--space-3);
		padding: var(--space-2) var(--space-3);
		background: #fdecea;
		color: #b3261e;
		border: 1px solid #f5c2c0;
		border-radius: var(--radius-sm);
		font-size: var(--text-small);
		text-align: left;
	}
	form {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
		text-align: left;
	}
	.hp {
		position: absolute;
		left: -9999px;
		width: 1px;
		height: 1px;
		opacity: 0;
	}
	label {
		display: flex;
		flex-direction: column;
		gap: 0.3rem;
		font-size: 0.75rem;
		font-weight: 600;
		color: var(--color-muted);
	}
	.opt {
		font-weight: 400;
	}
	input {
		padding: 0.6rem 0.7rem;
		border: 1px solid var(--color-border);
		border-radius: var(--radius-sm);
		font-size: var(--text-small);
		font-family: var(--font-body);
		width: 100%;
	}
	.amount-input {
		display: flex;
		align-items: center;
		gap: 0.4rem;
		border: 1px solid var(--color-border);
		border-radius: var(--radius-sm);
		padding-left: 0.7rem;
		background: var(--color-surface);
	}
	.amount-input span {
		color: var(--color-muted);
		font-weight: 600;
	}
	.amount-input input {
		border: none;
		padding-left: 0;
	}
	.amount-input input:focus {
		outline: none;
	}
	.pay-btn {
		margin-top: var(--space-2);
		width: 100%;
		padding: 0.9rem 1rem;
		background: var(--color-accent);
		color: var(--color-ink);
		border: none;
		border-radius: var(--radius-pill);
		font-weight: 700;
		font-size: 1rem;
		cursor: pointer;
		transition: filter 0.15s;
	}
	.pay-btn:hover {
		filter: brightness(0.95);
	}
	.pay-btn:disabled {
		opacity: 0.7;
		cursor: not-allowed;
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
