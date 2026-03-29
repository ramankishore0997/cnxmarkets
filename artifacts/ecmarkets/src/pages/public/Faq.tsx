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
      q: "What is ECMarket Pro?",
      a: "ECMarket Pro is a UAE-regulated global forex broker offering traders access to 200+ instruments including Forex pairs, Cryptocurrencies, Commodities, Indices, and Stocks — all from one account with spreads from 0.0 pips and leverage up to 1:2000."
    },
    {
      category: 'General',
      q: "Is ECMarket Pro regulated?",
      a: "Yes. ECMarket Pro is a regulated forex broker headquartered in the UAE. We operate under strict financial compliance standards and maintain full client fund segregation at all times."
    },
    {
      category: 'General',
      q: "How does ECMarket Pro protect client funds?",
      a: "Client funds are held in fully segregated tier-1 bank accounts, completely separate from company operating capital. Only you can initiate deposits and withdrawals — we never have access to move your funds without your authorization."
    },
    {
      category: 'General',
      q: "Do I need prior trading experience?",
      a: "No experience is required to open an account. However, please be aware that trading in financial markets carries risk. We provide educational resources and a demo environment to help you get started responsibly."
    },
    {
      category: 'General',
      q: "Which countries can use ECMarket Pro?",
      a: "ECMarket Pro serves clients globally with a strong focus on Indian and South Asian traders. Our local payment methods (UPI, Bank Transfer) are specifically designed for the Indian market."
    },
    {
      category: 'Accounts',
      q: "How do I open a live account?",
      a: "Opening an account takes under 5 minutes. Register online, complete your KYC (Aadhaar + PAN for Indian residents), fund your account via UPI, Bank Transfer, or Crypto, and start trading immediately after verification."
    },
    {
      category: 'Accounts',
      q: "What documents are required for KYC?",
      a: "For Indian residents: Aadhaar card (front & back), PAN card, a recent bank statement (last 3 months), and a selfie for identity verification. For NRIs: Passport, proof of overseas address, and bank statement."
    },
    {
      category: 'Accounts',
      q: "What does the trading dashboard show?",
      a: "Your dashboard shows your live portfolio balance, open positions, closed trade history with full P&L details, deposit and withdrawal history, and real-time market data."
    },
    {
      category: 'Accounts',
      q: "Can I have multiple accounts?",
      a: "Each verified identity can hold one live account. If you require additional account types (e.g., for different trading styles), please contact our support team."
    },
    {
      category: 'Trading',
      q: "What instruments can I trade?",
      a: "You can trade 200+ instruments including 80+ Forex pairs (majors, minors, exotics), Cryptocurrencies (BTC, ETH, SOL and more), Gold & Silver, Oil, Global Indices (US30, NAS100, S&P500), and top Stocks."
    },
    {
      category: 'Trading',
      q: "What is the maximum leverage offered?",
      a: "ECMarket Pro offers leverage up to 1:2000 on major forex pairs. Leverage on crypto and commodities varies by instrument. Higher leverage amplifies both profits and losses — please trade responsibly."
    },
    {
      category: 'Trading',
      q: "What are the spreads?",
      a: "Spreads start from 0.0 pips on major pairs like EUR/USD and GBP/USD during peak liquidity hours. All spreads are displayed in real time on the trading platform before order execution."
    },
    {
      category: 'Trading',
      q: "What are the trading hours?",
      a: "Forex markets are open 24 hours a day, 5 days a week (Monday to Friday). Crypto markets are available 24/7. Indices and commodities have specific session hours as listed on the platform."
    },
    {
      category: 'Trading',
      q: "Can I see my full trade history?",
      a: "Yes. Your dashboard shows a complete trade log including entry price, exit price, lot size, P&L per trade, and duration. You can export your full history for tax reporting purposes."
    },
    {
      category: 'Deposits & Withdrawals',
      q: "What deposit methods are available?",
      a: "We accept UPI (PhonePe, GPay, Paytm & all UPI apps), Bank Transfer (NEFT, RTGS, IMPS), and Crypto (USDT, BTC, ETH and more). All deposits are instant with zero deposit fees."
    },
    {
      category: 'Deposits & Withdrawals',
      q: "How long do withdrawals take?",
      a: "Withdrawals are processed within 1 hour to your registered bank account, UPI ID, or crypto wallet — 24 hours a day, 7 days a week. This is one of the fastest withdrawal times in the industry."
    },
    {
      category: 'Deposits & Withdrawals',
      q: "Are there any withdrawal fees?",
      a: "No. ECMarket Pro charges zero withdrawal fees. The full amount you request is transferred to your account without any deductions from our side."
    },
    {
      category: 'Deposits & Withdrawals',
      q: "Can I withdraw at any time?",
      a: "Yes. There is no lock-in period. You can request a withdrawal at any time from your dashboard. Your funds are always available — no restrictions or waiting periods."
    },
    {
      category: 'Security',
      q: "Is my money safe?",
      a: "Yes. Funds are held in segregated tier-1 bank accounts entirely separate from company assets. We are UAE regulated and maintain strict AML/KYC compliance to protect client funds at all times."
    },
    {
      category: 'Security',
      q: "What happens if ECMarket Pro shuts down?",
      a: "Client funds are completely segregated from company operating funds. In the unlikely event of closure, client funds are fully protected and returned immediately — they are never used for company operations."
    },
    {
      category: 'Security',
      q: "How is my personal data protected?",
      a: "All personal data is encrypted using 256-bit AES encryption both in transit and at rest. We never sell, share, or rent your personal data to third parties."
    },
    {
      category: 'Security',
      q: "What security features protect my account?",
      a: "Two-factor authentication (2FA) is available for all accounts. Login activity is monitored for suspicious behavior. Withdrawal requests are verified against your registered identity."
    },
  ];

  const filteredFaqs = faqs.filter(faq => faq.category === activeCategory);

  return (
    <PublicLayout>
      <div className="pt-24 pb-16 text-center section-dark border-b border-[#181B23]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">Frequently Asked <span className="text-gradient-gold">Questions</span></h1>
          <p className="text-xl text-[#848E9C] mb-8">
            Everything you need to know about trading with ECMarket Pro — accounts, instruments, leverage, and withdrawals.
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
                      ? 'bg-[#1E2329] text-[#00C274] border-l-2 border-[#00C274]' 
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
              className={`card-stealth overflow-hidden transition-colors ${openIndex === i ? 'border-l-2 border-l-[#00C274]' : ''}`}
            >
              <button
                className="w-full px-6 py-5 flex items-center justify-between text-left focus:outline-none"
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
              >
                <span className={`font-semibold text-lg pr-8 ${openIndex === i ? 'text-white' : 'text-[#848E9C]'}`}>{faq.q}</span>
                <ChevronDown 
                  className={`w-5 h-5 transition-transform duration-300 shrink-0 ${openIndex === i ? 'rotate-180 text-[#00C274]' : 'text-[#848E9C]'}`} 
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
                    <div className="px-6 pb-5 text-[#848E9C] leading-relaxed border-t border-[#181B23] pt-4">
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