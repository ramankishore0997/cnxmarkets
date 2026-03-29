import { ReactNode, useState } from 'react';
import { Link, useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart3, 
  Users, 
  ArrowRightLeft, 
  LogOut,
  ShieldAlert,
  Menu,
  X,
  Activity,
  ChevronRight,
  Settings,
  ShieldCheck,
} from 'lucide-react';
import { useAuthState } from '@/hooks/use-auth-state';

const navItems = [
  { name: 'Dashboard',      href: '/admin',                  icon: BarChart3 },
  { name: 'Users',          href: '/admin/users',            icon: Users },
  { name: 'KYC Approvals',  href: '/admin/kyc',              icon: ShieldCheck },
  { name: 'Transactions',   href: '/admin/transactions',     icon: ArrowRightLeft },
  { name: 'Trade Injection',href: '/admin/trades',           icon: Activity },
  { name: 'Settings',       href: '/admin/settings',         icon: Settings },
];

function AdminNavItem({ item, isActive, onClose }: { item: typeof navItems[0]; isActive: boolean; onClose: () => void }) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      onClick={onClose}
      className="flex items-center gap-3 py-2.5 pr-4 text-sm font-semibold transition-all duration-200 rounded-xl mx-1"
      style={{
        paddingLeft: isActive ? '13px' : '16px',
        background: isActive ? 'rgba(255,255,255,0.15)' : 'transparent',
        borderLeft: isActive ? '3px solid #FFFFFF' : '3px solid transparent',
        color: isActive ? '#FFFFFF' : 'rgba(234,242,248,0.75)',
      }}
    >
      <Icon className="w-[18px] h-[18px] shrink-0" style={{ color: isActive ? '#FFFFFF' : 'rgba(234,242,248,0.6)' }} />
      <span className="flex-1 truncate">{item.name}</span>
      {isActive && <ChevronRight className="w-3.5 h-3.5 shrink-0" style={{ color: 'rgba(255,255,255,0.5)' }} />}
    </Link>
  );
}

function AdminSidebarContent({ onClose, user, logout, location }: any) {
  return (
    <div className="flex flex-col h-full">
      {/* Brand */}
      <div className="px-5 py-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative w-9 h-9 shrink-0">
            <div className="relative w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(220,38,38,0.2)', border: '1px solid rgba(220,38,38,0.35)' }}>
              <ShieldAlert className="w-5 h-5 text-[#FCA5A5]" />
            </div>
          </div>
          <div className="leading-none">
            <p className="text-base font-black text-white tracking-tight">ECM Admin</p>
            <p className="text-[10px] font-bold uppercase tracking-[0.1em] mt-0.5" style={{ color: '#FCA5A5' }}>Superuser Portal</p>
          </div>
        </Link>
      </div>

      {/* Admin identity */}
      <div className="px-4 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center font-black text-white text-sm shrink-0" style={{ background: 'linear-gradient(135deg, #DC2626, #a01f33)' }}>
            {(user?.firstName?.[0] || 'A').toUpperCase()}{(user?.lastName?.[0] || 'D').toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-bold text-white truncate leading-tight">
              {user?.firstName || 'System'} {user?.lastName || 'Admin'}
            </p>
            <span className="inline-flex items-center gap-1 mt-0.5 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider" style={{ background: 'rgba(220,38,38,0.2)', color: '#FCA5A5', border: '1px solid rgba(220,38,38,0.3)' }}>
              <span className="w-1.5 h-1.5 rounded-full bg-[#FCA5A5] animate-pulse" />
              Admin
            </span>
          </div>
        </div>
      </div>

      {/* Nav label */}
      <div className="px-5 pt-4 pb-1">
        <p className="text-[9px] font-bold uppercase tracking-[0.14em]" style={{ color: 'rgba(234,242,248,0.4)' }}>Admin Controls</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 pb-2 overflow-y-auto space-y-0.5">
        {navItems.map((item) => {
          const isActive = location === item.href ||
            (item.href !== '/admin' && location.startsWith(item.href));
          return (
            <AdminNavItem key={item.href} item={item} isActive={isActive} onClose={onClose} />
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 pb-4 pt-2 mt-1" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <button
          onClick={logout}
          className="flex w-full items-center justify-center gap-2 px-4 py-2.5 rounded-xl transition-all duration-200 font-semibold text-sm"
          style={{ background: 'rgba(220,38,38,0.15)', color: '#FCA5A5', border: '1px solid rgba(220,38,38,0.25)' }}
        >
          <LogOut className="w-4 h-4" />
          Exit Admin
        </button>
      </div>
    </div>
  );
}

function getAdminPageTitle(location: string): string {
  if (location === '/admin') return 'Platform Overview';
  const seg = location.split('/').pop() ?? '';
  return seg.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) || 'Admin';
}

export function AdminLayout({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const { user, logout } = useAuthState();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const closeMenu = () => setMobileMenuOpen(false);

  if (user && user.role !== 'admin') {
    window.location.href = '/dashboard';
    return null;
  }

  return (
    <div className="min-h-screen bg-[#FFFFFF] text-[#111827] flex">

      {/* ── Desktop Sidebar ─── */}
      <aside className="w-[260px] sidebar-stealth hidden md:flex flex-col fixed inset-y-0 left-0 z-20">
        <AdminSidebarContent onClose={closeMenu} user={user} logout={logout} location={location} />
      </aside>

      {/* ── Mobile Overlay ─── */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeMenu}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 md:hidden"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 220 }}
              className="w-[260px] sidebar-stealth flex flex-col fixed inset-y-0 left-0 z-50 shadow-2xl md:hidden"
            >
              <button
                onClick={closeMenu}
                className="absolute top-4 right-4 z-50 p-1.5 rounded-full bg-white/[0.06] text-[#6B7280] hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
              <AdminSidebarContent onClose={closeMenu} user={user} logout={logout} location={location} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ── Main Area ─── */}
      <main className="flex-1 md:ml-[260px] flex flex-col min-h-screen">

        {/* Header */}
        <header className="h-16 sticky top-0 z-30 flex items-center justify-between px-5 lg:px-8" style={{ background: '#FFFFFF', borderBottom: '1px solid #E5E7EB', boxShadow: '0 1px 8px rgba(0,0,0,0.06)' }}>
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="md:hidden p-2 rounded-lg transition-all"
            style={{ color: '#6B7280' }}
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="hidden md:flex items-center gap-3">
            <div className="w-1 h-5 rounded-full" style={{ background: 'linear-gradient(to bottom, #DC2626, #a01f33)' }} />
            <h2 className="text-[15px] font-bold tracking-tight" style={{ color: '#111827' }}>
              {getAdminPageTitle(location)}
            </h2>
          </div>

          <div className="flex items-center gap-3 ml-auto">
            <div className="hidden sm:flex h-5 w-px" style={{ background: '#E5E7EB' }} />
            <div className="flex items-center gap-2.5">
              <div className="hidden sm:block text-right">
                <p className="text-[13px] font-semibold leading-tight" style={{ color: '#111827' }}>
                  {user?.firstName || 'System'} {user?.lastName || 'Admin'}
                </p>
                <p className="text-[11px] font-medium" style={{ color: '#6B7280' }}>{user?.email}</p>
              </div>
              <div className="w-8 h-8 rounded-full flex items-center justify-center font-black text-white text-xs shadow-md" style={{ background: 'linear-gradient(135deg, #DC2626, #a01f33)' }}>
                AD
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 p-4 md:p-5 lg:p-8 dashboard-content-bg min-h-0 overflow-x-hidden">
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
    </div>
  );
}
