'use client';
import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';

const money = (n) => '₦' + Number(n || 0).toLocaleString();
const LABEL = { deposit: 'Deposit', credit: 'Credit', refund: 'Refund', payment: 'Payment' };

/* Customer wallet */
export function WalletCard() {
  const [rows, setRows] = useState([]);
  const load = useCallback(async () => {
    const { data } = await supabase.from('wallet_transactions').select('*').order('id', { ascending: false }).limit(1);
    setRows(data || []);
  }, []);
  useEffect(() => { load(); const t = setInterval(load, 20000); return () => clearInterval(t); }, [load]);
  const balance = rows.length ? Number(rows[0].balance) : 0;

  return (
    <>
      <h2>My wallet</h2>
      <div className="card">
        <span className="muted">Balance</span>
        <div className="stat">{money(balance)}</div>
        <a href="/wallet/topup"><button style={{ marginTop: 8 }}>Add funds</button></a>
        <p className="muted">Fund your wallet by card, bank transfer or crypto. Invoices are paid from the wallet, and refunds are returned here.</p>
      </div>
    </>
  );
}

/* All wallet transactions: deposits, credits, refunds and payments */
export function TransactionList() {
  const [rows, setRows] = useState(null);
  const [type, setType] = useState('');
  const load = useCallback(async () => {
    const { data } = await supabase.from('wallet_transactions').select('*').order('id', { ascending: false }).limit(200);
    setRows(data || []);
  }, []);
  useEffect(() => { load(); const t = setInterval(load, 20000); return () => clearInterval(t); }, [load]);

  const shown = (rows || []).filter((t) => !type || t.type === type);
  return (
    <>
      <h3>Wallet transactions</h3>
      <div className="chips" style={{ marginBottom: 10 }}>
        {[['', 'All'], ['deposit', 'Deposits'], ['payment', 'Payments'], ['refund', 'Refunds'], ['credit', 'Credits']].map(([k, label]) => (
          <button key={k} type="button" className={`chip ${type === k ? 'on' : ''}`} onClick={() => setType(k)}>{label}</button>
        ))}
      </div>
      {!rows && <p className="muted">Loading...</p>}
      {rows && shown.length === 0 && (
        <div className="card" style={{ textAlign: 'center' }}>
          <p>{rows.length === 0 ? 'No transactions yet.' : 'No transactions of this type.'}</p>
          {rows.length === 0 && <a href="/wallet/topup"><button>Add funds</button></a>}
        </div>
      )}
      {shown.map((t) => (
        <div className="card row" key={t.id} style={{ justifyContent: 'space-between' }}>
          <span>
            <b>{LABEL[t.type]}</b>{t.note ? ` · ${t.note}` : ''}<br />
            <span className="muted">{new Date(t.created_at).toLocaleString()} · balance {money(t.balance)}</span>
          </span>
          <b style={{ color: t.amount > 0 ? '#0f766e' : '#b42318' }}>{t.amount > 0 ? '+' : '-'}{money(Math.abs(t.amount))}</b>
        </div>
      ))}
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
