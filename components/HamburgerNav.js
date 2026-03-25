import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  Menu, X, Home, User, LayoutDashboard, Wrench,
  Briefcase, ShoppingBag, Globe, LogOut, ExternalLink,
  ChevronRight
} from 'lucide-react';

const EXTERNAL_LINKS = [
  { label: 'danzTech Home', icon: Globe, href: 'https://danztech.vercel.app/home.html' },
  { label: 'Portofolio', icon: Briefcase, href: 'https://danztech.vercel.app/portofolio.html' },
  { label: 'Store', icon: ShoppingBag, href: 'https://danztech.vercel.app/store.html' },
];

const INTERNAL_LINKS = [
  { label: 'Home', icon: Home, href: '/' },
  { label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
  { label: 'Tools', icon: Wrench, href: '/tools' },
  { label: 'Profil', icon: User, href: '/profile' },
];

export default function HamburgerNav({ user }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  // Close on route change
  useEffect(() => { setOpen(false); }, [router.pathname]);
  // Prevent body scroll when open
  useEffect(() => { document.body.style.overflow = open ? 'hidden' : ''; return () => { document.body.style.overflow = ''; }; }, [open]);

  function close() { setOpen(false); }

  async function handleLogout() {
    close();
    await fetch('/api/logout', { method: 'POST' });
    router.push('/welcome');
  }

  const itemStyle = (active) => ({
    display: 'flex', alignItems: 'center', gap: 12,
    padding: '11px 14px', borderRadius: 12, width: '100%',
    background: active ? 'var(--surface2)' : 'none',
    border: 'none', cursor: 'pointer', textAlign: 'left',
    fontSize: '0.88rem', fontWeight: 600,
    color: active ? 'var(--blue)' : 'var(--text2)',
    fontFamily: 'Plus Jakarta Sans, sans-serif',
    transition: 'background 0.15s, color 0.15s',
  });

  return (
    <>
      <button className="hamburger-btn" onClick={() => setOpen(p => !p)} aria-label="Menu" aria-expanded={open}>
        <Menu size={20} />
      </button>

      {/* Overlay */}
      <div
        onClick={close}
        style={{
          position: 'fixed', inset: 0, zIndex: 299,
          background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)',
          opacity: open ? 1 : 0, pointerEvents: open ? 'all' : 'none',
          transition: 'opacity 0.25s',
        }}
      />

      {/* Drawer */}
      <div style={{
        position: 'fixed', top: 0, bottom: 0, right: 0,
        width: 280, zIndex: 300,
        background: 'var(--surface)',
        borderLeft: '1px solid var(--border)',
        boxShadow: '-12px 0 40px rgba(0,0,0,0.25)',
        display: 'flex', flexDirection: 'column',
        transform: open ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 0.3s cubic-bezier(0.4,0,0.2,1)',
      }}>
        {/* Header */}
        <div style={{ padding: '20px 16px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text)' }}>MDWA Cloud</div>
            {user && <div style={{ fontSize: '0.72rem', color: 'var(--text3)', marginTop: 2 }}>@{user.username}</div>}
          </div>
          <button onClick={close} style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text2)', display: 'flex', padding: 6, borderRadius: 8 }}>
            <X size={20} />
          </button>
        </div>

        {/* Nav content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 10px' }}>
          {/* Internal pages */}
          <div style={{ fontSize: '0.62rem', color: 'var(--text3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', padding: '4px 8px 8px' }}>Navigasi</div>
          {INTERNAL_LINKS.map(({ label, icon: Icon, href }) => {
            const active = router.pathname === href;
            return (
              <button key={href} onClick={() => { close(); router.push(href); }} style={itemStyle(active)}>
                <Icon size={17} />
                {label}
                {active && <ChevronRight size={14} style={{ marginLeft: 'auto', opacity: 0.5 }} />}
              </button>
            );
          })}

          <div style={{ height: 1, background: 'var(--border)', margin: '12px 8px' }} />

          {/* External links */}
          <div style={{ fontSize: '0.62rem', color: 'var(--text3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', padding: '4px 8px 8px' }}>danzTech</div>
          {EXTERNAL_LINKS.map(({ label, icon: Icon, href }) => (
            <a key={href} href={href} target="_blank" rel="noopener noreferrer" onClick={close} style={{ ...itemStyle(false), textDecoration: 'none' }}>
              <Icon size={17} />
              {label}
              <ExternalLink size={12} style={{ marginLeft: 'auto', opacity: 0.35 }} />
            </a>
          ))}
        </div>

        {/* Footer: logout */}
        {user && (
          <div style={{ padding: '12px 10px', borderTop: '1px solid var(--border)' }}>
            <button onClick={handleLogout} style={{ ...itemStyle(false), color: 'var(--red,#ef4444)' }}>
              <LogOut size={17} />
              Keluar
            </button>
          </div>
        )}
      </div>
    </>
  );
}
