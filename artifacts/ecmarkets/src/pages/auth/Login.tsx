import { Link, useLocation } from 'wouter';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useState } from 'react';
import { Mail, Lock, Loader2, Eye, EyeOff, CheckCircle2, AlertCircle, KeyRound, ArrowLeft, ExternalLink } from 'lucide-react';
import { useLogin } from '@workspace/api-client-react';
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
      style={{ background: '#1E2329', border: '1px solid #2B3139', color: '#EAECEF' }}
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

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

const forgotSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  newPassword: z.string().min(6, "New password must be at least 6 characters"),
});

const SUPPORT_EMAIL = 'support@cnxmarkets.com';

export function Login() {
  const [, setLocation] = useLocation();
  const { login: setAuthToken } = useAuthState();
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [showForgot, setShowForgot] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' }
  });

  const forgotForm = useForm<z.infer<typeof forgotSchema>>({
    resolver: zodResolver(forgotSchema),
    defaultValues: { email: '', newPassword: '' }
  });

  const loginMutation = useLogin({
    mutation: {
      onSuccess: (data) => {
        setAuthToken(data.token);
        setSuccessMsg('Login successful! Redirecting...');
        setErrorMsg('');
        setTimeout(() => {
          if (data.user.role === 'admin') {
            setLocation('/admin');
          } else {
            setLocation('/dashboard');
          }
        }, 600);
      },
      onError: (error) => {
        setErrorMsg(error.message || 'Invalid email or password. Please try again.');
        setSuccessMsg('');
      }
    }
  });

  const onSubmit = (data: z.infer<typeof loginSchema>) => {
    setErrorMsg('');
    setSuccessMsg('');
    loginMutation.mutate({ data: { ...data, email: data.email.trim().toLowerCase() } });
  };

  const onForgotSubmit = (data: z.infer<typeof forgotSchema>) => {
    const subject = encodeURIComponent('Password Reset Request — ECMarket Pro');
    const body = encodeURIComponent(
      `Hello ECMarket Pro Support,\n\nI would like to reset my account password. Please find my details below:\n\n` +
      `Registered Email: ${data.email.trim().toLowerCase()}\nRequested New Password: ${data.newPassword}\n\n` +
      `Kindly update my password at the earliest.\n\nThank you.`
    );
    window.location.href = `mailto:${SUPPORT_EMAIL}?subject=${subject}&body=${body}`;
    setForgotSent(true);
  };

  const inputStyle = (hasError: boolean) => ({
    background: '#1E2329',
    border: `1px solid ${hasError ? '#CF304A' : '#181B23'}`,
    color: '#EAECEF',
    boxShadow: hasError ? '0 0 0 3px rgba(207,48,74,0.1)' : 'none',
  });

  return (
    <div className="min-h-screen flex" style={{ background: '#060709' }}>
      {/* Left panel (desktop only) */}
      <div
        className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #060709 0%, #1a1f28 50%, #060709 100%)' }}
      >
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `radial-gradient(circle at 20% 80%, #00C27422 0%, transparent 50%),
              radial-gradient(circle at 80% 20%, #02C07611 0%, transparent 50%)`
          }}
        />
        <div className="relative z-10">
          <Link href="/">
            <div className="flex items-center gap-3 cursor-pointer">
              <EcmLogo size={40} />
              <span className="text-white font-bold text-xl tracking-tight">
                ECMarket<span style={{ color: '#00C274' }}> Pro</span>
              </span>
            </div>
          </Link>
        </div>
        <div className="relative z-10 space-y-8">
          <div>
            <h2 className="text-4xl font-bold text-white leading-tight mb-4">
              Algorithmic Trading<br />
              <span style={{ color: '#00C274' }}>At Scale</span>
            </h2>
            <p style={{ color: '#848E9C' }} className="text-lg leading-relaxed">
              Access institutional-grade automated strategies with real-time portfolio analytics and risk management.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { value: '10+ Yrs', label: 'In the Market' },
              { value: '₹1.2L Cr+', label: 'Assets Managed' },
              { value: '10 Lakh+', label: 'Active Traders' },
              { value: '24/7', label: 'Market Coverage' },
            ].map((stat) => (
              <div
                key={stat.label}
                className="p-4 rounded-2xl"
                style={{ background: 'rgba(30,35,41,0.8)', border: '1px solid rgba(43,49,57,0.8)' }}
              >
                <div className="text-2xl font-bold mb-1" style={{ color: '#00C274' }}>{stat.value}</div>
                <div className="text-sm" style={{ color: '#848E9C' }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="relative z-10">
          <p className="text-sm" style={{ color: '#848E9C' }}>
            © 2025 ECMarket Pro. Regulated algorithmic trading platform.
          </p>
        </div>
      </div>

      {/* Right panel */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-6 lg:p-12" style={{ background: '#0F1218' }}>
        <div className="w-full max-w-md">

          {/* Mobile brand */}
          <div className="lg:hidden flex items-center gap-3 mb-10">
            <Link href="/">
              <div className="flex items-center gap-3 cursor-pointer">
                <EcmLogo size={36} />
                <span className="text-white font-bold text-lg">
                  ECMarket<span style={{ color: '#00C274' }}> Pro</span>
                </span>
              </div>
            </Link>
          </div>

          {/* ── FORGOT PASSWORD PANEL ─────────────────────────────── */}
          {showForgot ? (
            <div>
              <button
                onClick={() => { setShowForgot(false); setForgotSent(false); forgotForm.reset(); }}
                className="flex items-center gap-2 text-sm font-medium mb-6 transition-colors"
                style={{ color: '#848E9C' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#00C274')}
                onMouseLeave={e => (e.currentTarget.style.color = '#848E9C')}
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Sign In
              </button>

              <div className="mb-7">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
                  style={{ background: 'rgba(0,194,116,0.12)', border: '1px solid rgba(0,194,116,0.25)' }}>
                  <KeyRound className="w-6 h-6" style={{ color: '#00C274' }} />
                </div>
                <h1 className="text-2xl font-bold text-white mb-2 tracking-tight">Reset Password</h1>
                <p style={{ color: '#848E9C' }} className="text-sm leading-relaxed">
                  Enter your registered email and desired new password. Clicking submit will open your mail app with a pre-filled message — just hit Send.
                </p>
              </div>

              {forgotSent ? (
                <div className="space-y-4">
                  <div
                    className="flex items-start gap-3 p-4 rounded-xl"
                    style={{ background: 'rgba(2,192,118,0.1)', border: '1px solid rgba(2,192,118,0.3)' }}
                  >
                    <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" style={{ color: '#02C076' }} />
                    <div>
                      <p className="text-sm font-bold leading-relaxed" style={{ color: '#02C076' }}>
                        Your mail app has opened!
                      </p>
                      <p className="text-xs mt-1 leading-relaxed" style={{ color: '#02C076' }}>
                        A draft email is ready — just press Send. Our team will reset your password within 24 hours.
                      </p>
                    </div>
                  </div>
                  <p className="text-center text-xs" style={{ color: '#848E9C' }}>
                    Mail app didn't open?{' '}
                    <a
                      href={`mailto:${SUPPORT_EMAIL}`}
                      className="underline font-semibold"
                      style={{ color: '#00C274' }}
                    >
                      {SUPPORT_EMAIL}
                    </a>{' '}
                    — email us directly.
                  </p>
                  <button
                    onClick={() => { setShowForgot(false); setForgotSent(false); forgotForm.reset(); }}
                    className="w-full py-3 rounded-xl font-semibold text-sm transition-all"
                    style={{ background: '#1E2329', border: '1px solid #181B23', color: '#848E9C' }}
                  >
                    Back to Sign In
                  </button>
                </div>
              ) : (
                <form onSubmit={forgotForm.handleSubmit(onForgotSubmit)} className="space-y-4">
                  {/* Email field */}
                  <div className="space-y-1.5">
                    <label className="block text-sm font-semibold" style={{ color: '#EAECEF' }}>
                      Registered Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#848E9C' }} />
                      <input
                        {...forgotForm.register('email')}
                        type="email"
                        autoComplete="email"
                        placeholder="your@email.com"
                        className="w-full pl-11 pr-4 py-3.5 rounded-xl text-sm font-medium outline-none transition-all duration-200"
                        style={inputStyle(!!forgotForm.formState.errors.email)}
                        onFocus={(e) => {
                          if (!forgotForm.formState.errors.email) {
                            e.target.style.border = '1px solid #00C274';
                            e.target.style.boxShadow = '0 0 0 3px rgba(0,194,116,0.1)';
                          }
                        }}
                        onBlur={(e) => {
                          if (!forgotForm.formState.errors.email) {
                            e.target.style.border = '1px solid #181B23';
                            e.target.style.boxShadow = 'none';
                          }
                        }}
                      />
                    </div>
                    {forgotForm.formState.errors.email && (
                      <p className="text-xs mt-1" style={{ color: '#CF304A' }}>{forgotForm.formState.errors.email.message}</p>
                    )}
                  </div>

                  {/* New password field */}
                  <div className="space-y-1.5">
                    <label className="block text-sm font-semibold" style={{ color: '#EAECEF' }}>
                      New Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#848E9C' }} />
                      <input
                        {...forgotForm.register('newPassword')}
                        type={showNewPass ? 'text' : 'password'}
                        autoComplete="new-password"
                        placeholder="Min. 6 characters"
                        className="w-full pl-11 pr-12 py-3.5 rounded-xl text-sm font-medium outline-none transition-all duration-200"
                        style={inputStyle(!!forgotForm.formState.errors.newPassword)}
                        onFocus={(e) => {
                          if (!forgotForm.formState.errors.newPassword) {
                            e.target.style.border = '1px solid #00C274';
                            e.target.style.boxShadow = '0 0 0 3px rgba(0,194,116,0.1)';
                          }
                        }}
                        onBlur={(e) => {
                          if (!forgotForm.formState.errors.newPassword) {
                            e.target.style.border = '1px solid #181B23';
                            e.target.style.boxShadow = 'none';
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPass(!showNewPass)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 transition-colors"
                        style={{ color: '#848E9C' }}
                      >
                        {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {forgotForm.formState.errors.newPassword && (
                      <p className="text-xs mt-1" style={{ color: '#CF304A' }}>{forgotForm.formState.errors.newPassword.message}</p>
                    )}
                  </div>

                  {/* Info box */}
                  <div className="flex items-start gap-2.5 p-3.5 rounded-xl"
                    style={{ background: 'rgba(0,194,116,0.07)', border: '1px solid rgba(0,194,116,0.2)' }}>
                    <ExternalLink className="w-4 h-4 shrink-0 mt-0.5" style={{ color: '#00C274' }} />
                    <p className="text-xs leading-relaxed" style={{ color: '#848E9C' }}>
                      Submit karte hi aapki <span style={{ color: '#00C274' }}>mail app</span> ek pre-filled email ke saath khulegi —{' '}
                      <span className="font-semibold" style={{ color: '#EAECEF' }}>{SUPPORT_EMAIL}</span>{' '}
                      ko. Bas <span style={{ color: '#00C274' }}>Send</span> karein.
                    </p>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 rounded-xl font-bold text-base flex items-center justify-center gap-2 transition-all duration-200"
                    style={{
                      background: 'linear-gradient(135deg, #00C274 0%, #00A85E 100%)',
                      color: '#060709',
                      boxShadow: '0 4px 20px rgba(0,194,116,0.3)',
                      cursor: 'pointer',
                    }}
                  >
                    <ExternalLink className="w-4 h-4" />
                    Mail App Kholein
                  </button>
                </form>
              )}
            </div>
          ) : (
            /* ── SIGN IN PANEL ──────────────────────────────────────── */
            <div>
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Welcome back</h1>
                <p style={{ color: '#848E9C' }}>Sign in to your trading dashboard</p>
              </div>

              {successMsg && (
                <div
                  className="flex items-center gap-3 p-4 rounded-xl mb-6"
                  style={{ background: 'rgba(2,192,118,0.1)', border: '1px solid rgba(2,192,118,0.3)' }}
                >
                  <CheckCircle2 className="w-5 h-5 shrink-0" style={{ color: '#02C076' }} />
                  <p className="text-sm font-medium" style={{ color: '#02C076' }}>{successMsg}</p>
                </div>
              )}

              {errorMsg && (
                <div
                  className="flex items-center gap-3 p-4 rounded-xl mb-6"
                  style={{ background: 'rgba(207,48,74,0.1)', border: '1px solid rgba(207,48,74,0.3)' }}
                >
                  <AlertCircle className="w-5 h-5 shrink-0" style={{ color: '#CF304A' }} />
                  <p className="text-sm font-medium" style={{ color: '#CF304A' }}>{errorMsg}</p>
                </div>
              )}

              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                {/* Email field */}
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold" style={{ color: '#EAECEF' }}>
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#848E9C' }} />
                    <input
                      {...form.register('email')}
                      type="email"
                      autoComplete="email"
                      placeholder="you@example.com"
                      className="w-full pl-11 pr-4 py-3.5 rounded-xl text-sm font-medium outline-none transition-all duration-200"
                      style={inputStyle(!!form.formState.errors.email)}
                      onFocus={(e) => {
                        if (!form.formState.errors.email) {
                          e.target.style.border = '1px solid #00C274';
                          e.target.style.boxShadow = '0 0 0 3px rgba(0,194,116,0.1)';
                        }
                      }}
                      onBlur={(e) => {
                        if (!form.formState.errors.email) {
                          e.target.style.border = '1px solid #181B23';
                          e.target.style.boxShadow = 'none';
                        }
                      }}
                    />
                  </div>
                  {form.formState.errors.email && (
                    <p className="text-xs mt-1" style={{ color: '#CF304A' }}>{form.formState.errors.email.message}</p>
                  )}
                </div>

                {/* Password field */}
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold" style={{ color: '#EAECEF' }}>Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#848E9C' }} />
                    <input
                      {...form.register('password')}
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      placeholder="Enter your password"
                      className="w-full pl-11 pr-12 py-3.5 rounded-xl text-sm font-medium outline-none transition-all duration-200"
                      style={inputStyle(!!form.formState.errors.password)}
                      onFocus={(e) => {
                        if (!form.formState.errors.password) {
                          e.target.style.border = '1px solid #00C274';
                          e.target.style.boxShadow = '0 0 0 3px rgba(0,194,116,0.1)';
                        }
                      }}
                      onBlur={(e) => {
                        if (!form.formState.errors.password) {
                          e.target.style.border = '1px solid #181B23';
                          e.target.style.boxShadow = 'none';
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 transition-colors"
                      style={{ color: '#848E9C' }}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {form.formState.errors.password && (
                    <p className="text-xs mt-1" style={{ color: '#CF304A' }}>{form.formState.errors.password.message}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loginMutation.isPending}
                  className="w-full py-3.5 rounded-xl font-bold text-base flex items-center justify-center gap-2 transition-all duration-200 mt-2"
                  style={{
                    background: loginMutation.isPending
                      ? 'rgba(0,194,116,0.5)'
                      : 'linear-gradient(135deg, #00C274 0%, #00A85E 100%)',
                    color: '#060709',
                    boxShadow: loginMutation.isPending ? 'none' : '0 4px 20px rgba(0,194,116,0.3)',
                    cursor: loginMutation.isPending ? 'not-allowed' : 'pointer',
                  }}
                >
                  {loginMutation.isPending ? (
                    <><Loader2 className="w-5 h-5 animate-spin" /> Signing in...</>
                  ) : 'Sign In'}
                </button>
              </form>

              {/* Google Sign In */}
              <div className="relative my-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full" style={{ borderTop: '1px solid #1E2329' }} />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-3 text-[#4B5563]" style={{ background: '#0F1218' }}>or continue with</span>
                </div>
              </div>

              <GoogleButton />

              {/* Forgot password link */}
              <div className="mt-2 text-center">
                <button
                  type="button"
                  onClick={() => { setShowForgot(true); setErrorMsg(''); setSuccessMsg(''); }}
                  className="text-sm font-medium transition-colors"
                  style={{ color: '#848E9C' }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#00C274')}
                  onMouseLeave={e => (e.currentTarget.style.color = '#848E9C')}
                >
                  Forgot your password? <span style={{ color: '#00C274' }}>Send reset request →</span>
                </button>
              </div>

              <div className="mt-4 pt-4 text-center" style={{ borderTop: '1px solid #181B23' }}>
                <p style={{ color: '#848E9C' }} className="text-sm">
                  Don't have an account?{' '}
                  <Link href="/auth/register" className="font-semibold hover:underline transition-colors" style={{ color: '#00C274' }}>
                    Create account
                  </Link>
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
