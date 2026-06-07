-- Link a BG Clear order to its WooCommerce order (the payment-only step).
-- Set when the customer proceeds to payment; used to reconcile the paid webhook.
alter table orders add column if not exists woo_order_id text;
create index if not exists orders_woo_order_id_idx on orders (woo_order_id);
