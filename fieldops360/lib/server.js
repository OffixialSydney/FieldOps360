import { createClient } from '@supabase/supabase-js';

export const bearer = (req) => (req.headers.get('authorization') || '').replace('Bearer ', '');

export const userClient = (token) =>
  createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });

/* Full access client. Only used on the server, and only for crediting a verified payment */
export const adminClient = () =>
  process.env.SUPABASE_SERVICE_ROLE_KEY
    ? createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } })
    : null;

export const paystack = (path, options = {}) =>
  fetch(`https://api.paystack.co${path}`, {
    ...options,
    headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`, 'Content-Type': 'application/json' },
  }).then((r) => r.json());

export const notSetUp = () =>
  Response.json({ error: 'Card payments are not switched on yet. The site owner must add the Paystack and Supabase keys in Vercel.' }, { status: 503 });
