-- Human-readable account numbers for customers (e.g. BGC-A1001).
-- Distinct from order numbers (BGC-#####) by the "A" marker.

create sequence if not exists customer_account_seq start with 1001;

alter table profiles add column if not exists account_number text unique;

-- Assign an account number to every customer on insert (if not already set).
create or replace function assign_customer_account_number()
returns trigger
language plpgsql
as $$
begin
  if new.role = 'customer' and new.account_number is null then
    new.account_number := 'BGC-A' || nextval('customer_account_seq');
  end if;
  return new;
end;
$$;

drop trigger if exists trg_assign_account_number on profiles;
create trigger trg_assign_account_number
  before insert on profiles
  for each row execute function assign_customer_account_number();

-- Backfill existing customers in signup order so numbering is stable.
do $$
declare r record;
begin
  for r in
    select id from profiles
    where role = 'customer' and account_number is null
    order by created_at
  loop
    update profiles set account_number = 'BGC-A' || nextval('customer_account_seq')
    where id = r.id;
  end loop;
end $$;
