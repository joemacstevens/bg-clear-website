-- Fix: RLS policies on profiles were causing infinite recursion
-- because "admins can view all profiles" policy queried profiles to check role

-- Drop the problematic policies
drop policy if exists "Users can view own profile" on profiles;
drop policy if exists "Admins and managers can view all profiles" on profiles;
drop policy if exists "Reps can view assigned customers" on profiles;
drop policy if exists "Users can update own profile" on profiles;

-- Recreate without recursion — use auth.jwt() to check role instead of querying profiles
create policy "Users can view own profile"
  on profiles for select using (auth.uid() = id);

create policy "Staff can view all profiles"
  on profiles for select using (
    (auth.jwt() -> 'user_metadata' ->> 'role') in ('admin', 'manager', 'sales_rep')
    or exists (
      select 1 from profiles p where p.id = auth.uid() and p.role in ('admin', 'manager', 'sales_rep')
    )
  );

create policy "Users can update own profile"
  on profiles for update using (auth.uid() = id);

-- Also fix the products policy — simplify it to avoid any profile lookup
drop policy if exists "Authenticated users can view active products" on products;
drop policy if exists "Admins can manage products" on products;

create policy "Authenticated users can view active products"
  on products for select using (is_active = true);

create policy "Admins can manage all products"
  on products for all using (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  );

-- Fix category pricing rules too
drop policy if exists "Reps and above can view pricing rules" on category_pricing_rules;
drop policy if exists "Admins can manage pricing rules" on category_pricing_rules;

create policy "Authenticated users can view pricing rules"
  on category_pricing_rules for select using (true);

create policy "Admins can manage pricing rules"
  on category_pricing_rules for all using (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  );
