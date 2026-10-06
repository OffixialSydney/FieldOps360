'use client';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const CATS = ['Solar', 'Electrical', 'Plumbing', 'AC', 'Generator', 'CCTV', 'Internet', 'Other'];
const STATUSES = ['new', 'reviewing', 'assigned', 'rejected', 'accepted', 'en_route', 'arrived', 'diagnosing', 'in_progress', 'waiting_parts', 'waiting_customer', 'completed', 'invoiced', 'paid', 'closed', 'cancelled'];
const day = (d) => (d || '').slice(0, 10);

export const emptyJobFilter = { status: '', tech: '', priority: '', service: '', from: '', to: '' };

export const jobPasses = (jf) => (r) =>
  (!jf.status || r.status === jf.status) && (!jf.tech || r.technician_id === jf.tech) && (!jf.priority || r.priority === jf.priority)
  && (!jf.service || r.service_type === jf.service) && (!jf.from || day(r.created_at) >= jf.from) && (!jf.to || day(r.created_at) <= jf.to);

/* Job filters: status, technician, priority, service, date */
export function JobFilters({ jf, setJf, techs }) {
  const [open, setOpen] = useState(false);
  const active = Object.values(jf).filter(Boolean).length;
  const set = (k) => (e) => setJf({ ...jf, [k]: e.target.value });
  return (
    <div style={{ marginBottom: 8 }}>
      <button type="button" className="ghost" onClick={() => setOpen(!open)}>Filters{active ? ` (${active})` : ''}</button>
      {open && (
        <div className="card" style={{ marginTop: 6 }}>
          <label>Status</label>
          <select value={jf.status} onChange={set('status')}><option value="">All</option>{STATUSES.map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}</select>
          <label>Technician</label>
          <select value={jf.tech} onChange={set('tech')}><option value="">All</option>{techs.map((t) => <option key={t.id} value={t.id}>{t.full_name}</option>)}</select>
          <label>Priority</label>
          <select value={jf.priority} onChange={set('priority')}><option value="">All</option>{['low', 'normal', 'high', 'urgent'].map((p) => <option key={p} value={p}>{p.toUpperCase()}</option>)}</select>
          <label>Service</label>
          <select value={jf.service} onChange={set('service')}><option value="">All</option>{CATS.map((c) => <option key={c}>{c}</option>)}</select>
          <div className="row">
            <div style={{ flex: 1 }}><label>From</label><input type="date" value={jf.from} onChange={set('from')} /></div>
            <div style={{ flex: 1 }}><label>To</label><input type="date" value={jf.to} onChange={set('to')} /></div>
          </div>
          <button type="button" className="ghost" onClick={() => setJf(emptyJobFilter)}>Clear filters</button>
        </div>
      )}
    </div>
  );
}

/* Invoice filters: paid, unpaid, pending, date. Returns the filtered list and the filter bar */
export function useInvoiceFilter(invs) {
  const [f, setF] = useState({ status: '', from: '', to: '' });
  const list = invs.filter((i) =>
    (!f.status || (f.status === 'unpaid' ? ['unpaid', 'partially_paid', 'failed'].includes(i.status) : i.status === f.status))
    && (!f.from || day(i.created_at) >= f.from) && (!f.to || day(i.created_at) <= f.to));
  const ui = (
    <div className="card">
      <div className="row">
        <div style={{ flex: 1 }}>
          <label>Show</label>
          <select value={f.status} onChange={(e) => setF({ ...f, status: e.target.value })}>
            <option value="">All invoices</option><option value="paid">Paid</option><option value="unpaid">Unpaid</option><option value="pending">Pending</option><option value="refunded">Refunded</option>
          </select>
        </div>
        <div style={{ flex: 1 }}><label>From</label><input type="date" value={f.from} onChange={(e) => setF({ ...f, from: e.target.value })} /></div>
        <div style={{ flex: 1 }}><label>To</label><input type="date" value={f.to} onChange={(e) => setF({ ...f, to: e.target.value })} /></div>
      </div>
    </div>
  );
  return [list, ui];
}

/* Customers with filters: location, status, date joined */
export function CustomersList() {
  const [rows, setRows] = useState(null);
  const [f, setF] = useState({ loc: '', status: '', from: '', to: '' });
  useEffect(() => {
    (async () => {
      const [p, r] = await Promise.all([
        supabase.from('profiles').select('id,full_name,phone,email,created_at').eq('role', 'customer'),
        supabase.from('requests').select('customer_id,address,status,company_id,created_at'),
      ]);
      const over = ['completed', 'invoiced', 'paid', 'closed', 'cancelled'];
      const mine = (r.data || []).filter((x) => x.company_id);
      const ids = new Set(mine.map((x) => x.customer_id));
      setRows((p.data || []).filter((c) => ids.has(c.id)).map((c) => {
        const jobs = mine.filter((x) => x.customer_id === c.id);
        return { ...c, jobs: jobs.length, active: jobs.filter((x) => !over.includes(x.status)).length, address: jobs[0]?.address || '' };
      }));
    })();
  }, []);
  if (!rows) return <p className="muted">Loading customers...</p>;
  const shown = rows.filter((c) =>
    (!f.loc || c.address.toLowerCase().includes(f.loc.toLowerCase()))
    && (!f.status || (f.status === 'active' ? c.active > 0 : c.active === 0))
    && (!f.from || day(c.created_at) >= f.from) && (!f.to || day(c.created_at) <= f.to));
  return (
    <>
      <h2>Customers ({shown.length})</h2>
      <div className="card">
        <label>Location contains</label>
        <input value={f.loc} onChange={(e) => setF({ ...f, loc: e.target.value })} placeholder="e.g. Kaduna" />
        <label>Status</label>
        <select value={f.status} onChange={(e) => setF({ ...f, status: e.target.value })}>
          <option value="">All customers</option><option value="active">With active jobs</option><option value="inactive">No active jobs</option>
        </select>
        <div className="row">
          <div style={{ flex: 1 }}><label>Joined from</label><input type="date" value={f.from} onChange={(e) => setF({ ...f, from: e.target.value })} /></div>
          <div style={{ flex: 1 }}><label>Joined to</label><input type="date" value={f.to} onChange={(e) => setF({ ...f, to: e.target.value })} /></div>
        </div>
      </div>
      {shown.length === 0 && <p className="muted">No customers match.</p>}
      {shown.map((c) => (
        <div className="card" key={c.id}>
          <div className="row" style={{ justifyContent: 'space-between' }}><h3>{c.full_name}</h3><span className="badge">{c.active ? `${c.active} active` : 'no active jobs'}</span></div>
          <p className="muted">{c.phone} · {c.email}<br />{c.address} · {c.jobs} job(s) · joined {new Date(c.created_at).toLocaleDateString()}</p>
        </div>
      ))}
    </>
  );
}
