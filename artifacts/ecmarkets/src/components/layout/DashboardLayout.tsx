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
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-md">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-gray-900">
            ECMarkets<span className="text-primary">India</span>
          </span>
        </Link>
      </div>
      
      <div className="px-6 py-6 border-b border-border bg-gray-50/50">
        <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-2">Welcome Back</p>
        <p className="text-xl font-bold text-gray-900 truncate mb-3">{user?.firstName || 'Trader'} {user?.lastName}</p>
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-border shadow-sm">
          <span className={`w-2 h-2 rounded-full animate-pulse ${user?.kycStatus === 'approved' ? 'bg-green-500' : 'bg-yellow-500'}`}></span>
          <span className="text-xs text-gray-600 capitalize font-medium">KYC: {user?.kycStatus || 'Pending'}</span>
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
                  ? 'bg-blue-50 text-primary' 
                  : 'hover:bg-gray-50 border border-transparent text-gray-600'
              }`}
            >
              {isActive && (
                <motion.div 
                  layoutId="sidebarActiveIndicator"
                  className="absolute left-0 top-0 bottom-0 w-1 bg-primary" 
                />
              )}
              <div className="flex items-center gap-3 z-10">
                <item.icon className={`w-5 h-5 transition-colors ${isActive ? 'text-primary' : 'text-gray-500 group-hover:text-primary'}`} />
                <span className={`font-semibold ${isActive ? 'text-primary' : 'group-hover:text-gray-900'}`}>
                  {item.name}
                </span>
              </div>
              {isActive && <ChevronRight className="w-4 h-4 text-primary z-10" />}
            </Link>
          )
        })}
      </nav>

      <div className="p-6 border-t border-border">
        <button 
          onClick={logout}
          className="flex w-full items-center justify-center gap-2 px-4 py-3 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition-all font-bold"
        >
          <LogOut className="w-5 h-5" />
          Secure Logout
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-[#f5f7fb] text-gray-900 flex">
      {/* Desktop Sidebar */}
      <aside className="w-72 bg-white border-r border-border hidden md:flex flex-col fixed inset-y-0 left-0 z-20 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
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
              className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-40 md:hidden"
            />
            <motion.aside 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="w-72 bg-white flex flex-col fixed inset-y-0 left-0 z-50 shadow-2xl"
            >
              <div className="absolute top-4 right-4 z-50">
                <button onClick={() => setMobileMenuOpen(false)} className="p-2 text-gray-500 hover:text-gray-900 bg-gray-100 rounded-full">
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
        <header className="h-20 bg-white border-b border-border sticky top-0 z-30 flex items-center justify-between px-6 lg:px-10 shadow-sm">
          <div className="flex items-center md:hidden">
            <button onClick={() => setMobileMenuOpen(true)} className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-lg">
              <Menu className="w-6 h-6" />
            </button>
          </div>
          
          <div className="hidden md:flex items-center">
            <h2 className="text-gray-900 font-bold text-xl capitalize">
              {location === '/dashboard' ? 'Overview' : location.split('/').pop()?.replace('-', ' ')}
            </h2>
          </div>

          <div className="flex-1 flex justify-end items-center gap-6">
            <Link href="/dashboard/notifications" className="relative p-2 text-gray-500 hover:text-primary transition-colors bg-gray-50 rounded-full">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full"></span>
            </Link>
            
            <div className="h-8 w-px bg-border hidden sm:block"></div>
            
            <Link href="/dashboard/profile" className="flex items-center gap-3 group">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-bold text-gray-900 group-hover:text-primary transition-colors">{user?.firstName} {user?.lastName}</p>
                <p className="text-xs text-gray-500 font-medium">{user?.email}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center font-bold text-white shadow-md">
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
