-- Run this in Supabase > SQL Editor AFTER schema.sql, schema_v2.sql and schema_v3.sql

create table companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  status text not null default 'active' check (status in ('active','suspended')),
  plan text not null default 'basic' check (plan in ('free','basic','pro')),
  subscription_until date,
  created_at timestamptz default now()
);

create table extra_charges (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references requests(id) on delete cascade,
  technician_id uuid references profiles(id),
  description text not null, amount numeric not null default 0,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  created_at timestamptz default now()
);
create table notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  message text not null, read boolean not null default false,
  created_at timestamptz default now()
);
create table technician_locations (
  technician_id uuid primary key references profiles(id) on delete cascade,
  lat double precision not null, lng double precision not null,
  updated_at timestamptz default now()
);

create function my_company() returns uuid language plpgsql stable security definer set search_path = public as $$
begin
  return (select company_id from profiles where id = auth.uid());
end $$;

create function company_ok(c uuid) returns boolean language sql stable security definer set search_path = public as
$$ select my_role() = 'super_admin'
   or (c is not null and c = my_company() and exists (select 1 from companies where id = c and status = 'active')) $$;

-- Add company_id to every table, back-fill existing data, and isolate companies from each other
do $$
declare t text; cid uuid; cond text;
begin
  insert into companies (name) values ('Default Company') returning id into cid;
  foreach t in array array['profiles','requests','invoices','attachments','items','assets','tickets','ratings','audit_log','addresses','extra_charges','notifications','technician_locations'] loop
    execute format('alter table %I add column company_id uuid references companies(id)', t);
    execute format('update %I set company_id = %L', t, cid);
    execute format('alter table %I alter column company_id set default my_company()', t);
    execute format('alter table %I enable row level security', t);
    cond := case when t = 'profiles' then 'id = auth.uid() or company_ok(company_id)' else 'company_ok(company_id)' end;
    execute format('create policy tenant on %I as restrictive for all using (%s) with check (%s)', t, cond, cond);
  end loop;
end $$;

alter table companies enable row level security;
create policy "list active companies" on companies for select to anon, authenticated using (status = 'active' or my_role() = 'super_admin');
create policy "admin manages companies" on companies for all using (my_role() = 'super_admin') with check (my_role() = 'super_admin');

-- Signup: customer picks a company
create or replace function handle_new_user() returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into profiles (id, full_name, phone, company_id)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'phone',
          nullif(new.raw_user_meta_data->>'company_id','')::uuid);
  return new;
end $$;

-- Users cannot change their own role, commission or company
drop policy "edit own profile" on profiles;
create policy "edit own profile" on profiles for update using (id = auth.uid())
  with check (role = my_role()
    and commission_pct = (select commission_pct from profiles where id = auth.uid())
    and company_id is not distinct from my_company());

-- Extra charges
create policy "read extras" on extra_charges for select using (exists (select 1 from requests r where r.id = request_id));
create policy "tech adds extras" on extra_charges for insert with check (
  technician_id = auth.uid() and exists (select 1 from requests r where r.id = request_id and r.technician_id = auth.uid()));
create function decide_extra(p_id uuid, p_status text) returns void language sql security definer set search_path = public as $$
  update extra_charges e set status = p_status from requests r
  where e.id = p_id and r.id = e.request_id and r.customer_id = auth.uid()
    and e.status = 'pending' and p_status in ('approved','rejected');
$$;

-- Notifications
create policy "own notifications read" on notifications for select using (user_id = auth.uid());
create policy "own notifications update" on notifications for update using (user_id = auth.uid());

create function notify(p_user uuid, p_msg text) returns void language sql security definer set search_path = public as $$
  insert into notifications (user_id, message, company_id) select p_user, p_msg, company_id from profiles where id = p_user;
$$;

create function notify_request() returns trigger language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' then
    insert into notifications (user_id, message, company_id)
      select id, 'New service request: ' || new.service_type, new.company_id from profiles
      where role = 'manager' and company_id = new.company_id;
    return new;
  end if;
  if new.technician_id is distinct from old.technician_id and new.technician_id is not null then
    perform notify(new.technician_id, 'New job assigned: ' || new.service_type);
  end if;
  if new.status is distinct from old.status then
    perform notify(new.customer_id, 'Your ' || new.service_type || ' request is now ' || replace(new.status, '_', ' '));
  end if;
  return new;
end $$;
create trigger notify_request_t after insert or update on requests for each row execute function notify_request();

create function notify_misc() returns trigger language plpgsql security definer set search_path = public as $$
begin
  if tg_table_name = 'invoices' then perform notify(new.customer_id, 'A new invoice is ready for you');
  elsif tg_table_name = 'extra_charges' then
    perform notify((select customer_id from requests where id = new.request_id), 'Extra work needs your approval');
  elsif tg_table_name = 'tickets' and new.reply is distinct from old.reply then
    perform notify(new.customer_id, 'Your support ticket has a reply');
  end if;
  return new;
end $$;
create trigger notify_invoice after insert on invoices for each row execute function notify_misc();
create trigger notify_extra after insert on extra_charges for each row execute function notify_misc();
create trigger notify_ticket after update on tickets for each row execute function notify_misc();

-- Technician locations
create policy "read locations" on technician_locations for select using (technician_id = auth.uid() or my_role() in ('manager','super_admin'));
create policy "tech adds location" on technician_locations for insert with check (technician_id = auth.uid());
create policy "tech updates location" on technician_locations for update using (technician_id = auth.uid());
