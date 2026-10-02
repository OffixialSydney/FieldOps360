-- Run this in Supabase > SQL Editor AFTER schema_v7.sql
-- Tightens who can read what (role-based access) and closes tenant gaps.

-- Technicians only see the customers of their own jobs
drop policy if exists "read profiles" on profiles;
create policy "read profiles" on profiles for select using (
  id = auth.uid()
  or my_role() in ('manager','accountant','super_admin')
  or (my_role() = 'technician' and exists (
        select 1 from requests r where r.customer_id = profiles.id and r.technician_id = auth.uid())));

-- Accountants see finance only: no requests, tickets, assets or ratings
drop policy if exists "read requests" on requests;
create policy "read requests" on requests for select using (
  customer_id = auth.uid() or technician_id = auth.uid() or my_role() in ('manager','super_admin'));

drop policy if exists "read tickets" on tickets;
create policy "read tickets" on tickets for select using (
  customer_id = auth.uid() or my_role() in ('manager','super_admin'));

drop policy if exists "read assets" on assets;
create policy "read assets" on assets for select using (
  customer_id = auth.uid() or my_role() in ('manager','super_admin'));

drop policy if exists "read ratings" on ratings;
create policy "read ratings" on ratings for select using (
  customer_id = auth.uid() or technician_id = auth.uid() or my_role() in ('manager','super_admin'));

drop policy if exists "staff read items" on items;
create policy "staff read items" on items for select using (my_role() in ('technician','manager','super_admin'));

-- Stock deduction can only touch the caller's own company
create or replace function use_item(p_item uuid, p_qty int) returns void language sql security definer set search_path = public as $$
  update items set quantity = greatest(quantity - p_qty, 0)
  where id = p_item and my_role() in ('technician','manager','super_admin') and company_ok(company_id);
$$;

-- Uploaded files: only people who can see the job can open or add its files
drop policy if exists "signed-in upload" on storage.objects;
drop policy if exists "signed-in read" on storage.objects;
create policy "job files read" on storage.objects for select to authenticated using (
  bucket_id = 'job-files' and exists (select 1 from requests r where r.id::text = (storage.foldername(name))[1]));
create policy "job files upload" on storage.objects for insert to authenticated with check (
  bucket_id = 'job-files' and exists (select 1 from requests r where r.id::text = (storage.foldername(name))[1]));
