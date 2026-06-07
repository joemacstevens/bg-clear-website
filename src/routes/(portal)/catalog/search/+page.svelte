<script lang="ts">
	import type { PageData } from './$types';
	import CategoryNav from '$lib/components/portal/CategoryNav.svelte';
	import { quoteCart } from '$lib/stores/quote-cart';
	import { toasts } from '$lib/stores/toast';

	let { data }: { data: PageData } = $props();

	let cartItems: import('$lib/stores/quote-cart').CartItem[] = $state([]);
	quoteCart.subscribe((items) => (cartItems = items));

	function isInCart(id: string) {
		return cartItems.some((i) => i.productId === id);
	}
	function addToCart(p: any) {
		quoteCart.addItem(p.id, p.name, p.category, 1, p.image_url);
		toasts.success(`${p.name} added to quote cart`);
	}
</script>

<svelte:head><title>Search: {data.q} | BG Clear</title></svelte:head>

<div class="search-page">
	<CategoryNav tree={data.tree} activeSlug={null} />

	<h1>Search results</h1>
	<p class="sub">
		{data.products.length} result{data.products.length !== 1 ? 's' : ''} for <strong>“{data.q}”</strong>
	</p>

	{#if data.categories.length}
		<div class="cat-matches">
			<span class="cm-label">Matching categories:</span>
			{#each data.categories as c}
				<a class="cm-chip" href="/catalog/c/{c.slug}">{c.name}</a>
			{/each}
		</div>
	{/if}

	{#if data.products.length === 0}
		<div class="empty">
			No products matched “{data.q}”. Try a different term, or <a href="/catalog">browse the catalog</a>.
		</div>
	{:else}
		<div class="product-grid">
			{#each data.products as product (product.id)}
				<div class="product-card">
					<a href="/catalog/{product.id}" class="img-link">
						<div class="product-image">
							{#if product.image_url}
								<img src={product.image_url} alt={product.name} />
							{:else}
								<div class="placeholder">{product.name.charAt(0)}</div>
							{/if}
						</div>
					</a>
					<div class="product-info">
						<span class="vendor">{product.vendor_name}</span>
						<a href="/catalog/{product.id}" class="name-link"><h3>{product.name}</h3></a>
						{#if product.description}<p class="desc">{product.description}</p>{/if}
						{#if isInCart(product.id)}
							<button class="add-btn in-cart" disabled>✓ In Quote Cart</button>
						{:else}
							<button class="add-btn" onclick={() => addToCart(product)}>+ Add to Quote Request</button>
						{/if}
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>

<style>
	.search-page {
		padding-bottom: var(--space-8);
	}
	h1 {
		font-family: var(--font-heading);
		font-size: var(--text-h2);
		font-weight: 700;
		color: var(--color-ink);
		margin: 0;
	}
	.sub {
		color: var(--color-muted);
		margin: var(--space-1) 0 var(--space-3);
	}
	.cat-matches {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.5rem;
		margin-bottom: var(--space-4);
	}
	.cm-label {
		font-size: var(--text-small);
		color: var(--color-muted);
	}
	.cm-chip {
		padding: 0.35rem 0.85rem;
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-pill);
		font-size: var(--text-small);
		font-weight: 600;
		color: var(--color-primary);
		text-decoration: none;
	}
	.cm-chip:hover {
		background: var(--color-primary);
		color: #fff;
	}
	.empty {
		padding: var(--space-6);
		text-align: center;
		color: var(--color-muted);
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
	}
	.empty a {
		color: var(--color-primary);
	}

	.product-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
		gap: var(--space-4);
	}
	.product-card {
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		overflow: hidden;
		display: flex;
		flex-direction: column;
	}
	.product-image {
		aspect-ratio: 4 / 3;
		background: var(--color-bg);
		display: flex;
		align-items: center;
		justify-content: center;
	}
	.product-image img {
		width: 100%;
		height: 100%;
		object-fit: contain;
	}
	.placeholder {
		font-family: var(--font-heading);
		font-size: 2rem;
		font-weight: 700;
		color: var(--color-border);
	}
	.product-info {
		padding: var(--space-3);
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
		flex: 1;
	}
	.vendor {
		font-size: 0.7rem;
		color: var(--color-muted);
		text-transform: uppercase;
		letter-spacing: 0.04em;
	}
	.name-link {
		text-decoration: none;
	}
	.name-link h3 {
		font-size: var(--text-small);
		font-weight: 700;
		color: var(--color-ink);
		margin: 0;
		line-height: 1.3;
	}
	.desc {
		font-size: var(--text-small);
		color: var(--color-muted);
		margin: 0;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
	.add-btn {
		margin-top: auto;
		padding: 0.55rem 0.75rem;
		background: var(--color-accent);
		color: var(--color-ink);
		border: none;
		border-radius: var(--radius-pill);
		font-weight: 700;
		font-size: 0.8rem;
		cursor: pointer;
	}
	.add-btn.in-cart {
		background: var(--color-border-subtle);
		color: var(--color-muted);
		cursor: default;
	}
</style>
