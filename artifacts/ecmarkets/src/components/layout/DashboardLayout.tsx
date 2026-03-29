import { ReactNode, useState } from 'react';
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
  MoreHorizontal
} from 'lucide-react';
import { EcmLogo } from '@/components/shared/EcmLogo';
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

function SidebarLogo() {
  return (
    <Link href="/" className="flex items-center gap-3 group">
      <div className="shrink-0">
        <EcmLogo size={36} />
      </div>
      <div className="leading-none">
        <span className="text-lg font-black tracking-tight text-white">ECMarket</span>
        <span className="text-lg font-black tracking-tight" style={{ color: '#60C0F0' }}> Pro</span>
      </div>
    </Link>
  );
}

function UserAvatar({ firstName, lastName, photo, size = 'md' }: { firstName?: string; lastName?: string; photo?: string | null; size?: 'sm' | 'md' | 'lg' }) {
  const initials = `${firstName?.[0] || 'U'}${lastName?.[0] || ''}`.toUpperCase();
  const dim = size === 'lg' ? 'w-12 h-12 text-base' : size === 'sm' ? 'w-8 h-8 text-xs' : 'w-10 h-10 text-sm';
  if (photo) {
    return (
      <div className={`${dim} rounded-full shrink-0 overflow-hidden ring-2`} style={{ ringColor: 'rgba(96,192,240,0.4)' }}>
        <img src={photo} alt="Avatar" className="w-full h-full object-cover" />
      </div>
    );
  }
  return (
    <div className={`${dim} rounded-full flex items-center justify-center font-black text-white shrink-0`} style={{ background: 'linear-gradient(135deg, #1F77B4 0%, #155D8B 100%)' }}>
      {initials}
    </div>
  );
}

function KycBadge({ status }: { status?: string }) {
  const approved = status === 'approved';
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider" style={{
      background: approved ? 'rgba(22,163,74,0.2)' : 'rgba(255,193,7,0.2)',
      color: approved ? '#16A34A' : '#F59E0B',
      border: `1px solid ${approved ? 'rgba(22,163,74,0.4)' : 'rgba(245,158,11,0.4)'}`,
    }}>
      <span className={`w-1.5 h-1.5 rounded-full ${approved ? '' : 'animate-pulse'}`} style={{ background: approved ? '#16A34A' : '#F59E0B' }} />
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
      className="flex items-center gap-3 py-2.5 pr-4 text-sm font-semibold transition-all duration-200 relative group rounded-xl mx-1"
      style={{
        paddingLeft: isActive ? '13px' : '16px',
        background: isActive
          ? 'rgba(255,255,255,0.15)'
          : 'transparent',
        borderLeft: isActive ? '3px solid #FFFFFF' : '3px solid transparent',
        color: isActive ? '#FFFFFF' : isHighlight ? '#60C0F0' : 'rgba(234,242,248,0.75)',
      }}
    >
      <Icon className="w-[18px] h-[18px] shrink-0 transition-all duration-200" style={{
        color: isActive ? '#FFFFFF' : isHighlight ? '#60C0F0' : 'rgba(234,242,248,0.6)',
      }} />
      <span className="flex-1 truncate">{item.name}</span>
      {isHighlight && !isActive && (
        <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-wide" style={{ background: '#1F77B4', color: '#FFFFFF' }}>LIVE</span>
      )}
      {isActive && (
        <ChevronRight className="w-3.5 h-3.5 shrink-0" style={{ color: 'rgba(255,255,255,0.5)' }} />
      )}
    </Link>
  );
}

