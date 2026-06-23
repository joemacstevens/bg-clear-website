<script lang="ts">
	import type { CategoryNode } from '$lib/api/categories';

	let {
		tree = [],
		activeSlug = null,
		linkBase = '/catalog/c/',
		allHref = '/catalog'
	}: {
		tree?: CategoryNode[];
		activeSlug?: string | null;
		/** Prefix for category links — append the slug. Lets a rep page reuse this nav. */
		linkBase?: string;
		/** Href for the "All Products" link. */
		allHref?: string;
	} = $props();

	let openSlug = $state<string | null>(null);
	let closeTimer: ReturnType<typeof setTimeout> | null = null;

	function open(slug: string) {
		if (closeTimer) clearTimeout(closeTimer);
		openSlug = slug;
	}
	function scheduleClose() {
		if (closeTimer) clearTimeout(closeTimer);
		closeTimer = setTimeout(() => (openSlug = null), 120);
	}
</script>

<nav class="cat-nav" aria-label="Product categories">
	<div class="cat-bar">
		<a class="cat-top shop-all" class:active={!activeSlug} href={allHref}>All Products</a>
		{#each tree as top (top.id)}
			<div
				class="cat-item"
				role="group"
				onmouseenter={() => open(top.slug)}
				onmouseleave={scheduleClose}
			>
				<a
					class="cat-top"
					class:active={activeSlug === top.slug}
					class:open={openSlug === top.slug}
					href="{linkBase}{top.slug}"
					onfocus={() => open(top.slug)}
				>
					{top.name}
					{#if top.children.length}<span class="chev" aria-hidden="true">⌄</span>{/if}
				</a>

				{#if top.children.length && openSlug === top.slug}
					<div class="flyout" onmouseenter={() => open(top.slug)} onmouseleave={scheduleClose}>
						<a class="flyout-head" href="{linkBase}{top.slug}">All {top.name} →</a>
						<div class="flyout-grid">
							{#each top.children as child (child.id)}
								<a class="flyout-link" class:active={activeSlug === child.slug} href="{linkBase}{child.slug}">
									{child.name}
								</a>
							{/each}
						</div>
					</div>
				{/if}
			</div>
		{/each}
	</div>
</nav>

<style>
	.cat-nav {
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		margin-bottom: var(--space-4);
	}
	.cat-bar {
		display: flex;
		flex-wrap: wrap;
		align-items: stretch;
		gap: 0.25rem;
		padding: 0.25rem 0.5rem;
	}
	.cat-item {
		position: relative;
	}
	.cat-top {
		display: inline-flex;
		align-items: center;
		gap: 0.3rem;
		padding: 0.6rem 0.85rem;
		font-size: var(--text-small);
		font-weight: 600;
		color: var(--color-ink);
		text-decoration: none;
		border-radius: var(--radius-sm);
		white-space: nowrap;
		transition: background 0.12s, color 0.12s;
	}
	.cat-top:hover,
	.cat-top.open {
		background: var(--color-primary);
		color: #fff;
	}
	.cat-top.active {
		color: var(--color-primary);
	}
	.cat-top.active:hover,
	.cat-top.active.open {
		color: #fff;
	}
	.shop-all {
		color: var(--color-accent-dark, #b45309);
	}
	.chev {
		font-size: 0.7rem;
		opacity: 0.7;
	}

	.flyout {
		position: absolute;
		top: calc(100% + 2px);
		left: 0;
		z-index: 40;
		min-width: 260px;
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		box-shadow: var(--shadow-lg);
		padding: var(--space-2);
	}
	.flyout-head {
		display: block;
		font-size: 0.7rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		color: var(--color-primary);
		text-decoration: none;
		padding: 0.4rem 0.5rem;
	}
	.flyout-head:hover {
		text-decoration: underline;
	}
	.flyout-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 0.1rem;
	}
	.flyout-link {
		padding: 0.45rem 0.5rem;
		font-size: var(--text-small);
		color: var(--color-text);
		text-decoration: none;
		border-radius: var(--radius-sm);
		white-space: nowrap;
	}
	.flyout-link:hover {
		background: var(--color-bg);
		color: var(--color-primary);
	}
	.flyout-link.active {
		color: var(--color-primary);
		font-weight: 600;
	}

	@media (max-width: 768px) {
		.flyout-grid {
			grid-template-columns: 1fr;
		}
		.flyout {
			min-width: 220px;
		}
	}
</style>
