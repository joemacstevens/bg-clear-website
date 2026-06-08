-- =====================================================================
-- Security hardening: stop trusting user-editable auth.user_metadata in
-- RLS. Every admin/staff check previously read the role from
-- (auth.jwt() -> 'user_metadata' ->> 'role'), which the end user can set
-- themselves via supabase.auth.updateUser({ data: { role: 'admin' } }) --
-- a privilege-escalation hole. Read the canonical role from
-- public.profiles instead, via a SECURITY DEFINER helper placed in a
-- non-API-exposed schema (breaks RLS recursion on profiles and avoids the
-- "SECURITY DEFINER function callable via RPC" lint).
--
-- Verified safe before writing: profiles.role and user_metadata.role agree
-- for every existing user, so no one loses access.
-- =====================================================================

create schema if not exists private;

create or replace function private.current_user_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role::text from public.profiles where id = auth.uid();
$$;

revoke all on function private.current_user_role() from public;
grant execute on function private.current_user_role() to anon, authenticated;

-- ---------- products ----------
drop policy if exists "products_select_admin" on public.products;
create policy "products_select_admin" on public.products
  for select using (private.current_user_role() = 'admin');

drop policy if exists "products_insert_admin" on public.products;
create policy "products_insert_admin" on public.products
  for insert with check (private.current_user_role() = 'admin');

drop policy if exists "products_update_admin" on public.products;
create policy "products_update_admin" on public.products
  for update using (private.current_user_role() = 'admin')
  with check (private.current_user_role() = 'admin');

drop policy if exists "products_delete_admin" on public.products;
create policy "products_delete_admin" on public.products
  for delete using (private.current_user_role() = 'admin');

-- ---------- category_pricing_rules ----------
drop policy if exists "Admins can manage pricing rules" on public.category_pricing_rules;
create policy "Admins can manage pricing rules" on public.category_pricing_rules
  for all using (private.current_user_role() = 'admin')
  with check (private.current_user_role() = 'admin');

-- ---------- product_categories ----------
drop policy if exists "Admins manage categories" on public.product_categories;
create policy "Admins manage categories" on public.product_categories
  for all using (private.current_user_role() = 'admin')
  with check (private.current_user_role() = 'admin');

-- ---------- product_category_map ----------
drop policy if exists "Admins manage category map" on public.product_category_map;
create policy "Admins manage category map" on public.product_category_map
  for all using (private.current_user_role() = 'admin')
  with check (private.current_user_role() = 'admin');

-- ---------- orders ----------
drop policy if exists "Reps can view and manage orders" on public.orders;
create policy "Reps can view and manage orders" on public.orders
  for all using (
    rep_id = auth.uid()
    or customer_id = auth.uid()
    or private.current_user_role() = any (array['admin','manager'])
  )
  with check (
    rep_id = auth.uid()
    or customer_id = auth.uid()
    or private.current_user_role() = any (array['admin','manager'])
  );

-- ---------- audit_log ----------
drop policy if exists "audit_log_select" on public.audit_log;
create policy "audit_log_select" on public.audit_log
  for select using (private.current_user_role() = 'admin');

-- ---------- profiles ----------
drop policy if exists "profiles_select_staff" on public.profiles;
create policy "profiles_select_staff" on public.profiles
  for select using (private.current_user_role() = any (array['admin','manager','sales_rep']));

drop policy if exists "profiles_update_admin" on public.profiles;
create policy "profiles_update_admin" on public.profiles
  for update using (private.current_user_role() = 'admin')
  with check (private.current_user_role() = 'admin');

-- ---------- quote_requests ----------
drop policy if exists "Reps can view assigned quotes" on public.quote_requests;
create policy "Reps can view assigned quotes" on public.quote_requests
  for select using (
    assigned_rep_id = auth.uid()
    or private.current_user_role() = any (array['admin','manager','sales_rep'])
  );

drop policy if exists "Reps can update assigned quotes" on public.quote_requests;
create policy "Reps can update assigned quotes" on public.quote_requests
  for update using (
    assigned_rep_id = auth.uid()
    or (assigned_rep_id is null and private.current_user_role() = 'sales_rep')
    or private.current_user_role() = any (array['admin','manager'])
  );

-- ---------- quote_request_items ----------
drop policy if exists "quote_items_select" on public.quote_request_items;
create policy "quote_items_select" on public.quote_request_items
  for select using (
    exists (
      select 1 from public.quote_requests qr
      where qr.id = quote_request_items.quote_request_id
        and (
          qr.customer_id = auth.uid()
          or qr.assigned_rep_id = auth.uid()
          or qr.assigned_rep_id is null
          or private.current_user_role() = any (array['admin','manager'])
        )
    )
  );

drop policy if exists "quote_items_update_staff" on public.quote_request_items;
create policy "quote_items_update_staff" on public.quote_request_items
  for update using (
    exists (
      select 1 from public.quote_requests qr
      where qr.id = quote_request_items.quote_request_id
        and (
          qr.assigned_rep_id = auth.uid()
          or (qr.assigned_rep_id is null and private.current_user_role() = 'sales_rep')
          or private.current_user_role() = any (array['admin','manager'])
        )
    )
  );

-- =====================================================================
-- Other ERROR / cheap WARN fixes
-- =====================================================================

-- product_pricing view: enforce the querying user's RLS, not the creator's.
-- (Note: vendor_cost/margins are still readable through the permissive base-
-- table SELECT policies -- tighten those separately if costs must be hidden.)
alter view public.product_pricing set (security_invoker = on);

-- update_updated_at: pin search_path (was role-mutable)
create or replace function public.update_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- trigger / event-trigger functions should never be callable via PostgREST RPC
revoke all on function public.handle_new_user() from public, anon, authenticated;
revoke all on function public.rls_auto_enable() from public, anon, authenticated;
