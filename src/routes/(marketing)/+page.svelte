<script lang="ts">
	import { revealOnScroll } from '$lib/scrollReveal';
	import { env } from '$env/dynamic/public';
	import { onMount } from 'svelte';
	import logo from '$lib/assets/bg-clear-logo-640.png';
	import HeroVideo from '$lib/components/HeroVideo.svelte';
	import BentoGrid from '$lib/components/BentoGrid.svelte';
	import ProductsPartnersBento from '$lib/components/ProductsPartnersBento.svelte';
	import Footer from '$lib/components/Footer.svelte';

	import processWide from '$lib/assets/visuals/process-wide.png';


	type FormStatus = 'idle' | 'submitting' | 'success' | 'error';

	let hexParallax = $state(0);

	onMount(() => {
		const handleScroll = () => {
			hexParallax = Math.min(window.scrollY * 0.04, 26);
		};

		window.addEventListener('scroll', handleScroll, { passive: true });
		handleScroll();

		return () => {
			window.removeEventListener('scroll', handleScroll);
		};
	});

	let status: FormStatus = $state('idle');
	let errorMessage = $state('');
	let formEl: HTMLFormElement | null = $state(null);

	async function handleSubmit(event: SubmitEvent) {
		// If JS is running, we take over the submission to provide inline success/error states.
		event.preventDefault();

		if (status === 'submitting') return;
		status = 'submitting';
		errorMessage = '';

		const endpoint = (env.PUBLIC_FORMSPREE_ENDPOINT || '').trim();
		if (!endpoint) {
			status = 'error';
			errorMessage = 'Form is not configured yet (missing Formspree endpoint).';
			return;
		}

		try {
			const fd = new FormData(event.currentTarget as HTMLFormElement);

			const res = await fetch(endpoint, {
				method: 'POST',
				body: fd,
				headers: {
					Accept: 'application/json'
				}
			});

			if (!res.ok) {
				// Formspree returns JSON for errors; fall back to text.
				let msg = 'Something went wrong. Please try again.';
				try {
					const j = (await res.json()) as { errors?: Array<{ message?: string }> };
					const m = j?.errors?.[0]?.message;
					if (m) msg = m;
				} catch {
					// ignore
				}
				status = 'error';
				errorMessage = msg;
				return;
			}

			status = 'success';
			formEl?.reset();
		} catch (err) {
			status = 'error';
			errorMessage = 'Network error. Please try again.';
		}
	}
</script>

