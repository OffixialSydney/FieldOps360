-- Run this in Supabase > SQL Editor AFTER schema_v9.sql
-- Removes EVERY rule on the profiles table and rebuilds a clean set,
-- so no old rule can cause "infinite recursion detected in policy".

do $$
declare p record;
begin
  for p in select policyname from pg_policies where schemaname = 'public' and tablename = 'profiles' loop
    execute format('drop policy %I on public.profiles', p.policyname);
  end loop;
end $$;

-- Helper functions: run with owner rights, so they never trigger table rules
create or replace function my_role() returns text language plpgsql stable security definer set search_path = public as $$
begin
  return (select role from profiles where id = auth.uid());
end $$;

create or replace function my_company() returns uuid language plpgsql stable security definer set search_path = public as $$
begin
  return (select company_id from profiles where id = auth.uid());
end $$;

create or replace function my_commission() returns numeric language plpgsql stable security definer set search_path = public as $$
begin
  return (select commission_pct from profiles where id = auth.uid());
end $$;

create or replace function is_my_customer(p uuid) returns boolean language plpgsql stable security definer set search_path = public as $$
begin
  return exists (select 1 from requests where customer_id = p and technician_id = auth.uid());
end $$;

create or replace function company_ok(c uuid) returns boolean language plpgsql stable security definer set search_path = public as $$
begin
  return my_role() = 'super_admin'
    or (c is not null and c = my_company() and exists (select 1 from companies where id = c and status = 'active'));
end $$;

alter table profiles enable row level security;

-- Companies stay separate
create policy tenant on profiles as restrictive for all
  using (id = auth.uid() or company_ok(company_id))
  with check (id = auth.uid() or company_ok(company_id));

-- Who can read profiles
create policy "read profiles" on profiles for select using (
  id = auth.uid()
  or my_role() in ('manager','accountant','super_admin')
  or (my_role() = 'technician' and is_my_customer(id)));

-- Everyone can edit their own name and phone, but not role, commission or company
create policy "edit own profile" on profiles for update using (id = auth.uid())
  with check (role = my_role() and commission_pct = my_commission() and company_id is not distinct from my_company());

-- Super admin can change any profile (roles, companies, approvals)
create policy "admin edits profiles" on profiles for update
  using (my_role() = 'super_admin') with check (my_role() = 'super_admin');

-- Shows the rules now on the table: you should see exactly 4
select policyname, cmd from pg_policies where schemaname = 'public' and tablename = 'profiles' order by policyname;
