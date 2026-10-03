-- Run this in Supabase > SQL Editor AFTER schema_v11.sql

-- ===== Diagnosis =====
create table diagnoses (
  request_id uuid primary key references requests(id) on delete cascade,
  problem text, cause text, solution text, notes text,
  est_parts numeric default 0, est_labour numeric default 0,
  updated_by uuid, updated_at timestamptz default now(),
  company_id uuid references companies(id) default my_company()
);
alter table diagnoses enable row level security;
create policy tenant on diagnoses as restrictive for all using (company_ok(company_id)) with check (company_ok(company_id));
create policy "read diagnosis" on diagnoses for select using (exists (select 1 from requests r where r.id = request_id));
create policy "tech writes diagnosis" on diagnoses for insert with check (
  exists (select 1 from requests r where r.id = request_id and (r.technician_id = auth.uid() or my_role() in ('manager','super_admin'))));
create policy "tech edits diagnosis" on diagnoses for update using (
  exists (select 1 from requests r where r.id = request_id and (r.technician_id = auth.uid() or my_role() in ('manager','super_admin'))));

-- ===== Extra work with several lines; manager or customer can decide =====
alter table extra_charges add column lines jsonb;
create or replace function decide_extra(p_id uuid, p_status text) returns void language plpgsql security definer set search_path = public as $$
begin
  update extra_charges e set status = p_status from requests r
  where e.id = p_id and r.id = e.request_id and e.status = 'pending' and p_status in ('approved','rejected')
    and (r.customer_id = auth.uid() or (my_role() in ('manager','super_admin') and company_ok(r.company_id)));
end $$;

-- ===== Inventory fields and ledger =====
alter table items add column sku text, add column category text, add column unit text default 'pcs',
  add column cost numeric default 0, add column min_stock int default 0, add column supplier text, add column location text;

create table inventory_transactions (
  id bigint generated always as identity primary key,
  item_id uuid not null references items(id) on delete cascade,
  change int not null,
  reason text not null check (reason in ('initial','purchased','used','damaged','adjustment')),
  request_id uuid references requests(id), note text, actor uuid, balance int,
  company_id uuid references companies(id) default my_company(),
  created_at timestamptz default now()
);
alter table inventory_transactions enable row level security;
create policy tenant on inventory_transactions as restrictive for all using (company_ok(company_id)) with check (company_ok(company_id));
create policy "staff read ledger" on inventory_transactions for select using (my_role() in ('technician','manager','super_admin'));

insert into inventory_transactions (item_id, change, reason, balance, company_id)
  select id, quantity, 'initial', quantity, company_id from items where quantity > 0;

create function items_guard() returns trigger language plpgsql as $$
begin
  if new.quantity is distinct from old.quantity and coalesce(current_setting('app.ledger', true), '') <> 'on' then
    raise exception 'Stock can only change through the inventory ledger';
  end if;
  return new;
end $$;
create trigger items_guard_t before update on items for each row execute function items_guard();

create function items_initial() returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.quantity > 0 then
    insert into inventory_transactions (item_id, change, reason, balance, actor, company_id)
    values (new.id, new.quantity, 'initial', new.quantity, auth.uid(), new.company_id);
  end if;
  return new;
end $$;
create trigger items_initial_t after insert on items for each row execute function items_initial();

create function inventory_move(p_item uuid, p_change int, p_reason text, p_request uuid default null, p_note text default null)
returns void language plpgsql security definer set search_path = public as $$
declare bal int; cid uuid;
begin
  if my_role() not in ('technician','manager','super_admin') then raise exception 'Not allowed'; end if;
  if my_role() = 'technician' and p_reason <> 'used' then raise exception 'Not allowed'; end if;
  perform set_config('app.ledger', 'on', true);
  update items set quantity = quantity + p_change where id = p_item and company_ok(company_id)
    returning quantity, company_id into bal, cid;
  if bal is null then raise exception 'Item not found'; end if;
  if bal < 0 then raise exception 'Not enough stock'; end if;
  insert into inventory_transactions (item_id, change, reason, request_id, note, actor, balance, company_id)
  values (p_item, p_change, p_reason, p_request, p_note, auth.uid(), bal, cid);
end $$;

-- ===== Materials used on a job =====
create table job_materials (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references requests(id) on delete cascade,
  item_id uuid references items(id),
  name text not null, unit text,
  qty numeric not null check (qty > 0),
  unit_price numeric not null default 0,
  added_by uuid, company_id uuid references companies(id) default my_company(),
  created_at timestamptz default now()
);
alter table job_materials enable row level security;
create policy tenant on job_materials as restrictive for all using (company_ok(company_id)) with check (company_ok(company_id));
create policy "read materials" on job_materials for select using (exists (select 1 from requests r where r.id = request_id));
create policy "tech adds materials" on job_materials for insert with check (
  exists (select 1 from requests r where r.id = request_id and (r.technician_id = auth.uid() or my_role() in ('manager','super_admin'))));

