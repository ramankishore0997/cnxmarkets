import { useState, useEffect } from 'react';
import { X, Download, Share, Plus } from 'lucide-react';

function isIOS(): boolean {
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

function isInStandaloneMode(): boolean {
  return (
    ('standalone' in window.navigator && (window.navigator as any).standalone === true) ||
    window.matchMedia('(display-mode: standalone)').matches
  );
}

function isMobile(): boolean {
  return /android|iphone|ipad|ipod|mobile/i.test(navigator.userAgent) || window.innerWidth < 768;
}

const DISMISSED_KEY = 'ecm_pwa_dismissed';
const DISMISS_DURATION_MS = 7 * 24 * 60 * 60 * 1000;

export function PWAInstallPrompt() {
  const [visible, setVisible] = useState(false);
  const [isApple, setIsApple] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    if (isInStandaloneMode()) return;
    if (!isMobile()) return;

    const dismissed = localStorage.getItem(DISMISSED_KEY);
    if (dismissed && Date.now() - parseInt(dismissed) < DISMISS_DURATION_MS) return;

    const apple = isIOS();
    setIsApple(apple);

    if (apple) {
      const timer = setTimeout(() => setVisible(true), 3000);
      return () => clearTimeout(timer);
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      const timer = setTimeout(() => setVisible(true), 3000);
      return () => clearTimeout(timer);
    };

    window.addEventListener('beforeinstallprompt', handler as EventListener);
    return () => window.removeEventListener('beforeinstallprompt', handler as EventListener);
  }, []);

  const dismiss = () => {
    setVisible(false);
    localStorage.setItem(DISMISSED_KEY, String(Date.now()));
  };

  const install = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const result = await deferredPrompt.userChoice;
    if (result.outcome === 'accepted') {
      setVisible(false);
    }
    setDeferredPrompt(null);
  };

  if (!visible) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-[9999] px-4 pb-safe"
      style={{ paddingBottom: 'max(16px, env(safe-area-inset-bottom))' }}
    >
      <div
        className="rounded-2xl p-4 flex items-start gap-3 shadow-2xl shadow-black/60"
        style={{
          background: 'linear-gradient(135deg, #0F172A 0%, #0D1421 100%)',
          border: '1px solid rgba(255,184,0,0.25)',
          backdropFilter: 'blur(20px)',
        }}
      >
        {/* App icon */}
        <div className="w-12 h-12 rounded-2xl flex-shrink-0 flex items-center justify-center shadow-lg"
          style={{ background: 'linear-gradient(135deg, #FFB800, #E68A00)' }}>
          <span className="text-black font-black text-lg">EC</span>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="text-white font-bold text-sm leading-tight">ECMarketsIndia App</p>
          <p className="text-[#848E9C] text-xs mt-0.5 leading-snug">
            {isApple
              ? 'Home Screen pe add karo — App jaise feel hogi!'
              : 'Install karo aur app ki tarah use karo!'
            }
          </p>

          {isApple ? (
            <div className="mt-2.5 flex items-center gap-1.5 text-[#FFB800] text-xs font-semibold">
              <Share className="w-3.5 h-3.5 flex-shrink-0" />
              <span>Tap</span>
              <span className="px-1.5 py-0.5 bg-[#1E2329] rounded text-[10px] border border-[#2B3139]">Share</span>
              <span>→</span>
              <Plus className="w-3 h-3 flex-shrink-0" />
              <span>"Add to Home Screen"</span>
            </div>
          ) : (
            <button
              onClick={install}
              className="mt-2.5 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-black transition-all active:scale-95"
              style={{ background: 'linear-gradient(135deg, #FFB800, #E68A00)' }}
            >
              <Download className="w-3.5 h-3.5" />
              Install App
            </button>
          )}
        </div>

        {/* Close */}
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
