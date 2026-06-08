<script lang="ts">
	import { enhance } from '$app/forms';
	import EmptyState from '$lib/components/portal/EmptyState.svelte';
	import { formatDate } from '$lib/utils/format';
	import type { PageData, ActionData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let showForm = $state(false);
	let submitting = $state(false);

	// Open the form automatically if a submit failed (so the error + values show).
	$effect(() => {
		if (form && !form.success && form.error) showForm = true;
	});
</script>

<svelte:head><title>My Customers | BG Clear</title></svelte:head>

<div class="customers-page">
	<div class="page-header">
		<h1>My Customers</h1>
		<button class="new-btn" onclick={() => (showForm = !showForm)}>
			{showForm ? 'Close' : '+ New Customer'}
		</button>
	</div>

	{#if form?.success}
		<div class="success-panel">
			<strong>✓ Account created for {form.createdEmail}</strong>
			<p>Share these temporary sign-in details with the customer (they can reset the password later):</p>
			{#if form.accountNumber}
				<div class="cred-row"><span>Account #</span><code>{form.accountNumber}</code></div>
			{/if}
			<div class="cred-row"><span>Email</span><code>{form.createdEmail}</code></div>
			<div class="cred-row"><span>Temp password</span><code>{form.tempPassword}</code></div>
			{#if form.createdId}
				<a class="build-now-btn" href="/rep/customers/{form.createdId}">Open customer &amp; build a quote →</a>
			{/if}
		</div>
	{/if}

	{#if showForm}
		<form
			method="POST"
			action="?/createCustomer"
			class="new-customer-form"
			use:enhance={() => {
				submitting = true;
				return async ({ update }) => {
					await update();
					submitting = false;
				};
			}}
		>
			<h3>Create a customer account</h3>
			{#if form?.error}
				<div class="form-error">{form.error}</div>
			{/if}
			<div class="field-grid">
				<label>
					Full name *
					<input name="full_name" required value={form?.values?.full_name ?? ''} />
				</label>
				<label>
					Company
					<input name="company_name" value={form?.values?.company_name ?? ''} />
				</label>
				<label>
					Email *
					<input name="email" type="email" required value={form?.values?.email ?? ''} />
				</label>
				<label>
					Phone
					<input name="phone" type="tel" value={form?.values?.phone ?? ''} />
				</label>
			</div>
			<button class="submit-btn" type="submit" disabled={submitting}>
				{submitting ? 'Creating…' : 'Create Account'}
			</button>
		</form>
	{/if}

	{#if data.customers.length === 0}
		<EmptyState message="No customers yet. Create one above, or they'll appear here once assigned to you." />
	{:else}
		<div class="customer-grid">
			{#each data.customers as customer}
				<a href="/rep/customers/{customer.id}" class="customer-card">
					<div class="avatar">
						{(customer.company_name || customer.full_name || '?').charAt(0).toUpperCase()}
					</div>
					<div class="customer-info">
						<span class="company">{customer.company_name || '—'}</span>
						<span class="name">{customer.full_name}</span>
						{#if (customer as any).account_number}<span class="acct">{(customer as any).account_number}</span>{/if}
						<span class="contact">{customer.email}</span>
						{#if customer.phone}<span class="contact">{customer.phone}</span>{/if}
					</div>
					<span class="joined">Since {formatDate(customer.created_at)}</span>
				</a>
			{/each}
		</div>
	{/if}
</div>

<style>
	.page-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: var(--space-4);
	}
	.customers-page h1 {
		font-family: var(--font-heading);
		font-size: var(--text-h2);
		font-weight: 700;
		margin: 0;
	}
	.new-btn {
		font-size: 0.8rem;
		font-weight: 600;
		padding: 0.5rem 1rem;
		border-radius: var(--radius-pill);
		border: 1px solid var(--color-primary);
		background: var(--color-primary);
		color: white;
		cursor: pointer;
	}

	.success-panel {
		margin-bottom: var(--space-4);
		padding: var(--space-3) var(--space-4);
		background: #e6f4ea;
		border: 1px solid #b7dfc2;
		border-radius: var(--radius-md);
		color: #1e7e34;
	}
	.success-panel p {
		margin: var(--space-2) 0;
		font-size: var(--text-small);
		color: var(--color-text);
	}
	.success-hint {
		font-style: italic;
	}
	.build-now-btn {
		display: inline-block;
		margin-top: var(--space-2);
		padding: 0.55rem 1.1rem;
		background: var(--color-accent);
		color: var(--color-ink);
		border-radius: var(--radius-pill);
		font-weight: 700;
		font-size: var(--text-small);
		text-decoration: none;
	}
	.cred-row {
		display: flex;
		gap: var(--space-2);
		align-items: center;
		font-size: var(--text-small);
		margin: 0.25rem 0;
	}
	.cred-row span {
		width: 110px;
		color: var(--color-muted);
	}
	.cred-row code {
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-sm);
		padding: 0.15rem 0.5rem;
		font-family: monospace;
		font-weight: 600;
		color: var(--color-ink);
	}

	.new-customer-form {
		margin-bottom: var(--space-4);
		padding: var(--space-4);
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
	}
	.new-customer-form h3 {
		font-family: var(--font-heading);
		font-size: 1rem;
		font-weight: 700;
		margin: 0 0 var(--space-3);
	}
	.form-error {
		margin-bottom: var(--space-3);
		padding: var(--space-2) var(--space-3);
		background: #fdecea;
		color: #b3261e;
		border: 1px solid #f5c2c0;
		border-radius: var(--radius-sm);
		font-size: var(--text-small);
	}
	.field-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: var(--space-3);
		margin-bottom: var(--space-3);
	}
	.field-grid label {
		display: flex;
		flex-direction: column;
		gap: 0.3rem;
		font-size: 0.75rem;
		font-weight: 600;
		color: var(--color-muted);
	}
	.field-grid input {
		padding: 0.5rem 0.6rem;
		border: 1px solid var(--color-border);
		border-radius: var(--radius-sm);
		font-size: var(--text-small);
		font-family: var(--font-body);
	}
	.submit-btn {
		font-size: 0.8rem;
		font-weight: 600;
		padding: 0.55rem 1.2rem;
		border-radius: var(--radius-pill);
		border: none;
		background: var(--color-accent);
		color: var(--color-ink);
		cursor: pointer;
	}
	.submit-btn:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.customer-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
		gap: var(--space-3);
	}
	.customer-card {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		padding: var(--space-3);
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		text-decoration: none;
		color: inherit;
		transition: all 0.15s;
	}
	.customer-card:hover {
		box-shadow: var(--shadow-sm);
		border-color: var(--color-primary);
	}
	.avatar {
		width: 48px;
		height: 48px;
		border-radius: 50%;
		background: var(--color-primary);
		color: white;
		display: flex;
		align-items: center;
		justify-content: center;
		font-family: var(--font-heading);
		font-weight: 700;
		font-size: 1.25rem;
		flex-shrink: 0;
	}
	.customer-info {
		flex: 1;
		display: flex;
		flex-direction: column;
	}
	.company {
		font-weight: 600;
		font-size: var(--text-small);
	}
	.name {
		font-size: 0.75rem;
		color: var(--color-muted);
	}
	.contact {
		font-size: 0.75rem;
		color: var(--color-muted);
	}
	.acct {
		font-size: 0.7rem;
		font-weight: 700;
		color: var(--color-primary);
		font-variant-numeric: tabular-nums;
		letter-spacing: 0.02em;
	}
	.joined {
		font-size: 0.7rem;
		color: var(--color-muted);
		white-space: nowrap;
	}

	@media (max-width: 640px) {
		.field-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
