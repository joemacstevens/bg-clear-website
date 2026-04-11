<script lang="ts">
	let { value, label, color = 'var(--color-primary)' }: {
		value: string | number;
		label: string;
		color?: string;
	} = $props();
</script>

<div class="stat-card">
	<span class="stat-value" style="color: {color}">{value}</span>
	<span class="stat-label">{label}</span>
</div>

<style>
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
	}
	.stat-label {
		font-size: var(--text-small);
		color: var(--color-muted);
	}
</style>
