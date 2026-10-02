-- Run this in Supabase > SQL Editor AFTER schema_v4.sql

alter table profiles add column requested_role text check (requested_role = 'technician');

create or replace function handle_new_user() returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into profiles (id, full_name, phone, company_id, requested_role)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'phone',
          nullif(new.raw_user_meta_data->>'company_id','')::uuid,
          case when new.raw_user_meta_data->>'requested_role' = 'technician' then 'technician' end);
  return new;
end $$;
