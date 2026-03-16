import { ReactNode, useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ArrowRight, Activity, Globe, Shield, ChevronRight } from 'lucide-react';
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
    { name: 'Strategies', href: '/strategies' },
    { name: 'Performance', href: '/performance' },
    { name: 'Markets', href: '/markets' },
    { name: 'About', href: '/about' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground overflow-x-hidden">
      <TradingWidget />
      
      <header 
        className={`sticky top-0 z-50 w-full transition-all duration-300 ${
          scrolled ? 'bg-background/80 backdrop-blur-md border-b border-white/10 py-3' : 'bg-transparent py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20 group-hover:shadow-primary/40 transition-all">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">
              ECMarkets<span className="text-accent">India</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link 
                key={link.name} 
                href={link.href}
                className={`text-sm font-medium transition-colors hover:text-accent ${
                  location === link.href ? 'text-white' : 'text-muted-foreground'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-4">
            <Link 
              href="/auth/login"
              className="text-sm font-medium text-muted-foreground hover:text-white transition-colors"
            >
              Sign In
            </Link>
            <Link 
              href="/auth/register"
              className="px-5 py-2.5 rounded-full text-sm font-medium bg-primary text-primary-foreground shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-2"
            >
              Start Trading <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden text-white p-2"
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
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-b border-white/10 bg-background/95 backdrop-blur-xl absolute top-full left-0 right-0 z-40"
          >
            <div className="p-4 flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link 
                  key={link.name} 
                  href={link.href}
                  className="text-lg font-medium text-white p-2 border-b border-white/5"
                >
                  {link.name}
                </Link>
              ))}
              <div className="flex flex-col gap-3 mt-4 pt-4 border-t border-white/10">
                <Link 
                  href="/auth/login"
                  className="w-full text-center py-3 text-white font-medium border border-white/20 rounded-xl"
                >
                  Sign In
                </Link>
                <Link 
                  href="/auth/register"
                  className="w-full text-center py-3 bg-primary text-white font-medium rounded-xl"
                >
                  Start Trading
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
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      <footer className="bg-card border-t border-white/5 pt-16 pb-8 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="col-span-1 md:col-span-1">
              <Link href="/" className="flex items-center gap-2 mb-6">
                <Activity className="w-6 h-6 text-primary" />
                <span className="text-xl font-bold tracking-tight text-white">
                  ECMarkets<span className="text-accent">India</span>
                </span>
              </Link>
              <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
                Institutional-grade algorithmic trading strategies for retail and professional investors. Maximize returns with AI-driven execution.
              </p>
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-primary/20 transition-colors cursor-pointer text-white">
                  <Globe className="w-5 h-5" />
                </div>
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-primary/20 transition-colors cursor-pointer text-white">
                  <Shield className="w-5 h-5" />
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-6">Platform</h4>
              <ul className="flex flex-col gap-3 text-sm text-muted-foreground">
                <li><Link href="/strategies" className="hover:text-accent transition-colors">Strategies</Link></li>
                <li><Link href="/performance" className="hover:text-accent transition-colors">Performance</Link></li>
                <li><Link href="/pricing" className="hover:text-accent transition-colors">Pricing</Link></li>
                <li><Link href="/markets" className="hover:text-accent transition-colors">Markets</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-6">Company</h4>
              <ul className="flex flex-col gap-3 text-sm text-muted-foreground">
                <li><Link href="/about" className="hover:text-accent transition-colors">About Us</Link></li>
                <li><Link href="/contact" className="hover:text-accent transition-colors">Contact</Link></li>
                <li><Link href="/faq" className="hover:text-accent transition-colors">FAQ</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-6">Legal</h4>
              <ul className="flex flex-col gap-3 text-sm text-muted-foreground">
                <li><Link href="/legal/terms" className="hover:text-accent transition-colors">Terms of Service</Link></li>
                <li><Link href="/legal/privacy" className="hover:text-accent transition-colors">Privacy Policy</Link></li>
                <li><Link href="/legal/risk" className="hover:text-accent transition-colors text-accent">Risk Disclaimer</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-white/10 pt-8 mt-8 text-center md:text-left flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-muted-foreground max-w-2xl">
              <strong>Risk Warning:</strong> Trading Forex and CFDs involves significant risk and can result in the loss of your invested capital. You should not invest more than you can afford to lose and should ensure that you fully understand the risks involved.
            </p>
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} ECMarketsIndia. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
