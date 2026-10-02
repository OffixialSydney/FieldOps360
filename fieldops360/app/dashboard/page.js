'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';
import { Customer, Manager, Technician, Accountant } from '../../components/Views';
import { Bell, Platform } from '../../components/More';

const SuperAdmin = (p) => (
  <>
    <Platform />
    <Manager {...p} />
  </>
);

export default function Dashboard() {
  const router = useRouter();
  const [profile, setProfile] = useState(null);

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
          <button className="ghost" onClick={async () => { await supabase.auth.signOut(); router.push('/'); }}>Log out</button>
        </div>
      </div>
      <div className="wrap"><View me={profile} /></div>
    </>
  );
}
