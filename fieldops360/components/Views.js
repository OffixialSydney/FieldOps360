'use client';
import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Files, Rating, Tickets, Inventory, Assets, Audit, Stats, ItemPicker, SignaturePad, Earnings } from './Extra';
import { Extras, ShareLocation, TechMap } from './More';
import { Diagnosis, Materials, InvoiceCard, AssetsAdmin, ServicesEditor } from './Ops';
import { Analytics, Performance } from './Analytics';
import { WalletCard, TransactionList } from './Wallet';
import { DocButton } from './Documents';
import { JobFilters, jobPasses, emptyJobFilter, useInvoiceFilter, CustomersList } from './Filters';
import { updateOrQueue } from '../lib/offline';
import { useLive } from '../lib/live';
import { STATUS, RANK, Prio, Timeline, RequestForm, Overview, Suggestions, getPos, ActionNeeded, GoAhead } from './Jobs';
import { sendDispatchAlert } from '../lib/notify';

function WhatsAppIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </svg>
  );
}

const SERVICES = ['Solar installation', 'Solar maintenance', 'Electrical', 'Generator repair', 'Air-conditioner servicing', 'Plumbing', 'CCTV installation', 'Internet installation', 'Equipment maintenance', 'Other'];
const money = (n) => '₦' + Number(n || 0).toLocaleString();

function useRows(table, query) {
  const [rows, setRows] = useState([]);
  const load = useCallback(async () => {
    const key = `fo:cache:${table}`;
    const { data, error } = await query(supabase.from(table));
    if (error) {
      try {
        const cached = localStorage.getItem(key);
        if (cached) { setRows(JSON.parse(cached)); return; }
      } catch (e) { /* no saved copy */ }
      setRows(data || []);
      return;
    }
    setRows(data || []);
    try { localStorage.setItem(key, JSON.stringify(data || [])); } catch (e) { /* storage full */ }
  }, [table]); // eslint-disable-line
  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    const h = () => load();
    window.addEventListener('queue-synced', h);
    window.addEventListener('extras-changed', h);
    return () => { window.removeEventListener('queue-synced', h); window.removeEventListener('extras-changed', h); };
  }, [load]);
  return [rows, load, setRows];
}

const Badge = ({ s }) => <span className="badge">{STATUS[s] || s.replace('_', ' ')}</span>;

