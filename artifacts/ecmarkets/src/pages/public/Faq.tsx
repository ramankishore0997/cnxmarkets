import { PublicLayout } from '@/components/layout/PublicLayout';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export function Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: "What exactly is algorithmic trading?",
      a: "Algorithmic trading uses computer programs to execute trades based on predefined rules. Our systems analyze market data, identify patterns, and execute trades in milliseconds without human emotional bias or hesitation."
    },
    {
      q: "Is my money safe?",
      a: "Yes. Funds are held in segregated tier-1 bank accounts. We only have trading authority over the accounts via LPOA (Limited Power of Attorney) — we cannot withdraw your funds. Only you can deposit and withdraw to accounts matching your verified ID."
    },
    {
      q: "What is the minimum deposit?",
      a: "The minimum deposit to activate the Starter Algo is ₹50,000. However, to access the full suite of strategies and optimal risk diversification, we recommend the Professional tier starting at ₹1,00,000."
    },
    {
      q: "Can I withdraw my money at any time?",
      a: "Absolutely. There is zero lock-in period. You can pause trading and request a withdrawal at any time from your dashboard. Withdrawals are typically processed within 24 hours."
    },
    {
      q: "How does the performance fee work?",
      a: "We charge a 20% performance fee on new profits only, utilizing a High-Water Mark model. If your account starts at $10,000 and grows to $11,000, we take 20% of the $1,000 profit. If it drops back to $10,500, no fee is charged until it surpasses $11,000 again."
    },
    {
      q: "Which markets do your algorithms trade?",
      a: "Our core strategies operate primarily on major Forex pairs (EUR/USD, GBP/USD, USD/JPY) and high-liquidity commodities like Gold (XAU/USD). We focus on markets with deep liquidity to minimize slippage."
    },
    {
      q: "Do I need trading experience?",
      a: "No prior trading experience is required. ECMarketsIndia is a fully managed quantitative solution. Once you deposit funds and allocate them to a strategy, our systems handle 100% of the analysis, execution, and risk management."
    },
    {
      q: "How do I monitor performance?",
      a: "You get access to a real-time dashboard showing your live equity curve, open positions, historical trades, and performance metrics. Everything is completely transparent."
    }
  ];

  return (
    <PublicLayout>
      <div className="pt-24 pb-16 text-center">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">Frequently Asked <span className="text-gradient-gold">Questions</span></h1>
          <p className="text-xl text-muted-foreground">
            Everything you need to know about our algorithms, security, and operations.
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 mb-20">
        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <div 
              key={i} 
              className={`glass-card rounded-xl overflow-hidden transition-colors ${openIndex === i ? 'border-primary/50' : 'border-white/5'}`}
            >
              <button
                className="w-full px-6 py-5 flex items-center justify-between text-left focus:outline-none"
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
              >
                <span className="font-semibold text-lg text-white">{faq.q}</span>
                <ChevronDown 
                  className={`w-5 h-5 text-muted-foreground transition-transform duration-300 ${openIndex === i ? 'rotate-180 text-primary' : ''}`} 
                />
              </button>
              <AnimatePresence>
                {openIndex === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  >
                    <div className="px-6 pb-5 text-muted-foreground leading-relaxed">
                      {faq.a}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
        
        <div className="mt-16 text-center">
          <p className="text-muted-foreground mb-4">Still have questions?</p>
          <a href="/contact" className="text-primary font-medium hover:underline">Contact our support team</a>
        </div>
      </div>
    </PublicLayout>
  );
}
