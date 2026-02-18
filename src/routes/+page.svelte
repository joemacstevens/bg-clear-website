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
	import heroWide from '$lib/assets/visuals/hero-wide-photo-wheelchair-v2-productforward.jpg';
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

	/* Hero enhancements */
	.hero {
		padding-top: clamp(7rem, 14vw, 10rem);
	}
	.hero h1 {
		font-weight: 700;
		letter-spacing: -0.025em;
	}

	.hero-shell {
		position: relative;
		border-radius: 24px;
		overflow: hidden;
		padding: clamp(2.25rem, 4vw, 3.25rem);
		min-height: 520px;
		display: grid;
		align-items: center;
		/* lift overall luminance so the background doesn't feel crushed */
		background: radial-gradient(900px 520px at 22% 22%, rgba(0, 56, 94, 0.55) 0%, rgba(0, 43, 74, 0.78) 58%, rgba(10, 32, 50, 1) 100%);
	}

	.hero-shell :global(.hero-media) {
		/* background layer */
		position: absolute;
		inset: 0;
	}

	.hero-content {
		position: relative;
		z-index: 1;
		max-width: 680px;
		color: #002B4A;
		text-shadow: 0 10px 28px rgba(255, 255, 255, 0.35);
	}
	.hero-content :global(h1) {
		color: #002B4A;
	}

	.hero-ctas {
		margin-top: var(--space-4);
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-3);
	}
	.button-secondary {
		background: rgba(255, 255, 255, 0.9);
		color: var(--color-primary);
		border: 1px solid rgba(0, 43, 74, 0.18);
	}
	.button-secondary:hover {
		background: #ffffff;
	}
	.hero-content :global(p),
	.hero-content :global(.subhead),
	.hero-content :global(.eyebrow) {
		color: rgba(0, 43, 74, 0.82);
	}

	/* Hero trust note */
	.hero-trust-note {
		font-size: var(--text-small);
		color: rgba(0, 43, 74, 0.7);
		margin-top: var(--space-2);
		margin-bottom: 0;
		text-shadow: none;
	}

	/* New wide hero with background image */
	.hero-shell--wide {
		position: relative;
		border-radius: 0;
		overflow: hidden;
		min-height: 520px;
		display: grid;
		align-items: center;
		background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
		margin-left: calc(-50vw + 50%);
		margin-right: calc(-50vw + 50%);
		width: 100vw;
	}
	.hero-bg-img {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		object-fit: cover;
		/* Keep the key subject (wheelchair) visible on wide screens */
		object-position: 94% center;
	}
	.hero-shell--wide .hero-content {
		position: relative;
		z-index: 1;
		/* Keep copy left so it doesn't block the product image, but avoid getting too narrow */
		max-width: clamp(640px, 46vw, 860px);
		margin-left: clamp(2.25rem, 4vw, 5rem);
		margin-right: auto;
		/* Reduce side padding a touch so the usable text area stays wide */
		padding: clamp(1.5rem, 2.6vw, 2.75rem);
		color: var(--color-ink);
		text-shadow: none;
		background: rgba(255, 255, 255, 0.92);
		border-radius: var(--radius-lg);
		box-shadow: 0 24px 60px rgba(15, 23, 42, 0.12);
		backdrop-filter: blur(6px);
	}
	.hero-shell--wide .hero-content h1 {
		color: var(--color-ink);
	}
	.hero-shell--wide .hero-content p,
	.hero-shell--wide .hero-content .subhead,
	.hero-shell--wide .hero-content .eyebrow {
		color: var(--color-text);
	}
	/* Tablet / small desktop: keep the card comfortably wide */
	@media (min-width: 901px) and (max-width: 1200px) {
		.hero-shell--wide .hero-content {
			max-width: min(760px, calc(100% - 3rem));
			margin-left: clamp(2rem, 3vw, 3.25rem);
			margin-right: auto;
		}
		.hero-bg-img {
			object-position: 90% center;
		}
	}

	@media (max-width: 900px) {
		/* Option A mobile hero: full-bleed image first, copy below */
		.hero {
			padding-top: 5rem;
			padding-bottom: 0;
		}
		/* Kill container side padding inside hero so the hero can truly go edge-to-edge */
		.hero > .container {
			max-width: none !important;
			padding-left: 0 !important;
			padding-right: 0 !important;
		}
		.hero-shell--wide {
			width: 100% !important;
			margin: 0 !important;
			border-radius: 0;
			min-height: auto;
			display: block;
			background: transparent;
		}
		.hero-bg-img {
			position: relative;
			inset: auto;
			display: block;
			width: 100%;
			height: 44vh;
			min-height: 260px;
			max-height: 420px;
			object-position: 85% 50%;
		}
		.hero-shell--wide .hero-content {
			max-width: 760px;
			margin: 0 auto;
			padding: var(--space-3) var(--space-3);
			padding-top: 0;
			background: rgba(255, 255, 255, 0.98);
			border-radius: 0;
			box-shadow: none;
			backdrop-filter: none;
		}
		.hero-shell--wide .hero-content h1 {
			font-size: clamp(2rem, 6.4vw, 2.6rem);
			line-height: 1.1;
		}
		.hero-shell--wide .hero-content .subhead {
			font-size: 1rem;
			margin-bottom: var(--space-3);
		}
		/* Pull logo-arc up so it overlaps the hero image bottom edge */
		.brand-lockup {
			margin-top: -120px;
			margin-bottom: 0.25rem;
			position: relative;
			z-index: 2;
		}
		.logo-arc-wrap {
			width: 260px;
			height: 260px;
			background: radial-gradient(circle, rgba(255,255,255,0.95) 40%, rgba(255,255,255,0.7) 65%, transparent 72%);
			border-radius: 50%;
		}
		.brand-logo {
			height: 140px;
		}
		.arc-text {
			font-size: 12px;
		}
	}

	@media (max-width: 900px) {
		.hero-shell {
			min-height: 520px;
		}
	}

	/* Provider grid */
	.provider-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: var(--space-4);
		margin-top: var(--space-4);
	}
	.provider-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
		gap: var(--space-2);
		padding: var(--space-3);
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		transition: transform 240ms ease, box-shadow 240ms ease, border-color 240ms ease;
	}
	.provider-item:hover {
		transform: translateY(-2px);
		box-shadow: var(--shadow-sm);
		border-color: color-mix(in srgb, var(--color-accent), transparent 70%);
	}
	.provider-icon {
		width: 72px;
		height: 72px;
		object-fit: contain;
	}
	.provider-item span {
		font-size: var(--text-small);
		font-weight: 500;
		color: var(--color-ink);
	}
	@media (max-width: 768px) {
		.provider-grid {
			grid-template-columns: repeat(2, 1fr);
		}
	}
	@media (max-width: 480px) {
		.provider-grid {
			grid-template-columns: 1fr 1fr;
			gap: var(--space-3);
		}
		.provider-icon {
			width: 56px;
			height: 56px;
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
	<section class="hero section">
		<div class="container">
			<div class="hero-shell hero-shell--wide">
				<img class="hero-bg-img" src={heroWide} alt="" />
				<div class="hero-content">
					<p class="eyebrow">A Tech-Forward DME &amp; HME Distribution and Wholesale Company</p>
					<h1>Real People Who Answer the Phone</h1>
					<p class="subhead">
						Fast, compliant DME access for providers and care partners.
					</p>
					<div class="hero-ctas">
						<a class="button button-primary" href="#request-call">Contact a DME Specialist</a>
						<a class="button button-secondary" href="#products">View Product Categories</a>
					</div>
					<p class="hero-trust-note">No obligation • Most inquiries answered within 4 hours</p>
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

	<!-- WHO WE SERVE -->
	<section class="section">
		<div class="container">
			<p class="eyebrow">Who we serve</p>
			<h2>Built for the teams delivering care.</h2>
			<p class="subhead">From primary care to home health, we serve providers who need equipment they can count on.</p>
			<div class="provider-grid">
				<div class="provider-item">
					<img class="provider-icon" src={iconPrimaryCare} alt="" loading="lazy" />
					<span>Primary care clinics</span>
				</div>
				<div class="provider-item">
					<img class="provider-icon" src={iconSpecialty} alt="" loading="lazy" />
					<span>Specialty clinics</span>
				</div>
				<div class="provider-item">
					<img class="provider-icon" src={iconHospital} alt="" loading="lazy" />
					<span>Hospitals & outpatient</span>
				</div>
				<div class="provider-item">
					<img class="provider-icon" src={iconHomeHealth} alt="" loading="lazy" />
					<span>Home health agencies</span>
				</div>
				<div class="provider-item">
					<img class="provider-icon" src={iconLongTermCare} alt="" loading="lazy" />
					<span>Long-term care</span>
				</div>
				<div class="provider-item">
					<img class="provider-icon" src={iconPharmacy} alt="" loading="lazy" />
					<span>Pharmacies & retailers</span>
				</div>
			</div>
		</div>
	</section>

	<!-- COMBINED PRODUCTS & TRUSTED PARTNERS BENTO GRID -->
	<ProductsPartnersBento />

	<!-- CAPABILITIES / VALUE GRID (bento mosaic) -->
	<div id="capabilities">
		<BentoGrid />
	</div>

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