/* ---------- CUSTOMER ---------- */
export function Customer({ me }) {
  const [reqs, reload] = useRows('requests', (t) => t.select('*, tech:profiles!requests_technician_id_fkey(full_name,phone), company:companies(name)').order('created_at', { ascending: false }));
  const [invs, reloadInv] = useRows('invoices', (t) => t.select('*, job:requests(request_no,service_type)').order('created_at', { ascending: false }));
  const [assets] = useRows('assets', (t) => t.select('*'));
  const [shownInvs, invFilter] = useInvoiceFilter(invs);
  const [ctab, setCtab] = useState('active');
  const [notice, setNotice] = useState('');
  const past = ['completed', 'invoiced', 'paid', 'closed', 'cancelled'];
  const myReqs = ctab === 'new' || ctab === 'transactions' ? [] : reqs.filter((r) => past.includes(r.status) === (ctab === 'history'));
  useEffect(() => {
    const t = setInterval(() => { reload(); reloadInv(); }, 15000);
    return () => clearInterval(t);
  }, [reload, reloadInv]);
  useEffect(() => { supabase.rpc('check_warranty_alerts'); }, []);

  return (
    <>
      <ActionNeeded reqs={reqs} onChange={() => { reload(); reloadInv(); }} />
      <Overview reqs={reqs} invs={invs} assets={assets} />
      <WalletCard />

      <h2>My requests</h2>
      <div className="row" style={{ marginBottom: 12 }}>
        {[['active', 'Active'], ['history', 'History'], ['new', 'New request'], ['transactions', 'Transactions']].map(([k, label]) => (
          <button key={k} className={ctab === k ? '' : 'ghost'} style={{ marginTop: 0 }} onClick={() => { setCtab(k); setNotice(''); }}>{label}</button>
        ))}
      </div>
      {notice && ctab === 'active' && <div className="card" style={{ borderColor: 'var(--accent)' }}><p style={{ margin: 0 }}>{notice}</p></div>}
      {ctab === 'new' && (
        <>
          <h3>New service request</h3>
          <RequestForm me={me} onCreated={(no) => { reload(); setCtab('active'); setNotice(`Request ${no} submitted. A company that offers this service will accept it soon.`); }} />
        </>
      )}
      {ctab === 'transactions' && <TransactionList />}
      {ctab !== 'new' && ctab !== 'transactions' && myReqs.length === 0 && (
        <div className="card" style={{ textAlign: 'center' }}>
          <p>{ctab === 'history' ? 'No finished jobs yet.' : 'No service jobs yet.'}</p>
          {ctab === 'active' && <button onClick={() => setCtab('new')}>Request a Service</button>}
        </div>
      )}
      {myReqs.map((r) => (
        <div className="card" key={r.id} id={r.request_no}>
          <div className="row" style={{ justifyContent: 'space-between' }}>
            <h3>{r.service_type}</h3>
            <span className="row"><Prio p={r.priority} /><Badge s={r.status} /></span>
          </div>
          <p className="muted">{r.request_no}</p>
          <p>{r.description}</p>
          {r.notes && <p className="muted">Notes: {r.notes}</p>}
          <p className="muted">Service address: {r.address}</p>
          {r.tech?.full_name && (
            <p>
              Assigned technician: <b>{r.tech.full_name}</b>
              {r.tech.phone && <> · <a href={`tel:${r.tech.phone}`}>{r.tech.phone}</a></>}
              {r.status === 'en_route' && r.eta_minutes ? <> · ETA <b>{r.eta_minutes} mins</b></> : null}
            </p>
          )}
          {r.company?.name && <p className="muted">Serviced by {r.company.name}</p>}
          {r.status === 'waiting_parts' && <p style={{ color: '#b54708', fontWeight: 600 }}>The technician is waiting for parts to continue.</p>}
          {r.status === 'waiting_customer' && <p style={{ color: '#b42318', fontWeight: 600 }}>The technician is waiting for your decision on additional work.</p>}
          {r.tech_notes && (
            <div style={{ background: '#f8fafc', borderLeft: '3px solid var(--primary)', padding: '10px 14px', borderRadius: '0 8px 8px 0', margin: '8px 0' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase' }}>Technician Live Log</span>
              <p style={{ margin: '4px 0 0', fontSize: '13px' }}>{r.tech_notes}</p>
            </div>
          )}
          {r.work_done && (
            <div style={{ background: '#ecfdf5', borderLeft: '3px solid #059669', padding: '10px 14px', borderRadius: '0 8px 8px 0', margin: '8px 0' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#059669', textTransform: 'uppercase' }}>Work Performed</span>
              <p style={{ margin: '4px 0 0', fontSize: '13px' }}>{r.work_done}</p>
            </div>
          )}
          <Timeline requestId={r.id} />
          {['completed', 'invoiced', 'paid', 'closed'].includes(r.status) && (
            <div className="row">
              <DocButton type="completion" id={r.id} label="Completion report" />
              <DocButton type="service" id={r.id} label="Service report" />
            </div>
          )}
          <Diagnosis requestId={r.id} />
          <Materials requestId={r.id} />
          <Extras requestId={r.id} mode="customer" onChange={() => { reload(); reloadInv(); }} />
          <Files requestId={r.id} canUpload />
          {r.status === 'invoiced' && <p style={{ color: '#b54708', fontWeight: 600 }}>Invoice generated. Please scroll down to settle.</p>}
        </div>
      ))}

      <Assets />
      <h2>Support</h2>
      <Tickets me={me} />
      <h2>Invoices and payments</h2>
      {invs.length === 0 && <p className="muted">Invoices appear here once a job is completed.</p>}
      {invs.length > 0 && invFilter}
      {shownInvs.length === 0 && invs.length > 0 && <p className="muted">No invoices match the filter.</p>}
      {shownInvs.map((i) => <InvoiceCard key={i.id} inv={i} onChange={() => { reloadInv(); reload(); }} />)}
    </>
  );
}

/* ---------- MANAGER / SUPER ADMIN ---------- */
const GROUPS = {
  pending: ['new', 'reviewing', 'rejected'],
  active: ['assigned', 'accepted', 'en_route', 'arrived', 'diagnosing', 'in_progress', 'waiting_parts', 'waiting_customer'],
  history: ['completed', 'invoiced', 'paid', 'closed', 'cancelled'],
};

export function Manager({ readOnly, me, only }) {
  const [view, setView] = useState(only || 'live');
  const [jf, setJf] = useState(emptyJobFilter);
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
    .filter((r) => inTab(r, view === 'history' || view === 'jobhistory' ? 'history' : tab))
    .filter(jobPasses(jf))
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
      <div className="card" key={r.id} id={r.request_no}>
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
          <a href={`https://www.google.com/maps/search/?api=1&query=${dest}`} target="_blank" rel="noreferrer"><button className="ghost">Open location</button></a>
          {r.customer?.phone && (
            <a href={`https://wa.me/${r.customer.phone.replace(/\D/g, '')}?text=${encodeURIComponent(`Hello ${r.customer.full_name || ''}, regarding your FieldOps 360 service order #${r.request_no}:`)}`} target="_blank" rel="noreferrer">
              <button className="ghost" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <WhatsAppIcon />
                <span>WhatsApp Customer</span>
              </button>
            </a>
          )}
        </div>
        {r.signature && <img src={r.signature} alt="Customer signature" style={{ height: 60 }} />}
        {r.warranty_claim && <p style={{ color: '#0f766e', fontWeight: 600, margin: '4px 0' }}>POTENTIAL WARRANTY CLAIM</p>}
        {r.cancel_reason && <p className="err" style={{ fontWeight: 600 }}>Job stopped: {r.cancel_reason}</p>}
        <Timeline requestId={r.id} />
        {['completed', 'invoiced', 'paid', 'closed'].includes(r.status) && (
          <div className="row">
            <DocButton type="completion" id={r.id} label="Completion report" />
            <DocButton type="service" id={r.id} label="Service report" />
          </div>
        )}
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
      {!only && (
      <div className="row" style={{ margin: '12px 0' }}>
        {[['live', 'Dashboard'], ['dispatch', 'Dispatch'], ['customers', 'Customers'], ['analytics', 'Analytics'], ['history', 'History and inventory']].map(([k, label]) => (
          <button key={k} className={view === k ? '' : 'ghost'} style={{ marginTop: 0 }} onClick={() => setView(k)}>{label}</button>
        ))}
      </div>
      )}

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
          <JobFilters jf={jf} setJf={setJf} techs={techs} />
          {shown.length === 0 && <p className="muted">Nothing here.</p>}
          {list}
          {!only && (
            <>
              <h2>Support tickets</h2>
              <Tickets staff readOnly={readOnly} />
            </>
          )}
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

      {view === 'customers' && <CustomersList />}

      {view === 'analytics' && (
        <>
          <Analytics />
          <Performance />
        </>
      )}

      {view === 'jobhistory' && (
        <>
          <h2>Job history</h2>
          <JobFilters jf={jf} setJf={setJf} techs={techs} />
          {shown.length === 0 && <p className="muted">No finished or cancelled jobs yet.</p>}
          {list}
        </>
      )}

      {view === 'tickets' && (
        <>
          <h2>Support tickets</h2>
          <Tickets staff readOnly={readOnly} />
        </>
      )}

      {view === 'stock' && (
        <>
          <h2>Assets and warranties</h2>
          <AssetsAdmin readOnly={readOnly} />
          <h2>Inventory</h2>
          <Inventory readOnly={readOnly} />
        </>
      )}

      {view === 'log' && (
        <>
          <h2>Activity log</h2>
          <Audit />
        </>
      )}

      {view === 'history' && (
        <>
          <h2>Finished and cancelled jobs</h2>
          <JobFilters jf={jf} setJf={setJf} techs={techs} />
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
  const [reqs, reload, setRows] = useRows('requests', (t) => t.select('*, customer:profiles!requests_customer_id_fkey(full_name,phone)').order('created_at', { ascending: false }));
  const [exRows, reloadEx] = useRows('extra_charges', (t) => t.select('request_id,status'));
  const [form, setForm] = useState({});
  const [avail, setAvail] = useState(me.availability || 'available');
  const [skills, setSkills] = useState(me.skills || '');
  const [skillMsg, setSkillMsg] = useState('');
  const [finishing, setFinishing] = useState(false);
  const [ttab, setTtab] = useState('jobs');
  const [waAlerts, setWaAlerts] = useState({});

  useEffect(() => {
    const t = setInterval(() => { reload(); reloadEx(); }, 15000);
    return () => clearInterval(t);
  }, [reload, reloadEx]);
  useLive('extra_charges', reloadEx);

  const ex = (id) => {
    const l = exRows.filter((x) => x.request_id === id);
    return { pending: l.some((x) => x.status === 'pending'), approved: l.some((x) => x.status === 'approved'), rejected: l.filter((x) => x.status === 'rejected').length };
  };

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
    const res = await updateOrQueue('requests', r.id, patch);
    if (res.error) alert(res.error.message);

    // Automated dispatch status notification
    sendDispatchAlert({
      type: 'job_status',
      request: { ...r, ...patch },
      customer: r.customer,
      technician: me,
      status: STATUS[status] || status,
    }).then((notif) => {
      if (notif?.waLink) {
        setWaAlerts((prev) => ({ ...prev, [r.id]: notif.waLink }));
      }
    });

    if (res.queued) setRows((rs) => rs.map((x) => (x.id === r.id ? { ...x, ...patch } : x)));
    else reload();
  }

  async function stopWork(r) {
    if (!window.confirm('Stop work and cancel this job because the client refused the additional work?')) return;
    const res = await updateOrQueue('requests', r.id, { status: 'cancelled', cancel_reason: 'Client refused the additional work' });
    if (res.error) return alert(res.error.message);
    reload();
  }

  async function complete(r) {
    if (finishing) return;
    if (!navigator.onLine) return alert('Completing a job needs an internet connection. Your other changes are saved and will sync.');
    setFinishing(true);
    const d = form[r.id] || {};
    const n = (x) => Number(x || 0);
    const { error } = await supabase.from('requests').update({ status: 'completed', work_done: d.work_done, signature: d.signature }).eq('id', r.id);
    if (error) { setFinishing(false); return alert(error.message); }
    const { data: mats } = await supabase.from('job_materials').select('*').eq('request_id', r.id);
    const { data: ex } = await supabase.from('extra_charges').select('*').eq('request_id', r.id).eq('status', 'approved').is('invoice_id', null);
    const items = [];
    (mats || []).forEach((m) => items.push({ label: m.name, qty: m.qty, unit_price: m.unit_price }));
    (ex || []).forEach((x) => (x.lines?.length ? x.lines : [{ label: x.description, amount: x.amount }]).forEach((l) => items.push({ label: l.label, qty: 1, unit_price: l.amount })));
    if (n(d.labour) > 0) items.push({ label: 'Labour', qty: 1, unit_price: n(d.labour) });
    if (n(d.fee) > 0) items.push({ label: 'Service fee', qty: 1, unit_price: n(d.fee) });
    const subtotal = items.reduce((s, l) => s + l.qty * l.unit_price, 0);
    const discount = Math.min(n(d.discount), subtotal);
    const tax = Math.round(((subtotal - discount) * n(d.tax)) / 100);
    const totalAmount = subtotal - discount + tax;

    const { data: invData } = await supabase.from('invoices').insert({ 
      request_id: r.id, 
      customer_id: r.customer_id, 
      technician_id: me.id, 
      items, 
      subtotal, 
      discount, 
      tax, 
      amount: totalAmount 
    }).select().single();

    const start = new Date().toISOString().slice(0, 10);
    const until = d.warranty ? new Date(Date.now() + n(d.warranty) * 30 * 864e5).toISOString().slice(0, 10) : null;
    await supabase.from('assets').insert({
      customer_id: r.customer_id, request_id: r.id, name: r.service_type, serial_number: d.serial || null, technician_id: me.id,
      installation_date: start, warranty_months: d.warranty ? n(d.warranty) : null, warranty_start: d.warranty ? start : null, warranty_until: until,
    });

    // Send automated WhatsApp / SMS dispatch with invoice link to customer
    const notif = await sendDispatchAlert({
      type: 'job_completed',
      request: r,
      customer: r.customer,
      technician: me,
      workDone: d.work_done,
      invoice: invData || { invoice_no: r.request_no?.replace('REQ', 'INV'), amount: totalAmount },
    });

    if (notif?.waLink) {
      setWaAlerts((prev) => ({ ...prev, [r.id]: notif.waLink }));
    }

    setFinishing(false);
    alert('Job completed! Invoice created and sent straight to the customer via WhatsApp/SMS with direct portal link.');
    reload();
  }

  const DONE_ST = ['completed', 'invoiced', 'paid', 'closed', 'cancelled'];
  const mine = reqs.filter((r) => (ttab === 'done') === DONE_ST.includes(r.status));

  async function saveNotes(r) {
    const notes = form[r.id]?.notes ?? '';
    const res = await updateOrQueue('requests', r.id, { tech_notes: notes });
    if (res.error) return alert(res.error.message);

    // Automated dispatch of technician log to customer
    const notif = await sendDispatchAlert({
      type: 'job_log',
      request: r,
      customer: r.customer,
      technician: me,
      notes,
    });

    if (notif?.waLink) {
      setWaAlerts((prev) => ({ ...prev, [r.id]: notif.waLink }));
    }

    alert(res.queued ? 'Saved on this device. It will sync when you are online.' : 'Notes saved and dispatched to customer WhatsApp/SMS.');
  }

  return (
    <>
      {ttab === 'me' && (
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
        </>
      )}

      {ttab !== 'me' && (
        <>
      <h2>{ttab === 'done' ? 'Finished jobs' : 'My jobs'}</h2>
      {mine.length === 0 && (
        <div className="card" style={{ textAlign: 'center' }}>
          <p>{ttab === 'done' ? 'No finished jobs yet.' : 'No jobs assigned to you yet.'}</p>
        </div>
      )}
      {mine.map((r) => {
        const dest = r.latitude != null ? `${r.latitude},${r.longitude}` : encodeURIComponent(r.address || '');
        const step = FLOW[r.status];
        const s = ex(r.id);
        const late = ['diagnosing', 'in_progress', 'waiting_parts', 'waiting_customer'].includes(r.status);
        return (
          <div className="card" key={r.id} id={r.request_no}>
            <div className="row" style={{ justifyContent: 'space-between' }}>
              <h3>{r.service_type}</h3>
              <span className="row"><Prio p={r.priority} /><Badge s={r.status} /></span>
            </div>
            <p className="muted">{r.request_no}</p>
            <p>{r.description}</p>
            {r.notes && <p className="muted">Customer notes: {r.notes}</p>}
            <p className="muted">{r.customer?.full_name} · {r.address}</p>
            {r.scheduled_date && <p className="muted">Scheduled for {r.scheduled_date}</p>}
            <div className="row">
              {r.customer?.phone && <a href={`tel:${r.customer.phone}`}><button className="ghost">Call customer</button></a>}
              <a href={`https://www.google.com/maps/dir/?api=1&destination=${dest}`} target="_blank" rel="noreferrer"><button className="ghost">Navigate</button></a>
              {r.customer?.phone && (
                <button
                  type="button"
                  className="ghost"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                  onClick={async () => {
                    const notif = await sendDispatchAlert({
                      type: 'job_log',
                      request: r,
                      customer: r.customer,
                      technician: me,
                      notes: form[r.id]?.notes || r.tech_notes || 'Technician is actively working on your request.',
                    });
                    if (notif?.waLink) {
                      setWaAlerts((prev) => ({ ...prev, [r.id]: notif.waLink }));
                      window.open(notif.waLink, '_blank');
                    }
                  }}
                >
                  <WhatsAppIcon />
                  <span>WhatsApp Customer</span>
                </button>
              )}
            </div>

            {waAlerts[r.id] && (
              <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '8px', padding: '10px 14px', marginTop: '10px' }}>
                <p style={{ margin: '0 0 6px', fontSize: '13px', color: '#065f46', fontWeight: 600 }}>
                  Automated dispatch alert ready for {r.customer?.full_name || 'Customer'}
                </p>
                <a href={waAlerts[r.id]} target="_blank" rel="noreferrer">
                  <button type="button" style={{ background: '#059669', color: '#fff', fontSize: '12px', padding: '6px 12px', marginTop: 0, display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    <WhatsAppIcon />
                    <span>Open in WhatsApp</span>
                  </button>
                </a>
              </div>
            )}

            {r.cancel_reason && <p className="err" style={{ fontWeight: 600 }}>Job stopped: {r.cancel_reason}</p>}
            <Timeline requestId={r.id} />
            <Files requestId={r.id} canUpload={late} kinds />
            {late && (
              <>
                <label>My diagnostic & operational notes</label>
                <textarea defaultValue={r.tech_notes || ''} placeholder="Log parts replaced, voltage readings, or status notes here..." onChange={upd(r.id, 'notes')} />
                <button type="button" className="ghost" onClick={() => saveNotes(r)}>Save notes & dispatch update</button>
              </>
            )}
            {r.status === 'assigned' && <button className="danger" onClick={() => setStatus(r, 'rejected', { technician_id: null })}>Reject job</button>}
            {r.status === 'accepted' && <input type="number" min="1" placeholder="ETA in minutes" style={{ marginTop: 8 }} onChange={upd(r.id, 'eta')} />}
            {step && <button onClick={() => setStatus(r, step[0], r.status === 'accepted' ? { eta_minutes: Number(form[r.id]?.eta) || null } : {})}>{step[1]}</button>}
            {r.status === 'waiting_customer' && <p className="muted">You can resume once the customer clicks Go ahead, and any additional work is approved, paid and confirmed by the accountant.</p>}
            {r.status === 'in_progress' && !s.approved && !s.pending && <Extras requestId={r.id} mode="tech" meId={me.id} hideList />}
            {r.status === 'in_progress' && !s.approved && !s.pending && s.rejected > 0 && <p className="muted">The customer declined your last request. You can send a revised one or complete the job.</p>}
            {r.status === 'in_progress' && s.pending && <p className="muted">Waiting for the customer to decide on your additional work request.</p>}
            {r.status === 'in_progress' && s.approved && <p style={{ color: '#0f766e', fontWeight: 600 }}>The customer approved the additional work. You can complete the job.</p>}
            {r.status === 'in_progress' && !s.approved && !s.pending && s.rejected >= 2 && <button className="danger" onClick={() => stopWork(r)}>Stop work: client refused</button>}
            {r.status === 'diagnosing' && <Diagnosis requestId={r.id} canEdit meId={me.id} onSaved={() => setStatus(r, 'in_progress')} />}
            {['diagnosing', 'in_progress', 'waiting_parts', 'waiting_customer'].includes(r.status) && <Materials requestId={r.id} canEdit />}
            {r.status === 'in_progress' && !s.pending && (
              <>
                <h3>Complete job</h3>
                <label>Work performed summary</label><textarea onChange={upd(r.id, 'work_done')} placeholder="Summarize work done for invoice..." />
                <label>Labour charge (₦)</label><input type="number" min="0" onChange={upd(r.id, 'labour')} />
                <label>Service fee (₦)</label><input type="number" min="0" onChange={upd(r.id, 'fee')} />
                <label>Discount (₦)</label><input type="number" min="0" onChange={upd(r.id, 'discount')} />
                <label>Tax (%)</label><input type="number" min="0" onChange={upd(r.id, 'tax')} />
                <label>Equipment serial number (if installed)</label><input onChange={upd(r.id, 'serial')} />
                <label>Warranty given (months)</label><input type="number" min="0" onChange={upd(r.id, 'warranty')} />
                <label>Customer signature</label>
                <SignaturePad onChange={(v) => setForm({ ...form, [r.id]: { ...form[r.id], signature: v } })} />
                <p className="muted">The invoice is built from materials, approved additional work, labour and fees. Customer will automatically receive WhatsApp notification with invoice link upon completion.</p>
                <button disabled={finishing} onClick={() => complete(r)}>{finishing ? 'Completing & dispatching invoice...' : 'Complete job & send invoice'}</button>
              </>
            )}
          </div>
        );
      })}
        </>
      )}

      <div style={{ height: 72 }} />
      <nav className="bottomnav">
        {[['jobs', `Jobs (${reqs.filter((r) => !DONE_ST.includes(r.status)).length})`], ['done', 'Finished'], ['me', 'Me']].map(([k, label]) => (
          <button key={k} className={ttab === k ? 'active' : ''} onClick={() => setTtab(k)}>{label}</button>
        ))}
      </nav>
    </>
  );
}

/* ---------- ACCOUNTANT ---------- */
export function Accountant() {
  const [invs, reload] = useRows('invoices', (t) => t.select('*, customer:profiles!invoices_customer_id_fkey(full_name,email), job:requests(request_no,service_type)').order('created_at', { ascending: false }));
  const revenue = invs.reduce((s, i) => s + Number(i.paid_amount || 0), 0);
  const owed = invs.filter((i) => !['paid', 'refunded'].includes(i.status)).reduce((s, i) => s + Number(i.amount) - Number(i.paid_amount || 0), 0);
  const awaiting = invs.filter((i) => i.status === 'pending').length;
  const [shownInvs, invFilter] = useInvoiceFilter(invs);

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
      {invs.length > 0 && invFilter}
      {shownInvs.length === 0 && invs.length > 0 && <p className="muted">No invoices match the filter.</p>}
      {shownInvs.map((i) => <InvoiceCard key={i.id} inv={i} staff onChange={reload} />)}
    </>
  );
}
