import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { Loader2, ShieldCheck, AlertTriangle } from 'lucide-react';

export function AdminForceLogin() {
  const [, navigate] = useLocation();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/admin/force-login');
        if (!res.ok) {
          const j = await res.json().catch(() => ({}));
          throw new Error(j.message || `HTTP ${res.status}`);
        }
        const data = await res.json();
        if (!data.token) throw new Error('No token received');
        localStorage.setItem('ecm_token', data.token);
        setStatus('success');
        setTimeout(() => navigate('/admin'), 1000);
      } catch (err: any) {
        setError(err.message || 'Unknown error');
        setStatus('error');
      }
    })();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'radial-gradient(ellipse at 50% 35%, #0F172A, #07091A, #020617)' }}>
      <div className="text-center max-w-sm w-full mx-4">
        {status === 'loading' && (
          <>
            <Loader2 className="w-12 h-12 text-[#00C274] animate-spin mx-auto mb-4" />
            <p className="text-white font-bold text-lg">Authenticating…</p>
            <p className="text-[#4B5563] text-sm mt-1">Setting up admin session</p>
          </>
        )}
        {status === 'success' && (
          <>
            <ShieldCheck className="w-12 h-12 text-[#02C076] mx-auto mb-4" />
            <p className="text-white font-bold text-lg">Logged in successfully</p>
            <p className="text-[#4B5563] text-sm mt-1">Redirecting to admin panel…</p>
          </>
        )}
        {status === 'error' && (
          <>
            <AlertTriangle className="w-12 h-12 text-[#CF304A] mx-auto mb-4" />
            <p className="text-white font-bold text-lg">Login Failed</p>
            <p className="text-[#CF304A] text-sm mt-2 font-mono">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-6 px-6 py-2.5 rounded-xl bg-[#00C274] text-black font-bold text-sm hover:bg-[#F8D33A] transition-all"
            >
              Retry
            </button>
          </>
        )}
      </div>
    </div>
  );
}
