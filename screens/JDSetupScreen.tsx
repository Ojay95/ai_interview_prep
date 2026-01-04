
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
  const isElite = user?.plan === 'elite';
  const isProOrElite = isPro || isElite;
  
  // New limits: Basic 10, Pro 45, Elite 60
  const maxDuration = isElite ? 60 : isPro ? 45 : 10;
  const [duration, setDuration] = useState(Math.min(10, maxDuration));

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
      
      const today = new Date().toDateString();
      const usage = JSON.parse(localStorage.getItem(`usage_${user?.id}`) || '{"count": 0, "date": ""}');
      usage.count += 1;
      usage.date = today;
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
    <div className="flex flex-col h-screen bg-[#0f111a] text-white">
      <header className="sticky top-0 z-50 flex items-center justify-between border-b border-white/5 bg-[#0f111a]/95 backdrop-blur-md px-6 lg:px-10 py-4">
        <div className="flex items-center gap-3 lg:gap-4">
          <Logo className="size-8" />
          <h2 className="text-base lg:text-lg font-bold">Configure Session</h2>
        </div>
        <button onClick={() => onNavigate(Screen.Dashboard)} className="text-text-secondary hover:text-white transition-colors size-10 rounded-xl hover:bg-white/5 flex items-center justify-center">
          <span className="material-symbols-outlined">close</span>
        </button>
      </header>

      <main className="max-w-7xl mx-auto w-full px-4 lg:px-10 py-6 lg:py-10 flex flex-col lg:grid lg:grid-cols-12 gap-8 lg:gap-10 overflow-y-auto custom-scrollbar">
        <div className="lg:col-span-8 flex flex-col gap-6 lg:gap-8">
           <div className="space-y-4">
              <div className="flex items-center gap-2 text-primary text-[10px] font-black uppercase tracking-[0.2em]">
                 <span className="material-symbols-outlined text-sm">psychology</span>
                 <span>Analysis Engine Active</span>
              </div>
              <h1 className="text-3xl lg:text-5xl font-black tracking-tight leading-tight">Target Role Specification</h1>
              <p className="text-text-secondary text-sm lg:text-lg font-medium leading-relaxed opacity-80">
                 Paste requirements. Sarah will tailor her personality and technical probes to this specific job profile.
              </p>
           </div>

           <div className="relative group">
              <div className="absolute top-6 left-6 flex items-center gap-2 text-text-secondary pointer-events-none group-focus-within:text-primary transition-colors">
                 <span className="material-symbols-outlined text-sm">description</span>
                 <span className="text-[10px] font-black uppercase tracking-widest">Job Description / Specs</span>
              </div>
              <textarea 
                className="w-full h-[300px] lg:h-[450px] rounded-[32px] bg-[#1c212b] border border-white/5 focus:border-primary focus:ring-1 focus:ring-primary text-white p-6 lg:p-8 pt-16 text-sm lg:text-lg placeholder:text-text-secondary/20 resize-none transition-all shadow-2xl"
                placeholder="Example: Senior Full Stack Engineer. Mastery of Node.js and React required. Focus on scalability and security..."
                value={jd}
                onChange={(e) => setJd(e.target.value)}
              />
           </div>
        </div>

        <div className="lg:col-span-4">
           <div className="bg-[#1c212b] rounded-[32px] border border-white/5 p-6 lg:p-8 flex flex-col gap-8 shadow-2xl relative overflow-hidden">
              <div className="flex items-center gap-3 border-b border-white/5 pb-6">
                 <span className="material-symbols-outlined text-primary">tune</span>
                 <h2 className="text-white text-base lg:text-lg font-bold">Calibration</h2>
              </div>

              <div className="space-y-4">
                 <label className="text-text-secondary text-[10px] font-black uppercase tracking-widest">Difficulty Level</label>
                 <div className="grid grid-cols-2 gap-2">
                    {['Junior', 'Mid', 'Senior', 'Lead'].map(level => (
                      <button 
                        key={level} 
                        onClick={() => setExperienceLevel(level)}
                        className={`py-3 rounded-xl text-xs font-bold border transition-all ${experienceLevel === level ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20' : 'bg-[#0f111a] text-text-secondary border-white/5 hover:text-white'}`}
                      >
                        {level}
                      </button>
                    ))}
                 </div>
              </div>

              <div className="space-y-4">
                 <div className="flex justify-between items-center">
                    <label className="text-text-secondary text-[10px] font-black uppercase tracking-widest">Duration</label>
                    <span className={`px-2 py-1 rounded text-[10px] font-black tracking-widest uppercase ${!isProOrElite && duration > 10 ? 'bg-orange-500/10 text-orange-500' : 'bg-primary/10 text-primary'}`}>
                       {duration} MIN {(!isProOrElite && duration > 10) ? 'LOCKED' : ''}
                    </span>
                 </div>
                 <div className="relative pt-2">
                   <input 
                    type="range" 
                    className={`w-full h-1.5 bg-[#0f111a] rounded-full appearance-none cursor-pointer accent-primary ${!isProOrElite && duration > 10 ? 'opacity-50' : ''}`} 
                    min="5" max={maxDuration} step="5" 
                    value={duration} 
                    onChange={(e) => setDuration(parseInt(e.target.value))}
                   />
                   {!isProOrElite && (
                     <div className="mt-4 p-4 rounded-xl bg-orange-500/5 border border-orange-500/10 flex flex-col gap-2">
                        <div className="flex items-center gap-2 text-orange-500 font-bold text-[10px] uppercase tracking-widest">
                           <span className="material-symbols-outlined text-sm">lock</span>
                           Basic Tier Limit
                        </div>
                        <p className="text-text-secondary text-[10px] leading-relaxed">Basic sessions are limited to 10 mins. Upgrade for 45-60 min deep sessions.</p>
                        <button onClick={() => onNavigate(Screen.Subscription)} className="text-primary text-[10px] font-black uppercase tracking-widest hover:underline text-left">Upgrade to Pro</button>
                     </div>
                   )}
                 </div>
              </div>

              <div className="pt-4">
                <button 
                  onClick={handleGenerate}
                  disabled={!jd.trim() || isGenerating}
                  className={`w-full py-5 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-all ${!jd.trim() || isGenerating ? 'bg-[#0f111a] text-text-secondary opacity-50 cursor-not-allowed' : 'bg-primary text-white shadow-2xl shadow-primary/30 hover:translate-y-[-2px] active:scale-[0.98]'}`}
                >
                  {isGenerating ? <span className="material-symbols-outlined animate-spin text-xl">refresh</span> : <span className="material-symbols-outlined">bolt</span>}
                  {isGenerating ? 'Analyzing...' : 'Start Session'}
                </button>
              </div>
           </div>
        </div>
      </main>
    </div>
  );
};

export default JDSetupScreen;
