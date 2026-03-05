import React, { useState } from 'react';
import { Screen } from '../types';
import { Logo } from '../constants';
import { useAuthStore } from '../store/useAuthStore';
import toast from 'react-hot-toast';

interface SignInScreenProps {
  onNavigate: (screen: Screen) => void;
  onLogin?: (user: any) => void;
}

const SignInScreen: React.FC<SignInScreenProps> = ({ onNavigate }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    try {
      // 1. Trigger the secure login in Zustand
      await login(email, password);

      // 2. If successful, navigate to Dashboard
      onNavigate(Screen.Dashboard);
    } catch (error) {
      // Error toast is already handled inside useAuthStore
      console.error("Login failed", error);
    }
  };

  return (
      <div className="flex min-h-screen w-full bg-[#0d111a]">
        <div className="flex w-full flex-col justify-between px-6 py-8 lg:w-1/2 lg:px-20 xl:px-32 bg-[#0d111a]">

          <header className="flex items-center gap-3 cursor-pointer" onClick={() => onNavigate(Screen.Landing)}>
            <Logo className="size-8" />
            <span className="text-xl font-bold tracking-tight text-white">MockInterview.ai</span>
          </header>

          <div className="flex flex-1 flex-col justify-center py-10">
            <div className="w-full max-w-[420px] self-center">
              <div className="mb-10">
                <h1 className="text-3xl font-bold tracking-tight text-white mb-3">Welcome back</h1>
                <p className="text-gray-400">Enter your credentials to access your dashboard.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white" htmlFor="email">Email Address</label>
                  <input
                      className="w-full rounded-xl border border-white/10 bg-black/40 h-12 px-4 text-white placeholder-gray-500 focus:border-primary focus:ring-1 focus:ring-primary transition-all outline-none"
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
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-white" htmlFor="password">Password</label>
                    <button type="button" className="text-xs font-medium text-primary hover:underline">Forgot password?</button>
                  </div>
                  <input
                      className="w-full rounded-xl border border-white/10 bg-black/40 h-12 px-4 text-white placeholder-gray-500 focus:border-primary focus:ring-1 focus:ring-primary transition-all outline-none"
                      id="password"
                      placeholder="••••••••"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={isLoading}
                      required
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input type="checkbox" id="remember" className="rounded border-white/10 bg-black/40 text-primary focus:ring-primary" />
                  <label htmlFor="remember" className="text-sm text-gray-400">Keep me logged in</label>
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full flex items-center justify-center rounded-xl h-12 px-4 bg-primary hover:bg-primary-hover text-white font-bold shadow-lg shadow-primary/30 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                      <div className="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                      'Sign In'
                  )}
                </button>
              </form>

              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase text-gray-400">
                  <span className="bg-[#0d111a] px-2">Or continue with</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-black/40 py-2.5 px-4 text-sm font-medium text-white hover:bg-white/5 transition-colors">
                  <img alt="Google" className="h-5 w-5" src="https://www.google.com/favicon.ico"/>
                  Google
                </button>
                <button className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-black/40 py-2.5 px-4 text-sm font-medium text-white hover:bg-white/5 transition-colors">
                  <span className="material-symbols-outlined text-[20px]">hub</span>
                  GitHub
                </button>
              </div>

              <p className="mt-10 text-center text-sm text-gray-400">
                Don't have an account?
                <button onClick={() => onNavigate(Screen.SignUp)} className="ml-1 font-medium text-primary hover:underline transition-colors">Sign up for free</button>
              </p>
            </div>
          </div>

          <footer className="text-xs text-gray-500">
            © 2024 MockInterview.ai. All rights reserved.
          </footer>
        </div>

        <div className="hidden lg:flex lg:flex-1 relative bg-black overflow-hidden">
          <div className="absolute inset-0 z-0 h-full w-full bg-cover bg-center opacity-30 mix-blend-overlay" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=1000')" }}></div>
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-[#0d111a]/90 to-[#0d111a]"></div>
          <div className="relative z-10 flex flex-col justify-center px-16 xl:px-24 w-full h-full">
            <div className="mb-10 max-w-lg">
              <div className="size-12 rounded-2xl bg-primary flex items-center justify-center text-white mb-8">
                <span className="material-symbols-outlined text-3xl">format_quote</span>
              </div>
              <h2 className="text-3xl xl:text-4xl font-bold text-white mb-6 leading-tight italic">
                "The AI feedback was so accurate it felt like I was talking to a real human recruiter. Helped me land my role at Stripe."
              </h2>
              <div className="flex items-center gap-4">
                <div className="size-10 rounded-full bg-slate-600"></div>
                <div>
                  <p className="text-white font-bold">Sarah Chen</p>
                  <p className="text-gray-400 text-sm">Software Engineer @ Stripe</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
};

export default SignInScreen;