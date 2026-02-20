<script lang="ts">
	import imgHealth from '$lib/assets/visuals/product-health-monitoring.jpg';
	import imgMobility from '$lib/assets/visuals/product-mobility-safety.jpg';
	import imgSpecialized from '$lib/assets/visuals/product-specialized-support.jpg';

	import logoMckesson from '$lib/assets/partners/mckesson.svg';
	import logoDrive from '$lib/assets/partners/drive-medical.svg';
	import logoPride from '$lib/assets/partners/pride-mobility.png';
	import logoInvacare from '$lib/assets/partners/invacare.svg';
	import logoMedline from '$lib/assets/partners/medline.svg';

	interface ProductTile {
		type: 'product';
		id: string;
		name: string;
		tagline: string;
		href: string;
		img: string;
	}

	interface AccentTile {
		type: 'accent';
		id: string;
		claim: string;
		bg: 'navy' | 'gold';
		verified: boolean;
	}

	const products: ProductTile[] = [
		{
			type: 'product',
			id: 'health-monitoring',
			name: 'Health Monitoring & Management',
			tagline: 'Blood pressure monitors, glucometers, pulse oximeters, RPM devices',
			href: '/products/health-monitoring',
			img: imgHealth
		},
		{
			type: 'product',
			id: 'mobility-safety',
			name: 'Mobility & Safety Equipment',
			tagline: 'Walkers, wheelchairs, canes, patient lifts, bathroom safety',
			href: '/products/mobility-safety',
			img: imgMobility
		},
		{
			type: 'product',
			id: 'specialized-support',
			name: 'Specialized Medical Support',
			tagline: 'Nebulizers, CPAP/BiPAP, hospital beds, wound care, compression therapy',
			href: '/products/specialized-support',
			img: imgSpecialized
		}
	];

	const accents: AccentTile[] = [
		{
			type: 'accent',
			id: 'pdac',
			claim: 'PDAC Approved',
			bg: 'navy',
			verified: true
		},
		{
			type: 'accent',
			id: 'medicare',
			claim: 'Medicare Eligible Products',
			bg: 'gold',
			verified: true
		},
		{
			type: 'accent',
			id: 'people',
			claim: 'Real People Who Answer The Phone',
			bg: 'navy',
			verified: true
		}
	];

	const partners = [
		{ src: logoMckesson, name: 'McKesson' },
		{ src: logoDrive, name: 'Drive Medical' },
		{ src: logoMedline, name: 'Medline' },
		{ src: logoInvacare, name: 'Invacare' },
		{ src: logoPride, name: 'Pride Mobility' }
	];
</script>

