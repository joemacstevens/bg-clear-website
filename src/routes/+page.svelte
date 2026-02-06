<script lang="ts">
	import { revealOnScroll } from '$lib/scrollReveal';
	import { env } from '$env/dynamic/public';
	import { onMount } from 'svelte';
	import logo from '$lib/assets/bg-clear-logo-640.png';
	import HeroVideo from '$lib/components/HeroVideo.svelte';
	import imgHealth from '$lib/assets/categories/jpg/health-monitoring.jpg';
	import imgMobility from '$lib/assets/categories/jpg/mobility-safety.jpg';
	import imgSpecialized from '$lib/assets/categories/jpg/specialized-support.jpg';

	type FormStatus = 'idle' | 'submitting' | 'success' | 'error';

	let scrolled = false;
	let heroPassed = false;

	onMount(() => {
		const heroEl = document.querySelector('.hero') as HTMLElement | null;
		let heroBottom = 0;

		const computeHeroBottom = () => {
			if (!heroEl) return;
			const rect = heroEl.getBoundingClientRect();
			// rect.top is viewport-relative; add scrollY to convert to document coords.
			heroBottom = window.scrollY + rect.top + rect.height;
		};

		computeHeroBottom();

		const handleScroll = () => {
			scrolled = window.scrollY > 20;
			// Hide the nav logo until we’ve scrolled past the hero.
			heroPassed = window.scrollY > heroBottom - 60;
		};

		window.addEventListener('scroll', handleScroll, { passive: true });
		window.addEventListener('resize', computeHeroBottom, { passive: true });
		handleScroll();

		return () => {
			window.removeEventListener('scroll', handleScroll);
			window.removeEventListener('resize', computeHeroBottom);
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
		gap: var(--space-3);
		margin-bottom: var(--space-3);
	}
	@media (max-width: 480px) {
		.brand-lockup {
			margin-bottom: var(--space-4);
		}
	}
	.brand-logo {
		height: 88px;
		width: auto;
		object-fit: contain;
		filter: drop-shadow(0 10px 24px rgba(0, 0, 0, 0.18));
	}
	@media (max-width: 480px) {
		.brand-logo {
			/* Make the hero logo more prominent on mobile */
			height: 140px;
			width: auto;
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
	.hero-content :global(p),
	.hero-content :global(.subhead),
	.hero-content :global(.eyebrow) {
		color: rgba(0, 43, 74, 0.82);
	}

	@media (max-width: 900px) {
		.hero-shell {
			min-height: 520px;
		}
	}
</style>

<svelte:head>
	<title>BG Clear — Tech-forward DME distribution</title>
	<meta
		name="description"
		content="Reliable, clinically effective DME distribution with fast fulfillment and trusted partnerships."
	/>
</svelte:head>

<!-- Navigation Header -->
<header class="site-header" class:scrolled>
	<div class="container header-inner">
		{#if heroPassed}
			<img class="header-logo" src={logo} alt="BG Clear" />
		{/if}
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
			<a class="button button-primary button-header" href="#request-call">Request a Call</a>
		</div>
	</div>
</header>

<main class="page">
	<section class="hero section">
		<div class="container">
			<div class="hero-shell">
				<HeroVideo />
				<div class="hero-content">
					<div class="brand-lockup" aria-label="BG Clear">
						<img class="brand-logo" src={logo} alt="BG Clear" />
					</div>
					<p class="eyebrow">Where Clear Innovation Meets Everyday Care</p>
					<h1>Tech-forward DME distribution, delivered reliably.</h1>
					<p class="subhead">
						Fast, compliant access to durable medical equipment for providers and care partners.
					</p>
					<a class="button button-primary" href="#request-call">Request a call</a>
				</div>
			</div>
		</div>
	</section>

	<section class="section">
		<div class="container section-intro">
			<div>
				<p class="eyebrow">What we do</p>
				<h2>Operational excellence for modern care teams.</h2>
			</div>
			<p>
				BG Clear delivers reliable, affordable, clinically effective equipment backed by fast
				fulfillment, logistics coordination, and partner-first support.
			</p>
		</div>
	</section>

	<section class="section" id="capabilities">
		<div class="container capabilities">
			<div class="sticky-intro">
				<p class="eyebrow">Capabilities</p>
				<h2>Built for providers who need speed and trust.</h2>
				<p>
					A calm, transparent approach to distribution that keeps clinics compliant, stocked, and
					ready for continuity of care.
				</p>
			</div>
			<div class="capability-list">
				<article class="capability-card cap-panel reveal" use:revealOnScroll>
					<div class="cap-visual cap-visual--compliance">
						<span class="cap-visual-label">Illustration coming soon</span>
					</div>
					<div class="cap-panel-body">
						<span class="capability-number">01</span>
						<h3>Compliance & integrity</h3>
						<p>FDA/CMS-aware processes with documentation you can trust. Every product we distribute meets regulatory requirements, so your team can focus on patient care — not paperwork.</p>
					</div>
				</article>
				<article class="capability-card cap-panel reveal" use:revealOnScroll>
					<div class="cap-visual cap-visual--fulfillment">
						<span class="cap-visual-label">Illustration coming soon</span>
					</div>
					<div class="cap-panel-body">
						<span class="capability-number">02</span>
						<h3>Fulfillment & logistics</h3>
						<p>Fast inventory coordination to reduce downtime and keep care on track. We manage sourcing, warehousing, and delivery so equipment arrives when and where your providers need it.</p>
					</div>
				</article>
				<article class="capability-card cap-panel reveal" use:revealOnScroll>
					<div class="cap-visual cap-visual--tech">
						<span class="cap-visual-label">Illustration coming soon</span>
					</div>
					<div class="cap-panel-body">
						<span class="capability-number">03</span>
						<h3>Tech-forward DME</h3>
						<p>Modern equipment selection with a roadmap for connected monitoring. From telehealth-enabled RPM devices to smart diagnostics, we're building the bridge between traditional DME and digital health.</p>
					</div>
				</article>
			</div>
		</div>
	</section>

	<section class="section">
		<div class="container">
			<p class="eyebrow">Who we serve</p>
			<h2>Partnering with care teams across the continuum.</h2>
			<p class="subhead">Built for provider workflows — from outpatient clinics to home-based care.</p>
			<div class="grid-2">
				<ul class="list">
					<li>Primary care clinics</li>
					<li>Specialty clinics (cardiology, pulmonology, endocrinology)</li>
					<li>Hospitals and outpatient centers</li>
				</ul>
				<ul class="list">
					<li>Home health agencies</li>
					<li>Assisted living & long-term care</li>
					<li>Pharmacies and medical supply retailers</li>
				</ul>
			</div>
		</div>
	</section>

	<section class="section section-alt" id="products">
		<div class="container">
			<p class="eyebrow">Products</p>
			<h2>Primary product categories.</h2>
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
			<h2>A simple workflow designed for speed and clarity.</h2>
			<div class="steps">
				<article class="step">
					<span class="capability-number">01</span>
					<h3>Provider inquiry</h3>
					<p>Tell us what you need, your volume, and your timelines.</p>
				</article>
				<article class="step">
					<span class="capability-number">02</span>
					<h3>Product fit & pricing</h3>
					<p>We confirm selection, compliance requirements, and contract pricing.</p>
				</article>
				<article class="step">
					<span class="capability-number">03</span>
					<h3>Fulfillment</h3>
					<p>Fast logistics coordination to reduce downtime and keep care on track.</p>
				</article>
				<article class="step">
					<span class="capability-number">04</span>
					<h3>Ongoing support</h3>
					<p>Provider account support, education, and after-sales assistance.</p>
				</article>
			</div>
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

	<section class="section cta-band">
		<div class="container cta-inner">
			<div>
				<p class="eyebrow cta-eyebrow">Next step</p>
				<h2 class="cta-heading">Ready to partner with BG Clear?</h2>
				<p class="subhead cta-subhead">
					Request a call — we'll confirm needs, timelines, and the right equipment mix.
				</p>
			</div>
			<a class="button button-light" href="#request-call">Request a call</a>
		</div>
	</section>

	
	<section class="section" id="request-call">
		<div class="container request">
			<div class="request-intro">
				<p class="eyebrow">Request a call</p>
				<h2>Tell us what you need — we’ll follow up quickly.</h2>
				<p class="subhead">
					Share the equipment category, timeline, and who we should coordinate with.
				</p>
				<p class="note">For urgent patient needs, call your standard clinical escalation path first.</p>
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
						<span>Phone</span>
						<input type="tel" name="phone" autocomplete="tel" />
					</label>
				</div>

				<label class="field">
					<span>Message</span>
					<textarea name="message" rows="5" placeholder="Equipment category, quantities, timeline, location(s), and any compliance constraints…" required></textarea>
				</label>

				<label class="field honeypot">
					<span>Don’t fill this out</span>
					<input name="_gotcha" tabindex="-1" autocomplete="off" />
				</label>

				<input type="hidden" name="_subject" value="BG Clear — Request a call" />

				<div class="form-status" aria-live="polite" aria-atomic="true">
					{#if status === 'success'}
						<p class="form-success">
							Thanks — we got your request. We’ll follow up shortly.
						</p>
					{:else if status === 'error'}
						<p class="form-error">
							{errorMessage}
						</p>
					{/if}
				</div>

				<button class="button button-primary" type="submit" disabled={status === 'submitting'}>
					{status === 'submitting' ? 'Sending…' : 'Send request'}
				</button>
				<p class="form-footnote">By submitting, you agree we can contact you about this request.</p>
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
