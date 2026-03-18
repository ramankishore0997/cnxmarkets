import { useState, useEffect } from 'react';
import { X, Share, Plus } from 'lucide-react';
import { pwaManager } from '@/lib/pwaManager';

const DISMISSED_KEY = 'ecm_pwa_dismissed';
const DISMISS_DURATION_MS = 7 * 24 * 60 * 60 * 1000;

export function PWAInstallPrompt() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (pwaManager.isInstalled) return;

    const dismissed = localStorage.getItem(DISMISSED_KEY);
    if (dismissed && Date.now() - parseInt(dismissed) < DISMISS_DURATION_MS) return;

    if (pwaManager.isIOS) {
      const timer = setTimeout(() => setVisible(true), 3500);
      return () => clearTimeout(timer);
    }

    if (pwaManager.canInstall && pwaManager.isMobile) {
      const timer = setTimeout(() => setVisible(true), 3500);
      return () => clearTimeout(timer);
    }

    const unsub = pwaManager.subscribe(() => {
      if (pwaManager.canInstall && pwaManager.isMobile) {
        setTimeout(() => setVisible(true), 3500);
      }
      if (pwaManager.isInstalled) setVisible(false);
    });
    return unsub;
  }, []);

  const dismiss = () => {
    setVisible(false);
    localStorage.setItem(DISMISSED_KEY, String(Date.now()));
  };

  const install = async () => {
    const result = await pwaManager.triggerInstall();
    if (result === 'accepted') setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-[9999] px-4"
      style={{ paddingBottom: 'max(16px, env(safe-area-inset-bottom))' }}
    >
      <div
        className="rounded-2xl p-4 flex items-start gap-3 shadow-2xl shadow-black/60"
        style={{
          background: 'linear-gradient(135deg, #0F172A 0%, #0D1421 100%)',
          border: '1px solid rgba(0,194,116,0.25)',
          backdropFilter: 'blur(20px)',
        }}
      >
        <div className="w-12 h-12 rounded-2xl flex-shrink-0 flex items-center justify-center shadow-lg"
          style={{ background: 'linear-gradient(135deg, #00C274, #E68A00)' }}>
          <span className="text-black font-black text-lg">EC</span>
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-white font-bold text-sm leading-tight">CNXMarkets App</p>
          <p className="text-[#848E9C] text-xs mt-0.5 leading-snug">
            {pwaManager.isIOS
              ? 'Add to Home Screen for an app-like experience!'
              : 'Install the app for faster access!'}
          </p>

          {pwaManager.isIOS ? (
            <div className="mt-2.5 flex items-center gap-1.5 text-[#00C274] text-xs font-semibold flex-wrap">
              <Share className="w-3.5 h-3.5 flex-shrink-0" />
              <span>Tap</span>
              <span className="px-1.5 py-0.5 bg-[#1E2329] rounded text-[10px] border border-[#181B23]">Share</span>
              <span>→</span>
              <Plus className="w-3 h-3 flex-shrink-0" />
              <span>"Add to Home Screen"</span>
            </div>
          ) : (
            <button
              onClick={install}
              className="mt-2.5 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-black transition-all active:scale-95"
              style={{ background: 'linear-gradient(135deg, #00C274, #E68A00)' }}
            >
              Install App
            </button>
          )}
        </div>

        <button
          onClick={dismiss}
          className="p-1.5 rounded-full flex-shrink-0 text-[#848E9C] hover:text-white active:bg-white/10 transition-all"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
