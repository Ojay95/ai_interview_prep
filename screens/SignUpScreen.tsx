
import React, { useState } from 'react';
import { LayoutGrid, Eye, Loader2 } from 'lucide-react';
import { Screen, User } from '../types';
import { Logo } from '../constants';
import { useAuthStore } from '../store/useAuthStore';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../constants';

interface SignUpScreenProps {
  onNavigate: (screen: Screen) => void;
  onLogin: (user: User) => void;
}

const SignUpScreen: React.FC<SignUpScreenProps> = ({ onNavigate }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { register, bypassAuth, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName || !email || !password) return;
    try {
      await register(firstName, lastName, email, password);
      navigate(ROUTES.DASHBOARD);
    } catch (error) {
      console.error("Registration failed", error);
    }
  };

  const handleDemoLogin = () => {
    bypassAuth();
    navigate(ROUTES.DASHBOARD);
  };

  return (
    <div className="flex min-h-screen w-full bg-background-light dark:bg-background-dark transition-colors duration-300">
      <div className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-20 xl:px-24 overflow-y-auto bg-background-light dark:bg-background-dark">
        <header className="absolute top-8 left-6 lg:left-20 xl:left-24 flex items-center gap-3 cursor-pointer" onClick={() => onNavigate(Screen.Landing)}>
          <Logo />
          <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">MockInterview.ai</span>
        </header>

        <div className="w-full max-w-[440px] mx-auto mt-16 lg:mt-0">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 dark:text-white mb-3">Get started for free</h1>
            <p className="text-slate-600 dark:text-text-secondary text-base">Create an account to access 1 free mock interview per day. No credit card required.</p>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <button className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-border-dark bg-white dark:bg-surface-dark py-2.5 px-4 text-sm font-medium text-slate-700 dark:text-white hover:bg-slate-50 dark:hover:bg-[#252833] transition-colors">
              <img alt="Google" className="h-5 w-5" src="https://www.google.com/favicon.ico"/>
              Google
            </button>
            <button className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-border-dark bg-white dark:bg-surface-dark py-2.5 px-4 text-sm font-medium text-slate-700 dark:text-white hover:bg-slate-50 dark:hover:bg-[#252833] transition-colors">
              <LayoutGrid className="size-5" />
              GitHub
            </button>
          </div>

          <div className="relative mb-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200 dark:border-border-dark"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase text-slate-500 dark:text-text-secondary">
              <span className="bg-background-light dark:bg-background-dark px-2">Or sign up with email</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-white" htmlFor="firstName">First Name</label>
                <input 
                  className="w-full rounded-xl border border-slate-200 dark:border-border-dark bg-white dark:bg-surface-dark h-12 px-4 text-base text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-text-secondary focus:border-primary focus:ring-1 focus:ring-primary transition-all outline-none" 
                  id="firstName" 
                  placeholder="John" 
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-white" htmlFor="lastName">Last Name</label>
                <input 
                  className="w-full rounded-xl border border-slate-200 dark:border-border-dark bg-white dark:bg-surface-dark h-12 px-4 text-base text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-text-secondary focus:border-primary focus:ring-1 focus:ring-primary transition-all outline-none" 
                  id="lastName" 
                  placeholder="Doe" 
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-white" htmlFor="email">Email Address</label>
              <input 
                className="w-full rounded-xl border border-slate-200 dark:border-border-dark bg-white dark:bg-surface-dark h-12 px-4 text-base text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-text-secondary focus:border-primary focus:ring-1 focus:ring-primary transition-all outline-none" 
                id="email" 
                placeholder="name@company.com" 
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-white" htmlFor="password">Password</label>
              <div className="relative">
                <input 
                  className="w-full rounded-xl border border-slate-200 dark:border-border-dark bg-white dark:bg-surface-dark h-12 px-4 text-base text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-text-secondary focus:border-primary focus:ring-1 focus:ring-primary transition-all outline-none" 
                  id="password" 
                  placeholder="Create a password" 
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  required
                />
                <button className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-text-secondary hover:text-slate-600 dark:hover:text-white" type="button">
                  <Eye className="size-5" />
                </button>
              </div>
              <p className="text-xs text-slate-500 dark:text-text-secondary mt-1">Must be at least 8 characters long.</p>
            </div>
            <div className="flex flex-col gap-3">
              <button type="submit" disabled={isLoading} className="w-full flex items-center justify-center rounded-xl h-12 px-4 bg-primary hover:bg-primary-hover text-white text-base font-bold shadow-lg shadow-primary/30 transition-all active:scale-[0.98] disabled:opacity-75">
                {isLoading ? (
                  <Loader2 className="size-5 animate-spin" />
                ) : (
                  'Get Started Free'
                )}
              </button>
              <button 
                type="button"
                onClick={handleDemoLogin}
                className="w-full flex items-center justify-center rounded-xl h-12 px-4 border border-primary text-primary font-bold hover:bg-primary/5 transition-all active:scale-[0.98]"
              >
                Demo Login (No Auth Required)
              </button>
            </div>
          </form>

          <div className="mt-8 text-center text-sm text-slate-600 dark:text-text-secondary">
            Already have an account? 
            <button onClick={() => onNavigate(Screen.SignIn)} className="ml-1 font-medium text-primary hover:underline transition-colors">Log in</button>
          </div>
        </div>
      </div>

      <div className="hidden lg:flex lg:flex-1 relative bg-slate-900 dark:bg-surface-dark overflow-hidden">
        <div className="absolute inset-0 z-0 h-full w-full bg-cover bg-center opacity-30 mix-blend-overlay" style={{ backgroundImage: "url('https://picsum.photos/1024/1024')" }}></div>
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/90 dark:from-[#111827]/90 via-slate-800/80 dark:via-[#1e1b4b]/80 to-slate-900 dark:to-[#111827]/90"></div>
        <div className="relative z-10 flex flex-col justify-center px-16 xl:px-24 w-full h-full">
          <div className="mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 backdrop-blur-md border border-white/10 text-teal-400 text-xs font-medium mb-6">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-400"></span>
              </span>
              New: Advanced Voice Analytics 2.0
            </div>
            <h2 className="text-4xl xl:text-5xl font-bold text-white mb-6 leading-tight tracking-tight">
              Ace your next interview with <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-white/70">AI confidence.</span>
            </h2>
            <p className="text-lg text-slate-300 leading-relaxed max-w-lg">
              The world's most advanced voice-driven practice platform. Simulate real interview scenarios and get instant, brutally honest feedback.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Add missing default export
export default SignUpScreen;
