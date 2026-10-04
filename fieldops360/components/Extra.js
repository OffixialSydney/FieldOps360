'use client';
import { useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { WarrantyBadge } from './Ops';

const money = (n) => '₦' + Number(n || 0).toLocaleString();

/* Photos, videos and documents for a job */
export function Files({ requestId, canUpload }) {
  const [files, setFiles] = useState([]);
  const load = useCallback(async () => {
    const { data } = await supabase.from('attachments').select('*').eq('request_id', requestId);
    const list = await Promise.all((data || []).map(async (a) => {
      const { data: s } = await supabase.storage.from('job-files').createSignedUrl(a.path, 3600);
      return { ...a, url: s?.signedUrl };
    }));
    setFiles(list);
  }, [requestId]);
  useEffect(() => { load(); }, [load]);

  async function upload(e) {
    const file = e.target.files[0];
    if (!file) return;
    const path = `${requestId}/${Date.now()}-${file.name.replace(/[^\w.-]/g, '_')}`;
    const { error } = await supabase.storage.from('job-files').upload(path, file);
    if (error) return;
    const { data: u } = await supabase.auth.getUser();
    await supabase.from('attachments').insert({ request_id: requestId, path, name: file.name, uploaded_by: u.user.id });
    load();
  }

  return (
    <div style={{ margin: '8px 0' }}>
      {files.map((f) => <a key={f.id} href={f.url} target="_blank" rel="noreferrer" className="muted" style={{ marginRight: 10 }}>{f.name}</a>)}
      {canUpload && <input type="file" accept="image/*,video/*,.pdf" onChange={upload} />}
    </div>
  );
}

/* Customer rates a completed job */
export function Rating({ request }) {
  const [stars, setStars] = useState(null);
  useEffect(() => {
    supabase.from('ratings').select('stars').eq('request_id', request.id).maybeSingle().then(({ data }) => setStars(data?.stars || null));
  }, [request.id]);
  async function rate(n) {
    const { error } = await supabase.from('ratings').insert({ request_id: request.id, customer_id: request.customer_id, technician_id: request.technician_id, stars: n });
    if (error) return alert(error.message);
    setStars(n);
  }
  if (stars) return <p style={{ margin: '8px 0' }}>Your rating: {stars}/10</p>;
  return (
    <div style={{ margin: '8px 0' }}>
      <h3>Rate the technician (1 to 10)</h3>
      <div className="row">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => <button key={n} style={{ marginTop: 0 }} onClick={() => rate(n)}>{n}</button>)}
      </div>
    </div>
  );
}

/* Support tickets: customers create, staff reply */
export function Tickets({ me, staff, readOnly }) {
  const [rows, setRows] = useState([]);
  const [f, setF] = useState({ subject: '', message: '', request_id: '' });
  const [reply, setReply] = useState({});
  const [showClosed, setShowClosed] = useState(false);
  const [jobs, setJobs] = useState([]);
  useEffect(() => {
    if (!staff) supabase.from('requests').select('id,request_no,service_type').not('company_id', 'is', null).then(({ data }) => setJobs(data || []));
  }, [staff]);
  const load = useCallback(async () => {
    const { data } = await supabase.from('tickets').select('*').order('created_at', { ascending: false });
    setRows(data || []);
  }, []);
  useEffect(() => { load(); }, [load]);

  const visible = staff && !showClosed ? rows.filter((t) => t.status === 'open') : rows;

  async function create(e) {
    e.preventDefault();
    await supabase.from('tickets').insert({ ...f, customer_id: me.id });
    setF({ subject: '', message: '', request_id: '' });
    load();
  }
  async function answer(t) {
    await supabase.from('tickets').update({ reply: reply[t.id], status: 'closed' }).eq('id', t.id);
    load();
  }

  return (
    <>
      {!staff && (
        <form className="card" onSubmit={create}>
          <label>Which job is this about?</label>
          <select required value={f.request_id} onChange={(e) => setF({ ...f, request_id: e.target.value })}>
            <option value="">Choose a job</option>
            {jobs.map((j) => <option key={j.id} value={j.id}>{j.request_no} · {j.service_type}</option>)}
          </select>
          {jobs.length === 0 && <p className="muted">You can open a ticket once a company has accepted one of your requests.</p>}
          <label>Subject</label>
          <input required value={f.subject} onChange={(e) => setF({ ...f, subject: e.target.value })} />
          <label>Message</label>
          <textarea required value={f.message} onChange={(e) => setF({ ...f, message: e.target.value })} />
          <button>Send ticket</button>
        </form>
      )}
      {staff && <button className="ghost" onClick={() => setShowClosed(!showClosed)}>{showClosed ? 'Hide closed tickets' : 'Show closed tickets'}</button>}
      {visible.length === 0 && <p className="muted">No tickets.</p>}
      {visible.map((t) => (
        <div className="card" key={t.id}>
          <div className="row" style={{ justifyContent: 'space-between' }}><h3>{t.subject}</h3><span className="badge">{t.status}</span></div>
          <p>{t.message}</p>
          {t.reply && <p className="muted">Reply: {t.reply}</p>}
          {readOnly && t.status === 'open' && <p className="muted">Waiting for the company manager to reply.</p>}
          {staff && !readOnly && t.status === 'open' && (
            <>
              <textarea placeholder="Write a reply" onChange={(e) => setReply({ ...reply, [t.id]: e.target.value })} />
              <button onClick={() => answer(t)}>Reply and close</button>
            </>
          )}
        </div>
      ))}
    </>
  );
}

