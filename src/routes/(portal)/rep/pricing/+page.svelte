<script lang="ts">
	import { categoryLabel, CATEGORY_LIST } from '$lib/utils/categories';
	import { formatCurrency } from '$lib/utils/format';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let search = $state('');

	const filtered = $derived(
		data.products.filter((p) =>
			!search || p.name.toLowerCase().includes(search.toLowerCase())
			|| p.vendor_name.toLowerCase().includes(search.toLowerCase())
		)
	);
</script>

<svelte:head>
	<title>Pricing Table | BG Clear</title>
</svelte:head>

<div class="pricing-page">
	<h1>Product Pricing Schedule</h1>
	<p class="subtitle">All prices auto-calculated from Evans' category schedule. BG Cost is your floor.</p>

	<div class="controls">
		<div class="category-pills">
			<a href="/rep/pricing" class="pill" class:active={!data.selectedCategory}>All</a>
			{#each CATEGORY_LIST as cat}
				<a href="/rep/pricing?category={cat.value}" class="pill" class:active={data.selectedCategory === cat.value}>
					{categoryLabel(cat.value, true)}
				</a>
			{/each}
		</div>
		<input type="search" placeholder="Search products..." bind:value={search} class="search" />
	</div>

	<div class="table-wrap">
		<table>
			<thead>
				<tr>
					<th>Product</th>
					<th>Category</th>
					<th>Vendor</th>
					<th class="num">BG Cost</th>
					<th class="num target-col">Target</th>
					<th class="num suggested-col">Suggested</th>
					<th class="num commission-col">Comm. @ Target</th>
					<th class="num commission-col">Comm. @ Suggested</th>
				</tr>
			</thead>
			<tbody>
				{#each filtered as p}
					<tr>
						<td class="product-name">{p.name}</td>
						<td><span class="cat-badge">{categoryLabel(p.category, true)}</span></td>
						<td class="muted">{p.vendor_name}</td>
						<td class="num mono">{formatCurrency(p.bg_cost)}</td>
						<td class="num mono target-col">{formatCurrency(p.target_price)}</td>
						<td class="num mono suggested-col">{formatCurrency(p.suggested_price)}</td>
						<td class="num mono commission-col">{formatCurrency(p.commission_at_target)}</td>
						<td class="num mono commission-col">{formatCurrency(p.commission_at_suggested)}</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>

	<div class="legend">
		<span><span class="dot target-dot"></span> Target = floor without approval</span>
		<span><span class="dot suggested-dot"></span> Suggested = opening quote</span>
		<span><span class="dot commission-dot"></span> Commission = your payout</span>
	</div>
</div>

<style>
	.pricing-page h1 {
		font-family: var(--font-heading);
		font-size: var(--text-h2);
		font-weight: 700;
		color: var(--color-ink);
		margin: 0 0 0.25rem;
	}
	.subtitle { color: var(--color-muted); margin: 0 0 var(--space-4); font-size: var(--text-small); }

	.controls {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: var(--space-3);
		margin-bottom: var(--space-3);
		flex-wrap: wrap;
	}
	.category-pills { display: flex; gap: 0.375rem; flex-wrap: wrap; }
	.pill {
		padding: 0.3rem 0.75rem;
		border-radius: var(--radius-pill);
		font-size: 0.75rem;
		font-weight: 500;
		color: var(--color-muted);
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		text-decoration: none;
		transition: all 0.15s;
	}
	.pill:hover { border-color: var(--color-primary); color: var(--color-primary); }
	.pill.active { background: var(--color-primary); color: white; border-color: var(--color-primary); }

	.search {
		padding: 0.4rem 0.75rem;
		border: 1px solid var(--color-border);
		border-radius: var(--radius-pill);
		font-size: var(--text-small);
		font-family: var(--font-body);
		width: 220px;
	}
	.search:focus { outline: none; border-color: var(--color-primary); box-shadow: 0 0 0 3px rgba(30,58,95,0.1); }

	.table-wrap {
		overflow-x: auto;
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
	}
	table { width: 100%; border-collapse: collapse; font-size: var(--text-small); }
	th {
		text-align: left;
		padding: 0.75rem;
		border-bottom: 2px solid var(--color-border);
		font-weight: 600;
		white-space: nowrap;
		background: var(--color-border-subtle);
	}
	td {
		padding: 0.75rem;
		border-bottom: 1px solid var(--color-border-subtle);
		vertical-align: middle;
	}
	.product-name { font-weight: 500; }
	.muted { color: var(--color-muted); }
	.num { text-align: right; }
	.mono { font-variant-numeric: tabular-nums; }
	.cat-badge {
		font-size: 0.65rem;
		font-weight: 600;
		padding: 0.1rem 0.5rem;
		border-radius: var(--radius-pill);
		background: var(--color-border-subtle);
		white-space: nowrap;
	}
	.target-col { color: #b45309; }
	.suggested-col { color: #16a34a; font-weight: 600; }
	.commission-col { color: var(--color-primary); }

	.legend {
		display: flex;
		gap: var(--space-4);
		margin-top: var(--space-3);
		font-size: 0.75rem;
		color: var(--color-muted);
	}
	.dot {
		display: inline-block;
		width: 8px;
		height: 8px;
		border-radius: 50%;
		margin-right: 0.25rem;
		vertical-align: middle;
	}
	.target-dot { background: #b45309; }
	.suggested-dot { background: #16a34a; }
	.commission-dot { background: var(--color-primary); }
</style>
