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
  Activity,
  UploadCloud,
  Check,
  ChevronDown,
  TrendingUp,
  User,
  Lock,
  Camera
} from 'lucide-react';
import { Screen } from '../types';
import { Logo } from '../constants';
import { ThemeToggle } from '../components/ThemeToggle';
import { useAuthStore } from '../store/useAuthStore';

// Rich simulation data for the 3 target roles
const ROLE_SIMULATIONS = [
  {
    id: 'cloud-architect',
    title: 'Lead Cloud Infrastructure Architect',
    cvData: {
      expert: {
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
      vague: {
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
    },
    liveAnswers: {
      perfect: {
        transcript: 'To optimize the high-availability cluster under stress, I designed a multi-layered cache mechanism backed by distributed Redis clusters, keeping response latencies under 45ms and preventing database write locks.',
        cues: [
          { index: 20, text: 'Confident Pace: 130 WPM' },
          { index: 80, text: 'Critical Keywords Aligned: Redis' },
          { index: 140, text: 'Target STAR Structure Match' }
        ]
      },
      poor: {
        transcript: 'So... like... we had this really big outage during Black Friday, and honestly, the database got super slow because everyone was trying to connect to it at once, and... uh... we basically just restarted the instance several times to survive.',
        cues: [
          { index: 15, text: 'Vocal Filler Check: "like" (Slow pacing)' },
          { index: 45, text: 'Unconfident Speech Marker: "honestly"' },
          { index: 80, text: 'Eye Alignment Lost: Keep gaze center' },
          { index: 120, text: 'Speaking Speed Hesitation Check' }
        ]
      }
    },
    scorecard: {
      overall: 88,
      wpm: '130 WPM (Steady)',
      gaze: '92% Continuous',
      star: '100% Compliant',
      points: [
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
      ]
    },
    jobs: [
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
    ]
  },
  {
    id: 'frontend-engineer',
    title: 'Senior Frontend React Engineer',
    cvData: {
      expert: {
        candidate: 'Sarah Jenkins (Tailored Resume)',
        score: 97,
        matchRate: 'Optimized Resume Callback Rate: 99%',
        points: [
          'Re-architected core dashboard using concurrent React bindings, improving LCP by 64%',
          'Engineered code-splitting pipelines reducing bundle entry sizes from 4.2MB to 380KB',
          'Implemented shared state model with fine-grained subscriptions to resolve rendering leaks'
        ],
        criticism: 'Incredible technical articulation of Web Vitals improvements. Highly tailored to senior product engineering requirements.'
      },
      vague: {
        candidate: 'Pat Taylor (Untailored Resume)',
        score: 48,
        matchRate: 'Struggling Resume Callback Rate: 15%',
        points: [
          'Wrote components with React and standard CSS styling for user dashboards',
          'Fixed UI layout alignment bugs and cleaned unused packages',
          'Helped QA team find browser click bugs and resolved simple forms'
        ],
        criticism: 'Candidate lacks business metrics or performance indicators. Doesn\'t mention LCP, INP, or architectural decisions necessary for senior roles.'
      }
    },
    liveAnswers: {
      perfect: {
        transcript: 'To resolve the interaction delay, I implemented React concurrent features like useTransition to prioritize browser inputs, and created custom hook bindings that reduced re-renders, keeping INP below 24ms.',
        cues: [
          { index: 20, text: 'Confident Pace: 125 WPM' },
          { index: 70, text: 'Keywords Matched: React concurrent, INP' },
          { index: 130, text: 'Excellent Interaction Performance Focus' }
        ]
      },
      poor: {
        transcript: 'So... standard rendering was kind of slow, and honestly, we just had some useEffects doing too much data fetching and state updates, and... like... we basically just used standard memo or whatever to make it run a bit faster.',
        cues: [
          { index: 15, text: 'Vocal Filler: "honestly" (Weak conviction)' },
          { index: 50, text: 'Gaze Drifted: Looking down' },
          { index: 90, text: 'Filler: "like..."' },
          { index: 130, text: 'Vague engineering details on rendering optimization' }
        ]
      }
    },
    scorecard: {
      overall: 92,
      wpm: '125 WPM (Steady)',
      gaze: '95% Continuous',
      star: '100% Compliant',
      points: [
        {
          parameter: 'What you did right (React performance mastery):',
          feedback: 'You articulated concurrent features, React 19 rendering rules, and fiber reconciliation logic with exceptional precision and clarity.',
          status: 'good'
        },
        {
          parameter: 'What you did incorrect (Vocal tone dynamic):',
          feedback: 'Your vocal tone remained relatively flat. Try to modulate volume and pitch slightly to project excitement when describing architecture breakthroughs.',
          status: 'correction'
        },
        {
          parameter: 'What you did incorrect (Shoulder posture alignment):',
          feedback: 'You leaned to the left off-axis, causing the face mesh trackers to flag coordinate boundary warnings. Try to sit centered relative to the lens.',
          status: 'correction'
        }
      ]
    },
    jobs: [
      {
        title: 'Senior UI Platform Engineer',
        company: 'Vercel Technologies Inc.',
        loc: 'Distributed / Remote',
        salary: '$170,000 - $220,000',
        match: 97,
        reason: 'Outstanding score in Web Vitals optimization and concurrent rendering patterns',
        badge: 'UI Core Platform'
      },
      {
        title: 'Senior Staff Engineer, Frontend',
        company: 'Stripe Systems Corp',
        loc: 'Seattle, WA (Hybrid)',
        salary: '$190,000 - $250,000',
        match: 91,
        reason: 'Excellent match in state architecture performance and secure forms engineering',
        badge: 'Frontend Core'
      }
    ]
  },
  {
    id: 'ai-engineer',
    title: 'Lead AI & Data Platform Engineer',
    cvData: {
      expert: {
        candidate: 'Marcus Vance (Tailored Resume)',
        score: 94,
        matchRate: 'Optimized Resume Callback Rate: 96%',
        points: [
          'Engineered vector indexing database pipeline, processing 4.2M queries/sec under 18ms latency',
          'Optimized PySpark clusters reducing cloud resource compute expenditures by $1.2M annually',
          'Integrated real-time streaming pipeline using Kafka partitions to compute dynamic stats'
        ],
        criticism: 'Clear evidence of massive scale infrastructure management. Directly addresses cost optimization metrics and low-latency storage engines.'
      },
      vague: {
        candidate: 'Sam Lee (Untailored Resume)',
        score: 38,
        matchRate: 'Struggling Resume Callback Rate: 8%',
        points: [
          'Helped setup database tables and loaded JSON rows for analysis',
          'Worked with Python and Spark to analyze metrics and wrote reports',
          'Collaborated with team members to resolve server memory errors'
        ],
        criticism: 'Fails to define data scale, cost reductions, or vector databases. Fails to describe complex distributed systems.'
      }
    },
    liveAnswers: {
      perfect: {
        transcript: 'We optimized data retrieval at scale by implementing HNSW index graphs in Pgvector alongside optimized PySpark partitions, reducing semantic query search latencies from 800ms down to 18ms under load.',
        cues: [
          { index: 20, text: 'Confident Pace: 135 WPM' },
          { index: 75, text: 'Keywords Matched: HNSW, Pgvector, PySpark' },
          { index: 135, text: 'Perfect STAR response alignment' }
        ]
      },
      poor: {
        transcript: 'So... we had some queries that were really slow because the vector databases were sort of overloaded, and... honestly... we just threw more CPU power at it and hoped it would make search responses faster... uh... which it did a little.',
        cues: [
          { index: 15, text: 'Filler detected: "honestly"' },
          { index: 45, text: 'Weak resolution statement: "hoped it would"' },
          { index: 85, text: 'Gaze Drift: Eye alignment warning' },
          { index: 120, text: 'Pacing warning: 175 WPM (Anxious speed)' }
        ]
      }
    },
    scorecard: {
      overall: 90,
      wpm: '135 WPM (Steady)',
      gaze: '94% Continuous',
      star: '100% Compliant',
      points: [
        {
          parameter: 'What you did right (AI Scale infrastructure):',
          feedback: 'Superb explanation of Pgvector indices, distance metrics, and vector scaling mechanics. You handled complexity with absolute ease.',
          status: 'good'
        },
        {
          parameter: 'What you did incorrect (Vocal pacing during stats):',
          feedback: 'Speaking speed accelerated when explaining Spark cost optimization, touching 165 WPM. Remember to pause and take a breath between bullets.',
          status: 'correction'
        },
        {
          parameter: 'What you did incorrect (Gaze focus stability):',
          feedback: 'Gaze analysis flags minor vertical drift. Gaze lowered when speaking about Kafka. Practice maintaining continuous camera connection.',
          status: 'correction'
        }
      ]
    },
    jobs: [
      {
        title: 'Lead Vector DB Platform Architect',
        company: 'Pinecone Inc.',
        loc: 'Remote / NYC',
        salary: '$195,000 - $260,000',
        match: 95,
        reason: 'Excellent score in PGVector, HNSW graph architecture, and indexing query scale',
        badge: 'AI Infrastructure'
      },
      {
        title: 'Senior Principal Data Engineer',
        company: 'Databricks Systems',
        loc: 'San Francisco, CA',
        salary: '$210,000 - $280,000',
        match: 89,
        reason: 'High alignment with Spark cost optimizations and real-time Kafka partition routing',
        badge: 'Data & Streaming'
      }
    ]
  }
] as const;

interface LandingScreenProps {
  onNavigate: (screen: Screen) => void;
}

export const LandingScreen: React.FC<LandingScreenProps> = ({ onNavigate }) => {
  const { bypassAuth } = useAuthStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // Dynamic role selection index
  const [activeRoleIdx, setActiveRoleIdx] = useState<number>(0);
  const currentRole = ROLE_SIMULATIONS[activeRoleIdx];

  // Simulation Step: 1 = CV Scan, 2 = Live WebRTC Interview, 3 = Scorecard Report, 4 = Related Jobs
  const [simulatorStep, setSimulatorStep] = useState<number>(1); 
  const [isAutoPlaying, setIsAutoPlaying] = useState<boolean>(true);

  // Step 1: CV Tailoring Simulation States
  const [selectedCVIdx, setSelectedCVIdx] = useState(1); // Starts on weak Jordy/Pat/Sam
  const [cvScanning, setCvScanning] = useState(false);
  const [cvProgress, setCvProgress] = useState(0);
  const [cvScanned, setCvScanned] = useState(false);

  // Step 2: Audio+Video Interview States
  const [interviewResponseStyle, setInterviewResponseStyle] = useState<'none' | 'perfect' | 'poor'>('none');
  const [transcriptStream, setTranscriptStream] = useState('');
  const [vocalStatusAlert, setVocalStatusAlert] = useState<string | null>(null);
  const [faceCheckState, setFaceCheckState] = useState<'aligning' | 'locked' | 'drifted'>('aligning');

  // Interactive scorecard metrics tab
  const [activeDiagTab, setActiveDiagTab] = useState<'all' | 'good' | 'correction'>('all');

  // Billing Cycle state
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual');

  // Job applied mock tracking
  const [appliedJobs, setAppliedJobs] = useState<Record<number, boolean>>({});
  const [submittingJobIdx, setSubmittingJobIdx] = useState<number | null>(null);

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

    const roleAnswer = currentRole.liveAnswers[style];
    const fullText = roleAnswer.transcript;
    const cues = roleAnswer.cues;

    let i = 0;
    typingTimerRef.current = setInterval(() => {
      if (i < fullText.length) {
        setTranscriptStream(fullText.slice(0, i + 1));
        
        // Find matching cue triggers for the stream typing
        const activeCue = cues.find(c => c.index >= i - 2 && c.index <= i);
        if (activeCue) {
          setVocalStatusAlert(activeCue.text);
        }

        if (style === 'poor' && i > 60 && i < 90) {
          setFaceCheckState('drifted');
        } else if (style === 'poor' && i >= 90) {
          setFaceCheckState('aligning');
        } else if (style === 'perfect') {
          setFaceCheckState('locked');
        }

        i += 2;
      } else {
        clearTypingTimer();
        if (style === 'perfect') {
          setVocalStatusAlert('Perfect Answer Score: Outstanding Delivery!');
        } else {
          setVocalStatusAlert('Critique: Speed pacing exceeded, stutters caught, eye contact warnings');
        }
      }
    }, 25);
  }, [activeRoleIdx, currentRole]);

  // High-fidelity fully automatic loop tracking
  useEffect(() => {
    if (!isAutoPlaying) {
      if (automationTimeoutRef.current) clearTimeout(automationTimeoutRef.current);
      return;
    }

    const startAutomatedFlow = async () => {
      try {
        // Step 1: CV Scan (Weak candidate first)
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
  }, [isAutoPlaying, activeRoleIdx, triggerSimulationOfFeedback]);

  // Clean timeouts on unmount
  useEffect(() => {
    return () => {
      clearTypingTimer();
      if (automationTimeoutRef.current) clearTimeout(automationTimeoutRef.current);
    };
  }, []);

  const handleManualStepSelect = (idx: number) => {
    setIsAutoPlaying(false);
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

  const handleTriggerManualScan = () => {
    setIsAutoPlaying(false);
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
  };

  const handleApplyJobMock = (idx: number) => {
    setSubmittingJobIdx(idx);
    setTimeout(() => {
      setAppliedJobs(prev => ({ ...prev, [idx]: true }));
      setSubmittingJobIdx(null);
    }, 1200);
  };

  const filteredDiagPoints = currentRole.scorecard.points.filter(p => {
    if (activeDiagTab === 'all') return true;
    if (activeDiagTab === 'good') return p.status === 'good';
    return p.status === 'correction';
  });

  return (
    <div className="flex flex-col min-h-screen bg-[#f8fafc] dark:bg-[#07090e] text-slate-900 dark:text-slate-100 overflow-x-hidden selection:bg-primary/20 transition-colors duration-300 relative">
      
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
          className="absolute top-10 left-10 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-primary/[0.04] dark:bg-primary/[0.02] rounded-full blur-[80px] sm:blur-[120px]"
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
          className="absolute top-[500px] right-20 w-[350px] sm:w-[550px] h-[350px] sm:h-[550px] bg-teal-400/[0.05] dark:bg-[#14b8a6]/[0.015] rounded-full blur-[90px] sm:blur-[130px]"
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
        
        {/* Soft Grid overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(25,76,230,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(25,76,230,0.015)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(255,255,255,0.007)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.007)_1px,transparent_1px)] bg-[size:40px_40px] opacity-80" />
      </div>

      {/* STICKY HEADER */}
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-[#07090e]/80 backdrop-blur-xl border-b border-black/5 dark:border-white/5 px-6 lg:px-16 py-4 flex items-center justify-between transition-colors duration-300">
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
        <div className="hidden md:flex items-center gap-1 p-1 bg-black/[0.03] dark:bg-white/5 rounded-full border border-black/5 dark:border-white/5">
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
                  ? 'text-slate-900 dark:text-white font-extrabold' 
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
              }`}
            >
              {simulatorStep === tab.id && (
                <motion.span
                  layoutId="active-menu-pill"
                  className="absolute inset-0 bg-white dark:bg-[#141824] rounded-full shadow-sm border border-black/[0.04] dark:border-white/[0.06] -z-10"
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
            className="hidden sm:inline-flex whitespace-nowrap text-[10px] sm:text-xs font-black uppercase tracking-wider text-slate-650 dark:text-slate-400 hover:text-primary dark:hover:text-white px-3 py-2 transition-colors cursor-pointer"
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
            className="absolute top-[72px] left-0 w-full bg-white dark:bg-[#0b0e14] border-b border-black/5 dark:border-white/5 z-40 p-6 flex flex-col gap-4 overflow-hidden md:hidden"
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
        <section className="w-full max-w-7xl px-6 lg:px-16 pt-16 lg:pt-28 pb-8 flex flex-col items-center text-center relative">
          
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

          <p className="mt-8 text-xs sm:text-sm lg:text-base text-slate-650 dark:text-slate-400 max-w-3xl leading-relaxed">
            Stop guessing why you are not getting offers. Instantly tailor your resume with our CV Scanner to pass screeners, master tough behavioral questions under comfortable camera & voice simulations, and connect directly to relevant job openings.
          </p>

          {/* COMPACT ONE-LINER BUTTON ASSEMBLIES */}
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

          <div className="mt-8 flex items-center gap-6 text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
            <span className="flex items-center gap-1.5"><Shield className="size-3.5 text-teal-500" /> Secure AES Encrypted</span>
            <div className="size-1.5 bg-slate-300 dark:bg-slate-700 rounded-full" />
            <span className="flex items-center gap-1.5"><Star className="size-3.5 text-amber-500 fill-amber-500" /> Bio-Tracking Gaze Feedback</span>
          </div>
        </section>

        {/* HERO COMPANY TRUST STRIP */}
        <section className="w-full max-w-7xl px-6 lg:px-16 py-6 border-t border-b border-black/[0.04] dark:border-white/[0.04] bg-white/20 dark:bg-[#07090e]/30 backdrop-blur-sm flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-12">
          <span className="text-[10px] uppercase font-black tracking-widest text-slate-400 dark:text-slate-500 text-center sm:text-left">
            Our alumni land roles at leading tech teams:
          </span>
          <div className="flex flex-wrap justify-center items-center gap-8 opacity-45 dark:opacity-30">
            {/* Google */}
            <svg className="h-6 w-auto hover:opacity-100 transition-opacity fill-current text-slate-900 dark:text-white" viewBox="0 0 100 30" width="80"><path d="M12.5 15c0-3.3 2.6-6 6-6s6 2.7 6 6-2.6 6-6 6-6-2.7-6-6zm13.7 0c0-4.9-3.7-8.3-8.2-8.3s-8.2 3.4-8.2 8.3 3.7 8.3 8.2 8.3 8.2-3.4 8.2-8.3zm12.3 0c0-3.3 2.6-6 6-6s6 2.7 6 6-2.6 6-6 6-6-2.7-6-6zm13.7 0c0-4.9-3.7-8.3-8.2-8.3S32.1 10.1 32.1 15s3.7 8.3 8.2 8.3 8.2-3.4 8.2-8.3zm18.8-7.9h-8.2v15.6h8.2V7.1zm-8.2 11.2V7.1H52v11.2h3.1zm17.9-3.3c-2.4 0-4.4 1.2-5.4 3l8.6-3.6c-0.6-1.5-2-2.4-3.2-2.4zm-3.4 6.8c1.5 0 2.7-0.7 3.5-1.9l2.7 1.8c-1.5 2.2-4.1 3.6-7.2 3.6-4.8 0-8.2-3.5-8.2-8.3 0-5.1 3.7-8.3 8-8.3 4.4 0 6.6 3.2 7.3 5.1l0.8 2.1-12.7 5.2c1 1.9 2.4 2.7 4.2 2.7zM7.5 12v2.6h6.5c-0.3 1.5-1.7 4.4-6.5 4.4-4.1 0-7.5-3.4-7.5-7.6s3.4-7.6 7.5-7.6c2.4 0 3.9 1 4.8 1.9l2.1-2.1C13 2.3 10.5 1 7.5 1 3.4 1 0 4.4 0 8.5S3.4 16 7.5 16c4.3 0 7.2-3 7.2-7.3 0-0.5-0.1-0.9-0.1-1.3l-7.1 0.6z"/></svg>
            {/* Stripe */}
            <svg className="h-5 w-auto hover:opacity-100 transition-opacity fill-current text-slate-900 dark:text-white" viewBox="0 0 100 30" width="70"><path d="M50 0c-27.6 0-50 22.4-50 50s22.4 50 50 50 50-22.4 50-50-22.4-50-50-50zm18.6 62.5c0 8.3-6.5 13.9-16.1 13.9-8.3 0-14-3.8-15.5-8.8h6.9c1.1 2.3 4.1 3.8 8.6 3.8 4.7 0 8.3-2.1 8.3-6.4v-0.3c-2.7-1.4-7-2.6-11.4-3.8-7.7-2-12.7-4.6-12.7-11.7v-0.3c0-7.3 6.1-12.8 15.3-12.8 7.3 0 12.8 3.1 14.1 7.9h-6.8c-1.1-2.1-3.6-3.1-7.3-3.1-4.7 0-7.6 2-7.6 5.5v0.3c2.4 1.2 6.6 2.3 11 3.5 8 2.1 13.2 4.9 13.2 12.1v0.2z" transform="scale(0.3)"/></svg>
            {/* Meta */}
            <svg className="h-4.5 w-auto hover:opacity-100 transition-opacity fill-current text-slate-900 dark:text-white" viewBox="0 0 100 30" width="70"><path d="M25.4 7c-2.6 0-5.1 1.2-6.7 3.3C17.1 8.2 14.6 7 12 7 5.4 7 0 12.1 0 18.5S5.4 30 12 30c2.6 0 5.1-1.2 6.7-3.3 1.6 2.1 4.1 3.3 6.7 3.3 6.6 0 12-5.1 12-11.5S32 7 25.4 7zm0 19.3c-4.1 0-7.4-3.1-7.4-7.8 0-4.7 3.3-7.8 7.4-7.8 4.1 0 7.4 3.1 7.4 7.8 0 4.7-3.3 7.8-7.4 7.8zm-13.4 0c-4.1 0-7.4-3.1-7.4-7.8 0-4.7 3.3-7.8 7.4-7.8 4.1 0 7.4 3.1 7.4 7.8 0 4.7-3.3 7.8-7.4 7.8z" transform="scale(0.8)"/></svg>
            {/* OpenAI */}
            <span className="font-extrabold text-xs uppercase tracking-wider text-slate-900 dark:text-white">OpenAI</span>
            {/* Airbnb */}
            <span className="font-black text-xs uppercase tracking-widest text-slate-900 dark:text-white">AIRBNB</span>
          </div>
        </section>

        {/* THE IMMERSIVE PLATFORM SIMULATION (ACTUAL MOTION MECHANICS) */}
        <section id="simulation-stage" className="w-full max-w-7xl px-6 lg:px-16 py-12 lg:py-16">
          <div className="p-1 rounded-[36px] bg-gradient-to-b from-black/[0.04] to-black/[0.01] dark:from-white/10 dark:to-white/[0.02] shadow-2xl relative overflow-hidden">
            
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-[100px] pointer-events-none -z-10" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-teal-500/5 rounded-full blur-[100px] pointer-events-none -z-10" />

            {/* Inner Interactive Simulator Box */}
            <div className="bg-white dark:bg-[#0c0f16] rounded-[34px] p-6 lg:p-12 border border-black/[0.03] dark:border-white/[0.03]">
              
              <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-6 border-b border-black/5 dark:border-white/10 pb-8">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-primary dark:text-teal-400 block mb-1">
                    Interactive Real-Time Preview
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                    Explore the complete AI candidate feedback loop
                  </h2>
                </div>

                {/* Automation & Active State Controls */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                  
                  {/* Autoplay Play/Pause */}
                  <button 
                    onClick={() => setIsAutoPlaying(!isAutoPlaying)}
                    className={`flex-shrink-0 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all select-none cursor-pointer ${
                      isAutoPlaying 
                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' 
                        : 'bg-slate-100 dark:bg-white/5 border-black/5 dark:border-white/5 text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    <span className="flex h-2 w-2 relative">
                      {isAutoPlaying && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>}
                      <span className={`relative inline-flex rounded-full h-2 w-2 ${isAutoPlaying ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                    </span>
                    <span>{isAutoPlaying ? 'Autopilot: ON' : 'Autopilot: PAUSED'}</span>
                  </button>

                  {/* Switcher Buttons Grid */}
                  <div className="grid grid-cols-2 lg:flex lg:items-center gap-2">
                    {[
                      { id: 1, name: '1. CV Analyzer', icon: FileCheck },
                      { id: 2, name: '2. Live Interview', icon: Video },
                      { id: 3, name: '3. Critique Report', icon: Award },
                      { id: 4, name: '4. Job Matching', icon: Briefcase }
                    ].map(step => (
                      <button
                        key={step.id}
                        onClick={() => handleManualStepSelect(step.id)}
                        className={`text-nowrap whitespace-nowrap inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-[9px] uppercase tracking-wider font-extrabold border transition-all cursor-pointer truncate ${
                          simulatorStep === step.id
                            ? 'bg-primary border-primary text-white shadow-md shadow-primary/10'
                            : 'bg-black/5 dark:bg-white/5 border-black/5 dark:border-white/5 text-slate-600 dark:text-slate-400 hover:bg-black/10 dark:hover:bg-white/10'
                        }`}
                      >
                        <step.icon className="size-3.5 flex-shrink-0" />
                        <span>{step.name}</span>
                      </button>
                    ))}
                  </div>

                </div>
              </div>

              {/* INTERACTIVE ROLE SELECTOR TAB BAR */}
              <div className="pt-6 flex flex-wrap gap-2 items-center">
                <span className="text-[9px] uppercase font-black text-slate-400 dark:text-slate-500 mr-2">Target Career Field:</span>
                {ROLE_SIMULATIONS.map((role, idx) => (
                  <button
                    key={role.id}
                    onClick={() => {
                      setIsAutoPlaying(false);
                      setActiveRoleIdx(idx);
                      // Reset step simulation to match role
                      if (simulatorStep === 2) {
                        triggerSimulationOfFeedback(interviewResponseStyle === 'poor' ? 'poor' : 'perfect');
                      }
                    }}
                    className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-wider transition-all border ${
                      activeRoleIdx === idx 
                        ? 'bg-primary/10 dark:bg-teal-500/10 border-primary/20 dark:border-teal-500/20 text-primary dark:text-teal-400 shadow-sm'
                        : 'bg-transparent border-black/5 dark:border-white/5 text-slate-500 dark:text-slate-400 hover:border-black/10 dark:hover:border-white/10'
                    }`}
                  >
                    {role.id === 'cloud-architect' ? 'Cloud Systems' : role.id === 'frontend-engineer' ? 'Frontend Web' : 'AI & Data'}
                  </button>
                ))}
              </div>

              {/* SIMULATION CARD MOUNTS */}
              <div className="pt-8">
                <AnimatePresence mode="wait">
                  
                  {/* STEP 1: CV ANALYSIS SANDBOX */}
                  {simulatorStep === 1 && (
                    <motion.div
                      key={`${activeRoleIdx}-step1`}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -15 }}
                      transition={{ duration: 0.3 }}
                      className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch"
                    >
                      {/* Left: Input Selection panel */}
                      <div className="lg:col-span-5 flex flex-col justify-between p-6 rounded-2xl bg-slate-50 dark:bg-[#11141e] border border-black/5 dark:border-white/5 shadow-sm">
                        <div className="space-y-4">
                          <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                            <Sparkles className="size-5 text-primary animate-pulse" /> Resumes Tailored to Job Specs
                          </h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400 leading-normal font-medium">
                            We automatically extract crucial skill terms, structure and rewrite achievements into the high-impact STAR structure, and boost CV callback scores.
                          </p>

                          {/* Interactive Mock Drag-and-Drop */}
                          <div 
                            onClick={handleTriggerManualScan}
                            className="group mt-4 border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-primary/50 dark:hover:border-teal-500/50 rounded-2xl p-6 text-center cursor-pointer transition-all bg-white dark:bg-[#07090e] hover:shadow-md"
                          >
                            <UploadCloud className="size-10 mx-auto text-slate-450 dark:text-slate-600 group-hover:text-primary dark:group-hover:text-teal-400 transition-colors mb-2 group-hover:scale-105 duration-350" />
                            <span className="block text-[11px] font-black text-slate-700 dark:text-slate-350 uppercase tracking-wider mb-1">
                              Drag & Drop Resume
                            </span>
                            <span className="block text-[9px] text-slate-400">
                              PDF, DOCX, or TXT up to 10MB
                            </span>
                          </div>

                          <div className="space-y-2 mt-4 text-[10px] font-bold text-slate-750 dark:text-slate-300">
                            <label className="text-[9px] uppercase font-black text-slate-400 dark:text-slate-500 block tracking-widest">Compare Profiles:</label>
                            
                            <div className="grid grid-cols-1 gap-2">
                              {Object.entries(currentRole.cvData).map(([key, val]) => {
                                const idx = key === 'expert' ? 0 : 1;
                                return (
                                  <button
                                    key={key}
                                    onClick={() => {
                                      setIsAutoPlaying(false);
                                      setSelectedCVIdx(idx);
                                      setCvScanned(false);
                                      setCvProgress(0);
                                    }}
                                    className={`p-3 rounded-xl border text-left flex flex-col items-start transition-all cursor-pointer ${
                                      selectedCVIdx === idx
                                        ? 'bg-white dark:bg-[#151a28] border-primary dark:border-teal-500 shadow-sm'
                                        : 'bg-transparent border-black/5 dark:border-white/5 hover:border-black/10 dark:hover:border-white/10 opacity-75'
                                    }`}
                                  >
                                    <div className="flex items-center justify-between w-full">
                                      <span className="font-extrabold text-[11px] text-slate-900 dark:text-white leading-none">{val.candidate}</span>
                                      <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded leading-none ${
                                        idx === 0 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'
                                      }`}>
                                        {idx === 0 ? 'Tailored Profile' : 'Weak Profile'}
                                      </span>
                                    </div>
                                    <span className="text-[9px] text-slate-400 mt-1.5 block font-mono">{currentRole.title}</span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        </div>

                        <div className="pt-6 border-t border-black/5 dark:border-white/5 mt-6">
                          <button
                            onClick={handleTriggerManualScan}
                            disabled={cvScanning}
                            className="w-full text-nowrap whitespace-nowrap inline-flex items-center justify-center text-[10px] font-black uppercase tracking-wider text-white bg-primary hover:bg-primary-hover disabled:bg-slate-300 dark:disabled:bg-slate-800 p-4 rounded-xl shadow transition-all cursor-pointer gap-2 truncate"
                          >
                            {cvScanning ? (
                              <>
                                <RefreshCw className="size-4 animate-spin" /> Analyzing keywords ({cvProgress}%)
                              </>
                            ) : (
                              <>
                                <Sparkles className="size-4" /> Scan & Optimize This Resume
                              </>
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Right: Dynamic High Fidelity Scanner readout output */}
                      <div className="lg:col-span-7 flex flex-col justify-center min-h-[300px] border border-black/5 dark:border-white/15 rounded-2xl bg-white dark:bg-[#07090e] p-6 shadow-sm relative overflow-hidden">
                        
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
                              {/* Resume Visual Layout Mockup */}
                              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                                <div>
                                  <span className="text-[8px] uppercase font-black text-primary block leading-none">CV Keyword Strength Index</span>
                                  <h4 className="text-[12px] font-black text-slate-900 dark:text-white mt-1.5 leading-none">
                                    {selectedCVIdx === 0 ? currentRole.cvData.expert.candidate : currentRole.cvData.vague.candidate}
                                  </h4>
                                </div>
                                <div className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-black ${
                                  selectedCVIdx === 0 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'
                                }`}>
                                  Score: {selectedCVIdx === 0 ? currentRole.cvData.expert.score : currentRole.cvData.vague.score}%
                                </div>
                              </div>

                              {/* Highlighted Document Area Mockup */}
                              <div className="relative border border-slate-100 dark:border-slate-800 rounded-xl p-4 bg-slate-50/50 dark:bg-[#11141e]/50 max-h-40 overflow-y-auto text-[10px] font-mono text-slate-500 leading-normal space-y-2">
                                <div className="absolute top-2 right-2 flex gap-1 items-center">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                  <span className="text-[7px] uppercase font-bold">STAR Highlights</span>
                                </div>
                                <p className="font-bold border-l-2 pl-2 border-slate-300 dark:border-slate-700">OBJECTIVE / EXPERIENCE SUMMARY</p>
                                <div className="space-y-1">
                                  {selectedCVIdx === 0 ? (
                                    <span className="block border border-emerald-500/20 bg-emerald-500/5 text-emerald-650 dark:text-emerald-400 p-1 rounded font-bold">
                                      ✓ Quantified Achievements: REDUCED DOWNTIME / BUNDLE SIZE / LATENCY BY {selectedCVIdx === 0 ? '64% - 82%' : '0%'}
                                    </span>
                                  ) : (
                                    <span className="block border border-red-500/20 bg-red-500/5 text-red-655 dark:text-red-400 p-1 rounded">
                                      ✗ Vague terms: "Helped write components", "Participated in solving issues" - lacking metrics
                                    </span>
                                  )}
                                </div>
                              </div>

                              <div className="p-3 bg-slate-50 dark:bg-[#11141e] border border-black/5 dark:border-white/5 rounded-xl text-[11px] leading-relaxed">
                                <span className="text-[8px] uppercase font-black tracking-wider text-slate-400 dark:text-slate-500 block mb-1">RECRUITER ALIGNMENT ANALYSIS</span>
                                <p className="text-slate-700 dark:text-slate-300 font-medium font-sans">
                                  {selectedCVIdx === 0 ? currentRole.cvData.expert.criticism : currentRole.cvData.vague.criticism}
                                </p>
                              </div>

                              <div>
                                <span className="text-[8px] uppercase font-black tracking-widest text-slate-400 dark:text-slate-500 block mb-2">EXTRACTED KEY STATS AND BULLETS:</span>
                                <div className="space-y-2">
                                  {(selectedCVIdx === 0 ? currentRole.cvData.expert.points : currentRole.cvData.vague.points).map((pt, i) => (
                                    <div key={i} className="flex items-start gap-2.5 text-[11px] text-slate-650 dark:text-slate-400 font-semibold">
                                      {selectedCVIdx === 0 ? (
                                        <CheckCircle className="size-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                                      ) : (
                                        <AlertTriangle className="size-4 text-red-550 dark:text-red-400 flex-shrink-0 mt-0.5" />
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
                                <h4 className="font-extrabold text-[11px] text-slate-900 dark:text-white uppercase tracking-wider leading-none">Scanning Engine Ready</h4>
                                <p className="text-[10px] text-slate-450 mt-2 max-w-xs mx-auto">
                                  Drop your CV in the box to run real-time recruiter keywords comparisons.
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
                      key={`${activeRoleIdx}-step2`}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -15 }}
                      transition={{ duration: 0.3 }}
                      className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch"
                    >
                      {/* Left: Camera simulation overlay boxes */}
                      <div className="lg:col-span-7 flex flex-col justify-between p-6 rounded-2xl bg-[#090b11] text-white min-h-[380px] hover:shadow-lg transition-all relative overflow-hidden flex-shrink-0">
                        <div className="absolute top-4 right-4 bg-orange-500/10 border border-orange-550/20 rounded px-2.5 py-1 text-[8px] tracking-widest uppercase font-mono text-orange-400 z-10 flex items-center gap-1.5 backdrop-blur-md">
                          <Activity className="size-2.5 animate-pulse text-orange-550" /> LIVE EYE-GAZE TRACER: ACTIVE
                        </div>

                        {/* Camera viewport simulation */}
                        <div className="relative bg-[#05070a] border border-white/5 rounded-2xl overflow-hidden aspect-video flex items-center justify-center max-w-xl mx-auto w-full group shadow-inner">
                          
                          {/* Scan mesh overlay grid */}
                          <div className="absolute inset-0 bg-[linear-gradient(rgba(20,184,166,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(20,184,166,0.02)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />

                          <div className="absolute inset-0 flex items-center justify-center">
                            
                            {/* Stylized mesh eye tracking lines */}
                            <div className="absolute border border-teal-500/40 rounded-full animate-pulse transition-all duration-350 shadow-[0_0_15px_rgba(20,184,166,0.1)]"
                                 style={{
                                   left: `${faceMeshCoords.x - faceMeshCoords.w / 2}%`,
                                   top: `${faceMeshCoords.y - faceMeshCoords.h / 2}%`,
                                   width: `${faceMeshCoords.w}%`,
                                   height: `${faceMeshCoords.h}%`
                                 }}
                            >
                              <span className="absolute top-0 left-0 border-t-2 border-l-2 border-teal-400 w-3.5 h-3.5 rounded-tl" />
                              <span className="absolute top-0 right-0 border-t-2 border-r-2 border-teal-400 w-3.5 h-3.5 rounded-tr" />
                              <span className="absolute bottom-0 left-0 border-b-2 border-l-2 border-teal-400 w-3.5 h-3.5 rounded-bl" />
                              <span className="absolute bottom-0 right-0 border-b-2 border-r-2 border-teal-400 w-3.5 h-3.5 rounded-br" />
                              
                              {/* Horizontal tracking scanning bar */}
                              <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-teal-400/40 animate-bounce" />

                              <div className="absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-[7px] sm:text-[8px] font-mono font-bold bg-[#143db8] text-white px-2 py-0.5 rounded-full leading-none shadow-md">
                                EYE GAZE MATCH: {faceCheckState === 'locked' ? '98% LOCK' : faceCheckState === 'drifted' ? '⚠️ DRIFTED WARNING' : 'CALIBRATING'}
                              </div>
                            </div>

                            {/* Camera Silhouette Placeholder */}
                            <div className="text-center space-y-3 opacity-90 relative">
                              <div className="size-16 rounded-full bg-slate-900 border border-slate-800 mx-auto flex items-center justify-center relative shadow-md">
                                <Camera className="size-7 text-slate-500" />
                                {interviewResponseStyle === 'perfect' && (
                                  <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-[10px] font-black p-0.5 rounded-full z-10 shadow">
                                    <Check className="size-3 text-white font-bold" />
                                  </div>
                                )}
                              </div>
                              <span className="text-[9px] font-mono tracking-widest uppercase text-slate-400 block mt-2">
                                {faceCheckState === 'locked' && '✓ Gaze: Centered & Focused'}
                                {faceCheckState === 'aligning' && 'Mesh tracking calibration...'}
                                {faceCheckState === 'drifted' && '⚠️ Attention check: Gaze avoiding camera'}
                              </span>
                            </div>
                          </div>

                        </div>

                        {/* Acoustic tracking waveform bars */}
                        <div className="flex items-center justify-between mt-6 bg-[#05070a]/90 border border-white/5 p-4 rounded-xl">
                          <div className="flex items-center gap-1.5">
                            <span className="bg-red-500 w-1.5 h-1.5 rounded-full animate-ping mr-1" />
                            <span className="text-[9px] font-mono text-slate-450 uppercase tracking-widest">Acoustic Audio Conduit</span>
                          </div>

                          {/* Render beautiful fluctuation bars */}
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
                      <div className="lg:col-span-5 flex flex-col justify-between p-6 rounded-2xl bg-white dark:bg-[#11141e] border border-black/5 dark:border-white/5 shadow-sm">
                        <div className="space-y-4">
                          <div className="flex items-center gap-2">
                            <Volume2 className="size-5 text-indigo-550" />
                            <h3 className="text-base font-black text-slate-900 dark:text-white leading-none">Unshakable Voice Confidence</h3>
                          </div>
                          
                          <p className="text-xs text-slate-500 dark:text-slate-400 leading-normal">
                            Practising aloud under live camera simulation is the only way to overcome interview panic. We tracks vocal filler levels, pauses, and speech rates in real time.
                          </p>

                          <div className="space-y-2 pt-2">
                            <label className="text-[9px] uppercase font-black text-slate-400 dark:text-slate-500 block tracking-widest">Compare Response Speaking styles:</label>
                            
                            <div className="grid grid-cols-1 gap-2">
                              {/* Speaking style manual triggers */}
                              <button
                                onClick={() => { setIsAutoPlaying(false); triggerSimulationOfFeedback('perfect'); }}
                                className={`w-full text-nowrap whitespace-nowrap inline-flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer truncate ${
                                  interviewResponseStyle === 'perfect'
                                    ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-650 dark:text-emerald-400 font-extrabold'
                                    : 'bg-slate-50 dark:bg-[#07090e] border-black/5 dark:border-white/5 hover:bg-slate-100 dark:hover:bg-white/5 font-extrabold uppercase text-[9px] text-slate-700 dark:text-slate-350'
                                }`}
                              >
                                <span>Perfect STAR response model</span>
                                <CheckCircle className="size-4 text-emerald-500" />
                              </button>

                              <button
                                onClick={() => { setIsAutoPlaying(false); triggerSimulationOfFeedback('poor'); }}
                                className={`w-full text-nowrap whitespace-nowrap inline-flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer truncate ${
                                  interviewResponseStyle === 'poor'
                                    ? 'bg-amber-500/5 border-amber-500/20 text-amber-650 dark:text-amber-400 font-extrabold'
                                    : 'bg-slate-50 dark:bg-[#07090e] border-black/5 dark:border-white/5 hover:bg-slate-100 dark:hover:bg-white/5 font-extrabold uppercase text-[9px] text-slate-700 dark:text-slate-350'
                                }`}
                              >
                                <span>Rambling response (Stuttering/drifting)</span>
                                <AlertTriangle className="size-4 text-amber-500" />
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Transcription real time container */}
                        <div className="mt-6 pt-6 border-t border-black/5 dark:border-white/5 space-y-3">
                          <label className="text-[9px] uppercase font-black text-slate-400 dark:text-slate-500 block tracking-widest">SPEECH CONTEXT EXTRACTOR:</label>
                          
                          <div className="p-4 bg-slate-50 dark:bg-[#07090e] border border-black/5 dark:border-white/5 rounded-xl block min-h-[120px] text-[11px] leading-relaxed shadow-inner">
                            {transcriptStream ? (
                              <div className="space-y-3">
                                <p className="text-slate-700 dark:text-slate-350 font-mono italic leading-relaxed">
                                  "{transcriptStream}"
                                </p>
                                {vocalStatusAlert && (
                                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#1b2130] border border-white/5 text-[9px] font-mono text-teal-400 font-black leading-none animate-pulse">
                                    <Activity className="size-3 text-teal-400" />
                                    <span>ALERT: {vocalStatusAlert}</span>
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
                      key={`${activeRoleIdx}-step3`}
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
                        <p className="text-xs text-slate-550 mt-1">
                          No vague, meaningless pass/fail answers. We output a pinpointed scorecard analyzing exactly what you are doing wrong and how to practice.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
                        
                        {/* Overall Metrics block */}
                        <div className="md:col-span-5 p-6 rounded-2xl bg-slate-50 dark:bg-[#11141e] border border-black/5 dark:border-white/5 flex flex-col justify-between shadow-sm relative overflow-hidden">
                          <div>
                            <span className="text-[8px] uppercase font-mono tracking-widest text-slate-400 dark:text-slate-550 block mb-1">SESSION LOG: #A92-MOCK</span>
                            <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">Overall Performance Score</h4>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">Composite indicator weighing speech pacing, keyword coverage, architectural structure, and torso posture.</p>
                          </div>

                          {/* Beautiful SVG circular gauge chart */}
                          <div className="my-6 flex items-center justify-center gap-6">
                            <div className="relative size-24">
                              <svg className="size-full -rotate-90" viewBox="0 0 36 36">
                                {/* Track */}
                                <path 
                                  className="text-slate-200 dark:text-slate-800" 
                                  strokeWidth="3.5" 
                                  stroke="currentColor" 
                                  fill="none" 
                                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
                                />
                                {/* Progress bar */}
                                <path 
                                  className="text-primary dark:text-teal-400 transition-all duration-1000" 
                                  strokeWidth="3.5" 
                                  strokeDasharray={`${currentRole.scorecard.overall}, 100`} 
                                  strokeLinecap="round" 
                                  stroke="currentColor" 
                                  fill="none" 
                                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
                                />
                              </svg>
                              <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <strong className="text-2xl font-black text-slate-900 dark:text-white leading-none">{currentRole.scorecard.overall}</strong>
                                <span className="text-[7px] uppercase font-bold text-slate-400 block tracking-widest mt-0.5">SCORE</span>
                              </div>
                            </div>

                            <div className="space-y-1">
                              <span className="text-[8px] font-black text-teal-500 dark:text-teal-400 block uppercase tracking-widest leading-none">STATUS: CLEARANCE</span>
                              <strong className="text-sm font-black text-slate-900 dark:text-white block">Outstanding Standard</strong>
                              <span className="text-[9px] text-slate-400 block">Top 8% candidate score</span>
                            </div>
                          </div>

                          <div className="space-y-2 border-t border-slate-200 dark:border-slate-800 pt-4 text-[10px] font-extrabold uppercase tracking-wider">
                            <div className="flex justify-between">
                              <span className="text-slate-500">Speaking Pacing Rate:</span>
                              <strong className="text-slate-800 dark:text-slate-200">{currentRole.scorecard.wpm}</strong>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500">Eye Alignment Lock:</span>
                              <strong className="text-slate-800 dark:text-slate-200">{currentRole.scorecard.gaze}</strong>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500">STAR Structure Match:</span>
                              <strong className="text-slate-800 dark:text-slate-200">{currentRole.scorecard.star}</strong>
                            </div>
                          </div>
                        </div>

                        {/* Diagnostic breakdowns list with filter tabs */}
                        <div className="md:col-span-7 p-6 rounded-2xl bg-white dark:bg-[#11141e] border border-black/5 dark:border-white/5 shadow-sm flex flex-col justify-between">
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <span className="text-[8px] uppercase font-black text-slate-400 dark:text-slate-500 tracking-widest leading-none">Acoustics & Visual Core Critique</span>
                              
                              {/* Filter tabs */}
                              <div className="flex gap-1 p-0.5 bg-slate-100 dark:bg-[#07090e] rounded-lg border border-black/5 dark:border-white/5">
                                {['all', 'good', 'correction'].map(tab => (
                                  <button
                                    key={tab}
                                    onClick={() => setActiveDiagTab(tab as any)}
                                    className={`px-2 py-1 text-[8px] font-black uppercase rounded transition-all cursor-pointer ${
                                      activeDiagTab === tab 
                                        ? 'bg-white dark:bg-[#151a28] text-slate-900 dark:text-white shadow-sm'
                                        : 'text-slate-400 dark:text-slate-500 hover:text-slate-700'
                                    }`}
                                  >
                                    {tab === 'all' ? 'All' : tab === 'good' ? 'Positives' : 'Fixes'}
                                  </button>
                                ))}
                              </div>
                            </div>
                            
                            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                              {filteredDiagPoints.map((diag, i) => (
                                <div key={i} className={`p-3 rounded-xl border flex gap-3 text-xs leading-relaxed transition-colors ${
                                  diag.status === 'good' 
                                    ? 'bg-emerald-500/[0.03] border-emerald-500/10 text-slate-700 dark:text-slate-350' 
                                    : 'bg-red-500/[0.03] border-red-500/10 text-slate-700 dark:text-slate-350'
                                }`}>
                                  <div className="flex-shrink-0 mt-0.5">
                                    {diag.status === 'good' ? (
                                      <ThumbsUp className="size-4 text-emerald-500" />
                                    ) : (
                                      <AlertTriangle className="size-4 text-orange-400" />
                                    )}
                                  </div>
                                  <div className="space-y-1">
                                    <strong className={`font-black uppercase text-[9px] tracking-wider block ${diag.status === 'good' ? 'text-emerald-500' : 'text-orange-400'}`}>
                                      {diag.parameter}
                                    </strong>
                                    <p className="text-[11px] font-sans font-semibold">{diag.feedback}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                            <span className="text-[8px] text-slate-450 uppercase font-mono">Feedback compiled from 1,200 data vectors</span>
                          </div>
                        </div>
                        
                      </div>
                    </motion.div>
                  )}


                  {/* STEP 4: RELATED JOB DISCOVERY */}
                  {simulatorStep === 4 && (
                    <motion.div
                      key={`${activeRoleIdx}-step4`}
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
                        
                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                          Do not waste weeks scrolling boring boards. Our filter matches your exact verified scores, tailored resume keyword matrices, and salary criteria to open jobs.
                        </p>

                        <div className="space-y-2 border-t border-black/5 dark:border-white/10 pt-4 text-[10px] font-bold uppercase tracking-wider">
                          <div className="flex items-center gap-2 text-slate-650 dark:text-slate-400">
                            <CheckCircle className="size-4 text-teal-400 flex-shrink-0" /> Instant matching based on tailored resume keywords
                          </div>
                          <div className="flex items-center gap-2 text-slate-650 dark:text-slate-400">
                            <CheckCircle className="size-4 text-teal-400 flex-shrink-0" /> Auto match algorithm flags your high-confidence score
                          </div>
                          <div className="flex items-center gap-2 text-slate-650 dark:text-slate-400">
                            <CheckCircle className="size-4 text-teal-400 flex-shrink-0" /> Apply in one click directly to hiring corporate rosters
                          </div>
                        </div>
                      </div>

                      {/* Right: Mock listing options with badges */}
                      <div className="lg:col-span-7 grid grid-cols-1 gap-3.5">
                        {currentRole.jobs.map((job, idx) => (
                          <div key={idx} className="p-4 rounded-xl bg-slate-50 dark:bg-[#11141e] border border-black/5 dark:border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm relative overflow-hidden group hover:border-primary/25 transition-all">
                            <div className="space-y-1.5 max-w-sm">
                              <div className="flex items-center gap-2">
                                <span className="text-[8px] uppercase font-black text-primary px-1.5 py-0.5 rounded bg-primary/5 dark:bg-primary/10 leading-none">{job.badge}</span>
                                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">{job.loc}</span>
                              </div>
                              <h4 className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white leading-none mt-1">{job.title}</h4>
                              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold block uppercase tracking-wider">{job.company} • <strong className="font-mono text-slate-800 dark:text-slate-300 font-black">{job.salary}</strong></span>
                              <span className="text-[10px] text-slate-450 dark:text-slate-500 block font-semibold leading-normal mt-1 border-t border-slate-200 dark:border-slate-800 pt-1.5 font-sans">
                                Match Reason: {job.reason}
                              </span>
                            </div>

                            {/* Applied badge / Match indicator */}
                            <div className="text-left sm:text-right border-t sm:border-t-0 border-black/5 pt-3 sm:pt-0 flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 flex-shrink-0">
                              <div className="inline-flex items-center gap-1.5 bg-teal-500/10 border border-teal-500/20 px-3 py-1.5 rounded-full text-[9px] font-black text-teal-600 dark:text-teal-400 uppercase tracking-widest leading-none">
                                <Sparkles className="size-3" />
                                <span>{job.match}% MATCH</span>
                              </div>
                              
                              <button
                                onClick={() => handleApplyJobMock(idx)}
                                disabled={appliedJobs[idx] || submittingJobIdx === idx}
                                className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                                  appliedJobs[idx]
                                    ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                                    : 'bg-primary hover:bg-primary-hover text-white'
                                }`}
                              >
                                {submittingJobIdx === idx ? (
                                  <RefreshCw className="size-3 animate-spin" />
                                ) : appliedJobs[idx] ? (
                                  '✓ Submitted'
                                ) : (
                                  'Easy Submit'
                                )}
                              </button>
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


        {/* STATS SECTION */}
        <section className="w-full max-w-7xl px-6 lg:px-16 py-12">
          <div className="p-8 lg:p-12 rounded-[32px] bg-gradient-to-r from-slate-900 to-indigo-950 text-white shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-84 h-84 bg-white/5 rounded-full blur-[70px]" />
            <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
              <div className="space-y-2">
                <span className="text-[9px] font-black text-teal-400 uppercase tracking-widest">CALLBACK GROWTH</span>
                <strong className="block text-4xl sm:text-5xl font-black tracking-tight">94%</strong>
                <p className="text-xs text-indigo-205 font-medium leading-relaxed">
                  Average increase in recruiter callback invitations within 14 days of resume tailoring optimization.
                </p>
              </div>

              <div className="space-y-2 md:border-l md:border-white/10 md:pl-8">
                <span className="text-[9px] font-black text-teal-400 uppercase tracking-widest">PRACTICE RUNS</span>
                <strong className="block text-4xl sm:text-5xl font-black tracking-tight">18,000+</strong>
                <p className="text-xs text-indigo-205 font-medium leading-relaxed">
                  Simulated audio & WebRTC interview sessions logged by candidates targeting FAANG & leading scale-ups.
                </p>
              </div>

              <div className="space-y-2 md:border-l md:border-white/10 md:pl-8">
                <span className="text-[9px] font-black text-teal-400 uppercase tracking-widest">SALARY INCREASE</span>
                <strong className="block text-4xl sm:text-5xl font-black tracking-tight">35%</strong>
                <p className="text-xs text-indigo-205 font-medium leading-relaxed">
                  Average target compensation enhancement reported by users passing high-level infrastructure reviews.
                </p>
              </div>
            </div>
          </div>
        </section>


        {/* TESTIMONIALS SECTION */}
        <section className="w-full max-w-7xl px-6 lg:px-16 py-16 lg:py-20 border-t border-black/5 dark:border-white/5">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-[9px] font-black uppercase tracking-widest text-primary bg-primary/10 px-3 py-1 rounded-full mb-4 inline-block">CANDIDATE REVIEWS</span>
            <h2 className="text-3xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
              Real success from real developers
            </h2>
            <p className="mt-4 text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">
              Hear from candidates who turned interview anxiety into high-salary career offers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {[
              {
                quote: "I was struggling to pass automated HR filters for cloud roles. MockInterview.ai pointed out my resume lacked quantified metrics. Tailored it, and got 4 callbacks in 5 days.",
                author: "Sarah J.",
                role: "Staff DevOps Engineer",
                landed: "Landed at Redis Technology",
                color: "from-teal-500/10 to-transparent"
              },
              {
                quote: "The live eye-gaze tracker is outstanding. I didn't realize I stared at the floor while thinking about technical problems. Calibrating my gaze gave me massive confidence.",
                author: "Marcus V.",
                role: "Senior React Engineer",
                landed: "Landed at Vercel",
                color: "from-primary/10 to-transparent"
              },
              {
                quote: "I went from freezing up during live system design questions to delivering clear, paced answers. The circular gauge breakdown of my filler words helped me self-correct.",
                author: "Jordan S.",
                role: "Lead Systems Architect",
                landed: "Landed at Databricks",
                color: "from-indigo-500/10 to-transparent"
              }
            ].map((testi, i) => (
              <div key={i} className="p-8 rounded-[28px] bg-white dark:bg-[#11141e] border border-black/5 dark:border-white/5 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow group relative overflow-hidden">
                <div className={`absolute -top-10 -right-10 size-32 rounded-full bg-gradient-to-br ${testi.color} blur-xl opacity-60 pointer-events-none`} />
                <div className="space-y-4 relative z-10">
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => <Star key={i} className="size-3.5 fill-amber-500 text-amber-500" />)}
                  </div>
                  <p className="text-xs text-slate-650 dark:text-slate-350 italic font-semibold leading-relaxed">
                    "{testi.quote}"
                  </p>
                </div>

                <div className="pt-6 border-t border-slate-100 dark:border-slate-800 mt-6 flex items-center justify-between relative z-10">
                  <div>
                    <strong className="block text-xs font-black text-slate-900 dark:text-white leading-none">{testi.author}</strong>
                    <span className="text-[9px] text-slate-400 uppercase tracking-widest mt-1 block">{testi.role}</span>
                  </div>
                  <span className="text-[9px] font-black uppercase text-teal-650 dark:text-teal-400 bg-teal-500/5 px-2.5 py-1 rounded-full border border-teal-500/10">
                    {testi.landed}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>


        {/* THE RESULTS-DRIVEN COPY PILLARS */}
        <section className="w-full max-w-7xl px-6 lg:px-16 py-12 border-t border-black/5 dark:border-white/5">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-[9px] font-black uppercase tracking-widest text-primary bg-primary/10 px-3 py-1 rounded-full mb-4 inline-block">YOUR COMPLETE PREPARATION SUITE</span>
            <h2 className="text-3xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
              Crafted to secure your next career milestone.
            </h2>
            <p className="mt-4 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-semibold">
              We skip the boring, passive technical details. We focus purely on what matters: confidence under pressure, beautiful tailored CV copy, and direct hiring board access.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 max-w-7xl mx-auto">
            
            {/* PILLAR 1 */}
            <div className="p-8 rounded-3xl bg-white dark:bg-[#11141e] border border-black/5 dark:border-white/5 flex flex-col justify-between shadow-sm relative group hover:border-primary/25 transition-all">
              <div className="space-y-4">
                <div className="size-11 rounded-xl bg-primary/15 text-primary flex items-center justify-center">
                  <FileText className="size-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white leading-tight">Instant CV Tailoring</h3>
                <p className="text-xs text-slate-600 dark:text-slate-450 leading-relaxed font-semibold">
                  Instantly tailor your CV to any job description to align exact recruitment keywords, maximize structural scores, and stand out under intense automated screeners.
                </p>
              </div>
              <div className="pt-6 border-t border-slate-100 dark:border-slate-800 mt-8 block">
                <span className="text-[9px] text-slate-400 font-bold uppercase block tracking-wider">01 / HIGHER CALLBACKS</span>
              </div>
            </div>

            {/* PILLAR 2 */}
            <div className="p-8 rounded-3xl bg-white dark:bg-[#11141e] border border-black/5 dark:border-white/5 flex flex-col justify-between shadow-sm relative group hover:border-primary/25 transition-all">
              <div className="space-y-4">
                <div className="size-11 rounded-xl bg-indigo-500/15 text-indigo-500 flex items-center justify-center">
                  <Video className="size-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white leading-tight">Comfortable Voice Practice</h3>
                <p className="text-xs text-slate-600 dark:text-slate-450 leading-relaxed font-semibold">
                  Practice with a live audio & video simulator to conquer stage fright. Master your sentence pacing, eliminate "um" fillers, and feel completely prepared and calm.
                </p>
              </div>
              <div className="pt-6 border-t border-slate-100 dark:border-slate-800 mt-8 block">
                <span className="text-[9px] text-slate-400 font-bold uppercase block tracking-wider">02 / BULLITPROOF CONFIDENCE</span>
              </div>
            </div>

            {/* PILLAR 3 */}
            <div className="p-8 rounded-3xl bg-white dark:bg-[#11141e] border border-black/5 dark:border-white/5 flex flex-col justify-between shadow-sm relative group hover:border-primary/25 transition-all">
              <div className="space-y-4">
                <div className="size-11 rounded-xl bg-teal-500/15 text-teal-500 flex items-center justify-center">
                  <Award className="size-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white leading-tight">Pinpointed Performance Score</h3>
                <p className="text-xs text-slate-600 dark:text-slate-450 leading-relaxed font-semibold">
                  Get absolute critique reports mapping exact errors. See how long you pause, how often your eye contact drifts, and read clear summaries explaining how to improve.
                </p>
              </div>
              <div className="pt-6 border-t border-slate-100 dark:border-slate-800 mt-8 block">
                <span className="text-[9px] text-slate-400 font-bold uppercase block tracking-wider">03 / FULL CRITIQUE REPORTS</span>
              </div>
            </div>

            {/* PILLAR 4 */}
            <div className="p-8 rounded-3xl bg-white dark:bg-[#11141e] border border-black/5 dark:border-white/5 flex flex-col justify-between shadow-sm relative group hover:border-primary/25 transition-all">
              <div className="space-y-4">
                <div className="size-11 rounded-xl bg-orange-500/15 text-orange-400 flex items-center justify-center">
                  <Briefcase className="size-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white leading-tight">Smart Hiring Board</h3>
                <p className="text-xs text-slate-600 dark:text-slate-450 leading-relaxed font-semibold">
                  Avoid applying blindly to bad listings. View high-salary related matches looking for your verified credentials, and submit tailored applications in one simple tap.
                </p>
              </div>
              <div className="pt-6 border-t border-slate-100 dark:border-slate-800 mt-8 block">
                <span className="text-[9px] text-slate-400 font-bold uppercase block tracking-wider">04 / RELIABLE JOB MATCHES</span>
              </div>
            </div>

          </div>
        </section>


        {/* SAAS PRICING SECTION */}
        <section className="w-full max-w-7xl px-6 lg:px-16 py-16 border-t border-black/5 dark:border-white/5">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-[9px] font-black uppercase tracking-widest text-primary bg-primary/10 px-3 py-1 rounded-full mb-4 inline-block">PRICING OPTIONS</span>
            <h2 className="text-3xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
              Invest in your career progression
            </h2>
            <p className="mt-4 text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-semibold leading-relaxed">
              Unlock callback tracking, unlimited audio WebRTC scans, and direct hiring board submittals.
            </p>

            {/* Monthly / Annual Billing Selector Toggle */}
            <div className="mt-8 flex items-center justify-center gap-3">
              <span className={`text-xs font-extrabold uppercase tracking-wider ${billingCycle === 'monthly' ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}>Monthly</span>
              <button 
                onClick={() => setBillingCycle(prev => prev === 'monthly' ? 'annual' : 'monthly')}
                className="relative w-12 h-6 rounded-full bg-primary/20 dark:bg-slate-800 p-1 flex items-center transition-colors cursor-pointer"
              >
                <div className={`size-4 rounded-full bg-primary transition-transform ${billingCycle === 'annual' ? 'translate-x-6' : 'translate-x-0'}`} />
              </button>
              <div className="flex items-center gap-1.5">
                <span className={`text-xs font-extrabold uppercase tracking-wider ${billingCycle === 'annual' ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}>Annual Billing</span>
                <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">SAVE 20%</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto items-stretch">
            
            {/* Free Plan */}
            <div className="p-8 rounded-[32px] bg-white dark:bg-[#11141e] border border-black/5 dark:border-white/5 flex flex-col justify-between shadow-sm hover:border-black/10 dark:hover:border-white/10 transition-colors">
              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest leading-none">Starter Free</h4>
                  <span className="text-[10px] text-slate-400 mt-1.5 block">Test core feedback limits</span>
                </div>

                <div className="flex items-baseline">
                  <strong className="text-4xl font-black text-slate-900 dark:text-white">$0</strong>
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider ml-1">/ forever</span>
                </div>

                <ul className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs font-semibold text-slate-650 dark:text-slate-400">
                  <li className="flex items-center gap-2.5">
                    <Check className="size-4 text-emerald-500 flex-shrink-0" /> 2 Resume Keywords Scans / month
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="size-4 text-emerald-500 flex-shrink-0" /> 1 Live Audio Interview run
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="size-4 text-emerald-500 flex-shrink-0" /> Basic diagnostic scorecard metrics
                  </li>
                  <li className="flex items-center gap-2.5 text-slate-400 line-through">
                    No active eye-gaze video tracking
                  </li>
                  <li className="flex items-center gap-2.5 text-slate-400 line-through">
                    No smart matching job submits
                  </li>
                </ul>
              </div>

              <div className="pt-8 mt-8 border-t border-slate-105 dark:border-slate-800">
                <button 
                  onClick={handleQuickPractice}
                  className="w-full py-3 rounded-xl border border-slate-200 dark:border-slate-800 text-center text-[10px] font-black uppercase tracking-wider text-slate-800 dark:text-white hover:bg-slate-50 dark:hover:bg-white/5 transition-all cursor-pointer"
                >
                  Configure Free Profile
                </button>
              </div>
            </div>

            {/* Pro Plan */}
            <div className="p-8 rounded-[32px] bg-white dark:bg-[#11141e] border-2 border-primary flex flex-col justify-between shadow-lg relative">
              <div className="absolute top-4 right-4 text-[8px] font-black text-primary uppercase tracking-widest px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20">
                MOST POPULAR
              </div>
              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-black text-primary uppercase tracking-widest leading-none">Interview Pro</h4>
                  <span className="text-[10px] text-slate-400 mt-1.5 block">Perfect candidate mastery run</span>
                </div>

                <div className="flex items-baseline">
                  <strong className="text-4xl font-black text-slate-900 dark:text-white">
                    ${billingCycle === 'annual' ? '24' : '29'}
                  </strong>
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider ml-1">
                    / month {billingCycle === 'annual' && '(billed annually)'}
                  </span>
                </div>

                <ul className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs font-semibold text-slate-650 dark:text-slate-400">
                  <li className="flex items-center gap-2.5">
                    <Check className="size-4 text-emerald-500 flex-shrink-0" /> Unlimited CV Keyword Tailoring
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="size-4 text-emerald-500 flex-shrink-0" /> Unlimited Audio & Video WebRTC sessions
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="size-4 text-emerald-500 flex-shrink-0" /> Gaze Eye-tracking vector coordinates
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="size-4 text-emerald-500 flex-shrink-0" /> Vocal stutters & pause detection alerts
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="size-4 text-emerald-500 flex-shrink-0" /> Smart Job Board submittals in 1 click
                  </li>
                </ul>
              </div>

              <div className="pt-8 mt-8 border-t border-slate-105 dark:border-slate-800">
                <button 
                  onClick={handleQuickPractice}
                  className="w-full py-3.5 rounded-xl bg-primary hover:bg-primary-hover text-center text-[10px] font-black uppercase tracking-wider text-white shadow-lg shadow-primary/20 transition-all cursor-pointer"
                >
                  Get Interview Pro
                </button>
              </div>
            </div>

            {/* Enterprise Plan */}
            <div className="p-8 rounded-[32px] bg-white dark:bg-[#11141e] border border-black/5 dark:border-white/5 flex flex-col justify-between shadow-sm hover:border-black/10 dark:hover:border-white/10 transition-colors">
              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest leading-none">Enterprise Team</h4>
                  <span className="text-[10px] text-slate-400 mt-1.5 block">For recruiting and agency tiers</span>
                </div>

                <div className="flex items-baseline">
                  <strong className="text-4xl font-black text-slate-900 dark:text-white">
                    ${billingCycle === 'annual' ? '119' : '149'}
                  </strong>
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider ml-1">
                    / month
                  </span>
                </div>

                <ul className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs font-semibold text-slate-650 dark:text-slate-400">
                  <li className="flex items-center gap-2.5">
                    <Check className="size-4 text-emerald-500 flex-shrink-0" /> Up to 15 team candidate slots
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="size-4 text-emerald-500 flex-shrink-0" /> Custom target scorecard benchmarks
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="size-4 text-emerald-500 flex-shrink-0" /> API pipelines access for batch parsing
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="size-4 text-emerald-500 flex-shrink-0" /> Custom tailored resume exports (PDF)
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="size-4 text-emerald-500 flex-shrink-0" /> Dedicated SLA account manager
                  </li>
                </ul>
              </div>

              <div className="pt-8 mt-8 border-t border-slate-105 dark:border-slate-800">
                <button 
                  onClick={handleQuickPractice}
                  className="w-full py-3 rounded-xl border border-slate-200 dark:border-slate-800 text-center text-[10px] font-black uppercase tracking-wider text-slate-800 dark:text-white hover:bg-slate-50 dark:hover:bg-white/5 transition-all cursor-pointer"
                >
                  Contact Enterprise
                </button>
              </div>
            </div>

          </div>
        </section>


        {/* FAQ SECTION: MUTUALLY EXCLUSIVE NATIVE DETAILS DISCLOSURES */}
        <section className="w-full max-w-4xl px-6 py-16 border-t border-black/5 dark:border-white/5">
          <div className="text-center mb-12">
            <span className="text-[9px] font-black uppercase tracking-widest text-primary bg-primary/10 px-3 py-1 rounded-full mb-4 inline-block font-sans">COMMON OBJECTIONS</span>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Frequently Asked Questions</h2>
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 font-semibold font-sans">Everything you need to know about the AI scanner, security, and gaze analytics.</p>
          </div>

          <div className="space-y-4">
            {[
              {
                q: "How does the Live Webcam Gaze simulation work?",
                a: "Our system runs local web client face coordinates detection via the browser canvas. It measures the vector offset between your pupils and the camera lens in real-time, helping you train yourself to keep visual focus centered during stressful system design queries without sending actual recordings to the server."
              },
              {
                q: "Is my CV content kept private?",
                a: "Absolutely. All uploaded documents are processed securely under standard AES-256 database encryption. Your CV parameters and personal details are strictly utilized to compile STAR structures and match career openings, and are never shared or sold to external HR networks."
              },
              {
                q: "What is the STAR resume structure, and why do recruiters demand it?",
                a: "STAR stands for Situation, Task, Action, and Result. Automated screening filters are designed to seek out quantitative results (e.g. 'reduced recoveries downtime by 82%') rather than vague statements ('helped configure clusters'). We scan your text to enforce this numeric outcome formula."
              },
              {
                q: "Can I cancel my Interview Pro plan at any time?",
                a: "Yes. You can cancel your subscription directly from your settings screen at any time. You will retain access to Pro features until the end of your billing cycle, and no cancellation penalties apply."
              }
            ].map((faq, idx) => (
              <details 
                key={idx} 
                name="faq-accordion" 
                className="group p-5 rounded-2xl bg-white dark:bg-[#11141e] border border-black/5 dark:border-white/5 [&_summary::-webkit-details-marker]:hidden transition-all duration-300"
              >
                <summary className="flex items-center justify-between font-black text-xs sm:text-sm text-slate-900 dark:text-white uppercase tracking-wider cursor-pointer list-none select-none">
                  <span>{faq.q}</span>
                  <span className="transition-transform duration-350 group-open:rotate-180">
                    <ChevronDown className="size-4 text-slate-550" />
                  </span>
                </summary>
                <p className="mt-3 text-xs text-slate-600 dark:text-slate-450 leading-relaxed font-medium pl-1 border-t border-slate-100 dark:border-slate-800 pt-3 font-sans">
                  {faq.a}
                </p>
              </details>
            ))}
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
      <footer className="w-full max-w-7xl px-6 lg:px-16 py-12 border-t border-black/5 dark:border-white/5 bg-white/50 dark:bg-slate-950/50 backdrop-blur-xl transition-colors text-[10px] uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400 mt-auto flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-2">
          <Logo className="size-6 shadow-sm animate-spin-slow" />
          <span className="font-extrabold text-slate-800 dark:text-white">MockInterview.ai</span>
        </div>
        
        <p className="text-center sm:text-right font-bold tracking-widest leading-relaxed">
          © 2026 MockInterview.ai Inc. Built for technical and administrative candidate mastery.
        </p>
      </footer>

    </div>
  );
};

export default LandingScreen;
