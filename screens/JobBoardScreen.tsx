import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Briefcase, 
  Search, 
  MapPin, 
  DollarSign, 
  Clock, 
  ExternalLink, 
  Sparkles, 
  ChevronRight,
  Filter,
  ArrowLeft,
  Building2,
  Globe,
  Zap
} from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { Screen, Job } from '../types';
import { jobService } from '../services/jobService';
import { extractRoleFromResume } from '../services/geminiService';

interface JobBoardScreenProps {
  onNavigate: (screen: Screen) => void;
}

export const JobBoardScreen: React.FC<JobBoardScreenProps> = ({ onNavigate }) => {
  const { user } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [locationQuery, setLocationQuery] = useState(user?.location || '');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalJobs, setTotalJobs] = useState(0);
  const [derivedRole, setDerivedRole] = useState<string | null>(null);

  useEffect(() => {
    const fetchInitialJobs = async () => {
      setIsSearching(true);
      
      let roleToUse = user?.targetRole || searchQuery || 'Software Engineer';
      
      // Try to derive role from resume if user hasn't set a target role
      if (!user?.targetRole && !searchQuery) {
        const resumeText = localStorage.getItem('pending_resume_text');
        if (resumeText) {
          const extracted = await extractRoleFromResume(resumeText);
          roleToUse = extracted;
          setDerivedRole(extracted);
          setSearchQuery(extracted);
        }
      }

      const { jobs: initialJobs, totalCount } = await jobService.getJobSuggestions(
        roleToUse,
        locationQuery || user?.location || 'Remote',
        currentPage
      );
      setJobs(initialJobs);
      setTotalJobs(totalCount);
      setIsSearching(false);
    };
    fetchInitialJobs();
  }, [user?.targetRole, currentPage]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearch = async (page: number = 1) => {
    setIsSearching(true);
    setCurrentPage(page);
    const { jobs: results, totalCount } = await jobService.searchJobs(
      searchQuery || user?.targetRole || 'Software Engineer',
      locationQuery,
      page
    );
    setJobs(results);
    setTotalJobs(totalCount);
    setIsSearching(false);
  };

  return (
    <div className="min-h-screen bg-[#0f111a] text-white font-display">
      {/* Header */}
      <header className="bg-[#0f111a] border-b border-white/5 sticky top-0 z-30 backdrop-blur-md bg-opacity-80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => onNavigate(Screen.Dashboard)}
              className="p-2 hover:bg-white/5 rounded-xl transition-colors text-slate-400 hover:text-white"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3">
              <div className="bg-primary p-2 rounded-lg text-white">
                <Briefcase className="w-5 h-5" />
              </div>
              <h1 className="text-xl font-black tracking-tight text-white">
                AI Job Board
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full border border-primary/20">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-xs font-black uppercase tracking-widest text-primary">AI Suggestions</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Sidebar Filters */}
          <div className="lg:col-span-3">
            <div className="lg:sticky lg:top-24 space-y-6">
              <div className="bg-[#1c212b] rounded-2xl lg:rounded-[32px] border border-white/5 p-6 lg:p-8 shadow-2xl">
                <h3 className="font-bold text-white mb-6 flex items-center gap-2 uppercase text-[10px] tracking-[0.2em] opacity-60">
                  <Filter className="w-3 h-3 lg:w-4 lg:h-4" />
                  Filters
                </h3>
                
                <div className="space-y-8">
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4 block">
                      Job Type
                    </label>
                    <div className="space-y-3">
                      {['Full-time', 'Part-time', 'Contract', 'Remote'].map(type => (
                        <label key={type} className="flex items-center gap-3 cursor-pointer group">
                          <input type="checkbox" className="size-4 rounded border-white/10 bg-white/5 text-primary focus:ring-primary focus:ring-offset-0" />
                          <span className="text-sm text-slate-400 group-hover:text-white transition-colors font-medium">{type}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="pt-6 border-t border-white/5">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4 block">
                      Salary Range
                    </label>
                    <select className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:ring-2 focus:ring-primary outline-none transition-all">
                      <option className="bg-[#1c212b]">Any Salary</option>
                      <option className="bg-[#1c212b]">$50k - $80k</option>
                      <option className="bg-[#1c212b]">$80k - $120k</option>
                      <option className="bg-[#1c212b]">$120k - $160k</option>
                      <option className="bg-[#1c212b]">$160k+</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-primary to-indigo-600 rounded-[32px] p-8 text-white shadow-2xl shadow-primary/20 relative overflow-hidden group">
                <div className="absolute -right-4 -top-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
                  <Zap className="w-32 h-32" />
                </div>
                <Zap className="w-10 h-10 mb-6 text-white/40" />
                <h4 className="font-black text-xl mb-3 leading-tight">Get Notified</h4>
                <p className="text-white/70 text-sm mb-6 font-medium leading-relaxed">
                  We'll alert you as soon as a job matching your profile is found.
                </p>
                <button className="w-full bg-white text-primary font-black py-4 rounded-2xl text-xs uppercase tracking-widest hover:bg-opacity-90 transition-all active:scale-95 shadow-lg">
                  Enable Alerts
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-9 space-y-8">
            {/* Search Bar */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 lg:gap-4">
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                    <Search className="w-4 h-4 lg:w-5 lg:h-5 text-slate-500 group-focus-within:text-primary transition-colors" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search jobs..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-[#1c212b] border border-white/10 rounded-2xl lg:rounded-3xl pl-12 pr-6 py-4 lg:py-5 text-sm lg:text-base text-white placeholder-slate-500 focus:ring-2 focus:ring-primary focus:border-transparent outline-none shadow-2xl transition-all font-medium"
                  />
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                    <MapPin className="w-4 h-4 lg:w-5 lg:h-5 text-slate-500 group-focus-within:text-primary transition-colors" />
                  </div>
                  <input
                    type="text"
                    placeholder="Location..."
                    value={locationQuery}
                    onChange={(e) => setLocationQuery(e.target.value)}
                    className="w-full bg-[#1c212b] border border-white/10 rounded-2xl lg:rounded-3xl pl-12 pr-6 py-4 lg:py-5 text-sm lg:text-base text-white placeholder-slate-500 focus:ring-2 focus:ring-primary focus:border-transparent outline-none shadow-2xl transition-all font-medium"
                  />
                </div>
              </div>
              <button 
                onClick={() => handleSearch(1)}
                disabled={isSearching}
                className="w-full py-4 lg:py-5 bg-primary text-white rounded-2xl lg:rounded-3xl font-black text-[10px] lg:text-xs uppercase tracking-widest hover:bg-primary-hover transition-all disabled:opacity-50 flex items-center justify-center gap-2 active:scale-95 shadow-lg shadow-primary/20"
              >
                {isSearching ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    Find Jobs
                  </>
                )}
              </button>
            </div>

            {/* Job List */}
            <div className="space-y-6">
              <div className="flex items-center justify-between px-2">
                <h2 className="text-xl font-black tracking-tight text-white">
                  {searchQuery ? `Results for "${searchQuery}"` : derivedRole ? `Recommended for ${derivedRole}` : 'Recommended for you'}
                </h2>
                <div className="flex flex-col items-end gap-1">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                    Showing {Math.min((currentPage - 1) * 10 + 1, totalJobs)} - {Math.min(currentPage * 10, totalJobs)} of {totalJobs} jobs
                  </span>
                  {totalJobs > 0 && (
                    <div className="text-[8px] font-black uppercase tracking-[0.2em] text-primary/60">
                      Page {currentPage} of {Math.ceil(totalJobs / 10) || 1}
                    </div>
                  )}
                </div>
              </div>

              {jobs.map((job) => (
                <motion.div
                  key={job.id}
                  layoutId={job.id}
                  onClick={() => setSelectedJob(job)}
                  className="bg-[#1c212b] border border-white/5 rounded-2xl lg:rounded-[32px] p-5 lg:p-8 hover:border-primary/30 hover:bg-white/[0.02] transition-all cursor-pointer group relative overflow-hidden shadow-xl"
                >
                  {job.matchScore && (
                    <div className="absolute top-0 right-0 bg-primary text-white px-4 lg:px-6 py-1.5 lg:py-2 rounded-bl-xl lg:rounded-bl-2xl text-[8px] lg:text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg">
                      <Sparkles className="w-2 h-2 lg:w-3 lg:h-3" />
                      {job.matchScore}% Match
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 lg:gap-6">
                    <div className="flex gap-4 lg:gap-6">
                      <div className="w-12 h-12 lg:w-16 lg:h-16 bg-white/5 rounded-xl lg:rounded-2xl flex items-center justify-center flex-shrink-0 border border-white/5 group-hover:scale-105 transition-transform duration-300">
                        <Building2 className="w-6 h-6 lg:w-8 lg:h-8 text-slate-500" />
                      </div>
                      <div>
                        <h3 className="text-lg lg:text-xl font-black text-white group-hover:text-primary transition-colors leading-tight mb-2">
                          {job.title}
                        </h3>
                        <div className="flex flex-wrap items-center gap-3 lg:gap-4 text-xs lg:text-sm text-slate-400 font-medium">
                          <span className="flex items-center gap-1.5">
                            <Building2 className="w-3 h-3 lg:w-4 lg:h-4 opacity-50" />
                            {job.company}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <MapPin className="w-3 h-3 lg:w-4 lg:h-4 opacity-50" />
                            {job.location}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 sm:self-start">
                      <span className="px-3 lg:px-4 py-1 lg:py-1.5 bg-white/5 text-slate-400 rounded-full text-[8px] lg:text-[10px] font-black uppercase tracking-widest border border-white/5">
                        {job.type}
                      </span>
                      {job.salary && (
                        <span className="px-3 lg:px-4 py-1 lg:py-1.5 bg-green-500/10 text-green-500 rounded-full text-[8px] lg:text-[10px] font-black uppercase tracking-widest border border-green-500/20 flex items-center gap-1.5">
                          <DollarSign className="w-2.5 h-2.5 lg:w-3 lg:h-3" />
                          {job.salary}
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="mt-4 lg:mt-6 text-slate-400 text-xs lg:text-sm leading-relaxed font-medium line-clamp-2">
                    {job.description}
                  </p>

                  <div className="mt-6 lg:mt-8 pt-6 lg:pt-8 border-t border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex flex-wrap items-center gap-4 lg:gap-6 text-[8px] lg:text-[10px] font-black uppercase tracking-widest text-slate-500 text-left">
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-2.5 h-2.5 lg:w-3 lg:h-3" />
                        {job.postedDate}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Globe className="w-2.5 h-2.5 lg:w-3 lg:h-3" />
                        via {job.source}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-primary font-black text-[8px] lg:text-[10px] uppercase tracking-[0.2em] group-hover:translate-x-1 transition-transform self-end sm:self-auto">
                      View Details
                      <ChevronRight className="w-3 h-3 lg:w-4 lg:h-4" />
                    </div>
                  </div>
                </motion.div>
              ))}

              {/* Pagination Controls */}
              {(totalJobs > 10 || currentPage > 1) && (
                <div className="mt-12 flex items-center justify-center gap-4 pb-12">
                  <button
                    onClick={() => {
                      const newPage = currentPage - 1;
                      handleSearch(newPage);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    disabled={currentPage === 1 || isSearching}
                    className="px-6 py-3 bg-[#1c212b] border border-white/10 rounded-2xl text-xs font-black uppercase tracking-widest text-slate-400 hover:text-white hover:border-primary/50 transition-all disabled:opacity-30 disabled:cursor-not-allowed group flex items-center gap-2"
                  >
                    <ChevronRight className="w-4 h-4 rotate-180" />
                    Previous
                  </button>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Page</span>
                    <span className="w-10 h-10 flex items-center justify-center bg-primary text-white border border-primary/20 rounded-xl font-black text-sm shadow-lg shadow-primary/20">
                      {currentPage}
                    </span>
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">of {Math.ceil(totalJobs / 10) || 1}</span>
                  </div>
                  <button
                    onClick={() => {
                      const newPage = currentPage + 1;
                      handleSearch(newPage);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    disabled={currentPage >= Math.ceil(totalJobs / 10) || isSearching}
                    className="px-6 py-3 bg-[#1c212b] border border-white/10 rounded-2xl text-xs font-black uppercase tracking-widest text-slate-400 hover:text-white hover:border-primary/50 transition-all disabled:opacity-30 disabled:cursor-not-allowed group flex items-center gap-2"
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Job Details Modal */}
      <AnimatePresence>
        {selectedJob && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedJob(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div
              layoutId={selectedJob.id}
              className="relative w-full max-w-3xl bg-[#1c212b] rounded-3xl lg:rounded-[40px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-white/10"
            >
              <div className="p-6 sm:p-8 lg:p-10 overflow-y-auto custom-scrollbar">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-6 mb-8 lg:mb-10">
                  <div className="flex gap-4 lg:gap-6">
                    <div className="w-16 h-16 lg:w-20 lg:h-20 bg-white/5 rounded-2xl lg:rounded-3xl flex items-center justify-center flex-shrink-0 border border-white/5">
                      <Building2 className="w-8 h-8 lg:w-10 lg:h-10 text-slate-500" />
                    </div>
                    <div>
                      <h2 className="text-xl lg:text-3xl font-black text-white leading-tight mb-2">{selectedJob.title}</h2>
                      <p className="text-base lg:text-xl text-slate-400 font-bold">{selectedJob.company}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setSelectedJob(null)}
                    className="absolute top-4 right-4 sm:relative sm:top-0 sm:right-0 p-2 sm:p-3 hover:bg-white/5 rounded-full transition-colors text-slate-500 hover:text-white"
                  >
                    <ArrowLeft className="w-5 h-5 lg:w-6 lg:h-6 rotate-90" />
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 lg:gap-4 mb-8 lg:mb-10 text-left">
                  {[
                    { label: 'Location', val: selectedJob.location, icon: <MapPin className="w-3 h-3" /> },
                    { label: 'Salary', val: selectedJob.salary || 'N/A', icon: <DollarSign className="w-3 h-3" /> },
                    { label: 'Job Type', val: selectedJob.type, icon: <Briefcase className="w-3 h-3" /> },
                    { label: 'Posted', val: selectedJob.postedDate, icon: <Clock className="w-3 h-3" /> }
                  ].map((item, i) => (
                    <div key={i} className="p-3 lg:p-5 bg-white/5 rounded-2xl lg:rounded-3xl border border-white/5 min-h-[80px] flex flex-col justify-center">
                      <p className="text-[8px] lg:text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1 lg:mb-2 flex items-center gap-1.5 lg:gap-2">
                        {item.icon}
                        {item.label}
                      </p>
                      <p className="text-[10px] lg:text-sm font-bold text-white line-clamp-1">{item.val}</p>
                    </div>
                  ))}
                </div>

                {selectedJob.aiReasoning && (
                  <div className="mb-8 lg:mb-10 p-6 lg:p-8 bg-primary/10 rounded-2xl lg:rounded-[32px] border border-primary/20 relative overflow-hidden">
                    <div className="absolute -right-4 -top-4 opacity-5">
                      <Sparkles className="w-20 h-20 lg:w-24 lg:h-24 text-primary" />
                    </div>
                    <h4 className="text-primary font-black flex items-center gap-2 mb-3 lg:mb-4 text-[10px] uppercase tracking-[0.2em]">
                      <Sparkles className="w-3 h-3 lg:w-4 lg:h-4" />
                      AI Insights
                    </h4>
                    <p className="text-white/90 text-xs lg:text-sm leading-relaxed font-medium">
                      {selectedJob.aiReasoning}
                    </p>
                  </div>
                )}

                <div className="space-y-8 lg:space-y-10">
                  <div className="text-left">
                    <h4 className="text-sm font-black text-white mb-3 lg:mb-4 uppercase tracking-widest text-[8px] lg:text-xs opacity-60">Job Description</h4>
                    <div className="text-slate-400 text-xs lg:text-sm leading-relaxed font-medium whitespace-pre-wrap">
                      {selectedJob.description}
                    </div>
                  </div>

                  <div className="text-left">
                    <h4 className="text-sm font-black text-white mb-3 lg:mb-4 uppercase tracking-widest text-[8px] lg:text-xs opacity-60">Requirements</h4>
                    <ul className="space-y-3 lg:space-y-4">
                      {selectedJob.requirements.map((req, i) => (
                        <li key={i} className="flex items-start gap-3 lg:gap-4 text-xs lg:text-sm text-slate-400 font-medium">
                          <div className="w-1.5 h-1.5 lg:w-2 lg:h-2 rounded-full bg-primary mt-1.5 lg:mt-2 flex-shrink-0 shadow-lg shadow-primary/50" />
                          {req}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              <div className="p-6 lg:p-10 bg-white/5 border-t border-white/10 flex flex-col sm:flex-row items-center gap-4 lg:gap-6">
                <a 
                  href={selectedJob.externalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:flex-1 bg-primary text-white font-black py-4 lg:py-5 rounded-xl lg:rounded-2xl text-center hover:bg-primary-hover transition-all flex items-center justify-center gap-2 lg:gap-3 shadow-2xl shadow-primary/30 text-[10px] lg:text-xs uppercase tracking-widest active:scale-[0.98]"
                >
                  Apply on {selectedJob.source}
                  <ExternalLink className="w-4 h-4 lg:w-5 lg:h-5" />
                </a>
                <button className="w-full sm:w-auto px-8 py-4 lg:py-5 bg-[#0f111a] border border-white/10 text-white font-black rounded-xl lg:rounded-2xl hover:bg-white/5 transition-all text-[10px] lg:text-xs uppercase tracking-widest active:scale-[0.98]">
                  Save Job
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <style>{`.custom-scrollbar::-webkit-scrollbar { width: 4px; } .custom-scrollbar::-webkit-scrollbar-thumb { background: #3c4253; border-radius: 10px; }`}</style>
    </div>
  );
};
