'use client';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '../../lib/supabase';

function AuthContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialMode = searchParams.get('mode') === 'signup' ? 'signup' : 'login';

  const [mode, setMode] = useState(initialMode);
  const [f, setF] = useState({
    email: '',
    password: '',
    full_name: '',
    phone: '',
    company_id: '',
    requested_role: 'customer',
  });
  const [msg, setMsg] = useState('');
  const [checking, setChecking] = useState(true);
  const [companies, setCompanies] = useState([]);

  useEffect(() => {
    const requested = searchParams.get('mode');
    if (requested === 'signup' || requested === 'login') {
      setMode(requested);
    }
  }, [searchParams]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) router.replace('/dashboard');
      else setChecking(false);
    });
  }, [router]);

  useEffect(() => {
    supabase
      .from('companies')
      .select('id,name')
      .eq('status', 'active')
      .then(({ data }) => setCompanies(data || []));
  }, [mode]);

  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    setMsg('');
    const { error } =
      mode === 'login'
        ? await supabase.auth.signInWithPassword({
            email: f.email,
            password: f.password,
          })
        : await supabase.auth.signUp({
            email: f.email,
            password: f.password,
            options: {
              data: {
                full_name: f.full_name,
                phone: f.phone,
                company_id: f.requested_role === 'customer' ? null : f.company_id || null,
                requested_role: f.requested_role,
              },
            },
          });
    if (error) return setMsg(error.message);
    router.push('/dashboard');
  }

  async function forgot() {
    if (!f.email) return setMsg('Enter your email first');
    setMsg('Sending reset link...');
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(f.email, {
        redirectTo: `${window.location.origin}/reset`,
      });
      setMsg(error ? error.message : 'Reset link sent. Check your inbox and spam folder.');
    } catch (e) {
      setMsg('Could not send the email. Please try again.');
    }
  }

  if (checking) return null;

  return (
    <div className="auth">
      <div style={{ marginBottom: '16px' }}>
        <Link href="/" className="back-link">
          ← Back to FieldOps 360 Home
        </Link>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
        <div className="brand-badge-icon">⚡</div>
        <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 800 }}>FieldOps 360</h1>
      </div>

      <p className="muted" style={{ marginBottom: '20px' }}>
        {mode === 'login'
          ? 'Sign in to access your dispatch dashboard and service portal.'
          : 'Create your account to start managing or requesting field operations.'}
      </p>

      {/* Mode toggle tabs */}
      <div className="auth-tabs">
        <button
          type="button"
          className={`auth-tab ${mode === 'login' ? 'active' : ''}`}
          onClick={() => {
            setMode('login');
            setMsg('');
          }}
        >
          Sign In
        </button>
        <button
          type="button"
          className={`auth-tab ${mode === 'signup' ? 'active' : ''}`}
          onClick={() => {
            setMode('signup');
            setMsg('');
          }}
        >
          Sign Up
        </button>
      </div>

      <form className="card" onSubmit={submit}>
        {mode === 'signup' && (
          <>
            <label>Full name</label>
            <input
              required
              placeholder="e.g. Alex Morgan"
              value={f.full_name}
              onChange={set('full_name')}
            />

            <label>Phone number</label>
            <input
              placeholder="+1 (555) 000-0000"
              value={f.phone}
              onChange={set('phone')}
            />

            <label>I am signing up as</label>
            <select value={f.requested_role} onChange={set('requested_role')}>
              <option value="customer">Customer (Request services & track jobs)</option>
              <option value="technician">Technician (Field crew - requires approval)</option>
              <option value="manager">Operations Manager (Requires approval)</option>
              <option value="accountant">Finance / Accountant (Requires approval)</option>
            </select>

            {f.requested_role !== 'customer' && (
              <>
                <label>Company</label>
                <select required value={f.company_id} onChange={set('company_id')}>
                  <option value="">Select your company</option>
                  {companies.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </>
            )}
          </>
        )}

        <label>Work Email</label>
        <input
          type="email"
          required
          placeholder="name@company.com"
          value={f.email}
          onChange={set('email')}
        />

        <label>Password</label>
        <input
          type="password"
          minLength={6}
          required
          placeholder="••••••••"
          value={f.password}
          onChange={set('password')}
        />

        {msg && (
          <p
            className="err"
            style={{
              color:
                msg.startsWith('Reset link') || msg.startsWith('Sending')
                  ? 'var(--accent)'
                  : undefined,
              marginTop: '10px',
            }}
          >
            {msg}
          </p>
        )}

        <button style={{ width: '100%', marginTop: '16px' }}>
          {mode === 'login' ? 'Sign In to Account' : 'Create Free Account'}
        </button>

        {mode === 'login' && (
          <button
            type="button"
            className="ghost"
            style={{ width: '100%', marginTop: '8px' }}
            onClick={forgot}
          >
            Forgot password?
          </button>
        )}
      </form>

      <div style={{ textAlign: 'center', marginTop: '16px' }}>
        <button
          type="button"
          className="ghost"
          style={{ width: '100%', border: 'none', background: 'transparent' }}
          onClick={() => {
            setMode(mode === 'login' ? 'signup' : 'login');
            setMsg('');
          }}
        >
          {mode === 'login'
            ? "Don't have an account yet? Sign up"
            : 'Already have an account? Sign in'}
        </button>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="auth"><p className="muted">Loading FieldOps 360...</p></div>}>
      <AuthContent />
    </Suspense>
  );
}
