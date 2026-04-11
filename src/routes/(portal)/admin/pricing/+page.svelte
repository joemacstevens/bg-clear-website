<script lang="ts">
	import type { PageData, ActionData } from './$types';
	import { enhance } from '$app/forms';
	import { toasts } from '$lib/stores/toast';
	import { categoryLabel } from '$lib/utils/categories';
	import { formatCurrency } from '$lib/utils/format';
	import {
		computeBgCost,
		computeTargetPrice,
		computeSuggestedPrice,
		computeCommission
	} from '$lib/utils/pricing';
	import type { CategoryPricingRule } from '$lib/database.types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	$effect(() => {
		if (form?.success) {
			toasts.success('Pricing rule updated successfully');
			editingId = null;
		}
		if (form?.error) {
			toasts.error(form.error);
		}
	});

	let editingId = $state<string | null>(null);
	let editData = $state<Partial<CategoryPricingRule>>({});
	let exampleVendorCost = $state(100);

	function startEdit(rule: CategoryPricingRule) {
		editingId = rule.id;
		editData = { ...rule };
	}

	function cancelEdit() {
		editingId = null;
		editData = {};
	}

	const exampleComputations = $derived.by(() => {
		if (!editingId) return null;

		const vendorCost = exampleVendorCost || 0;
		const margin = editData.margin_reserve_default || 0;
		const markup = editData.markup_to_target_default || 0;
		const premium = editData.suggested_premium_default || 0;
		const commTarget = editData.commission_at_target || 0;
		const commAbove = editData.commission_above_target || 0;

		const bgCost = computeBgCost(vendorCost, margin);
		const targetPrice = computeTargetPrice(bgCost, markup);
		const suggestedPrice = computeSuggestedPrice(targetPrice, premium);
		// Example commission if sold at suggested price
		const commissionAtSuggested = computeCommission(suggestedPrice, bgCost, targetPrice, commTarget, commAbove);

		return {
			bgCost,
			targetPrice,
			suggestedPrice,
			commissionAtSuggested
		};
	});
</script>

