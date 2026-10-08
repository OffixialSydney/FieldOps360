import { bearer, userClient, adminClient, paystack, notSetUp } from '../../../../lib/server';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  const token = bearer(req);
  if (!token || token === 'undefined') return Response.json({ error: 'Please log in again.' }, { status: 401 });
  if (!process.env.PAYSTACK_SECRET_KEY) return notSetUp();
  const admin = adminClient();
  if (!admin) return notSetUp();

  const sb = userClient(token);
  const { data: u } = await sb.auth.getUser(token);
  if (!u?.user) return Response.json({ error: 'Please log in again.' }, { status: 401 });

  const reference = new URL(req.url).searchParams.get('reference') || '';
  const { data: t } = await sb.from('wallet_topups').select('*').eq('reference', reference).maybeSingle();
  if (!t || t.provider !== 'paystack') return Response.json({ error: 'We could not find this payment.' }, { status: 404 });
  if (t.status === 'success') return Response.json({ status: 'success', amount: t.amount });

  const j = await paystack(`/transaction/verify/${encodeURIComponent(reference)}`);
  if (!j.status) return Response.json({ status: 'pending', message: j.message });
  if (j.data.status !== 'success') return Response.json({ status: j.data.status === 'failed' || j.data.status === 'abandoned' ? 'failed' : 'pending' });
  if (j.data.amount !== Math.round(Number(t.amount) * 100) || j.data.currency !== 'NGN') {
    return Response.json({ status: 'failed', message: 'The amount paid does not match. Please contact support.' });
  }
  const { error } = await admin.rpc('topup_credit', { p_reference: reference, p_amount: t.amount });
  if (error) return Response.json({ status: 'pending', message: 'Your payment was received. Adding it to your wallet may take a moment.' });
  return Response.json({ status: 'success', amount: t.amount });
}
