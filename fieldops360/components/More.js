'use client';
import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { ServicesEditor } from './Ops';

const money = (n) => '₦' + Number(n || 0).toLocaleString();
const ROLES = ['customer', 'technician', 'manager', 'accountant', 'super_admin'];

/* Notification bell */
export function Bell({ me }) {
  const [rows, setRows] = useState([]);
  const [open, setOpen] = useState(false);
  const load = useCallback(async () => {
    const { data } = await supabase.from('notifications').select('*').eq('user_id', me.id).order('created_at', { ascending: false }).limit(20);
    setRows(data || []);
  }, [me.id]);
  useEffect(() => { load(); const t = setInterval(load, 30000); return () => clearInterval(t); }, [load]);
  const unread = rows.filter((n) => !n.read).length;

  async function toggle() {
    setOpen(!open);
    if (!open && unread) {
      await supabase.from('notifications').update({ read: true }).eq('user_id', me.id).eq('read', false);
      load();
    }
  }
  return (
    <>
      <button className="ghost" onClick={toggle}>Notifications{unread ? ` (${unread})` : ''}</button>
      {open && (
        <div className="card" style={{ position: 'fixed', top: 56, right: 8, left: 8, maxWidth: 360, marginLeft: 'auto', zIndex: 10, maxHeight: '70vh', overflow: 'auto' }}>
          {rows.length === 0 && <p className="muted">Nothing yet.</p>}
          {rows.map((n) => <p key={n.id} style={{ margin: '8px 0' }}>{n.message}<br /><span className="muted">{new Date(n.created_at).toLocaleString()}</span></p>)}
        </div>
      )}
    </>
  );
}

/* Additional work: technician requests, customer or manager decides */
export function Extras({ requestId, mode, meId }) {
  const [rows, setRows] = useState([]);
  const [lines, setLines] = useState([{ label: '', amount: '' }]);
  const load = useCallback(async () => {
    const { data } = await supabase.from('extra_charges').select('*').eq('request_id', requestId).order('created_at');
    setRows(data || []);
  }, [requestId]);
  useEffect(() => { load(); }, [load]);

  const total = lines.reduce((s, l) => s + Number(l.amount || 0), 0);
  const setLine = (i, k, v) => setLines(lines.map((l, j) => (j === i ? { ...l, [k]: v } : l)));

  async function add() {
    const clean = lines.filter((l) => l.label && Number(l.amount) > 0).map((l) => ({ label: l.label, amount: Number(l.amount) }));
    if (!clean.length) return;
    await supabase.from('extra_charges').insert({
      request_id: requestId, technician_id: meId, description: clean.map((l) => l.label).join(', '),
      amount: clean.reduce((s, l) => s + l.amount, 0), lines: clean,
    });
    setLines([{ label: '', amount: '' }]);
    load();
  }
  async function decide(id, status) {
    const { error } = await supabase.rpc('decide_extra', { p_id: id, p_status: status });
    if (error) alert(error.message);
    load();
  }

  if (!rows.length && mode !== 'tech') return null;
  return (
    <div style={{ margin: '8px 0' }}>
      {rows.length > 0 && <h3>Additional work requests</h3>}
      {rows.map((x) => (
        <div key={x.id} style={{ margin: '8px 0' }}>
          <div className="row" style={{ justifyContent: 'space-between' }}>
            <span><b>Total {money(x.amount)}</b> <span className="badge">{x.status}</span></span>
            {mode === 'customer' && x.status === 'pending' && (
              <span className="row">
                <button style={{ marginTop: 0 }} onClick={() => decide(x.id, 'approved')}>Approve</button>
                <button className="danger" style={{ marginTop: 0 }} onClick={() => decide(x.id, 'rejected')}>Reject</button>
              </span>
            )}
          </div>
          {(x.lines?.length ? x.lines : [{ label: x.description, amount: x.amount }]).map((l, i) => (
            <p key={i} className="muted" style={{ margin: '2px 0' }}>{l.label}: {money(l.amount)}</p>
          ))}
        </div>
      ))}
      {mode === 'tech' && (
        <>
          <label>Request approval for additional work</label>
          {lines.map((l, i) => (
            <div className="row" key={i} style={{ marginBottom: 6 }}>
              <input placeholder="Item (e.g. Battery)" value={l.label} onChange={(e) => setLine(i, 'label', e.target.value)} style={{ flex: 2 }} />
              <input type="number" min="0" placeholder="Amount" value={l.amount} onChange={(e) => setLine(i, 'amount', e.target.value)} style={{ flex: 1 }} />
            </div>
          ))}
          <div className="row">
            <button type="button" className="ghost" onClick={() => setLines([...lines, { label: '', amount: '' }])}>Add line</button>
            <b>Total {money(total)}</b>
          </div>
          <button type="button" style={{ marginTop: 6 }} onClick={add}>Send to customer</button>
        </>
      )}
    </div>
  );
}

