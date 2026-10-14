'use client';
import { useState } from 'react';
import Link from 'next/link';

// Clean, purposeful SVG vectors (Zero emojis, zero decorative glyphs)
const Icons = {
  Logo: () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
    </svg>
  ),
  Search: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  ),
  Check: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  ArrowRight: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  ),
  Shield: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  ),
  MapPin: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  ),
  FileText: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  ),
  Layers: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 2 7 12 12 22 7 12 2" />
      <polyline points="2 17 12 22 22 17" />
      <polyline points="2 12 12 17 22 12" />
    </svg>
  ),
  Clock: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  Menu: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  ),
  Close: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
  ChevronDown: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  ),
  Cross: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
  Terminal: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="4 17 10 11 4 5" />
      <line x1="12" y1="19" x2="20" y2="19" />
    </svg>
  ),
  Activity: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  ),
  Server: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="8" rx="2" ry="2" />
      <rect x="2" y="14" width="20" height="8" rx="2" ry="2" />
      <line x1="6" y1="6" x2="6.01" y2="6" />
      <line x1="6" y1="18" x2="6.01" y2="18" />
    </svg>
  ),
};

const MODULE_TABS = [
  {
    id: 'dispatch',
    label: 'Dispatch Board',
    role: 'Operations Manager Console',
    title: 'Real time schedule and technician allocation',
    desc: 'Filter incoming requests by priority, check technician certifications, and route jobs based on current GPS location and van inventory.',
    tableHeaders: ['Work Order', 'Customer', 'Service Type', 'Technician', 'Status'],
    rows: [
      { id: 'REQ-2026-000412', client: 'Sterling Logistics Facility', service: 'Commercial Solar Inverter Repair', tech: 'Marcus Vance', status: 'En Route (8 mins)' },
      { id: 'REQ-2026-000415', client: 'Apex Cold Chain Systems', service: 'Industrial Chiller Diagnostics', tech: 'David Kalu', status: 'In Progress' },
      { id: 'REQ-2026-000418', client: 'Northgate Medical Complex', service: 'Emergency Generator Overhaul', tech: 'Aisha Bello', status: 'Arrived On Site' },
      { id: 'REQ-2026-000422', client: 'Continental Towers', service: '3-Phase Switchgear Calibration', tech: 'Emeka Obi', status: 'Dispatched' },
    ],
  },
  {
    id: 'mobile',
    label: 'Technician Mobile',
    role: 'Field Crew Application',
    title: 'Offline job execution with verified sign-off',
    desc: 'Technicians review scope requirements, enter voltage readings, record replaced components, and capture client signatures directly on mobile glass.',
    checklist: [
      'Diagnostic checklist verified and recorded with geolocation timestamp',
      'Inventory deduction linked to warehouse stock database',
      'Customer digital signature captured on mobile screen',
      'Local storage queue caches data during cellular network drops',
    ],
  },
  {
    id: 'customer',
    label: 'Customer Radar',
    role: 'Live Client Telemetry',
    title: 'Transparent tracking link delivered via WhatsApp and SMS',
    desc: 'Customers open a secure direct tracking interface to see live arrival estimates, view technician profile badges, and inspect field activity logs.',
    milestones: [
      { step: '1', name: 'Dispatched', detail: 'Technician assigned to work order' },
      { step: '2', name: 'En Route', detail: 'Dynamic arrival calculation active' },
      { step: '3', name: 'Arrived', detail: 'Specialist verified on site' },
      { step: '4', name: 'In Progress', detail: 'Diagnostic tests and repairs under way' },
      { step: '5', name: 'Completed', detail: 'Work order signed and invoice ready' },
    ],
  },
  {
    id: 'billing',
    label: 'Invoicing & Ledgers',
    role: 'Finance and Accounting',
    title: 'Itemized settlement upon completion of work',
    desc: 'Work order completion triggers instant itemized invoicing. Clients settle via pre-funded corporate wallet, card payment, or direct bank transfer.',
    summary: {
      orderNo: 'REQ-2026-000412',
      invoiceNo: 'INV-2026-000412',
      items: [
        { desc: 'Solar Inverter Diagnostic & Calibration', cost: '₦35,000' },
        { desc: '50A High-Voltage DC Circuit Breaker Replacement', cost: '₦28,500' },
        { desc: 'Certified Labour and On-Site Inspection', cost: '₦20,000' },
      ],
      total: '₦83,500',
      settlementStatus: 'Settled via Corporate Wallet',
    },
  },
];

const FAQS = [
  {
    q: 'How does offline data synchronization work during cellular disconnects?',
    a: 'The technician terminal stores job forms, diagnostic checklists, and touch signatures in a persistent local queue. Once cellular reception resumes, entries synchronize sequentially with PostgreSQL without data loss.',
  },
  {
    q: 'How is contractor company data separated from other organizations?',
    a: 'Multi-tenant isolation is enforced at the database layer using PostgreSQL Row Level Security. Database queries execute in scoped tenant boundaries, guaranteeing zero cross-company data visibility.',
  },
  {
    q: 'Can customers track their assigned technician without creating an account?',
    a: 'Yes. Customers receive a secure direct web tracking link via WhatsApp or SMS. Opening the link reveals live GPS coordinates, specialist credentials, and status milestones without requiring sign in.',
  },
  {
    q: 'Can operations managers track equipment warranties and past work history?',
    a: 'Every work order links to customer equipment records by serial number and asset tag. Technicians and managers can review past service dates, replaced parts, and warranty expiration dates on site.',
  },
  {
    q: 'What payment methods are supported for commercial invoicing?',
    a: 'Clients can settle work orders directly through pre-funded corporate credit balances, card payments, or verified corporate bank transfer reconciliation upon signature approval.',
  },
];

