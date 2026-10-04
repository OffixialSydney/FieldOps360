-- Run this in Supabase > SQL Editor AFTER schema_v17.sql

-- 1. The customer's "Go ahead" for a job that is waiting for them
alter table requests add column customer_ready boolean not null default false;

create or replace function gate_resume() returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.status = 'waiting_customer' and old.status is distinct from 'waiting_customer' then
    new.customer_ready := false;
  end if;
  if old.status = 'waiting_customer' and new.status = 'in_progress' then
    if not old.customer_ready then
      raise exception 'Waiting for the customer to click Go ahead.';
    end if;
    if exists (select 1 from extra_charges where request_id = new.id and status = 'pending')
       or exists (select 1 from invoices where request_id = new.id and kind = 'additional' and status <> 'paid') then
      raise exception 'Waiting for the customer to approve and pay for the additional work, and for the accountant to confirm the payment.';
    end if;
    new.customer_ready := false;
  end if;
  return new;
end $$;

create function customer_go_ahead(p_request uuid) returns void language plpgsql security definer set search_path = public as $$
declare r requests%rowtype;
begin
  select * into r from requests where id = p_request and customer_id = auth.uid() and status = 'waiting_customer';
  if not found then raise exception 'This job is not waiting for you.'; end if;
  if exists (select 1 from extra_charges where request_id = p_request and status = 'pending') then
    raise exception 'Approve or reject the additional work first.';
  end if;
  update requests set customer_ready = true where id = p_request;
  if r.technician_id is not null then
    perform notify(r.technician_id, 'The customer says go ahead on ' || r.request_no);
  end if;
end $$;

-- 2. Additional work left unanswered is closed when the job finishes or is cancelled
create function close_pending_extras() returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.status in ('completed','cancelled','closed') and old.status is distinct from new.status then
    update extra_charges set status = 'rejected' where request_id = new.id and status = 'pending';
  end if;
  return new;
end $$;
create trigger close_extras_t after update on requests for each row execute function close_pending_extras();

update extra_charges set status = 'rejected'
where status = 'pending'
  and request_id in (select id from requests where status in ('completed','invoiced','paid','closed','cancelled'));

-- 3. Notifications name the job so they can open it
create or replace function notify_misc() returns trigger language plpgsql security definer set search_path = public as $$
declare rn text;
begin
  if tg_table_name = 'invoices' then
    perform notify(new.customer_id, 'Invoice ' || new.invoice_no || ' is ready' || case when new.kind = 'additional' then ' (additional work)' else '' end);
  elsif tg_table_name = 'extra_charges' then
    select request_no into rn from requests where id = new.request_id;
    perform notify((select customer_id from requests where id = new.request_id), 'Additional work needs your approval on ' || rn);
  elsif tg_table_name = 'tickets' and new.reply is distinct from old.reply then
    perform notify(new.customer_id, 'Ticket ' || coalesce(new.ticket_no, '') || ' has a reply');
  end if;
  return new;
end $$;
