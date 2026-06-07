<script lang="ts">
	import type { PageData } from './$types';
	import CategoryNav from '$lib/components/portal/CategoryNav.svelte';
	import { quoteCart } from '$lib/stores/quote-cart';
	import { toasts } from '$lib/stores/toast';

	let { data }: { data: PageData } = $props();

	let search = $state('');
	let cartItems: import('$lib/stores/quote-cart').CartItem[] = $state([]);
	quoteCart.subscribe((items) => (cartItems = items));

	const filtered = $derived(
		data.products.filter(
			(p: any) =>
				!search ||
				p.name.toLowerCase().includes(search.toLowerCase()) ||
				p.vendor_name?.toLowerCase().includes(search.toLowerCase()) ||
				p.description?.toLowerCase().includes(search.toLowerCase())
		)
	);

	function isInCart(id: string) {
		return cartItems.some((i) => i.productId === id);
	}
	function addToCart(p: any) {
		quoteCart.addItem(p.id, p.name, p.category, 1, p.image_url);
		toasts.success(`${p.name} added to quote cart`);
	}
</script>

<svelte:head><title>{data.node.name} | BG Clear Catalog</title></svelte:head>

<div class="cat-page">
	<CategoryNav tree={data.tree} activeSlug={data.node.slug} />

	<nav class="breadcrumb" aria-label="Breadcrumb">
		<a href="/catalog">Catalog</a>
		{#each data.ancestors as a}
			<span class="sep">/</span><a href="/catalog/c/{a.slug}">{a.name}</a>
		{/each}
		<span class="sep">/</span><span class="current">{data.node.name}</span>
	</nav>

	<div class="cat-head">
		<div>
			<h1>{data.node.name}</h1>
			{#if data.node.description}<p class="cat-desc">{data.node.description}</p>{/if}
		</div>
		<span class="count">{data.products.length} item{data.products.length !== 1 ? 's' : ''}</span>
	</div>

	{#if data.children.length}
		<div class="subcats">
			{#each data.children as child}
				<a class="subcat-chip" href="/catalog/c/{child.slug}">{child.name}</a>
			{/each}
		</div>
	{/if}

	<div class="search-bar">
		<input type="search" placeholder="Search within {data.node.name}…" bind:value={search} />
	</div>

	{#if filtered.length === 0}
		<div class="empty">No products in this category yet.</div>
	{:else}
		<div class="product-grid">
			{#each filtered as product (product.id)}
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
	.cat-page {
		padding-bottom: var(--space-8);
	}
	.breadcrumb {
		font-size: var(--text-small);
		color: var(--color-muted);
		margin-bottom: var(--space-3);
	}
	.breadcrumb a {
		color: var(--color-primary);
		text-decoration: none;
	}
	.breadcrumb a:hover {
		text-decoration: underline;
	}
	.breadcrumb .sep {
		margin: 0 0.4rem;
		opacity: 0.5;
	}
	.breadcrumb .current {
		color: var(--color-ink);
		font-weight: 600;
	}

	.cat-head {
		display: flex;
		justify-content: space-between;
		align-items: flex-end;
		gap: var(--space-3);
		margin-bottom: var(--space-3);
	}
	.cat-head h1 {
		font-family: var(--font-heading);
		font-size: var(--text-h2);
		font-weight: 700;
		color: var(--color-ink);
		margin: 0;
	}
	.cat-desc {
		color: var(--color-muted);
		margin: var(--space-1) 0 0;
		font-size: var(--text-small);
	}
	.count {
		color: var(--color-muted);
		font-size: var(--text-small);
		white-space: nowrap;
	}

	.subcats {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		margin-bottom: var(--space-4);
	}
	.subcat-chip {
		padding: 0.4rem 0.9rem;
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-pill);
		font-size: var(--text-small);
		font-weight: 600;
		color: var(--color-primary);
		text-decoration: none;
	}
	.subcat-chip:hover {
		border-color: var(--color-primary);
		background: var(--color-primary);
		color: #fff;
	}

	.search-bar {
		margin-bottom: var(--space-4);
	}
	.search-bar input {
		width: 100%;
		max-width: 420px;
		padding: 0.7rem 1rem;
		border: 1px solid var(--color-border);
		border-radius: var(--radius-pill);
		font-size: var(--text-body);
		box-sizing: border-box;
	}
	.search-bar input:focus {
		outline: none;
		border-color: var(--color-primary);
		box-shadow: 0 0 0 3px rgba(30, 58, 95, 0.1);
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
	.img-link {
		display: block;
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
	.empty {
		padding: var(--space-6);
		text-align: center;
		color: var(--color-muted);
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
	}
</style>
