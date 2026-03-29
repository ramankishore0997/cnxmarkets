import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import Lenis from "@studio-freight/lenis";

/* ─── Live Ticker Data ─────────────────────────────────── */
const tickerData = [
  { symbol: "EUR/USD", price: "1.0842", change: "+0.12%", up: true },
  { symbol: "GBP/USD", price: "1.2631", change: "+0.08%", up: true },
  { symbol: "USD/JPY", price: "149.82", change: "-0.15%", up: false },
  { symbol: "XAU/USD", price: "2,342.10", change: "+0.54%", up: true },
  { symbol: "BTC/USD", price: "71,204", change: "+2.18%", up: true },
  { symbol: "ETH/USD", price: "3,648", change: "+1.32%", up: true },
  { symbol: "USD/INR", price: "83.41", change: "-0.06%", up: false },
  { symbol: "WTI Oil", price: "82.14", change: "+0.43%", up: true },
  { symbol: "NAS100", price: "18,240", change: "+0.92%", up: true },
  { symbol: "SPX500", price: "5,208", change: "+0.61%", up: true },
];

/* ─── Stats Data ─────────────────────────────────────────── */
const stats = [
  { num: 1200000, suffix: "+", label: "Active Traders" },
  { num: 200, suffix: "+", label: "Instruments" },
  { num: 2000, suffix: ":1", label: "Max Leverage" },
  { num: 0.0, suffix: " pips", label: "Spreads From", decimals: 1 },
];

/* ─── Features Data ─────────────────────────────────────── */
const features = [
  {
    icon: "⚡",
    title: "Lightning Execution",
    desc: "Ultra-fast order execution in under 1ms. No requotes. No delays. Pure speed at every trade.",
  },
  {
    icon: "🛡️",
    title: "UAE Regulated",
    desc: "Fully licensed and regulated broker. Your funds are held in segregated accounts with top-tier banks.",
  },
  {
    icon: "📊",
    title: "200+ Instruments",
    desc: "Trade Forex, Crypto, CFDs, Commodities, and Indices across 200+ instruments on one platform.",
  },
  {
    icon: "💎",
    title: "Raw Spreads",
    desc: "Access true interbank pricing with spreads starting from 0.0 pips on major pairs.",
  },
  {
    icon: "🔒",
    title: "Secure & Safe",
    desc: "Two-factor authentication, encrypted transactions, and negative balance protection always active.",
  },
  {
    icon: "📱",
    title: "Trade Anywhere",
    desc: "Advanced platforms on web, desktop, and mobile. Your market follows you everywhere.",
  },
];

/* ─── Instruments Tags ───────────────────────────────────── */
const row1 = ["EUR/USD","GBP/USD","USD/JPY","XAU/USD","Bitcoin","Ethereum","Crude Oil","NAS100","SPX500","USD/INR","AUD/USD","EUR/GBP","Silver","Natural Gas","Apple CFD","Tesla CFD"];
const row2 = ["GBP/JPY","USD/CAD","CHF/JPY","XAG/USD","Ripple","Litecoin","Brent Oil","DAX40","FTSE100","EUR/JPY","NZD/USD","USD/CHF","Platinum","Copper","Amazon CFD","Meta CFD"];

/* ─── Platforms ──────────────────────────────────────────── */
const platforms = [
  { name: "MetaTrader 5", tag: "Most Popular", desc: "Industry-leading platform for forex & CFD trading with full expert advisor support and 80+ analytical tools.", icon: "🖥️" },
  { name: "ECMarket WebTrader", tag: "No Download", desc: "Trade directly from your browser. Fast, powerful, and accessible from any device without installation.", icon: "🌐" },
  { name: "Mobile App", tag: "iOS & Android", desc: "Full trading experience on your smartphone. Real-time quotes, one-tap trading, push notifications.", icon: "📱" },
];

/* ─── Testimonials ───────────────────────────────────────── */
const testimonials = [
  { name: "Rahul Sharma", role: "Professional Trader, Mumbai", rating: 5, text: "ECMarket Pro's execution speed is unmatched. I've been trading for 8 years and never experienced such low latency. The spreads on majors are genuinely 0.0 pips." },
  { name: "Mohammed Al-Rashid", role: "Forex Analyst, Dubai", rating: 5, text: "The regulatory framework gives me complete confidence. Funds are always safe, withdrawals are instant, and the customer support is exceptional 24/7." },
  { name: "Priya Nair", role: "Part-time Trader, Bangalore", rating: 5, text: "Started with $100. The 1:2000 leverage and zero commission model allowed me to maximize my capital. The mobile app is incredibly smooth." },
];

