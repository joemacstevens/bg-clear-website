<script lang="ts">
	let { open = false, title = '', onclose = () => {}, children, footer }: {
		open: boolean;
		title?: string;
		onclose?: () => void;
		children: any;
		footer?: any;
	} = $props();

	function handleBackdrop(e: MouseEvent) {
		if (e.target === e.currentTarget) onclose();
	}

	function handleKey(e: KeyboardEvent) {
		if (e.key === 'Escape') onclose();
	}
</script>

{#if open}
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div class="modal-backdrop" onclick={handleBackdrop} onkeydown={handleKey}>
		<div class="modal-content" role="dialog" aria-modal="true" aria-label={title}>
			{#if title}
				<div class="modal-header">
					<h2>{title}</h2>
					<button class="modal-close" onclick={onclose} aria-label="Close">&times;</button>
				</div>
			{/if}
			<div class="modal-body">
				{@render children()}
			</div>
			{#if footer}
				<div class="modal-footer">
					{@render footer()}
				</div>
			{/if}
		</div>
	</div>
{/if}

<style>
	.modal-backdrop {
		position: fixed;
		inset: 0;
		background: rgba(0,0,0,0.4);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
		padding: var(--space-4);
	}
	.modal-content {
		background: var(--color-surface);
		border-radius: var(--radius-lg);
		box-shadow: var(--shadow-lg);
		width: 100%;
		max-width: 560px;
		max-height: 90vh;
		overflow-y: auto;
	}
	.modal-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: var(--space-3) var(--space-4);
		border-bottom: 1px solid var(--color-border);
	}
	.modal-header h2 {
		font-family: var(--font-heading);
		font-size: 1.125rem;
		font-weight: 700;
		margin: 0;
	}
	.modal-close {
		background: none;
		border: none;
		font-size: 1.5rem;
		cursor: pointer;
		color: var(--color-muted);
		line-height: 1;
	}
	.modal-body { padding: var(--space-4); }
	.modal-footer {
		padding: var(--space-3) var(--space-4);
		border-top: 1px solid var(--color-border);
		display: flex;
		justify-content: flex-end;
		gap: var(--space-2);
	}
</style>
