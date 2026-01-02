
import React, { useEffect, useState } from 'react';
import { Screen, User } from '../types';

interface DashboardScreenProps {
  user: User | null;
  onNavigate: (screen: Screen) => void;
  onLogout: () => void;
}

const DashboardScreen: React.FC<DashboardScreenProps> = ({ user, onNavigate, onLogout }) => {
  const [interviewsLeft, setInterviewsLeft] = useState(0);
  const maxInterviews = user?.plan === 'pro' ? 5 : 1;

  useEffect(() => {
    const usage = JSON.parse(localStorage.getItem(`usage_${user?.id}`) || '{"count": 0, "date": ""}');
    const today = new Date().toDateString();
    
    if (usage.date === today) {
      setInterviewsLeft(Math.max(0, maxInterviews - usage.count));
    } else {
      setInterviewsLeft(maxInterviews);
    }
  }, [user, maxInterviews]);

  const handleStartInterview = (targetScreen: Screen) => {
    if (interviewsLeft <= 0) {
      onNavigate(Screen.Subscription);
    } else {
      onNavigate(targetScreen);
    }
  };

  const recentSessions = [
    { role: 'Senior Frontend Engineer', type: 'Technical Round', date: 'Oct 24, 2023', score: 85, color: 'text-green-500' },
    { role: 'Product Manager', type: 'Product Sense', date: 'Oct 20, 2023', score: 62, color: 'text-orange-500' }
  ];

  return (
    <div className="flex h-screen w-full bg-[#0d1117] text-white overflow-hidden font-display">
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/5 flex flex-col shrink-0 bg-[#0d1117]">
        <div className="p-6 space-y-1">
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-primary/20 p-2 rounded-lg text-primary">
              <span className="material-symbols-outlined">psychology</span>
            </div>
            <div>
              <h1 className="font-bold text-sm tracking-tight">AI Interviewer</h1>
              <p className="text-[10px] text-text-secondary uppercase tracking-widest font-black">
                {user?.plan === 'pro' ? 'Pro Plan' : 'Free Plan'}
              </p>
            </div>
          </div>

          <nav className="space-y-1">
            <button 
              onClick={() => onNavigate(Screen.Dashboard)}
              className="flex items-center w-full gap-3 px-3 py-2.5 rounded-xl bg-primary text-white text-sm font-bold shadow-lg shadow-primary/20"
            >
              <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>grid_view</span>
              Dashboard
            </button>
            <button className="flex items-center w-full gap-3 px-3 py-2.5 rounded-xl text-text-secondary hover:bg-white/5 transition-all text-sm font-medium">
              <span className="material-symbols-outlined text-[20px]">history</span>
              History
            </button>
            <button className="flex items-center w-full gap-3 px-3 py-2.5 rounded-xl text-text-secondary hover:bg-white/5 transition-all text-sm font-medium">
              <span className="material-symbols-outlined text-[20px]">analytics</span>
              Analytics
            </button>
            <button 
              onClick={() => onNavigate(Screen.Settings)}
              className="flex items-center w-full gap-3 px-3 py-2.5 rounded-xl text-text-secondary hover:bg-white/5 transition-all text-sm font-medium"
            >
              <span className="material-symbols-outlined text-[20px]">settings</span>
              Settings
            </button>
          </nav>
        </div>

        <div className="mt-auto p-4 border-t border-white/5">
          {user?.plan === 'free' && (
            <button 
              onClick={() => onNavigate(Screen.Subscription)}
              className="w-full mb-4 py-3 rounded-xl bg-gradient-to-r from-primary to-indigo-600 text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all"
            >
              Upgrade to Pro
            </button>
          )}
          <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 cursor-pointer transition-colors" onClick={onLogout}>
            <div className="size-10 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold shrink-0 border border-white/10 uppercase">
              {user?.name?.slice(0, 2)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold truncate">{user?.name || 'User'}</p>
              <p className="text-[10px] text-text-secondary truncate">{user?.email}</p>
            </div>
            <span className="material-symbols-outlined text-text-secondary text-[20px] hover:text-white transition-colors">logout</span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-8 lg:p-12 custom-scrollbar">
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-12">
          <div>
            <h2 className="text-4xl font-black tracking-tight mb-3">Ready to ace it, {user?.name}?</h2>
            <div className="flex items-center gap-2 text-text-secondary">
              <span className="material-symbols-outlined text-orange-500 text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>local_fire_department</span>
              <p className="text-sm">
                {interviewsLeft} / {maxInterviews} interviews left today • <span className="text-white font-bold">3-day streak!</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => handleStartInterview(Screen.JDSetup)}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white text-sm font-bold transition-all shadow-xl"
            >
              <span className="material-symbols-outlined text-[20px]">description</span>
              Job Description setup
            </button>
            <button 
              onClick={() => handleStartInterview(Screen.Onboarding)}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary hover:bg-primary-hover text-white text-sm font-bold transition-all shadow-xl shadow-primary/20"
            >
              <span className="material-symbols-outlined text-[20px]">mic</span>
              Start New Interview
            </button>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          <div className="bg-[#161b22] p-6 rounded-2xl border border-white/5 shadow-xl relative overflow-hidden group">
            <div className="size-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center mb-6">
              <span className="material-symbols-outlined">analytics</span>
            </div>
            <div className="absolute top-6 right-6 px-2 py-0.5 rounded-lg bg-green-500/10 text-green-500 text-[10px] font-black uppercase">
              +2 this week
            </div>
            <p className="text-text-secondary text-[11px] font-bold uppercase tracking-widest mb-1">Total Interviews</p>
            <p className="text-3xl font-black">12</p>
          </div>

          <div className="bg-[#161b22] p-6 rounded-2xl border border-white/5 shadow-xl relative overflow-hidden group">
            <div className="size-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center mb-6">
              <span className="material-symbols-outlined">trending_up</span>
            </div>
            <div className="absolute top-6 right-6 text-text-secondary text-[10px] font-bold">
              Top 20%
            </div>
            <p className="text-text-secondary text-[11px] font-bold uppercase tracking-widest mb-1">Average Score</p>
            <p className="text-3xl font-black">78<span className="text-sm font-normal text-text-secondary ml-1">/100</span></p>
          </div>

          <div className="bg-[#161b22] p-6 rounded-2xl border border-white/5 shadow-xl relative overflow-hidden group">
            <div className="size-10 rounded-xl bg-teal-500/10 text-teal-500 flex items-center justify-center mb-6">
              <span className="material-symbols-outlined">thumb_up</span>
            </div>
            <div className="absolute top-6 right-6 text-teal-500 text-[10px] font-bold uppercase">
              Consistent
            </div>
            <p className="text-text-secondary text-[11px] font-bold uppercase tracking-widest mb-1">Strongest Skill</p>
            <p className="text-xl font-black">System Design</p>
          </div>

          <div className="bg-[#161b22] p-6 rounded-2xl border border-white/5 shadow-xl relative overflow-hidden group">
            <div className="size-10 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center mb-6">
              <span className="material-symbols-outlined">target</span>
            </div>
            <div className="absolute top-6 right-6 text-orange-500 text-[10px] font-bold uppercase">
              Needs Focus
            </div>
            <p className="text-text-secondary text-[11px] font-bold uppercase tracking-widest mb-1">Area for Improvement</p>
            <p className="text-xl font-black">Behavioral Qs</p>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          {/* Recent Sessions Table */}
          <div className="xl:col-span-8 bg-[#161b22] rounded-[32px] border border-white/5 shadow-2xl p-8 overflow-hidden">
            <h3 className="text-xl font-bold mb-8">Recent Sessions</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/5 text-[10px] font-black uppercase tracking-widest text-text-secondary">
                    <th className="pb-4">Role & Type</th>
                    <th className="pb-4">Date</th>
                    <th className="pb-4">Score</th>
                    <th className="pb-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {recentSessions.map((session, i) => (
                    <tr key={i} className="group hover:bg-white/5 transition-colors">
                      <td className="py-5">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-white leading-tight">{session.role}</span>
                          <span className="text-xs text-text-secondary mt-1">{session.type}</span>
                        </div>
                      </td>
                      <td className="py-5 text-sm text-text-secondary font-medium">
                        {session.date}
                      </td>
                      <td className="py-5">
                        <span className={`text-sm font-black ${session.color}`}>{session.score}/100</span>
                      </td>
                      <td className="py-5 text-right">
                        <button className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-text-secondary hover:text-white transition-all">
                          <span className="material-symbols-outlined text-[20px]">visibility</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pro Tip Card */}
          <div className="xl:col-span-4 bg-primary rounded-[32px] p-10 flex flex-col justify-between shadow-2xl shadow-primary/20 relative overflow-hidden">
             <div className="absolute top-0 right-0 size-48 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
             <div className="relative z-10">
               <div className="size-12 bg-white/20 rounded-2xl flex items-center justify-center text-white mb-10 border border-white/20">
                  <span className="material-symbols-outlined text-2xl">tips_and_updates</span>
               </div>
               <h3 className="text-3xl font-black text-white mb-6">Pro Tip</h3>
               <p className="text-white/80 text-lg leading-relaxed font-medium">
                Focus on structuring your answers using the <span className="text-white font-black underline decoration-white/30 underline-offset-4">STAR method</span>. 
                Your last behavioral interview showed gaps in the 'Result' section.
               </p>
             </div>
             <div className="mt-12 flex justify-end">
                <span className="material-symbols-outlined text-white/20 text-8xl">lightbulb</span>
             </div>
          </div>
        </div>
      </main>
      <style>{`.custom-scrollbar::-webkit-scrollbar { width: 4px; } .custom-scrollbar::-webkit-scrollbar-thumb { background: #3c4253; border-radius: 10px; }`}</style>
    </div>
  );
};

export default DashboardScreen;
