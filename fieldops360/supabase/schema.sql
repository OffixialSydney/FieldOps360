-- Run this whole file in Supabase > SQL Editor

create table profiles (
  id uuid primary key references auth.users on delete cascade,
  full_name text, phone text,
  role text not null default 'customer'
    check (role in ('customer','technician','manager','accountant','super_admin')),
  created_at timestamptz default now()
);

create table requests (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references profiles(id),
  technician_id uuid references profiles(id),
  service_type text not null, description text, address text, preferred_date date,
  status text not null default 'new'
    check (status in ('new','assigned','rejected','accepted','en_route','in_progress','completed','cancelled')),
  diagnosis text, work_done text, materials text,
  created_at timestamptz default now()
);

create table invoices (
  id uuid primary key default gen_random_uuid(),
  request_id uuid references requests(id),
  customer_id uuid not null references profiles(id),
  amount numeric not null default 0,
  status text not null default 'unpaid' check (status in ('unpaid','paid')),
  paid_at timestamptz,
  created_at timestamptz default now()
);

-- Auto-create a customer profile on signup
create function handle_new_user() returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into profiles (id, full_name, phone)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'phone');
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function handle_new_user();

create function my_role() returns text language sql stable security definer set search_path = public as
$$ select role from profiles where id = auth.uid() $$;

alter table profiles enable row level security;
alter table requests enable row level security;
alter table invoices enable row level security;

-- profiles
create policy "read profiles" on profiles for select using (id = auth.uid() or my_role() <> 'customer');
create policy "edit own profile" on profiles for update using (id = auth.uid()) with check (role = my_role());
create policy "admin edits profiles" on profiles for update using (my_role() = 'super_admin');

-- requests
create policy "read requests" on requests for select using (
  customer_id = auth.uid() or technician_id = auth.uid() or my_role() in ('manager','accountant','super_admin'));
create policy "customer creates" on requests for insert with check (customer_id = auth.uid());
create policy "manager updates" on requests for update using (my_role() in ('manager','super_admin'));
create policy "technician updates" on requests for update using (technician_id = auth.uid());

-- invoices
create policy "read invoices" on invoices for select using (
  customer_id = auth.uid() or my_role() in ('manager','accountant','super_admin'));
create policy "create invoices" on invoices for insert with check (
  my_role() in ('manager','accountant','super_admin')
  or exists (select 1 from requests r where r.id = request_id and r.technician_id = auth.uid()));
create policy "accountant updates invoices" on invoices for update using (my_role() in ('accountant','super_admin'));

-- Make yourself super admin after signing up (replace the email):
-- update profiles set role = 'super_admin' where id = (select id from auth.users where email = 'you@example.com');
-- Create staff: sign them up normally, then set role = 'technician' | 'manager' | 'accountant' the same way.
