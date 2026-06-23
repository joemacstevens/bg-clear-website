<script lang="ts">
	import type { PageData } from './$types';
	import { enhance } from '$app/forms';
	import CategoryNav from '$lib/components/portal/CategoryNav.svelte';
	import { toasts } from '$lib/stores/toast';

	let { data }: { data: PageData } = $props();

	// Local set of product ids already on the quote (optimistic).
	let added = $state(new Set<string>(data.inQuoteIds ?? []));
	let search = $state('');

	const base = $derived(`/rep/quotes/${data.quoteId}/browse`);

	const filtered = $derived(
		data.products.filter((p: any) => {
			if (!search.trim()) return true;
			const q = search.toLowerCase();
			return (
				p.name?.toLowerCase().includes(q) ||
				p.vendor_name?.toLowerCase().includes(q) ||
				p.sku?.toLowerCase().includes(q) ||
				p.description?.toLowerCase().includes(q)
			);
		})
	);
</script>

<svelte:head><title>Add products | BG Clear</title></svelte:head>

<div class="browse">
	<div class="bar">
		<div class="bar-info">
			<span class="bar-eyebrow">Adding to quote</span>
			<strong>{data.customer?.company_name || data.customer?.full_name || 'Customer'}</strong>
		</div>
		<a class="done-btn" href="/rep/quotes/{data.quoteId}">
			Done — Back to Quote{added.size ? ` (${added.size})` : ''} →
		</a>
	</div>

	<div class="search-row">
		<input type="search" placeholder="Search products, brands…" bind:value={search} />
	</div>

	<CategoryNav
		tree={data.tree}
		activeSlug={data.activeCategory?.slug ?? null}
		linkBase={`${base}?category=`}
		allHref={base}
	/>

	{#if data.activeCategory}
		<p class="ctx">Showing <strong>{data.activeCategory.name}</strong> · {filtered.length} products</p>
	{/if}

	{#if filtered.length === 0}
		<div class="empty">No products match — try a different search or category.</div>
	{:else}
		<div class="grid">
			{#each filtered as product (product.id)}
				<div class="card" class:in-quote={added.has(product.id)}>
					<div class="img">
						{#if product.image_url}
							<img src={product.image_url} alt={product.name} />
						{:else}
							<div class="ph">{product.name.charAt(0)}</div>
						{/if}
					</div>
					<div class="info">
						<span class="vendor">{product.vendor_name}</span>
						<h3>{product.name}</h3>
						{#if product.description}<p class="desc">{product.description}</p>{/if}
						{#if added.has(product.id)}
							<button class="add added" disabled>✓ Added to quote</button>
						{:else}
							<form
								method="POST"
								action="?/addToQuote"
								use:enhance={() => {
									added = new Set(added).add(product.id);
									toasts.success(`${product.name} added`);
									return async ({ update }) => { await update({ reset: false }); };
								}}
							>
								<input type="hidden" name="product_id" value={product.id} />
								<input type="hidden" name="quantity" value="1" />
								<button class="add" type="submit" disabled={!data.editable}>+ Add to Quote</button>
							</form>
						{/if}
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>

<style>
	.browse { padding-bottom: var(--space-8); }

	.bar {
		position: sticky;
		top: 0;
		z-index: 20;
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: var(--space-3);
		background: var(--color-primary);
		color: #fff;
		padding: var(--space-3) var(--space-4);
		border-radius: var(--radius-md);
		margin-bottom: var(--space-3);
	}
	.bar-info { display: flex; flex-direction: column; line-height: 1.2; min-width: 0; }
	.bar-eyebrow { font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.05em; opacity: 0.8; }
	.bar-info strong { font-size: 1.05rem; }
	.done-btn {
		flex-shrink: 0;
		background: var(--color-accent);
		color: var(--color-ink);
		font-weight: 700;
		font-size: var(--text-small);
		padding: 0.6rem 1.1rem;
		border-radius: var(--radius-pill);
		text-decoration: none;
		white-space: nowrap;
	}

	.search-row { margin-bottom: var(--space-3); }
	.search-row input {
		width: 100%;
		max-width: 480px;
		padding: 0.9rem 1.1rem;
		font-size: 1.05rem;
		border: 2px solid var(--color-border);
		border-radius: var(--radius-pill);
		box-sizing: border-box;
	}
	.search-row input:focus { outline: none; border-color: var(--color-primary); box-shadow: 0 0 0 4px rgba(30,58,95,0.1); }

	.ctx { color: var(--color-muted); font-size: var(--text-small); margin: 0 0 var(--space-3); }

	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
		gap: var(--space-4);
	}
	.card {
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		overflow: hidden;
		display: flex;
		flex-direction: column;
		transition: border-color 0.15s;
	}
	.card.in-quote { border-color: var(--color-accent); }
	.img { aspect-ratio: 4 / 3; background: var(--color-bg); display: flex; align-items: center; justify-content: center; }
	.img img { width: 100%; height: 100%; object-fit: contain; }
	.ph { font-family: var(--font-heading); font-size: 2rem; font-weight: 700; color: var(--color-border); }
	.info { padding: var(--space-3); display: flex; flex-direction: column; gap: 0.35rem; flex: 1; }
	.vendor { font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.04em; color: var(--color-muted); }
	.info h3 { font-size: var(--text-small); font-weight: 700; color: var(--color-ink); margin: 0; line-height: 1.3; }
	.desc {
		font-size: var(--text-small); color: var(--color-muted); margin: 0;
		display: -webkit-box; -webkit-line-clamp: 2; line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
	}
	.add {
		margin-top: auto;
		padding: 0.6rem 0.75rem;
		background: var(--color-accent);
		color: var(--color-ink);
		border: none;
		border-radius: var(--radius-pill);
		font-weight: 700;
		font-size: 0.8rem;
		cursor: pointer;
		width: 100%;
	}
	.add.added { background: var(--color-border-subtle); color: #047857; cursor: default; }
	form { margin-top: auto; }

	.empty {
		padding: var(--space-6);
		text-align: center;
		color: var(--color-muted);
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
	}
</style>
