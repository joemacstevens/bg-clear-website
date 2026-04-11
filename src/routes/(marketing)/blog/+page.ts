interface BlogMeta {
	title: string;
	date: string;
	excerpt: string;
	category: string;
	image?: string;
	author?: string;
}

export async function load() {
	const modules = import.meta.glob<{ metadata: BlogMeta }>('/src/content/blog/*.md', { eager: true });

	const posts = Object.entries(modules)
		.map(([path, mod]) => {
			const slug = path.split('/').pop()!.replace('.md', '');
			return {
				slug,
				...mod.metadata
			};
		})
		.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

	return { posts };
}
