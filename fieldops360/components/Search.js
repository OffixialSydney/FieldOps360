'use client';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const clean = (s) => s.replace(/[,()%*\\]/g, ' ').trim();

export default function Search() {
  const [q, setQ] = useState('');
  const [res, setRes] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const term = clean(q);
    if (term.length < 2) { setRes(null); return undefined; }
    setBusy(true);
    const t = setTimeout(async () => {
      const like = `%${term}%`;
      const [jobs, invs, assets, tickets, people] = await Promise.all([
        supabase.from('requests').select('id,request_no,service_type,address,status').or(`request_no.ilike.${like},service_type.ilike.${like},address.ilike.${like},description.ilike.${like}`).limit(5),
        supabase.from('invoices').select('id,invoice_no,amount,status').ilike('invoice_no', like).limit(5),
        supabase.from('assets').select('id,name,serial_number').or(`name.ilike.${like},serial_number.ilike.${like}`).limit(5),
        supabase.from('tickets').select('id,ticket_no,subject,status').or(`ticket_no.ilike.${like},subject.ilike.${like}`).limit(5),
        supabase.from('profiles').select('id,full_name,role,phone,email').or(`full_name.ilike.${like},email.ilike.${like},phone.ilike.${like}`).limit(8),
      ]);
      setRes({
        Jobs: (jobs.data || []).map((x) => ({ key: x.id, title: `${x.request_no} · ${x.service_type}`, sub: `${x.status.replace('_', ' ')} · ${x.address || ''}`, anchor: x.request_no })),
        Invoices: (invs.data || []).map((x) => ({ key: x.id, title: x.invoice_no, sub: `₦${Number(x.amount).toLocaleString()} · ${x.status.replace('_', ' ')}` })),
        Assets: (assets.data || []).map((x) => ({ key: x.id, title: x.name, sub: x.serial_number || '' })),
        Tickets: (tickets.data || []).map((x) => ({ key: x.id, title: `${x.ticket_no || ''} ${x.subject}`, sub: x.status.replace('_', ' ') })),
        Customers: (people.data || []).filter((x) => x.role === 'customer').map((x) => ({ key: x.id, title: x.full_name, sub: `${x.phone || ''} ${x.email || ''}` })),
        Technicians: (people.data || []).filter((x) => x.role === 'technician').map((x) => ({ key: x.id, title: x.full_name, sub: `${x.phone || ''} ${x.email || ''}` })),
      });
      setBusy(false);
    }, 300);
    return () => clearTimeout(t);
  }, [q]);

  function go(anchor) {
    if (!anchor) return;
    const el = document.getElementById(anchor);
    if (!el) return;
    setRes(null);
    setQ('');
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    el.style.outline = '2px solid var(--accent)';
    setTimeout(() => { el.style.outline = ''; }, 2500);
  }

  const groups = res ? Object.entries(res).filter(([, list]) => list.length) : [];
  return (
    <div style={{ marginBottom: 12 }}>
      <input type="search" placeholder="Search jobs, invoices, equipment, tickets, people" value={q} onChange={(e) => setQ(e.target.value)} />
      {busy && <p className="muted">Searching...</p>}
      {res && !busy && groups.length === 0 && <p className="muted">Nothing found for "{q}".</p>}
      {groups.length > 0 && (
        <div className="card" style={{ marginTop: 6, maxHeight: '50vh', overflow: 'auto' }}>
          {groups.map(([name, list]) => (
            <div key={name}>
              <h3>{name}</h3>
              {list.map((x) => (
                <p key={x.key} onClick={() => go(x.anchor)} style={{ margin: '6px 0', cursor: x.anchor ? 'pointer' : 'default' }}>
                  {x.title}<br /><span className="muted">{x.sub}</span>
                </p>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}