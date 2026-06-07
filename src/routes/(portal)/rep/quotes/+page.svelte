<script lang="ts">
	import { enhance } from '$app/forms';
	import StatusBadge from '$lib/components/portal/StatusBadge.svelte';
	import EmptyState from '$lib/components/portal/EmptyState.svelte';
	import { QUOTE_STATUS_LABELS, QUOTE_STATUS_COLORS } from '$lib/utils/statuses';
	import { formatDateTime } from '$lib/utils/format';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const canAssign = $derived(data.role === 'admin' || data.role === 'manager');

	let statusFilter = $state('');
	let showUnassignedOnly = $state(false);

	const filtered = $derived(
		data.quotes.filter((q: any) => {
			if (statusFilter && q.status !== statusFilter) return false;
			if (showUnassignedOnly && q.assigned_rep_id) return false;
			return true;
		})
	);

	const unassignedCount = $derived(data.quotes.filter((q: any) => !q.assigned_rep_id).length);
</script>

<svelte:head>
	<title>Quote Requests | BG Clear</title>
</svelte:head>

<div class="quotes-page">
	<h1>Quote Requests</h1>

	<div class="controls">
		<div class="filter-pills">
			<button class="pill" class:active={!statusFilter} onclick={() => (statusFilter = '')}>
				All ({data.quotes.length})
			</button>
			{#each ['pending', 'in_progress', 'quoted', 'accepted', 'declined'] as s}
				{@const count = data.quotes.filter((q: any) => q.status === s).length}
				{#if count > 0}
					<button class="pill" class:active={statusFilter === s} onclick={() => (statusFilter = s)}>
						{QUOTE_STATUS_LABELS[s]} ({count})
					</button>
				{/if}
			{/each}
		</div>
		{#if unassignedCount > 0}
			<button
				class="pill pill-unassigned"
				class:active={showUnassignedOnly}
				onclick={() => (showUnassignedOnly = !showUnassignedOnly)}
			>
				● Unassigned ({unassignedCount})
			</button>
		{/if}
	</div>

	{#if filtered.length === 0}
		<EmptyState message="No quote requests found." />
	{:else}
		<div class="quote-list">
			{#each filtered as quote (quote.id)}
				{@const customer = quote.customer}
				{@const rep = quote.assigned_rep}
				<div class="quote-card">
					<a href="/rep/quotes/{quote.id}" class="quote-main">
						<div class="quote-left">
							<StatusBadge
								status={quote.status}
								labels={QUOTE_STATUS_LABELS}
								colors={QUOTE_STATUS_COLORS}
							/>
							<div class="quote-details">
								<span class="customer-name">
									{customer?.company_name || customer?.full_name || 'Unknown Customer'}
								</span>
								<span class="item-count">{quote.quote_request_items?.length ?? 0} items</span>
							</div>
						</div>
						<span class="quote-date">{formatDateTime(quote.created_at)}</span>
					</a>

					<div class="quote-assign">
						<span
							class="assignee"
							class:unassigned={!quote.assigned_rep_id}
							class:mine={quote.assigned_rep_id === data.myId}
						>
							{#if !quote.assigned_rep_id}
								● Unassigned
							{:else if quote.assigned_rep_id === data.myId}
								✓ Assigned to you
							{:else}
								👤 {rep?.full_name ?? 'Assigned'}
							{/if}
						</span>

						{#if canAssign}
							<form method="POST" action="?/assign" class="assign-form" use:enhance>
								<input type="hidden" name="quote_id" value={quote.id} />
								<select name="rep_id" required>
									<option value="" disabled selected={!quote.assigned_rep_id}>Assign to…</option>
									{#each data.reps as r}
										<option value={r.id} selected={r.id === quote.assigned_rep_id}>
											{r.full_name ?? 'Rep'}
										</option>
									{/each}
								</select>
								<button class="assign-btn" type="submit">Assign</button>
							</form>
						{:else if !quote.assigned_rep_id}
							<form method="POST" action="?/claim" use:enhance>
								<input type="hidden" name="quote_id" value={quote.id} />
								<button class="claim-btn" type="submit">Claim</button>
							</form>
						{/if}
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>

<style>
	.quotes-page h1 {
		font-family: var(--font-heading);
		font-size: var(--text-h2);
		font-weight: 700;
		margin: 0 0 var(--space-4);
	}
	.controls {
		margin-bottom: var(--space-3);
		display: flex;
		justify-content: space-between;
		gap: var(--space-2);
		flex-wrap: wrap;
	}
	.filter-pills {
		display: flex;
		gap: 0.375rem;
		flex-wrap: wrap;
	}
	.pill {
		padding: 0.3rem 0.75rem;
		border-radius: var(--radius-pill);
		font-size: 0.75rem;
		font-weight: 500;
		color: var(--color-muted);
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		cursor: pointer;
		font-family: var(--font-body);
		transition: all 0.15s;
	}
	.pill:hover {
		border-color: var(--color-primary);
		color: var(--color-primary);
	}
	.pill.active {
		background: var(--color-primary);
		color: white;
		border-color: var(--color-primary);
	}
	.pill-unassigned {
		color: var(--color-accent);
	}
	.pill-unassigned.active {
		background: var(--color-accent);
		color: var(--color-ink);
		border-color: var(--color-accent);
	}

	.quote-list {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}
	.quote-card {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: var(--space-3);
		padding: var(--space-3);
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		transition: all 0.15s;
	}
	.quote-card:hover {
		box-shadow: var(--shadow-sm);
		border-color: var(--color-primary);
	}
	.quote-main {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		flex: 1;
		min-width: 0;
		text-decoration: none;
		color: inherit;
	}
	.quote-left {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		min-width: 0;
	}
	.quote-details {
		display: flex;
		flex-direction: column;
		min-width: 0;
	}
	.customer-name {
		font-weight: 600;
		font-size: var(--text-small);
	}
	.item-count {
		font-size: 0.75rem;
		color: var(--color-muted);
	}
	.quote-date {
		font-size: 0.75rem;
		color: var(--color-muted);
		white-space: nowrap;
	}

	.quote-assign {
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		gap: 0.375rem;
		flex-shrink: 0;
	}
	.assignee {
		font-size: 0.7rem;
		font-weight: 600;
		color: var(--color-muted);
		white-space: nowrap;
	}
	.assignee.unassigned {
		color: var(--color-accent);
	}
	.assignee.mine {
		color: var(--color-primary);
	}
	.assign-form {
		display: flex;
		gap: 0.25rem;
		align-items: center;
	}
	.assign-form select {
		font-size: 0.75rem;
		padding: 0.25rem 0.4rem;
		border: 1px solid var(--color-border);
		border-radius: var(--radius-sm);
		background: var(--color-surface);
		max-width: 130px;
	}
	.assign-btn,
	.claim-btn {
		font-size: 0.7rem;
		font-weight: 600;
		padding: 0.3rem 0.7rem;
		border-radius: var(--radius-sm);
		border: none;
		cursor: pointer;
	}
	.assign-btn {
		background: var(--color-primary);
		color: white;
	}
	.claim-btn {
		background: var(--color-accent);
		color: var(--color-ink);
	}

	@media (max-width: 640px) {
		.quote-card {
			flex-direction: column;
			align-items: stretch;
		}
		.quote-assign {
			align-items: stretch;
		}
		.assign-form {
			justify-content: space-between;
		}
	}
</style>
