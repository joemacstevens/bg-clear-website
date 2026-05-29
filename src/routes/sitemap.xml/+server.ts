import { categories, products } from '$lib/data/products';
import { SITE_URL } from '$lib/site-config';
import type { RequestHandler } from './$types';

const BASE = SITE_URL;

export const GET: RequestHandler = async () => {
	// Gather blog post slugs from markdown files
	const blogModules = import.meta.glob('/src/content/blog/*.md', { eager: true }) as Record<
		string,
		{ metadata: { date?: string } }
	>;

	const blogSlugs = Object.keys(blogModules).map((path) => {
		const slug = path.split('/').pop()?.replace('.md', '') ?? '';
		const mod = blogModules[path];
		return { slug, date: mod.metadata?.date };
	});

	const urls: { loc: string; lastmod?: string; priority: string }[] = [];

	// Static pages
	urls.push({ loc: '/', priority: '1.0' });
	urls.push({ loc: '/about', priority: '0.8' });
	urls.push({ loc: '/blog', priority: '0.7' });

	// Blog posts
	for (const post of blogSlugs) {
		urls.push({ loc: `/blog/${post.slug}`, lastmod: post.date, priority: '0.6' });
	}

	// Product category pages
	for (const categorySlug of Object.keys(categories)) {
		urls.push({ loc: `/products/${categorySlug}`, priority: '0.8' });
	}

	// Individual product pages
	for (const product of products) {
		urls.push({ loc: `/products/${product.category}/${product.slug}`, priority: '0.7' });
	}

	const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
	.map(
		(u) => `  <url>
    <loc>${BASE}${u.loc}</loc>${u.lastmod ? `\n    <lastmod>${u.lastmod}</lastmod>` : ''}
    <priority>${u.priority}</priority>
  </url>`
	)
	.join('\n')}
</urlset>`;

	return new Response(xml, {
		headers: {
			'Content-Type': 'application/xml',
			'Cache-Control': 'max-age=3600'
		}
	});
};
