<script lang="ts">
	import Header from '$lib/components/Header.svelte';
	import CookieConsent from '$lib/components/CookieConsent.svelte';

	let { children } = $props();
</script>

<a class="skip-link" href="#main-content">Skip to main content</a>
<Header />
{@render children()}
<CookieConsent />
