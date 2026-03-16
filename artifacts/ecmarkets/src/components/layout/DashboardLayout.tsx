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
  Activity,
  ChevronRight,
  ShieldAlert,
  Zap
} from 'lucide-react';
import { useAuthState } from '@/hooks/use-auth-state';

export function DashboardLayout({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const { user, logout } = useAuthState();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Analytics', href: '/dashboard/analytics', icon: LineChart },
    { name: 'Strategies', href: '/dashboard/strategies', icon: Zap },
    { name: 'Deposit', href: '/dashboard/deposit', icon: Wallet },
    { name: 'Withdraw', href: '/dashboard/withdraw', icon: ArrowDownUp },
    { name: 'KYC & Security', href: '/dashboard/kyc', icon: ShieldCheck },
    { name: 'Profile', href: '/dashboard/profile', icon: User },
    { name: 'Notifications', href: '/dashboard/notifications', icon: Bell },
  ];

  const SidebarContent = () => (
    <>
      <div className="p-6">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-[#0B0E11] border border-[#F0B90B] flex items-center justify-center shadow-[0_0_8px_rgba(240,185,11,0.4)]">
            <Activity className="w-5 h-5 text-[#F0B90B]" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">
            ECMarkets<span className="text-[#F0B90B]">India</span>
          </span>
        </Link>
      </div>
      
      <div className="px-6 py-6 border-b border-[#2B3139] bg-[#0B0E11]">
        <p className="text-xs text-[#848E9C] uppercase tracking-wider font-semibold mb-2">Trader Identity</p>
        <p className="text-xl font-bold text-white truncate mb-3">{user?.firstName || 'Trader'} {user?.lastName}</p>
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#1E2329] border border-[#2B3139]">
          <span className={`w-2 h-2 rounded-full animate-pulse ${user?.kycStatus === 'approved' ? 'bg-[#02C076]' : 'bg-[#F0B90B]'}`}></span>
          <span className="text-xs text-[#EAECEF] capitalize font-medium">KYC: {user?.kycStatus || 'Pending'}</span>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location === item.href || (location.startsWith(item.href) && item.href !== '/dashboard');
          return (
            <Link 
              key={item.name} 
              href={item.href}
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300 relative overflow-hidden group ${
                isActive 
                  ? 'nav-item-active' 
                  : 'hover:bg-[#2B3139] border border-transparent text-[#848E9C]'
              }`}
            >
              <div className="flex items-center gap-3 z-10">
                <item.icon className={`w-5 h-5 transition-colors ${isActive ? 'text-[#F0B90B]' : 'text-[#848E9C] group-hover:text-[#EAECEF]'}`} />
                <span className={`font-semibold ${isActive ? 'text-[#F0B90B]' : 'group-hover:text-white'}`}>
                  {item.name}
                </span>
              </div>
              {isActive && <ChevronRight className="w-4 h-4 text-[#F0B90B] z-10" />}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-[#2B3139] space-y-3">
        {user?.role === 'admin' && (
          <Link
            href="/admin"
            onClick={() => setMobileMenuOpen(false)}
            className="flex w-full items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#F0B90B] text-black hover:bg-[#d4a017] transition-all font-bold shadow-[0_0_16px_rgba(240,185,11,0.3)]"
          >
            <ShieldAlert className="w-5 h-5" />
            Admin Panel
          </Link>
        )}
        <button 
          onClick={logout}
          className="flex w-full items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#CF304A]/10 text-[#CF304A] hover:bg-[#CF304A]/20 border border-[#CF304A]/20 transition-all font-bold"
        >
          <LogOut className="w-5 h-5" />
          Terminate Session
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-[#0B0E11] text-[#EAECEF] flex">
      {/* Desktop Sidebar */}
      <aside className="w-72 sidebar-stealth hidden md:flex flex-col fixed inset-y-0 left-0 z-20">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 md:hidden"
            />
            <motion.aside 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="w-72 bg-[#1E2329] border-r border-[#2B3139] flex flex-col fixed inset-y-0 left-0 z-50 shadow-2xl"
            >
              <div className="absolute top-4 right-4 z-50">
                <button onClick={() => setMobileMenuOpen(false)} className="p-2 text-[#848E9C] hover:text-white bg-[#0B0E11] rounded-full">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 md:ml-72 flex flex-col min-h-screen relative overflow-hidden">
        <header className="h-20 bg-[#1E2329] border-b border-[#2B3139] sticky top-0 z-30 flex items-center justify-between px-6 lg:px-10">
          <div className="flex items-center md:hidden">
            <button onClick={() => setMobileMenuOpen(true)} className="p-2 -ml-2 text-[#848E9C] hover:bg-[#2B3139] rounded-lg">
              <Menu className="w-6 h-6" />
            </button>
          </div>
          
          <div className="hidden md:flex items-center">
            <h2 className="text-white font-bold text-xl capitalize">
              {location === '/dashboard' ? 'Overview' : location.split('/').pop()?.replace('-', ' ')}
            </h2>
          </div>

          <div className="flex-1 flex justify-end items-center gap-6">
            <Link href="/dashboard/notifications" className="relative p-2 text-[#848E9C] hover:text-[#F0B90B] transition-colors bg-[#0B0E11] border border-[#2B3139] rounded-full">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-[#CF304A] border-2 border-[#1E2329] rounded-full"></span>
            </Link>
            
            <div className="h-8 w-px bg-[#2B3139] hidden sm:block"></div>
            
            <Link href="/dashboard/profile" className="flex items-center gap-3 group">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-bold text-white group-hover:text-[#F0B90B] transition-colors">{user?.firstName} {user?.lastName}</p>
                <p className="text-xs text-[#848E9C] font-medium">{user?.email}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-[#F0B90B] flex items-center justify-center font-bold text-black shadow-md">
                {user?.firstName?.[0] || 'U'}{user?.lastName?.[0] || ''}
              </div>
            </Link>
          </div>
        </header>
        
        <div className="flex-1 p-6 lg:p-10 z-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={location}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}