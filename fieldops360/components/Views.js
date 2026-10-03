'use client';
import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Files, Rating, Tickets, Inventory, Assets, Audit, Stats, ItemPicker, SignaturePad, Earnings } from './Extra';
import { Extras, ShareLocation, TechMap } from './More';
import { STATUS, RANK, Prio, Timeline, RequestForm, Overview, Suggestions, getPos } from './Jobs';

const SERVICES = ['Solar installation', 'Solar maintenance', 'Electrical', 'Generator repair', 'Air-conditioner servicing', 'Plumbing', 'CCTV installation', 'Internet installation', 'Equipment maintenance', 'Other'];
const money = (n) => '₦' + Number(n || 0).toLocaleString();

function useRows(table, query) {
  const [rows, setRows] = useState([]);
  const load = useCallback(async () => {
    const { data } = await query(supabase.from(table));
    setRows(data || []);
  }, [table]); // eslint-disable-line
  useEffect(() => { load(); }, [load]);
  return [rows, load];
}

const Badge = ({ s }) => <span className="badge">{STATUS[s] || s.replace('_', ' ')}</span>;

/* ---------- CUSTOMER ---------- */
export function Customer({ me }) {
  const [reqs, reload] = useRows('requests', (t) => t.select('*, tech:profiles!requests_technician_id_fkey(full_name,phone)').order('created_at', { ascending: false }));
  const [invs] = useRows('invoices', (t) => t.select('*').order('created_at', { ascending: false }));
  const [assets] = useRows('assets', (t) => t.select('*'));

  return (
    <>
      <Overview reqs={reqs} invs={invs} assets={assets} />

      <h2>New service request</h2>
      <RequestForm me={me} onCreated={reload} />

      <h2>My requests</h2>
      {reqs.length === 0 && <p className="muted">No requests yet. Submit one above.</p>}
      {reqs.map((r) => (
        <div className="card" key={r.id}>
          <div className="row" style={{ justifyContent: 'space-between' }}>
            <h3>{r.service_type}</h3>
            <span className="row"><Prio p={r.priority} /><Badge s={r.status} /></span>
          </div>
          <p className="muted">{r.request_no}</p>
          <p>{r.description}</p>
          <p className="muted">{r.address}</p>
          {(r.scheduled_date || r.preferred_date) && <p className="muted">Appointment: {r.scheduled_date || r.preferred_date} {r.preferred_time || ''}</p>}
          {r.tech?.full_name && <p className="muted">Technician: {r.tech.full_name}{r.status === 'en_route' && r.eta_minutes ? ` · ETA ${r.eta_minutes} min` : ''}</p>}
          {r.signature && <img src={r.signature} alt="Customer signature" style={{ height: 60 }} />}
          <Timeline requestId={r.id} />
          <Files requestId={r.id} canUpload />
          <Extras requestId={r.id} mode="customer" />
          {['completed', 'invoiced', 'paid', 'closed'].includes(r.status) && <Rating request={r} />}
        </div>
      ))}

      <h2>Equipment and warranties</h2>
      <Assets />
      <h2>Support</h2>
      <Tickets me={me} />
      <h2>Invoices and payments</h2>
      {invs.length === 0 && <p className="muted">Invoices appear here once a job is completed.</p>}
      {invs.map((i) => (
        <div className="card row" key={i.id} style={{ justifyContent: 'space-between' }}>
          <span>{money(i.amount)}</span><Badge s={i.status} />
        </div>
      ))}
    </>
  );
}

/* ---------- MANAGER / SUPER ADMIN ---------- */
const GROUPS = {
  pending: ['new', 'reviewing', 'rejected'],
  active: ['assigned', 'accepted', 'en_route', 'arrived', 'diagnosing', 'in_progress', 'waiting_parts', 'waiting_customer'],
  history: ['completed', 'invoiced', 'paid', 'closed', 'cancelled'],
};

