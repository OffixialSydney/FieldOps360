'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '../lib/supabase';

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
  ChevronUp: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="18 15 12 9 6 15" />
    </svg>
  ),
  Star: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="#EAB308" stroke="#EAB308" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  ),
  Mail: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1-0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
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
  Twitter: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  ),
  Facebook: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  ),
  Instagram: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  ),
  Linkedin: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
    </svg>
  ),
};

// Reliable fallback image URL verified to render in all browsers
const SAFE_IMAGE = 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=600&q=80';

// 8 Popular Services matching FieldOps 360's supported project trades
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
  const [testimonialIdx, setTestimonialIdx] = useState(0);
  const [subscribeEmail, setSubscribeEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
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

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (subscribeEmail.trim()) {
      setSubscribed(true);
      setTimeout(() => setSubscribed(false), 4000);
      setSubscribeEmail('');
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
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

      {/* 1. Header (Exact Match to Inspirational Website with FieldOps 360 Logo & Name) */}
      <header style={{ borderBottom: '1px solid #f1f5f9', background: 'rgba(255, 255, 255, 0.98)', backdropFilter: 'blur(10px)', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', height: 74, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          
          {/* Logo & Project Name */}
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', color: '#0f172a' }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: '#1a6dff', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(26, 109, 255, 0.3)' }}>
              <Icons.Logo />
            </div>
            <span style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.03em', color: '#0f172a' }}>FieldOps 360</span>
          </Link>

          {/* Navigation Links Matching Inspiration Layout */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: 28 }} className="desktop-nav">
            
            {/* Live Operations Portal Pill (Matching Jobs Pill with Blue Dot) */}
            <Link href="/dashboard" style={{ textDecoration: 'none' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '6px 16px', borderRadius: 9999, background: '#e0edff', color: '#1a6dff', fontWeight: 600, fontSize: 14 }}>
                <span>Operations Portal</span>
                <span style={{ position: 'relative', display: 'flex', width: 7, height: 7 }}>
                  <span className="fieldops-ping" style={{ position: 'absolute', width: '100%', height: '100%', borderRadius: '50%', background: '#1a6dff' }}></span>
                  <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#1a6dff' }}></span>
                </span>
              </span>
            </Link>

            <a href="#estimates" style={{ fontSize: 14, fontWeight: 500, color: '#374151', textDecoration: 'none' }}>Cost Estimates</a>
            <Link href="/track?no=REQ-DEMO-4109" style={{ fontSize: 14, fontWeight: 500, color: '#374151', textDecoration: 'none' }}>Track Order</Link>
            <Link href="/login?mode=signup" style={{ fontSize: 14, fontWeight: 500, color: '#374151', textDecoration: 'none' }}>Offer Your Service</Link>
          </nav>

          {/* Right Action: Clean Outline Pill Login Button */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Link
              href="/login"
              className="desktop-actions"
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: '#1a6dff',
                textDecoration: 'none',
                padding: '7px 24px',
                borderRadius: 9999,
                border: '1.5px solid #1a6dff',
                background: 'transparent',
                transition: 'all 0.15s ease',
              }}
            >
              Login
            </Link>

            {/* Mobile Hamburger Toggle */}
            <button
              type="button"
              className="mobile-menu-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              style={{
                display: 'none',
                background: 'transparent',
                border: 'none',
                padding: 6,
                cursor: 'pointer',
                color: '#0f172a',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <Icons.Close /> : <Icons.Menu />}
            </button>
          </div>

        </div>

        {/* Responsive Mobile Drawer */}
        {mobileMenuOpen && (
          <div style={{ borderTop: '1px solid #f1f5f9', background: '#ffffff', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)} style={{ fontSize: 16, fontWeight: 600, color: '#1a6dff', textDecoration: 'none' }}>Operations Portal</Link>
            <a href="#estimates" onClick={() => setMobileMenuOpen(false)} style={{ fontSize: 16, fontWeight: 500, color: '#374151', textDecoration: 'none' }}>Cost Estimates</a>
            <Link href="/track?no=REQ-DEMO-4109" onClick={() => setMobileMenuOpen(false)} style={{ fontSize: 16, fontWeight: 500, color: '#374151', textDecoration: 'none' }}>Track Order</Link>
            <Link href="/login?mode=signup" onClick={() => setMobileMenuOpen(false)} style={{ fontSize: 16, fontWeight: 500, color: '#374151', textDecoration: 'none' }}>Offer Your Service</Link>
            <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 14 }}>
              <Link href="/login" onClick={() => setMobileMenuOpen(false)} style={{ display: 'block', textAlign: 'center', padding: '10px', borderRadius: 9999, border: '1.5px solid #1a6dff', color: '#1a6dff', textDecoration: 'none', fontWeight: 600, fontSize: 15 }}>
                Login
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* 2. Hero Section */}
      <section className="hero-pattern-bg" style={{ padding: '72px 24px 44px', position: 'relative', textAlign: 'center' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', position: 'relative', zIndex: 2 }}>
          
          {/* Tilted FieldOps Badge */}
          <div style={{ display: 'inline-block', position: 'relative' }}>
            <div
              style={{
                position: 'absolute',
                top: -16,
                left: -24,
                transform: 'rotate(-14deg)',
                background: '#1a6dff',
                color: '#ffffff',
                fontSize: 12,
                fontWeight: 700,
                padding: '6px 14px',
                borderRadius: 12,
                boxShadow: '0 4px 14px rgba(26, 109, 255, 0.35)',
                whiteSpace: 'nowrap',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <Icons.ShieldCheck />
              <span>Verified Field Specialists</span>
            </div>
          </div>

          <h1 style={{ fontSize: 'clamp(32px, 5vw, 60px)', fontWeight: 800, letterSpacing: '-0.035em', lineHeight: 1.18, color: '#0f172a', margin: '20px 0 16px' }}>
            Hire verified local professionals for every service job
          </h1>

          <p style={{ fontSize: 'clamp(15px, 1.9vw, 19px)', color: '#475569', lineHeight: 1.55, maxWidth: 680, margin: '0 auto 36px' }}>
            From solar installations and generator repairs to AC servicing and electrical contracting: FieldOps 360 delivers vetted, high-performing service technicians directly to your site.
          </p>

          {/* Pill Search Box */}
          <div style={{ maxWidth: 760, margin: '0 auto 52px', background: '#ffffff', borderRadius: 9999, padding: '8px 10px', boxShadow: '0 10px 36px rgba(15, 23, 42, 0.08), 0 1px 3px rgba(15, 23, 42, 0.05)', border: '1px solid #cbd5e1' }}>
            <form onSubmit={handleSearchSubmit} className="search-pill-form" style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 6 }}>
              
              {/* Input 1: Service */}
              <div className="search-pill-input" style={{ flex: '1 1 240px', display: 'flex', alignItems: 'center', gap: 10, padding: '6px 14px' }}>
                <span style={{ color: '#64748b' }}><Icons.Search /></span>
                <input
                  type="text"
                  placeholder="What service do you need? (e.g. Solar, Generator, AC)"
                  value={serviceQuery}
                  onChange={(e) => setServiceQuery(e.target.value)}
                  style={{ width: '100%', border: 'none', outline: 'none', fontSize: 15, color: '#0f172a', background: 'transparent' }}
                />
              </div>

              {/* Vertical divider */}
              <span className="search-divider" style={{ width: 1, height: 32, background: '#cbd5e1' }}></span>

              {/* Input 2: Location */}
              <div className="search-pill-input" style={{ flex: '1 1 180px', display: 'flex', alignItems: 'center', gap: 10, padding: '6px 14px' }}>
                <span style={{ color: '#64748b' }}><Icons.MapPin /></span>
                <input
                  type="text"
                  placeholder="Location (e.g. Lagos, Abuja)"
                  value={locationQuery}
                  onChange={(e) => setLocationQuery(e.target.value)}
                  style={{ width: '100%', border: 'none', outline: 'none', fontSize: 15, color: '#0f172a', background: 'transparent' }}
                />
                <span style={{ color: '#64748b', cursor: 'pointer' }} title="Current Location"><Icons.Crosshair /></span>
              </div>

              {/* Action Button: Find Specialists */}
              <button
                type="submit"
                className="search-pill-btn"
                style={{
                  padding: '13px 30px',
                  borderRadius: 9999,
                  background: '#1a6dff',
                  color: '#ffffff',
                  fontSize: 15,
                  fontWeight: 700,
                  border: 'none',
                  cursor: 'pointer',
                  margin: 0,
                  boxShadow: '0 2px 10px rgba(26, 109, 255, 0.35)',
                  whiteSpace: 'nowrap',
                }}
              >
                Find Specialists
              </button>

            </form>
          </div>

        </div>

        {/* Tilted Photo Showcase (Field Specialists for Real Project Trades) */}
        <div style={{ maxWidth: 1200, margin: '0 auto', overflow: 'hidden', padding: '10px 0 30px' }}>
          <div className="tilted-strip-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
            
            <div className="showcase-pro-card" style={{ transform: 'rotate(-8deg)', width: 175, height: 180, borderRadius: 18, overflow: 'hidden', boxShadow: '0 8px 24px rgba(15, 23, 42, 0.12)', flexShrink: 0 }}>
              <img
                src="https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?auto=format&fit=crop&w=400&q=80"
                alt="Solar Installation Specialist"
                onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = SAFE_IMAGE; }}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>

            <div className="showcase-pro-card" style={{ transform: 'rotate(8deg)', width: 175, height: 180, borderRadius: 18, overflow: 'hidden', boxShadow: '0 8px 24px rgba(15, 23, 42, 0.12)', flexShrink: 0 }}>
              <img
                src="https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=400&q=80"
                alt="Generator Repair Engineer"
                onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = SAFE_IMAGE; }}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>

            <div className="showcase-pro-card" style={{ transform: 'rotate(-8deg)', width: 175, height: 180, borderRadius: 18, overflow: 'hidden', boxShadow: '0 8px 24px rgba(15, 23, 42, 0.12)', flexShrink: 0 }}>
              <img
                src="https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=400&q=80"
                alt="Air-Conditioner Technician"
                onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = SAFE_IMAGE; }}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>

            <div className="showcase-pro-card" style={{ transform: 'rotate(8deg)', width: 175, height: 180, borderRadius: 18, overflow: 'hidden', boxShadow: '0 8px 24px rgba(15, 23, 42, 0.12)', flexShrink: 0 }}>
              <img
                src="https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=400&q=80"
                alt="Certified Electrician"
                onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = SAFE_IMAGE; }}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>

            <div className="showcase-pro-card" style={{ transform: 'rotate(-8deg)', width: 175, height: 180, borderRadius: 18, overflow: 'hidden', boxShadow: '0 8px 24px rgba(15, 23, 42, 0.12)', flexShrink: 0 }}>
              <img
                src="https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=400&q=80"
                alt="Master Plumber"
                onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = SAFE_IMAGE; }}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>

            <div className="showcase-pro-card" style={{ transform: 'rotate(8deg)', width: 175, height: 180, borderRadius: 18, overflow: 'hidden', boxShadow: '0 8px 24px rgba(15, 23, 42, 0.12)', flexShrink: 0 }}>
              <img
                src="https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&w=400&q=80"
                alt="CCTV & Security Technician"
                onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = SAFE_IMAGE; }}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>

          </div>
        </div>

        {/* Floating FieldOps 360 Stats Bar */}
        <div style={{ maxWidth: 860, margin: '-24px auto 0', position: 'relative', zIndex: 5 }}>
          <div className="stats-container" style={{ background: '#1a6dff', borderRadius: 24, padding: '26px 20px', color: '#ffffff', display: 'flex', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-around', alignItems: 'center', boxShadow: '0 18px 42px -10px rgba(26, 109, 255, 0.45)' }}>
            
            <div className="stats-col" style={{ flex: '1 1 200px', padding: '12px', borderRight: '1px solid rgba(255, 255, 255, 0.25)', textAlign: 'center' }}>
              <div style={{ fontSize: 'clamp(28px, 3.5vw, 36px)', fontWeight: 800, lineHeight: 1.1 }}>₦250M+</div>
              <div style={{ fontSize: 13, color: 'rgba(255, 255, 255, 0.88)', marginTop: 6 }}>Value of Field Jobs Completed Nationwide</div>
            </div>

            <div className="stats-col" style={{ flex: '1 1 200px', padding: '12px', borderRight: '1px solid rgba(255, 255, 255, 0.25)', textAlign: 'center' }}>
              <div style={{ fontSize: 'clamp(28px, 3.5vw, 36px)', fontWeight: 800, lineHeight: 1.1 }}>4,800+</div>
              <div style={{ fontSize: 13, color: 'rgba(255, 255, 255, 0.88)', marginTop: 6 }}>Active Service Requests Resolved</div>
            </div>

            <div className="stats-col" style={{ flex: '1 1 200px', padding: '12px', textAlign: 'center' }}>
              <div style={{ fontSize: 'clamp(28px, 3.5vw, 36px)', fontWeight: 800, lineHeight: 1.1 }}>12,500+</div>
              <div style={{ fontSize: 13, color: 'rgba(255, 255, 255, 0.88)', marginTop: 6 }}>Certified Technicians &amp; Registered Contractors</div>
            </div>

          </div>
        </div>

      </section>

      {/* 3. How It Works (FieldOps 360 Operational Pipeline) */}
      <section id="how-it-works" style={{ padding: '96px 24px 72px', maxWidth: 1040, margin: '0 auto' }}>
        <h2 style={{ fontSize: 'clamp(32px, 4.4vw, 48px)', fontWeight: 800, textAlign: 'center', color: '#0f172a', margin: '0 0 36px', letterSpacing: '-0.025em' }}>
          How it works?
        </h2>

        {/* 3-Step Connected Container */}
        <div className="how-it-works-box" style={{ background: '#1a6dff', borderRadius: 28, padding: '36px 28px', color: '#ffffff', display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: 0, boxShadow: '0 16px 40px -10px rgba(26, 109, 255, 0.35)' }}>
          
          {/* Step 1 */}
          <div className="how-it-works-step" style={{ flex: '1 1 260px', padding: '16px 24px', borderRight: '1px solid rgba(255, 255, 255, 0.2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <div style={{ width: 34, height: 34, borderRadius: '50%', background: '#f1f5f9', color: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 15 }}>
                1
              </div>
              <h3 style={{ fontSize: 22, fontWeight: 700, margin: 0, color: '#ffffff' }}>Submit Request</h3>
            </div>
            <p style={{ fontSize: 14, color: 'rgba(255, 255, 255, 0.92)', lineHeight: 1.5, margin: 0 }}>
              Specify your service requirements, equipment tags, site address, and urgency level.
            </p>
          </div>

          {/* Step 2 */}
          <div className="how-it-works-step" style={{ flex: '1 1 260px', padding: '16px 24px', borderRight: '1px solid rgba(255, 255, 255, 0.2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <div style={{ width: 34, height: 34, borderRadius: '50%', background: '#f1f5f9', color: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 15 }}>
                2
              </div>
              <h3 style={{ fontSize: 22, fontWeight: 700, margin: 0, color: '#ffffff' }}>Technician Dispatched</h3>
            </div>
            <p style={{ fontSize: 14, color: 'rgba(255, 255, 255, 0.92)', lineHeight: 1.5, margin: 0 }}>
              Get matched with a verified trade specialist certified in your required service vertical.
            </p>
          </div>

          {/* Step 3 */}
          <div className="how-it-works-step" style={{ flex: '1 1 260px', padding: '16px 24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <div style={{ width: 34, height: 34, borderRadius: '50%', background: '#f1f5f9', color: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 15 }}>
                3
              </div>
              <h3 style={{ fontSize: 22, fontWeight: 700, margin: 0, color: '#ffffff' }}>Track &amp; Approve</h3>
            </div>
            <p style={{ fontSize: 14, color: 'rgba(255, 255, 255, 0.92)', lineHeight: 1.5, margin: 0 }}>
              Track live technician transit, approve diagnostics on glass, and settle payments transparently.
            </p>
          </div>

        </div>
      </section>

      {/* 4. Popular Services Grid (Exclusively Supported Project Services) */}
      <section id="services" style={{ padding: '84px 24px', background: '#f8fafc', borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          
          <div style={{ textAlign: 'center', marginBottom: 44 }}>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 800, color: '#0f172a', margin: '0 0 12px', letterSpacing: '-0.025em' }}>
              Popular services
            </h2>
            <p style={{ fontSize: 17, color: '#475569', maxWidth: 640, margin: '0 auto' }}>
              Specialized field service trades managed across commercial and residential sites in Nigeria.
            </p>
          </div>

          {/* 4-Column Image Cards Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20 }}>
            {POPULAR_SERVICES.map((s, idx) => (
              <Link key={idx} href={s.link} style={{ textDecoration: 'none' }}>
                <div className="popular-service-card" style={{ position: 'relative', height: 260, borderRadius: 14, overflow: 'hidden', background: '#0f172a' }}>
                  <img
                    src={s.image}
                    alt={s.title}
                    onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = SAFE_IMAGE; }}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0, 0, 0, 0.85) 0%, rgba(0, 0, 0, 0.3) 50%, transparent 100%)' }}></div>
                  <div style={{ position: 'absolute', bottom: 16, left: 18, right: 18, color: '#ffffff' }}>
                    <span style={{ fontSize: 18, fontWeight: 700, display: 'block', textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}>{s.title}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

        </div>
      </section>

      {/* 5. What Our Clients Say (Verified Field Reviews) */}
      <section style={{ padding: '88px 24px', maxWidth: 1200, margin: '0 auto' }}>
        
        {/* Header with Carousel Controls */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 36, flexWrap: 'wrap', gap: 14 }}>
          <div>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.025em' }}>
              What our clients say
            </h2>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              type="button"
              onClick={() => setTestimonialIdx((prev) => (prev > 0 ? prev-1 : CLIENT_REVIEWS.length-1))}
              style={{ width: 42, height: 42, borderRadius: '50%', border: '1px solid #cbd5e1', background: '#ffffff', color: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', margin: 0 }}
              aria-label="Previous Review"
            >
              <Icons.ChevronLeft />
            </button>
            <button
              type="button"
              onClick={() => setTestimonialIdx((prev) => (prev < CLIENT_REVIEWS.length-1 ? prev + 1 : 0))}
              style={{ width: 42, height: 42, borderRadius: '50%', border: '1px solid #cbd5e1', background: '#ffffff', color: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', margin: 0 }}
              aria-label="Next Review"
            >
              <Icons.ChevronRight />
            </button>
          </div>
        </div>

        {/* 3-Card Reviews Display */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24, alignItems: 'stretch' }}>
          {CLIENT_REVIEWS.map((r, idx) => {
            const isFeatured = r.featured;
            return (
              <div
                key={idx}
                style={{
                  background: isFeatured ? '#1a6dff' : '#ffffff',
                  color: isFeatured ? '#ffffff' : '#0f172a',
                  border: isFeatured ? 'none' : '1px solid #e2e8f0',
                  borderRadius: 22,
                  padding: '36px 30px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: isFeatured ? '0 16px 36px -8px rgba(26, 109, 255, 0.4)' : '0 4px 12px rgba(15, 23, 42, 0.04)',
                }}
              >
                <div>
                  <div style={{ display: 'flex', gap: 4, marginBottom: 18 }}>
                    <Icons.Star /><Icons.Star /><Icons.Star /><Icons.Star /><Icons.Star />
                  </div>
                  <p style={{ fontSize: 15, lineHeight: 1.6, color: isFeatured ? '#ffffff' : '#334155', margin: '0 0 28px' }}>
                    {r.text}
                  </p>
                </div>
                <div>
                  <div style={{ fontSize: 17, fontWeight: 700, color: isFeatured ? '#ffffff' : '#0f172a' }}>{r.name}</div>
                  <div style={{ fontSize: 13, color: isFeatured ? 'rgba(255, 255, 255, 0.88)' : '#64748b', marginTop: 2 }}>{r.role}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Carousel Pagination Dots */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 28 }}>
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#1a6dff', display: 'inline-block' }}></span>
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#cbd5e1', display: 'inline-block' }}></span>
        </div>

      </section>

      {/* 6. Transparent Cost Estimates (Real Project Jobs) */}
      <section id="estimates" style={{ padding: '84px 24px', background: '#f8fafc', borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          
          <div style={{ textAlign: 'center', marginBottom: 44 }}>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 800, color: '#0f172a', margin: '0 0 12px', letterSpacing: '-0.025em' }}>
              Transparent cost estimates
            </h2>
            <p style={{ fontSize: 17, color: '#475569', maxWidth: 640, margin: '0 auto' }}>
              Compare benchmark pricing across top-rated Nigerian contractors before dispatching.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
            {COST_ESTIMATES.map((item, idx) => (
              <div key={idx} style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 14, overflow: 'hidden', boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ height: 190, overflow: 'hidden' }}>
                    <img
                      src={item.image}
                      alt={item.title}
                      onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = SAFE_IMAGE; }}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>
                  <div style={{ padding: '20px 22px 14px' }}>
                    <h3 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', margin: '0 0 8px' }}>{item.title}</h3>
                    <div style={{ fontSize: 16, fontWeight: 700, color: '#1a6dff' }}>{item.range}</div>
                    <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>{item.detail}</div>
                  </div>
                </div>
                <div style={{ padding: '0 22px 20px' }}>
                  <Link href="/dashboard" style={{ fontSize: 14, fontWeight: 600, color: '#1a6dff', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    <span>Request Quotation</span>
                    <span>&gt;&gt;</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 7. Browse Verified Contractors Registered on FieldOps 360 (Dynamically Updated) */}
      <section id="contractors" style={{ padding: '88px 24px', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <h2 style={{ fontSize: 'clamp(28px, 3.8vw, 40px)', fontWeight: 800, color: '#0f172a', margin: '0 0 12px', letterSpacing: '-0.025em' }}>
            Featured Contractors on FieldOps 360
          </h2>
          <p style={{ fontSize: 17, color: '#475569', maxWidth: 640, margin: '0 auto' }}>
            Explore verified engineering companies and trade contractors registered on the platform. Newly registered companies appear automatically.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
          {companies.map((co, idx) => (
            <div key={co.id || idx} className="company-registered-card" style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 16, padding: '22px 24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 42, height: 42, borderRadius: 10, background: 'rgba(26, 109, 255, 0.1)', color: '#1a6dff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Icons.Building />
                    </div>
                    <div>
                      <h3 style={{ fontSize: 17, fontWeight: 700, color: '#0f172a', margin: 0 }}>{co.name}</h3>
                      <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{co.location}</div>
                    </div>
                  </div>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: '#f0fdf4', color: '#16a34a', fontSize: 11, fontWeight: 700, padding: '4px 8px', borderRadius: 6 }}>
                    <Icons.ShieldCheck />
                    <span>Verified</span>
                  </span>
                </div>
                
                <div style={{ fontSize: 14, fontWeight: 600, color: '#1a6dff', margin: '10px 0 14px' }}>
                  {co.trade}
                </div>
              </div>

              <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ display: 'flex' }}><Icons.Star /></span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{co.score || '4.9'}</span>
                  <span style={{ fontSize: 12, color: '#64748b' }}>· {co.jobs}</span>
                </div>
                <Link href="/dashboard" style={{ fontSize: 13, fontWeight: 700, color: '#1a6dff', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  <span>Book Now</span>
                  <Icons.ArrowRight />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 8. Dual Action Call-To-Action Cards */}
      <section style={{ padding: '40px 24px 88px', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24 }}>
          
          {/* Card 1: Dark Slate Card (For Facility Managers & Clients) */}
          <div style={{ background: '#0f172a', color: '#ffffff', borderRadius: 28, padding: '48px 36px', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: 360, boxShadow: '0 20px 40px rgba(15, 23, 42, 0.25)' }}>
            <div style={{ position: 'relative', zIndex: 2 }}>
              <h3 style={{ fontSize: 'clamp(24px, 3.2vw, 34px)', fontWeight: 800, margin: '0 0 14px', lineHeight: 1.2, letterSpacing: '-0.02em' }}>
                Connect with Verified Field Pros You Can Trust!
              </h3>
              <p style={{ fontSize: 15, color: '#94a3b8', lineHeight: 1.6, margin: '0 0 32px', maxWidth: 440 }}>
                Find qualified technicians and licensed contractors for any residential or commercial project.
              </p>
              
              <div style={{ display: 'flex', gap: 32, marginBottom: 36, flexWrap: 'wrap' }}>
                <div>
                  <div style={{ fontSize: 26, fontWeight: 800 }}>₦250M+</div>
                  <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>Completed Projects</div>
                </div>
                <div>
                  <div style={{ fontSize: 26, fontWeight: 800 }}>12,500+</div>
                  <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>Registered Specialists</div>
                </div>
              </div>
            </div>

            <div style={{ position: 'relative', zIndex: 2 }}>
              <Link href="/dashboard" style={{ display: 'inline-block', padding: '14px 34px', background: '#ffffff', color: '#0f172a', borderRadius: 8, fontWeight: 800, fontSize: 14, textTransform: 'uppercase', textDecoration: 'none', letterSpacing: '0.04em' }}>
                Get Started
              </Link>
            </div>
          </div>

          {/* Card 2: Electric Blue Card (For Specialists) */}
          <div style={{ background: '#1a6dff', color: '#ffffff', borderRadius: 28, padding: '48px 36px', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: 360, boxShadow: '0 20px 40px rgba(26, 109, 255, 0.35)' }}>
            <div style={{ position: 'relative', zIndex: 2 }}>
              <h3 style={{ fontSize: 'clamp(24px, 3.2vw, 34px)', fontWeight: 800, margin: '0 0 14px', lineHeight: 1.2, letterSpacing: '-0.02em' }}>
                Join Nigeria’s Leading Contractor Network!
              </h3>
              <p style={{ fontSize: 15, color: 'rgba(255, 255, 255, 0.9)', lineHeight: 1.6, margin: '0 0 32px', maxWidth: 440 }}>
                Create your verified contractor profile and receive steady service jobs from corporate and private clients.
              </p>
              
              <div style={{ display: 'flex', gap: 32, marginBottom: 36, flexWrap: 'wrap' }}>
                <div>
                  <div style={{ fontSize: 26, fontWeight: 800 }}>₦140M+</div>
                  <div style={{ fontSize: 12, color: 'rgba(255, 255, 255, 0.85)', marginTop: 4 }}>Earned by Specialists</div>
                </div>
                <div>
                  <div style={{ fontSize: 26, fontWeight: 800 }}>4,800+</div>
                  <div style={{ fontSize: 12, color: 'rgba(255, 255, 255, 0.85)', marginTop: 4 }}>Dispatched Jobs</div>
                </div>
              </div>
            </div>

            <div style={{ position: 'relative', zIndex: 2 }}>
              <Link href="/login?mode=signup" style={{ display: 'inline-block', padding: '14px 34px', background: '#ffffff', color: '#1a6dff', borderRadius: 8, fontWeight: 800, fontSize: 14, textTransform: 'uppercase', textDecoration: 'none', letterSpacing: '0.04em' }}>
                Register as Specialist
              </Link>
            </div>
          </div>

        </div>
      </section>

      {/* 9. Centralized Footer (Exact Match to Inspirational Screenshot) */}
      <footer style={{ borderTop: '1px solid #f1f5f9', padding: '64px 24px 36px', background: '#ffffff' }}>
        <div style={{ maxWidth: 1140, margin: '0 auto' }}>
          
          {/* 4 Columns (Company, Customers, Professionals, Subscribe) */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 36, marginBottom: 54 }}>
            
            {/* Column 1: Company */}
            <div>
              <h4 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', margin: '0 0 20px', letterSpacing: '-0.01em' }}>Company</h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 14 }}>
                <li>
                  <Link href="/dashboard" style={{ color: '#4b5563', textDecoration: 'none', fontSize: 15, display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ color: '#9ca3af', fontSize: 16 }}>•</span>
                    <span>Help Center</span>
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard" style={{ color: '#4b5563', textDecoration: 'none', fontSize: 15, display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ color: '#9ca3af', fontSize: 16 }}>•</span>
                    <span>Contact</span>
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard" style={{ color: '#4b5563', textDecoration: 'none', fontSize: 15, display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ color: '#9ca3af', fontSize: 16 }}>•</span>
                    <span>About Us</span>
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 2: Customers */}
            <div>
              <h4 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', margin: '0 0 20px', letterSpacing: '-0.01em' }}>Customers</h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 14 }}>
                <li>
                  <a href="#estimates" style={{ color: '#4b5563', textDecoration: 'none', fontSize: 15, display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ color: '#9ca3af', fontSize: 16 }}>•</span>
                    <span>Cost Estimates</span>
                  </a>
                </li>
                <li>
                  <Link href="/dashboard" style={{ color: '#4b5563', textDecoration: 'none', fontSize: 15, display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ color: '#9ca3af', fontSize: 16 }}>•</span>
                    <span>Customer Safety Tips</span>
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 3: Professionals */}
            <div>
              <h4 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', margin: '0 0 20px', letterSpacing: '-0.01em' }}>Professionals</h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 14 }}>
                <li>
                  <Link href="/dashboard" style={{ color: '#4b5563', textDecoration: 'none', fontSize: 15, display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ color: '#9ca3af', fontSize: 16 }}>•</span>
                    <span>Help Center</span>
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 4: Subscribe */}
            <div>
              <h4 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', margin: '0 0 14px', letterSpacing: '-0.01em' }}>Subscribe</h4>
              <p style={{ fontSize: 14, color: '#4b5563', lineHeight: 1.5, margin: '0 0 16px' }}>
                Stay updated with the latest news and offers!
              </p>
              <form onSubmit={handleSubscribe} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <input
                  type="email"
                  required
                  placeholder="Enter your email address"
                  value={subscribeEmail}
                  onChange={(e) => setSubscribeEmail(e.target.value)}
                  style={{ width: '100%', padding: '13px 20px', borderRadius: 9999, border: '1px solid #cbd5e1', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
                />
                <div>
                  <button
                    type="submit"
                    style={{
                      padding: '11px 26px',
                      borderRadius: 9999,
                      background: '#1a6dff',
                      color: '#ffffff',
                      fontWeight: 600,
                      fontSize: 14,
                      border: 'none',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 8,
                      margin: 0,
                      boxShadow: '0 2px 8px rgba(26, 109, 255, 0.25)',
                    }}
                  >
                    <Icons.Mail />
                    <span>{subscribed ? 'Subscribed!' : 'Subscribe'}</span>
                  </button>
                </div>
              </form>
            </div>

          </div>

          {/* Bottom Row: Logo, Copyright & Social Circles (Matching Inspiration Exactly) */}
          <div style={{ marginTop: 44, paddingTop: 24, borderTop: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 20 }}>
            
            {/* Left: Logo & Legal Links */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: 9, background: '#1a6dff', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icons.Logo />
                </div>
                <span style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.03em' }}>FieldOps 360</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 13, color: '#6b7280', flexWrap: 'wrap' }}>
                <span>© 2026 FieldOps 360</span>
                <span>|</span>
                <Link href="/dashboard" style={{ color: '#6b7280', textDecoration: 'none' }}>Terms of Service</Link>
                <span>|</span>
                <Link href="/dashboard" style={{ color: '#6b7280', textDecoration: 'none' }}>Privacy Policy</Link>
              </div>
            </div>

            {/* Right: Circular Social Media Icons + Blue Scroll Button */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ display: 'flex', gap: 10 }}>
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" style={{ width: 38, height: 38, borderRadius: '50%', border: '1px solid #e5e7eb', background: '#ffffff', color: '#4b5563', display: 'flex', alignItems: 'center', justifyContent: 'center' }} aria-label="Twitter">
                  <Icons.Twitter />
                </a>
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" style={{ width: 38, height: 38, borderRadius: '50%', border: '1px solid #e5e7eb', background: '#ffffff', color: '#4b5563', display: 'flex', alignItems: 'center', justifyContent: 'center' }} aria-label="Facebook">
                  <Icons.Facebook />
                </a>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" style={{ width: 38, height: 38, borderRadius: '50%', border: '1px solid #e5e7eb', background: '#ffffff', color: '#4b5563', display: 'flex', alignItems: 'center', justifyContent: 'center' }} aria-label="Instagram">
                  <Icons.Instagram />
                </a>
                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" style={{ width: 38, height: 38, borderRadius: '50%', border: '1px solid #e5e7eb', background: '#ffffff', color: '#4b5563', display: 'flex', alignItems: 'center', justifyContent: 'center' }} aria-label="LinkedIn">
                  <Icons.Linkedin />
                </a>
              </div>

              {/* Circular Scroll-to-top Button */}
              <button
                type="button"
                onClick={scrollToTop}
                style={{ width: 40, height: 40, borderRadius: '50%', background: '#1a6dff', color: '#ffffff', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', margin: 0, boxShadow: '0 4px 12px rgba(26, 109, 255, 0.35)' }}
                aria-label="Scroll to top"
              >
                <Icons.ChevronUp />
              </button>
            </div>

          </div>

        </div>
      </footer>

    </div>
  );
}
