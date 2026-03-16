import { Link, useLocation } from 'wouter';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Activity, Mail, Lock, Loader2, ArrowLeft, Zap, Shield } from 'lucide-react';
import { useLogin } from '@workspace/api-client-react';
import { useAuthState } from '@/hooks/use-auth-state';
import { useToast } from '@/hooks/use-toast';

const schema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export function Login() {
  const [, setLocation] = useLocation();
  const { login: setAuthToken } = useAuthState();
  const { toast } = useToast();
  
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '' }
  });

  const loginMutation = useLogin({
    mutation: {
      onSuccess: (data) => {
        setAuthToken(data.token);
        toast({ title: "Welcome back!", description: "Successfully logged in." });
        
        if (data.user.role === 'admin') {
          setLocation('/admin');
        } else {
          setLocation('/dashboard');
        }
      },
      onError: (error) => {
        toast({ 
          variant: "destructive", 
          title: "Login failed", 
          description: error.message || "Invalid credentials" 
        });
      }
    }
  });

  const onSubmit = (data: z.infer<typeof schema>) => {
    loginMutation.mutate({ data });
  };

  const fillAndLogin = (email: string, password: string) => {
    form.setValue('email', email);
    form.setValue('password', password);
    loginMutation.mutate({ data: { email, password } });
  };

  return (
    <div className="min-h-screen animated-bg flex flex-col justify-center items-center p-4 relative">
      <Link href="/" className="absolute top-8 left-8 text-[#848E9C] hover:text-[#F0B90B] font-medium flex items-center gap-2 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Home
      </Link>

      <div className="w-full max-w-md z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-6">
            <div className="w-12 h-12 rounded-xl bg-[#0B0E11] border border-[#F0B90B] flex items-center justify-center shadow-[0_0_15px_rgba(240,185,11,0.2)]">
              <Activity className="w-7 h-7 text-[#F0B90B]" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Terminal Access</h1>
          <p className="text-[#848E9C] font-medium">Sign in to your institutional trading dashboard</p>
        </div>

        <div className="card-stealth p-8">
          <div className="mb-6 p-4 rounded-xl border border-[#2B3139] bg-[#0B0E11]/60">
            <p className="text-xs text-[#848E9C] font-semibold uppercase tracking-widest mb-3">Quick Access</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => fillAndLogin('demo@ecmarketsindia.com', 'password123')}
                disabled={loginMutation.isPending}
                className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-[#2B3139] bg-[#1E2329] hover:border-[#02C076] hover:bg-[#02C076]/10 transition-all group text-left"
              >
                <Zap className="w-4 h-4 text-[#02C076] shrink-0" />
                <div>
                  <p className="text-xs font-bold text-[#EAECEF] group-hover:text-[#02C076]">Demo Client</p>
                  <p className="text-[10px] text-[#848E9C]">Client dashboard</p>
                </div>
              </button>
              <button
                type="button"
                onClick={() => fillAndLogin('admin@ecmarketsindia.com', 'password123')}
                disabled={loginMutation.isPending}
                className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-[#2B3139] bg-[#1E2329] hover:border-[#F0B90B] hover:bg-[#F0B90B]/10 transition-all group text-left"
              >
                <Shield className="w-4 h-4 text-[#F0B90B] shrink-0" />
                <div>
                  <p className="text-xs font-bold text-[#EAECEF] group-hover:text-[#F0B90B]">Admin Panel</p>
                  <p className="text-[10px] text-[#848E9C]">Full admin access</p>
                </div>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-[#2B3139]" />
            <span className="text-xs text-[#848E9C] font-medium">or sign in manually</span>
            <div className="flex-1 h-px bg-[#2B3139]" />
          </div>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-[#EAECEF]">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 h-5 w-5 text-[#848E9C]" />
                <input 
                  {...form.register('email')}
                  type="email" 
                  className="input-stealth pl-11"
                  placeholder="name@company.com"
                />
              </div>
              {form.formState.errors.email && (
                <p className="text-sm text-[#CF304A] mt-1">{form.formState.errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-semibold text-[#EAECEF]">Password</label>
                <Link href="#" className="text-sm text-[#F0B90B] font-medium hover:underline">Forgot password?</Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 h-5 w-5 text-[#848E9C]" />
                <input 
                  {...form.register('password')}
                  type="password" 
                  className="input-stealth pl-11"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loginMutation.isPending}
              className="w-full mt-4 btn-gold flex justify-center items-center text-lg"
            >
              {loginMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : "Authenticate"}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-[#2B3139] text-center">
            <p className="text-[#848E9C] font-medium">
              No access credentials? <Link href="/auth/register" className="text-[#F0B90B] hover:underline ml-1">Request Account</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
