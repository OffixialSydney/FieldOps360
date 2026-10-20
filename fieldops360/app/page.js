'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '../lib/supabase';
import Footer from '../components/Footer';

// Consistent SVG icons tailored for FieldOps 360 (Zero emojis, zero decorative AI glyphs)
const Icons = {
  Logo: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <polygon points="12 2 15 8 22 9 17 14 18 21 12 17 6 21 7 14 2 9 9 8 12 2" />
    </svg>
  ),
  Search: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  ),
  MapPin: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  ),
  Crosshair: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <line x1="22" y1="12" x2="18" y2="12" />
      <line x1="6" y1="12" x2="2" y2="12" />
      <line x1="12" y1="6" x2="12" y2="2" />
      <line x1="12" y1="22" x2="12" y2="18" />
    </svg>
  ),
  ArrowRight: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  ),
  ChevronLeft: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  ),
  ChevronRight: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  ),
  Star: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="#EAB308" stroke="#EAB308" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  ),
  Menu: () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  ),
  Close: () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
  ShieldCheck: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <polyline points="9 12 11 14 15 10" />
    </svg>
  ),
  Building: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
      <line x1="9" y1="22" x2="9" y2="2" />
      <path d="M8 6h.01" /><path d="M16 6h.01" /><path d="M8 10h.01" /><path d="M16 10h.01" />
      <path d="M8 14h.01" /><path d="M16 14h.01" /><path d="M8 18h.01" /><path d="M16 18h.01" />
    </svg>
  ),
};

// Reliable fallback image URL verified to render in all browsers
const SAFE_IMAGE = 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=600&q=80';

// 8 Popular Services matching FieldOps 360 supported project trades
const POPULAR_SERVICES = [
  {
    title: 'Solar Installation',
    image: 'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?auto=format&fit=crop&w=600&q=80',
    link: '/dashboard',
  },
  {
    title: 'Generator Repair & Servicing',
    image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=600&q=80',
    link: '/dashboard',
  },
  {
    title: 'Air-Conditioner Servicing',
    image: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=600&q=80',
    link: '/dashboard',
  },
  {
    title: 'Electrical Contracting',
    image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=600&q=80',
    link: '/dashboard',
  },
  {
    title: 'Plumbing Services',
    image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=600&q=80',
    link: '/dashboard',
  },
  {
    title: 'Solar Maintenance',
    image: 'https://images.unsplash.com/photo-1545209179-a5dc5504971a?auto=format&fit=crop&w=600&q=80',
    link: '/dashboard',
  },
  {
    title: 'CCTV Installation',
    image: 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&w=600&q=80',
    link: '/dashboard',
  },
  {
    title: 'Equipment Maintenance',
    image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=600&q=80',
    link: '/dashboard',
  },
];

// Client Testimonials tailored to Nigerian commercial and residential clients
const CLIENT_REVIEWS = [
  {
    name: 'Chief Adeleke O.',
    role: 'Facility Director · Lekki Phase 1',
    featured: false,
    text: 'FieldOps 360 resolved our estate generator breakdown within 24 hours. The dispatched technician arrived with verified credentials, diagnostics were clear, and digital sign-off made billing seamless.',
  },
  {
    name: 'Engr. David Chukwu',
    role: 'Solar Project Lead · Ikeja Industrial Estate',
    featured: true,
    text: 'The most reliable field contractor platform in Nigeria. Comparing quotes and tracking technician arrival in real time took all the guesswork out of maintenance for our solar inverter arrays.',
  },
  {
    name: 'Amina Bello',
    role: 'Operations Manager · Victoria Island',
    featured: false,
    text: 'Finding certified commercial AC technicians used to take days of calling around. With FieldOps 360, we dispatched vetted technicians directly to our offices and got cooling restored ahead of schedule.',
  },
];

