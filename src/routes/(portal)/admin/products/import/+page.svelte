<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData } from './$types';
	import { formatCurrency } from '$lib/utils/format';
	import StatusBadge from '$lib/components/portal/StatusBadge.svelte';
	import EmptyState from '$lib/components/portal/EmptyState.svelte';

	let { form }: { form: ActionData } = $props();

	let fileInput: HTMLInputElement | undefined = $state();
	let parsedProducts = $state<any[]>([]);
	let validationErrors = $state<number>(0);
	let isImporting = $state(false);

	const validCategories = ['health_monitoring', 'mobility_safety', 'specialized_support', 'capital_equipment'];

	// Simple CSV parser for demonstration
	function parseCSV(text: string) {
		const lines = text.split(/\r?\n/).filter((line) => line.trim() !== '');
		if (lines.length < 2) return [];

		const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());
		const result = [];

		for (let i = 1; i < lines.length; i++) {
			// Extremely naive split, doesn't handle commas inside quotes well but ok for MVP
			const values = lines[i].split(',').map((v) => v.trim().replace(/^"|"$/g, ''));
			const row: Record<string, string> = {};
			
			headers.forEach((header, index) => {
				row[header] = values[index] || '';
			});

			result.push(row);
		}

		return result;
	}

	function handleFileUpload(event: Event) {
		const target = event.target as HTMLInputElement;
		const file = target.files?.[0];
		
		if (!file) return;

		const reader = new FileReader();
		reader.onload = (e) => {
			const text = e.target?.result as string;
			const rows = parseCSV(text);
			validateRows(rows);
		};
		reader.readAsText(file);
	}

	function validateRows(rows: any[]) {
		validationErrors = 0;
		parsedProducts = rows.map((row, index) => {
			const cost = parseFloat(row.vendor_cost);
			const errors: string[] = [];

			if (!row.name) errors.push('Name missing');
			if (!row.category || !validCategories.includes(row.category)) errors.push('Invalid category');
			if (!row.vendor_name) errors.push('Vendor missing');
			if (isNaN(cost) || cost < 0) errors.push('Invalid cost');

			if (errors.length > 0) validationErrors++;

			return {
				_row: index + 2,
				_errors: errors,
				name: row.name || '',
				category: validCategories.includes(row.category) ? row.category : 'health_monitoring',
				vendor_name: row.vendor_name || '',
				vendor_cost: isNaN(cost) ? 0 : cost,
				vendor_sku: row.vendor_sku || null,
				sku: row.sku || null,
				description: row.description || null,
				image_url: row.image_url || null,
				is_active: true
			};
		});
	}

	function resetImport() {
		parsedProducts = [];
		validationErrors = 0;
		if (fileInput) fileInput.value = '';
	}
</script>

<svelte:head>
	<title>Import Products | BG Clear Admin</title>
</svelte:head>

