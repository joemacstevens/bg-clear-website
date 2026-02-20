<script lang="ts">
	import logo from '$lib/assets/bg-clear-logo-640.png';

	interface BlogPost {
		slug: string;
		title: string;
		date: string;
		excerpt: string;
		category: string;
		image?: string;
		author?: string;
	}

	let { data } = $props();
	const posts: BlogPost[] = data.posts;
</script>

<svelte:head>
	<title>Resources — BG Clear</title>
	<meta name="description" content="Industry insights, compliance updates, and best practices for DME providers." />
</svelte:head>

<header class="site-header scrolled">
	<div class="container header-inner">
		<a href="/"><img class="header-logo" src={logo} alt="BG Clear" /></a>
		<nav class="header-nav">
			<a href="/about">About Us</a>
			<a href="/blog">Resources</a>
			<a href="/#products">Products</a>
			<a href="/#faq">FAQ</a>
		</nav>
		<div class="header-cta">
			<a href="tel:+12015550100" class="header-phone">(201) 555-0100</a>
			<a class="button button-primary button-header" href="/#request-call">Contact Us</a>
		</div>
	</div>
</header>

<main id="main-content" class="page" tabindex="-1">
	<section class="blog-hero">
		<div class="container">
			<p class="eyebrow">Resources</p>
			<h1>Insights for DME Providers</h1>
			<p class="blog-hero-sub">Industry guides, compliance updates, and best practices to help your practice run smoother.</p>
		</div>
	</section>

	<section class="blog-listing">
		<div class="container">
			{#if posts.length === 0}
				<p class="blog-empty">No posts yet. Check back soon.</p>
			{:else}
				<div class="blog-grid">
					{#each posts as post}
						<a href="/blog/{post.slug}" class="blog-card">
							{#if post.image}
								<div class="blog-card-img">
									<img src={post.image} alt={post.title} loading="lazy" />
								</div>
							{/if}
							<div class="blog-card-body">
								<div class="blog-card-meta">
									<span class="blog-card-category">{post.category}</span>
									<time datetime={post.date}>
										{new Date(post.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
									</time>
								</div>
								<h2 class="blog-card-title">{post.title}</h2>
								<p class="blog-card-excerpt">{post.excerpt}</p>
								<span class="blog-card-link">Read more &rarr;</span>
							</div>
						</a>
					{/each}
				</div>
			{/if}
		</div>
	</section>
</main>

<style>
	.blog-hero {
		padding: 10rem 0 3rem;
		background: linear-gradient(105deg, var(--color-primary) 0%, var(--color-primary-dark) 100%);
		color: #ffffff;
		text-align: center;
	}
	.blog-hero .eyebrow {
		color: var(--color-accent);
		font-size: 0.8125rem;
		font-weight: 700;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		margin-bottom: 0.75rem;
	}
	.blog-hero h1 {
		font-family: var(--font-heading);
		font-size: clamp(2rem, 5vw, 3rem);
		font-weight: 700;
		margin-bottom: 1rem;
		color: #ffffff;
	}
	.blog-hero-sub {
		font-size: 1.125rem;
		color: rgba(255, 255, 255, 0.75);
		max-width: 540px;
		margin: 0 auto;
		line-height: 1.6;
	}
	.blog-listing {
		padding: var(--section-padding) 0;
	}
	.blog-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
		gap: 2rem;
	}
	.blog-card {
		display: flex;
		flex-direction: column;
		background: var(--color-surface);
		border-radius: var(--radius-lg);
		overflow: hidden;
		box-shadow: var(--shadow-sm);
		text-decoration: none;
		color: inherit;
		transition: transform 300ms ease, box-shadow 300ms ease;
	}
	.blog-card:hover {
		transform: translateY(-4px);
		box-shadow: var(--shadow-lg);
	}
	.blog-card-img {
		height: 200px;
		overflow: hidden;
		background: linear-gradient(135deg, #f0f4f8 0%, #e8eef5 100%);
	}
	.blog-card-img img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		transition: transform 400ms ease;
	}
	.blog-card:hover .blog-card-img img {
		transform: scale(1.04);
	}
	.blog-card-body {
		padding: 1.5rem;
		display: flex;
		flex-direction: column;
		flex: 1;
	}
	.blog-card-meta {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		font-size: 0.8125rem;
		color: var(--color-muted);
		margin-bottom: 0.75rem;
	}
	.blog-card-category {
		display: inline-block;
		padding: 0.15rem 0.5rem;
		background: var(--color-accent-light);
		color: var(--color-primary);
		font-size: 0.6875rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		border-radius: var(--radius-pill);
	}
	.blog-card-title {
		font-family: var(--font-heading);
		font-size: 1.25rem;
		font-weight: 700;
		color: var(--color-primary);
		line-height: 1.3;
		margin-bottom: 0.5rem;
	}
	.blog-card-excerpt {
		font-size: 0.9375rem;
		color: var(--color-muted);
		line-height: 1.6;
		flex: 1;
		margin-bottom: 1rem;
	}
	.blog-card-link {
		font-size: 0.875rem;
		font-weight: 600;
		color: var(--color-accent);
	}
	.blog-empty {
		text-align: center;
		color: var(--color-muted);
		font-size: 1.125rem;
		padding: 4rem 0;
	}
	@media (max-width: 480px) {
		.blog-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