// Free Cost Estimates strictly tailored to actual FieldOps 360 project services
const COST_ESTIMATES = [
  {
    title: 'Solar Inverter Installation (3kVA to 5kVA)',
    range: '₦180,000 to ₦350,000',
    detail: '(rack mounting, inverter setup, battery balancing & cabling)',
    image: 'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?auto=format&fit=crop&w=600&q=80',
  },
  {
    title: 'Generator Routine Servicing (15kVA to 50kVA)',
    range: '₦35,000 to ₦75,000',
    detail: '(oil change, fuel filter replacement & ATS calibration)',
    image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=600&q=80',
  },
  {
    title: 'Air-Conditioner Servicing & Gas Refill',
    range: '₦15,000 to ₦30,000',
    detail: '(deep coil cleaning, gas recharge & leak audit)',
    image: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=600&q=80',
  },
  {
    title: 'Electrical Panel Wiring & Distribution',
    range: '₦40,000 to ₦90,000',
    detail: '(distribution board audit, breaker testing & surge protection)',
    image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=600&q=80',
  },
  {
    title: 'Plumbing Leak Repair & Pump Servicing',
    range: '₦20,000 to ₦50,000',
    detail: '(pressure pipe repair, valve replacement & pump checkout)',
    image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=600&q=80',
  },
  {
    title: 'CCTV Camera Setup (4 to 8 Channels)',
    range: '₦45,000 to ₦85,000',
    detail: '(wiring, DVR/NVR configuration & mobile app remote setup)',
    image: 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&w=600&q=80',
  },
];

// Initial registered contractors on platform (dynamically updated when new companies register)
const DEFAULT_FEATURED_COMPANIES = [
  { id: '1', name: 'Apex Solar & High-Voltage Tech', trade: 'Solar Installation & Maintenance', location: 'Lekki, Lagos', score: '4.9', jobs: '240+ jobs' },
  { id: '2', name: 'Perkins Diesel Engineering Works', trade: 'Generator Repair & Servicing', location: 'Ikeja Industrial Zone, Lagos', score: '4.8', jobs: '310+ jobs' },
  { id: '3', name: 'Continental Chiller & AC Systems', trade: 'Air-Conditioner Servicing', location: 'Victoria Island, Lagos', score: '5.0', jobs: '185+ jobs' },
  { id: '4', name: 'VoltMaster 3-Phase Switchgear Tech', trade: 'Electrical Contracting', location: 'Marina Central, Lagos', score: '4.9', jobs: '160+ jobs' },
  { id: '5', name: 'Metro Flow Plumbing & Pressure Controls', trade: 'Plumbing Services', location: 'Surulere, Lagos', score: '4.8', jobs: '145+ jobs' },
  { id: '6', name: 'ShieldPoint CCTV & Security Systems', trade: 'CCTV Installation', location: 'Maitama, Abuja FCT', score: '5.0', jobs: '195+ jobs' },
];

