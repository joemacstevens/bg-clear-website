# Scenario 4 — End-to-End Order Flow (Cross-Portal)

## Objective
Test the complete business loop: customer requests a quote → rep prices it (including a below-target item) → quote is sent → customer accepts → rep creates order → admin sees it → commission is recorded.

## Environment
- URL: https://bg-clear-website.vercel.app (or current deployment)
- Accounts:
  - Customer: `customer@bgclear.com` / `demo1234`
  - Sales Rep: `rep@bgclear.com` / `demo1234`
  - Admin: `admin@bgclear.com` / `demo1234`

## Instructions
Run each checkpoint in order. At the end of each checkpoint, record the verification result before proceeding. If a checkpoint fails, stop and report what happened — do not continue to the next checkpoint.

---

## Checkpoint 1 — Customer Submits a Quote Request

**Login as:** `customer@bgclear.com` / `demo1234`

**Steps:**
1. Navigate to the catalog (`/catalog`)
2. Browse or search for a product (try "Blood Pressure" or "CPAP")
3. Add at least 2 different items to a quote request (different categories if possible)
4. Submit the quote request
5. Note the quote ID or confirmation details

**Verify:**
- [ ] Quote request confirmation shown to customer
- [ ] Quote appears in customer's quote history (if visible)
- [ ] Status shows as "Pending"

**Record:** Quote ID or identifying details (customer name, item names, timestamp) for use in Checkpoint 2.

---

## Checkpoint 2 — Rep Prices and Sends Quote (Below Target)

**Login as:** `rep@bgclear.com` / `demo1234`

**Steps:**
1. Navigate to Rep Dashboard (`/rep`)
2. Check "Quotes Needing Attention" — the customer's new quote should appear
3. Click into the quote to open the Quote Builder
4. Verify line items match what the customer requested (correct products, quantities)
5. For one item: set the price **between BG Cost and Target** (below target) to trigger the approval guardrail
6. For the other item: set the price **at or above Suggested** (normal pricing)
7. Observe the guardrail badges and commission calculations update in real time
8. Click "Send Quote to Customer"

**Verify:**
- [ ] Quote appeared in rep's dashboard with correct item count
- [ ] Quote builder showed correct products and quantities
- [ ] Below-target item shows "Below target — needs approval" badge
- [ ] Above-suggested item shows "At/above suggested" badge
- [ ] Commission updates correctly (below-target item should have reduced commission)
- [ ] Success banner appears: "Quote sent to customer successfully"
- [ ] Quote status changes to "Quoted"
- [ ] On the quotes list (`/rep/quotes`), the quote now shows as "Quoted"

**Record:** Which item was priced below target and at what price, for verification in Checkpoint 3.

---

## Checkpoint 3 — Customer Accepts the Quote

**Login as:** `customer@bgclear.com` / `demo1234`

**Steps:**
1. Navigate to the customer's quotes or account area
2. Find the quote that was just sent by the rep
3. Review the quoted prices
4. Accept the quote (if there's an accept action available)

**Verify:**
- [ ] Customer can see the quoted prices from the rep
- [ ] Quote status updates after acceptance
- [ ] If no accept flow exists, record this as "NOT IMPLEMENTED" and proceed to Checkpoint 4

**Note:** If the customer acceptance flow doesn't exist yet, skip to Checkpoint 4 — the rep may be able to create an order directly from a "Quoted" status quote.

---

## Checkpoint 4 — Rep Creates Order from Quote

**Login as:** `rep@bgclear.com` / `demo1234`

**Steps:**
1. Navigate to the quote (from `/rep/quotes` or dashboard)
2. The quote should now show "Create Order from Quote" button (since status is "Quoted" or "Accepted")
3. Click "Create Order from Quote"
4. If the below-target item triggers approval: note the "(Requires Approval)" indicator
5. Observe where you're redirected after order creation

**Verify:**
- [ ] "Create Order from Quote" button was visible
- [ ] Order was created successfully (redirected to order detail page)
- [ ] Order status shows "Pending Approval" (because of the below-target item) OR "Approved" (if all items were above target)
- [ ] Order appears in the rep's Orders list (`/rep/orders`)

**Record:** Order ID and status for Checkpoint 5.

---

## Checkpoint 5 — Admin Reviews Approval Queue

**Login as:** `admin@bgclear.com` / `demo1234`

**Steps:**
1. Navigate to Admin Dashboard (`/admin`)
2. Check the approval queue (`/admin/approvals`)
3. The order with below-target pricing should appear as "Pending Approval"
4. Review the order details — verify which item triggered the approval requirement
5. Approve the order

**Verify:**
- [ ] Order appeared in admin approval queue
- [ ] Order details show which item was below target
- [ ] Approve action works and updates order status
- [ ] If approval queue is empty or the order isn't there, record what the admin dashboard shows

**Record:** Approval result and updated order status.

---

## Checkpoint 6 — Commission Appears for Rep

**Login as:** `rep@bgclear.com` / `demo1234`

**Steps:**
1. Navigate to Commissions (`/rep/commissions`)
2. Check if the order's commission appears in the table
3. Verify commission amounts match the expected calculations:
   - Below-target item: 50% of (min(quoted_price, target_price) - bg_cost)
   - Above-suggested item: 50% of (target - bg_cost) + 65% of (quoted_price - target)

**Verify:**
- [ ] Commission entry exists for the order
- [ ] Commission amounts are correct per the pricing formula
- [ ] Commission status reflects payment terms (should be unpaid/pending since it's based on collected revenue)

---

## Checkpoint 7 — Customer Sees Order in Portal

**Login as:** `customer@bgclear.com` / `demo1234`

**Steps:**
1. Navigate to the customer's order area (account/orders)
2. Find the order created from the accepted quote
3. Check the order status and details

**Verify:**
- [ ] Order is visible to the customer
- [ ] Order status is correct (approved/processing)
- [ ] Order details show the correct items and quantities

---

## Summary Checklist

After all checkpoints, fill in the overall results:

| Checkpoint | Description | Result |
|---|---|---|
| 1 | Customer submits quote request | PASS / FAIL / PARTIAL |
| 2 | Rep prices and sends quote | PASS / FAIL / PARTIAL |
| 3 | Customer accepts quote | PASS / FAIL / NOT IMPLEMENTED |
| 4 | Rep creates order | PASS / FAIL / PARTIAL |
| 5 | Admin approves order | PASS / FAIL / PARTIAL |
| 6 | Commission recorded for rep | PASS / FAIL / PARTIAL |
| 7 | Customer sees order | PASS / FAIL / PARTIAL |

For any FAIL or PARTIAL result, include:
- What happened vs what was expected
- Any error messages or console errors
- Screenshot if possible
- The last successful state before the failure
