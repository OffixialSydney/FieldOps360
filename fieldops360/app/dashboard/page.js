'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '../../lib/supabase';
import { Customer, Manager, Technician, Accountant } from '../../components/Views';
import { Bell } from '../../components/More';
import ProfileForm from '../../components/ProfileForm';
import Assistant from '../../components/Assistant';
import SuperAdmin from '../../components/AdminViews';
import Search from '../../components/Search';
import OfflineBanner from '../../components/OfflineBanner';
import Footer from '../../components/Footer';
import { clearCache } from '../../lib/offline';

const ROLE_LABELS = {
  manager: 'Operations Manager',
  technician: 'Field Technician',
  customer: 'Customer Portal',
  accountant: 'Finance and Accounting',
  super_admin: 'Super Administrator',
};

const ROLE_DESCRIPTIONS = {
  manager: 'Dispatch work orders, schedule technicians, and monitor service delivery.',
  technician: 'View assigned jobs, update work status, and record on-site execution.',
  customer: 'Manage service requests, track technician arrivals, and review invoices.',
  accountant: 'Reconcile billing statements, verify payments, and manage invoices.',
  super_admin: 'System administration, organization management, and platform audit logs.',
};

export default function Dashboard() {
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [company, setCompany] = useState(null);
  const idRef = useRef(null);
  const [confirmOut, setConfirmOut] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  async function logout() {
    clearCache();
    await supabase.auth.signOut();
    router.push('/login');
  }

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) return router.replace('/login');
      const { data: p } = await supabase.from('profiles').select('*').eq('id', data.session.user.id).single();
      idRef.current = data.session.user.id;
      setProfile(p);
      if (p?.company_id) {
        const { data: c } = await supabase.from('companies').select('*').eq('id', p.company_id).single();
        if (c) setCompany(c);
      }
    })();
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) router.replace('/login');
      else if (idRef.current && session.user.id !== idRef.current) window.location.reload();
    });
    return () => sub.subscription.unsubscribe();
  }, [router]);

  useEffect(() => {
    if (!profile || !profile.requested_role || profile.role !== 'customer') return;
    const t = setInterval(async () => {
      const { data } = await supabase.from('profiles').select('*').eq('id', profile.id).single();
      if (data) setProfile(data);
    }, 15000);
    return () => clearInterval(t);
  }, [profile]);

  if (!profile) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', color: '#64748b', fontSize: '14px', fontWeight: 600 }}>
        Loading FieldOps 360...
      </div>
    );
  }

  const View = { customer: Customer, technician: Technician, accountant: Accountant, manager: Manager, super_admin: SuperAdmin }[profile.role];
  const pending = profile.role === 'customer' && profile.requested_role;
  const roleName = ROLE_LABELS[profile.role] || profile.role.replace('_', ' ');
  const roleDesc = ROLE_DESCRIPTIONS[profile.role] || '';

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', color: '#0f172a', display: 'flex', flexDirection: 'column' }}>
      
      {/* Enterprise Application Header Matching Landing Page */}
      <header style={{ background: 'rgba(255, 255, 255, 0.98)', backdropFilter: 'blur(10px)', borderBottom: '1px solid #f1f5f9', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px', height: 72, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          
          {/* Brand & Organization Context */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', color: '#0f172a' }}>
              <div style={{ width: 34, height: 34, borderRadius: 10, background: '#1a6dff', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(26, 109, 255, 0.3)' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="12" cy="12" r="10" />
                  <polygon points="12 2 15 8 22 9 17 14 18 21 12 17 6 21 7 14 2 9 9 8 12 2" />
                </svg>
              </div>
              <span style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-0.03em', color: '#0f172a' }}>FieldOps 360</span>
            </Link>

            {/* Live Operations Role Pill */}
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '5px 14px', borderRadius: 9999, background: '#e0edff', color: '#1a6dff', fontWeight: 700, fontSize: 12 }}>
              <span>{pending ? 'Pending Approval' : roleName}</span>
              <span style={{ position: 'relative', display: 'flex', width: 7, height: 7 }}>
                <span className="fieldops-ping" style={{ position: 'absolute', width: '100%', height: '100%', borderRadius: '50%', background: '#1a6dff' }}></span>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#1a6dff' }}></span>
              </span>
            </span>

            {company?.name && (
              <span style={{ fontSize: 13, color: '#64748b', fontWeight: 600 }}>
                · {company.name}
              </span>
            )}
          </div>

          {/* Quick Navigation Links */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: 20 }} className="desktop-dashboard-nav">
            <Link href="/" style={{ fontSize: 13.5, fontWeight: 600, color: '#475569', textDecoration: 'none' }}>Home</Link>
            <Link href="/track?no=REQ-DEMO-4109" style={{ fontSize: 13.5, fontWeight: 600, color: '#475569', textDecoration: 'none' }}>Track Order</Link>
            <Link href="/#estimates" style={{ fontSize: 13.5, fontWeight: 600, color: '#475569', textDecoration: 'none' }}>Estimates</Link>
          </nav>

          {/* User Actions & Profile */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Bell me={profile} />
            
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <button
                type="button"
                className="ghost"
                onClick={() => setShowProfile(true)}
                style={{ padding: '7px 16px', fontSize: 13, fontWeight: 600, margin: 0, height: 38, borderRadius: 9999 }}
              >
                Profile ({profile.full_name?.split(' ')[0] || 'User'})
              </button>
              
              <button
                type="button"
                className="ghost"
                onClick={() => setConfirmOut(true)}
                style={{ padding: '7px 16px', fontSize: 13, fontWeight: 600, margin: 0, height: 38, color: '#b91c1c', borderColor: '#fecaca', borderRadius: 9999 }}
              >
                Log Out
              </button>
            </div>
          </div>

        </div>
      </header>

      <OfflineBanner />

      {/* Main Workspace Area */}
      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 20px 60px', width: '100%', flex: 1 }}>
        
        {/* Contextual Workspace Hero Banner */}
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 20, padding: '24px 28px', marginBottom: 24, boxShadow: '0 4px 18px rgba(15, 23, 42, 0.04)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 9999, background: '#e0edff', color: '#1a6dff', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 8 }}>
              <span>{roleName}</span>
              {company?.name && <span>· {company.name}</span>}
            </div>
            <h1 style={{ fontSize: 'clamp(22px, 2.5vw, 28px)', fontWeight: 800, color: '#0f172a', margin: '0 0 6px', letterSpacing: '-0.025em' }}>
              {profile.full_name ? `Welcome, ${profile.full_name}` : roleName}
            </h1>
            <p style={{ fontSize: 14, color: '#64748b', margin: 0, maxWidth: 640, lineHeight: 1.5 }}>
              {roleDesc}
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 9999, padding: '8px 16px', fontSize: 13, fontWeight: 600, color: '#334155' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#16a34a', display: 'inline-block' }}></span>
            <span>Operations Live</span>
          </div>
        </div>

        {!pending && (
          <div style={{ marginBottom: 20 }}>
            <Search />
          </div>
        )}

        {pending ? <Pending me={profile} companyName={company?.name} /> : <View me={profile} />}
      </main>

      {/* Shared Centralized Footer Matching Landing Page */}
      <Footer />

      <Assistant me={profile} />

      {showProfile && <ProfileForm me={profile} onSaved={setProfile} onClose={() => setShowProfile(false)} />}

      {/* Logout Confirmation Dialog */}
      {confirmOut && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, zIndex: 1000, backdropFilter: 'blur(2px)' }}>
          <div className="card" style={{ maxWidth: 380, width: '100%', marginBottom: 0, borderRadius: 18, padding: 26, boxShadow: '0 20px 40px rgba(15, 23, 42, 0.2)' }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 8px', color: '#0f172a' }}>Log Out</h3>
            <p style={{ fontSize: 14, color: '#475569', margin: '0 0 20px', lineHeight: 1.5 }}>
              Are you sure you want to sign out of FieldOps 360? Any unsaved local edits may be lost.
            </p>
            <div className="row" style={{ justifyContent: 'flex-end', gap: 10 }}>
              <button type="button" className="ghost" onClick={() => setConfirmOut(false)} style={{ margin: 0 }}>
                Cancel
              </button>
              <button type="button" className="danger" onClick={logout} style={{ margin: 0 }}>
                Yes, Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

function Pending({ me, companyName }) {
  return (
    <div className="card" style={{ textAlign: 'center', maxWidth: 520, margin: '8vh auto', padding: '40px 28px', borderRadius: 20 }}>
      <div style={{ display: 'inline-flex', padding: '5px 14px', borderRadius: 9999, background: '#fffbeb', color: '#b45309', fontSize: 12, fontWeight: 700, marginBottom: 16 }}>
        Account Pending Verification
      </div>
      <h2 style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', margin: '0 0 8px' }}>{me.full_name}</h2>
      <p style={{ fontSize: 14, color: '#64748b', margin: '0 0 20px' }}>{me.phone || 'No phone registered'} · {me.email}</p>
      <p style={{ fontSize: 14.5, color: '#475569', lineHeight: 1.6, margin: 0 }}>
        Your request to join <strong>{companyName || 'the contracting organization'}</strong> as a <strong>{me.requested_role}</strong> is waiting for administrative approval.
        This portal updates automatically once your access is confirmed.
      </p>
    </div>
  );
}
