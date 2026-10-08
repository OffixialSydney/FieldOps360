'use client';
import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import QRCode from 'qrcode';

const money = (n) => '₦' + Number(n || 0).toLocaleString();
const BANK = { name: process.env.NEXT_PUBLIC_BANK_NAME, number: process.env.NEXT_PUBLIC_BANK_ACCOUNT, holder: process.env.NEXT_PUBLIC_BANK_ACCOUNT_NAME };
const BTC = process.env.NEXT_PUBLIC_BTC_ADDRESS;
const CHIPS = [5000, 10000, 20000, 50000, 100000];

function Copy({ label, value }) {
  const [done, setDone] = useState(false);
  async function copy() {
    try { await navigator.clipboard.writeText(String(value)); } catch (e) { /* older browsers */ }
    setDone(true);
    setTimeout(() => setDone(false), 1500);
  }
  return (
    <div className="copybox">
      <div><span className="muted">{label}</span><div className="copyval">{value}</div></div>
      <button type="button" className="ghost" style={{ marginTop: 0 }} onClick={copy}>{done ? 'Copied' : 'Copy'}</button>
    </div>
  );
}

/* Screenshot upload for bank and Bitcoin transfers */
function ProofUpload({ meId, reference, withNote, onDone }) {
  const [msg, setMsg] = useState('');
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  async function upload(e) {
    const file = e.target.files[0];
    e.target.value = '';
    if (!file) return;
    if (!/^image\//.test(file.type) && file.type !== 'application/pdf') return setMsg('Please upload a screenshot (image) or PDF.');
    if (file.size > 8 * 1024 * 1024) return setMsg('That file is too large. The limit is 8 MB.');
    setBusy(true);
    setMsg('Uploading your screenshot...');
    const path = `${meId}/${reference}-${Date.now()}-${file.name.replace(/[^\w.-]/g, '_')}`;
    const { error } = await supabase.storage.from('topup-proofs').upload(path, file);
    if (error) { setBusy(false); return setMsg(error.message); }
    const { error: e2 } = await supabase.rpc('attach_topup_proof', { p_reference: reference, p_path: path, p_note: note || null });
    setBusy(false);
    if (e2) return setMsg(e2.message);
    setMsg('');
    onDone();
  }
  return (
    <div className="card" style={{ background: '#f9fafb' }}>
      <h3>Send your payment screenshot</h3>
      <p className="muted">After you have made the transfer, upload a screenshot of the receipt. The admin checks it and adds the money to your wallet.</p>
      {withNote && <><label>Transaction hash (optional)</label><input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Paste the transaction hash" /></>}
      <label className="filebtn">{busy ? 'Uploading...' : 'Upload screenshot'}<input type="file" accept="image/*,.pdf" onChange={upload} hidden disabled={busy} /></label>
      {msg && <p className="muted">{msg}</p>}
    </div>
  );
}

/* Add funds page */
export default function TopUpPage() {
  const [me, setMe] = useState(null);
  const [balance, setBalance] = useState(0);
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('');
  const [email, setEmail] = useState('');
  const [ref, setRef] = useState('');
  const [sent, setSent] = useState(false);
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);
  const [qr, setQr] = useState('');
  const [history, setHistory] = useState([]);

  const refresh = useCallback(async () => {
    const { data: w } = await supabase.from('wallet_transactions').select('balance').order('id', { ascending: false }).limit(1);
    setBalance(Number(w?.[0]?.balance || 0));
    const { data: h } = await supabase.from('wallet_topups').select('*').order('created_at', { ascending: false }).limit(8);
    setHistory(h || []);
  }, []);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) { window.location.href = '/'; return; }
      const { data: p } = await supabase.from('profiles').select('id,full_name,role,email').eq('id', data.session.user.id).single();
      setMe(p || { id: data.session.user.id, role: 'unknown' });
      setEmail(p?.email || data.session.user.email || '');
      refresh();
    })();
  }, [refresh]);

  useEffect(() => {
    if (method === 'bitcoin' && BTC) QRCode.toDataURL(`bitcoin:${BTC}`, { width: 220, margin: 1 }).then(setQr).catch(() => setQr(''));
  }, [method]);

  const n = Math.round(Number(amount));
  const valid = n >= 100 && n <= 5000000;
  const pick = (m) => { setMethod(m); setRef(''); setSent(false); setMsg(''); };

  async function paystack() {
    setBusy(true);
    setMsg('');
    const { data } = await supabase.auth.getSession();
    const res = await fetch('/api/paystack/initialize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${data.session?.access_token}` },
      body: JSON.stringify({ amount: n, email }),
    });
    const j = await res.json().catch(() => ({}));
    if (!res.ok || !j.url) { setBusy(false); return setMsg(j.error || 'Could not start the payment.'); }
    window.location.href = j.url;
  }

  async function getDetails(provider) {
    setBusy(true);
    setMsg('');
    const { data, error } = await supabase.rpc('request_topup', { p_provider: provider, p_amount: n });
    setBusy(false);
    if (error) return setMsg(error.message);
    setRef(data);
    refresh();
  }

  if (!me) return <p className="wrap">Loading...</p>;
  if (me.role !== 'customer') return <div className="wrap"><div className="card"><p>Only customers have a wallet.</p><a href="/dashboard"><button>Back to dashboard</button></a></div></div>;

  return (
    <>
      <div className="top"><b>Add funds</b><a href="/dashboard"><button className="ghost" style={{ marginTop: 0 }}>Back to dashboard</button></a></div>
      <div className="wrap">
        <div className="topup-hero">
          <span>Wallet balance</span>
          <div className="topup-balance">{money(balance)}</div>
          <span>Fund your wallet once, then pay any invoice from it in one tap.</span>
        </div>

        <h2>1. How much do you want to add?</h2>
        <div className="chips">
          {CHIPS.map((c) => <button key={c} type="button" className={`chip ${n === c ? 'on' : ''}`} onClick={() => setAmount(String(c))}>{money(c)}</button>)}
        </div>
        <input type="number" min="100" placeholder="Or enter another amount in naira" value={amount} onChange={(e) => setAmount(e.target.value)} style={{ marginTop: 8 }} />
        {amount && !valid && <p className="err">Enter an amount between ₦100 and ₦5,000,000.</p>}

        <h2>2. Choose how to pay</h2>
        <div className="methods">
          {[['paystack', 'Card or Paystack', 'Pay with your ATM card, bank or USSD on the secure Paystack page. Added instantly.'],
            ['bank', 'Bank transfer', 'Send from any bank app, then upload your screenshot. The admin confirms.'],
            ['bitcoin', 'Crypto (Bitcoin)', 'Send Bitcoin to our wallet, then upload your screenshot. The admin confirms.']].map(([k, title, text]) => (
            <button key={k} type="button" disabled={!valid} className={`method ${method === k ? 'on' : ''}`} onClick={() => pick(k)}>
              <b>{title}</b><span>{text}</span>
            </button>
          ))}
        </div>
        {!valid && <p className="muted">Choose an amount first.</p>}

        {valid && method === 'paystack' && (
          <div className="card">
            <h3>Pay {money(n)} with Paystack</h3>
            <label>Email for your receipt</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <button disabled={busy} onClick={paystack}>{busy ? 'Opening Paystack...' : 'Continue to Paystack'}</button>
            <p className="muted">You will be taken to Paystack's secure page. Your card details never touch this app.</p>
          </div>
        )}

        {valid && method === 'bank' && (
          <div className="card">
            <h3>Bank transfer of {money(n)}</h3>
            {!ref && <button disabled={busy} onClick={() => getDetails('bank')}>{busy ? 'Please wait...' : 'Show account details'}</button>}
            {ref && (BANK.number ? (
              <>
                <Copy label="Bank" value={BANK.name || '-'} />
                <Copy label="Account number" value={BANK.number} />
                <Copy label="Account name" value={BANK.holder || '-'} />
                <Copy label="Amount to send" value={n} />
                <Copy label="Reference (put this in the transfer narration)" value={ref} />
                {sent ? <p style={{ color: '#0f766e', fontWeight: 600 }}>Screenshot received. The admin will confirm and your wallet will be updated.</p>
                  : <ProofUpload meId={me.id} reference={ref} onDone={() => { setSent(true); refresh(); }} />}
              </>
            ) : <p className="err">Bank transfer is not set up yet. The site owner must add the bank details in Vercel.</p>)}
          </div>
        )}

        {valid && method === 'bitcoin' && (
          <div className="card">
            <h3>Pay {money(n)} in Bitcoin</h3>
            {!BTC ? <p className="err">Crypto payments are not set up yet. The site owner must add the wallet address in Vercel.</p> : (
              <>
                {!ref && <button disabled={busy} onClick={() => getDetails('bitcoin')}>{busy ? 'Please wait...' : 'Show wallet address'}</button>}
                {ref && (
                  <>
                    {qr && <img src={qr} alt="Bitcoin wallet QR code" style={{ display: 'block', margin: '8px auto', width: 200 }} />}
                    <Copy label="Bitcoin wallet address" value={BTC} />
                    <Copy label="Your reference" value={ref} />
                    <p className="muted">Send only Bitcoin (BTC) to this address. Other coins or networks will be lost. Send the naira value of {money(n)} at the current rate. The admin confirms the amount received.</p>
                    {sent ? <p style={{ color: '#0f766e', fontWeight: 600 }}>Screenshot received. The admin will confirm and your wallet will be updated.</p>
                      : <ProofUpload meId={me.id} reference={ref} withNote onDone={() => { setSent(true); refresh(); }} />}
                  </>
                )}
              </>
            )}
          </div>
        )}
        {msg && <p className="err">{msg}</p>}

        <h2>Recent top-ups</h2>
        {history.length === 0 && <div className="card" style={{ textAlign: 'center' }}><p className="muted">No top-ups yet.</p></div>}
        {history.map((t) => (
          <div className="card row" key={t.id} style={{ justifyContent: 'space-between' }}>
            <span>{money(t.amount)} · {t.provider === 'paystack' ? 'Paystack' : t.provider === 'bank' ? 'Bank transfer' : 'Bitcoin'}<br /><span className="muted">{t.reference} · {new Date(t.created_at).toLocaleString()}</span></span>
            <span className="badge">{t.status === 'success' ? 'Added' : t.status === 'failed' ? 'Not completed' : t.proof_path || t.provider === 'paystack' ? 'Waiting' : 'Needs your screenshot'}</span>
          </div>
        ))}
      </div>
    </>
  );
}

