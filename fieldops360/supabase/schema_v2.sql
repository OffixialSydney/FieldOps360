-- Run this in Supabase > SQL Editor AFTER schema.sql

create table attachments (
  id uuid primary key default gen_random_uuid(),
  request_id uuid references requests(id) on delete cascade,
  path text not null, name text,
  uploaded_by uuid references profiles(id),
  created_at timestamptz default now()
);
create table items (
  id uuid primary key default gen_random_uuid(),
  name text not null, quantity int not null default 0, unit_price numeric default 0
);
create table assets (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references profiles(id),
  request_id uuid references requests(id),
  name text not null, warranty_until date,
  created_at timestamptz default now()
);
create table tickets (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references profiles(id),
  subject text not null, message text, reply text,
  status text not null default 'open' check (status in ('open','closed')),
  created_at timestamptz default now()
);
create table ratings (
  id uuid primary key default gen_random_uuid(),
  request_id uuid unique references requests(id),
  customer_id uuid references profiles(id),
  technician_id uuid references profiles(id),
  stars int not null check (stars between 1 and 5),
  created_at timestamptz default now()
);
create table audit_log (
  id bigint generated always as identity primary key,
  actor uuid, action text, table_name text, row_id text,
  created_at timestamptz default now()
);

create function log_change() returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into audit_log (actor, action, table_name, row_id) values (auth.uid(), tg_op, tg_table_name, new.id::text);
  return new;
end $$;
create trigger audit_requests after insert or update on requests for each row execute function log_change();
create trigger audit_invoices after insert or update on invoices for each row execute function log_change();
create trigger audit_tickets after insert or update on tickets for each row execute function log_change();

create function use_item(p_item uuid, p_qty int) returns void language sql security definer set search_path = public as $$
  update items set quantity = greatest(quantity - p_qty, 0)
  where id = p_item and my_role() in ('technician','manager','super_admin');
$$;

alter table attachments enable row level security;
alter table items enable row level security;
alter table assets enable row level security;
alter table tickets enable row level security;
alter table ratings enable row level security;
alter table audit_log enable row level security;

create policy "read files" on attachments for select using (exists (select 1 from requests r where r.id = request_id));
create policy "add files" on attachments for insert with check (uploaded_by = auth.uid() and exists (select 1 from requests r where r.id = request_id));

create policy "staff read items" on items for select using (my_role() <> 'customer');
create policy "manager manages items" on items for all using (my_role() in ('manager','super_admin')) with check (my_role() in ('manager','super_admin'));

create policy "read assets" on assets for select using (customer_id = auth.uid() or my_role() <> 'customer');
create policy "create assets" on assets for insert with check (
  my_role() in ('manager','super_admin')
  or exists (select 1 from requests r where r.id = request_id and r.technician_id = auth.uid()));

create policy "read tickets" on tickets for select using (customer_id = auth.uid() or my_role() in ('manager','accountant','super_admin'));
create policy "create tickets" on tickets for insert with check (customer_id = auth.uid());
create policy "staff reply tickets" on tickets for update using (my_role() in ('manager','super_admin'));

create policy "read ratings" on ratings for select using (customer_id = auth.uid() or my_role() <> 'customer');
create policy "customer rates" on ratings for insert with check (customer_id = auth.uid());

create policy "admins read log" on audit_log for select using (my_role() in ('manager','super_admin'));

-- Private storage bucket for photos, videos and documents
insert into storage.buckets (id, name, public) values ('job-files', 'job-files', false);
create policy "signed-in upload" on storage.objects for insert to authenticated with check (bucket_id = 'job-files');
create policy "signed-in read" on storage.objects for select to authenticated using (bucket_id = 'job-files');
