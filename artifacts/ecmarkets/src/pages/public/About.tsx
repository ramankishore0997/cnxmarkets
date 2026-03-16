import { PublicLayout } from '@/components/layout/PublicLayout';
import { motion } from 'framer-motion';
import { ShieldCheck, Target, Cpu, TrendingUp } from 'lucide-react';

export function About() {
  const values = [
    {
      icon: Target,
      title: "Our Mission",
      description: "To democratize access to institutional-grade quantitative trading strategies, empowering retail investors with the same tools used by elite hedge funds."
    },
    {
      icon: Cpu,
      title: "Technology First",
      description: "We invest heavily in ultra-low latency infrastructure, co-located servers, and machine learning models to maintain our trading edge."
    },
    {
      icon: ShieldCheck,
      title: "Risk Management",
      description: "Capital preservation is our highest priority. Our systems feature hard-coded risk limits, automated kill switches, and strict drawdown controls."
    },
    {
      icon: TrendingUp,
      title: "Transparency",
      description: "We provide complete visibility into our algorithmic logic, historical performance, and real-time execution statistics."
    }
  ];

  return (
    <PublicLayout>
      {/* Hero */}
      <section className="pt-24 pb-16 relative overflow-hidden animated-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-bold text-white mb-6"
          >
            Engineering <span className="text-gradient-blue">Alpha</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-muted-foreground max-w-3xl mx-auto"
          >
            ECMarketsIndia was founded by quantitative researchers and software engineers to bridge the gap between retail capital and institutional execution.
          </motion.p>
        </div>
      </section>

      {/* Story */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl font-bold text-white mb-6">The Next Evolution of Retail Trading</h2>
              <p className="text-muted-foreground mb-4 leading-relaxed">
                For decades, the most profitable trading strategies have been locked behind the high entry barriers of proprietary trading firms and quantitative hedge funds. Retail investors were left to compete using manual execution and delayed data.
              </p>
              <p className="text-muted-foreground mb-4 leading-relaxed">
                We built ECMarketsIndia to change this paradigm. By pooling capital and running our proprietary algorithms on tier-1 liquidity providers, we achieve economies of scale that allow us to offer institutional execution to individual accounts.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Our infrastructure is built on C++ and Rust for execution, paired with Python-based machine learning models for strategy generation, all hosted on co-located servers in Equinix LD4 and NY4.
              </p>
            </div>
            <div className="relative">
              <div className="aspect-square rounded-full bg-gradient-to-tr from-primary/20 to-accent/20 blur-3xl absolute inset-0"></div>
              <div className="glass-card p-8 rounded-2xl relative z-10 border-white/10">
                <div className="space-y-6">
                  <div className="border-b border-white/10 pb-6">
                    <h4 className="text-white font-bold mb-2">2018</h4>
                    <p className="text-sm text-muted-foreground">Core algorithms developed for proprietary desk.</p>
                  </div>
                  <div className="border-b border-white/10 pb-6">
                    <h4 className="text-white font-bold mb-2">2021</h4>
                    <p className="text-sm text-muted-foreground">Infrastructure rebuilt for multi-account management.</p>
                  </div>
                  <div className="border-b border-white/10 pb-6">
                    <h4 className="text-white font-bold mb-2">2023</h4>
                    <p className="text-sm text-muted-foreground">Launch of retail platform ECMarketsIndia.</p>
                  </div>
                  <div>
                    <h4 className="text-gradient-gold font-bold mb-2">Present</h4>
                    <p className="text-sm text-white">Over $120M in AUM managed automatically.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-white/[0.02] border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">Core Principles</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass-card p-6 rounded-2xl glass-card-hover"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center mb-6">
                  <value.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{value.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