<div class="admin-page">
	<div class="admin-header">
		<div>
			<h1>Import Products</h1>
			<p>Bulk upload products via CSV</p>
		</div>
		<a href="/admin/products" class="btn-secondary">← Back to Products</a>
	</div>

	{#if form?.success}
		<div class="success-banner">
			<strong>Success!</strong> {form.count} products have been imported.
			<button class="btn-primary-sm" onclick={() => window.location.href = '/admin/products'}>View Catalog</button>
		</div>
	{/if}

	{#if form?.error}
		<div class="error-banner">
			<strong>Import Failed:</strong> {form.error}
		</div>
	{/if}

	<div class="import-card">
		<div class="upload-area">
			<h2>Upload CSV File</h2>
			<p>Your CSV should contain the following headers: <code>name, category, vendor_name, vendor_cost, vendor_sku, sku, description, image_url</code></p>
			
			<div class="file-input-wrapper">
				<input 
					type="file" 
					accept=".csv" 
					bind:this={fileInput}
					onchange={handleFileUpload}
					id="csv-upload"
				/>
				<label for="csv-upload" class="btn-primary">Choose CSV File</label>
				<span class="file-name">{fileInput?.files?.[0]?.name || 'No file chosen'}</span>
			</div>
		</div>

		{#if parsedProducts.length > 0}
			<div class="preview-section">
				<div class="preview-header">
					<h3>Preview ({parsedProducts.length} rows)</h3>
					{#if validationErrors > 0}
						<div class="error-badge">{validationErrors} rows have errors</div>
					{/if}
				</div>

				<div class="table-wrap">
					<table class="preview-table">
						<thead>
							<tr>
								<th>Row</th>
								<th>Name</th>
								<th>Category</th>
								<th>Vendor</th>
								<th>Cost</th>
								<th>Status</th>
							</tr>
						</thead>
						<tbody>
							{#each parsedProducts as product}
								<tr class:has-error={product._errors.length > 0}>
									<td class="mono">{product._row}</td>
									<td>{product.name || '---'}</td>
									<td>{product.category || '---'}</td>
									<td>{product.vendor_name || '---'}</td>
									<td class="mono">{formatCurrency(product.vendor_cost)}</td>
									<td>
										{#if product._errors.length > 0}
											<span class="error-text" title={product._errors.join(', ')}>
												Invalid ({product._errors.length})
											</span>
										{:else}
											<span class="success-text">Valid</span>
										{/if}
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>

				<div class="import-actions">
					<button class="btn-secondary" onclick={resetImport}>Cancel / Reset</button>
					<form method="POST" action="?/bulkInsert" use:enhance={() => {
						isImporting = true;
						return async ({ update }) => {
							isImporting = false;
							update();
						};
					}}>
						<input type="hidden" name="products" value={JSON.stringify(parsedProducts.filter(p => p._errors.length === 0).map(p => {
							const { _row, _errors, ...data } = p;
							return data;
						}))} />
						<button type="submit" class="btn-primary" disabled={parsedProducts.length === 0 || isImporting || validationErrors === parsedProducts.length}>
							{isImporting ? 'Importing...' : `Import ${parsedProducts.length - validationErrors} Valid Products`}
						</button>
					</form>
				</div>
			</div>
		{/if}
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
		display: inline-block;
		padding: 0.5rem 1.25rem;
		background: var(--color-primary);
		color: white;
		border: none;
		border-radius: var(--radius-sm);
		font-size: var(--text-small);
		font-weight: 600;
		font-family: var(--font-heading);
		cursor: pointer;
		text-align: center;
	}

	.btn-primary:hover:not(:disabled) { background: var(--color-primary-dark); }
	.btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }

	.btn-primary-sm {
		padding: 0.25rem 0.75rem;
		background: white;
		color: var(--color-primary);
		border: none;
		border-radius: var(--radius-sm);
		font-size: var(--text-small);
		font-weight: 600;
		cursor: pointer;
		margin-left: 1rem;
	}

	.btn-secondary {
		display: inline-block;
		padding: 0.5rem 1.25rem;
		background: transparent;
		color: var(--color-text);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-sm);
		font-size: var(--text-small);
		font-weight: 600;
		cursor: pointer;
		text-decoration: none;
	}

	.btn-secondary:hover { background: var(--color-bg); }

	.success-banner {
		background: #dcfce7;
		color: #166534;
		padding: var(--space-3);
		border-radius: var(--radius-md);
		margin-bottom: var(--space-4);
		border: 1px solid #bbf7d0;
		display: flex;
		align-items: center;
	}

	.error-banner {
		background: #fee2e2;
		color: #991b1b;
		padding: var(--space-3);
		border-radius: var(--radius-md);
		margin-bottom: var(--space-4);
		border: 1px solid #fecaca;
	}

	.import-card {
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		padding: var(--space-5);
		box-shadow: var(--shadow-sm);
	}

	.upload-area h2 {
		font-family: var(--font-heading);
		font-size: var(--text-h3);
		margin: 0 0 var(--space-2);
	}

	.upload-area p {
		color: var(--color-muted);
		font-size: var(--text-small);
		margin-bottom: var(--space-4);
	}
	
	.upload-area code {
		background: var(--color-bg);
		padding: 0.125rem 0.25rem;
		border-radius: 4px;
		border: 1px solid var(--color-border);
		font-size: 0.85em;
	}

	.file-input-wrapper {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		margin-bottom: var(--space-4);
	}

	.file-input-wrapper input[type="file"] {
		display: none;
	}

	.file-name {
		font-size: var(--text-small);
		color: var(--color-muted);
	}

	.preview-section {
		margin-top: var(--space-6);
		border-top: 1px solid var(--color-border);
		padding-top: var(--space-4);
	}

	.preview-header {
		display: flex;
		align-items: center;
		gap: var(--space-4);
		margin-bottom: var(--space-3);
	}

	.preview-header h3 {
		margin: 0;
		font-family: var(--font-heading);
		font-size: 1.125rem;
	}

	.error-badge {
		background: #fee2e2;
		color: #991b1b;
		padding: 0.125rem 0.5rem;
		border-radius: var(--radius-pill);
		font-size: 0.75rem;
		font-weight: 600;
	}

	.table-wrap {
		overflow-x: auto;
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		max-height: 400px;
		margin-bottom: var(--space-4);
	}

	.preview-table {
		width: 100%;
		border-collapse: collapse;
		font-size: var(--text-small);
	}

	.preview-table th {
		text-align: left;
		padding: 0.5rem 0.75rem;
		background: var(--color-bg);
		border-bottom: 1px solid var(--color-border);
		position: sticky;
		top: 0;
		z-index: 1;
	}

	.preview-table td {
		padding: 0.5rem 0.75rem;
		border-bottom: 1px solid var(--color-border-subtle);
	}

	.has-error td {
		background: #fef2f2;
	}

	.error-text {
		color: #dc2626;
		font-weight: 500;
		cursor: help;
		border-bottom: 1px dotted #dc2626;
	}

	.success-text {
		color: #16a34a;
		font-weight: 500;
	}

	.mono {
		font-variant-numeric: tabular-nums;
		font-family: monospace;
	}

	.import-actions {
		display: flex;
		justify-content: flex-end;
		gap: var(--space-3);
	}
</style>
