<script lang="ts">
	import type { PageData } from './$types';
	import type { ProductCategory } from '$lib/database.types';
	import { quoteCart } from '$lib/stores/quote-cart';
	import { toasts } from '$lib/stores/toast';
	import { categoryLabel } from '$lib/utils/categories';
	import CategoryNav from '$lib/components/portal/CategoryNav.svelte';

	let { data }: { data: PageData } = $props();

	const categories: { value: ProductCategory | null; label: string }[] = [
		{ value: null, label: 'All Products' },
		{ value: 'health_monitoring', label: 'Health Monitoring' },
		{ value: 'mobility_safety', label: 'Mobility & Safety' },
		{ value: 'specialized_support', label: 'Specialized Support' },
		{ value: 'capital_equipment', label: 'Capital Equipment' }
	];

	let search = $state('');
	let cartItems: import('$lib/stores/quote-cart').CartItem[] = $state([]);
	quoteCart.subscribe((items) => { cartItems = items; });

	const filteredProducts = $derived(
		data.products.filter((p) =>
			!search || p.name.toLowerCase().includes(search.toLowerCase())
			|| p.description?.toLowerCase().includes(search.toLowerCase())
			|| p.vendor_name.toLowerCase().includes(search.toLowerCase())
		)
	);

	const groupedProducts = $derived(() => {
		const groups: Record<string, typeof data.products> = {};
		for (const product of filteredProducts) {
			const cat = product.category;
			if (!groups[cat]) groups[cat] = [];
			groups[cat].push(product);
		}
		return groups;
	});

	function isInCart(productId: string): boolean {
		return cartItems.some((i) => i.productId === productId);
	}

	function addToCart(product: typeof data.products[0]) {
		quoteCart.addItem(product.id, product.name, product.category, 1, product.image_url);
		toasts.success(`${product.name} added to quote cart`);
	}
</script>

<svelte:head>
	<title>Product Catalog | BG Clear</title>
</svelte:head>

