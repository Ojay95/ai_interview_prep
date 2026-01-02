
import React from 'react';
import { Screen, User } from '../types';

interface SettingsScreenProps {
  user: User | null;
  onNavigate: (screen: Screen) => void;
  onLogout: () => void;
}

const SettingsScreen: React.FC<SettingsScreenProps> = ({ user, onNavigate, onLogout }) => {
  const isPro = user?.plan === 'pro';

  return (
    <div className="flex h-screen w-full bg-background-dark overflow-hidden">
      <aside className="flex w-72 flex-col justify-between bg-[#111318] border-r border-border-dark h-full shrink-0 overflow-y-auto">
        <div className="flex flex-col gap-6 p-6">
          <div className="flex items-center gap-4 cursor-pointer" onClick={() => onNavigate(Screen.Dashboard)}>
            <div className="size-12 rounded-full border-2 border-border-dark bg-gray-600 flex items-center justify-center text-white text-xs font-bold uppercase">
              {user?.name?.slice(0, 2)}
            </div>
            <div className="flex flex-col">
              <h1 className="text-white text-base font-semibold leading-tight">{user?.name}</h1>
              <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-black tracking-widest border mt-1 w-fit uppercase ${isPro ? 'bg-primary/20 text-primary border-primary/20' : 'bg-white/5 text-text-secondary border-white/10'}`}>
                {isPro ? 'Pro Plan' : 'Free Plan'}
              </span>
            </div>
          </div>
          <nav className="flex flex-col gap-2 mt-4">
            <button className="flex items-center gap-3 px-4 py-3 rounded-xl text-text-secondary hover:bg-white/5 transition-all text-sm font-medium">
              <span className="material-symbols-outlined">account_circle</span>
              Account
            </button>
            <button className="flex items-center gap-3 px-4 py-3 rounded-xl bg-primary/10 text-primary border border-primary/20 shadow-sm transition-all text-sm font-bold">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>graphic_eq</span>
              Voice & AI
            </button>
            <button 
              onClick={() => onNavigate(Screen.Subscription)}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-text-secondary hover:bg-white/5 transition-all text-sm font-medium"
            >
              <span className="material-symbols-outlined">payments</span>
              Subscription
            </button>
            <button className="flex items-center gap-3 px-4 py-3 rounded-xl text-text-secondary hover:bg-white/5 transition-all text-sm font-medium">
              <span className="material-symbols-outlined">verified_user</span>
              Data & Privacy
            </button>
          </nav>
        </div>
        <div className="p-6 border-t border-border-dark">
          {!isPro && (
            <button 
              onClick={() => onNavigate(Screen.Subscription)}
              className="w-full mb-4 py-3 rounded-xl bg-gradient-to-r from-primary to-indigo-600 text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all"
            >
              Upgrade to Pro
            </button>
          )}
          <button onClick={onLogout} className="flex w-full items-center justify-center gap-2 rounded-xl h-12 bg-white/5 hover:bg-white/10 text-white text-sm font-bold transition-all border border-white/5">
            <span className="material-symbols-outlined">logout</span>
            Sign Out
          </button>
        </div>
      </aside>

      <main className="flex-1 h-full overflow-y-auto p-10">
        <div className="max-w-4xl mx-auto space-y-12">
          <header className="space-y-2">
            <h2 className="text-3xl font-black text-white tracking-tight">Voice & AI Preferences</h2>
            <p className="text-text-secondary text-lg">Customize your interviewer's persona, tone, and speech patterns.</p>
          </header>

          <section className="bg-surface-dark rounded-3xl border border-border-dark/50 p-8 space-y-8 shadow-2xl relative">
            {!isPro && (
              <div className="absolute inset-0 bg-background-dark/40 backdrop-blur-[2px] z-10 rounded-3xl flex items-center justify-center">
                 <div className="bg-[#1a1c24] p-8 rounded-[32px] border border-border-dark shadow-2xl max-w-sm text-center space-y-4">
                    <div className="size-12 bg-primary/20 text-primary rounded-2xl flex items-center justify-center mx-auto">
                       <span className="material-symbols-outlined">lock</span>
                    </div>
                    <h4 className="text-white font-bold">Custom Voices are Pro Only</h4>
                    <p className="text-text-secondary text-xs leading-relaxed">Upgrade to Pro to unlock Kore, Shimmer, and other high-fidelity expressive voice models.</p>
                    <button onClick={() => onNavigate(Screen.Subscription)} className="w-full py-3 bg-primary text-white rounded-xl font-bold text-sm shadow-xl shadow-primary/30">Upgrade for $12/mo</button>
                 </div>
              </div>
            )}
            <div className="flex items-center gap-3 border-b border-white/5 pb-6">
               <span className="material-symbols-outlined text-primary">record_voice_over</span>
               <h3 className="text-white text-xl font-bold">Voice Engine</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
               <div className="space-y-3">
                  <label className="text-white text-[10px] font-bold uppercase tracking-widest">AI Voice Model</label>
                  <select disabled={!isPro} className="w-full h-12 rounded-xl bg-background-dark border border-border-dark text-white px-4 focus:ring-1 focus:ring-primary outline-none disabled:opacity-50">
                     <option>Zephyr (Default)</option>
                     <option>Echo (Male, Neutral)</option>
                     <option>Alloy (Female, Neutral)</option>
                     <option>Shimmer (Female, Expressive)</option>
                     <option>Kore (Male, Professional)</option>
                  </select>
                  <p className="text-text-secondary text-xs">Select the base vocal characteristics of your interviewer.</p>
               </div>
               <div className="space-y-3">
                  <div className="flex justify-between items-center">
                     <label className="text-white text-[10px] font-bold uppercase tracking-widest">Speech Speed</label>
                     <span className="text-primary font-black text-[10px] bg-primary/10 px-2 py-1 rounded">1.2x</span>
                  </div>
                  <input disabled={!isPro} type="range" className="w-full h-1.5 bg-background-dark rounded-full appearance-none accent-primary disabled:opacity-50" min="0.5" max="2.0" step="0.1" defaultValue="1.2" />
                  <div className="flex justify-between text-[10px] font-bold text-text-secondary uppercase tracking-widest">
                     <span>Slow</span>
                     <span>Normal</span>
                     <span>Fast</span>
                  </div>
               </div>
            </div>

            <div className="bg-background-dark rounded-2xl p-6 border border-white/5 flex items-center gap-6 group">
               <button className="size-12 rounded-full bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/20 hover:scale-105 transition-all">
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>play_arrow</span>
               </button>
               <div>
                  <p className="text-white font-bold text-sm">Preview Voice</p>
                  <p className="text-text-secondary text-xs mt-1">Hear a sample of your selected voice.</p>
               </div>
            </div>
          </section>

          <section className="bg-surface-dark rounded-3xl border border-border-dark/50 p-8 space-y-8 shadow-2xl">
             <div className="flex items-center gap-3 border-b border-white/5 pb-6">
                <span className="material-symbols-outlined text-primary">psychology</span>
                <h3 className="text-white text-xl font-bold">Interviewer Persona</h3>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { id: 'recruiter', icon: 'gavel', title: 'The Recruiter', desc: 'Formal, direct, behavioral focus.' },
                  { id: 'peer', icon: 'coffee', title: 'The Peer', desc: 'Casual, technical, collaborative.', active: true },
                  { id: 'executive', icon: 'business_center', title: 'The Executive', desc: 'High-level, strategic, vision-based.' }
                ].map(persona => (
                  <div key={persona.id} className={`p-6 rounded-2xl border transition-all cursor-pointer ${persona.active ? 'bg-primary/5 border-primary shadow-lg shadow-primary/10' : 'bg-background-dark border-border-dark hover:border-white/20'}`}>
                     <div className={`size-10 rounded-xl flex items-center justify-center mb-4 ${persona.active ? 'bg-primary text-white' : 'bg-white/5 text-text-secondary'}`}>
                        <span className="material-symbols-outlined">{persona.icon}</span>
                     </div>
                     <h4 className="text-white font-bold text-sm mb-2">{persona.title}</h4>
                     <p className="text-text-secondary text-xs leading-relaxed">{persona.desc}</p>
                  </div>
                ))}
             </div>
          </section>

          <div className="flex items-center justify-end gap-6 border-t border-white/5 pt-8">
             <button onClick={() => onNavigate(Screen.Dashboard)} className="text-sm font-bold text-text-secondary hover:text-white transition-colors">Cancel</button>
             <button onClick={() => onNavigate(Screen.Dashboard)} className="bg-primary hover:bg-primary-hover px-8 py-3 rounded-xl text-sm font-bold text-white shadow-xl shadow-primary/20 transition-all flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">save</span>
                Save Preferences
             </button>
          </div>
        </div>
      </main>
    </div>
  );
};

// Add missing default export
export default SettingsScreen;
