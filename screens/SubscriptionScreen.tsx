
import React, { useState } from 'react';
import { Screen, User } from '../types';
import { Logo } from '../constants';

interface SubscriptionScreenProps {
  user: User | null;
  onNavigate: (screen: Screen) => void;
  onUpdateUser: (user: User) => void;
}

const SubscriptionScreen: React.FC<SubscriptionScreenProps> = ({ user, onNavigate, onUpdateUser }) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleUpgrade = () => {
    if (!user) return;
    setIsProcessing(true);
    // Simulate payment processing
    setTimeout(() => {
      const updatedUser: User = { ...user, plan: 'pro' };
      onUpdateUser(updatedUser);
      setIsProcessing(false);
      onNavigate(Screen.Dashboard);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-background-dark text-white overflow-y-auto">
      <header className="flex items-center justify-between px-6 lg:px-20 py-8 border-b border-white/5">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => onNavigate(Screen.Dashboard)}>
          <Logo />
          <span className="text-xl font-bold tracking-tight">MockInterview.ai</span>
        </div>
        <button onClick={() => onNavigate(Screen.Dashboard)} className="text-text-secondary hover:text-white transition-colors">
          <span className="material-symbols-outlined">close</span>
        </button>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-16">
        <div className="text-center mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest">
            Pricing Plans
          </div>
          <h1 className="text-4xl lg:text-6xl font-black tracking-tight">Elevate your preparation.</h1>
          <p className="text-xl text-text-secondary max-w-2xl mx-auto">
            Choose the plan that fits your career goals. Land your dream role with unlimited potential.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Free Plan */}
          <div className="bg-surface-dark border border-border-dark p-8 rounded-[40px] flex flex-col justify-between hover:border-white/10 transition-all shadow-xl">
            <div>
              <div className="mb-8">
                <h3 className="text-xl font-bold mb-2">Basic</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black">$0</span>
                  <span className="text-text-secondary text-sm">/mo</span>
                </div>
                <p className="text-text-secondary text-sm mt-4">Perfect for casual practice and testing the waters.</p>
              </div>
              <ul className="space-y-4 mb-10">
                {[
                  { text: '1 Interview per 24h', icon: 'check_circle' },
                  { text: '15 Min Max Session', icon: 'check_circle' },
                  { text: 'AI Feedback (Basic)', icon: 'check_circle' },
                  { text: 'Real-time Voice', icon: 'check_circle' },
                  { text: 'Unlimited Retakes', icon: 'cancel', disabled: true },
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
              {user?.plan === 'free' ? 'Current Plan' : 'Downgrade'}
            </button>
          </div>

          {/* Pro Plan */}
          <div className="relative p-8 rounded-[40px] bg-gradient-to-b from-primary/20 to-surface-dark border border-primary/30 flex flex-col justify-between shadow-2xl overflow-hidden">
            <div className="absolute top-0 right-0 bg-primary px-6 py-2 rounded-bl-3xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg">
              Most Popular
            </div>
            <div>
              <div className="mb-8">
                <h3 className="text-xl font-bold mb-2 text-primary">Pro</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black">$12</span>
                  <span className="text-text-secondary text-sm">/mo</span>
                </div>
                <p className="text-text-secondary text-sm mt-4">For serious candidates ready to master the process.</p>
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
              onClick={handleUpgrade}
              disabled={user?.plan === 'pro' || isProcessing}
              className="w-full py-5 rounded-2xl bg-primary hover:bg-primary-hover text-white font-black text-sm uppercase tracking-widest shadow-xl shadow-primary/30 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {isProcessing ? <span className="material-symbols-outlined animate-spin">refresh</span> : null}
              {user?.plan === 'pro' ? 'Active Subscription' : isProcessing ? 'Processing...' : 'Upgrade Now'}
            </button>
          </div>
        </div>

        <section className="mt-24 bg-surface-dark border border-border-dark p-12 rounded-[48px] text-center shadow-2xl relative overflow-hidden">
          <div className="absolute -top-24 -left-24 size-64 bg-primary/10 rounded-full blur-[100px]"></div>
          <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left max-w-4xl mx-auto">
             <div className="space-y-2">
                <h4 className="text-white font-bold">Can I cancel anytime?</h4>
                <p className="text-text-secondary text-sm leading-relaxed">Yes, you can cancel your subscription at any time from your settings page with one click.</p>
             </div>
             <div className="space-y-2">
                <h4 className="text-white font-bold">What happens after 5 interviews?</h4>
                <p className="text-text-secondary text-sm leading-relaxed">Your quota resets every 24 hours. You can still review your previous analyses in the meantime.</p>
             </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default SubscriptionScreen;
