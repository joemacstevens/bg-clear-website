# BG Clear Portal - Security & Architecture Code Review

## Executive Summary
This thorough review evaluated the BG Clear e-commerce portal against strict standards for security, human/agent maintainability, and horizontal scalability. While the foundational use of SvelteKit and Supabase provides a solid architectural base, the current implementation contains **several critical security vulnerabilities** involving role desynchronization, data leakage, and improper trust of client inputs. Additionally, there are glaring code inefficiencies, specifically duplicated business logic, that will severely hinder maintainability by both human developers and AI agents.

---

## 🛑 Critical Security Vulnerabilities

### 1. Role Desynchronization (JWT vs Database RLS)
**Severity:** Critical
**Location:** `$lib/api/profiles.ts` and `supabase/migrations/20260411000004_fix_rls_recursion.sql` 
**Issue:** The Supabase Row Level Security (RLS) policies rely strictly on the `user_metadata->>'role'` injected into the user's JWT at login. However, when an Admin promotes a user via the UI, the system only updates the `role` column in the `profiles` table. The underlying `auth.users.raw_user_meta_data` is *never updated*.
**Impact:** If a customer is promoted to an Admin, their JWT still reflects `customer`. The application UI will render the Admin dashboard (since the UI reads the `profiles` table), but every single database request they make will be rejected by RLS. Conversely, a demoted admin retains admin access until their JWT expires. 
**Fix:** Use the Supabase Admin API (`auth.admin.updateUserById`) to synchronize metadata updates inside the `changeRole` server action, or alter the RLS to securely query the `profiles` table using a `SECURITY DEFINER` function to bypass recursive loops.

### 2. Vendor Cost Data Leak
**Severity:** High
**Location:** `src/routes/(portal)/rep/pricing/+page.server.ts`
**Issue:** The project rules explicitly state: *"Never expose vendor_cost to the UI (reps see BG Cost as their 'cost')"*. However, the server load function executes `select('*')` on the `product_pricing` database view.
**Impact:** Even though `vendor_cost` is not visually rendered in the HTML table, it is fully serialized into the page's JSON payload. A rep can easily open the browser dev tools, inspect the network or Svelte store state, and see the exact raw supplier costs for all products, completely comprising pricing negotiations. 
**Fix:** Explicitly limit the queried columns: `.select('id, name, category, vendor_name, bg_cost, target_price, suggested_price, commission_at_target, commission_at_suggested')`.

### 3. Negative Quantity Subtotal Injection
**Severity:** High
**Location:** Base PostgreSQL Schema and `src/routes/(portal)/catalog/quote/+page.server.ts`
**Issue:** Neither the database schema (`quote_request_items` & `order_items`) nor the JSON parsing in the quote submission action enforces that product quantity must be greater than zero. 
**Impact:** A malicious consumer can manually craft a POST request with `quantity: -10` to artificially drive their quote equivalent subtotal into negative values. 
**Fix:** Add `CHECK (quantity > 0)` constraints to the tables in a new database migration and enforce Zod/Joi schema validation on incoming JSON form payloads.

### 4. Unvalidated Arbitrary JSON Import
**Severity:** Medium
**Location:** `src/routes/(portal)/admin/products/import/+page.server.ts`
**Issue:** The Admin's CSV product import trusts the structural integrity of the `JSON.parse(productsJson)` array pushed directly into the `supabase.insert()` method without any structural validation. 
**Impact:** An insider-threat or compromised admin account can bypass Postgres constraints by injecting XSS payloads into string fields natively inside the Postgres tables.
**Fix:** Implement a server-side parser like Zod to rigorously sanitize the array items, enforcing that they exactly match the `Product` schema.

---

## ⚠️ Maintainability & Code Inefficiencies

### 1. Duplicated "Create Order" Logic (Dead Code)
**Location:** `src/lib/api/orders.ts` vs `src/routes/(portal)/rep/quotes/[quoteId]/+page.server.ts`
**Issue:** The API directory contains a 75-line helper function `createOrderFromQuote` representing the most complex transaction in the entire app. However, this helper is completely dead code. The exact same business logic (commission math, order insertion, target price comparison) was rewritten inline inside the server action of the Rep's quote view path. 
**Impact:** AI agents and human developers will inevitably update the API helper expecting changes to occur, oblivious to the duplicated inline logic driving the actual application.

### 2. Fractured Business Logic (Client vs View)
**Location:** `product_pricing` view vs Svelte Server Actions
**Issue:** The `commissionAmount` and Evans' schedule logic is successfully abstracted behind the `product_pricing` PostgreSQL view, acting as a single source of truth. However, during order creation, the Svelte backend entirely ignores the view and re-calculates the commission locally utilizing redundant Javascript logic (`markupDollars * 0.5 + aboveDollars * 0.65`).
**Fix:** Standardize logic execution. Always read `commission` outputs from the view or centralize the Javascript utilities in `$lib/utils/pricing.ts` as specified directly by the repository's `AGENTS.md` guidelines.

### 3. Race Conditions on Quote Acceptance
**Location:** `src/routes/(portal)/rep/quotes/[quoteId]/+page.server.ts`
**Issue:** The quote progression blindly accepts a quote via:
`supabase.update({ status: 'accepted' }).eq('id', params.quoteId)`
**Impact:** It fails to check if the quote is *already* accepted. A rep double-clicking the "Submit Order" button can introduce a race condition triggering two duplicate insertions into the `orders` table simultaneously tied to a singular quote. 
**Fix:** Utilize an optimistic state machine locking approach: `.update(...).eq('id', params.quoteId).eq('status', 'quoted')` — ensuring execution faults out on repeat submissions.

---

## 📈 Scalability Considerations 

### 1. Complete Absence of Pagination
**Location:** `getProducts` and `getAllProfiles`
**Issue:** The platform pulls raw tables (e.g. `supabase.from('products').select('*')`) continuously. 
**Scalability Risk:** For an early staging site, this works. For an expanding enterprise platform hitting thousands of SKUs and users, this will immediately strain Vercel's serverless memory capacities and degrade frontend Hydration speeds. Both `catalog` and `admin` interfaces require immediate implementations of limit/offset pagination or cursor-based infinite scrolling queries.

### 2. Multi-Tenant Architectural Merits
**The Good News:** The decision to lean heavily into Supabase Row Level Security (binding visibility strictly to `auth.uid() = assigned_rep_id` and `customer_id`) rather than maintaining explicit server-side conditionals presents high horizontal scalability. It structurally ensures that as the rep count scales to hundreds, data leakage risks at the API layer remain minimal. 

### Conclusion
The app accomplishes the visual tasks set out by the brief but suffers from an integration disconnect between its UI capabilities and its actual database authority (RLS, schema constraints). Resolving the JWT desync issue and tightening payload constraints are mandatory operations prior to deploying this software.
