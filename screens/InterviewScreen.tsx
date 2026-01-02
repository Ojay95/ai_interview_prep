
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Screen, User, InterviewConfig } from '../types';
import { GoogleGenAI, Modality, LiveServerMessage } from '@google/genai';
import { floatTo16BitPCM, encodeBase64, decodeBase64, decodeAudioData } from '../services/geminiService';

interface InterviewScreenProps {
  user: User | null;
  onNavigate: (screen: Screen) => void;
}

const InterviewScreen: React.FC<InterviewScreenProps> = ({ user, onNavigate }) => {
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [timer, setTimer] = useState(0);
  const [transcript, setTranscript] = useState<{ sender: 'Sarah' | 'You'; text: string; time: string }[]>([]);
  const [liveUserText, setLiveUserText] = useState("");
  const [liveSarahText, setLiveSarahText] = useState("");
  const [config, setConfig] = useState<InterviewConfig | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(1);
  const [isWrappingUp, setIsWrappingUp] = useState(false);
  
  const inputAudioCtxRef = useRef<AudioContext | null>(null);
  const outputAudioCtxRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const sessionPromiseRef = useRef<Promise<any> | null>(null);

  const userTextBuffer = useRef("");
  const sarahTextBuffer = useRef("");

  useEffect(() => {
    const saved = localStorage.getItem('pending_interview_config');
    if (saved) setConfig(JSON.parse(saved));
    localStorage.removeItem('last_interview_transcript');
    return () => cleanupAll();
  }, []);

  useEffect(() => {
    let interval: any;
    if (isSessionActive && !isPaused) {
      interval = setInterval(() => {
        setTimer(t => {
          const next = t + 1;
          const limitSeconds = (config?.duration || 15) * 60;
          
          // Trigger wrap-up logic when 1 minute remains
          if (limitSeconds - next <= 60 && !isWrappingUp) {
            triggerWrapUp();
          }

          if (next >= limitSeconds) {
            handleFinish();
            return t;
          }
          return next;
        });
      }, 1000);
    }
    return () => { if (interval) clearInterval(interval); };
  }, [isSessionActive, isPaused, config, isWrappingUp]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [transcript, liveUserText, liveSarahText]);

  const triggerWrapUp = () => {
    setIsWrappingUp(true);
    sessionPromiseRef.current?.then(session => {
      session.sendRealtimeInput({
        text: "[SYSTEM: Only 60 seconds remain. Conclude the interview professionally now. Do not start new technical topics. Ask for final questions.]"
      });
    });
  };

  const cleanupAll = useCallback(() => {
    if (sessionPromiseRef.current) {
      sessionPromiseRef.current.then(session => {
        try { session.close(); } catch (e) {}
      }).catch(() => {});
      sessionPromiseRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    const closeCtx = (ctx: AudioContext | null) => {
      if (ctx && ctx.state !== 'closed') ctx.close().catch(() => {});
    };
    closeCtx(inputAudioCtxRef.current);
    closeCtx(outputAudioCtxRef.current);
    sourcesRef.current.forEach(s => { try { s.stop(); } catch(e) {} });
    sourcesRef.current.clear();
  }, []);

  const handleJoinSession = async () => {
    if (!config || isConnecting) return;
    setIsConnecting(true);

    try {
      const inCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const outCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      inputAudioCtxRef.current = inCtx;
      outputAudioCtxRef.current = outCtx;

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        config: {
          responseModalities: [Modality.AUDIO],
          outputAudioTranscription: {},
          inputAudioTranscription: {},
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } },
          systemInstruction: `You are Sarah, a Lead HR Manager interviewing a candidate for a ${config.role} position.
          BEHAVIOR:
          - Sound dynamic and human, not like a robot.
          - BE PATIENT: Let the candidate finish their full answer before speaking. 
          - PACING: Manage this ${config.duration} minute session. Ask about 8 key questions.
          - INSTRUCTIONS: For the very first introduction, ask for a "brief 1-minute summary". After that, don't repeat time limits unless the candidate is clearly over-explaining.
          - DYNAMIC: Occasionally suggest if you want a "brief" or "detailed" answer based on the topic complexity.
          - CONCLUDE: When you receive the wrap-up signal, end gracefully.
          - ROLE: ${config.role} (${config.experienceLevel} level).
          - FOCUS: ${config.focusAreas.join(', ')}.`
        },
        callbacks: {
          onopen: () => {
            const source = inCtx.createMediaStreamSource(stream);
            const processor = inCtx.createScriptProcessor(4096, 1, 1);
            processor.onaudioprocess = (e) => {
              if (isMuted || isPaused) return;
              const pcmData = floatTo16BitPCM(e.inputBuffer.getChannelData(0));
              sessionPromise.then(s => s.sendRealtimeInput({ media: { data: encodeBase64(pcmData), mimeType: 'audio/pcm;rate=16000' } }));
            };
            source.connect(processor);
            processor.connect(inCtx.destination);
            setIsSessionActive(true);
          },
          onmessage: async (msg: LiveServerMessage) => {
            const audioData = msg.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (audioData && !isPaused) {
              const buffer = await decodeAudioData(decodeBase64(audioData), outCtx);
              const source = outCtx.createBufferSource();
              source.buffer = buffer;
              source.connect(outCtx.destination);
              const startTime = Math.max(nextStartTimeRef.current, outCtx.currentTime);
              source.start(startTime);
              nextStartTimeRef.current = startTime + buffer.duration;
              sourcesRef.current.add(source);
              source.onended = () => sourcesRef.current.delete(source);
            }

            if (msg.serverContent?.outputTranscription) {
              sarahTextBuffer.current += msg.serverContent.outputTranscription.text;
              setLiveSarahText(sarahTextBuffer.current);
            }

            if (msg.serverContent?.inputTranscription) {
              userTextBuffer.current += msg.serverContent.inputTranscription.text;
              setLiveUserText(userTextBuffer.current);
            }

            if (msg.serverContent?.turnComplete) {
              const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              const updates: any[] = [];
              
              if (sarahTextBuffer.current.trim()) {
                updates.push({ sender: 'Sarah', text: sarahTextBuffer.current.trim(), time: timestamp });
                sarahTextBuffer.current = "";
                setLiveSarahText("");
                setCurrentQuestionIndex(prev => Math.min(prev + 1, 8));
              }
              
              if (userTextBuffer.current.trim()) {
                updates.push({ sender: 'You', text: userTextBuffer.current.trim(), time: timestamp });
                userTextBuffer.current = "";
                setLiveUserText("");
              }

              if (updates.length > 0) {
                setTranscript(prev => [...prev, ...updates]);
              }
            }
            
            if (msg.serverContent?.interrupted) {
              for (const s of sourcesRef.current) s.stop();
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }
          }
        }
      });
      sessionPromiseRef.current = sessionPromise;
    } catch (err) {
      console.error(err);
      cleanupAll();
    } finally {
      setIsConnecting(false);
    }
  };

  const handleFinish = () => {
    const finalTranscript = [...transcript];
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (sarahTextBuffer.current.trim()) finalTranscript.push({ sender: 'Sarah', text: sarahTextBuffer.current.trim(), time: timestamp });
    if (userTextBuffer.current.trim()) finalTranscript.push({ sender: 'You', text: userTextBuffer.current.trim(), time: timestamp });
    
    localStorage.setItem('last_interview_transcript', JSON.stringify(finalTranscript));
    localStorage.setItem('last_interview_role', config?.role || 'Professional Role');
    cleanupAll();
    onNavigate(Screen.Analysis);
  };

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  return (
    <div className="flex flex-col h-screen bg-[#0f121a] text-white overflow-hidden font-display">
      <nav className="flex items-center justify-between px-8 py-4 bg-[#161b22]/90 border-b border-white/5 shrink-0 z-50">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="size-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-xl">graphic_eq</span>
            </div>
            <span className="text-lg font-bold tracking-tight">AI Mock Interviewer</span>
          </div>
          <div className="h-4 w-px bg-white/10 mx-2"></div>
          <div className="flex items-center gap-3 text-xs font-medium text-text-secondary">
             <span>Home</span>
             <span className="opacity-20">/</span>
             <span>Mock Interview</span>
             <span className="opacity-20">/</span>
             <span className="text-white">Technical Round</span>
          </div>
        </div>
        <div className="size-8 rounded-full border border-white/10 overflow-hidden bg-slate-700">
           <img src={`https://i.pravatar.cc/150?u=${user?.id}`} alt="User" />
        </div>
      </nav>

      {!isSessionActive ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-8 animate-in fade-in duration-500">
           <div className="size-24 bg-primary/10 rounded-[32px] flex items-center justify-center border border-primary/20">
              <span className={`material-symbols-outlined text-5xl text-primary ${isConnecting ? 'animate-spin' : ''}`}>
                 {isConnecting ? 'sync' : 'mic'}
              </span>
           </div>
           <div className="text-center space-y-2">
              <h2 className="text-3xl font-black">Sarah is waiting</h2>
              <p className="text-text-secondary">Ready to evaluate your performance for {config?.role}</p>
           </div>
           <button onClick={handleJoinSession} disabled={isConnecting} className="px-10 py-4 bg-primary rounded-2xl font-bold hover:bg-primary-hover shadow-xl shadow-primary/30 transition-all active:scale-95 disabled:opacity-50 uppercase tracking-widest text-xs">
              {isConnecting ? 'Connecting...' : 'Enter Session'}
           </button>
        </div>
      ) : (
        <main className="flex-1 grid grid-cols-12 gap-6 p-6 overflow-hidden min-h-0">
          <section className="col-span-3 flex flex-col gap-6">
             <div className="bg-[#1c212b] rounded-3xl border border-white/5 overflow-hidden shadow-2xl relative">
                <div className="aspect-[4/5] relative">
                   <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=600&h=750" alt="Sarah" className="w-full h-full object-cover grayscale brightness-75" />
                   <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-2 border border-white/10">
                      <div className="size-2 bg-blue-500 rounded-full animate-pulse shadow-[0_0_8px_#3b82f6]"></div>
                      <span className="text-[10px] font-black uppercase tracking-widest">Listening</span>
                   </div>
                   <div className="absolute bottom-6 left-6">
                      <h2 className="text-2xl font-black tracking-tight leading-tight">Sarah</h2>
                      <p className="text-text-secondary text-xs font-bold mt-1">Senior HR Manager</p>
                   </div>
                </div>
             </div>
             <div className="bg-[#1c212b] rounded-2xl border border-white/5 p-6 space-y-6">
                <div className="space-y-2">
                   <div className="flex items-center gap-2 text-[10px] font-black text-text-secondary uppercase tracking-widest opacity-60">
                      <span className="material-symbols-outlined text-sm">psychology</span>
                      Style
                   </div>
                   <p className="text-sm font-bold">Behavioral & Technical</p>
                </div>
                <div className="space-y-2">
                   <div className="flex items-center gap-2 text-[10px] font-black text-text-secondary uppercase tracking-widest opacity-60">
                      <span className="material-symbols-outlined text-sm">speed</span>
                      Pacing
                   </div>
                   <p className="text-sm font-bold">Moderate, probing questions</p>
                </div>
             </div>
          </section>

          <section className="col-span-6 flex flex-col bg-[#1c212b] rounded-[32px] border border-white/5 shadow-2xl overflow-hidden relative">
             <div className="h-14 flex items-center justify-center border-b border-white/5 bg-black/20">
                <span className="text-[10px] font-black text-text-secondary uppercase tracking-[0.3em] opacity-40">Session Started {new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
             </div>
             <div ref={scrollRef} className="flex-1 overflow-y-auto p-10 space-y-12 custom-scrollbar">
                {transcript.map((m, i) => (
                   <div key={i} className={`flex items-start gap-4 ${m.sender === 'You' ? 'flex-row-reverse' : ''} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                      <div className={`size-10 rounded-full overflow-hidden shrink-0 border border-white/10 ${m.sender === 'You' ? 'bg-[#d2b48c]' : ''}`}>
                         {m.sender === 'Sarah' ? <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=100&h=100" alt="Sarah" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-white uppercase">{user?.name?.slice(0, 1)}</div>}
                      </div>
                      <div className={`flex flex-col gap-2 ${m.sender === 'You' ? 'items-end' : ''}`}>
                         <div className="flex items-center gap-2 text-[10px] font-black text-text-secondary/60 uppercase tracking-widest">
                            {m.sender} <span className="opacity-40">{m.time}</span>
                         </div>
                         <div className={`p-6 rounded-2xl max-w-[450px] text-base leading-relaxed ${m.sender === 'Sarah' ? 'bg-white/5 text-gray-200 rounded-tl-none border border-white/5' : 'bg-[#1e273d] text-gray-200 rounded-tr-none border border-white/10 shadow-lg'}`}>
                            {m.text}
                         </div>
                      </div>
                   </div>
                ))}
                {(liveSarahText || liveUserText) && (
                   <div className={`flex items-start gap-4 ${liveUserText ? 'flex-row-reverse' : ''} animate-in fade-in duration-200`}>
                      <div className={`size-10 rounded-full overflow-hidden shrink-0 border border-white/10 ${liveUserText ? 'bg-[#d2b48c]' : ''}`}>
                        {liveSarahText ? <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=100&h=100" alt="Sarah" className="w-full h-full object-cover rounded-full" /> : <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-white uppercase">{user?.name?.slice(0, 1)}</div>}
                      </div>
                      <div className={`p-6 rounded-2xl max-w-[450px] italic opacity-60 text-base shadow-xl ${liveUserText ? 'bg-[#1e273d] rounded-tr-none border border-white/10' : 'bg-white/5 rounded-tl-none border border-white/5'}`}>
                         {liveSarahText || liveUserText}
                         <span className="inline-block w-1 h-4 bg-primary animate-blink ml-1 align-middle"></span>
                      </div>
                   </div>
                )}
             </div>
             <div className="h-24 bg-black/40 backdrop-blur-md border-t border-white/5 flex items-center px-10 gap-10">
                <div className={`size-10 ${isMuted ? 'bg-red-500/20 text-red-500 border-red-500/20' : 'bg-primary/20 text-primary border-primary/20'} rounded-full flex items-center justify-center shrink-0 border`}>
                   <span className="material-symbols-outlined text-xl">{isMuted ? 'mic_off' : 'mic'}</span>
                </div>
                <div className="flex-1 flex items-center gap-1.5 h-10 justify-center">
                   {[...Array(30)].map((_, i) => (
                      <div key={i} className={`w-1 bg-primary rounded-full transition-all duration-300 ${!isMuted && !isPaused ? 'animate-pulse' : 'h-1'}`} style={{ height: !isMuted && !isPaused ? `${30 + Math.random() * 70}%` : '2px', animationDelay: `${i * 0.04}s` }}></div>
                   ))}
                </div>
                <div className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] opacity-60 w-24 text-right">{isPaused ? 'Paused' : isMuted ? 'Muted' : 'Listening...'}</div>
             </div>
          </section>

          <section className="col-span-3 flex flex-col gap-6">
             <div className="bg-[#1c212b] rounded-3xl border border-white/5 p-8 flex flex-col items-center shadow-2xl">
                <h3 className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] mb-4 opacity-60">Session Timer</h3>
                <div className="text-6xl font-black tracking-tighter tabular-nums mb-2 font-mono text-primary">{formatTime(timer)}</div>
                <div className="text-[10px] font-bold text-text-secondary opacity-40">/ {config?.duration || 15}:00 min</div>
             </div>
             <div className="flex-1 bg-[#1c212b] rounded-3xl border border-white/5 p-8 flex flex-col shadow-2xl overflow-hidden min-h-0">
                <div className="flex justify-between items-center mb-6">
                   <h3 className="text-sm font-black uppercase tracking-widest text-white">Current Focus</h3>
                   <div className="px-2 py-1 bg-primary/20 text-primary text-[10px] font-black rounded border border-primary/20">Q{currentQuestionIndex} / 8</div>
                </div>
                <div className="space-y-6">
                   <div className="p-6 rounded-2xl bg-black/20 border-l-4 border-primary space-y-4 shadow-xl">
                      <p className="text-sm font-bold text-gray-200 leading-relaxed italic">
                        "Sarah is exploring your technical depth and solution design..."
                      </p>
                      <div className="flex flex-wrap gap-2">
                         {config?.focusAreas.map((area, i) => (
                           <span key={i} className="px-2 py-1 rounded bg-white/5 border border-white/10 text-[9px] font-black uppercase tracking-widest text-text-secondary">{area}</span>
                         ))}
                      </div>
                   </div>
                   <div className="space-y-4 pt-6 border-t border-white/5">
                      <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest opacity-40">Up Next</p>
                      <div className="flex items-center gap-4 opacity-30">
                         <span className="material-symbols-outlined text-sm">lock</span>
                         <p className="text-[11px] font-bold">Hidden until current question answered</p>
                      </div>
                   </div>
                </div>
             </div>
             <div className="bg-[#1c212b] rounded-3xl border border-white/5 p-4 flex items-center justify-between shadow-2xl shrink-0">
                <button onClick={() => setIsMuted(!isMuted)} className={`flex flex-col items-center gap-1 group transition-all ${isMuted ? 'text-red-500' : 'text-text-secondary hover:text-white'}`}>
                   <div className={`size-10 rounded-full flex items-center justify-center transition-all ${isMuted ? 'bg-red-500/10 border-red-500/20' : 'bg-white/5 border-white/10 group-hover:bg-white/10'}`}>
                      <span className="material-symbols-outlined text-lg">{isMuted ? 'mic_off' : 'mic'}</span>
                   </div>
                   <span className="text-[9px] font-black uppercase tracking-widest">Mute</span>
                </button>
                <button onClick={() => setIsPaused(!isPaused)} className={`flex flex-col items-center gap-1 group transition-all ${isPaused ? 'text-primary' : 'text-text-secondary hover:text-white'}`}>
                   <div className={`size-10 rounded-full flex items-center justify-center transition-all ${isPaused ? 'bg-primary/10 border-primary/20' : 'bg-white/5 border-white/10 group-hover:bg-white/10'}`}>
                      <span className="material-symbols-outlined text-lg">{isPaused ? 'play_arrow' : 'pause'}</span>
                   </div>
                   <span className="text-[9px] font-black uppercase tracking-widest">{isPaused ? 'Resume' : 'Pause'}</span>
                </button>
                <button onClick={handleFinish} className="flex flex-col items-center gap-1 group text-text-secondary hover:text-red-500 transition-all">
                   <div className="size-10 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center group-hover:bg-red-500/20 transition-all shadow-lg">
                      <span className="material-symbols-outlined text-lg">call_end</span>
                   </div>
                   <span className="text-[9px] font-black uppercase tracking-widest">End Session</span>
                </button>
             </div>
          </section>
        </main>
      )}
      <style>{`.custom-scrollbar::-webkit-scrollbar { width: 4px; } .custom-scrollbar::-webkit-scrollbar-thumb { background: #3c4253; border-radius: 10px; }`}</style>
    </div>
  );
};

export default InterviewScreen;
