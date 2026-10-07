<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/stores';
	import EmptyState from '$lib/components/portal/EmptyState.svelte';
	import StatusBadge from '$lib/components/portal/StatusBadge.svelte';
	import { formatCurrency, formatDate } from '$lib/utils/format';
	import { toasts } from '$lib/stores/toast';
	import type { PageData, ActionData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	// The link reps send is the branded bgclear.com page, which forwards to the
	// Woo/CyberSource checkout — not the raw Woo URL.
	const branded = (id: string) => `${$page.url.origin}/pay-invoice/${id}`;

	let showForm = $state(false);
	let submitting = $state(false);

	const STATUS_LABELS = { pending: 'Awaiting payment', paid: 'Paid', void: 'Void' };
	const STATUS_COLORS = { pending: '#b45309', paid: '#1e7e34', void: '#6b7280' };

	// Reopen the form on a failed submit so the error + entered values stay visible.
	$effect(() => {
		if (form && !form.success && form.error) showForm = true;
		// A successful generate can close the form — the pay link shows in its panel.
		if (form?.success) showForm = false;
	});

	async function copy(text: string | null | undefined) {
		if (!text) return;
		try {
			await navigator.clipboard.writeText(text);
			toasts.success('Pay link copied to clipboard');
		} catch {
			toasts.error('Could not copy — select and copy the link manually');
		}
	}
</script>

<svelte:head><title>Pay-Invoice Links | BG Clear</title></svelte:head>

<div class="invoices-page">
	<div class="page-header">
		<div>
			<h1>Pay-Invoice Links</h1>
			<p class="sub">Generate a payment link for any amount and send it to a client to pay by card.</p>
		</div>
		<button class="new-btn" onclick={() => (showForm = !showForm)}>
			{showForm ? 'Close' : '+ New Invoice Link'}
		</button>
	</div>

	{#if form?.success && form.invoice}
		<div class="success-panel">
			<strong>✓ Pay link ready for {form.invoice.invoice_number}</strong>
			<p>Send this link to {form.invoice.customer_name || 'your client'} — they pay {formatCurrency(form.invoice.amount)} by card. You'll see it flip to “Paid” here once the payment clears.</p>
			<div class="link-row">
				<code class="paylink">{branded(form.invoice.id)}</code>
				<button type="button" class="copy-btn" onclick={() => copy(branded(form.invoice.id))}>Copy link</button>
			</div>
		</div>
	{/if}

	{#if showForm}
		<form
			method="POST"
			action="?/create"
			class="invoice-form"
			use:enhance={() => {
				submitting = true;
				return async ({ update }) => {
					await update();
					submitting = false;
				};
			}}
		>
			<h3>Generate a pay-invoice link</h3>
			{#if form?.error}
				<div class="form-error">{form.error}</div>
			{/if}
			<div class="field-grid">
				<label>
					Amount (USD) *
					<input name="amount" type="number" step="0.01" min="0.01" required placeholder="0.00" value={form?.values?.amount ?? ''} />
				</label>
				<label>
					Invoice # <span class="opt">(optional — auto-generated if blank)</span>
					<input name="invoice_number" placeholder="INV-123456" value={form?.values?.invoice_number ?? ''} />
				</label>
				<label class="full">
					Description *
					<input name="description" required placeholder="e.g. Capital equipment deposit — hospital bed order" value={form?.values?.description ?? ''} />
				</label>
				<label>
					Client name
					<input name="customer_name" placeholder="Jane Doe" value={form?.values?.customer_name ?? ''} />
				</label>
				<label>
					Client email
					<input name="customer_email" type="email" placeholder="jane@example.com" value={form?.values?.customer_email ?? ''} />
				</label>
			</div>
			<button class="submit-btn" type="submit" disabled={submitting}>
				{submitting ? 'Generating…' : 'Generate Pay Link'}
			</button>
		</form>
	{/if}

	{#if data.invoices.length === 0}
		<EmptyState message="No invoice links yet. Click “+ New Invoice Link” to generate one for a client." />
	{:else}
		<div class="invoice-table">
			<div class="row head">
				<span>Invoice</span>
				<span>Client</span>
				<span class="num">Amount</span>
				<span>Status</span>
				<span>Created</span>
				<span></span>
			</div>
			{#each data.invoices as inv}
				<div class="row">
					<span class="inv-no">
						{inv.invoice_number}
						{#if inv.description}<span class="desc">{inv.description}</span>{/if}
					</span>
					<span>{inv.customer_name || '—'}{#if inv.customer_email}<span class="desc">{inv.customer_email}</span>{/if}</span>
					<span class="num">{formatCurrency(inv.amount)}</span>
					<span><StatusBadge status={inv.status} labels={STATUS_LABELS} colors={STATUS_COLORS} /></span>
					<span class="created">{formatDate(inv.created_at)}</span>
					<span>
						{#if inv.pay_url && inv.status === 'pending'}
							<button type="button" class="copy-btn small" onclick={() => copy(branded(inv.id))}>Copy link</button>
						{/if}
					</span>
				</div>
			{/each}
		</div>
	{/if}
</div>

<style>
	.page-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		gap: var(--space-3);
		margin-bottom: var(--space-4);
	}
	.invoices-page h1 {
		font-family: var(--font-heading);
		font-size: var(--text-h2);
		font-weight: 700;
		margin: 0;
	}
	.sub {
		margin: 0.25rem 0 0;
		font-size: var(--text-small);
		color: var(--color-muted);
		max-width: 46ch;
	}
	.new-btn {
		flex-shrink: 0;
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
	.link-row {
		display: flex;
		gap: var(--space-2);
		align-items: center;
	}
	.paylink {
		flex: 1;
		min-width: 0;
		overflow-x: auto;
		white-space: nowrap;
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-sm);
		padding: 0.4rem 0.6rem;
		font-family: monospace;
		font-size: 0.8rem;
		color: var(--color-ink);
	}
	.copy-btn {
		flex-shrink: 0;
		font-size: 0.8rem;
		font-weight: 600;
		padding: 0.4rem 0.9rem;
		border-radius: var(--radius-pill);
		border: none;
		background: var(--color-accent);
		color: var(--color-ink);
		cursor: pointer;
	}
	.copy-btn.small {
		font-size: 0.7rem;
		padding: 0.3rem 0.7rem;
	}

	.invoice-form {
		margin-bottom: var(--space-4);
		padding: var(--space-4);
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
	}
	.invoice-form h3 {
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
	.field-grid label.full {
		grid-column: 1 / -1;
	}
	.opt {
		font-weight: 400;
		text-transform: none;
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

	.invoice-table {
		display: flex;
		flex-direction: column;
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		overflow: hidden;
		background: var(--color-surface);
	}
	.row {
		display: grid;
		grid-template-columns: 1.4fr 1.3fr 0.8fr 1fr 0.9fr 0.9fr;
		gap: var(--space-2);
		align-items: center;
		padding: 0.7rem var(--space-3);
		border-top: 1px solid var(--color-border);
		font-size: var(--text-small);
	}
	.row.head {
		border-top: none;
		background: var(--color-bg);
		font-size: 0.7rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.03em;
		color: var(--color-muted);
	}
	.inv-no {
		font-weight: 600;
	}
	.desc {
		display: block;
		font-weight: 400;
		font-size: 0.72rem;
		color: var(--color-muted);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.num {
		text-align: right;
		font-variant-numeric: tabular-nums;
	}
	.created {
		color: var(--color-muted);
		font-size: 0.75rem;
	}

	@media (max-width: 720px) {
		.field-grid {
			grid-template-columns: 1fr;
		}
		.row {
			grid-template-columns: 1fr 1fr;
		}
		.row.head {
			display: none;
		}
		.num {
			text-align: left;
		}
	}
</style>
