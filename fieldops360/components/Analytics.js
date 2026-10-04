'use client';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const money = (n) => '₦' + Math.round(Number(n || 0)).toLocaleString();
const DONE = ['completed', 'invoiced', 'paid', 'closed'];
const ACTIVE = ['assigned', 'accepted', 'en_route', 'arrived', 'diagnosing', 'in_progress', 'waiting_parts', 'waiting_customer'];
const PENDING = ['new', 'reviewing', 'rejected'];
const CATS = ['Solar', 'Electrical', 'Plumbing', 'AC', 'Generator', 'CCTV', 'Internet', 'Other'];
const day = (d) => new Date(d).toISOString().slice(0, 10);
const avg = (a) => (a.length ? a.reduce((s, v) => s + v, 0) / a.length : null);
const fmt = (ms) => (ms == null ? '-' : ms < 36e5 ? `${Math.round(ms / 6e4)} min` : `${(ms / 36e5).toFixed(1)} hours`);

function useData() {
  const [d, setD] = useState(null);
  useEffect(() => {
    (async () => {
      const [reqs, invs, pays, profs, items, hist, rates] = await Promise.all([
        supabase.from('requests').select('id,customer_id,technician_id,service_type,address,status,created_at,company_id'),
        supabase.from('invoices').select('id,request_id,customer_id,technician_id,amount,paid_amount,status,created_at'),
        supabase.from('payments').select('invoice_id,amount,created_at').eq('status', 'confirmed'),
        supabase.from('profiles').select('id,full_name,role,availability'),
        supabase.from('items').select('id,name,quantity,min_stock'),
        supabase.from('job_status_history').select('request_id,status,created_at').in('status', ['assigned', 'accepted', 'completed']),
        supabase.from('ratings').select('technician_id,stars,feedback,created_at'),
      ]);
      setD({
        reqs: (reqs.data || []).filter((r) => r.company_id), invs: invs.data || [], pays: pays.data || [],
        profs: profs.data || [], items: items.data || [], hist: hist.data || [], rates: rates.data || [],
      });
    })();
  }, []);
  return d;
}

const Stat = ({ label, value }) => <div className="card"><span className="muted">{label}</span><div className="stat">{value}</div></div>;
const Bars = ({ data, money: isMoney }) => {
  const max = Math.max(1, ...data.map((x) => x[1]));
  if (!data.length) return <p className="muted">No data for these filters.</p>;
  return data.map(([label, v]) => (
    <div key={label} style={{ margin: '6px 0' }}>
      <div className="row" style={{ justifyContent: 'space-between' }}><span>{label}</span><b>{isMoney ? money(v) : v}</b></div>
      <div style={{ background: 'var(--line)', borderRadius: 4 }}><div style={{ width: `${(v / max) * 100}%`, background: 'var(--accent)', height: 8, borderRadius: 4 }} /></div>
    </div>
  ));
};

