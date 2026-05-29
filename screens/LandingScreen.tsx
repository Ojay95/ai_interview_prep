import React, { useState, useEffect, useRef, useCallback } from 'react';
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

// Result-driven candidate records to demonstrate the platform power
const ATS_DUMMY_DEVICES = [
  {
    id: 'expert',
    role: 'Lead Cloud Infrastructure Architect',
    candidate: 'Alex Chen (Tailored Resume)',
    score: 95,
    matchRate: 'Optimized Resume Callback Rate: 98%',
    points: [
      'Engineered multi-region failover cluster reducing recovery downtime by 82%',
      'Architected high-throughput message bus processing 12B+ events daily',
      'Configured automated operators with custom metric real-time alerts'
    ],
    criticism: 'Excellent quantification of business outcomes. Bullet points match exactly what recruiters seek under high-volume streaming standards.'
  },
  {
    id: 'vague',
    role: 'Lead Cloud Infrastructure Architect',
    candidate: 'Jordan Smith (Untailored Resume)',
    score: 42,
    matchRate: 'Struggling Resume Callback Rate: 12%',
    points: [
      'Helped migrate applications and server containers to standard Cloud',
      'Attended basic team standups and read code merge logs',
      'Participated in solving platform system speed issues'
    ],
    criticism: 'Extremely generic phrasing without clear business impact or numbers. Missing target keywords vital to pass immediate automated applicant screenings.'
  }
];

