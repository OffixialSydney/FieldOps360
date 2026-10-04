'use client';
import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';

const money = (n) => '₦' + Number(n || 0).toLocaleString();
const LABEL = { deposit: 'Deposit', credit: 'Credit', refund: 'Refund', payment: 'Payment' };

/* Customer wallet */
export function WalletCard() {
  const [rows, setRows] = useState([]);
  const [amt, setAmt] = useState('');
  const load = useCallback(async () => {
    const { data } = await supabase.from('wallet_transactions').select('*').order('id', { ascending: false }).limit(20);
    setRows(data || []);
  }, []);
  useEffect(() => { load(); const t = setInterval(load, 20000); return () => clearInterval(t); }, [load]);
  const balance = rows.length ? Number(rows[0].balance) : 0;

  async function deposit() {
    const { error } = await supabase.rpc('wallet_deposit', { p_amount: Number(amt) });
    if (error) return alert(error.message);
    setAmt('');
    load();
  }
  return (
    <>
      <h2>My wallet</h2>
      <div className="card">
        <span className="muted">Balance</span>
        <div className="stat">{money(balance)}</div>
        <label>Add money (test mode, no real money)</label>
        <div className="row">
          <input type="number" min="1" value={amt} onChange={(e) => setAmt(e.target.value)} placeholder="Amount" style={{ flex: 1 }} />
          <button style={{ marginTop: 0 }} onClick={deposit}>Add money</button>
        </div>
        <p className="muted">You can pay invoices from your wallet. Refunds are returned here.</p>
        {rows.map((t) => (
          <p key={t.id} className="muted" style={{ margin: '4px 0' }}>
            {new Date(t.created_at).toLocaleString()} · {LABEL[t.type]} · <b>{t.amount > 0 ? '+' : ''}{money(t.amount)}</b> · balance {money(t.balance)}{t.note ? ` · ${t.note}` : ''}
          </p>
        ))}
      </div>
    </>
  );
}

/* Accountant or manager adds a credit to a customer's wallet */
export function CreditForm() {
  const [custs, setCusts] = useState([]);
  const [f, setF] = useState({ customer: '', amount: '', note: '' });
  const [msg, setMsg] = useState('');
  useEffect(() => {
    (async () => {
      const { data: inv } = await supabase.from('invoices').select('customer_id');
      const ids = [...new Set((inv || []).map((i) => i.customer_id))];
      if (!ids.length) return;
      const { data } = await supabase.from('profiles').select('id,full_name').in('id', ids);
      setCusts(data || []);
    })();
  }, []);
  async function credit(e) {
    e.preventDefault();
    const { error } = await supabase.rpc('wallet_credit', { p_customer: f.customer, p_amount: Number(f.amount), p_note: f.note || null });
    setMsg(error ? error.message : 'Credit added to the wallet');
    if (!error) setF({ customer: '', amount: '', note: '' });
  }
  return (
    <form className="card" onSubmit={credit}>
      <select required value={f.customer} onChange={(e) => setF({ ...f, customer: e.target.value })}>
        <option value="">Choose a customer</option>
        {custs.map((c) => <option key={c.id} value={c.id}>{c.full_name}</option>)}
      </select>
      <input required type="number" min="1" placeholder="Amount" style={{ marginTop: 6 }} value={f.amount} onChange={(e) => setF({ ...f, amount: e.target.value })} />
      <input placeholder="Note (optional)" style={{ marginTop: 6 }} value={f.note} onChange={(e) => setF({ ...f, note: e.target.value })} />
      <button>Add credit</button>
      {msg && <p className="muted">{msg}</p>}
    </form>
  );
}
