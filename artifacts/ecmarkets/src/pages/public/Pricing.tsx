import { PublicLayout } from '@/components/layout/PublicLayout';
import { motion } from 'framer-motion';
import { Check, X, ShieldAlert } from 'lucide-react';
import { Link } from 'wouter';

export function Pricing() {
  const plans = [
    {
      name: "Starter Algo",
      minDeposit: "₹50,000",
      description: "Perfect for retail investors testing quantitative strategies.",
      features: [
        "Access to 2 core strategies",
        "Standard execution latency",
        "Daily performance reports",
        "Email support",
        "Withdraw anytime (24h processing)",
      ],
      notIncluded: [
        "Direct API access",
        "Dedicated account manager",
        "Custom strategy allocation"
      ],
      cta: "Start with ₹50k",
      popular: false
    },
    {
      name: "Professional Algo",
      minDeposit: "₹1,00,000",
      description: "For serious investors seeking optimized returns.",
      features: [
        "Access to all 5 premium strategies",
        "Priority low-latency execution",
        "Custom strategy allocation sliders",
        "Real-time SMS alerts",
        "Dedicated account manager",
        "Priority withdrawals (4h processing)"
      ],
      notIncluded: [
        "Direct API access"
      ],
      cta: "Open Professional Account",
      popular: true
    },
    {
      name: "Institutional",
      minDeposit: "₹5,00,000",
      description: "Ultra-low latency execution for high-net-worth clients.",
      features: [
        "Access to all strategies + beta algorithms",
        "Zero-latency FIX API execution",
        "Custom risk parameter settings",
        "Direct line to quant desk",
        "Instant withdrawals",
        "White-label reporting options"
      ],
      notIncluded: [],
      cta: "Contact VIP Desk",
      popular: false
    }
  ];

  return (
    <PublicLayout>
      <div className="pt-24 pb-16 text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">Transparent <span className="text-gradient-blue">Pricing</span></h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            No hidden management fees. We charge a strict 20% performance fee on high-water mark profits only. If we don't perform, we don't get paid.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`rounded-3xl p-8 relative flex flex-col ${
                plan.popular 
                  ? 'bg-gradient-to-b from-primary/10 to-card border-2 border-primary/50 shadow-2xl shadow-primary/20 scale-105 z-10' 
                  : 'glass-card'
              }`}
            >
              {plan.popular && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-white text-xs font-bold uppercase tracking-wider py-1 px-4 rounded-full">
                  Recommended
                </div>
              )}
              
              <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
              <div className="mb-4">
                <span className="text-sm text-muted-foreground">Min. Capital</span>
                <div className="text-3xl font-bold text-gradient-gold">{plan.minDeposit}</div>
              </div>
              <p className="text-muted-foreground text-sm mb-8">{plan.description}</p>
              
              <div className="flex-1 space-y-4 mb-8">
                {plan.features.map((feature, j) => (
                  <div key={j} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-400 shrink-0" />
                    <span className="text-sm text-white">{feature}</span>
                  </div>
                ))}
                {plan.notIncluded.map((feature, j) => (
                  <div key={`not-${j}`} className="flex items-start gap-3 opacity-50">
                    <X className="w-5 h-5 text-red-400 shrink-0" />
                    <span className="text-sm text-muted-foreground line-through">{feature}</span>
                  </div>
                ))}
              </div>
              
              <Link 
                href="/auth/register" 
                className={`w-full py-3.5 rounded-xl font-bold text-center transition-all ${
                  plan.popular 
                    ? 'btn-primary' 
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                {plan.cta}
              </Link>
            </motion.div>
          ))}
        </div>

        <div className="mt-20 max-w-4xl mx-auto glass-card p-8 rounded-2xl flex flex-col md:flex-row items-center gap-8">
          <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center shrink-0">
            <ShieldAlert className="w-8 h-8 text-accent" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white mb-2">High-Water Mark Policy</h3>
            <p className="text-muted-foreground">
              Our 20% performance fee is strictly calculated using a High-Water Mark (HWM). This means if your account drops in value, we must recover the losses before charging performance fees again. We only profit when your account reaches new all-time highs.
            </p>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
