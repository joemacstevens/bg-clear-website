-- BG Clear E-Commerce Schema
-- Handles: products, pricing tiers, users/roles, quotes, orders, commissions

-- ============================================================
-- ENUMS
-- ============================================================

create type user_role as enum ('customer', 'sales_rep', 'manager', 'admin');
create type product_category as enum ('health_monitoring', 'mobility_safety', 'specialized_support', 'capital_equipment');
create type order_status as enum (
  'quote_requested', 'quote_sent', 'customer_accepted', 'pending_approval',
  'approved', 'placed_with_supplier', 'shipped', 'delivered',
  'payment_collected', 'commission_paid', 'cancelled'
);
create type approval_status as enum ('pending', 'approved', 'rejected');

-- ============================================================
-- PROFILES (extends Supabase auth.users)
-- ============================================================

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role user_role not null default 'customer',
  full_name text not null,
  company_name text,
  email text not null,
  phone text,
  address_line1 text,
  address_line2 text,
  city text,
  state text,
  zip text,
  -- Sales rep specific
  assigned_rep_id uuid references profiles(id),
  salesforce_lead_id text,
  -- Metadata
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- CATEGORY PRICING RULES (Evans' schedule table)
-- ============================================================

create table category_pricing_rules (
  id uuid primary key default gen_random_uuid(),
  category product_category not null unique,
  -- Internal margin reserve (added to vendor cost before rep sees it)
  margin_reserve_min numeric(5,2) not null, -- e.g. 15.00 for 15%
  margin_reserve_max numeric(5,2) not null,
  margin_reserve_default numeric(5,2) not null,
  -- Markup from BG Cost to Target price
  markup_to_target_min numeric(5,2) not null,
  markup_to_target_max numeric(5,2) not null,
  markup_to_target_default numeric(5,2) not null,
  -- Suggested price premium above target
  suggested_premium_min numeric(5,2) not null,
  suggested_premium_max numeric(5,2) not null,
  suggested_premium_default numeric(5,2) not null,
  -- Rep commission rates
  commission_at_target numeric(5,2) not null default 50.00, -- % of markup dollars
  commission_above_target numeric(5,2) not null default 65.00, -- % of dollars above target
  updated_at timestamptz not null default now()
);

-- Seed Evans' schedule table
insert into category_pricing_rules (
  category,
  margin_reserve_min, margin_reserve_max, margin_reserve_default,
  markup_to_target_min, markup_to_target_max, markup_to_target_default,
  suggested_premium_min, suggested_premium_max, suggested_premium_default,
  commission_at_target, commission_above_target
) values
  ('health_monitoring',    15, 22, 18,   25, 35, 30,   5, 8, 6,   50, 65),
  ('mobility_safety',      18, 25, 20,   28, 38, 32,   5, 8, 6,   50, 65),
  ('specialized_support',  20, 28, 24,   30, 40, 35,   5, 10, 6,  50, 65),
  ('capital_equipment',    12, 20, 15,   25, 35, 28,   3, 7, 4,   50, 65);

-- ============================================================
-- PRODUCTS
-- ============================================================

create table products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  category product_category not null,
  sku text unique,
  -- Vendor info
  vendor_name text not null,
  vendor_sku text,
  vendor_cost numeric(10,2) not null,
  -- Per-product margin overrides (null = use category defaults)
  margin_reserve_pct numeric(5,2),
  markup_to_target_pct numeric(5,2),
  suggested_premium_pct numeric(5,2),
  -- Computed pricing (auto-calculated by trigger)
  bg_cost numeric(10,2) generated always as (
    vendor_cost * (1 + coalesce(margin_reserve_pct, 0) / 100)
  ) stored,
  -- Images
  image_url text,
  image_urls text[] default '{}',
  -- Product details
  specs jsonb default '{}',
  is_active boolean not null default true,
  is_featured boolean not null default false,
  -- Metadata
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Note: bg_cost uses per-product override if set. We'll compute target/suggested
-- in a view that joins category_pricing_rules for the defaults.

-- ============================================================
-- PRODUCT PRICING VIEW (computed prices using category rules)
-- ============================================================

create or replace view product_pricing as
select
  p.id,
  p.name,
  p.description,
  p.category,
  p.sku,
  p.vendor_name,
  p.vendor_sku,
  p.vendor_cost,
  p.image_url,
  p.image_urls,
  p.specs,
  p.is_active,
  p.is_featured,
  -- BG Cost: vendor cost + internal margin reserve
  round(p.vendor_cost * (1 + coalesce(p.margin_reserve_pct, r.margin_reserve_default) / 100), 2) as bg_cost,
  -- Target price: BG Cost + markup to target
  round(
    p.vendor_cost * (1 + coalesce(p.margin_reserve_pct, r.margin_reserve_default) / 100)
    * (1 + coalesce(p.markup_to_target_pct, r.markup_to_target_default) / 100),
    2
  ) as target_price,
  -- Suggested price: Target + suggested premium
  round(
    p.vendor_cost * (1 + coalesce(p.margin_reserve_pct, r.margin_reserve_default) / 100)
    * (1 + coalesce(p.markup_to_target_pct, r.markup_to_target_default) / 100)
    * (1 + coalesce(p.suggested_premium_pct, r.suggested_premium_default) / 100),
    2
  ) as suggested_price,
  -- Commission at target (dollars)
  round(
    (p.vendor_cost * (1 + coalesce(p.margin_reserve_pct, r.margin_reserve_default) / 100)
     * (1 + coalesce(p.markup_to_target_pct, r.markup_to_target_default) / 100)
     - p.vendor_cost * (1 + coalesce(p.margin_reserve_pct, r.margin_reserve_default) / 100))
    * (r.commission_at_target / 100),
    2
  ) as commission_at_target,
  -- Commission at suggested (dollars)
  round(
    (p.vendor_cost * (1 + coalesce(p.margin_reserve_pct, r.margin_reserve_default) / 100)
     * (1 + coalesce(p.markup_to_target_pct, r.markup_to_target_default) / 100)
     - p.vendor_cost * (1 + coalesce(p.margin_reserve_pct, r.margin_reserve_default) / 100))
    * (r.commission_at_target / 100)
    +
    (p.vendor_cost * (1 + coalesce(p.margin_reserve_pct, r.margin_reserve_default) / 100)
     * (1 + coalesce(p.markup_to_target_pct, r.markup_to_target_default) / 100)
     * (1 + coalesce(p.suggested_premium_pct, r.suggested_premium_default) / 100)
     - p.vendor_cost * (1 + coalesce(p.margin_reserve_pct, r.margin_reserve_default) / 100)
     * (1 + coalesce(p.markup_to_target_pct, r.markup_to_target_default) / 100))
    * (r.commission_above_target / 100),
    2
  ) as commission_at_suggested,
  -- Category rule references
  r.margin_reserve_default as category_margin_reserve,
  r.markup_to_target_default as category_markup_to_target,
  r.suggested_premium_default as category_suggested_premium
from products p
join category_pricing_rules r on r.category = p.category;

-- ============================================================
-- QUOTE REQUESTS (customer interest list)
-- ============================================================

create table quote_requests (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references profiles(id),
  assigned_rep_id uuid references profiles(id),
  status text not null default 'pending', -- pending, in_progress, quoted, accepted, declined
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table quote_request_items (
  id uuid primary key default gen_random_uuid(),
  quote_request_id uuid not null references quote_requests(id) on delete cascade,
  product_id uuid not null references products(id),
  quantity int not null default 1,
  -- Rep fills these in when quoting
  quoted_price numeric(10,2),
  created_at timestamptz not null default now()
);

-- ============================================================
-- ORDERS
-- ============================================================

create table orders (
  id uuid primary key default gen_random_uuid(),
  order_number text unique not null default ('BGC-' || lpad(floor(random() * 100000)::text, 5, '0')),
  customer_id uuid not null references profiles(id),
  rep_id uuid not null references profiles(id),
  quote_request_id uuid references quote_requests(id),
  status order_status not null default 'quote_requested',
  -- Pricing
  subtotal numeric(10,2),
  -- Approval
  requires_approval boolean not null default false,
  approval_status approval_status,
  approved_by uuid references profiles(id),
  approval_notes text,
  -- Supplier fulfillment
  supplier_order_ref text,
  tracking_number text,
  -- Payment
  payment_collected boolean not null default false,
  payment_collected_at timestamptz,
  -- Metadata
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  product_id uuid not null references products(id),
  quantity int not null default 1,
  unit_price numeric(10,2) not null, -- the negotiated price
  vendor_cost numeric(10,2) not null, -- snapshot at time of order
  bg_cost numeric(10,2) not null, -- snapshot at time of order
  target_price numeric(10,2) not null, -- snapshot for commission calc
  commission_amount numeric(10,2), -- calculated commission for this line
  created_at timestamptz not null default now()
);

-- ============================================================
-- AUDIT LOG (for pricing approvals)
-- ============================================================

create table audit_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id),
  action text not null,
  entity_type text not null,
  entity_id uuid,
  details jsonb default '{}',
  created_at timestamptz not null default now()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table profiles enable row level security;
alter table products enable row level security;
alter table category_pricing_rules enable row level security;
alter table quote_requests enable row level security;
alter table quote_request_items enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table audit_log enable row level security;

-- Profiles: users can read their own, admins/managers can read all
create policy "Users can view own profile"
  on profiles for select using (auth.uid() = id);

create policy "Admins and managers can view all profiles"
  on profiles for select using (
    exists (select 1 from profiles where id = auth.uid() and role in ('admin', 'manager'))
  );

create policy "Reps can view assigned customers"
  on profiles for select using (
    exists (select 1 from profiles where id = auth.uid() and role = 'sales_rep')
    and assigned_rep_id = auth.uid()
  );

create policy "Users can update own profile"
  on profiles for update using (auth.uid() = id);

-- Products: everyone authenticated can read active products, admins can write
create policy "Authenticated users can view active products"
  on products for select using (auth.role() = 'authenticated' and is_active = true);

create policy "Admins can manage products"
  on products for all using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- Category pricing rules: reps+ can read, admins can write
create policy "Reps and above can view pricing rules"
  on category_pricing_rules for select using (
    exists (select 1 from profiles where id = auth.uid() and role in ('sales_rep', 'manager', 'admin'))
  );

create policy "Admins can manage pricing rules"
  on category_pricing_rules for all using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- Quote requests: customers see their own, reps see assigned, admins see all
create policy "Customers can view own quotes"
  on quote_requests for select using (customer_id = auth.uid());

create policy "Customers can create quote requests"
  on quote_requests for insert with check (customer_id = auth.uid());

create policy "Reps can view assigned quotes"
  on quote_requests for select using (
    exists (select 1 from profiles where id = auth.uid() and role in ('sales_rep', 'manager', 'admin'))
  );

create policy "Reps can update assigned quotes"
  on quote_requests for update using (
    assigned_rep_id = auth.uid()
    or exists (select 1 from profiles where id = auth.uid() and role in ('manager', 'admin'))
  );

-- Quote request items: follow parent access
create policy "Users can view quote items for their quotes"
  on quote_request_items for select using (
    exists (
      select 1 from quote_requests qr
      where qr.id = quote_request_id
      and (qr.customer_id = auth.uid() or qr.assigned_rep_id = auth.uid()
           or exists (select 1 from profiles where id = auth.uid() and role in ('manager', 'admin')))
    )
  );

create policy "Customers can add items to their quotes"
  on quote_request_items for insert with check (
    exists (
      select 1 from quote_requests qr
      where qr.id = quote_request_id and qr.customer_id = auth.uid()
    )
  );

-- Orders: similar to quotes
create policy "Customers can view own orders"
  on orders for select using (customer_id = auth.uid());

create policy "Reps can view and manage orders"
  on orders for all using (
    exists (select 1 from profiles where id = auth.uid() and role in ('sales_rep', 'manager', 'admin'))
  );

create policy "Order items follow order access"
  on order_items for select using (
    exists (
      select 1 from orders o
      where o.id = order_id
      and (o.customer_id = auth.uid() or o.rep_id = auth.uid()
           or exists (select 1 from profiles where id = auth.uid() and role in ('manager', 'admin')))
    )
  );

-- Audit log: admins only
create policy "Admins can view audit log"
  on audit_log for select using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- ============================================================
-- FUNCTIONS
-- ============================================================

-- Auto-create profile on user signup
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce((new.raw_user_meta_data->>'role')::user_role, 'customer')
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- Update updated_at timestamps
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger profiles_updated_at before update on profiles
  for each row execute function update_updated_at();

create trigger products_updated_at before update on products
  for each row execute function update_updated_at();

create trigger quote_requests_updated_at before update on quote_requests
  for each row execute function update_updated_at();

create trigger orders_updated_at before update on orders
  for each row execute function update_updated_at();

-- ============================================================
-- INDEXES
-- ============================================================

create index idx_products_category on products(category);
create index idx_products_vendor on products(vendor_name);
create index idx_products_active on products(is_active) where is_active = true;
create index idx_profiles_role on profiles(role);
create index idx_profiles_assigned_rep on profiles(assigned_rep_id);
create index idx_quote_requests_customer on quote_requests(customer_id);
create index idx_quote_requests_rep on quote_requests(assigned_rep_id);
create index idx_orders_customer on orders(customer_id);
create index idx_orders_rep on orders(rep_id);
create index idx_orders_status on orders(status);
