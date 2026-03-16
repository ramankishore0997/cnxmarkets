import { ReactNode } from 'react';
import { Link, useLocation } from 'wouter';
import { 
  BarChart3, 
  Users, 
  FileCheck, 
  ArrowRightLeft, 
  TrendingUp, 
  Send,
  LogOut,
  ShieldAlert
} from 'lucide-react';
import { useAuthState } from '@/hooks/use-auth-state';

export function AdminLayout({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const { user, logout } = useAuthState();

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
    { name: 'Strategies', href: '/admin/strategies', icon: TrendingUp },
    { name: 'Notifications', href: '/admin/notifications', icon: Send },
  ];

  return (
    <div className="min-h-screen bg-[#050814] text-foreground flex">
      {/* Admin Sidebar - Darker than client */}
      <aside className="w-64 border-r border-white/10 bg-black/40 backdrop-blur-xl hidden md:flex flex-col fixed inset-y-0 left-0 z-20">
        <div className="p-6 flex items-center gap-3 border-b border-white/10">
          <ShieldAlert className="w-8 h-8 text-accent" />
          <div>
            <span className="text-lg font-bold tracking-tight text-white block">ECM Admin</span>
            <span className="text-xs text-accent uppercase tracking-wider font-semibold">Superuser</span>
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
                    ? 'bg-accent/15 text-accent font-medium' 
                    : 'text-muted-foreground hover:bg-white/5 hover:text-white'
                }`}
              >
                <item.icon className={`w-5 h-5 ${isActive ? 'text-accent' : ''}`} />
                {item.name}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-white/10">
          <button 
            onClick={logout}
            className="flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-muted-foreground hover:bg-white/5 hover:text-white transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Exit Admin
          </button>
        </div>
      </aside>

      <main className="flex-1 md:ml-64 p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
}
