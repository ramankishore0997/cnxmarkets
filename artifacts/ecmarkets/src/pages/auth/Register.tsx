import { Link, useLocation } from 'wouter';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useState } from 'react';
import { Mail, Lock, Loader2, Eye, EyeOff, User, Phone, CheckCircle2, AlertCircle, Check } from 'lucide-react';
import { useRegister } from '@workspace/api-client-react';
import { useAuthState } from '@/hooks/use-auth-state';
import { EcmLogo } from '@/components/shared/EcmLogo';

const SUPABASE_URL = 'https://walzicfjkwiifeldzppx.supabase.co';

function GoogleButton() {
  const handleGoogleSignIn = () => {
    const base = import.meta.env.BASE_URL.replace(/\/$/, '');
    const redirectTo = `${window.location.origin}${base}/auth/callback`;
    const url = `${SUPABASE_URL}/auth/v1/authorize?provider=google&redirect_to=${encodeURIComponent(redirectTo)}`;
    window.location.href = url;
  };

  return (
    <button
      type="button"
      onClick={handleGoogleSignIn}
      className="w-full flex items-center justify-center gap-3 py-3.5 rounded-xl text-sm font-semibold transition-all hover:opacity-90"
      style={{ background: '#F7F9FC', border: '1px solid #E5E7EB', color: '#374151' }}
    >
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path d="M17.64 9.20454C17.64 8.56636 17.5827 7.95272 17.4764 7.36363H9V10.845H13.8436C13.635 11.97 13.0009 12.9231 12.0477 13.5613V15.8195H14.9564C16.6582 14.2527 17.64 11.9454 17.64 9.20454Z" fill="#4285F4"/>
        <path d="M9 18C11.43 18 13.4673 17.1941 14.9564 15.8195L12.0477 13.5613C11.2418 14.1013 10.2109 14.4204 9 14.4204C6.65591 14.4204 4.67182 12.8372 3.96409 10.71H0.957272V13.0418C2.43818 15.9831 5.48182 18 9 18Z" fill="#34A853"/>
        <path d="M3.96409 10.71C3.78409 10.17 3.68182 9.59318 3.68182 9C3.68182 8.40682 3.78409 7.83 3.96409 7.29V4.95818H0.957272C0.347727 6.17318 0 7.54772 0 9C0 10.4523 0.347727 11.8268 0.957272 13.0418L3.96409 10.71Z" fill="#FBBC05"/>
        <path d="M9 3.57955C10.3214 3.57955 11.5077 4.03364 12.4405 4.92545L15.0218 2.34409C13.4632 0.891818 11.4259 0 9 0C5.48182 0 2.43818 2.01682 0.957272 4.95818L3.96409 7.29C4.67182 5.16273 6.65591 3.57955 9 3.57955Z" fill="#EA4335"/>
      </svg>
      Continue with Google
    </button>
  );
}