export default function LandingPage() {
  const [serviceQuery, setServiceQuery] = useState('');
  const [locationQuery, setLocationQuery] = useState('Lagos');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [companies, setCompanies] = useState(DEFAULT_FEATURED_COMPANIES);

  // Dynamically load registered companies from Supabase database
  useEffect(() => {
    async function loadRegisteredCompanies() {
      try {
        const { data, error } = await supabase.from('companies').select('*').order('created_at', { ascending: false }).limit(6);
        if (!error && data && data.length > 0) {
          const mapped = data.map((c, idx) => ({
            id: c.id || String(idx),
            name: c.name || 'Registered Contractor',
            trade: Array.isArray(c.services) && c.services.length > 0 ? c.services.join(' · ') : 'Commercial Field Contractor',
            location: c.city || 'Nigeria',
            score: '4.9',
            jobs: 'Verified Partner',
          }));
          setCompanies(mapped);
        }
      } catch (err) {
        // Fallback to default featured companies
      }
    }
    loadRegisteredCompanies();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const service = serviceQuery.trim();
    if (service) {
      window.location.href = `/dashboard?search=${encodeURIComponent(service)}&loc=${encodeURIComponent(locationQuery)}`;
    } else {
      window.location.href = '/dashboard';
    }
  };

  return (
    <div style={{ background: '#ffffff', color: '#0f172a', minHeight: '100vh', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Inter", "Helvetica Neue", Arial, sans-serif' }}>
      
      {/* FieldOps 360 Responsive Styles */}
      <style>{`
        .hero-pattern-bg {
          background-image: 
            linear-gradient(to right, rgba(226, 232, 240, 0.5) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(226, 232, 240, 0.5) 1px, transparent 1px);
          background-size: 36px 36px;
        }
        .popular-service-card {
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .popular-service-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 14px 28px -4px rgba(15, 23, 42, 0.12);
        }
        .showcase-pro-card {
          transition: transform 0.25s ease;
        }
        .showcase-pro-card:hover {
          transform: scale(1.05) rotate(0deg) !important;
          z-index: 10;
        }
        .company-registered-card {
          transition: transform 0.18s ease, border-color 0.18s ease, box-shadow 0.18s ease;
        }
        .company-registered-card:hover {
          transform: translateY(-3px);
          border-color: #1a6dff;
          box-shadow: 0 10px 24px -4px rgba(26, 109, 255, 0.12);
        }
        @keyframes fieldops-pulse {
          0% { transform: scale(0.95); opacity: 0.8; }
          50% { transform: scale(1.35); opacity: 0; }
          100% { transform: scale(0.95); opacity: 0; }
        }
        .fieldops-ping {
          animation: fieldops-pulse 2s cubic-bezier(0.24, 0, 0.38, 1) infinite;
        }
        .footer-4col-grid {
          display: grid;
          grid-template-columns: 1fr 1.05fr 0.95fr 1.35fr;
          gap: 36px;
          align-items: start;
          margin-bottom: 54px;
        }
        .footer-link-item {
          color: #94a3b8;
          text-decoration: none;
          font-size: 14.5px;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          transition: color 0.15s ease;
        }
        .footer-link-item:hover {
          color: #1a6dff;
        }
        @media (max-width: 960px) {
          .footer-4col-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 36px 24px !important;
          }
        }
        @media (max-width: 560px) {
          .footer-4col-grid {
            grid-template-columns: 1fr !important;
            gap: 28px !important;
          }
          .footer-bottom-row {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 20px !important;
          }
        }
        @media (max-width: 860px) {
          .desktop-nav { display: none !important; }
          .desktop-actions { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
          .stats-container { flex-direction: column !important; }
          .stats-col { border-right: none !important; border-bottom: 1px solid rgba(255, 255, 255, 0.2) !important; padding: 14px 0 !important; width: 100% !important; }
          .stats-col:last-child { border-bottom: none !important; }
        }
        @media (max-width: 640px) {
          .search-pill-form { flex-direction: column !important; border-radius: 20px !important; padding: 12px !important; }
          .search-divider { display: none !important; }
          .search-pill-input { width: 100% !important; padding: 10px 8px !important; }
          .search-pill-btn { width: 100% !important; border-radius: 12px !important; padding: 12px !important; }
          .tilted-strip-container { gap: 10px !important; }
          .showcase-pro-card { width: 140px !important; height: 145px !important; }
          .how-it-works-box { flex-direction: column !important; }
          .how-it-works-step { border-right: none !important; border-bottom: 1px solid rgba(255, 255, 255, 0.2) !important; padding: 20px 0 !important; }
          .how-it-works-step:last-child { border-bottom: none !important; }
        }
      `}</style>

      {/* 1. Header Matching Inspiration Website with FieldOps 360 Logo & Name */}
      <header style={{ position: 'sticky', top: 0, zIndex: 100, background: 'rgba(255, 255, 255, 0.98)', backdropFilter: 'blur(10px)', borderBottom: '1px solid #f1f5f9' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', height: 72, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          
          {/* Logo & Project Name */}
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: '#1a6dff', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(26, 109, 255, 0.3)' }}>
              <Icons.Logo />
            </div>
            <span style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-0.03em', color: '#0f172a' }}>FieldOps 360</span>
          </Link>

          {/* Navigation Links */}
          <nav className="desktop-nav" style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
            
            {/* Live Operations Portal Pill */}
            <Link 
              href="/dashboard" 
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 7,
                padding: '5px 14px',
                borderRadius: 9999,
                background: '#e0edff',
                color: '#1a6dff',
                fontWeight: 700,
                fontSize: 12.5,
                textDecoration: 'none',
              }}
            >
              <span>Operations Portal</span>
              <span style={{ position: 'relative', display: 'flex', width: 7, height: 7 }}>
                <span className="fieldops-ping" style={{ position: 'absolute', width: '100%', height: '100%', borderRadius: '50%', background: '#1a6dff' }}></span>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#1a6dff' }}></span>
              </span>
            </Link>

            <Link href="/track" style={{ fontSize: 14, fontWeight: 600, color: '#334155', textDecoration: 'none' }}>Track Work Order</Link>
            <a href="#estimates" style={{ fontSize: 14, fontWeight: 600, color: '#334155', textDecoration: 'none' }}>Cost Estimates</a>
          </nav>

          {/* Right Action: Clean Outline Pill Login Button */}
          <div className="desktop-actions" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <Link 
              href="/login" 
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '8px 24px',
                borderRadius: 9999,
                border: '1.5px solid #1a6dff',
                color: '#1a6dff',
                background: '#ffffff',
                fontWeight: 700,
                fontSize: 13.5,
                textDecoration: 'none',
                transition: 'all 0.15s ease'
              }}
            >
              Sign In
            </Link>
          </div>

          {/* Mobile Hamburger Toggle */}
          <button 
            type="button" 
            className="mobile-menu-btn" 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{ display: 'none', background: 'none', border: 'none', cursor: 'pointer', padding: 8, color: '#0f172a' }}
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <Icons.Close /> : <Icons.Menu />}
          </button>

        </div>
      </header>

      {/* Responsive Mobile Drawer */}
      {mobileMenuOpen && (
        <div style={{ background: '#ffffff', borderBottom: '1px solid #e2e8f0', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)} style={{ fontSize: 15, fontWeight: 700, color: '#1a6dff', textDecoration: 'none' }}>
            Live Operations Portal
          </Link>
          <Link href="/track" onClick={() => setMobileMenuOpen(false)} style={{ fontSize: 15, fontWeight: 600, color: '#334155', textDecoration: 'none' }}>
            Track Work Order
          </Link>
          <a href="#estimates" onClick={() => setMobileMenuOpen(false)} style={{ fontSize: 15, fontWeight: 600, color: '#334155', textDecoration: 'none' }}>
            Cost Estimates
          </a>
          <Link href="/login" onClick={() => setMobileMenuOpen(false)} style={{ display: 'inline-block', textAlign: 'center', padding: '10px 20px', borderRadius: 9999, background: '#1a6dff', color: '#ffffff', fontWeight: 700, textDecoration: 'none' }}>
            Sign In / Register
          </Link>
        </div>
      )}

      {/* 2. Hero Section */}
      <section className="hero-pattern-bg" style={{ position: 'relative', overflow: 'hidden', paddingTop: '48px', paddingBottom: '96px', borderBottom: '1px solid #f1f5f9' }}>
        <div style={{ maxWidth: 1140, margin: '0 auto', padding: '0 24px', textAlign: 'center' }}>
          
          {/* Tilted FieldOps Badge */}
          <div style={{ display: 'inline-block', marginBottom: 20 }}>
            <span style={{ 
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '6px 16px', 
              borderRadius: 9999, 
              background: '#ffffff', 
              border: '1.5px solid #dbeafe', 
              boxShadow: '0 2px 10px rgba(26, 109, 255, 0.08)',
              color: '#1a6dff', 
              fontSize: 12.5, 
              fontWeight: 800, 
              textTransform: 'uppercase', 
              letterSpacing: '0.05em' 
            }}>
              <Icons.ShieldCheck />
              <span>Verified Enterprise Field Operations</span>
            </span>
          </div>

          {/* Main Headline */}
          <h1 style={{ fontSize: 'clamp(32px, 4.5vw, 54px)', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.03em', lineHeight: 1.15, margin: '0 auto 18px', maxWidth: 840 }}>
            Book trusted specialists for your solar, generator, and technical repairs
          </h1>

          <p style={{ fontSize: 'clamp(15px, 1.8vw, 18px)', color: '#64748b', maxWidth: 660, margin: '0 auto 36px', lineHeight: 1.6 }}>
            Over 1,200 vetted technicians ready for dispatch across Lagos, Abuja, and nationwide commercial centers.
          </p>

          {/* Pill Search Box */}
          <div style={{ maxWidth: 780, margin: '0 auto 52px' }}>
            <form onSubmit={handleSearchSubmit} className="search-pill-form" style={{ display: 'flex', alignItems: 'center', background: '#ffffff', border: '1.5px solid #cbd5e1', borderRadius: 9999, padding: '6px 8px 6px 20px', boxShadow: '0 8px 30px rgba(15, 23, 42, 0.08)' }}>
              
              {/* Input 1: Service */}
              <div style={{ flex: 1.2, display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ color: '#64748b' }}><Icons.Search /></span>
                <input 
                  type="text" 
                  value={serviceQuery}
                  onChange={(e) => setServiceQuery(e.target.value)}
                  placeholder="Service (e.g. Solar, Generator, AC)" 
                  className="search-pill-input"
                  style={{ width: '100%', border: 'none', outline: 'none', fontSize: 14.5, color: '#0f172a', background: 'transparent' }}
                />
              </div>

              {/* Vertical divider */}
              <div className="search-divider" style={{ width: 1, height: 28, background: '#e2e8f0', margin: '0 12px' }}></div>

              {/* Input 2: Location */}
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ color: '#64748b' }}><Icons.MapPin /></span>
                <input 
                  type="text" 
                  value={locationQuery}
                  onChange={(e) => setLocationQuery(e.target.value)}
                  placeholder="Location (e.g. Lagos, Abuja)" 
                  className="search-pill-input"
                  style={{ width: '100%', border: 'none', outline: 'none', fontSize: 14.5, color: '#0f172a', background: 'transparent' }}
                />
                <span style={{ color: '#64748b', cursor: 'pointer' }} title="Current Location"><Icons.Crosshair /></span>
              </div>

              {/* Action Button: Find Specialists */}
              <button 
                type="submit" 
                className="search-pill-btn"
                style={{
                  background: '#1a6dff',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: 9999,
                  padding: '12px 28px',
                  fontSize: 14.5,
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  margin: 0,
                  boxShadow: '0 2px 10px rgba(26, 109, 255, 0.35)',
                  whiteSpace: 'nowrap'
                }}
              >
                <span>Find Specialists</span>
              </button>

            </form>
          </div>

          {/* Tilted Photo Showcase (Field Specialists for Real Project Trades) */}
          <div className="tilted-strip-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 16, flexWrap: 'wrap', margin: '20px auto 44px', maxWidth: 1080 }}>
            {[
              { title: 'Solar Engineer', loc: 'Lekki Phase 1', img: 'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?auto=format&fit=crop&w=400&q=80', rot: '-3deg' },
              { title: 'Diesel Specialist', loc: 'Ikeja Industrial', img: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=400&q=80', rot: '2deg' },
              { title: 'HVAC Technician', loc: 'Victoria Island', img: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=400&q=80', rot: '-2deg' },
              { title: 'Master Electrician', loc: 'Marina, Lagos', img: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=400&q=80', rot: '3deg' },
              { title: 'Industrial Plumber', loc: 'Surulere, Lagos', img: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=400&q=80', rot: '-1deg' },
            ].map((p, idx) => (
              <div 
                key={idx} 
                className="showcase-pro-card"
                style={{ 
                  transform: `rotate(${p.rot})`, 
                  background: '#ffffff', 
                  borderRadius: 14, 
                  padding: 7, 
                  boxShadow: '0 8px 24px rgba(15, 23, 42, 0.08)', 
                  border: '1px solid #e2e8f0',
                  width: 175,
                  textAlign: 'left'
                }}
              >
                <div style={{ width: '100%', height: 130, borderRadius: 10, overflow: 'hidden', background: '#f1f5f9', marginBottom: 8 }}>
                  <img 
                    src={p.img} 
                    alt={p.title} 
                    onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = SAFE_IMAGE; }}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                  />
                </div>
                <div style={{ padding: '0 4px 4px' }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{p.title}</div>
                  <div style={{ fontSize: 11, color: '#64748b' }}>{p.loc}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
                    <span style={{ fontSize: 11, fontWeight: 800, color: '#1a6dff' }}>4.9</span>
                    <span style={{ display: 'flex' }}><Icons.Star /></span>
                    <span style={{ fontSize: 10.5, color: '#94a3b8' }}>(Verified)</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Floating FieldOps 360 Stats Bar */}
          <div className="stats-container" style={{ maxWidth: 860, margin: '0 auto', background: '#0b1220', borderRadius: 20, padding: '24px 36px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#ffffff', boxShadow: '0 16px 36px -8px rgba(11, 18, 32, 0.3)' }}>
            <div className="stats-col" style={{ flex: 1, textAlign: 'center', borderRight: '1px solid rgba(255, 255, 255, 0.15)' }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#1a6dff', letterSpacing: '-0.02em' }}>1,200+</div>
              <div style={{ fontSize: 12.5, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em', marginTop: 4 }}>Vetted Specialists</div>
            </div>
            <div className="stats-col" style={{ flex: 1, textAlign: 'center', borderRight: '1px solid rgba(255, 255, 255, 0.15)' }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em' }}>35,000+</div>
              <div style={{ fontSize: 12.5, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em', marginTop: 4 }}>Work Orders Executed</div>
            </div>
            <div className="stats-col" style={{ flex: 1, textAlign: 'center' }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#10b981', letterSpacing: '-0.02em' }}>99.2%</div>
              <div style={{ fontSize: 12.5, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em', marginTop: 4 }}>Verified Satisfaction</div>
            </div>
          </div>

        </div>
      </section>

      {/* 3. How It Works (FieldOps 360 Operational Pipeline) */}
      <section style={{ padding: '80px 24px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
        <div style={{ maxWidth: 1140, margin: '0 auto', textAlign: 'center' }}>
          <span style={{ fontSize: 12, fontWeight: 800, color: '#1a6dff', textTransform: 'uppercase', letterSpacing: '0.06em' }}>How It Works</span>
          <h2 style={{ fontSize: 'clamp(26px, 3vw, 36px)', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', margin: '8px 0 40px' }}>
            Book service in three seamless steps
          </h2>

          <div className="how-it-works-box" style={{ display: 'flex', background: '#ffffff', borderRadius: 20, border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(15, 23, 42, 0.04)', overflow: 'hidden' }}>
            
            {/* Step 1 */}
            <div className="how-it-works-step" style={{ flex: 1, padding: '36px 28px', borderRight: '1px solid #f1f5f9', textAlign: 'left' }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: '#e0edff', color: '#1a6dff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 16, marginBottom: 18 }}>
                1
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', margin: '0 0 10px' }}>Choose your service</h3>
              <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.6, margin: 0 }}>
                Select your required trade, describe the fault, and set your preferred date and time.
              </p>
            </div>

            {/* Step 2 */}
            <div className="how-it-works-step" style={{ flex: 1, padding: '36px 28px', borderRight: '1px solid #f1f5f9', textAlign: 'left' }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: '#e0edff', color: '#1a6dff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 16, marginBottom: 18 }}>
                2
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', margin: '0 0 10px' }}>Compare quotes & dispatch</h3>
              <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.6, margin: 0 }}>
                Receive verified proposals from registered contracting companies and track technician arrival in real time.
              </p>
            </div>

            {/* Step 3 */}
            <div className="how-it-works-step" style={{ flex: 1, padding: '36px 28px', textAlign: 'left' }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: '#e0edff', color: '#1a6dff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 16, marginBottom: 18 }}>
                3
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', margin: '0 0 10px' }}>Inspect & sign off</h3>
              <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.6, margin: 0 }}>
                Verify work on-site, sign off digitally, and settle invoices with secure escrow wallet protection.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* 4. Popular Services Grid (Exclusively Supported Project Services) */}
      <section style={{ padding: '80px 24px', background: '#ffffff', borderBottom: '1px solid #f1f5f9' }}>
        <div style={{ maxWidth: 1140, margin: '0 auto' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 36, flexWrap: 'wrap', gap: 16 }}>
            <div>
              <span style={{ fontSize: 12, fontWeight: 800, color: '#1a6dff', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Core Trades</span>
              <h2 style={{ fontSize: 'clamp(26px, 3vw, 36px)', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', margin: '6px 0 0' }}>
                Popular services near you
              </h2>
            </div>
            <Link href="/dashboard" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 14, fontWeight: 700, color: '#1a6dff', textDecoration: 'none' }}>
              <span>View all available services</span>
              <Icons.ArrowRight />
            </Link>
          </div>

          {/* 4-Column Image Cards Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 24 }}>
            {POPULAR_SERVICES.map((srv, idx) => (
              <Link 
                key={idx} 
                href={srv.link} 
                className="popular-service-card"
                style={{ 
                  background: '#ffffff', 
                  borderRadius: 16, 
                  border: '1px solid #e2e8f0', 
                  overflow: 'hidden', 
                  textDecoration: 'none', 
                  color: 'inherit',
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                <div style={{ width: '100%', height: 160, background: '#f1f5f9', overflow: 'hidden' }}>
                  <img 
                    src={srv.image} 
                    alt={srv.title} 
                    onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = SAFE_IMAGE; }}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                  />
                </div>
                <div style={{ padding: '16px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 15, fontWeight: 700, color: '#0f172a' }}>{srv.title}</span>
                  <span style={{ color: '#1a6dff' }}><Icons.ArrowRight /></span>
                </div>
              </Link>
            ))}
          </div>

        </div>
      </section>

      {/* 5. What Our Clients Say (Verified Field Reviews) */}
      <section style={{ padding: '80px 24px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
        <div style={{ maxWidth: 1140, margin: '0 auto' }}>
          
          {/* Header with Carousel Controls */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 40, flexWrap: 'wrap', gap: 16 }}>
            <div>
              <span style={{ fontSize: 12, fontWeight: 800, color: '#1a6dff', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Client Feedback</span>
              <h2 style={{ fontSize: 'clamp(26px, 3vw, 36px)', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', margin: '6px 0 0' }}>
                What our clients say
              </h2>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <button 
                type="button" 
                style={{ width: 40, height: 40, borderRadius: '50%', border: '1px solid #cbd5e1', background: '#ffffff', color: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', margin: 0 }}
                aria-label="Previous review"
              >
                <Icons.ChevronLeft />
              </button>
              <button 
                type="button" 
                style={{ width: 40, height: 40, borderRadius: '50%', border: '1px solid #cbd5e1', background: '#ffffff', color: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', margin: 0 }}
                aria-label="Next review"
              >
                <Icons.ChevronRight />
              </button>
            </div>
          </div>

          {/* 3-Card Reviews Display */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
            {CLIENT_REVIEWS.map((rev, idx) => (
              <div 
                key={idx} 
                style={{ 
                  background: rev.featured ? '#0b1220' : '#ffffff', 
                  color: rev.featured ? '#ffffff' : '#0f172a',
                  borderRadius: 20, 
                  padding: 32, 
                  border: rev.featured ? 'none' : '1px solid #e2e8f0',
                  boxShadow: rev.featured ? '0 16px 36px -8px rgba(11, 18, 32, 0.25)' : '0 4px 18px rgba(15, 23, 42, 0.04)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <div style={{ display: 'flex', gap: 3, marginBottom: 16 }}>
                    <Icons.Star /><Icons.Star /><Icons.Star /><Icons.Star /><Icons.Star />
                  </div>
                  <p style={{ fontSize: 14.5, lineHeight: 1.6, color: rev.featured ? '#cbd5e1' : '#475569', margin: '0 0 24px' }}>
                    "{rev.text}"
                  </p>
                </div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: rev.featured ? '#ffffff' : '#0f172a' }}>{rev.name}</div>
                  <div style={{ fontSize: 12.5, color: rev.featured ? '#94a3b8' : '#64748b', marginTop: 2 }}>{rev.role}</div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 6. Transparent Cost Estimates (Real Project Jobs) */}
      <section id="estimates" style={{ padding: '80px 24px', background: '#ffffff', borderBottom: '1px solid #f1f5f9' }}>
        <div style={{ maxWidth: 1140, margin: '0 auto' }}>
          
          <div style={{ textAlign: 'center', marginBottom: 44 }}>
            <span style={{ fontSize: 12, fontWeight: 800, color: '#1a6dff', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Transparent Pricing</span>
            <h2 style={{ fontSize: 'clamp(26px, 3vw, 36px)', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', margin: '8px 0 10px' }}>
              Free cost estimate
            </h2>
            <p style={{ fontSize: 15, color: '#64748b', maxWidth: 600, margin: '0 auto' }}>
              Upfront benchmark pricing across verified Nigerian field service and maintenance categories.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24 }}>
            {COST_ESTIMATES.map((item, idx) => (
              <div 
                key={idx} 
                style={{ 
                  border: '1px solid #e2e8f0', 
                  borderRadius: 16, 
                  padding: 20, 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 16,
                  background: '#ffffff',
                  boxShadow: '0 2px 10px rgba(15, 23, 42, 0.03)'
                }}
              >
                <div style={{ width: 72, height: 72, borderRadius: 12, overflow: 'hidden', background: '#f1f5f9', flexShrink: 0 }}>
                  <img 
                    src={item.image} 
                    alt={item.title} 
                    onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = SAFE_IMAGE; }}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                  />
                </div>
                <div>
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', margin: '0 0 4px', lineHeight: 1.3 }}>{item.title}</h3>
                  <div style={{ fontSize: 15, fontWeight: 800, color: '#1a6dff', margin: '2px 0' }}>{item.range}</div>
                  <div style={{ fontSize: 11.5, color: '#64748b' }}>{item.detail}</div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 7. Browse Verified Contractors Registered on FieldOps 360 (Dynamically Updated) */}
      <section style={{ padding: '80px 24px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
        <div style={{ maxWidth: 1140, margin: '0 auto' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 36, flexWrap: 'wrap', gap: 16 }}>
            <div>
              <span style={{ fontSize: 12, fontWeight: 800, color: '#1a6dff', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Verified Contractors</span>
              <h2 style={{ fontSize: 'clamp(26px, 3vw, 36px)', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', margin: '6px 0 0' }}>
                Browse verified contracting companies
              </h2>
            </div>
            <Link href="/dashboard" style={{ fontSize: 14, fontWeight: 700, color: '#1a6dff', textDecoration: 'none' }}>
              View all licensed organizations →
            </Link>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
            {companies.map((co) => (
              <div 
                key={co.id} 
                className="company-registered-card"
                style={{ 
                  background: '#ffffff', 
                  border: '1.5px solid #e2e8f0', 
                  borderRadius: 16, 
                  padding: 22,
                  boxShadow: '0 2px 10px rgba(15, 23, 42, 0.04)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 40, height: 40, borderRadius: 10, background: '#e0edff', color: '#1a6dff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Icons.Building />
                      </div>
                      <div>
                        <div style={{ fontSize: 15, fontWeight: 800, color: '#0f172a' }}>{co.name}</div>
                        <div style={{ fontSize: 12, color: '#64748b' }}>{co.location}</div>
                      </div>
                    </div>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 8px', borderRadius: 9999, background: '#ecfdf5', color: '#059669', fontSize: 11, fontWeight: 700 }}>
                      <Icons.ShieldCheck />
                      <span>Verified</span>
                    </span>
                  </div>

                  <div style={{ fontSize: 13, color: '#475569', marginBottom: 14 }}>
                    Specialization: <b>{co.trade}</b>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 14, borderTop: '1px solid #f1f5f9' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5, fontWeight: 700, color: '#0f172a' }}>
                    <span style={{ display: 'flex' }}><Icons.Star /></span>
                    <span>{co.score}</span>
                    <span style={{ color: '#94a3b8', fontWeight: 500 }}>· {co.jobs}</span>
                  </div>

                  <Link href={`/login?mode=request&service=${encodeURIComponent(co.trade)}`} style={{ fontSize: 13, fontWeight: 700, color: '#1a6dff', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    <span>Request Job</span>
                    <Icons.ArrowRight />
                  </Link>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 8. Dual Action Call-To-Action Cards */}
      <section style={{ padding: '80px 24px', background: '#ffffff' }}>
        <div style={{ maxWidth: 1140, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 28 }}>
          
          {/* Card 1: Dark Slate Card (For Facility Managers & Clients) */}
          <div style={{ background: '#0b1220', borderRadius: 24, padding: '44px 36px', color: '#ffffff', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 16px 36px -8px rgba(11, 18, 32, 0.25)' }}>
            <div>
              <span style={{ fontSize: 11.5, fontWeight: 800, color: '#1a6dff', textTransform: 'uppercase', letterSpacing: '0.06em' }}>For Property & Business Owners</span>
              <h3 style={{ fontSize: 'clamp(24px, 2.5vw, 30px)', fontWeight: 800, margin: '10px 0 14px', lineHeight: 1.25 }}>
                Need reliable technicians for your facility or home?
              </h3>
              <p style={{ fontSize: 14.5, color: '#94a3b8', lineHeight: 1.6, margin: '0 0 28px' }}>
                Post your repair order, compare proposals from vetted technical organizations, and manage real-time dispatch with escrow security.
              </p>
            </div>
            <div>
              <Link href="/login" style={{ display: 'inline-block', padding: '14px 34px', background: '#1a6dff', color: '#ffffff', borderRadius: 8, fontWeight: 800, fontSize: 14, textTransform: 'uppercase', textDecoration: 'none', letterSpacing: '0.04em' }}>
                Post a Work Order
              </Link>
            </div>
          </div>

          {/* Card 2: Electric Blue Card (For Specialists) */}
          <div style={{ background: '#1a6dff', borderRadius: 24, padding: '44px 36px', color: '#ffffff', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 16px 36px -8px rgba(26, 109, 255, 0.35)' }}>
            <div>
              <span style={{ fontSize: 11.5, fontWeight: 800, color: '#ffffff', opacity: 0.85, textTransform: 'uppercase', letterSpacing: '0.06em' }}>For Certified Technicians & Contractors</span>
              <h3 style={{ fontSize: 'clamp(24px, 2.5vw, 30px)', fontWeight: 800, margin: '10px 0 14px', lineHeight: 1.25 }}>
                Grow your field contracting operations
              </h3>
              <p style={{ fontSize: 14.5, color: 'rgba(255, 255, 255, 0.9)', lineHeight: 1.6, margin: '0 0 28px' }}>
                Access verified corporate maintenance contracts, dispatch your technician team with live GPS tracking, and receive guaranteed digital settlement.
              </p>
            </div>
            <div>
              <Link href="/login?mode=signup" style={{ display: 'inline-block', padding: '14px 34px', background: '#ffffff', color: '#1a6dff', borderRadius: 8, fontWeight: 800, fontSize: 14, textTransform: 'uppercase', textDecoration: 'none', letterSpacing: '0.04em' }}>
                Register as Specialist
              </Link>
            </div>
          </div>

        </div>
      </section>

      {/* 9. Centralized Dark Footer (Harmonized with Dashboards) */}
      <Footer />

    </div>
  );
}
