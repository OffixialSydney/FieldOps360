'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

// Clean, professional SVG icons (Zero emojis)
const Icons = {
  Logo: () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
    </svg>
  ),
  Dispatch: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="3 11 22 2 13 21 11 13 3 11" />
    </svg>
  ),
  Offline: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12.55a11 11 0 0 1 14.08 0" />
      <path d="M1.42 9a16 16 0 0 1 21.16 0" />
      <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
      <line x1="12" y1="20" x2="12.01" y2="20" />
    </svg>
  ),
  Signature: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
    </svg>
  ),
  Wallet: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <line x1="2" y1="10" x2="22" y2="10" />
      <circle cx="17" cy="15" r="1" />
    </svg>
  ),
  Inventory: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
      <line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  ),
  Security: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <polyline points="9 12 11 14 15 10" />
    </svg>
  ),
  ArrowRight: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  ),
  Check: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  Star: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="#f59e0b" stroke="#f59e0b" strokeWidth="1">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  ),
};

const SLIDES = [
  {
    id: 'dispatch',
    tab: 'Smart Dispatch',
    IconComponent: Icons.Dispatch,
    badge: 'Automated Routing',
    title: 'Match Technicians by Skill & Real-Time Proximity',
    desc: 'Route incoming service orders to the nearest qualified crew. FieldOps 360 validates technician certifications, checks van inventory, and calculates travel ETAs automatically.',
    points: [
      'Proximity-based technician dispatching',
      'Automated asset warranty verification',
      'Real-time technician arrival notifications',
    ],
    mockup: {
      tag: 'WORK ORDER #REQ-4109',
      status: 'Technician En Route',
      metric1: { label: 'Assigned Specialist', val: 'Marcus V. (Master Electrician)' },
      metric2: { label: 'Distance & ETA', val: '2.4 mi • 8 mins away' },
      detail: 'Solar Inverter diagnostic & bypass overhaul. Verified van stock availability.',
    },
  },
  {
    id: 'offline',
    tab: 'Offline Mobile',
    IconComponent: Icons.Offline,
    badge: 'Zero Network Latency',
    title: 'Work Uninterrupted in Remote Areas & Basements',
    desc: 'Equip field technicians with a mobile workflow that never stalls without reception. Diagnostics, photos, and notes queue locally on-device and sync immediately upon reconnecting.',
    points: [
      'Local-first database queue prevents data loss',
      'Instant synchronization upon cellular reconnect',
      'Complete asset and job history stored locally',
    ],
    mockup: {
      tag: 'OFFLINE MODE ACTIVE',
      status: 'Queueing 3 Updates Locally',
      metric1: { label: 'Cached Records', val: '12 Active Work Orders' },
      metric2: { label: 'Pending Queue', val: '3 Diagnostics Queued' },
      detail: 'Diagnostic checklist recorded in underground facility. Auto-sync armed.',
    },
  },
  {
    id: 'approvals',
    tab: 'Digital Sign-Off',
    IconComponent: Icons.Signature,
    badge: 'Legally Binding',
    title: 'Capture Verified Signatures on Mobile Glass',
    desc: 'Eliminate billing disputes. Customers sign off directly on the technician mobile screen. If additional parts are diagnosed, quote approvals are sent directly to the client portal.',
    points: [
      'Digital touch signature collection on glass',
      'Instant client quote authorization for extra scope',
      'Complete audit trail with GPS geo-timestamp',
    ],
    mockup: {
      tag: 'SIGN-OFF VERIFIED',
      status: 'Client Signed & Approved',
      metric1: { label: 'Customer Lead', val: 'Sarah Jenkins (Facilities Dir.)' },
      metric2: { label: 'Inspection Status', val: '100% Passed & Verified' },
      detail: 'Signature captured with timestamp. Work order ready for settlement.',
    },
  },
  {
    id: 'wallet',
    tab: 'Wallet & Invoicing',
    IconComponent: Icons.Wallet,
    badge: 'Multi-Rail Settlement',
    title: 'Automated Invoices & Corporate Wallet Settlement',
    desc: 'The instant a work order is signed off, itemized invoices generate automatically. Clients can settle immediately via pre-funded corporate wallets, credit card, bank transfer, or crypto ledger.',
    points: [
      'Instant invoice generation from closed tickets',
      'Pre-funded customer wallets for zero-friction payments',
      'Comprehensive accountant ledger reconciliation',
    ],
    mockup: {
      tag: 'SETTLED INVOICE #INV-8821',
      status: 'Paid via Corporate Wallet',
      metric1: { label: 'Total Invoiced', val: '$1,450.00 USD' },
      metric2: { label: 'Client Wallet Balance', val: '$18,320.00 Remaining' },
      detail: 'Payment receipt generated and emailed to billing department.',
    },
  },
];

