-- ============================================================
-- BROWSE TAXONOMY (decoupled from the pricing `category` enum)
-- ------------------------------------------------------------
-- The 4-value product_category enum stays as the hidden pricing
-- bucket (feeds category_pricing_rules + the pricing view). This
-- adds an independent, nestable browse tree for storefront nav.
-- A product can live in MANY browse nodes (join table).
-- ============================================================

-- Nestable category tree -------------------------------------
create table if not exists product_categories (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid references product_categories(id) on delete cascade,
  name text not null,
  slug text not null unique,
  description text,
  icon text,
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_product_categories_parent on product_categories(parent_id);
create index if not exists idx_product_categories_slug on product_categories(slug);

-- Product <-> category mapping (many-to-many) ----------------
create table if not exists product_category_map (
  product_id uuid not null references products(id) on delete cascade,
  category_id uuid not null references product_categories(id) on delete cascade,
  is_primary boolean not null default false,
  created_at timestamptz not null default now(),
  primary key (product_id, category_id)
);
create index if not exists idx_pcm_category on product_category_map(category_id);
create index if not exists idx_pcm_product on product_category_map(product_id);

-- updated_at trigger (reuse existing helper) -----------------
drop trigger if exists trg_product_categories_updated_at on product_categories;
create trigger trg_product_categories_updated_at
  before update on product_categories
  for each row execute function update_updated_at();

-- RLS (mirror the post-recursion-fix pattern) ----------------
alter table product_categories enable row level security;
alter table product_category_map enable row level security;

drop policy if exists "Anyone can read categories" on product_categories;
create policy "Anyone can read categories"
  on product_categories for select using (true);

drop policy if exists "Admins manage categories" on product_categories;
create policy "Admins manage categories"
  on product_categories for all using (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  );

drop policy if exists "Anyone can read category map" on product_category_map;
create policy "Anyone can read category map"
  on product_category_map for select using (true);

drop policy if exists "Admins manage category map" on product_category_map;
create policy "Admins manage category map"
  on product_category_map for all using (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  );

-- ============================================================
-- SEED TREE
-- ============================================================
-- Top-level nodes
insert into product_categories (name, slug, sort_order) values
  ('Mobility',                    'mobility',            10),
  ('Bath & Safety',               'bath-safety',         20),
  ('Beds & Comfort',              'beds-comfort',        30),
  ('Respiratory',                 'respiratory',         40),
  ('Health Monitoring',           'health-monitoring',   50),
  ('Patient Care & Transfer',     'patient-care',        60),
  ('Clinical & Capital Equipment','clinical-equipment',  70)
on conflict (slug) do nothing;

-- Children (parent resolved by slug)
insert into product_categories (parent_id, name, slug, sort_order)
select p.id, c.name, c.slug, c.sort_order
from (values
  -- Mobility
  ('mobility', 'Canes',                      'canes',                   10),
  ('mobility', 'Walkers & Rollators',        'walkers-rollators',       20),
  ('mobility', 'Wheelchairs',                'wheelchairs',             30),
  ('mobility', 'Mobility Scooters',          'mobility-scooters',       40),
  ('mobility', 'Crutches & Accessories',     'crutches',                50),
  -- Bath & Safety
  ('bath-safety', 'Shower Chairs & Benches', 'shower-chairs',           10),
  ('bath-safety', 'Raised Toilet Seats & Commodes', 'raised-toilet-seats', 20),
  ('bath-safety', 'Grab Bars & Rails',       'grab-bars-rails',         30),
  ('bath-safety', 'Bath Mats',               'bath-mats',               40),
  -- Beds & Comfort
  ('beds-comfort', 'Cushions & Supports',    'cushions-supports',       10),
  ('beds-comfort', 'Pillows & Wedges',       'pillows-wedges',          20),
  ('beds-comfort', 'Pressure-Relief Mattresses', 'pressure-relief-mattresses', 30),
  -- Respiratory
  ('respiratory', 'Oxygen Concentrators',    'oxygen-concentrators',    10),
  ('respiratory', 'CPAP / BiPAP',            'cpap-bipap',              20),
  ('respiratory', 'Nebulizers',              'nebulizers',              30),
  ('respiratory', 'Suction',                 'suction',                 40),
  -- Health Monitoring
  ('health-monitoring', 'Blood Pressure',    'blood-pressure',          10),
  ('health-monitoring', 'Thermometers',      'thermometers',            20),
  ('health-monitoring', 'Pulse Oximeters',   'pulse-oximeters',         30),
  ('health-monitoring', 'Glucose & CGM',     'glucose-cgm',             40),
  ('health-monitoring', 'Patient Monitors',  'patient-monitors',        50),
  -- Patient Care & Transfer
  ('patient-care', 'Patient Lifts & Slings', 'patient-lifts',           10),
  ('patient-care', 'Enteral Feeding',        'enteral-feeding',         20),
  -- Clinical & Capital
  ('clinical-equipment', 'Exam & Treatment Tables', 'exam-tables',      10),
  ('clinical-equipment', 'Imaging Systems',  'imaging-systems',         20),
  ('clinical-equipment', 'Anesthesia & OR',  'anesthesia-or',           30)
) as c(parent_slug, name, slug, sort_order)
join product_categories p on p.slug = c.parent_slug
on conflict (slug) do nothing;

-- Extra leaves discovered during auto-tagging (scales, diagnostics, etc.)
insert into product_categories (parent_id, name, slug, sort_order)
select p.id, c.name, c.slug, c.sort_order from (values
  ('health-monitoring', 'Scales',             'scales',          60),
  ('health-monitoring', 'Diagnostics',        'diagnostics',     70),
  ('patient-care',      'Wound Care',          'wound-care',      30),
  ('patient-care',      'TENS & Pain Relief',  'pain-relief',     40),
  ('beds-comfort',      'Supports & Braces',   'supports-braces', 40)
) as c(parent_slug, name, slug, sort_order)
join product_categories p on p.slug = c.parent_slug
on conflict (slug) do nothing;

-- ============================================================
-- AUTO-TAG PRODUCTS -> LEAF CATEGORIES (keyword rules, idempotent)
-- ============================================================
insert into product_category_map (product_id, category_id)
select p.id, c.id from products p cross join product_categories c where
  (c.slug='canes'                       and p.name ilike '%cane%') or
  (c.slug='walkers-rollators'           and (p.name ilike '%walker%' or p.name ilike '%rollator%')) or
  (c.slug='wheelchairs'                 and p.name ilike '%wheelchair%' and p.name not ilike '%cushion%') or
  (c.slug='mobility-scooters'           and p.name ilike '%scooter%') or
  (c.slug='crutches'                    and p.name ilike '%crutch%') or
  (c.slug='shower-chairs'               and (p.name ilike '%shower chair%' or p.name ilike '%shower bench%' or p.name ilike '%bath chair%' or p.name ilike '%bath bench%' or p.name ilike '%transfer bench%' or p.name ilike '%shower stool%')) or
  (c.slug='raised-toilet-seats'         and (p.name ilike '%toilet seat%' or p.name ilike '%commode%')) or
  (c.slug='grab-bars-rails'             and (p.name ilike '%grab bar%' or p.name ilike '%rail%')) or
  (c.slug='bath-mats'                   and p.name ilike '%mat%' and (p.name ilike '%shower%' or p.name ilike '%bath%')) or
  (c.slug='cushions-supports'           and p.name ilike '%cushion%') or
  (c.slug='pillows-wedges'              and (p.name ilike '%pillow%' or p.name ilike '%wedge%')) or
  (c.slug='pressure-relief-mattresses'  and (p.name ilike '%mattress%' or p.name ilike '%alternating pressure%' or p.name ilike '%low air loss%')) or
  (c.slug='supports-braces'             and (p.name ilike '%lumbar%' or p.name ilike '%brace%')) or
  (c.slug='oxygen-concentrators'        and p.name ilike '%concentrator%') or
  (c.slug='cpap-bipap'                  and (p.name ilike '%cpap%' or p.name ilike '%bipap%' or p.name ilike '%dreamstation%' or p.name ilike '%respironics%')) or
  (c.slug='nebulizers'                  and p.name ilike '%nebulizer%') or
  (c.slug='suction'                     and p.name ilike '%suction%') or
  (c.slug='blood-pressure'              and (p.name ilike '%blood pressure%' or p.name ilike '%bp5450%' or p.name ilike '%cuff%' or p.name ilike '%sphygmomanometer%')) or
  (c.slug='thermometers'                and (p.name ilike '%thermometer%' or p.name ilike '%thermoscan%')) or
  (c.slug='pulse-oximeters'             and p.name ilike '%oximeter%') or
  (c.slug='glucose-cgm'                 and (p.name ilike '%glucose%' or p.name ilike '%cgm%' or p.name ilike '%libre%' or p.name ilike '%onetouch%' or p.name ilike '%verio%')) or
  (c.slug='patient-monitors'            and (p.name ilike '%patient monitor%' or p.name ilike '%intellivue%')) or
  (c.slug='scales'                      and p.name ilike '%scale%') or
  (c.slug='diagnostics'                 and (p.name ilike '%stethoscope%' or p.name ilike '%sphygmomanometer%')) or
  (c.slug='patient-lifts'               and (p.name ilike '%patient lift%' or p.name ilike '%hoyer%' or p.name ilike '%sling%')) or
  (c.slug='enteral-feeding'             and (p.name ilike '%enteral%' or p.name ilike '%feeding%')) or
  (c.slug='wound-care'                  and (p.name ilike '%dressing%' or p.name ilike '%wound%')) or
  (c.slug='pain-relief'                 and (p.name ilike '%tens unit%' or p.name ilike '%tens 7000%')) or
  (c.slug='exam-tables'                 and (p.name ilike '%treatment table%' or p.name ilike '%examination%' or p.name ilike '%exam table%' or p.name ilike '%parallel bars%' or p.name ilike '%hi-lo%')) or
  (c.slug='imaging-systems'             and (p.name ilike '%ultrasound%' or p.name ilike '%c-arm%' or p.name ilike '%fluoroscopy%' or p.name ilike '%x-ray%' or p.name ilike '%mri%')) or
  (c.slug='anesthesia-or'               and (p.name ilike '%anesthesia%' or p.name ilike '%carestation%'))
on conflict do nothing;

-- One primary category per product (deterministic by sort_order)
with pick as (
  select distinct on (m.product_id) m.product_id, m.category_id
  from product_category_map m join product_categories c on c.id = m.category_id
  order by m.product_id, c.sort_order, c.slug
)
update product_category_map m set is_primary = true
from pick where pick.product_id = m.product_id and pick.category_id = m.category_id;
