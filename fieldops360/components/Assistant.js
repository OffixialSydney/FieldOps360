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
    const { data } = await supabase.auth.getSession();
    try {
      const res = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${data.session?.access_token}` },
        body: JSON.stringify({ messages: next }),
      });
      const j = await res.json();
      setMsgs([...next, { role: 'assistant', content: j.reply || j.error || 'No answer.' }]);
      if (j.request && me.role === 'customer') setProposal(j.request);
    } catch (err) {
      setMsgs([...next, { role: 'assistant', content: 'Something went wrong. Please try again.' }]);
    }
    setBusy(false);
  }

  async function createRequest() {
    if (!addr.trim()) return setNote('Please enter the address first.');
    const { data, error } = await supabase.from('requests').insert({
      service_type: proposal.service_type, priority: proposal.priority || 'normal',
      description: proposal.description, address: addr, customer_id: me.id,
    }).select().single();
    if (error) return setNote(error.message);
    setNote(`Request ${data.request_no} created.`);
    setProposal(null);
    setAddr('');
  }

  if (!open) {
    return <button onClick={() => setOpen(true)} style={{ position: 'fixed', right: 12, bottom: 12, zIndex: 15, borderRadius: 99 }}>Ask the assistant</button>;
  }
  return (
    <div className="card" style={{ position: 'fixed', right: 8, bottom: 8, left: 8, maxWidth: 380, marginLeft: 'auto', zIndex: 15, maxHeight: '75vh', overflow: 'auto' }}>
      <div className="row" style={{ justifyContent: 'space-between' }}>
        <h3>Assistant</h3>
        <button className="ghost" style={{ marginTop: 0 }} onClick={() => setOpen(false)}>Close</button>
      </div>
      {msgs.length === 0 && <p className="muted">Ask about your jobs, revenue, stock or a problem you are having. Answers about your data come from the platform, never guesses.</p>}
      {msgs.map((m, i) => (
        <p key={i} style={{ margin: '8px 0', textAlign: m.role === 'user' ? 'right' : 'left', whiteSpace: 'pre-wrap' }}>
          <span className="badge" style={{ background: m.role === 'user' ? '#e6f4f1' : '#f2f4f7', color: 'inherit', padding: '6px 10px', borderRadius: 8, display: 'inline-block', textAlign: 'left' }}>{m.content}</span>
        </p>
      ))}
      {busy && <p className="muted">Thinking...</p>}
      {proposal && (
        <div className="card">
          <b>Create this request?</b>
          <p className="muted">{proposal.service_type} · {String(proposal.priority || 'normal').toUpperCase()}<br />{proposal.description}</p>
          <input placeholder="Your address" value={addr} onChange={(e) => setAddr(e.target.value)} />
          <button onClick={createRequest}>Create request</button>
        </div>
      )}
      {note && <p className="muted">{note}</p>}
      <form onSubmit={send}>
        <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Type your question" />
        <button disabled={busy}>Send</button>
      </form>
    </div>
  );
}
