<script lang="ts">
	import { onMount } from 'svelte';
	import logo from '$lib/assets/bg-clear-logo-640.png';

	let scrolled = $state(false);
	let mobileNavOpen = $state(false);

	onMount(() => {
		const handleScroll = () => {
			scrolled = window.scrollY > 40;
		};

		window.addEventListener('scroll', handleScroll, { passive: true });
		handleScroll();

		return () => {
			window.removeEventListener('scroll', handleScroll);
		};
	});
</script>

<!-- Navigation Header -->
<header class="site-header" class:scrolled>
	<div class="container header-inner">
		<a href="/"><img class="header-logo is-visible" src={logo} alt="BG Clear" /></a>
		<nav class="header-nav">
			<a href="/#products">Products</a>
			<a href="/about">About</a>
			<a href="/blog">Resources</a>
		</nav>
		<div class="header-cta">
			<a href="mailto:customercare@bgclear.com" class="header-icon" aria-label="Email us" title="Email us">
				<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" width="20" height="20">
					<path stroke-linecap="round" stroke-linejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
				</svg>
			</a>
			<a href="tel:+12017657171" class="header-phone">(201) 765-7171</a>
			<a class="button button-primary button-header" href="/#request-call">Talk to a Specialist</a>
		</div>
		<button class="hamburger" aria-label="Open menu" aria-expanded={mobileNavOpen} onclick={() => mobileNavOpen = true}>
			<span class="hamburger-line"></span>
			<span class="hamburger-line"></span>
			<span class="hamburger-line"></span>
		</button>
	</div>
</header>

<!-- Mobile nav drawer -->
{#if mobileNavOpen}
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="mobile-nav-overlay" onclick={() => mobileNavOpen = false} onkeydown={(e) => e.key === 'Escape' && (mobileNavOpen = false)}></div>
{/if}
<nav class="mobile-nav-drawer" class:mobile-nav-drawer--open={mobileNavOpen} aria-label="Mobile navigation">
	<button class="mobile-nav-close" aria-label="Close menu" onclick={() => mobileNavOpen = false}>
		<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
	</button>
	<div class="mobile-nav-links">
		<a href="/" onclick={() => mobileNavOpen = false}>Home</a>
		<a href="/#products" onclick={() => mobileNavOpen = false}>Products</a>
		<a href="/about" onclick={() => mobileNavOpen = false}>About</a>
		<a href="/blog" onclick={() => mobileNavOpen = false}>Resources</a>
	</div>
	<div class="mobile-nav-footer">
		<a href="tel:+12017657171" class="mobile-nav-phone">(201) 765-7171</a>
		<a class="button button-primary" href="/#request-call" onclick={() => mobileNavOpen = false}>Talk to a Specialist</a>
	</div>
</nav>
