import { PublicLayout } from '@/components/layout/PublicLayout';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { ChevronDown, Search } from 'lucide-react';

export function Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [activeCategory, setActiveCategory] = useState('General');

  const categories = ['General', 'Accounts', 'Trading', 'Deposits & Withdrawals', 'Security'];

  const faqs = [
    {
      category: 'General',
      q: "What exactly is algorithmic trading?",
      a: "Algorithmic trading uses computer programs to execute trades based on predefined rules. Our systems analyze market data, identify patterns, and execute trades in milliseconds without human emotional bias or hesitation."
    },
    {
      category: 'Security',
      q: "Is my money safe?",
      a: "Yes. Funds are held in segregated tier-1 bank accounts. We only have trading authority over the accounts via LPOA (Limited Power of Attorney) — we cannot withdraw your funds. Only you can deposit and withdraw to accounts matching your verified ID."
    },
    {
      category: 'Accounts',
      q: "What is the minimum deposit?",
      a: "The minimum deposit to activate the Starter Algo is ₹20,000. However, to access the full suite of strategies and optimal risk diversification, we recommend the Professional tier starting at ₹1,00,000."
    },
    {
      category: 'Deposits & Withdrawals',
      q: "Can I withdraw my money at any time?",
      a: "Absolutely. There is zero lock-in period. You can pause trading and request a withdrawal at any time from your dashboard. Withdrawals are typically processed within 24 hours."
    },
    {
      category: 'Accounts',
      q: "How does the performance fee work?",
      a: "We charge a 20% performance fee on new profits only, utilizing a High-Water Mark model. If your account starts at ₹1,00,000 and grows to ₹1,10,000, we take 20% of the ₹10,000 profit. If it drops back to ₹1,05,000, no fee is charged until it surpasses ₹1,10,000 again."
    },
    {
      category: 'Trading',
      q: "Which markets do your algorithms trade?",
      a: "Our core strategies operate primarily on major Forex pairs (EUR/USD, GBP/USD, USD/JPY) and high-liquidity commodities like Gold (XAU/USD). We focus on markets with deep liquidity to minimize slippage."
    },
    {
      category: 'General',
      q: "Do I need trading experience?",
      a: "No prior trading experience is required. ECMarketsIndia is a fully managed quantitative solution. Once you deposit funds and allocate them to a strategy, our systems handle 100% of the analysis, execution, and risk management."
    },
    {
      category: 'Trading',
      q: "How do I monitor performance?",
      a: "You get access to a real-time dashboard showing your live equity curve, open positions, historical trades, and performance metrics. Everything is completely transparent."
    }
  ];

  const filteredFaqs = faqs.filter(faq => faq.category === activeCategory);

  return (
    <PublicLayout>
      <div className="pt-24 pb-16 text-center section-dark border-b border-[#2B3139]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">Frequently Asked <span className="text-gradient-gold">Questions</span></h1>
          <p className="text-xl text-[#848E9C] mb-8">
            Everything you need to know about our algorithms, security, and operations.
          </p>
          
          <div className="relative max-w-xl mx-auto">
            <Search className="absolute left-4 top-3.5 h-5 w-5 text-[#848E9C]" />
            <input 
              type="text" 
              placeholder="Search for answers..." 
              className="input-stealth pl-12 py-3 text-lg"
            />
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 mb-20 flex flex-col md:flex-row gap-12">
        <div className="w-full md:w-64 shrink-0">
          <h3 className="font-bold text-white mb-4 uppercase tracking-wider text-sm">Categories</h3>
          <ul className="space-y-2">
            {categories.map(cat => (
              <li key={cat}>
                <button 
                  onClick={() => { setActiveCategory(cat); setOpenIndex(0); }}
                  className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    activeCategory === cat 
                      ? 'bg-[#1E2329] text-[#F0B90B] border-l-2 border-[#F0B90B]' 
                      : 'text-[#848E9C] hover:bg-[#1E2329] hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              </li>
            ))}
          </ul>
        </div>
        
        <div className="flex-1 space-y-4">
          <h2 className="text-2xl font-bold text-white mb-6">{activeCategory}</h2>
          {filteredFaqs.length > 0 ? filteredFaqs.map((faq, i) => (
            <div 
              key={i} 
              className={`card-stealth overflow-hidden transition-colors ${openIndex === i ? 'border-l-2 border-l-[#F0B90B]' : ''}`}
            >
              <button
                className="w-full px-6 py-5 flex items-center justify-between text-left focus:outline-none"
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
              >
                <span className={`font-semibold text-lg pr-8 ${openIndex === i ? 'text-white' : 'text-[#848E9C]'}`}>{faq.q}</span>
                <ChevronDown 
                  className={`w-5 h-5 transition-transform duration-300 shrink-0 ${openIndex === i ? 'rotate-180 text-[#F0B90B]' : 'text-[#848E9C]'}`} 
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
                    <div className="px-6 pb-5 text-[#848E9C] leading-relaxed border-t border-[#2B3139] pt-4">
                      {faq.a}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )) : (
            <div className="text-[#848E9C] py-8 text-center">No questions found for this category.</div>
          )}
        </div>
      </div>
    </PublicLayout>
  );
}