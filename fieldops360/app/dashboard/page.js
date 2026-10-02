'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';
import { Customer, Manager, Technician, Accountant } from '../../components/Views';
import { Bell, Platform } from '../../components/More';
import ProfileForm from '../../components/ProfileForm';

const SuperAdmin = (p) => (
  <>
    <Platform />
    <Manager {...p} />
  </>
);

export default function Dashboard() {
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const idRef = useRef(null);
  const [confirmOut, setConfirmOut] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  async function logout() {
    await supabase.auth.signOut();
    router.push('/');
  }

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) return router.replace('/');
      const { data: p } = await supabase.from('profiles').select('*').eq('id', data.session.user.id).single();
      idRef.current = data.session.user.id;
      setProfile(p);
    })();
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) router.replace('/');
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

  if (!profile) return <p className="wrap">Loading...</p>;

  const View = { customer: Customer, technician: Technician, accountant: Accountant, manager: Manager, super_admin: SuperAdmin }[profile.role];
  const pending = profile.role === 'customer' && profile.requested_role;

  return (
    <>
      <div className="top">
        <b>FieldOps 360</b>
        <div className="row">
          <Bell me={profile} />
          <span className="muted">{profile.full_name} ({pending ? 'pending approval' : profile.role.replace('_', ' ')})</span>
          <button className="ghost" onClick={() => setShowProfile(true)}>Profile</button>
          <button className="ghost" onClick={() => setConfirmOut(true)}>Log out</button>
        </div>
      </div>
      <div className="wrap">{pending ? <Pending me={profile} /> : <View me={profile} />}</div>
      {showProfile && <ProfileForm me={profile} onSaved={setProfile} onClose={() => setShowProfile(false)} />}
      {confirmOut && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, zIndex: 20 }}>
          <div className="card" style={{ maxWidth: 360, width: '100%', marginBottom: 0 }}>
            <h3>Log out?</h3>
            <p className="muted">Are you sure you want to log out?</p>
            <div className="row">
              <button className="danger" onClick={logout}>Yes, log out</button>
              <button className="ghost" onClick={() => setConfirmOut(false)}>No, stay</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function Pending({ me }) {
  const [company, setCompany] = useState('');
  useEffect(() => {
    if (!me.company_id) return;
    supabase.from('companies').select('name').eq('id', me.company_id).single().then(({ data }) => setCompany(data?.name || ''));
  }, [me.company_id]);

  return (
    <div className="card" style={{ textAlign: 'center', maxWidth: 480, margin: '10vh auto' }}>
      <span className="badge">Pending approval</span>
      <h2>{me.full_name}</h2>
      <p className="muted">{me.phone || 'No phone number'} · {me.email}</p>
      <p>
        Your request to join {company || 'the company'} as a <b>{me.requested_role}</b> is waiting for approval.
        This page updates by itself once you are approved.
      </p>
    </div>
  );
}