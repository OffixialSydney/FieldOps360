'use client';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '../../lib/supabase';

// Clean SVG Icons (Zero emojis)
function LogoIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  );
}

function AuthContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialMode = searchParams.get('mode') === 'signup' ? 'signup' : 'login';

  const [mode, setMode] = useState(initialMode); // 'login' | 'signup' | 'verify_otp'
  const [f, setF] = useState({
    email: '',
    password: '',
    full_name: '',
    phone: '',
    company_id: '',
    requested_role: 'customer',
  });
  const [otp, setOtp] = useState('');
  const [verifying, setVerifying] = useState(false);
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
      if (data?.session) router.replace('/dashboard');
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

    if (mode === 'login') {
      const { error } = await supabase.auth.signInWithPassword({
        email: f.email,
        password: f.password,
      });
      if (error) return setMsg(error.message);
      router.push('/dashboard');
    } else if (mode === 'signup') {
      const { data, error } = await supabase.auth.signUp({
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

      // If Supabase email confirmation is enabled, session is null until code is entered
      if (data?.user && !data.session) {
        setMode('verify_otp');
        setMsg('A 6-digit confirmation code has been sent to your Gmail. Please enter it below.');
        return;
      }

      router.push('/dashboard');
    } else if (mode === 'verify_otp') {
      if (!otp.trim()) return setMsg('Please enter the 6-digit confirmation code.');
      setVerifying(true);

      let verifyRes = await supabase.auth.verifyOtp({
        email: f.email,
        token: otp.trim(),
        type: 'signup',
      });

      if (verifyRes.error) {
        // Fallback for token type depending on Supabase auth setup
        verifyRes = await supabase.auth.verifyOtp({
          email: f.email,
          token: otp.trim(),
          type: 'email',
        });
      }

      setVerifying(false);
      if (verifyRes.error) {
        return setMsg(verifyRes.error.message || 'Invalid or expired verification code.');
      }

      router.push('/dashboard');
    }
  }

  async function resendCode() {
    setMsg('Sending a fresh verification code to your email...');
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: f.email,
    });
    if (error) setMsg(error.message);
    else setMsg('A new 6-digit verification code has been dispatched to your email.');
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

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
        <div className="brand-badge-icon">
          <LogoIcon />
        </div>
        <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 800 }}>FieldOps 360</h1>
      </div>

      <p className="muted" style={{ marginBottom: '20px' }}>
        {mode === 'verify_otp'
          ? 'Enter the 6-digit code sent to your Gmail inbox to confirm your account.'
          : mode === 'login'
          ? 'Sign in to access your dispatch dashboard and service portal.'
          : 'Create your account to start managing or requesting field operations.'}
      </p>

      {/* Mode toggle tabs (only shown when not verifying OTP) */}
      {mode !== 'verify_otp' && (
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
      )}

      {/* OTP Verification Form */}
      {mode === 'verify_otp' ? (
        <form className="card" onSubmit={submit}>
          <div style={{ textAlign: 'center', marginBottom: '16px' }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                background: '#eff6ff',
                color: '#2563eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 12px',
              }}
            >
              <MailIcon />
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: 800, margin: '0 0 6px' }}>Verify Your Email</h2>
            <p className="muted" style={{ fontSize: '14px', margin: 0 }}>
              We sent a 6-digit confirmation code to <b>{f.email}</b>.
            </p>
          </div>

          <label style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Enter 6-Digit Code
          </label>
          <input
            type="text"
            required
            maxLength={6}
            placeholder="123456"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
            style={{
              textAlign: 'center',
              fontSize: '26px',
              letterSpacing: '8px',
              fontWeight: 800,
              fontFamily: 'monospace',
              padding: '12px',
            }}
            autoFocus
          />

          {msg && (
            <p
              className={msg.includes('sent') || msg.includes('dispatched') ? 'muted' : 'err'}
              style={{ textAlign: 'center', marginTop: '10px', fontSize: '13px' }}
            >
              {msg}
            </p>
          )}

          <button type="submit" disabled={verifying || otp.length < 6} style={{ width: '100%', marginTop: '16px' }}>
            {verifying ? 'Verifying Code...' : 'Verify & Activate Account'}
          </button>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', paddingTop: '14px', borderTop: '1px solid #e2e8f0' }}>
            <button
              type="button"
              className="ghost"
              style={{ fontSize: '13px', margin: 0, padding: '6px 12px' }}
              onClick={resendCode}
            >
              Resend Code
            </button>
            <button
              type="button"
              className="ghost"
              style={{ fontSize: '13px', margin: 0, padding: '6px 12px' }}
              onClick={() => {
                setMode('signup');
                setMsg('');
              }}
            >
              Change Email
            </button>
          </div>
        </form>
      ) : (
        /* Login & Sign Up Form */
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
                <option value="technician">Technician (Field crew, requires approval)</option>
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
      )}

      {mode !== 'verify_otp' && (
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
      )}
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
