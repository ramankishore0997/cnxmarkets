import { motion } from 'framer-motion';
import { Link } from 'wouter';
import { PublicLayout } from '@/components/layout/PublicLayout';
import {
  Shield, Target, Globe, TrendingUp, Users, Award,
  CheckCircle2, ArrowRight, Building2, Lock, Zap, Clock
} from 'lucide-react';

const fadeUp = { hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0, transition: { duration: 0.55 } } };
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.09 } } };

const STATS = [
  { val: '10 Lakh+', label: 'Active Traders', color: '#1F77B4' },
  { val: '7+', label: 'Years of Excellence', color: '#16A34A' },
  { val: '200+', label: 'Trading Instruments', color: '#7C3AED' },
  { val: '50+', label: 'Countries Served', color: '#F7931A' },
];

const VALUES = [
  { icon: Target, color: '#1F77B4', bg: 'rgba(31,119,180,0.08)', title: 'Our Mission', desc: 'To give every trader access to institutional-grade conditions — tight spreads, high leverage, and fast execution — regardless of their account size.' },
  { icon: Shield, color: '#16A34A', bg: 'rgba(22,163,74,0.08)', title: 'Client Fund Safety', desc: 'All client funds are held in fully segregated tier-1 bank accounts, completely separate from company operating capital. Your money is always yours.' },
  { icon: Globe, color: '#7C3AED', bg: 'rgba(124,58,237,0.08)', title: 'Global Reach, Local Methods', desc: 'Headquartered in the UAE, we serve clients globally with local methods — UPI, Bank Transfer, Crypto — built for Indian and global traders.' },
  { icon: TrendingUp, color: '#F7931A', bg: 'rgba(247,147,26,0.08)', title: 'Transparency First', desc: 'No hidden fees, no surprise charges. Every spread, every commission, every condition is visible and published — because you deserve full clarity.' },
];

const TEAM = [
  { name: 'Aravind Krishnan', role: 'CEO & Co-Founder', desc: '15+ years in global forex markets. Former VP at a leading UAE investment bank.', initials: 'AK', color: '#1F77B4' },
  { name: 'Priya Sharma', role: 'Chief Risk Officer', desc: 'Expert in financial risk management with 12 years at tier-1 institutions.', initials: 'PS', color: '#16A34A' },
  { name: 'Mohammed Al-Farsi', role: 'Head of Operations', desc: 'UAE-based operations expert, ensuring regulatory compliance and smooth service.', initials: 'MF', color: '#7C3AED' },
  { name: 'Rahul Gupta', role: 'Head of Technology', desc: 'Built and scaled trading infrastructure for 10 Lakh+ concurrent users.', initials: 'RG', color: '#F7931A' },
];

const MILESTONES = [
  { year: '2018', title: 'Founded in UAE', desc: 'ECMarket Pro launched in Dubai with a mission to democratise professional trading for Indian and global traders.' },
  { year: '2019', title: '1 Lakh Traders', desc: 'Reached 1 lakh registered traders, proving the demand for transparent, low-cost forex trading.' },
  { year: '2021', title: 'MT4/MT5 Integration', desc: 'Integrated MetaTrader 4 and 5 platforms, giving traders the industry-standard charting and EA support.' },
  { year: '2022', title: 'Crypto Markets Added', desc: 'Expanded to 50+ crypto pairs including BTC, ETH, SOL, and XRP with up to 1:100 leverage.' },
  { year: '2023', title: '5 Lakh+ Traders', desc: 'Crossed 5 lakh active traders. Launched copy trading and automated signals for all account types.' },
  { year: '2024', title: '10 Lakh+ & Growing', desc: 'Now serving over 10 lakh traders globally with 200+ instruments, mobile apps, and 24/7 support.' },
];

