import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'wouter';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { Mail, MapPin, Phone, Send, Clock, ChevronDown, ArrowRight } from 'lucide-react';

const fadeUp = { hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0, transition: { duration: 0.55 } } };
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.09 } } };

export function Contact() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: 'Account Opening', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 1500);
  };

  const CHANNELS = [
    { icon: <Mail size={22}/>, color: '#16A34A', bg: 'rgba(22,163,74,0.08)', title: 'Email Support', detail: 'support@ecmarketpro.in', sub: 'Response within 1 hour', action: 'Send Email' },
  ];

  return (
    <PublicLayout>

      {/* HERO */}
      <section style={{ background: 'linear-gradient(135deg,#0B1929 0%,#0d2035 100%)', padding: '80px 16px 60px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -80, left: '20%', width: 400, height: 400, borderRadius: '50%', background: 'rgba(31,119,180,0.08)', filter: 'blur(80px)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -60, right: '10%', width: 300, height: 300, borderRadius: '50%', background: 'rgba(22,163,74,0.06)', filter: 'blur(80px)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 700, margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(31,119,180,0.15)', border: '1px solid rgba(31,119,180,0.25)', borderRadius: 999, padding: '6px 16px', fontSize: 11, fontWeight: 700, color: '#1F77B4', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 20 }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#16A34A', boxShadow: '0 0 0 3px rgba(22,163,74,0.25)' }}/>
              24/7 Live Support
            </span>
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            style={{ fontSize: 'clamp(32px,5vw,56px)', fontWeight: 900, color: '#fff', marginBottom: 16, lineHeight: 1.1 }}>
            We're Here to<br/>
            <span style={{ background: 'linear-gradient(90deg,#1F77B4,#16A34A)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Help You Trade Better</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            style={{ color: 'rgba(255,255,255,0.55)', fontSize: 16, lineHeight: 1.7 }}>
            Our multilingual support team is available around the clock. Get answers in Hindi, English, or Arabic.
          </motion.p>
        </div>
      </section>

      {/* SUPPORT CHANNELS */}
      <section style={{ background: '#F5F5F5', padding: '70px 16px' }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} style={{ textAlign: 'center', marginBottom: 48 }}>
            <motion.h2 variants={fadeUp} style={{ fontSize: 'clamp(26px,4vw,40px)', fontWeight: 900, color: '#121319', marginBottom: 8 }}>Choose How to Reach Us</motion.h2>
            <motion.p variants={fadeUp} style={{ color: '#6B7280', maxWidth: 440, margin: '0 auto' }}>Multiple channels, one goal — resolving your query as fast as possible.</motion.p>
          </motion.div>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(210px,1fr))', gap: 16 }}>
            {CHANNELS.map((ch, i) => (
              <motion.div key={i} variants={fadeUp} whileHover={{ y: -5, boxShadow: '0 16px 40px rgba(0,0,0,0.09)' }}
                style={{ background: '#fff', borderRadius: 22, padding: 24, border: '1px solid #E5E7EB', boxShadow: '0 2px 10px rgba(0,0,0,0.04)', transition: 'all 0.25s' }}>
                <div style={{ width: 48, height: 48, borderRadius: 14, background: ch.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: ch.color, marginBottom: 14 }}>{ch.icon}</div>
                <h3 style={{ fontSize: 16, fontWeight: 800, color: '#121319', marginBottom: 4 }}>{ch.title}</h3>
                <p style={{ fontSize: 13.5, fontWeight: 700, color: ch.color, marginBottom: 4 }}>{ch.detail}</p>
                <p style={{ fontSize: 11.5, color: '#9CA3AF', marginBottom: 16 }}>{ch.sub}</p>
                <button style={{ width: '100%', padding: '9px 16px', borderRadius: 999, background: ch.bg, border: `1px solid ${ch.color}20`, color: ch.color, fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
                  {ch.action}
                </button>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CONTACT FORM + INFO */}
      <section style={{ background: '#fff', padding: '70px 16px' }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 48, alignItems: 'start' }}>

            {/* LEFT — Info */}
            <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
              <h2 style={{ fontSize: 'clamp(24px,3.5vw,36px)', fontWeight: 900, color: '#121319', marginBottom: 16 }}>Send Us a Message</h2>
              <p style={{ fontSize: 14, color: '#6B7280', lineHeight: 1.75, marginBottom: 32 }}>
                Fill in the form and our team will get back to you within 10 minutes. Available 24/7 in English, Hindi, and Arabic.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                {[
                  { icon: <Clock size={18}/>, color: '#1F77B4', title: 'Response Time', val: '< 10 minutes (24/7)' },
                  { icon: <Mail size={18}/>, color: '#16A34A', title: 'Email', val: 'support@ecmarketpro.in' },
                  { icon: <Phone size={18}/>, color: '#7C3AED', title: 'WhatsApp / Phone', val: '+91 98765 43210' },
                  { icon: <MapPin size={18}/>, color: '#F7931A', title: 'Headquarters', val: 'Dubai, UAE' },
                ].map((c, i) => (
                  <div key={i} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                    <div style={{ width: 40, height: 40, borderRadius: 12, background: `rgba(${c.color==='#1F77B4'?'31,119,180':c.color==='#16A34A'?'22,163,74':c.color==='#7C3AED'?'124,58,237':'247,147,26'},0.08)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: c.color, flexShrink: 0 }}>{c.icon}</div>
                    <div>
                      <p style={{ fontSize: 11, fontWeight: 700, color: '#9CA3AF', margin: '0 0 2px', textTransform: 'uppercase', letterSpacing: 0.5 }}>{c.title}</p>
                      <p style={{ fontSize: 14, fontWeight: 700, color: '#121319', margin: 0 }}>{c.val}</p>
                    </div>
                  </div>
                ))}
              </div>
              {/* Office hours */}
              <div style={{ marginTop: 32, background: '#F9FAFB', borderRadius: 16, padding: '18px 20px', border: '1px solid #E5E7EB' }}>
                <p style={{ fontSize: 12, fontWeight: 800, color: '#121319', margin: '0 0 10px', textTransform: 'uppercase', letterSpacing: 0.8 }}>Office Hours</p>
                {[{ day: 'Monday – Friday', time: '24 Hours' }, { day: 'Saturday', time: '9:00 AM – 9:00 PM IST' }, { day: 'Sunday', time: 'Live chat only' }].map(h => (
                  <div key={h.day} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#374151', marginBottom: 6 }}>
                    <span style={{ fontWeight: 600 }}>{h.day}</span>
                    <span style={{ color: '#1F77B4', fontWeight: 700 }}>{h.time}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* RIGHT — Form */}
            <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
              {submitted ? (
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                  style={{ textAlign: 'center', padding: '60px 32px', background: '#F0FDF4', borderRadius: 24, border: '1px solid rgba(22,163,74,0.2)' }}>
                  <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
                  <h3 style={{ fontSize: 22, fontWeight: 900, color: '#121319', marginBottom: 10 }}>Message Sent!</h3>
                  <p style={{ fontSize: 14, color: '#6B7280', lineHeight: 1.7, marginBottom: 24 }}>Thank you for reaching out. Our team will respond within 10 minutes.</p>
                  <button onClick={() => setSubmitted(false)} style={{ padding: '11px 28px', borderRadius: 999, background: '#16A34A', color: '#fff', fontWeight: 800, border: 'none', cursor: 'pointer', fontSize: 14 }}>
                    Send Another Message
                  </button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} style={{ background: '#fff', borderRadius: 24, border: '1px solid #E5E7EB', padding: '32px', boxShadow: '0 4px 28px rgba(0,0,0,0.06)' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 6 }}>Full Name *</label>
                      <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Your full name"
                        style={{ width: '100%', padding: '11px 14px', borderRadius: 12, border: '1px solid #E5E7EB', fontSize: 14, color: '#121319', outline: 'none', background: '#F9FAFB', boxSizing: 'border-box' }}/>
                    </div>
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 6 }}>Email Address *</label>
                      <input required type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="you@example.com"
                        style={{ width: '100%', padding: '11px 14px', borderRadius: 12, border: '1px solid #E5E7EB', fontSize: 14, color: '#121319', outline: 'none', background: '#F9FAFB', boxSizing: 'border-box' }}/>
                    </div>
                  </div>
                  <div style={{ marginBottom: 14 }}>
                    <label style={{ fontSize: 12, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 6 }}>Phone / WhatsApp</label>
                    <input type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+91 XXXXX XXXXX"
                      style={{ width: '100%', padding: '11px 14px', borderRadius: 12, border: '1px solid #E5E7EB', fontSize: 14, color: '#121319', outline: 'none', background: '#F9FAFB', boxSizing: 'border-box' }}/>
                  </div>
                  <div style={{ marginBottom: 14 }}>
                    <label style={{ fontSize: 12, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 6 }}>Subject *</label>
                    <div style={{ position: 'relative' }}>
                      <select required value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                        style={{ width: '100%', padding: '11px 36px 11px 14px', borderRadius: 12, border: '1px solid #E5E7EB', fontSize: 14, color: '#121319', outline: 'none', background: '#F9FAFB', boxSizing: 'border-box', appearance: 'none' }}>
                        {['Account Opening', 'Deposit / Withdrawal', 'Technical Support', 'Trading Conditions', 'KYC Verification', 'Copy Trading', 'Partnership / IB', 'Other'].map(s => <option key={s}>{s}</option>)}
                      </select>
                      <ChevronDown size={14} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF', pointerEvents: 'none' }}/>
                    </div>
                  </div>
                  <div style={{ marginBottom: 24 }}>
                    <label style={{ fontSize: 12, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 6 }}>Message *</label>
                    <textarea required rows={5} value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} placeholder="Describe your query in detail..."
                      style={{ width: '100%', padding: '11px 14px', borderRadius: 12, border: '1px solid #E5E7EB', fontSize: 14, color: '#121319', outline: 'none', background: '#F9FAFB', resize: 'vertical', boxSizing: 'border-box', fontFamily: 'inherit' }}/>
                  </div>
                  <button type="submit" disabled={loading}
                    style={{ width: '100%', padding: '13px 24px', borderRadius: 999, background: loading ? '#9CA3AF' : '#0B1929', color: '#fff', fontWeight: 800, fontSize: 15, border: 'none', cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'background 0.2s' }}>
                    {loading ? (
                      <>
                        <span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite', display: 'inline-block' }}/>
                        Sending...
                      </>
                    ) : (
                      <><Send size={15}/> Send Message</>
                    )}
                  </button>
                  <p style={{ textAlign: 'center', fontSize: 12, color: '#9CA3AF', marginTop: 14, margin: '14px 0 0' }}>
                    We typically respond within 10 minutes · Available 24/7
                  </p>
                </form>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* MAP / OFFICE */}
      <section style={{ background: '#F5F5F5', padding: '70px 16px' }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} style={{ textAlign: 'center', marginBottom: 48 }}>
            <motion.h2 variants={fadeUp} style={{ fontSize: 'clamp(26px,4vw,40px)', fontWeight: 900, color: '#121319', marginBottom: 8 }}>Our Global Presence</motion.h2>
            <motion.p variants={fadeUp} style={{ color: '#6B7280', maxWidth: 440, margin: '0 auto' }}>Headquartered in Dubai, serving traders in 50+ countries.</motion.p>
          </motion.div>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 20 }}>
            {[
              { flag: '🇦🇪', city: 'Dubai, UAE', desc: 'Global Headquarters & Regulation', type: 'Headquarters' },
              { flag: '🇮🇳', city: 'Mumbai, India', desc: 'India Operations & Support Centre', type: 'Operations' },
              { flag: '🇸🇬', city: 'Singapore', desc: 'APAC Regional Office & Technology', type: 'Regional' },
              { flag: '🌍', city: 'Global', desc: 'Online support in 10+ languages', type: '24/7 Online' },
            ].map((office, i) => (
              <motion.div key={i} variants={fadeUp}
                style={{ background: '#fff', borderRadius: 20, padding: 24, border: '1px solid #E5E7EB', boxShadow: '0 2px 10px rgba(0,0,0,0.04)', textAlign: 'center' }}>
                <div style={{ fontSize: 36, marginBottom: 12 }}>{office.flag}</div>
                <span style={{ fontSize: 9, fontWeight: 800, color: '#1F77B4', background: 'rgba(31,119,180,0.08)', padding: '3px 8px', borderRadius: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>{office.type}</span>
                <h3 style={{ fontSize: 16, fontWeight: 800, color: '#121319', margin: '10px 0 6px' }}>{office.city}</h3>
                <p style={{ fontSize: 12.5, color: '#6B7280', margin: 0 }}>{office.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* BOTTOM CTA */}
      <section style={{ background: '#0B1929', padding: '60px 16px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle at 30% 50%, rgba(31,119,180,0.08) 0%, transparent 60%)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 600, margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            style={{ fontSize: 'clamp(24px,4vw,36px)', fontWeight: 900, color: '#fff', marginBottom: 16 }}>
            Ready to Start Trading?
          </motion.h2>
          <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
            style={{ color: 'rgba(255,255,255,0.5)', fontSize: 15, marginBottom: 28 }}>
            Open your free account in 2 minutes. No deposit required for demo.
          </motion.p>
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.2 }}>
            <Link href="/auth/register">
              <a style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '14px 36px', borderRadius: 999, background: '#1F77B4', color: '#fff', fontWeight: 800, fontSize: 15, textDecoration: 'none', boxShadow: '0 8px 28px rgba(31,119,180,0.4)' }}>
                Open Free Account <ArrowRight size={16}/>
              </a>
            </Link>
          </motion.div>
        </div>
      </section>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </PublicLayout>
  );
}
