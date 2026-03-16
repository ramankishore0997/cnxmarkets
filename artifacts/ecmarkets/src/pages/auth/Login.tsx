import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Activity, Mail, Lock, Loader2 } from 'lucide-react';
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
    <div className="min-h-screen bg-background flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Background effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/20 rounded-full blur-[120px] opacity-50 pointer-events-none" />

      <div className="w-full max-w-md z-10">
        <div className="text-center mb-10">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20">
              <Activity className="w-6 h-6 text-white" />
            </div>
          </Link>
          <h1 className="text-3xl font-bold text-white mb-2">Sign in to ECMarkets</h1>
          <p className="text-muted-foreground">Access your institutional trading dashboard</p>
        </div>

        <div className="glass-card p-8 rounded-2xl">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-white">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                <input 
                  {...form.register('email')}
                  type="email" 
                  className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white placeholder:text-white/30 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  placeholder="name@company.com"
                />
              </div>
              {form.formState.errors.email && (
                <p className="text-sm text-red-500 mt-1">{form.formState.errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-white">Password</label>
                <Link href="#" className="text-sm text-primary hover:text-blue-400">Forgot password?</Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                <input 
                  {...form.register('password')}
                  type="password" 
                  className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white placeholder:text-white/30 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loginMutation.isPending}
              className="w-full py-3.5 rounded-xl font-semibold bg-primary text-white shadow-lg shadow-primary/25 hover:shadow-primary/40 active:scale-[0.98] transition-all disabled:opacity-50 flex justify-center items-center"
            >
              {loginMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : "Sign In"}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-muted-foreground">
              Don't have an account? <Link href="/auth/register" className="text-white font-medium hover:text-primary transition-colors">Create one</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
