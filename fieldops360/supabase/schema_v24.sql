-- Run this in Supabase > SQL Editor AFTER schema_v23.sql
-- Wallet money now only comes from verified payments and refunds.
-- Company staff can no longer add credit to a customer's wallet.

create or replace function wallet_credit(p_customer uuid, p_amount numeric, p_note text) returns void language plpgsql security definer set search_path = public as $$
begin
  if my_role() <> 'super_admin' then raise exception 'Only the platform admin can credit a wallet'; end if;
  if p_amount <= 0 then raise exception 'Invalid amount'; end if;
  perform wallet_move(p_customer, p_amount, 'credit', null, coalesce(p_note, 'Credit from the platform'));
end $$;
