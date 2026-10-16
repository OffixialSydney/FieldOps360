'use client';
import { useState } from 'react';
import Link from 'next/link';

// Purposeful SVG vector icons (Zero emojis, zero decorative AI glyphs)
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

const TARGET_INDUSTRIES = [
  'Solar installation and maintenance',
  'Electrical contracting',
  'Commercial HVAC servicing',
  'Generator repair and overhaul',
  'Plumbing and facilities',
  'CCTV and network cabling',
  'Commercial engineering',
  'Equipment maintenance',
];

const PRINCIPAL_CAPABILITIES = [
  {
    icon: Icons.ClipboardList,
    title: 'Service Requests and Work Orders',
    desc: 'Centralize inbound requests from commercial clients. Capture site addresses, job scopes, preferred dates, and convert approved tickets into scheduled work orders.',
  },
  {
    icon: Icons.Calendar,
    title: 'Technician Scheduling and Dispatch',
    desc: 'Match jobs to available specialists by trade certifications and location. Balance team workloads and reduce scheduling friction from one unified board.',
  },
  {
    icon: Icons.Smartphone,
    title: 'Mobile Job Execution',
    desc: 'Empower field crews with digital work briefs, diagnostic checklists, parts usage logging, and touch signatures captured directly on mobile devices.',
  },
  {
    icon: Icons.Box,
    title: 'Inventory and Materials',
    desc: 'Track parts stock across warehouse shelves and service vehicles. Link consumed materials to work orders to prevent inventory shrinkage and reconcile costs.',
  },
  {
    icon: Icons.CreditCard,
    title: 'Invoicing and Payments',
    desc: 'Generate itemized commercial invoices immediately upon job completion. Support corporate wallet deductions, card transactions, and bank transfer settlements.',
  },
  {
    icon: Icons.Wrench,
    title: 'Equipment and Warranty Management',
    desc: 'Maintain complete service histories organized by customer asset serial numbers. Automatically detect active warranty coverage before dispatching repairs.',
  },
];

const WORKFLOW_STEPS = [
  { step: '1', title: 'Customer Submits Request', desc: 'Customer enters job scope, site address, preferred schedule, and equipment details.' },
  { step: '2', title: 'Manager Schedules Job', desc: 'Operations manager reviews request details, verifies trade skills, and assigns a specialist.' },
  { step: '3', title: 'Technician Receives Job', desc: 'Field technician accesses job brief, customer contacts, and site navigation on mobile.' },
  { step: '4', title: 'Diagnosis and Work Done', desc: 'Technician arrives on site, performs diagnostic checks, and records operational findings.' },
  { step: '5', title: 'Materials and Sign-Off', desc: 'Replacement parts and photos are logged, followed by customer digital confirmation.' },
  { step: '6', title: 'Invoice Generated', desc: 'Invoice compiles automatically from logged labor, materials, and standard service rates.' },
  { step: '7', title: 'Payment Collected', desc: 'Customer settles invoice through pre-funded corporate balance, card, or transfer.' },
  { step: '8', title: 'History Preserved', desc: 'Completed work order and warranty records update permanently for future reference.' },
];

const ROLE_PREVIEWS = [
  {
    id: 'manager',
    label: 'Operations Manager',
    title: 'Centralized Dispatch and Team Allocation',
    summary: 'Coordinate incoming service requests, check technician availability, and review work order progress.',
    data: [
      { id: 'WO-4812', client: 'Sterling Logistics Facility', service: 'Commercial Solar Inverter Repair', tech: 'Marcus Vance', status: 'En Route', priority: 'Urgent' },
      { id: 'WO-4815', client: 'Apex Cold Chain Systems', service: 'Industrial Chiller Diagnostics', tech: 'David Kalu', status: 'In Progress', priority: 'High' },
      { id: 'WO-4818', client: 'Northgate Medical Complex', service: 'Backup Generator Overhaul', tech: 'Aisha Bello', status: 'Assigned', priority: 'Normal' },
      { id: 'WO-4821', client: 'Continental Commercial Towers', service: '3-Phase Switchgear Calibration', tech: 'Emeka Obi', status: 'Reviewing', priority: 'Normal' },
    ],
  },
  {
    id: 'technician',
    label: 'Technician',
    title: 'Mobile Job Execution on Site',
    summary: 'View assigned jobs, navigate to customer sites, enter diagnostic notes, and record digital sign-offs.',
    checklist: [
      'Site arrival confirmed and customer contacted',
      'Diagnostic checklist completed and voltage readings recorded',
      'Van inventory materials deducted from work order ledger',
      'Customer sign-off signature captured on mobile glass',
    ],
  },
  {
    id: 'customer',
    label: 'Customer',
    title: 'Self-Service Tracking and Approval',
    summary: 'Submit new service requests, check arrival status, inspect completed work reports, and settle invoices.',
    milestones: [
      { title: 'Request Accepted', detail: 'Work order approved by operations team' },
      { title: 'Technician Assigned', detail: 'Certified specialist allocated to ticket' },
      { title: 'On the Way', detail: 'Technician traveling to service location' },
      { title: 'Work in Progress', detail: 'Diagnosis and repairs actively under way' },
      { title: 'Completed and Invoiced', detail: 'Sign-off captured and invoice ready' },
    ],
  },
  {
    id: 'accountant',
    label: 'Accountant',
    title: 'Commercial Billing and Payment Reconciliation',
    summary: 'Review itemized labor, verify parts billing, track corporate balances, and reconcile bank transfers.',
    invoice: {
      orderNo: 'WO-4812',
      invoiceNo: 'INV-4812',
      items: [
        { label: 'Solar Inverter Diagnostic & Calibration', amount: '₦35,000' },
        { label: '50A High-Voltage DC Circuit Breaker', amount: '₦28,500' },
        { label: 'Certified On-Site Labour Charge', amount: '₦20,000' },
      ],
      total: '₦83,500',
      settlement: 'Settled via Corporate Account',
    },
  },
];

