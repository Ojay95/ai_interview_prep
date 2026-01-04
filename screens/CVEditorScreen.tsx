
import React, { useState } from 'react';
import { Screen, User } from '../types';
import { Logo } from '../constants';

interface CVEditorScreenProps {
  user: User | null;
  onNavigate: (screen: Screen) => void;
}

const CVEditorScreen: React.FC<CVEditorScreenProps> = ({ user, onNavigate }) => {
  const [template, setTemplate] = useState('Modern Clean');
  const [bodySize, setBodySize] = useState(10.5);
  const [lineSpacing, setLineSpacing] = useState(1.2);
  const [activeTab, setActiveTab] = useState<'Design' | 'Content'>('Design');

  return (
    <div className="flex flex-col h-screen bg-[#0d111a] text-white font-display overflow-hidden">
      <header className="flex items-center justify-between px-6 lg:px-10 py-3 border-b border-white/5 bg-[#0d111a] shrink-0 z-50">
        <div className="flex items-center gap-6">
           <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary text-2xl">description</span>
              <div>
                 <h2 className="text-sm font-bold leading-none">Senior Product Designer CV</h2>
                 <p className="text-[9px] text-text-secondary mt-1">Last edited 2m ago</p>
              </div>
           </div>
           <nav className="hidden md:flex items-center gap-6 text-[10px] font-black uppercase tracking-widest text-text-secondary/60">
              <button onClick={() => onNavigate(Screen.Dashboard)} className="hover:text-white transition-all">Dashboard</button>
              <span className="opacity-20">/</span>
              <button onClick={() => onNavigate(Screen.CVAnalysis)} className="hover:text-white transition-all">Resumes</button>
              <span className="opacity-20">/</span>
              <button className="text-white">Edit Layout</button>
           </nav>
        </div>
        <div className="flex items-center gap-4">
           <div className="flex items-center gap-1 mr-4">
              <button className="size-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all"><span className="material-symbols-outlined text-lg">undo</span></button>
              <button className="size-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all"><span className="material-symbols-outlined text-lg">redo</span></button>
           </div>
           <button className="px-5 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-black uppercase tracking-widest hover:bg-white/10 transition-all">Save Draft</button>
           <button className="px-5 py-2 rounded-xl bg-primary text-white text-xs font-black uppercase tracking-widest hover:bg-primary-hover shadow-xl shadow-primary/20 transition-all flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">download</span>
              Export PDF
           </button>
           <div className="size-8 rounded-full border border-white/10 overflow-hidden bg-slate-700 ml-2">
             <img src={`https://i.pravatar.cc/150?u=${user?.id}`} alt="User" />
           </div>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden">
         {/* Editor Sidebar */}
         <aside className="w-80 border-r border-white/5 bg-[#11131a] flex flex-col shrink-0">
            <div className="flex border-b border-white/5 shrink-0">
               {['Design', 'Content'].map((tab: any) => (
                 <button 
                  key={tab} 
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${activeTab === tab ? 'text-primary border-b-2 border-primary' : 'text-text-secondary hover:text-white'}`}
                 >
                    <span className="material-symbols-outlined text-sm">{tab === 'Design' ? 'palette' : 'edit_note'}</span>
                    {tab}
                 </button>
               ))}
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-10 custom-scrollbar">
               <div className="space-y-6">
                  <div className="flex items-center justify-between">
                     <h3 className="text-[10px] font-black uppercase tracking-widest text-text-secondary flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm">grid_view</span> Templates
                     </h3>
                     <button className="text-primary text-[9px] font-black uppercase tracking-widest">View All</button>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                     {[
                       { name: 'Modern Clean', img: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&q=80&w=200&h=260', active: true },
                       { name: 'Executive', img: 'https://images.unsplash.com/photo-1626197031507-c17099753214?auto=format&fit=crop&q=80&w=200&h=260' }
                     ].map(t => (
                       <div key={t.name} onClick={() => setTemplate(t.name)} className="space-y-2 cursor-pointer group">
                          <div className={`aspect-[3/4] rounded-xl overflow-hidden border-2 transition-all ${template === t.name ? 'border-primary shadow-lg shadow-primary/20' : 'border-white/5 grayscale group-hover:grayscale-0 group-hover:border-white/20'}`}>
                             <img src={t.img} alt={t.name} className="w-full h-full object-cover" />
                             {template === t.name && <div className="absolute inset-0 bg-primary/20 flex items-center justify-center"><span className="material-symbols-outlined text-white text-3xl">check_circle</span></div>}
                          </div>
                          <p className={`text-[10px] font-bold text-center ${template === t.name ? 'text-white' : 'text-text-secondary'}`}>{t.name}</p>
                       </div>
                     ))}
                  </div>
               </div>

               <div className="space-y-6">
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-text-secondary flex items-center gap-2">
                     <span className="material-symbols-outlined text-sm">font_download</span> Typography
                  </h3>
                  <div className="space-y-4">
                     <div className="space-y-2">
                        <label className="text-[9px] font-bold text-text-secondary uppercase tracking-widest">Font Family</label>
                        <select className="w-full bg-black/20 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-primary transition-all">
                           <option>Inter (Sans Serif)</option>
                           <option>JetBrains Mono</option>
                           <option>Roboto Slab</option>
                        </select>
                     </div>
                     <div className="space-y-3">
                        <div className="flex justify-between items-center text-[9px] font-bold text-text-secondary uppercase tracking-widest">
                           <span>Body Size</span>
                           <span className="text-white">{bodySize}pt</span>
                        </div>
                        <div className="flex items-center gap-3">
                           <span className="text-[10px] text-text-secondary">A</span>
                           <input type="range" min="8" max="14" step="0.5" value={bodySize} onChange={(e) => setBodySize(parseFloat(e.target.value))} className="flex-1 h-1 bg-white/5 rounded-full appearance-none accent-primary" />
                           <span className="text-lg text-text-secondary">A</span>
                        </div>
                     </div>
                     <div className="space-y-3">
                        <div className="flex justify-between items-center text-[9px] font-bold text-text-secondary uppercase tracking-widest">
                           <span>Line Spacing</span>
                           <span className="text-white">{lineSpacing}</span>
                        </div>
                        <input type="range" min="1.0" max="2.0" step="0.1" value={lineSpacing} onChange={(e) => setLineSpacing(parseFloat(e.target.value))} className="w-full h-1 bg-white/5 rounded-full appearance-none accent-primary" />
                     </div>
                  </div>
               </div>

               <div className="space-y-6">
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-text-secondary flex items-center gap-2">
                     <span className="material-symbols-outlined text-sm">space_dashboard</span> Layout
                  </h3>
                  <div className="space-y-4">
                     <div className="space-y-2">
                        <label className="text-[9px] font-bold text-text-secondary uppercase tracking-widest">Structure</label>
                        <div className="grid grid-cols-2 gap-2">
                           <button className="py-2.5 rounded-xl bg-white/5 border border-primary text-white text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2"><span className="material-symbols-outlined text-sm">view_column</span> 2 Cols</button>
                           <button className="py-2.5 rounded-xl bg-white/5 border border-white/10 text-text-secondary text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:text-white transition-all"><span className="material-symbols-outlined text-sm">view_agenda</span> 1 Col</button>
                        </div>
                     </div>
                     <div className="space-y-2">
                        <div className="flex justify-between items-center text-[9px] font-bold text-text-secondary uppercase tracking-widest">
                           <span>Page Margins</span>
                           <span className="text-white">Normal</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                           {[1, 2, 3].map(i => (
                             <button key={i} className={`py-2 rounded-xl bg-white/5 border flex items-center justify-center ${i === 2 ? 'border-primary' : 'border-white/10 opacity-40 hover:opacity-100'}`}>
                                <div className={`h-4 border border-white/40 ${i === 1 ? 'w-2' : i === 2 ? 'w-4' : 'w-6'}`}></div>
                             </button>
                           ))}
                        </div>
                     </div>
                  </div>
               </div>

               <div className="space-y-6">
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-text-secondary flex items-center gap-2">
                     <span className="material-symbols-outlined text-sm">palette</span> Colors
                  </h3>
                  <div className="flex flex-wrap gap-3">
                     {['#0d111a', '#194ce6', '#10b981', '#8b5cf6', '#ef4444'].map((color, i) => (
                       <button key={i} className={`size-8 rounded-full border-2 transition-all ${i === 0 ? 'border-white ring-2 ring-primary ring-offset-2 ring-offset-[#11131a]' : 'border-transparent hover:scale-110'}`} style={{ backgroundColor: color }}></button>
                     ))}
                     <button className="size-8 rounded-full border border-white/10 bg-white/5 flex items-center justify-center hover:bg-white/10"><span className="material-symbols-outlined text-sm">add</span></button>
                  </div>
               </div>
            </div>
         </aside>

         {/* Canvas Area */}
         <section className="flex-1 bg-black/20 overflow-y-auto p-12 custom-scrollbar flex flex-col items-center gap-10">
            <div className="w-full max-w-4xl flex items-center justify-between mb-2">
               <p className="text-[10px] font-black uppercase tracking-[0.3em] text-text-secondary opacity-40">Page 1 of 1</p>
               <div className="flex items-center gap-6 bg-surface-dark px-4 py-2 rounded-xl border border-white/5 shadow-2xl">
                  <div className="flex items-center gap-4 border-r border-white/10 pr-6 mr-2">
                     <button className="size-6 text-text-secondary hover:text-white transition-all"><span className="material-symbols-outlined text-lg">remove</span></button>
                     <span className="text-[10px] font-black w-10 text-center">100%</span>
                     <button className="size-6 text-text-secondary hover:text-white transition-all"><span className="material-symbols-outlined text-lg">add</span></button>
                  </div>
                  <button className="text-text-secondary hover:text-white transition-all"><span className="material-symbols-outlined text-lg">fullscreen</span></button>
               </div>
            </div>

            {/* A4 Resume Mockup */}
            <div className="w-[800px] min-h-[1131px] bg-white text-[#1a1c24] p-16 shadow-[0_40px_100px_rgba(0,0,0,0.5)] relative">
               <div className="flex justify-between items-start mb-16">
                  <div className="space-y-2">
                     <h1 className="text-5xl font-black tracking-tighter uppercase leading-none">Alex Morgan</h1>
                     <p className="text-xl font-medium text-slate-500">Senior Product Designer</p>
                  </div>
                  <div className="text-right text-xs font-medium space-y-1 text-slate-500">
                     <p>alex.morgan@email.com</p>
                     <p>+1 (555) 123-4567</p>
                     <p>San Francisco, CA</p>
                     <p>linkedin.com/in/alexmorgan</p>
                  </div>
               </div>

               <div className="h-px w-full bg-slate-200 mb-12"></div>

               <div className="grid grid-cols-12 gap-12">
                  <div className="col-span-8 space-y-12">
                     <section className="space-y-6">
                        <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Professional Experience</h2>
                        <div className="space-y-8">
                           <div className="space-y-3">
                              <div className="flex justify-between items-baseline">
                                 <h3 className="text-lg font-bold">Lead UX Designer</h3>
                                 <span className="text-[10px] font-medium text-slate-400">2020 - Present</span>
                              </div>
                              <p className="text-xs font-bold text-slate-600">TechFlow Solutions</p>
                              <ul className="text-xs space-y-2 list-disc pl-4 text-slate-500 leading-relaxed">
                                 <li>Spearheaded the redesign of the core SaaS platform, resulting in a 25% increase in user engagement.</li>
                                 <li>Managed a team of 5 designers, conducting weekly critiques and mentoring junior staff.</li>
                                 <li>Implemented a new design system that reduced development time by 40%.</li>
                              </ul>
                           </div>
                           <div className="space-y-3 opacity-60">
                              <div className="flex justify-between items-baseline">
                                 <h3 className="text-lg font-bold">Senior UI Designer</h3>
                                 <span className="text-[10px] font-medium text-slate-400">2017 - 2020</span>
                              </div>
                              <p className="text-xs font-bold text-slate-600">Creative Pulse Agency</p>
                              <ul className="text-xs space-y-2 list-disc pl-4 text-slate-500 leading-relaxed">
                                 <li>Delivered high-fidelity prototypes for Fortune 500 clients including financial and healthcare sectors.</li>
                                 <li>Collaborated closely with frontend developers to ensure design integrity during implementation.</li>
                              </ul>
                           </div>
                        </div>
                     </section>

                     <section className="space-y-6">
                        <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Projects</h2>
                        <div className="space-y-4">
                           <h3 className="text-sm font-bold">E-Commerce Mobile App Redesign</h3>
                           <p className="text-xs text-slate-500 leading-relaxed">
                              Led the end-to-end redesign process, from user research to final UI polish. Improved conversion rate by 15% within 3 months of launch.
                           </p>
                        </div>
                     </section>
                  </div>

                  <div className="col-span-4 space-y-12">
                     <section className="space-y-6">
                        <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Skills</h2>
                        <div className="flex flex-wrap gap-2">
                           {['Figma', 'Sketch', 'Adobe CC', 'Prototyping', 'User Research', 'HTML/CSS'].map(s => (
                             <span key={s} className="px-3 py-1 bg-slate-100 text-[10px] font-bold text-slate-600 rounded-lg">{s}</span>
                           ))}
                        </div>
                     </section>

                     <section className="space-y-6">
                        <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Education</h2>
                        <div className="space-y-2">
                           <h3 className="text-xs font-bold">BFA in Interaction Design</h3>
                           <p className="text-[10px] text-slate-500">California College of the Arts</p>
                           <p className="text-[10px] text-slate-400">2013 - 2017</p>
                        </div>
                     </section>

                     <section className="space-y-6">
                        <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Languages</h2>
                        <div className="space-y-3 text-[10px] font-bold text-slate-500">
                           <div className="flex justify-between"><span>English</span> <span className="text-slate-300">Native</span></div>
                           <div className="flex justify-between"><span>Spanish</span> <span className="text-slate-300">Fluent</span></div>
                           <div className="flex justify-between"><span>French</span> <span className="text-slate-300">Basic</span></div>
                        </div>
                     </section>
                  </div>
               </div>

               {/* Overlay Floating Score Badge */}
               <div className="absolute bottom-10 right-10 bg-[#161b22] border border-white/10 rounded-2xl p-6 shadow-2xl w-72 space-y-4 animate-in fade-in slide-in-from-bottom-5 duration-700">
                  <div className="flex items-center justify-between">
                     <div className="flex items-center gap-2 text-white">
                        <span className="material-symbols-outlined text-green-500">task_alt</span>
                        <h5 className="text-[10px] font-black uppercase tracking-widest">ATS Score</h5>
                     </div>
                     <button className="text-text-secondary"><span className="material-symbols-outlined text-sm">close</span></button>
                  </div>
                  <div className="space-y-1">
                     <p className="text-xs font-bold text-green-500">Excellent (92/100)</p>
                     <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-green-500 w-[92%]"></div>
                     </div>
                  </div>
                  <ul className="space-y-3">
                     {[
                       { icon: 'check', text: 'Layout structure is parseable.', color: 'text-green-500' },
                       { icon: 'check', text: 'Font size is readable (10.5pt).', color: 'text-green-500' },
                       { icon: 'warning', text: 'Consider adding more keywords to Experience.', color: 'text-orange-500' }
                     ].map((item, i) => (
                       <li key={i} className="flex gap-2 text-[9px] font-medium leading-tight">
                          <span className={`material-symbols-outlined text-xs ${item.color}`}>{item.icon}</span>
                          <span className="text-gray-400">{item.text}</span>
                       </li>
                     ))}
                  </ul>
                  <button className="w-full py-2 bg-primary/10 border border-primary/20 text-primary text-[9px] font-black uppercase tracking-widest rounded-xl hover:bg-primary/20 transition-all">View Full Analysis</button>
               </div>
            </div>
         </section>
      </main>
      <style>{`.custom-scrollbar::-webkit-scrollbar { width: 4px; } .custom-scrollbar::-webkit-scrollbar-thumb { background: #3c4253; border-radius: 10px; }`}</style>
    </div>
  );
};

export default CVEditorScreen;
