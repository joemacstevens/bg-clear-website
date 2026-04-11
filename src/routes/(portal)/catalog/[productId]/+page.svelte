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
		quoteCart.addItem(product.id, product.name, product.category, quantity);
		toasts.success(`${product.name} added to quote cart`);
	}
</script>

<svelte:head>
	<title>{product.name} | BG Clear</title>
</svelte:head>

<div class="product-detail">
	<a href="/catalog" class="back-link">&larr; Back to Catalog</a>

	<div class="detail-layout">
		<div class="detail-image">
			{#if product.image_url}
				<img src={product.image_url} alt={product.name} />
			{:else}
				<div class="placeholder-image">
					<span>{categoryLabel(product.category, true).charAt(0)}</span>
				</div>
			{/if}
		</div>

		<div class="detail-info">
			<span class="detail-vendor">{product.vendor_name}</span>
			<span class="detail-category">{categoryLabel(product.category, true)}</span>
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
						This product is in your quote cart.
						<a href="/catalog/quote">View Cart</a>
					</div>
				{:else}
					<div class="quantity-row">
						<label for="qty">Quantity</label>
						<div class="quantity-input">
							<button onclick={() => quantity = Math.max(1, quantity - 1)}>-</button>
							<input id="qty" type="number" bind:value={quantity} min="1" />
							<button onclick={() => quantity++}>+</button>
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
		display: inline-block;
		margin-bottom: var(--space-4);
		color: var(--color-primary);
		font-size: var(--text-small);
		font-weight: 500;
		text-decoration: none;
	}

	.back-link:hover {
		text-decoration: underline;
	}

	.detail-layout {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: var(--space-6);
	}

	.detail-image {
		aspect-ratio: 4/3;
		border-radius: var(--radius-md);
		overflow: hidden;
		background: var(--color-border-subtle);
	}

	.detail-image img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.placeholder-image {
		width: 100%;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		background: linear-gradient(135deg, var(--color-border-subtle), var(--color-border));
	}

	.placeholder-image span {
		font-size: 4rem;
		font-weight: 700;
		color: var(--color-muted);
		opacity: 0.3;
	}

	.detail-info h1 {
		font-family: var(--font-heading);
		font-size: var(--text-h2);
		font-weight: 700;
		color: var(--color-ink);
		margin: var(--space-1) 0 var(--space-2);
	}

	.detail-vendor {
		font-size: 0.75rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--color-accent);
		margin-right: var(--space-2);
	}

	.detail-category {
		font-size: 0.75rem;
		font-weight: 500;
		color: var(--color-muted);
		padding: 0.125rem 0.5rem;
		background: var(--color-border-subtle);
		border-radius: var(--radius-pill);
	}

	.detail-sku {
		font-size: var(--text-small);
		color: var(--color-muted);
		margin: 0 0 var(--space-2);
	}

	.detail-description {
		color: var(--color-text);
		line-height: 1.6;
		margin: 0 0 var(--space-4);
	}

	.specs-section {
		margin-bottom: var(--space-4);
	}

	.specs-section h3 {
		font-family: var(--font-heading);
		font-size: 1rem;
		font-weight: 700;
		color: var(--color-ink);
		margin: 0 0 var(--space-2);
	}

	.specs-list {
		margin: 0;
	}

	.spec-row {
		display: flex;
		padding: 0.5rem 0;
		border-bottom: 1px solid var(--color-border-subtle);
		font-size: var(--text-small);
	}

	.spec-row dt {
		font-weight: 600;
		color: var(--color-text);
		width: 40%;
	}

	.spec-row dd {
		color: var(--color-muted);
		margin: 0;
	}

	.add-section {
		padding-top: var(--space-3);
		border-top: 1px solid var(--color-border);
	}

	.quantity-row {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		margin-bottom: var(--space-3);
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
	}

	.quantity-input button {
		width: 2rem;
		height: 2rem;
		border: none;
		background: var(--color-border-subtle);
		cursor: pointer;
		font-size: 1rem;
		font-family: var(--font-body);
		color: var(--color-text);
	}

	.quantity-input button:hover {
		background: var(--color-border);
	}

	.quantity-input input {
		width: 3rem;
		height: 2rem;
		border: none;
		text-align: center;
		font-size: var(--text-small);
		font-family: var(--font-body);
		-moz-appearance: textfield;
	}

	.quantity-input input::-webkit-outer-spin-button,
	.quantity-input input::-webkit-inner-spin-button {
		-webkit-appearance: none;
	}

	.add-btn {
		width: 100%;
		padding: 0.75rem;
		background: var(--color-primary);
		color: white;
		border: none;
		border-radius: var(--radius-sm);
		font-size: 1rem;
		font-weight: 600;
		font-family: var(--font-body);
		cursor: pointer;
		transition: background 0.15s;
	}

	.add-btn:hover {
		background: var(--color-primary-dark);
	}

	.in-cart-notice {
		text-align: center;
		padding: var(--space-3);
		background: var(--color-accent-light);
		border-radius: var(--radius-sm);
		color: var(--color-accent);
		font-weight: 500;
		font-size: var(--text-small);
	}

	.in-cart-notice a {
		color: var(--color-primary);
		font-weight: 600;
		margin-left: 0.25rem;
	}

	@media (max-width: 768px) {
		.detail-layout {
			grid-template-columns: 1fr;
		}
	}
</style>
