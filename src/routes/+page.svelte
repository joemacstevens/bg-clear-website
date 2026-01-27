<script lang="ts">
	import { revealOnScroll } from '$lib/scrollReveal';
	import { env } from '$env/dynamic/public';

	type FormStatus = 'idle' | 'submitting' | 'success' | 'error';

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

<svelte:head>
	<title>BG Clear — Tech-forward DME distribution</title>
	<meta
		name="description"
		content="Reliable, clinically effective DME distribution with fast fulfillment and trusted partnerships."
	/>
</svelte:head>

<main class="page">
	<section class="hero section">
		<div class="container">
			<div class="hero-content">
				<p class="eyebrow">BG Clear</p>
				<h1>Tech-forward DME distribution, delivered reliably.</h1>
				<p class="subhead">
					Fast, compliant access to durable medical equipment for providers and care partners.
				</p>
				<a class="button button-primary" href="#request-call">Request a call</a>
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

	<section class="section">
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
				<article class="capability-card reveal" use:revealOnScroll>
					<span class="capability-number">01</span>
					<h3>Compliance & integrity</h3>
					<p>FDA/CMS-aware processes with documentation you can trust.</p>
				</article>
				<article class="capability-card reveal" use:revealOnScroll>
					<span class="capability-number">02</span>
					<h3>Fulfillment & logistics</h3>
					<p>Fast inventory coordination to reduce downtime and keep care on track.</p>
				</article>
				<article class="capability-card reveal" use:revealOnScroll>
					<span class="capability-number">03</span>
					<h3>Tech-forward DME</h3>
					<p>Modern equipment selection with a roadmap for connected monitoring.</p>
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

	<section class="section">
		<div class="container">
			<p class="eyebrow">Products</p>
			<h2>Core categories for chronic care and everyday equipment needs.</h2>
			<div class="grid-3">
				<article class="capability-card">
					<span class="capability-number">A</span>
					<h3>Health monitoring & management</h3>
					<ul class="list">
						<li>Blood pressure monitors</li>
						<li>Glucometers & diabetes tools</li>
						<li>Pulse oximeters</li>
						<li>RPM-ready devices</li>
					</ul>
				</article>
				<article class="capability-card">
					<span class="capability-number">B</span>
					<h3>Mobility & safety</h3>
					<ul class="list">
						<li>Walkers, wheelchairs, canes</li>
						<li>Bathroom safety products</li>
						<li>Patient lifts & slings</li>
						<li>Fall prevention devices</li>
					</ul>
				</article>
				<article class="capability-card">
					<span class="capability-number">C</span>
					<h3>Specialized support</h3>
					<ul class="list">
						<li>CPAP/BiPAP & respiratory therapy</li>
						<li>Nebulizers</li>
						<li>Hospital beds & support surfaces</li>
						<li>Compression therapy</li>
					</ul>
				</article>
			</div>
		</div>
	</section>

	<section class="section">
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

	<section class="section cta-band">
		<div class="container cta-inner">
			<div>
				<p class="eyebrow">Next step</p>
				<h2>Ready to partner with BG Clear?</h2>
				<p class="subhead">
					Request a call — we’ll confirm needs, timelines, and the right equipment mix.
				</p>
			</div>
			<a class="button button-primary" href="#request-call">Request a call</a>
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
		<div class="container footer-content">
			<span>BG Clear — tech-forward DME distribution.</span>
			<span>Footer placeholder for navigation, contact, and compliance details.</span>
		</div>
	</footer>
</main>
