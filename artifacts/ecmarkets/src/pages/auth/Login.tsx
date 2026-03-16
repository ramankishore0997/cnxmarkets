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
    <div className="min-h-screen bg-[#f5f7fb] flex flex-col justify-center items-center p-4 relative">
      <Link href="/" className="absolute top-8 left-8 text-gray-500 hover:text-primary font-medium flex items-center gap-2 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Home
      </Link>

      <div className="w-full max-w-md z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-6">
            <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
              <Activity className="w-7 h-7 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2 tracking-tight">Welcome Back</h1>
          <p className="text-gray-500 font-medium">Sign in to your institutional trading dashboard</p>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 h-5 w-5 text-gray-400" />
                <input 
                  {...form.register('email')}
                  type="email" 
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-11 pr-4 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary focus:bg-white transition-all shadow-sm"
                  placeholder="name@company.com"
                />
              </div>
              {form.formState.errors.email && (
                <p className="text-sm text-red-500 mt-1">{form.formState.errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-semibold text-gray-700">Password</label>
                <Link href="#" className="text-sm text-primary font-medium hover:underline">Forgot password?</Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 h-5 w-5 text-gray-400" />
                <input 
                  {...form.register('password')}
                  type="password" 
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-11 pr-4 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary focus:bg-white transition-all shadow-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loginMutation.isPending}
              className="w-full py-3.5 mt-2 rounded-xl font-bold btn-primary flex justify-center items-center text-lg"
            >
              {loginMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : "Sign In"}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-100 text-center">
            <p className="text-gray-600 font-medium">
              Don't have an account? <Link href="/auth/register" className="text-primary hover:underline ml-1">Create one</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
