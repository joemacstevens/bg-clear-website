-- Fix: admin product management (disable/enable/edit/delete) silently fails
-- The "for all" policy used auth.jwt() which may not resolve the same as
-- current_setting('request.jwt.claims') used in all other fixed policies.
-- Also: admins need to SELECT inactive products to manage them.

drop policy if exists "Authenticated users can view active products" on products;
drop policy if exists "Admins can manage all products" on products;

-- Everyone can see active products
create policy "products_select_active"
  on products for select
  using (is_active = true);

-- Admins can see ALL products (including inactive) for management
create policy "products_select_admin"
  on products for select
  using (
    coalesce(
      (current_setting('request.jwt.claims', true)::jsonb -> 'user_metadata' ->> 'role'),
      ''
    ) = 'admin'
  );

-- Admins can insert products
create policy "products_insert_admin"
  on products for insert
  with check (
    coalesce(
      (current_setting('request.jwt.claims', true)::jsonb -> 'user_metadata' ->> 'role'),
      ''
    ) = 'admin'
  );

-- Admins can update products (toggle status, edit fields)
create policy "products_update_admin"
  on products for update
  using (
    coalesce(
      (current_setting('request.jwt.claims', true)::jsonb -> 'user_metadata' ->> 'role'),
      ''
    ) = 'admin'
  );

-- Admins can delete products
create policy "products_delete_admin"
  on products for delete
  using (
    coalesce(
      (current_setting('request.jwt.claims', true)::jsonb -> 'user_metadata' ->> 'role'),
      ''
    ) = 'admin'
  );
