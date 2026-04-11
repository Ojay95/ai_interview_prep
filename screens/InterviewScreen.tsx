
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Screen, User, InterviewConfig } from '../types';
import { GoogleGenAI, Modality, LiveServerMessage } from '@google/genai';
import { floatTo16BitPCM, encodeBase64, decodeBase64, decodeAudioData } from '../services/geminiService';

interface InterviewScreenProps {
  user: User | null;
  onNavigate: (screen: Screen) => void;
}

const InterviewScreen: React.FC<InterviewScreenProps> = ({ user, onNavigate }) => {
  // --- UI State ---
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [timer, setTimer] = useState(0);
  const [transcript, setTranscript] = useState<{ sender: 'Sarah' | 'You'; text: string; time: string }[]>([]);
  const [liveUserText, setLiveUserText] = useState("");
  const [liveSarahText, setLiveSarahText] = useState("");
  const [config, setConfig] = useState<InterviewConfig | null>(null);

  // --- Refs (Crucial for callbacks & high-frequency loops) ---
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const inputAudioCtxRef = useRef<AudioContext | null>(null);
  const outputAudioCtxRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const scrollRef = useRef<HTMLDivElement>(null);
  const sessionPromiseRef = useRef<Promise<any> | null>(null);
  
  // Persistence Refs (Prevent Stale Closures)
  const isPausedRef = useRef(false);
  const isMutedRef = useRef(false);
  const userTextBuffer = useRef("");
  const sarahTextBuffer = useRef("");
  const transcriptRef = useRef<any[]>([]);
  const isMounted = useRef(true);

  // Keep refs in sync with state
  useEffect(() => { isPausedRef.current = isPaused; }, [isPaused]);
  useEffect(() => { isMutedRef.current = isMuted; }, [isMuted]);
  useEffect(() => { transcriptRef.current = transcript; }, [transcript]);

  // --- Cleanup Utility ---
  const cleanupAll = useCallback(() => {
    isMounted.current = false;
    
    // 1. Stop Camera & Mic Tracks
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => {
        track.stop();
        track.enabled = false;
      });
      mediaStreamRef.current = null;
    }

    // 2. Clear HTML Video
    if (videoRef.current) videoRef.current.srcObject = null;

    // 3. Close Gemini Session
    if (sessionPromiseRef.current) {
      sessionPromiseRef.current.then(session => {
        if (session) {
          try { session.close(); } catch {
            // Ignore session close errors
          }
        }
      });
      sessionPromiseRef.current = null;
    }

    // 4. Stop Playing Audio
    sourcesRef.current.forEach(s => { try { s.stop(); } catch {
      // Ignore audio stop errors
    } });
    sourcesRef.current.clear();

    // 5. Shutdown Audio Contexts
    const closeCtx = (ctxRef: React.MutableRefObject<AudioContext | null>) => {
      if (ctxRef.current && ctxRef.current.state !== 'closed') {
        ctxRef.current.close().catch(() => {});
      }
      ctxRef.current = null;
    };
    closeCtx(inputAudioCtxRef);
    closeCtx(outputAudioCtxRef);

    nextStartTimeRef.current = 0;
  }, []);

  const handleFinish = useCallback(() => {
    localStorage.setItem('last_interview_transcript', JSON.stringify(transcriptRef.current));
    localStorage.setItem('last_interview_role', config?.role || 'Professional Role');
    cleanupAll();
    onNavigate(Screen.Analysis);
  }, [config, cleanupAll, onNavigate]);

  // Initialization
  useEffect(() => {
    isMounted.current = true;
    const saved = localStorage.getItem('pending_interview_config');
    if (saved) setConfig(JSON.parse(saved));
    
    return () => { cleanupAll(); };
  }, [cleanupAll]);

  // --- Timer & System Triggers ---
  useEffect(() => {
    let interval: number;
    if (isSessionActive && !isPaused) {
      interval = window.setInterval(() => {
        setTimer(t => {
          const limit = (config?.duration || 15) * 60;
          if (t >= limit) {
            handleFinish();
            return t;
          }
          return t + 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isSessionActive, isPaused, config, handleFinish]);

  // Auto-scroll transcript
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [transcript, liveUserText, liveSarahText]);

  // --- Audio/Video Processing ---
  const handleServerMessage = async (msg: LiveServerMessage) => {
    if (!isMounted.current) return;

    // 1. Handle Audio Chunks
    const audioData = msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
    if (audioData && !isPausedRef.current && outputAudioCtxRef.current) {
      const buffer = await decodeAudioData(decodeBase64(audioData), outputAudioCtxRef.current);
      const source = outputAudioCtxRef.current.createBufferSource();
      source.buffer = buffer;
      source.connect(outputAudioCtxRef.current.destination);

      const now = outputAudioCtxRef.current.currentTime;
      const startTime = Math.max(nextStartTimeRef.current, now);
      
      source.start(startTime);
      nextStartTimeRef.current = startTime + buffer.duration;
      sourcesRef.current.add(source);
      source.onended = () => sourcesRef.current.delete(source);
    }

    // 2. Handle Transcription
    if (msg.serverContent?.outputTranscription) {
      sarahTextBuffer.current += msg.serverContent.outputTranscription.text;
      setLiveSarahText(sarahTextBuffer.current);
    }
    if (msg.serverContent?.inputTranscription) {
      userTextBuffer.current += msg.serverContent.inputTranscription.text;
      setLiveUserText(userTextBuffer.current);
    }

    // 3. Handle Turn Completion
    if (msg.serverContent?.turnComplete) {
      const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      if (sarahTextBuffer.current.trim()) {
        setTranscript(p => [...p, { sender: 'Sarah', text: sarahTextBuffer.current.trim(), time }]);
        sarahTextBuffer.current = "";
        setLiveSarahText("");
      }
      if (userTextBuffer.current.trim()) {
        setTranscript(p => [...p, { sender: 'You', text: userTextBuffer.current.trim(), time }]);
        userTextBuffer.current = "";
        setLiveUserText("");
      }
    }

    // 4. Handle Interruptions
    if (msg.serverContent?.interrupted) {
      sourcesRef.current.forEach(s => { try { s.stop(); } catch {
        // Ignore audio stop errors
      } });
      sourcesRef.current.clear();
      nextStartTimeRef.current = 0;
      sarahTextBuffer.current = "";
      setLiveSarahText("");
    }
  };

  const handleJoinSession = async () => {
    if (!config || isConnecting) return;
    setIsConnecting(true);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
        video: { width: 640, height: 480, frameRate: 15 }
      });
      mediaStreamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;

      const inCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const outCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      inputAudioCtxRef.current = inCtx;
      outputAudioCtxRef.current = outCtx;

      const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY || (window as any).GEMINI_API_KEY;
      if (!apiKey) throw new Error("An API Key must be set when running in a browser");
      const ai = new GoogleGenAI({ apiKey });
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        config: {
          responseModalities: [Modality.AUDIO],
          outputAudioTranscription: {},
          inputAudioTranscription: {},
          systemInstruction: `You are Sarah, Lead HR Manager. 
          STRICT PATIENCE MANDATE: 
          1. NEVER interrupt the candidate. 
          2. WAIT 3 SECONDS after they finish speaking.
          3. ROLE: ${config.role}. Language: ${config.language}.`,
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } }
        },
        callbacks: {
          onopen: () => {
            if (!isMounted.current) return;
            setIsSessionActive(true);
            setIsConnecting(false);
            
            // Start Audio Processing
            const source = inCtx.createMediaStreamSource(stream);
            const processor = inCtx.createScriptProcessor(4096, 1, 1);
            processor.onaudioprocess = (e) => {
              if (isMutedRef.current || isPausedRef.current || !isMounted.current) return;
              const pcm = floatTo16BitPCM(e.inputBuffer.getChannelData(0));
              sessionPromise.then(session => {
                session.sendRealtimeInput({ media: { data: encodeBase64(pcm), mimeType: 'audio/pcm;rate=16000' } });
              });
            };
            source.connect(processor);
            processor.connect(inCtx.destination);

            // Start Video Processing
            const vInterval = setInterval(() => {
              if (isPausedRef.current || !videoRef.current || !canvasRef.current || !isMounted.current) {
                 if (!isMounted.current) clearInterval(vInterval);
                 return;
              }
              const ctx = canvasRef.current.getContext('2d');
              if (!ctx) return;
              ctx.drawImage(videoRef.current, 0, 0, 320, 240);
              const base64 = canvasRef.current.toDataURL('image/jpeg', 0.5).split(',')[1];
              sessionPromise.then(session => {
                session.sendRealtimeInput({ media: { data: base64, mimeType: 'image/jpeg' } });
              });
            }, 2000);
          },
          onmessage: handleServerMessage,
          onclose: () => setIsSessionActive(false),
          onerror: (e) => console.error("Gemini Error:", e)
        }
      });
      sessionPromiseRef.current = sessionPromise;
    } catch (err) {
      console.error("Join Session Error:", err);
      alert("Microphone/Camera access denied or connection failed.");
      setIsConnecting(false);
      cleanupAll();
    }
  };

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  return (
    <div className="flex flex-col h-screen bg-[#0f121a] text-white overflow-hidden font-display">
      <nav className="flex items-center justify-between px-4 lg:px-8 py-3 bg-[#161b22]/90 border-b border-white/5 shrink-0 z-50">
        <div className="flex items-center gap-3 lg:gap-6">
          <div className="flex items-center gap-2">
            <div className="size-7 lg:size-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-lg lg:text-xl">graphic_eq</span>
            </div>
            <span className="text-sm lg:text-lg font-bold tracking-tight">MockInterview.ai</span>
          </div>
          <div className="hidden sm:block h-4 w-px bg-white/10 mx-2"></div>
          <div className="hidden sm:flex items-center gap-3 text-[10px] lg:text-xs font-medium text-text-secondary">
             <span>{config?.role}</span>
             <span className="opacity-20">/</span>
             <span className="text-white">{config?.language}</span>
          </div>
        </div>
        <div className="flex items-center gap-3 lg:gap-4">
          <div className="text-[10px] lg:text-xs font-black text-primary tabular-nums bg-primary/10 px-2 lg:px-3 py-1 rounded-full border border-primary/20">{formatTime(timer)}</div>
          <div className="size-7 lg:size-8 rounded-full border border-white/10 overflow-hidden bg-slate-700">
             <img src={`https://i.pravatar.cc/150?u=${user?.id}`} alt="User" />
          </div>
        </div>
      </nav>

      {!isSessionActive ? (
        <div className="flex-1 flex flex-col items-center justify-center p-6 space-y-6 lg:space-y-8">
           <div className="size-20 lg:size-24 bg-primary/10 rounded-[24px] lg:rounded-[32px] flex items-center justify-center border border-primary/20">
              <span className={`material-symbols-outlined text-4xl lg:text-5xl text-primary ${isConnecting ? 'animate-spin' : ''}`}>
                 {isConnecting ? 'sync' : 'mic'}
              </span>
           </div>
           <div className="text-center space-y-2">
              <h2 className="text-2xl lg:text-3xl font-black">Sarah is ready</h2>
              <p className="text-xs lg:text-sm text-text-secondary max-w-xs">Waiting for you to enter the virtual room.</p>
           </div>
           <button onClick={handleJoinSession} disabled={isConnecting} className="w-full max-w-xs px-8 lg:px-10 py-3 lg:py-4 bg-primary rounded-2xl font-bold shadow-xl shadow-primary/30 transition-all uppercase tracking-widest text-[10px] lg:text-xs">
              {isConnecting ? 'Configuring AI...' : 'Start Interview'}
           </button>
        </div>
      ) : (
        <main className="flex-1 flex flex-col lg:grid lg:grid-cols-12 gap-4 lg:gap-6 p-4 lg:p-6 overflow-hidden min-h-0">
          {/* Feed Column */}
          <section className="lg:col-span-3 flex lg:flex-col gap-4 lg:gap-6 overflow-x-auto lg:overflow-visible no-scrollbar shrink-0">
              <div className="bg-[#1c212b] rounded-2xl lg:rounded-3xl border border-white/5 overflow-hidden shadow-2xl relative min-w-[160px] sm:min-w-[200px] lg:min-w-0 flex-1 lg:flex-none">
                <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover aspect-square lg:aspect-[4/5]" />
                <div className="absolute bottom-2 lg:bottom-4 left-2 lg:left-4 flex gap-2">
                   <div className="px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-[8px] lg:text-[10px] font-bold">You</div>
                </div>
              </div>
              <div className="bg-[#1c212b] rounded-2xl lg:rounded-3xl border border-white/5 overflow-hidden shadow-2xl relative min-w-[160px] sm:min-w-[200px] lg:min-w-0 flex-1 lg:flex-none">
                <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=600&h=750" alt="Sarah" className="w-full h-full object-cover grayscale brightness-75 aspect-square lg:aspect-[4/5]" />
                <div className="absolute bottom-3 lg:bottom-6 left-3 lg:left-6 text-white"><h2 className="text-lg lg:text-2xl font-black">Sarah</h2></div>
              </div>
          </section>

          {/* Transcript Column */}
          <section className="lg:col-span-6 flex flex-col bg-[#1c212b] rounded-[24px] lg:rounded-[32px] border border-white/5 shadow-2xl overflow-hidden relative min-h-0 flex-1">
              <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 lg:p-8 space-y-6 lg:space-y-8 custom-scrollbar">
                {transcript.map((m, i) => (
                   <div key={i} className={`flex flex-col ${m.sender === 'You' ? 'items-end' : 'items-start'} animate-in fade-in slide-in-from-bottom-2`}>
                      <span className="text-[8px] lg:text-[10px] font-black uppercase text-text-secondary mb-1 lg:mb-2 px-1">{m.sender}</span>
                      <div className={`p-3 lg:p-5 rounded-2xl max-w-[90%] lg:max-w-[85%] text-xs lg:text-sm leading-relaxed ${m.sender === 'Sarah' ? 'bg-white/5 text-gray-300' : 'bg-primary text-white shadow-lg'}`}>
                         {m.text}
                      </div>
                   </div>
                ))}
                {(liveSarahText || liveUserText) && (
                   <div className={`flex flex-col ${liveUserText ? 'items-end' : 'items-start'} opacity-60`}>
                      <div className={`p-3 lg:p-5 rounded-2xl max-w-[90%] lg:max-w-[85%] italic text-xs lg:text-sm ${liveUserText ? 'bg-primary/20' : 'bg-white/5'}`}>
                         {liveSarahText || liveUserText}
                         <span className="inline-block w-1 h-3 lg:h-4 bg-primary animate-pulse ml-1 align-middle"></span>
                      </div>
                   </div>
                )}
              </div>
              
              {/* Audio Visualizer Footer */}
              <div className="h-14 lg:h-20 bg-black/40 backdrop-blur-md border-t border-white/5 flex items-center px-4 lg:px-8 gap-4 lg:gap-6 shrink-0">
                <div className={`size-8 lg:size-10 rounded-full flex items-center justify-center border transition-all ${isMuted ? 'bg-red-500/10 border-red-500/20 text-red-500' : 'bg-primary/10 border-primary/20 text-primary'}`}>
                    <span className="material-symbols-outlined text-lg lg:text-xl">{isMuted ? 'mic_off' : 'mic'}</span>
                </div>
                <div className="flex-1 flex items-center gap-1 h-4 lg:h-6 justify-center">
                    {[...Array(16)].map((_, i) => (
                      <div key={i} className={`w-0.5 lg:w-1 bg-primary rounded-full transition-all duration-300 ${!isMuted && !isPaused ? 'animate-pulse' : 'h-1'}`} 
                           style={{ height: !isMuted && !isPaused ? `${40 + Math.random() * 60}%` : '4px', animationDelay: `${i * 0.05}s` }}></div>
                    ))}
                </div>
                <div className="text-[8px] lg:text-[10px] font-black text-text-secondary uppercase tracking-widest w-16 lg:w-24 text-right">
                  {isPaused ? 'Paused' : isMuted ? 'Muted' : 'Live'}
                </div>
              </div>
          </section>

          {/* Controls Column */}
          <section className="lg:col-span-3 flex flex-row lg:flex-col gap-4 lg:gap-6 shrink-0">
             <div className="hidden sm:flex flex-1 lg:flex-none bg-[#1c212b] rounded-2xl lg:rounded-3xl border border-white/5 p-4 lg:p-8 flex-col items-center justify-center shadow-2xl shrink-0">
                <div className="text-2xl lg:text-5xl font-black tracking-tighter tabular-nums mb-1 font-mono text-primary">{formatTime(timer)}</div>
                <div className="text-[8px] lg:text-[10px] font-bold text-text-secondary uppercase tracking-widest">Time Elapsed</div>
             </div>
             
             <div className="hidden lg:flex flex-1 bg-[#1c212b] rounded-3xl border border-white/5 p-8 flex flex-col shadow-2xl relative overflow-hidden min-h-0">
                <div className="space-y-6">
                   <div className="flex items-center gap-3">
                      <div className="size-2 bg-green-500 rounded-full animate-ping"></div>
                      <span className="text-[10px] font-black uppercase tracking-widest">Session Active</span>
                   </div>
                   <p className="text-xs text-text-secondary leading-relaxed italic border-l border-white/10 pl-4">"Sarah is using your camera to analyze eye contact and professional presence. Maintain focus."</p>
                </div>
             </div>

             <div className="flex-1 lg:flex-none bg-[#1c212b] rounded-2xl lg:rounded-3xl border border-white/5 p-2 lg:p-3 flex items-center justify-around shadow-2xl shrink-0">
                <button onClick={() => setIsMuted(!isMuted)} className={`size-10 lg:size-12 rounded-xl lg:rounded-2xl flex items-center justify-center transition-all ${isMuted ? 'bg-red-500/20 text-red-500' : 'bg-white/5 text-text-secondary hover:text-white'}`}>
                   <span className="material-symbols-outlined text-xl lg:text-2xl">{isMuted ? 'mic_off' : 'mic'}</span>
                </button>
                <button onClick={() => setIsPaused(!isPaused)} className={`size-10 lg:size-12 rounded-xl lg:rounded-2xl flex items-center justify-center transition-all ${isPaused ? 'bg-primary/20 text-primary' : 'bg-white/5 text-text-secondary hover:text-white'}`}>
                   <span className="material-symbols-outlined text-xl lg:text-2xl">{isPaused ? 'play_arrow' : 'pause'}</span>
                </button>
                <button onClick={handleFinish} className="size-10 lg:size-12 rounded-xl lg:rounded-2xl bg-red-600/10 text-red-500 hover:bg-red-600 hover:text-white transition-all flex items-center justify-center">
                   <span className="material-symbols-outlined text-xl lg:text-2xl">call_end</span>
                </button>
             </div>
          </section>
        </main>
      )}
      <canvas ref={canvasRef} className="hidden" />
      <style>{`.custom-scrollbar::-webkit-scrollbar { width: 4px; } .custom-scrollbar::-webkit-scrollbar-thumb { background: #3c4253; border-radius: 10px; } .no-scrollbar::-webkit-scrollbar { display: none; }`}</style>
    </div>
  );
};

export default InterviewScreen;
