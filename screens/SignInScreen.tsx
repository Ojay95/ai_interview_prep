
import React, { useState } from 'react';
import { Screen, User } from '../types';
import { Logo } from '../constants';

interface SignInScreenProps {
  onNavigate: (screen: Screen) => void;
  onLogin: (user: User) => void;
}

const SignInScreen: React.FC<SignInScreenProps> = ({ onNavigate, onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate login - in a real app we would fetch the user's actual plan from a database
    // For this demo, we check if they previously 'upgraded' in localStorage
    const savedUser = localStorage.getItem('mock_user');
    let plan: 'free' | 'pro' = 'free';
    
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      if (parsed.email === email) {
        plan = parsed.plan;
      }
    }

    onLogin({
      id: '1',
      email,
      name: email.split('@')[0],
      plan: plan
    });
  };

  return (
    <div className="flex min-h-screen w-full">
      <div className="flex w-full flex-col justify-between px-6 py-8 lg:w-1/2 lg:px-20 xl:px-32 bg-background-dark">
        <header className="flex items-center gap-3 cursor-pointer" onClick={() => onNavigate(Screen.Landing)}>
          <Logo />
          <span className="text-xl font-bold tracking-tight text-white">MockInterview.ai</span>
        </header>

        <div className="flex flex-1 flex-col justify-center py-10">
          <div className="w-full max-w-[420px] self-center">
            <div className="mb-10 text-left">
              <h1 className="mb-3 text-3xl font-black leading-tight tracking-tight text-white md:text-4xl">
                Welcome back
              </h1>
              <p className="text-base text-text-secondary leading-relaxed">
                Sign in to continue your interview preparation and access your personalized feedback dashboard.
              </p>
            </div>
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-gray-200" htmlFor="email">Email address</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400 group-focus-within:text-primary transition-colors">
                    <span className="material-symbols-outlined text-[20px]">mail</span>
                  </div>
                  <input 
                    className="h-12 w-full rounded-xl border border-border-dark bg-surface-dark pl-11 pr-4 text-base text-white placeholder-text-secondary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all" 
                    id="email" 
                    placeholder="name@company.com" 
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-gray-200" htmlFor="password">Password</label>
                  <button type="button" onClick={() => onNavigate(Screen.ForgotPassword)} className="text-sm font-medium text-primary hover:underline">Forgot password?</button>
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400 group-focus-within:text-primary transition-colors">
                    <span className="material-symbols-outlined text-[20px]">lock</span>
                  </div>
                  <input 
                    className="h-12 w-full rounded-xl border border-border-dark bg-surface-dark pl-11 pr-12 text-base text-white placeholder-text-secondary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all" 
                    id="password" 
                    placeholder="Enter your password" 
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary hover:text-white transition-colors" type="button">
                    <span className="material-symbols-outlined text-[20px]">visibility</span>
                  </button>
                </div>
              </div>
              <button type="submit" className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 text-base font-bold text-white shadow-lg shadow-primary/25 transition-all hover:bg-primary-hover hover:translate-y-[-1px] focus:outline-none focus:ring-2 focus:ring-primary">
                <span>Sign In</span>
                <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
              </button>
            </form>

            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border-dark"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-background-dark px-4 text-text-secondary">Or continue with</span>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button className="flex h-12 flex-1 items-center justify-center gap-3 rounded-xl border border-border-dark bg-surface-dark px-4 text-sm font-medium text-white transition-all hover:bg-[#252833]">
                <img alt="Google" className="h-5 w-5" src="https://www.google.com/favicon.ico"/>
                Google
              </button>
              <button className="flex h-12 flex-1 items-center justify-center gap-3 rounded-xl border border-border-dark bg-surface-dark px-4 text-sm font-medium text-white transition-all hover:bg-[#252833]">
                <span className="material-symbols-outlined text-[20px]">hub</span>
                GitHub
              </button>
            </div>
          </div>
        </div>

        <div className="text-center text-sm text-text-secondary">
          Don't have an account? 
          <button onClick={() => onNavigate(Screen.SignUp)} className="ml-1 font-bold text-primary hover:underline transition-colors">Sign up now</button>
        </div>
      </div>

      <div className="relative hidden w-1/2 flex-col justify-center overflow-hidden bg-surface-dark lg:flex">
        <div className="absolute inset-0 z-0 h-full w-full bg-cover bg-center opacity-40 mix-blend-luminosity" style={{ backgroundImage: "url('https://picsum.photos/1024/1024?grayscale')" }}></div>
        <div className="absolute inset-0 z-10 bg-gradient-to-br from-background-dark/95 via-background-dark/80 to-primary/20"></div>
        <div className="relative z-20 flex flex-col justify-center px-16 xl:px-24">
          <div className="mb-10 max-w-lg">
            <div className="mb-4 inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-teal-400 backdrop-blur-md">
              <span className="mr-2 h-1.5 w-1.5 rounded-full bg-teal-400 animate-pulse"></span>
              AI-Powered Career Coach
            </div>
            <h2 className="mb-4 text-4xl font-extrabold leading-tight text-white tracking-tight xl:text-5xl">
              Master your next <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-text-secondary">interview with confidence.</span>
            </h2>
            <p className="text-lg text-gray-300 leading-relaxed">
              Join thousands of professionals using our voice-driven AI to practice scenarios, refine answers, and land top-tier roles.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Add missing default export
export default SignInScreen;
