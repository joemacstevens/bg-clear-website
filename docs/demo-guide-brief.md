# Brief for Antigravity: BG Clear Demo Guide for Evans & Gina

## What to Create
A one-page visual guide (PDF or polished doc) that Joe can email to Evans and Gina before Tuesday's meeting. It should look professional — use screenshots, callouts, and clear sections. This is their first look at the e-commerce portal.

## Tone
Confident, clear, not overly technical. Write it as if Joe is walking them through it in person. They're business people, not developers. Use "we built" not "we prototyped."

## Site URL
`http://localhost:5173` (or whatever the deployed Vercel URL is — check `bg-clear-website.vercel.app`)

**Important: The site may still be deploying to Vercel. If the Vercel URL doesn't work, use localhost:5173 for screenshots and note that the live URL will be provided in the email.**

---

## Guide Structure

### Section 1: "What We Built" (brief intro)

Write 2-3 sentences explaining the concept:

> We've built the e-commerce portal we discussed. It has three experiences: one for your pharmacy customers, one for your sales reps, and one for you and Gina to manage everything. Customers can browse your DME catalog, request quotes, and track orders — but they never see pricing. Your reps see the full pricing schedule with BG Cost, Target, and Suggested prices, and can build quotes with built-in guardrails. You control the products, pricing rules, users, and approvals from the admin panel.

### Section 2: "How to Test It" (the logins)

Present these three accounts in a clean table or card layout:

| Role | Email | Password | What You'll See |
|---|---|---|---|
| **Customer** (pharmacy buyer) | `customer@demo.com` | `demo1234` | Product catalog (no pricing), quote cart, order history |
| **Sales Rep** | `rep@bgclear.com` | `demo1234` | Pricing table, quote builder with guardrails, orders, commissions |
| **Admin** (Evans & Gina) | `admin@bgclear.com` | `demo1234` | Product management, pricing rules, user management, approval queue |

Add a note: "Try each login to see the experience from each perspective. Start with the Customer view, then switch to Rep, then Admin."

### Section 3: "The Customer Experience" (with screenshots)

Take screenshots and annotate these screens:

1. **Login/Register page** — screenshot, note: "Customers register with their pharmacy name and contact info"
2. **Product catalog** — screenshot showing the product grid with category filters. Callout: "36 products across 4 categories. No pricing shown — by design."
3. **Product detail** — screenshot of a product page. Callout: "Customers see specs and descriptions, add items to their quote cart"
4. **Quote cart** — screenshot showing items in cart. Callout: "They build a quote request and submit it. Your rep gets notified."
5. **Quote history** — screenshot showing submitted quote with "Pending" status

### Section 4: "The Rep Experience" (with screenshots)

1. **Rep dashboard** — screenshot showing stats cards and pending quotes. Callout: "Reps see their assigned customers, pending quotes, active orders, and commission at a glance"
2. **Pricing table** — screenshot of the full pricing table. Callout: "Every product with BG Cost, Target Price, Suggested Price, and Commission — auto-calculated from your schedule"
3. **Quote builder** — THIS IS THE MONEY SHOT. Screenshot showing:
   - A quote with items loaded
   - Price input fields with color-coded guardrails (green/amber/red)
   - Commission preview updating
   - Callout: "Reps set prices within your guardrails. Green = at or above suggested. Amber = between target and suggested. Red = below target (needs your approval). Commission updates in real-time."
4. **Orders** — screenshot of order list or detail

### Section 5: "The Admin Experience" (with screenshots)

1. **Admin dashboard** — screenshot with stats and quick links
2. **Product management** — screenshot of the product table. Callout: "You and Gina can add, edit, and manage products directly. No developer needed."
3. **Pricing rules** — screenshot showing Evans' schedule table in the system. Callout: "Your exact pricing schedule is built in. Change a percentage and every product recalculates automatically."
4. **User management** — screenshot. Callout: "Assign reps to customers, manage roles"
5. **Approval queue** — screenshot. Callout: "When a rep prices below target, the order lands here for your approval"

### Section 6: "What's Next" (brief)

Bullet list:
- Real product images (we have placeholder images right now)
- Email notifications when quotes come in and orders progress
- Salesforce integration for lead capture on registration
- Real Vive Health product catalog import
- Payment processing (if you want customers to pay through the portal)

End with: "Try it out and come to Tuesday's meeting with your questions and feedback. We'll walk through everything together."

---

## Design Notes for Antigravity

- Use the BG Clear brand colors: navy (#1e3a5f), teal accent (#0d9488), clean white backgrounds
- Include the BG Clear logo at the top
- Screenshots should be clean (full browser chrome is fine, but crop out any dev tools)
- Use callout boxes or arrows to highlight key features in screenshots
- Keep it to ONE page if possible (front and back is OK). If it runs longer, max 2 pages.
- Export as PDF for email attachment
- If you can do a short screen recording GIF of the quote builder guardrails changing color as prices change, that would be a killer addition

## Where to Find the Site
- Local: `http://localhost:5173`
- The dev server should be running. If not: `cd ~/Projects/bg-clear-website && nvm use 24 && npm run dev`
- Login credentials are listed above
