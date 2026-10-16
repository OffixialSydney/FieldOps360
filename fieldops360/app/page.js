'use client';
import { useState } from 'react';
import Link from 'next/link';

// Consistent, purposeful SVG icons (Zero emojis, zero decorative AI glyphs)
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
  Calendar: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  ),
  ClipboardList: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
      <path d="M9 12h6" />
      <path d="M9 16h6" />
    </svg>
  ),
  Smartphone: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
      <line x1="12" y1="18" x2="12.01" y2="18" />
    </svg>
  ),
  Box: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
      <line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  ),
  CreditCard: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
      <line x1="1" y1="10" x2="23" y2="10" />
    </svg>
  ),
  Wrench: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
    </svg>
  ),
  Users: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  Bell: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  ),
  BarChart: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  ),
  MapPin: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
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
  Lock: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
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
};

// 8 Core Features (Strictly matching prompt)
const CORE_FEATURES = [
  {
    icon: Icons.ClipboardList,
    title: 'Work Order Management',
    desc: 'Capture inbound customer requests, log site locations, prioritize critical repairs, and track jobs from initial inquiry to final completion sign-off.',
  },
  {
    icon: Icons.Calendar,
    title: 'Technician Scheduling and Dispatch',
    desc: 'Match service orders to certified specialists by trade qualifications, current availability, and geographic distance with intelligent scoring.',
  },
  {
    icon: Icons.MapPin,
    title: 'Customer Tracking and ETA',
    desc: 'Provide clients with real-time status updates, arrival estimates, technician verification profiles, and Google Maps location references.',
  },
  {
    icon: Icons.Smartphone,
    title: 'Mobile Technician Workflows',
    desc: 'Empower field crews with mobile work briefs, offline diagnostic logs, parts usage recording, before/after photos, and touch signatures.',
  },
  {
    icon: Icons.Box,
    title: 'Equipment and Inventory Management',
    desc: 'Monitor replacement parts inventory across warehouse shelves and service vehicles with automatic deduction upon job completion.',
  },
  {
    icon: Icons.CreditCard,
    title: 'Invoicing and Payments',
    desc: 'Generate itemized commercial invoices directly from logged labor and materials, supporting corporate wallets, cards, and bank transfers.',
  },
  {
    icon: Icons.Bell,
    title: 'Customer Notifications',
    desc: 'Keep clients informed automatically with instant milestone alerts and WhatsApp/SMS updates whenever job status progresses.',
  },
  {
    icon: Icons.BarChart,
    title: 'Reports and Operational History',
    desc: 'Maintain complete service audit logs, asset warranty histories, technician utilization metrics, and financial performance summaries.',
  },
];

// 5-Step Workflow (Strictly matching prompt)
const WORKFLOW_STEPS = [
  { step: '1', title: 'Request submitted.', desc: 'Customer or manager enters service requirements, location details, preferred timing, and asset references.' },
  { step: '2', title: 'Job reviewed and scheduled.', desc: 'Operations manager confirms project scope, verifies trade requirements, and assigns a qualified specialist.' },
  { step: '3', title: 'Technician dispatched.', desc: 'Technician receives job specifications, customer contact, and driving directions directly on their mobile device.' },
  { step: '4', title: 'Work completed and approved.', desc: 'Specialist conducts diagnosis, records parts used, captures customer signature, and marks the visit complete.' },
  { step: '5', title: 'Invoice issued and payment recorded.', desc: 'Itemized invoice compiles automatically from completed work order data for immediate digital settlement.' },
];

// 6 Solutions / Commercial Verticals (Strictly matching prompt)
const SOLUTIONS = [
  {
    title: 'Commercial HVAC',
    desc: 'Schedule seasonal filter inspections, compressor overhauls, refrigerant pressure checks, and emergency chiller repairs for facilities.',
  },
  {
    title: 'Electrical Contracting',
    desc: 'Manage 3-phase switchgear calibrations, panel installations, circuit load balancing, and emergency outage restoration with certified technicians.',
  },
  {
    title: 'Solar Maintenance',
    desc: 'Track inverter diagnostic codes, string voltage performance, battery storage overhauls, and solar panel cleaning cadences with warranty tracking.',
  },
  {
    title: 'Plumbing Businesses',
    desc: 'Dispatch crews for commercial pipe repairs, backflow testing, industrial booster pump maintenance, and wastewater valve servicing.',
  },
  {
    title: 'Generator Servicing',
    desc: 'Organize routine oil and fuel filter replacements, automatic transfer switch (ATS) testing, load bank tests, and diesel generator overhauls.',
  },
  {
    title: 'Equipment Maintenance',
    desc: 'Maintain historical service records by equipment serial number, detect active manufacturer warranties, and plan preventative maintenance.',
  },
];

// Believable Sample Data for Interactive Demonstration Console
const DEMO_WORK_ORDERS = [
  { id: 'WO-4812', client: 'Sterling Logistics Facility', service: 'Solar Inverter Calibration', tech: 'Marcus Vance', status: 'In Progress', priority: 'High', cost: '₦84,500' },
  { id: 'WO-4815', client: 'Apex Cold Chain Systems', service: 'Commercial HVAC Chiller Repair', tech: 'David Kalu', status: 'En Route', priority: 'Urgent', cost: '₦142,000' },
  { id: 'WO-4818', client: 'Northgate Medical Complex', service: '250kVA Generator Maintenance', tech: 'Aisha Bello', status: 'Assigned', priority: 'Normal', cost: '₦68,000' },
  { id: 'WO-4821', client: 'Continental Commercial Towers', service: '3-Phase Switchgear Inspection', tech: 'Emeka Obi', status: 'Reviewing', priority: 'Normal', cost: '₦45,000' },
  { id: 'WO-4826', client: 'Harbor Point Facilities', service: 'Booster Pump Seal Replacement', tech: 'Unassigned', status: 'New Request', priority: 'Normal', cost: '₦52,000' },
];

