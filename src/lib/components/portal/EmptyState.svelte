<script lang="ts">
	let { message, actionLabel = '', actionHref = '' }: {
		message: string;
		actionLabel?: string;
		actionHref?: string;
	} = $props();
</script>

<div class="empty-state">
	<p>{message}</p>
	{#if actionLabel && actionHref}
		<a href={actionHref} class="action-link">{actionLabel}</a>
	{/if}
</div>

<style>
	.empty-state {
		text-align: center;
		padding: var(--space-8) var(--space-4);
		color: var(--color-muted);
	}
	.empty-state p { margin: 0 auto; }
	.action-link {
		display: inline-block;
		margin-top: var(--space-2);
		padding: 0.5rem 1.25rem;
		background: var(--color-primary);
		color: white;
		border-radius: var(--radius-sm);
		font-weight: 600;
		font-size: var(--text-small);
	}
</style>