/* Technician shares live location while this page is open */
export function ShareLocation({ me }) {
  const [on, setOn] = useState(false);
  const [status, setStatus] = useState('');
  useEffect(() => {
    if (!on) return;
    if (!navigator.geolocation) { setStatus('This device does not support location.'); return; }
    let last = 0;
    async function send(p) {
      if (Date.now() - last < 20000) return;
      last = Date.now();
      const { error } = await supabase.from('technician_locations').upsert({ technician_id: me.id, lat: p.coords.latitude, lng: p.coords.longitude, updated_at: new Date().toISOString() });
      setStatus(error ? `Could not share location: ${error.message}` : `Location shared at ${new Date().toLocaleTimeString()}`);
    }
    setStatus('Getting your location...');
    const fail = (err) => setStatus(
      err.code === 1 ? 'Location permission denied. Allow location for this site in your browser settings.'
        : err.code === 2 ? 'Your device could not find its position. Turn on Location Services and Wi-Fi or GPS.'
          : 'Still looking for your position. Make sure Location Services are on for this browser. Retrying...'
    );
    const id = navigator.geolocation.watchPosition(send, fail, { enableHighAccuracy: false, maximumAge: 60000, timeout: 60000 });
    return () => navigator.geolocation.clearWatch(id);
  }, [on, me.id]);
  return (
    <div style={{ margin: '8px 0' }}>
      <label className="row" style={{ color: 'inherit' }}>
        <input type="checkbox" style={{ width: 'auto' }} checked={on} onChange={(e) => { setOn(e.target.checked); if (!e.target.checked) setStatus(''); }} />
        Share my live location with dispatch
      </label>
      {status && <p className="muted">{status}</p>}
    </div>
  );
}

/* Manager view of technician locations */
export function TechMap() {
  const [rows, setRows] = useState([]);
  const [err, setErr] = useState('');
  useEffect(() => {
    const load = () => supabase.from('technician_locations').select('*, tech:profiles!technician_locations_technician_id_fkey(full_name)').then(({ data, error }) => {
      setRows(data || []);
      setErr(error ? error.message : '');
    });
    load();
    const t = setInterval(load, 30000);
    return () => clearInterval(t);
  }, []);
  if (err) return <p className="err">{err}</p>;
  if (!rows.length) return <p className="muted">No technician is sharing a location right now.</p>;
  return rows.map((r) => (
    <div className="card row" key={r.technician_id} style={{ justifyContent: 'space-between' }}>
      <span>{r.tech?.full_name} <span className="muted">· updated {new Date(r.updated_at).toLocaleTimeString()}</span></span>
      <a href={`https://www.google.com/maps?q=${r.lat},${r.lng}`} target="_blank" rel="noreferrer">Open in Maps</a>
    </div>
  ));
}

