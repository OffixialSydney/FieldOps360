'use client';
import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Files, Rating, Tickets, Inventory, Assets, Audit, Stats, ItemPicker, SignaturePad, Earnings } from './Extra';
import { Extras, ShareLocation, TechMap } from './More';
import { Diagnosis, Materials, InvoiceCard, AssetsAdmin, ServicesEditor } from './Ops';
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
  const [reqs, reload] = useRows('requests', (t) => t.select('*, tech:profiles!requests_technician_id_fkey(full_name,phone), company:companies(name)').order('created_at', { ascending: false }));
  const [invs, reloadInv] = useRows('invoices', (t) => t.select('*, job:requests(request_no,service_type)').order('created_at', { ascending: false }));
  const [assets] = useRows('assets', (t) => t.select('*'));
  const [ctab, setCtab] = useState('active');
  const past = ['completed', 'invoiced', 'paid', 'closed', 'cancelled'];
  const myReqs = reqs.filter((r) => past.includes(r.status) === (ctab === 'history'));

  return (
    <>
      <Overview reqs={reqs} invs={invs} assets={assets} />

      <h2>New service request</h2>
      <RequestForm me={me} onCreated={reload} />

      <h2>My requests</h2>
      <div className="row" style={{ marginBottom: 12 }}>
        {[['active', 'Active'], ['history', 'History']].map(([k, label]) => (
          <button key={k} className={ctab === k ? '' : 'ghost'} style={{ marginTop: 0 }} onClick={() => setCtab(k)}>{label}</button>
        ))}
      </div>
      {myReqs.length === 0 && <p className="muted">{ctab === 'history' ? 'No finished jobs yet.' : 'No active requests. Submit one above.'}</p>}
      {myReqs.map((r) => (
        <div className="card" key={r.id}>
          <div className="row" style={{ justifyContent: 'space-between' }}>
            <h3>{r.service_type}</h3>
            <span className="row"><Prio p={r.priority} /><Badge s={r.status} /></span>
          </div>
          <p className="muted">{r.request_no}</p>
          {r.company?.name ? <p className="muted">Company: {r.company.name}</p> : r.status === 'new' && <p className="muted">Open: waiting for a company that offers this service to accept your request.</p>}
          <p>{r.description}</p>
          <p className="muted">{r.address}</p>
          {(r.scheduled_date || r.preferred_date) && <p className="muted">Appointment: {r.scheduled_date || r.preferred_date} {r.preferred_time || ''}</p>}
          {r.tech?.full_name && <p className="muted">Technician: {r.tech.full_name}{r.status === 'en_route' && r.eta_minutes ? ` · ETA ${r.eta_minutes} min` : ''}</p>}
          {r.signature && <img src={r.signature} alt="Customer signature" style={{ height: 60 }} />}
          {r.warranty_claim && <p style={{ color: '#0f766e', fontWeight: 600, margin: '4px 0' }}>WARRANTY CLAIM</p>}
          <Timeline requestId={r.id} />
          <Diagnosis requestId={r.id} />
          <Materials requestId={r.id} />
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
      {invs.map((i) => <InvoiceCard key={i.id} inv={i} onChange={() => { reloadInv(); reload(); }} />)}
    </>
  );
}

/* ---------- MANAGER / SUPER ADMIN ---------- */
const GROUPS = {
  pending: ['new', 'reviewing', 'rejected'],
  active: ['assigned', 'accepted', 'en_route', 'arrived', 'diagnosing', 'in_progress', 'waiting_parts', 'waiting_customer'],
  history: ['completed', 'invoiced', 'paid', 'closed', 'cancelled'],
};

export function Manager({ readOnly, me }) {
  const [view, setView] = useState('live');
  const [tab, setTab] = useState('pending');
  const [reqs, reload] = useRows('requests', (t) => t.select('*, customer:profiles!requests_customer_id_fkey(full_name,phone)').order('created_at', { ascending: false }));
  const [techs] = useRows('profiles', (t) => t.select('id,full_name,skills,availability').eq('role', 'technician'));
  const [locs] = useRows('technician_locations', (t) => t.select('*'));
  const [ratings] = useRows('ratings', (t) => t.select('technician_id,stars'));
  const [companies, reloadCo] = useRows('companies', (t) => t.select('*'));
  const myCo = companies.find((c) => c.id === me?.company_id);

  const live = view === 'live';
  const inTab = (r, k) => (k === 'open' ? !r.company_id && r.status === 'new' : !!r.company_id && GROUPS[k].includes(r.status));
  const shown = reqs
    .filter((r) => inTab(r, view === 'history' ? 'history' : tab))
    .sort((a, b) => (RANK[a.priority] ?? 2) - (RANK[b.priority] ?? 2));

  async function update(id, patch) {
    const { error } = await supabase.from('requests').update(patch).eq('id', id);
    if (error) alert(error.message);
    reload();
  }
  const assign = (id, techId) => update(id, { technician_id: techId || null, status: techId ? 'assigned' : 'new' });
  async function claim(id, techId) {
    const { error } = await supabase.rpc('claim_request', { p_request: id, p_technician: techId || null });
    if (error) alert(error.message);
    reload();
  }

  const list = shown.map((r) => {
    const dest = r.latitude != null ? `${r.latitude},${r.longitude}` : encodeURIComponent(r.address || '');
    const market = !r.company_id;
    const offers = !!myCo?.services?.includes(r.service_type);
    const open = !market && ['new', 'reviewing', 'rejected'].includes(r.status);
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
        {r.warranty_claim && <p style={{ color: '#0f766e', fontWeight: 600, margin: '4px 0' }}>POTENTIAL WARRANTY CLAIM</p>}
        <Timeline requestId={r.id} />
        <Diagnosis requestId={r.id} />
        <Materials requestId={r.id} />
        <Extras requestId={r.id} mode="view" />
        <Files requestId={r.id} />
        {readOnly && r.technician_id && <p className="muted">Assigned technician: {techs.find((t) => t.id === r.technician_id)?.full_name || '-'}</p>}
        {live && !readOnly && (
          <div className="row">
            <span className="muted">Scheduled for (change to reschedule)</span>
            <input type="date" style={{ width: 'auto' }} value={r.scheduled_date || ''} onChange={(e) => update(r.id, { scheduled_date: e.target.value || null })} />
          </div>
        )}
        {market && readOnly && <p className="muted">Open request: waiting for a company that offers this service to take it.</p>}
        {market && !readOnly && !offers && <p style={{ color: '#b42318', fontWeight: 600 }}>You don't offer this service ({r.service_type}). Not your field.</p>}
        {market && !readOnly && offers && (
          <>
            <Suggestions req={r} techs={techs} reqs={reqs} locs={locs} ratings={ratings} onAssign={(tid) => claim(r.id, tid)} />
            <button className="ghost" onClick={() => claim(r.id, null)}>Take this job (assign a technician later)</button>
          </>
        )}
        {open && !readOnly && (
          <Suggestions req={r} techs={techs} reqs={reqs} locs={locs} ratings={ratings} onAssign={(tid) => assign(r.id, tid)} />
        )}
        {!readOnly && (open || r.status === 'assigned') && (
          <div className="row">
            <select value={r.technician_id || ''} onChange={(e) => assign(r.id, e.target.value)}>
              <option value="">Choose a technician yourself</option>
              {techs.map((t) => <option key={t.id} value={t.id}>{t.full_name}</option>)}
            </select>
            {r.status === 'new' && <button className="ghost" onClick={() => update(r.id, { status: 'reviewing' })}>Start review</button>}
            <button className="danger" onClick={() => update(r.id, { status: 'cancelled' })}>Cancel</button>
          </div>
        )}
        {r.status === 'paid' && !readOnly && <button onClick={() => update(r.id, { status: 'closed' })}>Close job</button>}
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

      {readOnly && <p className="muted">View only: each company's manager assigns jobs, replies to tickets and manages stock and warranties. You can follow progress here.</p>}

      {view === 'live' && (
        <>
          <Stats />
          {!readOnly && myCo && <ServicesEditor company={myCo} onSaved={reloadCo} />}
          <h2>Service requests</h2>
          <div className="row" style={{ marginBottom: 12 }}>
            {['open', 'pending', 'active'].map((k) => (
              <button key={k} className={tab === k ? '' : 'ghost'} style={{ marginTop: 0 }} onClick={() => setTab(k)}>
                {k === 'open' ? 'Open requests' : k === 'pending' ? 'Pending' : 'Active'} ({reqs.filter((r) => inTab(r, k)).length})
              </button>
            ))}
          </div>
          {shown.length === 0 && <p className="muted">Nothing here.</p>}
          {list}
          <h2>Support tickets</h2>
          <Tickets staff readOnly={readOnly} />
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
          <h2>Assets and warranties</h2>
          <AssetsAdmin readOnly={readOnly} />
          <h2>Inventory</h2>
          <Inventory readOnly={readOnly} />
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
  const [skillMsg, setSkillMsg] = useState('');
  const [finishing, setFinishing] = useState(false);

  async function saveSkills() {
    const { data, error } = await supabase.from('profiles').update({ skills }).eq('id', me.id).select();
    setSkillMsg(error ? error.message : data?.length ? 'Skills saved' : 'Could not save. Log out and log in again.');
  }
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
    if (finishing) return;
    setFinishing(true);
    const d = form[r.id] || {};
    const n = (x) => Number(x || 0);
    const { error } = await supabase.from('requests').update({ status: 'completed', work_done: d.work_done, signature: d.signature }).eq('id', r.id);
    if (error) { setFinishing(false); return alert(error.message); }
    const { data: mats } = await supabase.from('job_materials').select('*').eq('request_id', r.id);
    const { data: ex } = await supabase.from('extra_charges').select('*').eq('request_id', r.id).eq('status', 'approved');
    const items = [];
    (mats || []).forEach((m) => items.push({ label: m.name, qty: m.qty, unit_price: m.unit_price }));
    (ex || []).forEach((x) => (x.lines?.length ? x.lines : [{ label: x.description, amount: x.amount }]).forEach((l) => items.push({ label: l.label, qty: 1, unit_price: l.amount })));
    if (n(d.labour) > 0) items.push({ label: 'Labour', qty: 1, unit_price: n(d.labour) });
    if (n(d.fee) > 0) items.push({ label: 'Service fee', qty: 1, unit_price: n(d.fee) });
    const subtotal = items.reduce((s, l) => s + l.qty * l.unit_price, 0);
    const discount = Math.min(n(d.discount), subtotal);
    const tax = Math.round(((subtotal - discount) * n(d.tax)) / 100);
    await supabase.from('invoices').insert({ request_id: r.id, customer_id: r.customer_id, technician_id: me.id, items, subtotal, discount, tax, amount: subtotal - discount + tax });
    const start = new Date().toISOString().slice(0, 10);
    const until = d.warranty ? new Date(Date.now() + n(d.warranty) * 30 * 864e5).toISOString().slice(0, 10) : null;
    await supabase.from('assets').insert({
      customer_id: r.customer_id, request_id: r.id, name: r.service_type, serial_number: d.serial || null, technician_id: me.id,
      installation_date: start, warranty_months: d.warranty ? n(d.warranty) : null, warranty_start: d.warranty ? start : null, warranty_until: until,
    });
    setFinishing(false);
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
        <input value={skills} onChange={(e) => { setSkills(e.target.value); setSkillMsg(''); }} />
        <button type="button" onClick={saveSkills}>Save skills</button>
        {skillMsg && <p className="muted">{skillMsg}</p>}
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
            {['arrived', 'diagnosing', 'in_progress', 'waiting_parts', 'waiting_customer'].includes(r.status) && <Diagnosis requestId={r.id} canEdit meId={me.id} />}
            {['diagnosing', 'in_progress', 'waiting_parts', 'waiting_customer'].includes(r.status) && <Materials requestId={r.id} canEdit />}
            {r.status === 'in_progress' && (
              <>
                <h3>Complete job</h3>
                <label>Work performed</label><textarea onChange={upd(r.id, 'work_done')} />
                <label>Labour charge (₦)</label><input type="number" min="0" onChange={upd(r.id, 'labour')} />
                <label>Service fee (₦)</label><input type="number" min="0" onChange={upd(r.id, 'fee')} />
                <label>Discount (₦)</label><input type="number" min="0" onChange={upd(r.id, 'discount')} />
                <label>Tax (%)</label><input type="number" min="0" onChange={upd(r.id, 'tax')} />
                <label>Equipment serial number (if installed)</label><input onChange={upd(r.id, 'serial')} />
                <label>Warranty given (months)</label><input type="number" min="0" onChange={upd(r.id, 'warranty')} />
                <label>Customer signature</label>
                <SignaturePad onChange={(v) => setForm({ ...form, [r.id]: { ...form[r.id], signature: v } })} />
                <p className="muted">The invoice is built from materials, approved additional work, labour and fees.</p>
                <button disabled={finishing} onClick={() => complete(r)}>{finishing ? 'Completing...' : 'Complete job'}</button>
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
  const [invs, reload] = useRows('invoices', (t) => t.select('*, customer:profiles!invoices_customer_id_fkey(full_name,email), job:requests(request_no,service_type)').order('created_at', { ascending: false }));
  const revenue = invs.reduce((s, i) => s + Number(i.paid_amount || 0), 0);
  const owed = invs.filter((i) => !['paid', 'refunded'].includes(i.status)).reduce((s, i) => s + Number(i.amount) - Number(i.paid_amount || 0), 0);
  const awaiting = invs.filter((i) => i.status === 'pending').length;

  return (
    <>
      <h2>Finance</h2>
      <div className="grid">
        <div className="card"><span className="muted">Revenue received</span><div className="stat">{money(revenue)}</div></div>
        <div className="card"><span className="muted">Outstanding</span><div className="stat">{money(owed)}</div></div>
        <div className="card"><span className="muted">Payments to review</span><div className="stat">{awaiting}</div></div>
      </div>
      <h2>Invoices</h2>
      {invs.length === 0 && <p className="muted">No invoices yet.</p>}
      {invs.map((i) => <InvoiceCard key={i.id} inv={i} staff onChange={reload} />)}
    </>
  );
}