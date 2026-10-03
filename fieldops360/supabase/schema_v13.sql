-- Run this in Supabase > SQL Editor AFTER schema_v12.sql

-- 1. Remove duplicate invoices and assets, and prevent new duplicates (one per job)
delete from invoices a using invoices b
  where a.request_id = b.request_id and a.request_id is not null and (a.created_at, a.id) > (b.created_at, b.id);
create unique index if not exists one_invoice_per_job on invoices (request_id) where request_id is not null;

delete from assets a using assets b
  where a.request_id = b.request_id and a.request_id is not null and (a.created_at, a.id) > (b.created_at, b.id);
create unique index if not exists one_asset_per_job on assets (request_id) where request_id is not null;

-- 2. Super admin can VIEW company data but only managers (and the right staff) can change it
drop policy if exists "manager updates" on requests;
create policy "manager updates" on requests for update using (my_role() = 'manager');

drop policy if exists "staff reply tickets" on tickets;
create policy "staff reply tickets" on tickets for update using (my_role() = 'manager');

drop policy if exists "create assets" on assets;
create policy "create assets" on assets for insert with check (
  my_role() = 'manager'
  or exists (select 1 from requests r where r.id = request_id and r.technician_id = auth.uid()));
drop policy if exists "manager edits assets" on assets;
create policy "manager edits assets" on assets for update using (my_role() = 'manager');

drop policy if exists "manager manages items" on items;
create policy "manager manages items" on items for all using (my_role() = 'manager') with check (my_role() = 'manager');

drop policy if exists "tech writes diagnosis" on diagnoses;
create policy "tech writes diagnosis" on diagnoses for insert with check (
  exists (select 1 from requests r where r.id = request_id and (r.technician_id = auth.uid() or my_role() = 'manager')));
drop policy if exists "tech edits diagnosis" on diagnoses;
create policy "tech edits diagnosis" on diagnoses for update using (
  exists (select 1 from requests r where r.id = request_id and (r.technician_id = auth.uid() or my_role() = 'manager')));

drop policy if exists "tech adds materials" on job_materials;
create policy "tech adds materials" on job_materials for insert with check (
  exists (select 1 from requests r where r.id = request_id and (r.technician_id = auth.uid() or my_role() = 'manager')));

drop policy if exists "create invoices" on invoices;
create policy "create invoices" on invoices for insert with check (
  my_role() in ('manager','accountant')
  or exists (select 1 from requests r where r.id = request_id and r.technician_id = auth.uid()));
drop policy if exists "accountant updates invoices" on invoices;
create policy "accountant updates invoices" on invoices for update using (my_role() = 'accountant');

create or replace function decide_extra(p_id uuid, p_status text) returns void language plpgsql security definer set search_path = public as $$
begin
  update extra_charges e set status = p_status from requests r
  where e.id = p_id and r.id = e.request_id and e.status = 'pending' and p_status in ('approved','rejected')
    and (r.customer_id = auth.uid() or (my_role() = 'manager' and company_ok(r.company_id)));
end $$;

create or replace function review_payment(p_payment uuid, p_action text) returns void language plpgsql security definer set search_path = public as $$
declare pay payments%rowtype;
begin
  if my_role() not in ('accountant','manager') then raise exception 'Not allowed'; end if;
  select * into pay from payments where id = p_payment and company_ok(company_id);
  if not found then raise exception 'Payment not found'; end if;
  if p_action = 'confirm' and pay.status = 'pending' then update payments set status = 'confirmed' where id = p_payment;
  elsif p_action = 'fail' and pay.status = 'pending' then update payments set status = 'failed' where id = p_payment;
  elsif p_action = 'refund' and pay.status = 'confirmed' then update payments set status = 'refunded' where id = p_payment;
  else raise exception 'This change is not possible'; end if;
  perform recalc_invoice(pay.invoice_id);
end $$;

create or replace function inventory_move(p_item uuid, p_change int, p_reason text, p_request uuid default null, p_note text default null)
returns void language plpgsql security definer set search_path = public as $$
declare bal int; cid uuid;
begin
  if my_role() not in ('technician','manager') then raise exception 'Not allowed'; end if;
  if my_role() = 'technician' and p_reason <> 'used' then raise exception 'Not allowed'; end if;
  perform set_config('app.ledger', 'on', true);
  update items set quantity = quantity + p_change where id = p_item and company_ok(company_id)
    returning quantity, company_id into bal, cid;
  if bal is null then raise exception 'Item not found'; end if;
  if bal < 0 then raise exception 'Not enough stock'; end if;
  insert into inventory_transactions (item_id, change, reason, request_id, note, actor, balance, company_id)
  values (p_item, p_change, p_reason, p_request, p_note, auth.uid(), bal, cid);
end $$;
