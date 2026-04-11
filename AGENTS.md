# BG Clear Portal — Multi-Agent Development Guide

> **If you are an AI agent working on this project, read this file AND `CLAUDE.md` for full project context.**

## Project Overview

BG Clear is a B2B durable medical equipment (DME) drop-shipping company. This website has two parts:
1. **Marketing site** (public) — landing page, about, products, blog
2. **Portal** (authenticated) — three role-based experiences for customers, sales reps, and admins

The portal is built with **SvelteKit** (Svelte 5) + **Supabase** (Postgres + Auth + RLS). The database schema, auth system, and shared libraries are already built. You are building out one of the three portal experiences.

## Tech Stack

- **Framework:** SvelteKit with Svelte 5 (runes: `$state`, `$derived`, `$props`, `$effect`)
- **Backend:** Supabase (Postgres, Auth, Row Level Security)
- **Styling:** CSS custom properties defined in `src/app.css` (no Tailwind)
- **Deployment:** Vercel via `@sveltejs/adapter-vercel`
- **Node:** v24 (required by package.json)

## Architecture

```
src/routes/
  (marketing)/     ← Public site (don't touch)
  (auth)/          ← Login/register (don't touch)
  (portal)/        ← Authenticated portal
    +layout.svelte        ← Shared portal nav (DON'T MODIFY)
    +layout.server.ts     ← Session/profile loading (DON'T MODIFY)
    catalog/              ← Customer experience (Agent 1)
    admin/                ← Admin experience (Agent 2)
    rep/                  ← Rep experience (Agent 3)
```

## Shared Libraries (USE THESE — don't rebuild them)

### UI Components (`$lib/components/portal/`)
- `StatusBadge.svelte` — colored pill for statuses. Props: `status`, `labels`, `colors`
- `StatCard.svelte` — metric display. Props: `value`, `label`, `color`
- `EmptyState.svelte` — empty list placeholder. Props: `message`, `actionLabel`, `actionHref`
- `Modal.svelte` — dialog overlay. Props: `open`, `title`, `onclose`. Slots: `children`, `footer`
- `SearchInput.svelte` — debounced search. Props: `value` (bindable), `placeholder`, `debounce`

### API Helpers (`$lib/api/`)
- `products.ts` — `getProducts()`, `getProductById()`, `getProductPricing()`, `createProduct()`, `updateProduct()`, `deleteProduct()`, `toggleProductActive()`
- `quotes.ts` — `getQuoteRequests()`, `getQuoteRequestById()`, `createQuoteRequest()`, `updateQuoteStatus()`, `setQuotedPrice()`
- `orders.ts` — `getOrders()`, `getOrderById()`, `createOrderFromQuote()`, `updateOrderStatus()`
- `profiles.ts` — `getProfile()`, `updateProfile()`, `getAllProfiles()`, `getCustomersByRep()`, `assignRep()`, `changeRole()`
- `audit.ts` — `logAuditEvent()`, `getAuditLog()`

### Utilities (`$lib/utils/`)
- `format.ts` — `formatCurrency()`, `formatDate()`, `formatDateTime()`, `formatPercentage()`
- `pricing.ts` — `computeBgCost()`, `computeTargetPrice()`, `computeSuggestedPrice()`, `computeCommission()`, `isPriceBelowTarget()`, `priceGuardrailLevel()`
- `categories.ts` — `CATEGORY_LABELS`, `CATEGORY_SHORT_LABELS`, `CATEGORY_COLORS`, `CATEGORY_LIST`, `categoryLabel()`
- `statuses.ts` — `ORDER_STATUS_LABELS`, `ORDER_STATUS_COLORS`, `QUOTE_STATUS_LABELS`, `QUOTE_STATUS_COLORS`

### Stores (`$lib/stores/`)
- `quote-cart.ts` — client-side cart: `quoteCart.addItem()`, `.removeItem()`, `.updateQuantity()`, `.clear()`
- `toast.ts` — notifications: `toasts.success()`, `.error()`, `.info()`

### Database Types (`$lib/database.types.ts`)
All TypeScript interfaces for: `Profile`, `Product`, `ProductPricing`, `CategoryPricingRule`, `QuoteRequest`, `QuoteRequestItem`, `Order`, `OrderItem`

## CSS Design System

Use the CSS variables from `src/app.css`:
```css
/* Colors */
--color-primary: #1e3a5f;   --color-primary-dark: #0f2744;
--color-accent: #0d9488;     --color-accent-light: #ccfbf1;
--color-ink: #0a0f1a;        --color-text: #1e293b;
--color-muted: #64748b;      --color-bg: #fafbfc;
--color-surface: #ffffff;    --color-border: #e2e8f0;

/* Spacing: --space-1 through --space-8 */
/* Radii: --radius-sm, --radius-md, --radius-lg, --radius-pill */
/* Shadows: --shadow-sm, --shadow-md, --shadow-lg */
/* Fonts: --font-heading (Montserrat), --font-body (Inter) */
```

## Database Schema Reference

