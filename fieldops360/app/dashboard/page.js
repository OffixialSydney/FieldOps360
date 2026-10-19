// Sticky Header
<div className="top" style={{ padding: '14px 24px', background: 'rgba(255, 255, 255, 0.95)', borderBottom: '1px solid var(--line)' }}>
  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
    <div style={{ width: 34, height: 34, borderRadius: 10, background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 16 }}>F</div>
    <div>
      <div style={{ fontWeight: 800, fontSize: 18, letterSpacing: '-0.02em', color: 'var(--text)' }}>FieldOps 360</div>
      <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
        <span className="fieldops-ping" style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--primary)' }}></span>
        <span>{roleLabels[me.role] || me.role} Portal</span>
      </div>
    </div>
  </div>
  {/* Desktop Links + Pill Profile/Logout buttons */}
  <div className="row" style={{ gap: '8px' }}>
    <Link href="/"><button type="button" className="ghost" style={{ marginTop: 0, borderRadius: 9999, padding: '7px 14px', fontSize: 13 }}>Home</button></Link>
    <Link href="/track"><button type="button" className="ghost" style={{ marginTop: 0, borderRadius: 9999, padding: '7px 14px', fontSize: 13 }}>Track</button></Link>
    <button type="button" className="ghost" style={{ marginTop: 0, borderRadius: 9999, padding: '7px 14px', fontSize: 13 }} onClick={() => setProf(!prof)}>Profile</button>
    <button type="button" className="ghost" style={{ marginTop: 0, borderRadius: 9999, padding: '7px 14px', fontSize: 13 }} onClick={() => supabase.auth.signOut()}>Sign Out</button>
  </div>
</div>

// Main Content
<div className="wrap" style={{ flex: 1, padding: '24px 16px', maxWidth: 1180 }}>
  {/* Workspace Hero Banner */}
  <div style={{ background: '#ffffff', border: '1px solid var(--line)', borderRadius: 16, padding: '20px 24px', marginBottom: 24, boxShadow: '0 2px 10px rgba(15, 23, 42, 0.04)' }}>
    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
      <div>
        <div style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 9999, background: 'var(--primary-light)', color: 'var(--primary)', fontSize: 11, fontWeight: 700, marginBottom: 6 }}>
          OPERATIONS LIVE
        </div>
        <h1 style={{ fontSize: 22, margin: 0 }}>Welcome back, {me.full_name || 'Team Member'}</h1>
        <p className="muted" style={{ margin: '4px 0 0', fontSize: 13 }}>{roleDesc[me.role] || 'Field operations management workspace.'}</p>
      </div>
      <SearchBar />
    </div>
  </div>

  {/* Active Role View Component */}
  {me.role === 'customer' && <Customer me={me} />}
  {me.role === 'technician' && <Technician me={me} />}
  {me.role === 'manager' && <Manager me={me} />}
  {me.role === 'accountant' && <Accountant me={me} />}
  {me.role === 'super_admin' && <SuperAdmin me={me} />}
</div>

// Appended Footer
<Footer />
