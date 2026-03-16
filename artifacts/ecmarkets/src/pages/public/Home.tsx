import { Link } from 'wouter';
import { motion } from 'framer-motion';
import { ArrowRight, BarChart2, Shield, Zap, CheckCircle2 } from 'lucide-react';
import { PublicLayout } from '@/components/layout/PublicLayout';

export function Home() {
  const features = [
    {
      title: "Algorithmic Precision",
      description: "Our strategies execute trades with millisecond precision, eliminating emotional bias and capturing fleeting market opportunities.",
      icon: Zap
    },
    {
      title: "Institutional Security",
      description: "Bank-grade encryption and segregated accounts ensure your capital is protected at all times.",
      icon: Shield
    },
    {
      title: "Transparent Performance",
      description: "Real-time equity curves and verified historical data. We win when you win.",
      icon: BarChart2
    }
  ];

  return (
    <PublicLayout>
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        {/* Background Image & Overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src={`${import.meta.env.BASE_URL}images/hero-bg.png`} 
            alt="Hero Background" 
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/80 to-background" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-8">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
              Live Trading Active
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white mb-6 leading-tight">
              Institutional Edge.<br />
              <span className="text-gradient-gold">Retail Access.</span>
            </h1>
            
            <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
              Automate your portfolio with battle-tested forex and commodities strategies. Consistent returns driven by quantitative models.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link 
                href="/auth/register"
                className="w-full sm:w-auto px-8 py-4 rounded-xl text-lg font-semibold bg-gradient-to-r from-primary to-blue-600 text-white shadow-xl shadow-primary/30 hover:shadow-primary/50 hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-2"
              >
                Open Account <ArrowRight className="w-5 h-5" />
              </Link>
              <Link 
                href="/performance"
                className="w-full sm:w-auto px-8 py-4 rounded-xl text-lg font-semibold bg-white/5 text-white border border-white/10 hover:bg-white/10 transition-all duration-300"
              >
                View Performance
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 border-y border-white/5 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { label: "Assets Under Management", value: "$45M+" },
              { label: "Active Investors", value: "12,000+" },
              { label: "Avg. Yearly Return", value: "32.4%" },
              { label: "Uptime", value: "99.99%" },
            ].map((stat, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="text-3xl md:text-4xl font-bold text-white mb-2">{stat.value}</div>
                <div className="text-sm text-muted-foreground font-medium uppercase tracking-wider">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Why Trade With ECMarkets?</h2>
            <p className="text-lg text-muted-foreground">We bridge the gap between complex quantitative strategies and everyday investors.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, i) => (
              <div key={i} className="glass-card p-8 rounded-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                  <feature.icon className="w-32 h-32" />
                </div>
                <div className="w-14 h-14 rounded-xl bg-primary/20 flex items-center justify-center mb-6 border border-primary/30">
                  <feature.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Interface Preview */}
      <section className="py-24 bg-gradient-to-b from-transparent to-black/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="lg:w-1/2">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Powerful dashboard. Complete control.</h2>
              <p className="text-lg text-muted-foreground mb-8">
                Monitor your equity curve in real-time, allocate capital across multiple strategies, and withdraw funds with a single click.
              </p>
              <ul className="space-y-4 mb-8">
                {['Live equity tracking', 'Instant deposits & withdrawals', 'Detailed trade history', 'Custom strategy allocation'].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-white">
                    <CheckCircle2 className="w-5 h-5 text-accent" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link href="/auth/register" className="text-primary font-medium flex items-center gap-2 hover:gap-3 transition-all">
                Explore Platform <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="lg:w-1/2 w-full perspective-1000">
              <motion.div 
                initial={{ rotateY: 20, opacity: 0 }}
                whileInView={{ rotateY: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1 }}
                className="rounded-2xl border border-white/10 shadow-2xl shadow-primary/20 overflow-hidden"
              >
                <img 
                  src={`${import.meta.env.BASE_URL}images/platform-preview.png`} 
                  alt="Platform Dashboard" 
                  className="w-full h-auto"
                />
              </motion.div>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