const FAQS = [
  {
    q: 'Can technicians use FieldOps 360 when mobile connectivity drops?',
    a: 'Yes. The technician interface records diagnosis notes, parts deductions, and touch signatures into a persistent local queue. Once cellular service resumes, changes synchronize cleanly with the database.',
  },
  {
    q: 'How is company data separated between different contracting businesses?',
    a: 'Multi-tenant isolation is enforced at the database level using PostgreSQL Row Level Security. Queries execute within isolated company boundaries, guaranteeing that no organization can access another contractor’s data.',
  },
  {
    q: 'Can customers track job progress without creating an account?',
    a: 'Yes. Customers receive a secure direct tracking link via WhatsApp or SMS. Opening the link provides job milestones, technician details, and status updates without requiring account registration.',
  },
  {
    q: 'How does equipment warranty tracking work?',
    a: 'Every completed job links to customer equipment records by serial number and asset tag. When a customer requests service for an existing unit, active warranty coverage is automatically indicated.',
  },
  {
    q: 'What payment options are supported for invoice settlement?',
    a: 'Clients can settle work orders directly through pre-funded corporate balances, online card payments, or verified corporate bank transfer reconciliation upon signature approval.',
  },
];

export default function LandingPage() {
  const [activeRoleTab, setActiveRoleTab] = useState(0);
  const [trackQuery, setTrackQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  const currentRole = ROLE_PREVIEWS[activeRoleTab];

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
      
      {/* Navigation Bar */}
      <header style={{ borderBottom: '1px solid #e2e8f0', background: '#ffffff', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px', height: 70, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
            <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', color: '#0f172a' }}>
              <div style={{ width: 34, height: 34, borderRadius: 8, background: '#2563eb', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icons.Logo />
              </div>
              <div>
                <span style={{ fontSize: 17, fontWeight: 800, letterSpacing: '-0.02em', display: 'block', lineHeight: 1.1 }}>FIELDOPS 360</span>
                <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600, letterSpacing: '0.03em', textTransform: 'uppercase' }}>Field Service Management</span>
              </div>
            </Link>

            <nav style={{ display: 'flex', gap: 24 }} className="desktop-nav">
              <a href="#product" style={{ fontSize: 14, fontWeight: 600, color: '#475569', textDecoration: 'none' }}>Product</a>
              <a href="#solutions" style={{ fontSize: 14, fontWeight: 600, color: '#475569', textDecoration: 'none' }}>Solutions</a>
              <a href="#features" style={{ fontSize: 14, fontWeight: 600, color: '#475569', textDecoration: 'none' }}>Features</a>
              <a href="#workflow" style={{ fontSize: 14, fontWeight: 600, color: '#475569', textDecoration: 'none' }}>Workflow</a>
              <a href="#security" style={{ fontSize: 14, fontWeight: 600, color: '#475569', textDecoration: 'none' }}>Security</a>
              <a href="#tracking" style={{ fontSize: 14, fontWeight: 600, color: '#475569', textDecoration: 'none' }}>Order Lookup</a>
            </nav>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div className="desktop-actions" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Link href="/login" style={{ fontSize: 14, fontWeight: 600, color: '#334155', textDecoration: 'none', padding: '8px 14px' }}>
                Sign In
              </Link>
              <Link href="/login?mode=signup" style={{ fontSize: 14, fontWeight: 700, color: '#ffffff', background: '#2563eb', textDecoration: 'none', padding: '9px 18px', borderRadius: 8 }}>
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
          <div style={{ borderTop: '1px solid #e2e8f0', background: '#ffffff', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            <a href="#product" onClick={() => setMobileMenuOpen(false)} style={{ fontSize: 15, fontWeight: 600, color: '#334155', textDecoration: 'none', padding: '6px 0' }}>Product</a>
            <a href="#solutions" onClick={() => setMobileMenuOpen(false)} style={{ fontSize: 15, fontWeight: 600, color: '#334155', textDecoration: 'none', padding: '6px 0' }}>Solutions</a>
            <a href="#features" onClick={() => setMobileMenuOpen(false)} style={{ fontSize: 15, fontWeight: 600, color: '#334155', textDecoration: 'none', padding: '6px 0' }}>Features</a>
            <a href="#workflow" onClick={() => setMobileMenuOpen(false)} style={{ fontSize: 15, fontWeight: 600, color: '#334155', textDecoration: 'none', padding: '6px 0' }}>Workflow</a>
            <a href="#security" onClick={() => setMobileMenuOpen(false)} style={{ fontSize: 15, fontWeight: 600, color: '#334155', textDecoration: 'none', padding: '6px 0' }}>Security</a>
            <a href="#tracking" onClick={() => setMobileMenuOpen(false)} style={{ fontSize: 15, fontWeight: 600, color: '#334155', textDecoration: 'none', padding: '6px 0' }}>Order Lookup</a>
            <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <Link href="/login" onClick={() => setMobileMenuOpen(false)} style={{ textAlign: 'center', padding: '10px', borderRadius: 8, border: '1px solid #cbd5e1', color: '#0f172a', textDecoration: 'none', fontWeight: 600, fontSize: 14 }}>
                Sign In
              </Link>
              <Link href="/login?mode=signup" onClick={() => setMobileMenuOpen(false)} style={{ textAlign: 'center', padding: '10px', borderRadius: 8, background: '#2563eb', color: '#ffffff', textDecoration: 'none', fontWeight: 700, fontSize: 14 }}>
                Start Free Trial
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section style={{ padding: '64px 20px 48px', background: '#ffffff', borderBottom: '1px solid #e2e8f0' }}>
        <div style={{ maxWidth: 1040, margin: '0 auto', textAlign: 'center' }}>
          
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 14px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 20, fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 20 }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#2563eb' }}></span>
            <span>Commercial Field Service Management</span>
          </div>

          <h1 style={{ fontSize: 'clamp(28px, 4.4vw, 52px)', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.15, color: '#0f172a', margin: '0 0 20px' }}>
            Manage every service job from request to completion.
          </h1>

          <p style={{ fontSize: 'clamp(16px, 1.8vw, 19px)', color: '#475569', lineHeight: 1.6, maxWidth: 740, margin: '0 auto 32px' }}>
            FIELDOPS 360 helps service companies schedule technicians, manage customer requests, track jobs, control inventory, and collect payments from one connected platform.
          </p>

          {/* Restrained Action Pair */}
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 16 }}>
            <Link href="/login?mode=signup" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 26px', background: '#2563eb', color: '#ffffff', borderRadius: 8, fontWeight: 700, fontSize: 15, textDecoration: 'none' }}>
              <span>Start Free Trial</span>
              <Icons.ArrowRight />
            </Link>
            <a href="#product" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 24px', background: '#f8fafc', color: '#0f172a', border: '1px solid #cbd5e1', borderRadius: 8, fontWeight: 600, fontSize: 15, textDecoration: 'none' }}>
              <span>Explore the Platform</span>
            </a>
          </div>

          <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 40px' }}>
            Designed for commercial contractors · Multi-tenant security · Instant setup
          </p>

          {/* Realistic Product Preview */}
          <div id="product" style={{ textAlign: 'left', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: 12, overflow: 'hidden', boxShadow: '0 12px 36px rgba(15, 23, 42, 0.08)' }}>
            
            {/* Dashboard Title Bar */}
            <div style={{ background: '#f8fafc', padding: '12px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>FieldOps 360 Operations Dashboard</span>
                <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 4, background: '#eff6ff', color: '#2563eb', fontWeight: 600 }}>Sample Demonstration Data</span>
              </div>
              <div style={{ fontSize: 12, color: '#64748b' }}>Company: SolarTech Services Ltd</div>
            </div>

            {/* Application Mockup Layout */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 0 }}>
              
              {/* Compact Sidebar Mockup */}
              <div style={{ padding: '18px', background: '#f8fafc', borderRight: '1px solid #e2e8f0', maxWidth: 220 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 12 }}>Navigation</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13, fontWeight: 600 }}>
                  <div style={{ padding: '8px 10px', borderRadius: 6, background: '#e2e8f0', color: '#0f172a' }}>Work Orders</div>
                  <div style={{ padding: '8px 10px', borderRadius: 6, color: '#475569' }}>Dispatch Board</div>
                  <div style={{ padding: '8px 10px', borderRadius: 6, color: '#475569' }}>Customers</div>
                  <div style={{ padding: '8px 10px', borderRadius: 6, color: '#475569' }}>Technicians</div>
                  <div style={{ padding: '8px 10px', borderRadius: 6, color: '#475569' }}>Inventory & Parts</div>
                  <div style={{ padding: '8px 10px', borderRadius: 6, color: '#475569' }}>Invoices & Billing</div>
                  <div style={{ padding: '8px 10px', borderRadius: 6, color: '#475569' }}>Settings</div>
                </div>
              </div>

              {/* Main Table and Operations Area */}
              <div style={{ padding: '20px', flex: 1, minWidth: 0, overflowX: 'auto' }}>
                
                {/* Metric Summary Strip */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 12, marginBottom: 18 }}>
                  <div style={{ padding: '12px 14px', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 8 }}>
                    <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>Active Jobs</div>
                    <div style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', marginTop: 2 }}>24</div>
                  </div>
                  <div style={{ padding: '12px 14px', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 8 }}>
                    <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>Scheduled Today</div>
                    <div style={{ fontSize: 20, fontWeight: 800, color: '#2563eb', marginTop: 2 }}>12</div>
                  </div>
                  <div style={{ padding: '12px 14px', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 8 }}>
                    <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>Awaiting Assignment</div>
                    <div style={{ fontSize: 20, fontWeight: 800, color: '#b45309', marginTop: 2 }}>5</div>
                  </div>
                  <div style={{ padding: '12px 14px', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 8 }}>
                    <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>Pending Review</div>
                    <div style={{ fontSize: 20, fontWeight: 800, color: '#475569', marginTop: 2 }}>3</div>
                  </div>
                </div>

                {/* Work Orders Table */}
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, textAlign: 'left', minWidth: 620 }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #e2e8f0', color: '#64748b' }}>
                      <th style={{ padding: '10px 12px', fontWeight: 600 }}>Work Order</th>
                      <th style={{ padding: '10px 12px', fontWeight: 600 }}>Customer & Facility</th>
                      <th style={{ padding: '10px 12px', fontWeight: 600 }}>Service Type</th>
                      <th style={{ padding: '10px 12px', fontWeight: 600 }}>Technician</th>
                      <th style={{ padding: '10px 12px', fontWeight: 600 }}>Status</th>
                      <th style={{ padding: '10px 12px', fontWeight: 600 }}>Priority</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '12px', fontWeight: 700, color: '#2563eb', fontFamily: 'monospace' }}>WO-4812</td>
                      <td style={{ padding: '12px', color: '#0f172a' }}>Northfield Medical Center</td>
                      <td style={{ padding: '12px', color: '#475569' }}>HVAC Filter & Diagnostics</td>
                      <td style={{ padding: '12px', color: '#0f172a' }}>David Kalu</td>
                      <td style={{ padding: '12px' }}>
                        <span style={{ padding: '3px 8px', borderRadius: 4, background: '#eff6ff', color: '#2563eb', fontSize: 12, fontWeight: 600 }}>In Progress</span>
                      </td>
                      <td style={{ padding: '12px' }}>
                        <span style={{ padding: '3px 8px', borderRadius: 4, background: '#fef2f2', color: '#b91c1c', fontSize: 12, fontWeight: 600 }}>High</span>
                      </td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '12px', fontWeight: 700, color: '#2563eb', fontFamily: 'monospace' }}>WO-4815</td>
                      <td style={{ padding: '12px', color: '#0f172a' }}>Sterling Logistics Hub</td>
                      <td style={{ padding: '12px', color: '#475569' }}>Solar Inverter Inspection</td>
                      <td style={{ padding: '12px', color: '#0f172a' }}>Marcus Vance</td>
                      <td style={{ padding: '12px' }}>
                        <span style={{ padding: '3px 8px', borderRadius: 4, background: '#eff6ff', color: '#2563eb', fontSize: 12, fontWeight: 600 }}>En Route</span>
                      </td>
                      <td style={{ padding: '12px' }}>
                        <span style={{ padding: '3px 8px', borderRadius: 4, background: '#fffbeb', color: '#b45309', fontSize: 12, fontWeight: 600 }}>Urgent</span>
                      </td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '12px', fontWeight: 700, color: '#2563eb', fontFamily: 'monospace' }}>WO-4818</td>
                      <td style={{ padding: '12px', color: '#0f172a' }}>Apex Manufacturing</td>
                      <td style={{ padding: '12px', color: '#475569' }}>3-Phase Switchgear Test</td>
                      <td style={{ padding: '12px', color: '#0f172a' }}>Aisha Bello</td>
                      <td style={{ padding: '12px' }}>
                        <span style={{ padding: '3px 8px', borderRadius: 4, background: '#f8fafc', color: '#475569', fontSize: 12, fontWeight: 600 }}>Assigned</span>
                      </td>
                      <td style={{ padding: '12px' }}>
                        <span style={{ padding: '3px 8px', borderRadius: 4, background: '#f8fafc', color: '#475569', fontSize: 12, fontWeight: 600 }}>Normal</span>
                      </td>
                    </tr>
                    <tr>
                      <td style={{ padding: '12px', fontWeight: 700, color: '#2563eb', fontFamily: 'monospace' }}>WO-4821</td>
                      <td style={{ padding: '12px', color: '#0f172a' }}>Continental Office Park</td>
                      <td style={{ padding: '12px', color: '#475569' }}>250kVA Generator Service</td>
                      <td style={{ padding: '12px', color: '#64748b' }}>Unassigned</td>
                      <td style={{ padding: '12px' }}>
                        <span style={{ padding: '3px 8px', borderRadius: 4, background: '#fffbeb', color: '#b45309', fontSize: 12, fontWeight: 600 }}>Reviewing</span>
                      </td>
                      <td style={{ padding: '12px' }}>
                        <span style={{ padding: '3px 8px', borderRadius: 4, background: '#f8fafc', color: '#475569', fontSize: 12, fontWeight: 600 }}>Normal</span>
                      </td>
                    </tr>
                  </tbody>
                </table>

              </div>

            </div>

          </div>

        </div>
      </section>

      {/* Trust & Target Industries Section */}
      <section id="solutions" style={{ padding: '64px 20px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 8 }}>
              Industries Served
            </span>
            <h2 style={{ fontSize: 'clamp(24px, 3.2vw, 32px)', fontWeight: 800, color: '#0f172a', margin: '0 0 12px' }}>
              Built for commercial service and contracting businesses
            </h2>
            <p style={{ fontSize: 15, color: '#475569', maxWidth: 680, margin: '0 auto' }}>
              FieldOps 360 supports specialized trade teams with scheduling, job execution, materials tracking, and customer accountability.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14 }}>
            {TARGET_INDUSTRIES.map((ind, idx) => (
              <div key={idx} style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 8, padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ color: '#2563eb' }}><Icons.Check /></div>
                <span style={{ fontSize: 14, fontWeight: 600, color: '#0f172a' }}>{ind}</span>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* Six Principal Capabilities */}
      <section id="features" style={{ padding: '80px 20px', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 8 }}>
            Core Platform Modules
          </span>
          <h2 style={{ fontSize: 'clamp(26px, 3.5vw, 36px)', fontWeight: 800, color: '#0f172a', margin: '0 0 12px' }}>
            Everything needed to run field operations
          </h2>
          <p style={{ fontSize: 15, color: '#475569', maxWidth: 640, margin: '0 auto' }}>
            Connect managers, technicians, customers, and accounting in one reliable operational system.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24 }}>
          {PRINCIPAL_CAPABILITIES.map((cap, idx) => {
            const CapIcon = cap.icon;
            return (
              <div key={idx} style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 10, padding: '28px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ width: 40, height: 40, borderRadius: 8, background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}>
                    <CapIcon />
                  </div>
                  <h3 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', margin: '0 0 10px' }}>{cap.title}</h3>
                  <p style={{ fontSize: 14, color: '#475569', lineHeight: 1.6, margin: 0 }}>{cap.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Workflow Section */}
      <section id="workflow" style={{ padding: '80px 20px', background: '#f8fafc', borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 8 }}>
              Business Workflow
            </span>
            <h2 style={{ fontSize: 'clamp(26px, 3.5vw, 36px)', fontWeight: 800, color: '#0f172a', margin: '0 0 12px' }}>
              How jobs progress through FieldOps 360
            </h2>
            <p style={{ fontSize: 15, color: '#475569', maxWidth: 640, margin: '0 auto' }}>
              A disciplined, traceable lifecycle from first customer contact to payment reconciliation.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
            {WORKFLOW_STEPS.map((wf, idx) => (
              <div key={idx} style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: 8, padding: '20px' }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: '#2563eb', marginBottom: 8 }}>STAGE {wf.step}</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', marginBottom: 6 }}>{wf.title}</div>
                <p style={{ fontSize: 13, color: '#475569', lineHeight: 1.5, margin: 0 }}>{wf.desc}</p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* Role-Based Product Previews */}
      <section style={{ padding: '80px 20px', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 8 }}>
            Role-Specific Interfaces
          </span>
          <h2 style={{ fontSize: 'clamp(26px, 3.5vw, 36px)', fontWeight: 800, color: '#0f172a', margin: '0 0 12px' }}>
            Tailored experiences for every operational team member
          </h2>
          <p style={{ fontSize: 15, color: '#475569', maxWidth: 640, margin: '0 auto' }}>
            Inspect how the platform presents relevant data for managers, technicians, customers, and accounting.
          </p>
        </div>

        {/* Tab Controls */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 28, flexWrap: 'wrap' }}>
          {ROLE_PREVIEWS.map((role, idx) => (
            <button
              key={role.id}
              type="button"
              onClick={() => setActiveRoleTab(idx)}
              style={{
                padding: '9px 18px',
                borderRadius: 7,
                border: activeRoleTab === idx ? '1px solid #2563eb' : '1px solid #cbd5e1',
                background: activeRoleTab === idx ? '#eff6ff' : '#ffffff',
                color: activeRoleTab === idx ? '#2563eb' : '#475569',
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
                margin: 0,
              }}
            >
              {role.label}
            </button>
          ))}
        </div>

        {/* Role Content Card */}
        <div style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: 10, padding: '24px' }}>
          <div style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: 16, marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Role Interface Preview</span>
              <h3 style={{ fontSize: 19, fontWeight: 700, color: '#0f172a', margin: '4px 0 0' }}>{currentRole.title}</h3>
            </div>
            <p style={{ fontSize: 13, color: '#475569', maxWidth: 460, margin: 0 }}>{currentRole.summary}</p>
          </div>

          {/* Manager Role Preview */}
          {currentRole.id === 'manager' && (
            <div style={{ overflowX: 'auto', background: '#ffffff', borderRadius: 8, border: '1px solid #e2e8f0' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, textAlign: 'left', minWidth: 620 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #e2e8f0', color: '#64748b', background: '#f8fafc' }}>
                    <th style={{ padding: '10px 14px', fontWeight: 600 }}>Work Order</th>
                    <th style={{ padding: '10px 14px', fontWeight: 600 }}>Customer Facility</th>
                    <th style={{ padding: '10px 14px', fontWeight: 600 }}>Service Requested</th>
                    <th style={{ padding: '10px 14px', fontWeight: 600 }}>Technician</th>
                    <th style={{ padding: '10px 14px', fontWeight: 600 }}>Status</th>
                    <th style={{ padding: '10px 14px', fontWeight: 600 }}>Priority</th>
                  </tr>
                </thead>
                <tbody>
                  {currentRole.data.map((row, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '12px 14px', fontFamily: 'monospace', color: '#2563eb', fontWeight: 700 }}>{row.id}</td>
                      <td style={{ padding: '12px 14px', color: '#0f172a', fontWeight: 600 }}>{row.client}</td>
                      <td style={{ padding: '12px 14px', color: '#475569' }}>{row.service}</td>
                      <td style={{ padding: '12px 14px', color: '#0f172a' }}>{row.tech}</td>
                      <td style={{ padding: '12px 14px' }}>
                        <span style={{ padding: '3px 8px', borderRadius: 4, background: '#eff6ff', color: '#2563eb', fontSize: 12, fontWeight: 600 }}>{row.status}</span>
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <span style={{ padding: '3px 8px', borderRadius: 4, background: row.priority === 'Urgent' ? '#fffbeb' : '#f8fafc', color: row.priority === 'Urgent' ? '#b45309' : '#475569', fontSize: 12, fontWeight: 600 }}>
                          {row.priority}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Technician Role Preview */}
          {currentRole.id === 'technician' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 14 }}>
              {currentRole.checklist.map((item, idx) => (
                <div key={idx} style={{ padding: '16px', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 8, display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <div style={{ color: '#15803d', marginTop: 2 }}><Icons.Check /></div>
                  <span style={{ fontSize: 14, color: '#334155', lineHeight: 1.5 }}>{item}</span>
                </div>
              ))}
            </div>
          )}

          {/* Customer Role Preview */}
          {currentRole.id === 'customer' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
              {currentRole.milestones.map((m, idx) => (
                <div key={idx} style={{ padding: '16px', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 8 }}>
                  <div style={{ width: 26, height: 26, borderRadius: '50%', background: '#2563eb', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, marginBottom: 10 }}>
                    {idx + 1}
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>{m.title}</div>
                  <div style={{ fontSize: 12, color: '#64748b', lineHeight: 1.4 }}>{m.detail}</div>
                </div>
              ))}
            </div>
          )}

          {/* Accountant Role Preview */}
          {currentRole.id === 'accountant' && (
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 8, padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14, paddingBottom: 10, borderBottom: '1px solid #e2e8f0', flexWrap: 'wrap', gap: 8 }}>
                <span style={{ fontSize: 14, color: '#64748b' }}>Work Order: <strong style={{ color: '#0f172a' }}>{currentRole.invoice.orderNo}</strong></span>
                <span style={{ fontSize: 14, color: '#64748b' }}>Invoice Reference: <strong style={{ color: '#0f172a' }}>{currentRole.invoice.invoiceNo}</strong></span>
              </div>
              {currentRole.invoice.items.map((it, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f8fafc', fontSize: 14 }}>
                  <span style={{ color: '#334155' }}>{it.label}</span>
                  <span style={{ fontWeight: 600, color: '#0f172a' }}>{it.amount}</span>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 14, paddingTop: 12, borderTop: '2px solid #e2e8f0' }}>
                <span style={{ fontSize: 15, fontWeight: 700, color: '#0f172a' }}>Total Invoice Amount</span>
                <span style={{ fontSize: 18, fontWeight: 800, color: '#2563eb' }}>{currentRole.invoice.total}</span>
              </div>
              <div style={{ marginTop: 12, padding: '6px 12px', background: '#ecfdf5', borderRadius: 6, fontSize: 12, color: '#15803d', fontWeight: 600, display: 'inline-block' }}>
                {currentRole.invoice.settlement}
              </div>
            </div>
          )}

        </div>
      </section>

      {/* Security and Architecture Section */}
      <section id="security" style={{ padding: '80px 20px', background: '#f8fafc', borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          
          <div style={{ textAlign: 'center', marginBottom: 44 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 8 }}>
              Security and Data Integrity
            </span>
            <h2 style={{ fontSize: 'clamp(26px, 3.5vw, 36px)', fontWeight: 800, color: '#0f172a', margin: '0 0 12px' }}>
              Built for commercial accountability
            </h2>
            <p style={{ fontSize: 15, color: '#475569', maxWidth: 640, margin: '0 auto' }}>
              FieldOps 360 secures customer information, job histories, and financial records with proven database controls.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
            
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 8, padding: '22px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <div style={{ color: '#2563eb' }}><Icons.Lock /></div>
                <h4 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: 0 }}>Authentication and Encryption</h4>
              </div>
              <p style={{ fontSize: 13, color: '#475569', lineHeight: 1.6, margin: 0 }}>
                Encrypted password storage and verified session handling prevent unauthorized account access.
              </p>
            </div>

            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 8, padding: '22px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <div style={{ color: '#2563eb' }}><Icons.Users /></div>
                <h4 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: 0 }}>Role-Based Access Control</h4>
              </div>
              <p style={{ fontSize: 13, color: '#475569', lineHeight: 1.6, margin: 0 }}>
                Dedicated interfaces strictly limit capabilities for Super Admins, Operations Managers, Field Technicians, Accountants, and Customers.
              </p>
            </div>

            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 8, padding: '22px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <div style={{ color: '#2563eb' }}><Icons.Shield /></div>
                <h4 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: 0 }}>Organization Data Isolation</h4>
              </div>
              <p style={{ fontSize: 13, color: '#475569', lineHeight: 1.6, margin: 0 }}>
                PostgreSQL Row Level Security partitions database records by company ID, ensuring zero data leakage between different contracting businesses.
              </p>
            </div>

            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 8, padding: '22px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <div style={{ color: '#2563eb' }}><Icons.FileText /></div>
                <h4 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: 0 }}>Immutable Audit Logging</h4>
              </div>
              <p style={{ fontSize: 13, color: '#475569', lineHeight: 1.6, margin: 0 }}>
                Every status update, technician reassignment, and financial transaction creates an append-only audit trail with timestamps and user identifiers.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* Customer Tracking Lookup */}
      <section id="tracking" style={{ padding: '80px 20px', background: '#ffffff', borderBottom: '1px solid #e2e8f0' }}>
        <div style={{ maxWidth: 720, margin: '0 auto', textAlign: 'center' }}>
          
          <span style={{ fontSize: 12, fontWeight: 700, color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 8 }}>
            Customer Experience
          </span>
          <h2 style={{ fontSize: 'clamp(24px, 3.2vw, 32px)', fontWeight: 800, color: '#0f172a', margin: '0 0 12px' }}>
            Work Order Tracking Lookup
          </h2>
          <p style={{ fontSize: 15, color: '#475569', margin: '0 0 28px' }}>
            Check the status of an active job, view technician details, and review arrival estimates using your work order reference.
          </p>

          <div style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: 10, padding: '20px', boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)' }}>
            <form onSubmit={handleTrackSubmit} style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: 240, display: 'flex', alignItems: 'center', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: 8, padding: '0 12px' }}>
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
              <button type="submit" style={{ margin: 0, padding: '12px 24px', background: '#2563eb', color: '#ffffff', borderRadius: 8, fontSize: 14, fontWeight: 700, border: 'none', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                Track Order
              </button>
            </form>

            <div style={{ marginTop: 16, paddingTop: 14, borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
              <span style={{ fontSize: 12, color: '#64748b' }}>Need to test tracking?</span>
              <Link href="/track?no=REQ-DEMO-4109" style={{ fontSize: 13, fontWeight: 700, color: '#2563eb', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <span>Launch Demonstration Tracking (REQ-DEMO-4109)</span>
                <Icons.ArrowRight />
              </Link>
            </div>
          </div>

        </div>
      </section>

      {/* Frequently Asked Questions */}
      <section id="faq" style={{ padding: '80px 20px', maxWidth: 860, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 8 }}>
            Frequently Asked Questions
          </span>
          <h2 style={{ fontSize: 'clamp(24px, 3.2vw, 32px)', fontWeight: 800, color: '#0f172a', margin: 0 }}>
            Questions about using FieldOps 360
          </h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {FAQS.map((faq, idx) => (
            <div
              key={idx}
              style={{
                border: '1px solid #cbd5e1',
                borderRadius: 8,
                background: '#ffffff',
                overflow: 'hidden',
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
                  padding: '16px 20px',
                  background: openFaq === idx ? '#f8fafc' : '#ffffff',
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
                <div style={{ padding: '0 20px 18px', background: '#f8fafc', borderTop: '1px solid #f1f5f9' }}>
                  <p style={{ margin: 0, paddingTop: 12, fontSize: 14, color: '#475569', lineHeight: 1.6 }}>
                    {faq.a}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Final Conversion Section */}
      <section style={{ padding: '64px 20px', background: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
        <div style={{ maxWidth: 880, margin: '0 auto', textAlign: 'center', border: '1px solid #cbd5e1', borderRadius: 12, padding: '44px 24px', background: '#ffffff' }}>
          <h2 style={{ fontSize: 'clamp(24px, 3.2vw, 32px)', fontWeight: 800, color: '#0f172a', margin: '0 0 14px' }}>
            Ready to streamline your field service operations?
          </h2>
          <p style={{ fontSize: 15, color: '#475569', maxWidth: 580, margin: '0 auto 28px', lineHeight: 1.6 }}>
            Set up your organization, schedule your technicians, and manage customer service requests with FieldOps 360.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
            <Link href="/login?mode=signup" style={{ padding: '12px 26px', background: '#2563eb', color: '#ffffff', borderRadius: 8, fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>
              Start Free Trial
            </Link>
            <Link href="/login" style={{ padding: '12px 24px', background: '#ffffff', color: '#0f172a', border: '1px solid #cbd5e1', borderRadius: 8, fontWeight: 600, fontSize: 14, textDecoration: 'none' }}>
              Sign In to Portal
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid #e2e8f0', padding: '52px 20px 32px', background: '#ffffff', fontSize: 13, color: '#64748b' }}>
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
                Field service management software for contracting and maintenance companies. Work order dispatch, technician execution, and customer invoicing.
              </p>
            </div>

            <div>
              <div style={{ fontWeight: 700, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 12 }}>Product Modules</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <a href="#features" style={{ color: '#475569', textDecoration: 'none' }}>Service Requests & Work Orders</a>
                <a href="#features" style={{ color: '#475569', textDecoration: 'none' }}>Technician Scheduling</a>
                <a href="#features" style={{ color: '#475569', textDecoration: 'none' }}>Mobile Job Execution</a>
                <a href="#features" style={{ color: '#475569', textDecoration: 'none' }}>Inventory and Materials</a>
                <a href="#features" style={{ color: '#475569', textDecoration: 'none' }}>Invoicing and Payments</a>
              </div>
            </div>

            <div>
              <div style={{ fontWeight: 700, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 12 }}>Portals & Access</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <Link href="/login" style={{ color: '#475569', textDecoration: 'none' }}>Operations Manager</Link>
                <Link href="/login" style={{ color: '#475569', textDecoration: 'none' }}>Technician Access</Link>
                <Link href="/login" style={{ color: '#475569', textDecoration: 'none' }}>Customer Portal</Link>
                <Link href="/track?no=REQ-DEMO-4109" style={{ color: '#475569', textDecoration: 'none' }}>Track Work Order</Link>
              </div>
            </div>

            <div>
              <div style={{ fontWeight: 700, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 12 }}>Account & Security</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <Link href="/login?mode=signup" style={{ color: '#475569', textDecoration: 'none' }}>Start Free Trial</Link>
                <Link href="/login" style={{ color: '#475569', textDecoration: 'none' }}>Sign In to Portal</Link>
                <Link href="/reset" style={{ color: '#475569', textDecoration: 'none' }}>Password Recovery</Link>
                <a href="#security" style={{ color: '#475569', textDecoration: 'none' }}>Security Overview</a>
              </div>
            </div>

          </div>

          <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <div>
              © 2026 FieldOps 360. All rights reserved.
            </div>
            <div style={{ display: 'flex', gap: 18 }}>
              <a href="#security" style={{ color: '#64748b', textDecoration: 'none' }}>Data Isolation</a>
              <a href="#security" style={{ color: '#64748b', textDecoration: 'none' }}>Access Controls</a>
              <a href="#security" style={{ color: '#64748b', textDecoration: 'none' }}>Audit Trail</a>
            </div>
          </div>

        </div>
      </footer>

    </div>
  );
}
