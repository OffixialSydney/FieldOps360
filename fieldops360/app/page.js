'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

// Purposeful SVG icons matching VisCorner design system (Zero emojis, zero decorative AI glyphs)
const Icons = {
  Logo: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 4l7 16L20 4" />
      <path d="M8 4l3 7 3-7" />
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
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="18 15 12 9 6 15" />
    </svg>
  ),
  Star: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="#EAB308" stroke="#EAB308" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  ),
  Mail: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
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
  Twitter: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  ),
  Facebook: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  ),
  Instagram: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  ),
  Linkedin: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
    </svg>
  ),
};

// 8 Popular Services (Matching VisCorner Section 5)
const POPULAR_SERVICES = [
  {
    title: 'Borehole Drilling',
    image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=600&q=80',
    link: '/dashboard',
  },
  {
    title: 'AC Installation',
    image: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=600&q=80',
    link: '/dashboard',
  },
  {
    title: 'Truck Hire and Rental',
    image: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=600&q=80',
    link: '/dashboard',
  },
  {
    title: 'Event Planning',
    image: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=600&q=80',
    link: '/dashboard',
  },
  {
    title: 'Makeup & Beauty',
    image: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=600&q=80',
    link: '/dashboard',
  },
  {
    title: 'Dispatch Rider & Delivery',
    image: 'https://images.unsplash.com/photo-1617347454431-f49d7ff5c3b1?auto=format&fit=crop&w=600&q=80',
    link: '/dashboard',
  },
  {
    title: 'Solar & Inverter Service',
    image: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=600&q=80',
    link: '/dashboard',
  },
  {
    title: 'Generator Maintenance',
    image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=600&q=80',
    link: '/dashboard',
  },
];

// Client Testimonials (Matching VisCorner Section 6)
const CLIENT_REVIEWS = [
  {
    name: 'Oluchi',
    role: 'Hired House Cleaner',
    featured: false,
    text: 'I was honestly surprised by how easy the whole process was. Within a day, I had multiple quotes and found someone who nailed exactly what I needed. I will definitely be using this platform again!',
  },
  {
    name: 'Obi C.',
    role: 'Photographer',
    featured: true,
    text: 'From start to finish, everything was smooth and super organized. I loved being able to compare different service providers without any pressure. It saved me so much time and stress!',
  },
  {
    name: 'Jonathan',
    role: 'Hired Web Developer',
    featured: false,
    text: 'I was worried about finding someone reliable, but this made it so simple. The provider I chose was professional, communicative, and delivered top-notch work ahead of schedule. Highly recommend!',
  },
];

// Free Cost Estimates (Matching VisCorner Section 10)
const COST_ESTIMATES = [
  {
    title: 'House Cleaning',
    range: '₦27,000 to ₦37,000',
    detail: '(for a 2 bedroom flat)',
    image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=600&q=80',
  },
  {
    title: 'Truck Hire and Rental',
    range: '₦100,000 to ₦150,000',
    detail: '(for medium trucks moving interstate)',
    image: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=600&q=80',
  },
  {
    title: 'Website Development',
    range: '₦100,000 to ₦200,000',
    detail: '(for basic commercial websites)',
    image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=600&q=80',
  },
  {
    title: 'Swimming Pool Maintenance',
    range: '₦45,000 to ₦85,000',
    detail: '(monthly chemical treatment & pump care)',
    image: 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&w=600&q=80',
  },
  {
    title: 'Generator Servicing',
    range: '₦35,000 to ₦70,000',
    detail: '(oil, fuel filters & ATS calibration)',
    image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=600&q=80',
  },
  {
    title: 'AC Installation & Repair',
    range: '₦18,000 to ₦35,000',
    detail: '(indoor unit mounting & gas refill)',
    image: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=600&q=80',
  },
];

// Full Directory Categories (Matching VisCorner Section 8)
const ALL_CATEGORIES = [
  'AC and Fridge (Cooling Appliances)',
  'Accounting Auditing and Tax Support',
  'Air Quality Check',
  'Aluminum Works',
  'Aquarium Installation',
  'Architectural Works',
  'Beauty Services',
  'Borehole and Water Solutions',
  'Bridal Accessories',
  'Building and Construction',
  'Business Services',
  'Cable TV Installation',
  'Cakes and Pastries',
  'Camera Rental',
  'Camera Repairs',
  'Career Coaching',
  'Car Hire and Rental',
  'Car Repair and Maintenance',
  'Catering Services',
  'Cleaning Services',
  'Clothing Rentals',
];

