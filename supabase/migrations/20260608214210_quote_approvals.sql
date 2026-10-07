-- Quote-stage approval: below-target prices must be approved by an admin
-- BEFORE the rep can send the quote to the customer.
alter table quote_requests
  add column if not exists requires_approval boolean not null default false,
  add column if not exists approval_status text not null default 'none',  -- none | pending | approved | rejected
  add column if not exists approval_notes text,
  add column if not exists approved_by uuid references profiles(id),
  add column if not exists approved_at timestamptz;

create index if not exists idx_quote_requests_approval
  on quote_requests (approval_status) where approval_status = 'pending';
