<script lang="ts">
	import { goto } from '$app/navigation';

	let { placeholder = 'Search products, brands, or categories…' }: { placeholder?: string } =
		$props();

	const MOST_SEARCHED = [
		{ label: 'Mobility Scooters', slug: 'mobility-scooters' },
		{ label: 'Walkers', slug: 'walkers-rollators' },
		{ label: 'Wheelchairs', slug: 'wheelchairs' },
		{ label: 'Blood Pressure', slug: 'blood-pressure' },
		{ label: 'Oxygen', slug: 'oxygen-concentrators' },
		{ label: 'Mattresses', slug: 'pressure-relief-mattresses' }
	];

	let query = $state('');
	let open = $state(false);
	let products = $state<any[]>([]);
	let categories = $state<any[]>([]);
	let loading = $state(false);
	let wrapEl: HTMLElement;
	let debounce: ReturnType<typeof setTimeout> | null = null;

	async function fetchResults(q: string) {
		loading = true;
		try {
			const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
			const data = await res.json();
			products = data.products ?? [];
			categories = data.categories ?? [];
		} catch {
			products = [];
			categories = [];
		}
		loading = false;
	}

	$effect(() => {
		const q = query;
		if (debounce) clearTimeout(debounce);
		debounce = setTimeout(() => fetchResults(q), 180);
	});

	function focusOpen() {
		open = true;
		if (!products.length && !categories.length) fetchResults(query);
	}

	function submit() {
		if (!query.trim()) return;
		open = false;
		goto(`/catalog/search?q=${encodeURIComponent(query.trim())}`);
	}

	function onKey(e: KeyboardEvent) {
		if (e.key === 'Enter') submit();
		if (e.key === 'Escape') open = false;
	}

	function onWindowClick(e: MouseEvent) {
		if (wrapEl && !wrapEl.contains(e.target as Node)) open = false;
	}
</script>

<svelte:window onclick={onWindowClick} />

<div class="search-wrap" bind:this={wrapEl}>
	<svg class="s-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
		<path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
	</svg>
	<input
		class="s-input"
		type="search"
		{placeholder}
		bind:value={query}
		onfocus={focusOpen}
		onkeydown={onKey}
		autocomplete="off"
	/>

	{#if open}
		<div class="panel">
			{#if !query.trim()}
				<div class="section">
					<div class="sec-title">Most searched</div>
					<div class="pills">
						{#each MOST_SEARCHED as m}
							<a class="pill" href="/catalog/c/{m.slug}" onclick={() => (open = false)}>{m.label}</a>
						{/each}
					</div>
				</div>
				{#if categories.length}
					<div class="section">
						<div class="sec-title">Browse categories</div>
						<div class="cat-tiles">
							{#each categories as c}
								<a class="cat-tile" href="/catalog/c/{c.slug}" onclick={() => (open = false)}>{c.name}</a>
							{/each}
						</div>
					</div>
				{/if}
			{:else}
				{#if loading && !products.length}
					<div class="muted">Searching…</div>
				{/if}
				{#if categories.length}
					<div class="section">
						<div class="sec-title">Categories</div>
						{#each categories as c}
							<a class="row cat-row" href="/catalog/c/{c.slug}" onclick={() => (open = false)}>
								<span class="row-name">{c.name}</span>
								<span class="row-meta">Category →</span>
							</a>
						{/each}
					</div>
				{/if}
				<div class="section">
					<div class="sec-title">Products</div>
					{#if products.length}
						{#each products as p}
							<a class="row prod-row" href="/catalog/{p.id}" onclick={() => (open = false)}>
								<span class="thumb">
									{#if p.image_url}<img src={p.image_url} alt="" />{/if}
								</span>
								<span class="row-text">
									<span class="row-name">{p.name}</span>
									<span class="row-vendor">{p.vendor_name}</span>
								</span>
							</a>
						{/each}
						<button class="see-all" onclick={submit}>See all results for “{query.trim()}” →</button>
					{:else if !loading}
						<div class="muted">No products match “{query.trim()}”.</div>
					{/if}
				</div>
			{/if}
		</div>
	{/if}
</div>

<style>
	.search-wrap {
		position: relative;
		margin-bottom: var(--space-4);
	}
	.s-icon {
		position: absolute;
		left: 1.1rem;
		top: 1.05rem;
		width: 22px;
		height: 22px;
		color: var(--color-muted);
		pointer-events: none;
	}
	.s-input {
		width: 100%;
		padding: 1rem 1.25rem 1rem 3.1rem;
		font-size: 1.1rem;
		font-family: var(--font-body);
		border: 2px solid var(--color-border);
		border-radius: var(--radius-pill);
		background: var(--color-surface);
		box-sizing: border-box;
		transition: border-color 0.15s, box-shadow 0.15s;
	}
	.s-input:focus {
		outline: none;
		border-color: var(--color-primary);
		box-shadow: 0 0 0 4px rgba(30, 58, 95, 0.1);
	}

	.panel {
		position: absolute;
		z-index: 50;
		top: calc(100% + 6px);
		left: 0;
		right: 0;
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		box-shadow: var(--shadow-lg);
		padding: var(--space-3);
		max-height: 70vh;
		overflow-y: auto;
	}
	.section + .section {
		margin-top: var(--space-3);
		padding-top: var(--space-3);
		border-top: 1px solid var(--color-border);
	}
	.sec-title {
		font-size: 0.7rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--color-muted);
		margin-bottom: var(--space-2);
	}
	.muted {
		color: var(--color-muted);
		font-size: var(--text-small);
		padding: var(--space-1) 0;
	}

	.pills {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}
	.pill {
		padding: 0.4rem 0.85rem;
		background: var(--color-bg);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-pill);
		font-size: var(--text-small);
		font-weight: 600;
		color: var(--color-primary);
		text-decoration: none;
	}
	.pill:hover {
		background: var(--color-primary);
		color: #fff;
	}

	.cat-tiles {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
		gap: 0.4rem;
	}
	.cat-tile {
		padding: 0.6rem 0.75rem;
		background: var(--color-bg);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-sm);
		font-size: var(--text-small);
		font-weight: 600;
		color: var(--color-ink);
		text-decoration: none;
	}
	.cat-tile:hover {
		border-color: var(--color-primary);
		color: var(--color-primary);
	}

	.row {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.5rem;
		border-radius: var(--radius-sm);
		text-decoration: none;
		color: inherit;
	}
	.row:hover {
		background: var(--color-bg);
	}
	.cat-row {
		justify-content: space-between;
	}
	.row-name {
		font-size: var(--text-small);
		font-weight: 600;
		color: var(--color-ink);
	}
	.row-meta {
		font-size: 0.7rem;
		color: var(--color-primary);
	}
	.thumb {
		width: 40px;
		height: 40px;
		border-radius: var(--radius-sm);
		background: var(--color-bg);
		flex-shrink: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		overflow: hidden;
	}
	.thumb img {
		width: 100%;
		height: 100%;
		object-fit: contain;
	}
	.row-text {
		display: flex;
		flex-direction: column;
		min-width: 0;
	}
	.row-vendor {
		font-size: 0.7rem;
		color: var(--color-muted);
	}
	.see-all {
		width: 100%;
		text-align: left;
		margin-top: var(--space-1);
		padding: 0.5rem;
		background: none;
		border: none;
		color: var(--color-primary);
		font-weight: 600;
		font-size: var(--text-small);
		cursor: pointer;
	}
	.see-all:hover {
		text-decoration: underline;
	}
</style>
