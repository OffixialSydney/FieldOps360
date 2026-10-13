'use client';
import { useState } from 'react';
import Link from 'next/link';

// Clean, functional vector glyphs (Zero emojis, zero decorative icons)
const Icons = {
  Logo: () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
    </svg>
  ),
  Search: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  ),
  Check: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
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
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  ),
  MapPin: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  ),
  FileText: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  ),
  Layers: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 2 7 12 12 22 7 12 2" />
      <polyline points="2 17 12 22 22 17" />
      <polyline points="2 12 12 17 22 12" />
    </svg>
  ),
  Clock: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  ),
};

const MODULE_TABS = [
  {
    id: 'dispatch',
    label: 'Dispatch Board',
    role: 'Operations Manager Console',
    title: 'Real time schedule and technician allocation',
    desc: 'Filter incoming requests by priority, check technician certifications, and route jobs based on current GPS location and van stock.',
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

export default function LandingPage() {
  const [activeTab, setActiveTab] = useState(0);
  const [trackQuery, setTrackQuery] = useState('');

  const currentTab = MODULE_TABS[activeTab];

  const handleTrackSubmit = (e) => {
    e.preventDefault();
    const query = trackQuery.trim();
    if (query) {
      window.location.href = `/track?no=${encodeURIComponent(query)}`;
    } else {
      window.location.href = '/track';
    }
  };

  return (
    <div style={{ background: '#ffffff', color: '#0f172a', minHeight: '100vh', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Inter", "Helvetica Neue", Arial, sans-serif' }}>
      
      {/* Top Navigation */}
      <header style={{ borderBottom: '1px solid #e2e8f0', background: '#ffffff', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', height: 70, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          
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
              <a href="#overview" style={{ fontSize: 14, fontWeight: 600, color: '#475569', textDecoration: 'none' }}>Overview</a>
              <a href="#console" style={{ fontSize: 14, fontWeight: 600, color: '#475569', textDecoration: 'none' }}>Dispatch Console</a>
              <a href="#architecture" style={{ fontSize: 14, fontWeight: 600, color: '#475569', textDecoration: 'none' }}>Architecture</a>
              <a href="#workflow" style={{ fontSize: 14, fontWeight: 600, color: '#475569', textDecoration: 'none' }}>Workflow</a>
              <Link href="/track" style={{ fontSize: 14, fontWeight: 700, color: '#2563eb', textDecoration: 'none' }}>Live Radar</Link>
            </nav>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Link href="/track" style={{ fontSize: 13, fontWeight: 600, color: '#334155', textDecoration: 'none', padding: '8px 14px', borderRadius: 6, border: '1px solid #cbd5e1' }}>
              Track Work Order
            </Link>
            <Link href="/login" style={{ fontSize: 13, fontWeight: 600, color: '#334155', textDecoration: 'none', padding: '8px 14px', borderRadius: 6, border: '1px solid #cbd5e1' }}>
              Sign In
            </Link>
            <Link href="/login?mode=signup" style={{ fontSize: 13, fontWeight: 700, color: '#ffffff', background: '#2563eb', textDecoration: 'none', padding: '8px 16px', borderRadius: 6 }}>
              Create Account
            </Link>
          </div>

        </div>
      </header>

      {/* Hero Section */}
      <section style={{ padding: '72px 24px 60px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
        <div style={{ maxWidth: 1040, margin: '0 auto', textAlign: 'center' }}>
          
          <div style={{ display: 'inline-block', padding: '5px 14px', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: 6, fontSize: 12, fontWeight: 700, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 20 }}>
            Commercial Field Service Management Software
          </div>

          <h1 style={{ fontSize: 'clamp(32px, 5vw, 54px)', fontWeight: 850, letterSpacing: '-0.03em', lineHeight: 1.15, color: '#0f172a', margin: '0 0 20px' }}>
            Field operations software built for maintenance contractors and facility teams
          </h1>

          <p style={{ fontSize: 'clamp(16px, 2vw, 19px)', color: '#475569', lineHeight: 1.6, maxWidth: 780, margin: '0 auto 36px' }}>
            Coordinate field work orders, route technicians by proximity and skill, log diagnostics offline, and issue itemized invoices directly upon customer sign-off.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 44 }}>
            <Link href="/login?mode=signup" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '13px 26px', background: '#2563eb', color: '#ffffff', borderRadius: 8, fontWeight: 700, fontSize: 15, textDecoration: 'none' }}>
              <span>Create Company Account</span>
              <Icons.ArrowRight />
            </Link>
            <Link href="/login" style={{ display: 'inline-flex', alignItems: 'center', padding: '13px 24px', background: '#ffffff', color: '#0f172a', border: '1px solid #cbd5e1', borderRadius: 8, fontWeight: 600, fontSize: 15, textDecoration: 'none' }}>
              Sign In to Operations Portal
            </Link>
          </div>

          {/* Functional Work Order Tracking Lookup */}
          <div style={{ maxWidth: 620, margin: '0 auto', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: 10, padding: 8, boxShadow: '0 4px 14px rgba(15, 23, 42, 0.05)' }}>
            <form onSubmit={handleTrackSubmit} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <div style={{ paddingLeft: 10, color: '#64748b', display: 'flex', alignItems: 'center' }}>
                <Icons.Search />
              </div>
              <input
                type="text"
                placeholder="Enter work order number, for example REQ-2026-000001"
                value={trackQuery}
                onChange={(e) => setTrackQuery(e.target.value)}
                style={{ flex: 1, border: 'none', outline: 'none', padding: '10px 8px', fontSize: 14, color: '#0f172a', background: 'transparent' }}
              />
              <button type="submit" style={{ margin: 0, padding: '10px 20px', background: '#0f172a', color: '#ffffff', borderRadius: 6, fontSize: 13, fontWeight: 700, border: 'none', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                Track Status
              </button>
            </form>
          </div>

        </div>
      </section>

      {/* 4 Pillars of Operation */}
      <section id="overview" style={{ padding: '80px 24px', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ marginBottom: 48, textAlign: 'center' }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 8 }}>
            Operational Pillars
          </span>
          <h2 style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-0.02em', margin: 0, color: '#0f172a' }}>
            Built for every stage of the service lifecycle
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 24 }}>
          
          <div style={{ border: '1px solid #e2e8f0', borderRadius: 12, padding: 26, background: '#ffffff' }}>
            <div style={{ width: 40, height: 40, borderRadius: 8, background: '#f1f5f9', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}>
              <Icons.Layers />
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 10px', color: '#0f172a' }}>Intelligent Dispatch</h3>
            <p style={{ fontSize: 14, color: '#475569', lineHeight: 1.6, margin: 0 }}>
              Assign incoming service tickets based on technician skill certifications, travel distance, and availability status. Track transitions through Dispatched, En Route, Arrived, and In Progress.
            </p>
          </div>

          <div style={{ border: '1px solid #e2e8f0', borderRadius: 12, padding: 26, background: '#ffffff' }}>
            <div style={{ width: 40, height: 40, borderRadius: 8, background: '#f1f5f9', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}>
              <Icons.MapPin />
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 10px', color: '#0f172a' }}>Offline Field Tooling</h3>
            <p style={{ fontSize: 14, color: '#475569', lineHeight: 1.6, margin: 0 }}>
              Equip field technicians with a mobile interface that stores job briefs, equipment serial numbers, and diagnostic notes locally on device without cellular dependencies.
            </p>
          </div>

          <div style={{ border: '1px solid #e2e8f0', borderRadius: 12, padding: 26, background: '#ffffff' }}>
            <div style={{ width: 40, height: 40, borderRadius: 8, background: '#f1f5f9', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}>
              <Icons.Clock />
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 10px', color: '#0f172a' }}>Customer Transparency</h3>
            <p style={{ fontSize: 14, color: '#475569', lineHeight: 1.6, margin: 0 }}>
              Customers view live technician arrival estimates, specialist credentials, and operational notes through a direct web link without requiring account creation.
            </p>
          </div>

          <div style={{ border: '1px solid #e2e8f0', borderRadius: 12, padding: 26, background: '#ffffff' }}>
            <div style={{ width: 40, height: 40, borderRadius: 8, background: '#f1f5f9', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}>
              <Icons.FileText />
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 10px', color: '#0f172a' }}>On Site Settlement</h3>
            <p style={{ fontSize: 14, color: '#475569', lineHeight: 1.6, margin: 0 }}>
              Generate itemized billing the moment work is completed. Capture customer touch signatures, record parts replaced, and reconcile payments immediately.
            </p>
          </div>

        </div>
      </section>

      {/* Interactive Console Showcase */}
      <section id="console" style={{ padding: '80px 24px', background: '#0f172a', color: '#ffffff' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          
          <div style={{ marginBottom: 40, textAlign: 'center' }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#60a5fa', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 8 }}>
              System Interface
            </span>
            <h2 style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-0.02em', margin: '0 0 12px', color: '#ffffff' }}>
              Explore the operational interfaces
            </h2>
            <p style={{ fontSize: 15, color: '#94a3b8', margin: 0 }}>
              Inspect how managers, field crews, and clients interact with the platform.
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
                  padding: '10px 20px',
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
          <div style={{ background: '#020617', border: '1px solid #1e293b', borderRadius: 12, padding: 32 }}>
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
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, textAlign: 'left' }}>
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
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
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
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14 }}>
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
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 18, paddingBottom: 12, borderBottom: '1px solid #1e293b' }}>
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

      {/* Architecture & Security Specifications */}
      <section id="architecture" style={{ padding: '80px 24px', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ marginBottom: 48, textAlign: 'center' }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 8 }}>
            Enterprise Specifications
          </span>
          <h2 style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-0.02em', margin: 0, color: '#0f172a' }}>
            Security, compliance, and infrastructure design
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24 }}>
          
          <div style={{ border: '1px solid #e2e8f0', borderRadius: 10, padding: 24, background: '#ffffff' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <div style={{ color: '#2563eb' }}><Icons.Shield /></div>
              <h4 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: '#0f172a' }}>Row Level Security Isolation</h4>
            </div>
            <p style={{ fontSize: 14, color: '#475569', lineHeight: 1.6, margin: 0 }}>
              Tenant data separation is strictly enforced at the database query level using PostgreSQL Row Level Security. Data cross-access between different contractor accounts is impossible.
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
              Automated notifications send diagnostic notes and invoice links straight to the customer WhatsApp or SMS with pre-formatted links requiring zero password login.
            </p>
          </div>

          <div style={{ border: '1px solid #e2e8f0', borderRadius: 10, padding: 24, background: '#ffffff' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <div style={{ color: '#2563eb' }}><Icons.Check /></div>
              <h4 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: '#0f172a' }}>Reliable Offline Data Store</h4>
            </div>
            <p style={{ fontSize: 14, color: '#475569', lineHeight: 1.6, margin: 0 }}>
              Local storage queues hold diagnostic data safely during cellular disconnects. Operations replay and synchronize accurately once technicians return to network coverage.
            </p>
          </div>

        </div>
      </section>

      {/* 5-Step Workflow Section */}
      <section id="workflow" style={{ padding: '80px 24px', background: '#f8fafc', borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          
          <div style={{ marginBottom: 44, textAlign: 'center' }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 8 }}>
              End to End Lifecycle
            </span>
            <h2 style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-0.02em', margin: 0, color: '#0f172a' }}>
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

      {/* Primary Call to Action Banner */}
      <section style={{ padding: '80px 24px', background: '#ffffff' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center', border: '1px solid #cbd5e1', borderRadius: 16, padding: '48px 32px', background: '#f8fafc' }}>
          <h2 style={{ fontSize: 30, fontWeight: 800, color: '#0f172a', margin: '0 0 14px' }}>
            Ready to organize your field operations?
          </h2>
          <p style={{ fontSize: 16, color: '#475569', maxWidth: 600, margin: '0 auto 32px', lineHeight: 1.6 }}>
            Deploy FieldOps 360 for your service crews, operations managers, and customers today.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
            <Link href="/login?mode=signup" style={{ padding: '12px 24px', background: '#2563eb', color: '#ffffff', borderRadius: 6, fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>
              Create Company Account
            </Link>
            <Link href="/login" style={{ padding: '12px 24px', background: '#ffffff', color: '#0f172a', border: '1px solid #cbd5e1', borderRadius: 6, fontWeight: 600, fontSize: 14, textDecoration: 'none' }}>
              Sign In to Portal
            </Link>
            <Link href="/track" style={{ padding: '12px 24px', background: '#ffffff', color: '#0f172a', border: '1px solid #cbd5e1', borderRadius: 6, fontWeight: 600, fontSize: 14, textDecoration: 'none' }}>
              Track Work Order
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid #e2e8f0', padding: '56px 24px 36px', background: '#ffffff', fontSize: 13, color: '#64748b' }}>
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
                <span>System Operational</span>
              </div>
            </div>

            <div>
              <div style={{ fontWeight: 700, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 14 }}>Platform Modules</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <a href="#console" style={{ color: '#475569', textDecoration: 'none' }}>Dispatch Console</a>
                <a href="#overview" style={{ color: '#475569', textDecoration: 'none' }}>Technician Field Tooling</a>
                <Link href="/track" style={{ color: '#475569', textDecoration: 'none' }}>Live Customer Radar</Link>
                <a href="#architecture" style={{ color: '#475569', textDecoration: 'none' }}>Asset & Warranty Ledger</a>
              </div>
            </div>

            <div>
              <div style={{ fontWeight: 700, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 14 }}>Portal Access</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <Link href="/login" style={{ color: '#475569', textDecoration: 'none' }}>Operations Manager Console</Link>
                <Link href="/login" style={{ color: '#475569', textDecoration: 'none' }}>Technician Mobile Access</Link>
                <Link href="/login" style={{ color: '#475569', textDecoration: 'none' }}>Customer Portal</Link>
                <Link href="/track" style={{ color: '#475569', textDecoration: 'none' }}>Track Work Order</Link>
              </div>
            </div>

            <div>
              <div style={{ fontWeight: 700, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 14 }}>Account & Security</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <Link href="/login?mode=signup" style={{ color: '#475569', textDecoration: 'none' }}>Create Company Account</Link>
                <Link href="/login" style={{ color: '#475569', textDecoration: 'none' }}>Account Sign In</Link>
                <Link href="/reset" style={{ color: '#475569', textDecoration: 'none' }}>Password Recovery</Link>
                <a href="#architecture" style={{ color: '#475569', textDecoration: 'none' }}>Security Architecture</a>
              </div>
            </div>

          </div>

          <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <div>
              © {new Date().getFullYear()} FieldOps 360. All rights reserved.
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
