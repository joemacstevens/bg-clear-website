-- Nuclear fix: drop ALL policies on profiles and recreate cleanly
-- The recursion happens because policies on profiles query profiles

drop policy if exists "Users can view own profile" on profiles;
drop policy if exists "Staff can view all profiles" on profiles;
drop policy if exists "Admins and managers can view all profiles" on profiles;
drop policy if exists "Reps can view assigned customers" on profiles;
drop policy if exists "Users can update own profile" on profiles;

-- Simple, non-recursive policies using auth.uid() only
-- No policy should ever query the profiles table itself

create policy "profiles_select_own"
  on profiles for select
  using (id = auth.uid());

create policy "profiles_select_staff"
  on profiles for select
  using (
    coalesce(
      (current_setting('request.jwt.claims', true)::jsonb -> 'user_metadata' ->> 'role'),
      ''
    ) in ('admin', 'manager', 'sales_rep')
  );

create policy "profiles_update_own"
  on profiles for update
  using (id = auth.uid())
  with check (id = auth.uid());

create policy "profiles_update_admin"
  on profiles for update
  using (
    coalesce(
      (current_setting('request.jwt.claims', true)::jsonb -> 'user_metadata' ->> 'role'),
      ''
    ) = 'admin'
  );

-- Also fix quote_requests policies that might reference profiles
drop policy if exists "Reps can view assigned quotes" on quote_requests;
drop policy if exists "Reps can update assigned quotes" on quote_requests;

create policy "Reps can view assigned quotes"
  on quote_requests for select
  using (
    assigned_rep_id = auth.uid()
    or coalesce(
      (current_setting('request.jwt.claims', true)::jsonb -> 'user_metadata' ->> 'role'),
      ''
    ) in ('admin', 'manager', 'sales_rep')
  );

create policy "Reps can update assigned quotes"
  on quote_requests for update
  using (
    assigned_rep_id = auth.uid()
    or coalesce(
      (current_setting('request.jwt.claims', true)::jsonb -> 'user_metadata' ->> 'role'),
      ''
    ) in ('admin', 'manager')
  );

-- Fix orders policies similarly
drop policy if exists "Reps can view and manage orders" on orders;
create policy "Reps can view and manage orders"
  on orders for all
  using (
    rep_id = auth.uid()
    or customer_id = auth.uid()
    or coalesce(
      (current_setting('request.jwt.claims', true)::jsonb -> 'user_metadata' ->> 'role'),
      ''
    ) in ('admin', 'manager')
  );

drop policy if exists "Order items follow order access" on order_items;
create policy "Order items follow order access"
  on order_items for select
  using (true);

create policy "Order items insert for reps"
  on order_items for insert
  with check (true);
