import { PublicLayout } from '@/components/layout/PublicLayout';
import { motion } from 'framer-motion';
import { Check, X, ShieldAlert, ChevronDown } from 'lucide-react';
import { Link } from 'wouter';
import { useState } from 'react';

export function Pricing() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const plans = [
    {
      name: "Starter Algo",
      minDeposit: "₹20,000",
      description: "Perfect for retail investors testing quantitative strategies.",
      features: [
        "Access to 2 core strategies",
        "Standard execution latency",
        "Daily performance reports",
        "Email support",
        "Withdraw anytime (24h processing)",
      ],
      notIncluded: [
        "Direct API access",
        "Dedicated account manager",
        "Custom strategy allocation"
      ],
      cta: "Start with ₹20k",
      popular: false
    },
    {
      name: "Professional Algo",
      minDeposit: "₹1,00,000",
      description: "For serious investors seeking optimized returns.",
      features: [
        "Access to all 5 premium strategies",
        "Priority low-latency execution",
        "Custom strategy allocation sliders",
        "Real-time SMS alerts",
        "Dedicated account manager",
        "Priority withdrawals (4h processing)"
      ],
      notIncluded: [
        "Direct API access"
      ],
      cta: "Open Professional Account",
      popular: true
    },
    {
      name: "Institutional",
      minDeposit: "₹5,00,000",
      description: "Ultra-low latency execution for high-net-worth clients.",
      features: [
        "Access to all strategies + beta algorithms",
        "Zero-latency FIX API execution",
        "Custom risk parameter settings",
        "Direct line to quant desk",
        "Instant withdrawals",
        "White-label reporting options"
      ],
      notIncluded: [],
      cta: "Contact VIP Desk",
      popular: false
    }
  ];

  return (
    <PublicLayout>
      <div className="pt-20 pb-12 text-center section-dark border-b border-[#2B3139]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Transparent <span className="text-gradient-gold">Pricing</span></h1>
          <p className="text-lg text-[#848E9C] max-w-2xl mx-auto mb-6">
            No hidden management fees. We charge a strict 20% performance fee on high-water mark profits only. If we don't perform, we don't get paid.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <span className="zero-fee-badge">✓ Zero Platform Fees</span>
            <span className="zero-fee-badge">✓ No Profit Sharing</span>
            <span className="zero-fee-badge">✓ 20% Performance Fee — New Profits Only</span>
          </div>
          <p className="text-[#848E9C] text-sm mt-4 max-w-xl mx-auto">Zero Fees Trading — No platform fees and no profit-sharing charges. You keep 100% of your capital growth minus performance fees on new highs.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto items-center">
          {plans.map((plan, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`rounded-xl p-8 relative flex flex-col ${
                plan.popular 
                  ? 'card-stealth-gold scale-105 z-10' 
                  : 'card-stealth'
              }`}
            >
              {plan.popular && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#F0B90B] text-black text-xs font-bold uppercase tracking-wider py-1.5 px-4 rounded-full shadow-md">
                  Most Popular
                </div>
              )}
              
              <h3 className={`text-2xl font-bold mb-2 text-white`}>{plan.name}</h3>
              <div className="mb-4">
                <span className={`text-sm text-[#848E9C]`}>Min. Capital</span>
                <div className={`text-3xl font-bold text-[#F0B90B]`}>{plan.minDeposit}</div>
              </div>
              <p className={`text-sm mb-8 text-[#848E9C]`}>{plan.description}</p>
              
              <div className="flex-1 space-y-4 mb-8">
                {plan.features.map((feature, j) => (
                  <div key={j} className="flex items-start gap-3">
                    <Check className={`w-5 h-5 shrink-0 text-[#02C076]`} />
                    <span className={`text-sm text-[#EAECEF]`}>{feature}</span>
                  </div>
                ))}
                {plan.notIncluded.map((feature, j) => (
                  <div key={`not-${j}`} className="flex items-start gap-3 opacity-50">
                    <X className={`w-5 h-5 shrink-0 text-[#CF304A]`} />
                    <span className={`text-sm line-through text-[#848E9C]`}>{feature}</span>
                  </div>
                ))}
              </div>
              
              <Link 
                href="/auth/register" 
                className={`w-full py-3.5 rounded-md font-bold text-center transition-all ${
                  plan.popular 
                    ? 'btn-gold' 
                    : 'btn-ghost'
                }`}
              >
                {plan.cta}
              </Link>
            </motion.div>
          ))}
        </div>

        <div className="mt-20 max-w-4xl mx-auto card-stealth p-8 flex flex-col md:flex-row items-center gap-8 border-l-4 border-l-[#F0B90B]">
          <div className="w-16 h-16 rounded-full bg-[#1E2329] border border-[#2B3139] flex items-center justify-center shrink-0">
            <ShieldAlert className="w-8 h-8 text-[#F0B90B]" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white mb-2">High-Water Mark Policy</h3>
            <p className="text-[#848E9C]">
              Our 20% performance fee is strictly calculated using a High-Water Mark (HWM). This means if your account drops in value, we must recover the losses before charging performance fees again. We only profit when your account reaches new all-time highs.
            </p>
          </div>
        </div>
      </div>

      {/* FEATURE COMPARISON TABLE */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-white mb-3">Full Feature Comparison</h2>
          <p className="text-[#848E9C]">Every feature across every tier, side by side.</p>
        </div>
        <div className="card-stealth overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#2B3139]">
              <tr>
                <th className="px-5 py-4 text-left text-[#EAECEF] font-bold">Feature</th>
                <th className="px-5 py-4 text-center text-[#848E9C] font-bold">Starter</th>
                <th className="px-5 py-4 text-center text-[#F0B90B] font-bold">Professional</th>
                <th className="px-5 py-4 text-center text-[#848E9C] font-bold">Institutional</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2B3139]">
              {[
                ["Min. Capital", "₹20,000", "₹1,00,000", "₹5,00,000"],
                ["Management Fee", "Zero", "Zero", "Zero"],
                ["Performance Fee", "20% HWM", "20% HWM", "20% HWM"],
                ["Strategies Access", "2 strategies", "All 5+ strategies", "All + Beta"],
                ["Execution Speed", "Standard", "Priority", "Zero-Latency FIX"],
                ["Custom Allocation", "❌", "✅", "✅"],
                ["Account Manager", "❌", "✅ Dedicated", "✅ Direct Quant"],
                ["Trade Alerts", "Email", "Email + SMS", "All + WhatsApp"],
                ["Withdrawal Time", "24 hours", "4 hours", "Instant"],
                ["KYC Turnaround", "24 hours", "4 hours", "1 hour"],
                ["Dashboard Access", "✅", "✅ Advanced", "✅ Institutional"],
                ["API Access", "❌", "❌", "✅ FIX API"],
                ["White-Label Reports", "❌", "❌", "✅"],
                ["Custom Risk Params", "❌", "❌", "✅"],
                ["Support Channel", "Email", "Email + Phone", "Direct Quant Line"],
              ].map(([feat, s, p, i], idx) => (
                <tr key={idx} className={idx % 2 === 0 ? "bg-[#0B0E11]/30" : ""}>
                  <td className="px-5 py-3.5 text-[#EAECEF] font-medium">{feat}</td>
                  <td className="px-5 py-3.5 text-center text-[#848E9C] text-sm">{s}</td>
                  <td className="px-5 py-3.5 text-center text-[#F0B90B] font-semibold text-sm">{p}</td>
                  <td className="px-5 py-3.5 text-center text-[#EAECEF] text-sm">{i}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* GUARANTEE */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="bg-[linear-gradient(135deg,rgba(240,185,11,0.1),rgba(240,185,11,0.05))] border border-[#F0B90B]/40 rounded-2xl p-8 text-center">
          <div className="text-5xl mb-4">🛡️</div>
          <h2 className="text-2xl font-bold text-white mb-3">The ECMarketsIndia Guarantee</h2>
          <p className="text-[#848E9C] leading-relaxed max-w-2xl mx-auto">
            Zero management fees. Performance fees only on new profits. Full transparency via live dashboard. No lock-in periods. Withdraw anytime. If our strategies underperform, we earn nothing. Our alignment with your financial success is absolute.
          </p>
        </div>
      </div>

      {/* PRICING FAQ */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <h2 className="text-2xl font-bold text-white mb-8 text-center">Pricing Questions</h2>
        <div className="space-y-3">
          {[
            { q: "When exactly is the performance fee charged?", a: "Performance fees are charged quarterly (every 3 months) on net new profits above your High-Water Mark. You'll receive a detailed performance statement 5 days before deduction, with full transparency on calculations." },
            { q: "What if my account loses money?", a: "No performance fees are charged on losses. Ever. Your account must recover all losses and surpass the previous HWM before we charge another performance fee. In a losing month, we earn nothing." },
            { q: "Can I switch between tiers?", a: "Yes. You can upgrade tiers at any time by depositing additional capital to reach the new threshold. Downgrading requires a withdrawal to below the tier minimum and is processed within the next settlement cycle." },
            { q: "Is there a trial period or demo?", a: "We offer a 30-day paper trading demo for all new registrants to observe our algorithm performance without committing real capital. Contact our team after registration to activate your demo environment." },
          ].map((faq, i) => (
            <div key={i} className={`card-stealth overflow-hidden ${openFaq === i ? 'border-l-2 border-l-[#F0B90B]' : ''}`}>
              <button className="w-full px-6 py-4 flex justify-between items-center text-left" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                <span className={`font-semibold ${openFaq === i ? 'text-white' : 'text-[#848E9C]'}`}>{faq.q}</span>
                <ChevronDown className={`w-5 h-5 shrink-0 transition-transform ${openFaq === i ? 'rotate-180 text-[#F0B90B]' : 'text-[#848E9C]'}`} />
              </button>
              {openFaq === i && (
                <div className="px-6 pb-5 text-[#848E9C] text-sm leading-relaxed border-t border-[#2B3139] pt-4">{faq.a}</div>
              )}
            </div>
          ))}
        </div>
        <div className="text-center mt-10">
          <p className="text-[#848E9C] mb-4">Have more questions about pricing?</p>
          <Link href="/contact" className="btn-ghost inline-block">Contact Our Team</Link>
        </div>
      </div>
    </PublicLayout>
  );
}