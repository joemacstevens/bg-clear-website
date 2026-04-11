-- Fix RLS for customer operations:
-- 1. Customers can insert quote_requests
-- 2. Customers can insert quote_request_items for their own quotes
-- 3. Customers can read their own profile
-- 4. Customers can update their own profile

-- Quote requests: ensure customers can create
drop policy if exists "Customers can create quote requests" on quote_requests;
create policy "Customers can create quote requests"
  on quote_requests for insert
  with check (customer_id = auth.uid());

-- Quote request items: ensure customers can insert for their own quotes
drop policy if exists "Customers can add items to their quotes" on quote_request_items;
create policy "Customers can add items to their quotes"
  on quote_request_items for insert
  with check (
    exists (
      select 1 from quote_requests qr
      where qr.id = quote_request_id and qr.customer_id = auth.uid()
    )
  );

-- Profiles: ensure the self-read policy works without recursion
drop policy if exists "Users can view own profile" on profiles;
create policy "Users can view own profile"
  on profiles for select
  using (id = auth.uid());

-- Ensure self-update works
drop policy if exists "Users can update own profile" on profiles;
create policy "Users can update own profile"
  on profiles for update
  using (id = auth.uid())
  with check (id = auth.uid());
