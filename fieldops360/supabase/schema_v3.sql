-- Run this in Supabase > SQL Editor AFTER schema.sql and schema_v2.sql

create table addresses (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references profiles(id),
  label text, address text not null,
  created_at timestamptz default now()
);
alter table addresses enable row level security;
create policy "own addresses" on addresses for all
  using (customer_id = auth.uid()) with check (customer_id = auth.uid());

alter table requests add column scheduled_date date;
alter table requests add column signature text;
alter table invoices add column technician_id uuid references profiles(id);
alter table profiles add column commission_pct numeric not null default 30;

create policy "technician reads own invoices" on invoices for select using (technician_id = auth.uid());

-- Stop users from changing their own role or commission
drop policy "edit own profile" on profiles;
create policy "edit own profile" on profiles for update using (id = auth.uid())
  with check (role = my_role() and commission_pct = (select commission_pct from profiles where id = auth.uid()));

-- Change a technician's commission (replace the email):
-- update profiles set commission_pct = 40 where id = (select id from auth.users where email = 'tech@example.com');
