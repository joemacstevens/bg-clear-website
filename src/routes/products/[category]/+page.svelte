<script lang="ts">
	import { page } from '$app/stores';
	import logo from '$lib/assets/bg-clear-logo-640.png';

	interface Product {
		name: string;
		manufacturer: string;
		pdacApproved: boolean;
		medicareEligible: boolean;
	}

	interface Category {
		title: string;
		description: string;
		products: Product[];
	}

	const categories: Record<string, Category> = {
		'health-monitoring': {
			title: 'Health Monitoring & Management',
			description: 'FDA-compliant monitoring devices for chronic care management, telehealth, and patient vitals tracking.',
			products: [
				{ name: 'Digital Blood Pressure Monitor', manufacturer: 'Omron Healthcare', pdacApproved: true, medicareEligible: true },
				{ name: 'Wireless Glucometer Kit', manufacturer: 'Roche Diagnostics', pdacApproved: true, medicareEligible: true },
				{ name: 'Fingertip Pulse Oximeter', manufacturer: 'Nonin Medical', pdacApproved: true, medicareEligible: true },
				{ name: 'RPM Telehealth Gateway', manufacturer: 'Biobeat', pdacApproved: false, medicareEligible: true },
				{ name: 'Infrared Thermometer Pro', manufacturer: 'Braun', pdacApproved: true, medicareEligible: false },
				{ name: 'Continuous Glucose Monitor', manufacturer: 'Dexcom', pdacApproved: true, medicareEligible: true },
			]
		},
		'mobility-safety': {
			title: 'Mobility & Safety Equipment',
			description: 'Durable mobility aids and bathroom safety products built for daily use in clinical and home environments.',
			products: [
				{ name: 'Folding Rollator Walker', manufacturer: 'Drive Medical', pdacApproved: true, medicareEligible: true },
				{ name: 'Lightweight Transport Wheelchair', manufacturer: 'Invacare', pdacApproved: true, medicareEligible: true },
				{ name: 'Adjustable Quad Cane', manufacturer: 'Hugo Mobility', pdacApproved: true, medicareEligible: true },
				{ name: 'Hydraulic Patient Lift', manufacturer: 'Hoyer', pdacApproved: true, medicareEligible: true },
				{ name: 'Shower Transfer Bench', manufacturer: 'Medline', pdacApproved: true, medicareEligible: true },
				{ name: 'Bed Assist Rail', manufacturer: 'Stander', pdacApproved: true, medicareEligible: false },
			]
		},
		'specialized-support': {
			title: 'Specialized Medical Support',
			description: 'Respiratory therapy, sleep therapy, wound care, and hospital-grade support equipment for complex patient needs.',
			products: [
				{ name: 'Compressor Nebulizer System', manufacturer: 'Philips Respironics', pdacApproved: true, medicareEligible: true },
				{ name: 'CPAP Machine with Humidifier', manufacturer: 'ResMed', pdacApproved: true, medicareEligible: true },
				{ name: 'Semi-Electric Hospital Bed', manufacturer: 'Invacare', pdacApproved: true, medicareEligible: true },
				{ name: 'Negative Pressure Wound Therapy', manufacturer: 'KCI Medical', pdacApproved: true, medicareEligible: true },
				{ name: 'Graduated Compression Stockings', manufacturer: 'Jobst', pdacApproved: true, medicareEligible: true },
				{ name: 'BiPAP Auto Machine', manufacturer: 'Philips Respironics', pdacApproved: true, medicareEligible: true },
			]
		}
	};

	$: slug = $page.params.category;
	$: category = categories[slug];
</script>

<svelte:head>
	{#if category}
		<title>{category.title} — BG Clear Products</title>
		<meta name="description" content={category.description} />
	{:else}
		<title>Product Category Not Found — BG Clear</title>
	{/if}
</svelte:head>

<!-- Navigation Header -->
<header class="site-header scrolled">
	<div class="container header-inner">
		<a href="/"><img class="header-logo" src={logo} alt="BG Clear" /></a>
		<nav class="header-nav">
			<a href="/about">About Us</a>
			<a href="/#capabilities">Capabilities</a>
			<a href="/#products">Products</a>
			<a href="/#how-we-work">Process</a>
			<a href="/#faq">FAQ</a>
		</nav>
		<div class="header-cta">
			<a class="button button-primary button-header" href="/#request-call">Contact Us</a>
		</div>
	</div>
</header>

{#if category}
	<main class="page">
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
					{#each category.products as product}
						<article class="prod-card">
							<div class="prod-card-img">
								<!-- TODO: Replace with real product images -->
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
							</div>
						</article>
					{/each}
				</div>
				<div class="cat-cta">
					<p>Need help choosing the right equipment for your practice?</p>
					<a class="button button-primary" href="/#request-call">Contact a DME Specialist</a>
				</div>
			</div>
		</section>
	</main>
{:else}
	<main class="page">
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
		padding-top: clamp(7rem, 12vw, 9rem);
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
