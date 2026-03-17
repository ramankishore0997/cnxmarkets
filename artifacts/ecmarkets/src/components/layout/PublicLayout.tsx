import { ReactNode, useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Globe, Shield, Lock, Phone } from 'lucide-react';
import { TradingWidget } from '../shared/TradingWidget';
import { EcmLogo } from '../shared/EcmLogo';

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

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Markets', href: '/markets' },
    { name: 'Strategies', href: '/strategies' },
    { name: 'Performance', href: '/performance' },
    { name: 'Pricing', href: '/pricing' },
    { name: 'About', href: '/about' },
    { name: 'FAQ', href: '/faq' },
    { name: 'Contact', href: '/contact' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground overflow-x-hidden">
      {/* Ticker bar at the very top */}
      <div className="bg-[#1E2329] border-b border-[#2B3139] text-[#EAECEF]">
        <TradingWidget />
      </div>
      
      <header 
        className={`sticky top-0 z-50 w-full transition-all duration-300 ${
          scrolled ? 'bg-[#0B0E11]/90 backdrop-blur-md shadow-lg border-b border-[#F0B90B]/30 py-3' : 'bg-[#0B0E11] border-b border-[#2B3139] py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="shrink-0 drop-shadow-[0_0_8px_rgba(255,184,0,0.35)]">
              <EcmLogo size={34} />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">
              ECMarkets<span className="text-[#FFB800]">India</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden xl:flex items-center gap-6">
            {navLinks.map((link) => {
              const isActive = location === link.href;
              return (
                <Link 
                  key={link.name} 
                  href={link.href}
                  className={`text-sm font-medium transition-all relative py-1 ${
                    isActive ? 'text-[#F0B90B]' : 'text-[#848E9C] hover:text-[#EAECEF]'
                  }`}
                >
                  {link.name}
                  {isActive && (
                    <motion.div 
                      layoutId="activeNavIndicator"
                      className="absolute -bottom-1 left-0 right-0 h-0.5 bg-[#F0B90B]"
                      initial={false}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="hidden xl:flex items-center gap-4">
            <Link 
              href="/auth/login"
              className="btn-ghost"
            >
              Sign In
            </Link>
            <Link 
              href="/auth/register"
              className="btn-gold"
            >
              Open Account
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            className="xl:hidden text-white p-2"
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
            className="xl:hidden bg-[#1E2329] border-b border-[#2B3139] shadow-lg absolute top-[100px] left-0 right-0 z-40"
          >
            <div className="p-4 flex flex-col gap-2">
              {navLinks.map((link) => {
                const isActive = location === link.href;
                return (
                  <Link 
                    key={link.name} 
                    href={link.href}
                    className={`text-lg font-medium p-3 rounded-xl transition-colors ${
                      isActive ? 'bg-[#2B3139] text-[#F0B90B]' : 'text-[#EAECEF] hover:bg-[#2B3139]'
                    }`}
                  >
                    {link.name}
                  </Link>
                );
              })}
              <div className="flex flex-col gap-3 mt-4 pt-4 border-t border-[#2B3139]">
                <Link 
                  href="/auth/login"
                  className="w-full text-center py-3 font-medium btn-ghost rounded-xl"
                >
                  Sign In
                </Link>
                <Link 
                  href="/auth/register"
                  className="w-full text-center py-3 btn-gold font-medium rounded-xl"
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
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      <footer className="bg-[#1E2329] border-t border-[#2B3139] pt-16 pb-0 mt-auto relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">
            <div className="lg:col-span-2">
              <Link href="/" className="flex items-center gap-2.5 mb-6">
                <div className="shrink-0 drop-shadow-[0_0_8px_rgba(255,184,0,0.3)]">
                  <EcmLogo size={32} />
                </div>
                <span className="text-2xl font-bold tracking-tight text-white">
                  ECMarkets<span className="text-[#FFB800]">India</span>
                </span>
              </Link>
              <p className="text-[#848E9C] text-sm mb-5 leading-relaxed max-w-sm">
                Institutional-grade algorithmic trading platform for retail and professional investors. Maximize returns with high-frequency, low-latency execution.
              </p>
              <div className="text-sm text-[#848E9C] mb-5 leading-relaxed">
                <p className="font-semibold text-[#EAECEF] mb-1">Registered Office</p>
                <p>2035 Sunset Lake Road, Suite B-2</p>
                <p>Newark, Delaware 19702, United States</p>
                <a href="mailto:support@ecmarketsindia.com" className="mt-2 block hover:text-[#F0B90B] transition-colors">support@ecmarketsindia.com</a>
              </div>
              <div className="flex gap-4">
                <a href="#" className="w-10 h-10 rounded-full bg-[#2B3139] shadow-sm flex items-center justify-center hover:bg-[#F0B90B] hover:text-[#000] transition-all text-[#EAECEF]">
                  <Globe className="w-5 h-5" />
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-[#2B3139] shadow-sm flex items-center justify-center hover:bg-[#F0B90B] hover:text-[#000] transition-all text-[#EAECEF]">
                  <Shield className="w-5 h-5" />
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-[#2B3139] shadow-sm flex items-center justify-center hover:bg-[#F0B90B] hover:text-[#000] transition-all text-[#EAECEF]">
                  <Lock className="w-5 h-5" />
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-[#2B3139] shadow-sm flex items-center justify-center hover:bg-[#F0B90B] hover:text-[#000] transition-all text-[#EAECEF]">
                  <Phone className="w-5 h-5" />
                </a>
              </div>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-6">Company</h4>
              <ul className="flex flex-col gap-3 text-sm text-[#848E9C]">
                <li><Link href="/about" className="hover:text-[#F0B90B] transition-colors">About Us</Link></li>
                <li><Link href="#" className="hover:text-[#F0B90B] transition-colors">Careers</Link></li>
                <li><Link href="#" className="hover:text-[#F0B90B] transition-colors">Blog</Link></li>
                <li><Link href="#" className="hover:text-[#F0B90B] transition-colors">Press</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-6">Platform</h4>
              <ul className="flex flex-col gap-3 text-sm text-[#848E9C]">
                <li><Link href="/dashboard" className="hover:text-[#F0B90B] transition-colors">Dashboard</Link></li>
                <li><Link href="/strategies" className="hover:text-[#F0B90B] transition-colors">Strategies</Link></li>
                <li><Link href="/performance" className="hover:text-[#F0B90B] transition-colors">Performance</Link></li>
                <li><Link href="/markets" className="hover:text-[#F0B90B] transition-colors">Markets</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-6">Resources & Legal</h4>
              <ul className="flex flex-col gap-3 text-sm text-[#848E9C]">
                <li><Link href="/faq" className="hover:text-[#F0B90B] transition-colors">FAQ</Link></li>
                <li><Link href="/contact" className="hover:text-[#F0B90B] transition-colors">Support</Link></li>
                <li><Link href="#" className="hover:text-[#F0B90B] transition-colors">Documentation</Link></li>
                <li><Link href="#" className="hover:text-[#F0B90B] transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="bg-[#0B0E11] py-6 border-t border-[#2B3139]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
            <p className="text-[#848E9C]">&copy; {new Date().getFullYear()} ECMarketsIndia. All rights reserved.</p>
            <p className="text-[#CF304A] font-medium">Trading in financial markets involves significant risk and may not be suitable for all investors. Past performance does not guarantee future results.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}