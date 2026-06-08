# BG Clear Sync — Jun 8, 2026

_Participants: Joe Stevens (+ Evens referenced). Processed from transcript._

## Headline shift
**The sales REP is the primary user now — not the customer.** Reps work on
**tablets, in person at pharmacies**, building quotes/orders live during a visit.
Reps already have warm relationships (they sell combs/knickknacks for another
supplier; BG Clear DME is an **add-on** line). ~3 reps live within 2 weeks,
scaling to ~7 by summer; each rep network ≈ up to 100 pharmacies. The customer
self-serve side stays **minimal** (funnel capture) for now; richer customer
self-service is "down the line" (months out). Mantra: **"keep it simple,
stupid — functional, not pretty. Survival mode. Fix kinks as we go."**

---

## Decisions (locked)
1. **Rep-first workflow.** Reps build quotes/orders from scratch for customers,
   on a tablet, in person — optimize the rep experience for **tablet/mobile**.
2. **Payment "Chinese wall."** Even when the rep builds the order in person, the
   **customer pays through their own portal login** — the rep never sees or
   enters the card. (Security + chargeback liability.)
3. **No card storage on BG Clear servers, ever.** Any saved-card capability
   lives on **Bank of America's** side only. (PCI / breach risk.)
4. **Below-target-only approval.** Reps have autonomy at/above target price;
   **only below-target pricing** routes to the admin approval queue.
   → **This is exactly the gate shipped today.** ✅
5. **Reporting lives in Salesforce / future CRM**, fed by the website via API —
   reports are NOT run on the website.
6. **Self-onboarding preferred** for both reps and customers (invite email →
   they create their own account) to avoid manual account creation — but reps
   can ALSO create a customer account on the spot.
7. **Catalog stays Vive-only for now**; same catalog for all roles. (Cardinal /
   Medline etc. later. Reps must learn the catalog to recommend products.)
8. **Credit limits / net terms = future** (too much risk while small).

---

## New build requests (prioritized for "survival mode")

**P1 — now**
- **Rep-built quotes/orders from scratch** (rep-initiated, not waiting on the
  customer to start). _Partially exists (rep quote builder) — strengthen so a
  rep can originate the whole thing._
- **Tablet/mobile-optimized rep UI.**
- **Rep creates a customer account on-site** → system generates the account +
  sends an **email verification** → account live immediately during the visit,
  **AND auto-links the new customer to the rep** who created them.
  - _The "matching" problem:_ if the customer self-registers in front of the
    rep, how does it auto-associate to that rep without admin involvement?
    Likely fix: a **rep-specific invite/signup link (carries rep id)** so signup
    auto-assigns. (Rep-created accounts already auto-assign to the creating rep.)
- **Below-target approval queue** — ✅ DONE (shipped today).

**P2 — soon**
- **"Buy again" / reorder.** Repopulate the cart from a past order → rep
  verifies quickly → sends. Pharmacies reorder the same items weekly/monthly in
  bulk; minimize rep steps (Amazon/Walmart "buy again" pattern).
- **Rep self-onboarding via admin invite** (admin onboards someone → invite
  email → rep self-creates account → admin assigns the `sales_rep` role). Add a
  "create account / send invite" control in the admin panel.
- **Client-agreement email** auto-sent on (pharmacy) account creation
  (compliance — Gina's team): they sign, confirm responsibility to pay.

**P3 — later**
- **Pre-load known pharmacies as leads/potential customers** (McKesson-style:
  type an address → list businesses there → pick yours).
- **Credit limits.**
- **"Add new pricing rule" UI** (Joe noted it's currently missing — you can edit
  the existing rules but not add new ones).

---

## Action items
- [ ] **DNS / domain:** get GoDaddy access (Joe delegates a user or logs in) →
  point the real domain → publish the one-pager. A network ("1C") wants to view
  the live site. _(Ties to the existing Resend/domain-verification blocker.)_
- [ ] **Saturday meeting:** Joe to schedule. Show **Webster** (rep) the rep
  portal; have Webster **demo his current sales system** so we borrow good ideas
  (don't reinvent the wheel). Joe, Evens, Webster, + dev.
- [ ] After the demo, **write the Salesforce questions** (API depth, what data
  to push, ability to assign quotes inside Salesforce).
- [ ] Add the **"add new pricing rule"** admin control.

## Open questions
- **Customer↔rep auto-matching** at signup (the gating UX question for the
  on-site account-creation flow).
- **How deep is the Salesforce Starter API?** (gates the website↔SF sync.)
- **Salesforce vs. building a proprietary CRM** (Joe is exploring building his
  own — ambitious; decide later).

## Already true / confirmed by this call
- Below-target approval gate — **shipped today.**
- No card storage — already the architecture (Woo + BoA only).
- Customer self-register AND rep/admin-create-customer — both already exist
  (rep-created customers already auto-assign to that rep).
