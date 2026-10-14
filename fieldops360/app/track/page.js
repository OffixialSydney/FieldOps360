'use client';
import { useState, useEffect, Suspense, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '../../lib/supabase';
import { formatWhatsAppUrl } from '../../lib/notify';

// Clean SVG Icons (Zero emojis)
const Icons = {
  Logo: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
    </svg>
  ),
  Pin: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  ),
  Phone: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  ),
  WhatsApp: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </svg>
  ),
  Check: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  Clock: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  Shield: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  ),
  Wrench: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
    </svg>
  ),
  Search: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  ),
};

const STAGES = [
  { key: 'assigned', label: 'Dispatched', desc: 'Technician assigned to work order' },
  { key: 'en_route', label: 'En Route', desc: 'Technician on the way to location' },
  { key: 'arrived', label: 'Arrived', desc: 'Technician arrived on site' },
  { key: 'in_progress', label: 'In Progress', desc: 'Active diagnostic & repairs' },
  { key: 'completed', label: 'Completed', desc: 'Service completed & verified' },
];

const STAGE_ORDER = {
  new: 0,
  reviewing: 0,
  assigned: 1,
  accepted: 1,
  en_route: 2,
  arrived: 3,
  diagnosing: 4,
  in_progress: 4,
  waiting_parts: 4,
  waiting_customer: 4,
  completed: 5,
  invoiced: 5,
  paid: 5,
  closed: 5,
};

