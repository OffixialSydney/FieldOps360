-- Run this in Supabase > SQL Editor AFTER schema_v24.sql
-- Stops an invoice being paid more than once, and repairs invoices that were already overpaid.

-- 1. A new payment cannot exceed what is left to pay, counting payments still waiting for approval
create or replace function make_payment(p_invoice uuid, p_amount numeric, p_method text) returns void language plpgsql security definer set search_path = public as $$
declare inv invoices%rowtype; pend numeric;
begin
  if p_method <> 'wallet' then raise exception 'Invoices are paid from your wallet. Please add funds to your wallet first.'; end if;
  select * into inv from invoices where id = p_invoice and customer_id = auth.uid() for update;
  if not found then raise exception 'Invoice not found'; end if;
  select coalesce(sum(amount), 0) into pend from payments where invoice_id = p_invoice and status = 'pending';
  if p_amount <= 0 or p_amount > inv.amount - inv.paid_amount - pend then
    raise exception 'This invoice already has a payment waiting for approval, or the amount is more than what is left to pay.';
  end if;
  perform wallet_move(auth.uid(), -p_amount, 'payment', inv.invoice_no, 'Payment for ' || inv.invoice_no);
  insert into payments (invoice_id, amount, method, reference, status, created_by, company_id)
  values (p_invoice, p_amount, 'wallet', 'WALLET-' || upper(substr(md5(random()::text), 1, 8)), 'pending', auth.uid(), inv.company_id);
  perform recalc_invoice(p_invoice);
end $$;

-- 2. Confirming a payment can never push an invoice past its total
create or replace function review_payment(p_payment uuid, p_action text) returns void language plpgsql security definer set search_path = public as $$
declare pay payments%rowtype; invn text; invtotal numeric;
begin
  if my_role() not in ('accountant','manager') then raise exception 'Not allowed'; end if;
  select * into pay from payments where id = p_payment and company_ok(company_id) for update;
  if not found then raise exception 'Payment not found'; end if;
  select invoice_no, amount into invn, invtotal from invoices where id = pay.invoice_id for update;
  if p_action = 'confirm' and pay.status = 'pending' then
    if (select coalesce(sum(amount), 0) from payments where invoice_id = pay.invoice_id and status = 'confirmed') + pay.amount > invtotal then
      raise exception 'Confirming this would pay more than the invoice total. Reject it instead and the money returns to the customer wallet.';
    end if;
    update payments set status = 'confirmed' where id = p_payment;
  elsif p_action = 'fail' and pay.status = 'pending' then
    update payments set status = 'failed' where id = p_payment;
    if pay.method = 'wallet' then perform wallet_move(pay.created_by, pay.amount, 'refund', invn, 'Rejected payment returned'); end if;
  elsif p_action = 'refund' and pay.status = 'confirmed' then
    update payments set status = 'refunded' where id = p_payment;
    perform wallet_move(pay.created_by, pay.amount, 'refund', invn, 'Refund for ' || invn);
  else raise exception 'This change is not possible'; end if;
  perform recalc_invoice(pay.invoice_id);
end $$;

-- 3. Repair: for every invoice, keep payments up to the invoice total and return the extra money to the customer's wallet
do $$
declare inv record; p record; kept numeric;
begin
  for inv in select id, invoice_no, amount from invoices loop
    kept := 0;
    for p in select * from payments where invoice_id = inv.id and status in ('confirmed','pending')
             order by (status = 'confirmed') desc, created_at loop
      if kept + p.amount <= inv.amount then
        kept := kept + p.amount;
      else
        update payments set status = case when p.status = 'confirmed' then 'refunded' else 'failed' end where id = p.id;
        if p.method = 'wallet' and p.created_by is not null then
          perform wallet_move(p.created_by, p.amount, 'refund', inv.invoice_no, 'Duplicate payment returned');
        end if;
      end if;
    end loop;
    perform recalc_invoice(inv.id);
  end loop;
end $$;

-- Check: no invoice should show more paid than its total
select invoice_no, amount, paid_amount, status from invoices where paid_amount > amount;
