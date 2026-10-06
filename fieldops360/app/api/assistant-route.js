import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const CATS = ['Solar', 'Electrical', 'Plumbing', 'AC', 'Generator', 'CCTV', 'Internet', 'Other'];
const sum = (a, f) => a.reduce((s, x) => s + Number(f(x) || 0), 0);

/* Real numbers from the database, read with the user's own permissions */
async function gather(sb, me) {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const facts = { today: now.toISOString().slice(0, 10), user: { name: me.full_name, role: me.role } };

  if (['manager', 'super_admin', 'accountant'].includes(me.role)) {
    const staffOps = me.role !== 'accountant';
    const [pays, invs, reqs, items] = await Promise.all([
      sb.from('payments').select('invoice_id,amount,created_at').eq('status', 'confirmed'),
      sb.from('invoices').select('id,request_id,amount,paid_amount,status'),
      staffOps ? sb.from('requests').select('id,service_type,status,company_id') : { data: [] },
      staffOps ? sb.from('items').select('name,quantity,min_stock') : { data: [] },
    ]);
    const P = pays.data || [], I = invs.data || [], R = (reqs.data || []).filter((r) => r.company_id);
    const reqById = Object.fromEntries(R.map((r) => [r.id, r]));
    const invById = Object.fromEntries(I.map((i) => [i.id, i]));
    const since = (iso) => sum(P.filter((p) => p.created_at >= iso), (p) => p.amount);
    facts.revenue_naira = {
      today: since(new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()),
      this_month: since(monthStart),
      this_year: since(new Date(now.getFullYear(), 0, 1).toISOString()),
    };
    facts.outstanding_invoices_naira = sum(I.filter((i) => !['paid', 'refunded'].includes(i.status)), (i) => Number(i.amount) - Number(i.paid_amount));
    if (staffOps) {
      const count = (list) => R.filter((r) => list.includes(r.status)).length;
      facts.jobs = {
        pending: count(['new', 'reviewing', 'rejected']),
        active: count(['assigned', 'accepted', 'en_route', 'arrived', 'diagnosing', 'in_progress', 'waiting_parts', 'waiting_customer']),
        completed: count(['completed', 'invoiced', 'paid', 'closed']),
        cancelled: count(['cancelled']),
      };
      const bySvc = {};
      P.filter((p) => p.created_at >= monthStart).forEach((p) => {
        const s = reqById[invById[p.invoice_id]?.request_id]?.service_type || 'Other';
        bySvc[s] = (bySvc[s] || 0) + Number(p.amount);
      });
      facts.revenue_by_service_this_month_naira = bySvc;
      facts.low_stock_items = (items.data || []).filter((i) => i.quantity < i.min_stock).map((i) => `${i.name} (${i.quantity} left, minimum ${i.min_stock})`);
    }
  } else if (me.role === 'technician') {
    const { data } = await sb.from('requests').select('request_no,service_type,status,address,scheduled_date').order('created_at', { ascending: false }).limit(30);
    facts.my_jobs = data || [];
  } else if (me.role === 'customer') {
    const [r, i, w, a] = await Promise.all([
      sb.from('requests').select('request_no,service_type,status,priority').order('created_at', { ascending: false }).limit(30),
      sb.from('invoices').select('invoice_no,amount,paid_amount,status'),
      sb.from('wallet_transactions').select('balance').order('id', { ascending: false }).limit(1),
      sb.from('assets').select('name,warranty_until,status'),
    ]);
    facts.my_requests = r.data || [];
    facts.my_invoices = i.data || [];
    facts.wallet_balance_naira = w.data?.[0]?.balance ?? 0;
    facts.my_equipment = a.data || [];
  }
  return facts;
}

export async function POST(req) {
  const token = (req.headers.get('authorization') || '').replace('Bearer ', '');
  if (!token || token === 'undefined') return Response.json({ error: 'Please log in again.' }, { status: 401 });
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return Response.json({ reply: 'The assistant is not switched on yet. The site owner needs to add ANTHROPIC_API_KEY in the Vercel settings.' });

  const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
  const { data: u } = await sb.auth.getUser(token);
  if (!u?.user) return Response.json({ error: 'Please log in again.' }, { status: 401 });
  const hits = (globalThis.__aiHits ||= new Map());
  const nowMs = Date.now();
  const recent = (hits.get(u.user.id) || []).filter((t) => nowMs - t < 600000);
  if (recent.length >= 20) return Response.json({ error: 'You have asked a lot of questions. Please wait a few minutes and try again.' }, { status: 429 });
  hits.set(u.user.id, [...recent, nowMs]);
  const { data: me } = await sb.from('profiles').select('id,full_name,role').eq('id', u.user.id).single();
  if (!me) return Response.json({ error: 'Profile not found.' }, { status: 403 });

  const body = await req.json();
  const messages = (body.messages || []).slice(-10).map((m) => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: String(m.content).slice(0, 2000) }));
  const facts = await gather(sb, me);

  const system = `You are the assistant inside FieldOps 360, a field service platform. You are talking to ${me.full_name}, whose role is ${me.role}.
RULES:
- For any statement about jobs, money, customers, technicians, stock or invoices on this platform, use ONLY the PLATFORM FACTS below. Never invent or estimate platform data. If the facts do not contain the answer, say you do not have that information.
- You may give general technical guidance (for example likely causes of an inverter overload or a leaking AC). Say it is general advice, mention safety, and recommend a qualified technician.
- You cannot change data. Never claim you did something.
${me.role === 'customer' ? `- If the customer describes a problem that needs a technician, end your reply with one final line exactly like: REQUEST: {"service_type":"AC","priority":"normal","description":"short description"}. service_type must be one of ${CATS.join(', ')}. priority is low, normal, high or urgent. The customer will confirm before anything is created.` : ''}
- Money is in naira (₦). Keep answers short.
PLATFORM FACTS (JSON): ${JSON.stringify(facts)}`;

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'x-api-key': key, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
    body: JSON.stringify({ model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-5-5', max_tokens: 700, system, messages }),
  });
  const j = await res.json();
  if (!res.ok) return Response.json({ error: j.error?.message || 'The assistant could not answer right now.' });

  let reply = (j.content || []).map((c) => c.text || '').join('').trim();
  let request = null;
  const m = reply.match(/\nREQUEST:\s*(\{.*\})\s*$/s) || reply.match(/^REQUEST:\s*(\{.*\})\s*$/s);
  if (m && me.role === 'customer') {
    try {
      const r = JSON.parse(m[1]);
      if (CATS.includes(r.service_type) && r.description) request = { service_type: r.service_type, priority: ['low', 'normal', 'high', 'urgent'].includes(r.priority) ? r.priority : 'normal', description: String(r.description).slice(0, 500) };
    } catch (e) { /* ignore a malformed suggestion */ }
    reply = reply.replace(m[0], '').trim();
  }
  return Response.json({ reply, request });
}