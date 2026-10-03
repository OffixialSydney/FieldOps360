-- Run this in Supabase > SQL Editor AFTER schema_v13.sql
-- Open requests: customers need no company; every company that offers the service can take the job.

-- 1. Services each company offers
alter table companies add column services text[] not null default '{}';
update companies set services = array['Solar','Electrical','Plumbing','AC','Generator','CCTV','Internet','Other'];

create or replace function set_company_services(p_services text[]) returns void language plpgsql security definer set search_path = public as $$
begin
  if my_role() <> 'manager' or my_company() is null then raise exception 'Not allowed'; end if;
  update companies set services = p_services where id = my_company();
end $$;

-- 2. Tickets point at a job; the job's company answers
alter table tickets add column request_id uuid references requests(id);
create function set_ticket_company() returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.request_id is not null then
    new.company_id := (select company_id from requests where id = new.request_id and customer_id = new.customer_id);
  end if;
  return new;
end $$;
create trigger ticket_company_t before insert on tickets for each row execute function set_ticket_company();

create function set_rating_company() returns trigger language plpgsql security definer set search_path = public as $$
begin
  new.company_id := (select company_id from requests where id = new.request_id);
  return new;
end $$;
create trigger rating_company_t before insert on ratings for each row execute function set_rating_company();

-- 3. New requests start open (no company)
create or replace function set_request_no() returns trigger language plpgsql security definer set search_path = public as $$
begin
  new.request_no := 'REQ-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('request_seq')::text, 6, '0');
  new.company_id := null;
  new.warranty_claim := new.asset_id is not null and exists (
    select 1 from assets a where a.id = new.asset_id and a.customer_id = new.customer_id
      and a.status = 'active' and a.warranty_until >= current_date);
  return new;
end $$;

-- 4. A manager takes an open job (only if the company offers the service)
create function claim_request(p_request uuid, p_technician uuid default null) returns void language plpgsql security definer set search_path = public as $$
declare cid uuid; cat text;
begin
  if my_role() <> 'manager' then raise exception 'Only managers can take jobs'; end if;
  cid := my_company();
  if cid is null or not company_ok(cid) then raise exception 'Your company is not active'; end if;
  select service_type into cat from requests where id = p_request and company_id is null and status = 'new';
  if cat is null then raise exception 'This request was already taken'; end if;
  if not exists (select 1 from companies where id = cid and cat = any(services)) then
    raise exception 'You do not offer this service';
  end if;
  if p_technician is not null and not exists (
    select 1 from profiles where id = p_technician and role = 'technician' and company_id = cid) then
    raise exception 'That technician is not in your company';
  end if;
  update requests set company_id = cid, technician_id = p_technician,
    status = case when p_technician is null then 'reviewing' else 'assigned' end
  where id = p_request and company_id is null and status = 'new';
  if not found then raise exception 'This request was already taken'; end if;
end $$;

-- 5. Managers of companies offering the service are told about new open requests
create or replace function notify_request() returns trigger language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' then
    insert into notifications (user_id, message, company_id)
      select p.id, 'New open request: ' || new.service_type, p.company_id
      from profiles p join companies c on c.id = p.company_id
      where p.role = 'manager' and c.status = 'active' and new.service_type = any(c.services);
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

-- 6. Helper checks used by the access rules
create function can_see_customer(p uuid) returns boolean language plpgsql stable security definer set search_path = public as $$
begin
  return exists (select 1 from requests r where r.customer_id = p
                   and (r.company_id = my_company() or (r.company_id is null and my_role() = 'manager')))
      or exists (select 1 from invoices i where i.customer_id = p and i.company_id = my_company());
end $$;

create function req_ok(req uuid, c uuid) returns boolean language plpgsql stable security definer set search_path = public as $$
begin
  return company_ok(c) or c is null or exists (select 1 from requests where id = req and customer_id = auth.uid());
end $$;

create function pay_ok(inv uuid, c uuid, by uuid) returns boolean language plpgsql stable security definer set search_path = public as $$
begin
  return company_ok(c) or by = auth.uid() or exists (select 1 from invoices where id = inv and customer_id = auth.uid());
end $$;

-- 7. Access rules: companies stay separate, but customers keep their own records
-- requests: open ones are readable by managers, only the owner company can change them
drop policy if exists tenant on requests;
create policy tenant_read on requests as restrictive for select using (
  company_ok(company_id) or customer_id = auth.uid()
  or (company_id is null and my_role() in ('manager','super_admin') and company_ok(my_company())));
create policy tenant_ins on requests as restrictive for insert with check (customer_id = auth.uid());
create policy tenant_upd on requests as restrictive for update
  using (company_ok(company_id) or customer_id = auth.uid())
  with check (company_ok(company_id) or customer_id = auth.uid());
create policy tenant_del on requests as restrictive for delete using (company_ok(company_id));

drop policy if exists tenant on profiles;
create policy tenant on profiles as restrictive for all
  using (id = auth.uid() or company_ok(company_id) or is_my_technician(id) or is_my_customer(id) or can_see_customer(id))
  with check (id = auth.uid() or company_ok(company_id));

do $$
declare t text; col text;
begin
  for t, col in select * from (values ('invoices','customer_id'),('tickets','customer_id'),('assets','customer_id'),
      ('ratings','customer_id'),('addresses','customer_id'),('notifications','user_id')) v(a, b) loop
    execute format('drop policy if exists tenant on %I', t);
    execute format('create policy tenant on %I as restrictive for all using (company_ok(company_id) or %I = auth.uid()) with check (company_ok(company_id) or %I = auth.uid())', t, col, col);
  end loop;
  foreach t in array array['attachments','job_status_history','diagnoses','extra_charges','job_materials'] loop
    execute format('drop policy if exists tenant on %I', t);
    execute format('create policy tenant on %I as restrictive for all using (req_ok(request_id, company_id)) with check (req_ok(request_id, company_id))', t);
  end loop;
end $$;

drop policy if exists tenant on payments;
create policy tenant on payments as restrictive for all
  using (pay_ok(invoice_id, company_id, created_by)) with check (pay_ok(invoice_id, company_id, created_by));
