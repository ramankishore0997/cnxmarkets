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
      category: 'General',
      q: "Do I need trading experience?",
      a: "No prior trading experience is required. ECMarketsIndia is a fully managed quantitative solution. Once you deposit funds and allocate them to a strategy, our systems handle 100% of the analysis, execution, and risk management."
    },
    {
      category: 'General',
      q: "Is ECMarketsIndia regulated?",
      a: "Yes. ECMarketsIndia operates as a SEBI-registered entity in full compliance with Indian financial regulations. We are also fully compliant with PMLA (Prevention of Money Laundering Act) and FEMA regulations for international capital flows."
    },
    {
      category: 'General',
      q: "Who manages the algorithms?",
      a: "Our dedicated quant research team of 15+ professionals manages all algorithmic strategies. The team includes quantitative analysts, software engineers, and former institutional traders with backgrounds from leading hedge funds and investment banks."
    },
    {
      category: 'General',
      q: "What is the track record of your algorithms?",
      a: "Our flagship strategies have a verified 5-year live trading track record. Average annual returns range from 28% to 72% depending on the risk tier, with maximum drawdowns below 12%. All performance data is available for verified clients on the dashboard."
    },
    {
      category: 'General',
      q: "Can I use ECMarketsIndia alongside manual trading?",
      a: "Absolutely. Many of our clients use ECMarketsIndia as a passive algorithmic income stream alongside their existing manual trading or investment portfolios. The accounts are completely independent."
    },
    {
      category: 'Accounts',
      q: "What is the minimum deposit?",
      a: "The minimum deposit to activate the Starter Algo is ₹20,000. However, to access the full suite of strategies and optimal risk diversification, we recommend the Professional tier starting at ₹1,00,000."
    },
    {
      category: 'Accounts',
      q: "What does the analytics dashboard show?",
      a: "Your dashboard provides a real-time view of your portfolio: live equity curve, open positions, closed trade log with full details (entry, exit, P&L), strategy allocation breakdown, and historical performance metrics. All data is updated tick-by-tick."
    },
    {
      category: 'Accounts',
      q: "Can I switch between account tiers?",
      a: "Yes. You can upgrade your tier at any time by depositing additional capital to meet the new threshold. Your strategy access and execution priority are upgraded immediately after confirmation. Downgrading is also possible with a withdrawal request."
    },
    {
      category: 'Accounts',
      q: "How do I open an account?",
      a: "Opening an account takes under 10 minutes. Register online, complete your KYC (Aadhaar, PAN, selfie), fund your account via UPI/NEFT/IMPS, and activate your chosen strategy. You'll receive live dashboard access immediately after KYC approval."
    },
    {
      category: 'Accounts',
      q: "Can I have multiple strategies running simultaneously?",
      a: "Yes, Professional and Institutional tier clients can run multiple strategies concurrently with custom capital allocation. For example, you can allocate 40% to RazrMarket, 30% to Gold Breakout, and 30% to Momentum Alpha."
    },
    {
      category: 'Accounts',
      q: "What documents are required for KYC?",
      a: "For Indian residents: Aadhaar card (front & back), PAN card, a recent bank statement (last 3 months), and a live selfie for identity verification. For NRIs: Passport, OCI card, proof of overseas address, and NRE/NRO bank statement."
    },
    {
      category: 'Trading',
      q: "Which markets do your algorithms trade?",
      a: "Our core strategies operate primarily on major Forex pairs (EUR/USD, GBP/USD, USD/JPY) and high-liquidity commodities like Gold (XAU/USD). We focus on markets with deep liquidity to minimize slippage."
    },
    {
      category: 'Trading',
      q: "How do I monitor performance?",
      a: "You get access to a real-time dashboard showing your live equity curve, open positions, historical trades, and performance metrics. Everything is completely transparent with trade-by-trade detail."
    },
    {
      category: 'Trading',
      q: "How often do the algorithms trade?",
      a: "Trading frequency varies by strategy. Our HFT strategies like Velocity FX may execute 50-200+ trades per day. Swing strategies like Atlas and Macro Flow may execute 2-5 trades per week. The dashboard shows all open and closed positions in real time."
    },
    {
      category: 'Trading',
      q: "What happens during extreme market events (crashes, flash crashes)?",
      a: "Our platform has platform-level circuit breakers that automatically pause all trading during extreme events. Individual strategies also have hard drawdown limits. During black swan events like COVID-19 or the 2015 CHF unpeg, our risk systems would trigger automatic deactivation before significant losses."
    },
    {
      category: 'Trading',
      q: "Can I see individual trade details?",
      a: "Yes. Your dashboard shows a complete trade log including entry price, exit price, lot size, P&L per trade, strategy source, and duration. You can export your full trade history as a CSV/PDF for tax reporting."
    },
    {
      category: 'Deposits & Withdrawals',
      q: "Can I withdraw my money at any time?",
      a: "Absolutely. There is zero lock-in period. You can pause trading and request a withdrawal at any time from your dashboard. Withdrawals are typically processed within 24 hours for Professional accounts."
    },
    {
      category: 'Deposits & Withdrawals',
      q: "What deposit methods are accepted?",
      a: "We accept UPI, NEFT, RTGS, IMPS, and bank wire for domestic Indian clients. NRI clients can fund via NRE/NRO account wire transfer. Minimum deposit amounts: Starter ₹20,000 | Professional ₹1,00,000 | Institutional ₹5,00,000."
    },
    {
      category: 'Deposits & Withdrawals',
      q: "How long do withdrawals take?",
      a: "Starter accounts: Within 24 hours (business days). Professional accounts: Priority 4-hour processing. Institutional accounts: Instant settlement available. All withdrawals are processed only to verified bank accounts in your name — never third-party accounts."
    },
    {
      category: 'Deposits & Withdrawals',
      q: "Can I add capital to an existing account?",
      a: "Yes. You can top up your account at any time via UPI, NEFT, RTGS, or IMPS. Additional deposits are reflected in your portfolio within one business day. There is no restriction on how many times you can deposit."
    },
    {
      category: 'Security',
      q: "Is my money safe?",
      a: "Yes. Funds are held in segregated tier-1 bank accounts. We only have trading authority over the accounts via LPOA (Limited Power of Attorney) — we cannot withdraw your funds. Only you can deposit and withdraw to accounts matching your verified ID."
    },
    {
      category: 'Security',
      q: "What happens if ECMarketsIndia shuts down?",
      a: "Client funds are completely segregated from company operating funds in separate tier-1 bank accounts. In the unlikely event of company closure, client funds are fully protected and returned immediately. We are also fully insured against operational risk."
    },
    {
      category: 'Security',
      q: "How is my personal data protected?",
      a: "All personal data is encrypted using 256-bit AES encryption both in transit and at rest. We are fully compliant with PDPA (Personal Data Protection Act) guidelines. We never sell, share, or rent your personal data to third parties."
    },
    {
      category: 'Security',
      q: "What security features protect my account?",
      a: "Two-factor authentication (2FA) via Google Authenticator or SMS is mandatory for all account actions. Login activity is monitored for suspicious behavior. Withdrawal requests require both 2FA confirmation and email OTP verification."
    },
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