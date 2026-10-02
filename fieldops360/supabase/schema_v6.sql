-- Run this in Supabase > SQL Editor AFTER schema_v5.sql

do $$
declare c text;
begin
  for c in select conname from pg_constraint
           where conrelid = 'public.profiles'::regclass and contype = 'c'
             and pg_get_constraintdef(oid) like '%requested_role%' loop
    execute format('alter table profiles drop constraint %I', c);
  end loop;
end $$;

alter table profiles add constraint requested_role_ok
  check (requested_role in ('technician','manager','accountant'));

create or replace function handle_new_user() returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into profiles (id, full_name, phone, company_id, requested_role)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'phone',
          nullif(new.raw_user_meta_data->>'company_id','')::uuid,
          case when new.raw_user_meta_data->>'requested_role' in ('technician','manager','accountant')
               then new.raw_user_meta_data->>'requested_role' end);
  return new;
end $$;