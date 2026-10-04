-- Run this in Supabase > SQL Editor AFTER schema_v14.sql
-- Only the customer can approve or reject additional work.

create or replace function decide_extra(p_id uuid, p_status text) returns void language plpgsql security definer set search_path = public as $$
begin
  update extra_charges e set status = p_status from requests r
  where e.id = p_id and r.id = e.request_id and e.status = 'pending'
    and p_status in ('approved','rejected') and r.customer_id = auth.uid();
end $$;
