-- DEMO LOGINS. Steps:
-- 1) On the live site, sign up these five emails (any password you choose, for example Demo#12345):
--      admin@fieldops.demo   manager@fieldops.demo   accountant@fieldops.demo
--      technician@fieldops.demo   customer@fieldops.demo
-- 2) Run this script in the Supabase SQL Editor (after seed_demo.sql).

update auth.users set email_confirmed_at = coalesce(email_confirmed_at, now())
where email in ('admin@fieldops.demo','manager@fieldops.demo','accountant@fieldops.demo','technician@fieldops.demo','customer@fieldops.demo');

update profiles set role = 'super_admin', company_id = null, requested_role = null where email = 'admin@fieldops.demo';
update profiles set role = 'manager', requested_role = null, company_id = (select id from companies where name = 'YTech Engineering') where email = 'manager@fieldops.demo';
update profiles set role = 'accountant', requested_role = null, company_id = (select id from companies where name = 'YTech Engineering') where email = 'accountant@fieldops.demo';
update profiles set role = 'technician', requested_role = null, skills = 'Solar, Electrical, Generator', availability = 'available',
  company_id = (select id from companies where name = 'YTech Engineering') where email = 'technician@fieldops.demo';
update profiles set role = 'customer', requested_role = null, company_id = null where email = 'customer@fieldops.demo';

select email, role from profiles where email like '%@fieldops.demo' order by role;
