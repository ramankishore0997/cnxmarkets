import { ReactNode, useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Globe, Shield, Lock, Phone } from 'lucide-react';
import { TradingWidget } from '../shared/TradingWidget';
import { BrandLogo } from '../shared/EcmLogo';

export function PublicLayout({ children }: { children: ReactNode }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [location] = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
    <div className="min-h-screen flex flex-col bg-white text-[#374151] overflow-x-hidden">
      {/* Ticker bar at the very top */}
      <div style={{ background: '#0B3C5D', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <TradingWidget />
      </div>

      <header
        className="sticky top-0 z-50 w-full transition-all duration-300"
        style={{
          background: scrolled
            ? 'rgba(11,60,93,0.97)'
            : 'linear-gradient(135deg, #0B3C5D 0%, #174A7C 100%)',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          boxShadow: scrolled ? '0 4px 24px rgba(11,60,93,0.25)' : 'none',
          backdropFilter: scrolled ? 'blur(12px)' : 'none',
          paddingTop: scrolled ? '12px' : '18px',
          paddingBottom: scrolled ? '12px' : '18px',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <Link href="/" className="flex items-center group">
            <BrandLogo theme="dark" size="md" />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden xl:flex items-center gap-6">
            {navLinks.map((link) => {
              const isActive = location === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className="text-sm font-medium transition-all relative py-1"
                  style={{
                    color: isActive ? '#FFFFFF' : '#EAF2F8',
                    opacity: isActive ? 1 : 0.85,
                  }}
                >
                  {link.name}
                  {isActive && (
                    <motion.div
                      layoutId="activeNavIndicator"
                      className="absolute -bottom-1 left-0 right-0 h-0.5 rounded-full"
                      style={{ background: '#60C0F0' }}
                      initial={false}
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="hidden xl:flex items-center gap-3">
            <Link
              href="/auth/login"
              className="text-sm font-semibold px-5 py-2.5 rounded-lg transition-all"
              style={{
                border: '1px solid rgba(255,255,255,0.4)',
                color: '#FFFFFF',
                background: 'transparent',
              }}
              onMouseEnter={e => {
                (e.target as HTMLElement).style.background = 'rgba(255,255,255,0.1)';
              }}
              onMouseLeave={e => {
                (e.target as HTMLElement).style.background = 'transparent';
              }}
            >
              Sign In
            </Link>
            <Link
              href="/auth/register"
              className="text-sm font-bold px-5 py-2.5 rounded-lg transition-all"
              style={{
                background: '#1F77B4',
                color: '#FFFFFF',
                boxShadow: '0 4px 16px rgba(31,119,180,0.4)',
              }}
            >
              Open Account
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="xl:hidden p-2 rounded-lg transition-colors"
            style={{ color: '#FFFFFF' }}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </header>

      {/* Mobile Nav */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="xl:hidden absolute top-[108px] left-0 right-0 z-40 shadow-xl"
            style={{
              background: 'linear-gradient(135deg, #0B3C5D 0%, #174A7C 100%)',
              borderBottom: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            <div className="p-4 flex flex-col gap-2">
              {navLinks.map((link) => {
                const isActive = location === link.href;
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    className="text-base font-medium p-3 rounded-xl transition-colors"
                    style={{
                      color: isActive ? '#FFFFFF' : '#EAF2F8',
                      background: isActive ? 'rgba(255,255,255,0.12)' : 'transparent',
                    }}
                  >
                    {link.name}
                  </Link>
                );
              })}
              <div className="flex flex-col gap-3 mt-4 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                <Link
                  href="/auth/login"
                  className="w-full text-center py-3 font-semibold rounded-xl transition-all"
                  style={{ border: '1px solid rgba(255,255,255,0.35)', color: '#FFFFFF' }}
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/register"
                  className="w-full text-center py-3 font-bold rounded-xl"
                  style={{ background: '#1F77B4', color: '#FFFFFF' }}
                >
                  Open Account
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={location}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer style={{ background: '#0B3C5D', borderTop: '1px solid rgba(255,255,255,0.08)' }} className="pt-16 pb-0 mt-auto relative">
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
                <li><Link href="/download-app" className="hover:text-white transition-colors font-semibold" style={{ color: '#60C0F0', opacity: 1 }}>↓ Download App</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-6">Resources & Legal</h4>
              <ul className="flex flex-col gap-3 text-sm" style={{ color: '#EAF2F8', opacity: 0.8 }}>
                <li><Link href="/faq" className="hover:text-white transition-colors">FAQ</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">Support</Link></li>
                <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
                <li><Link href="/privacy" className="hover:text-white transition-colors">Risk Disclosure</Link></li>
              </ul>
            </div>
          </div>
        </div>
        <div style={{ background: '#072A44', borderTop: '1px solid rgba(255,255,255,0.08)' }} className="py-5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-3 text-sm">
            <p style={{ color: '#EAF2F8', opacity: 0.7 }}>&copy; {new Date().getFullYear()} ECMarket Pro. All rights reserved.</p>
            <p style={{ color: '#DC2626' }} className="font-medium text-center">Trading involves significant risk. Capital at risk. Not suitable for all investors.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
