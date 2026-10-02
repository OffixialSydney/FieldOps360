'use client';
import { useState } from 'react';
import { supabase } from '../lib/supabase';

export default function ProfileForm({ me, onClose, onSaved }) {
  const [f, setF] = useState({ full_name: me.full_name || '', phone: me.phone || '' });
  const [pw, setPw] = useState('');
  const [msg, setMsg] = useState('');

  async function save(e) {
    e.preventDefault();
    const { data, error } = await supabase.from('profiles').update(f).eq('id', me.id).select();
    if (error || !data?.length) return setMsg(error?.message || 'Could not save. Log out and log in again, then retry.');
    setMsg('Profile saved');
    onSaved({ ...me, ...f });
  }
  async function changePw(e) {
    e.preventDefault();
    let { data: s } = await supabase.auth.getSession();
    if (!s.session) {
      const r = await supabase.auth.refreshSession();
      s = r.data;
    }
    if (!s.session) return setMsg('Your login expired or was changed in another tab. Log out, log in again, then retry.');
    const { error } = await supabase.auth.updateUser({ password: pw });
    setMsg(error ? error.message : 'Password updated');
    if (!error) setPw('');
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, zIndex: 20, overflow: 'auto' }}>
      <div className="card" style={{ maxWidth: 380, width: '100%', marginBottom: 0 }}>
        <h3>My profile</h3>
        <p className="muted">{me.email}</p>
        <form onSubmit={save}>
          <label>Full name</label>
          <input required value={f.full_name} onChange={(e) => setF({ ...f, full_name: e.target.value })} />
          <label>Phone</label>
          <input value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} />
          <button>Save profile</button>
        </form>
        <form onSubmit={changePw}>
          <label>New password</label>
          <input type="password" minLength={6} required value={pw} onChange={(e) => setPw(e.target.value)} />
          <button>Update password</button>
        </form>
        {msg && <p className="muted">{msg}</p>}
        <button className="ghost" onClick={onClose}>Close</button>
      </div>
    </div>
  );
}