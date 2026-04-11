-- Add commission percentage columns to product_pricing view
-- so order creation can use computeCommission() with actual DB rates
create or replace view product_pricing as
select
  p.id,
  p.name,
  p.description,
  p.category,
  p.sku,
  p.vendor_name,
  p.vendor_sku,
  p.vendor_cost,
  p.image_url,
  p.image_urls,
  p.specs,
  p.is_active,
  p.is_featured,
  -- BG Cost: vendor cost + internal margin reserve
  round(p.vendor_cost * (1 + coalesce(p.margin_reserve_pct, r.margin_reserve_default) / 100), 2) as bg_cost,
  -- Target price: BG Cost + markup to target
  round(
    p.vendor_cost * (1 + coalesce(p.margin_reserve_pct, r.margin_reserve_default) / 100)
    * (1 + coalesce(p.markup_to_target_pct, r.markup_to_target_default) / 100),
    2
  ) as target_price,
  -- Suggested price: Target + suggested premium
  round(
    p.vendor_cost * (1 + coalesce(p.margin_reserve_pct, r.margin_reserve_default) / 100)
    * (1 + coalesce(p.markup_to_target_pct, r.markup_to_target_default) / 100)
    * (1 + coalesce(p.suggested_premium_pct, r.suggested_premium_default) / 100),
    2
  ) as suggested_price,
  -- Commission at target (dollars)
  round(
    (p.vendor_cost * (1 + coalesce(p.margin_reserve_pct, r.margin_reserve_default) / 100)
     * (1 + coalesce(p.markup_to_target_pct, r.markup_to_target_default) / 100)
     - p.vendor_cost * (1 + coalesce(p.margin_reserve_pct, r.margin_reserve_default) / 100))
    * (r.commission_at_target / 100),
    2
  ) as commission_at_target,
  -- Commission at suggested (dollars)
  round(
    (p.vendor_cost * (1 + coalesce(p.margin_reserve_pct, r.margin_reserve_default) / 100)
     * (1 + coalesce(p.markup_to_target_pct, r.markup_to_target_default) / 100)
     - p.vendor_cost * (1 + coalesce(p.margin_reserve_pct, r.margin_reserve_default) / 100))
    * (r.commission_at_target / 100)
    +
    (p.vendor_cost * (1 + coalesce(p.margin_reserve_pct, r.margin_reserve_default) / 100)
     * (1 + coalesce(p.markup_to_target_pct, r.markup_to_target_default) / 100)
     * (1 + coalesce(p.suggested_premium_pct, r.suggested_premium_default) / 100)
     - p.vendor_cost * (1 + coalesce(p.margin_reserve_pct, r.margin_reserve_default) / 100)
     * (1 + coalesce(p.markup_to_target_pct, r.markup_to_target_default) / 100))
    * (r.commission_above_target / 100),
    2
  ) as commission_at_suggested,
  -- Category rule references
  r.margin_reserve_default as category_margin_reserve,
  r.markup_to_target_default as category_markup_to_target,
  r.suggested_premium_default as category_suggested_premium,
  -- Commission rate percentages (for computing commission on custom quoted prices)
  r.commission_at_target as commission_at_target_pct,
  r.commission_above_target as commission_above_target_pct
from products p
join category_pricing_rules r on r.category = p.category;
