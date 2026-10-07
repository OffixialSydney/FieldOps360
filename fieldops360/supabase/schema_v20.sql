-- Run this in Supabase > SQL Editor AFTER schema_v19.sql
-- Wallet top-ups: Paystack (checked on the server), bank transfer and Bitcoin (confirmed by the platform admin).

create table wallet_topups (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references profiles(id),
  provider text not null check (provider in ('paystack','bank','bitcoin')),
  reference text not null unique,
  amount numeric not null check (amount > 0),
  status text not null default 'pending' check (status in ('pending','success','failed')),
  note text,
  proof_path text,
  created_at timestamptz default now(),
  confirmed_at timestamptz
);
alter table wallet_topups enable row level security;
create policy "read own topups" on wallet_topups for select using (customer_id = auth.uid() or my_role() = 'super_admin');

-- A customer starts a top-up (the server or the page calls this with the customer's own login)
create function request_topup(p_provider text, p_amount numeric, p_note text default null) returns text language plpgsql security definer set search_path = public as $$
declare ref text;
begin
  if my_role() <> 'customer' then raise exception 'Only customers have a wallet'; end if;
  if p_provider not in ('paystack','bank','bitcoin') then raise exception 'Unknown payment method'; end if;
  if p_amount < 100 or p_amount > 5000000 then raise exception 'The amount must be between ₦100 and ₦5,000,000'; end if;
  if p_provider <> 'paystack'
     and (select count(*) from wallet_topups where customer_id = auth.uid() and status = 'pending' and provider <> 'paystack') >= 5 then
    raise exception 'You already have several top-ups waiting for confirmation';
  end if;
  ref := 'FO-' || upper(substr(md5(random()::text || clock_timestamp()::text), 1, 12));
  insert into wallet_topups (customer_id, provider, reference, amount, note) values (auth.uid(), p_provider, ref, p_amount, p_note);
  return ref;
end $$;

-- Adds the money exactly once per reference. Only the server (service role) and the functions below can call it.
create function topup_credit(p_reference text, p_amount numeric) returns numeric language plpgsql security definer set search_path = public as $$
declare t wallet_topups%rowtype;
begin
  select * into t from wallet_topups where reference = p_reference for update;
  if not found then raise exception 'Unknown reference'; end if;
  if t.status = 'success' then return 0; end if;
  update wallet_topups set status = 'success', amount = p_amount, confirmed_at = now() where id = t.id;
  perform wallet_move(t.customer_id, p_amount, 'deposit', p_reference, initcap(t.provider) || ' top-up');
  perform notify(t.customer_id, '₦' || to_char(p_amount, 'FM999,999,999,990') || ' was added to your wallet');
  return p_amount;
end $$;
revoke execute on function topup_credit(text, numeric) from public, anon, authenticated;
grant execute on function topup_credit(text, numeric) to service_role;

-- The platform admin checks the bank statement or the blockchain, then confirms or rejects
create function confirm_topup(p_id uuid, p_amount numeric) returns void language plpgsql security definer set search_path = public as $$
declare t wallet_topups%rowtype;
begin
  if my_role() <> 'super_admin' then raise exception 'Only the platform admin can confirm top-ups'; end if;
  select * into t from wallet_topups where id = p_id and status = 'pending' and provider in ('bank','bitcoin');
  if not found then raise exception 'This top-up is not waiting for confirmation'; end if;
  if t.proof_path is null then raise exception 'The customer has not uploaded a screenshot yet'; end if;
  if p_amount <= 0 or p_amount > 10000000 then raise exception 'Invalid amount'; end if;
  perform topup_credit(t.reference, p_amount);
end $$;

create function reject_topup(p_id uuid) returns void language plpgsql security definer set search_path = public as $$
declare t wallet_topups%rowtype;
begin
  if my_role() <> 'super_admin' then raise exception 'Only the platform admin can reject top-ups'; end if;
  select * into t from wallet_topups where id = p_id and status = 'pending' and provider in ('bank','bitcoin');
  if not found then raise exception 'This top-up is not waiting for confirmation'; end if;
  update wallet_topups set status = 'failed', confirmed_at = now() where id = p_id;
  perform notify(t.customer_id, 'Your top-up ' || t.reference || ' could not be confirmed. Please contact support.');
end $$;

-- The old one-tap test deposit would let anyone add money for free, so it is switched off
revoke execute on function wallet_deposit(numeric) from public, anon, authenticated;

-- ===== Screenshots of bank and Bitcoin transfers =====
create function attach_topup_proof(p_reference text, p_path text, p_note text default null) returns void language plpgsql security definer set search_path = public as $$
begin
  update wallet_topups set proof_path = p_path, note = coalesce(p_note, note)
  where reference = p_reference and customer_id = auth.uid() and status = 'pending'
    and provider in ('bank','bitcoin') and p_path like auth.uid()::text || '/%';
  if not found then raise exception 'Could not attach the screenshot'; end if;
  insert into notifications (user_id, message)
    select id, 'Wallet top-up with a screenshot is waiting for confirmation: ' || p_reference from profiles where role = 'super_admin';
end $$;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('topup-proofs', 'topup-proofs', false, 8388608, array['image/jpeg','image/png','image/webp','image/heic','image/heif','application/pdf'])
on conflict (id) do nothing;

drop policy if exists "own proof upload" on storage.objects;
create policy "own proof upload" on storage.objects for insert to authenticated
  with check (bucket_id = 'topup-proofs' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists "own or admin proof read" on storage.objects;
create policy "own or admin proof read" on storage.objects for select to authenticated
  using (bucket_id = 'topup-proofs' and ((storage.foldername(name))[1] = auth.uid()::text or my_role() = 'super_admin'));

-- ===== Invoices are paid from the wallet only =====
create or replace function make_payment(p_invoice uuid, p_amount numeric, p_method text) returns void language plpgsql security definer set search_path = public as $$
declare inv invoices%rowtype;
begin
  if p_method <> 'wallet' then raise exception 'Invoices are paid from your wallet. Please add funds to your wallet first.'; end if;
  select * into inv from invoices where id = p_invoice and customer_id = auth.uid();
  if not found then raise exception 'Invoice not found'; end if;
  if p_amount <= 0 or p_amount > inv.amount - inv.paid_amount then raise exception 'Invalid amount'; end if;
  perform wallet_move(auth.uid(), -p_amount, 'payment', inv.invoice_no, 'Payment for ' || inv.invoice_no);
  insert into payments (invoice_id, amount, method, reference, status, created_by, company_id)
  values (p_invoice, p_amount, 'wallet', 'WALLET-' || upper(substr(md5(random()::text), 1, 8)), 'pending', auth.uid(), inv.company_id);
  perform recalc_invoice(p_invoice);
end $$;
