import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuthState } from "@/hooks/use-auth-state";

// Public Pages
import { Home } from "@/pages/public/Home";
import { Markets } from "@/pages/public/Markets";
import { Strategies } from "@/pages/public/Strategies";
import { About } from "@/pages/public/About";
import { Performance } from "@/pages/public/Performance";
import { Pricing } from "@/pages/public/Pricing";
import { Faq } from "@/pages/public/Faq";
import { Contact } from "@/pages/public/Contact";

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
import { AdminKyc } from "@/pages/admin/AdminKyc";
import { AdminUsers } from "@/pages/admin/AdminUsers";
import { AdminNotifications } from "@/pages/admin/AdminNotifications";
import { AdminTrades } from "@/pages/admin/AdminTrades";
import { AdminStrategies } from "@/pages/admin/AdminStrategies";
import { SelectStrategy } from "@/pages/client/SelectStrategy";

const queryClient = new QueryClient();

// Protected Route Wrapper
function ProtectedRoute({ component: Component, adminOnly = false }: { component: any, adminOnly?: boolean }) {
  const { isAuthenticated, isLoading, user } = useAuthState();

  if (isLoading) return <div className="min-h-screen bg-[#0B0E11] flex items-center justify-center"><div className="w-8 h-8 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin"></div></div>;
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
      <Route path="/strategies" component={Strategies} />
      <Route path="/about" component={About} />
      <Route path="/performance" component={Performance} />
      <Route path="/pricing" component={Pricing} />
      <Route path="/faq" component={Faq} />
      <Route path="/contact" component={Contact} />
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
      <Route path="/dashboard/strategies">
        <ProtectedRoute component={SelectStrategy} />
      </Route>

      {/* Admin Routes */}
      <Route path="/admin">
        <ProtectedRoute component={AdminDashboard} adminOnly={true} />
      </Route>
      <Route path="/admin/transactions">
        <ProtectedRoute component={AdminTransactions} adminOnly={true} />
      </Route>
      <Route path="/admin/kyc">
        <ProtectedRoute component={AdminKyc} adminOnly={true} />
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
      <Route path="/admin/strategies">
        <ProtectedRoute component={AdminStrategies} adminOnly={true} />
      </Route>
      {/* Fallbacks for other admin routes */}
      <Route path="/admin/:page">
        <ProtectedRoute component={AdminDashboard} adminOnly={true} />
      </Route>

      <Route>
        <div className="min-h-screen bg-[#0B0E11] flex items-center justify-center flex-col gap-4">
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
      </TooltipProvider>
    </QueryClientProvider>
  );
}