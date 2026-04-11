<script lang="ts">
	let { value = $bindable(''), placeholder = 'Search...', debounce = 300 }: {
		value: string;
		placeholder?: string;
		debounce?: number;
	} = $props();

	let timer: ReturnType<typeof setTimeout>;

	function handleInput(e: Event) {
		const target = e.target as HTMLInputElement;
		clearTimeout(timer);
		timer = setTimeout(() => { value = target.value; }, debounce);
	}
</script>

<div class="search-wrap">
	<input
		type="search"
		{placeholder}
		value={value}
		oninput={handleInput}
	/>
	{#if value}
		<button class="clear-btn" onclick={() => value = ''} aria-label="Clear search">&times;</button>
	{/if}
</div>

<style>
	.search-wrap {
		position: relative;
		display: inline-flex;
		align-items: center;
	}
	input {
		padding: 0.5rem 2rem 0.5rem 1rem;
		border: 1px solid var(--color-border);
		border-radius: var(--radius-pill);
		font-size: var(--text-small);
		font-family: var(--font-body);
		width: 240px;
	}
	input:focus {
		outline: none;
		border-color: var(--color-primary);
		box-shadow: 0 0 0 3px rgba(30, 58, 95, 0.1);
	}
	.clear-btn {
		position: absolute;
		right: 0.5rem;
		background: none;
		border: none;
		font-size: 1.1rem;
		cursor: pointer;
		color: var(--color-muted);
		line-height: 1;
	}
</style>
