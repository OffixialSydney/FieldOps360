'use client';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const money = (n) => '₦' + Number(n || 0).toLocaleString();
const date = (d) => (d ? new Date(d).toLocaleDateString() : '-');
const TITLES = { invoice: 'Invoice', receipt: 'Payment Receipt', completion: 'Job Completion Report', service: 'Service Report', warranty: 'Warranty Certificate' };
const SELECT = {
  request: '*, customer:profiles!requests_customer_id_fkey(full_name,phone,email), tech:profiles!requests_technician_id_fkey(full_name)',
};

async function companyName(id) {
  if (!id) return 'FieldOps 360';
  const { data } = await supabase.from('companies').select('name').eq('id', id).maybeSingle();
  return data?.name || 'FieldOps 360';
}

async function load(type, id) {
  if (type === 'completion' || type === 'service') {
    const { data: r } = await supabase.from('requests').select(SELECT.request).eq('id', id).single();
    const [d, m, h, i] = await Promise.all([
      supabase.from('diagnoses').select('*').eq('request_id', id).maybeSingle(),
      supabase.from('job_materials').select('*').eq('request_id', id).order('created_at'),
      supabase.from('job_status_history').select('*').eq('request_id', id).order('created_at'),
      supabase.from('invoices').select('invoice_no,amount,status').eq('request_id', id).eq('kind', 'final').maybeSingle(),
    ]);
    return { r, diag: d.data, mats: m.data || [], hist: h.data || [], inv: i.data, company: await companyName(r?.company_id) };
  }
  if (type === 'invoice') {
    const { data: inv } = await supabase.from('invoices').select('*, customer:profiles!invoices_customer_id_fkey(full_name,phone,email), job:requests(request_no,service_type,address)').eq('id', id).single();
    const { data: pays } = await supabase.from('payments').select('*').eq('invoice_id', id).eq('status', 'confirmed').order('created_at');
    return { inv, pays: pays || [], company: await companyName(inv?.company_id) };
  }
  if (type === 'receipt') {
    const { data: pay } = await supabase.from('payments').select('*').eq('id', id).single();
    const { data: inv } = await supabase.from('invoices').select('*, customer:profiles!invoices_customer_id_fkey(full_name,email), job:requests(request_no,service_type)').eq('id', pay.invoice_id).single();
    return { pay, inv, company: await companyName(pay.company_id) };
  }
  const { data: a } = await supabase.from('assets').select('*, customer:profiles!assets_customer_id_fkey(full_name), tech:profiles!assets_technician_id_fkey(full_name)').eq('id', id).single();
  return { a, company: await companyName(a?.company_id) };
}

const Row = ({ k, v }) => (
  <tr><td style={{ padding: '4px 8px 4px 0', color: '#667085', whiteSpace: 'nowrap', verticalAlign: 'top' }}>{k}</td><td style={{ padding: '4px 0' }}>{v || '-'}</td></tr>
);
const H = ({ children }) => <h3 style={{ margin: '16px 0 6px', borderBottom: '1px solid #e4e7ec', paddingBottom: 4 }}>{children}</h3>;