<section class="ppb-section" id="products">
	<div class="ppb-container">
		<div class="ppb-header">
			<p class="ppb-eyebrow">Products &amp; Partners</p>
			<h2 class="ppb-heading">Our Products &amp; Trusted Partners</h2>
			<p class="ppb-subhead">FDA/CMS-compliant equipment from manufacturers you trust, ready for provider workflows.</p>
		</div>

		<!-- TOP: Product category tiles — most prominent -->
		<div class="ppb-products-grid">
			{#each products as tile (tile.id)}
				<a class="ppb-tile ppb-tile--product" href={tile.href}>
					<img class="ppb-tile__img" src={tile.img} alt={tile.name} loading="lazy" />
					<div class="ppb-tile__overlay"></div>
					<div class="ppb-tile__content">
						<h3 class="ppb-tile__name">{tile.name}</h3>
						<p class="ppb-tile__tagline">{tile.tagline}</p>
						<span class="ppb-tile__link">Explore &rarr;</span>
					</div>
				</a>
			{/each}
		</div>

		<!-- MIDDLE: Claim/badge tiles -->
		<div class="ppb-accents-grid">
			{#each accents as tile (tile.id)}
				<div
					class="ppb-tile ppb-tile--accent"
					class:ppb-tile--navy={tile.bg === 'navy'}
					class:ppb-tile--gold={tile.bg === 'gold'}
				>
					<div class="ppb-tile__badge">
						<svg class="ppb-tile__check" width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
							<path d="M9 12l2 2 4-4" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
							<circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
						</svg>
					</div>
					<p class="ppb-tile__claim">{tile.claim}</p>
				</div>
			{/each}
		</div>

		<!-- BOTTOM: Trusted Manufacturers — full-width social proof -->
		<div class="ppb-partners-row">
			<p class="ppb-partners-label">Trusted Manufacturers</p>
			<div class="ppb-partners-logos">
				{#each partners as partner}
					<img class="ppb-partners-logo" src={partner.src} alt={partner.name} loading="lazy" />
				{/each}
			</div>
		</div>
	</div>
</section>

<style>
	/* ─── Section ─── */
	.ppb-section {
		padding: var(--space-6, 4rem) 0 var(--space-7, 6rem);
		background: var(--color-bg, #fafbfc);
	}

	.ppb-container {
		max-width: 72rem;
		margin: 0 auto;
		padding: 0 var(--space-3, 1.5rem);
	}

	/* ─── Header ─── */
	.ppb-header {
		margin-bottom: var(--space-5, 3rem);
	}

	.ppb-eyebrow {
		font-size: var(--text-small, 0.875rem);
		font-weight: 700;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--color-gold-text, #8b6914);
		margin-bottom: var(--space-1, 0.5rem);
	}

	.ppb-heading {
		font-size: var(--text-h2, clamp(1.875rem, 3vw, 2.5rem));
		font-weight: 800;
		color: var(--color-primary, #1e3a5f);
		line-height: 1.15;
		margin: 0 0 var(--space-2, 1rem);
	}

	.ppb-subhead {
		font-size: clamp(1rem, 1.2vw, 1.125rem);
		color: var(--color-muted, #64748b);
		line-height: 1.6;
		max-width: 40rem;
		margin: 0;
	}

	/* ─── Products Grid (TOP) ─── */
	.ppb-products-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: var(--space-2, 1rem);
		margin-bottom: var(--space-2, 1rem);
	}

	/* ─── Tile base ─── */
	.ppb-tile {
		border-radius: var(--radius-lg, 1.25rem);
		position: relative;
		overflow: hidden;
		transition: transform 0.25s ease, box-shadow 0.25s ease;
	}

	/* ─── Product tiles ─── */
	.ppb-tile--product {
		display: flex;
		text-decoration: none;
		color: inherit;
		cursor: pointer;
		min-height: 18rem;
	}

	.ppb-tile--product:hover {
		transform: translateY(-3px);
		box-shadow: 0 12px 32px rgba(15, 23, 42, 0.18);
	}

	.ppb-tile--product:focus-visible {
		outline: 3px solid var(--color-gold, #d4a234);
		outline-offset: 3px;
	}

	.ppb-tile__img {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		object-fit: cover;
		transition: transform 0.5s ease;
	}

	.ppb-tile--product:hover .ppb-tile__img {
		transform: scale(1.06);
	}

	.ppb-tile__overlay {
		position: absolute;
		inset: 0;
		z-index: 1;
		background: linear-gradient(to top, rgba(15, 39, 68, 0.95) 0%, rgba(15, 39, 68, 0.7) 40%, rgba(15, 39, 68, 0.35) 100%);
	}

	.ppb-tile__content {
		position: relative;
		z-index: 2;
		display: flex;
		flex-direction: column;
		justify-content: flex-end;
		padding: var(--space-4, 2rem);
		height: 100%;
		width: 100%;
		color: #ffffff;
	}

	.ppb-tile__name {
		font-size: clamp(1.375rem, 2.2vw, 1.625rem);
		font-weight: 700;
		line-height: 1.2;
		margin: 0 0 0.35rem;
		color: #ffffff;
	}

	.ppb-tile__tagline {
		font-size: 0.9375rem;
		font-weight: 500;
		line-height: 1.5;
		opacity: 0.9;
		margin: 0 0 0.75rem;
		color: #ffffff;
	}

	.ppb-tile__link {
		font-weight: 700;
		font-size: 0.9rem;
		color: var(--color-gold, #d4a234);
		transition: opacity 0.2s ease;
	}

	.ppb-tile--product:hover .ppb-tile__link {
		opacity: 0.85;
	}

	/* ─── Accent tiles (MIDDLE) ─── */
	.ppb-accents-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: var(--space-2, 1rem);
		margin-bottom: var(--space-2, 1rem);
	}

	.ppb-tile--accent {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		text-align: center;
		padding: var(--space-4, 2rem) var(--space-3, 1.5rem);
		gap: var(--space-2, 1rem);
		min-height: 10rem;
	}

	.ppb-tile--accent.ppb-tile--navy {
		background: var(--color-navy-dark, #0f2744);
		color: #ffffff;
	}

	.ppb-tile--accent.ppb-tile--gold {
		background: var(--color-gold, #d4a234);
		color: #0f2744;
	}

	.ppb-tile__badge {
		width: 48px;
		height: 48px;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}

	.ppb-tile--accent.ppb-tile--navy .ppb-tile__badge {
		background: rgba(212, 162, 52, 0.15);
		color: var(--color-gold, #d4a234);
	}

	.ppb-tile--accent.ppb-tile--gold .ppb-tile__badge {
		background: rgba(15, 39, 68, 0.12);
		color: #0f2744;
	}

	.ppb-tile__claim {
		font-size: clamp(1.25rem, 2vw, 1.5rem);
		font-weight: 700;
		line-height: 1.2;
		margin: 0;
		letter-spacing: -0.01em;
	}

	/* ─── Partners row (BOTTOM) ─── */
	.ppb-partners-row {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: var(--space-4, 2rem) var(--space-5, 3rem);
		gap: var(--space-3, 1.5rem);
		background: var(--color-surface, #fff);
		border: 1px solid var(--color-border, #e2e8f0);
		border-radius: var(--radius-lg, 1.25rem);
	}

	.ppb-partners-label {
		font-size: var(--text-small, 0.875rem);
		font-weight: 700;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: var(--color-muted, #64748b);
		margin: 0;
	}

	.ppb-partners-logos {
		display: flex;
		align-items: center;
		justify-content: center;
		flex-wrap: wrap;
		gap: var(--space-4, 2rem) var(--space-5, 3rem);
	}

	.ppb-partners-logo {
		height: 32px;
		width: auto;
		object-fit: contain;
		opacity: 0.6;
		filter: grayscale(100%);
		transition: opacity 200ms ease, filter 200ms ease;
	}

	.ppb-partners-logo:hover {
		opacity: 1;
		filter: grayscale(0%);
	}

	/* ─── Tablet 2-col ─── */
	@media (max-width: 1024px) {
		.ppb-products-grid {
			grid-template-columns: repeat(2, 1fr);
		}

		.ppb-products-grid .ppb-tile--product:last-child {
			grid-column: span 2;
		}

		.ppb-accents-grid {
			grid-template-columns: repeat(3, 1fr);
		}
	}

	/* ─── Mobile 1-col ─── */
	@media (max-width: 768px) {
		.ppb-section {
			padding: var(--space-5, 3rem) 0;
		}

		.ppb-products-grid {
			grid-template-columns: 1fr;
		}

		.ppb-products-grid .ppb-tile--product:last-child {
			grid-column: span 1;
		}

		.ppb-tile--product {
			min-height: 14rem;
		}

		.ppb-accents-grid {
			grid-template-columns: 1fr;
		}

		.ppb-tile--accent {
			min-height: 8rem;
		}

		.ppb-partners-row {
			padding: var(--space-3, 1.5rem);
		}

		.ppb-partners-logos {
			gap: var(--space-3, 1.5rem);
		}

		.ppb-partners-logo {
			height: 26px;
		}
	}

	/* ─── Reduced motion ─── */
	@media (prefers-reduced-motion: reduce) {
		.ppb-tile {
			transition: none;
		}

		.ppb-tile__img {
			transition: none;
		}
	}
</style>
