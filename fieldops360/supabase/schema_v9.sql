-- Run this in Supabase > SQL Editor AFTER schema_v8.sql
-- Fixes "infinite recursion detected in policy for relation profiles"
-- by moving the cross-table checks into helper functions.

create or replace function is_my_customer(p uuid) returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from requests where customer_id = p and technician_id = auth.uid())
$$;

create or replace function my_commission() returns numeric language sql stable security definer set search_path = public as $$
  select commission_pct from profiles where id = auth.uid()
$$;

drop policy if exists "read profiles" on profiles;
create policy "read profiles" on profiles for select using (
  id = auth.uid()
  or my_role() in ('manager','accountant','super_admin')
  or (my_role() = 'technician' and is_my_customer(id)));

drop policy if exists "edit own profile" on profiles;
create policy "edit own profile" on profiles for update using (id = auth.uid())
  with check (role = my_role()
    and commission_pct = my_commission()
    and company_id is not distinct from my_company());