const TESTIMONIALS = [
  {
    quote: 'FieldOps 360 reduced our average dispatch time from 45 minutes down to 6 minutes. The offline mobile tool alone saved our technicians hundreds of hours in remote commercial facilities.',
    author: 'Elena Rostova',
    role: 'VP of Operations, Apex Facilities Corp',
    initials: 'ER',
  },
  {
    quote: 'The digital sign-off and pre-funded wallet transformed our billing pipeline. We transitioned from waiting 30 days for payment to settling 80% of invoices the exact day work is completed.',
    author: 'Derek Vance',
    role: 'Managing Director, VoltWorks Energy Systems',
    initials: 'DV',
  },
  {
    quote: 'Multi-tenant security and warranty tracking saved our team over $120,000 in duplicate warranty claims during our first quarter. The software is remarkably stable and dependable.',
    author: 'Tariq Al-Mansoor',
    role: 'Fleet & Service Director, Horizon Solar Grid',
    initials: 'TM',
  },
];

export default function LandingPage() {
  const [activeSlide, setActiveSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    if (isPaused) return;
    const interval = 50;
    const totalDuration = 6000;
    const increment = (interval / totalDuration) * 100;

    timerRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          setActiveSlide((curr) => (curr + 1) % SLIDES.length);
          return 0;
        }
        return prev + increment;
      });
    }, interval);

    return () => clearInterval(timerRef.current);
  }, [isPaused, activeSlide]);

  const selectSlide = (index) => {
    setActiveSlide(index);
    setProgress(0);
  };

  const nextSlide = () => {
    setActiveSlide((curr) => (curr + 1) % SLIDES.length);
    setProgress(0);
  };

  const prevSlide = () => {
    setActiveSlide((curr) => (curr - 1 + SLIDES.length) % SLIDES.length);
    setProgress(0);
  };

  const nextTestimonial = () => {
    setActiveTestimonial((curr) => (curr + 1) % TESTIMONIALS.length);
  };

  const prevTestimonial = () => {
    setActiveTestimonial((curr) => (curr - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);
  };

  const currentSlide = SLIDES[activeSlide];
  const currentTestimonial = TESTIMONIALS[activeTestimonial];

  return (
    <div className="topnotch-landing">
      {/* Executive Navbar */}
      <nav className="topnotch-nav">
        <div className="landing-container nav-inner">
          <Link href="/" className="brand-group">
            <div className="brand-icon-box">
              <Icons.Logo />
            </div>
            <span className="brand-name">FieldOps 360</span>
            <span className="brand-glow-tag">Platform</span>
          </Link>

          <div className="nav-links">
            <a href="#workflow">Platform</a>
            <a href="#features">Capabilities</a>
            <a href="#metrics">Performance</a>
            <a href="#testimonials">Reviews</a>
            <a href="#security">Architecture</a>
          </div>

          <div className="nav-cta-group">
            <Link href="/login" className="nav-btn-ghost">
              Sign In
            </Link>
            <Link href="/login?mode=signup" className="nav-btn-glow">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="topnotch-hero">
        <div className="landing-container">
          <div className="hero-pill-badge">
            <span className="radar-dot"></span>
            <span>Enterprise Field Service Operating System</span>
          </div>

          <h1 className="hero-main-title">
            Dispatch Faster. Empower Crews.{' '}
            <span className="gradient-title-text">Accelerate Revenue.</span>
          </h1>

          <p className="hero-sub-text">
            Unify intelligent technician dispatching, offline-first mobile workflows, customer digital approvals, 
            and multi-rail invoice settlements in one high-performance platform.
          </p>

          <div className="hero-action-row">
            <Link href="/login?mode=signup" className="cta-mega-btn">
              <span>Start Free Trial</span>
              <Icons.ArrowRight />
            </Link>
            <Link href="/login" className="cta-glass-btn">
              <span>Sign In to Portal</span>
            </Link>
          </div>

          {/* Clean Partner Ticker (Zero emojis) */}
          <div className="marquee-wrapper">
            <div className="marquee-track">
              <div className="marquee-item"><span className="bullet-dot">•</span> VOLTWORKS ENERGY</div>
              <div className="marquee-item"><span className="bullet-dot">•</span> SOLARGRID SYSTEMS</div>
              <div className="marquee-item"><span className="bullet-dot">•</span> APEX FACILITY SOLUTIONS</div>
              <div className="marquee-item"><span className="bullet-dot">•</span> THERMAL DYNAMICS</div>
              <div className="marquee-item"><span className="bullet-dot">•</span> MATRIX MECHANICAL</div>
              <div className="marquee-item"><span className="bullet-dot">•</span> INFRACORE UTILITIES</div>
              {/* Duplicate track for seamless infinite loop */}
              <div className="marquee-item"><span className="bullet-dot">•</span> VOLTWORKS ENERGY</div>
              <div className="marquee-item"><span className="bullet-dot">•</span> SOLARGRID SYSTEMS</div>
              <div className="marquee-item"><span className="bullet-dot">•</span> APEX FACILITY SOLUTIONS</div>
              <div className="marquee-item"><span className="bullet-dot">•</span> THERMAL DYNAMICS</div>
              <div className="marquee-item"><span className="bullet-dot">•</span> MATRIX MECHANICAL</div>
              <div className="marquee-item"><span className="bullet-dot">•</span> INFRACORE UTILITIES</div>
            </div>
          </div>

          {/* Interactive Workflow Cockpit Slider */}
          <section
            id="workflow"
            className="slider-section-container"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            <div className="interactive-slider-box">
              {/* Tabs */}
              <div className="slider-tabs-nav">
                {SLIDES.map((slide, idx) => {
                  const SlideIcon = slide.IconComponent;
                  return (
                    <button
                      key={slide.id}
                      type="button"
                      className={`slider-tab-btn ${activeSlide === idx ? 'active' : ''}`}
                      onClick={() => selectSlide(idx)}
                    >
                      <span className="tab-icon"><SlideIcon /></span>
                      <span>{slide.tab}</span>
                    </button>
                  );
                })}
              </div>

              {/* Progress timer bar */}
              <div className="slider-timer-bar">
                <div className="slider-timer-fill" style={{ width: `${progress}%` }}></div>
              </div>

              {/* Slide Body */}
              <div className="slide-display-area" key={currentSlide.id}>
                <div className="slide-grid">
                  <div className="slide-info-panel">
                    <span className="slide-badge-pill">{currentSlide.badge}</span>
                    <h3>{currentSlide.title}</h3>
                    <p className="slide-desc">{currentSlide.desc}</p>

                    <ul className="slide-key-points">
                      {currentSlide.points.map((pt, i) => (
                        <li key={i}>
                          <span className="point-check"><Icons.Check /></span>
                          <span>{pt}</span>
                        </li>
                      ))}
                    </ul>

                    <Link href="/login?mode=signup" className="nav-btn-glow" style={{ display: 'inline-flex', gap: '8px' }}>
                      <span>Explore {currentSlide.tab}</span>
                      <Icons.ArrowRight />
                    </Link>
                  </div>

                  <div className="slide-mockup-card">
                    <div className="mockup-header-bar">
                      <span className="mockup-id-tag">{currentSlide.mockup.tag}</span>
                      <div className="mockup-status-indicator">
                        <span className="mockup-pulse-circle"></span>
                        <span>{currentSlide.mockup.status}</span>
                      </div>
                    </div>

                    <div className="mockup-stat-rows">
                      <div className="mockup-mini-tile">
                        <div className="mini-tile-label">{currentSlide.mockup.metric1.label}</div>
                        <div className="mini-tile-val">{currentSlide.mockup.metric1.val}</div>
                      </div>
                      <div className="mockup-mini-tile">
                        <div className="mini-tile-label">{currentSlide.mockup.metric2.label}</div>
                        <div className="mini-tile-val">{currentSlide.mockup.metric2.val}</div>
                      </div>
                    </div>

                    <div className="mockup-detail-bubble">
                      <span className="bubble-head">Operational Activity Log</span>
                      <span className="bubble-text">{currentSlide.mockup.detail}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Slider Controls */}
              <div className="slider-controls-footer">
                <span className="slider-hint">
                  {isPaused ? 'Paused (hovering)' : 'Auto-advancing (hover to inspect)'}
                </span>

                <div className="slider-nav-arrows">
                  <button type="button" className="arrow-circle-btn" onClick={prevSlide} aria-label="Previous slide">
                    ‹
                  </button>
                  <button type="button" className="arrow-circle-btn" onClick={nextSlide} aria-label="Next slide">
                    ›
                  </button>
                </div>
              </div>
            </div>
          </section>
        </div>
      </header>

      {/* Metrics Banner */}
      <section id="metrics" className="topnotch-section metrics-section">
        <div className="landing-container">
          <div className="grid metrics-grid">
            <div className="card metric-card">
              <div className="stat metric-num-blue">82%</div>
              <p className="muted">Faster Dispatch Allocation</p>
            </div>
            <div className="card metric-card">
              <div className="stat metric-num-green">100%</div>
              <p className="muted">Offline Mobile Resilience</p>
            </div>
            <div className="card metric-card">
              <div className="stat metric-num-indigo">3.8x</div>
              <p className="muted">Accelerated Invoice Settlement</p>
            </div>
            <div className="card metric-card">
              <div className="stat metric-num-amber">99.9%</div>
              <p className="muted">SLA Uptime Performance</p>
            </div>
          </div>
        </div>
      </section>

      {/* Capability Cards Section */}
      <section id="features" className="topnotch-section">
        <div className="landing-container">
          <div className="section-title-wrap">
            <span className="section-tag-pill">Core Architecture</span>
            <h2 className="section-head-title">Engineered for High-Velocity Field Teams</h2>
            <p className="section-head-desc">
              Everything your operations managers, field crews, and accounting teams need in one unified system.
            </p>
          </div>

          <div className="glow-features-grid">
            <div className="glow-feature-card">
              <div className="feature-top-icon">
                <Icons.Dispatch />
              </div>
              <h4>Intelligent Skill & Proximity Dispatch</h4>
              <p>
                Allocate incoming work tickets automatically to certified technicians based on location, skillset, and parts availability.
              </p>
            </div>

            <div className="glow-feature-card">
              <div className="feature-top-icon">
                <Icons.Offline />
              </div>
              <h4>Offline-First Mobile Sync</h4>
              <p>
                Field technicians record diagnostics, parts usage, and notes in low-signal zones. Changes queue on-device and auto-sync seamlessly.
              </p>
            </div>

            <div className="glow-feature-card">
              <div className="feature-top-icon">
                <Icons.Signature />
              </div>
              <h4>Client Sign-Off & Scope Authorization</h4>
              <p>
                Capture verified digital sign-offs directly on glass. Clients receive instantaneous prompts to approve unexpected repair scope.
              </p>
            </div>

            <div className="glow-feature-card">
              <div className="feature-top-icon">
                <Icons.Wallet />
              </div>
              <h4>Multi-Rail Digital Wallet System</h4>
              <p>
                Clients fund maintenance balances via card, bank transfer, or crypto. Completed invoices deduct automatically with full audit logs.
              </p>
            </div>

            <div className="glow-feature-card">
              <div className="feature-top-icon">
                <Icons.Inventory />
              </div>
              <h4>Live Truck & Warehouse Parts Ledger</h4>
              <p>
                Real-time inventory ledger updates the moment parts are consumed on a ticket. Automated warranty coverage checks built in.
              </p>
            </div>

            <div className="glow-feature-card">
              <div className="feature-top-icon">
                <Icons.Security />
              </div>
              <h4>PostgreSQL Multi-Tenant RLS Security</h4>
              <p>
                Bank-grade Row-Level Security ensures strict multi-organization data isolation. Staff only access authorized data.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Customer Testimonial Carousel */}
      <section id="testimonials" className="topnotch-section testimonials-section">
        <div className="landing-container">
          <div className="section-title-wrap">
            <span className="section-tag-pill">Field Validation</span>
            <h2 className="section-head-title">Trusted by Modern Service Operations</h2>
          </div>

          <div className="testimonial-wrapper">
            <div className="quote-stars-row">
              <Icons.Star /><Icons.Star /><Icons.Star /><Icons.Star /><Icons.Star />
            </div>
            <p className="testimonial-quote">"{currentTestimonial.quote}"</p>

            <div className="testimonial-author-box">
              <div className="author-avatar">{currentTestimonial.initials}</div>
              <div className="author-details">
                <div className="author-name">{currentTestimonial.author}</div>
                <div className="author-title">{currentTestimonial.role}</div>
              </div>
            </div>

            <div className="testimonial-nav-arrows">
              <button type="button" className="arrow-circle-btn" onClick={prevTestimonial} aria-label="Previous testimonial">
                ‹
              </button>
              <button type="button" className="arrow-circle-btn" onClick={nextTestimonial} aria-label="Next testimonial">
                ›
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Security & Architecture Highlights */}
      <section id="security" className="topnotch-section">
        <div className="landing-container">
          <div className="card security-highlight-card">
            <span className="section-tag-pill">Enterprise Governance</span>
            <h2 className="security-title">PostgreSQL Row-Level Security (RLS)</h2>
            <p className="security-desc">
              FieldOps 360 enforces organizational boundaries directly at the database layer. Critical ledger operations—such as wallet deductions, parts usage, and payment verifications—execute inside atomic database functions with cryptographic role validation.
            </p>

            <div className="grid security-perks-grid">
              <div className="security-perk perk-blue">
                <strong>Zero Cross-Tenant Leakage</strong>
                <span className="muted">Strict database isolation enforced on every request.</span>
              </div>
              <div className="security-perk perk-green">
                <strong>Immutable Audit Ledgers</strong>
                <span className="muted">All job state transitions and payments are append-only.</span>
              </div>
              <div className="security-perk perk-indigo">
                <strong>Offline Queue Resilience</strong>
                <span className="muted">Deterministic change replay ensures zero lost records.</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Banner */}
      <section className="topnotch-cta-banner">
        <div className="landing-container">
          <div className="cta-glow-container">
            <h2>Ready to Modernize Your Field Operations?</h2>
            <p>
              Join service contractors, solar providers, and facilities teams running faster, more profitable field operations with FieldOps 360.
            </p>

            <div className="hero-action-row" style={{ marginBottom: 0 }}>
              <Link href="/login?mode=signup" className="cta-mega-btn cta-btn-white">
                <span>Create Free Account</span>
                <Icons.ArrowRight />
              </Link>
              <Link href="/login" className="cta-glass-btn cta-btn-translucent">
                <span>Sign In to Portal</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Executive Footer */}
      <footer className="topnotch-footer">
        <div className="landing-container">
          <div className="footer-top-grid">
            <div className="footer-brand-col">
              <div className="brand-group" style={{ marginBottom: '14px' }}>
                <div className="brand-icon-box">
                  <Icons.Logo />
                </div>
                <span className="brand-name">FieldOps 360</span>
              </div>
              <p className="footer-lead-text">
                The modern field service operating system. Smart dispatching, offline mobile tooling, customer digital approvals, and multi-rail billing.
              </p>
              <div className="status-pill">
                <span className="status-dot"></span>
                <span>All Systems Operational</span>
              </div>
            </div>

            <div className="footer-col-nav">
              <div>
                <h5>Platform</h5>
                <a href="#workflow">Dispatch Engine</a>
                <a href="#features">Capabilities</a>
                <a href="#metrics">Performance</a>
                <a href="#security">Architecture</a>
              </div>

              <div>
                <h5>Access</h5>
                <Link href="/login">Customer Portal</Link>
                <Link href="/login">Technician Mobile</Link>
                <Link href="/login">Manager Console</Link>
                <Link href="/login?mode=signup">New Account</Link>
              </div>

              <div>
                <h5>Account</h5>
                <Link href="/reset">Reset Password</Link>
                <Link href="/login">Sign In</Link>
                <Link href="/login?mode=signup">Sign Up</Link>
              </div>
            </div>
          </div>

          <div className="footer-bottom-bar">
            <span>© {new Date().getFullYear()} FieldOps 360. All rights reserved.</span>
            <div className="footer-legal-links">
              <a href="#features">Privacy Policy</a>
              <a href="#features">Terms of Service</a>
              <a href="#security">Security Posture</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
