<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageData } from './$types';
	import { formatCurrency } from '$lib/utils/format';
	import Modal from '$lib/components/portal/Modal.svelte';

	let { data }: { data: PageData } = $props();

	let showAddForm = $state(false);
	let filterCategory = $state<string>('');
	let deleteModalOpen = $state(false);
	let productToDelete = $state<{ id: string; name: string } | null>(null);

	// Form editing state
	let isEditing = $state(false);
	let editingProduct = $state<any>(null);

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

	function computePricing(vendorCost: number, category: string) {
		const rule = data.pricingRules.find((r) => r.category === category);
		if (!rule) return { bgCost: 0, target: 0, suggested: 0 };
		const bgCost = vendorCost * (1 + rule.margin_reserve_default / 100);
		const target = bgCost * (1 + rule.markup_to_target_default / 100);
		const suggested = target * (1 + rule.suggested_premium_default / 100);
		return { bgCost, target, suggested };
	}

	function confirmDelete(product: any) {
		productToDelete = { id: product.id, name: product.name };
		deleteModalOpen = true;
	}

	function editProduct(product: any) {
		editingProduct = { ...product };
		isEditing = true;
		showAddForm = true;
	}

	function resetForm() {
		showAddForm = false;
		isEditing = false;
		editingProduct = null;
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
		<button class="btn-primary" onclick={() => { if(showAddForm) resetForm(); else showAddForm = true; }}>
			{showAddForm ? 'Cancel' : '+ Add Product'}
		</button>
	</div>

	{#if showAddForm}
		<div class="add-form-card">
			<h2>{isEditing ? 'Edit Product' : 'Add New Product'}</h2>
			<form method="POST" action={isEditing ? '?/updateProduct' : '?/addProduct'} use:enhance={() => { return async ({ update }) => { resetForm(); update(); }; }}>
				{#if isEditing}
					<input type="hidden" name="id" value={editingProduct.id} />
				{/if}
				<div class="form-grid">
					<div class="form-group">
						<label for="name">Product Name *</label>
						<input id="name" name="name" type="text" required value={editingProduct?.name ?? ''} placeholder="e.g. Drive Medical Nitro Rollator" />
					</div>

					<div class="form-group">
						<label for="category">Category *</label>
						<select id="category" name="category" required value={editingProduct?.category ?? ''}>
							<option value="" disabled selected={!editingProduct}>Select category...</option>
							{#each Object.entries(categoryLabels) as [value, label]}
								<option {value}>{label}</option>
							{/each}
						</select>
					</div>

					<div class="form-group">
						<label for="vendor_name">Vendor *</label>
						<input id="vendor_name" name="vendor_name" type="text" required value={editingProduct?.vendor_name ?? ''} placeholder="e.g. Vive Health" />
					</div>

					<div class="form-group">
						<label for="vendor_cost">Vendor Cost *</label>
						<input id="vendor_cost" name="vendor_cost" type="number" step="0.01" min="0" required value={editingProduct?.vendor_cost ?? ''} placeholder="0.00" />
					</div>

					<div class="form-group">
						<label for="vendor_sku">Vendor SKU</label>
						<input id="vendor_sku" name="vendor_sku" type="text" value={editingProduct?.vendor_sku ?? ''} placeholder="Optional" />
					</div>

					<div class="form-group">
						<label for="sku">BG Clear SKU</label>
						<input id="sku" name="sku" type="text" value={editingProduct?.sku ?? ''} placeholder="Optional" />
					</div>

					<div class="form-group full-width">
						<label for="image_url">Image URL</label>
						<input id="image_url" name="image_url" type="url" value={editingProduct?.image_url ?? ''} placeholder="https://example.com/image.jpg" />
					</div>

					<div class="form-group full-width">
						<label for="description">Description</label>
						<textarea id="description" name="description" rows="3" placeholder="Brief product description" value={editingProduct?.description ?? ''}></textarea>
					</div>
				</div>

				<div class="form-actions">
					<button type="submit" class="btn-primary">{isEditing ? 'Save Changes' : 'Create Product'}</button>
					<button type="button" class="btn-secondary" onclick={resetForm}>Cancel</button>
				</div>
			</form>
		</div>
	{/if}

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
						<td><span class="cat-badge">{categoryLabels[product.category]?.split(' ')[0] ?? product.category}</span></td>
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
								<button class="action-btn" onclick={() => editProduct(product)}>Edit</button>
								<form method="POST" action="?/toggleProduct" use:enhance>
									<input type="hidden" name="id" value={product.id} />
									<input type="hidden" name="is_active" value={String(product.is_active)} />
									<button type="submit" class="action-btn">{product.is_active ? 'Disable' : 'Enable'}</button>
								</form>
								<button class="action-btn text-danger" onclick={() => confirmDelete(product)}>Delete</button>
							</div>
						</td>
					</tr>
				{/each}
				{#if filteredProducts.length === 0}
					<tr>
						<td colspan="9" class="empty-message">No products found.</td>
					</tr>
				{/if}
			</tbody>
		</table>
	</div>
</div>

<Modal open={deleteModalOpen} title="Confirm Deletion" onclose={() => deleteModalOpen = false}>
	<p>Are you sure you want to delete <strong>{productToDelete?.name}</strong>?</p>
	<p class="text-danger-muted">This action cannot be undone.</p>
	{#snippet footer()}
		<form method="POST" action="?/deleteProduct" use:enhance={() => { return async ({ update }) => { deleteModalOpen = false; update(); }; }}>
			<input type="hidden" name="id" value={productToDelete?.id} />
			<div class="modal-actions">
				<button type="button" class="btn-secondary" onclick={() => deleteModalOpen = false}>Cancel</button>
				<button type="submit" class="btn-danger">Delete</button>
			</div>
		</form>
	{/snippet}
</Modal>

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
	
	.btn-secondary {
		padding: 0.5rem 1.25rem;
		background: transparent;
		color: var(--color-text);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-sm);
		font-size: var(--text-small);
		font-weight: 600;
		cursor: pointer;
	}

	.btn-secondary:hover { background: var(--color-bg); }

	.btn-danger {
		padding: 0.5rem 1.25rem;
		background: #ef4444;
		color: white;
		border: none;
		border-radius: var(--radius-sm);
		font-size: var(--text-small);
		font-weight: 600;
		cursor: pointer;
	}
	
	.btn-danger:hover { background: #dc2626; }

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
		gap: var(--space-3);
		margin-bottom: var(--space-4);
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

	.form-actions {
		display: flex;
		gap: var(--space-2);
	}

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
		background: var(--color-bg);
	}

	.product-table td {
		padding: 0.75rem;
		border-bottom: 1px solid var(--color-border-subtle);
		vertical-align: middle;
	}

	tr.inactive { opacity: 0.6; }

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
		background: var(--color-bg);
		border: 1px solid var(--color-border);
		white-space: nowrap;
	}

	.mono { font-variant-numeric: tabular-nums; }

	.status-dot {
		display: inline-block;
		width: 8px;
		height: 8px;
		border-radius: 50%;
		background: #ef4444;
		margin-right: 0.375rem;
	}

	.status-dot.active { background: #10b981; }

	.action-btns { display: flex; gap: 0.375rem; }

	.action-btn {
		padding: 0.25rem 0.5rem;
		font-size: 0.75rem;
		border: 1px solid var(--color-border);
		background: var(--color-surface);
		border-radius: var(--radius-sm);
		cursor: pointer;
		font-family: var(--font-body);
		color: var(--color-text);
	}

	.action-btn:hover { background: var(--color-bg); border-color: var(--color-muted); }
	
	.text-danger { color: #dc2626; }
	.text-danger:hover { background: #fee2e2; border-color: #fca5a5; }
	
	.text-danger-muted { color: #dc2626; font-size: 0.875rem; }

	.empty-message { text-align: center; color: var(--color-muted); padding: var(--space-4) !important; }

	.modal-actions {
		display: flex;
		justify-content: flex-end;
		gap: var(--space-2);
		margin-top: var(--space-4);
	}

	@media (max-width: 768px) {
		.form-grid { grid-template-columns: 1fr; }
	}
</style>