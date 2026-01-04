
import React, { useState, useEffect } from 'react';
import { Screen, User } from '../types';
import { Logo } from '../constants';
import { analyzeResumeMatch } from '../services/geminiService';

interface CVAnalysisScreenProps {
  user: User | null;
  onNavigate: (screen: Screen) => void;
}

const CVAnalysisScreen: React.FC<CVAnalysisScreenProps> = ({ user, onNavigate }) => {
  const [jd, setJd] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);

  // Default "Alex Developer" resume text for the analysis context
  const resumeContext = `
    Alex Developer - Senior Frontend Engineer
    Experienced Frontend Developer with 5+ years of expertise in building scalable web applications. 
    Proficient in React, JavaScript, and modern UI frameworks. 
    Proven track record of Team Leadership and delivering high-quality code.
    Skills: JavaScript (ES6+), HTML5, CSS3, React, Next.js, Tailwind CSS, Redux, Git, Webpack, Figma.
    Experience: Senior Frontend Developer at TechCorp Inc. (2020-Present).
  `;

  const handleAnalyze = async () => {
    if (!jd.trim()) return;
    setIsAnalyzing(true);
    try {
      const result = await analyzeResumeMatch(resumeContext, jd);
      setAnalysisResult(result);
    } catch (err) {
      console.error("Analysis failed:", err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const currentStats = analysisResult ? [
    { label: 'MATCH SCORE', value: `${analysisResult.matchScore}%`, sub: 'Calculated by AI', icon: 'trending_up', color: 'text-primary' },
    { label: 'KEYWORDS MATCHED', value: analysisResult.matchedKeywords?.length || 0, sub: 'Identified skills', icon: 'check_box', color: 'text-green-500' },
    { label: 'MISSING SKILLS', value: analysisResult.missingKeywords?.length || 0, sub: 'Gap Analysis', icon: 'warning', color: 'text-orange-500' }
  ] : [
    { label: 'MATCH SCORE', value: '--', sub: 'Paste JD to start', icon: 'trending_up', color: 'text-primary' },
    { label: 'KEYWORDS MATCHED', value: '0', sub: 'Ready to scan', icon: 'check_box', color: 'text-green-500' },
    { label: 'CRITICAL MISSING', value: '0', sub: 'Ready to scan', icon: 'warning', color: 'text-orange-500' }
  ];

  return (
    <div className="flex flex-col h-screen bg-[#0d111a] text-white font-display overflow-hidden">
      <header className="flex items-center justify-between px-4 lg:px-10 py-3 border-b border-white/5 bg-[#0d111a]/80 backdrop-blur-md shrink-0 z-50">
        <div className="flex items-center gap-4">
          <Logo className="size-8" />
          <h1 className="hidden md:block text-lg font-bold tracking-tight">MockInterview.ai</h1>
        </div>
        <nav className="flex items-center gap-4 md:gap-8 text-[10px] md:text-xs font-black uppercase tracking-widest text-text-secondary">
          <button onClick={() => onNavigate(Screen.Dashboard)} className="hover:text-white transition-all">Dashboard</button>
          <button className="text-white border-b-2 border-primary pb-1">CV Analysis</button>
          <button className="hidden sm:block hover:text-white transition-all">Job Tracker</button>
        </nav>
        <div className="size-8 rounded-full border border-white/10 overflow-hidden bg-slate-700">
           <img src={`https://i.pravatar.cc/150?u=${user?.id}`} alt="User" />
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 lg:p-10 custom-scrollbar space-y-6 md:space-y-10">
        <div className="max-w-[1400px] mx-auto space-y-8 md:space-y-12">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="space-y-2">
               <h2 className="text-3xl md:text-4xl font-black tracking-tight leading-tight">Job Match Analysis</h2>
               <p className="text-text-secondary text-sm md:text-base font-medium">Compare your CV against target descriptions to identify critical gaps.</p>
            </div>
            <div className="flex items-center gap-4 w-full md:w-auto">
               <button onClick={() => onNavigate(Screen.CVLanding)} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest">
                  <span className="material-symbols-outlined text-sm">upload</span> Update Resume
               </button>
               <button onClick={() => onNavigate(Screen.CVEditor)} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary text-white text-[10px] font-black uppercase tracking-widest shadow-xl shadow-primary/20">
                  <span className="material-symbols-outlined text-sm">edit</span> Edit Resume
               </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-12 gap-6 md:gap-8 items-start">
             <div className="xl:col-span-4 space-y-6">
                <div className="bg-[#1c212b] rounded-[32px] border border-white/5 p-6 md:p-8 space-y-6 shadow-2xl">
                   <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary opacity-60">
                      <span className="material-symbols-outlined text-sm">attachment</span> Current Resume
                   </div>
                   <div className="p-4 rounded-2xl bg-black/20 border border-white/5 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                         <span className="material-symbols-outlined text-primary">description</span>
                         <span className="text-xs font-bold truncate max-w-[150px]">Alex_Developer_CV.pdf</span>
                      </div>
                      <span className="material-symbols-outlined text-green-500 text-sm">check_circle</span>
                   </div>

                   <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary opacity-60 pt-4">
                      <span className="material-symbols-outlined text-sm">description</span> Target Job Description
                   </div>
                   <textarea 
                     className="w-full h-[250px] md:h-[350px] bg-black/40 border border-white/5 rounded-2xl p-4 text-xs md:text-sm text-text-secondary focus:border-primary focus:ring-0 resize-none transition-all"
                     placeholder="Paste the requirements of the job you want here..."
                     value={jd}
                     onChange={(e) => setJd(e.target.value)}
                   />
                   <button 
                     onClick={handleAnalyze}
                     disabled={!jd.trim() || isAnalyzing}
                     className="w-full py-4 rounded-2xl bg-primary text-white font-black uppercase tracking-widest text-[11px] shadow-xl shadow-primary/30 disabled:opacity-50 flex items-center justify-center gap-3"
                   >
                      {isAnalyzing ? <span className="material-symbols-outlined animate-spin">refresh</span> : <span className="material-symbols-outlined">bolt</span>}
                      {isAnalyzing ? 'Analyzing Alignment...' : 'Analyze Match'}
                   </button>
                </div>
             </div>

             <div className="xl:col-span-8 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                   {currentStats.map((s, i) => (
                      <div key={i} className="bg-[#1c212b] p-6 rounded-[28px] border border-white/5 shadow-xl space-y-4">
                         <div className="flex items-center justify-between">
                            <div className="size-8 rounded-lg bg-white/5 flex items-center justify-center text-primary">
                               <span className="material-symbols-outlined text-lg">{s.icon}</span>
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-text-secondary opacity-40">{s.label}</span>
                         </div>
                         <div>
                            <div className="text-2xl font-black">{s.value}</div>
                            <div className={`text-[10px] font-bold mt-1 ${s.color}`}>{s.sub}</div>
                         </div>
                      </div>
                   ))}
                </div>

                {analysisResult && (
                  <div className="bg-[#1c212b] rounded-[32px] border border-white/5 p-6 md:p-10 shadow-2xl space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                     <div className="flex flex-col md:flex-row gap-8 items-center border-b border-white/5 pb-10">
                        <div className="relative size-32 md:size-40 shrink-0">
                           <svg className="size-full transform -rotate-90" viewBox="0 0 100 100">
                              <circle cx="50" cy="50" r="45" fill="none" stroke="#0d111a" strokeWidth="8" />
                              <circle 
                                cx="50" cy="50" r="45" fill="none" stroke="#194ce6" strokeWidth="8" 
                                strokeDasharray="283" 
                                strokeDashoffset={283 - (283 * analysisResult.matchScore) / 100} 
                                strokeLinecap="round" 
                                className="transition-all duration-1000 ease-out"
                              />
                           </svg>
                           <div className="absolute inset-0 flex flex-col items-center justify-center">
                              <span className="text-2xl md:text-3xl font-black">{analysisResult.matchScore}%</span>
                              <span className="text-[10px] font-black uppercase tracking-widest text-text-secondary opacity-60">Score</span>
                           </div>
                        </div>
                        <div className="space-y-4 text-center md:text-left flex-1">
                           <h3 className="text-xl md:text-2xl font-black">AI Assessment</h3>
                           <p className="text-sm md:text-base text-text-secondary leading-relaxed">
                              {analysisResult.overallFeedback}
                           </p>
                        </div>
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-6">
                           <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-text-secondary flex items-center gap-2">
                              <span className="material-symbols-outlined text-sm text-orange-500">warning</span> Missing Keywords
                           </h4>
                           <div className="flex flex-wrap gap-2">
                              {analysisResult.missingKeywords?.map((k: any, i: number) => (
                                 <div key={i} className="px-3 py-1.5 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                                    {k.name} <span className="material-symbols-outlined text-xs">add</span>
                                 </div>
                              ))}
                              {(!analysisResult.missingKeywords || analysisResult.missingKeywords.length === 0) && (
                                <p className="text-xs text-text-secondary italic">No critical missing keywords found.</p>
                              )}
                           </div>
                        </div>
                        <div className="space-y-6">
                           <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-text-secondary flex items-center gap-2">
                              <span className="material-symbols-outlined text-sm text-green-500">check_circle</span> Matched Successfully
                           </h4>
                           <div className="flex flex-wrap gap-2">
                              {analysisResult.matchedKeywords?.map((k: string, i: number) => (
                                 <div key={i} className="px-3 py-1.5 rounded-lg bg-green-500/10 border border-green-500/20 text-green-500 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                                    {k} <span className="material-symbols-outlined text-xs">check</span>
                                 </div>
                              ))}
                           </div>
                        </div>
                     </div>

                     <div className="space-y-6 pt-10 border-t border-white/5">
                        <h4 className="text-lg font-black tracking-tight">AI Optimization Recommendations</h4>
                        <div className="space-y-4">
                           {analysisResult.recommendations?.map((rec: any, i: number) => (
                             <div key={i} className="bg-black/20 p-6 rounded-2xl border border-white/5 group hover:border-primary/30 transition-all">
                                <div className="flex items-center gap-4 mb-4">
                                   <div className={`size-10 rounded-xl flex items-center justify-center ${rec.impact === 'High' ? 'bg-primary/10 text-primary' : 'bg-white/5 text-text-secondary'}`}>
                                      <span className="material-symbols-outlined text-lg">edit_note</span>
                                   </div>
                                   <div>
                                      <h5 className="font-bold text-sm">{rec.title}</h5>
                                      <span className={`text-[9px] font-black uppercase tracking-widest ${rec.impact === 'High' ? 'text-primary' : 'text-text-secondary opacity-60'}`}>{rec.impact} Impact</span>
                                   </div>
                                </div>
                                <p className="text-xs text-text-secondary leading-relaxed mb-6">
                                   {rec.description}
                                </p>
                                <div className="p-4 rounded-xl bg-[#0d111a] border border-white/5 text-[11px] italic text-text-secondary">
                                   "{rec.suggestion}"
                                </div>
                             </div>
                           ))}
                        </div>
                     </div>
                  </div>
                )}
                
                {!analysisResult && !isAnalyzing && (
                  <div className="h-[500px] flex flex-col items-center justify-center text-center p-12 bg-[#1c212b] rounded-[32px] border border-white/5 border-dashed">
                     <div className="size-20 bg-white/5 rounded-full flex items-center justify-center mb-6">
                        <span className="material-symbols-outlined text-4xl text-text-secondary opacity-20">content_paste_search</span>
                     </div>
                     <h3 className="text-xl font-bold mb-2">Ready to scan</h3>
                     <p className="text-sm text-text-secondary max-w-sm">Paste a job description on the left to see how well your resume matches the requirements.</p>
                  </div>
                )}
             </div>
          </div>
        </div>
      </main>
      <style>{`.custom-scrollbar::-webkit-scrollbar { width: 4px; } .custom-scrollbar::-webkit-scrollbar-thumb { background: #3c4253; border-radius: 10px; }`}</style>
    </div>
  );
};

export default CVAnalysisScreen;
