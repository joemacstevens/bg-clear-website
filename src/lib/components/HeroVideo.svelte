<script lang="ts">
	import { onMount } from 'svelte';
	import heroArt from '$lib/assets/hero-distribution.svg';

	let reducedMotion = false;
	let videoEl: HTMLVideoElement | null = null;

	onMount(() => {
		// Respect reduced motion
		reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false;
		if (reducedMotion) return;

		// Autoplay can be finicky depending on browser timing and source selection.
		// We'll explicitly set a src + call load() then retry play a few times.
		const mp4 = '/hero/bgclear-hero-loop.mp4?v=3';
		const webm = '/hero/bgclear-hero-loop.webm?v=3';

		const ensureSrc = () => {
			if (!videoEl) return;
			// Be explicit - some browsers/extensions are picky.
			videoEl.muted = true;
			videoEl.playsInline = true;
			videoEl.autoplay = true;
			videoEl.loop = true;

			// If the browser never picked a source (currentSrc empty), force MP4.
			if (!videoEl.currentSrc && !videoEl.getAttribute('src')) {
				videoEl.src = mp4;
				videoEl.load();
			}
		};

		const tryPlay = () => {
			if (!videoEl) return;
			ensureSrc();
			videoEl.play().catch(() => {});
		};

		// If MP4 fails to play, try WebM as fallback.
		const onError = () => {
			if (!videoEl) return;
			if (videoEl.src.includes('bgclear-hero-loop.mp4')) {
				videoEl.src = webm;
				videoEl.load();
				videoEl.play().catch(() => {});
			}
		};

		ensureSrc();
		tryPlay();
		videoEl?.addEventListener('error', onError);

		const t1 = window.setTimeout(tryPlay, 200);
		const t2 = window.setTimeout(tryPlay, 900);
		const t3 = window.setTimeout(tryPlay, 2000);

		return () => {
			window.clearTimeout(t1);
			window.clearTimeout(t2);
			window.clearTimeout(t3);
			videoEl?.removeEventListener('error', onError);
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
			poster="/hero/bgclear-hero-poster.jpg?v=3"
			disablepictureinpicture
		>
			<!-- Sources kept for normal selection; we also force src in JS if needed -->
			<source src="/hero/bgclear-hero-loop.mp4?v=3" type="video/mp4" />
			<source src="/hero/bgclear-hero-loop.webm?v=3" type="video/webm" />
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