function Body({ type, d }) {
  if (type === 'completion' || type === 'service') {
    const { r, diag, mats, hist, inv } = d;
    const total = mats.reduce((s, m) => s + m.qty * m.unit_price, 0);
    return (
      <>
        <table><tbody>
          <Row k="Job number" v={r.request_no} /><Row k="Service" v={r.service_type} /><Row k="Customer" v={`${r.customer?.full_name || ''} ${r.customer?.phone || ''}`} />
          <Row k="Address" v={r.address} /><Row k="Technician" v={r.tech?.full_name} /><Row k="Status" v={r.status.replace('_', ' ')} /><Row k="Requested" v={date(r.created_at)} />
        </tbody></table>
        {diag && (<><H>Diagnosis</H><table><tbody>
          <Row k="Problem" v={diag.problem} /><Row k="Cause" v={diag.cause} /><Row k="Solution" v={diag.solution} /><Row k="Notes" v={diag.notes} />
        </tbody></table></>)}
        {r.work_done && (<><H>Work performed</H><p>{r.work_done}</p></>)}
        {mats.length > 0 && (<><H>Materials used</H>
          {mats.map((m) => <p key={m.id} style={{ margin: '2px 0' }}>{m.name}: {m.qty} {m.unit} × {money(m.unit_price)} = {money(m.qty * m.unit_price)}</p>)}
          <p><b>Materials total {money(total)}</b></p></>)}
        {type === 'service' && r.tech_notes && (<><H>Technician notes</H><p>{r.tech_notes}</p></>)}
        {type === 'completion' && (<>
          <H>Timeline</H>
          {hist.map((h) => <p key={h.id} style={{ margin: '2px 0' }}>{new Date(h.created_at).toLocaleString()}: {h.status.replace('_', ' ')}</p>)}
          {inv && <p>Invoice {inv.invoice_no}: {money(inv.amount)} ({inv.status.replace('_', ' ')})</p>}
          <H>Customer confirmation</H>
          {r.signature ? <img src={r.signature} alt="Customer signature" style={{ height: 70 }} /> : <p>No signature captured.</p>}
        </>)}
      </>
    );
  }
  if (type === 'invoice') {
    const { inv, pays } = d;
    const lines = inv.items?.length ? inv.items : [{ label: 'Service', qty: 1, unit_price: inv.amount }];
    return (
      <>
        <table><tbody>
          <Row k="Invoice number" v={inv.invoice_no} /><Row k="Date" v={date(inv.created_at)} /><Row k="Due date" v={date(inv.due_date)} />
          <Row k="Job" v={`${inv.job?.request_no || ''} ${inv.job?.service_type || ''}`} /><Row k="Bill to" v={inv.customer?.full_name} />
          <Row k="Contact" v={`${inv.customer?.phone || ''} ${inv.customer?.email || ''}`} /><Row k="Payment status" v={inv.status.replace('_', ' ').toUpperCase()} />
        </tbody></table>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 12 }}>
          <thead><tr style={{ textAlign: 'left', borderBottom: '1px solid #1c2430' }}><th>Item</th><th>Qty</th><th>Price</th><th style={{ textAlign: 'right' }}>Total</th></tr></thead>
          <tbody>{lines.map((l, i) => <tr key={i}><td>{l.label}</td><td>{l.qty}</td><td>{money(l.unit_price)}</td><td style={{ textAlign: 'right' }}>{money(l.qty * l.unit_price)}</td></tr>)}</tbody>
        </table>
        <p style={{ textAlign: 'right' }}>
          Subtotal {money(inv.subtotal || inv.amount)}<br />
          {Number(inv.discount) > 0 && <>Discount -{money(inv.discount)}<br /></>}
          {Number(inv.tax) > 0 && <>Tax {money(inv.tax)}<br /></>}
          <b style={{ fontSize: 18 }}>TOTAL {money(inv.amount)}</b><br />
          Paid {money(inv.paid_amount)} · Balance {money(Number(inv.amount) - Number(inv.paid_amount))}
        </p>
        {pays.length > 0 && (<><H>Payments received</H>{pays.map((p) => <p key={p.id} style={{ margin: '2px 0' }}>{date(p.created_at)}: {money(p.amount)} ({p.reference})</p>)}</>)}
      </>
    );
  }
  if (type === 'receipt') {
    const { pay, inv } = d;
    return (
      <table><tbody>
        <Row k="Receipt reference" v={pay.reference} /><Row k="Date" v={new Date(pay.created_at).toLocaleString()} />
        <Row k="Received from" v={inv?.customer?.full_name} /><Row k="For invoice" v={inv?.invoice_no} /><Row k="Job" v={`${inv?.job?.request_no || ''} ${inv?.job?.service_type || ''}`} />
        <Row k="Method" v={pay.method === 'card_test' ? 'Card (test mode)' : pay.method === 'wallet' ? 'Wallet' : 'Bank transfer'} />
        <Row k="Amount received" v={<b style={{ fontSize: 18 }}>{money(pay.amount)}</b>} />
        <Row k="Invoice balance" v={money(Number(inv?.amount) - Number(inv?.paid_amount))} />
      </tbody></table>
    );
  }
  const { a } = d;
  return (
    <>
      <p>This certifies that the equipment below is covered by a warranty from the date of installation.</p>
      <table><tbody>
        <Row k="Equipment" v={a.name} /><Row k="Serial number" v={a.serial_number} /><Row k="Customer" v={a.customer?.full_name} />
        <Row k="Installed by" v={a.tech?.full_name} /><Row k="Installation date" v={date(a.installation_date)} />
        <Row k="Warranty period" v={a.warranty_months ? `${a.warranty_months} months` : '-'} /><Row k="Warranty starts" v={date(a.warranty_start)} />
        <Row k="Warranty expires" v={<b>{date(a.warranty_until)}</b>} />
      </tbody></table>
      <p style={{ marginTop: 16, color: '#667085' }}>Terms and conditions of the warranty are as agreed with the company.</p>
    </>
  );
}

function Viewer({ type, id, onClose }) {
  const [d, setD] = useState(null);
  const [err, setErr] = useState('');
  useEffect(() => { load(type, id).then(setD).catch((e) => setErr(e.message || 'Could not load this document.')); }, [type, id]);
  return (
    <div className="doc-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', zIndex: 30, overflow: 'auto', padding: 12 }}>
      <div className="row no-print" style={{ maxWidth: 760, margin: '0 auto 8px' }}>
        <button onClick={() => window.print()}>Print or save as PDF</button>
        <button className="ghost" style={{ background: '#fff' }} onClick={onClose}>Close</button>
      </div>
      <div id="print-area" style={{ background: '#fff', color: '#1c2430', maxWidth: 760, margin: '0 auto', padding: 24, borderRadius: 8 }}>
        {err && <p className="err">{err}</p>}
        {!d && !err && <p>Loading document...</p>}
        {d && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #0f766e', paddingBottom: 8, marginBottom: 12 }}>
              <div><div style={{ fontSize: 20, fontWeight: 700 }}>{d.company}</div><div style={{ color: '#667085', fontSize: 13 }}>Powered by FieldOps 360</div></div>
              <div style={{ textAlign: 'right' }}><div style={{ fontSize: 18, fontWeight: 600 }}>{TITLES[type]}</div><div style={{ color: '#667085', fontSize: 13 }}>Issued {new Date().toLocaleDateString()}</div></div>
            </div>
            <Body type={type} d={d} />
          </>
        )}
      </div>
    </div>
  );
}

export function DocButton({ type, id, label }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" className="ghost" onClick={() => setOpen(true)}>{label || TITLES[type]}</button>
      {open && <Viewer type={type} id={id} onClose={() => setOpen(false)} />}
    </>
  );
}