export default function LandingPage() {
  const [activeTab, setActiveTab] = useState(0);
  const [trackQuery, setTrackQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  const currentTab = MODULE_TABS[activeTab];

  const handleTrackSubmit = (e) => {
    e.preventDefault();
    const query = trackQuery.trim();
    if (query) {
      window.location.href = `/track?no=${encodeURIComponent(query)}`;
    } else {
      window.location.href = '/track?no=REQ-DEMO-4109';
    }
  };

  const toggleFaq = (idx) => {
    setOpenFaq(openFaq === idx ? null : idx);
  };

  return (
    <div style={{ background: '#ffffff', color: '#0f172a', minHeight: '100vh', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Inter", "Helvetica Neue", Arial, sans-serif' }}>
      
      {/* Top Enterprise Navigation */}
      <header style={{ borderBottom: '1px solid #e2e8f0', background: '#ffffff', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: 1240, margin: '0 auto', padding: '0 20px', height: 72, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
            <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', color: '#0f172a' }}>
              <div style={{ width: 34, height: 34, borderRadius: 8, background: '#2563eb', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icons.Logo />
              </div>
              <div>
                <span style={{ fontSize: 18, fontWeight: 800, letterSpacing: '-0.02em', display: 'block', lineHeight: 1.1 }}>FieldOps 360</span>
                <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Operations Platform</span>
              </div>
            </Link>

            <nav style={{ display: 'flex', gap: 24 }} className="desktop-nav">
              <a href="#capabilities" style={{ fontSize: 14, fontWeight: 600, color: '#475569', textDecoration: 'none' }}>Capabilities</a>
              <a href="#cockpit" style={{ fontSize: 14, fontWeight: 600, color: '#475569', textDecoration: 'none' }}>Live Telemetry</a>
              <a href="#console" style={{ fontSize: 14, fontWeight: 600, color: '#475569', textDecoration: 'none' }}>Operations Console</a>
              <a href="#architecture" style={{ fontSize: 14, fontWeight: 600, color: '#475569', textDecoration: 'none' }}>Architecture</a>
              <a href="#tracking" style={{ fontSize: 14, fontWeight: 600, color: '#475569', textDecoration: 'none' }}>Order Lookup</a>
              <a href="#faq" style={{ fontSize: 14, fontWeight: 600, color: '#475569', textDecoration: 'none' }}>FAQ</a>
            </nav>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div className="desktop-actions" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Link href="/login" style={{ fontSize: 14, fontWeight: 600, color: '#334155', textDecoration: 'none', padding: '8px 14px' }}>
                Sign In
              </Link>
              <Link href="/login?mode=signup" style={{ fontSize: 14, fontWeight: 700, color: '#ffffff', background: '#2563eb', textDecoration: 'none', padding: '9px 18px', borderRadius: 7 }}>
                Start Free Trial
              </Link>
            </div>

            {/* Mobile Hamburger Button */}
            <button
              type="button"
              className="mobile-menu-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              style={{
                display: 'none',
                background: 'transparent',
                border: '1px solid #cbd5e1',
                borderRadius: 6,
                padding: '6px 8px',
                color: '#0f172a',
                cursor: 'pointer',
                margin: 0,
              }}
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <Icons.Close /> : <Icons.Menu />}
            </button>
          </div>

        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div style={{ borderTop: '1px solid #e2e8f0', background: '#ffffff', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            <a href="#capabilities" onClick={() => setMobileMenuOpen(false)} style={{ fontSize: 15, fontWeight: 600, color: '#334155', textDecoration: 'none', padding: '8px 0' }}>Capabilities</a>
            <a href="#cockpit" onClick={() => setMobileMenuOpen(false)} style={{ fontSize: 15, fontWeight: 600, color: '#334155', textDecoration: 'none', padding: '8px 0' }}>Live Telemetry</a>
            <a href="#console" onClick={() => setMobileMenuOpen(false)} style={{ fontSize: 15, fontWeight: 600, color: '#334155', textDecoration: 'none', padding: '8px 0' }}>Operations Console</a>
            <a href="#architecture" onClick={() => setMobileMenuOpen(false)} style={{ fontSize: 15, fontWeight: 600, color: '#334155', textDecoration: 'none', padding: '8px 0' }}>Architecture</a>
            <a href="#tracking" onClick={() => setMobileMenuOpen(false)} style={{ fontSize: 15, fontWeight: 600, color: '#334155', textDecoration: 'none', padding: '8px 0' }}>Order Lookup</a>
            <a href="#faq" onClick={() => setMobileMenuOpen(false)} style={{ fontSize: 15, fontWeight: 600, color: '#334155', textDecoration: 'none', padding: '8px 0' }}>FAQ</a>
            <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <Link href="/login" onClick={() => setMobileMenuOpen(false)} style={{ textAlign: 'center', padding: '10px', borderRadius: 6, border: '1px solid #cbd5e1', color: '#0f172a', textDecoration: 'none', fontWeight: 600, fontSize: 14 }}>
                Sign In to Portal
              </Link>
              <Link href="/login?mode=signup" onClick={() => setMobileMenuOpen(false)} style={{ textAlign: 'center', padding: '10px', borderRadius: 6, background: '#2563eb', color: '#ffffff', textDecoration: 'none', fontWeight: 700, fontSize: 14 }}>
                Start Free Trial
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section style={{ padding: '68px 20px 56px', background: '#ffffff', borderBottom: '1px solid #e2e8f0' }}>
        <div style={{ maxWidth: 1040, margin: '0 auto', textAlign: 'center' }}>
          
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 14px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 20, fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 24 }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#2563eb' }}></span>
            <span>Field Operations Infrastructure 3.2 · Proximity Dispatch Engine</span>
          </div>

          <h1 style={{ fontSize: 'clamp(30px, 4.8vw, 56px)', fontWeight: 850, letterSpacing: '-0.035em', lineHeight: 1.12, color: '#0f172a', margin: '0 0 22px' }}>
            The mission-critical control plane for commercial service fleets
          </h1>

          <p style={{ fontSize: 'clamp(16px, 1.9vw, 20px)', color: '#475569', lineHeight: 1.6, maxWidth: 760, margin: '0 auto 34px' }}>
            Coordinate high-volume work orders, route certified specialists by proximity, execute offline diagnostics on mobile glass, and reconcile itemized invoices upon customer sign-off.
          </p>

          {/* Clean, Restrained Action Pair: Exactly Two Primary CTAs */}
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 14, flexWrap: 'wrap', marginBottom: 20 }}>
            <Link href="/login?mode=signup" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '13px 26px', background: '#2563eb', color: '#ffffff', borderRadius: 8, fontWeight: 700, fontSize: 15, textDecoration: 'none' }}>
              <span>Start Free Trial</span>
              <Icons.ArrowRight />
            </Link>
            <Link href="/track?no=REQ-DEMO-4109" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '13px 24px', background: '#f1f5f9', color: '#0f172a', border: '1px solid #cbd5e1', borderRadius: 8, fontWeight: 600, fontSize: 15, textDecoration: 'none' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981' }}></span>
              <span>View Live Dispatch Radar</span>
            </Link>
          </div>

          <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 48px' }}>
            Instant tenant setup · Zero credit card required · SOC 2 and ISO 27001 aligned architecture
          </p>

          {/* Enterprise Cockpit Visual: Realistic Production Interface Showcase */}
          <div id="cockpit" style={{ textAlign: 'left', background: '#090d16', border: '1px solid #1e293b', borderRadius: 14, overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.4)' }}>
            
            {/* Cockpit Window Titlebar */}
            <div style={{ background: '#0f172a', padding: '12px 18px', borderBottom: '1px solid #1e293b', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ display: 'flex', gap: 6 }}>
                  <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#ef4444', display: 'inline-block' }}></span>
                  <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#f59e0b', display: 'inline-block' }}></span>
                  <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#10b981', display: 'inline-block' }}></span>
                </div>
                <span style={{ fontSize: 12, fontFamily: 'monospace', color: '#94a3b8' }}>
                  control.fieldops360.internal/dispatch/live-grid
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 4, background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981' }}></span>
                  Telemetry Active
                </span>
                <span style={{ fontSize: 12, color: '#64748b' }}>Region: Lagos Hub</span>
              </div>
            </div>

            {/* Split Screen Dispatch & Telemetry Cockpit */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 0 }}>
              
              {/* Left Column: Live Work Order Stream */}
              <div style={{ padding: '20px', borderRight: '1px solid #1e293b' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Active Work Orders (48 Dispatched)
                  </span>
                  <span style={{ fontSize: 11, color: '#38bdf8', fontFamily: 'monospace' }}>Auto-Sync: 6s</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 8, padding: '12px 14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#f8fafc' }}>REQ-2026-4109</span>
                      <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 4, background: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa', fontWeight: 600 }}>En Route (8 mins)</span>
                    </div>
                    <div style={{ fontSize: 13, color: '#94a3b8', marginBottom: 4 }}>Solar Inverter Diagnostic & Overhaul</div>
                    <div style={{ fontSize: 12, color: '#64748b' }}>Specialist: Marcus Vance · Lekki Phase 1</div>
                  </div>

                  <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 8, padding: '12px 14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#f8fafc' }}>REQ-2026-4112</span>
                      <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 4, background: 'rgba(16, 185, 129, 0.2)', color: '#34d399', fontWeight: 600 }}>In Progress</span>
                    </div>
                    <div style={{ fontSize: 13, color: '#94a3b8', marginBottom: 4 }}>Industrial Chiller Compressor Overhaul</div>
                    <div style={{ fontSize: 12, color: '#64748b' }}>Specialist: David Kalu · Victoria Island</div>
                  </div>

                  <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 8, padding: '12px 14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#f8fafc' }}>REQ-2026-4118</span>
                      <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 4, background: 'rgba(245, 158, 11, 0.2)', color: '#fbbf24', fontWeight: 600 }}>Completed & Invoiced</span>
                    </div>
                    <div style={{ fontSize: 13, color: '#94a3b8', marginBottom: 4 }}>Backup Generator 3-Phase Calibration</div>
                    <div style={{ fontSize: 12, color: '#64748b' }}>Specialist: Aisha Bello · Ikeja Industrial</div>
                  </div>
                </div>
              </div>

              {/* Right Column: Active Proximity Telemetry */}
              <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      GPS Satellite Radar (Marcus Vance)
                    </span>
                    <span style={{ fontSize: 12, color: '#10b981', fontWeight: 600 }}>Speed: 38 km/h</span>
                  </div>

                  <div style={{ background: '#020617', border: '1px solid #1e293b', borderRadius: 8, padding: '16px', marginBottom: 14 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                      <span style={{ fontSize: 12, color: '#64748b' }}>Destination</span>
                      <span style={{ fontSize: 13, fontWeight: 600, color: '#e2e8f0' }}>Plot 14 Admiralty Way, Lekki</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                      <span style={{ fontSize: 12, color: '#64748b' }}>Current Proximity</span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#38bdf8' }}>1.4 km (ETA 8 mins)</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 12, color: '#64748b' }}>Mobile Terminal State</span>
                      <span style={{ fontSize: 12, color: '#34d399', fontWeight: 600 }}>Offline Cache Synchronized</span>
                    </div>
                  </div>

                  {/* Operational Timeline Mini Track */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderTop: '1px solid #1e293b' }}>
                    <span style={{ fontSize: 11, color: '#34d399', fontWeight: 700 }}>1. Dispatched</span>
                    <span style={{ fontSize: 11, color: '#60a5fa', fontWeight: 700 }}>2. En Route</span>
                    <span style={{ fontSize: 11, color: '#64748b' }}>3. Arrived</span>
                    <span style={{ fontSize: 11, color: '#64748b' }}>4. Work Done</span>
                    <span style={{ fontSize: 11, color: '#64748b' }}>5. Settled</span>
                  </div>
                </div>

                <div style={{ paddingTop: 14 }}>
                  <Link href="/track?no=REQ-DEMO-4109" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, width: '100%', padding: '10px', background: '#1e293b', color: '#f8fafc', borderRadius: 6, fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>
                    <span>Open Live Radar Telemetry</span>
                    <Icons.ArrowRight />
                  </Link>
                </div>
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* Enterprise Telemetry Metrics Strip */}
      <section style={{ borderBottom: '1px solid #e2e8f0', background: '#ffffff', padding: '32px 20px' }}>
        <div style={{ maxWidth: 1140, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 24 }}>
          <div style={{ textAlign: 'center', padding: '8px' }}>
            <div style={{ fontSize: 30, fontWeight: 850, color: '#0f172a', letterSpacing: '-0.03em' }}>99.98%</div>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', marginTop: 4 }}>Platform Dispatch Uptime</div>
          </div>
          <div style={{ textAlign: 'center', padding: '8px' }}>
            <div style={{ fontSize: 30, fontWeight: 850, color: '#0f172a', letterSpacing: '-0.03em' }}>&lt; 4.2 mins</div>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', marginTop: 4 }}>Average Proximity Allocation</div>
          </div>
          <div style={{ textAlign: 'center', padding: '8px' }}>
            <div style={{ fontSize: 30, fontWeight: 850, color: '#0f172a', letterSpacing: '-0.03em' }}>100%</div>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', marginTop: 4 }}>Offline Diagnostic Sync</div>
          </div>
          <div style={{ textAlign: 'center', padding: '8px' }}>
            <div style={{ fontSize: 30, fontWeight: 850, color: '#2563eb', letterSpacing: '-0.03em' }}>PostgreSQL RLS</div>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', marginTop: 4 }}>Tenant Data Isolation</div>
          </div>
        </div>
      </section>

      {/* Bento Grid Architecture: Varied, Purposeful Capabilities */}
      <section id="capabilities" style={{ padding: '80px 20px', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ marginBottom: 48, textAlign: 'center' }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 8 }}>
            Core Platform Capabilities
          </span>
          <h2 style={{ fontSize: 'clamp(26px, 3.8vw, 36px)', fontWeight: 800, letterSpacing: '-0.025em', margin: 0, color: '#0f172a' }}>
            Designed for the realities of field execution
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 24 }}>
          
          {/* Card 1 (Large 8 cols): Intelligent Dispatch & Proximity Routing */}
          <div style={{ gridColumn: 'span 12', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 14, padding: '32px' }} className="bento-span-8">
            <div style={{ width: 42, height: 42, borderRadius: 8, background: '#2563eb', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
              <Icons.Layers />
            </div>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Intelligent Routing Engine
            </span>
            <h3 style={{ fontSize: 22, fontWeight: 800, margin: '6px 0 12px', color: '#0f172a' }}>
              Automated Proximity Dispatch and Route Scheduling
            </h3>
            <p style={{ fontSize: 15, color: '#475569', lineHeight: 1.6, maxWidth: 680, margin: '0 0 24px' }}>
              Match inbound tickets instantly with the nearest certified specialist based on trade qualifications, real-time geolocation coordinates, and van spare part stock levels. Eliminates dispatcher guesswork and slashes travel delays.
            </p>
            <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', borderTop: '1px solid #e2e8f0', paddingTop: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#334155', fontWeight: 600 }}>
                <div style={{ color: '#2563eb' }}><Icons.Check /></div>
                <span>Haversine distance calculation</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#334155', fontWeight: 600 }}>
                <div style={{ color: '#2563eb' }}><Icons.Check /></div>
                <span>Multi-tier certification matching</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#334155', fontWeight: 600 }}>
                <div style={{ color: '#2563eb' }}><Icons.Check /></div>
                <span>Zero manual dispatch bottlenecks</span>
              </div>
            </div>
          </div>

          {/* Card 2 (4 cols): Offline-First Field Engine */}
          <div style={{ gridColumn: 'span 12', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 14, padding: '32px' }} className="bento-span-4">
            <div style={{ width: 42, height: 42, borderRadius: 8, background: '#0f172a', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
              <Icons.Activity />
            </div>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Field Resilience
            </span>
            <h3 style={{ fontSize: 20, fontWeight: 800, margin: '6px 0 12px', color: '#0f172a' }}>
              Offline-First Mobile Engine
            </h3>
            <p style={{ fontSize: 14, color: '#475569', lineHeight: 1.6, margin: '0 0 18px' }}>
              Basements and remote plant facilities lose cellular connections. Technicians log diagnostics, deduct materials, and capture touch signatures locally. Data synchronizes automatically upon reconnect.
            </p>
            <div style={{ padding: '10px 12px', background: '#f8fafc', borderRadius: 6, fontSize: 12, color: '#334155', fontWeight: 600, border: '1px solid #e2e8f0' }}>
              Persistent Local Queue with Idempotent Replay
            </div>
          </div>

          {/* Card 3 (4 cols): Multi-Tenant Isolation */}
          <div style={{ gridColumn: 'span 12', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 14, padding: '32px' }} className="bento-span-4">
            <div style={{ width: 42, height: 42, borderRadius: 8, background: '#0f172a', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
              <Icons.Shield />
            </div>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Enterprise Security
            </span>
            <h3 style={{ fontSize: 20, fontWeight: 800, margin: '6px 0 12px', color: '#0f172a' }}>
              Row Level Security Isolation
            </h3>
            <p style={{ fontSize: 14, color: '#475569', lineHeight: 1.6, margin: '0 0 18px' }}>
              Multi-tenant contractor separation is locked down at the database kernel. Queries run within isolated tenant boundaries, ensuring zero data leakage across organizations.
            </p>
            <div style={{ padding: '10px 12px', background: '#f8fafc', borderRadius: 6, fontSize: 12, color: '#334155', fontWeight: 600, border: '1px solid #e2e8f0' }}>
              Database-Enforced Tenant Scoping
            </div>
          </div>

          {/* Card 4 (Large 8 cols): Digital Settlement & Telemetry */}
          <div style={{ gridColumn: 'span 12', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 14, padding: '32px' }} className="bento-span-8">
            <div style={{ width: 42, height: 42, borderRadius: 8, background: '#2563eb', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
              <Icons.FileText />
            </div>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Commercial Closure
            </span>
            <h3 style={{ fontSize: 22, fontWeight: 800, margin: '6px 0 12px', color: '#0f172a' }}>
              On-Glass Digital Sign-Off and Automated Invoicing
            </h3>
            <p style={{ fontSize: 15, color: '#475569', lineHeight: 1.6, maxWidth: 680, margin: '0 0 24px' }}>
              Completed jobs trigger immediate itemized invoicing based on certified labor rates and parts consumed. Clients sign directly on device glass and receive instantaneous WhatsApp dispatch alerts with invoice settlement links.
            </p>
            <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', borderTop: '1px solid #e2e8f0', paddingTop: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#334155', fontWeight: 600 }}>
                <div style={{ color: '#2563eb' }}><Icons.Check /></div>
                <span>Itemized parts deduction ledger</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#334155', fontWeight: 600 }}>
                <div style={{ color: '#2563eb' }}><Icons.Check /></div>
                <span>Corporate wallet and bank settlement</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#334155', fontWeight: 600 }}>
                <div style={{ color: '#2563eb' }}><Icons.Check /></div>
                <span>Instant WhatsApp customer alerts</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Interactive Operations Console */}
      <section id="console" style={{ padding: '80px 20px', background: '#0f172a', color: '#ffffff' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          
          <div style={{ marginBottom: 40, textAlign: 'center' }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#60a5fa', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 8 }}>
              Interactive Console
            </span>
            <h2 style={{ fontSize: 'clamp(26px, 3.8vw, 36px)', fontWeight: 800, letterSpacing: '-0.025em', margin: '0 0 12px', color: '#ffffff' }}>
              Test the core role-based interfaces
            </h2>
            <p style={{ fontSize: 15, color: '#94a3b8', margin: 0 }}>
              Inspect live mock data across manager, field technician, customer, and finance views.
            </p>
          </div>

          {/* Tab Selector Buttons */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 28, flexWrap: 'wrap' }}>
            {MODULE_TABS.map((tab, idx) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(idx)}
                style={{
                  padding: '10px 18px',
                  borderRadius: 6,
                  border: activeTab === idx ? '1px solid #3b82f6' : '1px solid #334155',
                  background: activeTab === idx ? '#1e293b' : 'transparent',
                  color: activeTab === idx ? '#ffffff' : '#94a3b8',
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer',
                  margin: 0,
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content Preview Card */}
          <div style={{ background: '#020617', border: '1px solid #1e293b', borderRadius: 12, padding: '24px' }}>
            <div style={{ borderBottom: '1px solid #1e293b', paddingBottom: 20, marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
              <div>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#60a5fa', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {currentTab.role}
                </span>
                <h3 style={{ fontSize: 20, fontWeight: 700, color: '#ffffff', margin: '4px 0 0' }}>
                  {currentTab.title}
                </h3>
              </div>
              <p style={{ fontSize: 13, color: '#94a3b8', maxWidth: 440, margin: 0 }}>
                {currentTab.desc}
              </p>
            </div>

            {/* Display: Dispatch Table */}
            {currentTab.id === 'dispatch' && (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, textAlign: 'left', minWidth: 600 }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #334155', color: '#94a3b8' }}>
                      {currentTab.tableHeaders.map((h, i) => (
                        <th key={i} style={{ padding: '12px 14px', fontWeight: 600 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {currentTab.rows.map((row, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #1e293b' }}>
                        <td style={{ padding: '14px', fontFamily: 'monospace', color: '#60a5fa', fontWeight: 600 }}>{row.id}</td>
                        <td style={{ padding: '14px', color: '#e2e8f0' }}>{row.client}</td>
                        <td style={{ padding: '14px', color: '#cbd5e1' }}>{row.service}</td>
                        <td style={{ padding: '14px', color: '#e2e8f0' }}>{row.tech}</td>
                        <td style={{ padding: '14px' }}>
                          <span style={{ padding: '4px 10px', borderRadius: 4, background: '#1e293b', color: '#38bdf8', fontSize: 12, fontWeight: 600 }}>
                            {row.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Display: Technician Mobile Checklist */}
            {currentTab.id === 'mobile' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
                {currentTab.checklist.map((item, idx) => (
                  <div key={idx} style={{ padding: 18, background: '#0f172a', border: '1px solid #1e293b', borderRadius: 8, display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <div style={{ color: '#10b981', marginTop: 2 }}>
                      <Icons.Check />
                    </div>
                    <span style={{ fontSize: 14, color: '#e2e8f0', lineHeight: 1.5 }}>{item}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Display: Customer Milestones */}
            {currentTab.id === 'customer' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 14 }}>
                {currentTab.milestones.map((m, idx) => (
                  <div key={idx} style={{ padding: 18, background: '#0f172a', border: '1px solid #1e293b', borderRadius: 8 }}>
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#2563eb', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, marginBottom: 12 }}>
                      {m.step}
                    </div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: '#ffffff', marginBottom: 4 }}>{m.name}</div>
                    <div style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.4 }}>{m.detail}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Display: Billing Ledger */}
            {currentTab.id === 'billing' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 18, paddingBottom: 12, borderBottom: '1px solid #1e293b', flexWrap: 'wrap', gap: 8 }}>
                  <span style={{ fontSize: 14, color: '#94a3b8' }}>Order Reference: <strong style={{ color: '#ffffff' }}>{currentTab.summary.orderNo}</strong></span>
                  <span style={{ fontSize: 14, color: '#94a3b8' }}>Invoice Reference: <strong style={{ color: '#ffffff' }}>{currentTab.summary.invoiceNo}</strong></span>
                </div>
                {currentTab.summary.items.map((it, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #0f172a', fontSize: 14 }}>
                    <span style={{ color: '#cbd5e1' }}>{it.desc}</span>
                    <span style={{ fontWeight: 600, color: '#ffffff' }}>{it.cost}</span>
                  </div>
                ))}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 18, paddingTop: 14, borderTop: '1px solid #334155' }}>
                  <span style={{ fontSize: 16, fontWeight: 700, color: '#ffffff' }}>Total Amount</span>
                  <span style={{ fontSize: 20, fontWeight: 800, color: '#38bdf8' }}>{currentTab.summary.total}</span>
                </div>
                <div style={{ marginTop: 12, padding: '8px 12px', background: '#064e3b', borderRadius: 6, fontSize: 12, color: '#a7f3d0', fontWeight: 600, display: 'inline-block' }}>
                  {currentTab.summary.settlementStatus}
                </div>
              </div>
            )}

          </div>

        </div>
      </section>

      {/* Dedicated Customer Tracking Radar Section */}
      <section id="tracking" style={{ padding: '80px 20px', background: '#f8fafc', borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0' }}>
        <div style={{ maxWidth: 740, margin: '0 auto', textAlign: 'center' }}>
          
          <span style={{ fontSize: 12, fontWeight: 700, color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 8 }}>
            Customer Experience
          </span>
          <h2 style={{ fontSize: 'clamp(24px, 3.5vw, 32px)', fontWeight: 800, letterSpacing: '-0.02em', margin: '0 0 12px', color: '#0f172a' }}>
            Live Work Order Tracking Radar
          </h2>
          <p style={{ fontSize: 15, color: '#475569', margin: '0 0 32px' }}>
            Customers follow real-time technician GPS arrival coordinates, inspect credential verification, and monitor diagnostics without account registration.
          </p>

          <div style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: 12, padding: '24px', boxShadow: '0 4px 16px rgba(15, 23, 42, 0.05)' }}>
            <form onSubmit={handleTrackSubmit} style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: 240, display: 'flex', alignItems: 'center', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: 8, padding: '0 12px' }}>
                <div style={{ color: '#64748b', display: 'flex', alignItems: 'center' }}>
                  <Icons.Search />
                </div>
                <input
                  type="text"
                  placeholder="Enter work order number, for example REQ-DEMO-4109"
                  value={trackQuery}
                  onChange={(e) => setTrackQuery(e.target.value)}
                  style={{ flex: 1, border: 'none', outline: 'none', padding: '12px 10px', fontSize: 14, color: '#0f172a', background: 'transparent' }}
                />
              </div>
              <button type="submit" style={{ margin: 0, padding: '12px 24px', background: '#0f172a', color: '#ffffff', borderRadius: 8, fontSize: 14, fontWeight: 700, border: 'none', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                Track Order
              </button>
            </form>

            <div style={{ marginTop: 18, paddingTop: 16, borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
              <span style={{ fontSize: 12, color: '#64748b' }}>Need an immediate test order?</span>
              <Link href="/track?no=REQ-DEMO-4109" style={{ fontSize: 13, fontWeight: 700, color: '#2563eb', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <span>Launch Interactive Demo Radar (REQ-DEMO-4109)</span>
                <Icons.ArrowRight />
              </Link>
            </div>
          </div>

        </div>
      </section>

      {/* Architecture & Security Specifications */}
      <section id="architecture" style={{ padding: '80px 20px', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ marginBottom: 48, textAlign: 'center' }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 8 }}>
            Enterprise Specifications
          </span>
          <h2 style={{ fontSize: 'clamp(26px, 3.8vw, 36px)', fontWeight: 800, letterSpacing: '-0.025em', margin: 0, color: '#0f172a' }}>
            Security, compliance, and infrastructure design
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
          
          <div style={{ border: '1px solid #e2e8f0', borderRadius: 10, padding: 24, background: '#ffffff' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <div style={{ color: '#2563eb' }}><Icons.Shield /></div>
              <h4 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: '#0f172a' }}>Row Level Security Isolation</h4>
            </div>
            <p style={{ fontSize: 14, color: '#475569', lineHeight: 1.6, margin: 0 }}>
              Tenant data separation is strictly enforced at the database query level using PostgreSQL Row Level Security. Data cross-access between different contractor accounts is mathematically impossible.
            </p>
          </div>

          <div style={{ border: '1px solid #e2e8f0', borderRadius: 10, padding: 24, background: '#ffffff' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <div style={{ color: '#2563eb' }}><Icons.Layers /></div>
              <h4 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: '#0f172a' }}>Role Permission Hierarchies</h4>
            </div>
            <p style={{ fontSize: 14, color: '#475569', lineHeight: 1.6, margin: 0 }}>
              Dedicated access interfaces for Super Admins, Operations Managers, Field Crew Technicians, Finance Accountants, and Customers. Every role is strictly scoped to necessary functions.
            </p>
          </div>

          <div style={{ border: '1px solid #e2e8f0', borderRadius: 10, padding: 24, background: '#ffffff' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <div style={{ color: '#2563eb' }}><Icons.Clock /></div>
              <h4 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: '#0f172a' }}>Immutable Audit Logging</h4>
            </div>
            <p style={{ fontSize: 14, color: '#475569', lineHeight: 1.6, margin: 0 }}>
              Work order assignments, technician notes, status changes, and customer approvals write append-only audit records containing timestamps and actor identifications.
            </p>
          </div>

          <div style={{ border: '1px solid #e2e8f0', borderRadius: 10, padding: 24, background: '#ffffff' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <div style={{ color: '#2563eb' }}><Icons.FileText /></div>
              <h4 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: '#0f172a' }}>Equipment Asset Ledger</h4>
            </div>
            <p style={{ fontSize: 14, color: '#475569', lineHeight: 1.6, margin: 0 }}>
              Every service visit links to customer equipment records by serial number, installation date, and past service logs. Potential warranty issues are flagged automatically.
            </p>
          </div>

          <div style={{ border: '1px solid #e2e8f0', borderRadius: 10, padding: 24, background: '#ffffff' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <div style={{ color: '#2563eb' }}><Icons.MapPin /></div>
              <h4 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: '#0f172a' }}>Direct WhatsApp & SMS Routing</h4>
            </div>
            <p style={{ fontSize: 14, color: '#475569', lineHeight: 1.6, margin: 0 }}>
              Automated notifications send diagnostic notes and invoice links straight to customer WhatsApp or SMS with pre-formatted links requiring zero password login.
            </p>
          </div>

          <div style={{ border: '1px solid #e2e8f0', borderRadius: 10, padding: 24, background: '#ffffff' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <div style={{ color: '#2563eb' }}><Icons.Server /></div>
              <h4 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: '#0f172a' }}>Reliable Offline Data Store</h4>
            </div>
            <p style={{ fontSize: 14, color: '#475569', lineHeight: 1.6, margin: 0 }}>
              Local storage queues hold diagnostic data safely during cellular disconnects. Operations replay and synchronize accurately once technicians return to network coverage.
            </p>
          </div>

        </div>
      </section>

      {/* 5-Step Workflow Section */}
      <section id="workflow" style={{ padding: '80px 20px', background: '#f8fafc', borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          
          <div style={{ marginBottom: 48, textAlign: 'center' }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 8 }}>
              End to End Lifecycle
            </span>
            <h2 style={{ fontSize: 'clamp(26px, 3.8vw, 36px)', fontWeight: 800, letterSpacing: '-0.025em', margin: 0, color: '#0f172a' }}>
              How field service operations run on FieldOps 360
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 18 }}>
            
            <div style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: 8, padding: 20 }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: '#2563eb', marginBottom: 8 }}>STAGE 1</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', marginBottom: 6 }}>Request Intake</div>
              <p style={{ fontSize: 13, color: '#475569', lineHeight: 1.5, margin: 0 }}>
                Customer submits service requirements with site location, requested schedule, and equipment details.
              </p>
            </div>

            <div style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: 8, padding: 20 }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: '#2563eb', marginBottom: 8 }}>STAGE 2</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', marginBottom: 6 }}>Dispatch Allocation</div>
              <p style={{ fontSize: 13, color: '#475569', lineHeight: 1.5, margin: 0 }}>
                Operations Manager reviews skill criteria and dispatches nearest available certified specialist.
              </p>
            </div>

            <div style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: 8, padding: 20 }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: '#2563eb', marginBottom: 8 }}>STAGE 3</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', marginBottom: 6 }}>Travel & Arrival</div>
              <p style={{ fontSize: 13, color: '#475569', lineHeight: 1.5, margin: 0 }}>
                Customer receives automated WhatsApp dispatch alert with live arrival ETA and specialist contact profile.
              </p>
            </div>

            <div style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: 8, padding: 20 }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: '#2563eb', marginBottom: 8 }}>STAGE 4</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', marginBottom: 6 }}>Diagnostics & Sign-Off</div>
              <p style={{ fontSize: 13, color: '#475569', lineHeight: 1.5, margin: 0 }}>
                Technician logs operational notes, checks van inventory, and captures customer sign-off on mobile glass.
              </p>
            </div>

            <div style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: 8, padding: 20 }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: '#2563eb', marginBottom: 8 }}>STAGE 5</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', marginBottom: 6 }}>Itemized Settlement</div>
              <p style={{ fontSize: 13, color: '#475569', lineHeight: 1.5, margin: 0 }}>
                Itemized invoice generates immediately. Customer settles via corporate wallet, card, or direct transfer.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* Interactive FAQ Section */}
      <section id="faq" style={{ padding: '80px 20px', maxWidth: 900, margin: '0 auto' }}>
        <div style={{ marginBottom: 44, textAlign: 'center' }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 8 }}>
            Enterprise FAQ
          </span>
          <h2 style={{ fontSize: 'clamp(26px, 3.8vw, 36px)', fontWeight: 800, letterSpacing: '-0.025em', margin: 0, color: '#0f172a' }}>
            Frequently answered architectural questions
          </h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {FAQS.map((faq, idx) => (
            <div
              key={idx}
              style={{
                border: '1px solid #cbd5e1',
                borderRadius: 10,
                background: '#ffffff',
                overflow: 'hidden',
                transition: 'all 0.2s ease',
              }}
            >
              <button
                type="button"
                onClick={() => toggleFaq(idx)}
                style={{
                  width: '100%',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '18px 20px',
                  background: openFaq === idx ? '#f8fafc' : 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontSize: 15,
                  fontWeight: 700,
                  color: '#0f172a',
                  margin: 0,
                }}
              >
                <span>{faq.q}</span>
                <span style={{ transform: openFaq === idx ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease', color: '#64748b' }}>
                  <Icons.ChevronDown />
                </span>
              </button>
              {openFaq === idx && (
                <div style={{ padding: '0 20px 20px', background: '#f8fafc', borderTop: '1px solid #f1f5f9' }}>
                  <p style={{ margin: 0, paddingTop: 14, fontSize: 14, color: '#475569', lineHeight: 1.6 }}>
                    {faq.a}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Primary Call to Action Banner */}
      <section style={{ padding: '80px 20px', background: '#ffffff' }}>
        <div style={{ maxWidth: 940, margin: '0 auto', textAlign: 'center', border: '1px solid #cbd5e1', borderRadius: 16, padding: '48px 28px', background: '#0f172a', color: '#ffffff' }}>
          <h2 style={{ fontSize: 'clamp(26px, 3.5vw, 36px)', fontWeight: 800, color: '#ffffff', margin: '0 0 16px', letterSpacing: '-0.025em' }}>
            Ready to streamline your field service operations?
          </h2>
          <p style={{ fontSize: 16, color: '#94a3b8', maxWidth: 620, margin: '0 auto 32px', lineHeight: 1.6 }}>
            Join commercial maintenance contractors and engineering operations deploying FieldOps 360 across fleets.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 14, flexWrap: 'wrap' }}>
            <Link href="/login?mode=signup" style={{ padding: '13px 28px', background: '#2563eb', color: '#ffffff', borderRadius: 7, fontWeight: 700, fontSize: 15, textDecoration: 'none' }}>
              Start Free Trial
            </Link>
            <Link href="/track?no=REQ-DEMO-4109" style={{ padding: '13px 24px', background: '#1e293b', color: '#f8fafc', border: '1px solid #334155', borderRadius: 7, fontWeight: 600, fontSize: 15, textDecoration: 'none' }}>
              View Live Demo Radar
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid #e2e8f0', padding: '56px 20px 36px', background: '#ffffff', fontSize: 13, color: '#64748b' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 36, marginBottom: 44 }}>
            
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                <div style={{ width: 28, height: 28, borderRadius: 6, background: '#2563eb', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icons.Logo />
                </div>
                <span style={{ fontSize: 16, fontWeight: 800, color: '#0f172a' }}>FieldOps 360</span>
              </div>
              <p style={{ lineHeight: 1.6, margin: '0 0 14px' }}>
                Enterprise field service management software. Smart technician dispatching, offline mobile tooling, customer digital approvals, and itemized billing.
              </p>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', background: '#ecfdf5', borderRadius: 4, color: '#065f46', fontWeight: 600, fontSize: 12 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#059669' }}></span>
                <span>Systems Operational · 99.98%</span>
              </div>
            </div>

            <div>
              <div style={{ fontWeight: 700, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 14 }}>Platform Modules</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <a href="#console" style={{ color: '#475569', textDecoration: 'none' }}>Dispatch Console</a>
                <a href="#capabilities" style={{ color: '#475569', textDecoration: 'none' }}>Technician Field Tooling</a>
                <Link href="/track?no=REQ-DEMO-4109" style={{ color: '#475569', textDecoration: 'none' }}>Live Customer Radar</Link>
                <a href="#architecture" style={{ color: '#475569', textDecoration: 'none' }}>Asset and Warranty Ledger</a>
              </div>
            </div>

            <div>
              <div style={{ fontWeight: 700, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 14 }}>Portal Access</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <Link href="/login" style={{ color: '#475569', textDecoration: 'none' }}>Operations Manager Console</Link>
                <Link href="/login" style={{ color: '#475569', textDecoration: 'none' }}>Technician Mobile Access</Link>
                <Link href="/login" style={{ color: '#475569', textDecoration: 'none' }}>Customer Portal</Link>
                <Link href="/track?no=REQ-DEMO-4109" style={{ color: '#475569', textDecoration: 'none' }}>Track Work Order</Link>
              </div>
            </div>

            <div>
              <div style={{ fontWeight: 700, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 14 }}>Account & Security</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <Link href="/login?mode=signup" style={{ color: '#475569', textDecoration: 'none' }}>Start Free Trial</Link>
                <Link href="/login" style={{ color: '#475569', textDecoration: 'none' }}>Account Sign In</Link>
                <Link href="/reset" style={{ color: '#475569', textDecoration: 'none' }}>Password Recovery</Link>
                <a href="#architecture" style={{ color: '#475569', textDecoration: 'none' }}>Security Architecture</a>
              </div>
            </div>

          </div>

          <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <div>
              © 2026 FieldOps 360 Inc. All rights reserved.
            </div>
            <div style={{ display: 'flex', gap: 20 }}>
              <a href="#architecture" style={{ color: '#64748b', textDecoration: 'none' }}>Data Isolation</a>
              <a href="#architecture" style={{ color: '#64748b', textDecoration: 'none' }}>Row Level Security</a>
              <a href="#architecture" style={{ color: '#64748b', textDecoration: 'none' }}>System Posture</a>
            </div>
          </div>

        </div>
      </footer>

    </div>
  );
}
