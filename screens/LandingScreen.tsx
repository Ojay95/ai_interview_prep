
import React from 'react';
import { Screen } from '../types';
import { Logo } from '../constants';

interface LandingScreenProps {
  onNavigate: (screen: Screen) => void;
}

const LandingScreen: React.FC<LandingScreenProps> = ({ onNavigate }) => {
  return (
    <div className="flex flex-col min-h-screen bg-background-dark overflow-x-hidden">
      <nav className="flex items-center justify-between px-6 lg:px-20 py-6 border-b border-white/5 sticky top-0 bg-background-dark/80 backdrop-blur-md z-50">
        <div className="flex items-center gap-3">
          <Logo />
          <span className="text-xl font-bold tracking-tight text-white">MockInterview.ai</span>
        </div>
        <div className="flex items-center gap-6">
          <button 
            onClick={() => onNavigate(Screen.SignIn)}
            className="text-sm font-semibold text-text-secondary hover:text-white transition-colors"
          >
            Sign In
          </button>
          <button 
            onClick={() => onNavigate(Screen.SignUp)}
            className="bg-primary hover:bg-primary-hover px-6 py-2 rounded-xl text-sm font-bold text-white shadow-lg shadow-primary/20 transition-all"
          >
            Get Started
          </button>
        </div>
      </nav>

      <main className="flex-1 flex flex-col lg:flex-row items-center px-6 lg:px-20 py-20 gap-16 relative">
        <div className="flex-1 flex flex-col gap-8 z-10 text-center lg:text-left">
          <div className="inline-flex self-center lg:self-start items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 backdrop-blur-md border border-white/10 text-teal-400 text-xs font-medium">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-400"></span>
            </span>
            New: Advanced Voice Analytics 2.0
          </div>
          <h1 className="text-5xl lg:text-7xl font-black text-white leading-tight tracking-tight">
            Master your next <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-teal-400">
              interview with AI confidence.
            </span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
            The world's most advanced voice-driven practice platform. Simulate real interview scenarios and get instant, brutally honest feedback to land your dream job.
          </p>
          <div className="flex flex-wrap justify-center lg:justify-start gap-4 mt-4">
            <button 
              onClick={() => onNavigate(Screen.SignUp)}
              className="bg-primary hover:bg-primary-hover px-8 py-4 rounded-2xl text-lg font-bold text-white shadow-xl shadow-primary/30 transition-all transform hover:scale-105"
            >
              Start Free Practice
            </button>
            <button className="bg-white/5 hover:bg-white/10 px-8 py-4 rounded-2xl text-lg font-bold text-white border border-white/10 backdrop-blur-sm transition-all">
              Watch Demo
            </button>
          </div>
          <div className="flex items-center justify-center lg:justify-start gap-4 border-t border-white/10 pt-8 mt-4">
            <div className="flex -space-x-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-10 w-10 rounded-full border-2 border-background-dark bg-gray-600 flex items-center justify-center text-xs text-white">
                  {['AM', 'JL', 'RK'][i-1]}
                </div>
              ))}
              <div className="h-10 w-10 rounded-full border-2 border-background-dark bg-primary flex items-center justify-center text-[10px] font-bold text-white">+10k</div>
            </div>
            <div>
              <div className="flex items-center justify-center lg:justify-start gap-0.5 text-amber-400">
                {[1, 2, 3, 4, 5].map(i => <span key={i} className="material-symbols-outlined text-sm">star</span>)}
              </div>
              <span className="text-sm font-medium text-gray-400">Trusted by 10,000+ professionals</span>
            </div>
          </div>
        </div>

        <div className="flex-1 w-full max-w-[600px] aspect-square relative hidden lg:block">
           <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-teal-500/10 rounded-3xl blur-[120px]"></div>
           <div className="relative z-10 h-full w-full glass-card rounded-3xl border border-white/10 p-10 flex flex-col gap-8 shadow-2xl">
              <div className="flex items-center justify-between pb-6 border-b border-white/5">
                <div className="flex items-center gap-4">
                   <div className="size-12 rounded-2xl bg-primary flex items-center justify-center text-white">
                     <span className="material-symbols-outlined text-3xl">mic</span>
                   </div>
                   <div>
                     <p className="text-white font-bold text-lg">Interview with Sarah</p>
                     <p className="text-text-secondary text-sm">Live Voice Session</p>
                   </div>
                </div>
                <div className="px-3 py-1 bg-teal-400/10 text-teal-400 rounded-full text-xs font-bold border border-teal-400/20">LIVE</div>
              </div>

              <div className="flex-1 space-y-6">
                 <div className="flex gap-4">
                    <div className="size-8 rounded-full bg-gray-600 flex-shrink-0"></div>
                    <div className="bg-white/5 p-4 rounded-2xl rounded-tl-none border border-white/10 text-sm text-gray-300">
                      "Tell me about a time you had to deal with a difficult team member..."
                    </div>
                 </div>
                 <div className="flex gap-4 flex-row-reverse">
                    <div className="size-8 rounded-full bg-primary flex-shrink-0"></div>
                    <div className="bg-primary/20 p-4 rounded-2xl rounded-tr-none border border-primary/20 text-sm text-white">
                      "I once worked with a developer who was consistently late on deliverables. I scheduled a one-on-one to..."
                    </div>
                 </div>
                 <div className="flex gap-4">
                    <div className="size-8 rounded-full bg-gray-600 flex-shrink-0"></div>
                    <div className="bg-white/5 p-4 rounded-2xl rounded-tl-none border border-white/10 text-sm text-gray-300">
                      "That's a great approach. How did they respond to that feedback?"
                    </div>
                 </div>
              </div>

              <div className="flex items-center justify-center h-20 gap-1">
                 {[1,2,3,4,5,6,7,8,7,6,5,4,3,2,1].map((h, i) => (
                    <div key={i} className="w-1.5 bg-primary rounded-full" style={{ height: `${h * 10}%`, opacity: 0.3 + (h/10) }}></div>
                 ))}
              </div>
           </div>
        </div>
      </main>

      <footer className="px-6 lg:px-20 py-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8 bg-background-dark/50">
        <div className="flex items-center gap-3 opacity-60">
          <Logo className="size-7" />
          <span className="text-lg font-bold tracking-tight text-white">MockInterview.ai</span>
        </div>
        <div className="flex gap-8 text-sm text-text-secondary">
          <button 
            onClick={() => onNavigate(Screen.Privacy)} 
            className="hover:text-white transition-colors"
          >
            Privacy
          </button>
          <button 
            onClick={() => onNavigate(Screen.Terms)} 
            className="hover:text-white transition-colors"
          >
            Terms
          </button>
          <button 
            onClick={() => onNavigate(Screen.Contact)} 
            className="hover:text-white transition-colors"
          >
            Contact
          </button>
        </div>
        <div className="text-sm text-text-secondary">
          © 2024 MockInterview.ai. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default LandingScreen;
