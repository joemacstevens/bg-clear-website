# BG Clear Portal — Browser Agent Test Scenarios

> **For each scenario:** Navigate the site as the specified user, perform every action described, and report back with:
> 1. What worked as expected
> 2. What failed or errored (include console errors, broken pages, missing data)
> 3. UX issues (confusing flows, missing feedback, layout problems, accessibility gaps)
> 4. Screenshots of any issues found

**Base URL:** http://localhost:5173
**All accounts use password:** `demo1234`

---

## Scenario 1: Customer Experience

**Login as:** `customer@demo.com` / `demo1234`

### 1.1 — Registration Flow (use a new account)
1. Go to `/catalog` — you should be redirected to `/login`
2. Click "Register here" to switch to registration mode
3. Fill in: Full Name: "Test Pharmacy User", Company: "Queens Pharmacy LLC", Phone: "(718) 555-0199", Email: "testpharmacy@example.com", Password: "testpass123"
4. Click "Create Account"
5. **Verify:** You land on `/catalog` and are logged in. The portal nav shows "customer" role badge. The nav should NOT show "Rep Dashboard" or "Admin" links.
6. **Report:** Did registration work? Any errors? How long did it take?

### 1.2 — Catalog Browsing
1. You should see the product catalog with 36 products across 4 categories
2. **Verify:** Products display with name, vendor, description, specs, and placeholder images. NO pricing is shown anywhere (no dollar amounts).
3. Click each category filter pill (Health Monitoring, Mobility & Safety, Specialized Support, Capital Equipment)
4. **Verify:** Products filter correctly for each category. "All Products" shows everything.
5. Type "wheelchair" in the search bar
6. **Verify:** Only wheelchair-related products appear
7. Clear the search
8. **Report:** How does the catalog look? Are cards aligned? Is the grid responsive? Any layout issues?

### 1.3 — Product Detail
1. Click on any product card (e.g., "Drive Medical Nitro Euro Style Rollator Walker")
2. **Verify:** Product detail page loads with full description, all specs, vendor info, and an "Add to Quote" button with a quantity selector
3. **Verify:** NO pricing is visible on this page
4. Change quantity to 3
5. Click "Add to Quote"
6. **Verify:** Some feedback that the item was added (toast notification, button state change, cart count update, etc.)
7. Navigate back to the catalog
8. Add 2-3 more products from different categories
9. **Report:** Does the add-to-quote flow feel intuitive? Is there clear feedback? Can you tell how many items are in your quote?

### 1.4 — Quote Cart & Submission
1. Navigate to the quote cart page (look for a cart link/icon in the nav or a "View Quote" button)
2. **Verify:** All products you added are listed with correct quantities
3. Try changing a quantity — does it update?
4. Try removing an item — does it disappear?
5. Click "Submit Quote Request" (or similar)
6. **Verify:** Success confirmation is shown. Cart is cleared. You're redirected to quote history or shown a confirmation.
7. **Report:** Was it clear how to find the cart? Was the submission flow smooth? Any confusing steps?

### 1.5 — Quote History
1. Navigate to `/catalog/quotes`
2. **Verify:** Your submitted quote appears with a "Pending" status badge
3. Click into the quote detail
4. **Verify:** You can see all items you requested with quantities. Status is shown.
5. **Report:** Is the quote history easy to find? Is the status clear?

