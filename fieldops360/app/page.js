'use client';
import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="landing-page">
      {/* Navigation Header */}
      <header className="landing-header">
        <div className="landing-container landing-nav-container">
          <Link href="/" className="landing-logo">
            <span className="logo-icon">⚡</span>
            <span className="logo-text">FieldOps <span className="logo-accent">360</span></span>
            <span className="logo-pill">Platform</span>
          </Link>

          <nav className="landing-nav-links">
            <a href="#features">Features</a>
            <a href="#how-it-works">How It Works</a>
            <a href="#roles">Solutions</a>
            <a href="#security">Security</a>
            <a href="#faq">FAQ</a>
          </nav>

          <div className="landing-nav-actions">
            <Link href="/login" className="btn-ghost">
              Log In
            </Link>
            <Link href="/login?mode=signup" className="btn-primary">
              Get Started Free
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="landing-hero">
        <div className="landing-container">
          <div className="hero-badge">
            <span className="badge-pulse"></span>
            Next-Gen Field Service Management
          </div>

          <h1 className="hero-title">
            Dispatch Smarter. Empower Field Crews.{' '}
            <span className="gradient-text">Accelerate Revenue.</span>
          </h1>

          <p className="hero-description">
            The all-in-one platform unifying real-time technician dispatch, offline-first mobile workflows, 
            customer approvals, multi-rail digital wallet payments, and automated inventory control.
          </p>

          <div className="hero-cta-group">
            <Link href="/login?mode=signup" className="hero-btn-primary">
              Start Free Trial →
            </Link>
            <Link href="/login" className="hero-btn-secondary">
              Sign In to Portal
            </Link>
          </div>

          <div className="hero-proof">
            <div className="proof-item">
              <span className="proof-check">✓</span>
              <span>100% Offline-Capable Mobile Tools</span>
            </div>
            <div className="proof-item">
              <span className="proof-check">✓</span>
              <span>PostgreSQL Multi-Tenant Security</span>
            </div>
            <div className="proof-item">
              <span className="proof-check">✓</span>
              <span>Instant Digital Invoicing & Sign-Off</span>
            </div>
          </div>

          {/* Interactive UI Showcase / Command Center Mockup */}
          <div className="hero-showcase-wrapper">
            <div className="showcase-window">
              <div className="showcase-titlebar">
                <div className="window-dots">
                  <span className="dot red"></span>
                  <span className="dot yellow"></span>
                  <span className="dot green"></span>
                </div>
                <div className="window-title">FieldOps 360 — Live Operations Command Center</div>
                <div className="window-tag">Live Sync Active</div>
              </div>

              <div className="showcase-body">
                {/* Showcase Metrics */}
                <div className="showcase-stats">
                  <div className="stat-card">
                    <span className="stat-label">Active Work Orders</span>
                    <span className="stat-value">28</span>
                    <span className="stat-sub positive">↑ 12 completed today</span>
                  </div>
                  <div className="stat-card">
                    <span className="stat-label">Technicians On Field</span>
                    <span className="stat-value">14 / 16</span>
                    <span className="stat-sub">94% Utilization</span>
                  </div>
                  <div className="stat-card">
                    <span className="stat-label">Avg. Resolution Time</span>
                    <span className="stat-value">48m</span>
                    <span className="stat-sub positive">↓ 32% faster dispatch</span>
                  </div>
                  <div className="stat-card">
                    <span className="stat-label">Digital Wallet Volume</span>
                    <span className="stat-value">$24,850</span>
                    <span className="stat-sub">Automated Settlement</span>
                  </div>
                </div>

                {/* Live Job Feed Preview */}
                <div className="showcase-job-card">
                  <div className="job-card-header">
                    <div className="job-id-badge">JOB #REQ-2048</div>
                    <span className="job-status-pill in-progress">● Technician On-Site</span>
                    <span className="job-warranty-pill">Warranty Active</span>
                  </div>

                  <div className="job-card-content">
                    <div className="job-detail">
                      <div className="detail-title">Service Type</div>
                      <div className="detail-val">Commercial HVAC Diagnostic & Valve Overhaul</div>
                    </div>
                    <div className="job-detail">
                      <div className="detail-title">Assigned Field Specialist</div>
                      <div className="detail-val">David K. (Senior Certified Tech)</div>
                    </div>
                    <div className="job-detail">
                      <div className="detail-title">Customer</div>
                      <div className="detail-val">Highline Medical Center</div>
                    </div>
                  </div>

                  <div className="job-card-footer">
                    <span className="footer-step">✓ Diagnosis Recorded</span>
                    <span className="footer-step">✓ Before/After Photos Attached</span>
                    <span className="footer-step pending">⏳ Digital Customer Signature Pending</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section id="features" className="landing-section">
        <div className="landing-container">
          <div className="section-header">
            <span className="section-pill">Platform Capabilities</span>
            <h2 className="section-title">Everything Needed to Run Field Operations at Scale</h2>
            <p className="section-subtitle">
              Engineered from the ground up for field teams, service contractors, dispatch managers, and enterprise facilities.
            </p>
          </div>

          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🎯</div>
              <h3>Intelligent Dispatch & Scheduling</h3>
              <p>
                Allocate incoming service tickets to the most qualified available technician by skill level, 
                proximity, and parts availability.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">📶</div>
              <h3>Offline-First Mobile Capability</h3>
              <p>
                Technicians stay completely productive even in basements and remote dead zones. Work notes and status 
                changes queue offline and auto-sync immediately upon reconnection.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">✍️</div>
              <h3>Digital Signatures & Approvals</h3>
              <p>
                Capture binding client sign-offs directly on glass. If additional parts or repairs are diagnosed, 
                customers can approve new quotes in seconds right from their portal.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">💳</div>
              <h3>Multi-Rail Wallet & Invoicing</h3>
              <p>
                Generate itemized invoices automatically upon work completion. Customers can pay via instant digital wallet, 
                credit card, bank transfers, or cryptocurrency with automated audit trails.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">📦</div>
              <h3>Live Inventory & Parts Ledger</h3>
              <p>
                Keep truck inventory and warehouse stock tightly aligned. Every part consumed on a work order decreases 
                ledger quantities with serial number and warranty tracking.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🛡️</div>
              <h3>Row-Level Security Architecture</h3>
              <p>
                Enterprise data isolation powered by PostgreSQL RLS. Protect customer privacy, restrict technician 
                visibility to their assigned jobs, and maintain full compliance audit logs.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="landing-section bg-alt">
        <div className="landing-container">
          <div className="section-header">
            <span className="section-pill">Seamless Lifecycle</span>
            <h2 className="section-title">How FieldOps 360 Powers Every Job</h2>
            <p className="section-subtitle">
              From the initial client request to final sign-off and payment reconciliation.
            </p>
          </div>

          <div className="steps-grid">
            <div className="step-card">
              <div className="step-number">01</div>
              <h3>Request & Dispatch</h3>
              <p>
                Customer submits a service order. FieldOps 360 automatically checks asset warranty status and recommends 
                the ideal technician for dispatch.
              </p>
            </div>

            <div className="step-card">
              <div className="step-number">02</div>
              <h3>Field Execution</h3>
              <p>
                Technician accepts the job, travels on-site, logs diagnostic photos, attaches inventory parts, and captures 
                client signature on mobile.
              </p>
            </div>

            <div className="step-card">
              <div className="step-number">03</div>
              <h3>Instant Invoice & Settlement</h3>
              <p>
                Job is marked complete, inventory ledgers decrease, and an itemized invoice is generated and paid seamlessly 
                via the customer wallet or card.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Solutions by Role Section */}
      <section id="roles" className="landing-section">
        <div className="landing-container">
          <div className="section-header">
            <span className="section-pill">Role-Based Workspaces</span>
            <h2 className="section-title">Built Specifically for Every Team Member</h2>
            <p className="section-subtitle">
              No cluttered menus or unnecessary complexity. Tailored views designed for focused productivity.
            </p>
          </div>

          <div className="roles-grid">
            <div className="role-card">
              <div className="role-header">
                <span className="role-badge">Field Crew</span>
                <h3>Technicians</h3>
              </div>
              <ul className="role-list">
                <li>Turn-by-turn job routing and contact details</li>
                <li>Offline diagnostic notes and status triggers</li>
                <li>Before and after photo upload gallery</li>
                <li>Digital touch signature collection</li>
              </ul>
            </div>

            <div className="role-card">
              <div className="role-header">
                <span className="role-badge">Control Room</span>
                <h3>Operations Managers</h3>
              </div>
              <ul className="role-list">
                <li>Live dispatch board with technician allocation</li>
                <li>SLA tracking and automated warranty verification</li>
                <li>Inventory replenishment alerts and stock levels</li>
                <li>Complete operational audit log of every change</li>
              </ul>
            </div>

            <div className="role-card">
              <div className="role-header">
                <span className="role-badge">Finance Hub</span>
                <h3>Accountants</h3>
              </div>
              <ul className="role-list">
                <li>Automated invoice generation from completed jobs</li>
                <li>Digital wallet deposit approvals and proof verification</li>
                <li>Material and labor cost reconciliation</li>
                <li>Printable and downloadable PDF statements</li>
              </ul>
            </div>

            <div className="role-card">
              <div className="role-header">
                <span className="role-badge">Self-Service</span>
                <h3>Customers & Clients</h3>
              </div>
              <ul className="role-list">
                <li>Instant service request booking with photo uploads</li>
                <li>Live technician ETA and arrival notifications</li>
                <li>One-click approval for additional parts or scope</li>
                <li>Pre-funded digital wallet and receipt download</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Security & Architecture Highlights */}
      <section id="security" className="landing-section bg-alt">
        <div className="landing-container">
          <div className="security-banner">
            <div className="security-content">
              <span className="section-pill">Enterprise Grade</span>
              <h2>Bank-Grade Data Isolation & Auditability</h2>
              <p>
                Every transaction, status transition, and technician assignment is secured using PostgreSQL 
                Row-Level Security (RLS). Sensitive financial ledger actions are strictly handled inside isolated 
                database functions with role checks.
              </p>
              <div className="security-stats">
                <div className="sec-stat">
                  <strong>Multi-Tenant RLS</strong>
                  <span>Zero cross-company data leakage</span>
                </div>
                <div className="sec-stat">
                  <strong>Append-Only Ledgers</strong>
                  <span>Immutable financial & inventory audit logs</span>
                </div>
                <div className="sec-stat">
                  <strong>Encrypted Storage</strong>
                  <span>Private buckets for sensitive job documentation</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Frequently Asked Questions */}
      <section id="faq" className="landing-section">
        <div className="landing-container">
          <div className="section-header">
            <span className="section-pill">Got Questions?</span>
            <h2 className="section-title">Frequently Asked Questions</h2>
          </div>

          <div className="faq-grid">
            <div className="faq-item">
              <h4>What happens when technicians lose internet connection in the field?</h4>
              <p>
                FieldOps 360 is built with offline resilience. Technicians can view previously loaded jobs, record 
                diagnostic notes, and toggle status changes completely offline. All actions are safely queued locally 
                and synchronized automatically once back online.
              </p>
            </div>

            <div className="faq-item">
              <h4>How does the multi-rail wallet and payment system work?</h4>
              <p>
                Customers can fund their account wallet using bank transfers, payment cards, or crypto assets. Invoices 
                can then be settled directly from this wallet or paid individually upon job completion.
              </p>
            </div>

            <div className="faq-item">
              <h4>Can we manage multiple service companies or branches?</h4>
              <p>
                Yes. FieldOps 360 natively supports multi-organization isolation. Technicians and managers only have access 
                to jobs and assets under their designated company.
              </p>
            </div>

            <div className="faq-item">
              <h4>How do customers approve extra charges or unexpected repairs?</h4>
              <p>
                When a technician discovers additional required parts or labor on-site, they submit a diagnosis directly 
                from their device. The customer receives an immediate prompt on their portal to approve or decline before 
                work proceeds.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="landing-cta-banner">
        <div className="landing-container">
          <div className="cta-box">
            <h2>Ready to Elevate Your Field Operations?</h2>
            <p>
              Join teams delivering faster dispatching, higher first-time fix rates, and frictionless billing with FieldOps 360.
            </p>
            <div className="hero-cta-group" style={{ justifyContent: 'center' }}>
              <Link href="/login?mode=signup" className="hero-btn-primary">
                Create Free Account Now →
              </Link>
              <Link href="/login" className="hero-btn-secondary" style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.3)' }}>
                Sign In to Portal
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="landing-container footer-content">
          <div className="footer-brand">
            <div className="landing-logo">
              <span className="logo-icon">⚡</span>
              <span className="logo-text">FieldOps <span className="logo-accent">360</span></span>
            </div>
            <p className="footer-desc">
              Next-generation field service management software. Dispatch, mobile execution, invoicing, and inventory unified.
            </p>
            <div className="system-status">
              <span className="status-dot"></span> All Systems Operational
            </div>
          </div>

          <div className="footer-links-group">
            <div className="footer-col">
              <h5>Product</h5>
              <a href="#features">Features</a>
              <a href="#how-it-works">How It Works</a>
              <a href="#roles">Solutions</a>
              <a href="#security">Security</a>
            </div>

            <div className="footer-col">
              <h5>Access</h5>
              <Link href="/login">Customer Login</Link>
              <Link href="/login">Technician Portal</Link>
              <Link href="/login">Manager Console</Link>
              <Link href="/login?mode=signup">New Account</Link>
            </div>

            <div className="footer-col">
              <h5>Platform</h5>
              <a href="#faq">FAQ</a>
              <Link href="/reset">Reset Password</Link>
              <a href="#security">Privacy & Architecture</a>
            </div>
          </div>
        </div>

        <div className="landing-container footer-bottom">
          <p>© {new Date().getFullYear()} FieldOps 360. All rights reserved.</p>
          <div className="footer-bottom-links">
            <a href="#features">Privacy Policy</a>
            <span>•</span>
            <a href="#features">Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