function haversineKm(lat1, lon1, lat2, lon2) {
  if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) return null;
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function LiveTrackingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestNo = (searchParams.get('no') || '').trim();
  const requestId = (searchParams.get('id') || '').trim();
  const activeQuery = requestNo || requestId;

  const [session, setSession] = useState(null);
  const [req, setReq] = useState(null);
  const [tech, setTech] = useState(null);
  const [techLoc, setTechLoc] = useState(null);
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(Boolean(activeQuery));
  const [lastRefreshed, setLastRefreshed] = useState(new Date());
  const [searchInput, setSearchInput] = useState(activeQuery);
  const [recentOrders, setRecentOrders] = useState([]);

  // Check user authentication session
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data?.session || null);
    });
    const { data: authSub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
    });
    return () => authSub?.subscription?.unsubscribe();
  }, []);

  // Quick Demo Generator for Instant Testing
  const generateDemoOrder = useCallback(() => {
    const demoReq = {
      id: 'demo-sample-order-uuid',
      request_no: 'REQ-DEMO-4109',
      service_type: 'Solar Inverter Diagnostic & Overhaul',
      status: 'in_progress',
      priority: 'high',
      address: 'Plot 14 Admiralty Way, Lekki Phase 1',
      latitude: 6.4474,
      longitude: 3.4709,
      eta_minutes: 8,
      tech_notes: 'Technician Marcus Vance is actively running high-voltage output diagnostics on inverter string 2.',
      work_done: null,
      created_at: new Date().toISOString(),
    };
    const demoTech = {
      id: 'demo-tech-uuid',
      full_name: 'Marcus Vance',
      phone: '+2348012345678',
      skills: 'Solar Systems, Master Electrician, Inverters',
      role: 'technician',
    };
    const demoLoc = {
      lat: 6.4412,
      lng: 3.4651,
      updated_at: new Date().toISOString(),
    };
    setReq(demoReq);
    setTech(demoTech);
    setTechLoc(demoLoc);
    setLoading(false);
  }, []);

  // Load recent orders to provide 1-tap quick testing chips
  useEffect(() => {
    supabase
      .from('requests')
      .select('id, request_no, service_type, status')
      .order('created_at', { ascending: false })
      .limit(5)
      .then(({ data }) => {
        if (data) setRecentOrders(data);
      })
      .catch(() => {});
  }, []);

  const loadData = useCallback(async () => {
    if (!activeQuery) {
      setLoading(false);
      return;
    }

    // Direct check for demo queries so visitors never get work order not found
    if (activeQuery.toUpperCase().includes('DEMO') || activeQuery.includes('4109')) {
      generateDemoOrder();
      return;
    }

    try {
      // 1. Try server-side API route first (bypasses RLS)
      let apiFound = false;
      try {
        const param = requestNo ? `no=${encodeURIComponent(requestNo)}` : `id=${encodeURIComponent(requestId)}`;
        const res = await fetch(`/api/track?${param}`);
        if (res.ok) {
          const payload = await res.json();
          if (payload.job) {
            setReq(payload.job);
            setTech(payload.tech || null);
            setTechLoc(payload.techLoc || null);
            setInvoice(payload.invoice || null);
            setLastRefreshed(new Date());
            setLoading(false);
            apiFound = true;
          }
        }
      } catch (e) {
        // Fallback to client query
      }

      if (apiFound) return;

      // 2. Direct client-side Supabase query fallback (case-insensitive)
      let query = supabase.from('requests').select('*');
      if (requestId) {
        query = query.eq('id', requestId);
      } else if (activeQuery.length > 20 && activeQuery.includes('-') && !activeQuery.toUpperCase().startsWith('REQ')) {
        query = query.eq('id', activeQuery);
      } else {
        query = query.ilike('request_no', activeQuery);
      }

      let { data: job } = await query.maybeSingle();

      // If not matched, try partial match (e.g. user typed only "4109")
      if (!job) {
        const { data: partials } = await supabase
          .from('requests')
          .select('*')
          .ilike('request_no', `%${activeQuery}%`)
          .limit(1);
        if (partials && partials.length > 0) {
          job = partials[0];
        }
      }

      if (!job) {
        setReq(null);
        setLoading(false);
        return;
      }

      setReq(job);

      // Load technician profile
      if (job.technician_id) {
        const { data: t } = await supabase
          .from('profiles')
          .select('id, full_name, phone, skills, role')
          .eq('id', job.technician_id)
          .maybeSingle();
        setTech(t);

        const { data: loc } = await supabase
          .from('technician_locations')
          .select('*')
          .eq('technician_id', job.technician_id)
          .maybeSingle();
        setTechLoc(loc);
      }

      // Load invoice if completed
      if (['completed', 'invoiced', 'paid', 'closed'].includes(job.status)) {
        const { data: inv } = await supabase
          .from('invoices')
          .select('*')
          .eq('request_id', job.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();
        setInvoice(inv);
      }

      setLastRefreshed(new Date());
      setLoading(false);
    } catch (err) {
      console.error('Error loading tracking data:', err);
      setLoading(false);
    }
  }, [activeQuery, requestNo, requestId, generateDemoOrder]);

  useEffect(() => {
    loadData();
    // Live satellite telemetry polling every 6 seconds
    const interval = setInterval(loadData, 6000);
    return () => clearInterval(interval);
  }, [loadData]);

  if (loading) {
    return (
      <div className="wrap" style={{ textAlign: 'center', padding: '80px 20px' }}>
        <div className="brand-icon-box" style={{ margin: '0 auto 16px', width: 44, height: 44 }}>
          <Icons.Logo />
        </div>
        <h3>Connecting to live dispatch radar...</h3>
        <p className="muted">Retrieving specialist GPS telemetry and active job status.</p>
      </div>
    );
  }

  // Work Order Lookup & Search screen when no order was passed or order was not found
  if (!req) {
    return (
      <div style={{ minHeight: '100vh', background: '#f8fafc', padding: '40px 20px' }}>
        <div style={{ maxWidth: 540, margin: '0 auto' }}>
          <div style={{ marginBottom: '24px' }}>
            <Link href={session ? '/dashboard' : '/'} className="back-link">
              {session ? 'Back to Operations Dashboard' : 'Back to FieldOps 360 Home'}
            </Link>
          </div>

          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <div className="brand-icon-box" style={{ margin: '0 auto 16px', width: 44, height: 44 }}>
              <Icons.Logo />
            </div>
            <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#0f172a', margin: '0 0 8px' }}>
              Live Customer Tracking Radar
            </h1>
            <p className="muted" style={{ fontSize: '15px', margin: 0 }}>
              Track real time technician GPS coordinates, arrival ETA, and service logs.
            </p>
          </div>

          <div className="card" style={{ padding: '28px' }}>
            {activeQuery ? (
              <div style={{ background: '#fef2f2', border: '1px solid #fee2e2', borderRadius: '8px', padding: '14px', marginBottom: '20px' }}>
                <p style={{ margin: 0, fontSize: '13px', color: '#991b1b', fontWeight: 600 }}>
                  Work order #{activeQuery} was not found in the database.
                </p>
                <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#b91c1c' }}>
                  Please check the number or launch our interactive live test simulation below.
                </p>
              </div>
            ) : null}

            {/* Quick Test Demo Button Promoted to Top */}
            <div style={{ marginBottom: '22px' }}>
              <button
                type="button"
                onClick={generateDemoOrder}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  background: '#2563eb',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '14px',
                  padding: '12px',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: 'pointer',
                  margin: 0,
                }}
              >
                <span>Launch Interactive Demo Radar (REQ-DEMO-4109)</span>
              </button>
              <p style={{ fontSize: '11px', color: '#64748b', textAlign: 'center', margin: '6px 0 0' }}>
                Test live GPS telemetry, technician profiles, and status transitions instantly.
              </p>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (searchInput.trim()) {
                  router.push(`/track?no=${encodeURIComponent(searchInput.trim())}`);
                }
              }}
            >
              <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Or Search Existing Work Order Number
              </label>
              <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                <input
                  type="text"
                  placeholder="e.g. REQ-4109 or REQ-2026-000001"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  style={{ flex: 1, margin: 0 }}
                  required
                />
                <button type="submit" style={{ margin: 0, whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <Icons.Search />
                  <span>Track</span>
                </button>
              </div>
            </form>

            {/* Recent Orders in Database (if any exist) */}
            {recentOrders.length > 0 && (
              <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #f1f5f9' }}>
                <p className="muted" style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', margin: '0 0 8px' }}>
                  Recent Work Orders on Your Server
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {recentOrders.map((ro) => (
                    <button
                      key={ro.id}
                      type="button"
                      className="ghost"
                      style={{ fontSize: '12px', padding: '5px 10px', margin: 0 }}
                      onClick={() => {
                        setSearchInput(ro.request_no);
                        router.push(`/track?no=${encodeURIComponent(ro.request_no)}&id=${ro.id}`);
                      }}
                    >
                      {ro.request_no} · {ro.service_type?.slice(0, 16)}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div style={{ marginTop: '24px', paddingTop: '18px', borderTop: '1px solid #e2e8f0', textAlign: 'center' }}>
              {session ? (
                <Link href="/dashboard">
                  <button className="ghost" style={{ width: '100%', margin: 0, fontSize: '13px', fontWeight: 600 }}>
                    Return to Operations Dashboard
                  </button>
                </Link>
              ) : (
                <Link href="/">
                  <button className="ghost" style={{ width: '100%', margin: 0, fontSize: '13px', fontWeight: 600 }}>
                    Return to FieldOps 360 Home
                  </button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentStageNum = STAGE_ORDER[req.status] || 0;
  const isComplete = currentStageNum >= 5;

  // Real-time Distance & ETA calculation
  const distanceKm =
    techLoc && req.latitude != null
      ? haversineKm(techLoc.lat, techLoc.lng, req.latitude, req.longitude)
      : null;

  let etaText = 'Calculating ETA...';
  if (req.status === 'en_route') {
    if (req.eta_minutes) {
      etaText = `${req.eta_minutes} mins away`;
    } else if (distanceKm != null) {
      const estimatedMins = Math.max(3, Math.round((distanceKm / 30) * 60));
      etaText = `${estimatedMins} mins away (${distanceKm.toFixed(1)} km)`;
    } else {
      etaText = 'En Route to Location';
    }
  } else if (req.status === 'arrived') {
    etaText = 'Technician Arrived On Site';
  } else if (req.status === 'in_progress' || req.status === 'diagnosing') {
    etaText = 'Active Work in Progress';
  } else if (isComplete) {
    etaText = 'Service Completed & Signed';
  } else {
    etaText = 'Dispatched: Preparing for Route';
  }

  const customerTrackingUrl = typeof window !== 'undefined' ? window.location.href : '';
  const technicianPhone = tech?.phone || '08012345678';
  const whatsappUrl = formatWhatsAppUrl(
    technicianPhone,
    `Hello ${tech?.full_name || 'Technician'}, I am following up on work order #${req.request_no} for ${req.service_type}. Here is the tracking link: ${customerTrackingUrl}`
  );

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', padding: '24px 16px' }}>
      <div style={{ maxWidth: 840, margin: '0 auto' }}>
        
        {/* Navigation Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div className="brand-icon-box" style={{ width: 34, height: 34 }}>
              <Icons.Logo />
            </div>
            <div>
              <span style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', display: 'block' }}>FieldOps 360</span>
              <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>Live Telemetry Radar</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button
              type="button"
              className="ghost"
              onClick={() => {
                setReq(null);
                router.push('/track');
              }}
              style={{ fontSize: '12px', padding: '6px 12px', margin: 0 }}
            >
              Track Another Order
            </button>
            <Link
              href={session ? '/dashboard' : '/'}
              className="ghost"
              style={{
                padding: '6px 14px',
                fontSize: '12px',
                borderRadius: '8px',
                border: '1px solid var(--line)',
                textDecoration: 'none',
              }}
            >
              {session ? 'Back to Dashboard' : 'Homepage'}
            </Link>
          </div>
        </div>

        {/* Work Order Header Card */}
        <div className="card" style={{ padding: '24px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '14px' }}>
            <div>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Work Order Reference
              </span>
              <h2 style={{ fontSize: '24px', fontWeight: 800, margin: '4px 0 6px', color: '#0f172a' }}>
                {req.request_no}
              </h2>
              <p style={{ margin: 0, fontSize: '15px', color: '#475569', fontWeight: 500 }}>
                {req.service_type}
              </p>
            </div>

            <div style={{ textAlign: 'right' }}>
              <span
                style={{
                  display: 'inline-block',
                  padding: '6px 14px',
                  borderRadius: '20px',
                  fontSize: '13px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  background: isComplete ? '#ecfdf5' : '#eff6ff',
                  color: isComplete ? '#065f46' : '#1d4ed8',
                  border: isComplete ? '1px solid #a7f3d0' : '1px solid #bfdbfe',
                }}
              >
                {req.status.replace('_', ' ')}
              </span>
              <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '6px' }}>
                Updated {lastRefreshed.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </div>
            </div>
          </div>

          {/* Stepper Progress Indicator */}
          <div style={{ marginTop: '28px', paddingTop: '20px', borderTop: '1px solid #f1f5f9' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px' }}>
              {STAGES.map((s, idx) => {
                const stepNum = idx + 1;
                const isPassed = currentStageNum >= stepNum;
                const isCurrent = currentStageNum === stepNum;
                return (
                  <div key={s.key} style={{ textAlign: 'center' }}>
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        margin: '0 auto 8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: isPassed ? '#2563eb' : isCurrent ? '#dbeafe' : '#f1f5f9',
                        color: isPassed ? '#ffffff' : isCurrent ? '#1d4ed8' : '#94a3b8',
                        fontWeight: 700,
                        fontSize: '13px',
                        border: isCurrent ? '2px solid #2563eb' : 'none',
                      }}
                    >
                      {isPassed ? <Icons.Check /> : stepNum}
                    </div>
                    <div style={{ fontSize: '13px', fontWeight: isPassed || isCurrent ? 700 : 500, color: isPassed || isCurrent ? '#0f172a' : '#94a3b8' }}>
                      {s.label}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Live Technician Card */}
        {tech && (
          <div className="card" style={{ padding: '24px', marginBottom: '20px' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Assigned Specialist
            </span>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px', flexWrap: 'wrap', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#0f172a', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: 700 }}>
                  {tech.full_name?.charAt(0) || 'T'}
                </div>
                <div>
                  <h3 style={{ fontSize: '17px', fontWeight: 700, margin: '0 0 4px', color: '#0f172a' }}>
                    {tech.full_name}
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '12px', color: '#475569', background: '#f1f5f9', padding: '2px 8px', borderRadius: '4px' }}>
                      Certified Specialist
                    </span>
                    {tech.skills && (
                      <span style={{ fontSize: '12px', color: '#64748b' }}>
                        {tech.skills}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <a
                  href={`tel:${technicianPhone}`}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 14px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    color: '#0f172a',
                    textDecoration: 'none',
                    fontSize: '13px',
                    fontWeight: 600,
                  }}
                >
                  <Icons.Phone />
                  <span>Call</span>
                </a>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 14px',
                    borderRadius: '8px',
                    background: '#16a34a',
                    color: '#ffffff',
                    textDecoration: 'none',
                    fontSize: '13px',
                    fontWeight: 700,
                  }}
                >
                  <Icons.WhatsApp />
                  <span>WhatsApp</span>
                </a>
              </div>
            </div>
          </div>
        )}

        {/* GPS Arrival & Diagnostic Telemetry Card */}
        <div className="card" style={{ padding: '24px', marginBottom: '20px' }}>
          <span style={{ fontSize: '11px', fontWeight: 700, color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Live Dispatch Telemetry
          </span>
          <div style={{ marginTop: '14px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#2563eb', marginBottom: '6px' }}>
                <Icons.Clock />
                <span style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase' }}>Arrival Status</span>
              </div>
              <div style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>
                {etaText}
              </div>
            </div>

            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#2563eb', marginBottom: '6px' }}>
                <Icons.Pin />
                <span style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase' }}>Service Location</span>
              </div>
              <div style={{ fontSize: '14px', color: '#334155', fontWeight: 600, lineHeight: 1.4 }}>
                {req.address || 'Client Facility Site'}
              </div>
            </div>
          </div>

          {req.tech_notes && (
            <div style={{ marginTop: '16px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px' }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '6px' }}>
                Technician Field Activity Notes
              </div>
              <p style={{ margin: 0, fontSize: '14px', color: '#334155', lineHeight: 1.5 }}>
                {req.tech_notes}
              </p>
            </div>
          )}
        </div>

        {/* Completed Work Order & Invoicing */}
        {isComplete && invoice && (
          <div className="card" style={{ padding: '24px', marginBottom: '20px' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#16a34a', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Service Completed & Billed
            </span>
            <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
              <div>
                <div style={{ fontSize: '14px', color: '#64748b' }}>Invoice #{invoice.invoice_no || 'INV-2026-001'}</div>
                <div style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', marginTop: '4px' }}>
                  ₦{Number(invoice.total || invoice.amount || 0).toLocaleString()}
                </div>
              </div>
              <span style={{ padding: '6px 12px', borderRadius: '6px', background: '#ecfdf5', color: '#065f46', fontSize: '12px', fontWeight: 700 }}>
                {invoice.status === 'paid' ? 'Paid & Settled' : 'Invoice Dispatched'}
              </span>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default function TrackPage() {
  return (
    <Suspense fallback={<div className="wrap" style={{ textAlign: 'center', padding: '80px 20px' }}>Loading Live Telemetry Radar...</div>}>
      <LiveTrackingContent />
    </Suspense>
  );
}
