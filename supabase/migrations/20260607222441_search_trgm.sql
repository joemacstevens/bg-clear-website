-- Fuzzy / partial product search (typo tolerance, "oxim" -> Pulse Oximeter)
create extension if not exists pg_trgm;
create index if not exists idx_products_name_trgm on products using gin (name gin_trgm_ops);
create index if not exists idx_products_vendor_trgm on products using gin (vendor_name gin_trgm_ops);
