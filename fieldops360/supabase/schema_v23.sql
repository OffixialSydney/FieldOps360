-- Run this in Supabase > SQL Editor AFTER schema_v22.sql
-- The platform admin can read the wallet ledger for the transaction history screen (view only).

create policy "admin reads wallet" on wallet_transactions for select using (my_role() = 'super_admin');
