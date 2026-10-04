-- Run this in Supabase > SQL Editor AFTER schema_v16.sql
-- Wallet, ticket statuses, richer notifications, rating feedback and a readable audit log.

-- ===== 1. Customer wallet (every change is a transaction) =====
create table wallet_transactions (
  id bigint generated always as identity primary key,
  customer_id uuid not null references profiles(id),
  amount numeric not null,
  type text not null check (type in ('deposit','credit','refund','payment')),
  ref text, note text, balance numeric not null,
  created_by uuid, created_at timestamptz default now()
);
alter table wallet_transactions enable row level security;
create policy "read own wallet" on wallet_transactions for select using (customer_id = auth.uid());

create function wallet_move(p_customer uuid, p_amount numeric, p_type text, p_ref text, p_note text) returns void language plpgsql security definer set search_path = public as $$
declare bal numeric;
begin
  perform pg_advisory_xact_lock(hashtext(p_customer::text));
  select coalesce(sum(amount), 0) into bal from wallet_transactions where customer_id = p_customer;
  if bal + p_amount < 0 then raise exception 'Not enough money in the wallet'; end if;
  insert into wallet_transactions (customer_id, amount, type, ref, note, balance, created_by)
  values (p_customer, p_amount, p_type, p_ref, p_note, bal + p_amount, auth.uid());
end $$;

create function wallet_deposit(p_amount numeric) returns void language plpgsql security definer set search_path = public as $$
begin
  if my_role() <> 'customer' then raise exception 'Only customers have a wallet'; end if;
  if p_amount <= 0 or p_amount > 10000000 then raise exception 'Invalid amount'; end if;
  perform wallet_move(auth.uid(), p_amount, 'deposit', 'TEST-' || upper(substr(md5(random()::text), 1, 8)), 'Test-mode deposit');
end $$;

create function wallet_credit(p_customer uuid, p_amount numeric, p_note text) returns void language plpgsql security definer set search_path = public as $$
begin
  if my_role() not in ('accountant','manager') then raise exception 'Not allowed'; end if;
  if p_amount <= 0 then raise exception 'Invalid amount'; end if;
  if not can_see_customer(p_customer) then raise exception 'This customer is not linked to your company'; end if;
  perform wallet_move(p_customer, p_amount, 'credit', null, coalesce(p_note, 'Credit from company'));
end $$;

-- payments can be made from the wallet; rejected or refunded payments go back to the wallet
create or replace function make_payment(p_invoice uuid, p_amount numeric, p_method text) returns void language plpgsql security definer set search_path = public as $$
declare inv invoices%rowtype;
begin
  select * into inv from invoices where id = p_invoice and customer_id = auth.uid();
  if not found then raise exception 'Invoice not found'; end if;
  if p_amount <= 0 or p_amount > inv.amount - inv.paid_amount then raise exception 'Invalid amount'; end if;
  if p_method = 'wallet' then
    perform wallet_move(auth.uid(), -p_amount, 'payment', inv.invoice_no, 'Payment for ' || inv.invoice_no);
  end if;
  insert into payments (invoice_id, amount, method, reference, status, created_by, company_id)
  values (p_invoice, p_amount, p_method, 'TEST-' || upper(substr(md5(random()::text), 1, 8)), 'pending', auth.uid(), inv.company_id);
  perform recalc_invoice(p_invoice);
end $$;

create or replace function review_payment(p_payment uuid, p_action text) returns void language plpgsql security definer set search_path = public as $$
declare pay payments%rowtype; invn text;
begin
  if my_role() not in ('accountant','manager') then raise exception 'Not allowed'; end if;
  select * into pay from payments where id = p_payment and company_ok(company_id);
  if not found then raise exception 'Payment not found'; end if;
  select invoice_no into invn from invoices where id = pay.invoice_id;
  if p_action = 'confirm' and pay.status = 'pending' then update payments set status = 'confirmed' where id = p_payment;
  elsif p_action = 'fail' and pay.status = 'pending' then
    update payments set status = 'failed' where id = p_payment;
    if pay.method = 'wallet' then perform wallet_move(pay.created_by, pay.amount, 'refund', invn, 'Rejected payment returned'); end if;
  elsif p_action = 'refund' and pay.status = 'confirmed' then
    update payments set status = 'refunded' where id = p_payment;
    perform wallet_move(pay.created_by, pay.amount, 'refund', invn, 'Refund for ' || invn);
  else raise exception 'This change is not possible'; end if;
  perform recalc_invoice(pay.invoice_id);
