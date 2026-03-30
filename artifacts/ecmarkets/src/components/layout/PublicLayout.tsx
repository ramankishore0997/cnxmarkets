import { ReactNode, useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Globe, Shield, Lock, Phone } from 'lucide-react';
import { TradingWidget } from '../shared/TradingWidget';
import { BrandLogo } from '../shared/EcmLogo';

export function PublicLayout({ children }: { children: ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [location] = useLocation();

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Markets', href: '/markets' },
    { name: 'About', href: '/about' },
    { name: 'FAQ', href: '/faq' },
    { name: 'Contact', href: '/contact' },
  ];

  return (
    <div className="min-h-screen flex flex-col text-[#374151] overflow-x-hidden" style={{ background: '#F5F5F5' }}>

      {/* ── TOP TICKER (dark bar) ── */}
      <div style={{ background: '#121319', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <TradingWidget />
      </div>

      {/* ── PILL NAVBAR ── */}
      <div className="sticky top-0 z-50 px-3 sm:px-6 lg:px-8 pt-2.5 pb-1" style={{ background: '#F5F5F5' }}>
        <header
          className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6"
          style={{
            height: 64,
            background: '#f6f6f6',
            border: '1px solid #e8e8e8',
            borderRadius: 9999,
            boxShadow: '0 2px 16px rgba(0,0,0,0.07)',
          }}
        >
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <BrandLogo theme="light" size="md" />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden xl:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = location === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className="text-sm font-medium px-4 py-2 rounded-full transition-all"
                  style={{
                    color: isActive ? '#1F77B4' : '#374151',
                    background: isActive ? 'rgba(31,119,180,0.08)' : 'transparent',
                    fontWeight: isActive ? 700 : 500,
                  }}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* CTA buttons */}
          <div className="hidden xl:flex items-center gap-2">
            <Link
              href="/auth/login"
              className="text-sm font-semibold px-5 py-2.5 rounded-full transition-all"
              style={{ border: '1px solid #e8e8e8', color: '#374151', background: '#fff' }}
            >
              Sign In
            </Link>
            <Link
              href="/auth/register"
              className="text-sm font-bold px-5 py-2.5 rounded-full transition-all"
              style={{ background: '#1F77B4', color: '#FFFFFF', boxShadow: '0 4px 14px rgba(31,119,180,0.3)' }}
            >
              Open Account
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="xl:hidden p-2 rounded-full transition-colors"
            style={{ color: '#374151', background: '#fff', border: '1px solid #e8e8e8' }}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </header>

        {/* Mobile Menu (inside pill area, drops down) */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className="max-w-7xl mx-auto mt-2 rounded-2xl overflow-hidden shadow-xl"
              style={{ background: '#f6f6f6', border: '1px solid #e8e8e8' }}
            >
              <div className="p-4 flex flex-col gap-1">
                {navLinks.map((link) => {
                  const isActive = location === link.href;
                  return (
                    <Link
                      key={link.name}
                      href={link.href}
                      className="text-base font-medium p-3 rounded-xl transition-colors"
                      style={{ color: isActive ? '#1F77B4' : '#374151', background: isActive ? 'rgba(31,119,180,0.08)' : 'transparent' }}
                    >
                      {link.name}
                    </Link>
                  );
                })}
                <div className="flex flex-col gap-2 mt-3 pt-3" style={{ borderTop: '1px solid #e8e8e8' }}>
                  <Link href="/auth/login" className="w-full text-center py-3 font-semibold rounded-full" style={{ border: '1px solid #e8e8e8', color: '#374151', background: '#fff' }}>
                    Sign In
                  </Link>
                  <Link href="/auth/register" className="w-full text-center py-3 font-bold rounded-full" style={{ background: '#1F77B4', color: '#FFFFFF' }}>
                    Open Account
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── MAIN CONTENT ── */}
      <main className="flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={location}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* ── FOOTER ── */}
      <footer style={{ background: '#0B1929', borderTop: '1px solid rgba(255,255,255,0.06)' }} className="pt-16 pb-0 mt-auto relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">
            <div className="lg:col-span-2">
              <Link href="/" className="flex items-center mb-6">
                <BrandLogo theme="dark" size="md" />
              </Link>
              <p className="text-sm mb-5 leading-relaxed max-w-sm" style={{ color: '#EAF2F8', opacity: 0.75 }}>
                UAE-regulated forex broker offering 200+ instruments including Forex, Crypto, Indices and Commodities with spreads from 0.0 pips and leverage up to 1:2000.
              </p>
              <div className="text-sm mb-5 leading-relaxed" style={{ color: '#EAF2F8' }}>
                <p className="font-semibold mb-1 text-white">Registered Office</p>
                <p style={{ opacity: 0.75 }}>Dubai International Financial Centre</p>
                <p style={{ opacity: 0.75 }}>Dubai, United Arab Emirates</p>
                <a href="mailto:support@ecmarketsindia.com" className="mt-2 block transition-colors" style={{ color: '#60C0F0' }}>support@ecmarketsindia.com</a>
              </div>
              <div className="flex gap-3">
                {[Globe, Shield, Lock, Phone].map((Icon, i) => (
                  <a key={i} href="#" className="w-10 h-10 rounded-full flex items-center justify-center transition-all" style={{ background: 'rgba(255,255,255,0.08)', color: '#EAF2F8' }}>
                    <Icon className="w-5 h-5" />
                  </a>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-6">Company</h4>
              <ul className="flex flex-col gap-3 text-sm" style={{ color: '#EAF2F8', opacity: 0.8 }}>
                <li><Link href="/about" className="hover:text-white transition-colors">About Us</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
                <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
                <li><Link href="/privacy" className="hover:text-white transition-colors">Risk Disclosure</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-6">Platform</h4>
              <ul className="flex flex-col gap-3 text-sm" style={{ color: '#EAF2F8', opacity: 0.8 }}>
                <li><Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link></li>
                <li><Link href="/markets" className="hover:text-white transition-colors">Markets</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-6">Resources</h4>
              <ul className="flex flex-col gap-3 text-sm" style={{ color: '#EAF2F8', opacity: 0.8 }}>
                <li><Link href="/faq" className="hover:text-white transition-colors">FAQ</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">Support</Link></li>
                <li><Link href="/terms" className="hover:text-white transition-colors">Terms</Link></li>
                <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              </ul>
            </div>
          </div>
        </div>
        <div style={{ background: '#060D15', borderTop: '1px solid rgba(255,255,255,0.06)' }} className="py-5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-3 text-sm">
            <p style={{ color: '#EAF2F8', opacity: 0.6 }}>&copy; {new Date().getFullYear()} ECMarket Pro. All rights reserved.</p>
            <p style={{ color: '#DC2626' }} className="font-medium text-center">Trading involves significant risk. Capital at risk. Not suitable for all investors.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
