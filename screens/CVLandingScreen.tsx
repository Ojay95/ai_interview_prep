import React, { useState } from 'react';
import { User, Screen } from '../types';
import { Logo } from '../constants';
import { useCVStore } from '../store/useCVStore';

interface CVLandingScreenProps {
  user: User | null;
  onNavigate: (screen: Screen) => void;
}

const CVLandingScreen: React.FC<CVLandingScreenProps> = ({ user, onNavigate }) => {
  const [isDragging, setIsDragging] = useState(false);
  const setResumeFile = useCVStore((state) => state.setResumeFile);

  const processFile = (file: File) => {
    // 1. Save the actual File object to Zustand state (not localStorage)
    setResumeFile(file);

    // 2. Instantly go to Analysis screen
    onNavigate(Screen.CVAnalysis);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files?.[0]) processFile(e.dataTransfer.files[0]);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) processFile(e.target.files[0]);
  };

  return (
      <div className="flex flex-col h-screen bg-[#0d111a] text-white font-display">
        <nav className="flex items-center px-8 py-6 border-b border-white/5">
          <div onClick={() => onNavigate(Screen.Dashboard)} className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity">
            <Logo />
            <span className="text-xl font-bold tracking-tight">MockInterview.ai</span>
          </div>
        </nav>

        <main className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="max-w-2xl w-full space-y-8">
            <div>
              <h1 className="text-4xl font-black mb-4">Upload your Resume</h1>
              <p className="text-gray-400">We'll analyze it against your target job description.</p>
            </div>

            <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                className={`
              relative border-2 border-dashed rounded-3xl p-12 transition-all duration-300
              flex flex-col items-center justify-center gap-6 group cursor-pointer
              ${isDragging ? 'border-primary bg-primary/5 scale-[1.02]' : 'border-white/10 hover:border-white/20 bg-white/5'}
            `}
                onClick={() => document.getElementById('resume-upload')?.click()}
            >
              <div className="size-20 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <span className="material-symbols-outlined text-4xl text-gray-400 group-hover:text-primary">upload_file</span>
              </div>
              <div>
                <p className="text-xl font-bold mb-2">Drag & Drop your Resume</p>
                <p className="text-sm text-gray-500">Supports PDF, TXT, MD</p>
              </div>
              <input
                  type="file"
                  id="resume-upload"
                  className="hidden"
                  accept=".pdf,.txt,.md"
                  onChange={handleFileInput}
              />
              <button className="px-8 py-3 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-colors">
                Browse Files
              </button>
            </div>
          </div>
        </main>
      </div>
  );
};

export default CVLandingScreen;