-- Run this in Supabase > SQL Editor AFTER schema_v20.sql
-- Additional work: the technician can stop work only after the customer has refused twice.

alter table requests add column cancel_reason text;

-- The technician is told when the customer decides
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
  if e.technician_id is not null then
    perform notify(e.technician_id, 'The customer ' || case when p_status = 'approved' then 'approved' else 'declined' end
                   || ' your additional work request on ' || r.request_no);
  end if;
end $$;

-- A technician can cancel a job only after two refusals and with no approval
create function gate_stop() returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.status = 'cancelled' and old.status is distinct from 'cancelled' and my_role() = 'technician' then
    if (select count(*) from extra_charges where request_id = new.id and status = 'rejected') < 2
       or exists (select 1 from extra_charges where request_id = new.id and status = 'approved') then
      raise exception 'You can only stop work after the customer has refused the additional work twice.';
    end if;
  end if;
  return new;
end $$;
create trigger gate_stop_t before update on requests for each row execute function gate_stop();
