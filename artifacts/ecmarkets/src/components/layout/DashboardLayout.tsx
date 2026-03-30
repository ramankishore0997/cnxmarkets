import { ReactNode, useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  LineChart,
  ArrowDownUp,
  Wallet,
  User,
  LogOut,
  Menu,
  ShieldCheck,
  X,
  ShieldAlert,
  History,
  TrendingUp,
  ChevronRight,
  MoreHorizontal,
  Bell,
  Search,
} from 'lucide-react';
import { EcmLogo, BrandLogo } from '@/components/shared/EcmLogo';
import { useAuthState } from '@/hooks/use-auth-state';

const navItems = [
  { name: 'Overview',       href: '/dashboard',              icon: LayoutDashboard },
  { name: 'Crypto Trading', href: '/dashboard/binary',       icon: TrendingUp, highlight: true },
  { name: 'Analytics',     href: '/dashboard/analytics',    icon: LineChart },
  { name: 'Trade History', href: '/dashboard/trades',       icon: History },
  { name: 'Deposit',       href: '/dashboard/deposit',      icon: Wallet },
  { name: 'Withdraw',      href: '/dashboard/withdraw',     icon: ArrowDownUp },
  { name: 'KYC & Security',href: '/dashboard/kyc',          icon: ShieldCheck },
  { name: 'Profile',       href: '/dashboard/profile',      icon: User },
];

const bottomNavItems = [
  { name: 'Home',    href: '/dashboard',         icon: LayoutDashboard },
  { name: 'Crypto',  href: '/dashboard/binary',  icon: TrendingUp, highlight: true },
  { name: 'Deposit', href: '/dashboard/deposit', icon: Wallet },
  { name: 'Profile', href: '/dashboard/profile', icon: User },
];

// ── Animated mini chart bars ──────────────────────────────────────────────────
const BAR_HEIGHTS = [18, 28, 22, 35, 25, 40, 30, 38, 20, 45, 28, 36];
function MiniChart() {
  const [bars, setBars] = useState(BAR_HEIGHTS);
  useEffect(() => {
    const id = setInterval(() => {
      setBars(prev => {
        const next = [...prev.slice(1), Math.floor(Math.random() * 30) + 15];
        return next;
      });
    }, 900);
    return () => clearInterval(id);
  }, []);

  return (
    <div style={{
      display: 'flex', alignItems: 'flex-end', gap: 3, height: 46,
      padding: '8px 12px 0',
    }}>
      {bars.map((h, i) => (
        <div
          key={i}
          style={{
            flex: 1,
            height: h,
            borderRadius: 3,
            background: i >= bars.length - 3
              ? 'rgba(96,192,240,0.9)'
              : 'rgba(255,255,255,0.15)',
            transition: 'height 0.7s ease',
          }}
        />
      ))}
    </div>
  );
}

function UserAvatar({ firstName, lastName, photo, size = 'md' }: { firstName?: string; lastName?: string; photo?: string | null; size?: 'sm' | 'md' | 'lg' }) {
  const initials = `${firstName?.[0] || 'U'}${lastName?.[0] || ''}`.toUpperCase();
  const dim = size === 'lg' ? 48 : size === 'sm' ? 32 : 40;
  const font = size === 'lg' ? 16 : size === 'sm' ? 11 : 13;
  if (photo) {
    return (
      <div style={{ width: dim, height: dim, borderRadius: '50%', overflow: 'hidden', border: '2px solid rgba(96,192,240,0.4)', flexShrink: 0 }}>
        <img src={photo} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>
    );
  }
  return (
    <div style={{
      width: dim, height: dim, borderRadius: '50%', display: 'flex', alignItems: 'center',
      justifyContent: 'center', fontWeight: 900, color: '#fff', flexShrink: 0, fontSize: font,
      background: 'linear-gradient(135deg, #1F77B4 0%, #155D8B 100%)',
      border: '2px solid rgba(96,192,240,0.3)',
    }}>
      {initials}
    </div>
  );
}

