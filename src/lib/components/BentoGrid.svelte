<script lang="ts">
	import { onMount, tick } from 'svelte';
	import { revealOnScroll } from '$lib/scrollReveal';

	interface ClaimTile {
		id: string;
		label: string;
		subtitle: string;
		description: string;
		cta: string;
		ctaHref: string;
		bg: 'navy' | 'gold';
		colSpan: number;
		rowSpan: number;
	}

	interface PhotoTile {
		id: string;
		type: 'photo';
		alt: string;
		color: string;
		colSpan: number;
		rowSpan: number;
	}

	interface ColorTile {
		id: string;
		type: 'color';
		bg: 'navy' | 'gold';
		colSpan: number;
		rowSpan: number;
	}

	const claims: ClaimTile[] = [
		{
			id: 'compliance',
			label: 'Compliance-First',
			subtitle: 'PDAC Approved',
			description:
				'Every product we distribute is PDAC-verified and backed by rigorous documentation standards. We handle the compliance burden so your team can focus on patient care — not paperwork.',
			cta: 'Contact Us',
			ctaHref: '#request-call',
			bg: 'navy',
			colSpan: 2,
			rowSpan: 1
		},
		{
			id: 'fulfillment',
			label: 'Fast Fulfillment',
			subtitle: 'Consistent & dependable',
			description:
				'Consistent inventory, clean logistics, and dependable turnaround. We keep your supply chain moving so patients get what they need without delays or backorders.',
			cta: 'Contact Us',
			ctaHref: '#request-call',
			bg: 'gold',
			colSpan: 1,
			rowSpan: 1
		},
		{
			id: 'people',
			label: 'Real People',
			subtitle: 'Who answer the phone',
			description:
				'Dedicated specialists who pick up the phone, troubleshoot fast, and make sure every order fits your workflow. No bots, no hold music, no runaround.',
			cta: 'Contact Us',
			ctaHref: '#request-call',
			bg: 'navy',
			colSpan: 1,
			rowSpan: 1
		}
	];

	type Tile =
		| (ClaimTile & { type?: undefined })
		| PhotoTile
		| ColorTile;

	const tiles: Tile[] = [
		claims[0],
		{ id: 'photo-warehouse', type: 'photo', alt: 'DME specialist reviewing compliance documentation', color: '#3a5a7f', colSpan: 1, rowSpan: 1 },
		claims[1],
		{ id: 'color-gold', type: 'color', bg: 'gold', colSpan: 1, rowSpan: 2 },
		claims[2],
		{ id: 'photo-team', type: 'photo', alt: 'BG Clear team photo', color: '#2a4a6f', colSpan: 2, rowSpan: 1 },
	];

	const photoSources: Record<string, string> = {
		'photo-warehouse': '/generated-photos/compliance-review.png',
		'photo-team': '/generated-photos/team.png',
	};

	const claimBackgrounds: Record<string, string> = {
		compliance: '/generated-photos/compliance.png',
		fulfillment: '/generated-photos/fulfillment.png',
		people: '/generated-photos/support-person.png',
	};

	let expandedId: string | null = $state(null);
	let gridEl: HTMLElement | null = $state(null);
	let detailPanelEl: HTMLElement | null = $state(null);

	function detailIdFor(id: string) {
		return `bento-detail-${id}`;
	}

	async function toggleClaim(id: string) {
		expandedId = expandedId === id ? null : id;
		if (expandedId === id) {
			await tick();
			detailPanelEl?.focus();
		}
	}

	function handleKeydown(e: KeyboardEvent, id: string) {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			toggleClaim(id);
		}
	}

	function handleClickOutside(e: MouseEvent) {
		if (expandedId && gridEl && !gridEl.contains(e.target as Node)) {
			expandedId = null;
		}
	}

	onMount(() => {
		document.addEventListener('click', handleClickOutside);
		return () => document.removeEventListener('click', handleClickOutside);
	});

	function getClaimById(id: string): ClaimTile | undefined {
		return claims.find((c) => c.id === id);
	}
</script>

