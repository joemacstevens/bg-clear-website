<script lang="ts">
	import type { PageData } from './$types';
	import { quoteCart } from '$lib/stores/quote-cart';
	import { toasts } from '$lib/stores/toast';
	import { categoryLabel } from '$lib/utils/categories';
	import type { CartItem } from '$lib/stores/quote-cart';

	let { data }: { data: PageData } = $props();
	const product = data.product;

	let quantity = $state(1);
	let cartItems: CartItem[] = $state([]);
	quoteCart.subscribe((items) => { cartItems = items; });

	const inCart = $derived(cartItems.some((i) => i.productId === product.id));

	function addToCart() {
		quoteCart.addItem(product.id, product.name, product.category, quantity, product.image_url);
		toasts.success(`${product.name} added to quote cart`);
	}
</script>

<svelte:head>
	<title>{product.name} | BG Clear</title>
</svelte:head>

<div class="product-detail">
	<a href="/catalog" class="back-link">
		<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" width="16" height="16">
			<path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
		</svg>
		<span>Back to Catalog</span>
	</a>

	<div class="detail-layout">
		<div class="detail-image">
			{#if product.image_url}
				<img src={product.image_url} alt={product.name} />
			{:else}
				<div class="placeholder-image">
					<svg class="placeholder-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none" stroke="currentColor">
						<path d="M0 25h100M0 50h100M0 75h100M25 0v100M50 0v100M75 0v100" stroke="rgba(30, 58, 95, 0.03)" stroke-width="0.5" />
						<path d="M15 85 C 40 85, 60 40, 85 15" stroke="var(--color-gold)" stroke-width="1.5" stroke-linecap="round" opacity="0.15" />
						<path d="M44 32h12v12h12v12H56v12H44V56H32V44h12V32z" fill="var(--color-primary)" opacity="0.08" />
					</svg>
					<span class="placeholder-letter">{categoryLabel(product.category, true).charAt(0)}</span>
				</div>
			{/if}
		</div>

		<div class="detail-info">
			<div class="badge-row">
				<span class="detail-vendor">{product.vendor_name}</span>
				<span class="detail-category">{categoryLabel(product.category, true)}</span>
			</div>
			<h1>{product.name}</h1>
			{#if product.sku}
				<p class="detail-sku">SKU: {product.sku}</p>
			{/if}
			<p class="detail-description">{product.description}</p>

			{#if product.specs && Object.keys(product.specs).length > 0}
				<div class="specs-section">
					<h3>Specifications</h3>
					<dl class="specs-list">
						{#each Object.entries(product.specs) as [key, value]}
							<div class="spec-row">
								<dt>{key}</dt>
								<dd>{value}</dd>
							</div>
						{/each}
					</dl>
				</div>
			{/if}

			<div class="add-section">
				{#if inCart}
					<div class="in-cart-notice">
						<span>This product is already in your quote cart.</span>
						<a href="/catalog/quote" class="view-cart-btn">View Quote Cart &rarr;</a>
					</div>
				{:else}
					<div class="quantity-row">
						<label for="qty">Quantity</label>
						<div class="quantity-input">
							<button onclick={() => quantity = Math.max(1, quantity - 1)} aria-label="Decrease quantity">-</button>
							<input id="qty" type="number" bind:value={quantity} min="1" aria-label="Quantity" />
							<button onclick={() => quantity++} aria-label="Increase quantity">+</button>
						</div>
					</div>
					<button class="add-btn" onclick={addToCart}>
						+ Add to Quote Request
					</button>
				{/if}
			</div>
		</div>
	</div>
</div>

<style>
	.product-detail {
		padding-bottom: var(--space-8);
	}

	.back-link {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		margin-bottom: var(--space-4);
		color: var(--color-muted);
		font-size: var(--text-small);
		font-weight: 600;
		text-decoration: none;
		transition: color 0.15s ease, transform 0.15s ease;
	}

	.back-link:hover {
		color: var(--color-primary);
		transform: translateX(-4px);
	}

	.back-link svg {
		transition: transform 0.15s ease;
	}

	.detail-layout {
		display: grid;
		grid-template-columns: 1.2fr 1fr;
		gap: var(--space-6);
		background: var(--color-surface);
		padding: var(--space-5);
		border-radius: var(--radius-md);
		border: 1px solid var(--color-border);
		box-shadow: var(--shadow-sm);
	}

	.detail-image {
		aspect-ratio: 4/3;
		border-radius: var(--radius-md);
		overflow: hidden;
		background: var(--color-border-subtle);
		border: 1px solid var(--color-border);
	}

	.detail-image img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		transition: transform 0.4s ease;
	}

	.detail-image:hover img {
		transform: scale(1.02);
	}

	.placeholder-image {
		width: 100%;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		position: relative;
		background: linear-gradient(135deg, var(--color-border-subtle), var(--color-border));
		overflow: hidden;
	}

	.placeholder-svg {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
	}

	.placeholder-letter {
		font-size: 4rem;
		font-weight: 800;
		color: var(--color-primary);
		opacity: 0.15;
		position: relative;
		z-index: 2;
		font-family: var(--font-heading);
	}

	.badge-row {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		margin-bottom: var(--space-2);
	}

	.detail-info h1 {
		font-family: var(--font-heading);
		font-size: var(--text-h2);
		font-weight: 700;
		color: var(--color-ink);
		margin: 0 0 var(--space-1);
		line-height: 1.2;
	}

	.detail-vendor {
		font-size: 0.75rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: var(--color-accent);
	}

	.detail-category {
		font-size: 0.75rem;
		font-weight: 500;
		color: var(--color-primary);
		padding: 0.15rem 0.625rem;
		background: rgba(30, 58, 95, 0.05);
		border-radius: var(--radius-pill);
	}

	.detail-sku {
		font-size: var(--text-small);
		color: var(--color-muted);
		margin: 0 0 var(--space-3);
		font-weight: 500;
	}

	.detail-description {
		color: var(--color-text);
		line-height: 1.625;
		margin: 0 0 var(--space-4);
		font-size: 1rem;
	}

	.specs-section {
		margin-bottom: var(--space-4);
		background: var(--color-bg);
		padding: var(--space-3) var(--space-4);
		border-radius: var(--radius-md);
		border: 1px solid var(--color-border);
	}

	.specs-section h3 {
		font-family: var(--font-heading);
		font-size: 0.9375rem;
		font-weight: 700;
		color: var(--color-ink);
		margin: 0 0 var(--space-2);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.specs-list {
		margin: 0;
	}

	.spec-row {
		display: flex;
		padding: 0.45rem 0;
		border-bottom: 1px solid var(--color-border);
		font-size: var(--text-small);
	}

	.spec-row:last-child {
		border-bottom: none;
	}

	.spec-row dt {
		font-weight: 600;
		color: var(--color-text);
		width: 40%;
	}

	.spec-row dd {
		color: var(--color-muted);
		margin: 0;
		width: 60%;
	}

	.add-section {
		padding-top: var(--space-4);
		border-top: 1px solid var(--color-border);
	}

	.quantity-row {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		margin-bottom: var(--space-4);
	}

	.quantity-row label {
		font-size: var(--text-small);
		font-weight: 600;
		color: var(--color-text);
	}

	.quantity-input {
		display: flex;
		align-items: center;
		border: 1px solid var(--color-border);
		border-radius: var(--radius-sm);
		overflow: hidden;
		background: var(--color-surface);
	}

	.quantity-input button {
		width: 2.25rem;
		height: 2.25rem;
		border: none;
		background: var(--color-border-subtle);
		cursor: pointer;
		font-size: 1.125rem;
		font-family: var(--font-body);
		color: var(--color-text);
		transition: background-color 0.15s ease;
	}

	.quantity-input button:hover {
		background: var(--color-border);
	}

	.quantity-input input {
		width: 3.5rem;
		height: 2.25rem;
		border: none;
		text-align: center;
		font-size: var(--text-small);
		font-family: var(--font-body);
		font-weight: 600;
		color: var(--color-ink);
		-moz-appearance: textfield;
	}

	.quantity-input input::-webkit-outer-spin-button,
	.quantity-input input::-webkit-inner-spin-button {
		-webkit-appearance: none;
	}

	.add-btn {
		width: 100%;
		padding: 0.875rem;
		background: var(--color-primary);
		color: white;
		border: none;
		border-radius: var(--radius-sm);
		font-size: 1rem;
		font-weight: 700;
		font-family: var(--font-heading);
		cursor: pointer;
		transition: background-color 0.15s ease, transform 0.15s ease, box-shadow 0.15s ease;
		box-shadow: 0 4px 12px rgba(30, 58, 95, 0.15);
	}

	.add-btn:hover {
		background: var(--color-primary-dark);
		transform: translateY(-1px);
		box-shadow: 0 6px 18px rgba(30, 58, 95, 0.25);
	}

	.in-cart-notice {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-2);
		padding: var(--space-4);
		background: var(--color-accent-light);
		border-radius: var(--radius-md);
		color: var(--color-gold-text);
		font-weight: 600;
		font-size: var(--text-small);
		border: 1px solid rgba(212, 162, 52, 0.15);
	}

	.view-cart-btn {
		display: inline-flex;
		align-items: center;
		padding: 0.5rem 1.25rem;
		background: var(--color-primary);
		color: white;
		border-radius: var(--radius-pill);
		font-size: 0.8125rem;
		font-weight: 700;
		font-family: var(--font-heading);
		text-decoration: none;
		transition: background-color 0.15s ease, transform 0.15s ease;
		box-shadow: var(--shadow-sm);
	}

	.view-cart-btn:hover {
		background: var(--color-primary-dark);
		transform: translateY(-1px);
	}

	@media (max-width: 1024px) {
		.detail-layout {
			grid-template-columns: 1fr;
			gap: var(--space-4);
			padding: var(--space-4);
		}
	}
</style>