function SidebarContent({ onClose, user, logout, location }: any) {
  return (
    <div className="flex flex-col h-full">
      <div className="px-5 py-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <SidebarLogo />
      </div>

      <div className="px-4 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="flex items-center gap-3 mb-3">
          <UserAvatar firstName={user?.firstName} lastName={user?.lastName} photo={(user as any)?.profilePhoto} size="lg" />
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-bold text-white truncate leading-tight">
              {user?.firstName || 'Trader'} {user?.lastName || ''}
            </p>
            <p className="text-[11px] truncate mt-0.5 font-medium" style={{ color: 'rgba(234,242,248,0.55)' }}>
              {user?.email || ''}
            </p>
          </div>
        </div>
        <KycBadge status={user?.kycStatus} />
      </div>

      <div className="px-5 pt-4 pb-1">
        <p className="text-[9px] font-bold uppercase tracking-[0.14em]" style={{ color: 'rgba(234,242,248,0.4)' }}>Main Menu</p>
      </div>

      <nav className="flex-1 px-2 pb-2 overflow-y-auto space-y-0.5">
        {navItems.map((item) => {
          const isActive = location === item.href ||
            (item.href !== '/dashboard' && location.startsWith(item.href));
          return (
            <NavItem key={item.href} item={item} isActive={isActive} onClose={onClose} />
          );
        })}
      </nav>

      <div className="px-3 pb-4 pt-2 space-y-2 mt-1" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        {user?.role === 'admin' && (
          <Link
            href="/admin"
            onClick={onClose}
            className="flex w-full items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all duration-200"
            style={{ background: 'rgba(255,255,255,0.12)', color: '#FFFFFF', border: '1px solid rgba(255,255,255,0.2)' }}
          >
            <ShieldAlert className="w-4 h-4" />
            Admin Panel
          </Link>
        )}
        <button
          onClick={logout}
          className="flex w-full items-center justify-center gap-2 px-4 py-2.5 rounded-xl transition-all duration-200 font-semibold text-sm"
          style={{ background: 'rgba(220,38,38,0.15)', color: '#FCA5A5', border: '1px solid rgba(220,38,38,0.25)' }}
        >
          <LogOut className="w-4 h-4" />
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
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 flex items-stretch"
      style={{
        background: '#0B3C5D',
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
            className="flex-1 flex flex-col items-center justify-center py-2.5 gap-1 relative transition-all active:scale-95"
          >
            {isHL && !isActive && (
              <div className="absolute inset-x-3 inset-y-1.5 rounded-xl" style={{ background: 'rgba(96,192,240,0.1)', border: '1px solid rgba(96,192,240,0.2)' }} />
            )}
            <Icon
              className="w-5 h-5 relative z-10 transition-colors"
              style={{ color: isActive ? '#FFFFFF' : isHL ? '#60C0F0' : 'rgba(234,242,248,0.45)' }}
            />
            <span className="text-[10px] font-semibold relative z-10 transition-colors" style={{ color: isActive ? '#FFFFFF' : isHL ? '#60C0F0' : 'rgba(234,242,248,0.45)' }}>
              {item.name}
            </span>
            {isActive && (
              <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-white" />
            )}
          </Link>
        );
      })}

      <button
        onClick={onMoreClick}
        className="flex-1 flex flex-col items-center justify-center py-2.5 gap-1 active:scale-95 transition-all"
      >
        <MoreHorizontal className="w-5 h-5" style={{ color: 'rgba(234,242,248,0.45)' }} />
        <span className="text-[10px] font-semibold" style={{ color: 'rgba(234,242,248,0.45)' }}>More</span>
      </button>
    </nav>
  );
}

export function DashboardLayout({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const { user, logout } = useAuthState();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const closeMenu = () => setMobileMenuOpen(false);

  return (
    <div className="min-h-screen text-[#374151] flex overflow-x-hidden" style={{ background: '#F7F9FC' }}>

      {/* Desktop Sidebar */}
      <aside className="w-[260px] hidden md:flex flex-col fixed inset-y-0 left-0 z-20 sidebar-stealth">
        <SidebarContent onClose={closeMenu} user={user} logout={logout} location={location} />
      </aside>

      {/* Mobile Overlay Sidebar */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeMenu}
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 220 }}
              className="w-[280px] sidebar-stealth flex flex-col fixed inset-y-0 left-0 z-50 shadow-2xl md:hidden"
            >
              <button
                onClick={closeMenu}
                className="absolute top-4 right-4 z-50 p-1.5 rounded-full transition-colors"
                style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)' }}
              >
                <X className="w-4 h-4" />
              </button>
              <SidebarContent onClose={closeMenu} user={user} logout={logout} location={location} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Area */}
      <main className="flex-1 md:ml-[260px] flex flex-col min-h-screen">

        {/* Header */}
        <header className="h-14 md:h-16 sticky top-0 z-30 flex items-center justify-between px-4 md:px-5 lg:px-8" style={{ background: '#FFFFFF', borderBottom: '1px solid #E5E7EB', boxShadow: '0 1px 8px rgba(0,0,0,0.06)' }}>
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="md:hidden p-2 rounded-lg transition-all"
            style={{ color: '#6B7280' }}
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="md:hidden flex items-center gap-2">
            <EcmLogo size={26} />
            <span className="text-sm font-black tracking-tight" style={{ color: '#0B3C5D' }}>ECMarket<span style={{ color: '#1F77B4' }}> Pro</span></span>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <div className="w-1 h-5 rounded-full" style={{ background: 'linear-gradient(to bottom, #1F77B4, #155D8B)' }} />
            <h2 className="text-[15px] font-bold tracking-tight" style={{ color: '#111827' }}>
              {getPageTitle(location)}
            </h2>
          </div>

          <div className="flex items-center gap-2 md:gap-3 ml-auto">
            <div className="hidden sm:flex h-5 w-px" style={{ background: '#E5E7EB' }} />
            <Link href="/dashboard/profile" className="flex items-center gap-2.5 group">
              <div className="hidden sm:block text-right">
                <p className="text-[13px] font-semibold leading-tight" style={{ color: '#111827' }}>
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-[11px] font-medium leading-tight mt-0.5 truncate max-w-[140px]" style={{ color: '#6B7280' }}>
                  {user?.email}
                </p>
              </div>
              <UserAvatar firstName={user?.firstName} lastName={user?.lastName} photo={(user as any)?.profilePhoto} size="sm" />
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 p-4 md:p-5 lg:p-8 min-h-0 pb-24 md:pb-8" style={{ background: '#F7F9FC' }}>
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

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav location={location} onMoreClick={() => setMobileMenuOpen(true)} />
    </div>
  );
}