const schema = z.object({
  fullName: z.string().min(3, "Please enter your full name"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().min(7, "Please enter a valid phone number"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type FormValues = z.infer<typeof schema>;

function getPasswordStrength(password: string) {
  if (!password) return { score: 0, label: '', color: '' };
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  const map = [
    { label: 'Weak', color: '#DC2626' },
    { label: 'Fair', color: '#1F77B4' },
    { label: 'Good', color: '#1F77B4' },
    { label: 'Strong', color: '#16A34A' },
    { label: 'Very Strong', color: '#16A34A' },
  ];
  return { score, ...map[score] };
}

export function Register() {
  const [, setLocation] = useLocation();
  const { login: setAuthToken } = useAuthState();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [passwordValue, setPasswordValue] = useState('');

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { fullName: '', email: '', phone: '', password: '', confirmPassword: '' }
  });

  const registerMutation = useRegister({
    mutation: {
      onSuccess: (data) => {
        setAuthToken(data.token);
        setSuccessMsg('Account created! Redirecting to your dashboard...');
        setErrorMsg('');
        setTimeout(() => setLocation('/dashboard'), 800);
      },
      onError: (error) => {
        setErrorMsg(error.message || 'Registration failed. Please try again.');
        setSuccessMsg('');
      }
    }
  });

  const onSubmit = (data: FormValues) => {
    setErrorMsg('');
    setSuccessMsg('');
    const nameParts = data.fullName.trim().split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ') || nameParts[0];
    registerMutation.mutate({
      data: { firstName, lastName, email: data.email, password: data.password, phone: data.phone, country: '' }
    });
  };

  const strength = getPasswordStrength(passwordValue);

  const inputBaseStyle = (hasError: boolean): React.CSSProperties => ({
    background: '#F7F9FC',
    border: `1px solid ${hasError ? '#DC2626' : '#E5E7EB'}`,
    color: '#374151',
    boxShadow: hasError ? '0 0 0 3px rgba(220,38,38,0.1)' : 'none'
  });

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>, hasError: boolean) => {
    if (!hasError) {
      e.target.style.border = '1px solid #1F77B4';
      e.target.style.boxShadow = '0 0 0 3px rgba(31,119,180,0.1)';
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>, hasError: boolean) => {
    if (!hasError) {
      e.target.style.border = '1px solid #E5E7EB';
      e.target.style.boxShadow = 'none';
    }
  };

  const benefits = [
    'Institutional-grade algorithmic strategies',
    'Real-time portfolio analytics & risk management',
    'Automated 24/7 trading across global markets',
    'Dedicated account manager & priority support',
  ];

  return (
    <div className="min-h-screen flex" style={{ background: '#FFFFFF' }}>
      <div
        className="hidden lg:flex lg:w-5/12 flex-col justify-between p-12 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0B3C5D 0%, #174A7C 60%, #0B3C5D 100%)' }}
      >
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `radial-gradient(circle at 20% 80%, #1F77B422 0%, transparent 50%),
              radial-gradient(circle at 80% 20%, #16A34A11 0%, transparent 50%)`
          }}
        />
        <div className="relative z-10">
          <Link href="/">
            <div className="flex items-center gap-3 cursor-pointer">
              <EcmLogo size={40} />
              <span className="font-bold text-xl tracking-tight text-white">
                ECMarket<span style={{ color: '#60C0F0' }}> Pro</span>
              </span>
            </div>
          </Link>
        </div>
        <div className="relative z-10 space-y-8">
          <div>
            <h2 className="text-4xl font-bold text-white leading-tight mb-4">
              Start Trading<br />
              <span style={{ color: '#60C0F0' }}>Smarter Today</span>
            </h2>
            <p style={{ color: 'rgba(234,242,248,0.75)' }} className="text-lg leading-relaxed">
              UAE-regulated forex broker — join 10 Lakh+ traders growing with ECMarket Pro.
            </p>
          </div>
          <div className="space-y-4">
            {benefits.map((benefit) => (
              <div key={benefit} className="flex items-start gap-3">
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                  style={{ background: 'rgba(96,192,240,0.2)', border: '1px solid rgba(96,192,240,0.35)' }}
                >
                  <Check className="w-3.5 h-3.5" style={{ color: '#60C0F0' }} />
                </div>
                <p className="text-sm leading-relaxed" style={{ color: 'rgba(234,242,248,0.8)' }}>{benefit}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="relative z-10">
          <p className="text-sm" style={{ color: 'rgba(234,242,248,0.5)' }}>
            © 2025 ECMarket Pro. UAE-regulated forex broker.
          </p>
        </div>
      </div>

      <div className="w-full lg:w-7/12 flex flex-col justify-center items-center p-6 lg:p-12 overflow-y-auto" style={{ background: '#F7F9FC' }}>
        <div className="w-full max-w-lg py-8">
          <div className="lg:hidden flex items-center gap-3 mb-10">
            <Link href="/">
              <div className="flex items-center gap-3 cursor-pointer">
                <EcmLogo size={36} />
                <span className="text-white font-bold text-lg">
                  ECMarket<span style={{ color: '#1F77B4' }}> Pro</span>
                </span>
              </div>
            </Link>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2 tracking-tight" style={{ color: "#111827" }}>Create your account</h1>
            <p style={{ color: '#6B7280' }}>Join the institutional trading network</p>
          </div>

          {successMsg && (
            <div
              className="flex items-center gap-3 p-4 rounded-xl mb-6"
              style={{ background: 'rgba(22,163,74,0.1)', border: '1px solid rgba(22,163,74,0.3)' }}
            >
              <CheckCircle2 className="w-5 h-5 shrink-0" style={{ color: '#16A34A' }} />
              <p className="text-sm font-medium" style={{ color: '#16A34A' }}>{successMsg}</p>
            </div>
          )}

          {errorMsg && (
            <div
              className="flex items-center gap-3 p-4 rounded-xl mb-6"
              style={{ background: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.3)' }}
            >
              <AlertCircle className="w-5 h-5 shrink-0" style={{ color: '#DC2626' }} />
              <p className="text-sm font-medium" style={{ color: '#DC2626' }}>{errorMsg}</p>
            </div>
          )}

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold" style={{ color: '#374151' }}>Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#6B7280' }} />
                <input
                  {...form.register('fullName')}
                  type="text"
                  autoComplete="name"
                  placeholder="John Smith"
                  className="w-full pl-11 pr-4 py-3.5 rounded-xl text-sm font-medium outline-none transition-all duration-200"
                  style={inputBaseStyle(!!form.formState.errors.fullName)}
                  onFocus={(e) => handleFocus(e, !!form.formState.errors.fullName)}
                  onBlur={(e) => handleBlur(e, !!form.formState.errors.fullName)}
                />
              </div>
              {form.formState.errors.fullName && (
                <p className="text-xs mt-1" style={{ color: '#DC2626' }}>{form.formState.errors.fullName.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-semibold" style={{ color: '#374151' }}>Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#6B7280' }} />
                <input
                  {...form.register('email')}
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  className="w-full pl-11 pr-4 py-3.5 rounded-xl text-sm font-medium outline-none transition-all duration-200"
                  style={inputBaseStyle(!!form.formState.errors.email)}
                  onFocus={(e) => handleFocus(e, !!form.formState.errors.email)}
                  onBlur={(e) => handleBlur(e, !!form.formState.errors.email)}
                />
              </div>
              {form.formState.errors.email && (
                <p className="text-xs mt-1" style={{ color: '#DC2626' }}>{form.formState.errors.email.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-semibold" style={{ color: '#374151' }}>Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#6B7280' }} />
                <input
                  {...form.register('phone')}
                  type="tel"
                  autoComplete="tel"
                  placeholder="+1 234 567 8900"
                  className="w-full pl-11 pr-4 py-3.5 rounded-xl text-sm font-medium outline-none transition-all duration-200"
                  style={inputBaseStyle(!!form.formState.errors.phone)}
                  onFocus={(e) => handleFocus(e, !!form.formState.errors.phone)}
                  onBlur={(e) => handleBlur(e, !!form.formState.errors.phone)}
                />
              </div>
              {form.formState.errors.phone && (
                <p className="text-xs mt-1" style={{ color: '#DC2626' }}>{form.formState.errors.phone.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-semibold" style={{ color: '#374151' }}>Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#6B7280' }} />
                <input
                  {...form.register('password')}
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="Min. 8 characters"
                  className="w-full pl-11 pr-12 py-3.5 rounded-xl text-sm font-medium outline-none transition-all duration-200"
                  style={inputBaseStyle(!!form.formState.errors.password)}
                  onFocus={(e) => handleFocus(e, !!form.formState.errors.password)}
                  onBlur={(e) => handleBlur(e, !!form.formState.errors.password)}
                  onChange={(e) => {
                    form.register('password').onChange(e);
                    setPasswordValue(e.target.value);
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: '#6B7280' }}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {passwordValue && (
                <div className="mt-2 space-y-1.5">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="h-1 flex-1 rounded-full transition-all duration-300"
                        style={{ background: i <= strength.score ? strength.color : '#E5E7EB' }}
                      />
                    ))}
                  </div>
                  {strength.label && (
                    <p className="text-xs font-medium" style={{ color: strength.color }}>{strength.label}</p>
                  )}
                </div>
              )}
              {form.formState.errors.password && (
                <p className="text-xs mt-1" style={{ color: '#DC2626' }}>{form.formState.errors.password.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-semibold" style={{ color: '#374151' }}>Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#6B7280' }} />
                <input
                  {...form.register('confirmPassword')}
                  type={showConfirm ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="Re-enter your password"
                  className="w-full pl-11 pr-12 py-3.5 rounded-xl text-sm font-medium outline-none transition-all duration-200"
                  style={inputBaseStyle(!!form.formState.errors.confirmPassword)}
                  onFocus={(e) => handleFocus(e, !!form.formState.errors.confirmPassword)}
                  onBlur={(e) => handleBlur(e, !!form.formState.errors.confirmPassword)}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: '#6B7280' }}
                >
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {form.formState.errors.confirmPassword && (
                <p className="text-xs mt-1" style={{ color: '#DC2626' }}>{form.formState.errors.confirmPassword.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={registerMutation.isPending}
              className="w-full py-3.5 rounded-xl font-bold text-base flex items-center justify-center gap-2 transition-all duration-200 mt-2"
              style={{
                background: registerMutation.isPending
                  ? 'rgba(31,119,180,0.5)'
                  : 'linear-gradient(135deg, #1F77B4 0%, #2e8fd1 100%)',
                color: '#FFFFFF',
                boxShadow: registerMutation.isPending ? 'none' : '0 4px 20px rgba(31,119,180,0.3)',
                cursor: registerMutation.isPending ? 'not-allowed' : 'pointer'
              }}
              onMouseEnter={(e) => {
                if (!registerMutation.isPending) {
                  (e.currentTarget).style.transform = 'translateY(-1px)';
                  (e.currentTarget).style.boxShadow = '0 6px 24px rgba(31,119,180,0.45)';
                }
              }}
              onMouseLeave={(e) => {
                (e.currentTarget).style.transform = 'translateY(0)';
                (e.currentTarget).style.boxShadow = registerMutation.isPending ? 'none' : '0 4px 20px rgba(31,119,180,0.3)';
              }}
            >
              {registerMutation.isPending ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Creating account...
                </>
              ) : 'Create Account'}
            </button>

            <p className="text-xs text-center" style={{ color: '#6B7280' }}>
              By creating an account, you agree to our{' '}
              <Link href="#" className="hover:underline" style={{ color: '#1F77B4' }}>Terms of Service</Link>
              {' '}and{' '}
              <Link href="#" className="hover:underline" style={{ color: '#1F77B4' }}>Privacy Policy</Link>.
            </p>
          </form>

          {/* Google Sign Up */}
          <div className="relative mt-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full" style={{ borderTop: '1px solid #F7F9FC' }} />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-3 text-[#4B5563]" style={{ background: '#F7F9FC' }}>or sign up with</span>
            </div>
          </div>

          <GoogleButton />

          <div className="mt-4 pt-4 text-center" style={{ borderTop: '1px solid #E5E7EB' }}>
            <p style={{ color: '#6B7280' }} className="text-sm">
              Already have an account?{' '}
              <Link href="/auth/login" className="font-semibold hover:underline transition-colors" style={{ color: '#1F77B4' }}>
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
