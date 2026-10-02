'use client';
import { useEffect, useState } from 'react';
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
  const [confirmOut, setConfirmOut] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  async function logout() {
    await supabase.auth.signOut();
    router.push('/');
  }

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) return router.push('/');
      const { data: p } = await supabase.from('profiles').select('*').eq('id', data.session.user.id).single();
      setProfile(p);
    })();
  }, [router]);

  if (!profile) return <p className="wrap">Loading...</p>;

  const View = { customer: Customer, technician: Technician, accountant: Accountant, manager: Manager, super_admin: SuperAdmin }[profile.role];

  return (
    <>
      <div className="top">
        <b>FieldOps 360</b>
        <div className="row">
          <Bell me={profile} />
          <span className="muted">{profile.full_name} ({profile.role.replace('_', ' ')})</span>
          <button className="ghost" onClick={() => setShowProfile(true)}>Profile</button>
          <button className="ghost" onClick={() => setConfirmOut(true)}>Log out</button>
        </div>
      </div>
      <div className="wrap"><View me={profile} /></div>
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