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
  ChevronRight
} from 'lucide-react';
import { useAuthState } from '@/hooks/use-auth-state';

export function DashboardLayout({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const { user, logout } = useAuthState();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Analytics', href: '/dashboard/analytics', icon: LineChart },
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
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">
            ECMarkets<span className="text-gradient-gold">India</span>
          </span>
        </Link>
      </div>
      
      <div className="px-6 py-6 border-b border-white/5 bg-gradient-to-b from-white/[0.02] to-transparent">
        <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-2">Welcome Back</p>
        <p className="text-xl font-bold text-white truncate mb-3">{user?.firstName || 'Trader'} {user?.lastName}</p>
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/40 border border-white/5">
          <span className={`w-2 h-2 rounded-full animate-pulse ${user?.kycStatus === 'approved' ? 'bg-green-500 glow-green' : 'bg-yellow-500'}`}></span>
          <span className="text-xs text-muted-foreground capitalize font-medium">KYC: {user?.kycStatus || 'Pending'}</span>
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
                  ? 'bg-primary/10 border border-primary/20' 
                  : 'hover:bg-white/5 border border-transparent'
              }`}
            >
              {isActive && (
                <motion.div 
                  layoutId="sidebarActiveIndicator"
                  className="absolute left-0 top-0 bottom-0 w-1 bg-primary" 
                />
              )}
              <div className="flex items-center gap-3">
                <item.icon className={`w-5 h-5 transition-colors ${isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-white'}`} />
                <span className={`font-medium ${isActive ? 'text-white' : 'text-muted-foreground group-hover:text-white'}`}>
                  {item.name}
                </span>
              </div>
              {isActive && <ChevronRight className="w-4 h-4 text-primary" />}
            </Link>
          )
        })}
      </nav>

      <div className="p-6 border-t border-white/5">
        <button 
          onClick={logout}
          className="flex w-full items-center justify-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-all font-bold"
        >
          <LogOut className="w-5 h-5" />
          Secure Logout
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-[#0b0f19] text-foreground flex">
      {/* Desktop Sidebar */}
      <aside className="w-72 border-r border-white/5 bg-[#0d1527]/50 backdrop-blur-xl hidden md:flex flex-col fixed inset-y-0 left-0 z-20">
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
              className="w-72 border-r border-white/10 bg-[#0d1527] flex flex-col fixed inset-y-0 left-0 z-50 shadow-2xl"
            >
              <div className="absolute top-4 right-4 z-50">
                <button onClick={() => setMobileMenuOpen(false)} className="p-2 text-muted-foreground hover:text-white bg-white/5 rounded-full">
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
        {/* Background glow effects */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[150px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/5 rounded-full blur-[150px] pointer-events-none" />

        <header className="h-20 border-b border-white/5 bg-[#0b0f19]/80 backdrop-blur-xl sticky top-0 z-30 flex items-center justify-between px-6 lg:px-10">
          <div className="flex items-center md:hidden">
            <button onClick={() => setMobileMenuOpen(true)} className="p-2 -ml-2 text-white hover:bg-white/10 rounded-lg">
              <Menu className="w-6 h-6" />
            </button>
          </div>
          
          <div className="hidden md:flex items-center">
            <h2 className="text-white font-semibold text-lg capitalize">
              {location === '/dashboard' ? 'Overview' : location.split('/').pop()?.replace('-', ' ')}
            </h2>
          </div>

          <div className="flex-1 flex justify-end items-center gap-6">
            <Link href="/dashboard/notifications" className="relative p-2 text-muted-foreground hover:text-white transition-colors">
              <Bell className="w-6 h-6" />
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 border-2 border-[#0b0f19] rounded-full animate-pulse"></span>
            </Link>
            
            <div className="h-8 w-px bg-white/10 hidden sm:block"></div>
            
            <Link href="/dashboard/profile" className="flex items-center gap-3 group">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-semibold text-white group-hover:text-primary transition-colors">{user?.firstName} {user?.lastName}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-blue-400 flex items-center justify-center font-bold text-white shadow-lg border-2 border-[#0b0f19]">
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
