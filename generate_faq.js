import * as fs from 'fs';

const homeContent = fs.readFileSync('artifacts/ecmarkets/src/pages/public/Home.tsx', 'utf-8');
const marketsContent = fs.readFileSync('artifacts/ecmarkets/src/pages/public/Markets.tsx', 'utf-8');
const strategiesContent = fs.readFileSync('artifacts/ecmarkets/src/pages/public/Strategies.tsx', 'utf-8');
const pricingContent = fs.readFileSync('artifacts/ecmarkets/src/pages/public/Pricing.tsx', 'utf-8');
const faqContent = fs.readFileSync('artifacts/ecmarkets/src/pages/public/Faq.tsx', 'utf-8');

const newFaqContent = `import { PublicLayout } from '@/components/layout/PublicLayout';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { ChevronDown, Search } from 'lucide-react';

export function Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [activeCategory, setActiveCategory] = useState('General');

  const categories = ['General', 'Accounts', 'Trading', 'Deposits & Withdrawals', 'Security'];

  const faqs = [
    // General
    { category: 'General', q: "What is ECMarketsIndia?", a: "ECMarketsIndia is an institutional-grade algorithmic trading platform designed to provide automated, high-frequency, and quantitative trading strategies to retail and professional investors." },
    { category: 'General', q: "How is ECMarketsIndia different from a stockbroker?", a: "Unlike a traditional stockbroker where you manually analyze and execute trades, ECMarketsIndia automates the entire process. We connect to your existing broker and execute trades using our proprietary algorithms." },
    { category: 'General', q: "What is algorithmic trading?", a: "Algorithmic trading uses computer programs to execute trades based on predefined rules. Our systems analyze market data, identify patterns, and execute trades in milliseconds without human emotional bias or hesitation." },
    { category: 'General', q: "Is algorithmic trading legal in India?", a: "Yes, algorithmic trading is entirely legal in India. All our operations strictly comply with SEBI regulations and guidelines." },
    { category: 'General', q: "What markets does ECMarketsIndia trade?", a: "We primarily operate in major Forex pairs, highly liquid commodities like Gold, and global indices, focusing on markets with deep liquidity to minimize slippage." },
    { category: 'General', q: "How are strategies selected for my account?", a: "Depending on your risk profile and capital, you can either select strategies manually from our dashboard or use our smart allocation tool which suggests a diversified portfolio of algorithms." },

    // Accounts
    { category: 'Accounts', q: "How do I open an account?", a: "You can sign up in minutes by clicking 'Open Account', providing your basic details, completing the KYC process, and connecting your broker." },
    { category: 'Accounts', q: "What documents are required for KYC?", a: "We require a government-issued ID (Aadhar/Passport) and a recent proof of address (utility bill or bank statement) to comply with AML/KYC regulations." },
    { category: 'Accounts', q: "How long does KYC verification take?", a: "Most KYC verifications are completed automatically within 5-10 minutes. Manual reviews, if needed, take up to 24 hours." },
    { category: 'Accounts', q: "Can I have multiple strategies active simultaneously?", a: "Yes, we encourage diversification. Depending on your tier, you can allocate your capital across multiple strategies to balance risk and reward." },
    { category: 'Accounts', q: "What is the minimum and maximum capital?", a: "The minimum required capital is ₹20,000 for our Starter tier. There is no maximum limit; institutional accounts can scale to millions with custom risk parameters." },
    { category: 'Accounts', q: "Can I pause or stop a strategy?", a: "Absolutely. You have full control. You can pause or stop any active strategy instantly from your dashboard, which will close open positions or let them run to target based on your preference." },

    // Trading
    { category: 'Trading', q: "How do algorithms decide when to enter/exit trades?", a: "Our algorithms use quantitative models, pattern recognition, and multi-timeframe momentum indicators to identify high-probability setups. Exits are strictly managed via dynamic stop-losses and take-profit targets." },
    { category: 'Trading', q: "Can I see all trades executed on my account?", a: "Yes, full transparency is a core value. Your dashboard displays real-time execution logs, open positions, and detailed historical performance." },
    { category: 'Trading', q: "How are trading signals generated?", a: "Signals are generated in our centralized strategy engine which processes over 10 million data points daily, filtering out noise to find actionable market inefficiencies." },
    { category: 'Trading', q: "What is the typical trade duration?", a: "It varies by strategy. High-Frequency models hold trades for minutes, intraday strategies for a few hours, while our swing and macro models may hold for days." },
    { category: 'Trading', q: "What happens during high-volatility events?", a: "Our platform features a global circuit breaker. During extreme news events or unprecedented volatility, non-essential strategies are automatically paused to protect capital." },

    // Deposits & Withdrawals
    { category: 'Deposits & Withdrawals', q: "How do I deposit funds?", a: "You can deposit funds directly via Bank Transfer (IMPS/NEFT/RTGS), UPI, or selected payment gateways securely through our portal." },
    { category: 'Deposits & Withdrawals', q: "How long do withdrawals take?", a: "Withdrawal requests are processed within 24 hours for standard accounts, and within 4 hours for Professional and Institutional accounts." },
    { category: 'Deposits & Withdrawals', q: "Are there any withdrawal fees?", a: "We do not charge any withdrawal fees. However, standard banking charges applied by your bank may apply." },
    { category: 'Deposits & Withdrawals', q: "What payment methods are accepted?", a: "We accept primary Indian banking methods including UPI, IMPS, NEFT, and RTGS." },

    // Security
    { category: 'Security', q: "Is my money safe?", a: "Yes. Funds are held in segregated tier-1 bank accounts. We only have trading authority over the accounts via LPOA (Limited Power of Attorney) — we cannot withdraw your funds." },
    { category: 'Security', q: "How is my personal data protected?", a: "All data is secured using bank-grade 256-bit AES encryption. We do not sell your data and adhere strictly to data privacy laws." },
    { category: 'Security', q: "What happens in case of a system outage?", a: "Our execution layer operates on triple-redundant cloud infrastructure (AWS/Azure). If a primary server fails, backup systems take over in milliseconds with zero data loss." },
    { category: 'Security', q: "Is ECMarketsIndia SEBI registered?", a: "Yes, our operations and partner brokers are fully compliant with SEBI regulations, ensuring the highest standards of financial integrity." }
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
                  className={\`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-colors \${
                    activeCategory === cat 
                      ? 'bg-[#1E2329] text-[#F0B90B] border-l-2 border-[#F0B90B]' 
                      : 'text-[#848E9C] hover:bg-[#1E2329] hover:text-white'
                  }\`}
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
              className={\`card-stealth overflow-hidden transition-colors \${openIndex === i ? 'border-l-2 border-l-[#F0B90B]' : ''}\`}
            >
              <button
                className="w-full px-6 py-5 flex items-center justify-between text-left focus:outline-none"
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
              >
                <span className={\`font-semibold text-lg pr-8 \${openIndex === i ? 'text-white' : 'text-[#848E9C]'}\`}>{faq.q}</span>
                <ChevronDown 
                  className={\`w-5 h-5 transition-transform duration-300 shrink-0 \${openIndex === i ? 'rotate-180 text-[#F0B90B]' : 'text-[#848E9C]'}\`} 
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
`;
fs.writeFileSync('artifacts/ecmarkets/src/pages/public/Faq.tsx', newFaqContent);

console.log("FAQ generated");
