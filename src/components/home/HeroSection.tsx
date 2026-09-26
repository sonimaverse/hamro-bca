import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { ArrowRight, Sparkles, Download, FileText, Trophy, Star, PlayCircle } from 'lucide-react';

interface HeroSectionProps {
  navigate: (path: string) => void;
  isAuthenticated: boolean;
}

const mockRows = [
  { title: 'Data Structures — Unit 3', subject: 'BCA 3rd Sem', type: 'Notes', tint: 'from-blue-500/25 to-blue-600/5', border: 'border-blue-400/30' },
  { title: 'TU Board Exam 2081', subject: 'BCA 5th Sem', type: 'Past Paper', tint: 'from-amber-500/25 to-amber-600/5', border: 'border-amber-400/30' },
  { title: 'DBMS Lab Manual', subject: 'BCA 3rd Sem', type: 'Lab Manual', tint: 'from-emerald-500/25 to-emerald-600/5', border: 'border-emerald-400/30' },
];

export const HeroSection: React.FC<HeroSectionProps> = ({ navigate, isAuthenticated }) => {
  const reduceMotion = useReducedMotion();

  const fadeUp = (delay: number) => ({
    initial: reduceMotion ? { opacity: 0 } : { opacity: 0, y: 26 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] as const },
  });

  return (
    <section className="relative overflow-hidden bg-navy-950 pt-16 pb-20 sm:pt-24 sm:pb-28">
      {/* Ambient background: grid, glow orbs, horizon fade */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div
          className="absolute inset-0 opacity-[0.16]"
          style={{
            backgroundImage:
              'linear-gradient(to right, rgba(148,163,184,0.18) 1px, transparent 1px), linear-gradient(to bottom, rgba(148,163,184,0.18) 1px, transparent 1px)',
            backgroundSize: '64px 64px',
            maskImage: 'radial-gradient(ellipse 80% 60% at 50% 0%, #000 40%, transparent 100%)',
            WebkitMaskImage: 'radial-gradient(ellipse 80% 60% at 50% 0%, #000 40%, transparent 100%)',
          }}
        />
        <div className="animate-glow-pulse absolute -top-32 left-1/2 h-[36rem] w-[36rem] -translate-x-1/2 rounded-full bg-brand-500/22 blur-[130px]" />
        <div className="absolute -left-24 top-40 h-80 w-80 rounded-full bg-aqua-400/12 blur-[110px]" />
        <div className="absolute -right-24 top-72 h-96 w-96 rounded-full bg-brand-700/25 blur-[120px]" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-navy-950" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-10">
          {/* ---------- Copy ---------- */}
          <div className="text-center lg:text-left">
            <motion.div {...fadeUp(0)}>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.06] px-3.5 py-1.5 text-xs font-semibold text-brand-300 backdrop-blur-md">
                <Sparkles className="h-3.5 w-3.5" />
                Tribhuvan University BCA Syllabus
              </span>
            </motion.div>

            <motion.h1
              {...fadeUp(0.08)}
              className="mt-6 font-outfit text-4xl font-extrabold leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-6xl"
            >
              Everything a BCA Student Needs,{' '}
              <span className="bg-gradient-to-r from-brand-400 via-aqua-400 to-brand-400 bg-clip-text text-transparent">
                In One Place.
              </span>
            </motion.h1>

            <motion.p
              {...fadeUp(0.16)}
              className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-slate-300 sm:text-lg lg:mx-0"
            >
              Access semester-wise notes, past questions, syllabus, faculty resources, announcements, and
              community contributions across all 8 semesters.
            </motion.p>

            <motion.div {...fadeUp(0.24)} className="mt-9 flex flex-col gap-3 sm:flex-row sm:justify-center lg:justify-start">
              <button
                onClick={() => navigate('/resources')}
                className="group inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 px-6 py-3.5 text-sm font-bold text-white shadow-[0_10px_30px_-8px_rgba(37,99,235,0.75)] transition-all duration-200 hover:shadow-[0_16px_40px_-8px_rgba(37,99,235,0.9)] hover:brightness-110 active:scale-[0.98] cursor-pointer"
              >
                Explore Resources
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>

              <button
                onClick={() => navigate(isAuthenticated ? '/dashboard' : '/register')}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/[0.06] px-6 py-3.5 text-sm font-bold text-white backdrop-blur-md transition-all duration-200 hover:border-white/30 hover:bg-white/[0.12] active:scale-[0.98] cursor-pointer"
              >
                {isAuthenticated ? 'Go to Dashboard' : 'Get Started'}
                <PlayCircle className="h-4 w-4" />
              </button>
            </motion.div>

            <motion.ul
              {...fadeUp(0.32)}
              className="mt-9 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-xs text-slate-400 lg:justify-start"
            >
              <li className="flex items-center gap-2">
                <span className="flex -space-x-2" aria-hidden="true">
                  {['A', 'B', 'C', 'D'].map((letter, i) => (
                    <span
                      key={letter}
                      className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-navy-950 bg-gradient-to-br from-brand-500 to-brand-700 text-[10px] font-bold text-white"
                      style={{ zIndex: 4 - i }}
                    >
                      {letter}
                    </span>
                  ))}
                </span>
                Built for every BCA semester
              </li>
              <li className="flex items-center gap-1.5">
                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                Free core resources, always
              </li>
            </motion.ul>
          </div>

          {/* ---------- Dashboard mockup + floating cards ---------- */}
          <motion.div
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.94, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.85, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="relative mx-auto w-full max-w-xl lg:max-w-none"
          >
            {/* Glow plate behind the mockup */}
            <div
              aria-hidden="true"
              className="absolute -inset-6 -z-10 rounded-[2.5rem] bg-gradient-to-tr from-brand-600/25 via-transparent to-aqua-400/20 blur-2xl"
            />

            <div className="overflow-hidden rounded-2xl border border-white/12 bg-navy-900/70 shadow-[0_40px_80px_-24px_rgba(2,6,23,0.9)] backdrop-blur-2xl">
              {/* Window chrome */}
              <div className="flex items-center gap-2 border-b border-white/8 bg-white/[0.03] px-4 py-3">
                <span className="h-2.5 w-2.5 rounded-full bg-rose-400/80" />
                <span className="h-2.5 w-2.5 rounded-full bg-amber-400/80" />
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
                <span className="ml-2 truncate text-[11px] font-medium text-slate-400">
                  hamrobca.edu.np / dashboard
                </span>
              </div>

              <div className="flex">
                {/* Mock sidebar */}
                <aside className="hidden w-36 shrink-0 flex-col gap-2 border-r border-white/8 bg-navy-950/50 p-3 sm:flex">
                  <div className="mb-1 h-6 w-6 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700" />
                  {['Overview', 'Resources', 'Courses', 'Notices'].map((item, i) => (
                    <div
                      key={item}
                      className={`h-7 rounded-lg ${i === 0 ? 'bg-brand-500/20 ring-1 ring-brand-400/40' : 'bg-white/5'}`}
                    />
                  ))}
                </aside>

                {/* Mock content */}
                <div className="min-w-0 flex-1 p-4 sm:p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
                        Semester 3
                      </p>
                      <p className="font-outfit text-sm font-bold text-white">DSA &amp; DBMS</p>
                    </div>
                    <span className="rounded-full border border-brand-400/30 bg-brand-500/15 px-2.5 py-1 text-[10px] font-bold text-brand-300">
                      Premium
                    </span>
                  </div>

                  {/* Stat tiles */}
                  <div className="mt-4 grid grid-cols-3 gap-2.5">
                    {[
                      { label: 'Resources', value: '148' },
                      { label: 'Notes', value: '62' },
                      { label: 'Papers', value: '31' },
                    ].map((stat) => (
                      <div key={stat.label} className="rounded-xl border border-white/8 bg-white/[0.04] p-2.5">
                        <p className="font-outfit text-base font-bold text-white">{stat.value}</p>
                        <p className="text-[10px] text-slate-400">{stat.label}</p>
                      </div>
                    ))}
                  </div>

                  {/* Resource rows */}
                  <div className="mt-3 space-y-2">
                    {mockRows.map((row) => (
                      <div
                        key={row.title}
                        className={`flex items-center gap-2.5 rounded-xl border ${row.border} bg-gradient-to-r ${row.tint} p-2.5`}
                      >
                        <FileText className="h-3.5 w-3.5 shrink-0 text-white/80" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[11px] font-semibold text-white">{row.title}</p>
                          <p className="text-[10px] text-slate-300/80">
                            {row.subject} · {row.type}
                          </p>
                        </div>
                        <Download className="h-3.5 w-3.5 shrink-0 text-white/60" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Floating glass cards */}
            <div
              className={`pointer-events-none absolute -left-3 top-16 hidden animate-float-slow rounded-2xl border border-white/12 bg-navy-850/85 px-4 py-3 shadow-[0_20px_50px_-16px_rgba(2,6,23,1)] backdrop-blur-xl sm:block ${
                reduceMotion ? '' : ''
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-300">
                  <Download className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-[11px] text-slate-400">Downloads today</p>
                  <p className="font-outfit text-sm font-bold text-white">1,284</p>
                </div>
              </div>
            </div>

            <div className="pointer-events-none absolute -right-2 bottom-8 hidden animate-float-mid rounded-2xl border border-white/12 bg-navy-850/85 px-4 py-3 shadow-[0_20px_50px_-16px_rgba(2,6,23,1)] backdrop-blur-xl sm:block">
              <div className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/20 text-amber-300">
                  <Trophy className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-[11px] text-slate-400">Board results</p>
                  <p className="font-outfit text-sm font-bold text-white">2081 Published</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