-- ===== Assets and warranty =====
alter table assets add column serial_number text, add column installation_date date,
  add column technician_id uuid references profiles(id),
  add column status text not null default 'active' check (status in ('active','inactive','retired')),
  add column warranty_months int, add column warranty_start date;
create policy "manager edits assets" on assets for update using (my_role() in ('manager','super_admin'));

alter table requests add column asset_id uuid references assets(id), add column warranty_claim boolean not null default false;

create or replace function set_request_no() returns trigger language plpgsql security definer set search_path = public as $$
begin
  new.request_no := 'REQ-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('request_seq')::text, 6, '0');
  new.warranty_claim := new.asset_id is not null and exists (
    select 1 from assets a where a.id = new.asset_id and a.customer_id = new.customer_id
      and a.status = 'active' and a.warranty_until >= current_date);
  return new;
end $$;

-- ===== Invoices =====
create sequence if not exists invoice_seq start 1;
do $$
declare c text;
begin
  for c in select conname from pg_constraint
           where conrelid = 'public.invoices'::regclass and contype = 'c' and pg_get_constraintdef(oid) like '%status%' loop
    execute format('alter table invoices drop constraint %I', c);
  end loop;
end $$;
alter table invoices add constraint invoices_status_check check (status in ('unpaid','pending','partially_paid','paid','refunded','failed'));
alter table invoices add column invoice_no text, add column due_date date default (current_date + 7),
  add column items jsonb not null default '[]', add column subtotal numeric default 0,
  add column discount numeric default 0, add column tax numeric default 0,
  add column paid_amount numeric not null default 0;
update invoices set invoice_no = 'INV-' || to_char(created_at, 'YYYY') || '-' || lpad(nextval('invoice_seq')::text, 6, '0');
update invoices set paid_amount = amount where status = 'paid';

create function set_invoice_no() returns trigger language plpgsql security definer set search_path = public as $$
begin
  new.invoice_no := 'INV-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('invoice_seq')::text, 6, '0');
  return new;
end $$;
create trigger invoice_no_t before insert on invoices for each row execute function set_invoice_no();

-- ===== Payments (test mode) =====
create table payments (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references invoices(id) on delete cascade,
  amount numeric not null check (amount > 0),
  method text not null, reference text,
  status text not null default 'pending' check (status in ('pending','confirmed','failed','refunded')),
  created_by uuid, company_id uuid references companies(id) default my_company(),
  created_at timestamptz default now()
);
alter table payments enable row level security;
create policy tenant on payments as restrictive for all using (company_ok(company_id)) with check (company_ok(company_id));
create policy "read payments" on payments for select using (exists (select 1 from invoices i where i.id = invoice_id));

create function recalc_invoice(inv uuid) returns void language plpgsql security definer set search_path = public as $$
declare paid numeric; tot numeric; st text;
begin
  select amount into tot from invoices where id = inv;
  select coalesce(sum(amount) filter (where status = 'confirmed'), 0) into paid from payments where invoice_id = inv;
  st := case
    when tot > 0 and paid >= tot then 'paid'
    when paid > 0 then 'partially_paid'
    when exists (select 1 from payments where invoice_id = inv and status = 'pending') then 'pending'
    when exists (select 1 from payments where invoice_id = inv and status = 'refunded') then 'refunded'
    when exists (select 1 from payments where invoice_id = inv and status = 'failed') then 'failed'
    else 'unpaid' end;
  update invoices set paid_amount = paid, status = st, paid_at = case when st = 'paid' then now() end where id = inv;
end $$;

create function make_payment(p_invoice uuid, p_amount numeric, p_method text) returns void language plpgsql security definer set search_path = public as $$
declare inv invoices%rowtype;
begin
  select * into inv from invoices where id = p_invoice and customer_id = auth.uid();
  if not found then raise exception 'Invoice not found'; end if;
  if p_amount <= 0 or p_amount > inv.amount - inv.paid_amount then raise exception 'Invalid amount'; end if;
  insert into payments (invoice_id, amount, method, reference, status, created_by, company_id)
  values (p_invoice, p_amount, p_method, 'TEST-' || upper(substr(md5(random()::text), 1, 8)),
          case when p_method = 'card_test' then 'confirmed' else 'pending' end, auth.uid(), inv.company_id);
  perform recalc_invoice(p_invoice);
end $$;

create function review_payment(p_payment uuid, p_action text) returns void language plpgsql security definer set search_path = public as $$
declare pay payments%rowtype;
begin
  if my_role() not in ('accountant','manager','super_admin') then raise exception 'Not allowed'; end if;
  select * into pay from payments where id = p_payment and company_ok(company_id);
  if not found then raise exception 'Payment not found'; end if;
  if p_action = 'confirm' and pay.status = 'pending' then update payments set status = 'confirmed' where id = p_payment;
  elsif p_action = 'fail' and pay.status = 'pending' then update payments set status = 'failed' where id = p_payment;
  elsif p_action = 'refund' and pay.status = 'confirmed' then update payments set status = 'refunded' where id = p_payment;
  else raise exception 'This change is not possible'; end if;
  perform recalc_invoice(pay.invoice_id);
end $$;
