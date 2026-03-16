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
    <div className="min-h-screen bg-[#f5f7fb] text-gray-900 flex">
      {/* Admin Sidebar */}
      <aside className="w-64 border-r border-border bg-white hidden md:flex flex-col fixed inset-y-0 left-0 z-20 shadow-sm">
        <div className="p-6 flex items-center gap-3 border-b border-border">
          <ShieldAlert className="w-8 h-8 text-primary" />
          <div>
            <span className="text-lg font-bold tracking-tight text-gray-900 block">ECM Admin</span>
            <span className="text-xs text-primary uppercase tracking-wider font-bold">Superuser</span>
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
                    ? 'bg-blue-50 text-primary font-bold' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 font-medium'
                }`}
              >
                <item.icon className={`w-5 h-5 ${isActive ? 'text-primary' : ''}`} />
                {item.name}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-border">
          <button 
            onClick={logout}
            className="flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-red-600 hover:bg-red-50 font-medium transition-colors"
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
