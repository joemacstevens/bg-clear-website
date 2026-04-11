-- Enforce positive quantities on quote request items and order items
ALTER TABLE quote_request_items ADD CONSTRAINT quantity_positive CHECK (quantity > 0);
ALTER TABLE order_items ADD CONSTRAINT quantity_positive CHECK (quantity > 0);
