import { ReactNode, useState } from 'react';
import { Link, useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart3, 
  Users, 
  FileCheck, 
  ArrowRightLeft, 
  TrendingUp, 
  Send,
  LogOut,
  ShieldAlert,
  Menu,
  X,
  Activity,
  ChevronRight,
  Settings,
} from 'lucide-react';
import { useAuthState } from '@/hooks/use-auth-state';

const navItems = [
  { name: 'Dashboard',      href: '/admin',                  icon: BarChart3 },
  { name: 'Users',          href: '/admin/users',            icon: Users },
  { name: 'KYC Approvals',  href: '/admin/kyc',              icon: FileCheck },
  { name: 'Transactions',   href: '/admin/transactions',     icon: ArrowRightLeft },
  { name: 'Trade Injection',href: '/admin/trades',           icon: Activity },
  { name: 'Strategies',     href: '/admin/strategies',       icon: TrendingUp },
  { name: 'Notifications',  href: '/admin/notifications',    icon: Send },
  { name: 'Settings',       href: '/admin/settings',         icon: Settings },
];

function AdminNavItem({ item, isActive, onClose }: { item: typeof navItems[0]; isActive: boolean; onClose: () => void }) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      onClick={onClose}
      className={`flex items-center gap-3 py-3 pr-4 text-sm font-semibold transition-all duration-200 group
        ${isActive
          ? 'nav-item-active text-[#FFB800] pl-[13px]'
          : 'nav-item-hover text-[#6B7280] hover:text-[#F8FAFC] pl-4'
        }`}
    >
      <Icon className={`w-[18px] h-[18px] shrink-0 transition-all duration-200 ${
        isActive ? 'text-[#FFB800]' : 'text-[#4B5563] group-hover:text-[#94A3B8]'
      }`} />
      <span className="flex-1 truncate">{item.name}</span>
      {isActive && <ChevronRight className="w-3.5 h-3.5 text-[#FFB800]/60 shrink-0" />}
    </Link>
  );
}

function AdminSidebarContent({ onClose, user, logout, location }: any) {
  return (
    <div className="flex flex-col h-full">
      {/* Brand */}
      <div className="px-5 py-5 border-b border-white/[0.04]">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative w-9 h-9 shrink-0">
            <div className="absolute inset-0 rounded-xl bg-[#CF304A]/20 blur-sm group-hover:bg-[#CF304A]/30 transition-opacity" />
            <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-[#0D1421] to-[#080D18] border border-[#CF304A]/40 flex items-center justify-center">
              <ShieldAlert className="w-5 h-5 text-[#CF304A]" />
            </div>
          </div>
          <div className="leading-none">
            <p className="text-base font-black text-gradient-metallic tracking-tight">ECM Admin</p>
            <p className="text-[10px] font-bold text-[#CF304A] uppercase tracking-[0.1em] mt-0.5">Superuser Portal</p>
          </div>
        </Link>
      </div>

      {/* Admin identity */}
      <div className="px-4 py-4 border-b border-white/[0.04]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#CF304A] to-[#a01f33] flex items-center justify-center font-black text-white text-sm shadow-lg shadow-[#CF304A]/20 shrink-0">
            {(user?.firstName?.[0] || 'A').toUpperCase()}{(user?.lastName?.[0] || 'D').toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-bold text-[#F8FAFC] truncate leading-tight">
              {user?.firstName || 'System'} {user?.lastName || 'Admin'}
            </p>
            <span className="inline-flex items-center gap-1 mt-0.5 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-[#CF304A]/15 text-[#CF304A] border border-[#CF304A]/25">
              <span className="w-1.5 h-1.5 rounded-full bg-[#CF304A] animate-pulse" />
              Admin
            </span>
          </div>
        </div>
      </div>

      {/* Nav label */}
      <div className="px-5 pt-5 pb-1">
        <p className="text-[9px] font-bold text-[#374151] uppercase tracking-[0.14em]">Admin Controls</p>
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
      <div className="px-3 pb-4 pt-2 border-t border-white/[0.04]">
        <button
          onClick={logout}
          className="flex w-full items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#CF304A]/08 text-[#CF304A]/80 hover:bg-[#CF304A]/15 hover:text-[#CF304A] border border-[#CF304A]/15 hover:border-[#CF304A]/30 transition-all duration-200 font-semibold text-sm"
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
    <div className="min-h-screen bg-[#0B0E11] text-[#F8FAFC] flex">

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
        <header className="h-16 header-glass sticky top-0 z-30 flex items-center justify-between px-5 lg:px-8">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="md:hidden p-2 rounded-lg text-[#6B7280] hover:text-white hover:bg-white/[0.05] transition-all"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="hidden md:flex items-center gap-3">
            <div className="w-1 h-5 rounded-full bg-gradient-to-b from-[#CF304A] to-[#a01f33]" />
            <h2 className="text-[15px] font-bold text-[#F8FAFC] tracking-tight">
              {getAdminPageTitle(location)}
            </h2>
          </div>

          <div className="flex items-center gap-3 ml-auto">
            <div className="hidden sm:flex h-5 w-px bg-white/[0.07]" />
            <div className="flex items-center gap-2.5">
              <div className="hidden sm:block text-right">
                <p className="text-[13px] font-semibold text-[#D1D5DB] leading-tight">
                  {user?.firstName || 'System'} {user?.lastName || 'Admin'}
                </p>
                <p className="text-[11px] text-[#4B5563] font-medium">{user?.email}</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#CF304A] to-[#a01f33] flex items-center justify-center font-black text-white text-xs shadow-md">
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
