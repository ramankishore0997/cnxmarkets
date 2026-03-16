import { Link, useLocation } from 'wouter';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Activity, Loader2, ArrowLeft } from 'lucide-react';
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
    <div className="min-h-screen bg-[#f5f7fb] flex flex-col justify-center items-center p-4 relative py-12">
      <Link href="/" className="absolute top-8 left-8 text-gray-500 hover:text-primary font-medium flex items-center gap-2 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Home
      </Link>

      <div className="w-full max-w-xl z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-6">
            <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
              <Activity className="w-7 h-7 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2 tracking-tight">Create an Account</h1>
          <p className="text-gray-500 font-medium">Join our institutional trading platform</p>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">First Name</label>
                <input 
                  {...form.register('firstName')}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 text-gray-900 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary focus:bg-white transition-all shadow-sm"
                  placeholder="John"
                />
                {form.formState.errors.firstName && <p className="text-xs text-red-500">{form.formState.errors.firstName.message}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Last Name</label>
                <input 
                  {...form.register('lastName')}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 text-gray-900 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary focus:bg-white transition-all shadow-sm"
                  placeholder="Doe"
                />
                {form.formState.errors.lastName && <p className="text-xs text-red-500">{form.formState.errors.lastName.message}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Email Address</label>
              <input 
                {...form.register('email')}
                type="email"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 text-gray-900 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary focus:bg-white transition-all shadow-sm"
                placeholder="john@example.com"
              />
              {form.formState.errors.email && <p className="text-xs text-red-500">{form.formState.errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Password</label>
              <input 
                {...form.register('password')}
                type="password"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 text-gray-900 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary focus:bg-white transition-all shadow-sm"
                placeholder="Min 8 characters"
              />
              {form.formState.errors.password && <p className="text-xs text-red-500">{form.formState.errors.password.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Country of Residence</label>
              <input 
                {...form.register('country')}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 text-gray-900 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary focus:bg-white transition-all shadow-sm"
                placeholder="e.g. India"
              />
              {form.formState.errors.country && <p className="text-xs text-red-500">{form.formState.errors.country.message}</p>}
            </div>
            
            <div className="pt-2">
              <p className="text-xs text-gray-500 mb-4 text-center">
                By registering, you agree to our Terms of Service and Privacy Policy.
              </p>
              <button 
                type="submit" 
                disabled={registerMutation.isPending}
                className="w-full py-3.5 rounded-xl font-bold btn-primary flex justify-center items-center text-lg"
              >
                {registerMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : "Complete Registration"}
              </button>
            </div>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-100 text-center">
            <p className="text-gray-600 font-medium">
              Already have an account? <Link href="/auth/login" className="text-primary hover:underline ml-1">Sign In</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
