<script lang="ts">
	import { revealOnScroll } from '$lib/scrollReveal';
	import { env } from '$env/dynamic/public';
	import { onMount } from 'svelte';
	import logo from '$lib/assets/bg-clear-logo-640.png';
	import HeroVideo from '$lib/components/HeroVideo.svelte';
	import BentoGrid from '$lib/components/BentoGrid.svelte';
	import ProductsPartnersBento from '$lib/components/ProductsPartnersBento.svelte';

	// New visual assets
	import capCompliance from '$lib/assets/visuals/cap-compliance.png';
	import capFulfillment from '$lib/assets/visuals/cap-fulfillment.png';
	import capTech from '$lib/assets/visuals/cap-tech.png';
	import processWide from '$lib/assets/visuals/process-wide.png';
	import iconPrimaryCare from '$lib/assets/visuals/icon-primary-care.png';
	import iconSpecialty from '$lib/assets/visuals/icon-specialty.png';
	import iconHospital from '$lib/assets/visuals/icon-hospital.png';
	import iconHomeHealth from '$lib/assets/visuals/icon-home-health.png';
	import iconLongTermCare from '$lib/assets/visuals/icon-long-term-care.png';
	import iconPharmacy from '$lib/assets/visuals/icon-pharmacy.png';


	type FormStatus = 'idle' | 'submitting' | 'success' | 'error';

	let scrolled = false;
	let activeSection = '';

	onMount(() => {
		const handleScroll = () => {
			scrolled = window.scrollY > 20;
		};

		window.addEventListener('scroll', handleScroll, { passive: true });
		handleScroll();

		// IntersectionObserver for active nav highlighting
		const sectionIds = ['capabilities', 'products', 'how-we-work', 'faq'];
		const sectionEls = sectionIds
			.map((id) => document.getElementById(id))
			.filter((el): el is HTMLElement => el !== null);

		const observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (entry.isIntersecting) {
						activeSection = entry.target.id;
					}
				}
			},
			{ rootMargin: '-40% 0px -55% 0px', threshold: 0 }
		);

		for (const el of sectionEls) {
			observer.observe(el);
		}

		return () => {
			window.removeEventListener('scroll', handleScroll);
			observer.disconnect();
		};
	});

	let status: FormStatus = 'idle';
	let errorMessage = '';
	let formEl: HTMLFormElement | null = null;

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

	/* ── Animated Geometric Hero ── */
	.hero {
		position: relative;
		width: 100%;
		min-height: 100vh;
		display: flex;
		align-items: center;
		background: linear-gradient(105deg, #1e3a5f 0%, #0f2744 100%);
		overflow: hidden;
		padding: 0;
	}
	.hero-content {
		position: relative;
		z-index: 2;
		width: 50%;
		padding: clamp(2rem, 5vw, 5rem);
		padding-left: clamp(2rem, 6vw, 7rem);
		color: #ffffff;
	}
	.hero .eyebrow {
		color: #d4a234;
		font-size: 0.8125rem;
		font-weight: 700;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		margin-bottom: 1rem;
	}
	.hero h1 {
		font-size: clamp(2.5rem, 4.5vw, 4rem);
		font-weight: 700;
		letter-spacing: -0.025em;
		line-height: 1.08;
		color: #ffffff;
		margin-bottom: 1.25rem;
	}
	.hero .subhead {
		font-size: clamp(1.05rem, 1.4vw, 1.25rem);
		color: rgba(255, 255, 255, 0.8);
		line-height: 1.5;
		margin-bottom: 2rem;
		max-width: 520px;
	}
	.hero-ctas {
		display: flex;
		flex-wrap: wrap;
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
		transition: background 200ms ease, transform 200ms ease;
	}
	.hero-btn-gold:hover {
		background: #e0b24a;
		transform: translateY(-1px);
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
		transition: border-color 200ms ease, background 200ms ease, transform 200ms ease;
	}
	.hero-btn-outline:hover {
		border-color: #ffffff;
		background: rgba(255, 255, 255, 0.08);
		transform: translateY(-1px);
	}
	.hero-trust-note {
		font-size: 0.8125rem;
		color: rgba(255, 255, 255, 0.55);
		margin: 0;
	}

	/* Right side: hexagon honeycomb cluster */
	.hero-visual {
		position: absolute;
		right: 5%;
		top: 50%;
		transform: translateY(-50%) rotate(2deg);
		z-index: 1;
		pointer-events: none;
	}
	.hero-glow {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		width: 500px;
		height: 500px;
		background: radial-gradient(circle, rgba(212, 162, 52, 0.18) 0%, transparent 70%);
		pointer-events: none;
	}

	/* Honeycomb 2-3-2 layout */
	.hex-grid {
		display: flex;
		flex-direction: column;
		align-items: center;
	}
	.hex-row {
		display: flex;
		gap: 8px;
	}
	.hex-row-mid {
		display: flex;
		gap: 8px;
		margin-top: -40px;
		margin-left: -84px; /* offset left by half hex width */
	}

	/* Individual hexagon */
	.hex {
		width: 160px;
		height: 160px;
		clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
		position: relative;
		opacity: 0;
		animation: hexFadeIn 0.5s ease forwards, hexFloat 6s ease-in-out infinite;
		pointer-events: auto;
		cursor: default;
		transition: transform 300ms ease, filter 300ms ease;
		flex-shrink: 0;
	}
	.hex:hover {
		transform: scale(1.05);
		filter: drop-shadow(0 0 16px rgba(212, 162, 52, 0.5));
	}
	.hex img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
		display: block;
	}

	/* Gold accent hex */
	.hex-accent {
		background: #d4a234;
		opacity: 0;
		animation: hexFadeIn 0.5s ease forwards, hexFloat 6s ease-in-out infinite;
	}

	/* Navy hex with cross icon */
	.hex-navy {
		background: #0f2744;
		opacity: 0;
		animation: hexFadeIn 0.5s ease forwards, hexFloat 6s ease-in-out infinite;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	.hex-navy svg {
		width: 44px;
		height: 44px;
	}

	@keyframes hexFadeIn {
		from { opacity: 0; transform: scale(0.85) translateY(20px); }
		to   { opacity: 1; transform: scale(1) translateY(0); }
	}
	@keyframes hexFloat {
		0%, 100% { transform: translateY(0); }
		50%      { transform: translateY(8px); }
	}

	/* Row 3 has same offset as row 1 */
	.hex-row-bottom {
		display: flex;
		gap: 8px;
		margin-top: -40px;
	}

	/* Responsive: tablet */
	@media (max-width: 900px) {
		.hero {
			min-height: auto;
			padding-top: 5rem;
		}
		.hero-content {
			width: 100%;
			padding: 2.5rem 1.5rem 2rem;
			text-align: center;
		}
		.hero .subhead {
			margin-left: auto;
			margin-right: auto;
		}
		.hero-ctas {
			justify-content: center;
		}
		.hero-trust-note {
			text-align: center;
		}
		.hero-visual {
			position: relative;
			right: auto;
			top: auto;
			transform: none;
			display: flex;
			justify-content: center;
			margin: 1.5rem auto 0;
			opacity: 1;
		}
		.hero-glow {
			display: none;
		}
		.hero-content {
			z-index: 2;
		}
		.hero h1 {
			font-size: clamp(2rem, 7vw, 2.75rem);
		}
	}
	/* Mobile: show only 3 hexagons in a single row */
	@media (max-width: 768px) {
		.hero-visual {
			position: relative;
			right: auto;
			top: auto;
			transform: none;
			display: flex;
			justify-content: center;
			margin: 1rem auto 0;
		}
		.hex-row,
		.hex-row-bottom {
			display: none;
		}
		.hex-row-mid {
			margin-top: 0;
			margin-left: 0;
		}
		.hex {
			width: 100px;
			height: 100px;
		}
	}
	@media (max-width: 480px) {
		.hero-content {
			padding: 2rem 1.25rem 1.5rem;
		}
		.hero-ctas {
			flex-direction: column;
			align-items: center;
		}
		.hex {
			width: 85px;
			height: 85px;
		}
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
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(15, 39, 68, 0.25);
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
		content="DME distribution for healthcare providers. Compliant equipment, fast fulfillment, and a team that picks up the phone."
	/>
</svelte:head>

<!-- Navigation Header -->
<header class="site-header" class:scrolled>
	<div class="container header-inner">
		<a href="/"><img class="header-logo is-visible" src={logo} alt="BG Clear" /></a>
		<nav class="header-nav">
			<a href="/about">About Us</a>
			<a href="#capabilities" class:nav-active={activeSection === 'capabilities'}>Capabilities</a>
			<a href="#products" class:nav-active={activeSection === 'products'}>Products</a>
			<a href="#how-we-work" class:nav-active={activeSection === 'how-we-work'}>Process</a>
			<a href="#faq" class:nav-active={activeSection === 'faq'}>FAQ</a>
		</nav>
		<div class="header-cta">
			<div class="header-icon-buttons">
				<a class="header-icon-btn" href="tel:+12017657171" aria-label="Call us">
					<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
					</svg>
				</a>
				<a class="header-icon-btn" href="mailto:customercare@bgclear.com" aria-label="Email us">
					<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
					</svg>
				</a>
				<a class="header-icon-btn" href="https://maps.google.com/?q=550+Sylvan+Ave+Suite+202+Englewood+Cliffs+NJ+07632" target="_blank" rel="noopener noreferrer" aria-label="Our location">
					<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
						<path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
					</svg>
				</a>
			</div>
			<a class="button button-primary button-header" href="#request-call">Contact Us</a>
		</div>
	</div>
</header>

<main class="page">
	<section class="hero">
		<!-- Left: content -->
		<div class="hero-content">
			<p class="eyebrow">A Tech-Forward DME &amp; HME Distribution Company</p>
			<h1>Real People Who<br/>Answer the Phone</h1>
			<p class="subhead">
				Fast, compliant DME access for providers and care partners.
			</p>
			<div class="hero-ctas">
				<a class="hero-btn-gold" href="#request-call">Contact a DME Specialist</a>
				<a class="hero-btn-outline" href="#products">View Product Categories</a>
			</div>
			<p class="hero-trust-note">No obligation · Most inquiries answered within 4 hours</p>
		</div>

		<!-- Right: honeycomb hexagon cluster (2-3-2 pattern) -->
		<div class="hero-visual">
			<div class="hero-glow"></div>

			<div class="hex-grid">
				<!-- Row 1: 2 photo hexagons -->
				<div class="hex-row">
					<div class="hex" style="animation-delay: 0s, 0s;">
						<img src="/generated-photos/hero-technician.png" alt="DME technician" />
					</div>
					<div class="hex" style="animation-delay: 0.15s, 1s;">
						<img src="/generated-photos/hero-products.png" alt="Medical equipment" />
					</div>
				</div>

				<!-- Row 2: 3 hexagons (offset left) — photo, gold accent, photo -->
				<div class="hex-row-mid">
					<div class="hex" style="animation-delay: 0.3s, 2s;">
						<img src="/generated-photos/hero-delivery.png" alt="DME delivery" />
					</div>
					<div class="hex hex-accent" style="animation-delay: 0.45s, 0.5s; opacity: 0.85;"></div>
					<div class="hex" style="animation-delay: 0.6s, 3s;">
						<img src="/generated-photos/hex-walker.png" alt="Walker equipment" />
					</div>
				</div>

				<!-- Row 3: 2 hexagons — photo, navy+cross -->
				<div class="hex-row-bottom">
					<div class="hex" style="animation-delay: 0.75s, 1.5s;">
						<img src="/generated-photos/hex-cpap.png" alt="CPAP equipment" />
					</div>
					<div class="hex hex-navy" style="animation-delay: 0.9s, 2.5s;">
						<svg viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
							<rect x="18" y="4" width="8" height="36" rx="2" fill="#d4a234"/>
							<rect x="4" y="18" width="36" height="8" rx="2" fill="#d4a234"/>
						</svg>
					</div>
				</div>
			</div>
		</div>
	</section>

	<section class="trust-strip">
		<div class="container trust-strip-inner">
			<div class="trust-badge">
				<svg class="trust-badge-seal" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
					<circle cx="40" cy="40" r="38" stroke="#1e3a5f" stroke-width="2" fill="#f0f6fc"/>
					<circle cx="40" cy="40" r="32" stroke="#1e3a5f" stroke-width="1" fill="none" stroke-dasharray="2 2"/>
					<path d="M40 14 L44 24 L40 22 L36 24 Z" fill="#1e3a5f"/>
					<path d="M28 30 Q40 26 52 30 L52 48 Q40 58 28 48 Z" fill="#1e3a5f"/>
					<path d="M34 40 L38 44 L47 35" stroke="#ffffff" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
				</svg>
				<div class="trust-badge-text">
					<span class="trust-badge-label">ACHC</span>
					<span class="trust-badge-sub">Accredited</span>
				</div>
			</div>
			<div class="trust-badge">
				<svg class="trust-badge-seal" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
					<circle cx="40" cy="40" r="38" stroke="#0d5e3a" stroke-width="2" fill="#f0faf5"/>
					<circle cx="40" cy="40" r="32" stroke="#0d5e3a" stroke-width="1" fill="none" stroke-dasharray="2 2"/>
					<rect x="28" y="28" width="24" height="18" rx="2" fill="#0d5e3a"/>
					<path d="M28 33 L40 40 L52 33" stroke="#f0faf5" stroke-width="1.5" fill="none"/>
					<rect x="35" y="48" width="10" height="6" rx="1" fill="#0d5e3a"/>
					<path d="M37 50 L43 50 M37 52 L41 52" stroke="#f0faf5" stroke-width="0.8"/>
					<text x="40" y="26" text-anchor="middle" font-size="5" font-weight="700" fill="#0d5e3a" font-family="system-ui">CMS</text>
				</svg>
				<div class="trust-badge-text">
					<span class="trust-badge-label">Medicare</span>
					<span class="trust-badge-sub">Approved Supplier</span>
				</div>
			</div>
			<div class="trust-badge">
				<svg class="trust-badge-seal" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
					<circle cx="40" cy="40" r="38" stroke="#4338ca" stroke-width="2" fill="#f0f0ff"/>
					<circle cx="40" cy="40" r="32" stroke="#4338ca" stroke-width="1" fill="none" stroke-dasharray="2 2"/>
					<path d="M30 30 L40 24 L50 30 L50 46 Q40 56 30 46 Z" fill="#4338ca"/>
					<rect x="36" y="32" width="8" height="10" rx="4" fill="none" stroke="#ffffff" stroke-width="1.5"/>
					<rect x="34" y="40" width="12" height="8" rx="1" fill="none" stroke="#ffffff" stroke-width="1.5"/>
					<circle cx="40" cy="44" r="1.5" fill="#ffffff"/>
				</svg>
				<div class="trust-badge-text">
					<span class="trust-badge-label">HIPAA</span>
					<span class="trust-badge-sub">Compliant</span>
				</div>
			</div>
			<div class="trust-badge">
				<svg class="trust-badge-seal" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
					<circle cx="40" cy="40" r="38" stroke="#1a5276" stroke-width="2" fill="#f0f4f8"/>
					<circle cx="40" cy="40" r="32" stroke="#1a5276" stroke-width="1" fill="none" stroke-dasharray="2 2"/>
					<path d="M30 30 Q40 26 50 30 L50 50 Q40 56 30 50 Z" fill="#1a5276"/>
					<text x="40" y="38" text-anchor="middle" font-size="7" font-weight="800" fill="#ffffff" font-family="system-ui">FDA</text>
					<path d="M33 42 L47 42" stroke="#ffffff" stroke-width="0.8"/>
					<text x="40" y="48" text-anchor="middle" font-size="4.5" font-weight="600" fill="#ffffff" font-family="system-ui">REG.</text>
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
		<div class="container section-intro">
			<div>
				<p class="eyebrow">What we do</p>
				<h2>Your DME fulfillment partner — from prescription to patient doorstep.</h2>
			</div>
			<p>
				Send us the prescription, we handle the rest. BG Clear fulfills orders, manages documentation, and bills Medicare, Medicaid, and private insurance directly — so your team stays focused on care, not claims.
			</p>
		</div>
	</section>

	<!-- COMBINED PRODUCTS & TRUSTED PARTNERS BENTO GRID -->
	<ProductsPartnersBento />

	<!-- CAPABILITIES / VALUE GRID (bento mosaic) -->
	<div id="capabilities">
		<BentoGrid />
	</div>

	<!-- WHO WE SERVE -->
	<section class="section">
		<div class="container">
			<p class="eyebrow">Who we serve</p>
			<h2>Built for the teams delivering care.</h2>
			<p class="subhead">From primary care to home health, we serve providers who need equipment they can count on.</p>
			<div class="provider-chips">
				<span class="provider-chip">Primary Care Clinics</span>
				<span class="provider-chip">Specialty Clinics</span>
				<span class="provider-chip">Hospitals &amp; Outpatient</span>
				<span class="provider-chip">Home Health Agencies</span>
				<span class="provider-chip">Long-Term Care</span>
				<span class="provider-chip">Pharmacies &amp; Retailers</span>
			</div>
		</div>
	</section>

	<!-- HOW WE WORK -->
	<section class="section" id="how-we-work">
		<div class="container">
			<p class="eyebrow">How we work</p>
			<h2>From inquiry to delivery — here's how it works.</h2>
			<div class="process-flow-container">
				<img class="process-flow-img" src={processWide} alt="Our 4-step process: Reach out, Confirm fit, Fulfillment, Ongoing support" loading="lazy" />
			</div>
			<div class="steps">
				<article class="step">
					<span class="capability-number">01</span>
					<h3>Reach out</h3>
					<p>Tell us what you need. Equipment type, quantity, timeline.</p>
				</article>
				<article class="step">
					<span class="capability-number">02</span>
					<h3>We confirm fit</h3>
					<p>We verify product availability, compliance requirements, and pricing.</p>
				</article>
				<article class="step">
					<span class="capability-number">03</span>
					<h3>Fast fulfillment</h3>
					<p>Your order ships. We handle logistics so you don't have to.</p>
				</article>
				<article class="step">
					<span class="capability-number">04</span>
					<h3>Ongoing support</h3>
					<p>Questions after delivery? We're here. Training, warranty, reorders — covered.</p>
				</article>
			</div>
		</div>
	</section>

	<!-- BLOG (placeholder) -->
	<section class="section section-alt" id="blog">
		<div class="container">
			<p class="eyebrow">Blog</p>
			<h2>Insights for DME providers.</h2>
			<!-- TODO: Automated blog generation for SEO — separate task -->
			<div class="grid-3">
				<article class="capability-card">
					<h3>Coming soon</h3>
					<p>Industry insights, compliance updates, and best practices for DME providers. Check back soon.</p>
				</article>
				<article class="capability-card">
					<h3>Coming soon</h3>
					<p>Tips for streamlining your DME ordering process and improving patient outcomes.</p>
				</article>
				<article class="capability-card">
					<h3>Coming soon</h3>
					<p>The latest in Medicare/Medicaid compliance and what it means for your practice.</p>
				</article>
			</div>
		</div>
	</section>

	<section class="section cta-band">
		<div class="container cta-inner">
			<div>
				<p class="eyebrow cta-eyebrow">Next step</p>
				<h2 class="cta-heading">Let's talk about what you need.</h2>
				<p class="subhead cta-subhead">
					Tell us about your practice and equipment requirements — we'll follow up with options and pricing.
				</p>
			</div>
			<a class="button button-light" href="#request-call">Contact a DME Specialist</a>
		</div>
	</section>

	<section class="section section-alt" id="faq">
		<div class="container">
			<p class="eyebrow">FAQ</p>
			<h2>Common questions from providers.</h2>
			<div class="faq-list">
				<article class="faq-item">
					<h3 class="faq-question">What geographic areas do you serve?</h3>
					<p class="faq-answer">We currently serve healthcare providers across the continental United States, with fulfillment partnerships that enable fast delivery to most locations within 2-5 business days.</p>
				</article>
				<article class="faq-item">
					<h3 class="faq-question">Do you work with insurance and Medicare/Medicaid?</h3>
					<p class="faq-answer">We sell directly to providers and healthcare organizations. Billing and reimbursement remain between your organization and payers—we provide the documentation you need for compliance.</p>
				</article>
				<article class="faq-item">
					<h3 class="faq-question">What's your minimum order size?</h3>
					<p class="faq-answer">We work with organizations of all sizes. Whether you need a single unit or ongoing inventory for multiple locations, we'll find the right arrangement for your needs.</p>
				</article>
				<article class="faq-item">
					<h3 class="faq-question">How do you ensure equipment quality and compliance?</h3>
					<p class="faq-answer">All equipment meets FDA requirements and CMS guidelines where applicable. We maintain documentation and can provide certificates of compliance for your records.</p>
				</article>
				<article class="faq-item">
					<h3 class="faq-question">Can you source equipment not listed on your site?</h3>
					<p class="faq-answer">Yes. If you have specific DME needs outside our core categories, reach out—we have supplier relationships that often allow us to source specialized equipment.</p>
				</article>
			</div>
		</div>
	</section>

	
	<section class="section" id="request-call">
		<div class="container request">
			<div class="request-intro">
				<p class="eyebrow">Get in touch</p>
				<h2>Tell us what you need.</h2>
				<p class="subhead">
					Share your equipment requirements and we'll reach out to discuss options and pricing.
				</p>
			</div>

			<form
				class="request-form"
				method="POST"
				action={env.PUBLIC_FORMSPREE_ENDPOINT || '#'}
				on:submit={handleSubmit}
				bind:this={formEl}
			>
				<div class="field-row">
					<label class="field">
						<span>Name</span>
						<input name="name" autocomplete="name" required />
					</label>
					<label class="field">
						<span>Organization</span>
						<input name="organization" autocomplete="organization" />
					</label>
				</div>

				<div class="field-row">
					<label class="field">
						<span>Email</span>
						<input type="email" name="email" autocomplete="email" required />
					</label>
					<label class="field">
						<span>Phone <span class="optional-label">(optional)</span></span>
						<input type="tel" name="phone" autocomplete="tel" />
					</label>
				</div>

				<label class="field">
					<span>What are you looking for?</span>
					<select name="inquiry_type" required>
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
					<textarea name="message" rows="4" placeholder="Equipment category, quantities, timeline, or any other details…" required></textarea>
				</label>

				<label class="field honeypot">
					<span>Don't fill this out</span>
					<input name="_gotcha" tabindex="-1" autocomplete="off" />
				</label>

				<input type="hidden" name="_subject" value="BG Clear — Request a call" />

				<div class="form-status" aria-live="polite" aria-atomic="true">
					{#if status === 'success'}
						<p class="form-success">
							Thanks — we got your request. We'll follow up shortly.
						</p>
					{:else if status === 'error'}
						<p class="form-error">
							{errorMessage}
						</p>
					{/if}
				</div>

				<button class="button button-primary" type="submit" disabled={status === 'submitting'}>
					{status === 'submitting' ? 'Sending…' : 'Contact a DME Specialist'}
				</button>
				<p class="form-footnote">No obligation • We respond within 4 business hours</p>
			</form>
		</div>
	</section>
<footer class="footer">
		<div class="container">
			<div class="footer-grid">
				<div class="footer-brand">
					<a href="/"><img class="header-logo" src={logo} alt="BG Clear" /></a>
					<p>Tech-forward DME distribution for modern healthcare providers. Fast, compliant, reliable.</p>
					<div class="footer-social">
						<!-- TODO: Replace # with real social media URLs when available -->
						<a href="#" aria-label="Facebook" class="footer-social-link">
							<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"/></svg>
						</a>
						<a href="#" aria-label="LinkedIn" class="footer-social-link">
							<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
						</a>
						<a href="#" aria-label="Instagram" class="footer-social-link">
							<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
						</a>
					</div>
				</div>
				<div>
					<h4 class="footer-heading">Company</h4>
					<ul class="footer-links">
						<li><a href="/about">About Us</a></li>
						<li><a href="#capabilities">Capabilities</a></li>
						<li><a href="#products">Products</a></li>
						<li><a href="#how-we-work">Process</a></li>
						<li><a href="#faq">FAQ</a></li>
					</ul>
				</div>
				<div>
					<h4 class="footer-heading">Contact</h4>
					<div class="footer-contact-item">
						<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
						</svg>
						<a href="tel:+12017657171">(201) 765-7171</a>
					</div>
					<div class="footer-contact-item">
						<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
						</svg>
						<a href="tel:+18664001710">(866) 400-1710</a>
					</div>
					<div class="footer-contact-item">
						<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
						</svg>
						<a href="mailto:customercare@bgclear.com">customercare@bgclear.com</a>
					</div>
					<div class="footer-contact-item">
						<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
							<path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
						</svg>
						<span>550 Sylvan Ave., Suite 202<br />Englewood Cliffs, NJ 07632</span>
					</div>
				</div>
				<div>
					<h4 class="footer-heading">Compliance</h4>
					<ul class="footer-links">
						<li><a href="#request-call">FDA/CMS Awareness</a></li>
						<li><a href="#request-call">Quality Assurance</a></li>
						<li><a href="#request-call">Documentation</a></li>
					</ul>
				</div>
			</div>
			<div class="footer-bottom">
				<span>&copy; {new Date().getFullYear()} BG Clear. All rights reserved.</span>
				<div class="footer-legal">
					<a href="#request-call">Privacy Policy</a>
					<a href="#request-call">Terms of Service</a>
				</div>
			</div>
		</div>
	</footer>
</main>
