-- Manual / ad-hoc invoices: rep or admin generates a "pay this invoice" link for
-- an arbitrary amount that never went through the quote → order pipeline (phone
-- orders, deposits, ARs the rep is chasing). The link is a WooCommerce order-pay
-- URL (CyberSource collects the card); the Woo `order.paid` webhook flips the
-- matching row to 'paid'. Staff-only — customers never see this table.
create table if not exists public.manual_invoices (
  id             uuid primary key default gen_random_uuid(),
  invoice_number text not null,
  customer_name  text,
  customer_email text,
  description    text,
  amount         numeric(12, 2) not null check (amount > 0),
  status         text not null default 'pending' check (status in ('pending', 'paid', 'void')),
  woo_order_id   text,
  pay_url        text,
  created_by     uuid references public.profiles (id),
  created_at     timestamptz not null default now(),
  paid_at        timestamptz
);

create index if not exists manual_invoices_woo_order_id_idx on public.manual_invoices (woo_order_id);
create index if not exists manual_invoices_created_by_idx on public.manual_invoices (created_by);

alter table public.manual_invoices enable row level security;

-- Reps, managers, and admins can create and manage pay-invoice links. Reads the
-- canonical role from profiles via the SECURITY DEFINER helper (never trust
-- user_metadata — see 20260608000001_harden_rls_use_profiles_role).
drop policy if exists "manual_invoices_staff_all" on public.manual_invoices;
create policy "manual_invoices_staff_all" on public.manual_invoices
  for all using (private.current_user_role() = any (array['admin', 'manager', 'sales_rep']))
  with check (private.current_user_role() = any (array['admin', 'manager', 'sales_rep']));
