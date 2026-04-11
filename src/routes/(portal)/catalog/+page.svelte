<script lang="ts">
	import type { PageData } from './$types';
	import type { ProductCategory } from '$lib/database.types';

	let { data }: { data: PageData } = $props();

	const categories: { value: ProductCategory | null; label: string; icon: string }[] = [
		{ value: null, label: 'All Products', icon: '⊞' },
		{ value: 'health_monitoring', label: 'Health Monitoring', icon: '♡' },
		{ value: 'mobility_safety', label: 'Mobility & Safety', icon: '♿' },
		{ value: 'specialized_support', label: 'Specialized Support', icon: '⚕' },
		{ value: 'capital_equipment', label: 'Capital Equipment', icon: '🏥' }
	];

	let search = $state('');

	const filteredProducts = $derived(
		data.products.filter((p) =>
			!search || p.name.toLowerCase().includes(search.toLowerCase())
			|| p.description?.toLowerCase().includes(search.toLowerCase())
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

	function categoryLabel(cat: string) {
		return categories.find((c) => c.value === cat)?.label ?? cat;
	}
</script>

<svelte:head>
	<title>Product Catalog | BG Clear</title>
</svelte:head>

<div class="catalog-page">
	<div class="catalog-header">
		<h1>Product Catalog</h1>
		<p>Browse our durable medical equipment. Select products to request a quote from your sales representative.</p>
	</div>

	<div class="catalog-controls">
		<div class="category-filters">
			{#each categories as cat}
				<a
					href={cat.value ? `/catalog?category=${cat.value}` : '/catalog'}
					class="category-pill"
					class:active={data.selectedCategory === cat.value}
				>
					{cat.label}
				</a>
			{/each}
		</div>

		<div class="search-bar">
			<input
				type="search"
				placeholder="Search products..."
				bind:value={search}
			/>
		</div>
	</div>

	{#if filteredProducts.length === 0}
		<div class="empty-state">
			<p>No products found. {search ? 'Try a different search term.' : 'Products are being added — check back soon.'}</p>
		</div>
	{:else}
		{#each Object.entries(groupedProducts()) as [category, products]}
			<section class="category-section">
				<h2 class="category-title">{categoryLabel(category)}</h2>
				<div class="product-grid">
					{#each products as product}
						<div class="product-card">
							<div class="product-image">
								{#if product.image_url}
									<img src={product.image_url} alt={product.name} />
								{:else}
									<div class="placeholder-image">
										<span>{categoryLabel(product.category).charAt(0)}</span>
									</div>
								{/if}
							</div>
							<div class="product-info">
								<span class="product-vendor">{product.vendor_name}</span>
								<h3 class="product-name">{product.name}</h3>
								<p class="product-desc">{product.description}</p>
								{#if product.specs && Object.keys(product.specs).length > 0}
									<div class="product-specs">
										{#each Object.entries(product.specs).slice(0, 3) as [key, value]}
											<span class="spec-tag">{key}: {value}</span>
										{/each}
									</div>
								{/if}
								<button class="add-to-quote-btn">
									+ Add to Quote Request
								</button>
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

	.catalog-header {
		margin-bottom: var(--space-4);
	}

	.catalog-header h1 {
		font-family: var(--font-heading);
		font-size: var(--text-h2);
		font-weight: 700;
		color: var(--color-ink);
		margin: 0 0 var(--space-1);
	}

	.catalog-header p {
		color: var(--color-muted);
		margin: 0;
	}

	.catalog-controls {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-3);
		margin-bottom: var(--space-5);
		align-items: center;
	}

	.category-filters {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		flex: 1;
	}

	.category-pill {
		padding: 0.375rem 1rem;
		border-radius: var(--radius-pill);
		font-size: var(--text-small);
		font-weight: 500;
		color: var(--color-muted);
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		text-decoration: none;
		transition: all 0.15s;
		white-space: nowrap;
	}

	.category-pill:hover {
		border-color: var(--color-primary);
		color: var(--color-primary);
	}

	.category-pill.active {
		background: var(--color-primary);
		color: white;
		border-color: var(--color-primary);
	}

	.search-bar input {
		padding: 0.5rem 1rem;
		border: 1px solid var(--color-border);
		border-radius: var(--radius-pill);
		font-size: var(--text-small);
		font-family: var(--font-body);
		width: 240px;
	}

	.search-bar input:focus {
		outline: none;
		border-color: var(--color-primary);
		box-shadow: 0 0 0 3px rgba(30, 58, 95, 0.1);
	}

	.category-section {
		margin-bottom: var(--space-6);
	}

	.category-title {
		font-family: var(--font-heading);
		font-size: var(--text-h3);
		font-weight: 700;
		color: var(--color-ink);
		margin: 0 0 var(--space-3);
		padding-bottom: var(--space-2);
		border-bottom: 2px solid var(--color-border-subtle);
	}

	.product-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
		gap: var(--space-3);
	}

	.product-card {
		background: var(--color-surface);
		border-radius: var(--radius-md);
		border: 1px solid var(--color-border);
		overflow: hidden;
		transition: box-shadow 0.2s, transform 0.2s;
	}

	.product-card:hover {
		box-shadow: var(--shadow-md);
		transform: translateY(-2px);
	}

	.product-image {
		aspect-ratio: 4/3;
		overflow: hidden;
		background: var(--color-border-subtle);
	}

	.product-image img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.placeholder-image {
		width: 100%;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		background: linear-gradient(135deg, var(--color-border-subtle), var(--color-border));
	}

	.placeholder-image span {
		font-size: 2rem;
		font-weight: 700;
		color: var(--color-muted);
		opacity: 0.4;
	}

	.product-info {
		padding: var(--space-3);
	}

	.product-vendor {
		font-size: 0.7rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--color-accent);
	}

	.product-name {
		font-family: var(--font-heading);
		font-size: 1rem;
		font-weight: 600;
		color: var(--color-ink);
		margin: 0.25rem 0 0.5rem;
		line-height: 1.3;
	}

	.product-desc {
		font-size: var(--text-small);
		color: var(--color-muted);
		margin: 0 0 0.75rem;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
		max-width: none;
	}

	.product-specs {
		display: flex;
		flex-wrap: wrap;
		gap: 0.375rem;
		margin-bottom: 0.75rem;
	}

	.spec-tag {
		font-size: 0.7rem;
		padding: 0.125rem 0.5rem;
		background: var(--color-border-subtle);
		border-radius: var(--radius-pill);
		color: var(--color-muted);
	}

	.add-to-quote-btn {
		width: 100%;
		padding: 0.5rem;
		background: transparent;
		color: var(--color-primary);
		border: 1px solid var(--color-primary);
		border-radius: var(--radius-sm);
		font-size: var(--text-small);
		font-weight: 600;
		font-family: var(--font-body);
		cursor: pointer;
		transition: all 0.15s;
	}

	.add-to-quote-btn:hover {
		background: var(--color-primary);
		color: white;
	}

	.empty-state {
		text-align: center;
		padding: var(--space-8) var(--space-4);
		color: var(--color-muted);
	}

	@media (max-width: 640px) {
		.product-grid {
			grid-template-columns: 1fr;
		}
		.search-bar input {
			width: 100%;
		}
		.catalog-controls {
			flex-direction: column;
		}
	}
</style>
