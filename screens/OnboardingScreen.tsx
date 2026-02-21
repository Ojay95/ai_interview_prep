import React, { useState, useEffect, useRef } from 'react';
import { Screen, User } from '../types';
import { Logo } from '../constants';
import { apiClient } from '../services/apiClient';
import toast from 'react-hot-toast';

interface OnboardingScreenProps {
    user: User | null;
    onNavigate: (screen: Screen) => void;
}

const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ user, onNavigate }) => {
    const [messages, setMessages] = useState<{ sender: 'ai' | 'user'; text: string }[]>([
        { sender: 'ai', text: `Hi ${user?.firstName || 'there'}! I'm Sarah, your AI interview coach. To get started, what role are you preparing for?` }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [progress, setProgress] = useState(0); // Start at 0
    const [isFinalizing, setIsFinalizing] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // State to hold the collected configuration
    const [configData, setConfigData] = useState({
        targetRole: '',
        experienceLevel: '',
        techStack: '',
        language: 'English'
    });

    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTo({
                top: scrollRef.current.scrollHeight,
                behavior: 'smooth'
            });
        }
    }, [messages, isTyping]);

    const handleStartInterview = async () => {
        setIsFinalizing(true);
        try {
            // 1. Format payload to match your Java UserPreferenceDto
            const payload = {
                targetRole: configData.targetRole || 'Professional',
                experienceLevel: configData.experienceLevel || 'Mid-Level',
                language: configData.language || 'English',
                techStack: configData.techStack ? configData.techStack.split(',').map(s => s.trim()) : [],
                focusAreas: ['Behavioral', 'Technical'] // Default
            };

            // 2. Send securely to your Spring Boot UserPreferenceController
            await apiClient.post('/users/preferences', payload);

            toast.success('Preferences saved!');
            onNavigate(Screen.Dashboard);

        } catch (err: any) {
            console.error("Failed to finalize config:", err);
            toast.error("Failed to save configuration. Please try again.");
        } finally {
            setIsFinalizing(false);
        }
    };

    const handleSend = async () => {
        if (!input.trim() || isTyping) return;

        const userMsg = input.trim();
        setMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
        setInput('');
        setIsTyping(true);

        // Simulate backend AI extraction logic for the setup chat
        setTimeout(() => {
            let nextAiMessage = "";
            let newProgress = progress;
            const updatedConfig = { ...configData };

            // Simple state machine to progress through the checklist
            if (progress === 0) {
                updatedConfig.targetRole = userMsg;
                nextAiMessage = `Great! A ${userMsg}. Next, what is your experience level? (e.g., Entry-level, Mid-level, Senior)`;
                newProgress = 25;
            } else if (progress === 25) {
                updatedConfig.experienceLevel = userMsg;
                nextAiMessage = `Got it, ${userMsg} experience. What key technical skills or tools should we focus on? (Please separate them with commas)`;
                newProgress = 50;
            } else if (progress === 50) {
                updatedConfig.techStack = userMsg;
                nextAiMessage = `Excellent. Finally, what language would you like to conduct the interview in?`;
                newProgress = 75;
            } else if (progress === 75) {
                updatedConfig.language = userMsg;
                nextAiMessage = `Perfect. I have all the details I need! We will conduct a ${updatedConfig.experienceLevel} ${updatedConfig.targetRole} interview focusing on ${updatedConfig.techStack} in ${updatedConfig.language}. Ready to start?`;
                newProgress = 100;
            } else {
                nextAiMessage = "I'm ready when you are! Just click the 'Start Mock Interview' button below.";
            }

            setConfigData(updatedConfig);
            setProgress(newProgress);
            setMessages(prev => [...prev, { sender: 'ai', text: nextAiMessage }]);
            setIsTyping(false);
        }, 1000); // 1-second delay to simulate "thinking"
    };

    return (
        <div className="flex flex-col h-screen bg-[#0d111a] text-white overflow-hidden font-display">
            <header className="flex items-center justify-between px-6 lg:px-10 py-4 bg-[#161b22] border-b border-white/5 shrink-0 z-20">
                <div className="flex items-center gap-4">
                    <Logo className="size-8" />
                    <div>
                        <h2 className="text-base font-bold leading-none">Interview Setup</h2>
                        <p className="text-[10px] text-text-secondary uppercase tracking-widest mt-1">Persona: Sarah</p>
                    </div>
                </div>
                <button onClick={() => onNavigate(Screen.Dashboard)} className="size-10 rounded-xl flex items-center justify-center text-text-secondary hover:text-white hover:bg-white/5 transition-all">
                    <span className="material-symbols-outlined">close</span>
                </button>
            </header>

            <main className="flex-1 flex flex-col lg:flex-row max-w-[1600px] mx-auto w-full p-4 lg:p-8 gap-6 overflow-hidden">

                {/* Chat Section */}
                <section className="flex-1 flex flex-col bg-[#1c212b] rounded-3xl border border-white/5 shadow-2xl overflow-hidden min-h-0 relative">
                    <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 md:space-y-8 scroll-smooth" ref={scrollRef}>
                        {messages.map((m, i) => (
                            <div key={i} className={`flex items-start gap-3 md:gap-4 ${m.sender === 'user' ? 'flex-row-reverse' : ''} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                                <div className={`size-8 md:size-10 rounded-2xl flex items-center justify-center shrink-0 ${m.sender === 'ai' ? 'bg-primary/20 text-primary border border-primary/20' : 'bg-primary text-white shadow-lg shadow-primary/20'}`}>
                                    <span className="material-symbols-outlined text-lg md:text-xl">{m.sender === 'ai' ? 'smart_toy' : 'person'}</span>
                                </div>
                                <div className={`flex flex-col gap-1.5 max-w-[85%] ${m.sender === 'user' ? 'items-end' : ''}`}>
                                    <div className={`p-4 md:p-5 rounded-2xl shadow-sm text-sm lg:text-base leading-relaxed whitespace-pre-wrap ${m.sender === 'ai' ? 'bg-white/5 border border-white/5 text-gray-200 rounded-tl-none' : 'bg-primary text-white rounded-tr-none'}`}>
                                        {m.text}
                                    </div>
                                    <span className="text-[10px] font-black text-text-secondary uppercase tracking-widest px-1">{m.sender === 'ai' ? 'Sarah' : 'You'}</span>
                                </div>
                            </div>
                        ))}
                        {isTyping && (
                            <div className="flex items-center gap-4 animate-in fade-in duration-200">
                                <div className="size-10 rounded-2xl bg-primary/20 text-primary border border-primary/20 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-xl">smart_toy</span>
                                </div>
                                <div className="flex items-center gap-1.5 bg-white/5 p-4 rounded-2xl rounded-tl-none w-20 justify-center">
                                    <div className="size-1.5 bg-primary rounded-full animate-bounce"></div>
                                    <div className="size-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                    <div className="size-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="p-4 md:p-6 bg-black/20 border-t border-white/5">
                        <div className="relative flex items-center gap-3 md:gap-4 max-w-4xl mx-auto">
                            <input
                                ref={inputRef}
                                className="flex-1 h-12 md:h-14 rounded-2xl bg-[#0d111a] border border-white/10 focus:border-primary focus:ring-1 focus:ring-primary text-white pl-4 md:pl-6 text-sm md:text-base outline-none transition-all placeholder:text-text-secondary/50 disabled:opacity-50"
                                placeholder={progress === 100 ? "Configuration complete" : "Type your answer..."}
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                disabled={isTyping || progress === 100}
                            />
                            <button onClick={handleSend} disabled={!input.trim() || isTyping || progress === 100} className="h-12 w-12 md:h-14 md:w-14 rounded-2xl bg-primary text-white flex items-center justify-center shadow-xl shadow-primary/30 hover:bg-primary-hover disabled:opacity-50 transition-all active:scale-95">
                                <span className="material-symbols-outlined">send</span>
                            </button>
                        </div>
                    </div>
                </section>

                {/* Sidebar / Checklist Section */}
                <aside className="lg:w-[350px] flex flex-col gap-4 md:gap-6 shrink-0 lg:h-full overflow-y-auto">
                    <div className="bg-[#1c212b] p-6 md:p-8 rounded-3xl border border-white/5 shadow-xl">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h4 className="text-white font-bold text-base">Progress</h4>
                                <p className="text-[10px] text-text-secondary uppercase tracking-widest mt-1">Calibration</p>
                            </div>
                            <div className="text-xl md:text-2xl font-black text-primary tabular-nums">{progress}%</div>
                        </div>
                        <div className="w-full h-2 bg-black/40 rounded-full overflow-hidden">
                            <div className="h-full bg-primary rounded-full transition-all duration-700 ease-out" style={{ width: `${progress}%` }}></div>
                        </div>
                    </div>

                    <div className="flex-1 bg-[#1c212b] p-6 md:p-8 rounded-3xl border border-white/5 shadow-xl flex flex-col">
                        <h4 className="text-white font-bold text-sm mb-6 border-b border-white/5 pb-4 flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary text-lg">checklist</span>
                            Checklist
                        </h4>
                        <div className="space-y-6 flex-1">
                            {[
                                { label: 'Role Identification', done: progress >= 25, value: configData.targetRole },
                                { label: 'Experience Level', done: progress >= 50, value: configData.experienceLevel },
                                { label: 'Core Focus Areas', done: progress >= 75, value: configData.techStack },
                                { label: 'Language Setup', done: progress >= 100, value: configData.language },
                            ].map((step, i) => (
                                <div key={i} className="flex gap-4">
                                    <div className={`size-8 rounded-xl flex items-center justify-center text-[10px] font-black border transition-all duration-500 shrink-0 ${step.done ? 'bg-primary/20 text-primary border-primary/20' : 'bg-black/20 text-text-secondary border-white/5'}`}>
                                        {step.done ? <span className="material-symbols-outlined text-sm">check</span> : i + 1}
                                    </div>
                                    <div className="pt-0.5 min-w-0">
                                        <p className={`text-[10px] font-black uppercase tracking-widest ${step.done ? 'text-primary' : 'text-text-secondary'}`}>{step.label}</p>
                                        <p className={`text-xs font-medium mt-0.5 truncate ${step.done ? 'text-white' : 'text-text-secondary/40'}`}>
                                            {step.done ? step.value || 'Confirmed' : 'Pending'}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="pt-8 mt-auto">
                            <button
                                onClick={handleStartInterview}
                                disabled={progress < 100 || isFinalizing}
                                className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest text-[11px] transition-all ${progress === 100 ? 'bg-primary text-white shadow-xl shadow-primary/30 hover:bg-primary-hover active:scale-95' : 'bg-black/20 text-text-secondary border border-white/5 opacity-50 cursor-not-allowed'}`}
                            >
                                {isFinalizing ? 'Saving Setup...' : progress === 100 ? 'Save & Continue' : 'Answer Sarah to Finish'}
                            </button>
                        </div>
                    </div>
                </aside>
            </main>
            <style>{`.custom-scrollbar::-webkit-scrollbar { width: 4px; } .custom-scrollbar::-webkit-scrollbar-thumb { background: #3c4253; border-radius: 10px; }`}</style>
        </div>
    );
};

export default OnboardingScreen;