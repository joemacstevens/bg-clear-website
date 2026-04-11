-- Fix: the role cast from user_metadata was failing when role is a valid string
-- Also handle case where role metadata might not be provided
create or replace function handle_new_user()
returns trigger as $$
declare
  user_role_val user_role;
begin
  -- Safely try to cast the role, default to 'customer'
  begin
    user_role_val := (new.raw_user_meta_data->>'role')::user_role;
  exception when others then
    user_role_val := 'customer';
  end;

  insert into profiles (id, email, full_name, role)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(user_role_val, 'customer')
  );
  return new;
end;
$$ language plpgsql security definer;
