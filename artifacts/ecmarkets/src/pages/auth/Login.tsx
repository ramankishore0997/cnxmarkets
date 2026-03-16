import { Link, useLocation } from 'wouter';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Activity, Mail, Lock, Loader2, ArrowLeft } from 'lucide-react';
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