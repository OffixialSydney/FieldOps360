'use client';
import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';

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

/* Extra charges: technician requests, customer approves */
export function Extras({ requestId, mode, meId }) {
  const [rows, setRows] = useState([]);
  const [f, setF] = useState({ description: '', amount: '' });
  const load = useCallback(async () => {
    const { data } = await supabase.from('extra_charges').select('*').eq('request_id', requestId).order('created_at');
    setRows(data || []);
  }, [requestId]);
  useEffect(() => { load(); }, [load]);

  async function add() {
    if (!f.description || !f.amount) return;
    await supabase.from('extra_charges').insert({ request_id: requestId, technician_id: meId, description: f.description, amount: Number(f.amount) });
    setF({ description: '', amount: '' });
    load();
  }
  async function decide(id, status) {
    await supabase.rpc('decide_extra', { p_id: id, p_status: status });
    load();
  }

  if (!rows.length && mode !== 'tech') return null;
  return (
    <div style={{ margin: '8px 0' }}>
      {rows.length > 0 && <h3>Extra charges</h3>}
      {rows.map((x) => (
        <div className="row" key={x.id} style={{ justifyContent: 'space-between' }}>
          <span>{x.description} · {money(x.amount)} <span className="badge">{x.status}</span></span>
          {mode === 'customer' && x.status === 'pending' && (
            <span className="row">
              <button style={{ marginTop: 0 }} onClick={() => decide(x.id, 'approved')}>Approve</button>
              <button className="danger" style={{ marginTop: 0 }} onClick={() => decide(x.id, 'rejected')}>Reject</button>
            </span>
          )}
        </div>
      ))}
      {mode === 'tech' && (
        <>
          <label>Request approval for extra work</label>
          <input placeholder="Description" value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} />
          <input type="number" min="0" placeholder="Amount" style={{ marginTop: 6 }} value={f.amount} onChange={(e) => setF({ ...f, amount: e.target.value })} />
          <button type="button" className="ghost" style={{ marginTop: 6 }} onClick={add}>Send to customer</button>
        </>
      )}
    </div>
  );
}

/* Technician shares live location while this page is open */
export function ShareLocation({ me }) {
  const [on, setOn] = useState(false);
  useEffect(() => {
    if (!on || !navigator.geolocation) return;
    let last = 0;
    const id = navigator.geolocation.watchPosition((p) => {
      if (Date.now() - last < 30000) return;
      last = Date.now();
      supabase.from('technician_locations').upsert({ technician_id: me.id, lat: p.coords.latitude, lng: p.coords.longitude, updated_at: new Date().toISOString() });
    });
    return () => navigator.geolocation.clearWatch(id);
  }, [on, me.id]);
  return (
    <label className="row" style={{ color: 'inherit' }}>
      <input type="checkbox" style={{ width: 'auto' }} checked={on} onChange={(e) => setOn(e.target.checked)} />
      Share my live location with dispatch
    </label>
  );
}

/* Manager view of technician locations */
export function TechMap() {
  const [rows, setRows] = useState([]);
  useEffect(() => {
    const load = () => supabase.from('technician_locations').select('*, tech:profiles!technician_locations_technician_id_fkey(full_name)').then(({ data }) => setRows(data || []));
    load();
    const t = setInterval(load, 30000);
    return () => clearInterval(t);
  }, []);
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
    const { data: u } = await supabase.from('profiles').select('id,full_name,role,company_id').order('full_name');
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
  const upCompany = async (id, patch) => { await supabase.from('companies').update(patch).eq('id', id); load(); };
  const upUser = async (id, patch) => { await supabase.from('profiles').update(patch).eq('id', id); load(); };

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
      <h2>Platform: users</h2>
      {users.map((u) => (
        <div className="card row" key={u.id}>
          <span style={{ flex: '1 1 140px' }}>{u.full_name}</span>
          <select style={{ width: 'auto' }} value={u.role} onChange={(e) => upUser(u.id, { role: e.target.value })}>
            {ROLES.map((r) => <option key={r} value={r}>{r.replace('_', ' ')}</option>)}
          </select>
          <select style={{ width: 'auto' }} value={u.company_id || ''} onChange={(e) => upUser(u.id, { company_id: e.target.value || null })}>
            <option value="">No company</option>
            {companies.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
      ))}
    </>
  );
}