<style>
	.brand-lockup {
		display: flex;
		align-items: center;
		justify-content: center;
		margin-bottom: var(--space-1, 0.5rem);
	}
	@media (max-width: 480px) {
		.brand-lockup {
			margin-bottom: 0.25rem;
		}
	}

	/* Circular-text logo wrapper */
	.logo-arc-wrap {
		position: relative;
		width: 340px;
		height: 340px;
		flex-shrink: 0;
	}
	.logo-arc-svg {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
	}
	.arc-text {
		font-family: var(--font-heading, 'Montserrat', sans-serif);
		font-size: 14px;
		font-weight: 600;
		fill: var(--color-primary, #1e3a5f);
		letter-spacing: 0.04em;
	}
	.brand-logo {
		position: absolute;
		top: 52%;
		left: 50%;
		transform: translate(-50%, -50%);
		height: 180px;
		width: auto;
		object-fit: contain;
		filter: drop-shadow(0 8px 20px rgba(0, 0, 0, 0.12));
	}

	@media (min-width: 1024px) {
		.logo-arc-wrap {
			width: clamp(340px, 24vw, 420px);
			height: clamp(340px, 24vw, 420px);
		}
		.brand-logo {
			height: clamp(180px, 12vw, 220px);
		}
	}
	@media (max-width: 640px) {
		.logo-arc-wrap {
			width: 240px;
			height: 240px;
		}
		.arc-text {
			font-size: 11px;
		}
		.brand-logo {
			height: 125px;
		}
	}

	/* Product cards with image headers */
	.product-card {
		overflow: hidden;
		padding: 0;
		display: flex;
		flex-direction: column;
	}
	.product-card-img {
		position: relative;
		width: 100%;
		height: 200px;
		overflow: hidden;
		background: linear-gradient(135deg, #f0f4f8 0%, #e8eef5 100%);
	}
	.product-card-img img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		transition: transform 400ms ease;
	}
	.product-card:hover .product-card-img img {
		transform: scale(1.04);
	}
	.product-card-body {
		padding: var(--space-4);
	}

	/* ── Centered Hero with Scrolling Marquee ── */
	.hero {
		position: relative;
		width: 100%;
		min-height: 100vh;
		display: flex;
		flex-direction: column;
		justify-content: center;
		background: linear-gradient(105deg, #1e3a5f 0%, #0f2744 100%);
		overflow: hidden;
		padding: 12rem 0 3rem;
	}

	/* Hex wireframe grid background */
	.hex-wireframe {
		position: absolute;
		inset: 0;
		z-index: 0;
		opacity: 0.15;
		transform: translate3d(0, var(--hex-parallax, 0px), 0);
		transition: transform 220ms ease-out;
	}
	.hex-wireframe-inner {
		animation: hexDrift 20s ease-in-out infinite alternate;
	}
	@keyframes hexDrift {
		0%   { transform: translate(0, 0); }
		100% { transform: translate(20px, 20px); }
	}

	.hero-content {
		position: relative;
		z-index: 2;
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
		padding: 0 1.5rem;
		color: #ffffff;
		margin: 0 auto;
		width: 100%;
		max-width: 72rem;
	}
	.hero .eyebrow {
		color: #d4a234;
		font-size: 0.8125rem;
		font-weight: 700;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		margin-bottom: 1.25rem;
	}
	.hero h1 {
		font-size: clamp(3rem, 7vw, 5rem);
		font-weight: 700;
		letter-spacing: -0.01em;
		line-height: 1.12;
		color: #ffffff;
		margin-bottom: 1.5rem;
		max-width: 100%;
		width: 100%;
	}
	.hero .subhead {
		font-size: clamp(1.1rem, 1.5vw, 1.35rem);
		color: rgba(255, 255, 255, 0.8);
		line-height: 1.6;
		margin-bottom: 2.5rem;
		max-width: 620px;
	}
	.hero-accent {
		color: var(--color-gold, #d4a234);
		font-style: italic;
		font-weight: 600;
		position: relative;
	}
	.hero-accent::after {
		content: '';
		position: absolute;
		left: 0;
		bottom: -2px;
		width: 100%;
		height: 2px;
		background: var(--color-gold, #d4a234);
		opacity: 0.4;
		border-radius: 1px;
	}
	.hero-ctas {
		display: flex;
		flex-direction: row;
		flex-wrap: wrap;
		justify-content: center;
		gap: 1rem;
		margin-bottom: 1.25rem;
	}
	.hero-btn-gold {
		display: inline-flex;
		align-items: center;
		padding: 0.875rem 2rem;
		background: #d4a234;
		color: #0f2744;
		font-weight: 700;
		font-size: 0.9375rem;
		border-radius: 8px;
		text-decoration: none;
		position: relative;
		overflow: hidden;
		isolation: isolate;
		transition: transform 220ms ease, box-shadow 220ms ease;
	}
	.hero-btn-gold::before {
		content: '';
		position: absolute;
		inset: 0;
		background: #e0b24a;
		transform: translateX(-101%);
		transition: transform 240ms ease;
		z-index: -1;
	}
	.hero-btn-gold:hover {
		transform: translateY(-1px) scale(1.02);
		box-shadow: 0 8px 24px rgba(212, 162, 52, 0.35);
	}
	.hero-btn-gold:hover::before {
		transform: translateX(0);
	}
	.hero-btn-outline {
		display: inline-flex;
		align-items: center;
		padding: 0.875rem 2rem;
		background: transparent;
		color: #ffffff;
		font-weight: 600;
		font-size: 0.9375rem;
		border: 2px solid rgba(255, 255, 255, 0.5);
		border-radius: 8px;
		text-decoration: none;
		transition: border-color 220ms ease, background 220ms ease, transform 220ms ease, box-shadow 220ms ease;
	}
	.hero-btn-outline:hover {
		border-color: #ffffff;
		background: rgba(255, 255, 255, 0.08);
		box-shadow: 0 0 0 4px rgba(255, 255, 255, 0.14);
		transform: translateY(-1px) scale(1.02);
	}
	.hero-trust-note {
		font-size: 0.8125rem;
		color: rgba(255, 255, 255, 0.82);
		margin: 0;
	}

	.hero-headline,
	.hero-eyebrow,
	.hero-subhead,
	.hero-ctas-entrance,
	.hero-trust-note-entrance {
		opacity: 0;
	}
	.hero-headline {
		animation: fadeSlideUp 0.6s ease-out 0.2s forwards;
	}
	.hero-eyebrow {
		animation: fadeOnly 0.4s ease-out 0.4s forwards;
	}
	.hero-subhead {
		animation: fadeOnly 0.45s ease-out 0.5s forwards;
	}
	.hero-ctas-entrance {
		animation: fadeSlideUp 0.5s ease-out 0.7s forwards;
	}
	.hero-trust-note-entrance {
		animation: fadeOnly 0.4s ease-out 0.9s forwards;
	}
	@keyframes fadeSlideUp {
		from { opacity: 0; transform: translateY(24px); }
		to { opacity: 1; transform: translateY(0); }
	}
	@keyframes fadeOnly {
		from { opacity: 0; }
		to { opacity: 1; }
	}

	/* ── Scrolling Marquee ── */
	.marquee-area {
		position: relative;
		z-index: 2;
		margin-top: 3.5rem;
		transform: rotate(-3deg);
		overflow: hidden;
	}
	.marquee-area::before,
	.marquee-area::after {
		content: '';
		position: absolute;
		top: 0;
		bottom: 0;
		width: 120px;
		z-index: 3;
		pointer-events: none;
	}
	.marquee-area::before {
		left: 0;
		background: linear-gradient(to right, #0f2744, transparent);
	}
	.marquee-area::after {
		right: 0;
		background: linear-gradient(to left, #0f2744, transparent);
	}
	.marquee-row {
		display: flex;
		gap: 12px;
		width: max-content;
		padding: 6px 0;
	}
	.marquee-row-1 {
		animation: scrollLeft 30s linear infinite;
	}
	.marquee-row-2 {
		animation: scrollRight 25s linear infinite;
	}
	.marquee-area:hover .marquee-row,
	.marquee-area:focus-within .marquee-row {
		animation-play-state: paused;
	}
	@keyframes scrollLeft {
		from { transform: translateX(0); }
		to   { transform: translateX(-50%); }
	}
	@keyframes scrollRight {
		from { transform: translateX(-50%); }
		to   { transform: translateX(0); }
	}
	.marquee-tile {
		width: 120px;
		height: 120px;
		border-radius: 16px;
		border: 2px solid #d4a234;
		overflow: hidden;
		flex-shrink: 0;
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
	}
	.marquee-tile img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
	}
	.marquee-tile-accent {
		width: 120px;
		height: 120px;
		border-radius: 16px;
		background: #d4a234;
		flex-shrink: 0;
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
	}

	/* Responsive */
	@media (max-width: 768px) {
		.hero {
			padding-top: 8.5rem;
		}
		.hero h1 {
			font-size: clamp(2rem, 8vw, 3rem);
		}
		.marquee-tile,
		.marquee-tile-accent {
			width: 80px;
			height: 80px;
			border-radius: 12px;
		}
		.marquee-area::before,
		.marquee-area::after {
			width: 60px;
		}
	}
	@media (max-width: 480px) {
		.hero-ctas {
			flex-direction: column;
			align-items: center;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.hex-wireframe-inner,
		.marquee-row,
		.hero-headline,
		.hero-eyebrow,
		.hero-subhead,
		.hero-ctas-entrance,
		.hero-trust-note-entrance {
			animation: none !important;
		}
		.hero-headline,
		.hero-eyebrow,
		.hero-subhead,
		.hero-ctas-entrance,
		.hero-trust-note-entrance {
			opacity: 1;
		}
		.marquee-area {
			transform: none;
		}
	}

	.footer {
		padding-top: var(--space-5);
		margin-top: 0;
	}

	.hero {
		padding-top: clamp(10rem, 18vw, 14rem);
	}

	/* Provider grid */
	.provider-chips {
		display: flex;
		flex-wrap: wrap;
		gap: 0.75rem;
		margin-top: var(--space-4);
		justify-content: center;
	}
	.provider-chip {
		display: inline-flex;
		align-items: center;
		min-height: 44px;
		padding: 0.625rem 1.25rem;
		background: var(--color-primary, #1e3a5f);
		color: #ffffff;
		font-size: 0.9375rem;
		font-weight: 600;
		border-radius: 2rem;
		letter-spacing: 0.01em;
		transition: transform 200ms ease, box-shadow 200ms ease;
	}
	.provider-chip:hover {
		transform: translateY(-3px) scale(1.02);
		box-shadow: 0 10px 22px rgba(15, 39, 68, 0.24);
	}
	@media (max-width: 480px) {
		.provider-chip {
			font-size: 0.8125rem;
			padding: 0.5rem 1rem;
		}
	}

	/* Process flow */
	.process-flow-container {
		margin: var(--space-4) 0 var(--space-5);
	}
	.process-flow-img {
		width: 100%;
		max-width: 1100px;
		height: auto;
		margin: 0 auto;
		display: block;
		border-radius: var(--radius-lg);
	}
	.process-flow-compact {
		max-height: 140px;
		object-fit: contain;
		border-radius: var(--radius-sm);
	}

	/* 4-column capability grid */
	.capability-grid {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: var(--space-3, 1.5rem);
		margin-top: var(--space-4, 2rem);
	}
	.capability-card {
		background: var(--color-surface, #ffffff);
		border: 1px solid var(--color-border, #e2e8f0);
		border-radius: var(--radius-lg, 1.25rem);
		padding: var(--space-4, 2rem) var(--space-3, 1.5rem);
		text-align: center;
		transition: transform 200ms ease, box-shadow 200ms ease;
	}
	.capability-card:hover {
		transform: translateY(-3px);
		box-shadow: var(--shadow-md);
	}
	.capability-card-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 56px;
		height: 56px;
		margin: 0 auto var(--space-2, 1rem);
		border-radius: 50%;
		background: var(--color-accent-light, #fdf3dc);
		color: var(--color-primary, #1e3a5f);
	}
	.capability-card h3 {
		font-size: var(--text-h3, 1.25rem);
		font-weight: 700;
		color: var(--color-primary, #1e3a5f);
		margin: 0 0 0.5rem;
	}
	.capability-card p {
		font-size: 0.9375rem;
		color: var(--color-muted, #64748b);
		line-height: 1.5;
		margin: 0;
	}
	@media (max-width: 1024px) {
		.capability-grid {
			grid-template-columns: repeat(2, 1fr);
		}
	}
	@media (max-width: 640px) {
		.capability-grid {
			grid-template-columns: 1fr;
		}
	}

	/* Contact info row */
	.contact-info-row {
		display: flex;
		flex-wrap: wrap;
		gap: 1.5rem;
		margin-bottom: 1rem;
	}
	.contact-info-link {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		color: rgba(255, 255, 255, 0.9);
		font-size: 0.95rem;
		font-weight: 500;
		text-decoration: none;
	}
	.contact-info-link:hover {
		color: #ffffff;
	}
	.contact-info-link svg {
		flex-shrink: 0;
		color: var(--color-gold, #d4a234);
	}
	.contact-info-link a {
		color: inherit;
		text-decoration: none;
	}

	/* Contact illustration */
	.contact-illustration {
		width: 100%;
		max-width: 320px;
		height: auto;
		margin-top: var(--space-4);
		border-radius: var(--radius-md);
	}
	@media (max-width: 959px) {
		.contact-illustration {
			max-width: 260px;
			margin: var(--space-4) auto 0;
		}
	}
</style>

<svelte:head>
	<title>BG Clear — Durable Medical Equipment Distribution</title>
	<meta
		name="description"
		content="Browse our full DME catalog, request quotes, and order compliant medical equipment — all from your provider portal."
	/>
</svelte:head>

<main id="main-content" class="page" tabindex="-1">
	<section class="hero">
		<!-- Hex wireframe grid background -->
		<svg class="hex-wireframe" aria-hidden="true" style={`--hex-parallax:${hexParallax}px`} width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
			<defs>
				<pattern id="hexGrid" width="80" height="138.56" patternUnits="userSpaceOnUse">
					<polygon points="40,0 80,23.09 80,69.28 40,92.38 0,69.28 0,23.09" fill="none" stroke="#d4a234" stroke-width="1"/>
					<polygon points="80,46.19 120,69.28 120,115.47 80,138.56 40,115.47 40,69.28" fill="none" stroke="#d4a234" stroke-width="1"/>
				</pattern>
			</defs>
			<g class="hex-wireframe-inner"><rect width="100%" height="100%" fill="url(#hexGrid)" /></g>
		</svg>

		<!-- Centered hero content -->
		<div class="hero-content">
			<h1 class="hero-headline">Equipment You Need, From People Who Care</h1>
			<p class="subhead hero-subhead">
				Your <span class="hero-accent">tech-forward</span> DME partner.<br />
				FAST. COMPLIANT. HUMAN.
			</p>
			<div class="hero-ctas hero-ctas-entrance">
				<a class="hero-btn-gold" href="#request-call">Talk to a Specialist</a>
				<a class="hero-btn-outline" href="/about">Learn More</a>
			</div>
		</div>

		<!-- Scrolling Marquee -->
		<div class="marquee-area" aria-hidden="true">
			<!-- Row 1: scrolls left -->
			<div class="marquee-row marquee-row-1">
				<div class="marquee-tile"><img src="/generated-photos/hero-technician.png" alt="DME technician inspecting durable medical equipment" /></div>
				<div class="marquee-tile"><img src="/generated-photos/marquee-bed.png" alt="Semi-electric hospital bed for home care" /></div>
				<div class="marquee-tile-accent"></div>
				<div class="marquee-tile"><img src="/generated-photos/marquee-nebulizer.png" alt="Compressor nebulizer system for respiratory therapy" /></div>
				<div class="marquee-tile"><img src="/generated-photos/hero-products.png" alt="Assortment of DME and HME medical equipment" /></div>
				<div class="marquee-tile"><img src="/generated-photos/marquee-walker.png" alt="Folding rollator walker with padded seat" /></div>
				<div class="marquee-tile-accent"></div>
				<div class="marquee-tile"><img src="/generated-photos/marquee-oximeter.png" alt="Fingertip pulse oximeter for patient monitoring" /></div>
				<!-- Duplicate for seamless loop -->
				<div class="marquee-tile"><img src="/generated-photos/hero-technician.png" alt="DME technician inspecting durable medical equipment" /></div>
				<div class="marquee-tile"><img src="/generated-photos/marquee-bed.png" alt="Semi-electric hospital bed for home care" /></div>
				<div class="marquee-tile-accent"></div>
				<div class="marquee-tile"><img src="/generated-photos/marquee-nebulizer.png" alt="Compressor nebulizer system for respiratory therapy" /></div>
				<div class="marquee-tile"><img src="/generated-photos/hero-products.png" alt="Assortment of DME and HME medical equipment" /></div>
				<div class="marquee-tile"><img src="/generated-photos/marquee-walker.png" alt="Folding rollator walker with padded seat" /></div>
				<div class="marquee-tile-accent"></div>
				<div class="marquee-tile"><img src="/generated-photos/marquee-oximeter.png" alt="Fingertip pulse oximeter for patient monitoring" /></div>
			</div>

			<!-- Row 2: scrolls right -->
			<div class="marquee-row marquee-row-2">
				<div class="marquee-tile"><img src="/generated-photos/hero-delivery.png" alt="Medical equipment delivery to healthcare provider" /></div>
				<div class="marquee-tile"><img src="/generated-photos/marquee-cpap.png" alt="CPAP machine with heated humidifier for sleep therapy" /></div>
				<div class="marquee-tile"><img src="/generated-photos/hex-walker.png" alt="Mobility walker for patient safety and independence" /></div>
				<div class="marquee-tile-accent"></div>
				<div class="marquee-tile"><img src="/generated-photos/marquee-compression.png" alt="Graduated compression stockings for venous therapy" /></div>
				<div class="marquee-tile"><img src="/generated-photos/hex-monitoring.png" alt="Remote patient health monitoring devices" /></div>
				<div class="marquee-tile"><img src="/generated-photos/hex-rehab.png" alt="Rehabilitation and physical therapy equipment" /></div>
				<div class="marquee-tile-accent"></div>
				<!-- Duplicate for seamless loop -->
				<div class="marquee-tile"><img src="/generated-photos/hero-delivery.png" alt="Medical equipment delivery to healthcare provider" /></div>
				<div class="marquee-tile"><img src="/generated-photos/marquee-cpap.png" alt="CPAP machine with heated humidifier for sleep therapy" /></div>
				<div class="marquee-tile"><img src="/generated-photos/hex-walker.png" alt="Mobility walker for patient safety and independence" /></div>
				<div class="marquee-tile-accent"></div>
				<div class="marquee-tile"><img src="/generated-photos/marquee-compression.png" alt="Graduated compression stockings for venous therapy" /></div>
				<div class="marquee-tile"><img src="/generated-photos/hex-monitoring.png" alt="Remote patient health monitoring devices" /></div>
				<div class="marquee-tile"><img src="/generated-photos/hex-rehab.png" alt="Rehabilitation and physical therapy equipment" /></div>
				<div class="marquee-tile-accent"></div>
			</div>
		</div>
	</section>

	<section class="trust-strip">
		<div class="container trust-strip-inner">
			<div class="trust-badge reveal trust-badge-reveal" use:revealOnScroll style="--stagger-delay: 0s;">
				<svg class="trust-badge-seal" aria-hidden="true" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
					<circle cx="40" cy="40" r="38" stroke="#1e3a5f" stroke-width="2" fill="#f0f4f8"/>
					<circle cx="40" cy="40" r="32" stroke="#1e3a5f" stroke-width="1" fill="none" stroke-dasharray="2 2"/>
					<path d="M40 14 L44 24 L40 22 L36 24 Z" fill="#d4a234"/>
					<path d="M28 30 Q40 26 52 30 L52 48 Q40 58 28 48 Z" fill="#1e3a5f"/>
					<path d="M34 40 L38 44 L47 35" stroke="#d4a234" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
				</svg>
				<div class="trust-badge-text">
					<span class="trust-badge-label">ACHC</span>
					<span class="trust-badge-sub">Accredited</span>
				</div>
			</div>
			<div class="trust-badge reveal trust-badge-reveal" use:revealOnScroll style="--stagger-delay: 0.1s;">
				<svg class="trust-badge-seal" aria-hidden="true" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
					<circle cx="40" cy="40" r="38" stroke="#1e3a5f" stroke-width="2" fill="#f0f4f8"/>
					<circle cx="40" cy="40" r="32" stroke="#1e3a5f" stroke-width="1" fill="none" stroke-dasharray="2 2"/>
					<path d="M40 14 L44 24 L40 22 L36 24 Z" fill="#d4a234"/>
					<path d="M28 28 Q40 24 52 28 L52 48 Q40 56 28 48 Z" fill="#1e3a5f"/>
					<text x="40" y="37" text-anchor="middle" font-size="7" font-weight="800" fill="#ffffff" font-family="system-ui">CMS</text>
					<path d="M33 40 L47 40" stroke="#d4a234" stroke-width="0.8"/>
					<path d="M34 44 L38 48 L47 39" stroke="#d4a234" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
				</svg>
				<div class="trust-badge-text">
					<span class="trust-badge-label">Medicare</span>
					<span class="trust-badge-sub">Approved Supplier</span>
				</div>
			</div>
			<div class="trust-badge reveal trust-badge-reveal" use:revealOnScroll style="--stagger-delay: 0.2s;">
				<svg class="trust-badge-seal" aria-hidden="true" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
					<circle cx="40" cy="40" r="38" stroke="#1e3a5f" stroke-width="2" fill="#f0f4f8"/>
					<circle cx="40" cy="40" r="32" stroke="#1e3a5f" stroke-width="1" fill="none" stroke-dasharray="2 2"/>
					<path d="M40 14 L44 24 L40 22 L36 24 Z" fill="#d4a234"/>
					<path d="M30 30 L40 24 L50 30 L50 46 Q40 56 30 46 Z" fill="#1e3a5f"/>
					<rect x="36" y="32" width="8" height="10" rx="4" fill="none" stroke="#ffffff" stroke-width="1.5"/>
					<rect x="34" y="40" width="12" height="8" rx="1" fill="none" stroke="#ffffff" stroke-width="1.5"/>
					<circle cx="40" cy="44" r="1.5" fill="#d4a234"/>
				</svg>
				<div class="trust-badge-text">
					<span class="trust-badge-label">HIPAA</span>
					<span class="trust-badge-sub">Compliant</span>
				</div>
			</div>
			<div class="trust-badge reveal trust-badge-reveal" use:revealOnScroll style="--stagger-delay: 0.3s;">
				<svg class="trust-badge-seal" aria-hidden="true" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
					<circle cx="40" cy="40" r="38" stroke="#1e3a5f" stroke-width="2" fill="#f0f4f8"/>
					<circle cx="40" cy="40" r="32" stroke="#1e3a5f" stroke-width="1" fill="none" stroke-dasharray="2 2"/>
					<path d="M40 14 L44 24 L40 22 L36 24 Z" fill="#d4a234"/>
					<path d="M30 30 Q40 26 50 30 L50 50 Q40 56 30 50 Z" fill="#1e3a5f"/>
					<text x="40" y="38" text-anchor="middle" font-size="7" font-weight="800" fill="#ffffff" font-family="system-ui">FDA</text>
					<path d="M33 42 L47 42" stroke="#d4a234" stroke-width="0.8"/>
					<text x="40" y="48" text-anchor="middle" font-size="4.5" font-weight="600" fill="#d4a234" font-family="system-ui">REG.</text>
				</svg>
				<div class="trust-badge-text">
					<span class="trust-badge-label">FDA</span>
					<span class="trust-badge-sub">Registered</span>
				</div>
			</div>
		</div>
	</section>

	<!-- WHAT WE DO -->
	<section class="section">
		<div class="container section-intro reveal" use:revealOnScroll>
			<div>
				<p class="eyebrow">What we do</p>
				<h2>Your DME fulfillment partner — from prescription to patient doorstep.</h2>
			</div>
			<p>
				BG Clear supports healthcare providers with efficient, compliant distribution of durable medical equipment from prescription intake to fulfillment and patient delivery.
			</p>
		</div>
		<div class="container">
			<div class="capability-grid reveal" use:revealOnScroll>
				<div class="capability-card">
					<div class="capability-card-icon">
						<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" width="32" height="32">
							<path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
						</svg>
					</div>
					<h3>Prescription &amp; Order Intake</h3>
					<p>We coordinate with providers to review prescriptions and confirm equipment needs.</p>
				</div>
				<div class="capability-card">
					<div class="capability-card-icon">
						<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" width="32" height="32">
							<path stroke-linecap="round" stroke-linejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
						</svg>
					</div>
					<h3>Equipment Distribution</h3>
					<p>Reliable sourcing and distribution of high-quality durable medical equipment.</p>
				</div>
				<div class="capability-card">
					<div class="capability-card-icon">
						<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" width="32" height="32">
							<path stroke-linecap="round" stroke-linejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
						</svg>
					</div>
					<h3>Fulfillment &amp; Delivery</h3>
					<p>Fast, accurate order processing and delivery to providers or patients.</p>
				</div>
				<div class="capability-card">
					<div class="capability-card-icon">
						<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" width="32" height="32">
							<path stroke-linecap="round" stroke-linejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
						</svg>
					</div>
					<h3>Operational Support</h3>
					<p>Ongoing support for documentation and coordination.</p>
				</div>
			</div>
		</div>
	</section>

	<!-- WHO WE SERVE -->
	<section class="section section--warm section--who-we-serve">
		<div class="container reveal" use:revealOnScroll>
			<p class="eyebrow reveal reveal-eyebrow">Who we serve</p>
			<h2>Built for the teams delivering care.</h2>
			<p class="subhead hero-subhead">From primary care to home health, we serve providers who need equipment they can count on.</p>
			<div class="provider-chips">
				<span class="provider-chip reveal provider-chip-reveal" use:revealOnScroll style="--chip-delay: 0.00s;">Primary Care Clinics</span>
				<span class="provider-chip reveal provider-chip-reveal" use:revealOnScroll style="--chip-delay: 0.05s;">Specialty Clinics</span>
				<span class="provider-chip reveal provider-chip-reveal" use:revealOnScroll style="--chip-delay: 0.10s;">Hospitals &amp; Outpatient</span>
				<span class="provider-chip reveal provider-chip-reveal" use:revealOnScroll style="--chip-delay: 0.15s;">Home Health Agencies</span>
				<span class="provider-chip reveal provider-chip-reveal" use:revealOnScroll style="--chip-delay: 0.20s;">Long-Term Care</span>
				<span class="provider-chip reveal provider-chip-reveal" use:revealOnScroll style="--chip-delay: 0.25s;">Pharmacy &amp; Retailers</span>
			</div>
		</div>
	</section>

	<!-- WHY BG CLEAR (moved UP, before Products) -->
	<div id="capabilities" class="reveal" use:revealOnScroll>
		<BentoGrid />
	</div>

	<!-- PRODUCTS & PARTNERS -->
	<section class="section section--navy section--products-partners">
		<ProductsPartnersBento />
	</section>

	<!-- HOW WE WORK -->
	<section class="section" id="how-we-work">
		<div class="container reveal" use:revealOnScroll>
			<p class="eyebrow reveal reveal-eyebrow">How we work</p>
			<h2>From catalog to delivery — here's how it works.</h2>
			<div class="process-flow-container">
				<img class="process-flow-img" src={processWide} alt="Our 4-step process: Consultation, Documentation, Fulfillment, Ongoing support" loading="lazy" />
			</div>
			<div class="steps">
				<article class="step reveal process-step-reveal" use:revealOnScroll style="--step-delay: 0.0s;">
					<span class="capability-number">01</span>
					<h3>Browse &amp; Select</h3>
					<p>Create your free account and explore our full DME catalog. Filter by category, compare products, and add what you need to a quote request — all at your own pace.</p>
				</article>
				<article class="step reveal process-step-reveal" use:revealOnScroll style="--step-delay: 0.1s;">
					<span class="capability-number">02</span>
					<h3>Request a Quote</h3>
					<p>Submit your selections through the portal. A dedicated rep reviews your request, provides competitive pricing, and handles all compliance documentation.</p>
				</article>
				<article class="step reveal process-step-reveal" use:revealOnScroll style="--step-delay: 0.2s;">
					<span class="capability-number">03</span>
					<h3>Fulfillment &amp; Shipping</h3>
					<p>Orders are processed quickly through our distribution network, ensuring accurate fulfillment and timely delivery to providers or directly to patients.</p>
				</article>
				<article class="step reveal process-step-reveal" use:revealOnScroll style="--step-delay: 0.3s;">
					<span class="capability-number">04</span>
					<h3>Ongoing Support</h3>
					<p>Our team remains available to assist with order updates, operational questions, and continued support as your needs evolve.</p>
				</article>
			</div>
		</div>
	</section>

	<!-- START YOUR DME PARTNERSHIP (renamed from Next Steps) -->
	<section class="section section--gold section--cta-pop cta-band">
		<div class="container cta-inner reveal" use:revealOnScroll>
			<div>
				<p class="eyebrow cta-eyebrow">Start your DME partnership</p>
				<h2 class="cta-heading">Competitive DME pricing — available on request.</h2>
				<p class="subhead cta-subhead">
					Talk to a specialist &middot; Competitive pricing &middot; Compliant, reliable fulfillment
				</p>
			</div>
			<a class="button button-navy-pop" href="#request-call">Talk to a Specialist</a>
		</div>
	</section>

	<section class="section section-alt" id="faq">
		<div class="container reveal" use:revealOnScroll>
			<p class="eyebrow reveal reveal-eyebrow">FAQ</p>
			<h2>Common questions from providers.</h2>
			<div class="faq-list">
				<details class="faq-item reveal faq-item-reveal" use:revealOnScroll style="--faq-delay: 0.00s;">
					<summary class="faq-question">What geographic areas do you serve?</summary>
					<p class="faq-answer">We currently serve healthcare providers across the continental United States, with fulfillment partnerships that enable fast delivery to most locations within 2-5 business days.</p>
				</details>
				<details class="faq-item reveal faq-item-reveal" use:revealOnScroll style="--faq-delay: 0.08s;">
					<summary class="faq-question">Do you work with insurance and Medicare/Medicaid?</summary>
					<p class="faq-answer">We sell directly to providers and healthcare organizations. Billing and reimbursement remain between your organization and payers—we provide the documentation you need for compliance.</p>
				</details>
				<details class="faq-item reveal faq-item-reveal" use:revealOnScroll style="--faq-delay: 0.16s;">
					<summary class="faq-question">What's your minimum order size?</summary>
					<p class="faq-answer">We work with organizations of all sizes. Whether you need a single unit or ongoing inventory for multiple locations, we'll find the right arrangement for your needs.</p>
				</details>
				<details class="faq-item reveal faq-item-reveal" use:revealOnScroll style="--faq-delay: 0.24s;">
					<summary class="faq-question">How do you ensure equipment quality and compliance?</summary>
					<p class="faq-answer">All equipment meets FDA requirements and CMS guidelines where applicable. We maintain documentation and can provide certificates of compliance for your records.</p>
				</details>
				<details class="faq-item reveal faq-item-reveal" use:revealOnScroll style="--faq-delay: 0.32s;">
					<summary class="faq-question">Can you source equipment not listed on your site?</summary>
					<p class="faq-answer">Yes. If you have specific DME needs outside our core categories, reach out—we have supplier relationships that often allow us to source specialized equipment.</p>
				</details>
			</div>
		</div>
	</section>

	
	<div id="request-call" style="scroll-margin-top: 6rem;"></div>
	<section class="section section--dark-navy section--contact">
		<div class="container request reveal" use:revealOnScroll>
			<div class="request-intro">
				<p class="eyebrow reveal reveal-eyebrow">Ready to talk?</p>
				<h2>Prefer a conversation? We're here.</h2>
				<div class="contact-info-row">
					<a href="mailto:customercare@bgclear.com" class="contact-info-link">
						<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" width="20" height="20">
							<path stroke-linecap="round" stroke-linejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
						</svg>
						customercare@bgclear.com
					</a>
					<span class="contact-info-link">
						<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" width="20" height="20">
							<path stroke-linecap="round" stroke-linejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
						</svg>
						<a href="tel:+12017657171">(201) 765-7171</a>
					</span>
				</div>
				<p class="subhead hero-subhead">
					Have questions before creating an account? Drop us a line and we'll get back to you within 4 business hours.
				</p>
			</div>

			<form
				class="request-form"
				method="POST"
				action={env.PUBLIC_FORMSPREE_ENDPOINT || ''}
				onsubmit={handleSubmit}
				bind:this={formEl}
			>
				<div class="field-row">
					<label class="field">
						<span>Name</span>
						<input id="name" name="name" autocomplete="name" required aria-required="true" aria-describedby="form-status-message" />
					</label>
					<label class="field">
						<span>Organization</span>
						<input id="organization" name="organization" autocomplete="organization" />
					</label>
				</div>

				<div class="field-row">
					<label class="field">
						<span>Email</span>
						<input id="email" type="email" name="email" autocomplete="email" required aria-required="true" aria-describedby="form-status-message" />
					</label>
					<label class="field">
						<span>Phone <span class="optional-label">(optional)</span></span>
						<input id="phone" type="tel" name="phone" autocomplete="tel" />
					</label>
				</div>

				<label class="field">
					<span>What are you looking for?</span>
					<select id="inquiry_type" name="inquiry_type" required aria-required="true" aria-describedby="form-status-message">
						<option value="" disabled selected>Select an option...</option>
						<option value="pricing">Pricing / Quote</option>
						<option value="availability">Product Availability</option>
						<option value="compliance">Compliance Questions</option>
						<option value="partnership">Become a Partner</option>
						<option value="other">Other</option>
					</select>
				</label>

				<label class="field">
					<span>Message</span>
					<textarea id="message" name="message" rows="4" placeholder="Equipment category, quantities, timeline, or any other details…" required aria-required="true" aria-describedby="form-status-message"></textarea>
				</label>

				<label class="field honeypot">
					<span>Don't fill this out</span>
					<input name="_gotcha" tabindex="-1" autocomplete="off" />
				</label>

				<input type="hidden" name="_subject" value="BG Clear — Request a call" />

				<div class="form-status" aria-live="polite" aria-atomic="true">
					{#if status === 'success'}
						<p id="form-status-message" class="form-success" role="status">
							<span class="form-success-check" aria-hidden="true"></span>
							Thanks — we got your request. We'll follow up shortly.
						</p>
					{:else if status === 'error'}
						<p id="form-status-message" class="form-error" role="alert">
							{errorMessage}
						</p>
					{:else}
						<p id="form-status-message" class="sr-only">Form status updates will be announced here.</p>
					{/if}
				</div>

				<button class="button button-primary" type="submit" disabled={status === 'submitting'}>
					{status === 'submitting' ? 'Sending…' : 'Send Message'}
				</button>
				<p class="form-footnote">No obligation • We respond within 4 business hours</p>
			</form>
		</div>
	</section>
	<Footer />
</main>
