import { PublicLayout } from '@/components/layout/PublicLayout';
import { motion } from 'framer-motion';
import { Mail, MapPin, Phone, Send, Loader2, Clock } from 'lucide-react';
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
      <div className="pt-24 pb-16 section-dark border-b border-[#181B23]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-10">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">Get in <span className="text-gradient-gold">Touch</span></h1>
            <p className="text-xl text-[#848E9C]">
              Whether you have a question about features, pricing, or need technical support, our team is ready to answer all your questions.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Contact Info */}
            <div className="space-y-6">
              <div className="card-stealth p-6 flex items-start gap-6 group">
                <div className="w-12 h-12 rounded-xl bg-[#060709] border border-[#181B23] flex items-center justify-center shrink-0 group-hover:border-[#00C274] transition-colors">
                  <MapPin className="w-6 h-6 text-[#00C274]" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Corporate Headquarters</h3>
                  <p className="text-[#848E9C] leading-relaxed">
                    2035 Sunset Lake Road, Suite B-2<br />
                    Newark, Delaware 19702<br />
                    United States
                  </p>
                </div>
              </div>

              <div className="card-stealth p-6 flex items-start gap-6 group">
                <div className="w-12 h-12 rounded-xl bg-[#060709] border border-[#181B23] flex items-center justify-center shrink-0 group-hover:border-[#00C274] transition-colors">
                  <Mail className="w-6 h-6 text-[#00C274]" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Email Support</h3>
                  <p className="text-[#848E9C] text-sm mb-1">Support & inquiries:</p>
                  <a href="mailto:support@ecmarketsindia.com" className="text-white hover:text-[#00C274] transition-colors font-medium block mb-3">support@ecmarketsindia.com</a>
                </div>
              </div>

              <div className="card-stealth p-6 flex items-start gap-6 group">
                <div className="w-12 h-12 rounded-xl bg-[#060709] border border-[#181B23] flex items-center justify-center shrink-0 group-hover:border-[#00C274] transition-colors">
                  <Phone className="w-6 h-6 text-[#00C274]" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Direct Line</h3>
                  <a href="tel:+912212345678" className="text-2xl font-bold text-white hover:text-[#00C274] transition-colors block mb-2">+91 22 1234 5678</a>
                </div>
              </div>
              
              <div className="card-stealth p-6 flex items-start gap-6 group">
                <div className="w-12 h-12 rounded-xl bg-[#060709] border border-[#181B23] flex items-center justify-center shrink-0 group-hover:border-[#00C274] transition-colors">
                  <Clock className="w-6 h-6 text-[#00C274]" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Working Hours</h3>
                  <p className="text-[#848E9C]">Mon-Fri: 9:00 AM - 6:00 PM IST</p>
                  <p className="text-[#848E9C]">Sat-Sun: Closed</p>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="card-stealth p-8 md:p-10 relative overflow-hidden shadow-xl border-t-4 border-t-[#00C274]">
              <h3 className="text-2xl font-bold text-white mb-8">Send a Message</h3>
              
              <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-[#848E9C]">First Name</label>
                    <input 
                      required 
                      type="text" 
                      className="input-stealth"
                      placeholder="John"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-[#848E9C]">Last Name</label>
                    <input 
                      required 
                      type="text" 
                      className="input-stealth"
                      placeholder="Doe"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-[#848E9C]">Email Address</label>
                    <input 
                      required 
                      type="email" 
                      className="input-stealth"
                      placeholder="john@company.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-[#848E9C]">Phone Number</label>
                    <input 
                      type="tel" 
                      className="input-stealth"
                      placeholder="+91"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-[#848E9C]">Subject</label>
                  <select className="input-stealth appearance-none">
                    <option value="general">General Inquiry</option>
                    <option value="support">Technical Support</option>
                    <option value="billing">Billing & Pricing</option>
                    <option value="institutional">Institutional Accounts</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-[#848E9C]">Message</label>
                  <textarea 
                    required 
                    rows={5}
                    className="input-stealth resize-none"
                    placeholder="How can we help you?"
                  ></textarea>
                </div>

                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="btn-green w-full py-4 flex justify-center items-center gap-2 text-lg"
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