end $$;

-- ===== 2. Notifications =====
alter table notifications add column ref text;
create unique index notif_ref_unique on notifications (user_id, ref) where ref is not null;

create or replace function notify_request() returns trigger language plpgsql security definer set search_path = public as $$
declare tname text; lbl text;
begin
  if tg_op = 'INSERT' then
    insert into notifications (user_id, message, company_id)
      select p.id,
        case when new.priority = 'urgent' then 'URGENT open request: ' else 'New open request: ' end
          || new.request_no || ' · ' || new.service_type || case when new.warranty_claim then ' (warranty claim)' else '' end,
        p.company_id
      from profiles p join companies c on c.id = p.company_id
      where p.role = 'manager' and c.status = 'active' and new.service_type = any(c.services);
    perform notify(new.customer_id, 'Request ' || new.request_no || ' received. A company will take it soon.');
    return new;
  end if;
  lbl := initcap(replace(new.status, '_', ' '));
  if new.technician_id is distinct from old.technician_id and new.technician_id is not null then
    perform notify(new.technician_id, 'New job assigned: ' || new.request_no || ' · ' || new.service_type);
  end if;
  if new.status is distinct from old.status then
    perform notify(new.customer_id, new.request_no || ' (' || new.service_type || '): ' || lbl);
    if new.technician_id is not null and auth.uid() = new.technician_id then
      select full_name into tname from profiles where id = new.technician_id;
      insert into notifications (user_id, message, company_id)
        select id, tname || ' changed ' || new.request_no || ' to ' || lbl, company_id
        from profiles where role = 'manager' and company_id = new.company_id;
    end if;
  end if;
  if new.scheduled_date is distinct from old.scheduled_date and new.scheduled_date is not null then
    perform notify(new.customer_id, 'Schedule updated for ' || new.request_no || ': ' || new.scheduled_date);
    if new.technician_id is not null then
      perform notify(new.technician_id, 'Schedule changed for ' || new.request_no || ': ' || new.scheduled_date);
    end if;
  end if;
  return new;
end $$;

create function notify_payment() returns trigger language plpgsql security definer set search_path = public as $$
declare invn text; amt text;
begin
  select invoice_no into invn from invoices where id = new.invoice_id;
  amt := '₦' || to_char(new.amount, 'FM999,999,999,990');
  if tg_op = 'INSERT' then
    insert into notifications (user_id, message, company_id)
      select id, 'Payment of ' || amt || ' for ' || invn || ' is waiting for confirmation', company_id
      from profiles where company_id = new.company_id and role in ('accountant','manager');
  elsif new.status is distinct from old.status then
    if new.status = 'confirmed' then
      perform notify(new.created_by, 'Payment of ' || amt || ' received for ' || invn);
    elsif new.status = 'failed' then
      perform notify(new.created_by, 'Payment of ' || amt || ' for ' || invn || ' failed');
      insert into notifications (user_id, message, company_id)
        select id, 'Failed payment of ' || amt || ' on ' || invn, company_id
        from profiles where company_id = new.company_id and role = 'manager';
    elsif new.status = 'refunded' then
      perform notify(new.created_by, 'Refund of ' || amt || ' for ' || invn || ' was added to your wallet');
    end if;
  end if;
  return new;
end $$;
create trigger notify_payment_t after insert or update on payments for each row execute function notify_payment();

