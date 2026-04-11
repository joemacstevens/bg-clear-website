<script lang="ts">
	let { status, labels = {}, colors = {} }: {
		status: string;
		labels?: Record<string, string>;
		colors?: Record<string, string>;
	} = $props();

	const label = $derived(labels[status] ?? status.replace(/_/g, ' '));
	const color = $derived(colors[status] ?? '#6b7280');
</script>

<span class="badge" style="--badge-color: {color}; --badge-bg: {color}18">
	{label}
</span>

<style>
	.badge {
		display: inline-flex;
		align-items: center;
		padding: 0.125rem 0.625rem;
		border-radius: 999px;
		font-size: 0.7rem;
		font-weight: 600;
		text-transform: capitalize;
		color: var(--badge-color);
		background: var(--badge-bg);
		white-space: nowrap;
	}
</style>