### 1.6 — Order History
1. Navigate to `/catalog/orders`
2. **Verify:** Page loads (likely empty for a new user — that's expected)
3. **Verify:** Empty state message is clear and helpful
4. **Report:** Any issues?

### 1.7 — Account Management
1. Navigate to `/catalog/account`
2. **Verify:** Your profile info is pre-filled (name, company, phone, email)
3. Update the phone number to "(718) 555-9999"
4. Click save
5. **Verify:** Success feedback shown. Refresh the page — the updated phone number persists.
6. **Report:** Does the account page work? All fields editable?

### 1.8 — Logout & Access Control
1. Click "Sign Out"
2. **Verify:** You're redirected to the login page or home page
3. Try navigating directly to `/catalog` — you should be redirected to login
4. Try navigating to `/rep` — after logging back in as customer, you should be redirected away (no access)
5. Try navigating to `/admin` — same, no access
6. **Report:** Is access control working properly?

---

## Scenario 2: Sales Rep Experience

**Login as:** `rep@bgclear.com` / `demo1234`

### 2.1 — Dashboard
1. Go to `/rep`
2. **Verify:** Dashboard loads with stat cards: Assigned Customers, Pending Quotes, Active Orders, Total Commission
3. **Verify:** Side navigation shows: Dashboard, Pricing Table, Quotes, Orders, Commissions, Customers
4. **Verify:** The portal nav at the top shows "Rep Dashboard" and "Catalog" links, but NOT "Admin"
5. If there are pending quotes (from Scenario 1), they should appear in "Quotes Needing Attention"
6. Click each quick link at the bottom — verify they navigate correctly
7. **Report:** Does the dashboard give a clear overview? Are the stats accurate? Layout issues?

### 2.2 — Pricing Table
1. Navigate to `/rep/pricing`
2. **Verify:** Table shows all 36 products with columns: Product, Category, Vendor, BG Cost, Target Price, Suggested Price, Commission @ Target, Commission @ Suggested
3. **Verify:** Pricing columns are color-coded (target in amber, suggested in green, commission in blue)
4. **Verify:** No "Vendor Cost" column is visible (reps should NOT see the raw vendor cost)
5. Click category filter pills — products filter correctly
6. Type "CPAP" in search — only CPAP-related products appear
7. **Verify:** All dollar amounts look reasonable (BG Cost < Target < Suggested)
8. **Report:** Is the pricing table readable? Columns aligned? Numbers make sense? Any horizontal scroll issues?

### 2.3 — Quote Builder (the critical test)
1. Navigate to `/rep/quotes`
2. **Verify:** Quote list loads. If the customer submitted a quote in Scenario 1, it should appear here with "Pending" status.
3. Click into a quote (if none exist, note this and skip to 2.4)
4. **Verify:** Quote builder page shows:
   - Customer info (name, company, email)
   - Each requested item with: product name, category, quantity, BG Cost, Target Price, Suggested Price
   - A price input field for each item (pre-filled with Suggested Price)
   - A guardrail indicator showing the pricing level (green/amber/red)
   - A commission preview per item
   - Total estimated commission at the bottom
5. Change one item's price to be ABOVE suggested — guardrail should show green
6. Change one item's price to be BETWEEN target and suggested — guardrail should show amber
7. Change one item's price to be BELOW target — guardrail should show red, and a warning about manager approval should appear
8. Change one item's price to be AT or BELOW BG Cost — should show dark red / "no commission" warning
9. **Verify:** Commission amounts update live as you change prices
10. Click "Send Quote to Customer"
11. **Verify:** Status changes to "Quoted", confirmation shown
12. **Report:** This is the most important page. Is the pricing guardrail system clear? Are the color indicators intuitive? Does the commission preview update in real-time? Any lag or jankiness?

### 2.4 — Order Management
1. Navigate to `/rep/orders`
2. **Verify:** Order list loads (may be empty if no orders created yet)
3. If a quote was accepted, try creating an order from it
4. Click into an order detail
5. **Verify:** Order shows items with unit price, BG cost, target price, line total, and commission
6. **Verify:** Status progression buttons appear (e.g., "Mark as Placed with Supplier")
7. Click a status advancement button
8. **Verify:** Status updates, page reflects the new state
9. **Report:** Does the order flow make sense? Are status transitions clear?

### 2.5 — Commission Dashboard
1. Navigate to `/rep/commissions`
2. **Verify:** Summary cards show Earned, Pending, Paid, and Total
3. **Verify:** Per-order commission breakdown table appears below
4. **Verify:** The payout note about "commission paid on collected revenue" is visible
5. **Report:** Is the commission tracking clear? Do the numbers add up?

### 2.6 — Customer List
1. Navigate to `/rep/customers`
2. **Verify:** Page loads (may show "No customers assigned" if none are assigned to this rep)
3. If customers are listed, click into one
4. **Verify:** Customer detail shows contact info, quote history, and order history
5. **Report:** Is the customer view useful? What's missing?

---

## Scenario 3: Admin Experience

**Login as:** `admin@bgclear.com` / `demo1234`

### 3.1 — Navigation & Access
1. Go to `/admin`
2. **Verify:** Admin page loads. Portal nav shows "Catalog", "Rep Dashboard", AND "Admin" links.
3. **Verify:** You have access to all three portals (catalog, rep, admin)
4. **Report:** Does admin have full access?

### 3.2 — Product Management
1. On the admin page, look for the product management table
2. **Verify:** All 36 products are listed with: Name, Category, Vendor, Vendor Cost, BG Cost, Target, Suggested, Status
3. **Verify:** Admin CAN see Vendor Cost (unlike reps)
4. Click "Add Product" — fill in a test product:
   - Name: "Test Blood Pressure Cuff"
   - Category: Health Monitoring
   - Vendor: "Vive Health"
   - Vendor Cost: 25.00
5. **Verify:** Product is added. Computed pricing (BG Cost, Target, Suggested) appears automatically based on category rules.
6. Find the test product and toggle it inactive
7. **Verify:** Status changes to inactive
8. Log in as customer and verify the inactive product does NOT appear in the catalog
9. **Report:** Does product CRUD work? Is the pricing auto-calculation visible and correct?

### 3.3 — Category Pricing Rules
1. Look for a pricing rules section or page
2. **Verify:** The four category rules are displayed with: Internal Margin Reserve, Markup to Target, Suggested Premium, Commission rates
3. **Verify:** Values match Evans' schedule:
   - Health Monitoring: 18% margin, 30% markup, 6% premium, 50/65% commission
   - Mobility & Safety: 20% margin, 32% markup, 6% premium, 50/65% commission
   - Specialized Support: 24% margin, 35% markup, 6% premium, 50/65% commission
   - Capital Equipment: 15% margin, 28% markup, 4% premium, 50/65% commission
4. If editable, try changing a value and verify products recalculate
5. **Report:** Are pricing rules visible? Editable? Do changes cascade?

### 3.4 — User Management (if built)
1. Look for a user management section
2. **Verify:** All users are listed with roles
3. Try changing a user's role
4. Try assigning a rep to a customer
5. **Report:** Does user management work?

### 3.5 — Approval Queue (if built)
1. Look for an approvals section
2. If a rep created an order with below-target pricing, it should appear here
3. Try approving/rejecting with notes
4. **Report:** Does the approval workflow work?

---

## Cross-Portal Flow Test

This tests the full end-to-end flow across all three roles:

1. **Customer** registers and submits a quote request with 3 products
2. **Rep** logs in, sees the quote, opens the quote builder, sets prices (one at suggested, one between target and suggested, one below target), sends the quote
3. **Customer** logs back in, checks quote history — should see "Quoted" status with the rep's prices
4. **Rep** creates an order from the accepted quote — order should be flagged for approval (below-target item)
5. **Admin** logs in, sees the order in the approval queue, approves it
6. **Rep** advances the order through: Placed with Supplier → Shipped → Delivered → Payment Collected
7. **Rep** checks commission dashboard — commission should appear
8. **Customer** checks order history — order status should reflect the progression

**Report on:** Does data flow correctly across roles? Are there any broken handoffs? Does the status accurately reflect across all three views?

---

## General UX Checklist (check during all scenarios)

- [ ] **Loading states:** Do pages show loading indicators or do they flash empty before data arrives?
- [ ] **Error handling:** What happens if you submit a form with missing fields? Is the error message helpful?
- [ ] **Mobile responsiveness:** Check each major page on a narrow viewport (~375px). Does the layout adapt?
- [ ] **Navigation clarity:** Is it always clear where you are? Can you get back easily?
- [ ] **Empty states:** When there's no data (no quotes, no orders), is the message helpful?
- [ ] **Feedback on actions:** After every button click that mutates data, is there confirmation?
- [ ] **Console errors:** Report any JavaScript errors in the browser console
- [ ] **Broken links:** Any 404s or dead-end pages?
- [ ] **Visual consistency:** Do fonts, colors, spacing, and card styles look consistent across pages?
- [ ] **Data accuracy:** Do numbers (pricing, commissions, totals) calculate correctly?
