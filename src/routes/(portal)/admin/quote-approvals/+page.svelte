<script lang="ts">
	import type { PageData, ActionData } from './$types';
	import { enhance } from '$app/forms';
	import { formatCurrency, formatDate } from '$lib/utils/format';

	let { data, form }: { data: PageData; form: ActionData } = $props();
	let busy = $state(false);
	const handle = () => {
		busy = true;
		return async ({ update }: any) => {
			await update();
			busy = false;
		};
	};
</script>

<svelte:head><title>Quote Approvals | BG Clear Admin</title></svelte:head>

<div class="page">
	<div class="head">
		<div>
			<h1>Quote Approvals</h1>
			<p class="sub">Below-target quotes a rep has submitted. Approve to send to the customer, or reject back to the rep.</p>
		</div>
		<a class="back" href="/admin">← Admin</a>
	</div>

	{#if form?.error}<div class="err">{form.error}</div>{/if}
	{#if form?.success}<div class="ok">Quote {form.action === 'approve' ? 'approved and sent to the customer' : 'rejected and returned to the rep'}.</div>{/if}

	{#if data.quotes.length === 0}
		<div class="empty">Nothing waiting for approval. 🎉</div>
	{:else}
		{#each data.quotes as q (q.id)}
			<div class="card">
				<div class="card-head">
					<div>
						<strong>{q.customer?.company_name || q.customer?.full_name || 'Customer'}</strong>
						<span class="meta">Submitted {formatDate(q.created_at)}</span>
					</div>
					<span class="total">{formatCurrency(q.total)}</span>
				</div>

				<table class="lines">
					<thead>
						<tr><th>Product</th><th class="num">Qty</th><th class="num">Price</th><th class="num">Target</th><th></th></tr>
					</thead>
					<tbody>
						{#each q.quote_request_items as it}
							<tr class:below={it.below_target}>
								<td>{it.products?.name ?? '—'}</td>
								<td class="num">{it.quantity}</td>
								<td class="num">{it.quoted_price != null ? formatCurrency(it.quoted_price) : '—'}</td>
								<td class="num">{it.target_price != null ? formatCurrency(it.target_price) : '—'}</td>
								<td>{#if it.below_target}<span class="flag">below target</span>{/if}</td>
							</tr>
						{/each}
					</tbody>
				</table>

				<div class="card-actions">
					<form method="POST" action="?/approve" use:enhance={handle}>
						<input type="hidden" name="quote_id" value={q.id} />
						<button type="submit" class="approve" disabled={busy}>Approve &amp; send</button>
					</form>
					<form method="POST" action="?/reject" use:enhance={handle} class="reject-form">
						<input type="hidden" name="quote_id" value={q.id} />
						<input name="notes" placeholder="Reason (required to reject)" />
						<button type="submit" class="reject" disabled={busy}>Reject</button>
					</form>
				</div>
			</div>
		{/each}
	{/if}
</div>

<style>
	.page { padding-bottom: var(--space-8); }
	.head { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: var(--space-4); }
	h1 { font-family: var(--font-heading); font-size: var(--text-h2); font-weight: 700; color: var(--color-ink); margin: 0; }
	.sub { color: var(--color-muted); font-size: var(--text-small); margin: var(--space-1) 0 0; max-width: 60ch; }
	.back { color: var(--color-primary); text-decoration: none; font-size: var(--text-small); font-weight: 600; }
	.err { background: #fee2e2; color: #991b1b; padding: var(--space-2) var(--space-3); border-radius: var(--radius-md); margin-bottom: var(--space-3); font-size: var(--text-small); }
	.ok { background: #d1fae5; color: #065f46; padding: var(--space-2) var(--space-3); border-radius: var(--radius-md); margin-bottom: var(--space-3); font-size: var(--text-small); font-weight: 600; }
	.empty { padding: var(--space-6); text-align: center; color: var(--color-muted); background: var(--color-surface); border: 1px solid var(--color-border); border-radius: var(--radius-md); }

	.card { background: var(--color-surface); border: 1px solid var(--color-border); border-radius: var(--radius-md); padding: var(--space-3); margin-bottom: var(--space-3); }
	.card-head { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: var(--space-2); }
	.card-head strong { color: var(--color-ink); }
	.meta { color: var(--color-muted); font-size: 0.75rem; margin-left: var(--space-2); }
	.total { font-weight: 700; color: var(--color-ink); }

	.lines { width: 100%; border-collapse: collapse; font-size: var(--text-small); margin-bottom: var(--space-3); }
	.lines th { text-align: left; color: var(--color-muted); font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.04em; padding: 0.25rem 0.5rem; border-bottom: 1px solid var(--color-border); }
	.lines td { padding: 0.4rem 0.5rem; border-bottom: 1px solid var(--color-border-subtle); }
	.num { text-align: right; }
	tr.below td { background: #fff7ed; }
	.flag { font-size: 0.65rem; font-weight: 700; color: #b45309; text-transform: uppercase; }

	.card-actions { display: flex; flex-wrap: wrap; gap: 0.75rem; align-items: center; }
	.reject-form { display: flex; gap: 0.5rem; flex: 1; min-width: 280px; }
	.reject-form input { flex: 1; padding: 0.5rem 0.7rem; border: 1px solid var(--color-border); border-radius: var(--radius-sm); font-size: var(--text-small); }
	.approve { padding: 0.55rem 1.2rem; background: #059669; color: #fff; border: none; border-radius: var(--radius-sm); font-weight: 700; font-size: var(--text-small); cursor: pointer; }
	.reject { padding: 0.55rem 1.1rem; background: #fff; color: #b91c1c; border: 1px solid #fca5a5; border-radius: var(--radius-sm); font-weight: 600; font-size: var(--text-small); cursor: pointer; }
</style>