const DEMO_TECHNICIANS = [
  { name: 'Marcus Vance', role: 'Solar & Electrical Specialist', status: 'Active on Job', location: 'Lekki Phase 1', score: '98%', jobs: 2 },
  { name: 'David Kalu', role: 'Commercial HVAC Engineer', status: 'En Route (14 min)', location: 'Ikeja Industrial', score: '94%', jobs: 1 },
  { name: 'Aisha Bello', role: 'Generator Overhaul Lead', status: 'Dispatched', location: 'Victoria Island', score: '91%', jobs: 1 },
  { name: 'Emeka Obi', role: 'Plumbing & Mechanical Tech', status: 'Available', location: 'Marina Central', score: '88%', jobs: 0 },
];

const DEMO_INVOICES = [
  { id: 'INV-4812', client: 'Sterling Logistics Facility', job: 'WO-4812', amount: '₦84,500', status: 'Paid via Wallet', date: 'Oct 16, 2026' },
  { id: 'INV-4809', client: 'Heritage Commercial Bank', job: 'WO-4809', amount: '₦126,000', status: 'Pending Accountant Review', date: 'Oct 15, 2026' },
  { id: 'INV-4802', client: 'Prime Plaza Offices', job: 'WO-4802', amount: '₦58,000', status: 'Settled via Transfer', date: 'Oct 14, 2026' },
  { id: 'INV-4798', client: 'Apex Cold Chain Systems', job: 'WO-4798', amount: '₦210,000', status: 'Paid via Card', date: 'Oct 13, 2026' },
];

const DEMO_ASSETS = [
  { name: '50kW Hybrid Solar Inverter', serial: 'SN-INV-99201', client: 'Sterling Logistics Facility', install: '2025-04-12', warranty: 'Active (18 months left)' },
  { name: '250kVA Perkins Diesel Generator', serial: 'SN-GEN-44102', client: 'Northgate Medical Complex', install: '2024-11-20', warranty: 'Active (5 months left)' },
  { name: 'Industrial Water Booster Unit', serial: 'SN-PMP-88310', client: 'Harbor Point Facilities', install: '2023-08-15', warranty: 'Warranty Expired' },
];