// All 36 Nigerian States + FCT (Matching VisCorner Section 9)
const NIGERIA_STATES = [
  'Abia', 'Abuja', 'Adamawa', 'Akwa Ibom', 'Anambra',
  'Bauchi', 'Bayelsa', 'Benue', 'Borno', 'Cross River',
  'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu',
  'Gombe', 'Imo', 'Jigawa', 'Kaduna', 'Kano',
  'Katsina', 'Kebbi', 'Kogi', 'Kwara', 'Lagos',
  'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun',
  'Oyo', 'Plateau', 'Rivers', 'Sokoto', 'Taraba',
  'Yobe', 'Zamfara'
];

export default function VisCornerLandingPage() {
  const [serviceQuery, setServiceQuery] = useState('');
  const [locationQuery, setLocationQuery] = useState('Lagos');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [testimonialIdx, setTestimonialIdx] = useState(0);
  const [subscribeEmail, setSubscribeEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

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
    <div style={{ background: '#ffffff', color: '#111319', minHeight: '100vh', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Inter", "Helvetica Neue", Arial, sans-serif' }}>
      
      {/* VisCorner Global Scoped Styles */}
      <style>{`
        :root {
          --viscorner-primary: #1a6dff;
          --viscorner-primary-hover: #1058d9;
          --viscorner-light: #f8fafc;
        }
        .hero-grid-bg {
          background-image: 
            linear-gradient(to right, rgba(226, 232, 240, 0.6) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(226, 232, 240, 0.6) 1px, transparent 1px);
          background-size: 40px 40px;
        }
        .category-row {
          transition: background-color 0.15s ease, border-color 0.15s ease;
        }
        .category-row:hover {
          background-color: #f8fafc;
          border-color: #cbd5e1;
        }
        .popular-card {
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .popular-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 24px -4px rgba(15, 23, 42, 0.12);
        }
        .tilted-hero-img {
          transition: transform 0.25s ease;
        }
        .tilted-hero-img:hover {
          transform: scale(1.04) rotate(0deg) !important;
          z-index: 10;
        }
        @keyframes pulse-ring {
          0% { transform: scale(0.95); opacity: 0.8; }
          50% { transform: scale(1.3); opacity: 0; }
          100% { transform: scale(0.95); opacity: 0; }
        }
        .pulse-ping {
          animation: pulse-ring 2s cubic-bezier(0.24, 0, 0.38, 1) infinite;
        }
      `}</style>

      {/* 1. Header & Navigation (Matching VisCorner Screenshot 3) */}
      <header style={{ borderBottom: '1px solid #f1f5f9', background: '#ffffff', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: 1240, margin: '0 auto', padding: '0 24px', height: 72, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          
          {/* Logo */}
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', color: '#111319' }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: '#1a6dff', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 6px rgba(26, 109, 255, 0.35)' }}>
              <Icons.Logo />
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 2 }}>
              <span style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.03em', color: '#111319' }}>VisCorner</span>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#1a6dff' }}></span>
            </div>
          </Link>

          {/* Center Navigation Links */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: 32 }} className="desktop-nav">
            
            {/* Jobs Pill with Live Pulsing Dot */}
            <Link href="/dashboard" style={{ textDecoration: 'none' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 9999, background: 'rgba(26, 109, 255, 0.08)', color: '#1a6dff', fontWeight: 700, fontSize: 14 }}>
                <span>Jobs</span>
                <span style={{ position: 'relative', display: 'flex', width: 8, height: 8 }}>
                  <span className="pulse-ping" style={{ position: 'absolute', width: '100%', height: '100%', borderRadius: '50%', background: '#1a6dff' }}></span>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#1a6dff' }}></span>
                </span>
              </span>
            </Link>

            <a href="#popular" style={{ fontSize: 15, fontWeight: 500, color: '#334155', textDecoration: 'none' }}>Popular Services</a>
            <a href="#how-it-works" style={{ fontSize: 15, fontWeight: 500, color: '#334155', textDecoration: 'none' }}>How It Works</a>
            <a href="#estimates" style={{ fontSize: 15, fontWeight: 500, color: '#334155', textDecoration: 'none' }}>Cost Estimates</a>
            <Link href="/login?mode=signup" style={{ fontSize: 15, fontWeight: 500, color: '#334155', textDecoration: 'none' }}>Offer Your Service</Link>
          </nav>

          {/* Right Action: Login Outline Pill */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <Link
              href="/login"
              className="desktop-actions"
              style={{
                fontSize: 15,
                fontWeight: 600,
                color: '#1a6dff',
                textDecoration: 'none',
                padding: '8px 26px',
                borderRadius: 9999,
                border: '2px solid #1a6dff',
                background: 'transparent',
                transition: 'all 0.15s ease',
              }}
            >
              Login
            </Link>

            {/* Mobile Hamburger Button */}
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
                color: '#111319',
              }}
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <Icons.Close /> : <Icons.Menu />}
            </button>
          </div>

        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div style={{ borderTop: '1px solid #e2e8f0', background: '#ffffff', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)} style={{ fontSize: 16, fontWeight: 600, color: '#1a6dff', textDecoration: 'none' }}>Jobs</Link>
            <a href="#popular" onClick={() => setMobileMenuOpen(false)} style={{ fontSize: 16, fontWeight: 600, color: '#334155', textDecoration: 'none' }}>Popular Services</a>
            <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)} style={{ fontSize: 16, fontWeight: 600, color: '#334155', textDecoration: 'none' }}>How It Works</a>
            <a href="#estimates" onClick={() => setMobileMenuOpen(false)} style={{ fontSize: 16, fontWeight: 600, color: '#334155', textDecoration: 'none' }}>Cost Estimates</a>
            <a href="#categories" onClick={() => setMobileMenuOpen(false)} style={{ fontSize: 16, fontWeight: 600, color: '#334155', textDecoration: 'none' }}>All Categories</a>
            <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <Link href="/login" onClick={() => setMobileMenuOpen(false)} style={{ textAlign: 'center', padding: '10px', borderRadius: 9999, border: '2px solid #1a6dff', color: '#1a6dff', textDecoration: 'none', fontWeight: 600, fontSize: 15 }}>
                Login
              </Link>
              <Link href="/login?mode=signup" onClick={() => setMobileMenuOpen(false)} style={{ textAlign: 'center', padding: '10px', borderRadius: 9999, background: '#1a6dff', color: '#ffffff', textDecoration: 'none', fontWeight: 600, fontSize: 15 }}>
                Offer Your Service
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* 2. Hero Section (Matching VisCorner Screenshot 3 & 4) */}
      <section className="hero-grid-bg" style={{ padding: '72px 24px 40px', position: 'relative', textAlign: 'center' }}>
        <div style={{ maxWidth: 860, margin: '0 auto', position: 'relative', zIndex: 2 }}>
          
          {/* Tilted Blue Pill Tag */}
          <div style={{ display: 'inline-block', position: 'relative' }}>
            <div
              style={{
                position: 'absolute',
                top: -16,
                left: -20,
                transform: 'rotate(-16deg)',
                background: '#1a6dff',
                color: '#ffffff',
                fontSize: 12,
                fontWeight: 700,
                padding: '6px 14px',
                borderRadius: 12,
                boxShadow: '0 4px 12px rgba(26, 109, 255, 0.3)',
                whiteSpace: 'nowrap',
              }}
            >
              Verified Professionals
            </div>
          </div>

          <h1 style={{ fontSize: 'clamp(38px, 5.2vw, 64px)', fontWeight: 800, letterSpacing: '-0.035em', lineHeight: 1.2, color: '#111319', margin: '20px 0 16px' }}>
            Find local professionals for everything you need
          </h1>

          <p style={{ fontSize: 'clamp(17px, 2vw, 21px)', color: '#475569', lineHeight: 1.5, maxWidth: 640, margin: '0 auto 36px' }}>
            From cleaning to car repairs to equipment servicing: VisCorner connects you with the right pros, fast.
          </p>

          {/* Pill Search Box (Matching VisCorner exactly) */}
          <div style={{ maxWidth: 740, margin: '0 auto 52px', background: '#ffffff', borderRadius: 9999, padding: '8px 10px', boxShadow: '0 8px 32px rgba(15, 23, 42, 0.08), 0 1px 3px rgba(15, 23, 42, 0.05)', border: '1px solid #e2e8f0' }}>
            <form onSubmit={handleSearchSubmit} style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 6 }}>
              
              {/* Input 1: Service */}
              <div style={{ flex: '1 1 240px', display: 'flex', alignItems: 'center', gap: 10, padding: '6px 14px' }}>
                <span style={{ color: '#64748b' }}><Icons.Search /></span>
                <input
                  type="text"
                  placeholder="What service do you need?"
                  value={serviceQuery}
                  onChange={(e) => setServiceQuery(e.target.value)}
                  style={{ width: '100%', border: 'none', outline: 'none', fontSize: 15, color: '#111319', background: 'transparent' }}
                />
              </div>

              {/* Vertical divider */}
              <span className="search-divider" style={{ width: 1, height: 32, background: '#cbd5e1' }}></span>

              {/* Input 2: Location */}
              <div style={{ flex: '1 1 200px', display: 'flex', alignItems: 'center', gap: 10, padding: '6px 14px' }}>
                <span style={{ color: '#64748b' }}><Icons.MapPin /></span>
                <input
                  type="text"
                  placeholder="Where do you need it?"
                  value={locationQuery}
                  onChange={(e) => setLocationQuery(e.target.value)}
                  style={{ width: '100%', border: 'none', outline: 'none', fontSize: 15, color: '#111319', background: 'transparent' }}
                />
                <span style={{ color: '#64748b', cursor: 'pointer' }} title="Use current location"><Icons.Crosshair /></span>
              </div>

              {/* Action Button: Get Started */}
              <button
                type="submit"
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
                  boxShadow: '0 2px 8px rgba(26, 109, 255, 0.35)',
                  whiteSpace: 'nowrap',
                }}
              >
                Get Started
              </button>

            </form>
          </div>

        </div>

        {/* Tilted Photo Carousel Strip (Matching VisCorner Screenshot 4) */}
        <div style={{ maxWidth: 1200, margin: '0 auto', overflow: 'hidden', padding: '10px 0 30px' }}>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
            
            <div className="tilted-hero-img" style={{ transform: 'rotate(-8deg)', width: 175, height: 180, borderRadius: 18, overflow: 'hidden', boxShadow: '0 8px 24px rgba(15, 23, 42, 0.12)', flexShrink: 0 }}>
              <img src="https://images.unsplash.com/photo-1617347454431-f49d7ff5c3b1?auto=format&fit=crop&w=400&q=80" alt="Dispatch Rider" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>

            <div className="tilted-hero-img" style={{ transform: 'rotate(8deg)', width: 175, height: 180, borderRadius: 18, overflow: 'hidden', boxShadow: '0 8px 24px rgba(15, 23, 42, 0.12)', flexShrink: 0 }}>
              <img src="https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=400&q=80" alt="Certified Electrician" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>

            <div className="tilted-hero-img" style={{ transform: 'rotate(-8deg)', width: 175, height: 180, borderRadius: 18, overflow: 'hidden', boxShadow: '0 8px 24px rgba(15, 23, 42, 0.12)', flexShrink: 0 }}>
              <img src="https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=400&q=80" alt="Catering Chef" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>

            <div className="tilted-hero-img" style={{ transform: 'rotate(8deg)', width: 175, height: 180, borderRadius: 18, overflow: 'hidden', boxShadow: '0 8px 24px rgba(15, 23, 42, 0.12)', flexShrink: 0 }}>
              <img src="https://images.unsplash.com/photo-1582750433449-648ed127bb54?auto=format&fit=crop&w=400&q=80" alt="Healthcare Professional" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>

            <div className="tilted-hero-img" style={{ transform: 'rotate(-8deg)', width: 175, height: 180, borderRadius: 18, overflow: 'hidden', boxShadow: '0 8px 24px rgba(15, 23, 42, 0.12)', flexShrink: 0 }}>
              <img src="https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=400&q=80" alt="IT Specialist" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>

            <div className="tilted-hero-img" style={{ transform: 'rotate(8deg)', width: 175, height: 180, borderRadius: 18, overflow: 'hidden', boxShadow: '0 8px 24px rgba(15, 23, 42, 0.12)', flexShrink: 0 }}>
              <img src="https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=400&q=80" alt="Photographer and Event Specialist" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>

          </div>
        </div>

        {/* Floating Electric Blue Stats Bar (Matching VisCorner Screenshot 4) */}
        <div style={{ maxWidth: 840, margin: '-24px auto 0', position: 'relative', zIndex: 5 }}>
          <div style={{ background: '#1a6dff', borderRadius: 24, padding: '26px 20px', color: '#ffffff', display: 'flex', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-around', alignItems: 'center', boxShadow: '0 16px 40px -10px rgba(26, 109, 255, 0.45)' }}>
            
            <div style={{ flex: '1 1 200px', padding: '12px', borderRight: '1px solid rgba(255, 255, 255, 0.25)', textAlign: 'center' }}>
              <div style={{ fontSize: 'clamp(28px, 3.5vw, 36px)', fontWeight: 800, lineHeight: 1.1 }}>₦150M+</div>
              <div style={{ fontSize: 13, color: 'rgba(255, 255, 255, 0.85)', marginTop: 6 }}>Worth of Services delivered in the past 12 months</div>
            </div>

            <div style={{ flex: '1 1 200px', padding: '12px', borderRight: '1px solid rgba(255, 255, 255, 0.25)', textAlign: 'center' }}>
              <div style={{ fontSize: 'clamp(28px, 3.5vw, 36px)', fontWeight: 800, lineHeight: 1.1 }}>2,500+</div>
              <div style={{ fontSize: 13, color: 'rgba(255, 255, 255, 0.85)', marginTop: 6 }}>Customer requests in the past 7 days</div>
            </div>

            <div style={{ flex: '1 1 200px', padding: '12px', textAlign: 'center' }}>
              <div style={{ fontSize: 'clamp(28px, 3.5vw, 36px)', fontWeight: 800, lineHeight: 1.1 }}>17,000+</div>
              <div style={{ fontSize: 13, color: 'rgba(255, 255, 255, 0.85)', marginTop: 6 }}>Professionals including individuals and companies</div>
            </div>

          </div>
        </div>

      </section>

      {/* 3. How It Works (Matching VisCorner Screenshot 1) */}
      <section id="how-it-works" style={{ padding: '96px 24px 72px', maxWidth: 1040, margin: '0 auto' }}>
        <h2 style={{ fontSize: 'clamp(32px, 4.4vw, 48px)', fontWeight: 800, textAlign: 'center', color: '#111319', margin: '0 0 36px', letterSpacing: '-0.025em' }}>
          How it works?
        </h2>

        {/* Big Blue 3-Step Card */}
        <div style={{ background: '#1a6dff', borderRadius: 28, padding: '36px 28px', color: '#ffffff', display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: 0, boxShadow: '0 16px 40px -10px rgba(26, 109, 255, 0.35)' }}>
          
          {/* Step 1 */}
          <div style={{ flex: '1 1 260px', padding: '16px 24px', borderRight: '1px solid rgba(255, 255, 255, 0.2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <div style={{ width: 34, height: 34, borderRadius: '50%', background: '#e2e8f0', color: '#111319', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 15 }}>
                1
              </div>
              <h3 style={{ fontSize: 22, fontWeight: 700, margin: 0, color: '#ffffff' }}>Make a request</h3>
            </div>
            <p style={{ fontSize: 14, color: 'rgba(255, 255, 255, 0.9)', lineHeight: 1.5, margin: 0 }}>
              Tell us what you need to get done, and we will inform suitable pros around you.
            </p>
          </div>

          {/* Step 2 */}
          <div style={{ flex: '1 1 260px', padding: '16px 24px', borderRight: '1px solid rgba(255, 255, 255, 0.2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <div style={{ width: 34, height: 34, borderRadius: '50%', background: '#e2e8f0', color: '#111319', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 15 }}>
                2
              </div>
              <h3 style={{ fontSize: 22, fontWeight: 700, margin: 0, color: '#ffffff' }}>Get responses</h3>
            </div>
            <p style={{ fontSize: 14, color: 'rgba(255, 255, 255, 0.9)', lineHeight: 1.5, margin: 0 }}>
              In no time, you will receive up to 4 quotes from pros that match your needs.
            </p>
          </div>

          {/* Step 3 */}
          <div style={{ flex: '1 1 260px', padding: '16px 24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <div style={{ width: 34, height: 34, borderRadius: '50%', background: '#e2e8f0', color: '#111319', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 15 }}>
                3
              </div>
              <h3 style={{ fontSize: 22, fontWeight: 700, margin: 0, color: '#ffffff' }}>Compare &amp; hire</h3>
            </div>
            <p style={{ fontSize: 14, color: 'rgba(255, 255, 255, 0.9)', lineHeight: 1.5, margin: 0 }}>
              Compare prices and read reviews to hire the right pro for you.
            </p>
          </div>

        </div>
      </section>

      {/* 4. Popular Services (Matching VisCorner Screenshot 5) */}
      <section id="popular" style={{ padding: '84px 24px', background: '#f8fafc', borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0' }}>
        <div style={{ maxWidth: 1240, margin: '0 auto' }}>
          
          <div style={{ textAlign: 'center', marginBottom: 44 }}>
            <h2 style={{ fontSize: 'clamp(30px, 4vw, 44px)', fontWeight: 800, color: '#111319', margin: '0 0 12px', letterSpacing: '-0.025em' }}>
              Popular services
            </h2>
            <p style={{ fontSize: 18, color: '#475569', maxWidth: 640, margin: '0 auto' }}>
              Discover the most in-demand services trusted by thousands of satisfied clients.
            </p>
          </div>

          {/* 4-Column Image Cards Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20 }}>
            {POPULAR_SERVICES.map((s, idx) => (
              <Link key={idx} href={s.link} style={{ textDecoration: 'none' }}>
                <div className="popular-card" style={{ position: 'relative', height: 260, borderRadius: 14, overflow: 'hidden', background: '#0f172a' }}>
                  <img src={s.image} alt={s.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
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

      {/* 5. What Our Clients Say (Matching VisCorner Screenshot 2) */}
      <section style={{ padding: '88px 24px', maxWidth: 1240, margin: '0 auto' }}>
        
        {/* Section Header with Carousel Arrows */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 36, flexWrap: 'wrap', gap: 14 }}>
          <div>
            <h2 style={{ fontSize: 'clamp(30px, 4vw, 44px)', fontWeight: 800, color: '#111319', margin: 0, letterSpacing: '-0.025em' }}>
              What our clients say
            </h2>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              type="button"
              onClick={() => setTestimonialIdx((prev) => (prev > 0 ? prev-1 : CLIENT_REVIEWS.length-1))}
              style={{ width: 42, height: 42, borderRadius: '50%', border: '1px solid #cbd5e1', background: '#ffffff', color: '#111319', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', margin: 0 }}
              aria-label="Previous Testimonial"
            >
              <Icons.ChevronLeft />
            </button>
            <button
              type="button"
              onClick={() => setTestimonialIdx((prev) => (prev < CLIENT_REVIEWS.length-1 ? prev + 1 : 0))}
              style={{ width: 42, height: 42, borderRadius: '50%', border: '1px solid #cbd5e1', background: '#ffffff', color: '#111319', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', margin: 0 }}
              aria-label="Next Testimonial"
            >
              <Icons.ChevronRight />
            </button>
          </div>
        </div>

        {/* 3-Card Carousel Display */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: 24, alignItems: 'stretch' }}>
          {CLIENT_REVIEWS.map((r, idx) => {
            const isFeatured = r.featured;
            return (
              <div
                key={idx}
                style={{
                  background: isFeatured ? '#1a6dff' : '#ffffff',
                  color: isFeatured ? '#ffffff' : '#111319',
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
                  {/* 5 Gold Stars */}
                  <div style={{ display: 'flex', gap: 4, marginBottom: 18 }}>
                    <Icons.Star /><Icons.Star /><Icons.Star /><Icons.Star /><Icons.Star />
                  </div>
                  <p style={{ fontSize: 15, lineHeight: 1.6, color: isFeatured ? '#ffffff' : '#334155', margin: '0 0 28px' }}>
                    {r.text}
                  </p>
                </div>
                <div>
                  <div style={{ fontSize: 17, fontWeight: 700, color: isFeatured ? '#ffffff' : '#111319' }}>{r.name}</div>
                  <div style={{ fontSize: 13, color: isFeatured ? 'rgba(255, 255, 255, 0.85)' : '#64748b', marginTop: 2 }}>{r.role}</div>
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

      {/* 6. Get Free Cost Estimates (Matching VisCorner Screenshot 10) */}
      <section id="estimates" style={{ padding: '84px 24px', background: '#f8fafc', borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0' }}>
        <div style={{ maxWidth: 1240, margin: '0 auto' }}>
          
          <div style={{ textAlign: 'center', marginBottom: 44 }}>
            <h2 style={{ fontSize: 'clamp(30px, 4vw, 44px)', fontWeight: 800, color: '#111319', margin: '0 0 12px', letterSpacing: '-0.025em' }}>
              Get free cost estimates
            </h2>
            <p style={{ fontSize: 18, color: '#475569', maxWidth: 640, margin: '0 auto' }}>
              Compare quotes from top-rated providers, to help you make smart hiring decisions.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: 24 }}>
            {COST_ESTIMATES.map((item, idx) => (
              <div key={idx} style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 14, overflow: 'hidden', boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ height: 190, overflow: 'hidden' }}>
                    <img src={item.image} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <div style={{ padding: '20px 22px 14px' }}>
                    <h3 style={{ fontSize: 18, fontWeight: 700, color: '#111319', margin: '0 0 8px' }}>{item.title}</h3>
                    <div style={{ fontSize: 15, fontWeight: 700, color: '#1a6dff' }}>{item.range}</div>
                    <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>{item.detail}</div>
                  </div>
                </div>
                <div style={{ padding: '0 22px 20px' }}>
                  <Link href="/dashboard" style={{ fontSize: 14, fontWeight: 600, color: '#1a6dff', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    <span>Read more</span>
                    <span>&gt;&gt;</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 7. Browse All Categories (Matching VisCorner Screenshot 6) */}
      <section id="categories" style={{ padding: '88px 24px', maxWidth: 1240, margin: '0 auto' }}>
        <h2 style={{ fontSize: 'clamp(28px, 3.8vw, 40px)', fontWeight: 800, color: '#111319', margin: '0 0 36px', textAlign: 'center', letterSpacing: '-0.025em' }}>
          Browse All Categories
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14 }}>
          {ALL_CATEGORIES.map((cat, idx) => (
            <Link key={idx} href="/dashboard" style={{ textDecoration: 'none' }}>
              <div className="category-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 18px', border: '1px solid #e2e8f0', borderRadius: 10, background: '#ffffff' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ color: '#1a6dff' }}><Icons.MapPin /></span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#111319', textTransform: 'uppercase', letterSpacing: '0.02em' }}>
                    {cat}
                  </span>
                </div>
                <span style={{ color: '#1a6dff', display: 'flex', alignItems: 'center' }}><Icons.ArrowRight /></span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 8. Dual Action Call-To-Action Cards (Matching VisCorner Screenshot 7) */}
      <section style={{ padding: '72px 24px', maxWidth: 1240, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24 }}>
          
          {/* Card 1: Dark Slate Card */}
          <div style={{ background: '#0b0f19', color: '#ffffff', borderRadius: 28, padding: '48px 36px', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: 380, boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)' }}>
            <div style={{ position: 'relative', zIndex: 2 }}>
              <h3 style={{ fontSize: 'clamp(26px, 3.2vw, 36px)', fontWeight: 800, margin: '0 0 14px', lineHeight: 1.2, letterSpacing: '-0.02em' }}>
                Connect with Experts You Can Trust!
              </h3>
              <p style={{ fontSize: 16, color: '#94a3b8', lineHeight: 1.6, margin: '0 0 36px', maxWidth: 440 }}>
                Find qualified professionals for every project, big or small.
              </p>
              
              <div style={{ display: 'flex', gap: 32, marginBottom: 40, flexWrap: 'wrap' }}>
                <div>
                  <div style={{ fontSize: 26, fontWeight: 800 }}>₦150M+</div>
                  <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>Worth of Services delivered</div>
                </div>
                <div>
                  <div style={{ fontSize: 26, fontWeight: 800 }}>17,000+</div>
                  <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>Professionals Available</div>
                </div>
              </div>
            </div>

            <div style={{ position: 'relative', zIndex: 2 }}>
              <Link href="/dashboard" style={{ display: 'inline-block', padding: '14px 34px', background: '#ffffff', color: '#0b0f19', borderRadius: 8, fontWeight: 800, fontSize: 14, textTransform: 'uppercase', textDecoration: 'none', letterSpacing: '0.04em' }}>
                Get Started
              </Link>
            </div>
          </div>

          {/* Card 2: Electric Blue Card */}
          <div style={{ background: '#1a6dff', color: '#ffffff', borderRadius: 28, padding: '48px 36px', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: 380, boxShadow: '0 20px 40px rgba(26, 109, 255, 0.35)' }}>
            <div style={{ position: 'relative', zIndex: 2 }}>
              <h3 style={{ fontSize: 'clamp(26px, 3.2vw, 36px)', fontWeight: 800, margin: '0 0 14px', lineHeight: 1.2, letterSpacing: '-0.02em' }}>
                Join Our Network of Top Service Providers!
              </h3>
              <p style={{ fontSize: 16, color: 'rgba(255, 255, 255, 0.9)', lineHeight: 1.6, margin: '0 0 36px', maxWidth: 440 }}>
                Create your free profile and showcase your services to thousands of potential customers.
              </p>
              
              <div style={{ display: 'flex', gap: 32, marginBottom: 40, flexWrap: 'wrap' }}>
                <div>
                  <div style={{ fontSize: 26, fontWeight: 800 }}>₦84M+</div>
                  <div style={{ fontSize: 12, color: 'rgba(255, 255, 255, 0.85)', marginTop: 4 }}>Earned by Pros</div>
                </div>
                <div>
                  <div style={{ fontSize: 26, fontWeight: 800 }}>2,500+</div>
                  <div style={{ fontSize: 12, color: 'rgba(255, 255, 255, 0.85)', marginTop: 4 }}>Customer Requests</div>
                </div>
              </div>
            </div>

            <div style={{ position: 'relative', zIndex: 2 }}>
              <Link href="/login?mode=signup" style={{ display: 'inline-block', padding: '14px 34px', background: '#ffffff', color: '#1a6dff', borderRadius: 8, fontWeight: 800, fontSize: 14, textTransform: 'uppercase', textDecoration: 'none', letterSpacing: '0.04em' }}>
                Get Started
              </Link>
            </div>
          </div>

        </div>
      </section>

      {/* 9. Find Pros Everywhere In Nigeria (Matching VisCorner Screenshot 8) */}
      <section style={{ padding: '0 24px 84px', maxWidth: 1240, margin: '0 auto' }}>
        <div style={{ background: '#1a6dff', borderRadius: 28, padding: '52px 36px', color: '#ffffff', position: 'relative', overflow: 'hidden', boxShadow: '0 16px 40px rgba(26, 109, 255, 0.3)' }}>
          
          <h2 style={{ fontSize: 'clamp(28px, 3.8vw, 42px)', fontWeight: 800, margin: '0 0 36px', letterSpacing: '-0.025em' }}>
            Find Pros Everywhere In Nigeria
          </h2>

          {/* 5-Column Grid of 36 States + FCT */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '14px 20px', fontSize: 15, fontWeight: 500 }}>
            {NIGERIA_STATES.map((st, idx) => (
              <Link key={idx} href={`/dashboard?loc=${encodeURIComponent(st)}`} style={{ color: '#ffffff', textDecoration: 'none', opacity: 0.95 }}>
                {st}
              </Link>
            ))}
          </div>

        </div>
      </section>

      {/* 10. Footer (Matching VisCorner Screenshot 9) */}
      <footer style={{ borderTop: '1px solid #e2e8f0', padding: '64px 24px 36px', background: '#ffffff' }}>
        <div style={{ maxWidth: 1240, margin: '0 auto' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 36, marginBottom: 48 }}>
            
            {/* Col 1: Company */}
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#111319', marginBottom: 18 }}>Company</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 14, color: '#475569' }}>
                <a href="#how-it-works" style={{ color: '#475569', textDecoration: 'none' }}>Help Center</a>
                <a href="#how-it-works" style={{ color: '#475569', textDecoration: 'none' }}>Contact</a>
                <a href="#how-it-works" style={{ color: '#475569', textDecoration: 'none' }}>About Us</a>
              </div>
            </div>

            {/* Col 2: Customers */}
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#111319', marginBottom: 18 }}>Customers</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 14, color: '#475569' }}>
                <a href="#estimates" style={{ color: '#475569', textDecoration: 'none' }}>Cost Estimates</a>
                <a href="#how-it-works" style={{ color: '#475569', textDecoration: 'none' }}>Customer Safety Tips</a>
                <Link href="/track?no=REQ-DEMO-4109" style={{ color: '#1a6dff', fontWeight: 600, textDecoration: 'none' }}>Order Tracking</Link>
              </div>
            </div>

            {/* Col 3: Professionals */}
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#111319', marginBottom: 18 }}>Professionals</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 14, color: '#475569' }}>
                <Link href="/login?mode=signup" style={{ color: '#475569', textDecoration: 'none' }}>Help Center</Link>
                <Link href="/login?mode=signup" style={{ color: '#475569', textDecoration: 'none' }}>Offer Your Service</Link>
                <Link href="/login" style={{ color: '#475569', textDecoration: 'none' }}>Sign In to Portal</Link>
              </div>
            </div>

            {/* Col 4: Subscribe Form */}
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#111319', marginBottom: 12 }}>Subscribe</div>
              <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.5, margin: '0 0 16px' }}>
                Stay updated with the latest news and offers!
              </p>
              <form onSubmit={handleSubscribe} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <input
                  type="email"
                  required
                  placeholder="Enter your email address"
                  value={subscribeEmail}
                  onChange={(e) => setSubscribeEmail(e.target.value)}
                  style={{ width: '100%', padding: '12px 14px', borderRadius: 9999, border: '1px solid #cbd5e1', fontSize: 14, outline: 'none' }}
                />
                <button
                  type="submit"
                  style={{
                    padding: '12px 24px',
                    borderRadius: 9999,
                    background: '#1a6dff',
                    color: '#ffffff',
                    fontWeight: 700,
                    fontSize: 14,
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    margin: 0,
                  }}
                >
                  <Icons.Mail />
                  <span>{subscribed ? 'Subscribed!' : 'Subscribe'}</span>
                </button>
              </form>
            </div>

          </div>

          {/* Footer Bottom Bar */}
          <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 26, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
            
            {/* Logo & Copyright */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 26, height: 26, borderRadius: 7, background: '#1a6dff', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icons.Logo />
                </div>
                <span style={{ fontSize: 18, fontWeight: 800, color: '#111319' }}>VisCorner</span>
              </div>
              <span style={{ fontSize: 13, color: '#64748b' }}>
                © 2026 VisCorner | Terms of Service | Privacy Policy
              </span>
            </div>

            {/* Social Icons & Scroll-to-top */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ display: 'flex', gap: 8 }}>
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" style={{ width: 34, height: 34, borderRadius: '50%', background: '#f1f5f9', color: '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center' }} aria-label="Twitter">
                  <Icons.Twitter />
                </a>
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" style={{ width: 34, height: 34, borderRadius: '50%', background: '#f1f5f9', color: '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center' }} aria-label="Facebook">
                  <Icons.Facebook />
                </a>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" style={{ width: 34, height: 34, borderRadius: '50%', background: '#f1f5f9', color: '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center' }} aria-label="Instagram">
                  <Icons.Instagram />
                </a>
                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" style={{ width: 34, height: 34, borderRadius: '50%', background: '#f1f5f9', color: '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center' }} aria-label="LinkedIn">
                  <Icons.Linkedin />
                </a>
              </div>

              {/* Scroll to top floating pill button */}
              <button
                type="button"
                onClick={scrollToTop}
                style={{ width: 38, height: 38, borderRadius: '50%', background: '#1a6dff', color: '#ffffff', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', margin: 0, boxShadow: '0 4px 12px rgba(26, 109, 255, 0.4)' }}
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
