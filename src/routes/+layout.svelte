<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import { SITE_URL } from '$lib/site-config';

	let { children } = $props();

	const ogImage = `${SITE_URL}/generated-photos/hero-products.png`;
</script>

<svelte:head>
	<title>BG Clear | DME & HME Medical Equipment Distributor</title>
	<meta name="description" content="Your partner for fast, compliant, and reliable durable medical equipment (DME) and home medical equipment (HME) distribution. Serving healthcare providers nationwide." />
	<meta property="og:type" content="website" />
	<meta property="og:url" content={SITE_URL} />
	<meta property="og:title" content="BG Clear | DME & HME Medical Equipment Distributor" />
	<meta property="og:description" content="Your partner for fast, compliant, and reliable durable medical equipment (DME) and home medical equipment (HME) distribution. Serving healthcare providers nationwide." />
	<meta property="og:image" content={ogImage} />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content="BG Clear | DME & HME Medical Equipment Distributor" />
	<meta name="twitter:description" content="Your partner for fast, compliant, and reliable durable medical equipment (DME) and home medical equipment (HME) distribution. Serving healthcare providers nationwide." />
	<meta name="twitter:image" content={ogImage} />
	<link rel="canonical" href={SITE_URL} />
	<link rel="icon" href={favicon} />
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
	<link
		rel="stylesheet"
		href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Montserrat:wght@600;700;800&display=swap"
	/>
	{@html `<script type="application/ld+json">${JSON.stringify({
		"@context": "https://schema.org",
		"@type": "MedicalBusiness",
		"name": "BG Clear LLC",
		"url": SITE_URL,
		"logo": ogImage,
		"telephone": "+1-201-765-7171",
		"email": "customercare@bgclear.com",
		"address": {
			"@type": "PostalAddress",
			"streetAddress": "550 Sylvan Ave., Suite 202",
			"addressLocality": "Englewood Cliffs",
			"addressRegion": "NJ",
			"postalCode": "07632",
			"addressCountry": "US"
		},
		"description": "Your partner for fast, compliant, and reliable durable medical equipment (DME) and home medical equipment (HME) distribution. Serving healthcare providers nationwide.",
		"sameAs": []
	})}</script>`}
</svelte:head>

{@render children()}