export function Manager() {
  const [view, setView] = useState('live');
  const [tab, setTab] = useState('pending');
  const [reqs, reload] = useRows('requests', (t) => t.select('*, customer:profiles!requests_customer_id_fkey(full_name,phone)').order('created_at', { ascending: false }));
  const [techs] = useRows('profiles', (t) => t.select('id,full_name,skills,availability').eq('role', 'technician'));
  const [locs] = useRows('technician_locations', (t) => t.select('*'));
  const [ratings] = useRows('ratings', (t) => t.select('technician_id,stars'));

  const live = view === 'live';
  const shown = reqs
    .filter((r) => GROUPS[view === 'history' ? 'history' : tab].includes(r.status))
    .sort((a, b) => (RANK[a.priority] ?? 2) - (RANK[b.priority] ?? 2));

  async function update(id, patch) {
    const { error } = await supabase.from('requests').update(patch).eq('id', id);
    if (error) alert(error.message);
    reload();
  }
  const assign = (id, techId) => update(id, { technician_id: techId || null, status: techId ? 'assigned' : 'new' });

  const list = shown.map((r) => {
    const dest = r.latitude != null ? `${r.latitude},${r.longitude}` : encodeURIComponent(r.address || '');
    const open = ['new', 'reviewing', 'rejected'].includes(r.status);
    return (
      <div className="card" key={r.id}>
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <h3>{r.service_type}</h3>
          <span className="row"><Prio p={r.priority} /><Badge s={r.status} /></span>
        </div>
        <p className="muted">{r.request_no}</p>
        <p>{r.description}</p>
        {r.notes && <p className="muted">Notes: {r.notes}</p>}
        <p className="muted">{r.customer?.full_name} · {r.customer?.phone} · {r.address}</p>
        {(r.scheduled_date || r.preferred_date) && <p className="muted">Preferred: {r.preferred_date || '-'} {r.preferred_time || ''}</p>}
        <div className="row">
          <a href={`https://www.google.com/maps/search/?api=1&query=${dest}`} target="_blank" rel="noreferrer">Open location</a>
        </div>
        {r.signature && <img src={r.signature} alt="Customer signature" style={{ height: 60 }} />}
        <Timeline requestId={r.id} />
        <Files requestId={r.id} />
        {live && (
          <div className="row">
            <span className="muted">Scheduled for (change to reschedule)</span>
            <input type="date" style={{ width: 'auto' }} value={r.scheduled_date || ''} onChange={(e) => update(r.id, { scheduled_date: e.target.value || null })} />
          </div>
        )}
        {open && (
          <Suggestions req={r} techs={techs} reqs={reqs} locs={locs} ratings={ratings} onAssign={(tid) => assign(r.id, tid)} />
        )}
        {(open || r.status === 'assigned') && (
          <div className="row">
            <select value={r.technician_id || ''} onChange={(e) => assign(r.id, e.target.value)}>
              <option value="">Choose a technician yourself</option>
              {techs.map((t) => <option key={t.id} value={t.id}>{t.full_name}</option>)}
            </select>
            {r.status === 'new' && <button className="ghost" onClick={() => update(r.id, { status: 'reviewing' })}>Start review</button>}
            <button className="danger" onClick={() => update(r.id, { status: 'cancelled' })}>Cancel</button>
          </div>
        )}
        {r.status === 'paid' && <button onClick={() => update(r.id, { status: 'closed' })}>Close job</button>}
      </div>
    );
  });

  return (
    <>
      <div className="row" style={{ margin: '12px 0' }}>
        {[['live', 'Dashboard'], ['dispatch', 'Dispatch'], ['history', 'History and inventory']].map(([k, label]) => (
          <button key={k} className={view === k ? '' : 'ghost'} style={{ marginTop: 0 }} onClick={() => setView(k)}>{label}</button>
        ))}
      </div>

      {view === 'live' && (
        <>
          <Stats />
          <h2>Service requests</h2>
          <div className="row" style={{ marginBottom: 12 }}>
            {['pending', 'active'].map((k) => (
              <button key={k} className={tab === k ? '' : 'ghost'} style={{ marginTop: 0 }} onClick={() => setTab(k)}>
                {k === 'pending' ? 'Pending' : 'Active'} ({reqs.filter((r) => GROUPS[k].includes(r.status)).length})
              </button>
            ))}
          </div>
          {shown.length === 0 && <p className="muted">Nothing here.</p>}
          {list}
          <h2>Support tickets</h2>
          <Tickets staff />
        </>
      )}

      {view === 'dispatch' && (
        <>
          <h2>Dispatch center</h2>
          {['available', 'busy', 'offline'].map((a) => {
            const group = techs.filter((t) => (t.availability || 'available') === a);
            return (
              <div key={a}>
                <h3 style={{ textTransform: 'capitalize' }}>{a} ({group.length})</h3>
                {group.length === 0 && <p className="muted">None</p>}
                {group.map((t) => {
                  const mine = reqs.filter((r) => r.technician_id === t.id && GROUPS.active.includes(r.status));
                  return (
                    <div className="card" key={t.id}>
                      <div className="row" style={{ justifyContent: 'space-between' }}><h3>{t.full_name}</h3><span className="badge">{mine.length} job(s)</span></div>
                      <p className="muted">Skills: {t.skills || 'not set'}</p>
                      {mine.map((r) => <p key={r.id} className="muted" style={{ margin: '2px 0' }}>{r.request_no} · {r.service_type} · {STATUS[r.status]}</p>)}
                    </div>
                  );
                })}
              </div>
            );
          })}
          <h2>Live locations</h2>
          <TechMap />
        </>
      )}

      {view === 'history' && (
        <>
          <h2>Finished and cancelled jobs</h2>
          {shown.length === 0 && <p className="muted">No finished or cancelled jobs yet.</p>}
          {list}
          <h2>Inventory</h2>
          <Inventory />
          <h2>Activity log</h2>
          <Audit />
        </>
      )}
    </>
  );
}

