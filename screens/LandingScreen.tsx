import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Menu, 
  Star, 
  FileText, 
  Shield, 
  CheckCircle, 
  ArrowRight, 
  RefreshCw, 
  Volume2, 
  ChevronRight, 
  Sparkles, 
  FileCheck, 
  Award, 
  Video, 
  ThumbsUp, 
  AlertTriangle,
  Briefcase,
  Activity
} from 'lucide-react';
import { Screen } from '../types';
import { Logo } from '../constants';
import { ThemeToggle } from '../components/ThemeToggle';
import { useAuthStore } from '../store/useAuthStore';

interface LandingScreenProps {
  onNavigate: (screen: Screen) => void;
}

// Pre-defined static metrics to make the mockup look absolutely professional
const ATS_DUMMY_DEVICES = [
  {
    id: 'expert',
    role: 'Lead Cloud Infrastructure Architect',
    candidate: 'Alex Chen (Polished Resume)',
    score: 95,
    matchRate: 'Excellent Keyword Coverage',
    points: [
      'Engineered multi-region failover cluster reducing recovery RTO by 82%',
      'Architected high-throughput Kafka bus processing 12B+ events daily',
      'Configured automated Kubernetes operators with custom metrics telemetry'
    ],
    criticism: 'Exceptional metrics quantification. Strong alignment with Lead Engineer criteria. STAR-format achievements are robustly clear.'
  },
  {
    id: 'vague',
    role: 'Lead Cloud Infrastructure Architect',
    candidate: 'Jordan Smith (Vague Resume)',
    score: 58,
    matchRate: 'Poor Architectural Context',
    points: [
      'Helped migrate applications and server containers to AWS Cloud',
      'Attended Agile sprint rituals and reviewed open pull requests',
      'Participated in solving platform system performance challenges'
    ],
    criticism: 'Highly passive phrasing. Completely lacks quantified business results or metrics. Missing core architecture keywords: Kafka, Kubernetes, RTO, Telemetry.'
  }
];

