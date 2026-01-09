
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
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [isWrappingUp, setIsWrappingUp] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameIntervalRef = useRef<number | null>(null);
  const inputAudioCtxRef = useRef<AudioContext | null>(null);
  const outputAudioCtxRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const sessionPromiseRef = useRef<Promise<any> | null>(null);

  const userTextBuffer = useRef("");
  const sarahTextBuffer = useRef("");
  const transcriptRef = useRef<{ sender: 'Sarah' | 'You'; text: string; time: string }[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('pending_interview_config');
    if (saved) setConfig(JSON.parse(saved));
    localStorage.removeItem('last_interview_transcript');
    return () => cleanupAll();
  }, []);

  useEffect(() => {
    transcriptRef.current = transcript;
  }, [transcript]);

  useEffect(() => {
    let interval: any;
    if (isSessionActive && !isPaused) {
      interval = setInterval(() => {
        setTimer(t => {
          const next = t + 1;
          const limitSeconds = (config?.duration || 15) * 60;
          
          if (next % 60 === 0 && sessionPromiseRef.current) {
            const remaining = Math.max(0, limitSeconds - next);
            sessionPromiseRef.current.then(s => s.sendRealtimeInput({ 
              text: `[SYSTEM: ${Math.floor(remaining / 60)} minutes left. Manage pace. Do not respond verbally.]` 
            }));
          }

          if (limitSeconds - next <= 60 && !isWrappingUp) triggerWrapUp();
          if (next >= limitSeconds) { handleFinish(); return t; }
          return next;
        });
      }, 1000);
    }
    return () => { if (interval) clearInterval(interval); };
  }, [isSessionActive, isPaused, config, isWrappingUp]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [transcript, liveUserText, liveSarahText]);

  const triggerWrapUp = () => {
    setIsWrappingUp(true);
    sessionPromiseRef.current?.then(session => {
      session.sendRealtimeInput({
        text: `[SYSTEM: Wrap up now in ${config?.language}. Conclude with final thoughts.]`
      });
    });
  };

  const cleanupAll = useCallback(() => {
    if (frameIntervalRef.current) clearInterval(frameIntervalRef.current);
    if (sessionPromiseRef.current) {
      sessionPromiseRef.current.then(session => { try { session.close(); } catch (e) {} });
      sessionPromiseRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    const closeCtx = (ctx: AudioContext | null) => { if (ctx && ctx.state !== 'closed') ctx.close().catch(() => {}); };
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

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
      mediaStreamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;

      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        config: {
          responseModalities: [Modality.AUDIO],
          outputAudioTranscription: {},
          inputAudioTranscription: {},
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } },
          systemInstruction: `You are Sarah, a Lead HR Manager.
          - ULTRA-PATIENCE POLICY: You MUST NOT interrupt the candidate. 
          - WAIT 3+ SECONDS of absolute silence before you start speaking. 
          - The candidate might pause to think; if you are unsure, WAIT LONGER.
          - If the user starts talking while you are talking, STOP IMMEDIATELY (Interruption callback will handle this).
          - ROLE: ${config.role}. 
          - LANGUAGE: ${config.language}.
          - CONTEXT: ${config.customQuestions}`
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

            frameIntervalRef.current = window.setInterval(() => {
              if (isPaused || isCameraOff || !videoRef.current || !canvasRef.current) return;
              const ctx = canvasRef.current.getContext('2d');
              if (!ctx) return;
              canvasRef.current.width = 320;
              canvasRef.current.height = 240;
              ctx.drawImage(videoRef.current, 0, 0, 320, 240);
              const base64 = canvasRef.current.toDataURL('image/jpeg', 0.5).split(',')[1];
              sessionPromise.then(s => s.sendRealtimeInput({ media: { data: base64, mimeType: 'image/jpeg' } }));
            }, 2000);

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
              if (sarahTextBuffer.current.trim()) { setTranscript(prev => [...prev, { sender: 'Sarah', text: sarahTextBuffer.current.trim(), time: timestamp }]); sarahTextBuffer.current = ""; setLiveSarahText(""); }
              if (userTextBuffer.current.trim()) { setTranscript(prev => [...prev, { sender: 'You', text: userTextBuffer.current.trim(), time: timestamp }]); userTextBuffer.current = ""; setLiveUserText(""); }
            }
            if (msg.serverContent?.interrupted) { 
              for (const s of sourcesRef.current) { try { s.stop(); } catch(e) {} } 
              sourcesRef.current.clear(); 
              nextStartTimeRef.current = 0; 
              sarahTextBuffer.current = ""; 
              setLiveSarahText("");
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
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    let finalTranscript = [...transcriptRef.current];
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
      <nav className="flex items-center justify-between px-4 md:px-8 py-3 bg-[#161b22]/90 border-b border-white/5 shrink-0 z-50">
        <div className="flex items-center gap-3 md:gap-6">
          <div className="flex items-center gap-2">
            <div className="size-6 md:size-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-base md:text-xl">graphic_eq</span>
            </div>
            <span className="text-sm md:text-lg font-bold tracking-tight">MockInterview.ai</span>
          </div>
          <div className="hidden md:block h-4 w-px bg-white/10 mx-2"></div>
          <div className="hidden md:flex items-center gap-3 text-xs font-medium text-text-secondary">
             <span>{config?.role}</span>
             <span className="opacity-20">/</span>
             <span className="text-white">{config?.language}</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-[10px] md:text-xs font-black text-primary tabular-nums bg-primary/10 px-3 py-1 rounded-full border border-primary/20">{formatTime(timer)}</div>
          <div className="size-8 rounded-full border border-white/10 overflow-hidden bg-slate-700">
             <img src={`https://i.pravatar.cc/150?u=${user?.id}`} alt="User" />
          </div>
        </div>
      </nav>

      {!isSessionActive ? (
        <div className="flex-1 flex flex-col items-center justify-center p-6 space-y-8">
           <div className="size-24 bg-primary/10 rounded-[32px] flex items-center justify-center border border-primary/20">
              <span className={`material-symbols-outlined text-5xl text-primary ${isConnecting ? 'animate-spin' : ''}`}>
                 {isConnecting ? 'sync' : 'mic'}
              </span>
           </div>
           <div className="text-center space-y-2">
              <h2 className="text-3xl font-black">Sarah is ready</h2>
              <p className="text-sm text-text-secondary max-w-xs">Waiting for your entrance.</p>
           </div>
           <button onClick={handleJoinSession} disabled={isConnecting} className="w-full max-w-xs px-10 py-4 bg-primary rounded-2xl font-bold shadow-xl shadow-primary/30 transition-all uppercase tracking-widest text-xs">
              {isConnecting ? 'Preparing...' : 'Start Interview'}
           </button>
        </div>
      ) : (
        <main className="flex-1 flex flex-col lg:grid lg:grid-cols-12 gap-4 md:gap-6 p-4 md:p-6 overflow-hidden min-h-0">
          <section className="lg:col-span-3 flex lg:flex-col gap-4 md:gap-6 shrink-0 overflow-x-auto lg:overflow-visible no-scrollbar">
             <div className="bg-[#1c212b] rounded-2xl md:rounded-3xl border border-white/5 overflow-hidden shadow-2xl relative min-w-[280px] lg:min-w-0">
                <video ref={videoRef} autoPlay playsInline muted className={`w-full h-full object-cover aspect-[4/3] lg:aspect-[4/5] ${isCameraOff ? 'hidden' : ''}`} />
                {isCameraOff && <div className="aspect-[4/3] lg:aspect-[4/5] bg-black/40 flex items-center justify-center"><span className="material-symbols-outlined text-4xl text-text-secondary">videocam_off</span></div>}
             </div>
             <div className="bg-[#1c212b] rounded-2xl md:rounded-3xl border border-white/5 overflow-hidden shadow-2xl relative min-w-[280px] lg:min-w-0">
                <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=600&h=750" alt="Sarah" className="w-full h-full object-cover grayscale brightness-75 aspect-[4/3] lg:aspect-[4/5]" />
                <div className="absolute bottom-6 left-6 text-white"><h2 className="text-lg md:text-2xl font-black">Sarah</h2></div>
             </div>
          </section>

          <section className="lg:col-span-6 flex flex-col bg-[#1c212b] rounded-2xl md:rounded-[32px] border border-white/5 shadow-2xl overflow-hidden relative min-h-0 flex-1">
             <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 md:p-10 space-y-8 md:space-y-12 custom-scrollbar">
                {transcript.map((m, i) => (
                   <div key={i} className={`flex items-start gap-3 md:gap-4 ${m.sender === 'You' ? 'flex-row-reverse' : ''} animate-in fade-in duration-300`}>
                      <div className={`p-4 md:p-6 rounded-2xl max-w-[85vw] md:max-w-[450px] text-sm md:text-base leading-relaxed ${m.sender === 'Sarah' ? 'bg-white/5 text-gray-200' : 'bg-primary/20 text-white shadow-lg'}`}>
                         {m.text}
                      </div>
                   </div>
                ))}
                {(liveSarahText || liveUserText) && (
                   <div className={`flex items-start gap-3 md:gap-4 ${liveUserText ? 'flex-row-reverse' : ''} animate-in fade-in duration-200`}>
                      <div className={`p-4 md:p-6 rounded-2xl max-w-[85vw] md:max-w-[450px] italic opacity-60 text-sm md:text-base shadow-xl ${liveUserText ? 'bg-primary/10' : 'bg-white/5'}`}>
                         {liveSarahText || liveUserText}
                         <span className="inline-block w-1 h-4 bg-primary animate-blink ml-1 align-middle"></span>
                      </div>
                   </div>
                )}
             </div>
             <div className="h-16 md:h-24 bg-black/40 backdrop-blur-md border-t border-white/5 flex items-center px-4 md:px-10 gap-4 md:gap-10 shrink-0">
                <div className={`size-8 md:size-10 ${isMuted ? 'bg-red-500/20 text-red-500 border-red-500/20' : 'bg-primary/20 text-primary border-primary/20'} rounded-full flex items-center justify-center shrink-0 border`}>
                   <span className="material-symbols-outlined text-base md:text-xl">{isMuted ? 'mic_off' : 'mic'}</span>
                </div>
                <div className="flex-1 flex items-center gap-1 h-6 md:h-10 justify-center">
                   {[...Array(30)].map((_, i) => (
                      <div key={i} className={`w-1 bg-primary rounded-full transition-all duration-300 ${!isMuted && !isPaused ? 'animate-pulse' : 'h-1'}`} style={{ height: !isMuted && !isPaused ? `${30 + Math.random() * 70}%` : '2px', animationDelay: `${i * 0.04}s` }}></div>
                   ))}
                </div>
                <div className="hidden sm:block text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] opacity-60 w-24 text-right">{isPaused ? 'Paused' : isMuted ? 'Muted' : 'Listening...'}</div>
             </div>
          </section>

          <section className="lg:col-span-3 flex lg:flex-col gap-4 md:gap-6 shrink-0">
             <div className="hidden lg:flex bg-[#1c212b] rounded-3xl border border-white/5 p-8 flex-col items-center shadow-2xl">
                <div className="text-6xl font-black tracking-tighter tabular-nums mb-2 font-mono text-primary">{formatTime(timer)}</div>
                <div className="text-[10px] font-bold text-text-secondary opacity-40">Target: {config?.duration || 15}m</div>
             </div>
             
             <div className="flex-1 bg-[#1c212b] rounded-2xl md:rounded-3xl border border-white/5 p-4 md:p-8 flex flex-col shadow-2xl overflow-hidden min-h-0">
                <div className="space-y-4">
                   <div className="p-4 rounded-2xl bg-black/20 border border-white/5 flex items-center gap-3">
                      <div className="size-2 bg-green-500 rounded-full animate-pulse"></div>
                      <p className="text-[10px] font-black uppercase">Patience Control Active</p>
                   </div>
                   <p className="text-[9px] text-text-secondary leading-relaxed italic opacity-40">Sarah is waiting for 3 seconds of silence after your turn before concluding.</p>
                </div>
             </div>

             <div className="bg-[#1c212b] rounded-2xl md:rounded-3xl border border-white/5 p-4 flex items-center justify-between shadow-2xl shrink-0 gap-2">
                <button onClick={() => setIsMuted(!isMuted)} className={`flex flex-col items-center gap-1 flex-1 ${isMuted ? 'text-red-500' : 'text-text-secondary hover:text-white'}`}>
                   <div className={`size-10 rounded-full flex items-center justify-center transition-all ${isMuted ? 'bg-red-500/10 border-red-500/20' : 'bg-white/5 border-white/10'}`}>
                      <span className="material-symbols-outlined text-lg">{isMuted ? 'mic_off' : 'mic'}</span>
                   </div>
                </button>
                <button onClick={() => setIsPaused(!isPaused)} className={`flex flex-col items-center gap-1 flex-1 ${isPaused ? 'text-primary' : 'text-text-secondary hover:text-white'}`}>
                   <div className={`size-10 rounded-full flex items-center justify-center transition-all ${isPaused ? 'bg-primary/10 border-primary/20' : 'bg-white/5 border-white/10'}`}>
                      <span className="material-symbols-outlined text-lg">{isPaused ? 'play_arrow' : 'pause'}</span>
                   </div>
                </button>
                <button onClick={handleFinish} className="flex flex-col items-center gap-1 text-text-secondary hover:text-red-500 transition-all flex-1">
                   <div className="size-10 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                      <span className="material-symbols-outlined text-lg">call_end</span>
                   </div>
                </button>
             </div>
          </section>
        </main>
      )}
      <canvas ref={canvasRef} className="hidden" />
      <style>{`.custom-scrollbar::-webkit-scrollbar { width: 4px; } .custom-scrollbar::-webkit-scrollbar-thumb { background: #3c4253; border-radius: 10px; }`}</style>
    </div>
  );
};

export default InterviewScreen;