export default function LandingPage() {
  const [demoTab, setDemoTab] = useState('orders');
  const [trackInput, setTrackInput] = useState('');
  const [billingCycle, setBillingCycle] = useState('monthly'); // 'monthly' | 'annual'
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleTrackSubmit = (e) => {
    e.preventDefault();
    const query = trackInput.trim();
    if (query) {
      window.location.href = `/track?no=${encodeURIComponent(query)}`;
    } else {
      window.location.href = '/track?no=REQ-DEMO-4109';
    }
  };

  return (
    <div style={{ background: '#ffffff', color: '#0f172a', minHeight: '100vh', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Inter", "Helvetica Neue", Arial, sans-serif' }}>
      
      {/* 1. Header & Navigation */}
      <header style={{ borderBottom: '1px solid #e2e8f0', background: '#ffffff', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', height: 68, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
            <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', color: '#0f172a' }}>
              <div style={{ width: 32, height: 32, borderRadius: 7, background: '#2563eb', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icons.Logo />
              </div>
              <div>
                <span style={{ fontSize: 16, fontWeight: 800, letterSpacing: '-0.02em', display: 'block', lineHeight: 1.1 }}>FIELDOPS 360</span>
                <span style={{ fontSize: 10, color: '#64748b', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Field Service SaaS</span>
              </div>
            </Link>

            <nav style={{ display: 'flex', gap: 24 }} className="desktop-nav">
              <a href="#product" style={{ fontSize: 14, fontWeight: 600, color: '#475569', textDecoration: 'none' }}>Product</a>
              <a href="#solutions" style={{ fontSize: 14, fontWeight: 600, color: '#475569', textDecoration: 'none' }}>Solutions</a>
              <a href="#features" style={{ fontSize: 14, fontWeight: 600, color: '#475569', textDecoration: 'none' }}>Features</a>
              <a href="#workflow" style={{ fontSize: 14, fontWeight: 600, color: '#475569', textDecoration: 'none' }}>How It Works</a>
              <a href="#pricing" style={{ fontSize: 14, fontWeight: 600, color: '#475569', textDecoration: 'none' }}>Pricing</a>
              <a href="#security" style={{ fontSize: 14, fontWeight: 600, color: '#475569', textDecoration: 'none' }}>Security</a>
            </nav>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div className="desktop-actions" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Link href="/login" style={{ fontSize: 14, fontWeight: 600, color: '#334155', textDecoration: 'none', padding: '8px 14px' }}>
                Sign In
              </Link>
              <Link href="/login?mode=signup" style={{ fontSize: 14, fontWeight: 600, color: '#ffffff', background: '#2563eb', textDecoration: 'none', padding: '8px 16px', borderRadius: 7 }}>
                Start Free Trial
              </Link>
            </div>

            {/* Mobile Hamburger Toggle */}
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
              aria-label="Toggle navigation"
            >
              {mobileMenuOpen ? <Icons.Close /> : <Icons.Menu />}
            </button>
          </div>

        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div style={{ borderTop: '1px solid #e2e8f0', background: '#ffffff', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            <a href="#product" onClick={() => setMobileMenuOpen(false)} style={{ fontSize: 14, fontWeight: 600, color: '#334155', textDecoration: 'none', padding: '6px 0' }}>Product</a>
            <a href="#solutions" onClick={() => setMobileMenuOpen(false)} style={{ fontSize: 14, fontWeight: 600, color: '#334155', textDecoration: 'none', padding: '6px 0' }}>Solutions</a>
            <a href="#features" onClick={() => setMobileMenuOpen(false)} style={{ fontSize: 14, fontWeight: 600, color: '#334155', textDecoration: 'none', padding: '6px 0' }}>Features</a>
            <a href="#workflow" onClick={() => setMobileMenuOpen(false)} style={{ fontSize: 14, fontWeight: 600, color: '#334155', textDecoration: 'none', padding: '6px 0' }}>How It Works</a>
            <a href="#pricing" onClick={() => setMobileMenuOpen(false)} style={{ fontSize: 14, fontWeight: 600, color: '#334155', textDecoration: 'none', padding: '6px 0' }}>Pricing</a>
            <a href="#security" onClick={() => setMobileMenuOpen(false)} style={{ fontSize: 14, fontWeight: 600, color: '#334155', textDecoration: 'none', padding: '6px 0' }}>Security</a>
            <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <Link href="/login" onClick={() => setMobileMenuOpen(false)} style={{ textAlign: 'center', padding: '9px', borderRadius: 6, border: '1px solid #cbd5e1', color: '#0f172a', textDecoration: 'none', fontWeight: 600, fontSize: 14 }}>
                Sign In
              </Link>
              <Link href="/login?mode=signup" onClick={() => setMobileMenuOpen(false)} style={{ textAlign: 'center', padding: '9px', borderRadius: 6, background: '#2563eb', color: '#ffffff', textDecoration: 'none', fontWeight: 600, fontSize: 14 }}>
                Start Free Trial
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* 2. Hero Section */}
      <section style={{ padding: '68px 24px 56px', background: '#ffffff', borderBottom: '1px solid #e2e8f0' }}>
        <div style={{ maxWidth: 1040, margin: '0 auto', textAlign: 'center' }}>
          
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '5px 12px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 20, fontSize: 12, fontWeight: 600, color: '#334155', marginBottom: 20 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#2563eb' }}></span>
            <span>Commercial Field Service Management Platform</span>
          </div>

          <h1 style={{ fontSize: 'clamp(32px, 4.6vw, 54px)', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.15, color: '#0f172a', margin: '0 0 18px' }}>
            Manage every service job from request to completion.
          </h1>

          <p style={{ fontSize: 'clamp(16px, 1.8vw, 19px)', color: '#475569', lineHeight: 1.6, maxWidth: 740, margin: '0 auto 32px' }}>
            Schedule technicians, manage work orders, track service visits, control inventory, and manage invoicing from one connected platform.
          </p>

          {/* Action Pair */}
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 14 }}>
            <Link href="/login?mode=signup" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 24px', background: '#2563eb', color: '#ffffff', borderRadius: 8, fontWeight: 600, fontSize: 15, textDecoration: 'none' }}>
              <span>Start Free Trial</span>
              <Icons.ArrowRight />
            </Link>
            <a href="#product" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 22px', background: '#f8fafc', color: '#0f172a', border: '1px solid #cbd5e1', borderRadius: 8, fontWeight: 600, fontSize: 15, textDecoration: 'none' }}>
              <span>Explore the Platform</span>
            </a>
          </div>

          <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 44px' }}>
            Built for service contractors · Multi-tenant isolation · Role-based security
          </p>

          {/* 3. Product Demonstration (Realistic Operations Dashboard) */}
          <div id="product" style={{ textAlign: 'left', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: 12, overflow: 'hidden', boxShadow: '0 16px 40px -12px rgba(15, 23, 42, 0.08)' }}>
            
            {/* Top Operational Bar */}
            <div style={{ background: '#f8fafc', padding: '12px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>FieldOps 360 Operations Console</span>
                <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 4, background: '#eff6ff', color: '#2563eb', fontWeight: 600 }}>Interactive Demonstration Data</span>
              </div>
              <div style={{ fontSize: 12, color: '#64748b' }}>Organization: SolarTech Engineering Ltd</div>
            </div>

            {/* Navigation Tabs for Preview */}
            <div style={{ background: '#ffffff', borderBottom: '1px solid #e2e8f0', padding: '0 16px', display: 'flex', gap: 4, overflowX: 'auto' }}>
              {[
                { key: 'orders', label: 'Active Work Orders (5)' },
                { key: 'dispatch', label: 'Technician Dispatch (4)' },
                { key: 'invoices', label: 'Invoices & Settlements (4)' },
                { key: 'assets', label: 'Equipment & Warranties (3)' },
              ].map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setDemoTab(tab.key)}
                  style={{
                    padding: '12px 16px',
                    border: 'none',
                    borderBottom: demoTab === tab.key ? '2px solid #2563eb' : '2px solid transparent',
                    background: 'transparent',
                    color: demoTab === tab.key ? '#2563eb' : '#64748b',
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    margin: 0,
                    borderRadius: 0,
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Dashboard Workspace */}
            <div style={{ padding: '20px' }}>
              
              {/* Summary Metrics Row */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 12, marginBottom: 18 }}>
                <div style={{ padding: '12px 14px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8 }}>
                  <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>Active Jobs</div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', marginTop: 2 }}>24</div>
                </div>
                <div style={{ padding: '12px 14px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8 }}>
                  <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>Scheduled Today</div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: '#2563eb', marginTop: 2 }}>12</div>
                </div>
                <div style={{ padding: '12px 14px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8 }}>
                  <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>Awaiting Dispatch</div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: '#b45309', marginTop: 2 }}>5</div>
                </div>
                <div style={{ padding: '12px 14px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8 }}>
                  <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>Invoiced Month</div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: '#15803d', marginTop: 2 }}>₦1.84M</div>
                </div>
              </div>

              {/* Tab 1: Work Orders */}
              {demoTab === 'orders' && (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, textAlign: 'left', minWidth: 640 }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid #cbd5e1', color: '#64748b', background: '#f8fafc' }}>
                        <th style={{ padding: '10px 12px', fontWeight: 600 }}>Work Order</th>
                        <th style={{ padding: '10px 12px', fontWeight: 600 }}>Client & Facility</th>
                        <th style={{ padding: '10px 12px', fontWeight: 600 }}>Service Requested</th>
                        <th style={{ padding: '10px 12px', fontWeight: 600 }}>Technician</th>
                        <th style={{ padding: '10px 12px', fontWeight: 600 }}>Status</th>
                        <th style={{ padding: '10px 12px', fontWeight: 600 }}>Priority</th>
                      </tr>
                    </thead>
                    <tbody>
                      {DEMO_WORK_ORDERS.map((r) => (
                        <tr key={r.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '12px', fontWeight: 700, color: '#2563eb', fontFamily: 'ui-monospace, monospace' }}>{r.id}</td>
                          <td style={{ padding: '12px', color: '#0f172a', fontWeight: 600 }}>{r.client}</td>
                          <td style={{ padding: '12px', color: '#475569' }}>{r.service}</td>
                          <td style={{ padding: '12px', color: '#0f172a' }}>{r.tech}</td>
                          <td style={{ padding: '12px' }}>
                            <span style={{ padding: '3px 8px', borderRadius: 4, background: r.status === 'In Progress' ? '#eff6ff' : r.status === 'En Route' ? '#eff6ff' : '#f8fafc', color: r.status.includes('Route') || r.status.includes('Progress') ? '#2563eb' : '#475569', fontSize: 12, fontWeight: 600 }}>
                              {r.status}
                            </span>
                          </td>
                          <td style={{ padding: '12px' }}>
                            <span style={{ padding: '3px 8px', borderRadius: 4, background: r.priority === 'Urgent' ? '#fffbeb' : r.priority === 'High' ? '#fef2f2' : '#f8fafc', color: r.priority === 'Urgent' ? '#b45309' : r.priority === 'High' ? '#b91c1c' : '#475569', fontSize: 12, fontWeight: 600 }}>
                              {r.priority}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Tab 2: Dispatch Scheduling */}
              {demoTab === 'dispatch' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12 }}>
                  {DEMO_TECHNICIANS.map((t, idx) => (
                    <div key={idx} style={{ padding: '14px', border: '1px solid #e2e8f0', borderRadius: 8, background: '#ffffff' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                        <div style={{ fontWeight: 700, fontSize: 14, color: '#0f172a' }}>{t.name}</div>
                        <span style={{ fontSize: 11, padding: '2px 6px', borderRadius: 4, background: t.status === 'Available' ? '#ecfdf5' : '#eff6ff', color: t.status === 'Available' ? '#15803d' : '#2563eb', fontWeight: 600 }}>
                          {t.status}
                        </span>
                      </div>
                      <div style={{ fontSize: 12, color: '#64748b', marginBottom: 8 }}>{t.role}</div>
                      <div style={{ fontSize: 12, color: '#475569', display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #f1f5f9', paddingTop: 8 }}>
                        <span>Sector: <strong>{t.location}</strong></span>
                        <span>Match: <strong>{t.score}</strong></span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Tab 3: Invoicing */}
              {demoTab === 'invoices' && (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, textAlign: 'left', minWidth: 620 }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid #cbd5e1', color: '#64748b', background: '#f8fafc' }}>
                        <th style={{ padding: '10px 12px', fontWeight: 600 }}>Invoice #</th>
                        <th style={{ padding: '10px 12px', fontWeight: 600 }}>Client</th>
                        <th style={{ padding: '10px 12px', fontWeight: 600 }}>Work Order</th>
                        <th style={{ padding: '10px 12px', fontWeight: 600 }}>Amount</th>
                        <th style={{ padding: '10px 12px', fontWeight: 600 }}>Settlement Status</th>
                        <th style={{ padding: '10px 12px', fontWeight: 600 }}>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {DEMO_INVOICES.map((i) => (
                        <tr key={i.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '12px', fontWeight: 700, color: '#2563eb', fontFamily: 'ui-monospace, monospace' }}>{i.id}</td>
                          <td style={{ padding: '12px', color: '#0f172a', fontWeight: 600 }}>{i.client}</td>
                          <td style={{ padding: '12px', color: '#64748b', fontFamily: 'ui-monospace, monospace' }}>{i.job}</td>
                          <td style={{ padding: '12px', fontWeight: 700, color: '#0f172a' }}>{i.amount}</td>
                          <td style={{ padding: '12px' }}>
                            <span style={{ padding: '3px 8px', borderRadius: 4, background: i.status.includes('Paid') || i.status.includes('Settled') ? '#ecfdf5' : '#fffbeb', color: i.status.includes('Paid') || i.status.includes('Settled') ? '#15803d' : '#b45309', fontSize: 12, fontWeight: 600 }}>
                              {i.status}
                            </span>
                          </td>
                          <td style={{ padding: '12px', color: '#64748b' }}>{i.date}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Tab 4: Assets & Warranties */}
              {demoTab === 'assets' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 12 }}>
                  {DEMO_ASSETS.map((a, idx) => (
                    <div key={idx} style={{ padding: '14px', border: '1px solid #e2e8f0', borderRadius: 8, background: '#ffffff' }}>
                      <div style={{ fontWeight: 700, fontSize: 14, color: '#0f172a', marginBottom: 4 }}>{a.name}</div>
                      <div style={{ fontSize: 12, color: '#64748b', fontFamily: 'ui-monospace, monospace', marginBottom: 8 }}>Serial: {a.serial}</div>
                      <div style={{ fontSize: 12, color: '#475569', marginBottom: 6 }}>Facility: {a.client}</div>
                      <div style={{ fontSize: 11, padding: '3px 8px', borderRadius: 4, background: a.warranty.includes('Active') ? '#ecfdf5' : '#fef2f2', color: a.warranty.includes('Active') ? '#15803d' : '#b91c1c', fontWeight: 600, display: 'inline-block' }}>
                        {a.warranty}
                      </div>
                    </div>
                  ))}
                </div>
              )}

            </div>
          </div>

        </div>
      </section>

      {/* 4. Features Section (8 Core Capabilities) */}
      <section id="features" style={{ padding: '76px 24px', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 8 }}>
            Core Platform Capabilities
          </span>
          <h2 style={{ fontSize: 'clamp(26px, 3.4vw, 36px)', fontWeight: 800, color: '#0f172a', margin: '0 0 12px' }}>
            Built for everyday field service operations
          </h2>
          <p style={{ fontSize: 15, color: '#475569', maxWidth: 620, margin: '0 auto' }}>
            A single connected software system for dispatch managers, mobile field technicians, corporate customers, and accounting.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(270px, 1fr))', gap: 20 }}>
          {CORE_FEATURES.map((feat, idx) => {
            const FeatureIcon = feat.icon;
            return (
              <div key={idx} style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 8, padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ width: 36, height: 36, borderRadius: 7, background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                    <FeatureIcon />
                  </div>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: '0 0 8px' }}>{feat.title}</h3>
                  <p style={{ fontSize: 13, color: '#475569', lineHeight: 1.6, margin: 0 }}>{feat.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 5. How It Works (5 Clear Steps) */}
      <section id="workflow" style={{ padding: '76px 24px', background: '#f8fafc', borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 8 }}>
              Operational Lifecycle
            </span>
            <h2 style={{ fontSize: 'clamp(26px, 3.4vw, 36px)', fontWeight: 800, color: '#0f172a', margin: '0 0 12px' }}>
              How jobs progress from request to payment
            </h2>
            <p style={{ fontSize: 15, color: '#475569', maxWidth: 600, margin: '0 auto' }}>
              A disciplined, traceable workflow connecting your office and field crew in real time.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
            {WORKFLOW_STEPS.map((wf, idx) => (
              <div key={idx} style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: 8, padding: '20px' }}>
                <div style={{ width: 26, height: 26, borderRadius: '50%', background: '#2563eb', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, marginBottom: 12 }}>
                  {wf.step}
                </div>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', marginBottom: 6 }}>{wf.title}</div>
                <p style={{ fontSize: 13, color: '#475569', lineHeight: 1.5, margin: 0 }}>{wf.desc}</p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 6. Solutions by Trade */}
      <section id="solutions" style={{ padding: '76px 24px', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 44 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 8 }}>
            Commercial Verticals
          </span>
          <h2 style={{ fontSize: 'clamp(26px, 3.4vw, 36px)', fontWeight: 800, color: '#0f172a', margin: '0 0 12px' }}>
            Engineered for specialized service businesses
          </h2>
          <p style={{ fontSize: 15, color: '#475569', maxWidth: 640, margin: '0 auto' }}>
            Supporting commercial contractors with trade-specific workflows, technician certifications, and parts ledgers.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 18 }}>
          {SOLUTIONS.map((sol, idx) => (
            <div key={idx} style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 8, padding: '22px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <div style={{ color: '#2563eb' }}><Icons.Check /></div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: 0 }}>{sol.title}</h3>
              </div>
              <p style={{ fontSize: 13, color: '#475569', lineHeight: 1.6, margin: 0 }}>{sol.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 7. Pricing Section */}
      <section id="pricing" style={{ padding: '76px 24px', background: '#f8fafc', borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 8 }}>
              Subscription Plans
            </span>
            <h2 style={{ fontSize: 'clamp(26px, 3.4vw, 36px)', fontWeight: 800, color: '#0f172a', margin: '0 0 12px' }}>
              Transparent commercial pricing
            </h2>
            <p style={{ fontSize: 15, color: '#475569', maxWidth: 600, margin: '0 auto 20px' }}>
              Straightforward monthly or annual plans. No hidden dispatch surcharges or setup penalties.
            </p>

            {/* Monthly / Annual Toggle */}
            <div style={{ display: 'inline-flex', background: '#e2e8f0', padding: 3, borderRadius: 8 }}>
              <button
                type="button"
                onClick={() => setBillingCycle('monthly')}
                style={{
                  padding: '6px 14px',
                  borderRadius: 6,
                  border: 'none',
                  background: billingCycle === 'monthly' ? '#ffffff' : 'transparent',
                  color: billingCycle === 'monthly' ? '#0f172a' : '#64748b',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  margin: 0,
                }}
              >
                Monthly Billing
              </button>
              <button
                type="button"
                onClick={() => setBillingCycle('annual')}
                style={{
                  padding: '6px 14px',
                  borderRadius: 6,
                  border: 'none',
                  background: billingCycle === 'annual' ? '#ffffff' : 'transparent',
                  color: billingCycle === 'annual' ? '#0f172a' : '#64748b',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  margin: 0,
                }}
              >
                Annual (Save 15%)
              </button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20, alignItems: 'stretch' }}>
            
            {/* Starter Plan */}
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 10, padding: '28px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>Starter</div>
                <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 18px' }}>For independent contractors and small maintenance teams.</p>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 20 }}>
                  <span style={{ fontSize: 32, fontWeight: 800, color: '#0f172a' }}>{billingCycle === 'annual' ? '$41' : '$49'}</span>
                  <span style={{ fontSize: 13, color: '#64748b' }}>/ month</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13, color: '#334155' }}>
                  <div style={{ display: 'flex', gap: 8 }}><div style={{ color: '#2563eb' }}><Icons.Check /></div> Up to 3 field technicians</div>
                  <div style={{ display: 'flex', gap: 8 }}><div style={{ color: '#2563eb' }}><Icons.Check /></div> Unlimited work orders</div>
                  <div style={{ display: 'flex', gap: 8 }}><div style={{ color: '#2563eb' }}><Icons.Check /></div> Mobile technician execution app</div>
                  <div style={{ display: 'flex', gap: 8 }}><div style={{ color: '#2563eb' }}><Icons.Check /></div> Basic parts inventory ledger</div>
                  <div style={{ display: 'flex', gap: 8 }}><div style={{ color: '#2563eb' }}><Icons.Check /></div> Digital invoices and signatures</div>
                </div>
              </div>
              <Link href="/login?mode=signup" style={{ textAlign: 'center', marginTop: 24, padding: '10px', borderRadius: 7, border: '1px solid #cbd5e1', background: '#f8fafc', color: '#0f172a', textDecoration: 'none', fontWeight: 600, fontSize: 14 }}>
                Start Free Trial
              </Link>
            </div>

            {/* Professional Plan (Highlighted) */}
            <div style={{ background: '#ffffff', border: '2px solid #2563eb', borderRadius: 10, padding: '28px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative', boxShadow: '0 8px 24px -4px rgba(37, 99, 235, 0.1)' }}>
              <div style={{ position: 'absolute', top: -11, left: '50%', transform: 'translateX(-50%)', background: '#2563eb', color: '#ffffff', fontSize: 11, fontWeight: 700, padding: '2px 10px', borderRadius: 20, textTransform: 'uppercase' }}>
                Most Popular
              </div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>Professional</div>
                <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 18px' }}>For established service companies managing active fleets.</p>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 20 }}>
                  <span style={{ fontSize: 32, fontWeight: 800, color: '#0f172a' }}>{billingCycle === 'annual' ? '$125' : '$149'}</span>
                  <span style={{ fontSize: 13, color: '#64748b' }}>/ month</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13, color: '#334155' }}>
                  <div style={{ display: 'flex', gap: 8 }}><div style={{ color: '#2563eb' }}><Icons.Check /></div> Up to 15 field technicians</div>
                  <div style={{ display: 'flex', gap: 8 }}><div style={{ color: '#2563eb' }}><Icons.Check /></div> Smart technician dispatch scoring</div>
                  <div style={{ display: 'flex', gap: 8 }}><div style={{ color: '#2563eb' }}><Icons.Check /></div> Real-time customer tracking portal</div>
                  <div style={{ display: 'flex', gap: 8 }}><div style={{ color: '#2563eb' }}><Icons.Check /></div> WhatsApp and SMS dispatch alerts</div>
                  <div style={{ display: 'flex', gap: 8 }}><div style={{ color: '#2563eb' }}><Icons.Check /></div> Warehouse and van inventory deductions</div>
                  <div style={{ display: 'flex', gap: 8 }}><div style={{ color: '#2563eb' }}><Icons.Check /></div> Asset warranty tracking register</div>
                </div>
              </div>
              <Link href="/login?mode=signup" style={{ textAlign: 'center', marginTop: 24, padding: '10px', borderRadius: 7, background: '#2563eb', color: '#ffffff', textDecoration: 'none', fontWeight: 600, fontSize: 14 }}>
                Start Free Trial
              </Link>
            </div>

            {/* Enterprise Plan */}
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 10, padding: '28px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>Enterprise</div>
                <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 18px' }}>For regional contractors requiring custom controls and SLAs.</p>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 20 }}>
                  <span style={{ fontSize: 32, fontWeight: 800, color: '#0f172a' }}>{billingCycle === 'annual' ? '$339' : '$399'}</span>
                  <span style={{ fontSize: 13, color: '#64748b' }}>/ month</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13, color: '#334155' }}>
                  <div style={{ display: 'flex', gap: 8 }}><div style={{ color: '#2563eb' }}><Icons.Check /></div> Unlimited technicians and managers</div>
                  <div style={{ display: 'flex', gap: 8 }}><div style={{ color: '#2563eb' }}><Icons.Check /></div> Multi-branch organizational isolation</div>
                  <div style={{ display: 'flex', gap: 8 }}><div style={{ color: '#2563eb' }}><Icons.Check /></div> Custom rate cards and commission rules</div>
                  <div style={{ display: 'flex', gap: 8 }}><div style={{ color: '#2563eb' }}><Icons.Check /></div> Dedicated database backup policies</div>
                  <div style={{ display: 'flex', gap: 8 }}><div style={{ color: '#2563eb' }}><Icons.Check /></div> Priority support with dedicated onboarding</div>
                </div>
              </div>
              <Link href="/login" style={{ textAlign: 'center', marginTop: 24, padding: '10px', borderRadius: 7, border: '1px solid #cbd5e1', background: '#f8fafc', color: '#0f172a', textDecoration: 'none', fontWeight: 600, fontSize: 14 }}>
                Contact Sales
              </Link>
            </div>

          </div>

          <div style={{ textAlign: 'center', marginTop: 24, fontSize: 13, color: '#64748b' }}>
            All plans include database-level tenant isolation, encrypted sessions, and full access to web and mobile portals.
          </div>

        </div>
      </section>

      {/* 8. Security and Trust Section */}
      <section id="security" style={{ padding: '76px 24px', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 44 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 8 }}>
            Architecture and Data Integrity
          </span>
          <h2 style={{ fontSize: 'clamp(26px, 3.4vw, 36px)', fontWeight: 800, color: '#0f172a', margin: '0 0 12px' }}>
            Enterprise security without compromise
          </h2>
          <p style={{ fontSize: 15, color: '#475569', maxWidth: 620, margin: '0 auto' }}>
            Accurate, reliable data partitioning protecting contractor operational files, technician identities, and commercial billing.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 18 }}>
          
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 8, padding: '22px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <div style={{ color: '#2563eb' }}><Icons.Shield /></div>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', margin: 0 }}>Row Level Security (RLS)</h3>
            </div>
            <p style={{ fontSize: 13, color: '#475569', lineHeight: 1.6, margin: 0 }}>
              Multi-tenant isolation enforced directly at the PostgreSQL layer. All queries partition by organization identifier, ensuring zero data leakage between different contracting businesses.
            </p>
          </div>

          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 8, padding: '22px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <div style={{ color: '#2563eb' }}><Icons.Users /></div>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', margin: 0 }}>Role-Based Access (RBAC)</h3>
            </div>
            <p style={{ fontSize: 13, color: '#475569', lineHeight: 1.6, margin: 0 }}>
              Dedicated interfaces and API barriers for Operations Managers, Field Technicians, Customers, and Accountants prevent unauthorized modifications to pricing and job assignments.
            </p>
          </div>

          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 8, padding: '22px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <div style={{ color: '#2563eb' }}><Icons.FileText /></div>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', margin: 0 }}>Permanent Audit Logs</h3>
            </div>
            <p style={{ fontSize: 13, color: '#475569', lineHeight: 1.6, margin: 0 }}>
              Immutable activity records document all status transitions, technician reassignment events, and payment approvals with actor identification and timestamps.
            </p>
          </div>

          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 8, padding: '22px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <div style={{ color: '#2563eb' }}><Icons.Lock /></div>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', margin: 0 }}>Secure Credential Handling</h3>
            </div>
            <p style={{ fontSize: 13, color: '#475569', lineHeight: 1.6, margin: 0 }}>
              Encrypted session management, standard bcrypt password hashing, and tokenized email verification guard against account compromise and session hijacking.
            </p>
          </div>

        </div>
      </section>

      {/* Customer Tracking Demonstration Tool */}
      <section style={{ padding: '76px 24px', background: '#f8fafc', borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0' }}>
        <div style={{ maxWidth: 720, margin: '0 auto', textAlign: 'center' }}>
          
          <span style={{ fontSize: 12, fontWeight: 700, color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 8 }}>
            Self-Service Tracking Tool
          </span>
          <h2 style={{ fontSize: 'clamp(24px, 3.2vw, 32px)', fontWeight: 800, color: '#0f172a', margin: '0 0 12px' }}>
            Test customer order tracking
          </h2>
          <p style={{ fontSize: 15, color: '#475569', margin: '0 0 24px' }}>
            Experience how customers inspect live work order milestones, view technician arrival estimates, and review service notes.
          </p>

          <div style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: 10, padding: '20px', boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)' }}>
            <form onSubmit={handleTrackSubmit} style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: 240, display: 'flex', alignItems: 'center', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: 7, padding: '0 12px' }}>
                <div style={{ color: '#64748b', display: 'flex', alignItems: 'center' }}>
                  <Icons.Search />
                </div>
                <input
                  type="text"
                  placeholder="Enter order reference, e.g. REQ-DEMO-4109"
                  value={trackInput}
                  onChange={(e) => setTrackInput(e.target.value)}
                  style={{ flex: 1, border: 'none', outline: 'none', padding: '12px 10px', fontSize: 14, color: '#0f172a', background: 'transparent' }}
                />
              </div>
              <button type="submit" style={{ margin: 0, padding: '12px 22px', background: '#2563eb', color: '#ffffff', borderRadius: 7, fontSize: 14, fontWeight: 600, border: 'none', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                Track Order
              </button>
            </form>

            <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
              <span style={{ fontSize: 12, color: '#64748b' }}>Need an instant demonstration?</span>
              <Link href="/track?no=REQ-DEMO-4109" style={{ fontSize: 13, fontWeight: 600, color: '#2563eb', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <span>Launch Interactive Demo Tracking (REQ-DEMO-4109)</span>
                <Icons.ArrowRight />
              </Link>
            </div>
          </div>

        </div>
      </section>

      {/* 9. Final Call to Action */}
      <section style={{ padding: '76px 24px', background: '#ffffff' }}>
        <div style={{ maxWidth: 880, margin: '0 auto', textAlign: 'center', border: '1px solid #cbd5e1', borderRadius: 12, padding: '48px 24px', background: '#f8fafc' }}>
          <h2 style={{ fontSize: 'clamp(26px, 3.4vw, 36px)', fontWeight: 800, color: '#0f172a', margin: '0 0 14px' }}>
            Elevate your field service operations today
          </h2>
          <p style={{ fontSize: 15, color: '#475569', maxWidth: 580, margin: '0 auto 28px', lineHeight: 1.6 }}>
            Set up your organization, schedule technicians, and manage customer service requests from one connected platform.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
            <Link href="/login?mode=signup" style={{ padding: '12px 24px', background: '#2563eb', color: '#ffffff', borderRadius: 8, fontWeight: 600, fontSize: 15, textDecoration: 'none' }}>
              Start Free Trial
            </Link>
            <Link href="/login" style={{ padding: '12px 22px', background: '#ffffff', color: '#0f172a', border: '1px solid #cbd5e1', borderRadius: 8, fontWeight: 600, fontSize: 15, textDecoration: 'none' }}>
              Sign In to Portal
            </Link>
          </div>
        </div>
      </section>

      {/* 10. Footer */}
      <footer style={{ borderTop: '1px solid #e2e8f0', padding: '52px 24px 32px', background: '#ffffff', fontSize: 13, color: '#64748b' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 32, marginBottom: 40 }}>
            
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <div style={{ width: 28, height: 28, borderRadius: 6, background: '#2563eb', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icons.Logo />
                </div>
                <span style={{ fontSize: 16, fontWeight: 800, color: '#0f172a' }}>FIELDOPS 360</span>
              </div>
              <p style={{ lineHeight: 1.6, margin: '0 0 12px' }}>
                Commercial field service management software. Work order dispatch, technician execution, inventory control, and customer invoicing.
              </p>
            </div>

            <div>
              <div style={{ fontWeight: 700, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 12 }}>Platform Capabilities</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <a href="#features" style={{ color: '#475569', textDecoration: 'none' }}>Work Order Management</a>
                <a href="#features" style={{ color: '#475569', textDecoration: 'none' }}>Technician Scheduling</a>
                <a href="#features" style={{ color: '#475569', textDecoration: 'none' }}>Mobile Execution</a>
                <a href="#features" style={{ color: '#475569', textDecoration: 'none' }}>Equipment & Warranties</a>
                <a href="#features" style={{ color: '#475569', textDecoration: 'none' }}>Invoicing & Billing</a>
              </div>
            </div>

            <div>
              <div style={{ fontWeight: 700, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 12 }}>Solutions by Trade</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <a href="#solutions" style={{ color: '#475569', textDecoration: 'none' }}>Commercial HVAC</a>
                <a href="#solutions" style={{ color: '#475569', textDecoration: 'none' }}>Electrical Contracting</a>
                <a href="#solutions" style={{ color: '#475569', textDecoration: 'none' }}>Solar Maintenance</a>
                <a href="#solutions" style={{ color: '#475569', textDecoration: 'none' }}>Plumbing Businesses</a>
                <a href="#solutions" style={{ color: '#475569', textDecoration: 'none' }}>Generator Servicing</a>
              </div>
            </div>

            <div>
              <div style={{ fontWeight: 700, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 12 }}>Account & Security</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <Link href="/login?mode=signup" style={{ color: '#475569', textDecoration: 'none' }}>Start Free Trial</Link>
                <Link href="/login" style={{ color: '#475569', textDecoration: 'none' }}>Sign In to Portal</Link>
                <Link href="/track?no=REQ-DEMO-4109" style={{ color: '#475569', textDecoration: 'none' }}>Order Tracking</Link>
                <a href="#security" style={{ color: '#475569', textDecoration: 'none' }}>Security Architecture</a>
              </div>
            </div>

          </div>

          <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <div>
              © 2026 FieldOps 360. All rights reserved.
            </div>
            <div style={{ display: 'flex', gap: 18 }}>
              <a href="#security" style={{ color: '#64748b', textDecoration: 'none' }}>PostgreSQL RLS Isolation</a>
              <a href="#security" style={{ color: '#64748b', textDecoration: 'none' }}>Role-Based Access</a>
              <a href="#security" style={{ color: '#64748b', textDecoration: 'none' }}>Audit Logs</a>
            </div>
          </div>

        </div>
      </footer>

    </div>
  );
}
