-- DEMO DATA. Run in Supabase > SQL Editor AFTER schema_v19.sql, on an empty database (run the clear script first if needed).
-- Creates: 3 companies, 30 customers, 15 technicians, 3 managers, 3 accountants, 100 jobs, 50 invoices,
-- 30 assets, 100 inventory items with ledger, 50 tickets, ratings, and 100+ audit records.
-- These demo people cannot log in. Use demo_accounts.sql for logins. If anything fails, nothing is saved.

begin;

alter table requests disable trigger user;
alter table invoices disable trigger user;
alter table payments disable trigger user;
alter table tickets disable trigger user;
alter table ratings disable trigger user;
alter table items disable trigger user;

-- ===== Companies =====
create temp table co on commit drop as
with ins as (
  insert into companies (name, services, plan, subscription_until) values
    ('YTech Engineering', array['Solar','Electrical','Generator'], 'pro', current_date + 300),
    ('Sunrise Solar', array['Solar','Electrical','CCTV','Internet'], 'basic', current_date + 200),
    ('Kaduna Cooling Services', array['AC','Plumbing','Generator','Other'], 'basic', current_date + 120)
  returning id, name, services)
select row_number() over (order by name) as n, id, name, services from ins;

-- ===== People =====
create temp table u on commit drop as
select gen_random_uuid() as id,
       r.role || r.seq || '@demo.fieldops.test' as email,
       (array['Amina','Chinedu','Fatima','Emeka','Zainab','Tunde','Ngozi','Ibrahim','Blessing','Musa','Halima','Segun','Aisha','Obinna','Hauwa'])[1 + (r.seq * 3 + r.k) % 15]
         || ' ' ||
       (array['Okafor','Bello','Adeyemi','Ibrahim','Eze','Yusuf','Balogun','Nwosu','Danjuma','Abubakar','Okonkwo','Lawal'])[1 + (r.seq * 5 + r.k) % 12] as name,
       '080' || lpad((20000000 + r.seq * 7919 + r.k * 131)::text, 8, '0') as phone,
       r.role, r.company_n, r.seq, null::uuid as company_id
from (
  select 'customer' as role, g as seq, null::int as company_n, 1 as k from generate_series(1, 30) g
  union all select 'technician', g, ((g - 1) % 3) + 1, 2 from generate_series(1, 15) g
  union all select 'manager', g, g, 3 from generate_series(1, 3) g
  union all select 'accountant', g, g, 4 from generate_series(1, 3) g
) r;
update u set company_id = co.id from co where co.n = u.company_n;

insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
                        raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
                        confirmation_token, recovery_token, email_change_token_new, email_change)
select '00000000-0000-0000-0000-000000000000', id, 'authenticated', 'authenticated', email, 'not-a-real-password', now(),
       '{"provider":"email","providers":["email"]}'::jsonb,
       jsonb_build_object('full_name', name, 'phone', phone, 'company_id', company_id),
       now() - interval '60 days', now(), '', '', '', ''
from u;

update profiles p
set role = u.role,
    skills = case when u.role = 'technician'
      then (array['AC, Plumbing, Generator','Solar, Electrical, CCTV, Internet','Solar, Electrical, Generator'])[u.company_n] end,
    availability = case when u.role = 'technician' then (array['available','busy','available','offline'])[1 + u.seq % 4] else 'available' end
from u where p.id = u.id;

-- ===== Jobs =====
create temp table rq on commit drop as
select g, ((g - 1) % 3) + 1 as cn,
       (array['paid','paid','paid','closed','invoiced','invoiced','in_progress','assigned','new','cancelled'])[1 + g % 10] as status,
       gen_random_uuid() as id
from generate_series(1, 100) g;

insert into requests (id, customer_id, technician_id, service_type, description, address, preferred_date, status,
                      created_at, company_id, request_no, priority, preferred_time, scheduled_date, work_done)
select rq.id,
  (select id from u where role = 'customer' and seq = 1 + (rq.g * 7) % 30),
  case when rq.status in ('new', 'cancelled') then null
       else (select id from u where role = 'technician' and company_n = rq.cn and seq = rq.cn + 3 * (rq.g % 5)) end,
  co.services[1 + (rq.g / 3) % array_length(co.services, 1)],
  (array['Equipment stopped working','Strange noise and overheating','Needs inspection and servicing','Leaking and low performance','Intermittent power failure','Installation of a new unit'])[1 + rq.g % 6],
  (array['12 Ahmadu Bello Way, Kaduna','45 Constitution Road, Kaduna','8 Gwari Road, Kaduna','21 Wuse Zone 4, Abuja','5 Lekki Phase 1, Lagos','17 Barnawa, Kaduna'])[1 + rq.g % 6],
  current_date - (rq.g % 60) + 2,
  rq.status,
  now() - make_interval(days => rq.g % 60, hours => rq.g % 11),
  case when rq.status = 'new' then null else co.id end,
  'REQ-' || to_char(now(), 'YYYY') || '-' || lpad(rq.g::text, 6, '0'),
  (array['low','normal','normal','high','urgent'])[1 + rq.g % 5],
  (array['09:00','11:30','14:00','16:30'])[1 + rq.g % 4],
  current_date - (rq.g % 60) + 2,
  case when rq.status in ('paid','closed','invoiced') then 'Fault diagnosed, faulty parts replaced and the system tested.' end
