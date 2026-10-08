'use client';
import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';

export default function Callback() {
  const [state, setState] = useState({ status: 'checking', message: '' });

  useEffect(() => {
    let stop = false;
    (async () => {
      const q = new URLSearchParams(window.location.search);
      const reference = q.get('reference') || q.get('trxref');
      if (!reference) return setState({ status: 'failed', message: 'No payment reference was found.' });
      for (let i = 0; i < 6 && !stop; i += 1) {
        const { data } = await supabase.auth.getSession();
        if (!data.session) { window.location.href = '/'; return; }
        const res = await fetch(`/api/paystack/verify?reference=${encodeURIComponent(reference)}`, { headers: { Authorization: `Bearer ${data.session.access_token}` } });
        const j = await res.json().catch(() => ({}));
        if (j.status === 'success') {
          setState({ status: 'success', amount: j.amount });
          setTimeout(() => { window.location.href = '/dashboard'; }, 3000);
          return;
        }
        if (j.status === 'failed' || j.error) return setState({ status: 'failed', message: j.message || j.error || 'The payment was not completed.' });
        setState({ status: 'checking', message: j.message || '' });
        await new Promise((r) => setTimeout(r, 3000));
      }
      if (!stop) setState({ status: 'pending', message: 'We have not received the confirmation yet.' });
    })();
    return () => { stop = true; };
  }, []);

  return (
    <div className="auth">
      <div className="card" style={{ textAlign: 'center' }}>
        {state.status === 'checking' && <><h2>Confirming your payment</h2><p className="muted">Please wait. Do not close this page.</p></>}
        {state.status === 'success' && <><h2>Payment successful</h2><p>₦{Number(state.amount).toLocaleString()} was added to your wallet.</p><p className="muted">Taking you back to your dashboard...</p></>}
        {state.status === 'pending' && <><h2>Still waiting</h2><p className="muted">{state.message} If you were charged, the money is added automatically within a few minutes.</p></>}
        {state.status === 'failed' && <><h2>Payment not completed</h2><p className="err">{state.message}</p></>}
        <a href="/dashboard"><button>Back to dashboard</button></a>
      </div>
    </div>
  );
}
