# BG Clear Portal — Demo Walkthrough

_A role-by-role script for teaching the platform (admin · rep · customer)._
_App: **https://bg-clear-website.vercel.app**_

---

## The 30-second pitch

BG Clear is a **B2B quote-to-order portal** for durable medical equipment.
Pharmacies/clinics browse the catalog and **request a quote** (no prices shown);
a **sales rep** prices each quote (with hidden margins the customer never sees);
the customer **accepts and pays** through the Bank of America / WooCommerce
payment step; **admins** manage the catalog, categories, pricing, and users.

---

## Demo logins

**Shared password for all three:** `BGClearDemo2026!`

| Role | Email | Who |
|---|---|---|
| **Admin** | `admin@bgclear.com` | Evens Barthelemy |
| **Sales Rep** | `rep@bgclear.com` | Demo Sales Rep |
| **Customer** | `maria.brooklyn@example.com` | Maria Lopez — Brooklyn Care Pharmacy |

> **Tip:** open three windows — your normal browser for one role and **two
> Incognito/Private windows** for the others — so you can switch between
> admin / rep / customer without logging out each time.

Maria is pre-assigned to the Demo Sales Rep, so her quotes route **straight to
the rep** (clean, no triage step needed).

---

## Act 1 — Customer requests a quote
**Log in as Maria** (`maria.brooklyn@example.com`).

1. **Catalog** opens. Point out the two new things:
   - The big **search bar** — type `oxim` and watch the live dropdown surface
     the *Pulse Oximeters* category **and** matching products with thumbnails.
   - The **category mega-menu** — hover **Mobility** to reveal the flyout
     (Canes, Walkers & Rollators, Wheelchairs, Mobility Scooters…).
2. Click into a category, e.g. **Mobility → Canes**. Note the **breadcrumb**
   (Catalog / Mobility / Canes), the subcategory chips, and "search within."
3. Add **2–3 products** to the cart with **“+ Add to Quote Request.”**
4. Click **Quote Cart** (top-right) → review → **Submit quote request.**

> **Teaching point:** the customer never sees a price. Pricing is entirely the
> rep's job — this protects margin.

---

## Act 2 — Rep prices the quote
**Log in as the Demo Sales Rep** (`rep@bgclear.com`).

1. Open the **Rep Dashboard**. The new quote from **Brooklyn Care Pharmacy**
   is waiting (auto-assigned because Maria has a rep).
2. Open it → the **quote builder**.
3. Demonstrate the rep's powers:
   - Set a **unit price** per line.
   - **Adjust quantities**, **add** another product, or **remove** a line.
   - Point out the **hidden-margin guidance** the rep sees (BG cost / target /
     suggested price) — the customer never sees any of this.
4. **Send the quote** back to the customer.

---

## Act 3 — Customer reviews, accepts, and pays
**Switch back to Maria.**

1. Go to **Quotes** → the quote now sits under **“Ready to order.”**
2. Open it → review the **priced** quote (thumbnails, line totals, grand total).
   Optionally bump a quantity to show it recalculates.
3. **Accept & Continue to Payment** → this creates the **order**.
4. On the order page, **Continue to Payment** → you land on the **branded
   Bank of America / WooCommerce pay page** (BG Clear logo, navy/gold, item
   summary with thumbnails).

> **Don't complete a real charge** — the gateway is in **test mode**. Just show
> that the card form is there and branded. (Stop at the pay page.)

---

## Act 4 — Admin oversight & management
**Log in as Evens** (`admin@bgclear.com`).

1. **Admin dashboard** — totals, recent activity, quick links.
2. **Browse Categories** (new) — show the category **tree management**: add /
   rename / reparent / reorder / activate / delete, with live product counts.
3. **Product Management** — add/edit/disable products.
4. **Pricing Rules** — the per-category margin/markup engine (the “hidden” math).
5. **Users** — see all customers/reps; this is where staff accounts are managed.
6. **Triage note:** if a customer has **no** assigned rep, their quote lands in
   the admin **assignment queue** to be handed to a rep. (Maria has one, so hers
   skipped this — mention it as the fallback path.)

---

## Re-running the demo

- To run it again, just **submit a new quote as Maria** — the flow repeats.
- To reset Maria to a clean slate (clear her quotes/orders), say the word and
  I'll wipe just her demo data.
- All three demo passwords are `BGClearDemo2026!` (change anytime in Supabase →
  Authentication → Users).

---

## Key talking points (the “why”)

- **Quote-gated pricing** keeps margins invisible to customers and fully in the
  rep's control.
- **WooCommerce is only the payment step** (Bank of America CyberSource gateway);
  the catalog, quotes, and portals stay on BG Clear's own platform.
- **Newest additions:** deep **category navigation** (mega-menu + landing pages)
  and a **rich search** (live dropdown + results), plus **self-service password
  recovery**.
