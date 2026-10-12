'use client';
import { useState } from 'react';
import { supabase } from '../lib/supabase';

export default function Assistant({ me }) {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState([]);
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [proposal, setProposal] = useState(null);
  const [addr, setAddr] = useState('');
  const [note, setNote] = useState('');

  async function send(e) {
    e.preventDefault();
    if (!text.trim() || busy) return;
    const next = [...msgs, { role: 'user', content: text }];
    setMsgs(next);
    setText('');
    setBusy(true);
    setProposal(null);
    setNote('');

    try {
      const { data } = await supabase.auth.getSession();
      const token = data?.session?.access_token;
      
      const res = await fetch('/api/assistant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token || ''}`,
        },
        body: JSON.stringify({ messages: next }),
      });

      const j = await res.json().catch(() => ({}));

      if (!res.ok) {
        setMsgs([...next, { role: 'assistant', content: j.error || j.reply || 'The assistant service is temporarily busy. Please try again.' }]);
      } else {
        setMsgs([...next, { role: 'assistant', content: j.reply || j.error || 'No response.' }]);
        if (j.request && me.role === 'customer') setProposal(j.request);
      }
    } catch (err) {
      setMsgs([...next, { role: 'assistant', content: 'Connection issue. Please verify your internet or try again.' }]);
    }
    setBusy(false);
  }

  async function createRequest() {
    if (!addr.trim()) return setNote('Please enter the address first.');
    const { data, error } = await supabase.from('requests').insert({
      service_type: proposal.service_type,
      priority: proposal.priority || 'normal',
      description: proposal.description,
      address: addr,
      customer_id: me.id,
    }).select().single();
    if (error) return setNote(error.message);
    setNote(`Request ${data.request_no} created.`);
    setProposal(null);
    setAddr('');
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        style={{
          position: 'fixed',
          right: 18,
          bottom: 18,
          zIndex: 45,
          borderRadius: 99,
          padding: '12px 20px',
          boxShadow: '0 6px 20px rgba(37, 99, 235, 0.35)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        <span>🤖</span>
        <span>Ask Assistant</span>
      </button>
    );
  }

  return (
    <div
      className="card"
      style={{
        position: 'fixed',
        right: 16,
        bottom: 16,
        left: 16,
        maxWidth: 400,
        marginLeft: 'auto',
        zIndex: 50,
        maxHeight: '75vh',
        overflow: 'auto',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.25)',
      }}
    >
      <div className="row" style={{ justifyContent: 'space-between', borderBottom: '1px solid var(--line)', paddingBottom: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>🤖</span>
          <h3 style={{ margin: 0 }}>FieldOps Assistant</h3>
        </div>
        <button className="ghost" style={{ marginTop: 0, padding: '4px 10px', fontSize: '13px' }} onClick={() => setOpen(false)}>
          ✕
        </button>
      </div>

      {msgs.length === 0 && (
        <p className="muted" style={{ fontSize: '13px', marginTop: '12px' }}>
          Ask about your active jobs, invoices, inventory stock, or service procedures. Answers are retrieved directly from your platform database.
        </p>
      )}

      <div style={{ marginTop: '12px' }}>
        {msgs.map((m, i) => (
          <p key={i} style={{ margin: '8px 0', textAlign: m.role === 'user' ? 'right' : 'left', whiteSpace: 'pre-wrap' }}>
            <span
              style={{
                background: m.role === 'user' ? 'var(--accent)' : 'var(--line)',
                color: m.role === 'user' ? '#fff' : 'inherit',
                padding: '8px 12px',
                borderRadius: '10px',
                display: 'inline-block',
                textAlign: 'left',
                fontSize: '13px',
                maxWidth: '85%',
              }}
            >
              {m.content}
            </span>
          </p>
        ))}
      </div>

      {busy && <p className="muted" style={{ fontSize: '13px' }}>Assistant is querying your operational data...</p>}

      {proposal && (
        <div className="card" style={{ background: 'var(--bg)', marginTop: '12px' }}>
          <b>Create this service request?</b>
          <p className="muted" style={{ fontSize: '13px' }}>
            {proposal.service_type} · {String(proposal.priority || 'normal').toUpperCase()}
            <br />
            {proposal.description}
          </p>
          <input placeholder="Your address" value={addr} onChange={(e) => setAddr(e.target.value)} />
          <button style={{ width: '100%', marginTop: '8px' }} onClick={createRequest}>
            Confirm Request
          </button>
        </div>
      )}

      {note && <p className="muted" style={{ fontSize: '13px' }}>{note}</p>}

      <form onSubmit={send} style={{ marginTop: '14px', display: 'flex', gap: '8px' }}>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a question..."
          style={{ flex: 1, margin: 0 }}
        />
        <button disabled={busy} style={{ margin: 0 }}>
          Send
        </button>
      </form>
    </div>
  );
}
