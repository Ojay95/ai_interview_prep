
import React, { useState } from 'react';
import { Screen, User, InterviewConfig } from '../types';
import { Logo } from '../constants';
import { analyzeJobDescription } from '../services/geminiService';

interface JDSetupScreenProps {
  user: User | null;
  onNavigate: (screen: Screen) => void;
}

const JDSetupScreen: React.FC<JDSetupScreenProps> = ({ user, onNavigate }) => {
  const [jd, setJd] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [experienceLevel, setExperienceLevel] = useState('Senior');
  const isPro = user?.plan === 'pro';
  const maxDuration = isPro ? 60 : 15;
  const [duration, setDuration] = useState(15);

  const handleGenerate = async () => {
    if (!jd.trim()) return;
    setIsGenerating(true);
    
    try {
      const analysis = await analyzeJobDescription(jd);
      const config: InterviewConfig = {
        role: analysis.roleName || jd.split('\n')[0].slice(0, 50),
        experienceLevel: analysis.experienceLevel || experienceLevel,
        techStack: analysis.keySkills || [],
        focusAreas: analysis.recommendedFocusAreas || ['Core Competencies'],
        duration: duration
      };
      localStorage.setItem('pending_interview_config', JSON.stringify(config));
      
      // Update usage count
      const today = new Date().toDateString();
      const usage = JSON.parse(localStorage.getItem(`usage_${user?.id}`) || '{"count": 0, "date": ""}');
      if (usage.date === today) {
        usage.count += 1;
      } else {
        usage.count = 1;
        usage.date = today;
      }
      localStorage.setItem(`usage_${user?.id}`, JSON.stringify(usage));

      onNavigate(Screen.Interview);
    } catch (err) {
      console.error("Failed to analyze JD:", err);
      const config: InterviewConfig = {
        role: jd.split('\n')[0].slice(0, 50) || 'Custom Professional Role',
        experienceLevel: experienceLevel,
        techStack: [],
        focusAreas: ['Job Requirements', 'Experience', 'Culture Fit'],
        duration: duration
      };
      localStorage.setItem('pending_interview_config', JSON.stringify(config));
      onNavigate(Screen.Interview);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background-dark">
      <header className="sticky top-0 z-50 flex items-center justify-between border-b border-border-dark bg-[#111318]/95 backdrop-blur-md px-10 py-4">
        <div className="flex items-center gap-4 text-white">
          <Logo className="size-8" />
          <h2 className="text-lg font-bold">Configure Sarah</h2>
        </div>
        <button onClick={() => onNavigate(Screen.Dashboard)} className="text-text-secondary hover:text-white transition-colors size-10 rounded-xl hover:bg-white/5 flex items-center justify-center">
          <span className="material-symbols-outlined">close</span>
        </button>
      </header>

      <main className="max-w-[1280px] mx-auto w-full px-6 lg:px-10 py-10 grid grid-cols-1 lg:grid-cols-12 gap-10 overflow-y-auto custom-scrollbar">
        <div className="lg:col-span-8 flex flex-col gap-8">
           <div className="space-y-4">
              <div className="flex items-center gap-2 text-primary text-[10px] font-black uppercase tracking-[0.2em]">
                 <span className="material-symbols-outlined text-sm">psychology</span>
                 <span>Analysis Engine Active</span>
              </div>
              <h1 className="text-4xl lg:text-5xl font-black text-white tracking-tighter">Define the Target Role</h1>
              <p className="text-text-secondary text-lg max-w-2xl leading-relaxed">
                 Paste a job description or role requirements. Sarah will tailor the difficulty and focus areas to this spec.
              </p>
           </div>

           <div className="relative group">
              <div className="absolute top-6 left-6 flex items-center gap-2 text-text-secondary pointer-events-none group-focus-within:text-primary transition-colors">
                 <span className="material-symbols-outlined text-sm">description</span>
                 <span className="text-[10px] font-black uppercase tracking-widest">Requirements Input</span>
              </div>
              <textarea 
                className="w-full h-[450px] rounded-3xl bg-surface-dark border border-border-dark focus:border-primary focus:ring-1 focus:ring-primary text-white p-8 pt-16 text-base lg:text-lg placeholder:text-text-secondary/30 resize-none transition-all shadow-2xl"
                placeholder="Example: Senior Marketing Manager at a growth-stage startup. Responsible for scaling user acquisition and managing a team of 5..."
                value={jd}
                onChange={(e) => setJd(e.target.value)}
              />
           </div>
        </div>

        <div className="lg:col-span-4">
           <div className="bg-surface-dark rounded-3xl border border-border-dark p-8 flex flex-col gap-10 sticky top-10 shadow-2xl overflow-hidden">
              <div className="flex items-center gap-3 border-b border-white/5 pb-6">
                 <span className="material-symbols-outlined text-primary">tune</span>
                 <h2 className="text-white text-lg font-bold">Precision Controls</h2>
              </div>

              <div className="space-y-4">
                 <label className="text-text-secondary text-[10px] font-black uppercase tracking-widest">Experience Level</label>
                 <div className="grid grid-cols-2 gap-2">
                    {['Junior', 'Mid-Level', 'Senior', 'Lead'].map(level => (
                      <button 
                        key={level} 
                        onClick={() => setExperienceLevel(level)}
                        className={`py-3 rounded-xl text-xs font-bold border transition-all ${experienceLevel === level ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20' : 'bg-background-dark text-text-secondary border-border-dark hover:text-white'}`}
                      >
                        {level}
                      </button>
                    ))}
                 </div>
              </div>

              <div className="space-y-4 relative">
                 <div className="flex justify-between items-center">
                    <label className="text-text-secondary text-[10px] font-black uppercase tracking-widest">Target Duration</label>
                    <span className="bg-primary/10 text-primary px-2 py-1 rounded text-[10px] font-black tracking-widest uppercase">
                       {duration} MIN {duration > 15 && !isPro ? '(LOCKED)' : ''}
                    </span>
                 </div>
                 <div className="relative pt-2">
                   <input 
                    type="range" 
                    className={`w-full h-1.5 bg-background-dark rounded-full appearance-none cursor-pointer accent-primary ${!isPro ? 'opacity-50' : ''}`} 
                    min="15" max="60" step="15" 
                    value={duration} 
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      if (!isPro && val > 15) {
                        setDuration(15);
                        // Optional: trigger tooltip
                      } else {
                        setDuration(val);
                      }
                    }}
                   />
                   {!isPro && (
                     <div className="mt-4 p-4 rounded-xl bg-primary/5 border border-primary/20 flex flex-col gap-2">
                        <div className="flex items-center gap-2 text-primary font-bold text-[10px] uppercase tracking-widest">
                           <span className="material-symbols-outlined text-sm">lock</span>
                           PRO FEATURE
                        </div>
                        <p className="text-text-secondary text-[11px] leading-tight">Free sessions are limited to 15 minutes. Upgrade to Pro for 60-minute deep dives.</p>
                        <button onClick={() => onNavigate(Screen.Subscription)} className="text-primary text-[10px] font-black uppercase tracking-widest hover:underline text-left mt-1">Upgrade to Unlock</button>
                     </div>
                   )}
                 </div>
              </div>

              <div className="pt-4">
                <button 
                  onClick={handleGenerate}
                  disabled={!jd.trim() || isGenerating}
                  className={`w-full py-5 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-all ${!jd.trim() || isGenerating ? 'bg-background-dark text-text-secondary opacity-50 cursor-not-allowed' : 'bg-primary text-white shadow-2xl shadow-primary/40 hover:translate-y-[-2px] active:scale-[0.98]'}`}
                >
                  {isGenerating ? <span className="material-symbols-outlined animate-spin text-xl">refresh</span> : <span className="material-symbols-outlined">bolt</span>}
                  {isGenerating ? 'Analyzing...' : 'Start Session'}
                </button>
              </div>
           </div>
        </div>
      </main>
      <style>{`.custom-scrollbar::-webkit-scrollbar { width: 4px; } .custom-scrollbar::-webkit-scrollbar-thumb { background: #3c4253; border-radius: 10px; }`}</style>
    </div>
  );
};

export default JDSetupScreen;