export const LandingScreen: React.FC<LandingScreenProps> = ({ onNavigate }) => {
  const { bypassAuth } = useAuthStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // Simulation Step: 1 = CV Tailoring, 2 = Live WebRTC Interview, 3 = Scorecard Report, 4 = Related Jobs
  const [simulatorStep, setSimulatorStep] = useState<number>(1); 
  const isAutoPlaying = true;

  // Step 1: CV Tailoring Simulation States
  const [selectedCVIdx, setSelectedCVIdx] = useState(1); // Starts on weak Jordan
  const [cvScanning, setCvScanning] = useState(false);
  const [cvProgress, setCvProgress] = useState(0);
  const [cvScanned, setCvScanned] = useState(false);

  // Step 2: Audio+Video Interview States
  const [interviewResponseStyle, setInterviewResponseStyle] = useState<'none' | 'perfect' | 'poor'>('none');
  const [transcriptStream, setTranscriptStream] = useState('');
  const [vocalStatusAlert, setVocalStatusAlert] = useState<string | null>(null);
  const [faceCheckState, setFaceCheckState] = useState<'aligning' | 'locked' | 'drifted'>('aligning');

  // Step 3 & 4 States
  const [visualWaveBars, setVisualWaveBars] = useState<number[]>(new Array(18).fill(16));

  const waveIntervalRef = useRef<any>(null);
  const typingTimerRef = useRef<any>(null);
  const automationTimeoutRef = useRef<any>(null);
  const [faceMeshCoords, setFaceMeshCoords] = useState({ x: 50, y: 48, w: 32, h: 42 });

  // Cleanup timers
  const clearTypingTimer = () => {
    if (typingTimerRef.current) {
      clearInterval(typingTimerRef.current);
      typingTimerRef.current = null;
    }
  };

  // Acoustic Wave fluctuation & Face Tracker brackets coordinate motion simulation
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
      if (waveIntervalRef.current) {
        clearInterval(waveIntervalRef.current);
        waveIntervalRef.current = null;
      }
    }
    return () => {
      if (waveIntervalRef.current) {
        clearInterval(waveIntervalRef.current);
        waveIntervalRef.current = null;
      }
    };
  }, [interviewResponseStyle]);

  // Transcripts typing simulation with real-time bio feedback metrics
  const triggerSimulationOfFeedback = useCallback((style: 'perfect' | 'poor') => {
    clearTypingTimer();
    setInterviewResponseStyle(style);
    setTranscriptStream('');
    setVocalStatusAlert(null);
    setFaceCheckState(style === 'perfect' ? 'locked' : 'drifted');

    let fullText = '';
    if (style === 'perfect') {
      fullText = "To optimize the high-availability cluster under stress, I designed a multi-layered cache mechanism backed by distributed Redis clusters, keeping response latencies under 45ms and preventing database write locks.";
    } else {
      fullText = "So... like... we had this really big outage during Black Friday, and honestly, the database got super slow because everyone was trying to connect to it at once, and... uh... we basically just restarted the instance several times to survive.";
    }

    let i = 0;
    typingTimerRef.current = setInterval(() => {
      if (i < fullText.length) {
        setTranscriptStream(fullText.slice(0, i + 1));
        
        // Dynamic flags tracking confidence markers & errors
        if (style === 'poor') {
          if (i === 15) {
            setVocalStatusAlert('Vocal Filler Check: "like" (Slow pacing)');
          } else if (i === 45) {
            setVocalStatusAlert('Unconfident Speech Marker: "honestly"');
          } else if (i === 80) {
            setFaceCheckState('drifted');
            setVocalStatusAlert('Eye Alignment Lost: Keep gaze center');
          } else if (i === 120) {
            setVocalStatusAlert('Speaking Speed Hesitation Check');
          }
        } else {
          if (i === 20) {
            setVocalStatusAlert('Confident Pace: 130 WPM');
          } else if (i === 80) {
            setVocalStatusAlert('Critical Keywords Aligned: Redis');
          } else if (i === 140) {
            setVocalStatusAlert('Target STAR Structure Match');
          }
        }
        i += 2;
      } else {
        clearTypingTimer();
        if (style === 'perfect') {
          setVocalStatusAlert('Perfect Answer Score: Outstanding Delivery!');
        } else {
          setVocalStatusAlert('Answer Critique: Eye contact lost & 3 filler patterns tracked');
        }
      }
    }, 30);
  }, []);

  // High-fidelity fully automatic loop tracking
  useEffect(() => {
    if (!isAutoPlaying) {
      if (automationTimeoutRef.current) clearTimeout(automationTimeoutRef.current);
      return;
    }

    const startAutomatedFlow = async () => {
      try {
        // Step 1: CV Scan (Weak Jordan Resume first)
        setSimulatorStep(1);
        setSelectedCVIdx(1);
        setCvScanned(false);
        setCvScanning(false);
        setCvProgress(0);

        await new Promise(res => { automationTimeoutRef.current = setTimeout(res, 1200); });
        
        // Scanning weak profile
        setCvScanning(true);
        for (let p = 0; p <= 100; p += 10) {
          setCvProgress(p);
          await new Promise(res => { automationTimeoutRef.current = setTimeout(res, 80); });
        }
        setCvScanning(false);
        setCvScanned(true);

        await new Promise(res => { automationTimeoutRef.current = setTimeout(res, 3500); });

        // Switch to the optimized tailored version to show visual contrast
        setSelectedCVIdx(0);
        setCvScanned(false);
        setCvProgress(0);

        await new Promise(res => { automationTimeoutRef.current = setTimeout(res, 800); });

        setCvScanning(true);
        for (let p = 0; p <= 100; p += 10) {
          setCvProgress(p);
          await new Promise(res => { automationTimeoutRef.current = setTimeout(res, 80); });
        }
        setCvScanning(false);
        setCvScanned(true);

        // Keep tailored version on-screen for review
        await new Promise(res => { automationTimeoutRef.current = setTimeout(res, 4000); });

        // Step 2: Live camera / WebRTC session
        setSimulatorStep(2);
        setInterviewResponseStyle('none');
        setTranscriptStream('');
        setVocalStatusAlert(null);
        setFaceCheckState('aligning');

        await new Promise(res => { automationTimeoutRef.current = setTimeout(res, 1500); });

        // Start scanning with poor response style
        triggerSimulationOfFeedback('poor');
        await new Promise(res => { automationTimeoutRef.current = setTimeout(res, 5500); });

        // Let player see perfect response transition
        triggerSimulationOfFeedback('perfect');
        await new Promise(res => { automationTimeoutRef.current = setTimeout(res, 6000); });

        // Step 3: Performance critique metric
        setSimulatorStep(3);
        await new Promise(res => { automationTimeoutRef.current = setTimeout(res, 6500); });

        // Step 4: Live jobs list
        setSimulatorStep(4);
        await new Promise(res => { automationTimeoutRef.current = setTimeout(res, 6000); });

        // Loop to start
        startAutomatedFlow();
      } catch {
        // Safe catch
      }
    };

    startAutomatedFlow();

    return () => {
      if (automationTimeoutRef.current) clearTimeout(automationTimeoutRef.current);
    };
  }, [isAutoPlaying, triggerSimulationOfFeedback]);

  // Clean timeouts on unmount
  useEffect(() => {
    return () => {
      clearTypingTimer();
      if (automationTimeoutRef.current) clearTimeout(automationTimeoutRef.current);
    };
  }, []);

  const handleManualStepSelect = (idx: number) => {
    setSimulatorStep(idx);
    clearTypingTimer();

    // Set stable states for corresponding index
    if (idx === 1) {
      setSelectedCVIdx(0);
      setCvScanning(false);
      setCvScanned(true);
    } else if (idx === 2) {
      triggerSimulationOfFeedback('perfect');
    }
  };

  const handleQuickPractice = () => {
    bypassAuth();
    onNavigate(Screen.Dashboard);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background-light dark:bg-[#090b11] text-slate-900 dark:text-white overflow-x-hidden selection:bg-primary/20 transition-colors duration-300 relative">
      
      {/* BEAUTIFUL SLOW MOVING BACKGROUND MOVEMENT TO PREVENT DRYNESS */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
        <motion.div
          animate={{
            x: [0, 40, -30, 0],
            y: [0, -30, 40, 0],
            scale: [1, 1.12, 0.94, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-10 left-10 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-primary/[0.04] dark:bg-primary/[0.03] rounded-full blur-[80px] sm:blur-[120px]"
        />
        <motion.div
          animate={{
            x: [0, -40, 25, 0],
            y: [0, 60, -20, 0],
            scale: [1, 0.88, 1.1, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-[500px] right-20 w-[350px] sm:w-[550px] h-[350px] sm:h-[550px] bg-teal-400/[0.05] dark:bg-emerald-500/[0.02] rounded-full blur-[90px] sm:blur-[130px]"
        />
        <motion.div
          animate={{
            x: [0, 30, -30, 0],
            y: [0, 40, -30, 0],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-[1300px] left-1/4 w-[280px] sm:w-[450px] h-[280px] sm:h-[450px] bg-indigo-500/[0.03] dark:bg-blue-600/[0.02] rounded-full blur-[70px] sm:blur-[110px]"
        />
        
        {/* Soft Grid overlay with a gentle float drift */}
        <motion.div 
          animate={{ y: [0, 15, 0] }}
          transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-0 bg-[linear-gradient(rgba(25,76,230,0.012)_1px,transparent_1px),linear-gradient(90deg,rgba(25,76,230,0.012)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(255,255,255,0.012)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.012)_1px,transparent_1px)] bg-[size:42px_42px] opacity-80"
        />
      </div>

      {/* STICKY HEADER */}
      <nav className="sticky top-0 z-50 bg-white/75 dark:bg-[#090b11]/75 backdrop-blur-xl border-b border-black/5 dark:border-white/5 px-6 lg:px-16 py-4 flex items-center justify-between transition-colors duration-300">
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
            { id: 1, label: '1. CV Tailoring' },
            { id: 2, label: '2. Live Interview' },
            { id: 3, label: '3. Performance Scorecard' },
            { id: 4, label: '4. Related Jobs' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => handleManualStepSelect(tab.id)}
              className={`relative px-4 py-2 text-xs font-bold rounded-full transition-all whitespace-nowrap text-[10px] uppercase tracking-wider ${
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
            className="hidden sm:inline-flex whitespace-nowrap text-[10px] sm:text-xs font-black uppercase tracking-wider text-slate-600 dark:text-text-secondary hover:text-primary dark:hover:text-white px-3 py-2 transition-colors cursor-pointer"
          >
            Sign In
          </button>
          
          <button 
            onClick={() => onNavigate(Screen.SignUp)}
            className="whitespace-nowrap inline-flex items-center justify-center text-[9px] sm:text-[10px] md:text-xs font-black uppercase tracking-wider text-white bg-primary hover:bg-primary-hover px-4 sm:px-5 py-2.5 rounded-full shadow-lg shadow-primary/10 hover:shadow-primary/20 transition-all cursor-pointer truncate"
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
            className="absolute top-[72px] left-0 w-full bg-white dark:bg-[#0c0f17] border-b border-black/5 dark:border-white/5 z-40 p-6 flex flex-col gap-4 overflow-hidden md:hidden"
          >
            {[
              { id: 1, label: 'Resume Analyzer' },
              { id: 2, label: 'Live Video Training' },
              { id: 3, label: 'Detailed Critique' },
              { id: 4, label: 'Job Launcher' }
            ].map(tab => (
              <button 
                key={tab.id}
                onClick={() => { setIsMenuOpen(false); handleManualStepSelect(tab.id); document.getElementById('simulation-stage')?.scrollIntoView({ behavior: 'smooth', block: 'center' }); }}
                className="text-left py-2 font-black text-slate-800 dark:text-white hover:text-primary text-[10px] tracking-wider uppercase whitespace-nowrap"
              >
                {tab.label}
              </button>
            ))}
            <div className="h-px bg-black/5 dark:bg-white/5 my-2"></div>
            <div className="flex flex-col gap-3">
              <button 
                onClick={() => onNavigate(Screen.SignIn)}
                className="w-full py-3 rounded-xl border border-black/5 dark:border-white/10 text-center font-black uppercase tracking-wider text-slate-800 dark:text-white text-[10px] whitespace-nowrap cursor-pointer"
              >
                Sign In
              </button>
              <button 
                onClick={() => onNavigate(Screen.SignUp)}
                className="w-full py-3 rounded-xl bg-primary hover:bg-primary-hover text-center font-black uppercase tracking-wider text-white shadow-lg text-[10px] whitespace-nowrap cursor-pointer"
              >
                Sign Up Free
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="flex-grow flex flex-col items-center">

        {/* HERO SECTION: RESULTS-DRIVEN COPY FOCUSING ON CONFIDENCE & CALLBACKS */}
        <section className="w-full max-w-7xl px-6 lg:px-16 pt-16 lg:pt-28 pb-12 flex flex-col items-center text-center relative">
          
          <motion.div 
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/[0.04] dark:bg-white/5 border border-primary/10 dark:border-white/10 text-primary dark:text-teal-400 text-[10px] font-bold uppercase tracking-wider mb-8 backdrop-blur-md"
          >
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary dark:bg-teal-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary dark:bg-teal-400"></span>
            </span>
            Double Your Callbacks & Build Unshakable Interview Confidence
          </motion.div>

          <h1 className="text-4xl sm:text-6xl lg:text-8xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.05] max-w-5xl">
            Go from anxious to unstoppable in{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-blue-600 to-teal-400">
              your next interview.
            </span>
          </h1>

          <p className="mt-8 text-xs sm:text-sm lg:text-base text-slate-600 dark:text-text-secondary max-w-3xl leading-relaxed">
            Stop guessing why you are not getting offers. Instantly tailor your resume with our CV Scanner to pass screeners, master tough behavioral questions under comfortable camera & voice simulations, and connect directly to relevant job openings.
          </p>

          {/* COMPACT ONE-LINER BUTTON ASSEMBLIES FOR MOBILE/DESKTOP */}
          <div className="mt-10 flex flex-col sm:flex-row gap-4 items-center justify-center w-full max-w-md">
            <button 
              onClick={handleQuickPractice}
              className="w-full sm:w-auto text-nowrap whitespace-nowrap inline-flex items-center justify-center text-[10px] sm:text-xs md:text-sm font-black uppercase tracking-wider text-white bg-primary hover:bg-primary-hover px-8 py-4 rounded-2xl shadow-xl shadow-primary/20 hover:shadow-primary/30 active:scale-[0.98] transform transition-all cursor-pointer gap-2 truncate"
            >
              Start Free Training <ArrowRight className="size-4" />
            </button>
            
            <button
              onClick={() => {
                const simSec = document.getElementById('simulation-stage');
                if (simSec) simSec.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }}
              className="w-full sm:w-auto text-nowrap whitespace-nowrap inline-flex items-center justify-center text-[10px] sm:text-xs md:text-sm font-black uppercase tracking-wider text-slate-800 dark:text-white bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 px-8 py-4 rounded-2xl border border-black/5 dark:border-white/10 transition-all cursor-pointer truncate"
            >
              Watch Simulation Inside
            </button>
          </div>

          <div className="mt-8 flex items-center gap-6 text-[10px] text-slate-500 dark:text-text-secondary font-bold uppercase tracking-wider">
            <span className="flex items-center gap-1.5"><Shield className="size-3.5 text-teal-450" /> Secure AES Encrypted</span>
            <div className="size-1.5 bg-slate-300 dark:bg-slate-700 rounded-full" />
            <span className="flex items-center gap-1.5"><Star className="size-3.5 text-amber-500 fill-amber-500" /> Bio-Tracking Gaze Feedback</span>
          </div>
        </section>


        {/* THE IMMERSIVE PLATFORM SIMULATION (ACTUAL MOTION MECHANICS) */}
        <section id="simulation-stage" className="w-full max-w-7xl px-6 lg:px-16 py-12 lg:py-16">
          <div className="p-1 rounded-[36px] bg-gradient-to-b from-black/5 to-black/[0.02] dark:from-white/10 dark:to-white/[0.02] shadow-2xl relative overflow-hidden">
            
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-[100px] pointer-events-none -z-10" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-teal-500/5 rounded-full blur-[100px] pointer-events-none -z-10" />

            {/* Inner Interactive Simulator Box */}
            <div className="bg-white dark:bg-[#0f121d] rounded-[34px] p-6 lg:p-12">
              
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 border-b border-black/5 dark:border-white/10 pb-8">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-primary dark:text-teal-400 block mb-1">
                    Automated Live Demonstration
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-none">
                    Preview the platform in action
                  </h2>
                </div>

                {/* Automation Controllers */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full lg:w-auto">
                  
                  {/* Automated Demonstration Status Indicator */}
                  <div className="flex-shrink-0 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-slate-100 dark:bg-white/5 text-[9px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-300 border border-black/5 dark:border-white/5 select-none md:mr-1">
                    <span className="flex h-2 w-2 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    <span>Live Simulation</span>
                  </div>

                  {/* Switcher Buttons Grid - One liner text sizes enforced */}
                  <div className="grid grid-cols-2 lg:flex lg:items-center gap-2">
                    {[
                      { id: 1, name: '1. CV Analyzer', icon: FileCheck },
                      { id: 2, name: '2. Live Interview', icon: Video },
                      { id: 3, name: '3. Critique Report', icon: Award },
                      { id: 4, name: '4. job Matching', icon: Briefcase }
                    ].map(step => (
                      <button
                        key={step.id}
                        onClick={() => handleManualStepSelect(step.id)}
                        className={`text-nowrap whitespace-nowrap inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-[9px] uppercase tracking-wider font-extrabold border transition-all cursor-pointer truncate ${
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
                      {/* Left: Input Selection panel */}
                      <div className="flex flex-col justify-between p-6 rounded-2xl bg-slate-50 dark:bg-[#141825] border border-black/5 dark:border-white/5 shadow-sm">
                        <div className="space-y-4">
                          <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                            <Sparkles className="size-5 text-primary animate-pulse" /> Resumes Tailored to Job Specs
                          </h3>
                          <p className="text-xs text-slate-500 dark:text-text-secondary leading-normal">
                            We automatically extract crucial skill terms, structure and rewrite achievements into the high-impact STAR structure, and boost CV callback scores.
                          </p>

                          <div className="space-y-2 mt-4 text-[10px] font-bold text-slate-700 dark:text-gray-300">
                            <label className="text-[9px] uppercase font-bold text-slate-400 block tracking-widest">Compare Resume Profiles:</label>
                            
                            <div className="grid grid-cols-1 gap-2">
                              {ATS_DUMMY_DEVICES.map((prof, idx) => (
                                <button
                                  key={idx}
                                  onClick={() => {
                                    setSelectedCVIdx(idx);
                                    setCvScanned(false);
                                    setCvProgress(0);
                                  }}
                                  className={`p-3 rounded-xl border text-left flex flex-col items-start transition-all cursor-pointer ${
                                    selectedCVIdx === idx
                                      ? 'bg-white dark:bg-[#1b2133] border-primary dark:border-teal-500 shadow-sm'
                                      : 'bg-transparent border-black/5 dark:border-white/5 hover:border-black/10 dark:hover:border-white/10 opacity-75'
                                  }`}
                                >
                                  <div className="flex items-center justify-between w-full">
                                    <span className="font-extrabold text-[11px] text-slate-900 dark:text-white leading-none">{prof.candidate}</span>
                                    <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded leading-none ${
                                      idx === 0 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'
                                    }`}>
                                      {idx === 0 ? 'Tailored Profile' : 'Weak Profile'}
                                    </span>
                                  </div>
                                  <span className="text-[9px] text-slate-400 dark:text-text-secondary mt-1.5 block font-mono">{prof.role}</span>
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="pt-6 border-t border-black/5 dark:border-white/5 mt-6">
                          <button
                            onClick={() => {
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
                                  return prev + 10;
                                });
                              }, 100);
                            }}
                            disabled={cvScanning}
                            className="w-full text-nowrap whitespace-nowrap inline-flex items-center justify-center text-[9px] sm:text-[10px] md:text-xs font-black uppercase tracking-wider text-white bg-primary hover:bg-primary-hover disabled:bg-slate-350 dark:disabled:bg-slate-800 p-4 rounded-xl shadow transition-all cursor-pointer gap-2 truncate"
                          >
                            {cvScanning ? (
                              <>
                                <RefreshCw className="size-4 animate-spin" /> Tailoring & Mapping ({cvProgress}%)
                              </>
                            ) : (
                              <>
                                <Sparkles className="size-4" /> Scan & Optimize This Resume
                              </>
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Right: Dynamic Automated scanner readout output */}
                      <div className="flex flex-col justify-center min-h-[300px] border border-black/5 dark:border-white/15 rounded-2xl bg-white dark:bg-[#111420] p-6 shadow-sm relative overflow-hidden">
                        
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
                                <h4 className="font-black text-xs text-slate-900 dark:text-white uppercase tracking-wider leading-none">Comparing resume words...</h4>
                                <span className="text-[9px] text-slate-400 mt-2 block uppercase tracking-wider">Quantifying STAR achievement metrics under target standards</span>
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
                                  <span className="text-[8px] uppercase font-black text-primary block leading-none">CV Keyword Strength Index</span>
                                  <h4 className="text-[11px] font-black text-slate-500 mt-1.5 leading-none">{ATS_DUMMY_DEVICES[selectedCVIdx].candidate}</h4>
                                </div>
                                <div className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-black ${
                                  ATS_DUMMY_DEVICES[selectedCVIdx].score >= 80 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'
                                }`}>
                                  Score: {ATS_DUMMY_DEVICES[selectedCVIdx].score}%
                                </div>
                              </div>

                              <div className="p-3 bg-slate-50 dark:bg-[#161a29] border border-black/5 dark:border-white/5 rounded-xl text-[11px] leading-relaxed">
                                <span className="text-[8px] uppercase font-black tracking-wider text-slate-400 block mb-1">RECRUITER ALIGNMENT ANALYSIS</span>
                                <p className="text-slate-700 dark:text-gray-300 font-medium font-sans">
                                  {ATS_DUMMY_DEVICES[selectedCVIdx].criticism}
                                </p>
                              </div>

                              <div>
                                <span className="text-[8px] uppercase font-black tracking-widest text-slate-400 block mb-2">EXTRACTED KEY STATS AND BULLETS:</span>
                                <div className="space-y-2">
                                  {ATS_DUMMY_DEVICES[selectedCVIdx].points.map((pt, i) => (
                                    <div key={i} className="flex items-start gap-2.5 text-[11px] text-slate-600 dark:text-gray-400 font-medium">
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
                              <div className="size-12 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400 mx-auto animate-bounce">
                                <FileText className="size-6" />
                              </div>
                              <div>
                                <h4 className="font-extrabold text-[11px] text-slate-900 dark:text-white uppercase tracking-wider leading-none">Scanning Engine Live</h4>
                                <p className="text-[10px] text-slate-400 mt-2 max-w-xs mx-auto">
                                  Autoplay is scanning resume variations to show the exact difference recruiters notice.
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
                      {/* Left: Camera simulation overlay boxes */}
                      <div className="lg:col-span-7 flex flex-col justify-between p-6 rounded-2xl bg-slate-900 dark:bg-slate-950 text-white min-h-[380px] hover:shadow-lg transition-all relative overflow-hidden flex-shrink-0">
                        <div className="absolute top-4 right-4 bg-orange-500/15 border border-orange-500/20 rounded px-2 py-0.5 text-[8px] tracking-widest uppercase font-mono text-orange-400 z-10 flex items-center gap-1">
                          <Activity className="size-2.5 animate-pulse" /> LIVE AUTO TRACKER ACTIVE
                        </div>

                        {/* Camera viewport simulation */}
                        <div className="relative bg-[#0d1017] border border-white/10 rounded-xl overflow-hidden aspect-video flex items-center justify-center max-w-xl mx-auto w-full">
                          
                          <div className="absolute inset-0 flex items-center justify-center">
                            
                            {/* Mesh mesh align lines */}
                            <div className="absolute border border-teal-500/40 rounded-full animate-pulse transition-all duration-300"
                                 style={{
                                   left: `${faceMeshCoords.x - faceMeshCoords.w / 2}%`,
                                   top: `${faceMeshCoords.y - faceMeshCoords.h / 2}%`,
                                   width: `${faceMeshCoords.w}%`,
                                   height: `${faceMeshCoords.h}%`
                                 }}
                            >
                              <span className="absolute top-0 left-0 border-t-2 border-l-2 border-teal-400 w-3 h-3 rounded-tl" />
                              <span className="absolute top-0 right-0 border-t-2 border-r-2 border-teal-400 w-3 h-3 rounded-tr" />
                              <span className="absolute bottom-0 left-0 border-b-2 border-l-2 border-teal-400 w-3 h-3 rounded-bl" />
                              <span className="absolute bottom-0 right-0 border-b-2 border-r-2 border-teal-400 w-3 h-3 rounded-br" />
                              
                              <div className="absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-[8px] font-mono font-bold bg-[#143db8] text-white px-1.5 py-0.5 rounded leading-none shadow">
                                ANATOMICAL EYE ALIGNMENT: {faceCheckState === 'locked' ? '98% STABLE' : 'DRIFTED WARNING'}
                              </div>
                            </div>

                            <div className="text-center space-y-2 opacity-80">
                              <div className="size-16 rounded-full bg-slate-800 border-2 border-slate-700 mx-auto flex items-center justify-center relative">
                                <Video className="size-7 text-slate-400" />
                                {interviewResponseStyle === 'perfect' && (
                                  <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-[10px] font-black p-0.5 rounded-full z-10">
                                    <CheckCircle className="size-4 text-white" />
                                  </div>
                                )}
                              </div>
                              <span className="text-[9px] font-mono tracking-wider uppercase text-slate-400 block mt-2">
                                {faceCheckState === 'locked' && 'Gaze: Centered & Focused'}
                                {faceCheckState === 'aligning' && 'Initializing mesh calibration tracker...'}
                                {faceCheckState === 'drifted' && '⚠️ Warning: Gaze avoiding camera'}
                              </span>
                            </div>
                          </div>

                        </div>

                        {/* Acoustic tracking waveform bars */}
                        <div className="flex items-center justify-between mt-6 bg-slate-950/80 border border-white/5 p-4 rounded-xl">
                          <div className="flex items-center gap-1">
                            <span className="bg-red-500 w-1.5 h-1.5 rounded-full animate-ping mr-1" />
                            <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider">Acoustic Audio Conduit</span>
                          </div>

                          <div className="flex gap-1 items-center h-8">
                            {visualWaveBars.map((h, i) => (
                              <div
                                key={i}
                                className="w-1 bg-[#143db8] dark:bg-[#14b8a6] rounded-full transition-all duration-100"
                                style={{ height: `${h}%`, minHeight: '4px' }}
                              />
                            ))}
                          </div>
                        </div>

                      </div>

                      {/* Right: Audio stats alerts with clear results description */}
                      <div className="lg:col-span-5 flex flex-col justify-between p-6 rounded-2xl bg-white dark:bg-[#111420] border border-black/5 dark:border-white/5 shadow-sm">
                        <div className="space-y-4">
                          <div className="flex items-center gap-2">
                            <Volume2 className="size-5 text-indigo-500" />
                            <h3 className="text-base font-black text-slate-900 dark:text-white leading-none">Unshakable Voice Confidence</h3>
                          </div>
                          
                          <p className="text-xs text-slate-500 dark:text-text-secondary leading-normal">
                            Practising aloud under live camera simulation is the only way to overcome interview panic. We tracks vocal filler levels, pauses, and speech rates in real time.
                          </p>

                          <div className="space-y-2 pt-2">
                            <label className="text-[9px] uppercase font-bold text-slate-400 block tracking-widest">Compare Response Speaking styles:</label>
                            
                            <div className="grid grid-cols-1 gap-2">
                              {/* One liner triggers */}
                              <button
                                onClick={() => { triggerSimulationOfFeedback('perfect'); }}
                                className="w-full text-nowrap whitespace-nowrap inline-flex items-center justify-between p-3 rounded-lg border border-black/5 dark:border-white/5 bg-slate-100/40 dark:bg-white/[0.02] hover:bg-slate-100 dark:hover:bg-white/5 font-black uppercase text-[9px] text-slate-750 dark:text-slate-350 transition-all cursor-pointer truncate"
                              >
                                <span>Perfect STAR response model</span>
                                <ChevronRight className="size-4 text-emerald-500" />
                              </button>

                              <button
                                onClick={() => { triggerSimulationOfFeedback('poor'); }}
                                className="w-full text-nowrap whitespace-nowrap inline-flex items-center justify-between p-3 rounded-lg border border-black/5 dark:border-white/5 bg-slate-100/40 dark:bg-white/[0.02] hover:bg-slate-100 dark:hover:bg-white/5 font-black uppercase text-[9px] text-slate-750 dark:text-slate-350 transition-all cursor-pointer truncate"
                              >
                                <span>Rambling response (Stuttering/drifting)</span>
                                <ChevronRight className="size-4 text-orange-400" />
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Transcription real time container */}
                        <div className="mt-6 pt-6 border-t border-black/5 dark:border-white/5 space-y-3">
                          <label className="text-[9px] uppercase font-bold text-slate-400 block tracking-widest">SPEECH CONTEXT EXTRACTOR:</label>
                          
                          <div className="p-3 bg-slate-55 dark:bg-[#161924] border border-black/5 dark:border-white/5 rounded-xl block min-h-[95px] text-[11px] leading-relaxed">
                            {transcriptStream ? (
                              <div className="space-y-2">
                                <p className="text-slate-700 dark:text-slate-300 font-mono italic">
                                  "{transcriptStream}"
                                </p>
                                {vocalStatusAlert && (
                                  <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-[#2a2c3a] border border-white/5 text-[9px] font-mono text-teal-400 font-bold leading-none animate-pulse">
                                    <span>INDICATOR TRIGGER: {vocalStatusAlert}</span>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <p className="text-slate-400 italic">No stream active. Simulated autopilot is typing spoken lines and pinpointing structural bugs.</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}


                  {/* STEP 3: PERFORMANCE scorecard critique */}
                  {simulatorStep === 3 && (
                    <motion.div
                      key="step3"
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -15 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-6"
                    >
                      <div className="max-w-xl">
                        <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                          <Award className="size-5 text-teal-500" /> 
                          Complete Actionable critique
                        </h3>
                        <p className="text-xs text-slate-500 mt-1">
                          No vague, meaningless pass/fail answers. We output a pinpointed scorecard analyzing exactly what you are doing wrong and how to practice.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
                        
                        {/* Overall Metrics block */}
                        <div className="md:col-span-4 p-6 rounded-2xl bg-slate-50 dark:bg-[#131723] border border-black/5 dark:border-white/5 flex flex-col justify-between shadow-sm relative overflow-hidden">
                          <div>
                            <span className="text-[8px] uppercase font-mono tracking-widest text-slate-400 block mb-1">SESSION LOG: #A92-MOCK</span>
                            <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">Overall Performance Score</h4>
                            <p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed">Composite indicator weighing speech pacing, keyword coverage, architectural structure, and torso posture.</p>
                          </div>

                          <div className="my-6 text-center space-y-1">
                            <strong className="text-5xl font-black text-slate-900 dark:text-white leading-none">88/100</strong>
                            <span className="text-[9px] font-black text-teal-500 block uppercase tracking-widest">STATUS: HIGH CONFIDENCE CLEARANCE</span>
                          </div>

                          <div className="space-y-2 border-t border-black/5 dark:border-white/5 pt-4 text-[10px] font-extrabold uppercase tracking-wider">
                            <div className="flex justify-between">
                              <span className="text-slate-500">Speaking Pacing Rate:</span>
                              <strong className="text-slate-800 dark:text-slate-200">130 WPM (Steady)</strong>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500">Eye Alignment Lock:</span>
                              <strong className="text-slate-800 dark:text-slate-200">92% Continuous</strong>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500">STAR Structure Match:</span>
                              <strong className="text-slate-800 dark:text-slate-200">100% Compliant</strong>
                            </div>
                          </div>
                        </div>

                        {/* Diagnostic breakdowns list */}
                        <div className="md:col-span-8 p-6 rounded-2xl bg-white dark:bg-[#111420] border border-black/5 dark:border-white/5 shadow-sm space-y-4">
                          <span className="text-[8px] uppercase font-black text-slate-400 block tracking-widest leading-none">Acoustics & Visual Core Critique</span>
                          
                          <div className="space-y-3">
                            {[
                              {
                                parameter: 'What you did right (Outstanding articulation):',
                                feedback: 'Excellent technical vocabulary depth. You cleanly emphasized multithreading bottlenecks, failovers, and Redis sliding windows without hesitation pauses.',
                                status: 'good'
                              },
                              {
                                parameter: 'What you did incorrect (Vocal pacing speed):',
                                feedback: 'During your behavioral delivery, anxiety pushed your speaking rate to 175 WPM. Force yourself to introduce 0.5s deliberate transitions between sentences.',
                                status: 'correction'
                              },
                              {
                                parameter: 'What you did incorrect (Camera posture avoidances):',
                                feedback: 'High speaking intensity caused minor nervous shifts, leaning outside the camera brackets. Gaze drifted to the keyboard area instead of keeping lens focus.',
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
                                  <strong className={`font-black uppercase text-[10px] tracking-wider block ${diag.status === 'good' ? 'text-emerald-500' : 'text-orange-405'}`}>
                                    {diag.parameter}
                                  </strong>
                                  <p className="text-[11px] font-sans font-medium">{diag.feedback}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                      </div>
                    </motion.div>
                  )}


                  {/* STEP 4: RELATED JOB DISCOVERY */}
                  {simulatorStep === 4 && (
                    <motion.div
                      key="step4"
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -15 }}
                      transition={{ duration: 0.3 }}
                      className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
                    >
                      {/* Left Side: Result driven info for career Matching */}
                      <div className="lg:col-span-5 space-y-4">
                        <div className="flex items-center gap-2">
                          <Briefcase className="size-5 text-indigo-500" />
                          <h3 className="text-base font-black text-slate-900 dark:text-white leading-none">Instant applications matching your CV</h3>
                        </div>
                        
                        <p className="text-xs text-slate-500 dark:text-text-secondary leading-relaxed">
                          Do not waste weeks scrolling boring boards. Our filter matches your exact verified scores, tailored resume keyword matrices, and salary criteria to open jobs.
                        </p>

                        <div className="space-y-2 border-t border-black/5 dark:border-white/10 pt-4 text-[10px] font-bold uppercase tracking-wider">
                          <div className="flex items-center gap-2 text-slate-600 dark:text-text-secondary">
                            <CheckCircle className="size-4 text-teal-400" /> Instant matching based on tailored resume keywords
                          </div>
                          <div className="flex items-center gap-2 text-slate-600 dark:text-text-secondary">
                            <CheckCircle className="size-4 text-teal-400" /> Auto match algorithm flags your high-confidence score
                          </div>
                          <div className="flex items-center gap-2 text-slate-600 dark:text-text-secondary">
                            <CheckCircle className="size-4 text-teal-400" /> Apply in one click directly to hiring corporate rosters
                          </div>
                        </div>
                      </div>

                      {/* Right: Mock listing options with badges */}
                      <div className="lg:col-span-7 grid grid-cols-1 gap-3.5">
                        {[
                          {
                            title: 'Staff Platform Engineer',
                            company: 'Redis Technology Co.',
                            loc: 'Distributed / Remote',
                            salary: '$165,000 - $210,000',
                            match: 96,
                            reason: 'High score match in distributed caching, multithreading, and memory locks',
                            badge: 'Enterprise Architecture'
                          },
                          {
                            title: 'Senior Systems Architect',
                            company: 'HashiCorp Systems Corp',
                            loc: 'San Francisco, CA (Hybrid)',
                            salary: '$180,000 - $240,000',
                            match: 88,
                            reason: 'High score match in microservices fault tolerance and container meshes',
                            badge: 'SRE & Platform'
                          }
                        ].map((job, idx) => (
                          <div key={idx} className="p-4 rounded-xl bg-slate-50 dark:bg-[#131722] border border-black/5 dark:border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm relative overflow-hidden group hover:border-primary/20 transition-all">
                            <div className="space-y-1.5 max-w-sm">
                              <div className="flex items-center gap-2">
                                <span className="text-[8px] uppercase font-black text-primary px-1.5 py-0.5 rounded bg-primary/5 leading-none">{job.badge}</span>
                                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">{job.loc}</span>
                              </div>
                              <h4 className="font-extrabold text-xs sm:text-sm text-slate-930 dark:text-white leading-none mt-1">{job.title}</h4>
                              <span className="text-[10px] text-slate-500 dark:text-gray-400 font-bold block uppercase tracking-wider">{job.company} • <strong className="font-mono text-slate-800 dark:text-slate-300 font-black">{job.salary}</strong></span>
                              <span className="text-[10px] text-slate-400 dark:text-text-secondary block font-medium leading-normal mt-1 border-t border-black/5 dark:border-white/5 pt-1.5 font-sans">
                                Match Reason: {job.reason}
                              </span>
                            </div>

                            {/* Applied badge / Match indicator */}
                            <div className="text-left sm:text-right border-t sm:border-t-0 border-black/5 pt-3 sm:pt-0 sm:flex sm:flex-col sm:items-end flex-shrink-0">
                              <div className="inline-flex items-center gap-1.5 bg-teal-500/15 border border-teal-500/20 px-3 py-1.5 rounded-full text-[9px] font-black text-teal-600 dark:text-teal-400 uppercase tracking-widest leading-none">
                                <Sparkles className="size-3" />
                                <span>{job.match}% MATCH</span>
                              </div>
                              <span className="text-[8px] text-slate-400 mt-2 block uppercase font-mono font-bold tracking-widest">TAP FOR INSTANT SUBMIT</span>
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


        {/* THE RESULTS-DRIVEN COPY PILLARS */}
        <section className="w-full max-w-7xl px-6 lg:px-16 py-16 lg:py-24 border-t border-black/5 dark:border-white/5">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-[9px] font-black uppercase tracking-widest text-primary bg-primary/10 px-3 py-1 rounded-full mb-4 inline-block">YOUR COMPLETE PREPARATION SUITE</span>
            <h2 className="text-3xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
              Crafted to secure your next career milestone.
            </h2>
            <p className="mt-4 text-xs sm:text-sm text-slate-600 dark:text-text-secondary leading-relaxed">
              We skip the boring, passive technical details. We focus purely on what matters: confidence under pressure, beautiful tailored CV copy, and direct hiring board access.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 max-w-7xl mx-auto">
            
            {/* PILLAR 1 */}
            <div className="p-8 rounded-3xl bg-white dark:bg-[#121620] border border-black/5 dark:border-white/5 flex flex-col justify-between shadow-sm relative group hover:border-primary/25 transition-all">
              <div className="space-y-4">
                <div className="size-11 rounded-xl bg-primary/15 text-primary flex items-center justify-center">
                  <FileText className="size-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white leading-tight">Instant CV Tailoring</h3>
                <p className="text-xs text-slate-600 dark:text-text-secondary leading-relaxed font-semibold">
                  Instantly tailor your CV to any job description to align exact recruitment keywords, maximize structural scores, and stand out under intense automated screeners.
                </p>
              </div>
              <div className="pt-6 border-t border-black/5 mt-8 block">
                <span className="text-[9px] text-slate-400 font-bold uppercase block tracking-wider">01 / HIGHER CALLBACKS</span>
              </div>
            </div>

            {/* PILLAR 2 */}
            <div className="p-8 rounded-3xl bg-white dark:bg-[#121620] border border-black/5 dark:border-white/5 flex flex-col justify-between shadow-sm relative group hover:border-primary/25 transition-all">
              <div className="space-y-4">
                <div className="size-11 rounded-xl bg-indigo-500/15 text-indigo-500 flex items-center justify-center">
                  <Video className="size-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white leading-tight">Comfortable Voice Practice</h3>
                <p className="text-xs text-slate-600 dark:text-text-secondary leading-relaxed font-semibold">
                  Practice with a live audio & video simulator to conquer stage fright. Master your sentence pacing, eliminate "um" fillers, and feel completely prepared and calm.
                </p>
              </div>
              <div className="pt-6 border-t border-black/5 mt-8 block">
                <span className="text-[9px] text-slate-400 font-bold uppercase block tracking-wider">02 / BULLITPROOF CONFIDENCE</span>
              </div>
            </div>

            {/* PILLAR 3 */}
            <div className="p-8 rounded-3xl bg-white dark:bg-[#121620] border border-black/5 dark:border-white/5 flex flex-col justify-between shadow-sm relative group hover:border-primary/25 transition-all">
              <div className="space-y-4">
                <div className="size-11 rounded-xl bg-teal-500/15 text-teal-500 flex items-center justify-center">
                  <Award className="size-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white leading-tight">Pinpointed Performance Score</h3>
                <p className="text-xs text-slate-600 dark:text-text-secondary leading-relaxed font-semibold">
                  Get absolute critique reports mapping exact errors. See how long you pause, how often your eye contact drifts, and read clear summaries explaining how to improve.
                </p>
              </div>
              <div className="pt-6 border-t border-black/5 mt-8 block">
                <span className="text-[9px] text-slate-400 font-bold uppercase block tracking-wider">03 / FULL CRITIQUE REPORTS</span>
              </div>
            </div>

            {/* PILLAR 4 */}
            <div className="p-8 rounded-3xl bg-white dark:bg-[#121620] border border-black/5 dark:border-white/5 flex flex-col justify-between shadow-sm relative group hover:border-primary/25 transition-all">
              <div className="space-y-4">
                <div className="size-11 rounded-xl bg-orange-500/15 text-orange-400 flex items-center justify-center">
                  <Briefcase className="size-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white leading-tight">Smart Hiring Board</h3>
                <p className="text-xs text-slate-600 dark:text-text-secondary leading-relaxed font-semibold">
                  Avoid applying blindly to bad listings. View high-salary related matches looking for your verified credentials, and submit tailored applications in one simple tap.
                </p>
              </div>
              <div className="pt-6 border-t border-black/5 mt-8 block">
                <span className="text-[9px] text-slate-400 font-bold uppercase block tracking-wider">04 / RELIABLE JOB MATCHES</span>
              </div>
            </div>

          </div>
        </section>


        {/* REDESIGNED CTA CARD WITH SOLID FLUID BUTTON ENVELOPE */}
        <section className="w-full max-w-7xl px-6 lg:px-16 py-16 mb-12">
          <div className="relative rounded-[40px] bg-gradient-to-r from-primary to-blue-700 text-white p-8 lg:p-16 text-center overflow-hidden shadow-xl">
            
            <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full blur-[70px] pointer-events-none" />
            
            <div className="max-w-2xl mx-auto space-y-6 relative z-10">
              <span className="text-[9px] font-black uppercase tracking-widest bg-white/10 px-3 py-1 rounded-full inline-block leading-none">START EXCELING TODAY</span>
              
              <h2 className="text-3xl sm:text-4xl lg:text-6xl font-black tracking-tight leading-none text-white">
                Ready to ace your upcoming interviews?
              </h2>
              
              <p className="text-xs sm:text-sm text-blue-100 max-w-lg mx-auto leading-relaxed font-semibold">
                Submit your CV to see optimized revisions, train with high-fidelity WebRTC indicators, and discover related jobs looking for you.
              </p>

              {/* Secure single line button */}
              <div className="pt-4 flex justify-center">
                <button
                  onClick={handleQuickPractice}
                  className="w-full sm:w-auto text-nowrap whitespace-nowrap inline-flex items-center justify-center text-[10px] sm:text-xs md:text-sm font-black uppercase tracking-wider text-primary bg-white hover:bg-slate-50 px-8 py-4 rounded-2xl shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer gap-2 truncate"
                >
                  Configure My Free Profile <ArrowRight className="size-4" />
                </button>
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* FOOTER */}
      <footer className="w-full max-w-7xl px-6 lg:px-16 py-12 border-t border-black/5 dark:border-white/5 bg-white/50 dark:bg-background-dark/50 backdrop-blur-xl transition-colors text-[10px] uppercase font-bold tracking-wider text-slate-500 dark:text-text-secondary mt-auto flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-2">
          <Logo className="size-6 shadow-sm animate-spin-slow" />
          <span className="font-extrabold text-slate-800 dark:text-white">MockInterview.ai</span>
        </div>
        
        <p className="text-center sm:text-right font-bold tracking-widest">
          © 2026 MockInterview.ai Inc. Built for technical and administrative candidate mastery.
        </p>
      </footer>

    </div>
  );
};

export default LandingScreen;
