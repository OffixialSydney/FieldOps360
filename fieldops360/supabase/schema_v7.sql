-- Run this in Supabase > SQL Editor AFTER schema_v6.sql

alter table profiles add column email text;

-- Fill in the email for accounts that already exist
update profiles p set email = u.email from auth.users u where u.id = p.id;

-- Save the email for every new signup
create or replace function handle_new_user() returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into profiles (id, full_name, phone, email, company_id, requested_role)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'phone', new.email,
          nullif(new.raw_user_meta_data->>'company_id','')::uuid,
          case when new.raw_user_meta_data->>'requested_role' in ('technician','manager','accountant')
               then new.raw_user_meta_data->>'requested_role' end);
  return new;
end $$;
