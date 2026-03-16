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
      <div className="pt-24 pb-16 bg-white border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">Get in <span className="text-primary">Touch</span></h1>
            <p className="text-xl text-gray-600">
              Whether you have a question about features, pricing, or need technical support, our team is ready to answer all your questions.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Contact Info */}
            <div className="space-y-6">
              <div className="card-light p-6 rounded-2xl flex items-start gap-6 group">
                <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center shrink-0 group-hover:bg-primary transition-colors">
                  <MapPin className="w-6 h-6 text-primary group-hover:text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Corporate Headquarters</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Level 12, Tower 2, BKC<br />
                    Bandra Kurla Complex<br />
                    Mumbai, Maharashtra 400051<br />
                    India
                  </p>
                </div>
              </div>

              <div className="card-light p-6 rounded-2xl flex items-start gap-6 group">
                <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center shrink-0 group-hover:bg-primary transition-colors">
                  <Mail className="w-6 h-6 text-primary group-hover:text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Email Support</h3>
                  <p className="text-gray-500 text-sm mb-1">General inquiries:</p>
                  <a href="mailto:info@ecmarketsindia.com" className="text-gray-900 hover:text-primary transition-colors font-medium block mb-3">info@ecmarketsindia.com</a>
                  <p className="text-gray-500 text-sm mb-1">Technical support:</p>
                  <a href="mailto:support@ecmarketsindia.com" className="text-gray-900 hover:text-primary transition-colors font-medium">support@ecmarketsindia.com</a>
                </div>
              </div>

              <div className="card-light p-6 rounded-2xl flex items-start gap-6 group">
                <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center shrink-0 group-hover:bg-primary transition-colors">
                  <Phone className="w-6 h-6 text-primary group-hover:text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Direct Line</h3>
                  <a href="tel:+912212345678" className="text-2xl font-bold text-gray-900 hover:text-primary transition-colors block mb-2">+91 22 1234 5678</a>
                </div>
              </div>
              
              <div className="card-light p-6 rounded-2xl flex items-start gap-6 group">
                <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center shrink-0 group-hover:bg-primary transition-colors">
                  <Clock className="w-6 h-6 text-primary group-hover:text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Working Hours</h3>
                  <p className="text-gray-600">Mon-Fri: 9:00 AM - 6:00 PM IST</p>
                  <p className="text-gray-600">Sat-Sun: Closed</p>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="card-light p-8 md:p-10 rounded-3xl relative overflow-hidden shadow-xl border-t-4 border-t-primary">
              <h3 className="text-2xl font-bold text-gray-900 mb-8">Send a Message</h3>
              
              <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">First Name</label>
                    <input 
                      required 
                      type="text" 
                      className="w-full bg-gray-50 border border-border rounded-xl py-3 px-4 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all shadow-sm"
                      placeholder="John"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">Last Name</label>
                    <input 
                      required 
                      type="text" 
                      className="w-full bg-gray-50 border border-border rounded-xl py-3 px-4 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all shadow-sm"
                      placeholder="Doe"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">Email Address</label>
                    <input 
                      required 
                      type="email" 
                      className="w-full bg-gray-50 border border-border rounded-xl py-3 px-4 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all shadow-sm"
                      placeholder="john@company.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">Phone Number</label>
                    <input 
                      type="tel" 
                      className="w-full bg-gray-50 border border-border rounded-xl py-3 px-4 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all shadow-sm"
                      placeholder="+91"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Subject</label>
                  <select className="w-full bg-gray-50 border border-border rounded-xl py-3 px-4 text-gray-900 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all shadow-sm">
                    <option value="general">General Inquiry</option>
                    <option value="support">Technical Support</option>
                    <option value="billing">Billing & Pricing</option>
                    <option value="institutional">Institutional Accounts</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Message</label>
                  <textarea 
                    required 
                    rows={5}
                    className="w-full bg-gray-50 border border-border rounded-xl py-3 px-4 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all resize-none shadow-sm"
                    placeholder="How can we help you?"
                  ></textarea>
                </div>

                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full py-4 rounded-xl font-bold btn-primary flex justify-center items-center gap-2 text-lg"
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
