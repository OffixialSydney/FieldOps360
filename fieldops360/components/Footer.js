'use client';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer style={{ background: '#0b1220', color: '#94a3b8', padding: '60px 24px 32px', borderTop: '1px solid #1e293b' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '40px', marginBottom: 48 }}>
        {/* Column 1: Company */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: 16 }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 16 }}>F</div>
            <span style={{ fontWeight: 800, fontSize: 18, color: '#ffffff', letterSpacing: '-0.02em' }}>FieldOps 360</span>
          </div>
          <p style={{ fontSize: 13.5, lineHeight: 1.6, color: '#64748b', margin: '0 0 16px' }}>
            Enterprise field service automation, live GPS technician dispatching, and intelligent work order operations across Nigeria.
          </p>
          <div style={{ display: 'flex', gap: 10 }}>
            {['X', 'in', 'fb', 'ig'].map((s) => (
              <span key={s} style={{ width: 32, height: 32, borderRadius: '50%', background: '#1e293b', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#cbd5e1' }}>
                {s}
              </span>
            ))}
          </div>
        </div>

        {/* Column 2: Customers */}
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#ffffff', marginBottom: 16 }}>
            Customers
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13.5 }}>
            <Link href="/login" style={{ color: '#94a3b8', textDecoration: 'none' }}>Book a Service</Link>
            <Link href="/track" style={{ color: '#94a3b8', textDecoration: 'none' }}>Track Work Order</Link>
            <Link href="/#estimate" style={{ color: '#94a3b8', textDecoration: 'none' }}>Free Cost Estimate</Link>
            <Link href="/#faq" style={{ color: '#94a3b8', textDecoration: 'none' }}>Customer FAQ</Link>
            <Link href="/dashboard" style={{ color: '#94a3b8', textDecoration: 'none' }}>Customer Portal</Link>
          </div>
        </div>

        {/* Column 3: Professionals */}
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#ffffff', marginBottom: 16 }}>
            Professionals
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13.5 }}>
            <Link href="/login" style={{ color: '#94a3b8', textDecoration: 'none' }}>Join as Technician</Link>
            <Link href="/login" style={{ color: '#94a3b8', textDecoration: 'none' }}>Register Company</Link>
            <Link href="/dashboard" style={{ color: '#94a3b8', textDecoration: 'none' }}>Dispatch Console</Link>
            <Link href="/dashboard" style={{ color: '#94a3b8', textDecoration: 'none' }}>Super Admin View</Link>
            <Link href="/wallet/topup" style={{ color: '#94a3b8', textDecoration: 'none' }}>Wallet Top Up</Link>
          </div>
        </div>

        {/* Column 4: Newsletter */}
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#ffffff', marginBottom: 16 }}>
            Subscribe
          </div>
          <p style={{ fontSize: 13.5, lineHeight: 1.6, color: '#64748b', margin: '0 0 14px' }}>
            Receive operational product updates, verified vendor alerts, and enterprise insights.
          </p>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              type="email"
              placeholder="Your email address"
              style={{ background: '#1e293b', border: '1px solid #334155', color: '#ffffff', borderRadius: 9999, padding: '10px 16px', fontSize: 13, width: '100%' }}
            />
            <button type="button" style={{ borderRadius: 9999, padding: '10px 18px', fontSize: 13, fontWeight: 700, margin: 0, whiteSpace: 'nowrap' }}>
              Join
            </button>
          </div>
        </div>
      </div>

      {/* Copyright row */}
      <div style={{ maxWidth: 1200, margin: '0 auto', paddingTop: 24, borderTop: '1px solid #1e293b', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 16, fontSize: 12.5, color: '#64748b' }}>
        <div>(c) 2026 FieldOps 360 Technologies. All rights reserved.</div>
        <div style={{ display: 'flex', gap: 20 }}>
          <a href="#" style={{ color: '#64748b', textDecoration: 'none' }}>Privacy Policy</a>
          <a href="#" style={{ color: '#64748b', textDecoration: 'none' }}>Terms of Service</a>
          <a href="#" style={{ color: '#64748b', textDecoration: 'none' }}>Security</a>
        </div>
        <button
          type="button"
          onClick={() => { if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' }); }}
          style={{ width: 34, height: 34, borderRadius: '50%', background: '#1e293b', color: '#cbd5e1', border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: 0, margin: 0 }}
        >
          ^
        </button>
      </div>
    </footer>
  );
}
