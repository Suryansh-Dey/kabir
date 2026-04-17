'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

const navItems = [
  { href: '/', label: 'डैशबोर्ड', labelEn: 'Dashboard', icon: '📊' },
  { href: '/khadan', label: 'खदान गाड़ी', labelEn: 'Khadan Trucks', icon: '🚚' },
  { href: '/local', label: 'लोकल गाड़ी', labelEn: 'Local Trucks', icon: '🚛' },
  { href: '/loaders', label: 'लोडर', labelEn: 'Loaders', icon: '🏗️' },
  { href: '/stock', label: 'स्टॉक', labelEn: 'Stock', icon: '📦' },
  { href: '/loans', label: 'लोन / EMI', labelEn: 'Loans', icon: '💳' },
  { href: '/reports', label: 'रिपोर्ट', labelEn: 'Reports', icon: '📈' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  return (
    <div>
      {/* Mobile Header */}
      <div className="mobile-header">
        <button
          onClick={() => setSidebarOpen(true)}
          style={{ background: 'none', border: 'none', color: 'var(--text-primary)', fontSize: '1.5rem', cursor: 'pointer' }}
        >
          ☰
        </button>
        <span style={{ fontWeight: 600 }}>🚛 Kabir Transport</span>
        <div style={{ width: 32 }} />
      </div>

      {/* Overlay */}
      <div className={`overlay ${sidebarOpen ? 'open' : ''}`} onClick={() => setSidebarOpen(false)} />

      {/* Sidebar */}
      <nav className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <span style={{ fontSize: '1.5rem' }}>🚛</span>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Kabir Transport</h2>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
            रेती कारोबार हिसाब-किताब
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`sidebar-link ${pathname === item.href ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              <span>{item.icon}</span>
              <div>
                <div>{item.label}</div>
                <div style={{ fontSize: '0.7rem', opacity: 0.7 }}>{item.labelEn}</div>
              </div>
            </Link>
          ))}
        </div>

        <div style={{ marginTop: 'auto', paddingTop: '2rem', position: 'absolute', bottom: '1.5rem', left: '1.25rem', right: '1.25rem' }}>
          <button
            onClick={handleLogout}
            className="btn btn-outline"
            style={{ width: '100%', justifyContent: 'center' }}
          >
            🚪 लॉगआउट
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="main-content">
        <div className="animate-in">
          {children}
        </div>
      </main>
    </div>
  );
}