<section class="bento-section" id="why-bg-clear">
	<div class="bento-header">
		<p class="bento-eyebrow">Why BG Clear</p>
		<h2 class="bento-heading">Built for compliance, speed, and real support.</h2>
	</div>

	<div class="bento-grid" bind:this={gridEl} role="list">
		{#each tiles as tile, index (tile.id)}
			{@const isClaim = !tile.type}
			{@const isExpanded = expandedId === tile.id}

			<svelte:element
				this={isClaim ? 'button' : 'div'}
				type={isClaim ? 'button' : undefined}
				class="bento-tile reveal bento-tile-reveal"
				use:revealOnScroll
				style={`--tile-delay: ${index * 100}ms;`}
				class:bento-tile--claim={isClaim}
				class:bento-tile--has-bg={isClaim && claimBackgrounds[tile.id]}
				class:bento-tile--photo={tile.type === 'photo'}
				class:bento-tile--color={tile.type === 'color'}
				class:bento-tile--navy={isClaim ? (tile as ClaimTile).bg === 'navy' : tile.type === 'color' && (tile as ColorTile).bg === 'navy'}
				class:bento-tile--gold={isClaim ? (tile as ClaimTile).bg === 'gold' : tile.type === 'color' && (tile as ColorTile).bg === 'gold'}
				class:bento-tile--expanded={isExpanded}
				class:bento-tile--col2={tile.colSpan === 2}
				class:bento-tile--row2={tile.rowSpan === 2}
				role={isClaim ? 'listitem' : 'presentation'}
				onclick={isClaim ? () => toggleClaim(tile.id) : undefined}
				onkeydown={isClaim ? (e: KeyboardEvent) => handleKeydown(e, tile.id) : undefined}
				aria-expanded={isClaim ? isExpanded : undefined}
				aria-controls={isClaim ? detailIdFor(tile.id) : undefined}
			>
				{#if isClaim}
					{@const claim = tile as ClaimTile}
					{#if claimBackgrounds[tile.id]}
						<img class="bento-tile__bg-img" src={claimBackgrounds[tile.id]} alt="" loading="lazy" />
						<div class="bento-tile__bg-overlay"></div>
					{/if}
					<span class="bento-tile__subtitle">{claim.subtitle}</span>
					<h3 class="bento-tile__label">{claim.label}</h3>
					<svg class="bento-tile__arrow" class:bento-tile__arrow--open={isExpanded} width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
						<path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
					</svg>
				{:else if tile.type === 'color'}
				<div class="bento-tile__cross-icon">
					<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
						<rect x="35" y="10" width="30" height="80" rx="4" fill="#0d2239" />
						<rect x="10" y="35" width="80" height="30" rx="4" fill="#0d2239" />
					</svg>
				</div>
			{:else if tile.type === 'photo'}
					<div class="bento-tile__photo">
						<img
							class="bento-tile__photo-img"
							src={photoSources[tile.id]}
							alt={(tile as PhotoTile).alt}
							loading="lazy"
						/>
					</div>
				{/if}
			</svelte:element>

			{#if isClaim && isExpanded}
				{@const claim = getClaimById(tile.id)}
				<div
					class="bento-detail"
					id={detailIdFor(tile.id)}
					bind:this={detailPanelEl}
					tabindex="-1"
					role="region"
					aria-label="{claim?.label} details"
				>
					<div class="bento-detail__inner">
						<p class="bento-detail__text">{claim?.description}</p>
						<a class="bento-detail__cta" href={claim?.ctaHref}>{claim?.cta} &rarr;</a>
					</div>
				</div>
			{/if}
		{/each}
	</div>
</section>

<style>
	/* ─── Section ─── */
	.bento-section {
		padding: var(--space-7, 6rem) 0;
		background: var(--color-bg, #fafbfc);
	}

	.bento-header {
		max-width: 72rem;
		margin: 0 auto var(--space-5, 3rem);
		padding: 0 var(--space-3, 1.5rem);
	}

	.bento-eyebrow {
		font-size: var(--text-small, 0.875rem);
		font-weight: 700;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--color-gold-text, #8b6914);
		margin-bottom: var(--space-1, 0.5rem);
	}

	.bento-heading {
		font-size: var(--text-h2, clamp(1.875rem, 3vw, 2.5rem));
		font-weight: 800;
		color: var(--color-primary, #1e3a5f);
		line-height: 1.15;
		margin: 0;
	}

	/* ─── Grid ─── */
	.bento-grid {
		max-width: 72rem;
		margin: 0 auto;
		padding: 0 var(--space-3, 1.5rem);
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: var(--space-2, 1rem);
	}

	/* ─── Tile base ─── */
	.bento-tile {
		border-radius: var(--radius-lg, 1.25rem);
		min-height: 14rem;
		position: relative;
		overflow: hidden;
		transition: transform 0.25s ease, box-shadow 0.25s ease;
	}

	.bento-tile-reveal {
		transition-delay: var(--tile-delay, 0ms);
	}

	.bento-tile--col2 {
		grid-column: span 2;
	}

	.bento-tile--row2 {
		grid-row: span 2;
	}

	/* ─── Claim tiles ─── */
	.bento-tile--claim {
		cursor: pointer;
		display: flex;
		flex-direction: column;
		justify-content: flex-end;
		padding: var(--space-4, 2rem);
		user-select: none;
		text-align: left;
		border: 1px solid rgba(15, 39, 68, 0.22);
		box-shadow: 0 10px 24px rgba(15, 39, 68, 0.16);
		width: 100%;
	}

	.bento-tile--claim:hover {
		transform: translateY(-3px);
		box-shadow: 0 12px 32px rgba(15, 23, 42, 0.18);
	}

	.bento-tile--claim:focus-visible {
		outline: 3px solid var(--color-gold, #d4a234);
		outline-offset: 2px;
	}

	.bento-tile--navy {
		background: var(--color-primary, #1e3a5f);
		color: #fff;
	}

	.bento-tile--gold {
		background: var(--color-gold, #d4a234);
		color: var(--color-primary, #1e3a5f);
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.bento-tile__cross-icon {
		width: 55%;
		max-width: 120px;
		opacity: 0.55;
		transition: opacity 300ms ease, transform 300ms ease;
	}
	.bento-tile--gold:hover .bento-tile__cross-icon {
		opacity: 0.65;
		transform: scale(1.05);
	}

	/* ─── Claim tile background images ─── */
	.bento-tile__bg-img {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		object-fit: cover;
		z-index: 0;
	}

	.bento-tile__bg-overlay {
		position: absolute;
		inset: 0;
		z-index: 1;
		background: linear-gradient(
			to top,
			rgba(15, 39, 68, 0.92) 0%,
			rgba(15, 39, 68, 0.85) 40%,
			rgba(15, 39, 68, 0.65) 100%
		);
	}

	.bento-tile--gold .bento-tile__bg-overlay {
		background: linear-gradient(
			to top,
			rgba(180, 130, 30, 0.92) 0%,
			rgba(180, 130, 30, 0.75) 40%,
			rgba(140, 100, 20, 0.6) 100%
		);
	}

	.bento-tile--has-bg .bento-tile__subtitle,
	.bento-tile--has-bg .bento-tile__label,
	.bento-tile--has-bg .bento-tile__arrow {
		position: relative;
		z-index: 2;
	}

	.bento-tile--has-bg .bento-tile__subtitle {
		opacity: 0.85;
		text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
	}

	.bento-tile--has-bg .bento-tile__label {
		text-shadow: 0 1px 4px rgba(0, 0, 0, 0.3);
	}

	.bento-tile--has-bg.bento-tile--gold,
	.bento-tile--has-bg.bento-tile--navy {
		color: #ffffff !important;
	}

	.bento-tile--has-bg .bento-tile__label,
	.bento-tile--has-bg .bento-tile__subtitle,
	.bento-tile--has-bg .bento-tile__arrow {
		color: #ffffff !important;
	}

	.bento-tile__subtitle {
		font-size: var(--text-small, 0.875rem);
		font-weight: 600;
		letter-spacing: 0.04em;
		text-transform: uppercase;
		opacity: 0.7;
		margin-bottom: var(--space-1, 0.5rem);
	}

	.bento-tile__label {
		font-size: clamp(1.5rem, 2.5vw, 2.25rem);
		font-weight: 800;
		line-height: 1.1;
		margin: 0;
	}

	.bento-tile__arrow {
		position: absolute;
		top: var(--space-3, 1.5rem);
		right: var(--space-3, 1.5rem);
		opacity: 0.5;
		transition: transform 0.3s ease, opacity 0.3s ease;
	}

	.bento-tile--claim:hover .bento-tile__arrow {
		opacity: 1;
	}

	.bento-tile__arrow--open {
		transform: rotate(180deg);
		opacity: 1;
	}

	/* ─── Photo tiles ─── */
	.bento-tile--photo {
		padding: 0;
	}

	.bento-tile__photo {
		width: 100%;
		height: 100%;
		border-radius: inherit;
		overflow: hidden;
	}

	.bento-tile__photo-img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
		transition: transform 280ms ease;
	}

	.bento-tile--photo:hover .bento-tile__photo-img {
		transform: scale(1.05);
	}

	/* ─── Color block tiles ─── */
	.bento-tile--color {
		/* Background set by --navy / --gold modifiers */
	}

	/* ─── Detail panel ─── */
	.bento-detail {
		grid-column: 1 / -1;
		overflow: hidden;
		animation: detailExpand 0.35s ease forwards;
	}

	@keyframes detailExpand {
		from {
			max-height: 0;
			opacity: 0;
		}
		to {
			max-height: 20rem;
			opacity: 1;
		}
	}

	.bento-detail__inner {
		background: var(--color-primary-dark, #0f2744);
		color: #fff;
		border-radius: var(--radius-lg, 1.25rem);
		padding: var(--space-4, 2rem) var(--space-5, 3rem);
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-4, 2rem);
	}

	.bento-detail__text {
		font-size: clamp(1rem, 1.2vw, 1.125rem);
		line-height: 1.6;
		max-width: 48rem;
		margin: 0;
	}

	.bento-detail__cta {
		flex-shrink: 0;
		display: inline-block;
		padding: 0.75rem 2rem;
		background: var(--color-gold, #d4a234);
		color: var(--color-primary, #1e3a5f);
		font-weight: 700;
		font-size: 0.95rem;
		border-radius: var(--radius-pill, 999px);
		text-decoration: none;
		white-space: nowrap;
		transition: background 0.2s ease, transform 0.2s ease;
	}

	.bento-detail__cta:hover {
		background: #c29229;
		transform: translateY(-1px);
	}

	/* ─── Expanded tile state ─── */
	.bento-tile--expanded {
		box-shadow: 0 12px 32px rgba(15, 23, 42, 0.18);
	}

	/* ─── Mobile ─── */
	@media (max-width: 768px) {
		.bento-section {
			padding: var(--space-5, 3rem) 0;
		}

		.bento-grid {
			grid-template-columns: 1fr;
		}

		.bento-tile--col2 {
			grid-column: span 1;
		}

		.bento-tile--row2 {
			grid-row: span 1;
		}

		.bento-tile {
			min-height: 10rem;
		}

		.bento-detail__inner {
			flex-direction: column;
			padding: var(--space-3, 1.5rem);
			align-items: flex-start;
		}
	}

	/* ─── Tablet ─── */
	@media (min-width: 769px) and (max-width: 1024px) {
		.bento-grid {
			grid-template-columns: repeat(2, 1fr);
		}

		.bento-tile--col2 {
			grid-column: span 2;
		}
	}

	/* ─── Reduced motion ─── */
	@media (prefers-reduced-motion: reduce) {
		.bento-tile {
			transition: none;
		}

		.bento-detail {
			animation: none;
			max-height: 20rem;
			opacity: 1;
		}

		.bento-tile__arrow {
			transition: none;
		}
	}
</style>
