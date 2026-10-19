'use client';
import { useState } from 'react';
import Link from 'next/link';

const FooterIcons = {
  Logo: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <polygon points="12 2 15 8 22 9 17 14 18 21 12 17 6 21 7 14 2 9 9 8 12 2" />
    </svg>
  ),
  Mail: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1-0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  ),
  ChevronUp: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="18 15 12 9 6 15" />
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

export default function Footer() {
  const [subscribeEmail, setSubscribeEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (subscribeEmail.trim()) {
      setSubscribed(true);
      setTimeout(() => setSubscribed(false), 4000);
      setSubscribeEmail('');
    }
  };

  const scrollToTop = () => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <footer style={{ borderTop: '1px solid #1e293b', padding: '64px 24px 36px', background: '#0b1220', color: '#94a3b8', marginTop: 'auto' }}>
      <div style={{ maxWidth: 1140, margin: '0 auto' }}>
        
        {/* 4 Columns (Company, Customers, Professionals, Subscribe) */}
        <div className="footer-4col-grid">
          
          {/* Column 1: Company */}
          <div>
            <h4 style={{ fontSize: 18, fontWeight: 700, color: '#ffffff', margin: '0 0 18px', letterSpacing: '-0.01em', lineHeight: 1.2 }}>Company</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 14 }}>
              <li>
                <Link href="/dashboard" className="footer-link-item">
                  <span style={{ color: '#475569', fontSize: 14, lineHeight: 1 }}>•</span>
                  <span>Help Center</span>
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="footer-link-item">
                  <span style={{ color: '#475569', fontSize: 14, lineHeight: 1 }}>•</span>
                  <span>Contact</span>
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="footer-link-item">
                  <span style={{ color: '#475569', fontSize: 14, lineHeight: 1 }}>•</span>
                  <span>About Us</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2: Customers */}
          <div>
            <h4 style={{ fontSize: 18, fontWeight: 700, color: '#ffffff', margin: '0 0 18px', letterSpacing: '-0.01em', lineHeight: 1.2 }}>Customers</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 14 }}>
              <li>
                <Link href="/#estimates" className="footer-link-item">
                  <span style={{ color: '#475569', fontSize: 14, lineHeight: 1 }}>•</span>
                  <span>Cost Estimates</span>
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="footer-link-item">
                  <span style={{ color: '#475569', fontSize: 14, lineHeight: 1 }}>•</span>
                  <span>Customer Safety Tips</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Professionals */}
          <div>
            <h4 style={{ fontSize: 18, fontWeight: 700, color: '#ffffff', margin: '0 0 18px', letterSpacing: '-0.01em', lineHeight: 1.2 }}>Professionals</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 14 }}>
              <li>
                <Link href="/dashboard" className="footer-link-item">
                  <span style={{ color: '#475569', fontSize: 14, lineHeight: 1 }}>•</span>
                  <span>Help Center</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Subscribe */}
          <div>
            <h4 style={{ fontSize: 18, fontWeight: 700, color: '#ffffff', margin: '0 0 18px', letterSpacing: '-0.01em', lineHeight: 1.2 }}>Subscribe</h4>
            <p style={{ fontSize: 14.5, color: '#94a3b8', lineHeight: 1.5, margin: '0 0 16px' }}>
              Stay updated with the latest news and offers!
            </p>
            <form onSubmit={handleSubscribe} style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'flex-start', width: '100%' }}>
              <input
                type="email"
                required
                placeholder="Enter your email address"
                value={subscribeEmail}
                onChange={(e) => setSubscribeEmail(e.target.value)}
                style={{
                  width: '100%',
                  maxWidth: 240,
                  padding: '11px 18px',
                  borderRadius: 9999,
                  border: '1.5px solid #334155',
                  fontSize: 14,
                  outline: 'none',
                  boxSizing: 'border-box',
                  color: '#ffffff',
                  background: '#1e293b',
                }}
              />
              <button
                type="submit"
                style={{
                  padding: '10px 24px',
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
                <FooterIcons.Mail />
                <span>{subscribed ? 'Subscribed!' : 'Subscribe'}</span>
              </button>
            </form>
          </div>

        </div>

        {/* Bottom Row: Logo, Copyright & Social Circles */}
        <div className="footer-bottom-row" style={{ marginTop: 44, paddingTop: 24, borderTop: '1px solid #1e293b', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 20 }}>
          
          {/* Left: Logo & Legal Links */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: 9, background: '#1a6dff', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FooterIcons.Logo />
              </div>
              <span style={{ fontSize: 24, fontWeight: 800, color: '#ffffff', letterSpacing: '-0.03em' }}>FieldOps 360</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 13, color: '#64748b', flexWrap: 'wrap' }}>
              <span>(c) 2026 FieldOps 360</span>
              <span>|</span>
              <Link href="/dashboard" style={{ color: '#64748b', textDecoration: 'none' }}>Terms of Service</Link>
              <span>|</span>
              <Link href="/dashboard" style={{ color: '#64748b', textDecoration: 'none' }}>Privacy Policy</Link>
            </div>
          </div>

          {/* Right: Circular Social Media Icons + Blue Scroll Button */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ display: 'flex', gap: 10 }}>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" style={{ width: 38, height: 38, borderRadius: '50%', border: '1px solid #334155', background: '#1e293b', color: '#cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center' }} aria-label="Twitter">
                <FooterIcons.Twitter />
              </a>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" style={{ width: 38, height: 38, borderRadius: '50%', border: '1px solid #334155', background: '#1e293b', color: '#cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center' }} aria-label="Facebook">
                <FooterIcons.Facebook />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" style={{ width: 38, height: 38, borderRadius: '50%', border: '1px solid #334155', background: '#1e293b', color: '#cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center' }} aria-label="Instagram">
                <FooterIcons.Instagram />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" style={{ width: 38, height: 38, borderRadius: '50%', border: '1px solid #334155', background: '#1e293b', color: '#cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center' }} aria-label="LinkedIn">
                <FooterIcons.Linkedin />
              </a>
            </div>

            {/* Circular Scroll-to-top Button */}
            <button
              type="button"
              onClick={scrollToTop}
              style={{ width: 40, height: 40, borderRadius: '50%', background: '#1a6dff', color: '#ffffff', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', margin: 0, boxShadow: '0 4px 12px rgba(26, 109, 255, 0.35)' }}
              aria-label="Scroll to top"
            >
              <FooterIcons.ChevronUp />
            </button>
          </div>

        </div>

      </div>
    </footer>
  );
}
