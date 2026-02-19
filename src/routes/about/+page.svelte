<script lang="ts">
	import logo from '$lib/assets/bg-clear-logo-640.png';
</script>

<svelte:head>
	<title>About Us — BG Clear LLC</title>
	<meta name="description" content="Learn about BG Clear LLC — a tech-forward DME/HME distribution and wholesale company serving healthcare providers nationwide." />
</svelte:head>

<!-- Navigation Header -->
<header class="site-header scrolled">
	<div class="container header-inner">
		<a href="/"><img class="header-logo" src={logo} alt="BG Clear" /></a>
		<nav class="header-nav">
			<a href="/about">About Us</a>
			<a href="/blog">Resources</a>
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

<main class="page">
	<!-- Hero -->
	<section class="about-hero">
		<div class="container">
			<p class="eyebrow" style="color: var(--color-gold-light);">About Us</p>
			<h1>Real People. Real Equipment. Real Results.</h1>
			<p class="about-hero-desc">
				BG Clear LLC is a tech-forward DME/HME distribution and wholesale company built for the providers who keep patients moving, breathing, and living independently.
			</p>
		</div>
	</section>

	<!-- Company Story -->
	<!-- TODO: Client copy needed — replace placeholder text with real company story from Gina/Evan -->
	<section class="section">
		<div class="container about-story">
			<div class="about-story-text">
				<p class="eyebrow">Our Story</p>
				<h2>Built from the ground up for modern healthcare.</h2>
				<p>
					BG Clear was founded with a clear mission: simplify how healthcare providers access durable medical equipment. Too many practices waste time navigating fragmented supply chains, unclear compliance requirements, and unresponsive suppliers.
				</p>
				<p>
					We set out to change that. By combining deep industry knowledge with a tech-forward approach, we built a distribution platform that puts providers first — with fast fulfillment, transparent documentation, and a team that actually picks up the phone.
				</p>
				<p>
					Based in Englewood Cliffs, New Jersey, we serve healthcare organizations across the continental United States — from primary care clinics to home health agencies and everything in between.
				</p>
			</div>
			<div class="about-story-visual">
				<!-- TODO: Replace with real company/team photo -->
				<div class="about-placeholder-img">
					<svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
						<path d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 0h.008v.008h-.008V7.5zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" stroke-linecap="round" stroke-linejoin="round"/>
					</svg>
					<span>Company Photo</span>
				</div>
			</div>
		</div>
	</section>

	<!-- Mission & Values -->
	<!-- TODO: Client copy needed — mission statement and values from Gina/Evan -->
	<section class="section section-alt">
		<div class="container">
			<div class="about-mission-header">
				<p class="eyebrow">Mission &amp; Values</p>
				<h2>What drives us every day.</h2>
			</div>
			<div class="values-grid">
				<article class="value-card">
					<div class="value-icon">
						<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
							<path d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" stroke-linecap="round" stroke-linejoin="round"/>
						</svg>
					</div>
					<h3>Compliance First</h3>
					<p>Every product we distribute meets FDA requirements and CMS guidelines. Documentation, PDAC coding, and audit readiness are built into our process — not bolted on.</p>
				</article>
				<article class="value-card">
					<div class="value-icon">
						<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
							<path d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" stroke-linecap="round" stroke-linejoin="round"/>
						</svg>
					</div>
					<h3>Speed That Matters</h3>
					<p>When a patient needs equipment, waiting isn't an option. Our fulfillment pipeline is built for speed — most orders ship within 24-48 hours of confirmation.</p>
				</article>
				<article class="value-card">
					<div class="value-icon">
						<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
							<path d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128H5.228A2 2 0 015 19.128m0 0a5.106 5.106 0 01-.786-3.07m0 0a9.36 9.36 0 01-1.689-.064m1.689.064L12 9.75m3.214 6.308A9.361 9.361 0 0012 15.75a9.36 9.36 0 00-3.214.308" stroke-linecap="round" stroke-linejoin="round"/>
						</svg>
					</div>
					<h3>Real People, Real Support</h3>
					<p>No phone trees, no bots, no runaround. When you call BG Clear, a real person answers — someone who knows your account and can help immediately.</p>
				</article>
				<article class="value-card">
					<div class="value-icon">
						<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
							<path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" stroke-linecap="round" stroke-linejoin="round"/>
						</svg>
					</div>
					<h3>Tech-Forward Approach</h3>
					<p>From telehealth-enabled RPM devices to digital documentation workflows, we invest in technology that makes your job easier and your patients' outcomes better.</p>
				</article>
			</div>
		</div>
	</section>

	<!-- Team -->
	<!-- TODO: Replace placeholders with real team photos and bios when available from Gina/Evan -->
	<section class="section">
		<div class="container">
			<p class="eyebrow">Our Team</p>
			<h2>The people behind BG Clear.</h2>
			<p class="subhead">A team with deep roots in healthcare logistics, compliance, and provider relationships.</p>
			<div class="team-grid">
				<div class="team-member">
					<div class="team-photo-placeholder">
						<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
							<path d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" stroke-linecap="round" stroke-linejoin="round"/>
						</svg>
					</div>
					<!-- TODO: Real name and title -->
					<h3 class="team-name">Team Member</h3>
					<p class="team-role">Leadership</p>
				</div>
				<div class="team-member">
					<div class="team-photo-placeholder">
						<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
							<path d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" stroke-linecap="round" stroke-linejoin="round"/>
						</svg>
					</div>
					<!-- TODO: Real name and title -->
					<h3 class="team-name">Team Member</h3>
					<p class="team-role">Operations</p>
				</div>
				<div class="team-member">
					<div class="team-photo-placeholder">
						<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
							<path d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" stroke-linecap="round" stroke-linejoin="round"/>
						</svg>
					</div>
					<!-- TODO: Real name and title -->
					<h3 class="team-name">Team Member</h3>
					<p class="team-role">Client Relations</p>
				</div>
				<div class="team-member">
					<div class="team-photo-placeholder">
						<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
							<path d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" stroke-linecap="round" stroke-linejoin="round"/>
						</svg>
					</div>
					<!-- TODO: Real name and title -->
					<h3 class="team-name">Team Member</h3>
					<p class="team-role">Compliance</p>
				</div>
			</div>
		</div>
	</section>

	<!-- CTA -->
	<section class="section cta-band">
		<div class="container cta-inner">
			<div>
				<p class="eyebrow cta-eyebrow">Work with us</p>
				<h2 class="cta-heading">Ready to streamline your DME supply chain?</h2>
				<p class="subhead cta-subhead">
					Tell us about your practice and equipment needs — we'll get back to you with options.
				</p>
			</div>
			<a class="button button-light" href="/#request-call">Contact a DME Specialist</a>
		</div>
	</section>
