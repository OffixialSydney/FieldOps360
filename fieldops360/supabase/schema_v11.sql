-- Run this in Supabase > SQL Editor AFTER schema_v10.sql

-- 1. Full job status workflow
do $$
declare c text;
begin
  for c in select conname from pg_constraint
           where conrelid = 'public.requests'::regclass and contype = 'c' and pg_get_constraintdef(oid) like '%status%' loop
    execute format('alter table requests drop constraint %I', c);
  end loop;
end $$;
alter table requests add constraint requests_status_check check (status in (
  'new','reviewing','assigned','rejected','accepted','en_route','arrived','diagnosing','in_progress',
  'waiting_parts','waiting_customer','completed','invoiced','paid','closed','cancelled'));

-- 2. New request fields
create sequence if not exists request_seq start 1;
alter table requests
  add column request_no text,
  add column priority text not null default 'normal' check (priority in ('low','normal','high','urgent')),
  add column preferred_time text,
  add column notes text,
  add column latitude double precision,
  add column longitude double precision,
  add column eta_minutes int,
  add column status_lat double precision,
  add column status_lng double precision;
update requests set request_no = 'REQ-' || to_char(created_at, 'YYYY') || '-' || lpad(nextval('request_seq')::text, 6, '0');

create function set_request_no() returns trigger language plpgsql security definer set search_path = public as $$
begin
  new.request_no := 'REQ-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('request_seq')::text, 6, '0');
  return new;
end $$;
create trigger request_no_t before insert on requests for each row execute function set_request_no();

-- 3. Technician skills and availability
alter table profiles add column skills text,
  add column availability text not null default 'available' check (availability in ('available','busy','offline'));

-- 4. Status history (only ever added to, never changed)
create table job_status_history (
  id bigint generated always as identity primary key,
  request_id uuid not null references requests(id) on delete cascade,
  status text not null, actor uuid, note text,
  lat double precision, lng double precision,
  company_id uuid references companies(id) default my_company(),
  created_at timestamptz default now()
);
alter table job_status_history enable row level security;
create policy tenant on job_status_history as restrictive for all
  using (company_ok(company_id)) with check (company_ok(company_id));
create policy "read history" on job_status_history for select using (exists (select 1 from requests r where r.id = request_id));
insert into job_status_history (request_id, status, company_id, created_at) select id, status, company_id, created_at from requests;

create function log_status_insert() returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into job_status_history (request_id, status, actor, company_id) values (new.id, new.status, auth.uid(), new.company_id);
  return new;
end $$;
create trigger hist_ins after insert on requests for each row execute function log_status_insert();

create function log_status_change() returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.status is distinct from old.status then
    insert into job_status_history (request_id, status, actor, note, lat, lng, company_id)
    values (new.id, new.status, auth.uid(),
            case when new.status = 'assigned' then (select full_name from profiles where id = new.technician_id) end,
            new.status_lat, new.status_lng, new.company_id);
  end if;
  new.status_lat := null;
  new.status_lng := null;
  return new;
end $$;
create trigger hist_upd before update on requests for each row execute function log_status_change();

-- 5. Invoice and payment move the job status along
create function invoice_status_sync() returns trigger language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' then
    update requests set status = 'invoiced' where id = new.request_id and status = 'completed';
  elsif new.status = 'paid' and old.status is distinct from 'paid' then
    update requests set status = 'paid' where id = new.request_id and status in ('completed','invoiced');
  end if;
  return new;
end $$;
create trigger inv_sync_i after insert on invoices for each row execute function invoice_status_sync();
create trigger inv_sync_u after update on invoices for each row execute function invoice_status_sync();

-- 6. Customers can see the technician assigned to their job
create or replace function is_my_technician(p uuid) returns boolean language plpgsql stable security definer set search_path = public as $$
begin
  return exists (select 1 from requests where technician_id = p and customer_id = auth.uid());
end $$;
drop policy if exists "read profiles" on profiles;
create policy "read profiles" on profiles for select using (
  id = auth.uid()
  or my_role() in ('manager','accountant','super_admin')
  or (my_role() = 'technician' and is_my_customer(id))
  or is_my_technician(id));