from rq join co on co.n = rq.cn;

insert into job_status_history (request_id, status, actor, company_id, created_at)
select r.id,
       (array['new','assigned','accepted','en_route','arrived','diagnosing','in_progress','completed','invoiced','paid','closed'])[f.i],
       case when f.i = 1 then r.customer_id else r.technician_id end,
       r.company_id,
       r.created_at + f.i * interval '45 minutes'
from requests r
cross join lateral generate_series(1, case r.status when 'assigned' then 2 when 'in_progress' then 7 when 'invoiced' then 9
                                                     when 'paid' then 10 when 'closed' then 11 else 1 end) as f(i)
where r.id in (select id from rq);

insert into job_status_history (request_id, status, actor, company_id, created_at)
select id, 'cancelled', customer_id, company_id, created_at + interval '2 hours'
from requests where status = 'cancelled' and id in (select id from rq);

-- ===== Invoices and payments =====
create temp table inv on commit drop as
select row_number() over (order by r.created_at) as g, gen_random_uuid() as id, r.id as rid, r.customer_id, r.technician_id,
       r.company_id, r.status as rstatus, r.created_at,
       ((20 + (row_number() over (order by r.created_at)) % 25 * 5) * 1000)::numeric as amount
from requests r
where r.id in (select id from rq) and r.status in ('paid','closed','invoiced')
order by r.created_at
limit 50;

insert into invoices (id, request_id, customer_id, technician_id, company_id, invoice_no, amount, subtotal, discount, tax,
                      paid_amount, status, kind, due_date, items, created_at, paid_at)
select id, rid, customer_id, technician_id, company_id,
       'INV-' || to_char(now(), 'YYYY') || '-' || lpad(g::text, 6, '0'),
       amount, amount, 0, 0,
       case when rstatus in ('paid','closed') then amount when g % 3 = 0 then amount / 2 else 0 end,
       case when rstatus in ('paid','closed') then 'paid' when g % 3 = 0 then 'partially_paid' when g % 3 = 1 then 'unpaid' else 'pending' end,
       'final', (created_at + interval '7 days')::date,
       jsonb_build_array(jsonb_build_object('label','Labour','qty',1,'unit_price',amount * 0.4),
                         jsonb_build_object('label','Materials and parts','qty',1,'unit_price',amount * 0.6)),
       created_at + interval '6 hours',
       case when rstatus in ('paid','closed') then created_at + interval '1 day' end
from inv;

insert into payments (invoice_id, amount, method, reference, status, created_by, company_id, created_at)
select id, case when rstatus in ('paid','closed') then amount else amount / 2 end,
       (array['card_test','bank_transfer','wallet'])[1 + g % 3],
       'TEST-' || upper(substr(md5(id::text), 1, 8)), 'confirmed', customer_id, company_id, created_at + interval '1 day'
from inv where rstatus in ('paid','closed') or g % 3 = 0
union all
select id, amount, 'bank_transfer', 'TEST-' || upper(substr(md5(id::text || 'p'), 1, 8)), 'pending', customer_id, company_id, created_at + interval '1 day'
from inv where rstatus = 'invoiced' and g % 3 = 2;

-- ===== Equipment and warranties =====
insert into assets (customer_id, request_id, name, serial_number, installation_date, technician_id, status,
                    warranty_months, warranty_start, warranty_until, company_id, created_at)
select r.customer_id, r.id,
       (array['Solar Inverter','Generator','Split Air Conditioner','CCTV Camera Kit','Water Pump','Battery Bank'])[1 + a.g % 6],
       'SN-' || to_char(now(), 'YYYY') || '-' || lpad((1000 + a.g * 37)::text, 5, '0'),
       r.created_at::date, r.technician_id, 'active',
       (array[12, 24, 2])[1 + a.g % 3], r.created_at::date,
       (r.created_at::date + make_interval(months => (array[12, 24, 2])[1 + a.g % 3]))::date,
       r.company_id, r.created_at
from (select id, row_number() over (order by created_at) as g from requests
      where id in (select id from rq) and status in ('paid','closed')) a
join requests r on r.id = a.id
where a.g <= 30;

