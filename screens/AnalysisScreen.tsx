
import React, { useEffect, useState } from 'react';
import { Screen, User, VisualMetrics } from '../types';
import { GoogleGenAI } from '@google/genai';
import { cleanJsonString } from '../services/geminiService';
import { jsPDF } from 'jspdf';
import { Logo } from '../constants';

interface DetailedCritique {
  question: string;
  userTranscript: string;
  answerStatus: 'Strong Answer' | 'Average Answer' | 'Weak' | 'Lacks Detail';
  statusColor: string;
  critique: string;
  improvedAnswer: string;
}

interface AnalysisData {
  overallScore: number;
  performanceTag: string;
  summary: string;
  keyStrengths: string[];
  growthAreas: string[];
  detailedAnalysis: DetailedCritique[];
  scoreBreakdown: { label: string; value: number }[];
  visualMetrics: VisualMetrics;
}

interface AnalysisScreenProps {
  user: User | null;
  onNavigate: (screen: Screen) => void;
}

const AnalysisScreen: React.FC<AnalysisScreenProps> = ({ user, onNavigate }) => {
  const [analysis, setAnalysis] = useState<AnalysisData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [role, setRole] = useState('');

  useEffect(() => {
    const rawTranscript = localStorage.getItem('last_interview_transcript');
    const savedRole = localStorage.getItem('last_interview_role') || 'Junior Frontend Developer';
    setRole(savedRole);
    if (rawTranscript) {
      generateAnalysis(JSON.parse(rawTranscript), savedRole);
    } else {
      setIsLoading(false);
    }
  }, []);

  const generateAnalysis = async (transcript: any[], targetRole: string) => {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const chatHistory = transcript.map(m => `${m.sender}: ${m.text}`).join('\n');
      
      const prompt = `Act as an expert interview coach. Analyze the PROVIDED transcript for a ${targetRole} role.
      Analyze ONLY the questions and answers that appear in the transcript.
      Return JSON exactly in this format:
      {
        "overallScore": number (0-100),
        "performanceTag": "Excellent" | "Professional" | "Needs Improvement",
        "summary": "string (1-2 sentence summary)",
        "keyStrengths": ["string"],
        "growthAreas": ["string"],
        "scoreBreakdown": [
           {"label": "Technical Knowledge", "value": number},
           {"label": "Cultural Fit", "value": number},
           {"label": "Problem Solving", "value": number},
           {"label": "Communication Skills", "value": number},
           {"label": "Confidence & Clarity", "value": number}
        ],
        "visualMetrics": {
           "eyeContactScore": number,
           "postureScore": number,
           "energyLevel": "High" | "Medium" | "Low",
           "visualFeedback": "string"
        },
        "detailedAnalysis": [
          {
            "question": "string",
            "userTranscript": "string",
            "answerStatus": "Strong Answer" | "Average Answer" | "Weak" | "Lacks Detail",
            "statusColor": "green" | "amber" | "red",
            "critique": "string",
            "improvedAnswer": "string"
          }
        ]
      }

      TRANSCRIPT:
      ---
      ${chatHistory}
      ---`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: { responseMimeType: 'application/json', temperature: 0.1 }
      });

      const data = JSON.parse(cleanJsonString(response.text));
      setAnalysis(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadReport = () => {
    if (!analysis) return;
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text(`Interview Analysis: ${role}`, 20, 20);
    doc.setFontSize(12);
    doc.text(`Overall Score: ${analysis.overallScore}/100`, 20, 35);
    doc.text(analysis.summary, 20, 45, { maxWidth: 170 });
    doc.save(`Analysis_${role.replace(/\s+/g, '_')}.pdf`);
  };

  if (isLoading) return (
    <div className="h-screen w-full bg-[#0f111a] flex flex-col items-center justify-center text-white">
       <div className="size-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
       <p className="text-sm font-black uppercase tracking-widest animate-pulse">Analyzing Performance...</p>
    </div>
  );

  if (!analysis) return null;

  return (
    <div className="min-h-screen bg-[#0f111a] text-white font-display pb-20 overflow-x-hidden">
      {/* Top Navigation */}
      <nav className="flex items-center justify-between px-6 lg:px-12 py-4 bg-[#111521] border-b border-white/5 sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <Logo className="size-8" />
          <span className="text-lg font-bold">AI Mock Interviewer</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm font-bold text-text-secondary">
          <button onClick={() => onNavigate(Screen.Dashboard)} className="hover:text-white transition-all">Dashboard</button>
          <button onClick={() => onNavigate(Screen.JDSetup)} className="hover:text-white transition-all">Practice</button>
          <button className="hover:text-white transition-all">History</button>
          <button className="hover:text-white transition-all">Profile</button>
          <div className="size-9 rounded-full bg-slate-700 border border-white/10 overflow-hidden">
            <img src={`https://i.pravatar.cc/150?u=${user?.id}`} alt="User" />
          </div>
        </div>
      </nav>

      <main className="max-w-[1400px] mx-auto px-6 mt-10 space-y-10">
        {/* Title Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-text-secondary text-[10px] font-bold uppercase tracking-widest opacity-60">
               <span className="material-symbols-outlined text-sm">calendar_today</span>
               Session ID: #8392 • Completed just now
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight">Interview Analysis: {role}</h1>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={handleDownloadReport} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs font-bold hover:bg-white/10 transition-all">
              <span className="material-symbols-outlined text-lg">download</span> Save Report
            </button>
            <button onClick={() => onNavigate(Screen.JDSetup)} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary-hover shadow-lg shadow-primary/20 transition-all">
              <span className="material-symbols-outlined text-lg">refresh</span> Retry Interview
            </button>
          </div>
        </div>

        {/* Top Section Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column (1/3 Width on Desktop) */}
          <div className="lg:col-span-4 flex flex-col gap-6 h-full">
            <div className="bg-[#1c212b] rounded-2xl border border-white/5 p-8 flex flex-col items-center text-center shadow-xl h-full">
               <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary mb-8 opacity-60">Overall Performance</h3>
               <div className="relative size-44 flex items-center justify-center mb-8">
                  <svg className="size-full transform -rotate-90" viewBox="0 0 100 100">
                     <circle cx="50" cy="50" r="45" fill="none" stroke="#0d111a" strokeWidth="8" />
                     <circle 
                        cx="50" cy="50" r="45" fill="none" stroke="url(#scoreGrad)" strokeWidth="8" 
                        strokeDasharray="283" strokeDashoffset={283 - (283 * (analysis?.overallScore || 0)) / 100} 
                        strokeLinecap="round" 
                     />
                     <defs>
                        <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                           <stop offset="0%" stopColor="#f59e0b" />
                           <stop offset="100%" stopColor="#fbbf24" />
                        </linearGradient>
                     </defs>
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                     <span className="text-5xl font-black tabular-nums">{analysis?.overallScore}</span>
                     <span className="text-sm font-bold text-text-secondary opacity-40">/ 100</span>
                  </div>
               </div>
               <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20 text-xs font-bold mb-6">
                  <span className="material-symbols-outlined text-sm">emoji_events</span>
                  {analysis?.performanceTag}
               </div>
               <p className="text-xs text-text-secondary leading-relaxed max-w-xs font-medium italic">
                  "{analysis?.summary}"
               </p>
            </div>

            <div className="bg-[#1c212b] rounded-2xl border border-white/5 p-8 shadow-xl">
               <div className="flex items-center justify-between mb-8">
                  <h3 className="text-sm font-black uppercase tracking-widest text-white">Score Breakdown</h3>
                  <span className="material-symbols-outlined text-text-secondary text-sm">info</span>
               </div>
               <div className="space-y-6">
                  {analysis?.scoreBreakdown.map((s, i) => (
                    <div key={i} className="space-y-2">
                       <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                          <span className="text-text-secondary">{s.label}</span>
                          <span className="text-amber-500">{s.value}%</span>
                       </div>
                       <div className="h-1.5 w-full bg-black/40 rounded-full overflow-hidden">
                          <div className="h-full bg-amber-500 transition-all duration-1000" style={{ width: `${s.value}%` }}></div>
                       </div>
                    </div>
                  ))}
               </div>
            </div>
          </div>

          {/* Right Column (2/3 Width on Desktop) */}
          <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
            {/* Key Strengths */}
            <div className="bg-[#1c212b] rounded-2xl border border-white/5 p-8 shadow-xl flex flex-col">
               <div className="flex items-center gap-4 mb-6">
                  <div className="size-10 rounded-xl bg-green-500/10 flex items-center justify-center text-green-500">
                     <span className="material-symbols-outlined">thumb_up</span>
                  </div>
                  <h3 className="text-sm font-black uppercase tracking-widest">Key Strengths</h3>
               </div>
               <ul className="space-y-6 flex-1">
                  {analysis?.keyStrengths.map((s, i) => (
                    <li key={i} className="flex gap-4 items-start">
                       <span className="material-symbols-outlined text-green-500 text-lg shrink-0">check_circle</span>
                       <p className="text-xs text-text-secondary font-medium leading-relaxed" dangerouslySetInnerHTML={{ __html: s.replace(/"(.*?)"/g, '<strong>"$1"</strong>') }} />
                    </li>
                  ))}
               </ul>
            </div>

            {/* Areas for Improvement */}
            <div className="bg-[#1c212b] rounded-2xl border border-white/5 p-8 shadow-xl flex flex-col">
               <div className="flex items-center gap-4 mb-6">
                  <div className="size-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                     <span className="material-symbols-outlined">analytics</span>
                  </div>
                  <h3 className="text-sm font-black uppercase tracking-widest">Areas for Improvement</h3>
               </div>
               <ul className="space-y-6 flex-1">
                  {analysis?.growthAreas.map((s, i) => (
                    <li key={i} className="flex gap-4 items-start">
                       <span className="material-symbols-outlined text-amber-500 text-lg shrink-0">arrow_upward</span>
                       <p className="text-xs text-text-secondary font-medium leading-relaxed" dangerouslySetInnerHTML={{ __html: s.replace(/"(.*?)"/g, '<strong>"$1"</strong>') }} />
                    </li>
                  ))}
               </ul>
            </div>

            {/* Visual Presence Analysis Card */}
            <div className="md:col-span-2 bg-[#1c212b] rounded-2xl border border-white/5 p-8 shadow-xl flex flex-col md:flex-row gap-8 items-center">
               <div className="flex items-center gap-4 shrink-0">
                  <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                     <span className="material-symbols-outlined text-2xl">visibility</span>
                  </div>
                  <div>
                    <h3 className="text-sm font-black uppercase tracking-widest">Visual Presence</h3>
                    <p className="text-[10px] text-text-secondary font-bold uppercase mt-1">Eye Contact & Posture</p>
                  </div>
               </div>
               <div className="h-px md:h-12 w-full md:w-px bg-white/10"></div>
               <div className="flex-1 grid grid-cols-3 gap-6 w-full">
                  <div className="text-center">
                     <div className="text-xl font-black">{analysis.visualMetrics.eyeContactScore}%</div>
                     <div className="text-[9px] font-black text-text-secondary uppercase">Eye Contact</div>
                  </div>
                  <div className="text-center">
                     <div className="text-xl font-black">{analysis.visualMetrics.postureScore}%</div>
                     <div className="text-[9px] font-black text-text-secondary uppercase">Posture</div>
                  </div>
                  <div className="text-center">
                     <div className="text-xl font-black text-primary">{analysis.visualMetrics.energyLevel}</div>
                     <div className="text-[9px] font-black text-text-secondary uppercase">Energy</div>
                  </div>
               </div>
               <p className="text-[10px] text-text-secondary italic leading-relaxed md:max-w-xs">{analysis.visualMetrics.visualFeedback}</p>
            </div>
          </div>
        </div>

        {/* Detailed Question Analysis Section */}
        <div className="pt-10 border-t border-white/5">
           <h2 className="text-2xl font-black tracking-tight mb-8">Detailed Question Analysis</h2>
           
           {/* TWO COLUMN GRID ON DESKTOP - Eliminates empty space */}
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {analysis?.detailedAnalysis.map((qa, i) => (
                <div key={i} className="bg-[#1c212b] rounded-[32px] border border-white/5 overflow-hidden shadow-2xl w-full flex flex-col h-full">
                   <div className="px-8 py-5 bg-black/20 border-b border-white/5 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                         <div className="size-9 rounded-xl bg-black/40 border border-white/10 flex items-center justify-center text-[10px] font-black text-text-secondary shrink-0">
                            Q{i+1}
                         </div>
                         <h3 className="text-sm md:text-base font-bold line-clamp-1">"{qa.question}"</h3>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border flex items-center gap-2 whitespace-nowrap shrink-0 ${
                        qa.answerStatus === 'Strong Answer' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 
                        qa.answerStatus === 'Average Answer' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 
                        'bg-red-500/10 text-red-500 border-red-500/20'
                      }`}>
                         <span className="size-1 rounded-full bg-current"></span>
                         {qa.answerStatus}
                      </div>
                   </div>

                   <div className="p-8 space-y-8 flex-1">
                      {/* Your Transcript */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                           <h4 className="text-[9px] font-black uppercase tracking-[0.2em] text-text-secondary opacity-40">Your Transcript</h4>
                           <button className="flex items-center gap-2 text-primary text-[9px] font-black uppercase tracking-widest hover:underline shrink-0">
                              <span className="material-symbols-outlined text-base">play_circle</span>
                              Play Audio
                           </button>
                        </div>
                        <div className="border-l-[3px] border-primary pl-6 py-1">
                           <p className="text-xs md:text-sm text-gray-300 leading-relaxed italic">
                              "{qa.userTranscript}"
                           </p>
                        </div>
                      </div>

                      {/* AI Coach Suggestion - Fixed Icon Fragment */}
                      <div className="bg-[#1e2536] rounded-[24px] p-6 space-y-4 border border-primary/10 relative overflow-hidden flex-1">
                        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                           <span className="material-symbols-outlined text-5xl">psychology</span>
                        </div>
                        
                        <div className="flex items-center gap-3">
                           {/* size-8 flex-none prevents fragmentation and clipping */}
                           <div className="size-8 rounded-lg bg-primary flex flex-none items-center justify-center text-white shadow-lg shadow-primary/20">
                              <span className="material-symbols-outlined text-sm leading-none">sparkles</span>
                           </div>
                           <h4 className="text-[9px] font-black uppercase tracking-widest">AI Coach Suggestion</h4>
                        </div>

                        <div className="space-y-4">
                           <p className="text-xs text-gray-300 leading-relaxed">
                              <strong className="text-primary font-black uppercase text-[10px] tracking-wider mr-2">Critique:</strong> 
                              {qa.critique}
                           </p>
                           
                           <div className="bg-[#161b22] border border-white/5 rounded-2xl p-5 md:p-6 mt-4">
                              <p className="text-[11px] md:text-xs text-gray-400 leading-relaxed italic">
                                 "{qa.improvedAnswer}"
                              </p>
                           </div>
                        </div>
                      </div>
                   </div>
                </div>
              ))}
           </div>
        </div>
      </main>
      <style>{`.custom-scrollbar::-webkit-scrollbar { width: 4px; } .custom-scrollbar::-webkit-scrollbar-thumb { background: #3c4253; border-radius: 10px; }`}</style>
    </div>
  );
};

export default AnalysisScreen;
