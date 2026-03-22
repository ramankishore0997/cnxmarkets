import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { useAuthState } from '@/hooks/use-auth-state';
import { EcmLogo } from '@/components/shared/EcmLogo';
import { Loader2, AlertCircle } from 'lucide-react';

const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');

export function AuthCallback() {
  const [, setLocation] = useLocation();
  const { login: setAuthToken } = useAuthState();
  const [error, setError] = useState('');
  const [status, setStatus] = useState('Completing sign-in...');

  useEffect(() => {
    const hash = window.location.hash;
    const params = new URLSearchParams(hash.replace('#', ''));
    const accessToken = params.get('access_token');
    const errorDesc = params.get('error_description') || params.get('error');

    if (errorDesc) {
      setError(decodeURIComponent(errorDesc.replace(/\+/g, ' ')));
      return;
    }

    if (!accessToken) {
      setError('No access token received from Google. Please try again.');
      return;
    }

    setStatus('Verifying your Google account...');

    fetch('/api/auth/google', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accessToken }),
    })
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok) throw new Error(data.message || 'Authentication failed');
        return data;
      })
      .then((data) => {
        setStatus('Success! Redirecting...');
        setAuthToken(data.token);
        setTimeout(() => {
          if (data.user?.role === 'admin') {
            setLocation('/admin');
          } else {
            setLocation('/dashboard');
          }
        }, 500);
      })
      .catch((err) => {
        setError(err.message || 'Something went wrong. Please try again.');
      });
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#060709' }}>
      <div className="text-center space-y-6 max-w-sm w-full px-6">
        <div className="flex justify-center">
          <EcmLogo size={48} />
        </div>

        {error ? (
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-4 rounded-xl text-left"
              style={{ background: 'rgba(207,48,74,0.1)', border: '1px solid rgba(207,48,74,0.3)' }}>
              <AlertCircle className="w-5 h-5 text-[#CF304A] shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-[#CF304A]">Sign-in Failed</p>
                <p className="text-xs text-[#CF304A]/80 mt-1">{error}</p>
              </div>
            </div>
            <button
              onClick={() => setLocation('/auth/login')}
              className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-colors"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
              Back to Sign In
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-[#00C274] mx-auto" />
            <p className="text-white font-semibold">{status}</p>
            <p className="text-[#848E9C] text-sm">Please wait, do not close this page</p>
          </div>
        )}
      </div>
    </div>
  );
}
