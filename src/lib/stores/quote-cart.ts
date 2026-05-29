import { writable } from 'svelte/store';
import { browser } from '$app/environment';

export interface CartItem {
	productId: string;
	productName: string;
	quantity: number;
	category: string;
	imageUrl?: string | null;
}

const STORAGE_KEY = 'bgclear-quote-cart';

function loadFromStorage(): CartItem[] {
	if (!browser) return [];
	try {
		const stored = localStorage.getItem(STORAGE_KEY);
		return stored ? JSON.parse(stored) : [];
	} catch {
		return [];
	}
}

function createQuoteCart() {
	const { subscribe, set, update } = writable<CartItem[]>(loadFromStorage());

	// Persist to localStorage on every change
	if (browser) {
		subscribe((items) => {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
		});
	}

	return {
		subscribe,
		addItem(
			productId: string,
			productName: string,
			category: string,
			quantity = 1,
			imageUrl: string | null = null
		) {
			update((items) => {
				const existing = items.find((i) => i.productId === productId);
				if (existing) {
					existing.quantity += quantity;
					if (imageUrl && !existing.imageUrl) existing.imageUrl = imageUrl;
					return [...items];
				}
				return [...items, { productId, productName, quantity, category, imageUrl }];
			});
		},
		removeItem(productId: string) {
			update((items) => items.filter((i) => i.productId !== productId));
		},
		updateQuantity(productId: string, quantity: number) {
			update((items) => {
				const item = items.find((i) => i.productId === productId);
				if (item) item.quantity = Math.max(1, quantity);
				return [...items];
			});
		},
		clear() {
			set([]);
		},
		get itemCount(): number {
			let count = 0;
			subscribe((items) => { count = items.length; })();
			return count;
		}
	};
}

export const quoteCart = createQuoteCart();
