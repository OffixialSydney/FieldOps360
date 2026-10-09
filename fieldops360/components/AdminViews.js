'use client';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Platform } from './More';
import { Manager } from './Views';

const money = (n) => '₦' + Number(n || 0).toLocaleString();
const when = (d) => new Date(d).toLocaleString();

const MENU = [
  { group: 'Platform', items: [['companies', 'Companies', 'Create and manage companies'], ['users', 'Users', 'Roles, approvals and members'], ['topups', 'Wallet top-ups', 'Confirm bank and crypto transfers']] },
  { group: 'Operations', items: [['jobs', 'Jobs', 'Open, pending and active jobs'], ['dispatch', 'Dispatch', 'Technicians and live locations'], ['customers', 'Customers', 'Customer list and filters'], ['tickets', 'Support tickets', 'Follow every ticket']] },
  { group: 'Reports', items: [['analytics', 'Analytics', 'Revenue and performance'], ['history', 'History', 'Job and transaction history']] },
  { group: 'Records', items: [['stock', 'Inventory and assets', 'Stock, equipment and warranties'], ['log', 'Activity log', 'Who did what and when']] },
];

function useBadges(dep) {
  const [b, setB] = useState({ users: 0, topups: 0 });
  useEffect(() => {
    const load = async () => {
      const u = await supabase.from('profiles').select('id', { count: 'exact', head: true }).not('requested_role', 'is', null).eq('role', 'customer');
      const t = await supabase.from('wallet_topups').select('id', { count: 'exact', head: true }).eq('status', 'pending').not('proof_path', 'is', null);
      setB({ users: u.count || 0, topups: t.count || 0 });
    };
    load();
    const i = setInterval(load, 30000);
    return () => clearInterval(i);
  }, [dep]);
  return b;
}

/* Transaction history: wallet top-ups, wallet ledger and invoice payments */
function TransactionHistory() {
  const [tab, setTab] = useState('topups');
  const [rows, setRows] = useState(null);
  useEffect(() => {
    setRows(null);
    (async () => {
      let r;
      if (tab === 'topups') {
        r = await supabase.from('wallet_topups').select('*, customer:profiles!wallet_topups_customer_id_fkey(full_name)').neq('status', 'pending').order('created_at', { ascending: false }).limit(100);
      } else if (tab === 'ledger') {
        r = await supabase.from('wallet_transactions').select('*, customer:profiles!wallet_transactions_customer_id_fkey(full_name)').order('id', { ascending: false }).limit(100);
      } else {
        r = await supabase.from('payments').select('*, invoice:invoices(invoice_no, customer:profiles!invoices_customer_id_fkey(full_name))').order('created_at', { ascending: false }).limit(100);
      }
      setRows(r.data || []);
    })();
  }, [tab]);

  return (
    <>
      <h2>Transaction history</h2>
      <div className="row" style={{ marginBottom: 12 }}>
        {[['topups', 'Wallet top-ups'], ['ledger', 'Wallet ledger'], ['payments', 'Invoice payments']].map(([k, label]) => (
          <button key={k} className={tab === k ? '' : 'ghost'} style={{ marginTop: 0 }} onClick={() => setTab(k)}>{label}</button>
        ))}
      </div>
      {!rows && <p className="muted">Loading...</p>}
      {rows && rows.length === 0 && <div className="card" style={{ textAlign: 'center' }}><p className="muted">No transactions yet.</p></div>}
      {rows && tab === 'topups' && rows.map((t) => (
        <div className="card row" key={t.id} style={{ justifyContent: 'space-between' }}>
          <span>{t.customer?.full_name} · <b>{money(t.amount)}</b><br /><span className="muted">{t.provider === 'paystack' ? 'Paystack' : t.provider === 'bank' ? 'Bank transfer' : 'Bitcoin'} · {t.reference} · {when(t.confirmed_at || t.created_at)}</span></span>
          <span className="badge">{t.status === 'success' ? 'Added' : 'Rejected'}</span>
        </div>
      ))}
      {rows && tab === 'ledger' && rows.map((t) => (
        <div className="card row" key={t.id} style={{ justifyContent: 'space-between' }}>
          <span>{t.customer?.full_name} · <b>{t.amount > 0 ? '+' : ''}{money(t.amount)}</b><br /><span className="muted">{t.type} · {t.note || ''} · balance {money(t.balance)} · {when(t.created_at)}</span></span>
          <span className="badge">{t.type}</span>
        </div>
      ))}
      {rows && tab === 'payments' && rows.map((p) => (
        <div className="card row" key={p.id} style={{ justifyContent: 'space-between' }}>
          <span>{p.invoice?.customer?.full_name} · <b>{money(p.amount)}</b><br /><span className="muted">{p.invoice?.invoice_no} · {p.reference} · {when(p.created_at)}</span></span>
          <span className="badge">{p.status}</span>
        </div>
      ))}
    </>
  );
}

/* Super admin: a clean menu, and each section opens only when chosen */
export default function SuperAdmin({ me }) {
  const [sec, setSec] = useState('');
  const [hist, setHist] = useState('jobs');
  const badges = useBadges(sec);

  if (!sec) {
    return (
      <>
        <h2>Admin menu</h2>
        <p className="muted">Choose what you want to open.</p>
        {MENU.map((g) => (
          <div key={g.group}>
            <h3 style={{ margin: '16px 0 8px' }}>{g.group}</h3>
            <div className="methods">
              {g.items.map(([k, label, hint]) => (
                <button key={k} type="button" className="method" onClick={() => setSec(k)}>
                  <b>{label}{badges[k] ? ` (${badges[k]} waiting)` : ''}</b><span>{hint}</span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </>
    );
  }

  const view = { jobs: 'live', dispatch: 'dispatch', customers: 'customers', tickets: 'tickets', analytics: 'analytics', stock: 'stock', log: 'log' }[sec];
  return (
    <>
      <button type="button" className="ghost" onClick={() => setSec('')}>Back to menu</button>
      {['companies', 'users', 'topups'].includes(sec) && <Platform show={sec} />}
      {view && <Manager key={sec} readOnly me={me} only={view} />}
      {sec === 'history' && (
        <>
          <div className="row" style={{ margin: '12px 0' }}>
            {[['jobs', 'Job history'], ['transactions', 'Transaction history']].map(([k, label]) => (
              <button key={k} className={hist === k ? '' : 'ghost'} style={{ marginTop: 0 }} onClick={() => setHist(k)}>{label}</button>
            ))}
          </div>
          {hist === 'jobs' ? <Manager key="jobhistory" readOnly me={me} only="jobhistory" /> : <TransactionHistory />}
        </>
      )}
    </>
  );
}
