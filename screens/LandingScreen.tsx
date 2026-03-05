import React, { useState, useEffect, useRef } from 'react';

// ─── Inline SVG Logo ────────────────────────────────────────────────────────
const Logo = ({ className = "size-9" }) => (
    <svg className={className} viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="36" height="36" rx="10" fill="url(#logoGrad)"/>
        <path d="M11 14a7 7 0 1 1 14 0v4a7 7 0 0 1-14 0v-4Z" fill="white" fillOpacity="0.15"/>
        <rect x="15" y="24" width="6" height="5" rx="1" fill="white" fillOpacity="0.9"/>
        <rect x="12" y="28" width="12" height="2" rx="1" fill="white" fillOpacity="0.9"/>
        <circle cx="18" cy="15" r="3" fill="white"/>
        <defs>
            <linearGradient id="logoGrad" x1="0" y1="0" x2="36" y2="36" gradientUnits="userSpaceOnUse">
                <stop stopColor="#4F6EF7"/>
                <stop offset="1" stopColor="#14B8A6"/>
            </linearGradient>
        </defs>
    </svg>
);

// ─── Screen enum shim ────────────────────────────────────────────────────────
const Screen = { SignIn: 'SignIn', SignUp: 'SignUp', Privacy: 'Privacy', Terms: 'Terms', Contact: 'Contact' };

// ─── Animated waveform bars ──────────────────────────────────────────────────
const Waveform = () => {
    const bars = [3,5,8,6,9,7,10,8,6,9,7,5,8,6,4];
    return (
        <div className="flex items-end justify-center gap-[3px] h-10">
            {bars.map((h, i) => (
                <div
                    key={i}
                    className="w-[3px] rounded-full bg-gradient-to-t from-blue-500 to-teal-400"
                    style={{
                        height: `${h * 8}%`,
                        animation: `wave ${0.8 + i * 0.07}s ease-in-out infinite alternate`,
                        animationDelay: `${i * 0.05}s`,
                    }}
                />
            ))}
        </div>
    );
};

// ─── Typing animation hook ───────────────────────────────────────────────────
const useTyping = (texts, speed = 60, pause = 1800) => {
    const [display, setDisplay] = useState('');
    const [idx, setIdx] = useState(0);
    const [deleting, setDeleting] = useState(false);
    useEffect(() => {
        const current = texts[idx];
        let timeout;
        if (!deleting && display === current) {
            timeout = setTimeout(() => setDeleting(true), pause);
        } else if (deleting && display === '') {
            setDeleting(false);
            setIdx((idx + 1) % texts.length);
        } else {
            timeout = setTimeout(() => {
                setDisplay(deleting ? current.slice(0, display.length - 1) : current.slice(0, display.length + 1));
            }, deleting ? speed / 2 : speed);
        }
        return () => clearTimeout(timeout);
    }, [display, deleting, idx, texts, speed, pause]);
    return display;
};

