import { Link, useLocation } from 'wouter';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Activity, Loader2 } from 'lucide-react';
import { useRegister } from '@workspace/api-client-react';
import { useAuthState } from '@/hooks/use-auth-state';
import { useToast } from '@/hooks/use-toast';

const schema = z.object({
  firstName: z.string().min(2, "First name required"),
  lastName: z.string().min(2, "Last name required"),
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Password must be at least 8 chars"),
  country: z.string().min(2, "Country required")
});

export function Register() {
  const [, setLocation] = useLocation();
  const { login: setAuthToken } = useAuthState();
  const { toast } = useToast();
  
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { firstName: '', lastName: '', email: '', password: '', country: '' }
  });

  const registerMutation = useRegister({
    mutation: {
      onSuccess: (data) => {
        setAuthToken(data.token);
        toast({ title: "Account created!", description: "Welcome to ECMarketsIndia." });
        setLocation('/dashboard');
      },
      onError: (error) => {
        toast({ variant: "destructive", title: "Registration failed", description: error.message });
      }
    }
  });

  const onSubmit = (data: z.infer<typeof schema>) => {
    registerMutation.mutate({ data });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center p-4 relative py-12">
      <div className="w-full max-w-xl z-10">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20">
              <Activity className="w-6 h-6 text-white" />
            </div>
          </Link>
          <h1 className="text-3xl font-bold text-white mb-2">Create an Account</h1>
          <p className="text-muted-foreground">Join our institutional trading platform</p>
        </div>

        <div className="glass-card p-8 rounded-2xl">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-white">First Name</label>
                <input 
                  {...form.register('firstName')}
                  className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-white focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-white">Last Name</label>
                <input 
                  {...form.register('lastName')}
                  className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-white focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-white">Email Address</label>
              <input 
                {...form.register('email')}
                type="email"
                className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-white focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-white">Password</label>
              <input 
                {...form.register('password')}
                type="password"
                className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-white focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-white">Country</label>
              <input 
                {...form.register('country')}
                className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-white focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              />
            </div>

            <button 
              type="submit" 
              disabled={registerMutation.isPending}
              className="w-full py-3.5 rounded-xl font-semibold bg-primary text-white shadow-lg shadow-primary/25 hover:shadow-primary/40 active:scale-[0.98] transition-all disabled:opacity-50 flex justify-center"
            >
              {registerMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : "Complete Registration"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-muted-foreground text-sm">
              Already have an account? <Link href="/auth/login" className="text-white font-medium hover:text-primary transition-colors">Sign In</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