create or replace function inventory_move(p_item uuid, p_change int, p_reason text, p_request uuid default null, p_note text default null)
returns void language plpgsql security definer set search_path = public as $$
declare bal int; cid uuid; nm text; mn int;
begin
  if my_role() not in ('technician','manager') then raise exception 'Not allowed'; end if;
  if my_role() = 'technician' and p_reason <> 'used' then raise exception 'Not allowed'; end if;
  perform set_config('app.ledger', 'on', true);
  update items set quantity = quantity + p_change where id = p_item and company_ok(company_id)
    returning quantity, company_id, name, min_stock into bal, cid, nm, mn;
  if bal is null then raise exception 'Item not found'; end if;
  if bal < 0 then raise exception 'Not enough stock'; end if;
  insert into inventory_transactions (item_id, change, reason, request_id, note, actor, balance, company_id)
  values (p_item, p_change, p_reason, p_request, p_note, auth.uid(), bal, cid);
  if bal < mn then
    insert into notifications (user_id, message, company_id)
      select id, 'Low stock: ' || nm || ' (' || bal || ' left, minimum ' || mn || ')', company_id
      from profiles where company_id = cid and role = 'manager';
  end if;
end $$;

create function check_warranty_alerts() returns void language plpgsql security definer set search_path = public as $$
begin
  insert into notifications (user_id, message, ref)
    select a.customer_id, a.name || ' warranty expires on ' || a.warranty_until,
           'warranty:' || a.id || ':' || a.warranty_until
    from assets a
    where a.customer_id = auth.uid() and a.status = 'active'
      and a.warranty_until between current_date and current_date + 30
  on conflict (user_id, ref) where ref is not null do nothing;
end $$;

-- ===== 3. Support tickets =====
create sequence if not exists ticket_seq start 1;
alter table tickets add column ticket_no text,
  add column priority text not null default 'normal' check (priority in ('low','normal','high','urgent'));
do $$
declare c text;
begin
  for c in select conname from pg_constraint
           where conrelid = 'public.tickets'::regclass and contype = 'c' and pg_get_constraintdef(oid) like '%status%' loop
    execute format('alter table tickets drop constraint %I', c);
  end loop;
end $$;
alter table tickets add constraint tickets_status_check check (status in ('open','assigned','in_progress','waiting_customer','resolved','closed'));
update tickets set ticket_no = 'TK-' || lpad(nextval('ticket_seq')::text, 5, '0') where ticket_no is null;

create function set_ticket_no() returns trigger language plpgsql security definer set search_path = public as $$
begin
  new.ticket_no := 'TK-' || lpad(nextval('ticket_seq')::text, 5, '0');
  return new;
end $$;
create trigger ticket_no_t before insert on tickets for each row execute function set_ticket_no();

create function notify_ticket_fn() returns trigger language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' then
    insert into notifications (user_id, message, company_id)
      select id, 'New ticket ' || new.ticket_no || ': ' || new.subject || ' (' || upper(new.priority) || ')', company_id
      from profiles where role = 'manager' and company_id = new.company_id;
  elsif new.status is distinct from old.status and new.reply is not distinct from old.reply then
    perform notify(new.customer_id, 'Ticket ' || new.ticket_no || ' is now ' || replace(new.status, '_', ' '));
  end if;
  return new;
end $$;
create trigger notify_ticket_new after insert or update on tickets for each row execute function notify_ticket_fn();

-- ===== 4. Rating feedback =====
alter table ratings add column feedback text;

-- ===== 5. Audit log: who, did what, to what, when =====
alter table audit_log add column actor_name text, add column actor_role text, add column summary text;

create or replace function log_change() returns trigger language plpgsql security definer set search_path = public as $$
declare who text; rl text; s text; cid uuid;
  m text := 'FM999,999,999,990';