/* Admin: screenshots of transfers waiting to be confirmed */
export function TopupReview() {
  const [rows, setRows] = useState(null);
  const [amounts, setAmounts] = useState({});
  const load = useCallback(async () => {
    const { data } = await supabase.from('wallet_topups').select('*, customer:profiles!wallet_topups_customer_id_fkey(full_name,email)')
      .in('provider', ['bank', 'bitcoin']).order('created_at', { ascending: false }).limit(30);
    const list = await Promise.all((data || []).map(async (t) => {
      if (!t.proof_path) return t;
      const { data: s } = await supabase.storage.from('topup-proofs').createSignedUrl(t.proof_path, 3600);
      return { ...t, proofUrl: s?.signedUrl };
    }));
    setRows(list);
  }, []);
  useEffect(() => { load(); }, [load]);

  async function decide(t, ok) {
    const { error } = ok
      ? await supabase.rpc('confirm_topup', { p_id: t.id, p_amount: Number(amounts[t.id] ?? t.amount) })
      : await supabase.rpc('reject_topup', { p_id: t.id });
    if (error) alert(error.message);
    load();
  }
  if (!rows) return <p className="muted">Loading...</p>;
  const pending = rows.filter((t) => t.status === 'pending');
  const done = rows.filter((t) => t.status !== 'pending').slice(0, 8);
  return (
    <>
      {pending.length === 0 && <p className="muted">No transfers are waiting for confirmation.</p>}
      {pending.map((t) => (
        <div className="card" key={t.id}>
          <div className="row" style={{ justifyContent: 'space-between' }}>
            <h3>{t.customer?.full_name}</h3><span className="badge">{t.provider === 'bank' ? 'Bank transfer' : 'Bitcoin'}</span>
          </div>
          <p className="muted">{t.customer?.email} · {t.reference} · claims {money(t.amount)}{t.note ? ` · ${t.note}` : ''}<br />{new Date(t.created_at).toLocaleString()}</p>
          {t.proofUrl ? <a href={t.proofUrl} target="_blank" rel="noreferrer">View screenshot</a> : <p className="muted">No screenshot uploaded yet.</p>}
          <label>Amount to add to the wallet (₦)</label>
          <input type="number" min="1" value={amounts[t.id] ?? t.amount} onChange={(e) => setAmounts({ ...amounts, [t.id]: e.target.value })} />
          <div className="row">
            <button disabled={!t.proofUrl} onClick={() => decide(t, true)}>Confirm and add</button>
            <button className="danger" onClick={() => decide(t, false)}>Reject</button>
          </div>
        </div>
      ))}
      {done.length > 0 && <h3>Recently decided</h3>}
      {done.map((t) => <p key={t.id} className="muted" style={{ margin: '4px 0' }}>{t.customer?.full_name} · {money(t.amount)} · {t.reference} · {t.status === 'success' ? 'added' : 'rejected'}</p>)}
    </>
  );
}
