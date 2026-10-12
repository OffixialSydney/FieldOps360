'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

const SLIDES = [
  {
    id: 'dispatch',
    tab: 'Smart Dispatch',
    icon: '⚡',
    badge: 'AI-Powered Dispatch Engine',
    title: 'Auto-Match Technicians by Skill & GPS Proximity',
    desc: 'Route incoming service requests to the most qualified nearby technician. FieldOps 360 automatically verifies warranty coverage, balances crew workload, and forecasts precise arrival ETAs.',
    points: [
      'Real-time GPS proximity and skill matching',
      'Instant automated warranty detection',
      '1-click dispatch with SMS & push alerts'
    ],
    mockup: {
      tag: 'LIVE WORK ORDER #REQ-4109',
      status: 'Technician En Route',
      metric1: { label: 'Assigned Specialist', val: 'Marcus V. (Master Electrician)' },
      metric2: { label: 'Distance & ETA', val: '2.4 mi • 8 mins away' },
      detail: 'Commercial Solar Inverter diagnostic & emergency bypass overhaul. Van parts verified in stock.'
    }
  },
  {
    id: 'offline',
    tab: 'Offline Mobile',
    icon: '📶',
    badge: 'Zero Network Latency',
    title: 'Work Uninterrupted in Basements & Dead Zones',
    desc: 'Empower field crews with mobile workflows that never crash when signal drops. Job diagnostics, photos, and status updates queue locally on-device and auto-sync immediately when reconnected.',
    points: [
      'Local device queue for zero data loss',
      'Auto-syncs status and notes on reconnect',
      'Full asset history cached on mobile'
    ],
    mockup: {
      tag: 'OFFLINE MODE ACTIVE (SIGNAL: 0 BARS)',
      status: 'Queueing 3 Updates Locally',
      metric1: { label: 'Cached Records', val: '12 Active Work Orders' },
      metric2: { label: 'Offline Queue', val: '3 Diagnostics Pending Sync' },
      detail: 'Technician logged notes and diagnostic checklist in underground utility vault. Auto-sync armed.'
    }
  },
  {
    id: 'approvals',
    tab: 'Digital Sign-Off',
    icon: '✍️',
    badge: 'Frictionless Signatures',
    title: 'Capture Legally-Binding Customer Signatures on Glass',
    desc: 'Eliminate billing disputes forever. Collect client signatures on-site right from the technician mobile screen. If unexpected parts are needed, instant quote approvals are sent directly to the customer portal.',
    points: [
      'Touch signature collection directly on glass',
      'One-click extra labor & parts quote approvals',
      'Tamper-proof audit log with exact timestamps'
    ],
    mockup: {
      tag: 'COMPLETION SIGN-OFF #SIG-9022',
      status: 'Customer Approved & Signed',
      metric1: { label: 'Customer Representative', val: 'Sarah Jenkins (Facilities Lead)' },
      metric2: { label: 'Scope Verified', val: '100% Inspection Passed' },
      detail: 'Digital signature captured with GPS geo-stamp. Work order completed and ready for automated billing.'
    }
  },
  {
    id: 'wallet',
    tab: 'Wallet & Invoicing',
    icon: '💳',
    badge: 'Multi-Rail Settlement',
    title: 'Instant Automated Invoicing & Pre-Funded Wallets',
    desc: 'The moment a technician closes a ticket, itemized invoices generate automatically. Customers can settle immediately via corporate digital wallet, card, direct bank transfer, or crypto ledger.',
    points: [
      'Automated invoice generation from completed jobs',
      'Corporate digital wallets for pre-funded maintenance',
      'Full accountant ledger reconciliation'
    ],
    mockup: {
      tag: 'SETTLED INVOICE #INV-8821',
      status: 'Paid via Corporate Wallet',
      metric1: { label: 'Total Invoiced', val: '$1,450.00 USD' },
      metric2: { label: 'Client Wallet Balance', val: '$18,320.00 Remaining' },
      detail: 'Accountant approved payment receipt automatically emailed. Zero manual paperwork required.'
    }
  }
];