function KycBadge({ status }: { status?: string }) {
  const approved = status === 'approved';
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 10px',
      borderRadius: 999, fontSize: 9, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em',
      background: approved ? 'rgba(22,163,74,0.2)' : 'rgba(255,193,7,0.2)',
      color: approved ? '#16A34A' : '#F59E0B',
      border: `1px solid ${approved ? 'rgba(22,163,74,0.4)' : 'rgba(245,158,11,0.4)'}`,
    }}>
      <span style={{
        width: 5, height: 5, borderRadius: '50%',
        background: approved ? '#16A34A' : '#F59E0B',
        animation: approved ? 'none' : 'pulse 1.5s infinite',
      }} />
      {approved ? 'KYC Verified' : 'KYC Pending'}
    </span>
  );
}

function NavItem({ item, isActive, onClose }: { item: typeof navItems[0]; isActive: boolean; onClose: () => void }) {
  const Icon = item.icon;
  const isHighlight = (item as any).highlight;
  return (
    <Link
      href={item.href}
      onClick={onClose}
      style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '9px 12px',
        borderRadius: 12, margin: '1px 6px',
        background: isActive
          ? 'rgba(255,255,255,0.14)'
          : 'transparent',
        borderLeft: isActive ? '3px solid #fff' : '3px solid transparent',
        color: isActive ? '#FFFFFF' : isHighlight ? '#60C0F0' : 'rgba(234,242,248,0.72)',
        fontSize: 13, fontWeight: 600,
        textDecoration: 'none',
        transition: 'all 0.18s ease',
        cursor: 'pointer',
        position: 'relative',
      }}
    >
      <Icon size={16} style={{
        color: isActive ? '#FFFFFF' : isHighlight ? '#60C0F0' : 'rgba(234,242,248,0.55)',
        flexShrink: 0,
      }} />
      <span style={{ flex: 1 }}>{item.name}</span>
      {isHighlight && !isActive && (
        <span style={{
          fontSize: 8, fontWeight: 900, padding: '2px 6px', borderRadius: 999,
          background: '#1F77B4', color: '#fff', letterSpacing: '0.08em',
        }}>LIVE</span>
      )}
      {isActive && <ChevronRight size={12} style={{ color: 'rgba(255,255,255,0.45)', flexShrink: 0 }} />}
    </Link>
  );
}

