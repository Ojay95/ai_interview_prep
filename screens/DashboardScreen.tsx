
import React, { useEffect, useState } from 'react';
import { Screen, User } from '../types';

interface DashboardScreenProps {
  user: User | null;
  onNavigate: (screen: Screen) => void;
  onLogout: () => void;
}

const DashboardScreen: React.FC<DashboardScreenProps> = ({ user, onNavigate, onLogout }) => {
  const [interviewsLeft, setInterviewsLeft] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const maxInterviews = user?.plan === 'elite' ? 100 : user?.plan === 'pro' ? 40 : 3;
  const isFree = user?.plan === 'free';

  useEffect(() => {
    // For demo purposes, we still allow local tracking, but in prod this would come from API
    try {
        const usage = JSON.parse(localStorage.getItem(`usage_${user?.id}`) || '{"count": 0, "date": ""}');
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setInterviewsLeft(Math.max(0, maxInterviews - usage.count));
    } catch {
        setInterviewsLeft(3);
    }
  }, [user, maxInterviews]);

  const handleStartInterview = (targetScreen: Screen) => {
    if (interviewsLeft <= 0) {
      onNavigate(Screen.Subscription);
    } else {
      onNavigate(targetScreen);
    }
    setIsSidebarOpen(false);
  };

  const recentSessions = [
    { 
      role: 'Senior Frontend Engineer', 
      type: 'Technical Round', 
      date: 'Oct 24, 2023', 
      duration: '45 mins',
      score: 8.5, 
      scoreMax: 10,
      color: 'bg-green-500',
      icon: 'code'
    },
    { 
      role: 'Product Manager', 
      type: 'Product Sense', 
      date: 'Oct 20, 2023', 
      duration: '30 mins',
      score: 6.2, 
      scoreMax: 10,
      color: 'bg-yellow-500',
      icon: 'apps'
    }
  ];

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
                <span className="material-symbols-outlined text-xl">psychology</span>
              </div>
              <div>
                <h1 className="font-bold text-sm tracking-tight leading-none">AI Interviewer</h1>
                <p className="text-xs text-text-secondary mt-1 font-black uppercase">
                  {user?.plan || 'free'} Tier
                </p>
              </div>
            </div>
            <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-text-secondary">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          <nav className="space-y-1">
            <button 
              onClick={() => { onNavigate(Screen.Dashboard); setIsSidebarOpen(false); }}
              className="flex items-center w-full gap-3 px-4 py-3 rounded-xl bg-primary text-white text-sm font-bold shadow-lg shadow-primary/20"
            >
              <span className="material-symbols-outlined text-[20px]">grid_view</span>
              Dashboard
            </button>
            <button 
              onClick={() => { onNavigate(Screen.CVLanding); setIsSidebarOpen(false); }}
              className="flex items-center w-full gap-3 px-4 py-3 rounded-xl text-text-secondary hover:bg-white/5 transition-all text-sm font-medium"
            >
              <span className="material-symbols-outlined text-[20px]">description</span>
              CV Analysis
            </button>
            <button className="flex items-center w-full gap-3 px-4 py-3 rounded-xl text-text-secondary hover:bg-white/5 transition-all text-sm font-medium">
              <span className="material-symbols-outlined text-[20px]">history</span>
              History
            </button>
            <button className="flex items-center w-full gap-3 px-4 py-3 rounded-xl text-text-secondary hover:bg-white/5 transition-all text-sm font-medium">
              <span className="material-symbols-outlined text-[20px]">analytics</span>
              Analytics
            </button>
            <button 
              onClick={() => { onNavigate(Screen.Settings); setIsSidebarOpen(false); }}
              className="flex items-center w-full gap-3 px-4 py-3 rounded-xl text-text-secondary hover:bg-white/5 transition-all text-sm font-medium"
            >
              <span className="material-symbols-outlined text-[20px]">settings</span>
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
              <span className="material-symbols-outlined text-[20px]">logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 md:p-10 lg:p-14 custom-scrollbar space-y-8 md:space-y-12 relative">
        <div className="lg:hidden flex items-center justify-between mb-4">
          <button onClick={() => setIsSidebarOpen(true)} className="size-10 rounded-xl bg-[#1c212b] border border-white/5 flex items-center justify-center">
            <span className="material-symbols-outlined">menu</span>
          </button>
          <div className="flex items-center gap-2">
            <div className="bg-primary p-1.5 rounded-lg text-white">
              <span className="material-symbols-outlined text-sm">psychology</span>
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
              <span className="material-symbols-outlined text-orange-500 text-lg md:text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>local_fire_department</span>
              <p className="text-sm font-medium">You're on a 3-day streak! Keep going.</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
            <button 
              onClick={() => handleStartInterview(Screen.JDSetup)}
              className="w-full sm:flex-1 lg:flex-none flex items-center justify-center gap-3 px-6 py-4 rounded-2xl bg-[#1c212b] border border-white/10 hover:bg-white/5 text-white text-sm font-bold transition-all active:scale-95"
            >
              <span className="material-symbols-outlined">description</span>
              Job Description
            </button>
            <button 
              onClick={() => handleStartInterview(Screen.Onboarding)}
              className="w-full sm:flex-1 lg:flex-none flex items-center justify-center gap-3 px-6 py-4 rounded-2xl bg-primary hover:bg-primary-hover text-white text-sm font-bold transition-all shadow-xl shadow-primary/30 active:scale-95"
            >
              <span className="material-symbols-outlined">mic</span>
              Start New Interview
            </button>
          </div>
        </header>

        {/* Performance Grid */}
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
           {[
             { label: 'Total Practice', val: '12', inc: '+2 wk', color: 'text-primary', icon: 'assignment_turned_in' },
             { label: 'Avg. Score', val: '78', inc: 'Top 20%', color: 'text-purple-400', icon: 'analytics' },
             { label: 'Strongest', val: 'System Design', inc: 'Stable', color: 'text-green-500', icon: 'thumb_up' },
             { label: 'Improvement', val: 'Behavioral', inc: 'Critical', color: 'text-orange-500', icon: 'track_changes' }
           ].map((stat, i) => (
             <div key={i} className="bg-[#1c212b] p-4 md:p-8 rounded-2xl md:rounded-[32px] border border-white/5 shadow-xl space-y-4 md:space-y-6">
                <div className="flex items-center justify-between">
                   <div className={`size-8 md:size-10 rounded-lg bg-white/5 ${stat.color} flex items-center justify-center`}>
                      <span className="material-symbols-outlined text-lg md:text-xl">{stat.icon}</span>
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
                   <span className="material-symbols-outlined text-sm">trending_up</span>
                   +12%
                </div>
             </div>
             <div className="flex-1 min-h-[200px] md:min-h-[280px] w-full flex flex-col justify-end gap-6 relative z-10 pb-4">
                <svg className="w-full h-full absolute inset-0 overflow-visible" preserveAspectRatio="none">
                   <path d="M0,200 C150,220 300,160 450,180 S750,120 900,100 L1200,90" fill="none" stroke="#194ce6" strokeWidth="3" />
                </svg>
                <div className="mt-auto pt-4 border-t border-white/5 flex justify-between text-[10px] md:text-xs font-bold text-text-secondary uppercase tracking-[0.2em]">
                   <span>May</span><span>Jun</span><span>Jul</span><span>Aug</span><span>Sep</span><span>Oct</span>
                </div>
             </div>
          </div>

          <div className="xl:col-span-4 bg-primary rounded-2xl md:rounded-[40px] p-8 md:p-12 flex flex-col shadow-2xl relative overflow-hidden">
             <div className="relative z-10 flex flex-col h-full">
                <div className="size-10 md:size-12 bg-white/10 rounded-2xl flex items-center justify-center text-white mb-6 md:mb-10">
                   <span className="material-symbols-outlined text-xl">tips_and_updates</span>
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
                {recentSessions.map((session, i) => (
                  <tr key={i} className="group hover:bg-white/5 transition-all">
                    <td className="py-6">
                      <div className="flex items-center gap-4">
                        <div className="size-8 md:size-10 bg-black/20 text-text-secondary rounded-lg flex items-center justify-center shrink-0 border border-white/5">
                           <span className="material-symbols-outlined text-lg">{session.icon}</span>
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
                        <span className="text-sm md:text-base font-black tabular-nums">{session.score}</span>
                        <div className="h-1 w-16 md:w-24 bg-white/5 rounded-full overflow-hidden shrink-0">
                           <div className={`h-full ${session.color} rounded-full`} style={{ width: `${(session.score/session.scoreMax)*100}%` }}></div>
                        </div>
                      </div>
                    </td>
                    <td className="py-6 text-right">
                      <button className="size-8 md:size-10 rounded-lg bg-black/20 text-text-secondary hover:text-white flex items-center justify-center ml-auto border border-white/5">
                        <span className="material-symbols-outlined text-[18px]">visibility</span>
                      </button>
                    </td>
                  </tr>
                ))}
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
