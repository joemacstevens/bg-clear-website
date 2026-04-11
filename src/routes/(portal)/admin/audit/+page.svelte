<script lang="ts">
	import { goto } from '$app/navigation';
	import type { PageData } from './$types';
	import { formatDateTime } from '$lib/utils/format';
	import EmptyState from '$lib/components/portal/EmptyState.svelte';

	let { data }: { data: PageData } = $props();

	let filterAction = $state('');
	let filterEntity = $state('');
	let filterDateFrom = $state('');
	let filterDateTo = $state('');

	$effect(() => {
		filterAction = data.filters.action;
		filterEntity = data.filters.entityType;
		filterDateFrom = data.filters.dateFrom;
		filterDateTo = data.filters.dateTo;
	});

	function applyFilters() {
		const params = new URLSearchParams();
		if (filterAction) params.set('action', filterAction);
		if (filterEntity) params.set('entityType', filterEntity);
		if (filterDateFrom) params.set('dateFrom', filterDateFrom);
		if (filterDateTo) params.set('dateTo', filterDateTo);
		params.set('page', '1'); // reset to page 1 on new filter
		goto(`?${params.toString()}`);
	}

	function resetFilters() {
		filterAction = '';
		filterEntity = '';
		filterDateFrom = '';
		filterDateTo = '';
		goto('?page=1');
	}

	function changePage(newPage: number) {
		if (newPage < 1 || newPage > data.totalPages) return;
		const url = new URL(window.location.href);
		url.searchParams.set('page', newPage.toString());
		goto(url.toString());
	}

	function formatDetails(details: Record<string, any>) {
		if (!details || Object.keys(details).length === 0) return '-';
		return JSON.stringify(details, null, 2)
			.replace(/[{}]/g, '')
			.replace(/"([^"]+)":/g, '$1:')
			.trim();
	}
</script>