</main>

<style>
	.about-hero {
		padding-top: clamp(7rem, 12vw, 9rem);
		padding-bottom: var(--space-6);
		background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%);
		color: #ffffff;
	}
	.about-hero h1 {
		color: #ffffff;
		max-width: 700px;
	}
	.about-hero-desc {
		color: rgba(255, 255, 255, 0.78);
		max-width: 600px;
		font-size: clamp(1rem, 1.2vw, 1.125rem);
		margin-bottom: 0;
	}

	.about-story {
		display: grid;
		grid-template-columns: 1.2fr 1fr;
		gap: var(--space-6);
		align-items: center;
	}
	.about-story-text p:not(.eyebrow) {
		color: var(--color-text);
		line-height: 1.7;
	}

	.about-placeholder-img {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: var(--space-2);
		height: 360px;
		background: linear-gradient(135deg, #f0f4f8 0%, #e8eef5 100%);
		border-radius: var(--radius-lg);
		color: var(--color-muted);
		opacity: 0.6;
	}
	.about-placeholder-img span {
		font-size: var(--text-small);
		font-weight: 500;
	}

	.about-mission-header {
		margin-bottom: var(--space-5);
	}

	.values-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: var(--space-4);
	}
	.value-card {
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		padding: var(--space-4);
		transition: transform 240ms ease, box-shadow 240ms ease;
	}
	.value-card:hover {
		transform: translateY(-2px);
		box-shadow: var(--shadow-sm);
	}
	.value-icon {
		width: 48px;
		height: 48px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: color-mix(in srgb, var(--color-primary), #ffffff 90%);
		border-radius: 12px;
		color: var(--color-primary);
		margin-bottom: var(--space-2);
	}
	.value-card h3 {
		font-size: 1.125rem;
		margin-bottom: 0.5rem;
	}
	.value-card p {
		color: var(--color-muted);
		line-height: 1.65;
		margin-bottom: 0;
	}

	.team-grid {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: var(--space-4);
		margin-top: var(--space-4);
	}
	.team-member {
		text-align: center;
	}
	.team-photo-placeholder {
		width: 140px;
		height: 140px;
		border-radius: 50%;
		background: linear-gradient(135deg, #f0f4f8 0%, #e2e8f0 100%);
		display: flex;
		align-items: center;
		justify-content: center;
		margin: 0 auto var(--space-2);
		color: var(--color-muted);
		opacity: 0.5;
	}
	.team-name {
		font-size: 1rem;
		margin-bottom: 0.25rem;
	}
	.team-role {
		color: var(--color-muted);
		font-size: var(--text-small);
		margin: 0;
	}

	@media (max-width: 960px) {
		.about-story {
			grid-template-columns: 1fr;
		}
		.values-grid {
			grid-template-columns: 1fr;
		}
		.team-grid {
			grid-template-columns: repeat(2, 1fr);
		}
	}
	@media (max-width: 480px) {
		.team-grid {
			grid-template-columns: 1fr 1fr;
			gap: var(--space-3);
		}
	}
</style>
