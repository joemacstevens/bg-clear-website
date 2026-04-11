<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageData } from './$types';
	import type { ProductCategory } from '$lib/database.types';

	let { data }: { data: PageData } = $props();

	let showAddForm = $state(false);
	let filterCategory = $state<string>('');

	const categoryLabels: Record<string, string> = {
		health_monitoring: 'Health Monitoring & Management',
		mobility_safety: 'Mobility & Safety',
		specialized_support: 'Specialized Medical Support',
		capital_equipment: 'Capital Medical Equipment'
	};

	const filteredProducts = $derived(
		filterCategory
			? data.products.filter((p) => p.category === filterCategory)
			: data.products
	);

	function formatCurrency(amount: number) {
		return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
	}

	// Compute pricing from category rules
	function computePricing(vendorCost: number, category: string) {
		const rule = data.pricingRules.find((r) => r.category === category);
		if (!rule) return { bgCost: 0, target: 0, suggested: 0 };
		const bgCost = vendorCost * (1 + rule.margin_reserve_default / 100);
		const target = bgCost * (1 + rule.markup_to_target_default / 100);
		const suggested = target * (1 + rule.suggested_premium_default / 100);
		return { bgCost, target, suggested };
	}
</script>

<svelte:head>
	<title>Admin - Product Management | BG Clear</title>
</svelte:head>

