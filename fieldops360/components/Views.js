'use client';
import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Files, Rating, Tickets, Inventory, Assets, Audit, Stats, ItemPicker, SignaturePad, Earnings } from './Extra';
import { Extras, ShareLocation, TechMap } from './More';

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

const Badge = ({ s }) => <span className="badge">{s.replace('_', ' ')}</span>;

/* ---------- CUSTOMER ---------- */
export function Customer({ me }) {
  const [reqs, reload] = useRows('requests', (t) => t.select('*').order('created_at', { ascending: false }));
  const [invs, reloadInv] = useRows('invoices', (t) => t.select('*').order('created_at', { ascending: false }));
  const [f, setF] = useState({ service_type: SERVICES[0], description: '', address: '', preferred_date: '' });
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const [addrs, reloadAddrs] = useRows('addresses', (t) => t.select('*'));
  async function saveAddr() {
    if (!f.address) return;
    await supabase.from('addresses').insert({ customer_id: me.id, label: f.address.slice(0, 30), address: f.address });
    reloadAddrs();
  }

  async function create(e) {
    e.preventDefault();
    await supabase.from('requests').insert({ ...f, preferred_date: f.preferred_date || null, customer_id: me.id });
    setF({ ...f, description: '', address: '', preferred_date: '' });
    reload();
  }

  return (
    <>
      <h2>New service request</h2>
      <form className="card" onSubmit={create}>
        <label>Service</label>
        <select value={f.service_type} onChange={set('service_type')}>{SERVICES.map((s) => <option key={s}>{s}</option>)}</select>
        <label>What is the problem?</label>
        <textarea required value={f.description} onChange={set('description')} />
        <label>Address</label>
        {addrs.length > 0 && (
          <select value="" onChange={(e) => e.target.value && setF({ ...f, address: e.target.value })}>
            <option value="">Use a saved address</option>
            {addrs.map((a) => <option key={a.id} value={a.address}>{a.address}</option>)}
          </select>
        )}
        <input required value={f.address} onChange={set('address')} style={{ marginTop: 6 }} />
        <button type="button" className="ghost" onClick={saveAddr}>Save this address</button>
        <label>Preferred date</label>
        <input type="date" value={f.preferred_date} onChange={set('preferred_date')} />
        <button>Submit request</button>
      </form>

      <h2>My requests</h2>
      {reqs.length === 0 && <p className="muted">No requests yet. Submit one above.</p>}
      {reqs.map((r) => (
        <div className="card" key={r.id}>
          <div className="row" style={{ justifyContent: 'space-between' }}><h3>{r.service_type}</h3><Badge s={r.status} /></div>
          <p>{r.description}</p>
          <p className="muted">{r.address}</p>
          {r.scheduled_date && <p className="muted">Scheduled for {r.scheduled_date}</p>}
          {r.signature && <img src={r.signature} alt="Customer signature" style={{ height: 60 }} />}
          <Files requestId={r.id} canUpload />
          <Extras requestId={r.id} mode="customer" />
          {r.status === 'completed' && <Rating request={r} />}
        </div>
      ))}

      <h2>Equipment and warranties</h2>
      <Assets />
      <h2>Support</h2>
      <Tickets me={me} />
      <h2>Invoices</h2>
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
export function Manager() {
  const [reqs, reload] = useRows('requests', (t) => t.select('*, customer:profiles!requests_customer_id_fkey(full_name,phone)').order('created_at', { ascending: false }));
  const [techs] = useRows('profiles', (t) => t.select('id,full_name').eq('role', 'technician'));

  async function update(id, patch) {
    await supabase.from('requests').update(patch).eq('id', id);
    reload();
  }

  return (
    <>
      <Stats />
      <h2>All service requests</h2>
      {reqs.length === 0 && <p className="muted">No requests yet.</p>}
      {reqs.map((r) => (
        <div className="card" key={r.id}>
          <div className="row" style={{ justifyContent: 'space-between' }}><h3>{r.service_type}</h3><Badge s={r.status} /></div>
          <p>{r.description}</p>
          <p className="muted">{r.customer?.full_name} · {r.customer?.phone} · {r.address}</p>
          <Files requestId={r.id} />
          {r.signature && <img src={r.signature} alt="Customer signature" style={{ height: 60 }} />}
          <div className="row">
            <span className="muted">Scheduled for (change to reschedule)</span>
            <input type="date" style={{ width: 'auto' }} value={r.scheduled_date || ''} onChange={(e) => update(r.id, { scheduled_date: e.target.value || null })} />
          </div>
          {['new', 'assigned', 'rejected'].includes(r.status) && (
            <div className="row">
              <select value={r.technician_id || ''} onChange={(e) => update(r.id, { technician_id: e.target.value || null, status: e.target.value ? 'assigned' : 'new' })}>
                <option value="">Assign technician</option>
                {techs.map((t) => <option key={t.id} value={t.id}>{t.full_name}</option>)}
              </select>
              <button className="danger" onClick={() => update(r.id, { status: 'cancelled' })}>Cancel</button>
            </div>
          )}
        </div>
      ))}
      <h2>Technician locations</h2>
      <TechMap />
      <h2>Inventory</h2>
      <Inventory />
      <h2>Support tickets</h2>
      <Tickets staff />
      <h2>Activity log</h2>
      <Audit />
    </>
  );
}

/* ---------- TECHNICIAN ---------- */
const NEXT = { assigned: ['accepted', 'Accept job'], accepted: ['en_route', 'I am on my way'], en_route: ['in_progress', 'Start work'] };

export function Technician({ me }) {
  const [reqs, reload] = useRows('requests', (t) => t.select('*, customer:profiles!requests_customer_id_fkey(full_name,phone)').neq('status', 'cancelled').order('created_at', { ascending: false }));
  const [form, setForm] = useState({});

  async function setStatus(id, status) {
    await supabase.from('requests').update({ status }).eq('id', id);
    reload();
  }

  async function complete(r) {
    const d = form[r.id] || {};
    await supabase.from('requests').update({ status: 'completed', diagnosis: d.diagnosis, work_done: d.work_done, materials: d.materials, signature: d.signature }).eq('id', r.id);
    const { data: ex } = await supabase.from('extra_charges').select('amount').eq('request_id', r.id).eq('status', 'approved');
    const extra = (ex || []).reduce((s, x) => s + Number(x.amount), 0);
    await supabase.from('invoices').insert({ request_id: r.id, customer_id: r.customer_id, technician_id: me.id, amount: Number(d.amount || 0) + extra });
    if (d.item && d.qty) await supabase.rpc('use_item', { p_item: d.item, p_qty: Number(d.qty) });
    const until = d.warranty ? new Date(Date.now() + Number(d.warranty) * 30 * 864e5).toISOString().slice(0, 10) : null;
    await supabase.from('assets').insert({ customer_id: r.customer_id, request_id: r.id, name: r.service_type, warranty_until: until });
    reload();
  }

  const upd = (id, k) => (e) => setForm({ ...form, [id]: { ...form[id], [k]: e.target.value } });

  return (
    <>
      <ShareLocation me={me} />
      <Earnings me={me} />
      <h2>My jobs</h2>
      {reqs.length === 0 && <p className="muted">No jobs assigned to you yet.</p>}
      {reqs.map((r) => (
        <div className="card" key={r.id}>
          <div className="row" style={{ justifyContent: 'space-between' }}><h3>{r.service_type}</h3><Badge s={r.status} /></div>
          <p>{r.description}</p>
          <p className="muted">{r.customer?.full_name} · {r.address}</p>
          {r.scheduled_date && <p className="muted">Scheduled for {r.scheduled_date}</p>}
          <div className="row">
            {r.customer?.phone && <a href={`tel:${r.customer.phone}`}><button className="ghost">Call customer</button></a>}
            <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(r.address)}`} target="_blank" rel="noreferrer"><button className="ghost">Navigate</button></a>
          </div>
          <Files requestId={r.id} canUpload />
          {r.status === 'in_progress' && <Extras requestId={r.id} mode="tech" meId={me.id} />}
          {r.status === 'assigned' && <button className="danger" onClick={() => setStatus(r.id, 'rejected')}>Reject job</button>}
          {NEXT[r.status] && <button onClick={() => setStatus(r.id, NEXT[r.status][0])}>{NEXT[r.status][1]}</button>}
          {r.status === 'in_progress' && (
            <>
              <label>Diagnosis</label><textarea onChange={upd(r.id, 'diagnosis')} />
              <label>Work performed</label><textarea onChange={upd(r.id, 'work_done')} />
              <label>Materials used</label><input onChange={upd(r.id, 'materials')} />
              <ItemPicker onItem={upd(r.id, 'item')} onQty={upd(r.id, 'qty')} />
              <label>Warranty (months)</label><input type="number" min="0" onChange={upd(r.id, 'warranty')} />
              <label>Amount to charge (approved extra charges are added automatically)</label><input type="number" min="0" onChange={upd(r.id, 'amount')} />
              <label>Customer signature</label>
              <SignaturePad onChange={(v) => setForm({ ...form, [r.id]: { ...form[r.id], signature: v } })} />
              <button onClick={() => complete(r)}>Complete job</button>
            </>
          )}
        </div>
      ))}
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
