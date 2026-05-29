<script lang="ts">
	import type { PageData } from './$types';
	import { SITE_URL } from '$lib/site-config';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>{data.product.name} — {data.category.title} — BG Clear</title>
	<meta name="description" content={data.product.description} />
	{@html `<script type="application/ld+json">${JSON.stringify({
		"@context": "https://schema.org",
		"@type": "Product",
		"name": data.product.name,
		"description": data.product.description,
		"brand": { "@type": "Brand", "name": data.product.manufacturer },
		"manufacturer": { "@type": "Organization", "name": data.product.manufacturer },
		"category": data.category.title,
		"offers": {
			"@type": "Offer",
			"url": `${SITE_URL}/products/${data.categorySlug}/${data.product.slug}`,
			"availability": "https://schema.org/InStock",
			"seller": { "@type": "Organization", "name": "BG Clear LLC" }
		}
	})}</script>`}
</svelte:head>


<main id="main-content" class="page" tabindex="-1">
	<!-- Hero -->
	<section class="detail-hero">
		<div class="container">
			<nav class="breadcrumb" aria-label="Breadcrumb">
				<a href="/">Home</a>
				<span class="breadcrumb-sep">/</span>
				<a href="/#products">Products</a>
				<span class="breadcrumb-sep">/</span>
				<a href="/products/{data.categorySlug}">{data.category.title}</a>
				<span class="breadcrumb-sep">/</span>
				<span class="breadcrumb-current">{data.product.name}</span>
			</nav>
			<h1>{data.product.name}</h1>
			<p class="detail-hero-mfr">by {data.product.manufacturer}</p>
		</div>
	</section>

	<!-- Product Detail -->
	<section class="section">
		<div class="container detail-layout">
			<!-- Image -->
			<div class="detail-image">
				<div class="detail-image-placeholder">
					<svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
						<path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" stroke-linecap="round" stroke-linejoin="round"/>
					</svg>
					<span class="detail-image-label">Product Image</span>
				</div>
			</div>

			<!-- Specs -->
			<div class="detail-specs">
				<div class="specs-table">
					<div class="spec-row">
						<span class="spec-label">Manufacturer</span>
						<span class="spec-value">{data.product.manufacturer}</span>
					</div>
					<div class="spec-row">
						<span class="spec-label">HCPCS Code</span>
						<span class="spec-value spec-code">{data.product.hcpcsCode}</span>
					</div>
					<div class="spec-row">
						<span class="spec-label">Category</span>
						<span class="spec-value">{data.category.title}</span>
					</div>
				</div>

				<div class="detail-badges">
					{#if data.product.pdacApproved}
						<span class="badge badge-pdac">PDAC Approved</span>
					{/if}
					{#if data.product.medicareEligible}
						<span class="badge badge-medicare">Medicare Eligible</span>
					{/if}
				</div>

				<!-- Features -->
				<h2 class="features-heading">Key Features</h2>
				<ul class="features-list">
					{#each data.product.features as feature}
						<li>
							<svg class="check-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
								<polyline points="20 6 9 17 4 12" stroke-linecap="round" stroke-linejoin="round"/>
							</svg>
							{feature}
						</li>
					{/each}
				</ul>

				<!-- Description -->
				<p class="detail-description">{data.product.description}</p>

				<!-- CTA -->
				<a class="button button-primary detail-cta-btn" href="/catalog">
					Sign In to Request a Quote
				</a>
			</div>
		</div>
	</section>

	<!-- Related Products -->
	{#if data.related.length > 0}
		<section class="section related-section">
			<div class="container">
				<h2 class="related-heading">More in {data.category.title}</h2>
				<div class="related-grid">
					{#each data.related as rp}
						<a class="related-card" href="/products/{data.categorySlug}/{rp.slug}">
							<div class="related-card-img">
								<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
									<path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" stroke-linecap="round" stroke-linejoin="round"/>
								</svg>
							</div>
							<div class="related-card-body">
								<h3>{rp.name}</h3>
								<p class="related-card-mfr">{rp.manufacturer}</p>
								<span class="related-card-link">View Details &rarr;</span>
							</div>
						</a>
					{/each}
				</div>
			</div>
		</section>
	{/if}

	<!-- Bottom CTA -->
	<section class="section">
		<div class="container">
			<div class="bottom-cta">
				<p>Sign in to browse the full catalog, see detailed specs, and request a quote.</p>
				<a class="button button-primary" href="/catalog">Browse the Catalog</a>
			</div>
		</div>
	</section>
</main>

<style>
	/* ── Hero ──────────────────────────────────────────────────────── */
	.detail-hero {
		padding-top: clamp(7rem, 12vw, 9rem);
		padding-bottom: var(--space-5);
		background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%);
		color: #ffffff;
	}
	.detail-hero h1 {
		color: #ffffff;
		margin-bottom: 0.25rem;
	}
	.detail-hero-mfr {
		color: rgba(255, 255, 255, 0.65);
		font-size: var(--text-base);
		margin: 0;
	}

	/* ── Breadcrumb ────────────────────────────────────────────────── */
	.breadcrumb {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
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

	/* ── Detail Layout ─────────────────────────────────────────────── */
	.detail-layout {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: var(--space-6);
		align-items: start;
	}

	/* ── Product Image ─────────────────────────────────────────────── */
	.detail-image-placeholder {
		aspect-ratio: 1;
		background: linear-gradient(135deg, #f0f4f8 0%, #e8eef5 100%);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: var(--space-2);
		color: var(--color-muted);
	}
	.detail-image-placeholder svg {
		opacity: 0.35;
	}
	.detail-image-label {
		font-size: var(--text-small);
		opacity: 0.5;
	}

	/* ── Specs ──────────────────────────────────────────────────────── */
	.specs-table {
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		overflow: hidden;
		margin-bottom: var(--space-3);
	}
	.spec-row {
		display: flex;
		align-items: center;
		padding: 0.75rem 1rem;
	}
	.spec-row:not(:last-child) {
		border-bottom: 1px solid var(--color-border);
	}
	.spec-label {
		font-size: var(--text-small);
		color: var(--color-muted);
		font-weight: 500;
		width: 140px;
		flex-shrink: 0;
	}
	.spec-value {
		font-weight: 600;
		color: var(--color-text);
	}
	.spec-code {
		font-family: 'SF Mono', 'Fira Code', monospace;
		color: var(--color-primary);
		background: color-mix(in srgb, var(--color-primary), #ffffff 92%);
		padding: 0.15rem 0.5rem;
		border-radius: var(--radius-sm);
		font-size: var(--text-small);
	}

	/* ── Badges ─────────────────────────────────────────────────────── */
	.detail-badges {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		margin-bottom: var(--space-4);
	}
	.badge {
		display: inline-block;
		font-size: 0.7rem;
		font-weight: 600;
		letter-spacing: 0.03em;
		padding: 0.3rem 0.7rem;
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

	/* ── Features ───────────────────────────────────────────────────── */
	.features-heading {
		font-size: 1.125rem;
		margin-bottom: var(--space-2);
		color: var(--color-primary);
	}
	.features-list {
		list-style: none;
		padding: 0;
		margin: 0 0 var(--space-4);
		display: flex;
		flex-direction: column;
		gap: 0.625rem;
	}
	.features-list li {
		display: flex;
		align-items: flex-start;
		gap: 0.625rem;
		font-size: var(--text-small);
		line-height: 1.5;
		color: var(--color-text);
	}
	.check-icon {
		flex-shrink: 0;
		color: var(--color-accent);
		margin-top: 0.1rem;
	}

	/* ── Description ────────────────────────────────────────────────── */
	.detail-description {
		color: var(--color-muted);
		line-height: 1.7;
		margin-bottom: var(--space-4);
	}

	/* ── CTA Button ─────────────────────────────────────────────────── */
	.detail-cta-btn {
		display: inline-flex;
		align-items: center;
	}

	/* ── Related Products ───────────────────────────────────────────── */
	.related-section {
		background: var(--color-bg);
	}
	.related-heading {
		text-align: center;
		margin-bottom: var(--space-4);
	}
	.related-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: var(--space-4);
	}
	.related-card {
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		overflow: hidden;
		text-decoration: none;
		color: inherit;
		transition: transform 240ms ease, box-shadow 240ms ease, border-color 240ms ease;
	}
	.related-card:hover {
		transform: translateY(-3px);
		box-shadow: var(--shadow-md);
		border-color: color-mix(in srgb, var(--color-gold), transparent 50%);
	}
	.related-card-img {
		height: 140px;
		background: linear-gradient(135deg, #f0f4f8 0%, #e8eef5 100%);
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--color-muted);
		opacity: 0.4;
	}
	.related-card-body {
		padding: var(--space-3);
	}
	.related-card-body h3 {
		font-size: 0.95rem;
		margin-bottom: 0.2rem;
	}
	.related-card-mfr {
		color: var(--color-muted);
		font-size: var(--text-small);
		margin-bottom: var(--space-2);
	}
	.related-card-link {
		font-size: var(--text-small);
		font-weight: 600;
		color: var(--color-accent);
	}

	/* ── Bottom CTA ─────────────────────────────────────────────────── */
	.bottom-cta {
		padding: var(--space-4);
		background: var(--color-border-subtle);
		border-radius: var(--radius-lg);
		text-align: center;
	}
	.bottom-cta p {
		margin: 0 auto var(--space-3);
		color: var(--color-muted);
	}

	/* ── Responsive ─────────────────────────────────────────────────── */
	@media (max-width: 768px) {
		.detail-layout {
			grid-template-columns: 1fr;
		}
		.related-grid {
			grid-template-columns: 1fr;
		}
	}
	@media (max-width: 960px) and (min-width: 769px) {
		.related-grid {
			grid-template-columns: repeat(2, 1fr);
		}
	}
</style>
