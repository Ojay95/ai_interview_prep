
import React, { useState, useEffect, useRef } from 'react';
import { Screen, User, InterviewConfig } from '../types';
import { Logo } from '../constants';
import { GoogleGenAI, Type } from '@google/genai';

interface OnboardingScreenProps {
  user: User | null;
  onNavigate: (screen: Screen) => void;
}

const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ user, onNavigate }) => {
  const [messages, setMessages] = useState<{ sender: 'ai' | 'user'; text: string }[]>([
    { sender: 'ai', text: `Hi ${user?.name}! I'm Sarah, your AI interview coach. To get started, what role are you preparing for? It can be anything from Software Engineering to Culinary Arts or Project Management.` }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [progress, setProgress] = useState(15);
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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
    setErrorMsg(null);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      const result = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Based on this interview setup conversation, extract the interview configuration in JSON format.
        Conversation: ${JSON.stringify(messages)}`,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              role: { type: Type.STRING },
              experienceLevel: { type: Type.STRING },
              techStack: { type: Type.ARRAY, items: { type: Type.STRING } },
              focusAreas: { type: Type.ARRAY, items: { type: Type.STRING } },
              duration: { type: Type.NUMBER }
            },
            required: ['role', 'experienceLevel', 'techStack', 'focusAreas', 'duration']
          }
        }
      });
      
      const configData = JSON.parse(result.text || '{}');
      
      // Enforce Free vs Pro limits on duration
      const isPro = user?.plan === 'pro';
      const finalDuration = !isPro ? Math.min(15, configData.duration || 15) : (configData.duration || 30);
      
      const config: InterviewConfig = {
        ...configData,
        duration: finalDuration
      };

      localStorage.setItem('pending_interview_config', JSON.stringify(config));
      
      // Consume Usage Quota
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
    } catch (err: any) {
      console.error("Failed to finalize config:", err);
      if (err.message?.includes('429')) {
        setErrorMsg("Sarah is currently over-capacity. Please wait a minute.");
      } else {
        const fallback: InterviewConfig = {
          role: messages.find(m => m.sender === 'user')?.text || 'Professional Role',
          experienceLevel: 'Senior',
          techStack: ['General Skills'],
          focusAreas: ['Core Competencies'],
          duration: user?.plan === 'pro' ? 30 : 15
        };
        localStorage.setItem('pending_interview_config', JSON.stringify(fallback));
        onNavigate(Screen.Interview);
      }
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
    setErrorMsg(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      const history = messages.map(m => ({
        role: m.sender === 'ai' ? 'model' as const : 'user' as const,
        parts: [{ text: m.text }]
      }));

      const chat = ai.chats.create({
        model: 'gemini-3-flash-preview',
        history: history,
        config: {
          systemInstruction: `You are Sarah, a helpful AI Interview Coach. Help ${user?.name} set up an interview.
          COLLECT: 1. Role, 2. Experience Level, 3. Skills/Focus, 4. Duration.
          MAX DURATION for ${user?.plan} user is ${user?.plan === 'pro' ? '60' : '15'} minutes.
          Once all are known, say: "Ready to start?"`
        }
      });

      const result = await chat.sendMessage({ message: userMsg });
      const aiResponse = result.text || "I'm sorry, I didn't quite catch that.";
      setMessages(prev => [...prev, { sender: 'ai', text: aiResponse }]);

      const lowerResp = aiResponse.toLowerCase();
      if (lowerResp.includes("ready to start") || lowerResp.includes("ready?")) {
        setProgress(100);
      } else {
        setProgress(prev => Math.min(90, prev + 20));
      }

    } catch (err: any) {
      console.error("Gemini Chat Error:", err);
      if (err.message?.includes('429')) {
        setErrorMsg("System Busy (Quota Exceeded). Try again in 30 seconds.");
      } else {
        setMessages(prev => [...prev, { sender: 'ai', text: "I'm having a little trouble connecting. Could you repeat that?" }]);
      }
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background-dark overflow-hidden">
      <header className="flex items-center justify-between px-6 lg:px-10 py-4 bg-surface-dark border-b border-border-dark shrink-0 z-20">
        <div className="flex items-center gap-4 text-white">
          <Logo className="size-8" />
          <div>
            <h2 className="text-lg font-bold leading-none">Interview Setup</h2>
            <p className="text-[10px] text-text-secondary uppercase tracking-widest mt-1">Persona: Sarah</p>
          </div>
        </div>
        <button onClick={() => onNavigate(Screen.Dashboard)} className="size-10 rounded-xl flex items-center justify-center text-text-secondary hover:text-white hover:bg-white/5 transition-all">
           <span className="material-symbols-outlined">close</span>
        </button>
      </header>

      <main className="flex-1 flex flex-col lg:flex-row max-w-[1600px] mx-auto w-full p-4 lg:p-8 gap-6 overflow-hidden min-h-0">
        <section className="flex-1 flex flex-col bg-surface-dark rounded-3xl border border-border-dark/50 shadow-2xl overflow-hidden min-h-0 relative">
           <div className="flex-1 overflow-y-auto p-6 space-y-8 scroll-smooth" ref={scrollRef}>
              {messages.map((m, i) => (
                <div key={i} className={`flex items-start gap-4 ${m.sender === 'user' ? 'flex-row-reverse' : ''} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                   <div className={`size-10 rounded-2xl flex items-center justify-center shrink-0 shadow-lg ${m.sender === 'ai' ? 'bg-primary/20 text-primary border border-primary/20' : 'bg-primary text-white shadow-primary/20'}`}>
                      <span className="material-symbols-outlined text-xl">{m.sender === 'ai' ? 'smart_toy' : 'person'}</span>
                   </div>
                   <div className={`flex flex-col gap-1.5 max-w-[80%] ${m.sender === 'user' ? 'items-end' : ''}`}>
                      <div className={`p-5 rounded-2xl shadow-sm text-sm lg:text-base leading-relaxed whitespace-pre-wrap ${m.sender === 'ai' ? 'bg-[#252833] border border-white/5 text-gray-200 rounded-tl-none' : 'bg-primary text-white rounded-tr-none'}`}>
                         {m.text}
                      </div>
                      <span className="text-[10px] font-bold text-text-secondary uppercase tracking-widest px-1">{m.sender === 'ai' ? 'Sarah' : 'You'}</span>
                   </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex items-center gap-4 animate-in fade-in duration-200">
                   <div className="size-10 rounded-2xl bg-primary/20 text-primary border border-primary/20 flex items-center justify-center">
                      <span className="material-symbols-outlined text-xl">smart_toy</span>
                   </div>
                   <div className="flex items-center gap-1.5 bg-[#252833] p-4 rounded-2xl rounded-tl-none w-20 justify-center">
                      <div className="size-1.5 bg-primary rounded-full animate-bounce"></div>
                      <div className="size-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      <div className="size-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                   </div>
                </div>
              )}
              {errorMsg && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-sm font-bold animate-pulse text-center">
                   {errorMsg}
                </div>
              )}
           </div>

           <div className="p-6 bg-[#1a1c24] border-t border-border-dark/50 shrink-0">
              <div className="relative flex items-center gap-4 max-w-4xl mx-auto">
                 <input 
                  ref={inputRef}
                  className="flex-1 h-14 rounded-2xl bg-background-dark border border-border-dark focus:border-primary focus:ring-2 focus:ring-primary/20 text-white pl-6 pr-4 text-base outline-none transition-all placeholder:text-text-secondary/50" 
                  placeholder="Type your preferences..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                 />
                 <button onClick={handleSend} disabled={!input.trim() || isTyping} className="h-14 w-14 rounded-2xl bg-primary text-white flex items-center justify-center shadow-xl shadow-primary/30 hover:bg-primary-hover disabled:opacity-50 transition-all active:scale-95">
                    <span className="material-symbols-outlined">send</span>
                 </button>
              </div>
           </div>
        </section>

        <aside className="lg:w-[380px] flex flex-col gap-6 shrink-0 lg:h-full overflow-y-auto pb-4">
           <div className="bg-surface-dark p-8 rounded-3xl border border-border-dark/50 shadow-xl shrink-0">
              <div className="flex justify-between items-center mb-6">
                 <div>
                    <h4 className="text-white font-bold text-lg">Setup Progress</h4>
                    <p className="text-[10px] text-text-secondary uppercase tracking-widest mt-1">Guided Mode</p>
                 </div>
                 <div className="text-2xl font-black text-primary tabular-nums">{progress}%</div>
              </div>
              <div className="w-full h-3 bg-background-dark rounded-full overflow-hidden border border-white/5">
                 <div className="h-full bg-gradient-to-r from-primary to-teal-400 rounded-full transition-all duration-700 ease-out" style={{ width: `${progress}%` }}></div>
              </div>
           </div>

           <div className="flex-1 bg-surface-dark p-8 rounded-3xl border border-border-dark/50 shadow-xl flex flex-col min-h-0">
              <h4 className="text-white font-bold text-lg mb-8 border-b border-white/5 pb-4 shrink-0 flex items-center gap-2">
                 <span className="material-symbols-outlined text-primary text-xl">checklist</span>
                 Parameters
              </h4>
              <div className="space-y-10 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                 {[
                   { label: 'Role', done: progress >= 25 },
                   { label: 'Experience', done: progress >= 50 },
                   { label: 'Focus Areas', done: progress >= 75 },
                   { label: 'Duration', done: progress >= 100 },
                 ].map((step, i) => (
                   <div key={i} className="flex gap-4 group">
                      <div className="flex flex-col items-center">
                         <div className={`size-10 rounded-2xl flex items-center justify-center text-xs font-black border transition-all duration-500 ${step.done ? 'bg-primary/20 text-primary border-primary/20 shadow-[0_0_15px_rgba(25,76,230,0.1)]' : 'bg-background-dark text-text-secondary border-border-dark'}`}>
                           {step.done ? <span className="material-symbols-outlined text-lg">check_circle</span> : i + 1}
                         </div>
                         <div className={`w-0.5 h-full my-3 transition-colors duration-500 ${step.done ? 'bg-primary/30' : 'bg-border-dark'} group-last:hidden`}></div>
                      </div>
                      <div className="pt-0.5">
                        <p className={`text-[10px] font-black uppercase tracking-[0.2em] mb-1 transition-colors ${step.done ? 'text-primary' : 'text-text-secondary'}`}>{step.label}</p>
                        <p className={`text-sm font-medium leading-tight ${step.done ? 'text-white' : 'text-text-secondary/60'}`}>{step.done ? 'Captured' : 'Pending...'}</p>
                      </div>
                   </div>
                 ))}
              </div>
              
              <div className="pt-8 mt-auto shrink-0 border-t border-white/5 space-y-4">
                {user?.plan === 'free' && (
                  <div className="p-3 bg-primary/5 border border-primary/20 rounded-xl text-center">
                    <p className="text-[10px] text-primary font-black uppercase tracking-widest">Free Plan Active</p>
                    <p className="text-[10px] text-text-secondary mt-1">Sessions capped at 15 minutes.</p>
                  </div>
                )}
                <button 
                  onClick={handleStartInterview}
                  disabled={progress < 100 || isFinalizing} 
                  className={`w-full py-5 rounded-2xl font-black uppercase tracking-widest transition-all relative overflow-hidden group ${progress === 100 ? 'bg-primary text-white shadow-2xl shadow-primary/30 hover:bg-primary-hover active:scale-95' : 'bg-background-dark text-text-secondary border border-border-dark opacity-50 cursor-not-allowed'}`}
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {isFinalizing ? <span className="material-symbols-outlined animate-spin">refresh</span> : null}
                    {isFinalizing ? 'Initializing...' : progress === 100 ? 'Start Interview' : 'Awaiting Details...'}
                  </span>
                </button>
              </div>
           </div>
        </aside>
      </main>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #3c4253; border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default OnboardingScreen;