export function About() {
  return (
    <PublicLayout>

      {/* HERO */}
      <section style={{ background: 'linear-gradient(135deg, #0B1929 0%, #0d2035 100%)', padding: '90px 16px 70px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -100, left: '20%', width: 400, height: 400, borderRadius: '50%', background: 'rgba(31,119,180,0.08)', filter: 'blur(80px)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -60, right: '10%', width: 300, height: 300, borderRadius: '50%', background: 'rgba(22,163,74,0.06)', filter: 'blur(80px)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(31,119,180,0.15)', border: '1px solid rgba(31,119,180,0.25)', borderRadius: 999, padding: '6px 16px', fontSize: 11, fontWeight: 700, color: '#1F77B4', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 20 }}>
              <Building2 size={12}/> UAE Regulated · Founded 2018
            </span>
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
            style={{ fontSize: 'clamp(36px,5.5vw,60px)', fontWeight: 900, color: '#fff', lineHeight: 1.1, marginBottom: 20 }}>
            The Broker That Puts<br/>
            <span style={{ background: 'linear-gradient(90deg,#1F77B4,#16A34A)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Traders First
            </span>
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
            style={{ fontSize: 17, color: 'rgba(255,255,255,0.6)', maxWidth: 540, margin: '0 auto 40px', lineHeight: 1.75 }}>
            ECMarket Pro is a UAE-regulated forex and crypto broker serving over 10 lakh traders globally. We believe every trader deserves institutional-grade tools — regardless of account size.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}
            style={{ display: 'flex', gap: 24, justifyContent: 'center', flexWrap: 'wrap' }}>
            {[{ icon: '🏛️', text: 'UAE Regulated' }, { icon: '🔒', text: 'Segregated Funds' }, { icon: '⚡', text: 'Since 2018' }, { icon: '🌍', text: '50+ Countries' }].map(b => (
              <span key={b.text} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: 'rgba(255,255,255,0.65)', fontWeight: 600 }}>
                <span>{b.icon}</span>{b.text}
              </span>
            ))}
          </motion.div>
        </div>
      </section>

      {/* STATS */}
      <section style={{ background: '#fff', padding: '60px 16px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 20 }}>
            {STATS.map((s, i) => (
              <motion.div key={i} variants={fadeUp}
                style={{ textAlign: 'center', padding: '30px 20px', background: '#F9FAFB', borderRadius: 20, border: '1px solid #E5E7EB' }}>
                <p style={{ fontSize: 'clamp(32px,4vw,48px)', fontWeight: 900, color: s.color, margin: '0 0 6px' }}>{s.val}</p>
                <p style={{ fontSize: 13, fontWeight: 600, color: '#6B7280', margin: 0, textTransform: 'uppercase', letterSpacing: 0.8 }}>{s.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* OUR VALUES */}
      <section style={{ background: '#F5F5F5', padding: '80px 16px' }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} style={{ textAlign: 'center', marginBottom: 52 }}>
            <motion.h2 variants={fadeUp} style={{ fontSize: 'clamp(28px,4vw,44px)', fontWeight: 900, color: '#121319', marginBottom: 8 }}>Our Core Values</motion.h2>
            <motion.p variants={fadeUp} style={{ color: '#6B7280', maxWidth: 440, margin: '0 auto' }}>The principles that guide every decision we make.</motion.p>
          </motion.div>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: 20 }}>
            {VALUES.map((v, i) => (
              <motion.div key={i} variants={fadeUp} whileHover={{ y: -4, boxShadow: '0 16px 40px rgba(0,0,0,0.09)' }}
                style={{ background: '#fff', borderRadius: 22, padding: 28, border: '1px solid #E5E7EB', boxShadow: '0 2px 12px rgba(0,0,0,0.04)', transition: 'all 0.25s' }}>
                <div style={{ width: 52, height: 52, borderRadius: 16, background: v.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: v.color, marginBottom: 16 }}>
                  <v.icon size={24}/>
                </div>
                <h3 style={{ fontSize: 17, fontWeight: 800, color: '#121319', marginBottom: 10 }}>{v.title}</h3>
                <p style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.75, margin: 0 }}>{v.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* MILESTONES TIMELINE */}
      <section style={{ background: '#fff', padding: '80px 16px' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} style={{ textAlign: 'center', marginBottom: 52 }}>
            <motion.h2 variants={fadeUp} style={{ fontSize: 'clamp(28px,4vw,44px)', fontWeight: 900, color: '#121319', marginBottom: 8 }}>Our Journey</motion.h2>
            <motion.p variants={fadeUp} style={{ color: '#6B7280', maxWidth: 440, margin: '0 auto' }}>From a startup to 10 lakh+ traders — our key milestones.</motion.p>
          </motion.div>
          <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', left: 28, top: 0, bottom: 0, width: 2, background: 'linear-gradient(180deg,#1F77B4,#16A34A)', borderRadius: 2 }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 36 }}>
              {MILESTONES.map((m, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08, duration: 0.5 }}
                  style={{ display: 'flex', gap: 24, alignItems: 'flex-start', paddingLeft: 16 }}>
                  <div style={{ width: 56, height: 56, borderRadius: '50%', background: i % 2 === 0 ? '#1F77B4' : '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 12, fontWeight: 900, color: '#fff', zIndex: 1, boxShadow: `0 0 0 4px #fff, 0 0 0 6px ${i % 2 === 0 ? '#1F77B4' : '#16A34A'}` }}>
                    {m.year.slice(2)}
                  </div>
                  <div style={{ background: '#F9FAFB', borderRadius: 18, padding: '16px 20px', border: '1px solid #E5E7EB', flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                      <span style={{ fontSize: 11, fontWeight: 800, color: i % 2 === 0 ? '#1F77B4' : '#16A34A', background: i % 2 === 0 ? 'rgba(31,119,180,0.08)' : 'rgba(22,163,74,0.08)', padding: '2px 8px', borderRadius: 6 }}>{m.year}</span>
                      <h3 style={{ fontSize: 15, fontWeight: 800, color: '#121319', margin: 0 }}>{m.title}</h3>
                    </div>
                    <p style={{ fontSize: 13, color: '#6B7280', margin: 0, lineHeight: 1.7 }}>{m.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* LEADERSHIP TEAM */}
      <section style={{ background: '#F5F5F5', padding: '80px 16px' }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} style={{ textAlign: 'center', marginBottom: 52 }}>
            <motion.h2 variants={fadeUp} style={{ fontSize: 'clamp(28px,4vw,44px)', fontWeight: 900, color: '#121319', marginBottom: 8 }}>Leadership Team</motion.h2>
            <motion.p variants={fadeUp} style={{ color: '#6B7280', maxWidth: 440, margin: '0 auto' }}>Experienced professionals from top financial institutions.</motion.p>
          </motion.div>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 20 }}>
            {TEAM.map((member, i) => (
              <motion.div key={i} variants={fadeUp} whileHover={{ y: -4, boxShadow: '0 12px 32px rgba(0,0,0,0.09)' }}
                style={{ background: '#fff', borderRadius: 22, padding: 28, border: '1px solid #E5E7EB', textAlign: 'center', boxShadow: '0 2px 10px rgba(0,0,0,0.04)', transition: 'all 0.25s' }}>
                <div style={{ width: 64, height: 64, borderRadius: '50%', background: member.color, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: 20, fontWeight: 900, color: '#fff' }}>
                  {member.initials}
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 800, color: '#121319', marginBottom: 4 }}>{member.name}</h3>
                <p style={{ fontSize: 12, fontWeight: 700, color: member.color, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 }}>{member.role}</p>
                <p style={{ fontSize: 12.5, color: '#6B7280', lineHeight: 1.65, margin: 0 }}>{member.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* REGULATORY & COMPLIANCE */}
      <section style={{ background: '#0B1929', padding: '80px 16px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle at 30% 50%, rgba(31,119,180,0.08) 0%, transparent 60%)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 900, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} style={{ textAlign: 'center', marginBottom: 52 }}>
            <motion.h2 variants={fadeUp} style={{ fontSize: 'clamp(28px,4vw,44px)', fontWeight: 900, color: '#fff', marginBottom: 8 }}>Regulated & Secure</motion.h2>
            <motion.p variants={fadeUp} style={{ color: 'rgba(255,255,255,0.5)', maxWidth: 440, margin: '0 auto' }}>Your funds are protected by regulation, technology, and policy.</motion.p>
          </motion.div>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 16 }}>
            {[
              { icon: <Shield size={24}/>, color: '#1F77B4', title: 'UAE Regulatory Authority', desc: 'Fully licensed and regulated by UAE financial authorities.' },
              { icon: <Lock size={24}/>, color: '#16A34A', title: 'Segregated Client Funds', desc: 'Client funds are always held separate from company accounts at tier-1 banks.' },
              { icon: <Zap size={24}/>, color: '#7C3AED', title: '256-Bit SSL Encryption', desc: 'All data and transactions are encrypted with bank-grade SSL technology.' },
              { icon: <Award size={24}/>, color: '#F7931A', title: 'Negative Balance Protection', desc: 'Your account can never go below zero — your risk is always capped.' },
            ].map((r, i) => (
              <motion.div key={i} variants={fadeUp}
                style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 20, padding: 24, border: '1px solid rgba(255,255,255,0.07)', textAlign: 'center' }}>
                <div style={{ width: 48, height: 48, borderRadius: 14, background: `rgba(${r.color==='#1F77B4'?'31,119,180':r.color==='#16A34A'?'22,163,74':r.color==='#7C3AED'?'124,58,237':'247,147,26'},0.12)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: r.color, margin: '0 auto 14px' }}>
                  {r.icon}
                </div>
                <h3 style={{ fontSize: 14, fontWeight: 800, color: '#fff', marginBottom: 8 }}>{r.title}</h3>
                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', lineHeight: 1.65, margin: 0 }}>{r.desc}</p>
              </motion.div>
            ))}
          </motion.div>
          <div style={{ textAlign: 'center', marginTop: 52 }}>
            <Link href="/auth/register">
              <a style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '14px 36px', borderRadius: 999, background: '#1F77B4', color: '#fff', fontWeight: 800, fontSize: 15, textDecoration: 'none', boxShadow: '0 8px 28px rgba(31,119,180,0.4)' }}>
                Open Your Account <ArrowRight size={16}/>
              </a>
            </Link>
          </div>
        </div>
      </section>

    </PublicLayout>
  );
}
