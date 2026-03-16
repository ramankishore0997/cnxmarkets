import { ReactNode, useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ArrowRight, Activity, Globe, Shield, Lock, Phone } from 'lucide-react';
import { TradingWidget } from '../shared/TradingWidget';

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
      {/* Ticker bar at the very top - Dark Navy */}
      <div className="bg-[#0b0f19] text-white">
        <TradingWidget />
      </div>
      
      <header 
        className={`sticky top-0 z-50 w-full transition-all duration-300 ${
          scrolled ? 'bg-white/90 backdrop-blur-md shadow-[0_2px_16px_rgba(0,0,0,0.08)] py-3' : 'bg-white py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-md">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-gray-900">
              ECMarkets<span className="text-primary">India</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6 lg:gap-8">
            {navLinks.map((link) => {
              const isActive = location === link.href;
              return (
                <Link 
                  key={link.name} 
                  href={link.href}
                  className={`text-sm font-medium transition-all relative py-1 ${
                    isActive ? 'text-primary' : 'text-gray-600 hover:text-primary'
                  }`}
                >
                  {link.name}
                  {isActive && (
                    <motion.div 
                      layoutId="activeNavIndicator"
                      className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary"
                      initial={false}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="hidden md:flex items-center gap-4">
            <Link 
              href="/auth/login"
              className="px-5 py-2 text-sm font-medium btn-outline transition-colors"
            >
              Sign In
            </Link>
            <Link 
              href="/auth/register"
              className="px-5 py-2 text-sm font-medium btn-primary flex items-center gap-2"
            >
              Open Account <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden text-gray-900 p-2"
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
            className="md:hidden bg-white border-b border-border shadow-lg absolute top-[100px] left-0 right-0 z-40"
          >
            <div className="p-4 flex flex-col gap-2">
              {navLinks.map((link) => {
                const isActive = location === link.href;
                return (
                  <Link 
                    key={link.name} 
                    href={link.href}
                    className={`text-lg font-medium p-3 rounded-xl transition-colors ${
                      isActive ? 'bg-primary/10 text-primary' : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {link.name}
                  </Link>
                );
              })}
              <div className="flex flex-col gap-3 mt-4 pt-4 border-t border-border">
                <Link 
                  href="/auth/login"
                  className="w-full text-center py-3 font-medium btn-outline rounded-xl"
                >
                  Sign In
                </Link>
                <Link 
                  href="/auth/register"
                  className="w-full text-center py-3 btn-primary font-medium rounded-xl"
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

      <footer className="bg-[#f5f7fb] border-t border-border pt-16 pb-8 mt-auto relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">
            <div className="lg:col-span-2">
              <Link href="/" className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                  <Activity className="w-5 h-5 text-white" />
                </div>
                <span className="text-2xl font-bold tracking-tight text-gray-900">
                  ECMarkets<span className="text-primary">India</span>
                </span>
              </Link>
              <p className="text-muted-foreground text-sm mb-8 leading-relaxed max-w-sm">
                Institutional-grade algorithmic trading strategies for retail and professional investors. Maximize returns with high-frequency, low-latency execution and advanced risk management.
              </p>
              <div className="flex gap-4">
                <a href="#" className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center hover:bg-primary hover:text-white transition-all text-gray-500">
                  <Globe className="w-5 h-5" />
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center hover:bg-primary hover:text-white transition-all text-gray-500">
                  <Shield className="w-5 h-5" />
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center hover:bg-primary hover:text-white transition-all text-gray-500">
                  <Lock className="w-5 h-5" />
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center hover:bg-primary hover:text-white transition-all text-gray-500">
                  <Phone className="w-5 h-5" />
                </a>
              </div>
            </div>
            
            <div>
              <h4 className="text-gray-900 font-semibold mb-6">Company</h4>
              <ul className="flex flex-col gap-3 text-sm text-muted-foreground">
                <li><Link href="/about" className="hover:text-primary transition-colors">About Us</Link></li>
                <li><Link href="#" className="hover:text-primary transition-colors">Careers</Link></li>
                <li><Link href="#" className="hover:text-primary transition-colors">Blog</Link></li>
                <li><Link href="#" className="hover:text-primary transition-colors">Press</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-gray-900 font-semibold mb-6">Platform</h4>
              <ul className="flex flex-col gap-3 text-sm text-muted-foreground">
                <li><Link href="/dashboard" className="hover:text-primary transition-colors">Dashboard</Link></li>
                <li><Link href="/strategies" className="hover:text-primary transition-colors">Strategies</Link></li>
                <li><Link href="/performance" className="hover:text-primary transition-colors">Performance</Link></li>
                <li><Link href="/markets" className="hover:text-primary transition-colors">Markets</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-gray-900 font-semibold mb-6">Resources & Legal</h4>
              <ul className="flex flex-col gap-3 text-sm text-muted-foreground">
                <li><Link href="/faq" className="hover:text-primary transition-colors">FAQ</Link></li>
                <li><Link href="/contact" className="hover:text-primary transition-colors">Support & Contact</Link></li>
                <li><Link href="#" className="hover:text-primary transition-colors">Documentation</Link></li>
                <li><Link href="#" className="hover:text-primary transition-colors">Terms of Service</Link></li>
                <li><Link href="#" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-border pt-8 mt-8">
            <div className="bg-white rounded-xl p-6 mb-8 border border-border shadow-sm">
              <h5 className="text-red-600 font-semibold mb-2 flex items-center gap-2">
                <Shield className="w-4 h-4" /> Trading involves substantial risk
              </h5>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Trading foreign exchange (Forex), contracts for differences (CFDs), and other financial instruments on margin carries a high level of risk and may not be suitable for all investors. The high degree of leverage can work against you as well as for you. Before deciding to invest, you should carefully consider your investment objectives, level of experience, and risk appetite. The possibility exists that you could sustain a loss of some or all of your initial investment, and therefore, you should not invest money that you cannot afford to lose. You should be aware of all the risks associated with trading and seek advice from an independent financial advisor if you have any doubts. Past performance is not indicative of future results.
              </p>
            </div>
            
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
              <p>&copy; {new Date().getFullYear()} ECMarketsIndia. All rights reserved.</p>
              <div className="flex gap-6">
                <span>Secure SSL Encrypted</span>
                <span>Tier-1 Liquidity</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
