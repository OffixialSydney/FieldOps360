'use client';
import { useState, useEffect, Suspense, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '../../lib/supabase';

// Clean SVG Icons (Zero emojis)
const Icons = {
  Logo: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
    </svg>
  ),
  Van: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="3" width="15" height="13" rx="2" />
      <polygon points="16 8 20 8 23 11 23 16 16 16 8" />
      <circle cx="5.5" cy="18.5" r="2.5" />
      <circle cx="18.5" cy="18.5" r="2.5" />
    </svg>
  ),
  Pin: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
};

const STAGES = [
  { key: 'assigned', label: 'Dispatched', desc: 'Technician assigned to work order' },
  { key: 'en_route', label: 'En Route', desc: 'Technician on the way to location' },
  { key: 'arrived', label: 'Arrived', desc: 'Technician arrived on-site' },
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
  const searchParams = useSearchParams();
  const requestNo = searchParams.get('no') || '';
  const requestId = searchParams.get('id') || '';

  const [req, setReq] = useState(null);
  const [tech, setTech] = useState(null);
  const [techLoc, setTechLoc] = useState(null);
  const [history, setHistory] = useState([]);
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState(new Date());

  const loadData = useCallback(async () => {
    if (!requestNo && !requestId) {
      setLoading(false);
      return;
    }

    try {
      let query = supabase
        .from('requests')
        .select('*, customer:profiles!requests_customer_id_fkey(full_name, phone)');

      if (requestNo) query = query.eq('request_no', requestNo);
      else if (requestId) query = query.eq('id', requestId);

      const { data: job, error } = await query.maybeSingle();
      if (error || !job) {
        setLoading(false);
        return;
      }

      setReq(job);

      // Load technician
      if (job.technician_id) {
        const { data: t } = await supabase
          .from('profiles')
          .select('id, full_name, phone, skills, role')
          .eq('id', job.technician_id)
          .maybeSingle();
        setTech(t);

        // Load technician live coordinates
        const { data: loc } = await supabase
          .from('technician_locations')
          .select('*')
          .eq('technician_id', job.technician_id)
          .maybeSingle();
        setTechLoc(loc);
      }

      // Load status history
      const { data: hists } = await supabase
        .from('job_status_history')
        .select('*')
        .eq('request_id', job.id)
        .order('created_at', { ascending: true });
      setHistory(hists || []);

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
  }, [requestNo, requestId]);

  useEffect(() => {
    loadData();
    // Real-time polling every 6 seconds for live coordinates and logs
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
        <p className="muted">Retrieving technician GPS coordinates and job telemetry.</p>
      </div>
    );
  }

  if (!req) {
    return (
      <div className="wrap" style={{ textAlign: 'center', padding: '80px 20px' }}>
        <div className="card" style={{ maxWidth: 480, margin: '0 auto', textAlign: 'center' }}>
          <h2>Work Order Not Found</h2>
          <p className="muted">
            We could not find active dispatch records for <b>{requestNo || requestId || 'this request'}</b>.
          </p>
          <Link href="/login">
            <button style={{ marginTop: '14px' }}>Go to Customer Portal</button>
          </Link>
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

  // Calculate ETA display
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
    etaText = 'Technician Arrived On-Site';
  } else if (['diagnosing', 'in_progress'].includes(req.status)) {
    etaText = 'Work Actively in Progress';
  } else if (isComplete) {
    etaText = 'Work Completed & Ready for Settlement';
  } else {
    etaText = 'Dispatched - Preparing for Route';
  }

  const cleanTechPhone = tech?.phone ? tech.phone.replace(/\D/g, '') : '';
  const customerNavAddress = req.address || 'Service Location';
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(customerNavAddress)}`;

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', paddingBottom: '60px' }}>
      {/* Top Header Bar */}
      <header className="top" style={{ background: '#ffffff' }}>
        <div className="brand-group">
          <div className="brand-icon-box" style={{ width: 34, height: 34 }}>
            <Icons.Logo />
          </div>
          <div>
            <span style={{ fontWeight: 800, fontSize: '16px' }}>FieldOps 360</span>
            <span className="brand-glow-tag" style={{ marginLeft: '8px' }}>LIVE RADAR</span>
          </div>
        </div>
        <div className="row" style={{ gap: '10px' }}>
          <span className="status-pill" style={{ margin: 0 }}>
            <span className="status-dot"></span>
            <span>Live Telemetry</span>
          </span>
          <Link href="/login" className="ghost" style={{ padding: '6px 14px', fontSize: '13px', borderRadius: '8px', border: '1px solid var(--line)' }}>
            Sign In
          </Link>
        </div>
      </header>

      <main className="wrap" style={{ maxWidth: 840, paddingTop: '28px' }}>
        {/* Radar Hero Card */}
        <div
          className="card"
          style={{
            background: '#0f172a',
            color: '#ffffff',
            borderRadius: '16px',
            padding: '28px 24px',
            border: '1px solid #1e293b',
            boxShadow: '0 20px 40px -15px rgba(15, 23, 42, 0.35)',
            marginBottom: '20px',
          }}
        >
          <div className="row" style={{ justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
            <div>
              <span className="slide-badge-pill" style={{ marginBottom: '8px' }}>
                ORDER #{req.request_no}
              </span>
              <h2 style={{ color: '#ffffff', margin: '4px 0 6px', fontSize: '24px', fontWeight: 800 }}>
                {req.service_type} Service
              </h2>
              <p style={{ color: '#94a3b8', margin: 0, fontSize: '14px' }}>
                {req.address}
              </p>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(59, 130, 246, 0.15)', border: '1px solid rgba(59, 130, 246, 0.3)', padding: '6px 12px', borderRadius: '99px' }}>
                <span className="radar-dot" style={{ width: 8, height: 8 }}></span>
                <span style={{ color: '#60a5fa', fontSize: '12px', fontWeight: 700 }}>
                  {req.status.replace('_', ' ').toUpperCase()}
                </span>
              </div>
            </div>
          </div>

          {/* Large ETA Display */}
          <div
            style={{
              background: '#020617',
              border: '1px solid #1e293b',
              borderRadius: '12px',
              padding: '18px 20px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '14px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: 42, height: 42, borderRadius: '10px', background: '#1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#60a5fa' }}>
                <Icons.Clock />
              </div>
              <div>
                <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Live Status & ETA
                </span>
                <div style={{ fontSize: '18px', fontWeight: 800, color: '#f8fafc' }}>
                  {etaText}
                </div>
              </div>
            </div>

            <a href={mapsUrl} target="_blank" rel="noreferrer">
              <button
                type="button"
                style={{
                  background: '#2563eb',
                  color: '#ffffff',
                  fontSize: '13px',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  margin: 0,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <Icons.Pin />
                <span>Open in Maps</span>
              </button>
            </a>
          </div>
        </div>

        {/* Visual 5-Stage Live Timeline Tracker */}
        <div className="card" style={{ marginBottom: '20px', padding: '24px' }}>
          <h3 style={{ margin: '0 0 18px', fontSize: '16px', fontWeight: 700 }}>
            Live Dispatch Milestones
          </h3>

          <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative' }}>
            {STAGES.map((st, idx) => {
              const isPastOrCurrent = currentStageNum >= idx + 1;
              const isCurrent = currentStageNum === idx + 1;

              return (
                <div key={st.key} style={{ flex: 1, textAlign: 'center', position: 'relative' }}>
                  {/* Connecting Line */}
                  {idx < STAGES.length - 1 && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '16px',
                        left: '50%',
                        width: '100%',
                        height: '3px',
                        background: currentStageNum > idx + 1 ? '#2563eb' : '#e2e8f0',
                        zIndex: 1,
                        transition: 'background 0.3s ease',
                      }}
                    />
                  )}

                  {/* Step Circle */}
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: isCurrent ? '#2563eb' : isPastOrCurrent ? '#059669' : '#f1f5f9',
                      color: isPastOrCurrent ? '#ffffff' : '#94a3b8',
                      border: isCurrent ? '3px solid #bfdbfe' : isPastOrCurrent ? 'none' : '2px solid #cbd5e1',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 8px',
                      position: 'relative',
                      zIndex: 2,
                      fontSize: '13px',
                      fontWeight: 700,
                      boxShadow: isCurrent ? '0 0 0 4px rgba(37, 99, 235, 0.2)' : 'none',
                    }}
                  >
                    {isPastOrCurrent ? <Icons.Check /> : idx + 1}
                  </div>

                  <span
                    style={{
                      fontSize: '12px',
                      fontWeight: isCurrent ? 800 : 600,
                      color: isCurrent ? '#2563eb' : isPastOrCurrent ? '#0f172a' : '#94a3b8',
                      display: 'block',
                    }}
                  >
                    {st.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Assigned Technician Profile & Direct Contact Card */}
        {tech && (
          <div className="card" style={{ marginBottom: '20px', padding: '22px' }}>
            <span className="mini-tile-label" style={{ marginBottom: '12px' }}>
              ASSIGNED FIELD SPECIALIST
            </span>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #1e40af 0%, #2563eb 100%)',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: '18px',
                    boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)',
                  }}
                >
                  {tech.full_name?.slice(0, 2).toUpperCase() || 'SP'}
                </div>

                <div>
                  <h3 style={{ margin: '0 0 4px', fontSize: '18px' }}>{tech.full_name}</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#059669', fontWeight: 600 }}>
                    <Icons.Shield />
                    <span>Verified Professional · {tech.skills || 'Certified Technician'}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="row" style={{ margin: 0, gap: '8px' }}>
                {tech.phone && (
                  <a href={`tel:${tech.phone}`}>
                    <button
                      type="button"
                      className="ghost"
                      style={{
                        padding: '9px 16px',
                        fontSize: '13px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        margin: 0,
                      }}
                    >
                      <Icons.Phone />
                      <span>Call</span>
                    </button>
                  </a>
                )}

                {cleanTechPhone && (
                  <a
                    href={`https://wa.me/${cleanTechPhone}?text=${encodeURIComponent(
                      `Hello ${tech.full_name}, this is regarding service order #${req.request_no}:`
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <button
                      type="button"
                      style={{
                        background: '#059669',
                        color: '#fff',
                        padding: '9px 16px',
                        fontSize: '13px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        margin: 0,
                      }}
                    >
                      <Icons.WhatsApp />
                      <span>WhatsApp</span>
                    </button>
                  </a>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Live Diagnostic & Operational Notes Feed */}
        {(req.tech_notes || req.work_done) && (
          <div className="card" style={{ marginBottom: '20px', padding: '22px' }}>
            <h3 style={{ margin: '0 0 14px', fontSize: '16px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Icons.Wrench />
              <span>Real-Time Diagnostic & Field Activity Log</span>
            </h3>

            {req.tech_notes && (
              <div style={{ background: '#f8fafc', borderLeft: '3px solid #2563eb', padding: '12px 16px', borderRadius: '0 8px 8px 0', marginBottom: '12px' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#2563eb', textTransform: 'uppercase' }}>
                  Technician Active Notes
                </span>
                <p style={{ margin: '4px 0 0', fontSize: '14px', color: '#1e293b' }}>
                  {req.tech_notes}
                </p>
              </div>
            )}

            {req.work_done && (
              <div style={{ background: '#ecfdf5', borderLeft: '3px solid #059669', padding: '12px 16px', borderRadius: '0 8px 8px 0' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#059669', textTransform: 'uppercase' }}>
                  Completed Work Summary
                </span>
                <p style={{ margin: '4px 0 0', fontSize: '14px', color: '#1e293b' }}>
                  {req.work_done}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Invoice Settlement Box (When Job is Done) */}
        {invoice && (
          <div
            className="card"
            style={{
              background: '#f8fafc',
              border: '2px solid #2563eb',
              borderRadius: '16px',
              padding: '24px',
              marginBottom: '20px',
              boxShadow: '0 10px 25px -5px rgba(37, 99, 235, 0.1)',
            }}
          >
            <div className="row" style={{ justifyContent: 'space-between', marginBottom: '12px' }}>
              <div>
                <span className="badge" style={{ background: '#eff6ff', color: '#2563eb' }}>
                  INVOICE #{invoice.invoice_no || 'READY'}
                </span>
                <h3 style={{ margin: '6px 0 2px', fontSize: '20px' }}>Service Work Completed</h3>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span className="muted" style={{ fontSize: '12px' }}>Total Amount</span>
                <div style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a' }}>
                  ₦{Number(invoice.amount || 0).toLocaleString()}
                </div>
              </div>
            </div>

            <p className="muted" style={{ fontSize: '14px', margin: '0 0 18px' }}>
              Your technician has finalized the work order. You can review your itemized charges and settle seamlessly via pre-funded wallet, card, or bank transfer.
            </p>

            <Link href="/login">
              <button style={{ width: '100%', fontSize: '15px', padding: '12px', margin: 0 }}>
                Review & Settle Invoice on Portal
              </button>
            </Link>
          </div>
        )}

        {/* Telemetry Refresh Footer */}
        <div style={{ textAlign: 'center', marginTop: '24px' }}>
          <p className="muted" style={{ fontSize: '12px' }}>
            Auto-refreshing via real-time satellite telemetry · Last updated at {lastRefreshed.toLocaleTimeString()}
          </p>
        </div>
      </main>
    </div>
  );
}

export default function TrackPage() {
  return (
    <Suspense fallback={<div className="wrap" style={{ textAlign: 'center', padding: '60px' }}><p className="muted">Loading FieldOps 360 live radar...</p></div>}>
      <LiveTrackingContent />
    </Suspense>
  );
}
