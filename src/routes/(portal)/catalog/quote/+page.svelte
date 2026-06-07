<script lang="ts">
	import type { PageData, ActionData } from './$types';
	import { enhance } from '$app/forms';
	import { quoteCart } from '$lib/stores/quote-cart';
	import { toasts } from '$lib/stores/toast';
	import { categoryLabel } from '$lib/utils/categories';
	import { goto } from '$app/navigation';
	import type { CartItem } from '$lib/stores/quote-cart';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let cartItems: CartItem[] = $state([]);
	quoteCart.subscribe((items) => { cartItems = items; });

	let submitting = $state(false);

	function removeItem(productId: string) {
		quoteCart.removeItem(productId);
		toasts.info('Item removed from cart');
	}

	function updateQty(productId: string, qty: number) {
		quoteCart.updateQuantity(productId, qty);
	}

	$effect(() => {
		if (form?.success) {
			quoteCart.clear();
			toasts.success('Quote request submitted successfully!');
			goto('/catalog/quotes');
		}
		if (form?.error) {
			toasts.error(form.error);
			submitting = false;
		}
	});
</script>

<svelte:head>
	<title>Quote Cart | BG Clear</title>
</svelte:head>

<div class="quote-cart">
	<div class="page-header">
		<a href="/catalog" class="back-link">&larr; Back to Catalog</a>
		<h1>Quote Cart</h1>
		<p>Review your selected products and submit a quote request to your sales representative.</p>
	</div>

	{#if cartItems.length === 0}
		<div class="empty-cart">
			<p>Your quote cart is empty.</p>
			<a href="/catalog" class="browse-link">Browse Products</a>
		</div>
	{:else}
		<div class="cart-items">
			{#each cartItems as item}
				<div class="cart-item">
					{#if item.imageUrl}
						<img class="item-thumb" src={item.imageUrl} alt={item.productName} />
					{:else}
						<div class="item-thumb item-thumb-placeholder" aria-hidden="true"></div>
					{/if}
					<div class="item-info">
						<span class="item-category">{categoryLabel(item.category, true)}</span>
						<h3>{item.productName}</h3>
					</div>
					<div class="item-controls">
						<div class="quantity-input">
							<button onclick={() => updateQty(item.productId, item.quantity - 1)}>-</button>
							<input
								type="number"
								value={item.quantity}
								min="1"
								onchange={(e) => updateQty(item.productId, parseInt(e.currentTarget.value) || 1)}
							/>
							<button onclick={() => updateQty(item.productId, item.quantity + 1)}>+</button>
						</div>
						<button class="remove-btn" onclick={() => removeItem(item.productId)}>
							Remove
						</button>
					</div>
				</div>
			{/each}
		</div>

		<div class="cart-summary">
			<p class="item-count">{cartItems.length} product{cartItems.length !== 1 ? 's' : ''} in cart</p>
			<p class="price-note">Pricing will be provided by your sales representative after review.</p>

			<form method="POST" action="?/submit" use:enhance={() => {
				submitting = true;
				return async ({ result }) => {
					if (result.type === 'success') {
						quoteCart.clear();
						toasts.success('Quote request submitted successfully!');
						goto('/catalog/quotes');
					} else if (result.type === 'failure') {
						toasts.error((result.data as any)?.error ?? 'Submission failed');
						submitting = false;
					} else {
						toasts.error('Something went wrong');
						submitting = false;
					}
				};
			}}>
				<input type="hidden" name="items" value={JSON.stringify(cartItems.map(i => ({ productId: i.productId, quantity: i.quantity })))} />
				<button type="submit" class="submit-btn" disabled={submitting}>
					{submitting ? 'Submitting...' : 'Submit Quote Request'}
				</button>
			</form>
		</div>
	{/if}
</div>

<style>
	.quote-cart {
		padding-bottom: var(--space-8);
	}

	.page-header {
		margin-bottom: var(--space-5);
	}

	.back-link {
		display: inline-block;
		margin-bottom: var(--space-2);
		color: var(--color-primary);
		font-size: var(--text-small);
		font-weight: 500;
		text-decoration: none;
	}

	.back-link:hover {
		text-decoration: underline;
	}

	.page-header h1 {
		font-family: var(--font-heading);
		font-size: var(--text-h2);
		font-weight: 700;
		color: var(--color-ink);
		margin: 0 0 var(--space-1);
	}

	.page-header p {
		color: var(--color-muted);
		margin: 0;
	}

	.empty-cart {
		text-align: center;
		padding: var(--space-8) var(--space-4);
		color: var(--color-muted);
	}

	.browse-link {
		display: inline-block;
		margin-top: var(--space-2);
		padding: 0.5rem 1.25rem;
		background: var(--color-primary);
		color: white;
		border-radius: var(--radius-sm);
		font-weight: 600;
		font-size: var(--text-small);
		text-decoration: none;
	}

	.cart-items {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
		margin-bottom: var(--space-4);
	}

	.cart-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: var(--space-3) var(--space-4);
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		gap: var(--space-3);
	}

	.item-thumb {
		width: 52px;
		height: 52px;
		border-radius: var(--radius-sm);
		object-fit: cover;
		background: var(--color-border-subtle);
		flex-shrink: 0;
	}

	.item-thumb-placeholder {
		border: 1px dashed var(--color-border);
	}

	.item-info {
		flex: 1;
		min-width: 0;
	}

	.item-info h3 {
		font-family: var(--font-heading);
		font-size: 1rem;
		font-weight: 600;
		color: var(--color-ink);
		margin: 0.25rem 0 0;
	}

	.item-category {
		font-size: 0.7rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--color-accent);
	}

	.item-controls {
		display: flex;
		align-items: center;
		gap: var(--space-3);
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

	.remove-btn {
		padding: 0.375rem 0.75rem;
		background: none;
		border: 1px solid #ef4444;
		color: #ef4444;
		border-radius: var(--radius-sm);
		font-size: var(--text-small);
		font-weight: 500;
		font-family: var(--font-body);
		cursor: pointer;
		transition: all 0.15s;
	}

	.remove-btn:hover {
		background: #ef4444;
		color: white;
	}

	.cart-summary {
		padding: var(--space-4);
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
	}

	.item-count {
		font-weight: 600;
		color: var(--color-ink);
		margin: 0 0 var(--space-1);
	}

	.price-note {
		font-size: var(--text-small);
		color: var(--color-muted);
		margin: 0 0 var(--space-3);
	}

	.submit-btn {
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

	.submit-btn:hover:not(:disabled) {
		background: var(--color-primary-dark);
	}

	.submit-btn:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	@media (max-width: 640px) {
		.cart-item {
			flex-direction: column;
			align-items: flex-start;
		}
		.item-controls {
			width: 100%;
			justify-content: space-between;
		}
	}
</style>
