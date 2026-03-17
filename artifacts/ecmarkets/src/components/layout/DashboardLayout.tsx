import { ReactNode, useState } from 'react';
import { Link, useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  LineChart, 
  ArrowDownUp, 
  Wallet, 
  User, 
  Bell, 
  LogOut,
  Menu,
  ShieldCheck,
  X,
  ShieldAlert,
  Zap,
  History,
  TrendingUp,
  ChevronRight,
  MoreHorizontal
} from 'lucide-react';
import { EcmLogo } from '@/components/shared/EcmLogo';
import { useAuthState } from '@/hooks/use-auth-state';

const navItems = [
  { name: 'Overview',         href: '/dashboard',               icon: LayoutDashboard },
  { name: 'Analytics',        href: '/dashboard/analytics',     icon: LineChart },
  { name: 'Binary Trading',   href: '/dashboard/binary',        icon: TrendingUp, highlight: true },
  { name: 'Trade History',    href: '/dashboard/trades',        icon: History },
  { name: 'Strategies',       href: '/dashboard/strategies',    icon: Zap },
  { name: 'Deposit',          href: '/dashboard/deposit',       icon: Wallet },
  { name: 'Withdraw',         href: '/dashboard/withdraw',      icon: ArrowDownUp },
  { name: 'KYC & Security',   href: '/dashboard/kyc',           icon: ShieldCheck },
  { name: 'Profile',          href: '/dashboard/profile',       icon: User },
  { name: 'Notifications',    href: '/dashboard/notifications',  icon: Bell },
];

const bottomNavItems = [
  { name: 'Home',     href: '/dashboard',           icon: LayoutDashboard },
  { name: 'Binary',   href: '/dashboard/binary',    icon: TrendingUp, highlight: true },
  { name: 'Deposit',  href: '/dashboard/deposit',   icon: Wallet },
  { name: 'Profile',  href: '/dashboard/profile',   icon: User },
];

function SidebarLogo() {
  return (
    <Link href="/" className="flex items-center gap-3 group">
      <div className="shrink-0 drop-shadow-[0_0_8px_rgba(255,184,0,0.3)]">
        <EcmLogo size={36} />
      </div>
      <div className="leading-none">
        <span className="text-lg font-black tracking-tight text-gradient-metallic">ECMarkets</span>
        <span className="text-lg font-black tracking-tight text-[#FFB800]">India</span>
      </div>
    </Link>
  );
}

function UserAvatar({ firstName, lastName, photo, size = 'md' }: { firstName?: string; lastName?: string; photo?: string | null; size?: 'sm' | 'md' | 'lg' }) {
  const initials = `${firstName?.[0] || 'U'}${lastName?.[0] || ''}`.toUpperCase();
  const dim = size === 'lg' ? 'w-12 h-12 text-base' : size === 'sm' ? 'w-8 h-8 text-xs' : 'w-10 h-10 text-sm';
  if (photo) {
    return (
      <div className={`${dim} rounded-full shrink-0 overflow-hidden ring-2 ring-[#FFB800]/40 shadow-lg shadow-[#FFB800]/15`}>
        <img src={photo} alt="Avatar" className="w-full h-full object-cover" />
      </div>
    );
  }
  return (
    <div className={`${dim} rounded-full bg-gradient-to-br from-[#FFB800] via-[#F0B90B] to-[#c8960c] flex items-center justify-center font-black text-black shadow-lg shadow-[#FFB800]/20 shrink-0`}>
      {initials}
    </div>
  );
}

