-- Fix: sales reps could SEE quotes (including unassigned) but couldn't UPDATE them
-- because the update policy only matched assigned_rep_id = auth.uid() or admin/manager.
-- A rep working an unassigned quote would have all writes silently fail.

-- Fix quote_requests update policy
drop policy if exists "Reps can update assigned quotes" on quote_requests;

create policy "Reps can update assigned quotes"
  on quote_requests for update
  using (
    assigned_rep_id = auth.uid()
    or (
      assigned_rep_id is null
      and coalesce(
        (current_setting('request.jwt.claims', true)::jsonb -> 'user_metadata' ->> 'role'),
        ''
      ) = 'sales_rep'
    )
    or coalesce(
      (current_setting('request.jwt.claims', true)::jsonb -> 'user_metadata' ->> 'role'),
      ''
    ) in ('admin', 'manager')
  );

-- Fix quote_request_items update policy
drop policy if exists "quote_items_update_staff" on quote_request_items;

create policy "quote_items_update_staff"
  on quote_request_items for update
  using (
    exists (
      select 1 from quote_requests qr
      where qr.id = quote_request_id
      and (
        qr.assigned_rep_id = auth.uid()
        or (
          qr.assigned_rep_id is null
          and coalesce(
            (current_setting('request.jwt.claims', true)::jsonb -> 'user_metadata' ->> 'role'),
            ''
          ) = 'sales_rep'
        )
        or coalesce(
          (current_setting('request.jwt.claims', true)::jsonb -> 'user_metadata' ->> 'role'),
          ''
        ) in ('admin', 'manager')
      )
    )
  );