/* Super admin: companies, subscriptions and users */
export function Platform() {
  const [companies, setCompanies] = useState([]);
  const [users, setUsers] = useState([]);
  const [f, setF] = useState({ name: '', plan: 'basic', subscription_until: '' });
  const load = useCallback(async () => {
    const { data: c } = await supabase.from('companies').select('*').order('created_at');
    const { data: u } = await supabase.from('profiles').select('id,full_name,email,role,company_id,requested_role').order('full_name');
    setCompanies(c || []);
    setUsers(u || []);
  }, []);
  useEffect(() => { load(); }, [load]);

  async function create(e) {
    e.preventDefault();
    await supabase.from('companies').insert({ name: f.name, plan: f.plan, subscription_until: f.subscription_until || null });
    setF({ name: '', plan: 'basic', subscription_until: '' });
    load();
  }
  const upCompany = async (id, patch) => {
    const { data, error } = await supabase.from('companies').update(patch).eq('id', id).select();
    if (error || !data?.length) alert(error?.message || 'Change not saved. Log out and log in again, then retry.');
    load();
  };
  const upUser = async (id, patch) => {
    const { data, error } = await supabase.from('profiles').update(patch).eq('id', id).select();
    if (error || !data?.length) alert(error?.message || 'Change not saved. Your login may have changed in another tab. Log out and log in again, then retry.');
    load();
  };
  const companyName = (id) => companies.find((c) => c.id === id)?.name || 'no company';

  const userCard = (u) => (
    <div className="card row" key={u.id}>
      <span style={{ flex: '1 1 180px' }}>{u.full_name}<br /><span className="muted">{u.email}</span></span>
      <select style={{ width: 'auto' }} value={u.role} onChange={(e) => upUser(u.id, { role: e.target.value })}>
        {ROLES.map((r) => <option key={r} value={r}>{r.replace('_', ' ')}</option>)}
      </select>
      <select style={{ width: 'auto' }} value={u.company_id || ''} onChange={(e) => upUser(u.id, { company_id: e.target.value || null })}>
        <option value="">No company</option>
        {companies.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
      </select>
    </div>
  );

  return (
    <>
      <h2>Platform: companies</h2>
      <div className="grid">
        <div className="card"><span className="muted">Companies</span><div className="stat">{companies.length}</div></div>
        <div className="card"><span className="muted">Active</span><div className="stat">{companies.filter((c) => c.status === 'active').length}</div></div>
        <div className="card"><span className="muted">Users</span><div className="stat">{users.length}</div></div>
      </div>
      <form className="card" onSubmit={create}>
        <div className="row">
          <input required placeholder="Company name" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} style={{ flex: 2 }} />
          <select value={f.plan} onChange={(e) => setF({ ...f, plan: e.target.value })} style={{ flex: 1 }}>
            {['free', 'basic', 'pro'].map((p) => <option key={p}>{p}</option>)}
          </select>
          <input type="date" value={f.subscription_until} onChange={(e) => setF({ ...f, subscription_until: e.target.value })} style={{ flex: 1 }} />
        </div>
        <button>Create company</button>
      </form>
      {companies.map((c) => (
        <div className="card" key={c.id}>
          <div className="row" style={{ justifyContent: 'space-between' }}><h3>{c.name}</h3><span className="badge">{c.status}</span></div>
          <ServicesEditor company={c} admin onSaved={load} />
          <div className="row">
            <select value={c.plan} onChange={(e) => upCompany(c.id, { plan: e.target.value })} style={{ width: 'auto' }}>
              {['free', 'basic', 'pro'].map((p) => <option key={p}>{p}</option>)}
            </select>
            <input type="date" style={{ width: 'auto' }} value={c.subscription_until || ''} onChange={(e) => upCompany(c.id, { subscription_until: e.target.value || null })} />
            <button className={c.status === 'active' ? 'danger' : ''} style={{ marginTop: 0 }} onClick={() => upCompany(c.id, { status: c.status === 'active' ? 'suspended' : 'active' })}>
              {c.status === 'active' ? 'Suspend' : 'Activate'}
            </button>
          </div>
        </div>
      ))}
      {users.some((u) => u.requested_role && u.role === 'customer') && (
        <>
          <h2>Pending role requests</h2>
          {users.filter((u) => u.requested_role && u.role === 'customer').map((u) => (
            <div className="card row" key={u.id} style={{ justifyContent: 'space-between' }}>
              <span>{u.full_name} <span className="muted">({u.email})</span> from <b>{companyName(u.company_id)}</b> wants to be a <b>{u.requested_role}</b></span>
              <span className="row">
                <button style={{ marginTop: 0 }} onClick={() => upUser(u.id, { role: u.requested_role, requested_role: null })}>Approve</button>
                <button className="ghost" onClick={() => upUser(u.id, { requested_role: null })}>Decline</button>
              </span>
            </div>
          ))}
        </>
      )}
      <h2>Platform: users by company</h2>
      {[...companies.map((c) => ({ id: c.id, name: c.name })), { id: null, name: 'No company' }].map((g) => {
        const members = users.filter((u) => (u.company_id || null) === g.id);
        if (!members.length) return null;
        return (
          <div key={g.id || 'none'}>
            <h3>{g.name} ({members.length})</h3>
            {members.map(userCard)}
          </div>
        );
      })}
    </>
  );
}