import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'wouter';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { ChevronDown, ChevronUp, ArrowRight, Search } from 'lucide-react';

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } };
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.07 } } };

const CATEGORIES = ['All', 'Account', 'Deposits & Withdrawals', 'Trading', 'KYC & Verification', 'Security'] as const;
type Category = typeof CATEGORIES[number];

const FAQS: { q: string; a: string; cat: Category }[] = [
  { cat: 'Account', q: 'How do I open an account with ECMarket Pro?', a: 'Opening an account takes just 2 minutes. Click "Open Free Account", fill in your basic details, verify your email, and complete KYC with your Aadhaar + PAN. Your account is ready to fund and trade.' },
  { cat: 'Account', q: 'What account types are available?', a: 'We offer three account types: Standard ($100 min), Pro ($500 min), and Elite ($5,000 min). Each offers different leverage levels, spread conditions, and support options. You can upgrade at any time.' },
  { cat: 'Account', q: 'Can I have a demo account?', a: 'Yes! Every registered user gets access to a free demo account loaded with $10,000 virtual funds. Practice trading with zero risk before going live.' },
  { cat: 'Account', q: 'Can I have multiple trading accounts?', a: 'Yes, you can open up to 5 trading accounts under one client profile. This is useful for separating strategies or testing different account types.' },
  { cat: 'Deposits & Withdrawals', q: 'How long does it take to process a withdrawal?', a: 'Withdrawals are processed within 1 hour to your registered bank account, UPI ID, or crypto wallet — one of the fastest in the industry. Our average processing time is just 23 minutes.' },
  { cat: 'Deposits & Withdrawals', q: 'What deposit methods are accepted?', a: 'We support UPI, Bank Transfer (NEFT/RTGS/IMPS), and Crypto deposits (Bitcoin, USDT TRC20, ETH). All deposits are instant and there are no deposit fees.' },
  { cat: 'Deposits & Withdrawals', q: 'Is there a minimum withdrawal amount?', a: 'The minimum withdrawal amount is $10 (approximately ₹840). There are no withdrawal fees charged by ECMarket Pro, though your bank or payment provider may have their own fees.' },
  { cat: 'Deposits & Withdrawals', q: 'Are there any deposit fees?', a: 'No — ECMarket Pro charges zero deposit fees. You only pay any fees your payment provider charges. UPI deposits are always completely free.' },
  { cat: 'Trading', q: 'What leverage does ECMarket Pro offer?', a: 'We offer leverage up to 1:2000 on major forex pairs for Elite account holders. Standard accounts get 1:500 and Pro accounts get 1:1000. Leverage varies by instrument — indices and crypto have lower leverage.' },
  { cat: 'Trading', q: 'What are the spreads on ECMarket Pro?', a: 'Our spreads start from 0.0 pips on major pairs like EUR/USD and GBP/USD for Elite accounts. Standard accounts have spreads from 1.0 pip. All spreads are competitive and displayed in real-time.' },
  { cat: 'Trading', q: 'What trading platforms do you support?', a: 'We support WebTrader (browser-based), Mobile App (iOS & Android), MetaTrader 4, and MetaTrader 5. All platforms are available for all account types.' },
  { cat: 'Trading', q: 'What instruments can I trade?', a: 'You can trade 200+ instruments including Forex pairs (50+), Cryptocurrencies (30+), Commodities (metals, oil, gas), Global Indices (US30, NAS100, DAX), and Stock CFDs.' },
  { cat: 'Trading', q: 'Is copy trading available?', a: 'Yes! Copy trading is available for Pro and Elite account holders. You can automatically mirror the trades of experienced, verified traders with a proven track record.' },
  { cat: 'KYC & Verification', q: 'What documents are required for KYC?', a: 'For Indian clients: Aadhaar Card (identity) and PAN Card (tax document). For international clients: Government-issued passport + proof of address. All uploads are reviewed within 10 minutes.' },
  { cat: 'KYC & Verification', q: 'How long does KYC verification take?', a: 'KYC is typically verified within 10 minutes during business hours. In peak times it may take up to 1 hour. You will receive an email confirmation once approved.' },
  { cat: 'Security', q: 'Are my funds safe?', a: 'Yes. Client funds are held in segregated accounts at tier-1 banks, completely separate from company operating funds. We are regulated in the UAE. Your funds are always protected.' },
  { cat: 'Security', q: 'What security measures protect my account?', a: 'We use 256-bit SSL encryption, two-factor authentication (2FA), IP monitoring, and withdrawal confirmation emails. All trading activity is monitored in real-time for suspicious behaviour.' },
  { cat: 'Security', q: 'What is Negative Balance Protection?', a: 'Negative Balance Protection ensures your account can never go below zero. Even in extreme market conditions, your maximum loss is limited to your deposited amount.' },
];