/* Business and revenue analytics */
export function Analytics() {
  const d = useData();
  const [f, setF] = useState({ from: '', to: '', service: '', tech: '', loc: '', cust: '' });
  if (!d) return <p className="muted">Loading analytics...</p>;

  const now = new Date();
  const today = day(now);
  const week = day(new Date(now.getTime() - ((now.getDay() + 6) % 7) * 864e5));
  const month = today.slice(0, 8) + '01';
  const year = today.slice(0, 5) + '01-01';
  const rev = (from) => d.pays.filter((p) => day(p.created_at) >= from).reduce((s, p) => s + Number(p.amount), 0);

  const by = (key) => Object.fromEntries(d.reqs.map((r) => [r.id, r]));
  const reqById = by('id');
  const invById = Object.fromEntries(d.invs.map((i) => [i.id, i]));
  const name = (id) => d.profs.find((p) => p.id === id)?.full_name || 'Unknown';
  const techs = d.profs.filter((p) => p.role === 'technician');
  const custIds = [...new Set(d.invs.map((i) => i.customer_id))];

  const firstReq = {};
  const perCust = {};
  d.reqs.forEach((r) => {
    perCust[r.customer_id] = (perCust[r.customer_id] || 0) + 1;
    if (!firstReq[r.customer_id] || r.created_at < firstReq[r.customer_id]) firstReq[r.customer_id] = r.created_at;
  });
  const customers = Object.keys(perCust);

  const match = (inv, when) => {
    const r = reqById[inv?.request_id];
    const dt = day(when);
    return (!f.from || dt >= f.from) && (!f.to || dt <= f.to) && (!f.service || r?.service_type === f.service)
      && (!f.tech || inv?.technician_id === f.tech) && (!f.cust || inv?.customer_id === f.cust)
      && (!f.loc || (r?.address || '').toLowerCase().includes(f.loc.toLowerCase()));
  };
  const fp = d.pays.filter((p) => match(invById[p.invoice_id], p.created_at));
  const group = (keyFn) => {
    const m = {};
    fp.forEach((p) => { const k = keyFn(invById[p.invoice_id], p); m[k] = (m[k] || 0) + Number(p.amount); });
    return m;
  };
  const byService = Object.entries(group((i) => reqById[i?.request_id]?.service_type || 'Other')).sort((a, b) => b[1] - a[1]);
  const byTech = Object.entries(group((i) => name(i?.technician_id))).sort((a, b) => b[1] - a[1]);
  const overTime = Object.entries(group((i, p) => day(p.created_at))).sort((a, b) => (a[0] < b[0] ? -1 : 1)).slice(-14);
  const fi = d.invs.filter((i) => match(i, i.created_at) && !['refunded'].includes(i.status));
  const paid = fi.reduce((s, i) => s + Number(i.paid_amount), 0);
  const unpaid = fi.reduce((s, i) => s + Number(i.amount) - Number(i.paid_amount), 0);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  return (
    <>
      <h2>Revenue</h2>
      <div className="grid">
        <Stat label="Today" value={money(rev(today))} /><Stat label="This week" value={money(rev(week))} />
        <Stat label="This month" value={money(rev(month))} /><Stat label="This year" value={money(rev(year))} />
      </div>
      <h2>Jobs</h2>
      <div className="grid">
        <Stat label="Completed" value={d.reqs.filter((r) => DONE.includes(r.status)).length} />
        <Stat label="Pending" value={d.reqs.filter((r) => PENDING.includes(r.status)).length} />
        <Stat label="Cancelled" value={d.reqs.filter((r) => r.status === 'cancelled').length} />
        <Stat label="Active" value={d.reqs.filter((r) => ACTIVE.includes(r.status)).length} />
      </div>
      <h2>Customers</h2>
      <div className="grid">
        <Stat label="Total" value={customers.length} />
        <Stat label="New this month" value={customers.filter((c) => day(firstReq[c]) >= month).length} />
        <Stat label="Returning" value={customers.filter((c) => perCust[c] > 1).length} />
      </div>
      <h2>Technicians</h2>
      <div className="grid">
        <Stat label="Active (not offline)" value={techs.filter((t) => t.availability !== 'offline').length} />
        <Stat label="Available" value={techs.filter((t) => (t.availability || 'available') === 'available').length} />
        <Stat label="Busy" value={techs.filter((t) => t.availability === 'busy').length} />
        <Stat label="Offline" value={techs.filter((t) => t.availability === 'offline').length} />
      </div>
      <h2>Inventory</h2>
      <div className="grid">
        <Stat label="Total items" value={d.items.length} />
        <Stat label="Low stock" value={d.items.filter((i) => i.quantity > 0 && i.quantity < i.min_stock).length} />
        <Stat label="Out of stock" value={d.items.filter((i) => i.quantity === 0).length} />
      </div>

      <h2>Revenue analytics</h2>
      <div className="card">
        <div className="row">
          <div style={{ flex: 1 }}><label>From</label><input type="date" value={f.from} onChange={set('from')} /></div>
          <div style={{ flex: 1 }}><label>To</label><input type="date" value={f.to} onChange={set('to')} /></div>
        </div>
        <label>Service</label>
        <select value={f.service} onChange={set('service')}><option value="">All services</option>{CATS.map((c) => <option key={c}>{c}</option>)}</select>
        <label>Technician</label>
        <select value={f.tech} onChange={set('tech')}><option value="">All technicians</option>{techs.map((t) => <option key={t.id} value={t.id}>{t.full_name}</option>)}</select>
        <label>Customer</label>
        <select value={f.cust} onChange={set('cust')}><option value="">All customers</option>{custIds.map((c) => <option key={c} value={c}>{name(c)}</option>)}</select>
        <label>Location contains</label>
        <input value={f.loc} onChange={set('loc')} placeholder="e.g. Kaduna" />
      </div>
      <h3>Revenue by service</h3><Bars data={byService} money />
      <h3>Revenue by technician</h3><Bars data={byTech} money />
      <h3>Revenue over time (last 14 days with payments)</h3><Bars data={overTime} money />
      <h3>Paid vs unpaid invoices</h3><Bars data={[['Paid', paid], ['Unpaid', unpaid]]} money />
    </>
  );
}

