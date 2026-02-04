<script lang="ts">
	import { onMount } from 'svelte';
	import heroArt from '$lib/assets/hero-distribution.svg';

	let reducedMotion = false;
	let videoEl: HTMLVideoElement | null = null;

	onMount(() => {
		// Respect reduced motion
		reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false;
		if (reducedMotion) return;

		// Pause video when offscreen (battery/perf)
		if (!videoEl) return;
		const io = new IntersectionObserver(
			(entries) => {
				for (const e of entries) {
					if (!videoEl) return;
					if (e.isIntersecting) {
						videoEl.play().catch(() => {});
					} else {
						videoEl.pause();
					}
				}
			},
			{ threshold: 0.05 }
		);
		io.observe(videoEl);
		return () => io.disconnect();
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
			preload="metadata"
			poster="/hero/bgclear-hero-poster.jpg"
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

	/* Slight dim so type always reads */
	.bg {
		filter: brightness(0.9) saturate(1.05);
	}
</style>
