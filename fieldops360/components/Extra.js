'use client';
import { useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';

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
    await supabase.from('ratings').insert({ request_id: request.id, customer_id: request.customer_id, technician_id: request.technician_id, stars: n });
    setStars(n);
  }
  if (stars) return <p className="muted">You rated this job {stars}/5</p>;
  return (
    <div className="row">
      <span className="muted">Rate this job:</span>
      {[1, 2, 3, 4, 5].map((n) => <button key={n} className="ghost" onClick={() => rate(n)}>{n}</button>)}
    </div>
  );
}

/* Support tickets: customers create, staff reply */
export function Tickets({ me, staff }) {
  const [rows, setRows] = useState([]);
  const [f, setF] = useState({ subject: '', message: '' });
  const [reply, setReply] = useState({});
  const load = useCallback(async () => {
    const { data } = await supabase.from('tickets').select('*').order('created_at', { ascending: false });
    setRows(data || []);
  }, []);
  useEffect(() => { load(); }, [load]);

  async function create(e) {
    e.preventDefault();
    await supabase.from('tickets').insert({ ...f, customer_id: me.id });
    setF({ subject: '', message: '' });
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
          <label>Subject</label>
          <input required value={f.subject} onChange={(e) => setF({ ...f, subject: e.target.value })} />
          <label>Message</label>
          <textarea required value={f.message} onChange={(e) => setF({ ...f, message: e.target.value })} />
          <button>Send ticket</button>
        </form>
      )}
      {rows.length === 0 && <p className="muted">No tickets.</p>}
      {rows.map((t) => (
        <div className="card" key={t.id}>
          <div className="row" style={{ justifyContent: 'space-between' }}><h3>{t.subject}</h3><span className="badge">{t.status}</span></div>
          <p>{t.message}</p>
          {t.reply && <p className="muted">Reply: {t.reply}</p>}
          {staff && t.status === 'open' && (
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
export function Inventory() {
  const [items, setItems] = useState([]);
  const [f, setF] = useState({ name: '', quantity: '', unit_price: '' });
  const load = useCallback(async () => {
    const { data } = await supabase.from('items').select('*').order('name');
    setItems(data || []);
  }, []);
  useEffect(() => { load(); }, [load]);

  async function add(e) {
    e.preventDefault();
    await supabase.from('items').insert({ name: f.name, quantity: Number(f.quantity || 0), unit_price: Number(f.unit_price || 0) });
    setF({ name: '', quantity: '', unit_price: '' });
    load();
  }
  async function adjust(i, d) {
    await supabase.from('items').update({ quantity: Math.max(0, i.quantity + d) }).eq('id', i.id);
    load();
  }

  return (
    <>
      <form className="card" onSubmit={add}>
        <div className="row">
          <input required placeholder="Item name" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} style={{ flex: 2 }} />
          <input type="number" min="0" placeholder="Qty" value={f.quantity} onChange={(e) => setF({ ...f, quantity: e.target.value })} style={{ flex: 1 }} />
          <input type="number" min="0" placeholder="Unit price" value={f.unit_price} onChange={(e) => setF({ ...f, unit_price: e.target.value })} style={{ flex: 1 }} />
        </div>
        <button>Add item</button>
      </form>
      {items.map((i) => (
        <div className="card row" key={i.id} style={{ justifyContent: 'space-between' }}>
          <span>{i.name} · {money(i.unit_price)} {i.quantity <= 3 && <span className="badge">low stock</span>}</span>
          <span className="row">
            <button className="ghost" onClick={() => adjust(i, -1)}>-</button>
            <b>{i.quantity}</b>
            <button className="ghost" onClick={() => adjust(i, 1)}>+</button>
          </span>
        </div>
      ))}
    </>
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
  return rows.map((a) => {
    const active = a.warranty_until && new Date(a.warranty_until) >= new Date();
    return (
      <div className="card row" key={a.id} style={{ justifyContent: 'space-between' }}>
        <span>{a.name}</span>
        <span className="muted">{a.warranty_until ? `${active ? 'Warranty until' : 'Warranty ended'} ${a.warranty_until}` : 'No warranty'}</span>
      </div>
    );
  });
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
      const { data: r } = await supabase.from('requests').select('status');
      const { data: g } = await supabase.from('ratings').select('stars');
      const rs = r || [], gs = g || [];
      setS({
        total: rs.length,
        done: rs.filter((x) => x.status === 'completed').length,
        open: rs.filter((x) => !['completed', 'cancelled', 'rejected'].includes(x.status)).length,
        avg: gs.length ? (gs.reduce((a, b) => a + b.stars, 0) / gs.length).toFixed(1) : '-',
      });
    })();
  }, []);
  return (
    <div className="grid">
      <div className="card"><span className="muted">Total requests</span><div className="stat">{s.total}</div></div>
      <div className="card"><span className="muted">Open jobs</span><div className="stat">{s.open}</div></div>
      <div className="card"><span className="muted">Completed</span><div className="stat">{s.done}</div></div>
      <div className="card"><span className="muted">Average rating</span><div className="stat">{s.avg}</div></div>
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