-- ===== Inventory and ledger =====
create temp table it on commit drop as
select g, gen_random_uuid() as id, ((g - 1) % 3) + 1 as cn,
       (array['MC4 Connector','Solar Fuse','Cable 6mm (per m)','Inverter 5kVA','Battery 200Ah','Circuit Breaker 32A','PVC Pipe 1/2 inch','Run Capacitor','Refrigerant R410A','CCTV Camera 4MP','WiFi Router','Network Switch 8-port','Solar Panel 450W','Charge Controller 60A','Generator Oil Filter','Spark Plug','Thermostat','Fan Motor','Gate Valve','Silicone Sealant'])[1 + g % 20]
         || ' (' || (array['Standard','Pro','Lite','Heavy duty','Mini'])[1 + (g / 20) % 5] || ')' as name,
       (g * 13) % 60 as qty,
       5 + (g % 6) * 5 as minq
from generate_series(1, 100) g;

insert into items (id, name, quantity, unit_price, sku, category, unit, cost, min_stock, supplier, location, company_id)
select it.id, it.name, it.qty, (1500 + it.g * 250)::numeric,
       'SKU-' || lpad(it.g::text, 4, '0'),
       (array['Solar','Electrical','Plumbing','AC','CCTV','Internet'])[1 + it.g % 6],
       (array['pcs','m','pcs','kg'])[1 + it.g % 4],
       (1000 + it.g * 180)::numeric, it.minq,
       (array['SolarMart Ltd','PowerTech Supplies','CoolAir Distributors','Northern Hardware'])[1 + it.g % 4],
       'Shelf ' || chr(65 + it.g % 6) || (1 + it.g % 9),
       co.id
from it join co on co.n = it.cn;

insert into inventory_transactions (item_id, change, reason, balance, company_id, created_at)
select it.id, it.qty + 2, 'initial', it.qty + 2, co.id, now() - interval '70 days' from it join co on co.n = it.cn
union all
select it.id, -2, 'used', it.qty, co.id, now() - interval '20 days' from it join co on co.n = it.cn;

-- ===== Support tickets and ratings =====
insert into tickets (customer_id, request_id, subject, message, reply, status, priority, ticket_no, company_id, created_at)
select r.customer_id, r.id,
       (array['Inverter still making noise','Technician arrived late','Question about my invoice','AC leaking after service','Warranty enquiry','Need to reschedule'])[1 + t.g % 6],
       'Please help with ' || r.request_no || '.',
       case when t.g % 3 = 0 then 'Thanks for reaching out. A technician will follow up shortly.' end,
       (array['open','assigned','in_progress','waiting_customer','resolved','closed'])[1 + t.g % 6],
       (array['low','normal','high','urgent'])[1 + t.g % 4],
       'TK-' || lpad(t.g::text, 5, '0'), r.company_id, r.created_at + interval '1 day'
from (select id, row_number() over (order by created_at) as g from requests
      where id in (select id from rq) and company_id is not null) t
join requests r on r.id = t.id
where t.g <= 50;

insert into ratings (request_id, customer_id, technician_id, stars, feedback, company_id, created_at)
select id, customer_id, technician_id, 6 + g % 5,
       case when g % 4 = 0 then 'Professional and on time.' end, company_id, created_at + interval '2 days'
from (select *, row_number() over (order by created_at) as g from requests
      where id in (select id from rq) and status in ('paid','closed')) x
where g <= 40;

-- ===== Audit records =====
insert into audit_log (actor, action, table_name, row_id, actor_name, actor_role, summary, company_id, created_at)
select m.id, 'UPDATE', 'requests', r.id::text, m.name, 'manager',
       'Assigned ' || r.request_no || ' from Unassigned to ' || t.name, r.company_id, r.created_at + interval '30 minutes'
from requests r
join u t on t.id = r.technician_id
join u m on m.role = 'manager' and m.company_id = r.company_id
where r.id in (select id from rq);

insert into audit_log (actor, action, table_name, row_id, actor_name, actor_role, summary, company_id, created_at)
select a.id, 'INSERT', 'invoices', i.id::text, a.name, 'accountant',
       'Created invoice ' || i.invoice_no || ' (₦' || to_char(i.amount, 'FM999,999,999,990') || ')', i.company_id, i.created_at
from invoices i join u a on a.role = 'accountant' and a.company_id = i.company_id
where i.id in (select id from inv);

-- ===== Finish =====
select setval('request_seq', greatest(100, (select last_value from request_seq)));
select setval('invoice_seq', greatest(50, (select last_value from invoice_seq)));
select setval('ticket_seq', greatest(50, (select last_value from ticket_seq)));

alter table requests enable trigger user;
alter table invoices enable trigger user;
alter table payments enable trigger user;
alter table tickets enable trigger user;
alter table ratings enable trigger user;
alter table items enable trigger user;

select
  (select count(*) from companies) as companies,
  (select count(*) from profiles where role = 'customer') as customers,
  (select count(*) from profiles where role = 'technician') as technicians,
  (select count(*) from requests) as jobs,
  (select count(*) from invoices) as invoices,
  (select count(*) from assets) as assets,
  (select count(*) from items) as inventory,
  (select count(*) from tickets) as tickets,
  (select count(*) from audit_log) as audit_records;

commit;