### Key Tables
- **products** — id, name, description, category, sku, vendor_name, vendor_sku, vendor_cost, image_url, specs (jsonb), is_active, is_featured
- **product_pricing** (VIEW) — extends products with computed: bg_cost, target_price, suggested_price, commission_at_target, commission_at_suggested
- **category_pricing_rules** — per-category margin/markup/premium/commission percentages
- **profiles** — extends auth.users with role, company_name, phone, address, assigned_rep_id
- **quote_requests** — customer_id, assigned_rep_id, status (pending/in_progress/quoted/accepted/declined)
- **quote_request_items** — quote_request_id, product_id, quantity, quoted_price
- **orders** — order_number, customer_id, rep_id, status (full lifecycle enum), requires_approval, approval_status
- **order_items** — order_id, product_id, quantity, unit_price, vendor_cost, bg_cost, target_price, commission_amount
- **audit_log** — user_id, action, entity_type, entity_id, details (jsonb)

### Pricing Model (Evans' Schedule)
```
Vendor Cost → (+internal margin%) → BG Cost → (+markup%) → Target Price → (+premium%) → Suggested Price
```
- Reps see: BG Cost, Target, Suggested, Commission
- Customers see: NOTHING (no pricing)
- Admin sees: Everything including vendor cost

### Demo Accounts (password: demo1234)
- `admin@bgclear.com` — admin role
- `rep@bgclear.com` — sales_rep role
- `customer@demo.com` — customer role

## SvelteKit Patterns

### Server-side data loading
```typescript
// +page.server.ts
export const load: PageServerLoad = async ({ locals }) => {
  const { data } = await locals.supabase.from('products').select('*');
  return { products: data ?? [] };
};
```

### Form actions for mutations
```typescript
// +page.server.ts
export const actions: Actions = {
  create: async ({ request, locals }) => {
    const form = await request.formData();
    const { error } = await locals.supabase.from('products').insert({ ... });
    if (error) return { success: false, error: error.message };
    return { success: true };
  }
};
```

### Svelte 5 component pattern
```svelte
<script lang="ts">
  import type { PageData } from './$types';
  let { data }: { data: PageData } = $props();
  let search = $state('');
  const filtered = $derived(data.items.filter(i => i.name.includes(search)));
</script>
```

---

# Agent Task Briefs

---

## Agent 1: Customer Portal

**Branch:** `feat/customer-portal`
**Scope:** `src/routes/(portal)/catalog/` — ONLY create/modify files here

### What to Build

1. **Product Catalog** (enhance existing `catalog/+page.svelte`)
   - Product grid with category filter pills, search, responsive layout
   - Each card: image, vendor badge, name, description, specs, "Add to Quote" button
   - NO pricing displayed anywhere

2. **Product Detail Pages** (`catalog/[productId]/`)
   - Full product info: all specs, description, images, vendor info
   - "Add to Quote" button with quantity selector
   - Back to catalog link

3. **Quote Cart** (`catalog/quote/`)
   - Review items in cart (from `$lib/stores/quote-cart`)
   - Edit quantities, remove items
   - Submit button creates `quote_request` + `quote_request_items` via `$lib/api/quotes`
   - Clear cart on successful submission
   - Show confirmation / redirect to quote history

4. **Quote History** (`catalog/quotes/`)
   - List all customer's quote requests with StatusBadge
   - Click into detail view showing items, status, rep's quoted prices (if available)

5. **Order History** (`catalog/orders/`)
   - List all customer's orders with status badges
   - Click into detail with items, tracking info, status timeline

6. **Account Page** (`catalog/account/`)
   - Edit profile: full_name, company_name, phone, address fields
   - Display current account info

### Rules
- Query `products` table ONLY (never `product_pricing`)
- Use `quoteCart` store from `$lib/stores/quote-cart`
- Use shared components from `$lib/components/portal/`
- Use API helpers from `$lib/api/`
- Use SvelteKit form actions for all mutations
- Follow CSS variable system from `src/app.css`

---

## Agent 2: Admin Portal

**Branch:** `feat/admin-portal`
**Scope:** `src/routes/(portal)/admin/` — ONLY create/modify files here

### What to Build

1. **Dashboard** (enhance existing `admin/+page.svelte`)
   - Stats: total products, active orders, pending approvals, total revenue
   - Recent activity feed from audit_log
   - Quick links to sub-pages

2. **Product Management** (`admin/products/`)
   - Full CRUD table: sortable, filterable, with inline status toggle
   - Add/Edit product form with image URL field
   - Delete with confirmation via Modal component
   - Show computed pricing (BG Cost, Target, Suggested) using `$lib/utils/pricing`

3. **CSV Import** (`admin/products/import/`)
   - File upload, parse CSV client-side
   - Preview table showing parsed products
   - Validate required fields (name, category, vendor_name, vendor_cost)
   - Bulk insert on confirm

4. **Pricing Rules** (`admin/pricing/`)
   - Editable table of `category_pricing_rules`
   - Inline edit: margin reserve, markup to target, suggested premium, commission rates
   - Enforce min <= default <= max validation
   - Show example computation with sample vendor cost

