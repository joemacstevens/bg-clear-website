<script lang="ts">
	// Simple static hero image
</script>

<div class="hero-media" aria-hidden="true">
	<img 
		class="bg" 
		src="/hero/hero-isometric.png" 
		alt="Isometric distribution center with flow paths to medical equipment" 
		loading="eager" 
	/>
</div>

<style>
	.hero-media {
		position: absolute;
		inset: 0;
		z-index: 0;
		overflow: hidden;
		border-radius: 24px;
		background: radial-gradient(900px 520px at 18% 12%, rgba(247, 248, 250, 1) 0%, rgba(238, 242, 247, 1) 52%, rgba(233, 238, 245, 1) 100%);
	}

	.bg {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		object-fit: cover;
		/* Slight dim to ensure text readability if needed, though image is bright */
		filter: brightness(0.95);
	}
</style>

