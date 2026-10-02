'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../lib/supabase';

export default function Login() {
  const router = useRouter();
  const [mode, setMode] = useState('login');
  const [f, setF] = useState({ email: '', password: '', full_name: '', phone: '', company_id: '', requested_role: 'customer' });
  const [msg, setMsg] = useState('');
  const [checking, setChecking] = useState(true);
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) router.replace('/dashboard');
      else setChecking(false);
    });
  }, [router]);
  const [companies, setCompanies] = useState([]);
  useEffect(() => {
    supabase.from('companies').select('id,name').eq('status', 'active').then(({ data }) => setCompanies(data || []));
  }, []);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    setMsg('');
    const { error } =
      mode === 'login'
        ? await supabase.auth.signInWithPassword({ email: f.email, password: f.password })
        : await supabase.auth.signUp({
            email: f.email,
            password: f.password,
            options: { data: { full_name: f.full_name, phone: f.phone, company_id: f.company_id || null, requested_role: f.requested_role } },
          });
    if (error) return setMsg(error.message);
    router.push('/dashboard');
  }

  async function forgot() {
    if (!f.email) return setMsg('Enter your email first');
    const { error } = await supabase.auth.resetPasswordForEmail(f.email, { redirectTo: `${window.location.origin}/reset` });
    setMsg(error ? error.message : 'Password reset link sent. Check your email.');
  }

  if (checking) return null;

  return (
    <div className="auth">
      <h1>FieldOps 360</h1>
      <p className="muted">{mode === 'login' ? 'Log in to your account' : 'Create a customer account'}</p>
      <form className="card" onSubmit={submit}>
        {mode === 'signup' && (
          <>
            <label>Full name</label>
            <input required value={f.full_name} onChange={set('full_name')} />
            <label>Phone</label>
            <input value={f.phone} onChange={set('phone')} />
            <label>I am signing up as</label>
            <select value={f.requested_role} onChange={set('requested_role')}>
              <option value="customer">Customer</option>
              <option value="technician">Technician (needs approval)</option>
              <option value="manager">Manager (needs approval)</option>
              <option value="accountant">Accountant (needs approval)</option>
            </select>
            <label>Company</label>
            <select required value={f.company_id} onChange={set('company_id')}>
              <option value="">Select company</option>
              {companies.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </>
        )}
        <label>Email</label>
        <input type="email" required value={f.email} onChange={set('email')} />
        <label>Password</label>
        <input type="password" minLength={6} required value={f.password} onChange={set('password')} />
        {msg && <p className="err">{msg}</p>}
        <button style={{ width: '100%' }}>{mode === 'login' ? 'Log in' : 'Sign up'}</button>
        {mode === 'login' && <button type="button" className="ghost" style={{ width: '100%' }} onClick={forgot}>Forgot password?</button>}
      </form>
      <button className="ghost" onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}>
        {mode === 'login' ? 'New customer? Sign up' : 'Have an account? Log in'}
      </button>
    </div>
  );
}
