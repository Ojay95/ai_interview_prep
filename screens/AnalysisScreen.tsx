import React, { useEffect, useState } from 'react';
import { Screen, User, VisualMetrics } from '../types';
import { jsPDF } from 'jspdf';
import { Logo } from '../constants';
import toast from 'react-hot-toast';

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
    visualMetrics?: VisualMetrics; // Made optional to handle backend variations safely
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
        // 1. Get the role configuration
        const savedRole = localStorage.getItem('last_interview_role') || 'Professional Role';
        setRole(savedRole);

        // 2. Load the analysis result that was generated and saved by Spring Boot
        //    via InterviewScreen.tsx POST request to /api/v1/interviews/analyze
        const savedAnalysis = localStorage.getItem('interview_analysis_result');

        if (savedAnalysis) {
            try {
                const parsedData: AnalysisData = JSON.parse(savedAnalysis);

                // Defensive check: If the Java backend didn't return visual metrics (since we removed the camera),
                // provide safe fallback data so the UI doesn't crash.
                if (!parsedData.visualMetrics) {
                    parsedData.visualMetrics = {
                        eyeContactScore: 100,
                        postureScore: 100,
                        energyLevel: "Medium",
                        visualFeedback: "Camera tracking was disabled for this text-based session."
                    };
                }

                setAnalysis(parsedData);
            } catch (err) {
                console.error("Failed to parse interview analysis:", err);
                toast.error("Failed to load interview results.");
            }
        } else {
            toast.error("No recent interview data found.");
            onNavigate(Screen.Dashboard);
        }

        setIsLoading(false);
    }, [onNavigate]);

    const handleDownloadReport = () => {
        if (!analysis) return;
        try {
            const doc = new jsPDF();
            doc.setFontSize(20);
            doc.text(`Interview Analysis: ${role}`, 20, 20);
            doc.text(`Score: ${analysis.overallScore}/100`, 20, 35);

            doc.setFontSize(12);
            doc.text(`Performance: ${analysis.performanceTag}`, 20, 50);

            // Basic text wrapping for summary
            const splitSummary = doc.splitTextToSize(analysis.summary, 170);
            doc.text(splitSummary, 20, 65);

            doc.save(`Analysis_${role.replace(/\s+/g, '_')}.pdf`);
            toast.success("Report downloaded successfully!");
        } catch (error) {
            console.error("PDF generation failed", error);
            toast.error("Failed to generate PDF report.");
        }
    };

    if (isLoading) return (
        <div className="h-screen w-full bg-[#0f111a] flex flex-col items-center justify-center text-white">
            <div className="size-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-sm font-black uppercase tracking-widest animate-pulse">Loading Results...</p>
        </div>
    );

    if (!analysis) return null;

    return (
        <div className="min-h-screen bg-[#0f111a] text-white font-display pb-20 overflow-x-hidden">
            <nav className="flex items-center justify-between px-6 lg:px-12 py-4 bg-[#111521] border-b border-white/5 sticky top-0 z-50">
                <div className="flex items-center gap-3" onClick={() => onNavigate(Screen.Dashboard)}>
                    <Logo className="size-8 cursor-pointer" />
                    <span className="text-lg font-bold cursor-pointer">MockInterview.ai</span>
                </div>
                <div className="flex items-center gap-8 text-sm font-bold text-text-secondary">
                    <button onClick={() => onNavigate(Screen.Dashboard)} className="hover:text-white transition-colors">Dashboard</button>
                    <button onClick={() => onNavigate(Screen.JDSetup)} className="hover:text-white transition-colors">Practice Again</button>
                    <div className="size-9 rounded-full bg-slate-700 overflow-hidden border border-white/10">
                        <img src={`https://i.pravatar.cc/150?u=${user?.id || 'default'}`} alt="User" />
                    </div>
                </div>
            </nav>

            <main className="max-w-[1400px] mx-auto px-6 mt-10 space-y-10">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-1">
                        <h1 className="text-2xl md:text-3xl font-black tracking-tight">Interview Analysis: {role}</h1>
                        <p className="text-text-secondary text-xs uppercase font-bold tracking-widest opacity-60">Session Completed</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button onClick={handleDownloadReport} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs font-bold hover:bg-white/10 transition-colors">
                            <span className="material-symbols-outlined text-lg">download</span> Save Report
                        </button>
                        <button onClick={() => onNavigate(Screen.JDSetup)} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-hover transition-colors text-white text-xs font-bold shadow-lg shadow-primary/20">
                            <span className="material-symbols-outlined text-lg">refresh</span> Retry Interview
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    <div className="lg:col-span-4 flex flex-col gap-6">
                        <div className="bg-[#1c212b] rounded-2xl border border-white/5 p-8 flex flex-col items-center text-center shadow-xl">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary mb-8 opacity-60">Overall Performance</h3>
                            <div className="relative size-44 flex items-center justify-center mb-8">
                                <svg className="size-full transform -rotate-90" viewBox="0 0 100 100">
                                    <circle cx="50" cy="50" r="45" fill="none" stroke="#0d111a" strokeWidth="8" />
                                    <circle
                                        cx="50" cy="50" r="45" fill="none" stroke="url(#scoreGrad)" strokeWidth="8"
                                        strokeDasharray="283" strokeDashoffset={283 - (283 * (analysis.overallScore || 0)) / 100}
                                        strokeLinecap="round"
                                        className="transition-all duration-1000 ease-out"
                                    />
                                    <defs>
                                        <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                                            <stop offset="0%" stopColor="#194ce6" />
                                            <stop offset="100%" stopColor="#3b82f6" />
                                        </linearGradient>
                                    </defs>
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-5xl font-black tabular-nums">{analysis.overallScore}</span>
                                    <span className="text-sm font-bold text-text-secondary opacity-40">/ 100</span>
                                </div>
                            </div>
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-bold mb-6">
                                {analysis.performanceTag || "Completed"}
                            </div>
                            <p className="text-xs text-text-secondary leading-relaxed max-w-xs font-medium italic">"{analysis.summary}"</p>
                        </div>

                        <div className="bg-[#1c212b] rounded-2xl border border-white/5 p-8 shadow-xl">
                            <h3 className="text-sm font-black uppercase tracking-widest text-white mb-8">Score Breakdown</h3>
                            <div className="space-y-6">
                                {analysis.scoreBreakdown?.map((s, i) => (
                                    <div key={i} className="space-y-2">
                                        <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                                            <span className="text-text-secondary">{s.label}</span>
                                            <span className="text-primary">{s.value}%</span>
                                        </div>
                                        <div className="h-1.5 w-full bg-black/40 rounded-full overflow-hidden">
                                            <div className="h-full bg-primary rounded-full transition-all duration-1000" style={{ width: `${s.value}%` }}></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6 h-fit">
                        <div className="bg-[#1c212b] rounded-2xl border border-white/5 p-8 shadow-xl">
                            <h3 className="text-sm font-black uppercase tracking-widest mb-6 text-green-400">Key Strengths</h3>
                            <ul className="space-y-6">
                                {analysis.keyStrengths?.map((s, i) => (
                                    <li key={i} className="flex gap-4 items-start">
                                        <span className="material-symbols-outlined text-green-500 text-lg">check_circle</span>
                                        <p className="text-xs text-text-secondary font-medium leading-relaxed">{s}</p>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="bg-[#1c212b] rounded-2xl border border-white/5 p-8 shadow-xl">
                            <h3 className="text-sm font-black uppercase tracking-widest mb-6 text-amber-400">Areas for Improvement</h3>
                            <ul className="space-y-6">
                                {analysis.growthAreas?.map((s, i) => (
                                    <li key={i} className="flex gap-4 items-start">
                                        <span className="material-symbols-outlined text-amber-500 text-lg">trending_up</span>
                                        <p className="text-xs text-text-secondary font-medium leading-relaxed">{s}</p>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="md:col-span-2 bg-[#1c212b] rounded-2xl border border-white/5 p-8 shadow-xl flex flex-col md:flex-row gap-8 items-center">
                            <div className="flex items-center gap-4 shrink-0">
                                <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                    <span className="material-symbols-outlined text-2xl">visibility</span>
                                </div>
                                <div>
                                    <h3 className="text-sm font-black uppercase tracking-widest">Visual Presence</h3>
                                    <p className="text-[10px] text-text-secondary font-bold uppercase mt-1">Simulated Feedback</p>
                                </div>
                            </div>
                            <div className="h-px md:h-12 w-full md:w-px bg-white/10"></div>
                            <div className="flex-1 grid grid-cols-3 gap-6 w-full text-center">
                                <div>
                                    <div className="text-xl font-black">{analysis.visualMetrics?.eyeContactScore || '--'}%</div>
                                    <div className="text-[9px] font-black text-text-secondary uppercase">Eye Contact</div>
                                </div>
                                <div>
                                    <div className="text-xl font-black">{analysis.visualMetrics?.postureScore || '--'}%</div>
                                    <div className="text-[9px] font-black text-text-secondary uppercase">Posture</div>
                                </div>
                                <div>
                                    <div className="text-xl font-black text-primary">{analysis.visualMetrics?.energyLevel || 'N/A'}</div>
                                    <div className="text-[9px] font-black text-text-secondary uppercase">Energy</div>
                                </div>
                            </div>
                            <p className="text-[10px] text-text-secondary italic leading-relaxed md:max-w-xs">{analysis.visualMetrics?.visualFeedback}</p>
                        </div>
                    </div>
                </div>

                <div className="pt-10 border-t border-white/5">
                    <h2 className="text-2xl font-black tracking-tight mb-8">Detailed Question Analysis</h2>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {analysis.detailedAnalysis?.map((qa, i) => (
                            <div key={i} className="bg-[#1c212b] rounded-[32px] border border-white/5 overflow-hidden shadow-2xl flex flex-col">
                                <div className="px-8 py-5 bg-black/20 border-b border-white/5 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="size-9 rounded-xl bg-black/40 border border-white/10 flex items-center justify-center text-[10px] font-black text-text-secondary shrink-0">Q{i+1}</div>
                                        <h3 className="text-sm font-bold truncate" title={qa.question}>"{qa.question}"</h3>
                                    </div>
                                    <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border border-white/5 flex items-center gap-2 whitespace-nowrap`}>
                                        <span className={`size-1.5 rounded-full ${qa.statusColor === 'green' ? 'bg-green-500' : 'bg-amber-500'}`}></span>
                                        {qa.answerStatus}
                                    </div>
                                </div>

                                <div className="p-8 space-y-8 flex-1">
                                    <div className="space-y-4">
                                        <h4 className="text-[9px] font-black uppercase tracking-[0.2em] text-text-secondary opacity-40">Your Transcript</h4>
                                        <div className="border-l-[3px] border-primary pl-6 py-1">
                                            <p className="text-xs md:text-sm text-gray-300 leading-relaxed italic">"{qa.userTranscript}"</p>
                                        </div>
                                    </div>

                                    <div className="bg-[#1e2536] rounded-[24px] p-6 space-y-4 border border-primary/10 relative overflow-hidden flex-1">
                                        <div className="flex items-center gap-3">
                                            <div className="size-8 rounded-lg bg-primary flex flex-none items-center justify-center text-white shadow-lg shadow-primary/20">
                                                <span className="material-symbols-outlined text-sm leading-none">sparkles</span>
                                            </div>
                                            <h4 className="text-[9px] font-black uppercase tracking-widest">AI Coach Suggestion</h4>
                                        </div>
                                        <div className="space-y-4">
                                            <p className="text-xs text-gray-300 leading-relaxed"><strong className="text-primary uppercase text-[10px] tracking-wider mr-2">Critique:</strong> {qa.critique}</p>
                                            <div className="bg-[#161b22] border border-white/5 rounded-2xl p-5 mt-4">
                                                <p className="text-[11px] md:text-xs text-gray-400 leading-relaxed italic">"{qa.improvedAnswer}"</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AnalysisScreen;