# Deeper Categorization & Catalog Search — Implementation Plan

_Status: planning (no code yet). Drafted 2026-06-07._

Goal: give the BG Clear catalog DMEsuperstore-style depth — a real nested
category tree with mega-menu navigation, plus a prominent search with a rich
dropdown. Decisions captured: **multi-category (join table)** so a product can
appear in several browse nodes.

---

## Principle: decouple browse taxonomy from pricing

Two separate concerns, kept separate:

- **Pricing buckets** = the existing 4 `product_category` enum values
  (`health_monitoring`, `mobility_safety`, `specialized_support`,
  `capital_equipment`). These feed `category_pricing_rules` and the pricing
  view. **Left untouched** — the margin engine keeps working as-is.
- **Browse taxonomy** = a NEW nested tree, purely for navigation/merchandising.
  A product's pricing bucket and its browse categories are independent.

Context: DMEsuperstore is a *public* storefront (mega-menu in the global
header). BG Clear's catalog is a *gated B2B portal*, so the mega-menu lives
**inside the catalog area**; the top nav stays `Catalog | Quotes | Orders |
Account`.

Inventory snapshot (active products): 178 total — mobility_safety 91,
specialized_support 40, health_monitoring 28, capital_equipment 19.

---

## 1. Data model (new)

- **`product_categories`** — `id`, `parent_id` (self-ref FK, nullable = top
  level), `name`, `slug` (unique), `description`, `icon`, `sort_order`,
  `is_active`, timestamps. Unlimited depth.
- **`product_category_map`** — `product_id` + `category_id` (composite PK),
  optional `is_primary` flag (drives the product's breadcrumb). Indexed both
  ways.
- **RLS**: portal/public read of active categories; staff-only writes.
- **No change** to `products.category`, `category_pricing_rules`, or the
  pricing view.
- Descendants / breadcrumbs via recursive CTE (fine at ~25–40 nodes; switch to
  a closure table only if it grows large).

## 2. Proposed tree (data-driven from real product names — refine freely)

- **Mobility** → Canes · Walkers & Rollators · Wheelchairs · Mobility Scooters · Crutches & Accessories
- **Bath & Safety** → Shower Chairs & Benches · Raised Toilet Seats & Commodes · Grab Bars & Rails · Bath Mats
- **Beds & Comfort** → Cushions & Supports · Pillows & Wedges · Pressure-Relief Mattresses
- **Respiratory** → Oxygen Concentrators · CPAP/BiPAP · Nebulizers · Suction
- **Health Monitoring** → Blood Pressure · Thermometers · Pulse Oximeters · Glucose & CGM · Patient Monitors
- **Patient Care & Transfer** → Patient Lifts & Slings · Enteral Feeding
- **Clinical / Capital Equipment** → Exam & Treatment Tables · Imaging Systems · Anesthesia & OR

## 3. Auto-tag the 178 products (the real effort)

- Keyword→leaf rule set ("cane", "rollator", "wheelchair", "nebulizer",
  "oximeter", "shower chair", "lift", "mattress", …) writes
  `product_category_map` rows.
- Expect ~80–90% auto-tagged on the first pass; produce a short **review list**
  of ambiguous/unmatched products to place by hand.

## 4. Storefront (catalog)

- **Mega-menu** nav driven by the tree — desktop flyout, mobile accordion.
- **Category landing pages** `/catalog/c/[slug]` — breadcrumb, child-category
  chips, product grid (node + all descendants), filters (price, vendor,
  in-stock), search-within-category.
- Refactor the current 4-button catalog filter to read from the tree.
- **Breadcrumb** on product detail from its primary category.

## 5. Admin management

- CRUD for categories: create, rename, **reparent**, reorder (`sort_order`),
  activate/deactivate.
- Product editor: multi-select category assignment.

---

## Search enhancement

Today: only a small client-side filter on the catalog page (narrows
already-loaded products by name/description/vendor). No prominent bar, no rich
dropdown.

**Level 1 — bigger/prominent bar (~30 min):** enlarge + move to top of catalog
header, full-width, bigger type + icon. Pure styling; no backend change. Can
ship standalone, independent of everything else.

**Level 2 — rich dropdown (~1–1.5 days):** prominent search that opens a panel
on focus:
- **Most Searches** — curated quick pills.
- **Top Products** — live as-you-type results (thumbnail + price + add-to-quote).
- **Popular Categories** — image tiles from the new category tree (why search
  pairs with the categorization work).
- Full **results page** `/catalog/search?q=` with the same filters as category
  pages.
- Backend: small debounced search endpoint querying Supabase. `ilike` is enough
  at 178 products; add a **trigram index (`pg_trgm`)** for typo/partial matches
  ("oxim" → Pulse Oximeter).
- No blog → that third column becomes **Popular Categories** (or "Recently
  ordered" for returning B2B buyers).

Lives in the catalog area (gated portal), not a public global header.

---

## Phasing & rough estimate (dev time)

| Phase | Scope | Est. |
|---|---|---|
| 1 — Foundation | Tables, RLS, seed tree, auto-tag script + review list | ~0.5–1 day |
| 2 — Storefront | Mega-menu + category pages + catalog refactor + breadcrumbs | ~1.5–2 days |
| 3 — Admin | Tree management + product assignment UI | ~1 day |
| Search L1 | Bigger bar | ~30 min |
| Search L2 | Rich dropdown + results page + trgm | ~1–1.5 days |
| Content | Finalize tree names + fix tagging stragglers | a few hrs (your time) |

**Total ≈ 4.5–6 dev-days.** Sequenced so each phase is shippable on its own.
Recommended order: category tree first → Level 2 search (its "Popular
Categories" and results filters lean on the tree), with the Level-1 bigger bar
as an immediate freebie anytime.

## Open decisions before building

1. **Final tree** — adopt the proposed structure or adjust nodes (gating input).
2. **Mega-menu vs. left-sidebar tree** for the catalog (mega-menu matches the
   competitor; a sidebar may suit a B2B reorder workflow better).
3. **Icons** per top-level category (nice-to-have).
4. Search third column: **Popular Categories** vs **Recently ordered**.
