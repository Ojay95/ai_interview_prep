
import React, { useState } from 'react';
import { Screen, User } from '../types';
import { Logo } from '../constants';

interface FAQItem {
  question: string;
  answer: string;
}

const FAQ_DATA: FAQItem[] = [
  {
    question: "Can I cancel anytime?",
    answer: "Yes, you can cancel your subscription at any time from your settings page with one click. Your access will continue until the end of your current billing period."
  },
  {
    question: "What happens after I reach my daily interview limit?",
    answer: "Your daily quota resets every 24 hours at midnight. You can still review your previous analyses, search transcripts, and listen to recordings while waiting for your quota to reset."
  },
  {
    question: "Is there a student discount available?",
    answer: "We offer a 50% discount for students with a valid .edu email. Contact our support team with your credentials to receive a custom promo code."
  },
  {
    question: "How accurate is the AI feedback?",
    answer: "Sarah uses the latest Gemini 2.5 and 3.0 models specifically fine-tuned on HR recruitment datasets. While it's exceptionally accurate for technical and behavioral patterns, we always recommend using it alongside human peer reviews."
  }
];

interface SubscriptionScreenProps {
  user: User | null;
  onNavigate: (screen: Screen) => void;
  onUpdateUser: (user: User) => void;
}

const SubscriptionScreen: React.FC<SubscriptionScreenProps> = ({ user, onNavigate, onUpdateUser }) => {
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const [openFAQ, setOpenFAQ] = useState<number | null>(0);

  const handleUpgrade = (plan: 'pro' | 'elite') => {
    if (!user) return;
    setIsProcessing(plan);
    // Simulate payment processing
    setTimeout(() => {
      const updatedUser: User = { ...user, plan };
      onUpdateUser(updatedUser);
      setIsProcessing(null);
      onNavigate(Screen.Dashboard);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-background-dark text-white overflow-y-auto font-display">
      <header className="flex items-center justify-between px-6 lg:px-20 py-8 border-b border-white/5 sticky top-0 bg-background-dark/80 backdrop-blur-md z-50">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => onNavigate(Screen.Dashboard)}>
          <Logo />
          <span className="text-xl font-bold tracking-tight">MockInterview.ai</span>
        </div>
        <button onClick={() => onNavigate(Screen.Dashboard)} className="text-text-secondary hover:text-white transition-colors">
          <span className="material-symbols-outlined">close</span>
        </button>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest">
            Pricing Plans
          </div>
          <h1 className="text-4xl lg:text-6xl font-black tracking-tight">Elevate your preparation.</h1>
          <p className="text-xl text-text-secondary max-w-2xl mx-auto">
            Choose the plan that fits your career goals. Land your dream role with unlimited potential.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
          {/* Free Plan */}
          <div className="bg-surface-dark border border-border-dark p-8 rounded-[40px] flex flex-col justify-between hover:border-white/10 transition-all shadow-xl group">
            <div>
              <div className="mb-8">
                <h3 className="text-xl font-bold mb-2">Basic</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black">$0</span>
                  <span className="text-text-secondary text-sm">/mo</span>
                </div>
                <p className="text-text-secondary text-sm mt-4 leading-relaxed">Perfect for casual practice and testing the waters.</p>
              </div>
              <ul className="space-y-4 mb-10">
                {[
                  { text: '1 Interview per 24h', icon: 'check_circle' },
                  { text: '15 Min Max Session', icon: 'check_circle' },
                  { text: 'AI Feedback (Basic)', icon: 'check_circle' },
                  { text: 'Real-time Voice', icon: 'check_circle' },
                  { text: 'Custom AI Persona', icon: 'cancel', disabled: true },
                ].map((item, i) => (
                  <li key={i} className={`flex items-center gap-3 text-sm ${item.disabled ? 'text-text-secondary/40' : 'text-gray-300'}`}>
                    <span className={`material-symbols-outlined text-lg ${item.disabled ? 'text-text-secondary/20' : 'text-teal-400'}`}>
                      {item.icon}
                    </span>
                    {item.text}
                  </li>
                ))}
              </ul>
            </div>
            <button 
              disabled={user?.plan === 'free'}
              className="w-full py-4 rounded-2xl bg-white/5 border border-white/10 text-white font-bold text-sm hover:bg-white/10 transition-all disabled:opacity-50"
            >
              {user?.plan === 'free' ? 'Current Plan' : 'Selected'}
            </button>
          </div>

          {/* Pro Plan */}
          <div className="relative p-8 rounded-[40px] bg-gradient-to-b from-primary/20 to-surface-dark border border-primary/30 flex flex-col justify-between shadow-2xl overflow-hidden group">
            <div className="absolute top-0 right-0 bg-primary px-6 py-2 rounded-bl-3xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg">
              Recommended
            </div>
            <div>
              <div className="mb-8">
                <h3 className="text-xl font-bold mb-2 text-primary">Pro</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black">$12</span>
                  <span className="text-text-secondary text-sm">/mo</span>
                </div>
                <p className="text-text-secondary text-sm mt-4 leading-relaxed">For serious candidates ready to master the process.</p>
              </div>
              <ul className="space-y-4 mb-10">
                {[
                  { text: '5 Interviews per 24h', icon: 'verified' },
                  { text: '60 Min Max Session', icon: 'verified' },
                  { text: 'Advanced Deep-Dive Analysis', icon: 'verified' },
                  { text: 'Unlimited Career Paths', icon: 'verified' },
                  { text: 'Custom AI Voice selection', icon: 'verified' },
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-white font-medium">
                    <span className="material-symbols-outlined text-lg text-primary">
                      {item.icon}
                    </span>
                    {item.text}
                  </li>
                ))}
              </ul>
            </div>
            <button 
              onClick={() => handleUpgrade('pro')}
              disabled={user?.plan === 'pro' || user?.plan === 'elite' || !!isProcessing}
              className="w-full py-5 rounded-2xl bg-primary hover:bg-primary-hover text-white font-black text-sm uppercase tracking-widest shadow-xl shadow-primary/30 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {isProcessing === 'pro' ? <span className="material-symbols-outlined animate-spin">refresh</span> : null}
              {user?.plan === 'pro' ? 'Active Subscription' : isProcessing === 'pro' ? 'Processing...' : 'Upgrade to Pro'}
            </button>
          </div>

          {/* Elite Plan */}
          <div className="relative p-8 rounded-[40px] bg-[#1a1c24] border border-indigo-500/30 flex flex-col justify-between shadow-2xl overflow-hidden group hover:border-indigo-500/60 transition-all">
            <div className="absolute top-0 right-0 bg-indigo-600 px-6 py-2 rounded-bl-3xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg">
              Power User
            </div>
            <div>
              <div className="mb-8">
                <h3 className="text-xl font-bold mb-2 text-indigo-400">Elite</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black">$20</span>
                  <span className="text-text-secondary text-sm">/mo</span>
                </div>
                <p className="text-text-secondary text-sm mt-4 leading-relaxed">The ultimate prep kit for career switchers and overachievers.</p>
              </div>
              <ul className="space-y-4 mb-10">
                {[
                  { text: '10 Interviews per 24h', icon: 'star' },
                  { text: 'Unlimited Session Length', icon: 'star' },
                  { text: 'Priority AI Processing', icon: 'star' },
                  { text: 'Behavioral Heatmaps', icon: 'star' },
                  { text: 'Resume Analysis Bonus', icon: 'star' },
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-white font-medium">
                    <span className="material-symbols-outlined text-lg text-indigo-400">
                      {item.icon}
                    </span>
                    {item.text}
                  </li>
                ))}
              </ul>
            </div>
            <button 
              onClick={() => handleUpgrade('elite')}
              disabled={user?.plan === 'elite' || !!isProcessing}
              className="w-full py-5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm uppercase tracking-widest shadow-xl shadow-indigo-600/30 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {isProcessing === 'elite' ? <span className="material-symbols-outlined animate-spin">refresh</span> : null}
              {user?.plan === 'elite' ? 'Current Master Plan' : isProcessing === 'elite' ? 'Processing...' : 'Go Elite'}
            </button>
          </div>
        </div>

        {/* FAQ Accordion Section */}
        <section className="max-w-4xl mx-auto space-y-10">
          <div className="text-center">
             <h2 className="text-3xl font-black tracking-tight">Frequently Asked Questions</h2>
             <p className="text-text-secondary mt-2">Everything you need to know about our subscriptions.</p>
          </div>

          <div className="space-y-4">
             {FAQ_DATA.map((faq, i) => (
               <div key={i} className="bg-[#161b22] border border-white/5 rounded-3xl overflow-hidden transition-all duration-300">
                  <button 
                    onClick={() => setOpenFAQ(openFAQ === i ? null : i)}
                    className="w-full px-8 py-6 flex items-center justify-between text-left hover:bg-white/5 transition-colors"
                  >
                     <span className="font-bold text-lg">{faq.question}</span>
                     <span className={`material-symbols-outlined transition-transform duration-300 ${openFAQ === i ? 'rotate-180' : ''}`}>
                        expand_more
                     </span>
                  </button>
                  <div className={`overflow-hidden transition-all duration-300 ease-in-out ${openFAQ === i ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                     <div className="px-8 pb-8 text-text-secondary leading-relaxed border-t border-white/5 pt-4">
                        {faq.answer}
                     </div>
                  </div>
               </div>
             ))}
          </div>
        </section>

        <div className="mt-24 text-center pb-20">
           <p className="text-text-secondary text-sm">Have more questions? <button className="text-primary font-bold hover:underline">Chat with our support team</button></p>
        </div>
      </main>
    </div>
  );
};

export default SubscriptionScreen;
