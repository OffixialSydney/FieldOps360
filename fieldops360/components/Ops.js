'use client';
import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export const money = (n) => '₦' + Number(n || 0).toLocaleString();
const num = (v) => Number(v || 0);

/* ---------- Warranty ---------- */
export function warrantyStatus(a) {
  if (!a.warranty_until) return { label: 'No warranty', color: '#667085' };
  const today = new Date().toISOString().slice(0, 10);
  const soon = new Date(Date.now() + 30 * 864e5).toISOString().slice(0, 10);
  if (a.warranty_until < today) return { label: 'Warranty expired', color: '#b42318' };
  if (a.warranty_until <= soon) return { label: 'Warranty expiring soon', color: '#b54708' };
  return { label: 'Warranty active', color: '#0f766e' };
}
export const WarrantyBadge = ({ a }) => {
  const w = warrantyStatus(a);
  return <span className="badge" style={{ background: 'transparent', border: `1px solid ${w.color}`, color: w.color }}>{w.label}</span>;
};

/* ---------- Diagnosis ---------- */
const DFIELDS = [['problem', 'Problem'], ['cause', 'Cause'], ['solution', 'Recommended solution'], ['notes', 'Additional notes']];

export function Diagnosis({ requestId, canEdit, meId }) {
  const [d, setD] = useState(null);
  const [saved, setSaved] = useState(false);
  const [msg, setMsg] = useState('');
  useEffect(() => {
    supabase.from('diagnoses').select('*').eq('request_id', requestId).maybeSingle().then(({ data }) => {
      setSaved(!!data);
      setD(data || { problem: '', cause: '', solution: '', notes: '', est_parts: '', est_labour: '' });
    });
  }, [requestId]);
  if (!d || (!canEdit && !saved)) return null;

  async function save() {
    const { error } = await supabase.from('diagnoses').upsert({
      request_id: requestId, problem: d.problem, cause: d.cause, solution: d.solution, notes: d.notes,
      est_parts: num(d.est_parts), est_labour: num(d.est_labour), updated_by: meId, updated_at: new Date().toISOString(),
    });
    setMsg(error ? error.message : 'Diagnosis saved');
    if (!error) setSaved(true);
  }

  if (!canEdit) {
    return (
      <div style={{ margin: '8px 0' }}>
        <h3>Diagnosis</h3>
        {DFIELDS.map(([k, label]) => d[k] ? <p key={k} style={{ margin: '4px 0' }}><span className="muted">{label}:</span> {d[k]}</p> : null)}
        <p className="muted">Estimated parts {money(d.est_parts)} · Estimated labour {money(d.est_labour)}</p>
      </div>
    );
  }
  return (
    <div style={{ margin: '8px 0' }}>
      <h3>Diagnosis</h3>
      {DFIELDS.map(([k, label]) => (
        <div key={k}>
          <label>{label}</label>
          <textarea value={d[k] || ''} onChange={(e) => setD({ ...d, [k]: e.target.value })} />
        </div>
      ))}
      <label>Estimated parts (₦)</label>
      <input type="number" min="0" value={d.est_parts ?? ''} onChange={(e) => setD({ ...d, est_parts: e.target.value })} />
      <label>Estimated labour (₦)</label>
      <input type="number" min="0" value={d.est_labour ?? ''} onChange={(e) => setD({ ...d, est_labour: e.target.value })} />
      <button type="button" onClick={save}>Save diagnosis</button>
      {msg && <p className="muted">{msg}</p>}
    </div>
  );
}

