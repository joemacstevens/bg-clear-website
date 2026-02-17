<script lang="ts">
	import { revealOnScroll } from '$lib/scrollReveal';
	import { env } from '$env/dynamic/public';
	import { onMount } from 'svelte';
	import logo from '$lib/assets/bg-clear-logo-640.png';
	import HeroVideo from '$lib/components/HeroVideo.svelte';
	import imgHealth from '$lib/assets/visuals/product-health-monitoring.jpg';
	import imgMobility from '$lib/assets/visuals/product-mobility-safety.jpg';
	import imgSpecialized from '$lib/assets/visuals/product-specialized-support.jpg';

	// New visual assets
	import capCompliance from '$lib/assets/visuals/cap-compliance.png';
	import capFulfillment from '$lib/assets/visuals/cap-fulfillment.png';
	import capTech from '$lib/assets/visuals/cap-tech.png';
	import processWide from '$lib/assets/visuals/process-wide.png';
	import heroWide from '$lib/assets/visuals/hero-wide-photo-wheelchair-v2-productforward.jpg';
	import capStackCompliance from '$lib/assets/visuals/cap-stack-compliance-2-macro.jpg';
	import capStackFulfillment from '$lib/assets/visuals/cap-stack-fulfillment-3-macro.jpg';
	import capStackSupport from '$lib/assets/visuals/cap-stack-support-4-macro.jpg';
	import iconPrimaryCare from '$lib/assets/visuals/icon-primary-care.png';
	import iconSpecialty from '$lib/assets/visuals/icon-specialty.png';
	import iconHospital from '$lib/assets/visuals/icon-hospital.png';
	import iconHomeHealth from '$lib/assets/visuals/icon-home-health.png';
	import iconLongTermCare from '$lib/assets/visuals/icon-long-term-care.png';
	import iconPharmacy from '$lib/assets/visuals/icon-pharmacy.png';

	// Partner logos
	import logoMckesson from '$lib/assets/partners/mckesson.svg';
	import logoDrive from '$lib/assets/partners/drive-medical.svg';
	import logoPride from '$lib/assets/partners/pride-mobility.png';
	import logoInvacare from '$lib/assets/partners/invacare.svg';
	import logoMedline from '$lib/assets/partners/medline.svg';

	type FormStatus = 'idle' | 'submitting' | 'success' | 'error';

	let scrolled = false;

	onMount(() => {
		const handleScroll = () => {
			scrolled = window.scrollY > 20;
		};

		window.addEventListener('scroll', handleScroll, { passive: true });
		handleScroll();

		return () => {
			window.removeEventListener('scroll', handleScroll);
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
	}

	@media (max-width: 900px) {
		.hero-shell {
			min-height: 520px;
		}
	}

	/* Capability visual images */
	.cap-visual-img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		position: absolute;
		inset: 0;
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

	/* Capabilities sticky stack (premium full-bleed tiles) */
	.cap-stack-wrap {
		margin-top: var(--space-6);
	}

	/* Separator between "What we do" and Capabilities stack */
	.section-capabilities {
		position: relative;
		padding-top: calc(var(--section-padding) * 0.65);
	}
	.section-capabilities::before {
		content: '';
		position: absolute;
		left: 50%;
		top: 0;
		transform: translateX(-50%);
		width: min(1240px, calc(100% - 3rem));
		height: 1px;
		background: color-mix(in srgb, var(--color-border), transparent 20%);
	}
	.cap-stack-intro {
		padding: 0 0 var(--space-5);
	}

	.cap-stack {
		/* Full-bleed inside a container page */
		margin-left: calc(-50vw + 50%);
		margin-right: calc(-50vw + 50%);
		width: 100vw;
		/* Create enough scroll room for sticky stacking */
		padding-bottom: var(--space-6);
	}

	.cap-stack-item {
		position: sticky;
		/* Account for the fixed header */
		top: 92px;
		min-height: calc(100vh - 92px);
		display: flex;
		align-items: flex-end;
		justify-content: stretch;
		isolation: isolate;
		z-index: var(--cap-z, 1);
		border-radius: 0;
		overflow: hidden;
		background: #0b1220;
	}

	.cap-stack-item + .cap-stack-item {
		/* Less separation = quicker, more dynamic transitions */
		margin-top: 4vh;
	}

	.cap-stack-bg {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		object-fit: cover;
		/* Avoid awkward cropping: allow per-tile focal point overrides */
		object-position: var(--cap-pos, 50% 35%);
		z-index: -2;
	}

	.cap-stack-overlay {
		position: absolute;
		inset: 0;
		z-index: -1;
		/* Keep it clean: the text card already has its own background */
		background: linear-gradient(180deg, rgba(11,18,32,0.06) 0%, rgba(11,18,32,0.14) 100%);
	}

	.cap-stack-inner {
		width: 100%;
		padding-bottom: var(--space-6);
	}

	.cap-stack-card {
		max-width: clamp(560px, 44vw, 760px);
		padding: clamp(1.75rem, 3vw, 3rem);
		background: rgba(255, 255, 255, 0.92);
		border: 1px solid rgba(0, 43, 74, 0.12);
		border-radius: var(--radius-lg);
		box-shadow: 0 24px 60px rgba(15, 23, 42, 0.12);
		backdrop-filter: blur(6px);
	}

	.cap-stack-card h3 {
		font-size: clamp(1.4rem, 2.4vw, 2rem);
		margin: 0 0 var(--space-2);
	}

	.cap-stack-card .subhead {
		margin: 0;
		max-width: 60ch;
	}

	@media (max-width: 900px) {
		.cap-stack-item {
			top: 76px;
			min-height: calc(100vh - 76px);
		}
		.cap-stack-overlay {
			background: linear-gradient(180deg, rgba(11,18,32,0.04) 0%, rgba(11,18,32,0.12) 100%);
		}
		.cap-stack-card {
			max-width: min(760px, 100%);
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
		<img class="header-logo is-visible" src={logo} alt="BG Clear" />
		<nav class="header-nav">
			<a href="#capabilities">Capabilities</a>
			<a href="#products">Products</a>
			<a href="#how-we-work">Process</a>
			<a href="#faq">FAQ</a>
		</nav>
		<div class="header-cta">
			<a class="header-phone" href="tel:+18005551234">
				<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
				</svg>
				<span>(201) 765-7171</span>
			</a>
			<a class="button button-primary button-header" href="#request-call">Talk to a Specialist</a>
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
						<a class="button button-primary" href="#request-call">Talk to a DME Specialist</a>
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

	<section class="partner-logos">
		<div class="container">
			<p class="partner-logos-label">Trusted manufacturers &amp; distributors we work with</p>
			<div class="partner-logos-strip">
				<img src={logoMckesson} alt="McKesson" class="partner-logo" />
				<img src={logoDrive} alt="Drive Medical" class="partner-logo" />
				<img src={logoMedline} alt="Medline" class="partner-logo" />
				<img src={logoInvacare} alt="Invacare" class="partner-logo" />
				<img src={logoPride} alt="Pride Mobility" class="partner-logo" />
			</div>
		</div>
	</section>

	<section class="section section-capabilities" id="capabilities">
		<div class="cap-stack-wrap">
			<div class="cap-stack-intro">
				<div class="container">
					<p class="eyebrow">Why BG Clear</p>
					<h2>Why BG Clear — built for compliance, speed, and real support.</h2>
					<p>
						Scroll to see what makes us different: compliance-first processes, reliable fulfillment, and specialists who actually answer.
					</p>
				</div>
			</div>

			<div class="cap-stack">
				<!-- z-index increases as you scroll so the next card can cover the previous -->
				<section class="cap-stack-item" style="--cap-z: 1; --cap-pos: 50% 40%">
					<img class="cap-stack-bg" src={capStackCompliance} alt="" loading="lazy" />
					<div class="cap-stack-overlay" aria-hidden="true"></div>
					<div class="container cap-stack-inner">
						<div class="cap-stack-card">
							<p class="eyebrow">Compliance</p>
							<h3>Compliant by default.</h3>
							<p class="subhead">Documentation, sourcing standards, and process rigor that keeps your team moving fast without cutting corners.</p>
						</div>
					</div>
				</section>

				<section class="cap-stack-item" style="--cap-z: 2; --cap-pos: 68% 18%">
					<img class="cap-stack-bg" src={capStackFulfillment} alt="" loading="lazy" />
					<div class="cap-stack-overlay" aria-hidden="true"></div>
					<div class="container cap-stack-inner">
						<div class="cap-stack-card">
							<p class="eyebrow">Fulfillment</p>
							<h3>Fast, reliable distribution.</h3>
							<p class="subhead">Consistent inventory, clean logistics, and dependable turnaround so your patients get what they need without delays.</p>
						</div>
					</div>
				</section>

				<section class="cap-stack-item" style="--cap-z: 3; --cap-pos: 50% 32%">
					<img class="cap-stack-bg" src={capStackSupport} alt="" loading="lazy" />
					<div class="cap-stack-overlay" aria-hidden="true"></div>
					<div class="container cap-stack-inner">
						<div class="cap-stack-card">
							<p class="eyebrow">Support</p>
							<h3>Real people when you call.</h3>
							<p class="subhead">Dedicated specialists who answer the phone, troubleshoot fast, and make sure the equipment fits the workflow.</p>
						</div>
					</div>
				</section>
			</div>
		</div>
	</section>

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

	<section class="section section-alt" id="products">
		<div class="container">
			<p class="eyebrow">Products</p>
			<h2>Equipment for chronic care, mobility, and specialized support.</h2>
			<p class="subhead">
				FDA/CMS-compliant equipment across core DME categories, ready for provider workflows.
			</p>
			<div class="grid-3">
				<article class="capability-card product-card">
					<div class="product-card-img">
						<img src={imgHealth} alt="Health monitoring devices including blood pressure monitor, glucometer, pulse oximeter, and thermometer" loading="lazy" />
					</div>
					<div class="product-card-body">
						<h3>Health monitoring &amp; management</h3>
						<ul class="list">
							<li>Blood pressure monitors (digital &amp; manual)</li>
							<li>Glucometers &amp; diabetes management tools</li>
							<li>Pulse oximeters</li>
							<li>Telehealth-enabled RPM devices</li>
							<li>Thermometers (infrared &amp; digital)</li>
						</ul>
					</div>
				</article>
				<article class="capability-card product-card">
					<div class="product-card-img">
						<img src={imgMobility} alt="Mobility equipment including walker, wheelchair, shower chair, and grab bars" loading="lazy" />
					</div>
					<div class="product-card-body">
						<h3>Mobility &amp; safety equipment</h3>
						<ul class="list">
							<li>Walkers (standard &amp; rollators)</li>
							<li>Wheelchairs (manual &amp; transport)</li>
							<li>Canes &amp; crutches</li>
							<li>Patient lifts &amp; slings</li>
							<li>Bathroom safety (grab bars, shower chairs)</li>
							<li>Fall prevention devices</li>
						</ul>
					</div>
				</article>
				<article class="capability-card product-card">
					<div class="product-card-img">
						<img src={imgSpecialized} alt="Specialized medical equipment including CPAP machine, nebulizer, hospital bed, and wound care device" loading="lazy" />
					</div>
					<div class="product-card-body">
						<h3>Specialized medical support</h3>
						<ul class="list">
							<li>Nebulizers &amp; respiratory therapy</li>
							<li>Sleep apnea equipment (CPAP/BiPAP)</li>
							<li>Hospital beds &amp; support surfaces</li>
							<li>Wound care devices</li>
							<li>Compression therapy equipment</li>
						</ul>
					</div>
				</article>
			</div>
		</div>
	</section>

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

	<section class="section cta-band">
		<div class="container cta-inner">
			<div>
				<p class="eyebrow cta-eyebrow">Next step</p>
				<h2 class="cta-heading">Let's talk about what you need.</h2>
				<p class="subhead cta-subhead">
					Tell us about your practice and equipment requirements — we'll follow up with options and pricing.
				</p>
			</div>
			<a class="button button-light" href="#request-call">Talk to a DME Specialist</a>
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
					{status === 'submitting' ? 'Sending…' : 'Talk to a DME Specialist'}
				</button>
				<p class="form-footnote">No obligation • We respond within 4 business hours</p>
			</form>
		</div>
	</section>
<footer class="footer">
		<div class="container">
			<div class="footer-grid">
				<div class="footer-brand">
					<img class="header-logo" src={logo} alt="BG Clear" />
					<p>Tech-forward DME distribution for modern healthcare providers. Fast, compliant, reliable.</p>
				</div>
				<div>
					<h4 class="footer-heading">Company</h4>
					<ul class="footer-links">
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
