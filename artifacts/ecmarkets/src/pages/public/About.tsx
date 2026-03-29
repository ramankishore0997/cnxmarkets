import { PublicLayout } from '@/components/layout/PublicLayout';
import { motion } from 'framer-motion';
import { ShieldCheck, Target, Globe, TrendingUp } from 'lucide-react';

export function About() {
  const values = [
    {
      icon: Target,
      title: "Our Mission",
      description: "To give every trader access to institutional-grade trading conditions — tight spreads, high leverage, and fast execution — regardless of their account size."
    },
    {
      icon: Globe,
      title: "Global Reach, Local Methods",
      description: "We are headquartered in the UAE and serve clients globally, offering local deposit and withdrawal methods including UPI, Bank Transfer, and Crypto."
    },
    {
      icon: ShieldCheck,
      title: "Client Fund Safety",
      description: "Client funds are held in fully segregated tier-1 bank accounts, completely separate from company operating capital. Your money is always yours."
    },
    {
      icon: TrendingUp,
      title: "Transparency",
      description: "Zero hidden fees, real-time trade reporting, and complete visibility into your account activity — always."
    }
  ];

  return (
    <PublicLayout>
      {/* Hero */}
      <section className="pt-24 pb-20 section-dark border-b border-[#181B23] text-center">
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
            ECMarket Pro is a UAE-regulated global forex broker, offering traders access to 200+ instruments including Forex, Crypto, Indices, and Commodities with spreads from 0.0 pips and leverage up to 1:2000.
          </motion.p>
        </div>
      </section>

      {/* Story */}
      <section className="py-16 section-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">A Broker Built for Today's Trader</h2>
              <p className="text-[#848E9C] mb-4 leading-relaxed text-lg">
                Retail traders deserved better — better spreads, faster execution, and payment methods that actually work locally. ECMarket Pro was built to bridge the gap between global forex markets and Indian traders.
              </p>
              <p className="text-[#848E9C] mb-4 leading-relaxed text-lg">
                We are headquartered in the UAE and offer access to 200+ instruments including major and minor Forex pairs, Cryptocurrencies, Commodities, Indices, and Stocks — all from a single trading account.
              </p>
              <p className="text-[#848E9C] leading-relaxed text-lg">
                With leverage up to 1:2000, spreads starting from 0.0 pips, and local payment methods including UPI, Bank Transfer, and Crypto — we have made professional trading accessible to everyone.
              </p>
            </div>
            
            <div className="card-stealth p-8 rounded-2xl shadow-xl relative border-t-4 border-t-[#00C274]">
              <h3 className="text-2xl font-bold text-white mb-8">Company Timeline</h3>
              <div className="space-y-8 relative before:absolute before:inset-0 before:ml-2 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-[#181B23] before:to-transparent">
                <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="flex items-center justify-center w-5 h-5 rounded-full border-4 border-[#1E2329] bg-[#00C274] shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10"></div>
                  <div className="w-[calc(100%-2rem)] md:w-[calc(50%-1.5rem)] p-4 rounded bg-[#060709] border border-[#181B23] shadow-sm">
                    <div className="flex items-center justify-between space-x-2 mb-1">
                      <div className="font-bold text-white">2018</div>
                    </div>
                    <div className="text-[#848E9C] text-sm">Core algorithms developed for proprietary desk.</div>
                  </div>
                </div>
                <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="flex items-center justify-center w-5 h-5 rounded-full border-4 border-[#1E2329] bg-[#00C274] shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10"></div>
                  <div className="w-[calc(100%-2rem)] md:w-[calc(50%-1.5rem)] p-4 rounded bg-[#060709] border border-[#181B23] shadow-sm">
                    <div className="flex items-center justify-between space-x-2 mb-1">
                      <div className="font-bold text-white">2021</div>
                    </div>
                    <div className="text-[#848E9C] text-sm">Infrastructure rebuilt for multi-account management.</div>
                  </div>
                </div>
                <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="flex items-center justify-center w-5 h-5 rounded-full border-4 border-[#1E2329] bg-[#00C274] shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10"></div>
                  <div className="w-[calc(100%-2rem)] md:w-[calc(50%-1.5rem)] p-4 rounded bg-[#060709] border border-[#181B23] shadow-sm">
                    <div className="flex items-center justify-between space-x-2 mb-1">
                      <div className="font-bold text-white">2023</div>
                    </div>
                    <div className="text-[#848E9C] text-sm">Launch of retail platform ECMarket Pro.</div>
                  </div>
                </div>
                <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="flex items-center justify-center w-5 h-5 rounded-full border-4 border-[#00C274]/30 bg-[#00C274] shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 animate-pulse"></div>
                  <div className="w-[calc(100%-2rem)] md:w-[calc(50%-1.5rem)] p-4 rounded bg-[#00C274]/10 border border-[#00C274]/50 shadow-sm">
                    <div className="flex items-center justify-between space-x-2 mb-1">
                      <div className="font-bold text-[#00C274]">Present</div>
                    </div>
                    <div className="text-white font-medium text-sm">Over ₹120Cr in AUM managed automatically.</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 section-dark border-t border-[#181B23]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
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
                className="card-stealth p-8 flex flex-col items-center text-center border-[#00C274]/30"
              >
                <div className="w-16 h-16 rounded-xl bg-[#1E2329] border border-[#181B23] flex items-center justify-center mb-6">
                  <value.icon className="w-8 h-8 text-[#00C274]" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{value.title}</h3>
                <p className="text-[#848E9C] text-sm leading-relaxed">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Team Philosophy */}
      <section className="py-16 bg-[#1E2329] border-t border-[#181B23] text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Our Team</h2>
          <p className="text-xl text-[#848E9C] leading-relaxed mb-8">
            We are a team of traders, technologists, and compliance professionals committed to providing the best trading conditions in the industry. Our focus is on execution quality, client fund safety, and zero-compromise transparency.
          </p>
          <div className="inline-flex items-center gap-2 border border-[#00C274] text-[#00C274] px-6 py-2 rounded-full font-semibold">
            UAE Regulated · Globally Trusted · Locally Accessible
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}