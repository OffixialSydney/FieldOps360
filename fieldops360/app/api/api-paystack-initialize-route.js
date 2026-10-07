import { bearer, userClient, paystack, notSetUp } from '../../../../lib/server';

export const dynamic = 'force-dynamic';

export async function POST(req) {
  const token = bearer(req);
  if (!token || token === 'undefined') return Response.json({ error: 'Please log in again.' }, { status: 401 });
  if (!process.env.PAYSTACK_SECRET_KEY || !process.env.SUPABASE_SERVICE_ROLE_KEY) return notSetUp();

  const sb = userClient(token);
  const { data: u } = await sb.auth.getUser(token);
  if (!u?.user) return Response.json({ error: 'Please log in again.' }, { status: 401 });

  const hits = (globalThis.__payHits ||= new Map());
  const now = Date.now();
  const recent = (hits.get(u.user.id) || []).filter((t) => now - t < 600000);
  if (recent.length >= 10) return Response.json({ error: 'Too many attempts. Please wait a few minutes.' }, { status: 429 });
  hits.set(u.user.id, [...recent, now]);

  const body = await req.json();
  const amount = Math.round(Number(body.amount));
  const email = String(body.email || u.user.email || '').trim();
  if (!(amount >= 100 && amount <= 5000000)) return Response.json({ error: 'The amount must be between ₦100 and ₦5,000,000.' }, { status: 400 });
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return Response.json({ error: 'Please enter a valid email for the receipt.' }, { status: 400 });

  const { data: reference, error } = await sb.rpc('request_topup', { p_provider: 'paystack', p_amount: amount });
  if (error) return Response.json({ error: error.message }, { status: 400 });

  const j = await paystack('/transaction/initialize', {
    method: 'POST',
    body: JSON.stringify({
      email, amount: amount * 100, currency: 'NGN', reference,
      callback_url: `${new URL(req.url).origin}/wallet/callback`,
      metadata: { purpose: 'wallet_topup', customer_id: u.user.id },
    }),
  });
  if (!j.status) return Response.json({ error: j.message || 'Paystack could not start the payment.' }, { status: 502 });
  return Response.json({ url: j.data.authorization_url, reference });
}