/* Technician performance: information only */
export function Performance() {
  const d = useData();
  if (!d) return null;
  const techs = d.profs.filter((p) => p.role === 'technician');
  const first = (rid, st) => {
    const h = d.hist.filter((x) => x.request_id === rid && x.status === st).map((x) => new Date(x.created_at).getTime());
    return h.length ? Math.min(...h) : null;
  };
  return (
    <>
      <h2>Technician performance</h2>
      <p className="muted">For information only. It is not used to penalise or suspend anyone.</p>
      {techs.length === 0 && <p className="muted">No technicians yet.</p>}
      {techs.map((t) => {
        const mine = d.reqs.filter((r) => r.technician_id === t.id);
        const gaps = (a, b) => mine.map((r) => { const x = first(r.id, a), y = first(r.id, b); return x && y && y >= x ? y - x : null; }).filter((v) => v != null);
        const rs = d.rates.filter((x) => x.technician_id === t.id);
        const perCust = {};
        mine.forEach((r) => { perCust[r.customer_id] = (perCust[r.customer_id] || 0) + 1; });
        const repeats = Object.values(perCust).reduce((s, n) => s + Math.max(n - 1, 0), 0);
        const revenue = d.invs.filter((i) => i.technician_id === t.id).reduce((s, i) => s + Number(i.paid_amount), 0);
        const comments = rs.filter((x) => x.feedback).slice(-2);
        return (
          <div className="card" key={t.id}>
            <div className="row" style={{ justifyContent: 'space-between' }}><h3>{t.full_name}</h3><span className="badge">{t.availability || 'available'}</span></div>
            <p className="muted" style={{ margin: '4px 0' }}>
              Jobs completed {mine.filter((r) => DONE.includes(r.status)).length} · Cancelled {mine.filter((r) => r.status === 'cancelled').length} · Active now {mine.filter((r) => ACTIVE.includes(r.status)).length}<br />
              Average completion time {fmt(avg(gaps('assigned', 'completed')))} · Response time {fmt(avg(gaps('assigned', 'accepted')))}<br />
              Customer rating {rs.length ? `${avg(rs.map((x) => x.stars)).toFixed(1)}/10 (${rs.length})` : 'no ratings yet'} · Revenue generated {money(revenue)} · Repeat visits {repeats}
            </p>
            {comments.map((c, i) => <p key={i} className="muted" style={{ margin: '2px 0' }}>"{c.feedback}" ({c.stars}/10)</p>)}
          </div>
        );
      })}
    </>
  );
}
