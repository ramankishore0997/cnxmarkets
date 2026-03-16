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
  ChevronRight
} from 'lucide-react';
import { useAuthState } from '@/hooks/use-auth-state';

export function AdminLayout({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const { user, logout } = useAuthState();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Redirect if not admin
  if (user && user.role !== 'admin') {
    window.location.href = '/dashboard';
    return null;
  }

  const navItems = [
    { name: 'Dashboard', href: '/admin', icon: BarChart3 },
    { name: 'Users', href: '/admin/users', icon: Users },
    { name: 'KYC Approvals', href: '/admin/kyc', icon: FileCheck },
    { name: 'Transactions', href: '/admin/transactions', icon: ArrowRightLeft },
    { name: 'Trade Injection', href: '/admin/trades', icon: Activity },
    { name: 'Strategies', href: '/admin/strategies', icon: TrendingUp },
    { name: 'Notifications', href: '/admin/notifications', icon: Send },
  ];

  const SidebarContent = () => (
    <>
      <div className="p-6 border-b border-[#2B3139]">
        <Link href="/" className="flex items-center gap-3 group">
          <ShieldAlert className="w-8 h-8 text-[#F0B90B]" />
          <div>
            <span className="text-lg font-bold tracking-tight text-white block">ECM Admin</span>
            <span className="text-xs text-[#F0B90B] uppercase tracking-wider font-bold">Superuser</span>
          </div>
        </Link>
      </div>

      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location === item.href || (location.startsWith(item.href) && item.href !== '/admin');
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

      <div className="p-6 border-t border-[#2B3139]">
        <button 
          onClick={logout}
          className="flex w-full items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#CF304A]/10 text-[#CF304A] hover:bg-[#CF304A]/20 border border-[#CF304A]/20 transition-all font-bold"
        >
          <LogOut className="w-5 h-5" />
          Exit Admin
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
              {location === '/admin' ? 'Platform Overview' : location.split('/').pop()?.replace('-', ' ')}
            </h2>
          </div>

          <div className="flex-1 flex justify-end items-center gap-6">
            <div className="flex items-center gap-3 group">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-bold text-white group-hover:text-[#F0B90B] transition-colors">{user?.firstName || 'System'} {user?.lastName || 'Admin'}</p>
                <p className="text-xs text-[#848E9C] font-medium">{user?.email || 'admin@ecmarketsindia.com'}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-[#CF304A] flex items-center justify-center font-bold text-white shadow-md">
                AD
              </div>
            </div>
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