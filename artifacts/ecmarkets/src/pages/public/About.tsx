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
      <section className="pt-24 pb-20 section-dark border-b border-[#2B3139] text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-bold text-white mb-6"
          >
            Engineering <span className="text-gradient-gold">Alpha</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-[#848E9C] max-w-3xl mx-auto"
          >
            ECMarketsIndia was founded by quantitative researchers and software engineers to bridge the gap between retail capital and institutional execution.
          </motion.p>
        </div>
      </section>

      {/* Story */}
      <section className="py-24 section-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">The Next Evolution of Retail Trading</h2>
              <p className="text-[#848E9C] mb-4 leading-relaxed text-lg">
                For decades, the most profitable trading strategies have been locked behind the high entry barriers of proprietary trading firms and quantitative hedge funds. Retail investors were left to compete using manual execution and delayed data.
              </p>
              <p className="text-[#848E9C] mb-4 leading-relaxed text-lg">
                We built ECMarketsIndia to change this paradigm. By pooling capital and running our proprietary algorithms on tier-1 liquidity providers, we achieve economies of scale that allow us to offer institutional execution to individual accounts.
              </p>
              <p className="text-[#848E9C] leading-relaxed text-lg">
                Our infrastructure is built on C++ and Rust for execution, paired with Python-based machine learning models for strategy generation, all hosted on co-located servers in Equinix LD4 and NY4.
              </p>
            </div>
            
            <div className="card-stealth p-8 rounded-2xl shadow-xl relative border-t-4 border-t-[#F0B90B]">
              <h3 className="text-2xl font-bold text-white mb-8">Company Timeline</h3>
              <div className="space-y-8 relative before:absolute before:inset-0 before:ml-2 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-[#2B3139] before:to-transparent">
                <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="flex items-center justify-center w-5 h-5 rounded-full border-4 border-[#1E2329] bg-[#F0B90B] shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10"></div>
                  <div className="w-[calc(100%-2rem)] md:w-[calc(50%-1.5rem)] p-4 rounded bg-[#0B0E11] border border-[#2B3139] shadow-sm">
                    <div className="flex items-center justify-between space-x-2 mb-1">
                      <div className="font-bold text-white">2018</div>
                    </div>
                    <div className="text-[#848E9C] text-sm">Core algorithms developed for proprietary desk.</div>
                  </div>
                </div>
                <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="flex items-center justify-center w-5 h-5 rounded-full border-4 border-[#1E2329] bg-[#F0B90B] shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10"></div>
                  <div className="w-[calc(100%-2rem)] md:w-[calc(50%-1.5rem)] p-4 rounded bg-[#0B0E11] border border-[#2B3139] shadow-sm">
                    <div className="flex items-center justify-between space-x-2 mb-1">
                      <div className="font-bold text-white">2021</div>
                    </div>
                    <div className="text-[#848E9C] text-sm">Infrastructure rebuilt for multi-account management.</div>
                  </div>
                </div>
                <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="flex items-center justify-center w-5 h-5 rounded-full border-4 border-[#1E2329] bg-[#F0B90B] shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10"></div>
                  <div className="w-[calc(100%-2rem)] md:w-[calc(50%-1.5rem)] p-4 rounded bg-[#0B0E11] border border-[#2B3139] shadow-sm">
                    <div className="flex items-center justify-between space-x-2 mb-1">
                      <div className="font-bold text-white">2023</div>
                    </div>
                    <div className="text-[#848E9C] text-sm">Launch of retail platform ECMarketsIndia.</div>
                  </div>
                </div>
                <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="flex items-center justify-center w-5 h-5 rounded-full border-4 border-[#F0B90B]/30 bg-[#F0B90B] shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 animate-pulse"></div>
                  <div className="w-[calc(100%-2rem)] md:w-[calc(50%-1.5rem)] p-4 rounded bg-[#F0B90B]/10 border border-[#F0B90B]/50 shadow-sm">
                    <div className="flex items-center justify-between space-x-2 mb-1">
                      <div className="font-bold text-[#F0B90B]">Present</div>
                    </div>
                    <div className="text-white font-medium text-sm">Over $120M in AUM managed automatically.</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-24 section-dark border-t border-[#2B3139]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Core Principles</h2>
            <p className="text-lg text-[#848E9C]">The philosophies that drive our algorithms and our business.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="card-stealth p-8 flex flex-col items-center text-center border-[#F0B90B]/30"
              >
                <div className="w-16 h-16 rounded-xl bg-[#1E2329] border border-[#2B3139] flex items-center justify-center mb-6">
                  <value.icon className="w-8 h-8 text-[#F0B90B]" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{value.title}</h3>
                <p className="text-[#848E9C] text-sm leading-relaxed">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Team Philosophy */}
      <section className="py-24 bg-[#1E2329] border-t border-[#2B3139] text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Our Team</h2>
          <p className="text-xl text-[#848E9C] leading-relaxed mb-8">
            We are a collective of quants, traders, and engineers who believe that code outperforms emotion. We don't employ salespeople or "trading gurus" — our entire focus is on mathematics, execution speed, and absolute returns.
          </p>
          <div className="inline-flex items-center gap-2 border border-[#F0B90B] text-[#F0B90B] px-6 py-2 rounded-full font-semibold">
            Based in Mumbai, Trading Globally
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}