/* Inventory management */
const IFIELDS = [['name', 'Item name', 'text'], ['sku', 'SKU', 'text'], ['category', 'Category', 'text'], ['quantity', 'Opening quantity', 'number'], ['unit', 'Unit (pcs, m, kg)', 'text'], ['cost', 'Cost price', 'number'], ['unit_price', 'Selling price', 'number'], ['min_stock', 'Minimum stock', 'number'], ['supplier', 'Supplier', 'text'], ['location', 'Storage location', 'text']];

export function Inventory({ readOnly }) {
  const [items, setItems] = useState([]);
  const empty = Object.fromEntries(IFIELDS.map(([k]) => [k, '']));
  const [f, setF] = useState(empty);
  const load = useCallback(async () => {
    const { data } = await supabase.from('items').select('*').order('name');
    setItems(data || []);
  }, []);
  useEffect(() => { load(); }, [load]);

  async function add(e) {
    e.preventDefault();
    const n = (v) => Number(v || 0);
    const { error } = await supabase.from('items').insert({ ...f, unit: f.unit || 'pcs', quantity: n(f.quantity), cost: n(f.cost), unit_price: n(f.unit_price), min_stock: n(f.min_stock) });
    if (error) return alert(error.message);
    setF(empty);
    load();
  }

  return (
    <>
      <form className="card" onSubmit={add} hidden={readOnly}>
        {IFIELDS.map(([k, label, type]) => (
          <div key={k}>
            <label>{label}</label>
            <input required={k === 'name'} type={type} min="0" value={f[k]} onChange={(e) => setF({ ...f, [k]: e.target.value })} />
          </div>
        ))}
        <button>Add item</button>
      </form>
      {items.length === 0 && <p className="muted">No items yet.</p>}
      {items.map((i) => <ItemRow key={i.id} it={i} reload={load} readOnly={readOnly} />)}
    </>
  );
}

function ItemRow({ it, reload, readOnly }) {
  const [qty, setQty] = useState('');
  const [reason, setReason] = useState('purchased');
  const [ledger, setLedger] = useState(null);
  const low = it.quantity < it.min_stock;

  async function apply() {
    const n = Math.round(Number(qty));
    if (!n) return;
    const change = reason === 'purchased' ? Math.abs(n) : reason === 'damaged' ? -Math.abs(n) : n;
    const { error } = await supabase.rpc('inventory_move', { p_item: it.id, p_change: change, p_reason: reason });
    if (error) return alert(error.message);
    setQty('');
    setLedger(null);
    reload();
  }
  async function showLedger() {
    if (ledger) return setLedger(null);
    const { data } = await supabase.from('inventory_transactions').select('*').eq('item_id', it.id).order('created_at', { ascending: false }).limit(30);
    setLedger(data || []);
  }

  return (
    <div className="card">
      <div className="row" style={{ justifyContent: 'space-between' }}>
        <h3>{it.name} {low && <span className="badge" style={{ background: '#fde8e8', color: '#b42318' }}>LOW STOCK</span>}</h3>
        <b>{it.quantity} {it.unit}</b>
      </div>
      <p className="muted">
        {it.sku ? `SKU ${it.sku} · ` : ''}{it.category ? `${it.category} · ` : ''}Minimum {it.min_stock} · Cost {money(it.cost)} · Price {money(it.unit_price)}
        {it.supplier ? ` · Supplier ${it.supplier}` : ''}{it.location ? ` · ${it.location}` : ''}
      </p>
      <div className="row">
        {!readOnly && (
          <>
            <input type="number" placeholder="Quantity" value={qty} onChange={(e) => setQty(e.target.value)} style={{ width: 110 }} />
            <select value={reason} onChange={(e) => setReason(e.target.value)} style={{ width: 'auto' }}>
              <option value="purchased">Purchased (+)</option>
              <option value="damaged">Damaged (-)</option>
              <option value="adjustment">Correction (+ or -)</option>
            </select>
            <button style={{ marginTop: 0 }} onClick={apply}>Apply</button>
          </>
        )}
        <button className="ghost" onClick={showLedger}>{ledger ? 'Hide ledger' : 'Ledger'}</button>
      </div>
      {ledger && ledger.map((t) => (
        <p key={t.id} className="muted" style={{ margin: '4px 0' }}>
          {new Date(t.created_at).toLocaleString()} · {t.reason} · <b>{t.change > 0 ? `+${t.change}` : t.change}</b> · balance {t.balance}
        </p>
      ))}
    </div>
  );
}