/* ---------- Materials used ---------- */
export function Materials({ requestId, canEdit }) {
  const [rows, setRows] = useState([]);
  const [items, setItems] = useState([]);
  const [f, setF] = useState({ item: '', name: '', qty: '', unit: '', price: '' });
  const load = useCallback(async () => {
    const { data } = await supabase.from('job_materials').select('*').eq('request_id', requestId).order('created_at');
    setRows(data || []);
  }, [requestId]);
  useEffect(() => {
    load();
    if (canEdit) supabase.from('items').select('id,name,quantity,unit,unit_price').order('name').then(({ data }) => setItems(data || []));
  }, [load, canEdit]);

  function pick(id) {
    const it = items.find((i) => i.id === id);
    setF(it ? { ...f, item: id, name: it.name, unit: it.unit || '', price: it.unit_price } : { ...f, item: '' });
  }
  async function add() {
    if (!f.name || !f.qty) return;
    if (f.item) {
      const { error } = await supabase.rpc('inventory_move', { p_item: f.item, p_change: -Math.round(num(f.qty)), p_reason: 'used', p_request: requestId });
      if (error) return alert(error.message);
    }
    await supabase.from('job_materials').insert({ request_id: requestId, item_id: f.item || null, name: f.name, unit: f.unit, qty: num(f.qty), unit_price: num(f.price) });
    setF({ item: '', name: '', qty: '', unit: '', price: '' });
    load();
  }
  const total = rows.reduce((s, m) => s + m.qty * m.unit_price, 0);
  if (!canEdit && !rows.length) return null;

  return (
    <div style={{ margin: '8px 0' }}>
      <h3>Materials and parts</h3>
      {rows.map((m) => (
        <p key={m.id} style={{ margin: '4px 0' }}>{m.name} · {m.qty} {m.unit} × {money(m.unit_price)} = <b>{money(m.qty * m.unit_price)}</b></p>
      ))}
      {rows.length > 0 && <p><b>Materials total: {money(total)}</b></p>}
      {canEdit && (
        <>
          <label>Take from inventory (optional)</label>
          <select value={f.item} onChange={(e) => pick(e.target.value)}>
            <option value="">Not from inventory</option>
            {items.map((i) => <option key={i.id} value={i.id}>{i.name} ({i.quantity} left)</option>)}
          </select>
          <input placeholder="Item name" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} style={{ marginTop: 6 }} />
          <div className="row" style={{ marginTop: 6 }}>
            <input type="number" min="0" placeholder="Quantity" value={f.qty} onChange={(e) => setF({ ...f, qty: e.target.value })} style={{ flex: 1 }} />
            <input placeholder="Unit (pcs, m)" value={f.unit} onChange={(e) => setF({ ...f, unit: e.target.value })} style={{ flex: 1 }} />
            <input type="number" min="0" placeholder="Unit price" value={f.price} onChange={(e) => setF({ ...f, price: e.target.value })} style={{ flex: 1 }} />
          </div>
          <button type="button" className="ghost" style={{ marginTop: 6 }} onClick={add}>Add material</button>
        </>
      )}
    </div>
  );
}

/* ---------- Invoice document, payments ---------- */
const ILABEL = { unpaid: 'UNPAID', pending: 'PENDING', partially_paid: 'PARTIALLY PAID', paid: 'PAID', refunded: 'REFUNDED', failed: 'FAILED' };