<div class="admin-page">
	<div class="admin-header">
		<div>
			<h1>Product Management</h1>
			<p>{data.products.length} products in catalog</p>
		</div>
		<button class="btn-primary" onclick={() => showAddForm = !showAddForm}>
			{showAddForm ? 'Cancel' : '+ Add Product'}
		</button>
	</div>

	{#if showAddForm}
		<div class="add-form-card">
			<h2>Add New Product</h2>
			<form method="POST" action="?/addProduct" use:enhance={() => { return async ({ update }) => { showAddForm = false; update(); }; }}>
				<div class="form-grid">
					<div class="form-group">
						<label for="name">Product Name *</label>
						<input id="name" name="name" type="text" required placeholder="e.g. Drive Medical Nitro Rollator" />
					</div>

					<div class="form-group">
						<label for="category">Category *</label>
						<select id="category" name="category" required>
							{#each Object.entries(categoryLabels) as [value, label]}
								<option {value}>{label}</option>
							{/each}
						</select>
					</div>

					<div class="form-group">
						<label for="vendor_name">Vendor *</label>
						<input id="vendor_name" name="vendor_name" type="text" required placeholder="e.g. Vive Health" />
					</div>

					<div class="form-group">
						<label for="vendor_cost">Vendor Cost *</label>
						<input id="vendor_cost" name="vendor_cost" type="number" step="0.01" min="0" required placeholder="0.00" />
					</div>

					<div class="form-group">
						<label for="vendor_sku">Vendor SKU</label>
						<input id="vendor_sku" name="vendor_sku" type="text" placeholder="Optional" />
					</div>

					<div class="form-group">
						<label for="sku">BG Clear SKU</label>
						<input id="sku" name="sku" type="text" placeholder="Optional" />
					</div>

					<div class="form-group full-width">
						<label for="description">Description</label>
						<textarea id="description" name="description" rows="2" placeholder="Brief product description"></textarea>
					</div>
				</div>

				<button type="submit" class="btn-primary">Save Product</button>
			</form>
		</div>
	{/if}

	<!-- Pricing Rules Reference -->
	<details class="pricing-rules-panel">
		<summary>Category Pricing Rules (Evans' Schedule)</summary>
		<div class="rules-table-wrap">
			<table class="rules-table">
				<thead>
					<tr>
						<th>Category</th>
						<th>Internal Margin</th>
						<th>Markup to Target</th>
						<th>Suggested Premium</th>
						<th>Commission @ Target</th>
						<th>Commission Above</th>
					</tr>
				</thead>
				<tbody>
					{#each data.pricingRules as rule}
						<tr>
							<td class="bold">{categoryLabels[rule.category] ?? rule.category}</td>
							<td>{rule.margin_reserve_default}% ({rule.margin_reserve_min}-{rule.margin_reserve_max}%)</td>
							<td>{rule.markup_to_target_default}% ({rule.markup_to_target_min}-{rule.markup_to_target_max}%)</td>
							<td>{rule.suggested_premium_default}% ({rule.suggested_premium_min}-{rule.suggested_premium_max}%)</td>
							<td>{rule.commission_at_target}%</td>
							<td>{rule.commission_above_target}%</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</details>

	<!-- Product List -->
	<div class="filter-bar">
		<select bind:value={filterCategory}>
			<option value="">All Categories</option>
			{#each Object.entries(categoryLabels) as [value, label]}
				<option {value}>{label}</option>
			{/each}
		</select>
		<span class="count">{filteredProducts.length} products</span>
	</div>

	<div class="product-table-wrap">
		<table class="product-table">
			<thead>
				<tr>
					<th>Product</th>
					<th>Category</th>
					<th>Vendor</th>
					<th>Vendor Cost</th>
					<th>BG Cost</th>
					<th>Target</th>
					<th>Suggested</th>
					<th>Status</th>
					<th>Actions</th>
				</tr>
			</thead>
			<tbody>
				{#each filteredProducts as product}
					{@const pricing = computePricing(product.vendor_cost, product.category)}
					<tr class:inactive={!product.is_active}>
						<td>
							<div class="product-cell">
								<span class="product-cell-name">{product.name}</span>
								{#if product.sku}<span class="product-cell-sku">{product.sku}</span>{/if}
							</div>
						</td>
						<td><span class="cat-badge">{categoryLabels[product.category]?.split(' ')[0]}</span></td>
						<td>{product.vendor_name}</td>
						<td class="mono">{formatCurrency(product.vendor_cost)}</td>
						<td class="mono">{formatCurrency(pricing.bgCost)}</td>
						<td class="mono">{formatCurrency(pricing.target)}</td>
						<td class="mono">{formatCurrency(pricing.suggested)}</td>
						<td>
							<span class="status-dot" class:active={product.is_active}></span>
							{product.is_active ? 'Active' : 'Inactive'}
						</td>
						<td>
							<div class="action-btns">
								<form method="POST" action="?/toggleProduct" use:enhance>
									<input type="hidden" name="id" value={product.id} />
									<input type="hidden" name="is_active" value={String(product.is_active)} />
									<button type="submit" class="action-btn">{product.is_active ? 'Disable' : 'Enable'}</button>
								</form>
							</div>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</div>

<style>
	.admin-page { padding-bottom: var(--space-8); }

	.admin-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: var(--space-4);
	}

	.admin-header h1 {
		font-family: var(--font-heading);
		font-size: var(--text-h2);
		font-weight: 700;
		color: var(--color-ink);
		margin: 0 0 0.25rem;
	}

	.admin-header p {
		color: var(--color-muted);
		font-size: var(--text-small);
		margin: 0;
	}

	.btn-primary {
		padding: 0.5rem 1.25rem;
		background: var(--color-primary);
		color: white;
		border: none;
		border-radius: var(--radius-sm);
		font-size: var(--text-small);
		font-weight: 600;
		font-family: var(--font-heading);
		cursor: pointer;
		white-space: nowrap;
	}

	.btn-primary:hover { background: var(--color-primary-dark); }

	.add-form-card {
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		padding: var(--space-4);
		margin-bottom: var(--space-4);
	}

	.add-form-card h2 {
		font-family: var(--font-heading);
		font-size: 1.125rem;
		margin: 0 0 var(--space-3);
	}

	.form-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: var(--space-2) var(--space-3);
		margin-bottom: var(--space-3);
	}

	.full-width { grid-column: 1 / -1; }

	.form-group label {
		display: block;
		font-size: var(--text-small);
		font-weight: 500;
		margin-bottom: 0.25rem;
	}

	.form-group input,
	.form-group select,
	.form-group textarea {
		width: 100%;
		padding: 0.5rem 0.75rem;
		border: 1px solid var(--color-border);
		border-radius: var(--radius-sm);
		font-size: var(--text-small);
		font-family: var(--font-body);
		box-sizing: border-box;
	}

	.pricing-rules-panel {
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		margin-bottom: var(--space-4);
	}

	.pricing-rules-panel summary {
		padding: var(--space-2) var(--space-3);
		font-weight: 600;
		font-size: var(--text-small);
		cursor: pointer;
		color: var(--color-text);
	}

	.rules-table-wrap { overflow-x: auto; padding: 0 var(--space-3) var(--space-3); }

	.rules-table {
		width: 100%;
		border-collapse: collapse;
		font-size: var(--text-small);
	}

	.rules-table th {
		text-align: left;
		padding: 0.5rem;
		border-bottom: 2px solid var(--color-border);
		font-weight: 600;
		white-space: nowrap;
	}

	.rules-table td {
		padding: 0.5rem;
		border-bottom: 1px solid var(--color-border-subtle);
	}

	.bold { font-weight: 600; }

	.filter-bar {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		margin-bottom: var(--space-3);
	}

	.filter-bar select {
		padding: 0.375rem 0.75rem;
		border: 1px solid var(--color-border);
		border-radius: var(--radius-sm);
		font-size: var(--text-small);
		font-family: var(--font-body);
	}

	.count {
		font-size: var(--text-small);
		color: var(--color-muted);
	}

	.product-table-wrap {
		overflow-x: auto;
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
	}

	.product-table {
		width: 100%;
		border-collapse: collapse;
		font-size: var(--text-small);
	}

	.product-table th {
		text-align: left;
		padding: 0.75rem;
		border-bottom: 2px solid var(--color-border);
		font-weight: 600;
		white-space: nowrap;
		background: var(--color-border-subtle);
	}

	.product-table td {
		padding: 0.75rem;
		border-bottom: 1px solid var(--color-border-subtle);
		vertical-align: middle;
	}

	tr.inactive { opacity: 0.5; }

	.product-cell-name {
		font-weight: 500;
		display: block;
	}

	.product-cell-sku {
		font-size: 0.7rem;
		color: var(--color-muted);
	}

	.cat-badge {
		font-size: 0.7rem;
		font-weight: 600;
		padding: 0.125rem 0.5rem;
		border-radius: var(--radius-pill);
		background: var(--color-border-subtle);
		white-space: nowrap;
	}

	.mono { font-variant-numeric: tabular-nums; }

	.status-dot {
		display: inline-block;
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background: #dc2626;
		margin-right: 0.25rem;
	}

	.status-dot.active { background: #16a34a; }

	.action-btns { display: flex; gap: 0.25rem; }

	.action-btn {
		padding: 0.25rem 0.5rem;
		font-size: 0.7rem;
		border: 1px solid var(--color-border);
		background: var(--color-surface);
		border-radius: var(--radius-sm);
		cursor: pointer;
		font-family: var(--font-body);
	}

	.action-btn:hover {
		background: var(--color-border-subtle);
	}

	@media (max-width: 768px) {
		.form-grid { grid-template-columns: 1fr; }
	}
</style>