<div class="audit-page">
	<header class="page-header">
		<div>
			<h1>Audit Log</h1>
			<p class="text-muted">Track system-wide activity and data mutations.</p>
		</div>
	</header>

	<div class="filters-card">
		<div class="filters-grid">
			<div class="filter-group">
				<label for="filter-action">Action</label>
				<select id="filter-action" bind:value={filterAction}>
					<option value="">All Actions</option>
					{#each data.uniqueActions as action}
						<option value={action}>{action.replace(/_/g, ' ')}</option>
					{/each}
				</select>
			</div>

			<div class="filter-group">
				<label for="filter-entity">Entity Type</label>
				<select id="filter-entity" bind:value={filterEntity}>
					<option value="">All Entities</option>
					{#each data.uniqueEntities as entity}
						<option value={entity}>{entity}</option>
					{/each}
				</select>
			</div>

			<div class="filter-group">
				<label for="filter-date-from">From Date</label>
				<input type="date" id="filter-date-from" bind:value={filterDateFrom} />
			</div>

			<div class="filter-group">
				<label for="filter-date-to">To Date</label>
				<input type="date" id="filter-date-to" bind:value={filterDateTo} />
			</div>

			<div class="filter-actions">
				<button class="btn btn-outline" onclick={resetFilters}>Reset</button>
				<button class="btn btn-primary" onclick={applyFilters}>Apply Filters</button>
			</div>
		</div>
	</div>

	<div class="table-container">
		{#if data.logs.length > 0}
			<table class="data-table">
				<thead>
					<tr>
						<th>Timestamp</th>
						<th>User</th>
						<th>Action</th>
						<th>Entity</th>
						<th>Entity ID</th>
						<th>Details</th>
					</tr>
				</thead>
				<tbody>
					{#each data.logs as log}
						<tr>
							<td class="whitespace-nowrap">{formatDateTime(log.created_at)}</td>
							<td>
								{#if log.profiles}
									<div class="user-info">
										<strong>{log.profiles.full_name || 'Unknown'}</strong>
										<span class="user-email">{log.profiles.email || ''}</span>
									</div>
								{:else}
									<span class="text-muted">System</span>
								{/if}
							</td>
							<td>
								<span class="action-badge">{log.action}</span>
							</td>
							<td><strong>{log.entity_type}</strong></td>
							<td class="font-mono text-sm">{log.entity_id ? log.entity_id.substring(0, 8) : '-'}</td>
							<td class="details-cell">
								<pre class="details-pre">{formatDetails(log.details)}</pre>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
			
			{#if data.totalPages > 1}
				<div class="pagination">
					<span class="pagination-info">
						Showing {(data.page - 1) * data.limit + 1} to Math.min(data.page * data.limit, data.totalCount) of {data.totalCount} entries
					</span>
					<div class="pagination-controls">
						<button class="btn btn-sm btn-outline" disabled={data.page === 1} onclick={() => changePage(data.page - 1)}>
							Previous
						</button>
						<span class="page-number">Page {data.page} of {data.totalPages}</span>
						<button class="btn btn-sm btn-outline" disabled={data.page === data.totalPages} onclick={() => changePage(data.page + 1)}>
							Next
						</button>
					</div>
				</div>
			{/if}
		{:else}
			<EmptyState message="No audit logs match your filters." />
		{/if}
	</div>
</div>

<style>
	.audit-page {
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

	.filters-card {
		background: var(--color-surface);
		padding: var(--space-4);
		border-radius: var(--radius-md);
		border: 1px solid var(--color-border);
	}

	.filters-grid {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-4);
		align-items: flex-end;
	}

	.filter-group {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
		min-width: 150px;
		flex: 1;
	}

	.filter-group label {
		font-size: 0.75rem;
		font-weight: 600;
		color: var(--color-ink);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	select, input[type="date"] {
		padding: var(--space-2) var(--space-3);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-sm);
		font-family: inherit;
		font-size: 0.875rem;
		background: var(--color-surface);
	}

	.filter-actions {
		display: flex;
		gap: var(--space-2);
		margin-left: auto;
	}

	.table-container {
		background: var(--color-surface);
		border-radius: var(--radius-md);
		border: 1px solid var(--color-border);
		overflow-x: auto;
		display: flex;
		flex-direction: column;
	}

	.data-table {
		width: 100%;
		border-collapse: collapse;
		text-align: left;
	}

	.data-table th,
	.data-table td {
		padding: var(--space-3) var(--space-4);
		border-bottom: 1px solid var(--color-border);
		vertical-align: middle;
	}

	.data-table th {
		background: var(--color-bg);
		font-weight: 600;
		font-size: 0.75rem;
		color: var(--color-muted);
		text-transform: uppercase;
		letter-spacing: 0.05em;
		white-space: nowrap;
	}

	.data-table tbody tr:hover {
		background: var(--color-bg);
	}

	.whitespace-nowrap {
		white-space: nowrap;
		font-size: 0.875rem;
	}

	.user-info {
		display: flex;
		flex-direction: column;
	}

	.user-email {
		font-size: 0.75rem;
		color: var(--color-muted);
	}

	.action-badge {
		background: #f1f5f9;
		color: #475569;
		padding: 0.125rem 0.5rem;
		border-radius: 999px;
		font-size: 0.75rem;
		font-weight: 500;
		white-space: nowrap;
	}

	.font-mono {
		font-family: monospace;
	}

	.text-sm {
		font-size: 0.875rem;
	}

	.details-cell {
		max-width: 300px;
	}

	.details-pre {
		margin: 0;
		font-family: monospace;
		font-size: 0.75rem;
		color: var(--color-muted);
		white-space: pre-wrap;
		word-wrap: break-word;
		max-height: 80px;
		overflow-y: auto;
	}

	.pagination {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: var(--space-4);
		background: var(--color-bg);
		border-top: 1px solid var(--color-border);
	}

	.pagination-info {
		font-size: 0.875rem;
		color: var(--color-muted);
	}

	.pagination-controls {
		display: flex;
		align-items: center;
		gap: var(--space-4);
	}

	.page-number {
		font-size: 0.875rem;
		font-weight: 500;
		color: var(--color-ink);
	}

	.btn {
		padding: var(--space-2) var(--space-4);
		border-radius: var(--radius-md);
		font-weight: 500;
		cursor: pointer;
		font-size: 0.875rem;
		transition: all 0.2s;
	}

	.btn-primary {
		background: var(--color-primary);
		color: white;
		border: none;
	}

	.btn-primary:hover {
		background: var(--color-primary-dark);
	}

	.btn-outline {
		background: transparent;
		color: var(--color-primary);
		border: 1px solid var(--color-border);
	}

	.btn-outline:hover {
		background: var(--color-bg);
		border-color: var(--color-muted);
	}

	.btn-sm {
		padding: var(--space-1) var(--space-3);
		font-size: 0.75rem;
	}

	.btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
</style>
