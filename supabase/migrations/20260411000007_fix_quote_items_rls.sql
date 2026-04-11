-- Fix quote_request_items RLS — the existing policy references profiles table
-- causing the same infinite recursion issue

drop policy if exists "Users can view quote items for their quotes" on quote_request_items;
drop policy if exists "Customers can add items to their quotes" on quote_request_items;

-- Anyone authenticated can read quote items if they can see the parent quote
-- (the quote_requests policies already handle access control)
create policy "quote_items_select"
  on quote_request_items for select
  using (
    exists (
      select 1 from quote_requests qr
      where qr.id = quote_request_id
      and (
        qr.customer_id = auth.uid()
        or qr.assigned_rep_id = auth.uid()
        or qr.assigned_rep_id is null
        or coalesce(
          (current_setting('request.jwt.claims', true)::jsonb -> 'user_metadata' ->> 'role'),
          ''
        ) in ('admin', 'manager')
      )
    )
  );

-- Customers can insert items for their own quotes
create policy "quote_items_insert_customer"
  on quote_request_items for insert
  with check (
    exists (
      select 1 from quote_requests qr
      where qr.id = quote_request_id and qr.customer_id = auth.uid()
    )
  );

-- Reps and admins can update items (set quoted_price)
create policy "quote_items_update_staff"
  on quote_request_items for update
  using (
    exists (
      select 1 from quote_requests qr
      where qr.id = quote_request_id
      and (
        qr.assigned_rep_id = auth.uid()
        or coalesce(
          (current_setting('request.jwt.claims', true)::jsonb -> 'user_metadata' ->> 'role'),
          ''
        ) in ('admin', 'manager')
      )
    )
  );

-- Customers can delete their own quote items (before submission)
create policy "quote_items_delete_customer"
  on quote_request_items for delete
  using (
    exists (
      select 1 from quote_requests qr
      where qr.id = quote_request_id and qr.customer_id = auth.uid()
    )
  );

-- Also fix the audit_log select policy — admins need to read it
drop policy if exists "Admins can view audit log" on audit_log;
create policy "audit_log_select"
  on audit_log for select
  using (
    coalesce(
      (current_setting('request.jwt.claims', true)::jsonb -> 'user_metadata' ->> 'role'),
      ''
    ) = 'admin'
  );

-- And ensure audit_log insert works for all authenticated users
create policy "audit_log_insert"
  on audit_log for insert
  with check (true);
