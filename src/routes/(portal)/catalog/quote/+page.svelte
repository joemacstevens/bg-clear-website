<script lang="ts">
	import type { PageData, ActionData } from './$types';
	import { enhance } from '$app/forms';
	import { quoteCart } from '$lib/stores/quote-cart';
	import { toasts } from '$lib/stores/toast';
	import { categoryLabel } from '$lib/utils/categories';
	import { goto } from '$app/navigation';
	import type { CartItem } from '$lib/stores/quote-cart';
	import EmptyState from '$lib/components/portal/EmptyState.svelte';

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
		<a href="/catalog" class="back-link">
			<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" width="16" height="16">
				<path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
			</svg>
			<span>Back to Catalog</span>
		</a>
		<h1>Quote Cart</h1>
		<p>Review your selected products and submit a quote request to your sales representative.</p>
	</div>

	{#if cartItems.length === 0}
		<div class="empty-cart-card">
			<EmptyState
				message="Your quote cart is empty. Browse our catalog to select products."
				actionLabel="Browse Products"
				actionHref="/catalog"
			/>
		</div>
	{:else}
		<div class="cart-items">
			{#each cartItems as item}
				<div class="cart-item">
					<div class="item-primary">
						{#if item.imageUrl}
							<img class="item-thumb" src={item.imageUrl} alt={item.productName} />
						{:else}
							<div class="item-thumb placeholder-image">
								<svg class="placeholder-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none" stroke="currentColor">
									<path d="M0 25h100M0 50h100M0 75h100M25 0v100M50 0v100M75 0v100" stroke="rgba(30, 58, 95, 0.03)" stroke-width="0.5" />
									<path d="M15 85 C 40 85, 60 40, 85 15" stroke="var(--color-gold)" stroke-width="1.5" stroke-linecap="round" opacity="0.15" />
									<path d="M44 32h12v12h12v12H56v12H44V56H32V44h12V32z" fill="var(--color-primary)" opacity="0.08" />
								</svg>
								<span class="placeholder-letter">{categoryLabel(item.category, true).charAt(0)}</span>
							</div>
						{/if}
						<div class="item-info">
							<span class="item-category">{categoryLabel(item.category, true)}</span>
							<h3>{item.productName}</h3>
						</div>
					</div>
					<div class="item-controls">
						<div class="quantity-input">
							<button onclick={() => updateQty(item.productId, item.quantity - 1)} aria-label="Decrease quantity">-</button>
							<input
								type="number"
								value={item.quantity}
								min="1"
								aria-label="Quantity"
								onchange={(e) => updateQty(item.productId, parseInt(e.currentTarget.value) || 1)}
							/>
							<button onclick={() => updateQty(item.productId, item.quantity + 1)} aria-label="Increase quantity">+</button>
						</div>
						<button class="remove-btn" onclick={() => removeItem(item.productId)}>
							<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" width="16" height="16">
								<path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
							</svg>
							<span>Remove</span>
						</button>
					</div>
				</div>
			{/each}
		</div>

		<div class="cart-summary">
			<p class="item-count">{cartItems.length} product{cartItems.length !== 1 ? 's' : ''} in cart</p>
			<p class="price-note">Pricing will be calculated and provided by your assigned sales representative after submission.</p>

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
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		margin-bottom: var(--space-2);
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
		font-size: var(--text-small);
	}

	.empty-cart-card {
		background: var(--color-surface);
		border-radius: var(--radius-md);
		border: 1px solid var(--color-border);
		box-shadow: var(--shadow-sm);
	}

	.cart-items {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
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
		gap: var(--space-4);
		box-shadow: var(--shadow-sm);
		transition: transform 0.2s ease, border-color 0.2s ease;
	}

	.cart-item:hover {
		border-color: rgba(212, 162, 52, 0.3);
		transform: translateY(-1px);
	}

	.item-primary {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		min-width: 0;
		flex: 1;
	}

	.item-thumb {
		width: 60px;
		height: 60px;
		border-radius: var(--radius-sm);
		object-fit: cover;
		background: var(--color-border-subtle);
		border: 1px solid var(--color-border);
		flex-shrink: 0;
	}

	.placeholder-image {
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
		font-size: 1.5rem;
		font-weight: 800;
		color: var(--color-primary);
		opacity: 0.15;
		position: relative;
		z-index: 2;
		font-family: var(--font-heading);
	}

	.item-info {
		min-width: 0;
	}

	.item-info h3 {
		font-family: var(--font-heading);
		font-size: 1.0625rem;
		font-weight: 700;
		color: var(--color-ink);
		margin: 0.125rem 0 0;
		line-height: 1.3;
	}

	.item-category {
		font-size: 0.65rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: var(--color-accent);
	}

	.item-controls {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		flex-shrink: 0;
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
		width: 2rem;
		height: 2rem;
		border: none;
		background: var(--color-border-subtle);
		cursor: pointer;
		font-size: 1rem;
		font-family: var(--font-body);
		color: var(--color-text);
		transition: background-color 0.15s ease;
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
		font-weight: 600;
		color: var(--color-ink);
		-moz-appearance: textfield;
	}

	.quantity-input input::-webkit-outer-spin-button,
	.quantity-input input::-webkit-inner-spin-button {
		-webkit-appearance: none;
	}

	.remove-btn {
		display: inline-flex;
		align-items: center;
		gap: 0.25rem;
		padding: 0.45rem 0.85rem;
		background: transparent;
		border: 1px solid #ef4444;
		color: #ef4444;
		border-radius: var(--radius-sm);
		font-size: 0.8125rem;
		font-weight: 600;
		font-family: var(--font-heading);
		cursor: pointer;
		transition: all 0.15s ease;
	}

	.remove-btn:hover {
		background: #ef4444;
		color: white;
	}

	.cart-summary {
		padding: var(--space-4) var(--space-5);
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		box-shadow: var(--shadow-sm);
	}

	.item-count {
		font-family: var(--font-heading);
		font-size: 1.125rem;
		font-weight: 700;
		color: var(--color-ink);
		margin: 0 0 0.25rem;
	}

	.price-note {
		font-size: var(--text-small);
		color: var(--color-muted);
		margin: 0 0 var(--space-4);
		line-height: 1.5;
	}

	.submit-btn {
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

	.submit-btn:hover:not(:disabled) {
		background: var(--color-primary-dark);
		transform: translateY(-1px);
		box-shadow: 0 6px 18px rgba(30, 58, 95, 0.25);
	}

	.submit-btn:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	@media (max-width: 640px) {
		.cart-item {
			flex-direction: column;
			align-items: stretch;
			padding: var(--space-3);
		}
		.item-controls {
			justify-content: space-between;
			border-top: 1px solid var(--color-border);
			padding-top: var(--space-2);
			margin-top: var(--space-1);
		}
	}
</style>
