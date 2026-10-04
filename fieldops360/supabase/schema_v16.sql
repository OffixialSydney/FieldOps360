-- Run this in Supabase > SQL Editor AFTER schema_v15.sql

-- 1. Ratings now go from 1 to 10
do $$
declare c text;
begin
  for c in select conname from pg_constraint
           where conrelid = 'public.ratings'::regclass and contype = 'c' and pg_get_constraintdef(oid) like '%stars%' loop
    execute format('alter table ratings drop constraint %I', c);
  end loop;
end $$;
alter table ratings add constraint ratings_stars_check check (stars between 1 and 10);

-- 2. Approved additional work gets its own invoice that the customer pays first
alter table invoices add column kind text not null default 'final' check (kind in ('final','additional'));
drop index if exists one_invoice_per_job;
create unique index one_final_invoice_per_job on invoices (request_id) where request_id is not null and kind = 'final';
alter table extra_charges add column invoice_id uuid references invoices(id);

create or replace function invoice_status_sync() returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.kind <> 'final' then return new; end if;
  if tg_op = 'INSERT' then
    update requests set status = 'invoiced' where id = new.request_id and status = 'completed';
  elsif new.status = 'paid' and old.status is distinct from 'paid' then
    update requests set status = 'paid' where id = new.request_id and status in ('completed','invoiced');
  end if;
  return new;
end $$;

create or replace function decide_extra(p_id uuid, p_status text) returns void language plpgsql security definer set search_path = public as $$
declare e extra_charges%rowtype; r requests%rowtype; inv uuid; its jsonb;
begin
  if p_status not in ('approved','rejected') then raise exception 'Invalid choice'; end if;
  select * into e from extra_charges where id = p_id and status = 'pending';
  if not found then raise exception 'This request was already answered'; end if;
  select * into r from requests where id = e.request_id and customer_id = auth.uid();
  if not found then raise exception 'Not allowed'; end if;
  update extra_charges set status = p_status where id = p_id;
  if p_status = 'approved' then
    select jsonb_agg(jsonb_build_object('label', l->>'label', 'qty', 1, 'unit_price', (l->>'amount')::numeric)) into its
    from jsonb_array_elements(coalesce(e.lines, jsonb_build_array(jsonb_build_object('label', e.description, 'amount', e.amount)))) l;
    insert into invoices (request_id, customer_id, technician_id, items, subtotal, amount, kind, company_id)
    values (e.request_id, r.customer_id, e.technician_id, coalesce(its, '[]'::jsonb), e.amount, e.amount, 'additional', r.company_id)
    returning id into inv;
    update extra_charges set invoice_id = inv where id = p_id;
  end if;
end $$;

-- 3. The technician can only resume after approval, payment and the accountant's confirmation
create function gate_resume() returns trigger language plpgsql security definer set search_path = public as $$
begin
  if old.status = 'waiting_customer' and new.status = 'in_progress' then
    if exists (select 1 from extra_charges where request_id = new.id and status = 'pending')
       or exists (select 1 from invoices where request_id = new.id and kind = 'additional' and status <> 'paid') then
      raise exception 'Waiting for the customer to approve and pay for the additional work, and for the accountant to confirm the payment.';
    end if;
  end if;
  return new;
end $$;
create trigger gate_resume_t before update on requests for each row execute function gate_resume();

-- 4. Every payment waits for the accountant's confirmation
create or replace function make_payment(p_invoice uuid, p_amount numeric, p_method text) returns void language plpgsql security definer set search_path = public as $$
declare inv invoices%rowtype;
begin
  select * into inv from invoices where id = p_invoice and customer_id = auth.uid();
  if not found then raise exception 'Invoice not found'; end if;
  if p_amount <= 0 or p_amount > inv.amount - inv.paid_amount then raise exception 'Invalid amount'; end if;
  insert into payments (invoice_id, amount, method, reference, status, created_by, company_id)
  values (p_invoice, p_amount, p_method, 'TEST-' || upper(substr(md5(random()::text), 1, 8)), 'pending', auth.uid(), inv.company_id);
  perform recalc_invoice(p_invoice);
end $$;
