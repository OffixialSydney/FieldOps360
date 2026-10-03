'use client';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export const STATUS = {
  new: 'Requested', reviewing: 'Reviewing', assigned: 'Assigned', rejected: 'Rejected', accepted: 'Accepted',
  en_route: 'On the way', arrived: 'Arrived', diagnosing: 'Diagnosing', in_progress: 'In progress',
  waiting_parts: 'Waiting for parts', waiting_customer: 'Waiting for customer', completed: 'Completed',
  invoiced: 'Invoiced', paid: 'Paid', closed: 'Closed', cancelled: 'Cancelled',
};
export const CATEGORIES = ['Solar', 'Electrical', 'Plumbing', 'AC', 'Generator', 'CCTV', 'Internet', 'Other'];
export const PRIORITIES = ['low', 'normal', 'high', 'urgent'];
export const RANK = { urgent: 0, high: 1, normal: 2, low: 3 };
const COLORS = { low: '#667085', normal: '#0f766e', high: '#b54708', urgent: '#b42318' };
const money = (n) => '₦' + Number(n || 0).toLocaleString();

export const Prio = ({ p }) => (
  <span className="badge" style={{ background: 'transparent', border: `1px solid ${COLORS[p || 'normal']}`, color: COLORS[p || 'normal'] }}>
    {(p || 'normal').toUpperCase()}
  </span>
);

export const getPos = () => new Promise((res) => {
  if (!navigator.geolocation) return res(null);
  navigator.geolocation.getCurrentPosition((p) => res({ lat: p.coords.latitude, lng: p.coords.longitude }), () => res(null), { timeout: 6000 });
});

/* Status history of one job */
export function Timeline({ requestId }) {
  const [rows, setRows] = useState(null);
  async function toggle() {
    if (rows) return setRows(null);
    const { data } = await supabase.from('job_status_history').select('*').eq('request_id', requestId).order('created_at');
    setRows(data || []);
  }
  return (
    <div style={{ margin: '6px 0' }}>
      <button type="button" className="ghost" onClick={toggle}>{rows ? 'Hide history' : 'Status history'}</button>
      {rows && rows.map((h) => (
        <p key={h.id} className="muted" style={{ margin: '4px 0' }}>
          {new Date(h.created_at).toLocaleString()} · <b>{STATUS[h.status] || h.status}</b>{h.note ? ` (${h.note})` : ''}
          {h.lat != null && <> · <a href={`https://www.google.com/maps?q=${h.lat},${h.lng}`} target="_blank" rel="noreferrer">location</a></>}
        </p>
      ))}
    </div>
  );
}

/* Customer creates a service request */
export function RequestForm({ me, onCreated }) {
  const empty = { service_type: CATEGORIES[0], description: '', priority: 'normal', address: '', preferred_date: '', preferred_time: '', notes: '', latitude: null, longitude: null };
  const [f, setF] = useState(empty);
  const [files, setFiles] = useState([]);
  const [addrs, setAddrs] = useState([]);
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const loadAddrs = () => supabase.from('addresses').select('*').then(({ data }) => setAddrs(data || []));
  useEffect(() => { loadAddrs(); }, []);

  async function locate() {
    const p = await getPos();
    setMsg(p ? 'Location captured' : 'Could not get your location');
    if (p) setF((x) => ({ ...x, latitude: p.lat, longitude: p.lng }));
  }
  async function saveAddr() {
    if (!f.address) return;
    await supabase.from('addresses').insert({ customer_id: me.id, label: f.address.slice(0, 30), address: f.address });
    loadAddrs();
  }
  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setMsg('');
    const { data, error } = await supabase.from('requests')
      .insert({ ...f, preferred_date: f.preferred_date || null, customer_id: me.id }).select().single();
    if (error) { setBusy(false); return setMsg(error.message); }
    for (const file of files) {
      const path = `${data.id}/${Date.now()}-${file.name.replace(/[^\w.-]/g, '_')}`;
      const { error: up } = await supabase.storage.from('job-files').upload(path, file);
      if (!up) await supabase.from('attachments').insert({ request_id: data.id, path, name: file.name, uploaded_by: me.id });
    }
    setMsg(`Request ${data.request_no} submitted`);
    setF(empty);
    setFiles([]);
    setBusy(false);
    onCreated();
  }

  return (
    <form className="card" onSubmit={submit}>
      <label>Service category</label>
      <select value={f.service_type} onChange={set('service_type')}>{CATEGORIES.map((s) => <option key={s}>{s}</option>)}</select>
      <label>Priority</label>
      <select value={f.priority} onChange={set('priority')}>{PRIORITIES.map((p) => <option key={p} value={p}>{p.toUpperCase()}</option>)}</select>
      <label>Problem description</label>
      <textarea required value={f.description} onChange={set('description')} />
      <label>Address</label>
      {addrs.length > 0 && (
        <select value="" onChange={(e) => e.target.value && setF({ ...f, address: e.target.value })}>
          <option value="">Use a saved address</option>
          {addrs.map((a) => <option key={a.id} value={a.address}>{a.address}</option>)}
        </select>
      )}
      <input required value={f.address} onChange={set('address')} style={{ marginTop: 6 }} />
      <div className="row">
        <button type="button" className="ghost" onClick={locate}>{f.latitude != null ? 'Location saved' : 'Use my current location'}</button>
        <button type="button" className="ghost" onClick={saveAddr}>Save this address</button>
      </div>
      <label>Preferred date</label>
      <input type="date" value={f.preferred_date} onChange={set('preferred_date')} />
      <label>Preferred time</label>
      <input type="time" value={f.preferred_time} onChange={set('preferred_time')} />
      <label>Additional notes</label>
      <textarea value={f.notes} onChange={set('notes')} />
      <label>Photos and videos</label>
      <input type="file" multiple accept="image/*,video/*" onChange={(e) => setFiles([...e.target.files])} />
      {msg && <p className="muted">{msg}</p>}
      <button disabled={busy}>{busy ? 'Submitting...' : 'Submit request'}</button>
    </form>
  );
}

