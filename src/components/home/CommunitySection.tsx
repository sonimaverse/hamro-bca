import React from 'react';
import { Reveal } from './Reveal.js';
import { UploadCloud, Search, CheckCircle2, Users, ArrowRight } from 'lucide-react';

interface CommunitySectionProps {
  navigate: (path: string) => void;
  isAuthenticated: boolean;
}

const steps = [
  {
    icon: UploadCloud,
    title: 'Upload your notes',
    description: 'Share lecture notes, handwritten summaries or lab records you have created.',
  },
  {
    icon: Search,
    title: 'Admin review',
    description: 'Every submission is checked for syllabus alignment and clarity before publishing.',
  },
  {
    icon: CheckCircle2,
    title: 'Published for everyone',
    description: 'Once approved, classmates across all semesters can download it immediately.',
  },
];

export const CommunitySection: React.FC<CommunitySectionProps> = ({ navigate, isAuthenticated }) => {
  return (
    <section className="relative bg-navy-900/40 py-20 sm:py-24">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/4 top-10 h-80 w-80 rounded-full bg-cyan-500/10 blur-[120px]"
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center lg:gap-16">
          <Reveal>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-400">
              Community Contributions
            </p>
            <h2 className="mt-3 font-outfit text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              Built by students, for students
            </h2>
            <p className="mt-5 text-sm leading-relaxed text-slate-300 sm:text-base">
              The strongest resource libraries are the ones students build together. Share what worked for
              you and help someone else clear the same subject this year.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button
                onClick={() => navigate(isAuthenticated ? '/dashboard' : '/register')}
                className="group inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 px-6 py-3.5 text-sm font-bold text-white shadow-[0_10px_30px_-8px_rgba(37,99,235,0.75)] transition-all hover:brightness-110 active:scale-[0.98] cursor-pointer"
              >
                <UploadCloud className="h-4 w-4" aria-hidden="true" />
                Upload Notes
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>

              <button
                onClick={() => navigate('/resources')}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/[0.06] px-6 py-3.5 text-sm font-bold text-white backdrop-blur-md transition-all hover:border-white/30 hover:bg-white/[0.12] active:scale-[0.98] cursor-pointer"
              >
                Browse Contributions
              </button>
            </div>
          </Reveal>

          <ul className="space-y-3">
            {steps.map((step, i) => (
              <Reveal as="li" key={step.title} delay={i * 0.1}>
                <div className="group flex items-start gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-brand-400/40 hover:bg-white/[0.07]">
                  <span className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500/25 to-transparent ring-1 ring-inset ring-white/10">
                    <step.icon className="h-5 w-5 text-brand-300" aria-hidden="true" />
                    <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-brand-600 text-[10px] font-extrabold text-white ring-2 ring-navy-950">
                      {i + 1}
                    </span>
                  </span>

                  <div>
                    <h3 className="font-outfit text-sm font-bold text-white">{step.title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-slate-400">{step.description}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </ul>
        </div>

        {/* Community proof bar */}
        <Reveal delay={0.15} className="mt-12">
          <div className="flex flex-col items-center gap-4 rounded-2xl border border-white/10 bg-gradient-to-r from-brand-600/12 to-transparent px-6 py-6 backdrop-blur-md sm:flex-row sm:justify-between">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/[0.06] ring-1 ring-inset ring-white/10">
                <Users className="h-5 w-5 text-brand-300" aria-hidden="true" />
              </span>
              <div>
                <p className="font-outfit text-sm font-bold text-white">Community contribution programme</p>
                <p className="mt-0.5 text-xs text-slate-400">
                  Students contributing notes are credited on every published resource.
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate(isAuthenticated ? '/dashboard' : '/register')}
              className="shrink-0 rounded-xl border border-white/15 bg-white/[0.06] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/[0.12] cursor-pointer"
            >
              Join the community
            </button>
          </div>
        </Reveal>
      </div>
    </section>
  );
};
