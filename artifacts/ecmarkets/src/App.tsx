import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuthState } from "@/hooks/use-auth-state";
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";

// Public Pages
import { Home } from "@/pages/public/Home";
import { Markets } from "@/pages/public/Markets";
import { About } from "@/pages/public/About";
import { Faq } from "@/pages/public/Faq";
import { Contact } from "@/pages/public/Contact";
import { DownloadApp } from "@/pages/public/DownloadApp";

// Auth Pages
import { Login } from "@/pages/auth/Login";
import { Register } from "@/pages/auth/Register";

// Client Pages
import { Dashboard } from "@/pages/client/Dashboard";
import { Deposit } from "@/pages/client/Deposit";
import { Withdraw } from "@/pages/client/Withdraw";
import { Kyc } from "@/pages/client/Kyc";
import { Analytics } from "@/pages/client/Analytics";
import { Profile } from "@/pages/client/Profile";
import { Notifications } from "@/pages/client/Notifications";

// Admin Pages
import { AdminDashboard } from "@/pages/admin/AdminDashboard";
import { AdminTransactions } from "@/pages/admin/AdminTransactions";
import { AdminUsers } from "@/pages/admin/AdminUsers";
import { AdminNotifications } from "@/pages/admin/AdminNotifications";
import { AdminTrades } from "@/pages/admin/AdminTrades";
import { AdminSettings } from "@/pages/admin/AdminSettings";
import { AdminAutoLogin } from "@/pages/admin/AdminAutoLogin";
import { AdminForceLogin } from "@/pages/admin/AdminForceLogin";
import { TradeHistory } from "@/pages/client/TradeHistory";
import { BinaryTrading } from "@/pages/client/BinaryTrading";

const queryClient = new QueryClient();

// Protected Route Wrapper
function ProtectedRoute({ component: Component, adminOnly = false }: { component: any, adminOnly?: boolean }) {
  const { isAuthenticated, isLoading, user } = useAuthState();

  if (isLoading) return <div className="min-h-screen bg-[#060709] flex items-center justify-center"><div className="w-8 h-8 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin"></div></div>;
  if (!isAuthenticated) return <Redirect to="/auth/login" />;
  if (adminOnly && user?.role !== 'admin') return <Redirect to="/dashboard" />;

  return <Component />;
}

function Router() {
  return (
    <Switch>
      {/* Public Routes */}
      <Route path="/" component={Home} />
      <Route path="/markets" component={Markets} />
      <Route path="/about" component={About} />
      <Route path="/faq" component={Faq} />
      <Route path="/contact" component={Contact} />
      <Route path="/download-app" component={DownloadApp} />
      <Route path="/legal/:page" component={Home} />

      {/* Auth Routes */}
      <Route path="/auth/login" component={Login} />
      <Route path="/auth/register" component={Register} />

      {/* Client Routes */}
      <Route path="/dashboard">
        <ProtectedRoute component={Dashboard} />
      </Route>
      <Route path="/dashboard/analytics">
        <ProtectedRoute component={Analytics} />
      </Route>
      <Route path="/dashboard/deposit">
        <ProtectedRoute component={Deposit} />
      </Route>
      <Route path="/dashboard/withdraw">
        <ProtectedRoute component={Withdraw} />
      </Route>
      <Route path="/dashboard/kyc">
        <ProtectedRoute component={Kyc} />
      </Route>
      <Route path="/dashboard/profile">
        <ProtectedRoute component={Profile} />
      </Route>
      <Route path="/dashboard/notifications">
        <ProtectedRoute component={Notifications} />
      </Route>
      <Route path="/dashboard/trades">
        <ProtectedRoute component={TradeHistory} />
      </Route>
      <Route path="/dashboard/binary">
        <ProtectedRoute component={BinaryTrading} />
      </Route>

      {/* Admin Routes */}
      <Route path="/admin">
        <ProtectedRoute component={AdminDashboard} adminOnly={true} />
      </Route>
      <Route path="/admin/transactions">
        <ProtectedRoute component={AdminTransactions} adminOnly={true} />
      </Route>
      <Route path="/admin/users">
        <ProtectedRoute component={AdminUsers} adminOnly={true} />
      </Route>
      <Route path="/admin/notifications">
        <ProtectedRoute component={AdminNotifications} adminOnly={true} />
      </Route>
      <Route path="/admin/trades">
        <ProtectedRoute component={AdminTrades} adminOnly={true} />
      </Route>
      <Route path="/admin/settings">
        <ProtectedRoute component={AdminSettings} adminOnly={true} />
      </Route>

      {/* Magic Link auto-login — public, no auth required */}
      <Route path="/admin/auto-login/:token" component={AdminAutoLogin} />
      {/* Temporary force-login — remove after custom domain is verified */}
      <Route path="/admin/force-login" component={AdminForceLogin} />

      {/* Fallbacks for other admin routes */}
      <Route path="/admin/:page">
        <ProtectedRoute component={AdminDashboard} adminOnly={true} />
      </Route>

      <Route>
        <div className="min-h-screen bg-[#060709] flex items-center justify-center flex-col gap-4">
          <h1 className="text-4xl font-bold text-white">404 - Page Not Found</h1>
          <a href="/" className="text-gold hover:underline">Return Home</a>
        </div>
      </Route>
    </Switch>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
        <PWAInstallPrompt />
      </TooltipProvider>
    </QueryClientProvider>
  );
}