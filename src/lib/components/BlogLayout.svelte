<script>
	import logo from '$lib/assets/bg-clear-logo-640.png';

	let { title, date, excerpt, category, author, children } = $props();

	const formattedDate = new Date(date).toLocaleDateString('en-US', {
		year: 'numeric',
		month: 'long',
		day: 'numeric'
	});

	const wordCount = 200;
	const readingTime = Math.max(1, Math.ceil(wordCount / 250));
</script>

<svelte:head>
	<title>{title} — BG Clear Resources</title>
	<meta name="description" content={excerpt} />
</svelte:head>

<header class="site-header scrolled">
	<div class="container header-inner">
		<a href="/"><img class="header-logo" src={logo} alt="BG Clear" /></a>
		<nav class="header-nav">
			<a href="/about">About Us</a>
			<a href="/blog">Resources</a>
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
	<article class="blog-post">
		<div class="container blog-post-container">
			<a href="/blog" class="blog-back-link">
				<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
					<path stroke-linecap="round" stroke-linejoin="round" d="M19 12H5m0 0l7 7m-7-7l7-7" />
				</svg>
				Back to Resources
			</a>

			<div class="blog-post-meta">
				<span class="blog-category-tag">{category}</span>
				<span class="blog-meta-sep">&middot;</span>
				<time datetime={date}>{formattedDate}</time>
				<span class="blog-meta-sep">&middot;</span>
				<span>{readingTime} min read</span>
			</div>

			<h1 class="blog-post-title">{title}</h1>

			{#if author}
				<p class="blog-post-author">By {author}</p>
			{/if}

			<div class="blog-post-content">
				{@render children()}
			</div>
		</div>
	</article>
</main>

<style>
	.blog-post {
		padding: 12rem 0 4rem;
	}
	.blog-post-container {
		max-width: 740px;
	}
	.blog-back-link {
		display: inline-flex;
		align-items: center;
		gap: 0.375rem;
		color: var(--color-primary);
		font-size: 0.875rem;
		font-weight: 600;
		text-decoration: none;
		margin-bottom: 2rem;
		transition: color 200ms ease;
	}
	.blog-back-link:hover {
		color: var(--color-accent);
	}
	.blog-post-meta {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.875rem;
		color: var(--color-muted);
		margin-bottom: 1rem;
	}
	.blog-meta-sep {
		color: var(--color-border);
	}
	.blog-category-tag {
		display: inline-block;
		padding: 0.2rem 0.625rem;
		background: var(--color-accent-light);
		color: var(--color-primary);
		font-size: 0.75rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		border-radius: var(--radius-pill);
	}
	.blog-post-title {
		font-family: var(--font-heading);
		font-size: clamp(1.75rem, 4vw, 2.5rem);
		font-weight: 700;
		color: var(--color-primary);
		line-height: 1.2;
		margin-bottom: 0.75rem;
	}
	.blog-post-author {
		font-size: 0.9375rem;
		color: var(--color-muted);
		margin-bottom: 2.5rem;
		padding-bottom: 2rem;
		border-bottom: 1px solid var(--color-border);
	}
	.blog-post-content {
		font-size: 1.0625rem;
		line-height: 1.8;
		color: var(--color-text);
	}
	.blog-post-content :global(h2) {
		font-family: var(--font-heading);
		font-size: 1.5rem;
		font-weight: 700;
		color: var(--color-primary);
		margin: 2.5rem 0 1rem;
	}
	.blog-post-content :global(h3) {
		font-family: var(--font-heading);
		font-size: 1.25rem;
		font-weight: 700;
		color: var(--color-primary);
		margin: 2rem 0 0.75rem;
	}
	.blog-post-content :global(p) {
		margin-bottom: 1.25rem;
	}
	.blog-post-content :global(ul),
	.blog-post-content :global(ol) {
		margin: 1rem 0 1.5rem 1.5rem;
	}
	.blog-post-content :global(li) {
		margin-bottom: 0.5rem;
	}
	.blog-post-content :global(a) {
		color: var(--color-primary);
		text-decoration: underline;
		text-underline-offset: 2px;
	}
	.blog-post-content :global(a:hover) {
		color: var(--color-accent);
	}
	.blog-post-content :global(blockquote) {
		border-left: 3px solid var(--color-accent);
		padding-left: 1.25rem;
		margin: 1.5rem 0;
		color: var(--color-muted);
		font-style: italic;
	}
	.blog-post-content :global(code) {
		background: var(--color-border-subtle);
		padding: 0.15rem 0.4rem;
		border-radius: 4px;
		font-size: 0.9em;
	}
	.blog-post-content :global(img) {
		max-width: 100%;
		border-radius: var(--radius-md);
		margin: 1.5rem 0;
	}
</style>