function KycBadge({ status }: { status?: string }) {
  const approved = status === 'approved';
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
      approved
        ? 'bg-[#02C076]/10 text-[#02C076] border-[#02C076]/25'
        : 'bg-[#FFB800]/10 text-[#FFB800] border-[#FFB800]/25'
    }`}>
      <span className={`w-1.5 h-1.5 rounded-full ${approved ? 'bg-[#02C076]' : 'bg-[#FFB800] animate-pulse'}`} />
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
      className={`flex items-center gap-3 py-3 pr-4 text-sm font-semibold transition-all duration-200 relative group
        ${isActive
          ? 'nav-item-active text-[#FFB800] pl-[13px]'
          : isHighlight
          ? 'pl-4 text-[#FFB800]/80 hover:text-[#FFB800]'
          : 'nav-item-hover text-[#6B7280] hover:text-[#F8FAFC] pl-4'
        }`}
    >
      <Icon className={`w-[18px] h-[18px] shrink-0 transition-all duration-200 ${
        isActive ? 'text-[#FFB800]' : isHighlight ? 'text-[#FFB800]/70 group-hover:text-[#FFB800]' : 'text-[#4B5563] group-hover:text-[#94A3B8]'
      }`} />
      <span className="flex-1 truncate">{item.name}</span>
      {isHighlight && !isActive && (
        <span className="text-[9px] font-black bg-[#FFB800] text-black px-1.5 py-0.5 rounded-full uppercase tracking-wide">LIVE</span>
      )}
      {isActive && (
        <ChevronRight className="w-3.5 h-3.5 text-[#FFB800]/60 shrink-0" />
      )}
    </Link>
  );
}

function SidebarContent({ onClose, user, logout, location }: any) {
  return (
    <div className="flex flex-col h-full">
      <div className="px-5 py-5 border-b border-white/[0.04]">
        <SidebarLogo />
      </div>

      <div className="px-4 py-5 border-b border-white/[0.04]">
        <div className="flex items-center gap-3 mb-3">
          <UserAvatar firstName={user?.firstName} lastName={user?.lastName} photo={(user as any)?.profilePhoto} size="lg" />
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-bold text-[#F8FAFC] truncate leading-tight">
              {user?.firstName || 'Trader'} {user?.lastName || ''}
            </p>
            <p className="text-[11px] text-[#4B5563] truncate mt-0.5 font-medium">
              {user?.email || ''}
            </p>
          </div>
        </div>
        <KycBadge status={user?.kycStatus} />
      </div>

      <div className="px-5 pt-5 pb-1">
        <p className="text-[9px] font-bold text-[#374151] uppercase tracking-[0.14em]">Main Menu</p>
      </div>

      <nav className="flex-1 px-3 pb-2 overflow-y-auto space-y-0.5">
        {navItems.map((item) => {
          const isActive = location === item.href ||
            (item.href !== '/dashboard' && location.startsWith(item.href));
          return (
            <NavItem key={item.href} item={item} isActive={isActive} onClose={onClose} />
          );
        })}
      </nav>

      <div className="px-3 pb-4 pt-2 space-y-2 border-t border-white/[0.04] mt-1">
        {user?.role === 'admin' && (
          <Link
            href="/admin"
            onClick={onClose}
            className="flex w-full items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#FFB800]/20 to-[#F0B90B]/10 text-[#FFB800] border border-[#FFB800]/25 font-bold text-sm hover:from-[#FFB800]/30 hover:to-[#F0B90B]/20 transition-all duration-200 shadow-sm shadow-[#FFB800]/10"
          >
            <ShieldAlert className="w-4 h-4" />
            Admin Panel
          </Link>
        )}
        <button
          onClick={logout}
          className="flex w-full items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#CF304A]/08 text-[#CF304A]/80 hover:bg-[#CF304A]/15 hover:text-[#CF304A] border border-[#CF304A]/15 hover:border-[#CF304A]/30 transition-all duration-200 font-semibold text-sm"
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
        background: 'rgba(11,14,17,0.97)',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        backdropFilter: 'blur(20px)',
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
              <div className="absolute inset-x-3 inset-y-1.5 rounded-xl"
                style={{ background: 'rgba(255,184,0,0.08)', border: '1px solid rgba(255,184,0,0.2)' }} />
            )}
            <Icon
              className={`w-5 h-5 relative z-10 transition-colors ${
                isActive ? 'text-[#FFB800]' : isHL ? 'text-[#FFB800]/70' : 'text-[#4B5563]'
              }`}
            />
            <span className={`text-[10px] font-semibold relative z-10 transition-colors ${
              isActive ? 'text-[#FFB800]' : isHL ? 'text-[#FFB800]/70' : 'text-[#4B5563]'
            }`}>
              {item.name}
            </span>
            {isActive && (
              <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-[#FFB800]" />
            )}
          </Link>
        );
      })}

      <button
        onClick={onMoreClick}
        className="flex-1 flex flex-col items-center justify-center py-2.5 gap-1 active:scale-95 transition-all"
      >
        <MoreHorizontal className="w-5 h-5 text-[#4B5563]" />
        <span className="text-[10px] font-semibold text-[#4B5563]">More</span>
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
    <div className="min-h-screen bg-[#0B0E11] text-[#F8FAFC] flex">

      {/* ── Desktop Sidebar ─── */}
      <aside className="w-[260px] sidebar-stealth hidden md:flex flex-col fixed inset-y-0 left-0 z-20">
        <SidebarContent onClose={closeMenu} user={user} logout={logout} location={location} />
      </aside>

      {/* ── Mobile Overlay Sidebar ─── */}
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
              className="w-[280px] sidebar-stealth flex flex-col fixed inset-y-0 left-0 z-50 shadow-2xl md:hidden"
            >
              <button
                onClick={closeMenu}
                className="absolute top-4 right-4 z-50 p-1.5 rounded-full bg-white/[0.06] text-[#6B7280] hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
              <SidebarContent onClose={closeMenu} user={user} logout={logout} location={location} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ── Main Area ─── */}
      <main className="flex-1 md:ml-[260px] flex flex-col min-h-screen">

        {/* Header */}
        <header className="h-14 md:h-16 header-glass sticky top-0 z-30 flex items-center justify-between px-4 md:px-5 lg:px-8">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="md:hidden p-2 rounded-lg text-[#6B7280] hover:text-white hover:bg-white/[0.05] transition-all"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="md:hidden flex items-center gap-2">
            <EcmLogo size={26} />
            <span className="text-sm font-black tracking-tight text-white">ECMarkets<span className="text-[#FFB800]">India</span></span>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <div className="w-1 h-5 rounded-full bg-gradient-to-b from-[#FFB800] to-[#F0B90B]" />
            <h2 className="text-[15px] font-bold text-[#F8FAFC] tracking-tight">
              {getPageTitle(location)}
            </h2>
          </div>

          <div className="flex items-center gap-2 md:gap-3 ml-auto">
            <Link
              href="/dashboard/notifications"
              className="relative p-2 rounded-xl bg-white/[0.04] border border-white/[0.06] text-[#6B7280] hover:text-[#FFB800] hover:border-[#FFB800]/25 transition-all duration-200"
            >
              <Bell className="w-[18px] h-[18px]" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#CF304A] border-2 border-[#080D18] rounded-full" />
            </Link>

            <div className="hidden sm:flex h-5 w-px bg-white/[0.07]" />

            <Link href="/dashboard/profile" className="flex items-center gap-2.5 group">
              <div className="hidden sm:block text-right">
                <p className="text-[13px] font-semibold text-[#D1D5DB] group-hover:text-[#F8FAFC] transition-colors leading-tight">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-[11px] text-[#4B5563] font-medium leading-tight mt-0.5 truncate max-w-[140px]">
                  {user?.email}
                </p>
              </div>
              <UserAvatar firstName={user?.firstName} lastName={user?.lastName} photo={(user as any)?.profilePhoto} size="sm" />
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 p-4 md:p-5 lg:p-8 dashboard-content-bg min-h-0 pb-24 md:pb-8">
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

      {/* ── Mobile Bottom Navigation ─── */}
      <MobileBottomNav location={location} onMoreClick={() => setMobileMenuOpen(true)} />
    </div>
  );
}
