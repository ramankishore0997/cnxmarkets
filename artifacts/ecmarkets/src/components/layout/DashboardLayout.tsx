import { ReactNode } from 'react';
import { Link, useLocation } from 'wouter';
import { 
  LayoutDashboard, 
  LineChart, 
  ArrowDownUp, 
  Wallet, 
  User, 
  Bell, 
  LogOut,
  Menu,
  ShieldCheck
} from 'lucide-react';
import { useAuthState } from '@/hooks/use-auth-state';

export function DashboardLayout({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const { user, logout } = useAuthState();

  const navItems = [
    { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Analytics', href: '/dashboard/analytics', icon: LineChart },
    { name: 'Deposit', href: '/dashboard/deposit', icon: Wallet },
    { name: 'Withdraw', href: '/dashboard/withdraw', icon: ArrowDownUp },
    { name: 'Profile', href: '/dashboard/profile', icon: User },
    { name: 'KYC', href: '/dashboard/kyc', icon: ShieldCheck },
    { name: 'Notifications', href: '/dashboard/notifications', icon: Bell },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/5 bg-card/30 backdrop-blur-xl hidden md:flex flex-col fixed inset-y-0 left-0 z-20">
        <div className="p-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <span className="font-bold text-white text-xs">ECM</span>
            </div>
            <span className="text-lg font-bold tracking-tight text-white">Client Portal</span>
          </Link>
        </div>
        
        <div className="px-6 py-4 border-b border-white/5">
          <p className="text-sm text-muted-foreground">Welcome back,</p>
          <p className="font-semibold text-white truncate">{user?.firstName} {user?.lastName}</p>
          <div className="mt-2 flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${user?.kycStatus === 'approved' ? 'bg-green-500' : 'bg-yellow-500'}`}></span>
            <span className="text-xs text-muted-foreground capitalize">KYC: {user?.kycStatus}</span>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location === item.href;
            return (
              <Link 
                key={item.name} 
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
                  isActive 
                    ? 'bg-primary/10 text-primary font-medium' 
                    : 'text-muted-foreground hover:bg-white/5 hover:text-white'
                }`}
              >
                <item.icon className={`w-5 h-5 ${isActive ? 'text-primary' : ''}`} />
                {item.name}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-white/5">
          <button 
            onClick={logout}
            className="flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 flex flex-col min-h-screen">
        <header className="h-16 border-b border-white/5 bg-background/80 backdrop-blur-md sticky top-0 z-10 flex items-center justify-between px-4 sm:px-6">
          <div className="flex items-center md:hidden">
            <Menu className="w-6 h-6 text-muted-foreground" />
          </div>
          <div className="flex-1 flex justify-end items-center gap-4">
            <Link href="/dashboard/notifications" className="relative p-2 text-muted-foreground hover:text-white transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-accent rounded-full"></span>
            </Link>
            <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </div>
          </div>
        </header>
        
        <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-x-hidden">
          {children}
        </div>
      </main>
    </div>
  );
}
