
import React, { useEffect, useState } from 'react';
import { 
  LayoutGrid, 
  FileText, 
  Briefcase, 
  History, 
  BarChart3, 
  Settings, 
  LogOut, 
  X, 
  Menu, 
  Brain, 
  Flame, 
  Mic, 
  CheckSquare, 
  ThumbsUp, 
  Target, 
  TrendingUp, 
  Lightbulb, 
  Code2, 
  Layout, 
  Eye 
} from 'lucide-react';
import { Screen, User } from '../types';
import { apiClient } from '../services/apiClient';

interface DashboardScreenProps {
  user: User | null;
  onNavigate: (screen: Screen) => void;
  onLogout: () => void;
}

const DashboardScreen: React.FC<DashboardScreenProps> = ({ user, onNavigate, onLogout }) => {
  const [interviewsLeft, setInterviewsLeft] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [dashboardStats, setDashboardStats] = useState<any>(null);
  const [recentSessions, setRecentSessions] = useState<any[]>([]);
  const [streak, setStreak] = useState(3);
  const [isLoading, setIsLoading] = useState(true);
  
  const maxInterviews = user?.plan === 'elite' ? 100 : user?.plan === 'pro' ? 40 : 3;
  const isFree = user?.plan === 'free';

  useEffect(() => {
    // Local usage quota fallback
    try {
        const usage = JSON.parse(localStorage.getItem(`usage_${user?.id}`) || '{"count": 0, "date": ""}');
        setInterviewsLeft(Math.max(0, maxInterviews - usage.count));
    } catch {
        setInterviewsLeft(3);
    }
  }, [user, maxInterviews]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const statsRes = await apiClient.get('/analytics/dashboard');
        setDashboardStats(statsRes.data);
        if (statsRes.data?.currentStreak !== undefined) {
          setStreak(statsRes.data.currentStreak);
        }
      } catch (err) {
        console.error("Error fetching dashboard stats:", err);
      }

      try {
        const historyRes = await apiClient.get('/interviews/history');
        setRecentSessions(historyRes.data || []);
      } catch (err) {
        console.error("Error fetching interview history:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const handleStartInterview = (targetScreen: Screen) => {
    if (interviewsLeft <= 0) {
      onNavigate(Screen.Subscription);
    } else {
      localStorage.removeItem('last_interview_analysis_report');
      onNavigate(targetScreen);
    }
    setIsSidebarOpen(false);
  };

  const handleViewSessionReport = async (sessionId: number, roleName: string) => {
    try {
      const response = await apiClient.get(`/interviews/${sessionId}`);
      if (response.data?.analysis) {
        localStorage.setItem('last_interview_analysis_report', JSON.stringify(response.data.analysis));
        localStorage.setItem('last_interview_role', roleName);
        onNavigate(Screen.Analysis);
      }
    } catch (err) {
      console.error("Failed to load session report:", err);
    }
  };

  const getSessionIcon = (iconName: string) => {
    switch (iconName) {
      case 'code':
        return <Code2 className="size-5" />;
      case 'record_voice_over':
        return <Mic className="size-5" />;
      case 'hub':
        return <Layout className="size-5" />;
      default:
        return <Brain className="size-5" />;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  if (isLoading) {
    return (
      <div className="flex h-screen w-full bg-[#0f111a] text-white items-center justify-center">
        <div className="flex flex-col items-center gap-4 animate-pulse">
          <div className="bg-primary/20 p-4 rounded-3xl text-primary border border-primary/10">
            <Brain className="size-16 animate-bounce" />
          </div>
          <p className="text-text-secondary text-sm font-semibold tracking-wide uppercase">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const totalPractice = dashboardStats?.totalPracticeCount ?? 0;
  const avgScore = dashboardStats?.averageScore != null ? Math.round(dashboardStats.averageScore) : 0;
  const strongest = dashboardStats?.strongestCategory || 'N/A';
  const improvement = dashboardStats?.improvementArea || 'N/A';

  const statsCards = [
    { label: 'Total Practice', val: totalPractice.toString(), inc: 'All-time', color: 'text-primary', icon: <CheckSquare className="size-5" /> },
    { label: 'Avg. Score', val: avgScore > 0 ? `${avgScore}%` : 'N/A', inc: avgScore >= 80 ? 'Top 10%' : avgScore >= 60 ? 'Above Avg' : 'Needs Practice', color: 'text-purple-400', icon: <BarChart3 className="size-5" /> },
    { label: 'Strongest', val: strongest, inc: 'Stable', color: 'text-green-500', icon: <ThumbsUp className="size-5" /> },
    { label: 'Improvement', val: improvement, inc: 'Focus Area', color: 'text-orange-500', icon: <Target className="size-5" /> }
  ];

  const points = dashboardStats?.performanceTrend || [];
  
  // Calculate SVG path with scaling to prevent clipping
  let pathD = '';
  if (points.length > 0) {
    if (points.length === 1) {
      const score = Math.max(0, Math.min(100, points[0].score));
      const y = 90 - (score * 0.8);
      pathD = `M 0,${y} L 100,${y}`;
    } else {
      pathD = points.map((p: any, i: number) => {
        const x = (i / (points.length - 1)) * 100;
        const score = Math.max(0, Math.min(100, p.score));
        const y = 90 - (score * 0.8); // 100 maps to 10, 0 maps to 90
        return `${i === 0 ? 'M' : 'L'} ${x},${y}`;
      }).join(' ');
    }
  } else {
    // Fallback path
    pathD = "M 0,80 L 20,70 L 40,75 L 60,60 L 80,50 L 100,45";
  }

  return (
    <div className="flex h-screen w-full bg-[#0f111a] text-white overflow-hidden font-display">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 w-64 border-r border-white/5 flex flex-col shrink-0 bg-[#0f111a] z-[70] transition-transform duration-300 transform lg:relative lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 space-y-1">
          <div className="flex items-center justify-between mb-10 px-2">
            <div className="flex items-center gap-3">
              <div className="bg-primary p-2 rounded-lg text-white">
                <Brain className="size-5" />
              </div>
              <div>
                <h1 className="font-bold text-sm tracking-tight leading-none">AI Interviewer</h1>
                <p className="text-xs text-text-secondary mt-1 font-black uppercase">
                  {user?.plan || 'free'} Tier
                </p>
              </div>
            </div>
            <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-text-secondary">
              <X className="size-5" />
            </button>
          </div>

          <nav className="space-y-1">
            <button 
              onClick={() => { onNavigate(Screen.Dashboard); setIsSidebarOpen(false); }}
              className="flex items-center w-full gap-3 px-4 py-3 rounded-xl bg-primary text-white text-sm font-bold shadow-lg shadow-primary/20"
            >
              <LayoutGrid className="size-5" />
              Dashboard
            </button>
            <button 
              onClick={() => { onNavigate(Screen.CVLanding); setIsSidebarOpen(false); }}
              className="flex items-center w-full gap-3 px-4 py-3 rounded-xl text-text-secondary hover:bg-white/5 transition-all text-sm font-medium"
            >
              <FileText className="size-5" />
              CV Analysis
            </button>
            <button 
              onClick={() => { onNavigate(Screen.JobBoard); setIsSidebarOpen(false); }}
              className="flex items-center w-full gap-3 px-4 py-3 rounded-xl text-text-secondary hover:bg-white/5 transition-all text-sm font-medium"
            >
              <Briefcase className="size-5" />
              Job Board
            </button>
            <button className="flex items-center w-full gap-3 px-4 py-3 rounded-xl text-text-secondary hover:bg-white/5 transition-all text-sm font-medium">
              <History className="size-5" />
              History
            </button>
            <button className="flex items-center w-full gap-3 px-4 py-3 rounded-xl text-text-secondary hover:bg-white/5 transition-all text-sm font-medium">
              <BarChart3 className="size-5" />
              Analytics
            </button>
            <button 
              onClick={() => { onNavigate(Screen.Settings); setIsSidebarOpen(false); }}
              className="flex items-center w-full gap-3 px-4 py-3 rounded-xl text-text-secondary hover:bg-white/5 transition-all text-sm font-medium"
            >
              <Settings className="size-5" />
              Settings
            </button>
          </nav>
        </div>

        <div className="mt-auto p-6 space-y-4">
          <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
             <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] font-black uppercase text-text-secondary">Quota</span>
                <span className="text-[10px] font-black text-primary">{interviewsLeft}/{maxInterviews} left</span>
             </div>
             <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-primary" style={{ width: `${(interviewsLeft/maxInterviews)*100}%` }}></div>
             </div>
             <p className="text-[10px] text-text-secondary/60 mt-2 font-bold uppercase tracking-widest text-center">Reset in 3 days</p>
          </div>

          {isFree && (
            <button 
              onClick={() => onNavigate(Screen.Subscription)}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-primary to-indigo-600 text-white text-xs font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all"
            >
              Upgrade to Pro
            </button>
          )}
          <div className="flex items-center gap-3 py-4 border-t border-white/5">
            <div className="size-10 rounded-full border border-white/10 overflow-hidden bg-slate-700">
               <img src={`https://i.pravatar.cc/150?u=${user?.id || 'alex'}`} alt="User" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold truncate leading-none">{user?.name || 'Alex Morgan'}</p>
              <p className="text-xs text-text-secondary truncate mt-1">{user?.email || 'alex@example.com'}</p>
            </div>
            <button onClick={onLogout} className="text-text-secondary hover:text-white transition-colors">
              <LogOut className="size-5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 md:p-10 lg:p-14 custom-scrollbar space-y-8 md:space-y-12 relative">
        <div className="lg:hidden flex items-center justify-between mb-4">
          <button onClick={() => setIsSidebarOpen(true)} className="size-10 rounded-xl bg-[#1c212b] border border-white/5 flex items-center justify-center">
            <Menu className="size-6" />
          </button>
          <div className="flex items-center gap-2">
            <div className="bg-primary p-1.5 rounded-lg text-white">
              <Brain className="size-4" />
            </div>
            <span className="font-bold text-sm">MockInterview.ai</span>
          </div>
          <div className="size-10 rounded-full border border-white/10 overflow-hidden">
             <img src={`https://i.pravatar.cc/150?u=${user?.id || 'alex'}`} alt="User" />
          </div>
        </div>

        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="w-full lg:w-auto">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-black tracking-tight mb-2 leading-tight">Ready to ace it, {user?.name?.split(' ')[0] || 'Alex'}?</h2>
            <div className="flex items-center gap-2 text-text-secondary">
              <Flame className="size-5 text-orange-500" fill="currentColor" />
              <p className="text-sm font-medium">You're on a {streak}-day streak! Keep going.</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full lg:w-auto">
            <button 
              onClick={() => onNavigate(Screen.JobBoard)}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#1c212b] border border-white/10 hover:bg-white/5 text-white text-xs font-bold transition-all active:scale-95"
            >
              <Briefcase className="size-4" />
              Job Board
            </button>
            <button 
              onClick={() => handleStartInterview(Screen.JDSetup)}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#1c212b] border border-white/10 hover:bg-white/5 text-white text-xs font-bold transition-all active:scale-95"
            >
              <FileText className="size-4" />
              Job Description
            </button>
            <button 
              onClick={() => handleStartInterview(Screen.Onboarding)}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold transition-all shadow-xl shadow-primary/30 active:scale-95"
            >
              <Mic className="size-4" />
              Start Interview
            </button>
          </div>
        </header>

        {/* Performance Grid */}
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
           {statsCards.map((stat) => (
             <div key={stat.label} className="bg-[#1c212b] p-4 md:p-8 rounded-2xl md:rounded-[32px] border border-white/5 shadow-xl space-y-4 md:space-y-6">
                <div className="flex items-center justify-between">
                   <div className={`size-8 md:size-10 rounded-lg bg-white/5 ${stat.color} flex items-center justify-center`}>
                      {stat.icon}
                   </div>
                   <div className="text-[10px] font-black uppercase tracking-widest opacity-60">{stat.inc}</div>
                </div>
                <div>
                   <p className="text-text-secondary text-xs font-bold mb-1">{stat.label}</p>
                   <p className="text-xl md:text-3xl font-black truncate">{stat.val}</p>
                </div>
             </div>
           ))}
        </div>

        {/* Charts and Tips */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 lg:gap-8">
          <div className="xl:col-span-8 bg-[#1c212b] rounded-2xl md:rounded-[40px] border border-white/5 p-6 md:p-10 shadow-2xl space-y-8 flex flex-col relative overflow-hidden">
             <div className="flex items-center justify-between relative z-10">
                <div className="space-y-1">
                   <h3 className="text-lg md:text-xl font-bold">Performance Trend</h3>
                   <p className="text-sm text-text-secondary">Progress over last 6 months</p>
                </div>
                <div className="px-2 md:px-3 py-1 rounded-full bg-green-500/10 text-green-500 text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                   <TrendingUp className="size-3" />
                   +12%
                </div>
             </div>
             <div className="flex-1 min-h-[200px] md:min-h-[280px] w-full flex flex-col justify-end gap-6 relative z-10 pb-4">
                <svg className="w-full h-[80%] absolute inset-x-0 top-0 overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
                   <path d={pathD} fill="none" stroke="#194ce6" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <div className="mt-auto pt-4 border-t border-white/5 flex justify-between text-[10px] md:text-xs font-bold text-text-secondary uppercase tracking-[0.2em]">
                   {points.length > 0 ? (
                     points.map((p: any, i: number) => (
                       <span key={i}>{p.date}</span>
                     ))
                   ) : (
                     <><span>May</span><span>Jun</span><span>Jul</span><span>Aug</span><span>Sep</span><span>Oct</span></>
                   )}
                </div>
             </div>
          </div>

          <div className="xl:col-span-4 bg-primary rounded-2xl md:rounded-[40px] p-8 md:p-12 flex flex-col shadow-2xl relative overflow-hidden">
             <div className="relative z-10 flex flex-col h-full text-left">
                <div className="size-10 md:size-12 bg-white/10 rounded-2xl flex items-center justify-center text-white mb-6 md:mb-10">
                   <Lightbulb className="size-6" />
                </div>
                <h3 className="text-2xl md:text-3xl font-black text-white mb-4">Pro Tip</h3>
                <p className="text-white/80 text-sm md:text-lg leading-relaxed font-medium mb-auto">
                   Structure answers with the <span className="text-white font-black underline decoration-white/40 underline-offset-4">STAR method</span>. Focus on the 'Result' section.
                </p>
                <button className="w-full py-4 mt-8 rounded-xl bg-white/10 border border-white/20 text-white font-bold text-xs hover:bg-white/20 transition-all">
                   Practice Behavioral Qs
                </button>
             </div>
          </div>
        </div>

        {/* History Table */}
        <div className="bg-[#1c212b] rounded-2xl md:rounded-[40px] border border-white/5 shadow-2xl overflow-hidden p-6 md:p-10">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg md:text-2xl font-black">Recent Sessions</h3>
            <button className="text-primary text-sm font-bold hover:underline">View History</button>
          </div>
          <div className="overflow-x-auto -mx-6 px-6">
            <table className="w-full text-left min-w-[600px]">
              <thead>
                <tr className="text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary opacity-40">
                  <th className="pb-6">Role & Type</th>
                  <th className="pb-6">Date</th>
                  <th className="pb-6">Score</th>
                  <th className="pb-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {recentSessions.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-text-secondary font-medium">
                      No interview sessions recorded yet. Start your first session above!
                    </td>
                  </tr>
                ) : (
                  recentSessions.map((session, i) => (
                    <tr key={i} className="group hover:bg-white/5 transition-all">
                      <td className="py-6">
                        <div className="flex items-center gap-4">
                          <div className="size-8 md:size-10 bg-black/20 text-text-secondary rounded-lg flex items-center justify-center shrink-0 border border-white/5">
                             {getSessionIcon(session.icon)}
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="text-sm md:text-base font-bold text-white truncate">{session.role}</span>
                            <span className="text-xs text-text-secondary mt-0.5 truncate">{session.type}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-6 text-xs md:text-sm text-text-secondary font-bold">{session.date}</td>
                      <td className="py-6">
                        <div className="flex items-center gap-3">
                          <span className="text-sm md:text-base font-black tabular-nums">{Math.round(session.score)}</span>
                          <div className="h-1 w-16 md:w-24 bg-white/5 rounded-full overflow-hidden shrink-0">
                             <div className={`h-full ${getScoreColor(session.score)} rounded-full`} style={{ width: `${(session.score / (session.scoreMax || 100)) * 100}%` }}></div>
                          </div>
                        </div>
                      </td>
                      <td className="py-6 text-right">
                        <button 
                          onClick={() => handleViewSessionReport(session.id, session.role)}
                          className="size-8 md:size-10 rounded-lg bg-black/20 text-text-secondary hover:text-white flex items-center justify-center ml-auto border border-white/5 active:scale-95 transition-all"
                        >
                          <Eye className="size-5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
      <style>{`.custom-scrollbar::-webkit-scrollbar { width: 4px; } .custom-scrollbar::-webkit-scrollbar-thumb { background: #3c4253; border-radius: 10px; }`}</style>
    </div>
  );
};

export default DashboardScreen;
