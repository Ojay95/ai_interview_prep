
import React, { useEffect, useState } from 'react';
import { Screen, User } from '../types';
import { GoogleGenAI } from '@google/genai';
import { cleanJsonString } from '../services/geminiService';

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
    const savedRole = localStorage.getItem('last_interview_role') || 'Professional Role';
    setRole(savedRole);
    
    if (rawTranscript) {
      generateAnalysis(JSON.parse(rawTranscript), savedRole);
    } else {
      setIsLoading(false);
    }
  }, []);

  const generateAnalysis = async (transcript: any[], targetRole: string) => {
    try {
      // Fix: Use process.env.API_KEY directly for initialization.
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const chatHistory = transcript.map(m => `${m.sender}: ${m.text}`).join('\n');

      const prompt = `Act as an expert interview coach. Analyze this transcript for a ${targetRole} role and provide a comprehensive report in JSON format.
      
      TRANSCRIPT:
      ${chatHistory}

      REQUIREMENTS:
      1. Calculate overallScore (0-100).
      2. PerformanceTag: e.g. "Excellent", "Good", "Fair".
      3. detailedAnalysis: For each major question Sarah asked, provide:
         - question: Sarah's prompt
         - userTranscript: A summary of what the user actually said
         - answerStatus: Evaluation tag
         - critique: Brief constructive feedback
         - improvedAnswer: A high-tier version using STAR method.
      
      JSON SCHEMA:
      {
        "overallScore": number,
        "performanceTag": "Excellent" | "Good" | "Needs Improvement",
        "summary": "1-2 sentence overall impression",
        "keyStrengths": ["Strength 1", "Strength 2", "Strength 3"],
        "growthAreas": ["Area 1", "Area 2"],
        "scoreBreakdown": [
          { "label": "Technical Knowledge", "value": number },
          { "label": "Cultural Fit", "value": number },
          { "label": "Problem Solving", "value": number },
          { "label": "Communication Skills", "value": number },
          { "label": "Confidence & Clarity", "value": number }
        ],
        "detailedAnalysis": [
          {
            "question": "string",
            "userTranscript": "string",
            "answerStatus": "Strong Answer" | "Average Answer" | "Lacks Detail",
            "statusColor": "green" | "amber" | "red",
            "critique": "string",
            "improvedAnswer": "string"
          }
        ]
      }`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: { responseMimeType: 'application/json' }
      });

      const data = JSON.parse(cleanJsonString(response.text));
      setAnalysis(data);
    } catch (err) {
      console.error(err);
      // Fallback for demo
      setAnalysis({
        overallScore: 75,
        performanceTag: "Good",
        summary: "Solid performance, but technical depth could be improved.",
        keyStrengths: ["Clear Communication", "Positive Attitude"],
        growthAreas: ["STAR Method Implementation"],
        scoreBreakdown: [{label: "Communication", value: 80}],
        detailedAnalysis: []
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="h-screen w-full bg-[#0d1117] flex flex-col items-center justify-center gap-8">
         <div className="size-20 bg-primary/10 rounded-3xl flex items-center justify-center border border-primary/20">
            <span className="material-symbols-outlined text-primary text-5xl animate-spin">analytics</span>
         </div>
         <h2 className="text-white text-2xl font-black">Generating Your Report...</h2>
      </div>
    );
  }

  if (!analysis) return null;

  return (
    <div className="min-h-screen bg-[#0d1117] text-white p-6 lg:p-12 font-display overflow-y-auto custom-scrollbar">
      {/* Header Section */}
      <header className="flex items-center justify-between mb-12 border-b border-white/5 pb-10">
         <div className="flex items-center gap-3">
            <div className="size-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
               <span className="material-symbols-outlined text-white">graphic_eq</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight">AI Mock Interviewer</h1>
         </div>
         <nav className="flex items-center gap-8 text-sm font-bold text-text-secondary">
            <button onClick={() => onNavigate(Screen.Dashboard)}>Dashboard</button>
            <button>Practice</button>
            <button>History</button>
            <button>Profile</button>
            <div className="size-10 rounded-full bg-slate-700 border border-white/10"></div>
         </nav>
      </header>

      <div className="max-w-[1400px] mx-auto">
         <div className="flex items-end justify-between mb-12">
            <div>
               <p className="text-[10px] font-black text-text-secondary uppercase tracking-[0.3em] mb-3 opacity-60">Session ID: #{(Math.random()*10000).toFixed(0)} • Completed just now</p>
               <h2 className="text-5xl lg:text-6xl font-black tracking-tighter">
                  Interview Analysis: <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500">{role}</span>
               </h2>
            </div>
            <div className="flex gap-4">
               <button className="flex items-center gap-2 px-6 py-4 rounded-xl bg-white/5 border border-white/10 text-white font-bold text-sm hover:bg-white/10 transition-all">
                  <span className="material-symbols-outlined text-lg">download</span>
                  Save Report
               </button>
               <button onClick={() => onNavigate(Screen.JDSetup)} className="flex items-center gap-2 px-6 py-4 rounded-xl bg-primary hover:bg-primary-hover text-white font-bold text-sm shadow-xl shadow-primary/20 transition-all">
                  <span className="material-symbols-outlined text-lg">refresh</span>
                  Retry Interview
               </button>
            </div>
         </div>

         <div className="grid grid-cols-12 gap-8 mb-12 items-start">
            {/* Sidebar Cards - Sticky Wrapper */}
            <div className="col-span-12 lg:col-span-4 space-y-8 sticky top-8">
               {/* Overall Performance Card */}
               <div className="bg-[#161b22] rounded-[48px] border border-white/5 p-12 flex flex-col items-center text-center shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 -mt-20 -mr-20 size-64 bg-primary/5 rounded-full blur-[100px]"></div>
                  <p className="text-text-secondary text-[10px] font-black uppercase tracking-[0.3em] mb-12 opacity-50">Overall Performance</p>
                  
                  <div className="relative size-64 mb-10 flex items-center justify-center">
                     <svg className="size-full transform -rotate-90" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="45" fill="none" stroke="#0d1117" strokeWidth="6" />
                        <circle 
                          cx="50" cy="50" r="45" fill="none" stroke="url(#gradient)" strokeWidth="6" 
                          strokeDasharray="283" 
                          strokeDashoffset={283 - (283 * analysis.overallScore) / 100} 
                          strokeLinecap="round" 
                        />
                        <defs>
                          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                             <stop offset="0%" stopColor="#f59e0b" />
                             <stop offset="100%" stopColor="#ef4444" />
                          </linearGradient>
                        </defs>
                     </svg>
                     <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-8xl font-black text-white tracking-tighter">{analysis.overallScore}</span>
                        <span className="text-sm font-bold text-text-secondary mt-[-10px]">/ 100</span>
                     </div>
                  </div>

                  <div className="mb-10">
                     <span className="px-5 py-2.5 rounded-full bg-orange-500/10 text-orange-400 text-[10px] font-black uppercase tracking-widest border border-orange-500/20">
                        🏆 {analysis.performanceTag}
                     </span>
                  </div>
                  
                  <p className="text-gray-400 text-sm leading-relaxed font-medium">
                     "{analysis.summary}"
                  </p>
               </div>

               {/* Score Breakdown Card */}
               <div className="bg-[#161b22] rounded-[48px] border border-white/5 p-12 shadow-2xl space-y-8">
                  <div className="flex justify-between items-center mb-4">
                     <h3 className="text-lg font-bold">Score Breakdown</h3>
                     <span className="material-symbols-outlined text-text-secondary opacity-40">info</span>
                  </div>
                  <div className="space-y-8">
                     {analysis.scoreBreakdown.map((s, i) => (
                        <div key={i} className="space-y-4">
                           <div className="flex justify-between text-[11px] font-black uppercase tracking-widest">
                              <span className="text-text-secondary">{s.label}</span>
                              <span className="text-orange-400">{s.value}%</span>
                           </div>
                           <div className="h-2 w-full bg-[#0d1117] rounded-full overflow-hidden border border-white/5">
                              <div className="h-full bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full" style={{ width: `${s.value}%` }}></div>
                           </div>
                        </div>
                     ))}
                  </div>
               </div>
            </div>

            {/* Main Analysis Content */}
            <div className="col-span-12 lg:col-span-8 space-y-8">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Strengths Card */}
                  <div className="bg-[#161b22] rounded-[48px] border border-white/5 p-10 shadow-2xl">
                     <div className="flex items-center gap-4 mb-10">
                        <div className="size-12 bg-green-500/10 text-green-500 rounded-2xl flex items-center justify-center border border-green-500/20">
                           <span className="material-symbols-outlined">thumb_up</span>
                        </div>
                        <h3 className="text-xl font-black tracking-tight">Key Strengths</h3>
                     </div>
                     <ul className="space-y-8">
                        {analysis.keyStrengths.map((s, i) => (
                           <li key={i} className="flex gap-5 items-start">
                              <span className="material-symbols-outlined text-green-500 text-xl pt-1">check_circle</span>
                              <p className="text-gray-300 text-sm leading-relaxed font-medium">{s}</p>
                           </li>
                        ))}
                     </ul>
                  </div>

                  {/* Areas for Improvement Card */}
                  <div className="bg-[#161b22] rounded-[48px] border border-white/5 p-10 shadow-2xl">
                     <div className="flex items-center gap-4 mb-10">
                        <div className="size-12 bg-orange-500/10 text-orange-400 rounded-2xl flex items-center justify-center border border-orange-500/20">
                           <span className="material-symbols-outlined">trending_up</span>
                        </div>
                        <h3 className="text-xl font-black tracking-tight">Areas for Improvement</h3>
                     </div>
                     <ul className="space-y-8">
                        {analysis.growthAreas.map((g, i) => (
                           <li key={i} className="flex gap-5 items-start">
                              <span className="material-symbols-outlined text-orange-400 text-xl pt-1">arrow_upward</span>
                              <p className="text-gray-300 text-sm leading-relaxed font-medium">{g}</p>
                           </li>
                        ))}
                     </ul>
                  </div>
               </div>

               {/* Detailed Question Analysis Section */}
               <div className="space-y-10">
                  <h3 className="text-2xl font-black tracking-tighter flex items-center gap-6">
                     Detailed Question Analysis
                     <div className="h-px flex-1 bg-white/5"></div>
                  </h3>

                  {analysis.detailedAnalysis.map((qa, i) => (
                     <div key={i} className="bg-[#161b22] rounded-[48px] border border-white/5 overflow-hidden shadow-2xl">
                        <header className="p-10 border-b border-white/5 flex items-center justify-between">
                           <div className="flex items-center gap-6">
                              <div className="size-12 bg-black/40 rounded-2xl flex items-center justify-center text-text-secondary font-black text-xs border border-white/5">Q{i+1}</div>
                              <h4 className="text-xl font-bold tracking-tight text-white leading-tight">"{qa.question}"</h4>
                           </div>
                           <div className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border flex items-center gap-2 ${qa.statusColor === 'green' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
                              <span className="material-symbols-outlined text-xs">star</span>
                              {qa.answerStatus}
                           </div>
                        </header>
                        
                        <div className="p-10 space-y-10">
                           <div className="space-y-4">
                              <div className="flex justify-between items-center">
                                 <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest opacity-60">Your Transcript</p>
                                 <button className="flex items-center gap-2 text-[10px] font-black text-primary uppercase tracking-widest">
                                    <span className="material-symbols-outlined text-sm">play_circle</span>
                                    Play Audio
                                 </button>
                              </div>
                              <div className="p-8 rounded-3xl bg-black/20 border-l-4 border-primary text-gray-400 italic text-base leading-relaxed">
                                 "{qa.userTranscript || '[No response recorded in transcript]'}"
                              </div>
                           </div>

                           <div className="bg-[#1c212b] rounded-[32px] p-8 border border-white/5 space-y-6">
                              <div className="flex items-center gap-4">
                                 <div className="size-10 bg-primary/20 text-primary rounded-2xl flex items-center justify-center">
                                    <span className="material-symbols-outlined text-xl">smart_toy</span>
                                 </div>
                                 <h5 className="font-bold text-sm">AI Coach Suggestion</h5>
                              </div>
                              <p className="text-gray-300 text-sm leading-relaxed">
                                 <span className="text-primary font-bold">Critique:</span> {qa.critique}
                              </p>
                              <div className="p-6 rounded-2xl bg-black/40 border border-white/5 text-gray-400 text-sm italic leading-relaxed">
                                 {qa.improvedAnswer}
                              </div>
                           </div>
                        </div>
                     </div>
                  ))}
               </div>
            </div>
         </div>
      </div>
      <style>{`.custom-scrollbar::-webkit-scrollbar { width: 4px; } .custom-scrollbar::-webkit-scrollbar-thumb { background: #3c4253; border-radius: 10px; }`}</style>
    </div>
  );
};

export default AnalysisScreen;