export function InvoiceCard({ inv, staff, onChange }) {
  const [open, setOpen] = useState(false);
  const [pays, setPays] = useState([]);
  const [co, setCo] = useState('');
  const [amt, setAmt] = useState('');
  const [method, setMethod] = useState('card_test');
  const balance = num(inv.amount) - num(inv.paid_amount);

  const loadPays = useCallback(async () => {
    const { data } = await supabase.from('payments').select('*').eq('invoice_id', inv.id).order('created_at');
    setPays(data || []);
  }, [inv.id]);
  useEffect(() => {
    if (!open) return;
    loadPays();
    if (inv.company_id) supabase.from('companies').select('name').eq('id', inv.company_id).maybeSingle().then(({ data }) => setCo(data?.name || ''));
  }, [open, loadPays, inv.company_id]);

  async function pay() {
    const { error } = await supabase.rpc('make_payment', { p_invoice: inv.id, p_amount: num(amt || balance), p_method: method });
    if (error) return alert(error.message);
    setAmt('');
    loadPays();
    onChange();
  }
  async function review(id, action) {
    const { error } = await supabase.rpc('review_payment', { p_payment: id, p_action: action });
    if (error) return alert(error.message);
    loadPays();
    onChange();
  }
  const lines = inv.items?.length ? inv.items : [{ label: 'Service', qty: 1, unit_price: inv.amount }];

  return (
    <div className="card">
      <div className="row" style={{ justifyContent: 'space-between' }}>
        <span><b>{inv.invoice_no}</b>{inv.kind === 'additional' ? ' · Additional work' : ''}{inv.customer?.full_name ? ` · ${inv.customer.full_name}` : ''}<br /><span className="muted">{inv.job?.request_no} · {money(inv.amount)}</span></span>
        <span className="badge">{ILABEL[inv.status]}</span>
      </div>
      <button type="button" className="ghost" style={{ marginTop: 8 }} onClick={() => setOpen(!open)}>{open ? 'Hide invoice' : 'View invoice'}</button>
      {open && (
        <div style={{ marginTop: 10 }}>
          <h3>{co || 'Company'}</h3>
          <p className="muted">Invoice {inv.invoice_no} · {new Date(inv.created_at).toLocaleDateString()} · Due {inv.due_date}<br />Job {inv.job?.request_no} · {inv.job?.service_type}</p>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead><tr style={{ textAlign: 'left' }}><th>Item</th><th>Qty</th><th>Price</th><th>Total</th></tr></thead>
              <tbody>
                {lines.map((l, i) => <tr key={i}><td>{l.label}</td><td>{l.qty}</td><td>{money(l.unit_price)}</td><td>{money(l.qty * l.unit_price)}</td></tr>)}
              </tbody>
            </table>
          </div>
          <p className="muted" style={{ textAlign: 'right' }}>
            Subtotal {money(inv.subtotal || inv.amount)}<br />
            {num(inv.discount) > 0 && <>Discount -{money(inv.discount)}<br /></>}
            {num(inv.tax) > 0 && <>Tax {money(inv.tax)}<br /></>}
            <b style={{ color: 'inherit' }}>TOTAL {money(inv.amount)}</b><br />
            Paid {money(inv.paid_amount)} · Balance {money(balance)}
          </p>
          {pays.length > 0 && <h3>Payments</h3>}
          {pays.map((p) => (
            <div className="row" key={p.id} style={{ justifyContent: 'space-between', margin: '6px 0' }}>
              <span className="muted">{money(p.amount)} · {p.method === 'card_test' ? 'Card (test)' : p.method === 'wallet' ? 'Wallet' : 'Bank transfer'} · {p.reference}</span>
              <span className="row">
                <span className="badge">{p.status}</span>
                {staff && p.status === 'pending' && <>
                  <button style={{ marginTop: 0 }} onClick={() => review(p.id, 'confirm')}>Confirm</button>
                  <button className="danger" style={{ marginTop: 0 }} onClick={() => review(p.id, 'fail')}>Reject</button>
                </>}
                {staff && p.status === 'confirmed' && <button className="ghost" onClick={() => review(p.id, 'refund')}>Refund</button>}
              </span>
            </div>
          ))}
          {!staff && balance > 0 && (
            <>
              <label>Amount to pay (leave empty for full balance)</label>
              <input type="number" min="1" max={balance} value={amt} onChange={(e) => setAmt(e.target.value)} placeholder={String(balance)} />
              <label>Payment method (test mode, no real money). The accountant confirms your payment.</label>
              <select value={method} onChange={(e) => setMethod(e.target.value)}>
                <option value="card_test">Card (test mode)</option>
                <option value="bank_transfer">Bank transfer</option>
                <option value="wallet">Wallet</option>
              </select>
              <button type="button" onClick={pay}>Pay now</button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

/* ---------- Asset register (manager) ---------- */
const addMonths = (d, m) => { const x = new Date(d); x.setMonth(x.getMonth() + Number(m)); return x.toISOString().slice(0, 10); };

export function AssetsAdmin({ readOnly }) {
  const [assets, setAssets] = useState([]);
  const [custs, setCusts] = useState([]);
  const [techs, setTechs] = useState([]);
  const empty = { name: '', serial: '', customer: '', tech: '', date: '', months: '' };
  const [f, setF] = useState(empty);
  const load = useCallback(async () => {
    const { data } = await supabase.from('assets').select('*, customer:profiles!assets_customer_id_fkey(full_name), tech:profiles!assets_technician_id_fkey(full_name)').order('created_at', { ascending: false });
    setAssets(data || []);
  }, []);
  useEffect(() => {
    load();
    supabase.from('profiles').select('id,full_name,role').in('role', ['customer', 'technician']).then(({ data }) => {
      setCusts((data || []).filter((p) => p.role === 'customer'));
      setTechs((data || []).filter((p) => p.role === 'technician'));
    });
  }, [load]);

  async function add(e) {
    e.preventDefault();
    const { error } = await supabase.from('assets').insert({
      name: f.name, serial_number: f.serial, customer_id: f.customer, technician_id: f.tech || null,
      installation_date: f.date || null, warranty_months: f.months ? Number(f.months) : null,
      warranty_start: f.months && f.date ? f.date : null, warranty_until: f.months && f.date ? addMonths(f.date, f.months) : null,
    });
    if (error) return alert(error.message);
    setF(empty);
    load();
  }
  async function setStatus(id, status) {
    await supabase.from('assets').update({ status }).eq('id', id);
    load();
  }

  return (
    <>
      <form className="card" onSubmit={add} hidden={readOnly}>
        <input required placeholder="Asset (e.g. Solar Inverter)" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
        <input placeholder="Serial number" style={{ marginTop: 6 }} value={f.serial} onChange={(e) => setF({ ...f, serial: e.target.value })} />
        <select required style={{ marginTop: 6 }} value={f.customer} onChange={(e) => setF({ ...f, customer: e.target.value })}>
          <option value="">Customer</option>
          {custs.map((c) => <option key={c.id} value={c.id}>{c.full_name}</option>)}
        </select>
        <select style={{ marginTop: 6 }} value={f.tech} onChange={(e) => setF({ ...f, tech: e.target.value })}>
          <option value="">Technician (optional)</option>
          {techs.map((c) => <option key={c.id} value={c.id}>{c.full_name}</option>)}
        </select>
        <label>Installation date</label>
        <input type="date" value={f.date} onChange={(e) => setF({ ...f, date: e.target.value })} />
        <label>Warranty (months)</label>
        <input type="number" min="0" value={f.months} onChange={(e) => setF({ ...f, months: e.target.value })} />
        <button>Register asset</button>
      </form>
      {assets.length === 0 && <p className="muted">No assets yet.</p>}
      {assets.map((a) => (
        <div className="card" key={a.id}>
          <div className="row" style={{ justifyContent: 'space-between' }}><h3>{a.name}</h3><WarrantyBadge a={a} /></div>
          <p className="muted">
            {a.serial_number ? `Serial ${a.serial_number} · ` : ''}{a.customer?.full_name}{a.tech?.full_name ? ` · Technician ${a.tech.full_name}` : ''}<br />
            Installed {a.installation_date || '-'} · Warranty {a.warranty_months ? `${a.warranty_months} months, until ${a.warranty_until}` : 'none'} · {a.status.toUpperCase()}
          </p>
          <select value={a.status} disabled={readOnly} style={{ width: 'auto' }} onChange={(e) => setStatus(a.id, e.target.value)}>
            <option value="active">Active</option><option value="inactive">Inactive</option><option value="retired">Retired</option>
          </select>
        </div>
      ))}
    </>
  );
}

/* ---------- Services a company offers ---------- */
const CATS = ['Solar', 'Electrical', 'Plumbing', 'AC', 'Generator', 'CCTV', 'Internet', 'Other'];

export function ServicesEditor({ company, admin, onSaved }) {
  const [sel, setSel] = useState(company.services || []);
  const [msg, setMsg] = useState('');
  const toggle = (c) => { setSel(sel.includes(c) ? sel.filter((x) => x !== c) : [...sel, c]); setMsg(''); };
  async function save() {
    const { error } = admin
      ? await supabase.from('companies').update({ services: sel }).eq('id', company.id)
      : await supabase.rpc('set_company_services', { p_services: sel });
    setMsg(error ? error.message : 'Services saved');
    if (!error && onSaved) onSaved();
  }
  return (
    <div className="card">
      <h3>Services {admin ? 'offered' : 'we offer'}</h3>
      <div className="row">
        {CATS.map((c) => (
          <label key={c} className="row" style={{ color: 'inherit', margin: 0 }}>
            <input type="checkbox" style={{ width: 'auto' }} checked={sel.includes(c)} onChange={() => toggle(c)} /> {c}
          </label>
        ))}
      </div>
      <button type="button" onClick={save}>Save services</button>
      {msg && <p className="muted">{msg}</p>}
    </div>
  );
}