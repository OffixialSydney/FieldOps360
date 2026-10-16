'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';
import { Customer, Manager, Technician, Accountant } from '../../components/Views';
import { Bell } from '../../components/More';
import ProfileForm from '../../components/ProfileForm';
import Assistant from '../../components/Assistant';
import SuperAdmin from '../../components/AdminViews';
import Search from '../../components/Search';
import OfflineBanner from '../../components/OfflineBanner';
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
    <div style={{ minHeight: '100vh', background: '#f8fafc', color: '#0f172a' }}>
      
      {/* Enterprise Application Header */}
      <header style={{ background: '#ffffff', borderBottom: '1px solid #e2e8f0', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          
          {/* Brand & Organization Context */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 32, height: 32, borderRadius: 6, background: '#2563eb', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
              </svg>
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>FieldOps 360</span>
                {company?.name && (
                  <span style={{ fontSize: 13, color: '#64748b', fontWeight: 600 }}>
                    · {company.name}
                  </span>
                )}
              </div>
              <span style={{ fontSize: 11, color: '#2563eb', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                {pending ? 'Pending Approval' : roleName}
              </span>
            </div>
          </div>

          {/* User Actions & Profile */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Bell me={profile} />
            
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <button
                type="button"
                className="ghost"
                onClick={() => setShowProfile(true)}
                style={{ padding: '6px 12px', fontSize: 13, fontWeight: 600, margin: 0, height: 36 }}
              >
                Profile ({profile.full_name?.split(' ')[0] || 'User'})
              </button>
              
              <button
                type="button"
                className="ghost"
                onClick={() => setConfirmOut(true)}
                style={{ padding: '6px 12px', fontSize: 13, fontWeight: 600, margin: 0, height: 36, color: '#b91c1c', borderColor: '#fecaca' }}
              >
                Log Out
              </button>
            </div>
          </div>

        </div>
      </header>

      <OfflineBanner />

      {/* Main Workspace Area */}
      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 20px 60px' }}>
        
        {/* Contextual Workspace Header */}
        <div style={{ marginBottom: 20 }}>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', margin: '0 0 4px', letterSpacing: '-0.02em' }}>
            {roleName}
          </h1>
          <p style={{ fontSize: 14, color: '#64748b', margin: 0 }}>
            {roleDesc}
          </p>
        </div>

        {!pending && (
          <div style={{ marginBottom: 16 }}>
            <Search />
          </div>
        )}

        {pending ? <Pending me={profile} companyName={company?.name} /> : <View me={profile} />}
      </main>

      <Assistant me={profile} />

      {showProfile && <ProfileForm me={profile} onSaved={setProfile} onClose={() => setShowProfile(false)} />}

      {/* Logout Confirmation Dialog */}
      {confirmOut && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, zIndex: 1000, backdropFilter: 'blur(2px)' }}>
          <div className="card" style={{ maxWidth: 380, width: '100%', marginBottom: 0, borderRadius: 10, padding: 24 }}>
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
    <div className="card" style={{ textAlign: 'center', maxWidth: 500, margin: '8vh auto', padding: '36px 24px', borderRadius: 12 }}>
      <div style={{ display: 'inline-flex', padding: '4px 12px', borderRadius: 20, background: '#fffbeb', color: '#b45309', fontSize: 12, fontWeight: 700, marginBottom: 16 }}>
        Account Pending Verification
      </div>
      <h2 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', margin: '0 0 6px' }}>{me.full_name}</h2>
      <p style={{ fontSize: 14, color: '#64748b', margin: '0 0 18px' }}>{me.phone || 'No phone registered'} · {me.email}</p>
      <p style={{ fontSize: 14, color: '#475569', lineHeight: 1.6, margin: 0 }}>
        Your request to join <strong>{companyName || 'the contracting organization'}</strong> as a <strong>{me.requested_role}</strong> is waiting for administrative approval.
        This portal updates automatically once your access is confirmed.
      </p>
    </div>
  );
}