/* Technician picks the inventory item used on a job */
export function ItemPicker({ onItem, onQty }) {
  const [items, setItems] = useState([]);
  useEffect(() => { supabase.from('items').select('id,name,quantity').gt('quantity', 0).then(({ data }) => setItems(data || [])); }, []);
  return (
    <>
      <label>Inventory item used (optional)</label>
      <select onChange={onItem} defaultValue="">
        <option value="">None</option>
        {items.map((i) => <option key={i.id} value={i.id}>{i.name} ({i.quantity} left)</option>)}
      </select>
      <label>Quantity used</label>
      <input type="number" min="1" onChange={onQty} />
    </>
  );
}

/* Customer equipment and warranties */
export function Assets() {
  const [rows, setRows] = useState([]);
  useEffect(() => { supabase.from('assets').select('*').order('created_at', { ascending: false }).then(({ data }) => setRows(data || [])); }, []);
  if (!rows.length) return <p className="muted">Equipment installed or serviced for you will appear here.</p>;
  return rows.map((a) => (
    <div className="card" key={a.id}>
      <div className="row" style={{ justifyContent: 'space-between' }}><h3>{a.name}</h3><WarrantyBadge a={a} /></div>
      <p className="muted">
        {a.serial_number ? `Serial ${a.serial_number} · ` : ''}Installed {a.installation_date || '-'} · {a.warranty_until ? `Warranty until ${a.warranty_until}` : 'No warranty'}
      </p>
    </div>
  ));
}

/* Activity log */
export function Audit() {
  const [rows, setRows] = useState([]);
  useEffect(() => { supabase.from('audit_log').select('*').order('created_at', { ascending: false }).limit(30).then(({ data }) => setRows(data || [])); }, []);
  if (!rows.length) return <p className="muted">No activity yet.</p>;
  return rows.map((r) => (
    <div className="card muted" key={r.id}>{new Date(r.created_at).toLocaleString()} · {r.action} on {r.table_name}</div>
  ));
}

/* Basic analytics */
export function Stats() {
  const [s, setS] = useState({ total: 0, open: 0, done: 0, avg: '-' });
  useEffect(() => {
    (async () => {
      const { data: r } = await supabase.from('requests').select('status').not('company_id', 'is', null);
      const { data: g } = await supabase.from('ratings').select('stars');
      const rs = r || [], gs = g || [];
      setS({
        total: rs.length,
        done: rs.filter((x) => ['completed', 'invoiced', 'paid', 'closed'].includes(x.status)).length,
        open: rs.filter((x) => !['completed', 'invoiced', 'paid', 'closed', 'cancelled', 'rejected'].includes(x.status)).length,
        avg: gs.length ? (gs.reduce((a, b) => a + b.stars, 0) / gs.length).toFixed(1) : '-',
      });
    })();
  }, []);
  return (
    <div className="grid">
      <div className="card"><span className="muted">Total requests</span><div className="stat">{s.total}</div></div>
      <div className="card"><span className="muted">Open jobs</span><div className="stat">{s.open}</div></div>
      <div className="card"><span className="muted">Completed</span><div className="stat">{s.done}</div></div>
      <div className="card"><span className="muted">Average rating (out of 10)</span><div className="stat">{s.avg}</div></div>
    </div>
  );
}

/* Signature pad */
export function SignaturePad({ onChange }) {
  const ref = useRef(null);
  const drawing = useRef(false);
  const pos = (e) => {
    const r = ref.current.getBoundingClientRect();
    return [e.clientX - r.left, e.clientY - r.top];
  };
  function down(e) {
    drawing.current = true;
    const c = ref.current.getContext('2d');
    c.beginPath();
    c.moveTo(...pos(e));
  }
  function move(e) {
    if (!drawing.current) return;
    const c = ref.current.getContext('2d');
    c.lineWidth = 2;
    c.lineCap = 'round';
    c.lineTo(...pos(e));
    c.stroke();
  }
  function up() {
    if (!drawing.current) return;
    drawing.current = false;
    onChange(ref.current.toDataURL('image/png'));
  }
  function clear() {
    ref.current.getContext('2d').clearRect(0, 0, 300, 120);
    onChange(null);
  }
  return (
    <div>
      <canvas ref={ref} width={300} height={120} onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerLeave={up}
        style={{ border: '1px solid var(--line)', borderRadius: 6, background: '#fff', touchAction: 'none' }} />
      <br />
      <button type="button" className="ghost" onClick={clear}>Clear signature</button>
    </div>
  );
}

/* Technician earnings */
export function Earnings({ me }) {
  const [e, setE] = useState({ jobs: 0, paid: 0 });
  useEffect(() => {
    supabase.from('invoices').select('amount,status').eq('technician_id', me.id).then(({ data }) => {
      const rows = data || [];
      setE({ jobs: rows.length, paid: rows.filter((i) => i.status === 'paid').reduce((s, i) => s + Number(i.amount), 0) });
    });
  }, [me.id]);
  const pct = me.commission_pct ?? 30;
  return (
    <div className="grid">
      <div className="card"><span className="muted">Jobs completed</span><div className="stat">{e.jobs}</div></div>
      <div className="card"><span className="muted">Earnings ({pct}% of paid invoices)</span><div className="stat">{money((e.paid * pct) / 100)}</div></div>
    </div>
  );
}
