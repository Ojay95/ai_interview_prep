import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Screen, User, InterviewConfig } from '../types';
import { apiClient } from '../services/apiClient';
import toast from 'react-hot-toast';

interface InterviewScreenProps {
  user: User | null;
  onNavigate: (screen: Screen) => void;
}

interface TranscriptEntry {
  sender: 'Sarah' | 'You';
  text: string;
  time: string;
}

const InterviewScreen: React.FC<InterviewScreenProps> = ({ user, onNavigate }) => {
  // --- UI State ---
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [timer, setTimer] = useState(0);
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [inputText, setInputText] = useState("");
  const [config, setConfig] = useState<InterviewConfig | null>(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [isSarahTyping, setIsSarahTyping] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);

  // Pre-defined questions to simulate the interview flow
  const interviewQuestions = [
    "Could you start by telling me a little bit about yourself and your background?",
    "What interests you most about this specific role?",
    "Can you describe a challenging situation at work and how you handled it?",
    "What do you consider to be your greatest professional strength?",
    "Do you have any questions for me about the company or the role?"
  ];

  // Initialization
  useEffect(() => {
    const saved = localStorage.getItem('pending_interview_config');
    if (saved) setConfig(JSON.parse(saved));
  }, []);

  // --- Timer ---
  useEffect(() => {
    let interval: number;
    if (isSessionActive && !isPaused) {
      interval = window.setInterval(() => {
        setTimer(t => t + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isSessionActive, isPaused]);

  // Auto-scroll transcript
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [transcript, isSarahTyping]);

  const handleJoinSession = () => {
    if (!config) return;
    setIsSessionActive(true);

    // Sarah asks the first question
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setTranscript([{ sender: 'Sarah', text: `Hello! I'm Sarah, your interviewer for the ${config.role} position. ${interviewQuestions[0]}`, time }]);
  };

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || isSarahTyping) return;

    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userAnswer = inputText.trim();

    // 1. Add User Answer
    setTranscript(prev => [...prev, { sender: 'You', text: userAnswer, time }]);
    setInputText("");
    setIsSarahTyping(true);

    // 2. Simulate Sarah's response and next question
    setTimeout(() => {
      const nextIndex = questionIndex + 1;
      let nextResponse = "";

      if (nextIndex < interviewQuestions.length) {
        nextResponse = `Thank you for sharing that. ${interviewQuestions[nextIndex]}`;
        setQuestionIndex(nextIndex);
      } else {
        nextResponse = "Thank you so much for your time today. That concludes our questions. You can go ahead and end the interview now so I can analyze our conversation.";
      }

      setTranscript(prev => [...prev, { sender: 'Sarah', text: nextResponse, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
      setIsSarahTyping(false);
    }, 1500); // 1.5 second delay to feel natural
  };

  const handleFinish = async () => {
    if (transcript.length < 2) {
      toast.error("Please answer at least one question before ending.");
      return;
    }

    setIsAnalyzing(true);
    toast.loading("Ending interview and analyzing responses...", { id: 'analyze' });

    try {
      // 1. Format payload to match Java DTOs
      const payload = {
        targetRole: config?.role || 'Professional',
        experienceLevel: config?.experienceLevel || 'Mid-Level',
        language: config?.language || 'English',
        techStack: config?.techStack || [],
        focusAreas: config?.focusAreas || [],
        durationSeconds: timer,
        // Map to List<TranscriptDto>
        transcript: transcript.map(t => ({
          sender: t.sender === 'Sarah' ? 'AI' : 'USER',
          text: t.text
        }))
      };

      // 2. Send to Spring Boot InterviewController
      const response = await apiClient.post('/interviews/analyze', payload);

      // 3. Save the result and navigate
      // response.data.analysis contains the raw JSON string from AnalysisWrapper
      localStorage.setItem('interview_analysis_result', response.data.analysis);
      toast.success("Analysis complete!", { id: 'analyze' });
      onNavigate(Screen.Analysis);

    } catch (error) {
      console.error("Analysis Error:", error);
      toast.error("Failed to analyze the interview. Please check your connection.", { id: 'analyze' });
      setIsAnalyzing(false);
    }
  };

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  return (
      <div className="flex flex-col h-screen bg-[#0f121a] text-white overflow-hidden font-display">
        <nav className="flex items-center justify-between px-8 py-3 bg-[#161b22]/90 border-b border-white/5 shrink-0 z-50">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="size-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="material-symbols-outlined text-white text-xl">graphic_eq</span>
              </div>
              <span className="text-lg font-bold tracking-tight">MockInterview.ai</span>
            </div>
            <div className="h-4 w-px bg-white/10 mx-2"></div>
            <div className="flex items-center gap-3 text-xs font-medium text-text-secondary">
              <span>{config?.role}</span>
              <span className="opacity-20">/</span>
              <span className="text-white">{config?.language}</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-xs font-black text-primary tabular-nums bg-primary/10 px-3 py-1 rounded-full border border-primary/20">{formatTime(timer)}</div>
            <div className="size-8 rounded-full border border-white/10 overflow-hidden bg-slate-700">
              <img src={`https://i.pravatar.cc/150?u=${user?.id || 'default'}`} alt="User" />
            </div>
          </div>
        </nav>

        {!isSessionActive ? (
            <div className="flex-1 flex flex-col items-center justify-center p-6 space-y-8">
              <div className="size-24 bg-primary/10 rounded-[32px] flex items-center justify-center border border-primary/20">
                <span className="material-symbols-outlined text-5xl text-primary">video_camera_front</span>
              </div>
              <div className="text-center space-y-2">
                <h2 className="text-3xl font-black">Sarah is ready</h2>
                <p className="text-sm text-text-secondary max-w-xs">Your structured text interview will begin when you are ready.</p>
              </div>
              <button onClick={handleJoinSession} className="w-full max-w-xs px-10 py-4 bg-primary hover:bg-primary-hover rounded-2xl font-bold shadow-xl shadow-primary/30 transition-all uppercase tracking-widest text-xs">
                Start Interview
              </button>
            </div>
        ) : (
            <main className="flex-1 flex flex-col lg:grid lg:grid-cols-12 gap-6 p-6 overflow-hidden min-h-0">

              {/* Feed Column */}
              <section className="lg:col-span-3 flex lg:flex-col gap-6 overflow-x-auto lg:overflow-visible no-scrollbar">
                <div className="bg-[#1c212b] rounded-3xl border border-white/5 overflow-hidden shadow-2xl relative min-w-[280px] lg:min-w-0">
                  {/* Fallback avatar since we removed video tracking */}
                  <div className="w-full h-full aspect-[4/5] bg-black/50 flex flex-col items-center justify-center">
                    <span className="material-symbols-outlined text-6xl text-white/20">person</span>
                  </div>
                  <div className="absolute bottom-4 left-4 flex gap-2">
                    <div className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-[10px] font-bold">You</div>
                  </div>
                </div>
                <div className="bg-[#1c212b] rounded-3xl border border-white/5 overflow-hidden shadow-2xl relative min-w-[280px] lg:min-w-0">
                  <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=600&h=750" alt="Sarah" className="w-full h-full object-cover grayscale brightness-75 aspect-[4/5]" />
                  <div className="absolute bottom-6 left-6 text-white"><h2 className="text-2xl font-black">Sarah</h2></div>
                </div>
              </section>

              {/* Transcript Column */}
              <section className="lg:col-span-6 flex flex-col bg-[#1c212b] rounded-[32px] border border-white/5 shadow-2xl overflow-hidden relative min-h-0">
                <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
                  {transcript.map((m, i) => (
                      <div key={i} className={`flex flex-col ${m.sender === 'You' ? 'items-end' : 'items-start'} animate-in fade-in slide-in-from-bottom-2`}>
                        <span className="text-[10px] font-black uppercase text-text-secondary mb-2 px-1">{m.sender}</span>
                        <div className={`p-5 rounded-2xl max-w-[85%] text-sm leading-relaxed ${m.sender === 'Sarah' ? 'bg-white/5 text-gray-300' : 'bg-primary text-white shadow-lg'}`}>
                          {m.text}
                        </div>
                      </div>
                  ))}
                  {isSarahTyping && (
                      <div className="flex flex-col items-start opacity-60">
                        <div className="p-5 rounded-2xl max-w-[85%] italic text-sm bg-white/5 flex gap-1 items-center">
                          <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"></span>
                          <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce delay-100"></span>
                          <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce delay-200"></span>
                        </div>
                      </div>
                  )}
                </div>

                {/* Chat Input Footer */}
                <div className="p-4 bg-black/40 backdrop-blur-md border-t border-white/5 shrink-0">
                  <form onSubmit={handleSendMessage} className="flex items-center gap-4">
                    <input
                        type="text"
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        disabled={isSarahTyping || isPaused || isAnalyzing}
                        placeholder="Type your response..."
                        className="flex-1 bg-black/50 border border-white/10 rounded-full px-6 py-3 text-sm focus:outline-none focus:border-primary disabled:opacity-50"
                    />
                    <button
                        type="submit"
                        disabled={!inputText.trim() || isSarahTyping || isPaused || isAnalyzing}
                        className="size-12 rounded-full bg-primary flex items-center justify-center disabled:opacity-50 disabled:bg-gray-700 hover:bg-primary-hover transition-colors"
                    >
                      <span className="material-symbols-outlined">send</span>
                    </button>
                  </form>
                </div>
              </section>

              {/* Controls Column */}
              <section className="lg:col-span-3 flex lg:flex-col gap-6 shrink-0">
                <div className="bg-[#1c212b] rounded-3xl border border-white/5 p-8 flex flex-col items-center shadow-2xl shrink-0">
                  <div className="text-5xl font-black tracking-tighter tabular-nums mb-1 font-mono text-primary">{formatTime(timer)}</div>
                  <div className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">Time Elapsed</div>
                </div>

                <div className="flex-1 bg-[#1c212b] rounded-3xl border border-white/5 p-8 flex flex-col shadow-2xl relative overflow-hidden min-h-0">
                  <div className="space-y-6">
                    <div className="flex items-center gap-3">
                      <div className={`size-2 rounded-full ${isPaused ? 'bg-orange-500' : 'bg-green-500 animate-ping'}`}></div>
                      <span className="text-[10px] font-black uppercase tracking-widest">{isPaused ? 'Session Paused' : 'Session Active'}</span>
                    </div>
                    <p className="text-xs text-text-secondary leading-relaxed italic border-l border-white/10 pl-4">"Read Sarah's question carefully and take your time typing out a structured, professional response."</p>
                  </div>
                </div>

                <div className="bg-[#1c212b] rounded-3xl border border-white/5 p-3 flex items-center justify-around shadow-2xl shrink-0">
                  <button onClick={() => setIsMuted(!isMuted)} className={`size-12 rounded-2xl flex items-center justify-center transition-all ${isMuted ? 'bg-red-500/20 text-red-500' : 'bg-white/5 text-text-secondary hover:text-white'}`}>
                    <span className="material-symbols-outlined">{isMuted ? 'mic_off' : 'mic'}</span>
                  </button>
                  <button onClick={() => setIsPaused(!isPaused)} className={`size-12 rounded-2xl flex items-center justify-center transition-all ${isPaused ? 'bg-primary/20 text-primary' : 'bg-white/5 text-text-secondary hover:text-white'}`}>
                    <span className="material-symbols-outlined">{isPaused ? 'play_arrow' : 'pause'}</span>
                  </button>
                  <button onClick={handleFinish} disabled={isAnalyzing} className="size-12 rounded-2xl bg-red-600/10 text-red-500 hover:bg-red-600 hover:text-white transition-all flex items-center justify-center disabled:opacity-50">
                    {isAnalyzing ? <span className="material-symbols-outlined animate-spin">refresh</span> : <span className="material-symbols-outlined">call_end</span>}
                  </button>
                </div>
              </section>
            </main>
        )}
        <style>{`.custom-scrollbar::-webkit-scrollbar { width: 4px; } .custom-scrollbar::-webkit-scrollbar-thumb { background: #3c4253; border-radius: 10px; } .no-scrollbar::-webkit-scrollbar { display: none; }`}</style>
      </div>
  );
};

export default InterviewScreen;