function SidebarContent({ onClose, user, logout, location }: any) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative', overflow: 'hidden' }}>

      {/* Decorative background glows */}
      <div style={{
        position: 'absolute', top: -60, left: -60, width: 200, height: 200,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(31,119,180,0.22) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: 80, right: -40, width: 160, height: 160,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(22,163,74,0.12) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', top: '45%', left: -20, width: 120, height: 120,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(96,192,240,0.08) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Logo */}
      <div style={{ padding: '18px 18px 14px', borderBottom: '1px solid rgba(255,255,255,0.08)', position: 'relative', zIndex: 1 }}>
        <Link href="/" style={{ textDecoration: 'none' }}>
          <BrandLogo theme="dark" size="md" />
        </Link>
      </div>

      {/* User section */}
      <div style={{ padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)', position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
          <UserAvatar firstName={user?.firstName} lastName={user?.lastName} photo={(user as any)?.profilePhoto} size="lg" />
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 13, fontWeight: 800, color: '#fff', margin: 0, lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.firstName || 'Trader'} {user?.lastName || ''}
            </p>
            <p style={{ fontSize: 10.5, color: 'rgba(234,242,248,0.5)', margin: '2px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.email || ''}
            </p>
          </div>
        </div>
        <KycBadge status={user?.kycStatus} />

        {/* Animated mini chart */}
        <div style={{
          marginTop: 12, borderRadius: 12,
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.08)',
          overflow: 'hidden',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px 0' }}>
            <span style={{ fontSize: 9, fontWeight: 700, color: 'rgba(234,242,248,0.45)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Live Activity</span>
            <span style={{ fontSize: 9, fontWeight: 800, color: '#60C0F0' }}>● LIVE</span>
          </div>
          <MiniChart />
          <div style={{ padding: '4px 12px 8px', display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 9, color: 'rgba(234,242,248,0.35)' }}>Market Active</span>
            <span style={{ fontSize: 9, fontWeight: 700, color: '#16A34A' }}>↑ +2.4%</span>
          </div>
        </div>
      </div>

      {/* Nav label */}
      <div style={{ padding: '12px 18px 4px', position: 'relative', zIndex: 1 }}>
        <p style={{ fontSize: 9, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'rgba(234,242,248,0.35)', margin: 0 }}>Main Menu</p>
      </div>

      {/* Nav items */}
      <nav style={{ flex: 1, overflowY: 'auto', paddingBottom: 8, position: 'relative', zIndex: 1 }}>
        {navItems.map((item) => {
          const isActive = location === item.href ||
            (item.href !== '/dashboard' && location.startsWith(item.href));
          return <NavItem key={item.href} item={item} isActive={isActive} onClose={onClose} />;
        })}
      </nav>

      {/* Bottom buttons */}
      <div style={{ padding: '8px 10px 12px', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', gap: 6, position: 'relative', zIndex: 1 }}>
        {user?.role === 'admin' && (
          <Link
            href="/admin"
            onClick={onClose}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              padding: '9px 16px', borderRadius: 10, fontWeight: 700, fontSize: 12,
              background: 'rgba(255,255,255,0.12)', color: '#fff',
              border: '1px solid rgba(255,255,255,0.2)', textDecoration: 'none',
            }}
          >
            <ShieldAlert size={14} />
            Admin Panel
          </Link>
        )}
        <button
          onClick={logout}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            width: '100%', padding: '9px 16px', borderRadius: 10, fontWeight: 700, fontSize: 12,
            background: 'rgba(220,38,38,0.15)', color: '#FCA5A5',
            border: '1px solid rgba(220,38,38,0.25)', cursor: 'pointer',
          }}
        >
          <LogOut size={14} />
          Sign Out
        </button>
      </div>
    </div>
  );
}

function getPageTitle(location: string): string {
  if (location === '/dashboard') return 'Portfolio Overview';
  const seg = location.split('/').pop() ?? '';
  return seg.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) || 'Dashboard';
}

function MobileBottomNav({ location, onMoreClick }: { location: string; onMoreClick: () => void }) {
  return (
    <nav
      className="md:hidden"
      style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 40,
        display: 'flex', alignItems: 'stretch',
        background: '#0B1929',
        borderTop: '1px solid rgba(255,255,255,0.1)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      {bottomNavItems.map((item) => {
        const Icon = item.icon;
        const isActive = location === item.href ||
          (item.href !== '/dashboard' && location.startsWith(item.href));
        const isHL = (item as any).highlight;
        return (
          <Link
            key={item.href}
            href={item.href}
            style={{
              flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
              justifyContent: 'center', padding: '10px 0', gap: 3, position: 'relative',
              textDecoration: 'none', transition: 'all 0.15s',
            }}
          >
            {isActive && (
              <span style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: 28, height: 2, borderRadius: 2, background: '#fff' }} />
            )}
            <Icon size={18} style={{ color: isActive ? '#FFFFFF' : isHL ? '#60C0F0' : 'rgba(234,242,248,0.4)' }} />
            <span style={{ fontSize: 10, fontWeight: 600, color: isActive ? '#FFFFFF' : isHL ? '#60C0F0' : 'rgba(234,242,248,0.4)' }}>
              {item.name}
            </span>
          </Link>
        );
      })}
      <button
        onClick={onMoreClick}
        style={{
          flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', padding: '10px 0', gap: 3, background: 'none', border: 'none', cursor: 'pointer',
        }}
      >
        <MoreHorizontal size={18} style={{ color: 'rgba(234,242,248,0.4)' }} />
        <span style={{ fontSize: 10, fontWeight: 600, color: 'rgba(234,242,248,0.4)' }}>More</span>
      </button>
    </nav>
  );
}