<div class="pricing-rules-page">
	<header class="page-header">
		<div>
			<h1>Pricing Rules</h1>
			<p class="text-muted">Manage global category margins, markups, and commission rates.</p>
		</div>
	</header>

	{#if editingId}
		<div class="example-calculator">
			<h3>Example Calculator</h3>
			<div class="calculator-inputs">
				<label>
					Vendor Cost:
					<div class="input-with-symbol">
						<span class="symbol">$</span>
						<input type="number" bind:value={exampleVendorCost} min="0" step="1" />
					</div>
				</label>
			</div>
			<div class="calculator-results">
				<div class="result-box">
					<span class="label">BG Cost</span>
					<span class="value">{formatCurrency(exampleComputations?.bgCost || 0)}</span>
				</div>
				<div class="result-box">
					<span class="label">Target Price</span>
					<span class="value">{formatCurrency(exampleComputations?.targetPrice || 0)}</span>
				</div>
				<div class="result-box">
					<span class="label">Suggested Price</span>
					<span class="value">{formatCurrency(exampleComputations?.suggestedPrice || 0)}</span>
				</div>
				<div class="result-box">
					<span class="label">Est. Commission</span>
					<span class="value">{formatCurrency(exampleComputations?.commissionAtSuggested || 0)}</span>
				</div>
			</div>
		</div>
	{/if}

	<div class="table-container">
		<table class="data-table">
			<thead>
				<tr>
					<th>Category</th>
					<th>Margin Reserve (%)<br/><small>Min / Def / Max</small></th>
					<th>Markup to Target (%)<br/><small>Min / Def / Max</small></th>
					<th>Suggested Premium (%)<br/><small>Min / Def / Max</small></th>
					<th>Commission Rates (%)<br/><small>At Target / Above</small></th>
					<th class="actions-col">Actions</th>
				</tr>
			</thead>
			<tbody>
				{#each data.rules as rule}
					{#if editingId === rule.id}
						<tr class="editing-row">
							<td class="category-col">
								<strong>{categoryLabel(rule.category)}</strong>
							</td>
							<td colspan="5">
								<form method="POST" action="?/update" use:enhance>
									<input type="hidden" name="id" value={rule.id} />
									<input type="hidden" name="category" value={rule.category} />
									
									<div class="edit-grid">
										<div class="edit-group">
											<span class="label-text">Margin Reserve (%)</span>
											<div class="inputs-row">
												<input type="number" name="margin_reserve_min" bind:value={editData.margin_reserve_min} step="0.1" required title="Min" />
												<input type="number" name="margin_reserve_default" bind:value={editData.margin_reserve_default} step="0.1" required title="Default" />
												<input type="number" name="margin_reserve_max" bind:value={editData.margin_reserve_max} step="0.1" required title="Max" />
											</div>
										</div>

										<div class="edit-group">
											<span class="label-text">Markup to Target (%)</span>
											<div class="inputs-row">
												<input type="number" name="markup_to_target_min" bind:value={editData.markup_to_target_min} step="0.1" required title="Min" />
												<input type="number" name="markup_to_target_default" bind:value={editData.markup_to_target_default} step="0.1" required title="Default" />
												<input type="number" name="markup_to_target_max" bind:value={editData.markup_to_target_max} step="0.1" required title="Max" />
											</div>
										</div>

										<div class="edit-group">
											<span class="label-text">Suggested Premium (%)</span>
											<div class="inputs-row">
												<input type="number" name="suggested_premium_min" bind:value={editData.suggested_premium_min} step="0.1" required title="Min" />
												<input type="number" name="suggested_premium_default" bind:value={editData.suggested_premium_default} step="0.1" required title="Default" />
												<input type="number" name="suggested_premium_max" bind:value={editData.suggested_premium_max} step="0.1" required title="Max" />
											</div>
										</div>

										<div class="edit-group">
											<span class="label-text">Commission (%)</span>
											<div class="inputs-row">
												<input type="number" name="commission_at_target" bind:value={editData.commission_at_target} step="0.1" required title="At Target" />
												<input type="number" name="commission_above_target" bind:value={editData.commission_above_target} step="0.1" required title="Above Target" />
											</div>
										</div>

										<div class="edit-actions">
											<button type="submit" class="btn btn-primary">Save</button>
											<button type="button" class="btn btn-outline" onclick={cancelEdit}>Cancel</button>
										</div>
									</div>
								</form>
							</td>
						</tr>
					{:else}
						<tr>
							<td>
								<strong>{categoryLabel(rule.category)}</strong>
							</td>
							<td>
								{rule.margin_reserve_min}% / <strong>{rule.margin_reserve_default}%</strong> / {rule.margin_reserve_max}%
							</td>
							<td>
								{rule.markup_to_target_min}% / <strong>{rule.markup_to_target_default}%</strong> / {rule.markup_to_target_max}%
							</td>
							<td>
								{rule.suggested_premium_min}% / <strong>{rule.suggested_premium_default}%</strong> / {rule.suggested_premium_max}%
							</td>
							<td>
								{rule.commission_at_target}% / {rule.commission_above_target}%
							</td>
							<td class="actions-col">
								<button class="btn btn-sm btn-outline" onclick={() => startEdit(rule)}>
									Edit
								</button>
							</td>
						</tr>
					{/if}
				{/each}
			</tbody>
		</table>
	</div>
</div>

<style>
	.pricing-rules-page {
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

	.example-calculator {
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		padding: var(--space-4);
		box-shadow: var(--shadow-sm);
	}

	.example-calculator h3 {
		margin: 0 0 var(--space-4) 0;
		font-size: 1.125rem;
		color: var(--color-ink);
	}

	.calculator-inputs {
		margin-bottom: var(--space-4);
	}

	.calculator-inputs label {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		font-size: 0.875rem;
		font-weight: 500;
	}

	.input-with-symbol {
		position: relative;
		display: flex;
		align-items: center;
	}

	.input-with-symbol .symbol {
		position: absolute;
		left: var(--space-2);
		color: var(--color-muted);
	}

	.input-with-symbol input {
		padding-left: 1.5rem;
		width: 120px;
		border: 1px solid var(--color-border);
		border-radius: var(--radius-sm);
		padding-top: var(--space-1);
		padding-bottom: var(--space-1);
	}

	.calculator-results {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
		gap: var(--space-4);
	}

	.result-box {
		background: var(--color-bg);
		padding: var(--space-3);
		border-radius: var(--radius-sm);
		border: 1px solid var(--color-border);
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
	}

	.result-box .label {
		font-size: 0.75rem;
		color: var(--color-muted);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.result-box .value {
		font-size: 1.25rem;
		font-weight: 600;
		color: var(--color-ink);
	}

	.table-container {
		background: var(--color-surface);
		border-radius: var(--radius-md);
		border: 1px solid var(--color-border);
		overflow-x: auto;
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

	.data-table tbody tr:last-child td {
		border-bottom: none;
	}

	.actions-col {
		text-align: right;
		width: 100px;
	}

	.editing-row td {
		background: var(--color-accent-light);
		padding: 0;
	}

	.category-col {
		padding: var(--space-4) !important;
		vertical-align: top;
	}

	.edit-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: var(--space-4);
		padding: var(--space-4) var(--space-4) var(--space-4) 0;
	}

	.edit-group {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	.edit-group .label-text {
		font-size: 0.75rem;
		font-weight: 600;
		color: var(--color-ink);
	}

	.inputs-row {
		display: flex;
		gap: var(--space-2);
	}

	.inputs-row input {
		width: 60px;
		padding: var(--space-1);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-sm);
		text-align: center;
		font-size: 0.875rem;
	}

	.edit-actions {
		display: flex;
		gap: var(--space-2);
		align-items: flex-end;
		justify-content: flex-end;
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
</style>
