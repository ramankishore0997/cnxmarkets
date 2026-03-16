import { PublicLayout } from '@/components/layout/PublicLayout';
import { motion } from 'framer-motion';
import { Mail, MapPin, Phone, Send, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

export function Contact() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      toast({
        title: "Message Sent",
        description: "Our team will get back to you within 24 hours.",
      });
      (e.target as HTMLFormElement).reset();
    }, 1500);
  };

  return (
    <PublicLayout>
      <div className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">Get in <span className="text-gradient-blue">Touch</span></h1>
            <p className="text-xl text-muted-foreground">
              Whether you have a question about features, pricing, or need technical support, our team is ready to answer all your questions.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Contact Info */}
            <div className="space-y-8">
              <div className="glass-card p-8 rounded-2xl flex items-start gap-6 group">
                <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center shrink-0 group-hover:bg-primary transition-colors">
                  <MapPin className="w-6 h-6 text-primary group-hover:text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Corporate Headquarters</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Level 12, Tower 2, BKC<br />
                    Bandra Kurla Complex<br />
                    Mumbai, Maharashtra 400051<br />
                    India
                  </p>
                </div>
              </div>

              <div className="glass-card p-8 rounded-2xl flex items-start gap-6 group">
                <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center shrink-0 group-hover:bg-accent transition-colors">
                  <Mail className="w-6 h-6 text-accent group-hover:text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Email Support</h3>
                  <p className="text-muted-foreground mb-1">General inquiries:</p>
                  <a href="mailto:info@ecmarketsindia.com" className="text-white hover:text-accent transition-colors font-medium block mb-3">info@ecmarketsindia.com</a>
                  <p className="text-muted-foreground mb-1">Technical support:</p>
                  <a href="mailto:support@ecmarketsindia.com" className="text-white hover:text-accent transition-colors font-medium">support@ecmarketsindia.com</a>
                </div>
              </div>

              <div className="glass-card p-8 rounded-2xl flex items-start gap-6 group">
                <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center shrink-0 group-hover:bg-green-500 transition-colors">
                  <Phone className="w-6 h-6 text-green-500 group-hover:text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Direct Line</h3>
                  <p className="text-muted-foreground mb-2">Mon-Fri from 9am to 6pm IST</p>
                  <a href="tel:+912212345678" className="text-2xl font-bold text-white hover:text-green-400 transition-colors">+91 22 1234 5678</a>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="glass-card p-8 md:p-10 rounded-3xl relative overflow-hidden border-t border-white/10">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[80px] pointer-events-none"></div>
              
              <h3 className="text-2xl font-bold text-white mb-8">Send a Message</h3>
              
              <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white">First Name</label>
                    <input 
                      required 
                      type="text" 
                      className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-white placeholder:text-white/30 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                      placeholder="John"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white">Last Name</label>
                    <input 
                      required 
                      type="text" 
                      className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-white placeholder:text-white/30 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                      placeholder="Doe"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-white">Email Address</label>
                  <input 
                    required 
                    type="email" 
                    className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-white placeholder:text-white/30 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                    placeholder="john@company.com"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-white">Subject</label>
                  <select className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all appearance-none">
                    <option value="general">General Inquiry</option>
                    <option value="support">Technical Support</option>
                    <option value="billing">Billing & Pricing</option>
                    <option value="institutional">Institutional Accounts</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-white">Message</label>
                  <textarea 
                    required 
                    rows={4}
                    className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-white placeholder:text-white/30 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all resize-none"
                    placeholder="How can we help you?"
                  ></textarea>
                </div>

                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full py-4 rounded-xl font-bold btn-primary flex justify-center items-center gap-2"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>Send Message <Send className="w-4 h-4" /></>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