/* ---------- TECHNICIAN ---------- */
const FLOW = {
  assigned: ['accepted', 'Accept job'],
  accepted: ['en_route', 'I am on my way'],
  en_route: ['arrived', 'I have arrived'],
  arrived: ['diagnosing', 'Start diagnosis'],
  diagnosing: ['in_progress', 'Start work'],
  waiting_parts: ['in_progress', 'Resume work'],
  waiting_customer: ['in_progress', 'Resume work'],
};

export function Technician({ me }) {
  const [reqs, reload] = useRows('requests', (t) => t.select('*, customer:profiles!requests_customer_id_fkey(full_name,phone)').not('status', 'in', '(cancelled,paid,closed)').order('created_at', { ascending: false }));
  const [form, setForm] = useState({});
  const [avail, setAvail] = useState(me.availability || 'available');
  const [skills, setSkills] = useState(me.skills || '');
  const upd = (id, k) => (e) => setForm({ ...form, [id]: { ...form[id], [k]: e.target.value } });

  async function setStatus(r, status, extra = {}) {
    const patch = { status, ...extra };
    if (status === 'arrived') {
      const pos = await getPos();
      if (pos) { patch.status_lat = pos.lat; patch.status_lng = pos.lng; }
    }
    const { error } = await supabase.from('requests').update(patch).eq('id', r.id);
    if (error) alert(error.message);
    reload();
  }

  async function complete(r) {
    const d = form[r.id] || {};
    const { error } = await supabase.from('requests').update({ status: 'completed', diagnosis: d.diagnosis, work_done: d.work_done, materials: d.materials, signature: d.signature }).eq('id', r.id);
    if (error) return alert(error.message);
    const { data: ex } = await supabase.from('extra_charges').select('amount').eq('request_id', r.id).eq('status', 'approved');
    const extra = (ex || []).reduce((s, x) => s + Number(x.amount), 0);
    await supabase.from('invoices').insert({ request_id: r.id, customer_id: r.customer_id, technician_id: me.id, amount: Number(d.amount || 0) + extra });
    if (d.item && d.qty) await supabase.rpc('use_item', { p_item: d.item, p_qty: Number(d.qty) });
    const until = d.warranty ? new Date(Date.now() + Number(d.warranty) * 30 * 864e5).toISOString().slice(0, 10) : null;
    await supabase.from('assets').insert({ customer_id: r.customer_id, request_id: r.id, name: r.service_type, warranty_until: until });
    reload();
  }

  return (
    <>
      <ShareLocation me={me} />
      <Earnings me={me} />
      <div className="card">
        <label>My availability</label>
        <select value={avail} onChange={(e) => { setAvail(e.target.value); supabase.from('profiles').update({ availability: e.target.value }).eq('id', me.id); }}>
          <option value="available">Available</option>
          <option value="busy">Busy</option>
          <option value="offline">Offline</option>
        </select>
        <label>My skills (separate with commas, e.g. Solar, Electrical)</label>
        <input value={skills} onChange={(e) => setSkills(e.target.value)} onBlur={() => supabase.from('profiles').update({ skills }).eq('id', me.id)} />
      </div>

      <h2>My jobs</h2>
      {reqs.length === 0 && <p className="muted">No jobs assigned to you yet.</p>}
      {reqs.map((r) => {
        const dest = r.latitude != null ? `${r.latitude},${r.longitude}` : encodeURIComponent(r.address || '');
        const step = FLOW[r.status];
        return (
          <div className="card" key={r.id}>
            <div className="row" style={{ justifyContent: 'space-between' }}>
              <h3>{r.service_type}</h3>
              <span className="row"><Prio p={r.priority} /><Badge s={r.status} /></span>
            </div>
            <p className="muted">{r.request_no}</p>
            <p>{r.description}</p>
            {r.notes && <p className="muted">Notes: {r.notes}</p>}
            <p className="muted">{r.customer?.full_name} · {r.address}</p>
            {r.scheduled_date && <p className="muted">Scheduled for {r.scheduled_date}</p>}
            <div className="row">
              {r.customer?.phone && <a href={`tel:${r.customer.phone}`}><button className="ghost">Call customer</button></a>}
              <a href={`https://www.google.com/maps/dir/?api=1&destination=${dest}`} target="_blank" rel="noreferrer"><button className="ghost">Navigate</button></a>
            </div>
            <Timeline requestId={r.id} />
            <Files requestId={r.id} canUpload />
            {r.status === 'assigned' && <button className="danger" onClick={() => setStatus(r, 'rejected', { technician_id: null })}>Reject job</button>}
            {r.status === 'accepted' && <input type="number" min="1" placeholder="ETA in minutes" style={{ marginTop: 8 }} onChange={upd(r.id, 'eta')} />}
            {step && <button onClick={() => setStatus(r, step[0], r.status === 'accepted' ? { eta_minutes: Number(form[r.id]?.eta) || null } : {})}>{step[1]}</button>}
            {r.status === 'in_progress' && (
              <div className="row">
                <button className="ghost" onClick={() => setStatus(r, 'waiting_parts')}>Waiting for parts</button>
                <button className="ghost" onClick={() => setStatus(r, 'waiting_customer')}>Waiting for customer</button>
              </div>
            )}
            {r.status === 'in_progress' && <Extras requestId={r.id} mode="tech" meId={me.id} />}
            {r.status === 'in_progress' && (
              <>
                <label>Diagnosis</label><textarea onChange={upd(r.id, 'diagnosis')} />
                <label>Work performed</label><textarea onChange={upd(r.id, 'work_done')} />
                <label>Materials used</label><input onChange={upd(r.id, 'materials')} />
                <ItemPicker onItem={upd(r.id, 'item')} onQty={upd(r.id, 'qty')} />
                <label>Warranty (months)</label><input type="number" min="0" onChange={upd(r.id, 'warranty')} />
                <label>Amount to charge (approved extra charges are added automatically)</label>
                <input type="number" min="0" onChange={upd(r.id, 'amount')} />
                <label>Customer signature</label>
                <SignaturePad onChange={(v) => setForm({ ...form, [r.id]: { ...form[r.id], signature: v } })} />
                <button onClick={() => complete(r)}>Complete job</button>
              </>
            )}
          </div>
        );
      })}
    </>
  );
}

