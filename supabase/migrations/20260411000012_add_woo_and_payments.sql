-- ============================================================
-- WooCommerce export tracking + Cybersource (BoA) payments
-- ============================================================
-- Adds Woo sync state to `orders` so we can push approved orders
-- into WooCommerce for fulfillment, plus a `payments` table that
-- records Cybersource Secure Acceptance decisions for customer
-- card payments. Customer card flow is hosted (SAQ-A) — no PAN
-- ever touches our database; `raw_response` only stores fields
-- Cybersource has already masked.

-- ============================================================
-- ORDERS: WooCommerce sync columns
-- ============================================================

alter table orders
  add column woo_order_id text,
  add column woo_synced_at timestamptz,
  add column woo_sync_status text not null default 'not_synced'
    check (woo_sync_status in ('not_synced', 'in_progress', 'synced', 'failed')),
  add column woo_sync_attempts int not null default 0,
  add column woo_last_attempt_at timestamptz,
  add column woo_sync_error text;

-- Partial index — most rows will be 'not_synced'/'synced' (the boring states).
-- Admin retry queue only cares about 'in_progress' (stuck) and 'failed'.
create index orders_woo_sync_status_active_idx
  on orders (woo_sync_status, woo_last_attempt_at desc)
  where woo_sync_status in ('in_progress', 'failed');

-- ============================================================
-- PAYMENTS
-- ============================================================

create table payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete restrict,
  cybersource_transaction_id text unique,
  amount_cents int not null check (amount_cents > 0),
  currency text not null default 'USD',
  -- Our lifecycle (what the integration thinks happened):
  status text not null default 'initiated'
    check (status in ('initiated', 'completed', 'failed')),
  -- Cybersource's word (what they returned):
  decision text
    check (decision in ('ACCEPT', 'DECLINE', 'REVIEW', 'ERROR', 'CANCEL')),
  decision_at timestamptz,
  reason_code text,
  auth_code text,
  card_last_four text,
  card_brand text,
  raw_response jsonb,
  created_at timestamptz not null default now()
);

create index payments_order_id_idx on payments(order_id);
create index payments_decision_idx on payments(decision) where decision is not null;

-- ============================================================
-- RLS
-- ============================================================

alter table payments enable row level security;

-- Customers can see their own payments (via the parent order)
create policy "payments_select_customer"
  on payments for select
  using (
    exists (
      select 1 from orders o
      where o.id = payments.order_id and o.customer_id = auth.uid()
    )
  );

-- Reps can see payments for orders they're assigned to
create policy "payments_select_rep"
  on payments for select
  using (
    exists (
      select 1 from orders o
      where o.id = payments.order_id and o.rep_id = auth.uid()
    )
  );

-- Admins and managers see everything. Uses the JWT-claims pattern
-- consistent with 20260411000007 — `auth.jwt()` caused silent
-- RLS recursion failures historically.
create policy "payments_select_staff"
  on payments for select
  using (
    coalesce(
      (current_setting('request.jwt.claims', true)::jsonb -> 'user_metadata' ->> 'role'),
      ''
    ) in ('admin', 'manager')
  );

-- No INSERT/UPDATE/DELETE policies. The Cybersource webhook handler
-- is the only writer and uses the service-role client, which bypasses RLS.