// ─── FAQItem ─────────────────────────────────────────────────────────────────
const FAQItem = ({ q, a }: { q: string; a: string }) => {
    const [open, setOpen] = useState(false);
    return (
        <div
            className="border border-white/[0.07] rounded-2xl overflow-hidden transition-all duration-300"
            style={{ background: open ? 'rgba(79,110,247,0.06)' : 'rgba(255,255,255,0.02)' }}
        >
            <button
                className="w-full flex items-center justify-between px-8 py-6 text-left gap-4"
                onClick={() => setOpen(!open)}
            >
                <span className="text-[15px] font-semibold text-white leading-snug">{q}</span>
                <span
                    className="flex-shrink-0 size-7 rounded-full border border-white/10 flex items-center justify-center text-white transition-transform duration-300"
                    style={{ transform: open ? 'rotate(45deg)' : 'rotate(0deg)', background: open ? 'rgba(79,110,247,0.3)' : 'rgba(255,255,255,0.05)' }}
                >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
        </span>
            </button>
            <div
                className="overflow-hidden transition-all duration-300"
                style={{ maxHeight: open ? '200px' : '0', opacity: open ? 1 : 0 }}
            >
                <p className="px-8 pb-6 text-sm text-slate-400 leading-relaxed">{a}</p>
            </div>
        </div>
    );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const LandingScreen = ({ onNavigate }) => {
    const nav = onNavigate ?? ((s) => console.log('Navigate:', s));
    const typedRole = useTyping(['Software Engineer', 'Product Manager', 'Data Scientist', 'UX Designer', 'Marketing Lead', 'Virtual Assistant', 'Head of Operation'], 70, 1600);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handler = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handler);
        return () => window.removeEventListener('scroll', handler);
    }, []);

    const features = [
        {
            icon: (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/><line x1="8" y1="22" x2="16" y2="22"/>
                </svg>
            ),
            accent: '#4F6EF7',
            accentBg: 'rgba(79,110,247,0.12)',
            title: 'AI Voice Interviews',
            desc: 'Real-time, sub-200ms voice conversations that replicate the cadence of live recruiter sessions — pressure and all.',
        },
        {
            icon: (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
                </svg>
            ),
            accent: '#14B8A6',
            accentBg: 'rgba(20,184,166,0.12)',
            title: 'ATS Resume Scoring',
            desc: 'Upload your resume and job description — get an exact match score plus a prioritised fix list before you ever hit Apply.',
        },
        {
            icon: (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                </svg>
            ),
            accent: '#A78BFA',
            accentBg: 'rgba(167,139,250,0.12)',
            title: 'Deep Performance Analytics',
            desc: 'Confidence curve, filler word frequency, pause patterns, and content clarity — measured to the millisecond.',
        },
    ];

    const steps = [
        { n: '01', title: 'Upload & Target', body: 'Drop in your resume and the job description. Our AI maps your experience to what the recruiter actually wants.' },
        { n: '02', title: 'Practice with AI', body: 'Run a live, voice-driven mock interview tailored precisely to that role, company culture, and seniority level.' },
        { n: '03', title: 'Refine & Get Hired', body: 'Review your analytics report, eliminate weak spots, and walk into the real interview radiating confidence.' },
    ];

    const testimonials = [
        { name: 'Alex Rivera', role: 'L5 Software Engineer · Google', quote: 'The voice feedback caught every single filler word I didn\'t even know I was saying. Three weeks later I had the offer letter.', initials: 'AR', color: '#4F6EF7' },
        { name: 'Sarah Chen', role: 'Senior PM · Meta', quote: 'Behavioral questions used to derail me completely. The STAR coaching inside the platform rewired how I tell stories. Total game-changer.', initials: 'SC', color: '#14B8A6' },
        { name: 'Marcus Thorne', role: 'Staff Data Scientist · Amazon', quote: 'ATS optimization alone took my callback rate from 5% to 38%. The ROI on the Pro plan is absurd.', initials: 'MT', color: '#A78BFA' },
    ];

    const faqs = [
        { q: 'How accurate is the AI feedback?', a: 'Our model is fine-tuned on thousands of real interview transcripts and validated by senior recruiters at top-tier firms. Content accuracy sits above 95% and vocal delivery markers benchmark against actual hiring outcomes.' },
        { q: 'Is my voice data secure?', a: 'All audio is processed in-memory with end-to-end encryption. We never store raw recordings beyond the session, and your data is never sold or used to train third-party models.' },
        { q: 'Does it work for non-tech roles?', a: 'Absolutely. We cover 500+ job categories — Marketing, Sales, Finance, Operations, Legal, and more. The AI adapts its question bank and vocabulary to your industry.' },
        { q: 'Can I start for free?', a: 'Yes. The free tier includes one full mock interview per month and a single resume scan. No credit card required — you can be practising within 60 seconds of signing up.' },
    ];

    return (
        <>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@400;500;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,400&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        
        :root {
          --bg: #080C14;
          --bg2: #0C1220;
          --primary: #4F6EF7;
          --primary-glow: rgba(79,110,247,0.35);
          --teal: #14B8A6;
          --text: #F0F4FF;
          --muted: #64748B;
          --border: rgba(255,255,255,0.07);
          --card: rgba(255,255,255,0.03);
        }

        html { scroll-behavior: smooth; }

        body, #root {
          font-family: 'DM Sans', sans-serif;
          background: var(--bg);
          color: var(--text);
          min-height: 100vh;
        }

        .brand { font-family: 'Bricolage Grotesque', sans-serif; }

        @keyframes wave {
          from { transform: scaleY(0.4); }
          to   { transform: scaleY(1); }
        }
        @keyframes float {
          0%,100% { transform: translateY(0px); }
          50% { transform: translateY(-12px); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse-ring {
          0%   { transform: scale(0.95); opacity: 1; }
          100% { transform: scale(1.6); opacity: 0; }
        }
        @keyframes shimmer {
          0%   { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes scanline {
          0%   { top: -2px; }
          100% { top: 100%; }
        }

        .fade-up { animation: fadeUp 0.7s ease both; }
        .fade-up-1 { animation: fadeUp 0.7s 0.1s ease both; }
        .fade-up-2 { animation: fadeUp 0.7s 0.2s ease both; }
        .fade-up-3 { animation: fadeUp 0.7s 0.35s ease both; }
        .fade-up-4 { animation: fadeUp 0.7s 0.5s ease both; }

        .hero-gradient {
          background: radial-gradient(ellipse 80% 60% at 60% -10%, rgba(79,110,247,0.18) 0%, transparent 70%),
                      radial-gradient(ellipse 50% 50% at 10% 80%, rgba(20,184,166,0.08) 0%, transparent 60%),
                      var(--bg);
        }

        .gradient-text {
          background: linear-gradient(135deg, #fff 30%, #4F6EF7 60%, #14B8A6 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .shimmer-text {
          background: linear-gradient(90deg, #4F6EF7, #14B8A6, #fff, #4F6EF7);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 3s linear infinite;
        }

        .glass {
          background: rgba(255,255,255,0.03);
          backdrop-filter: blur(20px);
          border: 1px solid var(--border);
        }

        .card-hover {
          transition: transform 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease;
        }
        .card-hover:hover {
          transform: translateY(-4px);
          border-color: rgba(79,110,247,0.3) !important;
          box-shadow: 0 24px 60px rgba(79,110,247,0.1);
        }

        .btn-primary {
          background: linear-gradient(135deg, #4F6EF7, #3D5CE8);
          box-shadow: 0 0 0 0 rgba(79,110,247,0);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 16px 40px rgba(79,110,247,0.45);
        }
        .btn-primary:active { transform: translateY(0); }

        .btn-ghost {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          transition: background 0.2s ease, transform 0.2s ease;
        }
        .btn-ghost:hover {
          background: rgba(255,255,255,0.09);
          transform: translateY(-2px);
        }

        .live-dot::before {
          content: '';
          display: block;
          width: 8px; height: 8px;
          border-radius: 50%;
          background: #14B8A6;
          box-shadow: 0 0 0 0 rgba(20,184,166,0.7);
          animation: pulse-ring 1.4s ease-out infinite;
        }

        .noise::after {
          content: '';
          position: absolute;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E");
          pointer-events: none;
          border-radius: inherit;
        }

        .avatar-img {
          width: 40px; height: 40px;
          border-radius: 50%;
          object-fit: cover;
          border: 2px solid var(--bg);
        }

        .step-line {
          position: absolute;
          left: 19px; top: 48px;
          width: 1px; bottom: -24px;
          background: linear-gradient(to bottom, rgba(79,110,247,0.4), transparent);
        }

        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: var(--bg); }
        ::-webkit-scrollbar-thumb { background: rgba(79,110,247,0.3); border-radius: 3px; }
      `}</style>

            <div style={{ background: 'var(--bg)', minHeight: '100vh', overflowX: 'hidden' }}>

                {/* ── NAV ────────────────────────────────────────────────────────────── */}
                <nav
                    style={{
                        position: 'sticky', top: 0, zIndex: 100,
                        padding: '0 clamp(1.5rem,5vw,5rem)',
                        height: 68,
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        background: scrolled ? 'rgba(8,12,20,0.85)' : 'transparent',
                        backdropFilter: scrolled ? 'blur(24px)' : 'none',
                        borderBottom: scrolled ? '1px solid rgba(255,255,255,0.06)' : '1px solid transparent',
                        transition: 'background 0.3s ease, border-color 0.3s ease',
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Logo />
                        <span className="brand" style={{ fontSize: 17, fontWeight: 700, color: '#fff', letterSpacing: '-0.3px' }}>
              MockInterview<span style={{ color: 'var(--primary)' }}>.ai</span>
            </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 32 }} className="nav-links">
                        {['Features', 'How It Works', 'Pricing'].map(l => (
                            <button key={l} style={{ fontSize: 14, fontWeight: 500, color: 'var(--muted)', background: 'none', border: 'none', cursor: 'pointer', transition: 'color 0.2s' }}
                                    onMouseEnter={e => e.target.style.color = '#fff'} onMouseLeave={e => e.target.style.color = 'var(--muted)'}>
                                {l}
                            </button>
                        ))}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <button
                            onClick={() => nav(Screen.SignIn)}
                            style={{ fontSize: 14, fontWeight: 500, color: 'var(--muted)', background: 'none', border: 'none', cursor: 'pointer', transition: 'color 0.2s' }}
                            onMouseEnter={e => e.target.style.color = '#fff'} onMouseLeave={e => e.target.style.color = 'var(--muted)'}
                        >
                            Sign In
                        </button>
                        <button
                            onClick={() => nav(Screen.SignUp)}
                            className="btn-primary brand"
                            style={{ padding: '9px 22px', borderRadius: 12, fontSize: 14, fontWeight: 700, color: '#fff', border: 'none', cursor: 'pointer' }}
                        >
                            Get Started →
                        </button>
                    </div>
                </nav>

                {/* ── HERO ───────────────────────────────────────────────────────────── */}
                <section className="hero-gradient" style={{ padding: 'clamp(5rem,10vh,8rem) clamp(1.5rem,5vw,5rem) clamp(4rem,8vh,6rem)', position: 'relative' }}>
                    {/* Background orbs */}
                    <div style={{ position: 'absolute', top: '10%', right: '5%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(79,110,247,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />
                    <div style={{ position: 'absolute', bottom: '5%', left: '2%', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(20,184,166,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />

                    <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'center' }}>
                        {/* Left */}
                        <div className="fade-up" style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
                            {/* Badge */}
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 14px', borderRadius: 999, background: 'rgba(79,110,247,0.12)', border: '1px solid rgba(79,110,247,0.25)', width: 'fit-content' }}>
                                <span className="live-dot" style={{ display: 'flex' }} />
                                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--primary)', letterSpacing: '0.02em' }}>Advanced Voice Analytics 2.0 — Now Live</span>
                            </div>

                            {/* Headline */}
                            <div className="brand" style={{ fontSize: 'clamp(2.6rem,5vw,4rem)', fontWeight: 800, lineHeight: 1.1, letterSpacing: '-1.5px', color: '#fff' }}>
                                <div>Land your next</div>
                                <div style={{ color: 'transparent', background: 'linear-gradient(120deg,#4F6EF7 0%,#14B8A6 100%)', WebkitBackgroundClip: 'text', backgroundClip: 'text' }}>
                                    {typedRole}
                                    <span style={{ borderRight: '3px solid var(--primary)', marginLeft: 2, animation: 'wave 0.6s ease-in-out infinite alternate' }}>_</span>
                                </div>
                                <div>role with AI.</div>
                            </div>

                            {/* Sub */}
                            <p style={{ fontSize: 17, lineHeight: 1.75, color: '#8899B4', maxWidth: 480 }}>
                                The most advanced voice-driven interview coach on the planet. Real sessions, brutal honesty, instant feedback — so you walk in ready.
                            </p>

                            {/* CTAs */}
                            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                                <button onClick={() => nav(Screen.SignUp)} className="btn-primary brand" style={{ padding: '14px 28px', borderRadius: 14, fontSize: 16, fontWeight: 700, color: '#fff', border: 'none', cursor: 'pointer' }}>
                                    Start Free Practice
                                </button>
                                <button className="btn-ghost" style={{ padding: '14px 28px', borderRadius: 14, fontSize: 16, fontWeight: 600, color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="10" height="12" viewBox="0 0 10 12" fill="white"><path d="M0 0l10 6-10 6z"/></svg>
                  </span>
                                    Watch Demo
                                </button>
                            </div>

                            {/* Social proof strip */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: 14, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.07)' }}>
                                <div style={{ display: 'flex' }}>
                                    {[
                                        { initials: 'AM', bg: '#4F6EF7' },
                                        { initials: 'JL', bg: '#14B8A6' },
                                        { initials: 'RK', bg: '#A78BFA' },
                                        { initials: '+10k', bg: '#0C1220', border: '1px solid rgba(79,110,247,0.5)' },
                                    ].map((a, i) => (
                                        <div key={i} style={{ width: 36, height: 36, borderRadius: '50%', background: a.bg, border: a.border ?? '2px solid var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: '#fff', marginLeft: i > 0 ? -10 : 0, zIndex: 4 - i, position: 'relative' }}>
                                            {a.initials}
                                        </div>
                                    ))}
                                </div>
                                <div>
                                    <div style={{ display: 'flex', gap: 2, color: '#F59E0B' }}>
                                        {[...Array(5)].map((_, i) => (
                                            <svg key={i} width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                                        ))}
                                    </div>
                                    <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>Trusted by 10,000+ professionals</div>
                                </div>
                            </div>
                        </div>

                        {/* Right — Mock interview card */}
                        <div className="fade-up-2" style={{ position: 'relative', animation: 'float 5s ease-in-out infinite' }}>
                            <div style={{ position: 'absolute', inset: -30, background: 'radial-gradient(ellipse at center, rgba(79,110,247,0.18) 0%, transparent 70%)', borderRadius: 40, pointerEvents: 'none' }} />
                            <div className="glass noise" style={{ borderRadius: 28, padding: 28, position: 'relative', boxShadow: '0 40px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(79,110,247,0.15)' }}>
                                {/* Card header */}
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 20, borderBottom: '1px solid rgba(255,255,255,0.06)', marginBottom: 20 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                        <div style={{ width: 44, height: 44, borderRadius: 14, background: 'linear-gradient(135deg,#4F6EF7,#3D5CE8)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/><line x1="8" y1="22" x2="16" y2="22"/></svg>
                                        </div>
                                        <div>
                                            <div style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>Interview with Aria</div>
                                            <div style={{ fontSize: 12, color: 'var(--muted)' }}>Product Manager · FAANG-level</div>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 10px', borderRadius: 999, background: 'rgba(20,184,166,0.1)', border: '1px solid rgba(20,184,166,0.25)' }}>
                                        <span className="live-dot" />
                                        <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--teal)', letterSpacing: '0.05em' }}>LIVE</span>
                                    </div>
                                </div>

                                {/* Chat messages */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 20 }}>
                                    {/* AI message */}
                                    <div style={{ display: 'flex', gap: 10 }}>
                                        <img src="https://i.pravatar.cc/32?img=47" alt="AI" style={{ width: 32, height: 32, borderRadius: '50%', flexShrink: 0, objectFit: 'cover' }} referrerPolicy="no-referrer" />
                                        <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '0 14px 14px 14px', padding: '10px 14px', maxWidth: '85%' }}>
                                            <p style={{ fontSize: 13, color: '#CBD5E1', lineHeight: 1.6 }}>"Walk me through a product decision where you had to push back on an engineering constraint."</p>
                                        </div>
                                    </div>

                                    {/* User message */}
                                    <div style={{ display: 'flex', gap: 10, flexDirection: 'row-reverse' }}>
                                        <img src="https://i.pravatar.cc/32?img=12" alt="You" style={{ width: 32, height: 32, borderRadius: '50%', flexShrink: 0, objectFit: 'cover' }} referrerPolicy="no-referrer" />
                                        <div style={{ background: 'rgba(79,110,247,0.18)', border: '1px solid rgba(79,110,247,0.25)', borderRadius: '14px 0 14px 14px', padding: '10px 14px', maxWidth: '85%' }}>
                                            <p style={{ fontSize: 13, color: '#E2E8F0', lineHeight: 1.6 }}>"Sure — at Stripe we needed a feature shipped in two weeks but the team estimated six. I reframed the MVP scope and..."</p>
                                        </div>
                                    </div>

                                    {/* AI reply */}
                                    <div style={{ display: 'flex', gap: 10 }}>
                                        <img src="https://i.pravatar.cc/32?img=47" alt="AI" style={{ width: 32, height: 32, borderRadius: '50%', flexShrink: 0, objectFit: 'cover' }} referrerPolicy="no-referrer" />
                                        <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '0 14px 14px 14px', padding: '10px 14px', maxWidth: '85%' }}>
                                            <p style={{ fontSize: 13, color: '#CBD5E1', lineHeight: 1.6 }}>"Great. What data did you use to validate that the reduced scope was acceptable to users?"</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Waveform */}
                                <div style={{ background: 'rgba(79,110,247,0.05)', border: '1px solid rgba(79,110,247,0.15)', borderRadius: 14, padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#EF4444', boxShadow: '0 0 6px rgba(239,68,68,0.6)' }} />
                                        <span style={{ fontSize: 12, color: 'var(--muted)' }}>Recording</span>
                                    </div>
                                    <Waveform />
                                    <span style={{ fontSize: 12, fontFamily: 'monospace', color: 'var(--primary)', fontWeight: 600 }}>0:47</span>
                                </div>

                                {/* Inline feedback chips */}
                                <div style={{ display: 'flex', gap: 8, marginTop: 14, flexWrap: 'wrap' }}>
                                    {[
                                        { label: '✓ Clear structure', color: '#14B8A6', bg: 'rgba(20,184,166,0.1)' },
                                        { label: '⚡ 0 filler words', color: '#4F6EF7', bg: 'rgba(79,110,247,0.1)' },
                                        { label: '🎯 STAR method', color: '#A78BFA', bg: 'rgba(167,139,250,0.1)' },
                                    ].map(c => (
                                        <span key={c.label} style={{ fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 999, color: c.color, background: c.bg, border: `1px solid ${c.color}20` }}>{c.label}</span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── LOGOS ──────────────────────────────────────────────────────────── */}
                <section style={{ padding: '3rem clamp(1.5rem,5vw,5rem)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', background: 'rgba(255,255,255,0.01)' }}>
                    <p style={{ textAlign: 'center', fontSize: 11, fontWeight: 700, letterSpacing: '0.15em', color: 'var(--muted)', textTransform: 'uppercase', marginBottom: '2.5rem' }}>
                        Our candidates land jobs at
                    </p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', gap: '2.5rem 4rem', opacity: 0.35, filter: 'grayscale(1)', transition: 'opacity 0.4s, filter 0.4s' }}
                         onMouseEnter={e => { e.currentTarget.style.opacity = '0.9'; e.currentTarget.style.filter = 'grayscale(0)'; }}
                         onMouseLeave={e => { e.currentTarget.style.opacity = '0.35'; e.currentTarget.style.filter = 'grayscale(1)'; }}
                    >
                        {['Google', 'Meta', 'Amazon', 'Netflix', 'Microsoft', 'Apple'].map(c => (
                            <span key={c} className="brand" style={{ fontSize: 22, fontWeight: 800, color: '#fff', letterSpacing: '-0.5px', fontStyle: 'italic' }}>{c}</span>
                        ))}
                    </div>
                </section>

                {/* ── FEATURES ───────────────────────────────────────────────────────── */}
                <section style={{ padding: 'clamp(5rem,10vh,8rem) clamp(1.5rem,5vw,5rem)', background: 'var(--bg)' }}>
                    <div style={{ maxWidth: 1100, margin: '0 auto' }}>
                        <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
                            <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.15em', color: 'var(--primary)', textTransform: 'uppercase', marginBottom: 16 }}>Core Platform</p>
                            <h2 className="brand gradient-text" style={{ fontSize: 'clamp(2rem,4vw,3rem)', fontWeight: 800, letterSpacing: '-1px', marginBottom: 16 }}>
                                Built for the modern candidate.
                            </h2>
                            <p style={{ fontSize: 17, color: 'var(--muted)', maxWidth: 480, margin: '0 auto', lineHeight: 1.7 }}>
                                Everything from "Applying" to "Hired" — in one ruthlessly efficient platform.
                            </p>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 24 }}>
                            {features.map((f, i) => (
                                <div key={i} className="glass card-hover noise" style={{ borderRadius: 24, padding: 32, position: 'relative', overflow: 'hidden' }}>
                                    <div style={{ position: 'absolute', top: -40, right: -40, width: 160, height: 160, borderRadius: '50%', background: `radial-gradient(circle, ${f.accentBg} 0%, transparent 70%)`, pointerEvents: 'none' }} />
                                    <div style={{ width: 52, height: 52, borderRadius: 16, background: f.accentBg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: f.accent, marginBottom: 24, transition: 'transform 0.25s ease' }}
                                         onMouseEnter={e => e.currentTarget.style.transform='scale(1.1)'}
                                         onMouseLeave={e => e.currentTarget.style.transform='scale(1)'}
                                    >
                                        {f.icon}
                                    </div>
                                    <h3 className="brand" style={{ fontSize: 18, fontWeight: 700, color: '#fff', marginBottom: 12 }}>{f.title}</h3>
                                    <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.75 }}>{f.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── HOW IT WORKS ───────────────────────────────────────────────────── */}
                <section style={{ padding: 'clamp(5rem,10vh,8rem) clamp(1.5rem,5vw,5rem)', background: 'var(--bg2)' }}>
                    <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5rem', alignItems: 'center' }}>
                        <div>
                            <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.15em', color: 'var(--primary)', textTransform: 'uppercase', marginBottom: 16 }}>How It Works</p>
                            <h2 className="brand" style={{ fontSize: 'clamp(2rem,3.5vw,2.8rem)', fontWeight: 800, letterSpacing: '-1px', color: '#fff', marginBottom: 48, lineHeight: 1.15 }}>
                                Your path to the offer<br />in 3 simple steps.
                            </h2>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
                                {steps.map((s, i) => (
                                    <div key={i} style={{ display: 'flex', gap: 24, position: 'relative' }}>
                                        {i < steps.length - 1 && <div className="step-line" />}
                                        <div style={{ flexShrink: 0, width: 40, height: 40, borderRadius: 12, background: 'rgba(79,110,247,0.12)', border: '1px solid rgba(79,110,247,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: 'var(--primary)', fontFamily: 'monospace' }}>
                                            {s.n}
                                        </div>
                                        <div>
                                            <h3 className="brand" style={{ fontSize: 17, fontWeight: 700, color: '#fff', marginBottom: 8 }}>{s.title}</h3>
                                            <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.75 }}>{s.body}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Video / image preview */}
                        <div style={{ position: 'relative', borderRadius: 24, overflow: 'hidden', border: '1px solid var(--border)', boxShadow: '0 40px 80px rgba(0,0,0,0.4)', aspectRatio: '16/10' }}>
                            <img
                                src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=900&auto=format&fit=crop&q=80"
                                alt="Professional interview preparation"
                                style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.4 }}
                                referrerPolicy="no-referrer"
                            />
                            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(79,110,247,0.3) 0%, rgba(8,12,20,0.4) 100%)' }} />
                            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <button style={{ width: 72, height: 72, borderRadius: '50%', background: 'linear-gradient(135deg,#4F6EF7,#3D5CE8)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer', boxShadow: '0 0 0 16px rgba(79,110,247,0.15)', transition: 'transform 0.2s ease' }}
                                        onMouseEnter={e => e.currentTarget.style.transform='scale(1.1)'}
                                        onMouseLeave={e => e.currentTarget.style.transform='scale(1)'}
                                >
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="white"><path d="M5 3l14 9-14 9z"/></svg>
                                </button>
                            </div>
                            {/* Corner stats */}
                            <div style={{ position: 'absolute', bottom: 20, left: 20, right: 20, display: 'flex', gap: 10 }}>
                                {[['87%', 'Avg score gain'], ['3.2×', 'More callbacks'], ['2 wks', 'To offer']].map(([val, lab]) => (
                                    <div key={lab} style={{ flex: 1, background: 'rgba(8,12,20,0.75)', backdropFilter: 'blur(12px)', borderRadius: 12, padding: '10px 14px', border: '1px solid rgba(255,255,255,0.08)' }}>
                                        <div className="brand" style={{ fontSize: 18, fontWeight: 800, color: '#fff', letterSpacing: '-0.5px' }}>{val}</div>
                                        <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 2 }}>{lab}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── VOICE INTELLIGENCE ─────────────────────────────────────────────── */}
                <section style={{ padding: 'clamp(5rem,10vh,8rem) clamp(1.5rem,5vw,5rem)', background: 'var(--bg)' }}>
                    <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5rem', alignItems: 'center' }}>
                        {/* 2×2 tech grid */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                            {[
                                { icon: '🧠', accent: '#14B8A6', accentBg: 'rgba(20,184,166,0.1)', title: 'NLP Engine', body: '99.2% accuracy on complex sentence structures, in real time.' },
                                { icon: '🎙️', accent: '#4F6EF7', accentBg: 'rgba(79,110,247,0.1)', title: 'Prosody Analysis', body: 'Confidence scoring from pitch, pace, and hesitation patterns.', offset: true },
                                { icon: '⚡', accent: '#A78BFA', accentBg: 'rgba(167,139,250,0.1)', title: 'Ultra-Low Latency', body: 'Sub-200ms response for a natural, uninterrupted conversation.' },
                                { icon: '🔒', accent: '#F59E0B', accentBg: 'rgba(245,158,11,0.1)', title: 'Privacy First', body: 'End-to-end encryption. Your voice data is never stored or sold.', offset: true },
                            ].map((c, i) => (
                                <div key={i} className="glass card-hover" style={{ borderRadius: 20, padding: 24, marginTop: c.offset ? 28 : 0 }}>
                                    <div style={{ fontSize: 28, marginBottom: 14 }}>{c.icon}</div>
                                    <h4 className="brand" style={{ fontSize: 15, fontWeight: 700, color: '#fff', marginBottom: 8 }}>{c.title}</h4>
                                    <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.7 }}>{c.body}</p>
                                </div>
                            ))}
                        </div>

                        <div>
                            <div style={{ display: 'inline-flex', padding: '5px 12px', borderRadius: 999, background: 'rgba(79,110,247,0.1)', border: '1px solid rgba(79,110,247,0.2)', marginBottom: 20 }}>
                                <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--primary)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>The Technology</span>
                            </div>
                            <h2 className="brand" style={{ fontSize: 'clamp(2rem,3.5vw,2.8rem)', fontWeight: 800, letterSpacing: '-1px', color: '#fff', lineHeight: 1.15, marginBottom: 20 }}>
                                The intelligence<br />behind the voice.
                            </h2>
                            <p style={{ fontSize: 16, color: 'var(--muted)', lineHeight: 1.8, marginBottom: 32 }}>
                                Not just another LLM wrapper. Our proprietary Voice Intelligence layer analyzes 50+ vocal markers — previously possible only with a human career coach charging $500/hr.
                            </p>
                            <ul style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                                {[
                                    'Dynamic context-aware follow-up questions',
                                    'Sentiment and emotional intelligence tracking',
                                    'Industry-specific vocabulary recognition',
                                    'Real-time hesitation & filler word detection',
                                ].map(item => (
                                    <li key={item} style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 14, color: '#CBD5E1' }}>
                    <span style={{ flexShrink: 0, width: 20, height: 20, borderRadius: '50%', background: 'rgba(20,184,166,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4l3 3 5-6" stroke="#14B8A6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </span>
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </section>

                {/* ── ATS ────────────────────────────────────────────────────────────── */}
                <section style={{ padding: 'clamp(5rem,10vh,8rem) clamp(1.5rem,5vw,5rem)', background: 'var(--bg2)' }}>
                    <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
                        <div className="glass noise" style={{ borderRadius: 32, padding: 'clamp(2.5rem,6vw,5rem)', position: 'relative', overflow: 'hidden' }}>
                            <div style={{ position: 'absolute', top: -60, right: -60, width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(79,110,247,0.2) 0%, transparent 70%)' }} />
                            <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.15em', color: 'var(--teal)', textTransform: 'uppercase', marginBottom: 16 }}>ATS Compatibility</p>
                            <h2 className="brand" style={{ fontSize: 'clamp(1.8rem,3.5vw,2.5rem)', fontWeight: 800, letterSpacing: '-0.8px', color: '#fff', marginBottom: 16 }}>
                                Beat the algorithm before<br />a human even sees your CV.
                            </h2>
                            <p style={{ fontSize: 16, color: 'var(--muted)', lineHeight: 1.75, maxWidth: 520, margin: '0 auto 40px' }}>
                                Our optimization engine reverse-engineers the world's most popular ATS systems so your resume always clears the first filter.
                            </p>
                            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 12 }}>
                                {['Workday', 'Greenhouse', 'Lever', 'Taleo', 'iCIMS', 'BambooHR', 'SAP SuccessFactors'].map(a => (
                                    <div key={a} style={{ padding: '9px 18px', borderRadius: 10, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', fontSize: 13, fontWeight: 600, color: '#94A3B8' }}>{a}</div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── TESTIMONIALS ───────────────────────────────────────────────────── */}
                <section style={{ padding: 'clamp(5rem,10vh,8rem) clamp(1.5rem,5vw,5rem)', background: 'var(--bg)' }}>
                    <div style={{ maxWidth: 1100, margin: '0 auto' }}>
                        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                            <h2 className="brand gradient-text" style={{ fontSize: 'clamp(2rem,4vw,3rem)', fontWeight: 800, letterSpacing: '-1px', marginBottom: 12 }}>
                                Real people. Real offers.
                            </h2>
                            <p style={{ fontSize: 16, color: 'var(--muted)' }}>Stories from candidates who went from "nervous" to "hired".</p>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 24 }}>
                            {testimonials.map((t, i) => (
                                <div key={i} className="glass card-hover" style={{ borderRadius: 24, padding: 32, display: 'flex', flexDirection: 'column', gap: 24 }}>
                                    <div style={{ display: 'flex', gap: 2 }}>
                                        {[...Array(5)].map((_, j) => (
                                            <svg key={j} width="14" height="14" viewBox="0 0 24 24" fill="#F59E0B"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                                        ))}
                                    </div>
                                    <p style={{ fontSize: 15, color: '#CBD5E1', lineHeight: 1.75, fontStyle: 'italic', flex: 1 }}>"{t.quote}"</p>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingTop: 20, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                                        <div style={{ width: 44, height: 44, borderRadius: '50%', background: `${t.color}22`, border: `2px solid ${t.color}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: t.color }}>
                                            {t.initials}
                                        </div>
                                        <div>
                                            <div style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>{t.name}</div>
                                            <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{t.role}</div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── FAQ ────────────────────────────────────────────────────────────── */}
                <section style={{ padding: 'clamp(5rem,10vh,8rem) clamp(1.5rem,5vw,5rem)', background: 'var(--bg2)' }}>
                    <div style={{ maxWidth: 720, margin: '0 auto' }}>
                        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                            <h2 className="brand" style={{ fontSize: 'clamp(2rem,4vw,2.8rem)', fontWeight: 800, letterSpacing: '-1px', color: '#fff', marginBottom: 12 }}>
                                Common questions
                            </h2>
                            <p style={{ fontSize: 16, color: 'var(--muted)' }}>Everything you need to make the call.</p>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {faqs.map((f, i) => <FAQItem key={i} q={f.q} a={f.a} />)}
                        </div>
                    </div>
                </section>

                {/* ── FINAL CTA ──────────────────────────────────────────────────────── */}
                <section style={{ padding: 'clamp(5rem,10vh,8rem) clamp(1.5rem,5vw,5rem)', position: 'relative', overflow: 'hidden', background: 'var(--bg)' }}>
                    <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 80% 60% at 50% 50%, rgba(79,110,247,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />
                    {/* Decorative grid */}
                    <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(79,110,247,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(79,110,247,0.04) 1px, transparent 1px)', backgroundSize: '60px 60px', pointerEvents: 'none', maskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black 30%, transparent 80%)' }} />

                    <div style={{ maxWidth: 760, margin: '0 auto', textAlign: 'center', position: 'relative' }}>
                        <div style={{ display: 'inline-flex', padding: '5px 16px', borderRadius: 999, background: 'rgba(79,110,247,0.12)', border: '1px solid rgba(79,110,247,0.25)', marginBottom: 28 }}>
                            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--primary)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Start today — it's free</span>
                        </div>
                        <h2 className="brand" style={{ fontSize: 'clamp(2.5rem,6vw,4.5rem)', fontWeight: 800, letterSpacing: '-2px', color: '#fff', lineHeight: 1.08, marginBottom: 24 }}>
                            Ready to land your<br />
                            <span className="shimmer-text">dream job?</span>
                        </h2>
                        <p style={{ fontSize: 18, color: 'var(--muted)', lineHeight: 1.75, maxWidth: 480, margin: '0 auto 40px' }}>
                            Join 10,000+ professionals using AI to master interviews and get hired faster — no credit card needed.
                        </p>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: 14, flexWrap: 'wrap' }}>
                            <button onClick={() => nav(Screen.SignUp)} className="btn-primary brand" style={{ padding: '16px 36px', borderRadius: 16, fontSize: 17, fontWeight: 700, color: '#fff', border: 'none', cursor: 'pointer' }}>
                                Get Started for Free →
                            </button>
                            <button className="btn-ghost brand" style={{ padding: '16px 36px', borderRadius: 16, fontSize: 17, fontWeight: 600, color: '#fff', cursor: 'pointer' }}>
                                View Pricing
                            </button>
                        </div>
                        <p style={{ marginTop: 20, fontSize: 13, color: 'var(--muted)' }}>No credit card · Start in 60 seconds · Cancel anytime</p>
                    </div>
                </section>

                {/* ── FOOTER ─────────────────────────────────────────────────────────── */}
                <footer style={{ padding: '2.5rem clamp(1.5rem,5vw,5rem)', borderTop: '1px solid var(--border)', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 20, background: 'rgba(8,12,20,0.8)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, opacity: 0.7 }}>
                        <Logo className="size-7" />
                        <span className="brand" style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>
              MockInterview<span style={{ color: 'var(--primary)' }}>.ai</span>
            </span>
                    </div>
                    <div style={{ display: 'flex', gap: 28 }}>
                        {[['Privacy', Screen.Privacy], ['Terms', Screen.Terms], ['Contact', Screen.Contact]].map(([label, scr]) => (
                            <button key={label} onClick={() => nav(scr)} style={{ fontSize: 13, color: 'var(--muted)', background: 'none', border: 'none', cursor: 'pointer', transition: 'color 0.2s' }}
                                    onMouseEnter={e => e.target.style.color = '#fff'} onMouseLeave={e => e.target.style.color = 'var(--muted)'}>
                                {label}
                            </button>
                        ))}
                    </div>
                    <p style={{ fontSize: 13, color: 'var(--muted)' }}>© 2025 MockInterview.ai · All rights reserved.</p>
                </footer>
            </div>
        </>
    );
};

export default LandingScreen;