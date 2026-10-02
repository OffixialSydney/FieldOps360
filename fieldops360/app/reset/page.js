'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';

export default function Reset() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [pw, setPw] = useState('');
  const [msg, setMsg] = useState('');

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setReady(!!data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') setReady(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  async function submit(e) {
    e.preventDefault();
    const { error } = await supabase.auth.updateUser({ password: pw });
    if (error) return setMsg(error.message);
    await supabase.auth.signOut();
    router.push('/');
  }

  return (
    <div className="auth">
      <h1>Set a new password</h1>
      {!ready ? (
        <p className="muted">Open this page from the link in your password reset email.</p>
      ) : (
        <form className="card" onSubmit={submit}>
          <label>New password</label>
          <input type="password" minLength={6} required value={pw} onChange={(e) => setPw(e.target.value)} />
          {msg && <p className="err">{msg}</p>}
          <button style={{ width: '100%' }}>Update password</button>
        </form>
      )}
    </div>
  );
}
