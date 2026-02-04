<script lang="ts">
	import { onMount } from 'svelte';
	import heroArt from '$lib/assets/hero-distribution.svg';

	let reducedMotion = false;
	let videoEl: HTMLVideoElement | null = null;

	onMount(() => {
		// Respect reduced motion
		reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false;
		if (reducedMotion) return;

		// Autoplay can be finicky depending on browser timing.
		// Try immediately, then retry shortly after mount.
		const tryPlay = () => {
			if (!videoEl) return;
			// Be explicit - some browsers are picky.
			videoEl.muted = true;
			videoEl.playsInline = true;
			videoEl.autoplay = true;
			videoEl.loop = true;
			videoEl.play().catch(() => {});
		};
		tryPlay();
		const t1 = window.setTimeout(tryPlay, 250);
		const t2 = window.setTimeout(tryPlay, 1200);

		return () => {
			window.clearTimeout(t1);
			window.clearTimeout(t2);
		};
	});
</script>

<div class="hero-media" aria-hidden="true">
	{#if reducedMotion}
		<img class="fallback" src={heroArt} alt="" loading="eager" />
	{:else}
		<video
			bind:this={videoEl}
			class="bg"
			autoplay
			muted
			playsinline
			loop
			preload="auto"
			poster="/hero/bgclear-hero-poster.jpg"
			disablepictureinpicture
		>
			<source src="/hero/bgclear-hero-loop.webm" type="video/webm" />
			<source src="/hero/bgclear-hero-loop.mp4" type="video/mp4" />
			<!-- Last resort -->
			<img class="fallback" src={heroArt} alt="" loading="eager" />
		</video>
	{/if}
</div>

<style>
	.hero-media {
		position: absolute;
		inset: 0;
		z-index: 0;
		overflow: hidden;
		border-radius: 24px;
		background: radial-gradient(900px 520px at 22% 22%, rgba(0, 56, 94, 0.35) 0%, rgba(0, 43, 74, 0.9) 60%, rgba(6, 18, 28, 1) 100%);
	}

	.bg,
	.fallback {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	/* Keep it readable but not crushed */
	.bg {
		filter: brightness(1.18) contrast(1.05) saturate(1.12);
	}
</style>
