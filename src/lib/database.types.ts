// Auto-generated types will replace this once Supabase is linked.
// For now, these match our migration schema.

export type UserRole = 'customer' | 'sales_rep' | 'manager' | 'admin';
export type ProductCategory = 'health_monitoring' | 'mobility_safety' | 'specialized_support' | 'capital_equipment';
export type OrderStatus =
	| 'quote_requested' | 'quote_sent' | 'customer_accepted' | 'pending_approval'
	| 'approved' | 'placed_with_supplier' | 'shipped' | 'delivered'
	| 'payment_collected' | 'commission_paid' | 'cancelled';

export interface Profile {
	id: string;
	role: UserRole;
	full_name: string;
	company_name: string | null;
	email: string;
	phone: string | null;
	address_line1: string | null;
	address_line2: string | null;
	city: string | null;
	state: string | null;
	zip: string | null;
	assigned_rep_id: string | null;
	salesforce_lead_id: string | null;
	created_at: string;
	updated_at: string;
}

export interface Product {
	id: string;
	name: string;
	description: string | null;
	category: ProductCategory;
	sku: string | null;
	vendor_name: string;
	vendor_sku: string | null;
	vendor_cost: number;
	margin_reserve_pct: number | null;
	markup_to_target_pct: number | null;
	suggested_premium_pct: number | null;
	bg_cost: number;
	image_url: string | null;
	image_urls: string[];
	specs: Record<string, string>;
	is_active: boolean;
	is_featured: boolean;
	created_at: string;
	updated_at: string;
}

export interface ProductPricing extends Product {
	target_price: number;
	suggested_price: number;
	commission_at_target: number;
	commission_at_suggested: number;
	category_margin_reserve: number;
	category_markup_to_target: number;
	category_suggested_premium: number;
}

export interface CategoryPricingRule {
	id: string;
	category: ProductCategory;
	margin_reserve_min: number;
	margin_reserve_max: number;
	margin_reserve_default: number;
	markup_to_target_min: number;
	markup_to_target_max: number;
	markup_to_target_default: number;
	suggested_premium_min: number;
	suggested_premium_max: number;
	suggested_premium_default: number;
	commission_at_target: number;
	commission_above_target: number;
	updated_at: string;
}

export interface QuoteRequest {
	id: string;
	customer_id: string;
	assigned_rep_id: string | null;
	status: string;
	notes: string | null;
	created_at: string;
	updated_at: string;
}

export interface QuoteRequestItem {
	id: string;
	quote_request_id: string;
	product_id: string;
	quantity: number;
	quoted_price: number | null;
	created_at: string;
}

export type WooSyncStatus = 'not_synced' | 'in_progress' | 'synced' | 'failed';
export type PaymentLifecycleStatus = 'initiated' | 'completed' | 'failed';
export type CybersourceDecision = 'ACCEPT' | 'DECLINE' | 'REVIEW' | 'ERROR' | 'CANCEL';

export interface Order {
	id: string;
	order_number: string;
	customer_id: string;
	rep_id: string;
	quote_request_id: string | null;
	status: OrderStatus;
	subtotal: number | null;
	requires_approval: boolean;
	approval_status: string | null;
	approved_by: string | null;
	approval_notes: string | null;
	supplier_order_ref: string | null;
	tracking_number: string | null;
	payment_collected: boolean;
	payment_collected_at: string | null;
	notes: string | null;
	// WooCommerce export tracking (added 2026-04-11 migration 000012)
	woo_order_id: string | null;
	woo_synced_at: string | null;
	woo_sync_status: WooSyncStatus;
	woo_sync_attempts: number;
	woo_last_attempt_at: string | null;
	woo_sync_error: string | null;
	created_at: string;
	updated_at: string;
}

export interface Payment {
	id: string;
	order_id: string;
	cybersource_transaction_id: string | null;
	amount_cents: number;
	currency: string;
	status: PaymentLifecycleStatus;
	decision: CybersourceDecision | null;
	decision_at: string | null;
	reason_code: string | null;
	auth_code: string | null;
	card_last_four: string | null;
	card_brand: string | null;
	raw_response: Record<string, unknown> | null;
	created_at: string;
}

export interface OrderItem {
	id: string;
	order_id: string;
	product_id: string;
	quantity: number;
	unit_price: number;
	vendor_cost: number;
	bg_cost: number;
	target_price: number;
	commission_amount: number | null;
	created_at: string;
}

// Supabase client database type (simplified for now)
export interface Database {
	public: {
		Tables: {
			profiles: { Row: Profile; Insert: Partial<Profile> & { id: string; email: string; full_name: string }; Update: Partial<Profile> };
			products: { Row: Product; Insert: Omit<Product, 'id' | 'bg_cost' | 'created_at' | 'updated_at'>; Update: Partial<Product> };
			category_pricing_rules: { Row: CategoryPricingRule; Insert: Partial<CategoryPricingRule>; Update: Partial<CategoryPricingRule> };
			quote_requests: { Row: QuoteRequest; Insert: Partial<QuoteRequest>; Update: Partial<QuoteRequest> };
			quote_request_items: { Row: QuoteRequestItem; Insert: Partial<QuoteRequestItem>; Update: Partial<QuoteRequestItem> };
			orders: { Row: Order; Insert: Partial<Order>; Update: Partial<Order> };
			order_items: { Row: OrderItem; Insert: Partial<OrderItem>; Update: Partial<OrderItem> };
			payments: { Row: Payment; Insert: Partial<Payment> & { order_id: string; amount_cents: number }; Update: Partial<Payment> };
		};
		Views: {
			product_pricing: { Row: ProductPricing };
		};
	};
}