5. **User Management** (`admin/users/`)
   - Table of all profiles with role badges
   - Change user role via dropdown
   - Assign sales rep to customers via dropdown
   - Click into user detail with their quotes/orders

6. **Approval Queue** (`admin/approvals/`)
   - List orders where `requires_approval = true AND approval_status = 'pending'`
   - Show which items are below target price
   - Approve/reject buttons with notes field

7. **Audit Log** (`admin/audit/`)
   - Paginated table of audit_log entries
   - Filter by action type, entity type, date range

### Rules
- Use `$lib/api/` helpers for all Supabase queries
- Call `logAuditEvent()` on every data mutation
- Use shared components from `$lib/components/portal/`
- Product forms should show computed pricing preview using category rules
- Admin can see vendor_cost (unlike reps who only see BG Cost)

---

## Agent 3: Rep Portal

**Branch:** `feat/rep-portal`
**Scope:** `src/routes/(portal)/rep/` — ONLY create/modify files here

### What to Build

1. **Dashboard** (enhance existing `rep/+page.svelte`)
   - Stats: assigned customers, open quotes, pending orders, total commissions
   - Recent quote requests needing attention
   - Quick actions

2. **Pricing Table** (`rep/pricing/`)
   - Full `product_pricing` view in a sortable, filterable table
   - Columns: Product, Category, Vendor, BG Cost, Target Price, Suggested Price, Commission @ Target, Commission @ Suggested
   - Category filter + search
   - Color-coded: target (amber), suggested (green), commission (blue)

3. **Quote Builder** (`rep/quotes/` and `rep/quotes/[quoteId]/`)
   - List of assigned quote requests with StatusBadge
   - Quote detail: show each item with product info + pricing from `product_pricing` view
   - Per-item `quoted_price` input with guardrail indicators:
     - Green: at or above suggested
     - Amber: between target and suggested
     - Red: below target (flags for approval)
     - Dark red: at or below BG cost (no commission)
   - Live commission preview using `computeCommission()` from `$lib/utils/pricing`
   - Submit quote → update status to 'quoted'

4. **Order Management** (`rep/orders/` and `rep/orders/[orderId]/`)
   - Create order from accepted quote (snapshot pricing to `order_items`)
   - If any item below target → `requires_approval = true`
   - Order list with status filters
   - Order detail with status progression controls

5. **Commission Dashboard** (`rep/commissions/`)
   - Summary cards: total earned, pending, paid
   - Breakdown table by order showing commission per item
   - Filter by date range, order status

6. **Customer List** (`rep/customers/` and `rep/customers/[customerId]/`)
   - List assigned customers (profiles where `assigned_rep_id = current user`)
   - Customer detail: contact info, quote history, order history

### Rules
- Use `product_pricing` VIEW for all pricing data (never raw `products` for pricing)
- Use `computeCommission()` and `priceGuardrailLevel()` from `$lib/utils/pricing`
- Use shared components from `$lib/components/portal/`
- Use API helpers from `$lib/api/`
- Never expose vendor_cost to the UI (reps see BG Cost as their "cost")

---

## How to Run

```bash
nvm use 24 && npm install && npm run dev
```

## Git Workflow

1. Each agent works on its own branch: `feat/customer-portal`, `feat/admin-portal`, `feat/rep-portal`
2. Only create/modify files within your assigned route directory
3. Do NOT modify `$lib/`, `hooks.server.ts`, portal layout, or migration files
4. If you need a shared component that doesn't exist, build it locally in your route directory and note it
5. Commit frequently with clear messages
6. Branches will be merged in order: customer → admin → rep

---

## Development Journal

**Location:** `journal/`

### MANDATORY: After Every Work Session

Before ending any session where work was done, write a journal entry. But first:

**Step 1: Review the conversation history.** Before writing anything, scroll back through the full session conversation. You are looking for:
- Moments where you and Joe went back and forth trying to solve something
- Times you misunderstood what Joe wanted and had to course-correct
- Bugs or problems that took multiple attempts to fix
- Joe's reactions - frustration, excitement, surprise, humor
- Ideas that evolved through discussion (the first idea vs. where you landed)
- Unexpected detours or discoveries

**Step 2: Write the entry.** The journal is not a changelog - it is a story of what actually happened, including the messy parts. Capture the *process*, not just the outcome.

### What Makes a Good Entry

**Do not write this:**
> Fixed bug. Deployed.

**Write this:**
> First attempt did not work. Joe pointed out it was still broken. Second approach partially fixed it. Had to trace through three code paths to find the last edge case.

The second version shows the back-and-forth, the false starts, the human dynamic.

### Tone

- Write like you are telling a coworker what happened today
- Include Joe's actual reactions when notable
- Do not sanitize the struggle - if something took 5 tries, say so
- Capture surprise, frustration, or breakthrough moments
- Note when Joe changed direction mid-conversation

### Structure

Create or update `journal/YYYY-MM-DD.md` with sections: What happened, The conversation, Decisions, Problems/Bugs, Next.

### Reading Context
When starting a new session, read the latest 2-3 journal entries from `journal/` for context.