/* ---------- ACCOUNTANT ---------- */
export function Accountant() {
  const [invs, reload] = useRows('invoices', (t) => t.select('*, customer:profiles!invoices_customer_id_fkey(full_name)').order('created_at', { ascending: false }));
  const paid = invs.filter((i) => i.status === 'paid').reduce((s, i) => s + Number(i.amount), 0);
  const owed = invs.filter((i) => i.status === 'unpaid').reduce((s, i) => s + Number(i.amount), 0);

  async function confirm(id) {
    await supabase.from('invoices').update({ status: 'paid', paid_at: new Date().toISOString() }).eq('id', id);
    reload();
  }

  return (
    <>
      <h2>Finance</h2>
      <div className="grid">
        <div className="card"><span className="muted">Revenue</span><div className="stat">{money(paid)}</div></div>
        <div className="card"><span className="muted">Outstanding</span><div className="stat">{money(owed)}</div></div>
      </div>
      <h2>Invoices</h2>
      {invs.length === 0 && <p className="muted">No invoices yet.</p>}
      {invs.map((i) => (
        <div className="card row" key={i.id} style={{ justifyContent: 'space-between' }}>
          <span>{i.customer?.full_name} · {money(i.amount)}</span>
          {i.status === 'unpaid' ? <button style={{ marginTop: 0 }} onClick={() => confirm(i.id)}>Confirm payment</button> : <Badge s="paid" />}
        </div>
      ))}
    </>
  );
}
