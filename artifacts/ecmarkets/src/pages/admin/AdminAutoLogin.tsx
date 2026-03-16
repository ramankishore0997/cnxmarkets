import { useEffect, useState } from 'react';
import { useLocation, useParams } from 'wouter';
import { Loader2, XCircle } from 'lucide-react';

/* 
  This page is visited via /admin/auto-login/:token
  It calls the backend, stores the JWT, then redirects to /admin.
  The page meta has noindex to prevent search engine crawling.
*/

export function AdminAutoLogin() {
  const params = useParams<{ token: string }>();
  const [, navigate] = useLocation();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const token = params.token;
    if (!token) {
      setErrorMsg('No token provided.');
      setStatus('error');
      return;
    }

    fetch(`/api/admin/auto-login/${token}`)
      .then(async r => {
        if (!r.ok) {
          const body = await r.json().catch(() => ({}));
          throw new Error(body.message || 'Invalid access token');
        }
        return r.json();
      })
      .then(data => {
        if (!data.token) throw new Error('No session token returned');
        localStorage.setItem('ecm_token', data.token);
        setStatus('success');
        // Small delay so user sees the success state
        setTimeout(() => navigate('/admin'), 800);
      })
      .catch(err => {
        setErrorMsg(err.message || 'Authentication failed');
        setStatus('error');
      });
  }, []);

  return (
    <>
      {/* noindex meta tag injected via Helmet-style approach */}
      {typeof document !== 'undefined' && (() => {
        // Ensure noindex meta is set
        let meta = document.querySelector('meta[name="robots"]') as HTMLMetaElement | null;
        if (!meta) {
          meta = document.createElement('meta');
          meta.name = 'robots';
          document.head.appendChild(meta);
        }
        meta.content = 'noindex, nofollow, noarchive';
        return null;
      })()}

      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: 'radial-gradient(ellipse at 50% 35%, #0F172A 0%, #07091A 50%, #020617 100%)' }}
      >
        <div className="text-center px-6 max-w-sm w-full">

          {status === 'loading' && (
            <>
              <div className="relative w-16 h-16 mx-auto mb-6">
                <div className="absolute inset-0 border-4 border-white/[0.06] rounded-full" />
                <div className="absolute inset-0 border-t-4 border-[#FFB800] rounded-full animate-spin" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Authenticating…</h2>
              <p className="text-[#848E9C] text-sm">Verifying your magic link, please wait.</p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-[#02C076]/20 border-2 border-[#02C076]/40 flex items-center justify-center">
                <svg className="w-8 h-8 text-[#02C076]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Access Granted</h2>
              <p className="text-[#02C076] text-sm font-semibold">Redirecting to Admin Panel…</p>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-[#CF304A]/15 border-2 border-[#CF304A]/30 flex items-center justify-center">
                <XCircle className="w-8 h-8 text-[#CF304A]" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Access Denied</h2>
              <p className="text-[#CF304A] text-sm font-semibold mb-6">{errorMsg}</p>
              <a
                href="/auth/login"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-white/[0.05] border border-white/[0.1] text-[#848E9C] hover:text-white text-sm font-semibold transition-colors"
              >
                Go to Login
              </a>
            </>
          )}

        </div>
      </div>
    </>
  );
}
