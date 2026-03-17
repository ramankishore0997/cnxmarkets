import { Link, useLocation } from 'wouter';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useState } from 'react';
import { TrendingUp, Mail, Lock, Loader2, Eye, EyeOff, CheckCircle2, AlertCircle, KeyRound, ArrowLeft, Send } from 'lucide-react';
import { useLogin } from '@workspace/api-client-react';
import { useAuthState } from '@/hooks/use-auth-state';

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

const forgotSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

export function Login() {
  const [, setLocation] = useLocation();
  const { login: setAuthToken } = useAuthState();
  const [showPassword, setShowPassword] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [showForgot, setShowForgot] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSuccess, setForgotSuccess] = useState('');
  const [forgotError, setForgotError] = useState('');

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' }
  });

  const forgotForm = useForm<z.infer<typeof forgotSchema>>({
    resolver: zodResolver(forgotSchema),
    defaultValues: { email: '' }
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

  const onForgotSubmit = async (data: z.infer<typeof forgotSchema>) => {
    setForgotError('');
    setForgotSuccess('');
    setForgotLoading(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: data.email.trim().toLowerCase() }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Something went wrong');
      setForgotSuccess('Request sent! Our team will contact you within 24 hours to help reset your password.');
    } catch (err: any) {
      setForgotError(err.message || 'Failed to send request. Please try again.');
    } finally {
      setForgotLoading(false);
    }
  };

  const inputStyle = (hasError: boolean) => ({
    background: '#1E2329',
    border: `1px solid ${hasError ? '#CF304A' : '#2B3139'}`,
    color: '#EAECEF',
    boxShadow: hasError ? '0 0 0 3px rgba(207,48,74,0.1)' : 'none',
  });

  return (
    <div className="min-h-screen flex" style={{ background: '#0B0E11' }}>
      {/* Left panel (desktop only) */}
      <div
        className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0B0E11 0%, #1a1f28 50%, #0B0E11 100%)' }}
      >
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `radial-gradient(circle at 20% 80%, #F0B90B22 0%, transparent 50%),
              radial-gradient(circle at 80% 20%, #02C07611 0%, transparent 50%)`
          }}
        />
        <div className="relative z-10">
          <Link href="/">
            <div className="flex items-center gap-3 cursor-pointer">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #F0B90B, #d4a100)', boxShadow: '0 0 20px rgba(240,185,11,0.3)' }}
              >
                <TrendingUp className="w-5 h-5 text-black" />
              </div>
              <span className="text-white font-bold text-xl tracking-tight">ECMarketsIndia</span>
            </div>
          </Link>
        </div>
        <div className="relative z-10 space-y-8">
          <div>
            <h2 className="text-4xl font-bold text-white leading-tight mb-4">
              Algorithmic Trading<br />
              <span style={{ color: '#F0B90B' }}>At Scale</span>
            </h2>
            <p style={{ color: '#848E9C' }} className="text-lg leading-relaxed">
              Access institutional-grade automated strategies with real-time portfolio analytics and risk management.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { value: '94.3%', label: 'Win Rate' },
              { value: '₹2.8Cr+', label: 'Assets Managed' },
              { value: '12+', label: 'Live Strategies' },
              { value: '24/7', label: 'Market Coverage' },
            ].map((stat) => (
              <div
                key={stat.label}
                className="p-4 rounded-2xl"
                style={{ background: 'rgba(30,35,41,0.8)', border: '1px solid rgba(43,49,57,0.8)' }}
              >
                <div className="text-2xl font-bold mb-1" style={{ color: '#F0B90B' }}>{stat.value}</div>
                <div className="text-sm" style={{ color: '#848E9C' }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="relative z-10">
          <p className="text-sm" style={{ color: '#848E9C' }}>
            © 2025 ECMarketsIndia. Regulated algorithmic trading platform.
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
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #F0B90B, #d4a100)' }}
                >
                  <TrendingUp className="w-4 h-4 text-black" />
                </div>
                <span className="text-white font-bold text-lg">ECMarketsIndia</span>
              </div>
            </Link>
          </div>

          {/* ── FORGOT PASSWORD PANEL ─────────────────────────────── */}
          {showForgot ? (
            <div>
              <button
                onClick={() => { setShowForgot(false); setForgotSuccess(''); setForgotError(''); forgotForm.reset(); }}
                className="flex items-center gap-2 text-sm font-medium mb-6 transition-colors"
                style={{ color: '#848E9C' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#F0B90B')}
                onMouseLeave={e => (e.currentTarget.style.color = '#848E9C')}
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Sign In
              </button>

              <div className="mb-7">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
                  style={{ background: 'rgba(240,185,11,0.12)', border: '1px solid rgba(240,185,11,0.25)' }}>
                  <KeyRound className="w-6 h-6" style={{ color: '#F0B90B' }} />
                </div>
                <h1 className="text-2xl font-bold text-white mb-2 tracking-tight">Reset Password</h1>
                <p style={{ color: '#848E9C' }} className="text-sm leading-relaxed">
                  Enter your registered email address. Our team will contact you within 24 hours to help you reset your password.
                </p>
              </div>

              {forgotSuccess ? (
                <div
                  className="flex items-start gap-3 p-4 rounded-xl mb-6"
                  style={{ background: 'rgba(2,192,118,0.1)', border: '1px solid rgba(2,192,118,0.3)' }}
                >
                  <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" style={{ color: '#02C076' }} />
                  <p className="text-sm font-medium leading-relaxed" style={{ color: '#02C076' }}>{forgotSuccess}</p>
                </div>
              ) : (
                <form onSubmit={forgotForm.handleSubmit(onForgotSubmit)} className="space-y-4">
                  {forgotError && (
                    <div
                      className="flex items-center gap-3 p-4 rounded-xl"
                      style={{ background: 'rgba(207,48,74,0.1)', border: '1px solid rgba(207,48,74,0.3)' }}
                    >
                      <AlertCircle className="w-5 h-5 shrink-0" style={{ color: '#CF304A' }} />
                      <p className="text-sm font-medium" style={{ color: '#CF304A' }}>{forgotError}</p>
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <label className="block text-sm font-semibold" style={{ color: '#EAECEF' }}>
                      Email Address
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
                            e.target.style.border = '1px solid #F0B90B';
                            e.target.style.boxShadow = '0 0 0 3px rgba(240,185,11,0.1)';
                          }
                        }}
                        onBlur={(e) => {
                          if (!forgotForm.formState.errors.email) {
                            e.target.style.border = '1px solid #2B3139';
                            e.target.style.boxShadow = 'none';
                          }
                        }}
                      />
                    </div>
                    {forgotForm.formState.errors.email && (
                      <p className="text-xs mt-1" style={{ color: '#CF304A' }}>{forgotForm.formState.errors.email.message}</p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="w-full py-3.5 rounded-xl font-bold text-base flex items-center justify-center gap-2 transition-all duration-200 mt-2"
                    style={{
                      background: forgotLoading ? 'rgba(240,185,11,0.5)' : 'linear-gradient(135deg, #F0B90B 0%, #d4a100 100%)',
                      color: '#0B0E11',
                      boxShadow: forgotLoading ? 'none' : '0 4px 20px rgba(240,185,11,0.3)',
                      cursor: forgotLoading ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {forgotLoading ? (
                      <><Loader2 className="w-5 h-5 animate-spin" /> Sending...</>
                    ) : (
                      <><Send className="w-4 h-4" /> Send Reset Request</>
                    )}
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
                          e.target.style.border = '1px solid #F0B90B';
                          e.target.style.boxShadow = '0 0 0 3px rgba(240,185,11,0.1)';
                        }
                      }}
                      onBlur={(e) => {
                        if (!form.formState.errors.email) {
                          e.target.style.border = '1px solid #2B3139';
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
                          e.target.style.border = '1px solid #F0B90B';
                          e.target.style.boxShadow = '0 0 0 3px rgba(240,185,11,0.1)';
                        }
                      }}
                      onBlur={(e) => {
                        if (!form.formState.errors.password) {
                          e.target.style.border = '1px solid #2B3139';
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
                      ? 'rgba(240,185,11,0.5)'
                      : 'linear-gradient(135deg, #F0B90B 0%, #d4a100 100%)',
                    color: '#0B0E11',
                    boxShadow: loginMutation.isPending ? 'none' : '0 4px 20px rgba(240,185,11,0.3)',
                    cursor: loginMutation.isPending ? 'not-allowed' : 'pointer',
                  }}
                >
                  {loginMutation.isPending ? (
                    <><Loader2 className="w-5 h-5 animate-spin" /> Signing in...</>
                  ) : 'Sign In'}
                </button>
              </form>

              {/* Forgot password link */}
              <div className="mt-4 text-center">
                <button
                  type="button"
                  onClick={() => { setShowForgot(true); setErrorMsg(''); setSuccessMsg(''); }}
                  className="text-sm font-medium transition-colors"
                  style={{ color: '#848E9C' }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#F0B90B')}
                  onMouseLeave={e => (e.currentTarget.style.color = '#848E9C')}
                >
                  Forgot your password? <span style={{ color: '#F0B90B' }}>Send reset request →</span>
                </button>
              </div>

              <p className="text-center text-sm mt-4" style={{ color: '#848E9C' }}>
                Access your trading dashboard securely.
              </p>

              <div className="mt-6 pt-6 text-center" style={{ borderTop: '1px solid #2B3139' }}>
                <p style={{ color: '#848E9C' }} className="text-sm">
                  Don't have an account?{' '}
                  <Link href="/auth/register" className="font-semibold hover:underline transition-colors" style={{ color: '#F0B90B' }}>
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
