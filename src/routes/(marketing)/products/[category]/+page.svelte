<script lang="ts">
	import { page } from '$app/stores';
	import { categories, getProductsByCategory } from '$lib/data/products';

	let slug = $derived($page.params.category);
	let category = $derived(categories[slug]);
	let products = $derived(slug ? getProductsByCategory(slug) : []);
</script>

<svelte:head>
	{#if category}
		<title>{category.title} — BG Clear Products</title>
		<meta name="description" content={category.description} />
	{:else}
		<title>Product Category Not Found — BG Clear</title>
	{/if}
</svelte:head>



{#if category}
	<main id="main-content" class="page" tabindex="-1">
		<!-- Category Hero -->
		<section class="cat-hero">
			<div class="container">
				<nav class="breadcrumb" aria-label="Breadcrumb">
					<a href="/">Home</a>
					<span class="breadcrumb-sep">/</span>
					<a href="/#products">Products</a>
					<span class="breadcrumb-sep">/</span>
					<span class="breadcrumb-current">{category.title}</span>
				</nav>
				<h1>{category.title}</h1>
				<p class="cat-hero-desc">{category.description}</p>
			</div>
		</section>

		<!-- Product Grid -->
		<section class="section">
			<div class="container">
				<div class="product-grid">
					{#each products as product}
						<a class="prod-card" href="/products/{slug}/{product.slug}">
							<div class="prod-card-img">
								<div class="prod-card-placeholder">
									<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
										<path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" stroke-linecap="round" stroke-linejoin="round"/>
									</svg>
								</div>
							</div>
							<div class="prod-card-body">
								<h3 class="prod-card-name">{product.name}</h3>
								<p class="prod-card-manufacturer">{product.manufacturer}</p>
								<div class="prod-card-badges">
									{#if product.pdacApproved}
										<span class="badge badge-pdac">PDAC Approved</span>
									{/if}
									{#if product.medicareEligible}
										<span class="badge badge-medicare">Medicare Eligible</span>
									{/if}
								</div>
								<span class="prod-card-link">View Details &rarr;</span>
							</div>
						</a>
					{/each}
				</div>
				<div class="cat-cta">
					<p>Sign in to browse the full catalog, see detailed specs, and request a quote.</p>
					<a class="button button-primary" href="/catalog">Browse the Catalog</a>
				</div>
			</div>
		</section>
	</main>
{:else}
	<main id="main-content" class="page" tabindex="-1">
		<section class="section" style="padding-top: 10rem; text-align: center;">
			<div class="container">
				<h1>Category Not Found</h1>
				<p>The product category you're looking for doesn't exist.</p>
				<a class="button button-primary" href="/#products">View All Categories</a>
			</div>
		</section>
	</main>
{/if}

<style>
	.cat-hero {
		padding-top: clamp(12rem, 16vw, 14rem);
		padding-bottom: var(--space-5);
		background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%);
		color: #ffffff;
	}
	.cat-hero h1 {
		color: #ffffff;
		margin-bottom: var(--space-2);
	}
	.cat-hero-desc {
		color: rgba(255, 255, 255, 0.78);
		max-width: 600px;
		margin-bottom: 0;
	}

	.breadcrumb {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: var(--text-small);
		margin-bottom: var(--space-3);
	}
	.breadcrumb a {
		color: rgba(255, 255, 255, 0.7);
		transition: color 160ms ease;
	}
	.breadcrumb a:hover {
		color: #ffffff;
	}
	.breadcrumb-sep {
		color: rgba(255, 255, 255, 0.4);
	}
	.breadcrumb-current {
		color: var(--color-gold-light);
		font-weight: 500;
	}

	.product-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: var(--space-4);
	}

	.prod-card {
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		overflow: hidden;
		text-decoration: none;
		color: inherit;
		transition: transform 240ms ease, box-shadow 240ms ease, border-color 240ms ease;
	}
	.prod-card:hover {
		transform: translateY(-3px);
		box-shadow: var(--shadow-md);
		border-color: color-mix(in srgb, var(--color-gold), transparent 50%);
	}

	.prod-card-img {
		height: 200px;
		background: linear-gradient(135deg, #f0f4f8 0%, #e8eef5 100%);
		display: flex;
		align-items: center;
		justify-content: center;
	}
	.prod-card-placeholder {
		color: var(--color-muted);
		opacity: 0.4;
	}

	.prod-card-body {
		padding: var(--space-3);
	}
	.prod-card-name {
		font-size: 1.0625rem;
		margin-bottom: 0.25rem;
	}
	.prod-card-manufacturer {
		color: var(--color-muted);
		font-size: var(--text-small);
		margin-bottom: var(--space-2);
	}

	.prod-card-badges {
		display: flex;
		flex-wrap: wrap;
		gap: 0.375rem;
		margin-bottom: var(--space-2);
	}
	.badge {
		display: inline-block;
		font-size: 0.7rem;
		font-weight: 600;
		letter-spacing: 0.03em;
		padding: 0.2rem 0.55rem;
		border-radius: var(--radius-pill);
		text-transform: uppercase;
	}
	.badge-pdac {
		background: color-mix(in srgb, var(--color-primary), #ffffff 88%);
		color: var(--color-primary);
	}
	.badge-medicare {
		background: color-mix(in srgb, var(--color-accent), #ffffff 88%);
		color: #065f46;
	}

	.prod-card-link {
		display: inline-block;
		font-size: var(--text-small);
		font-weight: 600;
		color: var(--color-accent);
	}
	.prod-card:hover .prod-card-link {
		text-decoration: underline;
	}

	.cat-cta {
		margin-top: var(--space-6);
		padding: var(--space-4);
		background: var(--color-border-subtle);
		border-radius: var(--radius-lg);
		text-align: center;
	}
	.cat-cta p {
		margin: 0 auto var(--space-3);
		color: var(--color-muted);
	}

	@media (max-width: 960px) {
		.product-grid {
			grid-template-columns: repeat(2, 1fr);
		}
	}
	@media (max-width: 600px) {
		.product-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