begin
  select full_name, role into who, rl from profiles where id = auth.uid();
  if tg_table_name = 'requests' then
    cid := new.company_id;
    if tg_op = 'INSERT' then s := 'Created request ' || new.request_no || ' (' || new.service_type || ')';
    elsif new.technician_id is distinct from old.technician_id then
      s := 'Assigned ' || new.request_no || ' from ' || coalesce((select full_name from profiles where id = old.technician_id), 'Unassigned')
           || ' to ' || coalesce((select full_name from profiles where id = new.technician_id), 'Unassigned');
    elsif new.status is distinct from old.status then s := 'Changed status of ' || new.request_no || ' from ' || old.status || ' to ' || new.status;
    elsif new.priority is distinct from old.priority then s := 'Changed priority of ' || new.request_no || ' from ' || old.priority || ' to ' || new.priority;
    elsif new.scheduled_date is distinct from old.scheduled_date then s := 'Rescheduled ' || new.request_no || ' to ' || coalesce(new.scheduled_date::text, 'no date');
    end if;
  elsif tg_table_name = 'invoices' then
    cid := new.company_id;
    if tg_op = 'INSERT' then s := 'Created invoice ' || new.invoice_no || ' (₦' || to_char(new.amount, m) || ')';
    elsif new.amount is distinct from old.amount then s := 'Changed invoice ' || new.invoice_no || ' from ₦' || to_char(old.amount, m) || ' to ₦' || to_char(new.amount, m);
    elsif new.status is distinct from old.status then s := 'Invoice ' || new.invoice_no || ' status: ' || old.status || ' to ' || new.status;
    end if;
  elsif tg_table_name = 'tickets' then
    cid := new.company_id;
    if tg_op = 'INSERT' then s := 'Opened ticket ' || new.ticket_no || ': ' || new.subject;
    elsif new.status is distinct from old.status then s := 'Ticket ' || new.ticket_no || ' status: ' || old.status || ' to ' || new.status;
    elsif new.reply is distinct from old.reply then s := 'Replied to ticket ' || new.ticket_no;
    end if;
  end if;
  if s is null then return new; end if;
  insert into audit_log (actor, action, table_name, row_id, actor_name, actor_role, summary, company_id)
  values (auth.uid(), tg_op, tg_table_name, new.id::text, who, rl, s, cid);
  return new;
end $$;

create function log_admin() returns trigger language plpgsql security definer set search_path = public as $$
declare who text; rl text; s text; cid uuid;
begin
  if auth.uid() is null then return new; end if;
  select full_name, role into who, rl from profiles where id = auth.uid();
  if tg_table_name = 'profiles' then
    cid := new.company_id;
    if new.role is distinct from old.role then s := 'Changed role of ' || coalesce(new.full_name, 'user') || ' from ' || old.role || ' to ' || new.role;
    elsif new.company_id is distinct from old.company_id then
      s := 'Moved ' || coalesce(new.full_name, 'user') || ' from ' || coalesce((select name from companies where id = old.company_id), 'no company')
           || ' to ' || coalesce((select name from companies where id = new.company_id), 'no company');
    elsif old.requested_role is not null and new.requested_role is null then s := 'Declined the role request of ' || coalesce(new.full_name, 'user');
    end if;
  elsif tg_table_name = 'companies' then
    cid := new.id;
    if new.status is distinct from old.status then s := 'Company ' || new.name || ' status: ' || old.status || ' to ' || new.status;
    elsif new.plan is distinct from old.plan then s := 'Company ' || new.name || ' plan: ' || old.plan || ' to ' || new.plan;
    elsif new.services is distinct from old.services then s := 'Changed services offered by ' || new.name;
    end if;
  end if;
  if s is null then return new; end if;
  insert into audit_log (actor, action, table_name, row_id, actor_name, actor_role, summary, company_id)
  values (auth.uid(), 'UPDATE', tg_table_name, new.id::text, who, rl, s, cid);
  return new;
end $$;
create trigger audit_profiles after update on profiles for each row execute function log_admin();
create trigger audit_companies after update on companies for each row execute function log_admin();

-- ===== 6. Internal helper functions cannot be called directly from the app =====
revoke execute on function wallet_move(uuid, numeric, text, text, text) from public, anon, authenticated;
revoke execute on function notify(uuid, text) from public, anon, authenticated;
revoke execute on function recalc_invoice(uuid) from public, anon, authenticated;
