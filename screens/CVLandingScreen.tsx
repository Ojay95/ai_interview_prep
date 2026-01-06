
import React, { useState } from 'react';
import { Screen, User } from '../types';
import { Logo } from '../constants';

interface CVLandingScreenProps {
  user: User | null;
  onNavigate: (screen: Screen) => void;
}

const CVLandingScreen: React.FC<CVLandingScreenProps> = ({ user, onNavigate }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = () => {
    setIsUploading(true);
    setTimeout(() => {
      onNavigate(Screen.CVAnalysis);
    }, 1500);
  };

  const recentUploads = [
    { name: 'Software_Engineer_Resume.pdf', date: 'Uploaded 2 hours ago', size: '2.4 MB', score: 85, color: 'text-green-500' },
    { name: 'Product_Manager_CV_v2.docx', date: 'Uploaded yesterday', size: '1.8 MB', score: 62, color: 'text-orange-500' }
  ];

  return (
    <div className="flex flex-col h-screen bg-[#0d111a] text-white font-display overflow-hidden">
      <header className="flex items-center justify-between px-4 lg:px-10 py-4 border-b border-white/5 bg-[#0d111a]/80 backdrop-blur-md shrink-0">
        <div className="flex items-center gap-3 md:gap-4">
          <Logo className="size-8" />
          <h1 className="text-sm md:text-lg font-bold tracking-tight">AI Mock Interviewer</h1>
        </div>
        <div className="flex items-center gap-2 md:gap-4">
          <button onClick={() => onNavigate(Screen.Dashboard)} className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-[10px] md:text-xs font-bold transition-all">Dashboard</button>
          <div className="size-8 rounded-full border border-white/10 overflow-hidden bg-slate-700">
             <img src={`https://i.pravatar.cc/150?u=${user?.id}`} alt="User" />
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-4 md:px-6 py-10 lg:py-20 custom-scrollbar">
        <div className="max-w-4xl mx-auto text-center space-y-4 mb-10 md:mb-12">
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-black tracking-tight leading-tight">Optimize Your Resume for ATS</h2>
          <p className="text-sm md:text-lg text-text-secondary max-w-2xl mx-auto font-medium leading-relaxed">
            Upload your CV to generate an ATS compatibility score and tailor your mock interview session. We analyze keywords, formatting, and relevance.
          </p>
        </div>

        <div 
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => { e.preventDefault(); setIsDragging(false); handleUpload(); }}
          className={`max-w-4xl mx-auto aspect-square md:aspect-[16/9] rounded-[32px] md:rounded-[40px] border-2 border-dashed transition-all flex flex-col items-center justify-center gap-6 md:gap-8 relative overflow-hidden group ${isDragging ? 'border-primary bg-primary/5 scale-[0.99]' : 'border-white/10 bg-[#151921] hover:bg-[#1a1f29] hover:border-white/20'}`}
        >
           {isUploading && (
             <div className="absolute inset-0 z-20 bg-black/60 backdrop-blur-md flex flex-col items-center justify-center gap-4">
                <span className="material-symbols-outlined text-4xl text-primary animate-spin">sync</span>
                <p className="text-sm font-black uppercase tracking-widest text-white">Analyzing Resume...</p>
             </div>
           )}
           
           <div className={`size-12 md:size-16 rounded-2xl md:rounded-3xl bg-primary flex items-center justify-center text-white shadow-2xl shadow-primary/20 transition-transform ${isDragging ? 'scale-110' : 'group-hover:translate-y-[-4px]'}`}>
              <span className="material-symbols-outlined text-2xl md:text-3xl">cloud_upload</span>
           </div>
           
           <div className="text-center space-y-2 px-6">
              <h3 className="text-lg md:text-xl lg:text-2xl font-black leading-tight">Drag and drop your resume here</h3>
              <p className="text-xs md:text-sm text-text-secondary font-medium">Supported formats: PDF, DOCX (Max 5MB)</p>
           </div>

           <div className="flex items-center gap-4 md:gap-6 w-full max-w-[280px] md:max-w-md">
              <div className="h-px flex-1 bg-white/5"></div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary opacity-40">OR</span>
              <div className="h-px flex-1 bg-white/5"></div>
           </div>

           <button onClick={handleUpload} className="px-8 md:px-10 py-3 md:py-4 rounded-xl md:rounded-2xl bg-primary hover:bg-primary-hover text-white font-bold text-xs md:text-sm shadow-xl shadow-primary/30 transition-all active:scale-95">
              Browse files
           </button>
        </div>

        <div className="max-w-4xl mx-auto mt-12 md:mt-16 space-y-6">
           <div className="flex items-center gap-3 text-text-secondary justify-center text-[10px] md:text-xs font-medium text-center px-4">
              <span className="material-symbols-outlined text-base">lock</span>
              Your data is private and secure. We do not store your resume after analysis.
           </div>

           <div className="pt-10 space-y-6 md:space-y-8">
              <div className="flex items-center justify-between">
                 <h3 className="text-lg md:text-xl font-black">Recent Uploads</h3>
                 <button className="text-primary text-xs font-bold hover:underline">View all</button>
              </div>

              <div className="space-y-3 md:space-y-4">
                 {recentUploads.map((file, i) => (
                   <div key={i} className="bg-[#1c212b] rounded-2xl md:rounded-3xl p-4 md:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 md:gap-6 border border-white/5 hover:border-white/10 transition-all group">
                      <div className="flex items-center gap-4 flex-1 w-full">
                        <div className="size-10 md:size-12 rounded-xl md:rounded-2xl bg-black/20 text-text-secondary flex items-center justify-center group-hover:bg-primary/10 group-hover:text-primary transition-all shrink-0">
                           <span className="material-symbols-outlined text-xl md:text-2xl">description</span>
                        </div>
                        <div className="flex-1 min-w-0">
                           <h4 className="font-bold text-white text-sm md:text-base truncate mb-0.5">{file.name}</h4>
                           <p className="text-[10px] md:text-xs text-text-secondary font-medium">{file.date} • {file.size}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between w-full sm:w-auto gap-4">
                        <div className={`px-3 py-1.5 rounded-full bg-white/5 border border-white/5 flex items-center gap-2 ${file.color} shrink-0`}>
                           <span className="material-symbols-outlined text-[14px]">check_circle</span>
                           <span className="text-[9px] font-black uppercase tracking-widest">Score: {file.score}</span>
                        </div>
                        <button className="size-8 md:size-10 rounded-lg hover:bg-white/5 flex items-center justify-center transition-all">
                          <span className="material-symbols-outlined text-text-secondary">more_vert</span>
                        </button>
                      </div>
                   </div>
                 ))}
              </div>
           </div>
        </div>
      </main>
    </div>
  );
};

export default CVLandingScreen;
