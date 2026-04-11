<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let filterCategory = $state<string>('');
	let search = $state('');

	const categoryLabels: Record<string, string> = {
		health_monitoring: 'Health Monitoring',
		mobility_safety: 'Mobility & Safety',
		specialized_support: 'Specialized Support',
		capital_equipment: 'Capital Equipment'
	};

	const filteredProducts = $derived(
		data.products.filter((p) => {
			if (filterCategory && p.category !== filterCategory) return false;
			if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
			return true;
		})
	);

	function formatCurrency(amount: number) {
		return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
	}
</script>

<svelte:head>
	<title>Rep Dashboard | BG Clear</title>
</svelte:head>

<div class="rep-page">
	<div class="rep-header">
		<h1>Sales Rep Dashboard</h1>
		<p>View product pricing, manage quotes, and process orders.</p>
	</div>

	<!-- Quick Stats -->
	<div class="stats-row">
		<div class="stat-card">
			<span class="stat-value">{data.products.length}</span>
			<span class="stat-label">Active Products</span>
		</div>
		<div class="stat-card">
			<span class="stat-value">{data.quoteRequests.length}</span>
			<span class="stat-label">Quote Requests</span>
		</div>
		<div class="stat-card">
			<span class="stat-value">{data.quoteRequests.filter((q) => q.status === 'pending').length}</span>
			<span class="stat-label">Pending Quotes</span>
		</div>
	</div>

	<!-- Product Pricing Table -->
	<div class="section">
		<h2>Product Pricing Schedule</h2>
		<div class="table-controls">
			<select bind:value={filterCategory}>
				<option value="">All Categories</option>
				{#each Object.entries(categoryLabels) as [value, label]}
					<option {value}>{label}</option>
				{/each}
			</select>
			<input type="search" placeholder="Search products..." bind:value={search} />
		</div>

		<div class="table-wrap">
			<table class="pricing-table">
				<thead>
					<tr>
						<th>Product</th>
						<th>Category</th>
						<th>Vendor</th>
						<th class="price-col">BG Cost</th>
						<th class="price-col target">Target Price</th>
						<th class="price-col suggested">Suggested Price</th>
						<th class="price-col commission">Commission @ Target</th>
						<th class="price-col commission">Commission @ Suggested</th>
					</tr>
				</thead>
				<tbody>
					{#each filteredProducts as product}
						<tr>
							<td>
								<span class="product-name">{product.name}</span>
							</td>
							<td><span class="cat-badge">{categoryLabels[product.category] ?? product.category}</span></td>
							<td class="muted">{product.vendor_name}</td>
							<td class="mono">{formatCurrency(product.bg_cost)}</td>
							<td class="mono target">{formatCurrency(product.target_price)}</td>
							<td class="mono suggested">{formatCurrency(product.suggested_price)}</td>
							<td class="mono commission">{formatCurrency(product.commission_at_target)}</td>
							<td class="mono commission">{formatCurrency(product.commission_at_suggested)}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</div>

	<!-- Quote Requests -->
	{#if data.quoteRequests.length > 0}
		<div class="section">
			<h2>Recent Quote Requests</h2>
			<div class="quote-list">
				{#each data.quoteRequests as quote}
					<div class="quote-card">
						<div class="quote-meta">
							<span class="quote-status" class:pending={quote.status === 'pending'}>{quote.status}</span>
							<span class="quote-date">{new Date(quote.created_at).toLocaleDateString()}</span>
						</div>
						<div class="quote-items">
							{quote.quote_request_items?.length ?? 0} items
						</div>
					</div>
				{/each}
			</div>
		</div>
	{/if}
</div>

<style>
	.rep-page { padding-bottom: var(--space-8); }

	.rep-header {
		margin-bottom: var(--space-4);
	}

	.rep-header h1 {
		font-family: var(--font-heading);
		font-size: var(--text-h2);
		font-weight: 700;
		color: var(--color-ink);
		margin: 0 0 0.25rem;
	}

	.rep-header p {
		color: var(--color-muted);
		margin: 0;
	}

	.stats-row {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
		gap: var(--space-3);
		margin-bottom: var(--space-5);
	}

	.stat-card {
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		padding: var(--space-3);
		text-align: center;
	}

	.stat-value {
		display: block;
		font-family: var(--font-heading);
		font-size: 1.75rem;
		font-weight: 700;
		color: var(--color-primary);
	}

	.stat-label {
		font-size: var(--text-small);
		color: var(--color-muted);
	}

	.section {
		margin-bottom: var(--space-5);
	}

	.section h2 {
		font-family: var(--font-heading);
		font-size: var(--text-h3);
		font-weight: 700;
		margin: 0 0 var(--space-3);
	}

	.table-controls {
		display: flex;
		gap: var(--space-2);
		margin-bottom: var(--space-3);
	}

	.table-controls select,
	.table-controls input {
		padding: 0.375rem 0.75rem;
		border: 1px solid var(--color-border);
		border-radius: var(--radius-sm);
		font-size: var(--text-small);
		font-family: var(--font-body);
	}

	.table-controls input { flex: 1; max-width: 280px; }

	.table-wrap {
		overflow-x: auto;
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
	}

	.pricing-table {
		width: 100%;
		border-collapse: collapse;
		font-size: var(--text-small);
	}

	.pricing-table th {
		text-align: left;
		padding: 0.75rem;
		border-bottom: 2px solid var(--color-border);
		font-weight: 600;
		white-space: nowrap;
		background: var(--color-border-subtle);
	}

	.pricing-table td {
		padding: 0.75rem;
		border-bottom: 1px solid var(--color-border-subtle);
		vertical-align: middle;
	}

	.product-name { font-weight: 500; }
	.muted { color: var(--color-muted); }
	.mono { font-variant-numeric: tabular-nums; }

	.cat-badge {
		font-size: 0.7rem;
		font-weight: 600;
		padding: 0.125rem 0.5rem;
		border-radius: var(--radius-pill);
		background: var(--color-border-subtle);
		white-space: nowrap;
	}

	th.target, td.target { color: #b45309; }
	th.suggested, td.suggested { color: #16a34a; font-weight: 600; }
	th.commission, td.commission { color: var(--color-primary); }

	.price-col { text-align: right; }
	td.mono.target, td.mono.suggested, td.mono.commission { text-align: right; }

	.quote-list {
		display: grid;
		gap: var(--space-2);
	}

	.quote-card {
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-sm);
		padding: var(--space-2) var(--space-3);
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.quote-meta { display: flex; gap: var(--space-2); align-items: center; }

	.quote-status {
		font-size: 0.7rem;
		font-weight: 600;
		text-transform: uppercase;
		padding: 0.125rem 0.5rem;
		border-radius: var(--radius-pill);
		background: var(--color-border-subtle);
	}

	.quote-status.pending {
		background: #fef3c7;
		color: #92400e;
	}

	.quote-date {
		font-size: var(--text-small);
		color: var(--color-muted);
	}

	.quote-items {
		font-size: var(--text-small);
		color: var(--color-muted);
	}
</style>