const TESTIMONIALS = [
  {
    quote: "FieldOps 360 cut our average dispatch time from 45 minutes down to 6 minutes. The offline mobile app alone saved our technicians hundreds of hours in remote commercial sites.",
    author: "Elena Rostova",
    role: "VP of Operations, Apex Facilities Corp",
    avatar: "ER"
  },
  {
    quote: "The multi-rail wallet and instant digital sign-off changed our cash flow completely. We went from waiting 30 days for customer payments to settling 80% of invoices same-day.",
    author: "Derek Vance",
    role: "Managing Director, VoltWorks Energy Systems",
    avatar: "DV"
  },
  {
    quote: "The multi-tenant security and warranty tracking saved us over $120,000 in duplicate warranty claims in our first quarter alone. Absolutely top tier.",
    author: "Tariq Al-Mansoor",
    role: "Fleet & Service Director, Horizon Solar Grid",
    avatar: "TM"
  }
];

export default function LandingPage() {
  const [activeSlide, setActiveSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const timerRef = useRef(null);

  // Auto-advancing slider with progress bar
  useEffect(() => {
    if (isPaused) return;

    const interval = 50; // update progress every 50ms
    const totalDuration = 6000; // 6 seconds per slide
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
      {/* Luxury Glass Navbar */}
      <nav className="topnotch-nav">
        <div className="landing-container nav-inner">
          <Link href="/" className="brand-group">
            <div className="brand-icon-box">⚡</div>
            <span className="brand-name">FieldOps 360</span>
            <span className="brand-glow-tag">Enterprise v2.0</span>
          </Link>

          <div className="nav-links">
            <a href="#workflow">Live Platform</a>
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
              Get Started Free →
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="topnotch-hero">
        <div className="landing-container">
          <div className="hero-pill-badge">
            <span className="radar-dot"></span>
            <span>Next-Generation Field Operations Command Center</span>
          </div>

          <h1 className="hero-main-title">
            Dispatch Faster. Empower Crews.{' '}
            <span className="gradient-title-text">Accelerate Cash Flow.</span>
          </h1>

          <p className="hero-sub-text">
            The mission-critical operating system unifying intelligent dispatching, offline-first mobile workflows, 
            customer approvals, digital wallet settlements, and real-time inventory control.
          </p>

          <div className="hero-action-row">
            <Link href="/login?mode=signup" className="cta-mega-btn">
              <span>Start Free Enterprise Trial</span>
              <span>→</span>
            </Link>
            <Link href="/login" className="cta-glass-btn">
              <span>Access Portal</span>
              <span>⚡</span>
            </Link>
          </div>

          {/* Infinite Animated Marquee of Industry Leaders */}
          <div className="marquee-wrapper">
            <div className="marquee-track">
              <div className="marquee-item"><span>⚡</span> VOLTWORKS ENERGY</div>
              <div className="marquee-item"><span>☀️</span> SOLARGRID NATION</div>
              <div className="marquee-item"><span>🏢</span> APEX FACILITY SOLUTIONS</div>
              <div className="marquee-item"><span>❄️</span> THERMO-DYNAMICS HVAC</div>
              <div className="marquee-item"><span>🔧</span> MATRIX MECHANICAL</div>
              <div className="marquee-item"><span>🛡️</span> INFRACORE UTILITIES</div>
              {/* Duplicate track for seamless infinite loop */}
              <div className="marquee-item"><span>⚡</span> VOLTWORKS ENERGY</div>
              <div className="marquee-item"><span>☀️</span> SOLARGRID NATION</div>
              <div className="marquee-item"><span>🏢</span> APEX FACILITY SOLUTIONS</div>
              <div className="marquee-item"><span>❄️</span> THERMO-DYNAMICS HVAC</div>
              <div className="marquee-item"><span>🔧</span> MATRIX MECHANICAL</div>
              <div className="marquee-item"><span>🛡️</span> INFRACORE UTILITIES</div>
            </div>
          </div>

          {/* =========================================================
             INTERACTIVE WORKFLOW SLIDER / COMMAND CENTER
             ========================================================= */}
          <section
            id="workflow"
            className="slider-section-container"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            <div className="interactive-slider-box">
              {/* Slider Tab Navigation */}
              <div className="slider-tabs-nav">
                {SLIDES.map((slide, idx) => (
                  <button
                    key={slide.id}
                    type="button"
                    className={`slider-tab-btn ${activeSlide === idx ? 'active' : ''}`}
                    onClick={() => selectSlide(idx)}
                  >
                    <span className="tab-icon">{slide.icon}</span>
                    <span>{slide.tab}</span>
                  </button>
                ))}
              </div>

              {/* Animated Progress Timer Line */}
              <div className="slider-timer-bar">
                <div
                  className="slider-timer-fill"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>

              {/* Slide Content Display */}
              <div className="slide-display-area" key={currentSlide.id}>
                <div className="slide-grid">
                  {/* Left Column: Details */}
                  <div className="slide-info-panel" style={{ textAlign: 'left' }}>
                    <span className="slide-badge-pill">{currentSlide.badge}</span>
                    <h3>{currentSlide.title}</h3>
                    <p className="slide-desc">{currentSlide.desc}</p>

                    <ul className="slide-key-points">
                      {currentSlide.points.map((pt, i) => (
                        <li key={i}>
                          <span className="point-check">✓</span>
                          <span>{pt}</span>
                        </li>
                      ))}
                    </ul>

                    <Link href="/login?mode=signup" className="nav-btn-glow" style={{ display: 'inline-flex' }}>
                      Try {currentSlide.tab} Feature →
                    </Link>
                  </div>

                  {/* Right Column: Live Mockup Card */}
                  <div className="slide-mockup-card" style={{ textAlign: 'left' }}>
                    <div className="mockup-header-bar">
                      <span style={{ fontSize: '11px', fontWeight: 800, color: '#94a3b8' }}>
                        {currentSlide.mockup.tag}
                      </span>
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
                      <strong style={{ color: '#fff', fontSize: '12px' }}>Operational Activity Log</strong>
                      <span>{currentSlide.mockup.detail}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Slider Footer Controls */}
              <div className="slider-controls-footer">
                <span style={{ fontSize: '13px', color: '#64748b' }}>
                  {isPaused ? '⏸ Auto-rotation paused (hovering)' : '▶ Auto-advancing (hover to pause)'}
                </span>

                <div className="slider-nav-arrows">
                  <button
                    type="button"
                    className="arrow-circle-btn"
                    onClick={prevSlide}
                    aria-label="Previous slide"
                  >
                    ←
                  </button>
                  <button
                    type="button"
                    className="arrow-circle-btn"
                    onClick={nextSlide}
                    aria-label="Next slide"
                  >
                    →
                  </button>
                </div>
              </div>
            </div>
          </section>
        </div>
      </header>

      {/* Metrics Banner */}
      <section id="metrics" className="topnotch-section" style={{ padding: '60px 0', borderTop: '1px solid var(--border-glass)', borderBottom: '1px solid var(--border-glass)' }}>
        <div className="landing-container">
          <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', textAlign: 'center' }}>
            <div className="card" style={{ background: 'transparent', border: 'none', boxShadow: 'none' }}>
              <div className="stat" style={{ color: '#60a5fa', fontSize: '38px' }}>82%</div>
              <p className="muted" style={{ margin: '6px 0 0' }}>Faster Dispatch Allocation</p>
            </div>
            <div className="card" style={{ background: 'transparent', border: 'none', boxShadow: 'none' }}>
              <div className="stat" style={{ color: '#34d399', fontSize: '38px' }}>100%</div>
              <p className="muted" style={{ margin: '6px 0 0' }}>Offline Mobile Reliability</p>
            </div>
            <div className="card" style={{ background: 'transparent', border: 'none', boxShadow: 'none' }}>
              <div className="stat" style={{ color: '#818cf8', fontSize: '38px' }}>3.8x</div>
              <p className="muted" style={{ margin: '6px 0 0' }}>Accelerated Cash Flow</p>
            </div>
            <div className="card" style={{ background: 'transparent', border: 'none', boxShadow: 'none' }}>
              <div className="stat" style={{ color: '#f59e0b', fontSize: '38px' }}>99.9%</div>
              <p className="muted" style={{ margin: '6px 0 0' }}>SLA Uptime Performance</p>
            </div>
          </div>
        </div>
      </section>

      {/* Capability Cards Section */}
      <section id="features" className="topnotch-section">
        <div className="landing-container" style={{ textAlign: 'center' }}>
          <span className="section-tag-pill">Enterprise Capabilities</span>
          <h2 className="section-head-title">Engineered to Run High-Velocity Field Teams</h2>
          <p className="section-head-desc">
            Everything your operations, technicians, and finance teams require in one unified architecture.
          </p>

          <div className="glow-features-grid" style={{ textAlign: 'left' }}>
            <div className="glow-feature-card">
              <div className="feature-top-icon">📍</div>
              <h4>Intelligent Skill & Proximity Dispatch</h4>
              <p>
                Match incoming work orders instantly with certified technicians. Avoid excessive drive times and eliminate mismatched skill sets.
              </p>
            </div>

            <div className="glow-feature-card">
              <div className="feature-top-icon">📶</div>
              <h4>Offline-First Mobile Synchronization</h4>
              <p>
                Keep crews operating in dead zones. Diagnostic records, work notes, and statuses queue on-device and auto-sync without data loss.
              </p>
            </div>

            <div className="glow-feature-card">
              <div className="feature-top-icon">✍️</div>
              <h4>Customer Signature & Scope Approvals</h4>
              <p>
                Collect binding digital sign-offs directly on the field phone. If unexpected parts are needed, clients approve quotes in seconds.
              </p>
            </div>

            <div className="glow-feature-card">
              <div className="feature-top-icon">💳</div>
              <h4>Multi-Rail Digital Wallet System</h4>
              <p>
                Customers pre-fund accounts via bank transfer, card, or crypto. Completed invoices deduct effortlessly with full financial audit trails.
              </p>
            </div>

            <div className="glow-feature-card">
              <div className="feature-top-icon">📦</div>
              <h4>Live Truck & Warehouse Parts Ledger</h4>
              <p>
                Track parts consumed on every ticket in real-time. Automatically decrease inventory balances and monitor warranty coverage.
              </p>
            </div>

            <div className="glow-feature-card">
              <div className="feature-top-icon">🛡️</div>
              <h4>PostgreSQL Multi-Tenant RLS Security</h4>
              <p>
                Strict database Row-Level Security isolates company data. Technicians, managers, and customers only see what they are authorized to view.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Testimonial Slider */}
      <section id="testimonials" className="topnotch-section" style={{ background: 'rgba(15, 23, 42, 0.4)' }}>
        <div className="landing-container" style={{ textAlign: 'center' }}>
          <span className="section-tag-pill">Proven Results</span>
          <h2 className="section-head-title">Loved by Modern Field Operators</h2>

          <div className="testimonial-wrapper">
            <div className="quote-stars">★★★★★</div>
            <p className="testimonial-quote">"{currentTestimonial.quote}"</p>

            <div className="testimonial-author-box">
              <div className="author-avatar">{currentTestimonial.avatar}</div>
              <div className="author-details">
                <div className="author-name">{currentTestimonial.author}</div>
                <div className="author-title">{currentTestimonial.role}</div>
              </div>
            </div>

            <div className="testimonial-nav-arrows">
              <button
                type="button"
                className="arrow-circle-btn"
                onClick={prevTestimonial}
                aria-label="Previous testimonial"
              >
                ←
              </button>
              <button
                type="button"
                className="arrow-circle-btn"
                onClick={nextTestimonial}
                aria-label="Next testimonial"
              >
                →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Security & Architecture Highlights */}
      <section id="security" className="topnotch-section">
        <div className="landing-container">
          <div className="card" style={{ background: 'rgba(15, 23, 42, 0.7)', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '24px', padding: '48px 36px' }}>
            <span className="section-tag-pill">Security & Architecture</span>
            <h2 style={{ fontSize: '32px', margin: '14px 0 16px', color: '#fff' }}>Enterprise Row-Level Security (RLS)</h2>
            <p style={{ color: 'var(--text-muted)', maxWidth: '780px', fontSize: '16px', lineHeight: 1.7 }}>
              FieldOps 360 enforces multi-tenant organization boundaries directly at the PostgreSQL layer. Sensitive financial actions—like wallet balance deductions, inventory ledger movements, and warranty validations—run exclusively inside atomic database functions with role verification.
            </p>

            <div className="grid" style={{ marginTop: '36px', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
              <div style={{ borderLeft: '2px solid #3b82f6', paddingLeft: '16px' }}>
                <strong style={{ color: '#fff', fontSize: '16px', display: 'block' }}>Zero Cross-Tenant Leakage</strong>
                <span className="muted">Row-level isolation enforced on every query.</span>
              </div>
              <div style={{ borderLeft: '2px solid #10b981', paddingLeft: '16px' }}>
                <strong style={{ color: '#fff', fontSize: '16px', display: 'block' }}>Immutable Audit Ledgers</strong>
                <span className="muted">Every job change and transaction is append-only.</span>
              </div>
              <div style={{ borderLeft: '2px solid #818cf8', paddingLeft: '16px' }}>
                <strong style={{ color: '#fff', fontSize: '16px', display: 'block' }}>Offline Queue Resilience</strong>
                <span className="muted">Local change queue with clean sync reconciliation.</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Luxury Bottom CTA */}
      <section className="topnotch-cta-banner">
        <div className="landing-container">
          <div className="cta-glow-container">
            <h2>Ready to Modernize Your Field Operations?</h2>
            <p>
              Join commercial contractors, solar operators, and facility management teams driving peak efficiency with FieldOps 360.
            </p>

            <div className="hero-action-row" style={{ marginBottom: 0 }}>
              <Link href="/login?mode=signup" className="cta-mega-btn" style={{ background: '#fff', color: '#0f172a' }}>
                <span>Create Free Account Now</span>
                <span>→</span>
              </Link>
              <Link href="/login" className="cta-glass-btn" style={{ borderColor: 'rgba(255, 255, 255, 0.4)' }}>
                <span>Sign In to Portal</span>
                <span>⚡</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Luxury Footer */}
      <footer className="topnotch-footer">
        <div className="landing-container">
          <div className="footer-top-grid">
            <div>
              <div className="brand-group" style={{ marginBottom: '14px' }}>
                <div className="brand-icon-box">⚡</div>
                <span className="brand-name">FieldOps 360</span>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px', maxWidth: '340px', lineHeight: 1.6 }}>
                The high-performance field service operating system. Dispatching, offline mobile tooling, customer approvals, and ledger invoicing unified.
              </p>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#34d399', background: 'rgba(16, 185, 129, 0.1)', padding: '4px 12px', borderRadius: '99px', marginTop: '12px' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }}></span>
                <span>All Systems Operational</span>
              </div>
            </div>

            <div className="footer-col-nav">
              <div>
                <h5>Product</h5>
                <a href="#workflow">Live Platform</a>
                <a href="#features">Capabilities</a>
                <a href="#metrics">Performance</a>
                <a href="#security">Architecture</a>
              </div>

              <div>
                <h5>Access</h5>
                <Link href="/login">Customer Portal</Link>
                <Link href="/login">Technician Mobile</Link>
                <Link href="/login">Operations Console</Link>
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
            <div style={{ display: 'flex', gap: '16px' }}>
              <a href="#features" className="muted">Privacy Policy</a>
              <a href="#features" className="muted">Terms of Service</a>
              <a href="#security" className="muted">Security Posture</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