export function DashboardLayout({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const { user, logout } = useAuthState();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const closeMenu = () => setMobileMenuOpen(false);

  const SIDEBAR_W = 260;
  const GAP = 12;

  return (
    <div style={{ minHeight: '100vh', background: '#F0F2F5', display: 'flex', overflow: 'hidden' }}>

      {/* Subtle dot pattern background */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none',
        backgroundImage: 'radial-gradient(circle, rgba(0,0,0,0.06) 1px, transparent 1px)',
        backgroundSize: '24px 24px',
      }} />

      {/* ── Desktop Floating Sidebar ── */}
      <aside
        className="hidden md:flex"
        style={{
          width: SIDEBAR_W,
          position: 'fixed',
          top: GAP,
          bottom: GAP,
          left: GAP,
          zIndex: 30,
          borderRadius: 20,
          background: 'linear-gradient(170deg, #0d2035 0%, #0B1929 50%, #091520 100%)',
          boxShadow: '0 8px 40px rgba(0,0,0,0.28), 0 2px 8px rgba(0,0,0,0.15)',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        <SidebarContent onClose={closeMenu} user={user} logout={logout} location={location} />
      </aside>

      {/* Mobile Overlay Sidebar */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={closeMenu}
              style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 40 }}
            />
            <motion.aside
              initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 220 }}
              style={{
                width: 280, position: 'fixed', top: 0, bottom: 0, left: 0, zIndex: 50,
                background: 'linear-gradient(170deg, #0d2035 0%, #0B1929 50%, #091520 100%)',
                boxShadow: '4px 0 40px rgba(0,0,0,0.35)',
                display: 'flex', flexDirection: 'column',
              }}
            >
              <button
                onClick={closeMenu}
                style={{
                  position: 'absolute', top: 14, right: 14, zIndex: 60,
                  padding: 6, borderRadius: '50%', background: 'rgba(255,255,255,0.1)',
                  color: 'rgba(255,255,255,0.7)', border: 'none', cursor: 'pointer',
                }}
              >
                <X size={16} />
              </button>
              <SidebarContent onClose={closeMenu} user={user} logout={logout} location={location} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ── Main Area ── */}
      <main style={{
        flex: 1,
        marginLeft: SIDEBAR_W + GAP * 2,
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        zIndex: 1,
      }} className="md-main-area">

        {/* Floating Header */}
        <header style={{
          position: 'sticky', top: GAP, zIndex: 20,
          margin: `${GAP}px ${GAP}px 0`,
          borderRadius: 16,
          background: 'rgba(255,255,255,0.92)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: '1px solid rgba(255,255,255,0.9)',
          boxShadow: '0 4px 24px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.06)',
          height: 56,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 20px',
        }}>
          {/* Mobile hamburger */}
          <button
            className="md:hidden"
            onClick={() => setMobileMenuOpen(true)}
            style={{ padding: 6, color: '#6B7280', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            <Menu size={20} />
          </button>

          {/* Mobile logo */}
          <div className="md:hidden">
            <BrandLogo theme="light" size="sm" />
          </div>

          {/* Desktop page title */}
          <div className="hidden md:flex" style={{ alignItems: 'center', gap: 10 }}>
            <div style={{ width: 3, height: 20, borderRadius: 2, background: 'linear-gradient(to bottom, #1F77B4, #155D8B)' }} />
            <h2 style={{ fontSize: 15, fontWeight: 800, color: '#111827', margin: 0, letterSpacing: '-0.01em' }}>
              {getPageTitle(location)}
            </h2>
          </div>

          {/* Right side */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginLeft: 'auto' }}>
            <div className="hidden md:flex" style={{ height: 18, width: 1, background: '#E5E7EB' }} />
            <Link href="/dashboard/profile" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
              <div className="hidden sm:block" style={{ textAlign: 'right' }}>
                <p style={{ fontSize: 12.5, fontWeight: 700, color: '#111827', margin: 0, lineHeight: 1.3 }}>
                  {user?.firstName} {user?.lastName}
                </p>
                <p style={{ fontSize: 10.5, color: '#6B7280', margin: 0, lineHeight: 1.3, maxWidth: 130, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user?.email}
                </p>
              </div>
              <UserAvatar firstName={user?.firstName} lastName={user?.lastName} photo={(user as any)?.profilePhoto} size="sm" />
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <div style={{
          flex: 1, padding: `${GAP}px ${GAP}px ${GAP * 2}px`,
        }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={location}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>


      {/* Responsive style for main area on mobile */}
      <style>{`
        @media (max-width: 767px) {
          .md-main-area {
            margin-left: 0 !important;
          }
        }
      `}</style>
    </div>
  );
}
