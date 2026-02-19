import { error } from '@sveltejs/kit';

const modules = import.meta.glob('/src/content/blog/*.md');

export async function load({ params }) {
	const path = `/src/content/blog/${params.slug}.md`;

	if (!modules[path]) {
		throw error(404, 'Post not found');
	}

	const post = (await modules[path]()) as { default: unknown; metadata: Record<string, string> };
	return {
		content: post.default,
		meta: post.metadata
	};
}