<div class="catalog-page">
	<div class="catalog-header-banner">
		<div class="banner-content">
			<span class="banner-eyebrow">BG Clear DME Portal</span>
			<h1>Product Catalog</h1>
			<p>Browse our tech-forward durable medical equipment. Select products to request a custom quote from your sales representative.</p>
		</div>
		<a href="/catalog/quote" class="cart-link-btn">
			<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="cart-icon-svg">
				<path stroke-linecap="round" stroke-linejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
			</svg>
			<span>Quote Cart</span>
			{#if cartItems.length > 0}
				<span class="cart-count-badge">{cartItems.length}</span>
			{/if}
		</a>
	</div>

	<div class="catalog-search-hero">
		<svg class="hero-search-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
			<path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
		</svg>
		<input
			class="hero-search"
			type="search"
			placeholder="Search products, brands, or categories…"
			bind:value={search}
		/>
	</div>

	<CategoryNav tree={data.tree} activeSlug={null} />

	{#if filteredProducts.length === 0}
		<div class="empty-state">
			<p>No products found. {search ? 'Try a different search term.' : 'Products are being added — check back soon.'}</p>
		</div>
	{:else}
		{#each Object.entries(groupedProducts()) as [category, products]}
			<section class="category-section">
				<h2 class="category-title">
					<span>{categoryLabel(category, true)}</span>
					<span class="category-count">{products.length} Item{products.length !== 1 ? 's' : ''}</span>
				</h2>
				<div class="product-grid">
					{#each products as product}
						<div class="product-card">
							<a href="/catalog/{product.id}" class="product-image-link">
								<div class="product-image">
									{#if product.image_url}
										<img src={product.image_url} alt={product.name} />
									{:else}
										<div class="placeholder-image">
											<svg class="placeholder-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none" stroke="currentColor">
												<path d="M0 25h100M0 50h100M0 75h100M25 0v100M50 0v100M75 0v100" stroke="rgba(30, 58, 95, 0.03)" stroke-width="0.5" />
												<path d="M15 85 C 40 85, 60 40, 85 15" stroke="var(--color-gold)" stroke-width="1.5" stroke-linecap="round" opacity="0.15" />
												<path d="M44 32h12v12h12v12H56v12H44V56H32V44h12V32z" fill="var(--color-primary)" opacity="0.08" />
											</svg>
											<span class="placeholder-letter">{categoryLabel(product.category, true).charAt(0)}</span>
										</div>
									{/if}
								</div>
							</a>
							<div class="product-info">
								<div class="vendor-row">
									<span class="product-vendor">{product.vendor_name}</span>
									<span class="product-sku">{product.sku ? `SKU: ${product.sku}` : ''}</span>
								</div>
								<a href="/catalog/{product.id}" class="product-name-link">
									<h3 class="product-name">{product.name}</h3>
								</a>
								<p class="product-desc">{product.description}</p>
								{#if product.specs && Object.keys(product.specs).length > 0}
									<div class="product-specs">
										{#each Object.entries(product.specs).slice(0, 3) as [key, value]}
											<span class="spec-tag">{key}: {value}</span>
										{/each}
									</div>
								{/if}
								<div class="action-row">
									{#if isInCart(product.id)}
										<button class="add-to-quote-btn in-cart" disabled>
											<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" width="16" height="16" style="margin-right: 4px; display: inline; vertical-align: middle;">
												<path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
											</svg>
											In Quote Cart
										</button>
									{:else}
										<button class="add-to-quote-btn" onclick={() => addToCart(product)}>
											+ Add to Quote Request
										</button>
									{/if}
								</div>
							</div>
						</div>
					{/each}
				</div>
			</section>
		{/each}
	{/if}
</div>

<style>
	.catalog-page {
		padding-bottom: var(--space-8);
	}

	.catalog-header-banner {
		margin-bottom: var(--space-5);
		padding: var(--space-4) var(--space-5);
		background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%);
		border-radius: var(--radius-md);
		box-shadow: var(--shadow-md);
		position: relative;
		overflow: hidden;
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: var(--space-4);
	}

	/* Decorative cross background element on banner */
	.catalog-header-banner::after {
		content: '';
		position: absolute;
		right: -30px;
		bottom: -30px;
		width: 180px;
		height: 180px;
		background: radial-gradient(circle, rgba(212, 162, 52, 0.08) 0%, transparent 70%);
		pointer-events: none;
	}

	.banner-content {
		position: relative;
		z-index: 2;
		max-width: 720px;
		color: #ffffff;
	}

	.banner-eyebrow {
		display: block;
		font-size: 0.75rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.12em;
		color: var(--color-gold);
		margin-bottom: 0.5rem;
	}

	.catalog-header-banner h1 {
		font-family: var(--font-heading);
		font-size: clamp(1.75rem, 3vw, 2.25rem);
		font-weight: 700;
		color: #ffffff;
		margin: 0 0 var(--space-1);
		letter-spacing: -0.01em;
	}

	.catalog-header-banner p {
		color: rgba(255, 255, 255, 0.82);
		margin: 0;
		font-size: var(--text-small);
		line-height: 1.5;
	}

	.cart-link-btn {
		display: inline-flex;
		align-items: center;
		gap: 0.625rem;
		padding: 0.75rem 1.5rem;
		background: var(--color-gold);
		color: var(--color-primary-dark);
		border-radius: var(--radius-pill);
		font-size: var(--text-small);
		font-weight: 700;
		font-family: var(--font-heading);
		text-decoration: none;
		white-space: nowrap;
		transition: all 0.22s ease;
		box-shadow: 0 4px 14px rgba(212, 162, 52, 0.25);
		position: relative;
		z-index: 2;
	}

	.cart-link-btn:hover {
		transform: translateY(-2px);
		box-shadow: 0 6px 20px rgba(212, 162, 52, 0.4);
		background: #e5b344;
	}

	.cart-icon-svg {
		width: 18px;
		height: 18px;
		color: var(--color-primary-dark);
	}

	.cart-count-badge {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-width: 1.25rem;
		height: 1.25rem;
		padding: 0 0.375rem;
		background: var(--color-primary-dark);
		color: #ffffff;
		border-radius: 999px;
		font-size: 0.7rem;
		font-weight: 700;
		box-shadow: var(--shadow-sm);
	}

	.catalog-controls {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-3);
		margin-bottom: var(--space-5);
		align-items: center;
		background: var(--color-surface);
		padding: var(--space-2) var(--space-3);
		border-radius: var(--radius-md);
		border: 1px solid var(--color-border);
	}

	.category-filters {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		flex: 1;
	}

	.category-pill {
		padding: 0.45rem 1.15rem;
		border-radius: var(--radius-pill);
		font-size: var(--text-small);
		font-weight: 500;
		color: var(--color-muted);
		background: transparent;
		border: 1px solid transparent;
		text-decoration: none;
		transition: all 0.2s ease;
		white-space: nowrap;
	}

	.category-pill:hover {
		color: var(--color-primary);
		background: var(--color-border-subtle);
	}

	.category-pill.active {
		background: rgba(30, 58, 95, 0.08);
		color: var(--color-primary);
		font-weight: 600;
	}

	.search-bar input {
		padding: 0.5rem 1.25rem;
		border: 1px solid var(--color-border);
		border-radius: var(--radius-pill);
		font-size: var(--text-small);
		font-family: var(--font-body);
		width: 280px;
		background: var(--color-bg);
		transition: all 0.2s ease;
	}

	.search-bar input:focus {
		outline: none;
		border-color: var(--color-primary);
		background: #ffffff;
		box-shadow: 0 0 0 3px rgba(30, 58, 95, 0.08);
	}

	.catalog-search-hero {
		position: relative;
		margin-bottom: var(--space-4);
	}

	.hero-search-icon {
		position: absolute;
		left: 1.1rem;
		top: 50%;
		transform: translateY(-50%);
		width: 22px;
		height: 22px;
		color: var(--color-muted);
		pointer-events: none;
	}

	.hero-search {
		width: 100%;
		padding: 1rem 1.25rem 1rem 3.1rem;
		font-size: 1.1rem;
		font-family: var(--font-body);
		border: 2px solid var(--color-border);
		border-radius: var(--radius-pill);
		background: var(--color-surface);
		box-sizing: border-box;
		transition: border-color 0.15s, box-shadow 0.15s;
	}

	.hero-search:focus {
		outline: none;
		border-color: var(--color-primary);
		box-shadow: 0 0 0 4px rgba(30, 58, 95, 0.1);
	}

	.category-section {
		margin-bottom: var(--space-6);
	}

	.category-title {
		font-family: var(--font-heading);
		font-size: 1.25rem;
		font-weight: 700;
		color: var(--color-ink);
		margin: 0 0 var(--space-3);
		padding-bottom: var(--space-2);
		border-bottom: 2px solid var(--color-border-subtle);
		display: flex;
		justify-content: space-between;
		align-items: baseline;
	}

	.category-count {
		font-size: var(--text-small);
		font-weight: 500;
		color: var(--color-muted);
		font-family: var(--font-body);
	}

	.product-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
		gap: var(--space-4);
	}

	.product-card {
		background: var(--color-surface);
		border-radius: var(--radius-md);
		border: 1px solid var(--color-border);
		overflow: hidden;
		transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
		display: flex;
		flex-direction: column;
		height: 100%;
	}

	.product-card:hover {
		box-shadow: var(--shadow-md);
		transform: translateY(-4px);
		border-color: rgba(212, 162, 52, 0.4);
	}

	.product-image-link {
		display: block;
		text-decoration: none;
	}

	.product-image {
		aspect-ratio: 4/3;
		overflow: hidden;
		background: var(--color-border-subtle);
		position: relative;
		border-bottom: 1px solid var(--color-border-subtle);
	}

	.product-image img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		transition: transform 0.4s ease;
	}

	.product-card:hover .product-image img {
		transform: scale(1.04);
	}

	.placeholder-image {
		width: 100%;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		position: relative;
		background: linear-gradient(135deg, var(--color-border-subtle), var(--color-border));
		overflow: hidden;
	}

	.placeholder-svg {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
	}

	.placeholder-letter {
		font-size: 2.5rem;
		font-weight: 800;
		color: var(--color-primary);
		opacity: 0.15;
		position: relative;
		z-index: 2;
		font-family: var(--font-heading);
	}

	.product-info {
		padding: var(--space-3) var(--space-4) var(--space-4);
		display: flex;
		flex-direction: column;
		flex: 1;
	}

	.vendor-row {
		display: flex;
		justify-content: space-between;
		align-items: baseline;
		margin-bottom: 0.25rem;
	}

	.product-vendor {
		font-size: 0.65rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: var(--color-accent);
	}

	.product-sku {
		font-size: 0.65rem;
		font-weight: 500;
		color: var(--color-muted);
	}

	.product-name-link {
		text-decoration: none;
		color: inherit;
		margin-bottom: var(--space-2);
	}

	.product-name {
		font-family: var(--font-heading);
		font-size: 1.0625rem;
		font-weight: 700;
		color: var(--color-ink);
		margin: 0;
		line-height: 1.35;
		transition: color 0.15s ease;
	}

	.product-name-link:hover .product-name {
		color: var(--color-primary);
	}

	.product-desc {
		font-size: var(--text-small);
		color: var(--color-muted);
		margin: 0 0 var(--space-3);
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
		line-height: 1.5;
		max-width: none;
	}

	.product-specs {
		display: flex;
		flex-wrap: wrap;
		gap: 0.375rem;
		margin-bottom: var(--space-3);
		margin-top: auto; /* Push specs to bottom of card */
	}

	.spec-tag {
		font-size: 0.65rem;
		padding: 0.15rem 0.5rem;
		background: var(--color-border-subtle);
		border-radius: var(--radius-pill);
		color: var(--color-muted);
		border: 1px solid var(--color-border);
		font-weight: 500;
	}

	.action-row {
		margin-top: auto; /* Push action button to the bottom of card */
	}

	.add-to-quote-btn {
		width: 100%;
		padding: 0.625rem 1rem;
		background: transparent;
		color: var(--color-primary);
		border: 1.5px solid var(--color-primary);
		border-radius: var(--radius-sm);
		font-size: var(--text-small);
		font-weight: 700;
		font-family: var(--font-heading);
		cursor: pointer;
		transition: all 0.2s ease;
		display: flex;
		align-items: center;
		justify-content: center;
		line-height: 1;
	}

	.add-to-quote-btn:hover {
		background: var(--color-primary);
		color: white;
	}

	.add-to-quote-btn.in-cart {
		background: var(--color-accent-light);
		color: var(--color-gold-text);
		border-color: var(--color-accent-light);
		cursor: default;
		font-weight: 600;
	}

	.empty-state {
		text-align: center;
		padding: var(--space-8) var(--space-4);
		color: var(--color-muted);
		background: var(--color-surface);
		border-radius: var(--radius-md);
		border: 1px solid var(--color-border);
	}

	@media (max-width: 900px) {
		.catalog-header-banner {
			flex-direction: column;
			align-items: flex-start;
		}
		.cart-link-btn {
			width: 100%;
			justify-content: center;
		}
	}

	@media (max-width: 768px) {
		.catalog-controls {
			flex-direction: column;
			align-items: stretch;
		}
		.search-bar input {
			width: 100%;
		}
	}

	@media (max-width: 640px) {
		.product-grid {
			grid-template-columns: 1fr;
		}
		.category-title {
			flex-direction: column;
			gap: 0.25rem;
		}
	}
</style>
