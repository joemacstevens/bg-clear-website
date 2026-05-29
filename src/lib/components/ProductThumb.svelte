<script lang="ts">
	import { categoryLabel } from '$lib/utils/categories';
	import type { ProductCategory } from '$lib/database.types';

	/**
	 * Compact product thumbnail for table rows and cart lines.
	 * Falls back to a category-letter placeholder when `imageUrl` is missing,
	 * matching the pattern from src/routes/(portal)/catalog/+page.svelte.
	 */
	let {
		imageUrl,
		name,
		category,
		size = 48
	}: {
		imageUrl?: string | null;
		name: string;
		category?: ProductCategory | string | null;
		size?: number;
	} = $props();

	const placeholderLetter = $derived(
		category ? categoryLabel(category, true).charAt(0).toUpperCase() : name.charAt(0).toUpperCase()
	);
</script>

<div class="thumb" style="--thumb-size: {size}px">
	{#if imageUrl}
		<img src={imageUrl} alt={name} loading="lazy" />
	{:else}
		<div class="thumb-placeholder" aria-hidden="true">{placeholderLetter}</div>
	{/if}
</div>

<style>
	.thumb {
		width: var(--thumb-size);
		height: var(--thumb-size);
		border-radius: var(--radius-sm);
		overflow: hidden;
		flex-shrink: 0;
		background: var(--color-bg);
		border: 1px solid var(--color-border);
	}

	.thumb img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
	}

	.thumb-placeholder {
		width: 100%;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		background: linear-gradient(135deg, var(--color-primary, #1e3a5f), var(--color-primary-dark, #0f2744));
		color: var(--color-accent, #d4a234);
		font-family: var(--font-heading, Montserrat), sans-serif;
		font-weight: 700;
		font-size: calc(var(--thumb-size) * 0.4);
	}
</style>