export const LandingScreen: React.FC<LandingScreenProps> = ({ onNavigate }) => {
  const { bypassAuth } = useAuthStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // Interactive Simulator State Flow
  // Tab 0: ATS CV Analyzer, Tab 1: Video/Audio Interview, Tab 2: Detailed Performance Report, Tab 3: Match Job Board
  const [simulatorStep, setSimulatorStep] = useState<number>(1); 

  // Simulation parameters for Step 1: CV Scanner
  const [selectedCVIdx, setSelectedCVIdx] = useState(0);
  const [cvScanning, setCvScanning] = useState(false);
  const [cvProgress, setCvProgress] = useState(0);
  const [cvScanned, setCvScanned] = useState(false);

  // Simulation parameters for Step 2: Audio+Video Mock Interview
  const [interviewResponseStyle, setInterviewResponseStyle] = useState<'none' | 'perfect' | 'poor'>('none');
  const [transcriptStream, setTranscriptStream] = useState('');
  const [vocalStatusAlert, setVocalStatusAlert] = useState<string | null>(null);
  const [faceCheckState, setFaceCheckState] = useState<'aligning' | 'locked' | 'drifted'>('aligning');

  // Simulation variables for visual audio feedback wave
  const [visualWaveBars, setVisualWaveBars] = useState<number[]>(new Array(18).fill(16));
  const waveIntervalRef = useRef<any>(null);

  // Auto fluctuating face coordinates to simulate a live bounding-box facial mesh
  const [faceMeshCoords, setFaceMeshCoords] = useState({ x: 50, y: 48, w: 32, h: 42 });

  useEffect(() => {
    if (interviewResponseStyle !== 'none') {
      waveIntervalRef.current = setInterval(() => {
        setVisualWaveBars(prev => prev.map(() => Math.floor(Math.random() * 75) + 15));
        setFaceMeshCoords({
          x: 50 + (Math.random() * 2 - 1),
          y: 48 + (Math.random() * 1.5 - 0.75),
          w: 32 + (Math.random() * 1 - 0.5),
          h: 42 + (Math.random() * 1 - 0.5)
        });
      }, 95);
    } else {
      if (waveIntervalRef.current) clearInterval(waveIntervalRef.current);
    }
    return () => {
      if (waveIntervalRef.current) clearInterval(waveIntervalRef.current);
    };
  }, [interviewResponseStyle]);

  // Simulate active typing streaming of spoken transcript with intermittent alert flags
  const handleSimulateResponse = (style: 'perfect' | 'poor') => {
    setInterviewResponseStyle(style);
    setTranscriptStream('');
    setVocalStatusAlert(null);
    setFaceCheckState('locked');

    let fullText = '';
    const intervalTime = 25;

    if (style === 'perfect') {
      fullText = "To optimize the high-availability cluster under stress, I designed a multi-layered cache mechanism backed by distributed Redis clusters, keeping response latencies under 45ms and preventing database write locks.";
    } else {
      fullText = "So... like... we had this really big outage during Black Friday, and honestly, the database got super slow because everyone was trying to connect to it at once, and... uh... we basically just restarted the instance several times to survive.";
    }

    let i = 0;
    const typeInterval = setInterval(() => {
      if (i < fullText.length) {
        fullText.slice(0, i + 1);
        setTranscriptStream(fullText.slice(0, i + 1));
        
        // Randomly scatter audio & visual alerts into the stream
        if (style === 'poor') {
          if (i === 15) {
            setVocalStatusAlert('Vocal Filler: "like" (Slow pacing)');
          } else if (i === 40) {
            setVocalStatusAlert('Vocal Filler: "honestly"');
          } else if (i === 80) {
            setFaceCheckState('drifted');
            setVocalStatusAlert('Eye Contact Drift Detected');
          } else if (i === 120) {
            setVocalStatusAlert('Hesitation Spike');
          }
        } else {
          if (i === 20) {
            setVocalStatusAlert('Pacing Optimal (134 WPM)');
          } else if (i === 80) {
            setVocalStatusAlert('Key Term Tracked: Redis');
          } else if (i === 140) {
            setVocalStatusAlert('STAR Structure Achieved');
          }
        }
        i += 2;
      } else {
        clearInterval(typeInterval);
        if (style === 'perfect') {
          setVocalStatusAlert('Answer Finished: Complete Success Score!');
        } else {
          setVocalStatusAlert('Answer Finished: Critical Review Suggested.');
        }
      }
    }, intervalTime);
  };

  const handleSimulateCVScan = () => {
    setCvScanning(true);
    setCvScanned(false);
    setCvProgress(0);

    const scanInterval = setInterval(() => {
      setCvProgress(prev => {
        if (prev >= 100) {
          clearInterval(scanInterval);
          setCvScanning(false);
          setCvScanned(true);
          return 100;
        }
        return prev + 5;
      });
    }, 80);
  };

  const handleQuickPractice = () => {
    bypassAuth();
    onNavigate(Screen.Dashboard);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background-light dark:bg-background-dark text-slate-900 dark:text-white overflow-x-hidden selection:bg-primary/20 transition-colors duration-300">
      
      {/* BACKGROUND GLOWS FOR COHESIVE MOOD */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[650px] bg-[radial-gradient(circle_at_top,rgba(25,76,230,0.07)_0%,transparent_65%)] pointer-events-none -z-10" />
      <div className="absolute top-[1200px] left-[-200px] w-[500px] h-[500px] bg-[radial-gradient(circle_at_center,rgba(20,184,166,0.02)_0%,transparent_70%)] pointer-events-none -z-10" />
      
      {/* FLOATING NAVIGATION BAR */}
      <nav className="sticky top-0 z-50 bg-white/70 dark:bg-background-dark/70 backdrop-blur-xl border-b border-black/5 dark:border-white/5 px-6 lg:px-16 py-4 flex items-center justify-between transition-colors duration-300">
        <div className="flex items-center gap-3 group cursor-pointer" onClick={() => onNavigate(Screen.Landing)}>
          <div className="relative">
            <Logo className="size-9 lg:size-10 transition-transform duration-500 group-hover:rotate-6" />
            <span className="absolute -top-1 -right-1 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-400"></span>
            </span>
          </div>
          <span className="text-lg lg:text-xl font-black tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
            MockInterview<span className="text-primary">.ai</span>
          </span>
        </div>

        {/* NAVIGATION LINKS WITH ONE-LINERS */}
        <div className="hidden md:flex items-center gap-1 p-1 bg-black/5 dark:bg-white/5 rounded-full border border-black/5 dark:border-white/5">
          {[
            { id: 1, label: 'CV Scan Sandbox' },
            { id: 2, label: 'Audio & Video Interview' },
            { id: 3, label: 'Scorecard Report' },
            { id: 4, label: 'Job Board Matcher' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                setSimulatorStep(tab.id);
                document.getElementById('simulation-stage')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }}
              className={`relative px-4 py-2 text-xs font-semibold rounded-full transition-colors whitespace-nowrap ${
                simulatorStep === tab.id 
                  ? 'text-slate-900 dark:text-white' 
                  : 'text-slate-500 dark:text-text-secondary hover:text-slate-800 dark:hover:text-white'
              }`}
            >
              {simulatorStep === tab.id && (
                <motion.span
                  layoutId="active-menu-pill"
                  className="absolute inset-0 bg-white dark:bg-surface-dark rounded-full shadow-sm border border-black/[0.04] dark:border-white/[0.06] -z-10"
                  transition={{ type: "spring", stiffness: 380, damping: 28 }}
                />
              )}
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 lg:gap-3">
          <ThemeToggle />
          <button 
            onClick={() => onNavigate(Screen.SignIn)}
            className="hidden sm:inline-flex whitespace-nowrap text-xs font-bold text-slate-600 dark:text-text-secondary hover:text-primary dark:hover:text-white px-3 py-2 transition-colors cursor-pointer"
          >
            Sign In
          </button>
          
          <button 
            onClick={() => onNavigate(Screen.SignUp)}
            className="whitespace-nowrap inline-flex items-center justify-center text-[11px] sm:text-xs font-black tracking-tight text-white bg-primary hover:bg-primary-hover px-4 sm:px-5 py-2.5 rounded-full shadow-lg shadow-primary/15 hover:shadow-primary/25 active:scale-[0.98] transition-all cursor-pointer"
          >
            Get Started Free
          </button>

          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-slate-800 dark:text-white p-2"
          >
            {isMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </nav>

      {/* MOBILE NAV OVERLAY */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="absolute top-[72px] left-0 w-full bg-white dark:bg-background-dark border-b border-black/5 dark:border-white/5 z-40 p-6 flex flex-col gap-4 overflow-hidden md:hidden"
          >
            <button 
              onClick={() => { setIsMenuOpen(false); setSimulatorStep(1); document.getElementById('simulation-stage')?.scrollIntoView({ behavior: 'smooth' }); }}
              className="text-left py-2 font-semibold text-slate-800 dark:text-white hover:text-primary text-xs tracking-tight whitespace-nowrap"
            >
              CV Scan Sandbox
            </button>
            <button 
              onClick={() => { setIsMenuOpen(false); setSimulatorStep(2); document.getElementById('simulation-stage')?.scrollIntoView({ behavior: 'smooth' }); }}
              className="text-left py-2 font-semibold text-slate-800 dark:text-white hover:text-primary text-xs tracking-tight whitespace-nowrap"
            >
              Audio & Video Interview
            </button>
            <button 
              onClick={() => { setIsMenuOpen(false); setSimulatorStep(3); document.getElementById('simulation-stage')?.scrollIntoView({ behavior: 'smooth' }); }}
              className="text-left py-2 font-semibold text-slate-800 dark:text-white hover:text-primary text-xs tracking-tight whitespace-nowrap"
            >
              Scorecard Report
            </button>
            <button 
              onClick={() => { setIsMenuOpen(false); setSimulatorStep(4); document.getElementById('simulation-stage')?.scrollIntoView({ behavior: 'smooth' }); }}
              className="text-left py-2 font-semibold text-slate-800 dark:text-white hover:text-primary text-xs tracking-tight whitespace-nowrap"
            >
              Job Board Matcher
            </button>
            <div className="h-px bg-black/5 dark:bg-white/5 my-2"></div>
            <div className="flex flex-col gap-3">
              <button 
                onClick={() => onNavigate(Screen.SignIn)}
                className="w-full py-3 rounded-xl border border-black/5 dark:border-white/10 text-center font-bold text-slate-800 dark:text-white text-xs whitespace-nowrap cursor-pointer"
              >
                Sign In
              </button>
              <button 
                onClick={() => onNavigate(Screen.SignUp)}
                className="w-full py-3 rounded-xl bg-primary hover:bg-primary-hover text-center font-bold text-white shadow-lg text-xs whitespace-nowrap cursor-pointer"
              >
                Sign Up Free
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="flex-grow flex flex-col items-center">

        {/* HERO SECTION: MODERN, WORLD-CLASS TYPOGRAPHY & CONCISE ALIGNMENT */}
        <section className="w-full max-w-7xl px-6 lg:px-16 pt-16 lg:pt-28 pb-12 flex flex-col items-center text-center relative">
          
          {/* Tagline Pill */}
          <motion.div 
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/[0.04] dark:bg-white/5 border border-primary/10 dark:border-white/10 text-primary dark:text-teal-400 text-xs font-semibold mb-8 backdrop-blur-md"
          >
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary dark:bg-teal-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary dark:bg-teal-400"></span>
            </span>
            Simulate Audio, Video, and Real-time Bio-Tracking
          </motion.div>

          {/* Core Title */}
          <h1 className="text-4xl sm:text-6xl lg:text-8xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.05] max-w-5xl">
            Train for interview mastery with{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-blue-600 to-teal-400">
              real-time indicators.
            </span>
          </h1>

          {/* Supportive Statement */}
          <p className="mt-8 text-sm sm:text-base lg:text-lg text-slate-600 dark:text-text-secondary max-w-3xl leading-relaxed">
            The world's most advanced WebRTC interface that acts like a real corporate assessment. Practice speech pacing, eye alignment, structural delivery, and receive a granular feedback report.
          </p>

          {/* Hero Action Buttons - ONE-LINERS SECURED FOR MOBILE AND DESKTOP */}
          <div className="mt-10 flex flex-col sm:flex-row gap-4 items-center justify-center w-full max-w-md">
            <button 
              onClick={handleQuickPractice}
              className="w-full sm:w-auto text-nowrap whitespace-nowrap inline-flex items-center justify-center text-xs sm:text-sm font-extrabold text-white bg-primary hover:bg-primary-hover px-8 py-4 rounded-2xl shadow-xl shadow-primary/25 hover:shadow-primary/35 active:scale-[0.98] transform transition-all cursor-pointer gap-2"
            >
              Start Free Training <ArrowRight className="size-4" />
            </button>
            
            <button
              onClick={() => {
                const simSec = document.getElementById('simulation-stage');
                if (simSec) simSec.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }}
              className="w-full sm:w-auto text-nowrap whitespace-nowrap inline-flex items-center justify-center text-xs sm:text-sm font-bold text-slate-800 dark:text-white bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 px-8 py-4 rounded-2xl border border-black/5 dark:border-white/10 transition-all cursor-pointer"
            >
              Watch Simulation Inside
            </button>
          </div>

          <div className="mt-8 flex items-center gap-6 text-[11px] text-slate-500 dark:text-text-secondary font-semibold">
            <span className="flex items-center gap-1"><Shield className="size-3.5 text-teal-500" /> AES-256 Cloud Encrypted</span>
            <div className="size-1.5 bg-slate-300 dark:bg-slate-700 rounded-full" />
            <span className="flex items-center gap-1"><Star className="size-3.5 text-amber-500 fill-amber-500" /> Real-time Posture Metrics</span>
          </div>
        </section>


        {/* THE IMMERSIVE PLATFORM SIMULATION (ACTUAL MOTION MECHANICS) */}
        <section id="simulation-stage" className="w-full max-w-7xl px-6 lg:px-16 py-12 lg:py-16">
          <div className="p-1 rounded-[36px] bg-gradient-to-b from-black/5 to-black/[0.02] dark:from-white/10 dark:to-white/[0.02] shadow-2xl relative overflow-hidden">
            
            {/* Embedded Ambient Decoration */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-[100px] pointer-events-none -z-10" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-teal-500/5 rounded-full blur-[100px] pointer-events-none -z-10" />

            {/* Inner Simulator Box */}
            <div className="bg-white dark:bg-[#0f121d] rounded-[34px] p-6 lg:p-12">
              
              {/* Header Selector Switcher - 4 Core Pillars of our platform */}
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 border-b border-black/5 dark:border-white/10 pb-8">
                <div>
                  <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-primary dark:text-teal-400 block mb-1">Interactive Sandbox</span>
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-none">
                    Run the experience live
                  </h2>
                </div>

                {/* Switcher Buttons Grid (ONE-LINER ASSURED) */}
                <div className="grid grid-cols-2 lg:flex lg:items-center gap-2 w-full lg:w-auto">
                  {[
                    { id: 1, name: '1. CV Scanner', icon: FileCheck },
                    { id: 2, name: '2. Live Interview', icon: Video },
                    { id: 3, name: '3. Performance Report', icon: Award },
                    { id: 4, name: '4. job Matching', icon: Briefcase }
                  ].map(step => (
                    <button
                      key={step.id}
                      onClick={() => setSimulatorStep(step.id)}
                      className={`text-nowrap whitespace-nowrap inline-flex items-center justify-center gap-2 px-3 sm:px-4 py-2.5 sm:py-3.5 rounded-xl text-[10px] sm:text-xs font-bold border transition-all cursor-pointer ${
                        simulatorStep === step.id
                          ? 'bg-primary border-primary text-white shadow-md shadow-primary/10'
                          : 'bg-black/5 dark:bg-white/5 border-black/5 dark:border-white/5 text-slate-600 dark:text-text-secondary hover:bg-black/10 dark:hover:bg-white/10'
                      }`}
                    >
                      <step.icon className="size-3.5 flex-shrink-0" />
                      <span>{step.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* SIMULATION CARD MOUNTS */}
              <div className="pt-8">
                <AnimatePresence mode="wait">
                  
                  {/* STEP 1: CV ANALYSIS SANDBOX */}
                  {simulatorStep === 1 && (
                    <motion.div
                      key="step1"
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -15 }}
                      transition={{ duration: 0.3 }}
                      className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch"
                    >
                      {/* Left: Interactive Input panel */}
                      <div className="flex flex-col justify-between p-6 rounded-2xl bg-slate-50 dark:bg-[#141825] border border-black/5 dark:border-white/5 shadow-sm">
                        <div className="space-y-4">
                          <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                            <Sparkles className="size-5 text-primary" /> Multi-Pass parser model
                          </h3>
                          <p className="text-xs text-slate-500 dark:text-text-secondary leading-normal">
                            We compile structure, parse quantified deliverables under the STAR standard, and match exact vocabulary vectors for modern Automated Tracking Systems (ATS).
                          </p>

                          <div className="space-y-2 mt-4 text-xs font-semibold text-slate-700 dark:text-gray-300">
                            <label className="text-[10px] uppercase font-bold text-slate-400 block">Choose profile to scan:</label>
                            
                            <div className="grid grid-cols-1 gap-2">
                              {ATS_DUMMY_DEVICES.map((prof, idx) => (
                                <button
                                  key={idx}
                                  onClick={() => {
                                    setSelectedCVIdx(idx);
                                    setCvScanned(false);
                                    setCvProgress(0);
                                  }}
                                  className={`p-3.5 rounded-xl border text-left flex flex-col items-start transition-all cursor-pointer ${
                                    selectedCVIdx === idx
                                      ? 'bg-white dark:bg-[#1b2133] border-primary dark:border-teal-500 shadow-sm'
                                      : 'bg-transparent border-black/5 dark:border-white/5 hover:border-black/10 dark:hover:border-white/10 opacity-70'
                                  }`}
                                >
                                  <div className="flex items-center justify-between w-full">
                                    <span className="font-bold text-xs text-slate-900 dark:text-white leading-none">{prof.candidate}</span>
                                    <span className={`text-[9px] font-black px-1.5 py-0.5 rounded leading-none ${
                                      idx === 0 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-orange-500/10 text-orange-500'
                                    }`}>
                                      {idx === 0 ? 'Expert Version' : 'Weak Version'}
                                    </span>
                                  </div>
                                  <span className="text-[10px] text-slate-400 dark:text-text-secondary mt-1 block font-mono">{prof.role}</span>
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="pt-6 border-t border-black/5 dark:border-white/5 mt-6">
                          <button
                            onClick={handleSimulateCVScan}
                            disabled={cvScanning}
                            className="w-full text-nowrap whitespace-nowrap inline-flex items-center justify-center text-xs font-black tracking-tight text-white bg-primary hover:bg-primary-hover disabled:bg-slate-300 dark:disabled:bg-slate-800 p-4 rounded-xl shadow transition-all cursor-pointer gap-2"
                          >
                            {cvScanning ? (
                              <>
                                <RefreshCw className="size-4 animate-spin" /> Scanning Vector Database ({cvProgress}%)
                              </>
                            ) : (
                              <>
                                <Sparkles className="size-4" /> Trigger Real-time AI Analysis Scan
                              </>
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Right: Dynamic scanner readout output */}
                      <div className="flex flex-col justify-center min-h-[300px] border border-black/5 dark:border-white/15 rounded-2xl bg-white dark:bg-[#111420] p-6 shadow-sm relative overflow-hidden">
                        
                        {/* Interactive scanning graphics */}
                        {cvScanning && (
                          <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-teal-400 via-primary to-indigo-500 animate-pulse" />
                        )}

                        <AnimatePresence mode="wait">
                          {cvScanning ? (
                            <motion.div
                              key="scanning"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="flex-grow flex flex-col items-center justify-center text-center p-6 gap-4"
                            >
                              <div className="size-14 rounded-full border border-dashed border-primary flex items-center justify-center animate-spin">
                                <FileCheck className="size-6 text-primary" />
                              </div>
                              <div>
                                <h4 className="font-bold text-sm text-slate-900 dark:text-white leading-none">Comparing Semantic Tokens...</h4>
                                <span className="text-[10px] text-slate-400 mt-1 block">Validating STAR metric alignments against Staff Rubrics</span>
                              </div>
                            </motion.div>
                          ) : cvScanned ? (
                            <motion.div
                              key="scanned"
                              initial={{ opacity: 0, scale: 0.98 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className="space-y-4"
                            >
                              <div className="flex items-center justify-between border-b border-black/5 dark:border-white/5 pb-3">
                                <div>
                                  <span className="text-[9px] uppercase font-bold text-primary block leading-none">ATS Alignment Grade</span>
                                  <h4 className="text-xs font-black text-slate-400 mt-1 leading-none">{ATS_DUMMY_DEVICES[selectedCVIdx].candidate}</h4>
                                </div>
                                <div className={`px-2.5 py-1 rounded-full text-xs font-mono font-black ${
                                  ATS_DUMMY_DEVICES[selectedCVIdx].score >= 80 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'
                                }`}>
                                  Score: {ATS_DUMMY_DEVICES[selectedCVIdx].score}%
                                </div>
                              </div>

                              <div className="p-3 bg-slate-50 dark:bg-[#161a29] border border-black/5 dark:border-white/5 rounded-xl text-xs">
                                <span className="text-[9px] uppercase font-bold tracking-wider text-slate-400 block mb-1">AUTOMATED RECOMMENDATION SUMMARY</span>
                                <p className="text-slate-700 dark:text-gray-300 font-medium leading-relaxed">
                                  {ATS_DUMMY_DEVICES[selectedCVIdx].criticism}
                                </p>
                              </div>

                              <div>
                                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-2">SCANNED BULLET HIGHLIGHTS:</span>
                                <div className="space-y-2">
                                  {ATS_DUMMY_DEVICES[selectedCVIdx].points.map((pt, i) => (
                                    <div key={i} className="flex items-start gap-2.5 text-xs text-slate-600 dark:text-gray-400 font-medium">
                                      {ATS_DUMMY_DEVICES[selectedCVIdx].score >= 80 ? (
                                        <CheckCircle className="size-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                                      ) : (
                                        <AlertTriangle className="size-4 text-red-500 flex-shrink-0 mt-0.5" />
                                      )}
                                      <p className="leading-relaxed">{pt}</p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </motion.div>
                          ) : (
                            <motion.div
                              key="idle"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="text-center py-10 space-y-4"
                            >
                              <div className="size-12 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400 mx-auto">
                                <FileText className="size-6" />
                              </div>
                              <div>
                                <h4 className="font-bold text-sm text-slate-900 dark:text-white leading-none">Standby Ready</h4>
                                <p className="text-xs text-slate-400 mt-2 max-w-xs mx-auto">
                                  Choose a CV profile and trigger the simulation to watch the keyword token extraction work.
                                </p>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>

                      </div>
                    </motion.div>
                  )}


                  {/* STEP 2: REAL-TIME AUDIO & VIDEO INTERVIEW TERMINAL */}
                  {simulatorStep === 2 && (
                    <motion.div
                      key="step2"
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -15 }}
                      transition={{ duration: 0.3 }}
                      className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch"
                    >
                      {/* Left: Simulated Camera and Voice feedback module */}
                      <div className="lg:col-span-7 flex flex-col justify-between p-6 rounded-2xl bg-slate-900 dark:bg-slate-950 text-white min-h-[380px] hover:shadow-lg transition-all relative overflow-hidden flex-shrink-0">
                        {/* Simulation watermark badge */}
                        <div className="absolute top-4 right-4 bg-orange-500/10 border border-orange-500/20 rounded px-2 py-0.5 text-[8px] tracking-widest uppercase font-mono text-orange-400 z-10 flex items-center gap-1">
                          <Activity className="size-2.5 animate-pulse" /> SIMULATED CAM
                        </div>

                        {/* Video feed container mimicking video input */}
                        <div className="relative bg-[#0d1017] border border-white/10 rounded-xl overflow-hidden aspect-video flex items-center justify-center max-w-xl mx-auto w-full">
                          
                          {/* Face simulation graphic with bounding box alignment brackets */}
                          <div className="absolute inset-0 flex items-center justify-center">
                            
                            {/* Simulated Camera Mesh Frame */}
                            <div className="absolute border border-teal-500/40 rounded-full animate-pulse transition-all duration-300"
                                 style={{
                                   left: `${faceMeshCoords.x - faceMeshCoords.w / 2}%`,
                                   top: `${faceMeshCoords.y - faceMeshCoords.h / 2}%`,
                                   width: `${faceMeshCoords.w}%`,
                                   height: `${faceMeshCoords.h}%`
                                 }}
                            >
                              {/* Overlay Indicators */}
                              <span className="absolute top-0 left-0 border-t-2 border-l-2 border-teal-400 w-3 h-3 rounded-tl" />
                              <span className="absolute top-0 right-0 border-t-2 border-r-2 border-teal-400 w-3 h-3 rounded-tr" />
                              <span className="absolute bottom-0 left-0 border-b-2 border-l-2 border-teal-400 w-3 h-3 rounded-bl" />
                              <span className="absolute bottom-0 right-0 border-b-2 border-r-2 border-teal-400 w-3 h-3 rounded-br" />
                              
                              <div className="absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-[8px] font-mono font-bold bg-[#143db8] text-white px-1 py-0.5 rounded leading-none shadow">
                                FACE MESH ID: #L59
                              </div>
                            </div>

                            {/* Minimal User facial representation */}
                            <div className="text-center space-y-2 opacity-80">
                              <div className="size-16 rounded-full bg-slate-800 border-2 border-slate-700 mx-auto flex items-center justify-center relative">
                                <Video className="size-7 text-slate-400" />
                                {interviewResponseStyle === 'perfect' && (
                                  <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-[10px] font-black p-0.5 rounded-full z-10">
                                    <CheckCircle className="size-4 text-white" />
                                  </div>
                                )}
                              </div>
                              <span className="text-[10px] font-mono tracking-wider text-slate-400 block mt-1">
                                {faceCheckState === 'locked' && 'Eye Contact: Stable (98%)'}
                                {faceCheckState === 'aligning' && 'Establishing alignment check...'}
                                {faceCheckState === 'drifted' && '⚠️ Pose Drift: Re-align face gaze'}
                              </span>
                            </div>
                          </div>

                        </div>

                        {/* Real-time fluctuating acoustics stream wave */}
                        <div className="flex items-center justify-between mt-6 bg-slate-950/80 border border-white/5 p-4 rounded-xl">
                          <div className="flex items-center gap-1">
                            <span className="bg-red-500 w-1.5 h-1.5 rounded-full animate-ping mr-1" />
                            <span className="text-[10px] font-mono text-slate-400 uppercase">WEBRTC AUDIO CONDUIT</span>
                          </div>

                          {/* Dynamic waveform graphics */}
                          <div className="flex gap-1 items-center h-8">
                            {visualWaveBars.map((h, i) => (
                              <div
                                key={i}
                                className="w-1 bg-[#143db8] dark:bg-teal-400 rounded-full transition-all duration-100"
                                style={{ height: `${h}%`, minHeight: '4px' }}
                              />
                            ))}
                          </div>
                        </div>

                      </div>

                      {/* Right: Triggers and stream transcript */}
                      <div className="lg:col-span-5 flex flex-col justify-between p-6 rounded-2xl bg-white dark:bg-[#111420] border border-black/5 dark:border-white/5 shadow-sm">
                        <div className="space-y-4">
                          <div className="flex items-center gap-2">
                            <Volume2 className="size-5 text-indigo-500" />
                            <h3 className="text-base font-black text-slate-900 dark:text-white leading-none">Acoustics & Visual Track</h3>
                          </div>
                          
                          <p className="text-xs text-slate-500 dark:text-text-secondary leading-normal">
                            Our tracker processes acoustic signals (filler frequencies, pauses, words-per-minute accuracy) combined with camera posture variables. Click below to test response patterns.
                          </p>

                          <div className="space-y-2 pt-2">
                            <label className="text-[10px] uppercase font-bold text-slate-400 block">Deliver response model:</label>
                            
                            <div className="grid grid-cols-1 gap-2">
                              {/* ONE-LINER SECURED */}
                              <button
                                onClick={() => handleSimulateResponse('perfect')}
                                className="w-full text-nowrap whitespace-nowrap inline-flex items-center justify-between p-3 rounded-lg border border-black/5 dark:border-white/5 bg-slate-100/40 dark:bg-white/[0.02] hover:bg-slate-100 dark:hover:bg-white/5 font-semibold text-xs text-slate-700 dark:text-slate-300 transition-all cursor-pointer"
                              >
                                <span>Simulate Excellent STAR Speech</span>
                                <ChevronRight className="size-4 text-emerald-500" />
                              </button>

                              <button
                                onClick={() => handleSimulateResponse('poor')}
                                className="w-full text-nowrap whitespace-nowrap inline-flex items-center justify-between p-3 rounded-lg border border-black/5 dark:border-white/5 bg-slate-100/40 dark:bg-white/[0.02] hover:bg-slate-100 dark:hover:bg-white/5 font-bold text-xs text-slate-700 dark:text-slate-300 transition-all cursor-pointer"
                              >
                                <span>Simulate Rambling Speech patterns</span>
                                <ChevronRight className="size-4 text-orange-400" />
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Transcription Stream View */}
                        <div className="mt-6 pt-6 border-t border-black/5 dark:border-white/5 space-y-3">
                          <label className="text-[10px] uppercase font-bold text-slate-400 block">LIVE MODEL METRICS INTERCEPT:</label>
                          
                          <div className="p-3 bg-slate-55 dark:bg-[#161924] border border-black/5 dark:border-white/5 rounded-xl block min-h-[90px] text-xs leading-relaxed">
                            {transcriptStream ? (
                              <div className="space-y-2">
                                <p className="text-slate-700 dark:text-slate-300 font-mono italic">
                                  "{transcriptStream}"
                                </p>
                                {vocalStatusAlert && (
                                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#2a2c3a] border border-white/5 text-[10px] font-mono text-teal-400 font-bold leading-none animate-pulse">
                                    <span>ALERT: {vocalStatusAlert}</span>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <p className="text-slate-400 italic">No stream active. Choose an interview speaking track above to begin parsing speech.</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}


                  {/* STEP 3: THE GRANULAR PERFORMANCE FEEDBACK CERTIFICATE */}
                  {simulatorStep === 3 && (
                    <motion.div
                      key="step3"
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -15 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-6"
                    >
                      {/* Section Introduction */}
                      <div className="max-w-xl">
                        <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                          <Award className="size-5 text-teal-500" /> 
                          Detailed evaluation dashboard
                        </h3>
                        <p className="text-xs text-slate-500 mt-1">
                          No simple pass or fail here. The platform charts exactly what you did wrong (acoustic, visual, structural contents) and details how to practice.
                        </p>
                      </div>

                      {/* Mock Detailed Scorecard Display */}
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
                        
                        {/* Overall Metrics Block */}
                        <div className="md:col-span-4 p-6 rounded-2xl bg-slate-50 dark:bg-[#131723] border border-black/5 dark:border-white/5 flex flex-col justify-between shadow-sm relative overflow-hidden">
                          <div>
                            <span className="text-[9px] uppercase font-black text-slate-400 block mb-1">Session ID: #AI-M94C</span>
                            <h4 className="text-base font-black text-slate-900 dark:text-white">Overall Performance Index</h4>
                            <p className="text-xs text-slate-500 mt-1">Detailed analysis score compiles vocal weight, semantic alignment, and bio-tracking.</p>
                          </div>

                          <div className="my-6 text-center space-y-1">
                            <strong className="text-5xl font-black text-slate-900 dark:text-white leading-none">88/100</strong>
                            <span className="text-[10px] font-extrabold text-teal-500 block uppercase tracking-wider">Level: Ready for Meta/Google</span>
                          </div>

                          <div className="space-y-2 border-t border-black/5 dark:border-white/5 pt-4 text-[11px] font-medium">
                            <div className="flex justify-between">
                              <span className="text-slate-500">Sentence Pacing Index:</span>
                              <strong className="text-slate-800 dark:text-slate-200">92% (Steady)</strong>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500">Eye Alignment Factor:</span>
                              <strong className="text-slate-800 dark:text-slate-200">85% (High focus)</strong>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500">STAR Structure Compliance:</span>
                              <strong className="text-slate-800 dark:text-slate-200">100% Correct</strong>
                            </div>
                          </div>
                        </div>

                        {/* GRANULAR EVALUATOR ACTIONABLE LIST */}
                        <div className="md:col-span-8 p-6 rounded-2xl bg-white dark:bg-[#111420] border border-black/5 dark:border-white/5 shadow-sm space-y-4">
                          <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-widest leading-none">AI Diagnostics Breakdowns</span>
                          
                          <div className="space-y-3">
                            {[
                              {
                                parameter: 'What you did right:',
                                feedback: 'Used outstanding technical vocabulary. You introduced distributed states, Lua script atomic queries, and failover sliding window concepts with absolute engineering precision.',
                                status: 'good'
                              },
                              {
                                parameter: 'What you did wrong (Pacing / Sound):',
                                feedback: 'During technical definition of Redis clustering, your speaking pacing spiked to 174 WPM. Under high anxiety moments, remember to pause for 0.5s between key concept transfers.',
                                status: 'correction'
                              },
                              {
                                parameter: 'What you did wrong (Visual / Posture):',
                                feedback: 'Your high-speed speaking caused you to lean forward and tilt your torso out of the central camera bounds. Gaze drifted to the lower left quadrant during architectural layout description.',
                                status: 'correction'
                              }
                            ].map((diag, i) => (
                              <div key={i} className={`p-3 rounded-xl border flex gap-3 text-xs leading-relaxed ${
                                diag.status === 'good' 
                                  ? 'bg-emerald-500/[0.03] border-emerald-500/10 text-slate-700 dark:text-slate-300' 
                                  : 'bg-red-500/[0.03] border-red-500/10 text-slate-700 dark:text-slate-300'
                              }`}>
                                <div className="flex-shrink-0 mt-0.5">
                                  {diag.status === 'good' ? (
                                    <ThumbsUp className="size-4.5 text-emerald-500" />
                                  ) : (
                                    <AlertTriangle className="size-4.5 text-orange-400" />
                                  )}
                                </div>
                                <div className="space-y-1">
                                  <strong className={`font-extrabold tracking-tight ${diag.status === 'good' ? 'text-emerald-500' : 'text-orange-400'}`}>
                                    {diag.parameter}
                                  </strong>
                                  <p>{diag.feedback}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                      </div>
                    </motion.div>
                  )}


                  {/* STEP 4: SMART AFFINITY JOB BOARD */}
                  {simulatorStep === 4 && (
                    <motion.div
                      key="step4"
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -15 }}
                      transition={{ duration: 0.3 }}
                      className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
                    >
                      {/* Left Side: Concisely describe how Job matches are discovered */}
                      <div className="lg:col-span-5 space-y-4">
                        <div className="flex items-center gap-2">
                          <Briefcase className="size-5 text-indigo-500" />
                          <h3 className="text-base font-black text-slate-900 dark:text-white leading-none">Acoustics-Aligned Job discovery</h3>
                        </div>
                        
                        <p className="text-xs text-slate-500 dark:text-text-secondary leading-relaxed">
                          Once your detailed simulator score passes company thresholds, the system flags and serves live job listings with direct applications. Understand exactly how well you fit their technical criteria.
                        </p>

                        <div className="space-y-2 border-t border-black/5 dark:border-white/10 pt-4 text-xs font-semibold">
                          <div className="flex items-center gap-2 text-slate-600 dark:text-text-secondary">
                            <CheckCircle className="size-4 text-teal-400" /> Matches dynamic resume vocabulary
                          </div>
                          <div className="flex items-center gap-2 text-slate-600 dark:text-text-secondary">
                            <CheckCircle className="size-4 text-teal-400" /> Direct engineering recruiter contacts
                          </div>
                          <div className="flex items-center gap-2 text-slate-600 dark:text-text-secondary">
                            <CheckCircle className="size-4 text-teal-400" /> Automatically tracks visual-score clearance
                          </div>
                        </div>
                      </div>

                      {/* Right Side: Mock Job Matches with clear score index badges */}
                      <div className="lg:col-span-7 grid grid-cols-1 gap-3.5">
                        {[
                          {
                            title: 'Staff Platform Engineer',
                            company: 'Redis Labs',
                            loc: 'Distributed / Remote',
                            salary: '$165,000 - $210,000',
                            match: 96,
                            reason: 'High technical scoring on Token Bucket and Lua script caching structures',
                            badge: 'Enterprise Platform'
                          },
                          {
                            title: 'Senior Systems Architect',
                            company: 'HashiCorp',
                            loc: 'San Francisco, CA',
                            salary: '$180,000 - $240,000',
                            match: 88,
                            reason: 'Strong performance on network fault tolerance design systems',
                            badge: 'Cloud Infrastructure'
                          }
                        ].map((job, idx) => (
                          <div key={idx} className="p-4 rounded-xl bg-slate-50 dark:bg-[#131722] border border-black/5 dark:border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm relative overflow-hidden group hover:border-primary/20 transition-all">
                            <div className="space-y-1 max-w-sm">
                              <div className="flex items-center gap-2">
                                <span className="text-[9px] uppercase font-bold text-primary px-1.5 py-0.5 rounded bg-primary/5 leading-none">{job.badge}</span>
                                <span className="text-[10px] text-slate-400 font-medium">{job.loc}</span>
                              </div>
                              <h4 className="font-extrabold text-xs sm:text-sm text-slate-950 dark:text-white leading-none mt-1">{job.title}</h4>
                              <span className="text-[11px] text-slate-500 dark:text-gray-400 font-semibold block">{job.company} • <strong className="font-mono text-slate-800 dark:text-slate-300 font-black">{job.salary}</strong></span>
                              <span className="text-[10px] text-slate-400 dark:text-text-secondary block font-medium leading-normal mt-1 border-t border-black/5 dark:border-white/5 pt-1">
                                AI Index: {job.reason}
                              </span>
                            </div>

                            {/* Job Match Wheel Badge (ONE-LINER SECURED) */}
                            <div className="text-left sm:text-right border-t sm:border-t-0 border-black/5 pt-3 sm:pt-0 sm:flex sm:flex-col sm:items-end flex-shrink-0">
                              <div className="inline-flex items-center gap-1 bg-teal-500/15 border border-teal-500/20 px-2.5 py-1.5 rounded-full text-xs font-black text-teal-500">
                                <Sparkles className="size-3.5" />
                                <span>{job.match}% MATCH</span>
                              </div>
                              <span className="text-[9px] text-slate-400 mt-1 block uppercase font-bold">READY TO SUBMIT</span>
                            </div>
                          </div>
                        ))}
                      </div>

                    </motion.div>
                  )}

                </AnimatePresence>
              </div>

            </div>
          </div>
        </section>


        {/* THE THREE CORE PILLARS SECTION (ATS SCAN, MULTI MOCK INTERVIEWS, GRACE REPORT, JOB BOARD) */}
        <section className="w-full max-w-7xl px-6 lg:px-16 py-16 lg:py-24 border-t border-black/5 dark:border-white/5">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-black uppercase tracking-wider text-primary bg-primary/10 px-3 py-1 rounded-full mb-4 inline-block">The Framework</span>
            <h2 className="text-3xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
              Four pillars for critical alignment.
            </h2>
            <p className="mt-4 text-slate-600 dark:text-text-secondary leading-relaxed">
              We focus purely on candidate alignment to target roles, ensuring your resume, speech timing, and target match score align cleanly.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 max-w-7xl mx-auto">
            
            {/* CARD 1: CV ATS COMPLIANCE */}
            <div className="p-8 rounded-3xl bg-white dark:bg-[#121620] border border-black/5 dark:border-white/5 flex flex-col justify-between shadow-sm relative group hover:border-primary/25 transition-all">
              <div className="space-y-4">
                <div className="size-11 rounded-xl bg-primary/15 text-primary flex items-center justify-center">
                  <FileText className="size-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">Advanced ATS CV Parser</h3>
                <p className="text-xs text-slate-600 dark:text-text-secondary leading-relaxed font-medium">
                  Scan and structure active keywords, ensuring hard statistics, deliverables, and STAR metric alignment pass modern keyword grading filters safely.
                </p>
              </div>
              <div className="pt-6 border-t border-black/5 mt-8 block">
                <span className="text-[10px] text-slate-400 font-bold uppercase block tracking-wider">01 / ATS OPTIMIZATION</span>
              </div>
            </div>

            {/* CARD 2: REAL-TIME AUDIO & VIDEO */}
            <div className="p-8 rounded-3xl bg-white dark:bg-[#121620] border border-black/5 dark:border-white/5 flex flex-col justify-between shadow-sm relative group hover:border-primary/25 transition-all">
              <div className="space-y-4">
                <div className="size-11 rounded-xl bg-indigo-500/15 text-indigo-500 flex items-center justify-center">
                  <Video className="size-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">Video & Audio Sandbox</h3>
                <p className="text-xs text-slate-600 dark:text-text-secondary leading-relaxed font-medium">
                  Practise under fully simulated WebRTC video streams. Our model processes speech pacing trends, posture alignments, and counts redundant vocal filters dynamically.
                </p>
              </div>
              <div className="pt-6 border-t border-black/5 mt-8 block">
                <span className="text-[10px] text-slate-400 font-bold uppercase block tracking-wider">02 / INTERVIEW ENGINE</span>
              </div>
            </div>

            {/* CARD 3: DETAILED CRITIQUE REPORTS */}
            <div className="p-8 rounded-3xl bg-white dark:bg-[#121620] border border-black/5 dark:border-white/5 flex flex-col justify-between shadow-sm relative group hover:border-primary/25 transition-all">
              <div className="space-y-4">
                <div className="size-11 rounded-xl bg-teal-500/15 text-teal-500 flex items-center justify-center">
                  <Award className="size-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">Full Performance Scorecard</h3>
                <p className="text-xs text-slate-600 dark:text-text-secondary leading-relaxed font-medium">
                  Get exact, actionable breakdowns detailing the exact errors made (speaking too fast, visual gaze drifts, structurally vague statements) and how to fix them.
                </p>
              </div>
              <div className="pt-6 border-t border-black/5 mt-8 block">
                <span className="text-[10px] text-slate-400 font-bold uppercase block tracking-wider">03 / PERFORMANCE SCORECARD</span>
              </div>
            </div>

            {/* CARD 4: SMART MATCH JOB BOARD */}
            <div className="p-8 rounded-3xl bg-white dark:bg-[#121620] border border-black/5 dark:border-white/5 flex flex-col justify-between shadow-sm relative group hover:border-primary/25 transition-all">
              <div className="space-y-4">
                <div className="size-11 rounded-xl bg-orange-500/15 text-orange-400 flex items-center justify-center">
                  <Briefcase className="size-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">Acoustic Job Match Finder</h3>
                <p className="text-xs text-slate-600 dark:text-text-secondary leading-relaxed font-medium">
                  We dynamically identify and serve active corporate listings. The matching filter aligns keyword score, target salary bounds, and interview compatibility.
                </p>
              </div>
              <div className="pt-6 border-t border-black/5 mt-8 block">
                <span className="text-[10px] text-slate-400 font-bold uppercase block tracking-wider">04 / JOB BOARD MODULE</span>
              </div>
            </div>

          </div>
        </section>


        {/* POWERFUL CALL TO ACTION (CTA) CONSERVING ONE-LINERS */}
        <section className="w-full max-w-7xl px-6 lg:px-16 py-16 mb-12">
          <div className="relative rounded-[40px] bg-gradient-to-r from-primary to-blue-700 text-white p-8 lg:p-16 text-center overflow-hidden shadow-xl">
            
            {/* Floating Background Sparkles */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full blur-[70px] pointer-events-none" />
            
            <div className="max-w-2xl mx-auto space-y-6 relative z-10">
              <span className="text-[10px] font-black uppercase tracking-wider bg-white/10 px-3 py-1 rounded-full inline-block leading-none">Instant Preparation</span>
              
              <h2 className="text-3xl sm:text-4xl lg:text-6xl font-black tracking-tight leading-none text-white">
                Ready to clear your target thresholds?
              </h2>
              
              <p className="text-xs sm:text-sm text-blue-100 max-w-lg mx-auto leading-relaxed">
                Connect your resume compiler, calibrate your microphone camera stream, and practice behavioral system tracks free.
              </p>

              {/* Secure single line button */}
              <div className="pt-4 flex justify-center">
                <button
                  onClick={handleQuickPractice}
                  className="w-full sm:w-auto text-nowrap whitespace-nowrap inline-flex items-center justify-center text-xs sm:text-sm font-black tracking-tight text-primary bg-white hover:bg-slate-50 px-8 py-4 rounded-2xl shadow-lg transition-transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer gap-2"
                >
                  Configure My Practice Profile <ArrowRight className="size-4" />
                </button>
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* FOOTER */}
      <footer className="w-full max-w-7xl px-6 lg:px-16 py-12 border-t border-black/5 dark:border-white/5 bg-white/50 dark:bg-background-dark/50 backdrop-blur-xl transition-colors text-xs text-slate-500 dark:text-text-secondary mt-auto flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-2">
          <Logo className="size-6 shadow-sm" />
          <span className="font-bold text-slate-800 dark:text-white">MockInterview.ai</span>
        </div>
        
        <p className="text-center sm:text-right font-medium">
          © 2026 MockInterview.ai Inc. Engineered for corporate readiness with ISO security encryption.
        </p>
      </footer>

    </div>
  );
};

export default LandingScreen;