/* ─────────────────────────────────────────────────────────── */
export default function Home() {
  const heroRef = useRef<HTMLElement>(null);
  const navRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLElement>(null);
  const featuresRef = useRef<HTMLElement>(null);
  const parallaxRef = useRef<HTMLDivElement>(null);
  const parallaxImgRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLElement>(null);

  useEffect(() => {
    /* ── Lenis smooth scroll ──── */
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    lenis.on("scroll", ScrollTrigger.update);

    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);

    /* ── Scroll Progress Bar ──── */
    if (progressRef.current) {
      gsap.to(progressRef.current, {
        width: "100%",
        ease: "none",
        scrollTrigger: { scrub: 0.3, start: "top top", end: "bottom bottom" },
      });
    }

    /* ── Navbar scroll effect ─── */
    const handleScroll = () => {
      if (!navRef.current) return;
      if (window.scrollY > 80) navRef.current.classList.add("scrolled");
      else navRef.current.classList.remove("scrolled");
    };
    window.addEventListener("scroll", handleScroll);

    /* ── Hero word reveal ───────── */
    if (heroRef.current) {
      const words = heroRef.current.querySelectorAll(".word");
      gsap.fromTo(
        words,
        { y: "110%", opacity: 0 },
        {
          y: "0%",
          opacity: 1,
          duration: 1,
          ease: "power4.out",
          stagger: 0.08,
          delay: 0.3,
        }
      );
      const fadels = heroRef.current.querySelectorAll(".hero-fade");
      gsap.fromTo(
        fadels,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 1, ease: "power3.out", stagger: 0.15, delay: 0.9 }
      );
    }

    /* ── Stats counters ─────────── */
    if (statsRef.current) {
      const statNums = statsRef.current.querySelectorAll(".stat-counter");
      statNums.forEach((el) => {
        const target = parseFloat(el.getAttribute("data-target") || "0");
        const decimals = parseInt(el.getAttribute("data-decimals") || "0");
        const suffix = el.getAttribute("data-suffix") || "";
        const obj = { val: 0 };
        ScrollTrigger.create({
          trigger: el,
          start: "top 80%",
          once: true,
          onEnter: () => {
            gsap.to(obj, {
              val: target,
              duration: 2.5,
              ease: "power2.out",
              onUpdate: () => {
                const formatted =
                  target >= 1000000
                    ? (obj.val / 1000000).toFixed(1) + "M"
                    : target >= 1000
                    ? Math.round(obj.val).toLocaleString()
                    : obj.val.toFixed(decimals);
                el.textContent = formatted + suffix;
              },
            });
          },
        });
      });
    }

    /* ── Feature cards stagger ─── */
    if (featuresRef.current) {
      const cards = featuresRef.current.querySelectorAll(".feature-card-item");
      gsap.fromTo(
        cards,
        { opacity: 0, y: 60 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power3.out",
          stagger: 0.12,
          scrollTrigger: { trigger: featuresRef.current, start: "top 75%" },
        }
      );
    }

    /* ── Parallax image ─────────── */
    if (parallaxRef.current && parallaxImgRef.current) {
      gsap.to(parallaxImgRef.current, {
        y: "-20%",
        ease: "none",
        scrollTrigger: {
          trigger: parallaxRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      });
    }

    /* ── Generic fade-up sections ── */
    document.querySelectorAll(".gsap-fade-up").forEach((el) => {
      gsap.fromTo(
        el,
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 82%" },
        }
      );
    });

    /* ── CTA section ──────────────── */
    if (ctaRef.current) {
      gsap.fromTo(
        ctaRef.current,
        { opacity: 0, scale: 0.95 },
        {
          opacity: 1,
          scale: 1,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: { trigger: ctaRef.current, start: "top 80%" },
        }
      );
    }

    return () => {
      lenis.destroy();
      ScrollTrigger.getAll().forEach((t) => t.kill());
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* ── Scroll Progress ─────────────────────────────────── */}
      <div ref={progressRef} id="scroll-progress" />

      {/* ── Navbar ──────────────────────────────────────────── */}
      <nav ref={navRef} className="navbar">
        <div className="container-max flex items-center justify-between">
          <a href="#" className="flex items-center gap-2 no-underline">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: "#0B3C5D" }}>
              <span className="text-white font-black text-sm">EC</span>
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-black text-base tracking-tight" style={{ color: "#111827" }}>
                ECMarket <span style={{ color: "#1F77B4" }}>Pro</span>
              </span>
              <span className="text-xs font-medium" style={{ color: "#6B7280", letterSpacing: "0.05em" }}>Forex · Crypto · CFDs</span>
            </div>
          </a>
          <div className="hidden md:flex items-center gap-8">
            {["Markets", "Platforms", "Trading", "About"].map((item) => (
              <a key={item} href="#" className="text-sm font-medium no-underline transition-colors"
                style={{ color: "#374151" }}
                onMouseEnter={e => (e.currentTarget.style.color = "#1F77B4")}
                onMouseLeave={e => (e.currentTarget.style.color = "#374151")}
              >{item}</a>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <a href="/login" className="btn-outline text-sm px-5 py-2.5" style={{ padding: "0.625rem 1.25rem" }}>Log In</a>
            <a href="/register" className="btn-primary text-sm" style={{ padding: "0.625rem 1.25rem" }}>Start Trading</a>
          </div>
        </div>
      </nav>

      {/* ── Live Ticker ─────────────────────────────────────── */}
      <div className="ticker-wrap" style={{ marginTop: 0, paddingTop: "4.5rem" }}>
        <div className="ticker-inner">
          {[...tickerData, ...tickerData].map((item, i) => (
            <span key={i} className="ticker-item">
              <span className="font-bold text-white">{item.symbol}</span>
              <span className="text-slate-300">{item.price}</span>
              <span className={item.up ? "ticker-up" : "ticker-down"}>{item.change}</span>
              <span className="text-slate-500 mx-3">|</span>
            </span>
          ))}
        </div>
      </div>

      {/* ── Hero Section ────────────────────────────────────── */}
      <section ref={heroRef} className="relative section-pad flex items-center min-h-screen overflow-hidden" style={{ paddingTop: "6rem", paddingBottom: "8rem" }}>
        {/* Orbs */}
        <div className="orb" style={{ width: 600, height: 600, background: "radial-gradient(circle, #DBEAFE, transparent)", top: "-100px", right: "-100px" }} />
        <div className="orb" style={{ width: 400, height: 400, background: "radial-gradient(circle, #EFF6FF, transparent)", bottom: "0", left: "-50px", opacity: 0.5 }} />

        <div className="container-max relative">
          <div style={{ maxWidth: "860px" }}>
            <div className="label-text hero-fade" style={{ marginBottom: "1.5rem" }}>
              🇦🇪 UAE Regulated · Licensed Broker
            </div>
            <h1 className="display-xl" style={{ marginBottom: "1.5rem" }}>
              {["Trade", "the", "Markets", "with"].map((w, i) => (
                <span key={i} className="word-wrapper">
                  <span className="word">{w}&nbsp;</span>
                </span>
              ))}
              <br />
              <span className="word-wrapper">
                <span className="word text-gradient">Confidence.</span>
              </span>
            </h1>
            <p className="body-text hero-fade" style={{ maxWidth: "560px", marginBottom: "2.5rem" }}>
              Access 200+ instruments — Forex, Crypto, CFDs, Commodities — with spreads from 0.0 pips, 1:2000 leverage, and lightning-fast execution. Open an account in minutes.
            </p>
            <div className="flex flex-wrap gap-4 hero-fade">
              <a href="/register" className="btn-primary">
                Open Free Account
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </a>
              <a href="#features" className="btn-outline">
                Explore Features
              </a>
            </div>
            {/* Trust Badges */}
            <div className="flex flex-wrap items-center gap-6 hero-fade" style={{ marginTop: "3rem" }}>
              {[
                { icon: "🏦", text: "Segregated Funds" },
                { icon: "🔒", text: "SSL Encrypted" },
                { icon: "⚡", text: "<1ms Execution" },
                { icon: "🎯", text: "0.0 Pip Spreads" },
              ].map((b) => (
                <div key={b.text} className="flex items-center gap-2">
                  <span>{b.icon}</span>
                  <span className="text-sm font-medium" style={{ color: "#6B7280" }}>{b.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Floating chart card */}
          <div className="hero-fade hidden lg:block absolute right-0 top-1/2" style={{ transform: "translateY(-50%)", width: "320px" }}>
            <div className="card-premium">
              <div className="flex items-center justify-between" style={{ marginBottom: "1rem" }}>
                <div>
                  <div className="text-xs font-semibold" style={{ color: "#6B7280", letterSpacing: "0.08em" }}>EUR/USD</div>
                  <div className="text-2xl font-bold" style={{ color: "#111827" }}>1.0842</div>
                </div>
                <div className="px-3 py-1 rounded-full text-xs font-bold" style={{ background: "#DCFCE7", color: "#16A34A" }}>+0.12%</div>
              </div>
              <svg viewBox="0 0 280 80" className="w-full" style={{ marginBottom: "1rem" }}>
                <defs>
                  <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#1F77B4" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#1F77B4" stopOpacity="0.01" />
                  </linearGradient>
                </defs>
                <path d="M0,60 C20,55 40,45 60,42 C80,39 100,50 120,38 C140,26 160,30 180,22 C200,14 220,18 240,12 C260,6 270,10 280,8" fill="none" stroke="#1F77B4" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M0,60 C20,55 40,45 60,42 C80,39 100,50 120,38 C140,26 160,30 180,22 C200,14 220,18 240,12 C260,6 270,10 280,8 L280,80 L0,80 Z" fill="url(#chartGrad)" />
              </svg>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg text-center" style={{ background: "#F7F9FC" }}>
                  <div className="text-xs" style={{ color: "#6B7280" }}>Spread</div>
                  <div className="font-bold text-sm" style={{ color: "#111827" }}>0.0 pips</div>
                </div>
                <div className="p-3 rounded-lg text-center" style={{ background: "#F7F9FC" }}>
                  <div className="text-xs" style={{ color: "#6B7280" }}>Leverage</div>
                  <div className="font-bold text-sm" style={{ color: "#111827" }}>1:2000</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats Section ───────────────────────────────────── */}
      <section ref={statsRef} style={{ background: "#0B3C5D", padding: "5rem 1.5rem" }}>
        <div className="container-max">
          <div className="grid grid-cols-2 lg:grid-cols-4">
            {stats.map((s, i) => (
              <div key={i} className="stat-card" style={{ borderRight: i < 3 ? "1px solid rgba(255,255,255,0.1)" : "none" }}>
                <div
                  className="stat-counter text-white"
                  style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)", fontWeight: 800, letterSpacing: "-0.03em" }}
                  data-target={s.num}
                  data-suffix={s.suffix}
                  data-decimals={s.decimals || 0}
                >
                  0{s.suffix}
                </div>
                <div style={{ color: "#94A3B8", fontSize: "0.875rem", marginTop: "0.5rem", fontWeight: 500 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Instrument Marquee ──────────────────────────────── */}
      <section style={{ padding: "4rem 0", background: "#F7F9FC", overflow: "hidden" }}>
        <div style={{ marginBottom: "1rem" }}>
          <div className="marquee-wrap">
            <div className="marquee-inner">
              {[...row1, ...row1].map((tag, i) => (
                <span key={i} className="marquee-tag">{tag}</span>
              ))}
            </div>
          </div>
        </div>
        <div>
          <div className="marquee-wrap">
            <div className="marquee-inner reverse">
              {[...row2, ...row2].map((tag, i) => (
                <span key={i} className="marquee-tag">{tag}</span>
              ))}
            </div>
          </div>
        </div>
        <div className="text-center gsap-fade-up" style={{ marginTop: "2rem" }}>
          <p className="text-sm font-medium" style={{ color: "#6B7280" }}>
            200+ Instruments across Forex, Crypto, Commodities, Indices & More
          </p>
        </div>
      </section>

      {/* ── Features Section ────────────────────────────────── */}
      <section ref={featuresRef} id="features" className="section-pad">
        <div className="container-max">
          <div className="text-center gsap-fade-up" style={{ marginBottom: "4rem", maxWidth: "600px", margin: "0 auto 4rem" }}>
            <div className="label-text" style={{ marginBottom: "1rem" }}>Why ECMarket Pro</div>
            <h2 className="display-md" style={{ marginBottom: "1.25rem" }}>Built for Serious Traders</h2>
            <p className="body-text">Every feature is designed to give you an unfair advantage. From execution speed to regulatory safety — we've got you covered.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <div key={i} className="card-premium feature-card-item" style={{ opacity: 0 }}>
                <div className="feature-icon">{f.icon}</div>
                <h3 className="font-bold text-lg" style={{ color: "#111827", marginBottom: "0.75rem" }}>{f.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "#6B7280" }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Parallax Section ────────────────────────────────── */}
      <div ref={parallaxRef} className="parallax-section" style={{ height: "500px" }}>
        <div ref={parallaxImgRef} style={{ position: "absolute", inset: 0, height: "120%", top: "-10%" }}>
          <div style={{
            width: "100%",
            height: "100%",
            background: "linear-gradient(135deg, #0B3C5D 0%, #1F77B4 40%, #0B1929 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}>
            <div className="text-center" style={{ padding: "2rem" }}>
              <div className="display-lg text-white" style={{ marginBottom: "1rem" }}>
                Trade Smart. Trade Fast.
              </div>
              <p style={{ color: "#94A3B8", fontSize: "1.25rem", maxWidth: "500px" }}>
                Join 1.2M+ traders who chose ECMarket Pro for their financial freedom journey.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Platforms Section ───────────────────────────────── */}
      <section className="section-pad" style={{ background: "#F7F9FC" }}>
        <div className="container-max">
          <div className="text-center gsap-fade-up" style={{ marginBottom: "4rem" }}>
            <div className="label-text" style={{ marginBottom: "1rem" }}>Trading Platforms</div>
            <h2 className="display-md" style={{ marginBottom: "1.25rem" }}>Your Preferred Platform</h2>
            <p className="body-text" style={{ maxWidth: "500px", margin: "0 auto" }}>Trade on world-class platforms built for speed, reliability, and advanced analysis.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {platforms.map((p, i) => (
              <div key={i} className="card-premium gsap-fade-up" style={{ position: "relative" }}>
                <div className="flex items-start justify-between" style={{ marginBottom: "1.5rem" }}>
                  <span style={{ fontSize: "2.5rem" }}>{p.icon}</span>
                  <span className="px-3 py-1 rounded-full text-xs font-bold" style={{ background: "#EFF6FF", color: "#1F77B4" }}>{p.tag}</span>
                </div>
                <h3 className="font-bold text-lg" style={{ color: "#111827", marginBottom: "0.75rem" }}>{p.name}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "#6B7280", marginBottom: "1.5rem" }}>{p.desc}</p>
                <a href="#" className="btn-primary" style={{ fontSize: "0.875rem", padding: "0.625rem 1.25rem" }}>
                  Download Now
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ────────────────────────────────────── */}
      <section className="section-pad">
        <div className="container-max">
          <div className="text-center gsap-fade-up" style={{ marginBottom: "4rem" }}>
            <div className="label-text" style={{ marginBottom: "1rem" }}>Client Reviews</div>
            <h2 className="display-md" style={{ marginBottom: "1.25rem" }}>Trusted by Traders Worldwide</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <div key={i} className="card-premium gsap-fade-up">
                <div className="flex gap-0.5" style={{ marginBottom: "1.25rem" }}>
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <span key={j} style={{ color: "#F59E0B" }}>★</span>
                  ))}
                </div>
                <p className="text-sm leading-relaxed" style={{ color: "#374151", marginBottom: "1.5rem", fontStyle: "italic" }}>"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm text-white" style={{ background: "#0B3C5D" }}>
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-semibold text-sm" style={{ color: "#111827" }}>{t.name}</div>
                    <div className="text-xs" style={{ color: "#6B7280" }}>{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ────────────────────────────────────── */}
      <section className="section-pad" style={{ background: "#F7F9FC" }}>
        <div className="container-max">
          <div className="text-center gsap-fade-up" style={{ marginBottom: "4rem" }}>
            <div className="label-text" style={{ marginBottom: "1rem" }}>Get Started</div>
            <h2 className="display-md">Open Account in 3 Steps</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: "01", title: "Register", desc: "Fill your basic details and create your account in under 2 minutes." },
              { step: "02", title: "Verify KYC", desc: "Upload your ID document. Verification usually completes in 15 minutes." },
              { step: "03", title: "Fund & Trade", desc: "Deposit funds via bank transfer, UPI, or crypto and start trading instantly." },
            ].map((s, i) => (
              <div key={i} className="text-center gsap-fade-up">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center font-black text-2xl mx-auto" style={{ background: "#EFF6FF", color: "#1F77B4", marginBottom: "1.5rem" }}>
                  {s.step}
                </div>
                <h3 className="font-bold text-lg" style={{ color: "#111827", marginBottom: "0.75rem" }}>{s.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "#6B7280" }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Section ─────────────────────────────────────── */}
      <section ref={ctaRef} className="section-pad" style={{ opacity: 0 }}>
        <div className="container-max">
          <div className="cta-bg" style={{ padding: "5rem 3rem", textAlign: "center" }}>
            {/* Grid bg */}
            <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.06) 1px, transparent 0)", backgroundSize: "32px 32px", borderRadius: "2rem", pointerEvents: "none" }} />
            <div style={{ position: "relative" }}>
              <div className="label-text text-white" style={{ marginBottom: "1.5rem", opacity: 0.8 }}>
                Limited Time Offer
              </div>
              <h2 className="display-md text-white" style={{ marginBottom: "1.25rem" }}>
                Start Trading with <span style={{ color: "#60C0F0" }}>$0 Commission</span>
              </h2>
              <p style={{ color: "#94A3B8", fontSize: "1.125rem", maxWidth: "520px", margin: "0 auto 2.5rem", lineHeight: 1.7 }}>
                Open your account today and get access to all 200+ instruments with zero commission trading for your first 30 days.
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <a href="/register" className="btn-primary" style={{ background: "#ffffff", color: "#0B3C5D", fontSize: "1rem", padding: "1rem 2.5rem" }}>
                  Create Free Account
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </a>
                <a href="/login" className="btn-outline" style={{ borderColor: "rgba(255,255,255,0.3)", color: "#ffffff", fontSize: "1rem", padding: "1rem 2.5rem" }}>
                  Try Demo Account
                </a>
              </div>
              <p style={{ color: "#64748B", fontSize: "0.875rem", marginTop: "2rem" }}>
                No credit card required · Withdrawal anytime · UAE Regulated
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────── */}
      <footer style={{ background: "#0B1929", padding: "4rem 1.5rem 2rem" }}>
        <div className="container-max">
          <div className="grid md:grid-cols-4 gap-8" style={{ marginBottom: "3rem" }}>
            <div>
              <div className="flex items-center gap-2" style={{ marginBottom: "1rem" }}>
                <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: "#1F77B4" }}>
                  <span className="text-white font-black text-sm">EC</span>
                </div>
                <span className="font-black text-white text-base">ECMarket <span style={{ color: "#60C0F0" }}>Pro</span></span>
              </div>
              <p style={{ color: "#64748B", fontSize: "0.875rem", lineHeight: 1.7, marginBottom: "1.5rem" }}>
                UAE regulated forex & CFD broker. Trade with confidence.
              </p>
              <div className="flex gap-3">
                {["T", "L", "I", "Y"].map((s) => (
                  <a key={s} href="#" className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm" style={{ background: "rgba(255,255,255,0.08)", color: "#94A3B8", textDecoration: "none" }}>{s}</a>
                ))}
              </div>
            </div>
            {[
              { title: "Trading", links: ["Forex", "Crypto", "CFDs", "Commodities", "Indices"] },
              { title: "Platform", links: ["MetaTrader 5", "WebTrader", "Mobile App", "API Access", "VPS Hosting"] },
              { title: "Company", links: ["About Us", "Regulation", "Careers", "Contact", "Blog"] },
            ].map((col) => (
              <div key={col.title}>
                <h4 className="font-bold text-sm text-white" style={{ marginBottom: "1.25rem", letterSpacing: "0.05em" }}>{col.title}</h4>
                <ul style={{ listStyle: "none" }}>
                  {col.links.map((link) => (
                    <li key={link} style={{ marginBottom: "0.75rem" }}>
                      <a href="#" style={{ color: "#64748B", fontSize: "0.875rem", textDecoration: "none", transition: "color 0.2s" }}
                        onMouseEnter={e => (e.currentTarget.style.color = "#94A3B8")}
                        onMouseLeave={e => (e.currentTarget.style.color = "#64748B")}
                      >{link}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "2rem" }}>
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <p style={{ color: "#374151", fontSize: "0.8125rem" }}>
                © 2025 ECMarket Pro. All rights reserved. | ecmarketpro.in
              </p>
              <div className="flex gap-6">
                {["Privacy Policy", "Terms of Service", "Risk Disclosure"].map((item) => (
                  <a key={item} href="#" style={{ color: "#374151", fontSize: "0.8125rem", textDecoration: "none" }}>{item}</a>
                ))}
              </div>
            </div>
            <p style={{ color: "#374151", fontSize: "0.75rem", marginTop: "1rem", lineHeight: 1.6 }}>
              <strong style={{ color: "#4B5563" }}>Risk Warning:</strong> Trading forex and CFDs involves significant risk of loss and may not be suitable for all investors. Leverage can work against you. Please ensure you fully understand the risks involved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