/* Customer overview */
export function Overview({ reqs, invs, assets }) {
  const today = new Date().toISOString().slice(0, 10);
  const soon = new Date(Date.now() + 30 * 864e5).toISOString().slice(0, 10);
  const over = ['completed', 'invoiced', 'paid', 'closed', 'cancelled', 'rejected'];
  const active = reqs.filter((r) => !over.includes(r.status));
  const upcoming = active.filter((r) => (r.scheduled_date || r.preferred_date) >= today);
  const owed = invs.filter((i) => i.status === 'unpaid').reduce((s, i) => s + Number(i.amount), 0);
  const alerts = assets.filter((a) => a.warranty_until && a.warranty_until >= today && a.warranty_until <= soon);
  const recent = reqs.filter((r) => ['completed', 'invoiced', 'paid', 'closed'].includes(r.status)).slice(0, 3);
  const live = active.filter((r) => r.technician_id);
  return (
    <>
      <h2>Overview</h2>
      <div className="grid">
        <div className="card"><span className="muted">Active requests</span><div className="stat">{active.length}</div></div>
        <div className="card"><span className="muted">Upcoming appointments</span><div className="stat">{upcoming.length}</div></div>
        <div className="card"><span className="muted">Outstanding invoices</span><div className="stat">{money(owed)}</div></div>
        <div className="card"><span className="muted">Warranty alerts</span><div className="stat">{alerts.length}</div></div>
      </div>
      {live.map((r) => (
        <div className="card" key={r.id}>
          <span className="muted">ACTIVE JOB · {r.request_no}</span>
          <h3>{r.service_type}</h3>
          <p>Status: <b>{STATUS[r.status]}</b><br />
            Technician: <b>{r.tech?.full_name || 'Assigned'}</b>
            {r.status === 'en_route' && r.eta_minutes ? <><br />ETA: <b>{r.eta_minutes} minutes</b></> : null}
          </p>
        </div>
      ))}
      {recent.length > 0 && (
        <>
          <h3>Recent jobs</h3>
          {recent.map((r) => <p key={r.id} className="muted" style={{ margin: '4px 0' }}>{r.request_no} · {r.service_type} · {STATUS[r.status]}</p>)}
        </>
      )}
    </>
  );
}

/* Smart assignment */
const haversine = (a, b, c, d) => {
  const R = 6371, rad = Math.PI / 180;
  const x = Math.sin(((c - a) * rad) / 2) ** 2 + Math.cos(a * rad) * Math.cos(c * rad) * Math.sin(((d - b) * rad) / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(x));
};
const ACTIVE = ['assigned', 'accepted', 'en_route', 'arrived', 'diagnosing', 'in_progress', 'waiting_parts', 'waiting_customer'];

export function recommend(req, techs, reqs, locs, ratings) {
  return techs.map((t) => {
    const jobs = reqs.filter((r) => r.technician_id === t.id && ACTIVE.includes(r.status)).length;
    const loc = locs.find((l) => l.technician_id === t.id);
    const km = loc && req.latitude != null ? haversine(loc.lat, loc.lng, req.latitude, req.longitude) : null;
    const skills = (t.skills || '').toLowerCase().split(',').map((s) => s.trim());
    const match = skills.includes((req.service_type || '').toLowerCase()) ? 100 : 0;
    const rs = ratings.filter((x) => x.technician_id === t.id);
    const avg = rs.length ? rs.reduce((a, b) => a + b.stars, 0) / rs.length : null;
    const avail = t.availability === 'busy' ? 4 : t.availability === 'offline' ? 0 : 10;
    const score = Math.round((km == null ? 20 : 40 * Math.max(0, 1 - km / 50)) + (match ? 25 : 0) + Math.max(0, 20 - 5 * jobs) + avail + ((avg ?? 3) / 5) * 5);
    return { t, jobs, km, match, avg, score };
  }).sort((a, b) => b.score - a.score);
}

export function Suggestions({ req, techs, reqs, locs, ratings, onAssign }) {
  const list = recommend(req, techs, reqs, locs, ratings).slice(0, 3);
  if (!list.length) return <p className="muted">No technicians yet.</p>;
  return (
    <div style={{ margin: '8px 0' }}>
      <h3>Recommended technicians</h3>
      {list.map(({ t, jobs, km, match, avg, score }) => (
        <div className="row" key={t.id} style={{ justifyContent: 'space-between', margin: '6px 0' }}>
          <span>
            <b>{t.full_name}</b> · score {score}<br />
            <span className="muted">
              {km != null ? `${km.toFixed(1)} km` : 'location unknown'} · skill match {match}% · {jobs} active job(s) · {t.availability || 'available'}{avg ? ` · ${avg.toFixed(1)}★` : ''}
            </span>
          </span>
          <button style={{ marginTop: 0 }} onClick={() => onAssign(t.id)}>Assign</button>
        </div>
      ))}
    </div>
  );
}
