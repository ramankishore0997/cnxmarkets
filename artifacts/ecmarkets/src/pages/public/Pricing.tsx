import { PublicLayout } from '@/components/layout/PublicLayout';
import { motion } from 'framer-motion';
import { Check, X, Shield, Zap, BarChart2, Lock, ChevronDown } from 'lucide-react';
import { Link } from 'wouter';
import { useState } from 'react';

export function Pricing() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const plans = [
    {
      name: "Starter Account",
      minDeposit: "₹20,000",
      label: "Minimum Capital",
      description: "Ideal for investors beginning their algorithmic trading journey.",
      features: [
        "Access to 2 core algo strategies",
        "Standard execution infrastructure",
        "Daily performance analytics reports",
        "Email support channel",
        "Withdraw anytime — 24h processing",
        "Live portfolio dashboard",
      ],
      notIncluded: [
        "Direct API access",
        "Dedicated account manager",
        "Custom strategy allocation",
      ],
      cta: "Open Starter Account",
      popular: false
    },
    {
      name: "Professional Account",
      minDeposit: "₹1,00,000",
      label: "Minimum Capital",
      description: "Full strategy access with priority execution and dedicated support.",
      features: [
        "Access to all 5+ premium strategies",
        "Priority low-latency execution",
        "Custom strategy allocation controls",
        "Real-time SMS & email trade alerts",
        "Dedicated account manager",
        "Priority withdrawals — 4h processing",
        "Advanced analytics dashboard",
      ],
      notIncluded: [
        "Direct FIX API access",
      ],
      cta: "Open Professional Account",
      popular: true
    },
    {
      name: "Institutional Account",
      minDeposit: "₹5,00,000",
      label: "Minimum Capital",
      description: "Full institutional infrastructure for high-net-worth investors.",
      features: [
        "All strategies including beta algorithms",
        "Zero-latency FIX API execution",
        "Custom risk parameter configuration",
        "Direct line to the quant research desk",
        "Instant withdrawal settlement",
        "White-label reporting suite",
        "Full API integration support",
      ],
      notIncluded: [],
      cta: "Contact VIP Desk",
      popular: false
    }
  ];

  return (
    <PublicLayout>
      {/* HEADER */}
      <div className="pt-20 pb-12 text-center section-dark border-b border-[#2B3139]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Account <span className="text-gradient-gold">Access Tiers</span></h1>
          <p className="text-lg text-[#848E9C] max-w-2xl mx-auto mb-6">
            Choose your capital tier to unlock the full power of our algorithmic trading infrastructure. Every account gets access to real-time analytics, live dashboards, and institutional-grade strategy execution.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <span className="bg-[#02C076]/10 border border-[#02C076]/30 text-[#02C076] text-sm font-semibold rounded-xl px-4 py-2">✓ No Lock-in Period</span>
            <span className="bg-[#02C076]/10 border border-[#02C076]/30 text-[#02C076] text-sm font-semibold rounded-xl px-4 py-2">✓ Withdraw Anytime</span>
            <span className="bg-[#02C076]/10 border border-[#02C076]/30 text-[#02C076] text-sm font-semibold rounded-xl px-4 py-2">✓ Transparent Platform</span>
          </div>
        </div>
      </div>

      {/* PLAN CARDS */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto items-center">
          {plans.map((plan, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`rounded-2xl p-8 relative flex flex-col ${
                plan.popular ? 'card-stealth-gold scale-105 z-10' : 'card-stealth'
              }`}
            >
              {plan.popular && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#F0B90B] text-black text-xs font-bold uppercase tracking-wider py-1.5 px-4 rounded-full shadow-md">
                  Most Popular
                </div>
              )}

              <h3 className="text-2xl font-bold mb-2 text-white">{plan.name}</h3>
              <div className="mb-4">
                <span className="text-sm text-[#848E9C]">{plan.label}</span>
                <div className="text-3xl font-bold text-[#F0B90B]">{plan.minDeposit}</div>
              </div>
              <p className="text-sm mb-6 text-[#848E9C] leading-relaxed">{plan.description}</p>

              <div className="flex-1 space-y-3 mb-8">
                {plan.features.map((feature, j) => (
                  <div key={j} className="flex items-start gap-3">
                    <Check className="w-5 h-5 shrink-0 text-[#02C076] mt-0.5" />
                    <span className="text-sm text-[#EAECEF]">{feature}</span>
                  </div>
                ))}
                {plan.notIncluded.map((feature, j) => (
                  <div key={`not-${j}`} className="flex items-start gap-3 opacity-40">
                    <X className="w-5 h-5 shrink-0 text-[#CF304A] mt-0.5" />
                    <span className="text-sm line-through text-[#848E9C]">{feature}</span>
                  </div>
                ))}
              </div>

              <Link
                href="/auth/register"
                className={`w-full py-3.5 rounded-xl font-bold text-center transition-all ${
                  plan.popular ? 'btn-gold' : 'btn-ghost'
                }`}
              >
                {plan.cta}
              </Link>
            </motion.div>
          ))}
        </div>

        {/* PLATFORM PROMISE */}
        <div className="mt-16 max-w-4xl mx-auto card-stealth p-8 flex flex-col md:flex-row items-center gap-8 border-l-4 border-l-[#F0B90B]">
          <div className="w-16 h-16 rounded-full bg-[#0B0E11] border border-[#2B3139] flex items-center justify-center shrink-0">
            <Shield className="w-8 h-8 text-[#F0B90B]" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white mb-2">The ECMarketsIndia Platform Promise</h3>
            <p className="text-[#848E9C] leading-relaxed">
              Full transparency via live dashboard. No lock-in periods. Withdraw anytime. Segregated tier-1 accounts with full client protection. Institutional-grade technology accessible to every account tier.
            </p>
          </div>
        </div>
      </div>

      {/* FEATURE COMPARISON TABLE */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-white mb-3">Full Feature Comparison</h2>
          <p className="text-[#848E9C]">Every capability across every account tier, side by side.</p>
        </div>
        <div className="card-stealth overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#2B3139]">
              <tr>
                <th className="px-5 py-4 text-left text-[#EAECEF] font-bold">Capability</th>
                <th className="px-5 py-4 text-center text-[#848E9C] font-bold">Starter</th>
                <th className="px-5 py-4 text-center text-[#F0B90B] font-bold">Professional</th>
                <th className="px-5 py-4 text-center text-[#848E9C] font-bold">Institutional</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2B3139]">
              {[
                ["Minimum Capital", "₹20,000", "₹1,00,000", "₹5,00,000"],
                ["Strategy Access", "2 strategies", "All 5+ strategies", "All + Beta"],
                ["Execution Speed", "Standard", "Priority", "Zero-Latency FIX"],
                ["Custom Allocation", "❌", "✅", "✅"],
                ["Account Manager", "❌", "✅ Dedicated", "✅ Direct Quant"],
                ["Trade Alerts", "Email", "Email + SMS", "All + WhatsApp"],
                ["Withdrawal Time", "24 hours", "4 hours", "Instant"],
                ["KYC Turnaround", "24 hours", "4 hours", "1 hour"],
                ["Dashboard Access", "✅ Standard", "✅ Advanced", "✅ Institutional"],
                ["API Access", "❌", "❌", "✅ FIX API"],
                ["White-Label Reports", "❌", "❌", "✅"],
                ["Custom Risk Params", "❌", "❌", "✅"],
                ["Support Channel", "Email", "Email + Phone", "Direct Quant Line"],
              ].map(([feat, s, p, ins], idx) => (
                <tr key={idx} className={idx % 2 === 0 ? "bg-[#0B0E11]/30" : ""}>
                  <td className="px-5 py-3.5 text-[#EAECEF] font-medium">{feat}</td>
                  <td className="px-5 py-3.5 text-center text-[#848E9C] text-sm">{s}</td>
                  <td className="px-5 py-3.5 text-center text-[#F0B90B] font-semibold text-sm">{p}</td>
                  <td className="px-5 py-3.5 text-center text-[#EAECEF] text-sm">{ins}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* PLATFORM PILLARS */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-white mb-3">What Every Account Includes</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {[
            { icon: BarChart2, title: "Real-Time Analytics Dashboard", desc: "Monitor your portfolio equity curve, open positions, and strategy performance with live updates." },
            { icon: Zap, title: "Institutional Execution Infrastructure", desc: "Sub-5ms order routing via co-located servers connected to Tier-1 liquidity providers." },
            { icon: Lock, title: "Segregated Capital Protection", desc: "Your capital is held in separate tier-1 bank accounts. We hold trading authority only — you retain full control over deposits and withdrawals." },
            { icon: Shield, title: "Multi-Layer Risk Management", desc: "Automated circuit breakers, drawdown controls, and 24/7 system monitoring on every account." },
          ].map((item, i) => (
            <div key={i} className="card-stealth p-6 flex gap-4">
              <div className="w-12 h-12 bg-[#0B0E11] border border-[#2B3139] rounded-xl flex items-center justify-center shrink-0">
                <item.icon className="w-6 h-6 text-[#F0B90B]" />
              </div>
              <div>
                <h3 className="font-bold text-white mb-1">{item.title}</h3>
                <p className="text-[#848E9C] text-sm leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ACCOUNT FAQ */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <h2 className="text-2xl font-bold text-white mb-8 text-center">Account Questions</h2>
        <div className="space-y-3">
          {[
            { q: "How do I open an account?", a: "Register online in under 10 minutes. Complete your KYC verification (Aadhaar, PAN, selfie), fund your account via UPI/NEFT/IMPS, and activate your chosen strategy. Dashboard access is granted immediately after KYC approval." },
            { q: "Can I upgrade my account tier?", a: "Yes. You can upgrade at any time by depositing additional capital to meet the new tier threshold. Your strategy access and execution priority will be upgraded immediately upon confirmation." },
            { q: "Is there a lock-in period?", a: "No. There is zero lock-in period on any account tier. You can pause strategy execution and request a withdrawal at any time from your dashboard." },
            { q: "Is there a demo or trial environment?", a: "We offer a 30-day paper trading demo for all new registrants to observe algorithm performance without committing real capital. Contact our team after registration to activate your demo." },
            { q: "Can I run multiple strategies at once?", a: "Professional and Institutional clients can run multiple strategies simultaneously with custom capital allocation across each strategy using our allocation control panel." },
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
          <p className="text-[#848E9C] mb-4">Have more questions about our platform?</p>
          <Link href="/contact" className="btn-ghost inline-block">Contact Our Team</Link>
        </div>
      </div>
    </PublicLayout>
  );
}
