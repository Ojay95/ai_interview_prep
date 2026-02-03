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
  const activeSessionRef = useRef<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // Persistence Refs (Prevent Stale Closures)
  const isPausedRef = useRef(false);
  const isMutedRef = useRef(false);
  const userTextBuffer = useRef("");
  const sarahTextBuffer = useRef("");
  const transcriptRef = useRef<any[]>([]);

  // Keep refs in sync with state
  useEffect(() => { isPausedRef.current = isPaused; }, [isPaused]);
  useEffect(() => { isMutedRef.current = isMuted; }, [isMuted]);
  useEffect(() => { transcriptRef.current = transcript; }, [transcript]);

  // --- Cleanup Utility ---
  const cleanupAll = useCallback(async () => {
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
    if (activeSessionRef.current) {
      try { await activeSessionRef.current.close(); } catch (e) {}
      activeSessionRef.current = null;
    }

    // 4. Stop Playing Audio
    sourcesRef.current.forEach(s => { try { s.stop(); } catch(e) {} });
    sourcesRef.current.clear();

    // 5. Shutdown Audio Contexts
    const closeCtx = async (ctxRef: React.MutableRefObject<AudioContext | null>) => {
      if (ctxRef.current && ctxRef.current.state !== 'closed') {
        await ctxRef.current.close();
      }
      ctxRef.current = null;
    };
    await closeCtx(inputAudioCtxRef);
    await closeCtx(outputAudioCtxRef);

    nextStartTimeRef.current = 0;
  }, []);

  // Cleanup on Unmount
  useEffect(() => {
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
  }, [isSessionActive, isPaused, config]);

  // Auto-scroll transcript
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [transcript, liveUserText, liveSarahText]);

  // --- Audio/Video Processing ---
  const handleServerMessage = async (msg: LiveServerMessage) => {
    // 1. Handle Audio Chunks
    const audioData = msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
    if (audioData && !isPausedRef.current && outputAudioCtxRef.current) {
      const buffer = await decodeAudioData(decodeBase64(audioData), outputAudioCtxRef.current);
      const source = outputAudioCtxRef.current.createBufferSource();
      source.buffer = buffer;
      source.connect(outputAudioCtxRef.current.destination);

      // Jitter Buffer: Schedule 50ms into the future for smooth playback
      const now = outputAudioCtxRef.current.currentTime;
      const startTime = Math.max(nextStartTimeRef.current, now + 0.05);
      
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

    // 4. Handle Interruptions (User spoke over Sarah)
    if (msg.serverContent?.interrupted) {
      sourcesRef.current.forEach(s => { try { s.stop(); } catch(e) {} });
      sourcesRef.current.clear();
      if (outputAudioCtxRef.current) nextStartTimeRef.current = outputAudioCtxRef.current.currentTime;
      sarahTextBuffer.current = "";
      setLiveSarahText("");
    }
  };

  const handleJoinSession = async () => {
    if (!config || isConnecting) return;
    await cleanupAll();
    setIsConnecting(true);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
        video: { width: 640, height: 480, frameRate: 15 }
      });
      mediaStreamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;

      inputAudioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      outputAudioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });

      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      const session = await ai.live.connect({
        model: 'gemini-2.0-flash-exp',
        config: {
          responseModalities: [Modality.AUDIO],
          systemInstruction: `You are Sarah, Lead HR Manager. 
          STRICT PATIENCE MANDATE: 
          1. NEVER interrupt the candidate. 
          2. WAIT 3 SECONDS after they finish speaking.
          3. ROLE: ${config.role}. Language: ${config.language}.`,
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } }
        },
        callbacks: {
          onopen: () => {
            setIsSessionActive(true);
            setIsConnecting(false);
            
            // Start Audio Processing
            if (inputAudioCtxRef.current && mediaStreamRef.current) {
              const source = inputAudioCtxRef.current.createMediaStreamSource(mediaStreamRef.current);
              const processor = inputAudioCtxRef.current.createScriptProcessor(4096, 1, 1);
              processor.onaudioprocess = (e) => {
                if (isMutedRef.current || isPausedRef.current) return;
                const pcm = floatTo16BitPCM(e.inputBuffer.getChannelData(0));
                activeSessionRef.current?.sendRealtimeInput([{ media: { data: encodeBase64(pcm), mimeType: 'audio/pcm;rate=16000' } }]);
              };
              source.connect(processor);
              processor.connect(inputAudioCtxRef.current.destination);
            }

            // Start Video Processing
            const vInterval = setInterval(() => {
              if (isPausedRef.current || !videoRef.current || !canvasRef.current || !activeSessionRef.current) return;
              const ctx = canvasRef.current.getContext('2d');
              if (!ctx) return;
              ctx.drawImage(videoRef.current, 0, 0, 320, 240);
              const base64 = canvasRef.current.toDataURL('image/jpeg', 0.5).split(',')[1];
              activeSessionRef.current.sendRealtimeInput([{ media: { data: base64, mimeType: 'image/jpeg' } }]);
            }, 2000);
          },
          onmessage: handleServerMessage,
          onclose: () => setIsSessionActive(false),
          onerror: (e) => console.error("Gemini Error:", e)
        }
      });
      activeSessionRef.current = session;
    } catch (err) {
      alert("Microphone/Camera access denied.");
      setIsConnecting(false);
      cleanupAll();
    }
  };

  const handleFinish = () => {
    localStorage.setItem('last_interview_transcript', JSON.stringify(transcriptRef.current));
    localStorage.setItem('last_interview_role', config?.role || 'Professional Role');
    cleanupAll();
    onNavigate(Screen.Analysis);
  };

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  return (
    <div className="flex flex-col h-screen bg-[#0f121a] text-white overflow-hidden font-display">
      <nav className="flex items-center justify-between px-8 py-3 bg-[#161b22]/90 border-b border-white/5 shrink-0 z-50">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="size-8 bg-indigo-500 rounded-lg flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-xl">graphic_eq</span>
            </div>
            <span className="text-lg font-bold tracking-tight">MockInterview.ai</span>
          </div>
          <div className="h-4 w-px bg-white/10 mx-2"></div>
          <div className="flex items-center gap-3 text-xs font-medium text-gray-400">
             <span>{config?.role}</span>
             <span className="opacity-20">/</span>
             <span className="text-white">{config?.language}</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-xs font-black text-indigo-400 tabular-nums bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">{formatTime(timer)}</div>
          <div className="size-8 rounded-full border border-white/10 overflow-hidden bg-slate-700">
             <img src={`https://i.pravatar.cc/150?u=${user?.id}`} alt="User" />
          </div>
        </div>
      </nav>

      {!isSessionActive ? (
        <div className="flex-1 flex flex-col items-center justify-center p-6 space-y-8">
           <div className="size-24 bg-indigo-500/10 rounded-[32px] flex items-center justify-center border border-indigo-500/20">
              <span className={`material-symbols-outlined text-5xl text-indigo-500 ${isConnecting ? 'animate-spin' : ''}`}>
                 {isConnecting ? 'sync' : 'mic'}
              </span>
           </div>
           <div className="text-center space-y-2">
              <h2 className="text-3xl font-black">Sarah is ready</h2>
              <p className="text-sm text-gray-400 max-w-xs">Waiting for you to enter the virtual room.</p>
           </div>
           <button onClick={handleJoinSession} disabled={isConnecting} className="w-full max-w-xs px-10 py-4 bg-indigo-600 hover:bg-indigo-500 rounded-2xl font-bold shadow-xl shadow-indigo-500/20 transition-all uppercase tracking-widest text-xs">
              {isConnecting ? 'Configuring AI...' : 'Start Interview'}
           </button>
        </div>
      ) : (
        <main className="flex-1 flex flex-col lg:grid lg:grid-cols-12 gap-6 p-6 overflow-hidden">
          {/* Feed Column */}
          <section className="lg:col-span-3 flex lg:flex-col gap-6 overflow-x-auto lg:overflow-visible no-scrollbar">
              <div className="bg-[#1c212b] rounded-3xl border border-white/5 overflow-hidden shadow-2xl relative min-w-[280px] lg:min-w-0">
                <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover aspect-[4/5]" />
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
          <section className="lg:col-span-6 flex flex-col bg-[#1c212b] rounded-[32px] border border-white/5 shadow-2xl overflow-hidden relative">
              <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
                {transcript.map((m, i) => (
                   <div key={i} className={`flex flex-col ${m.sender === 'You' ? 'items-end' : 'items-start'} animate-in fade-in slide-in-from-bottom-2`}>
                      <span className="text-[10px] font-black uppercase text-gray-500 mb-2 px-1">{m.sender}</span>
                      <div className={`p-5 rounded-2xl max-w-[85%] text-sm leading-relaxed ${m.sender === 'Sarah' ? 'bg-white/5 text-gray-300' : 'bg-indigo-600 text-white shadow-lg'}`}>
                         {m.text}
                      </div>
                   </div>
                ))}
                {(liveSarahText || liveUserText) && (
                   <div className={`flex flex-col ${liveUserText ? 'items-end' : 'items-start'} opacity-60`}>
                      <div className={`p-5 rounded-2xl max-w-[85%] italic text-sm ${liveUserText ? 'bg-indigo-600/20' : 'bg-white/5'}`}>
                         {liveSarahText || liveUserText}
                         <span className="inline-block w-1 h-4 bg-indigo-500 animate-pulse ml-1 align-middle"></span>
                      </div>
                   </div>
                )}
              </div>
              
              {/* Audio Visualizer Footer */}
              <div className="h-20 bg-black/40 backdrop-blur-md border-t border-white/5 flex items-center px-8 gap-6 shrink-0">
                <div className={`size-10 rounded-full flex items-center justify-center border transition-all ${isMuted ? 'bg-red-500/10 border-red-500/20 text-red-500' : 'bg-indigo-500/10 border-indigo-500/20 text-indigo-500'}`}>
                    <span className="material-symbols-outlined text-xl">{isMuted ? 'mic_off' : 'mic'}</span>
                </div>
                <div className="flex-1 flex items-center gap-1.5 h-6 justify-center">
                    {[...Array(24)].map((_, i) => (
                      <div key={i} className={`w-1 bg-indigo-500 rounded-full transition-all duration-300 ${!isMuted && !isPaused ? 'animate-pulse' : 'h-1'}`} 
                           style={{ height: !isMuted && !isPaused ? `${40 + Math.random() * 60}%` : '4px', animationDelay: `${i * 0.05}s` }}></div>
                    ))}
                </div>
                <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest w-24 text-right">
                  {isPaused ? 'Paused' : isMuted ? 'Muted' : 'Live'}
                </div>
              </div>
          </section>

          {/* Controls Column */}
          <section className="lg:col-span-3 flex flex-col gap-6">
             <div className="bg-[#1c212b] rounded-3xl border border-white/5 p-8 flex flex-col items-center shadow-2xl shrink-0">
                <div className="text-5xl font-black tracking-tighter tabular-nums mb-1 font-mono text-indigo-500">{formatTime(timer)}</div>
                <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Time Elapsed</div>
             </div>
             
             <div className="flex-1 bg-[#1c212b] rounded-3xl border border-white/5 p-8 flex flex-col shadow-2xl relative overflow-hidden">
                <div className="space-y-6">
                   <div className="flex items-center gap-3">
                      <div className="size-2 bg-green-500 rounded-full animate-ping"></div>
                      <span className="text-[10px] font-black uppercase tracking-widest">Session Active</span>
                   </div>
                   <p className="text-xs text-gray-500 leading-relaxed italic border-l border-white/10 pl-4">"Sarah is using your camera to analyze eye contact and professional presence. Maintain focus."</p>
                </div>
             </div>

             <div className="bg-[#1c212b] rounded-3xl border border-white/5 p-3 flex items-center justify-around shadow-2xl shrink-0">
                <button onClick={() => setIsMuted(!isMuted)} className={`size-12 rounded-2xl flex items-center justify-center transition-all ${isMuted ? 'bg-red-500/20 text-red-500' : 'bg-white/5 text-gray-400 hover:text-white'}`}>
                   <span className="material-symbols-outlined">mic_off</span>
                </button>
                <button onClick={() => setIsPaused(!isPaused)} className={`size-12 rounded-2xl flex items-center justify-center transition-all ${isPaused ? 'bg-indigo-500/20 text-indigo-500' : 'bg-white/5 text-gray-400 hover:text-white'}`}>
                   <span className="material-symbols-outlined">{isPaused ? 'play_arrow' : 'pause'}</span>
                </button>
                <button onClick={handleFinish} className="size-12 rounded-2xl bg-red-600/10 text-red-500 hover:bg-red-600 hover:text-white transition-all flex items-center justify-center">
                   <span className="material-symbols-outlined">call_end</span>
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