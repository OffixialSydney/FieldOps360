import crypto from 'crypto';
import { adminClient } from '../../../../lib/server';

export const dynamic = 'force-dynamic';

/* Paystack calls this when a payment succeeds, even if the customer closed the page */
export async function POST(req) {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  const admin = adminClient();
  if (!secret || !admin) return new Response('Not set up', { status: 503 });

  const raw = await req.text();
  const sent = req.headers.get('x-paystack-signature') || '';
  const expected = crypto.createHmac('sha512', secret).update(raw).digest('hex');
  const a = Buffer.from(sent);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return new Response('Invalid signature', { status: 401 });

  const event = JSON.parse(raw);
  if (event.event === 'charge.success') {
    const ref = event.data?.reference;
    const { data: t } = await admin.from('wallet_topups').select('*').eq('reference', ref).maybeSingle();
    if (t && t.provider === 'paystack' && t.status !== 'success'
        && event.data.amount === Math.round(Number(t.amount) * 100) && event.data.currency === 'NGN') {
      await admin.rpc('topup_credit', { p_reference: ref, p_amount: t.amount });
    }
  }
  return new Response('ok', { status: 200 });
}