export function Faq() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [activeCategory, setActiveCategory] = useState<Category>('All');
  const [search, setSearch] = useState('');

  const filtered = FAQS.filter(f => {
    const matchCat = activeCategory === 'All' || f.cat === activeCategory;
    const matchSearch = !search || f.q.toLowerCase().includes(search.toLowerCase()) || f.a.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <PublicLayout>

      {/* HERO */}
      <section style={{ background: 'linear-gradient(135deg,#0B1929 0%,#0d2035 100%)', padding: '80px 16px 60px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -80, left: '25%', width: 400, height: 400, borderRadius: '50%', background: 'rgba(31,119,180,0.07)', filter: 'blur(80px)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 720, margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <motion.h1 initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
            style={{ fontSize: 'clamp(32px,5vw,56px)', fontWeight: 900, color: '#fff', marginBottom: 16 }}>
            Frequently Asked<br/>
            <span style={{ background: 'linear-gradient(90deg,#1F77B4,#16A34A)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Questions</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
            style={{ color: 'rgba(255,255,255,0.55)', fontSize: 16, marginBottom: 32 }}>
            Everything you need to know about ECMarket Pro.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
            style={{ position: 'relative', maxWidth: 480, margin: '0 auto' }}>
            <Search size={16} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.35)', pointerEvents: 'none' }}/>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search questions..."
              style={{ width: '100%', padding: '14px 16px 14px 44px', borderRadius: 999, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
            />
          </motion.div>
        </div>
      </section>

      {/* CATEGORIES + FAQ */}
      <section style={{ background: '#F5F5F5', padding: '60px 16px 80px' }}>
        <div style={{ maxWidth: 820, margin: '0 auto' }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 36, justifyContent: 'center' }}>
            {CATEGORIES.map(cat => (
              <button key={cat} onClick={() => { setActiveCategory(cat); setOpenFaq(null); }}
                style={{ padding: '9px 18px', borderRadius: 999, border: `1.5px solid ${activeCategory === cat ? '#1F77B4' : '#E5E7EB'}`, background: activeCategory === cat ? '#1F77B4' : '#fff', color: activeCategory === cat ? '#fff' : '#374151', fontWeight: 700, fontSize: 13, cursor: 'pointer', transition: 'all 0.2s' }}>
                {cat}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {filtered.length === 0 ? (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                style={{ textAlign: 'center', padding: '48px 16px', color: '#9CA3AF' }}>
                <p style={{ fontSize: 16, fontWeight: 600 }}>No questions found{search ? ` for "${search}"` : ''}</p>
                <button onClick={() => { setSearch(''); setActiveCategory('All'); }} style={{ marginTop: 12, padding: '8px 20px', borderRadius: 999, background: '#1F77B4', color: '#fff', fontWeight: 700, border: 'none', cursor: 'pointer' }}>Clear filters</button>
              </motion.div>
            ) : (
              <motion.div key={activeCategory + search} initial="hidden" animate="visible" variants={stagger}
                style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {filtered.map((faq, i) => (
                  <motion.div key={i} variants={fadeUp}
                    style={{ borderRadius: 18, border: '1px solid #E5E7EB', background: '#fff', overflow: 'hidden', boxShadow: '0 1px 8px rgba(0,0,0,0.04)' }}>
                    <button
                      style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, padding: '18px 22px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
                      onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                        <span style={{ fontSize: 9, fontWeight: 800, color: '#1F77B4', background: 'rgba(31,119,180,0.08)', padding: '3px 8px', borderRadius: 6, marginTop: 3, textTransform: 'uppercase', letterSpacing: 0.5, whiteSpace: 'nowrap', flexShrink: 0 }}>{faq.cat}</span>
                        <span style={{ fontWeight: 700, color: '#121319', fontSize: 14, lineHeight: 1.5 }}>{faq.q}</span>
                      </div>
                      <div style={{ flexShrink: 0, marginTop: 2 }}>
                        {openFaq === i ? <ChevronUp size={18} color="#1F77B4"/> : <ChevronDown size={18} color="#9CA3AF"/>}
                      </div>
                    </button>
                    <AnimatePresence initial={false}>
                      {openFaq === i && (
                        <motion.div key="content" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.28 }}>
                          <p style={{ padding: '0 22px 18px', margin: 0, fontSize: 13.5, color: '#6B7280', lineHeight: 1.75, borderTop: '1px solid #F3F4F6', paddingTop: 14 }}>{faq.a}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* STILL HAVE QUESTIONS */}
      <section style={{ background: '#fff', padding: '70px 16px' }}>
        <div style={{ maxWidth: 600, margin: '0 auto', textAlign: 'center' }}>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
            <motion.div variants={fadeUp} style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(31,119,180,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: 28 }}>💬</motion.div>
            <motion.h2 variants={fadeUp} style={{ fontSize: 'clamp(24px,4vw,36px)', fontWeight: 900, color: '#121319', marginBottom: 12 }}>Still have questions?</motion.h2>
            <motion.p variants={fadeUp} style={{ color: '#6B7280', fontSize: 15, marginBottom: 32, lineHeight: 1.7 }}>
              Our support team is available 24/7. We typically respond within 10 minutes.
            </motion.p>
            <motion.div variants={fadeUp} style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/contact">
                <a style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '13px 30px', borderRadius: 999, background: '#0B1929', color: '#fff', fontWeight: 800, fontSize: 14, textDecoration: 'none' }}>
                  Contact Support <ArrowRight size={15}/>
                </a>
              </Link>
              <Link href="/auth/register">
                <a style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '13px 28px', borderRadius: 999, background: '#fff', border: '1.5px solid #E5E7EB', color: '#374151', fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>
                  Open Free Account
                </a>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

    </PublicLayout>
  );
}
