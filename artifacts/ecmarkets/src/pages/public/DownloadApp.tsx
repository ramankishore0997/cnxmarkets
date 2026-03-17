import { useState, useEffect } from 'react';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { pwaManager } from '@/lib/pwaManager';
import {
  Monitor, Smartphone, Download, CheckCircle2, Share2, Plus,
  Chrome, Globe, Apple, Zap, Shield, Wifi, Bell, Star
} from 'lucide-react';
import { motion } from 'framer-motion';

const fadeUp = { hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } };
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.08 } } };

function FeaturePill({ icon: Icon, text }: { icon: any; text: string }) {
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold"
      style={{ background: 'rgba(255,184,0,0.1)', border: '1px solid rgba(255,184,0,0.2)', color: '#FFB800' }}>
      <Icon className="w-3.5 h-3.5" />
      {text}
    </div>
  );
}

function StepBadge({ n }: { n: number }) {
  return (
    <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-black flex-shrink-0"
      style={{ background: 'linear-gradient(135deg, #FFB800, #E68A00)', color: '#0B0E11' }}>
      {n}
    </div>
  );
}

export function DownloadApp() {
  const [canInstall, setCanInstall] = useState(pwaManager.canInstall);
  const [isInstalled, setIsInstalled] = useState(pwaManager.isInstalled);
  const [installing, setInstalling] = useState(false);
  const [installed, setInstalled] = useState(false);

  const isIOS = pwaManager.isIOS;
  const isAndroid = pwaManager.isAndroid;
  const isMobile = pwaManager.isMobile;

  useEffect(() => {
    return pwaManager.subscribe(() => {
      setCanInstall(pwaManager.canInstall);
      setIsInstalled(pwaManager.isInstalled);
    });
  }, []);

  const handleInstall = async () => {
    setInstalling(true);
    const result = await pwaManager.triggerInstall();
    setInstalling(false);
    if (result === 'accepted') {
      setInstalled(true);
    }
  };

  const alreadyInstalled = isInstalled || installed;

  return (
    <PublicLayout>
      <div className="min-h-screen" style={{ background: 'radial-gradient(ellipse at 50% 0%, #0F172A 0%, #07091A 60%, #020617 100%)' }}>

        {/* ── Hero ─────────────────────────────────────────────── */}
        <section className="pt-24 pb-16 px-4 text-center">
          <motion.div initial="hidden" animate="visible" variants={stagger} className="max-w-3xl mx-auto">
            <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-8"
              style={{ background: 'rgba(255,184,0,0.1)', border: '1px solid rgba(255,184,0,0.25)', color: '#FFB800' }}>
              <Zap className="w-3.5 h-3.5" />
              Free · No App Store Required
            </motion.div>

            <motion.h1 variants={fadeUp} className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-tight mb-6">
              ECMarketsIndia
              <span className="block" style={{ color: '#FFB800' }}>App Download</span>
            </motion.h1>

            <motion.p variants={fadeUp} className="text-lg text-[#848E9C] max-w-xl mx-auto mb-10 leading-relaxed">
              Install our Progressive Web App directly on your device. Works exactly like a native app — no Play Store, no App Store needed.
            </motion.p>

            <motion.div variants={fadeUp} className="flex flex-wrap justify-center gap-3 mb-12">
              <FeaturePill icon={Zap} text="Instant Load" />
              <FeaturePill icon={Wifi} text="Works Offline" />
              <FeaturePill icon={Bell} text="Push Alerts" />
              <FeaturePill icon={Shield} text="Secure & Private" />
              <FeaturePill icon={Star} text="Native Feel" />
            </motion.div>
          </motion.div>
        </section>

        {/* ── Cards ────────────────────────────────────────────── */}
        <section className="px-4 pb-24">
          <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">

            {/* ── PC / DESKTOP CARD ─────────────────────── */}
            <motion.div
              initial={{ opacity: 0, y: 32 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
              className={`rounded-3xl p-8 flex flex-col ${!isMobile ? 'ring-2 ring-[#FFB800]/40' : ''}`}
              style={{ background: 'linear-gradient(135deg, #0F1923 0%, #111923 100%)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              {!isMobile && (
                <div className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full mb-5 self-start"
                  style={{ background: 'rgba(255,184,0,0.15)', color: '#FFB800', border: '1px solid rgba(255,184,0,0.3)' }}>
                  ✦ Your Device
                </div>
              )}

              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #1E2D4A, #162540)', border: '1px solid rgba(255,184,0,0.2)' }}>
                  <Monitor className="w-7 h-7" style={{ color: '#FFB800' }} />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-white">PC / Laptop</h2>
                  <p className="text-sm text-[#848E9C]">Windows · macOS · Linux</p>
                </div>
              </div>

              <p className="text-[#848E9C] text-sm leading-relaxed mb-8">
                Install ECMarketsIndia as a desktop app directly from your browser. Works on Chrome, Edge, and Brave. No download from any store required.
              </p>

              {/* Steps */}
              <div className="space-y-4 mb-8">
                {[
                  { icon: Globe, text: 'Open ecmarketsindia.com in Google Chrome or Microsoft Edge' },
                  { icon: Chrome, text: 'Look for the install icon (⊕) in the address bar on the right side' },
                  { icon: Download, text: 'Click "Install" in the popup — the app opens as a separate window' },
                  { icon: CheckCircle2, text: 'A shortcut is added to your Desktop and Start Menu automatically' },
                ].map((step, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <StepBadge n={i + 1} />
                    <div className="flex-1 flex items-start gap-2.5 py-1">
                      <step.icon className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: '#848E9C' }} />
                      <p className="text-sm text-[#EAECEF] leading-relaxed">{step.text}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Install Button */}
              <div className="mt-auto">
                {alreadyInstalled ? (
                  <div className="flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-sm"
                    style={{ background: 'rgba(2,192,118,0.1)', border: '1px solid rgba(2,192,118,0.3)', color: '#02C076' }}>
                    <CheckCircle2 className="w-5 h-5" />
                    App Already Installed!
                  </div>
                ) : canInstall ? (
                  <button
                    onClick={handleInstall}
                    disabled={installing}
                    className="w-full py-4 rounded-2xl font-black text-base flex items-center justify-center gap-2.5 transition-all duration-200 active:scale-[0.98]"
                    style={{
                      background: installing ? 'rgba(255,184,0,0.5)' : 'linear-gradient(135deg, #FFB800 0%, #E68A00 100%)',
                      color: '#0B0E11',
                      boxShadow: installing ? 'none' : '0 8px 32px rgba(255,184,0,0.35)',
                    }}
                  >
                    {installing ? (
                      <>
                        <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                        Installing...
                      </>
                    ) : (
                      <>
                        <Download className="w-5 h-5" />
                        Install on This PC
                      </>
                    )}
                  </button>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center justify-center gap-2 py-4 rounded-2xl font-semibold text-sm"
                      style={{ background: 'rgba(255,184,0,0.07)', border: '1px solid rgba(255,184,0,0.2)', color: '#848E9C' }}>
                      <Globe className="w-4 h-4 text-[#FFB800]" />
                      Open in Chrome or Edge to install
                    </div>
                    <p className="text-center text-xs text-[#848E9C]">
                      Firefox and Safari do not support desktop PWA installation. Use Chrome or Edge.
                    </p>
                  </div>
                )}
              </div>
            </motion.div>

            {/* ── MOBILE CARD ───────────────────────────── */}
            <motion.div
              initial={{ opacity: 0, y: 32 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
              className={`rounded-3xl p-8 flex flex-col ${isMobile ? 'ring-2 ring-[#FFB800]/40' : ''}`}
              style={{ background: 'linear-gradient(135deg, #0F1923 0%, #111923 100%)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              {isMobile && (
                <div className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full mb-5 self-start"
                  style={{ background: 'rgba(255,184,0,0.15)', color: '#FFB800', border: '1px solid rgba(255,184,0,0.3)' }}>
                  ✦ Your Device
                </div>
              )}

              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #1A2D1E, #152515)', border: '1px solid rgba(2,192,118,0.2)' }}>
                  <Smartphone className="w-7 h-7" style={{ color: '#02C076' }} />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-white">Mobile Phone</h2>
                  <p className="text-sm text-[#848E9C]">Android · iPhone · iPad</p>
                </div>
              </div>

              <p className="text-[#848E9C] text-sm leading-relaxed mb-8">
                Add ECMarketsIndia to your home screen for a full-screen, app-like experience. Instant access with one tap — just like a native app.
              </p>

              {/* Android Steps */}
              {(!isMobile || isAndroid) && (
                <div className="mb-7">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: '#3DDC84' }}>
                      <span className="text-[10px] font-black text-black">A</span>
                    </div>
                    <h3 className="text-sm font-bold text-white">Android (Chrome)</h3>
                  </div>
                  <div className="space-y-3">
                    {[
                      'Open ecmarketsindia.com in Chrome browser',
                      'Tap the 3-dot menu (⋮) at the top right',
                      'Select "Add to Home Screen" or "Install App"',
                      'Tap "Add" — app icon appears on your home screen',
                    ].map((text, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <StepBadge n={i + 1} />
                        <p className="text-sm text-[#EAECEF] leading-relaxed py-1">{text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* iOS Steps */}
              {(!isMobile || isIOS) && (
                <div className={!isMobile || isAndroid ? 'pt-6 border-t border-[#2B3139]' : ''}>
                  {!isMobile && (
                    <div className="flex items-center gap-2 mb-4">
                      <Apple className="w-5 h-5" style={{ color: '#EAECEF' }} />
                      <h3 className="text-sm font-bold text-white">iPhone / iPad (Safari)</h3>
                    </div>
                  )}
                  {isIOS && (
                    <div className="flex items-center gap-2 mb-4">
                      <Apple className="w-5 h-5" style={{ color: '#EAECEF' }} />
                      <h3 className="text-sm font-bold text-white">iPhone / iPad</h3>
                    </div>
                  )}
                  <div className="space-y-3">
                    {[
                      'Open ecmarketsindia.com in Safari browser',
                      { text: 'Tap the Share button', icon: Share2, iconColor: '#007AFF' },
                      { text: 'Scroll down and tap "Add to Home Screen"', icon: Plus, iconColor: '#FFB800' },
                      'Tap "Add" — app icon appears on your home screen',
                    ].map((step, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <StepBadge n={i + 1} />
                        {typeof step === 'string' ? (
                          <p className="text-sm text-[#EAECEF] leading-relaxed py-1">{step}</p>
                        ) : (
                          <div className="flex items-center gap-2 py-1">
                            <step.icon className="w-4 h-4 flex-shrink-0" style={{ color: step.iconColor }} />
                            <p className="text-sm text-[#EAECEF] leading-relaxed">{step.text}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Mobile Install Button */}
              <div className="mt-8">
                {alreadyInstalled ? (
                  <div className="flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-sm"
                    style={{ background: 'rgba(2,192,118,0.1)', border: '1px solid rgba(2,192,118,0.3)', color: '#02C076' }}>
                    <CheckCircle2 className="w-5 h-5" />
                    App Already Installed!
                  </div>
                ) : canInstall && isAndroid ? (
                  <button
                    onClick={handleInstall}
                    disabled={installing}
                    className="w-full py-4 rounded-2xl font-black text-base flex items-center justify-center gap-2.5 transition-all duration-200 active:scale-[0.98]"
                    style={{
                      background: installing ? 'rgba(2,192,118,0.5)' : 'linear-gradient(135deg, #02C076 0%, #01a863 100%)',
                      color: '#fff',
                      boxShadow: installing ? 'none' : '0 8px 32px rgba(2,192,118,0.3)',
                    }}
                  >
                    {installing ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Installing...
                      </>
                    ) : (
                      <>
                        <Download className="w-5 h-5" />
                        Install on This Phone
                      </>
                    )}
                  </button>
                ) : isIOS ? (
                  <div className="flex items-center justify-center gap-2.5 py-4 rounded-2xl font-semibold text-sm"
                    style={{ background: 'rgba(0,122,255,0.1)', border: '1px solid rgba(0,122,255,0.25)', color: '#4A9EFF' }}>
                    <Share2 className="w-4 h-4" />
                    Use Safari → Share → Add to Home Screen
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2 py-4 rounded-2xl font-semibold text-sm"
                    style={{ background: 'rgba(2,192,118,0.07)', border: '1px solid rgba(2,192,118,0.2)', color: '#848E9C' }}>
                    <Smartphone className="w-4 h-4 text-[#02C076]" />
                    Follow the steps above on your phone
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </section>

        {/* ── Bottom CTA ───────────────────────────────────────── */}
        <section className="pb-24 px-4">
          <motion.div
            initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}
            className="max-w-2xl mx-auto text-center rounded-3xl p-10"
            style={{ background: 'linear-gradient(135deg, #0F172A, #111923)', border: '1px solid rgba(255,184,0,0.15)' }}
          >
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5"
              style={{ background: 'linear-gradient(135deg, #FFB800, #E68A00)' }}>
              <span className="text-black font-black text-2xl">EC</span>
            </div>
            <h3 className="text-2xl font-black text-white mb-3">Questions? We're here to help.</h3>
            <p className="text-[#848E9C] mb-6 text-sm leading-relaxed">
              If you face any issues during installation, reach out to our support team and we'll guide you step by step.
            </p>
            <a
              href="mailto:support@ecmarketsindia.com"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all"
              style={{ background: 'rgba(255,184,0,0.1)', border: '1px solid rgba(255,184,0,0.3)', color: '#FFB800' }}
            >
              support@ecmarketsindia.com
            </a>
          </motion.div>
        </section>
      </div>
    </PublicLayout>
  );
}
