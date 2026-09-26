import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { Reveal } from './Reveal.js';
import { ArrowRight, BookOpen } from 'lucide-react';

interface FinalCtaSectionProps {
  navigate: (path: string) => void;
  isAuthenticated: boolean;
}

export const FinalCtaSection: React.FC<FinalCtaSectionProps> = ({ navigate, isAuthenticated }) => {
  const reduceMotion = useReducedMotion();

  return (
    <section className="relative overflow-hidden bg-navy-950 py-20 sm:py-24">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
      >
        <div className="absolute -top-24 left-1/4 h-80 w-80 rounded-full bg-brand-600/22 blur-[120px]" />
        <div className="absolute -bottom-16 right-1/4 h-80 w-80 rounded-full bg-aqua-400/15 blur-[120px]" />
      </div>

      <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
        <Reveal>
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-500/15 ring-1 ring-inset ring-brand-400/30">
            <BookOpen className="h-6 w-6 text-brand-300" aria-hidden="true" />
          </span>

          <h2 className="mt-7 font-outfit text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
            Start Learning Smarter with{' '}
            <span className="bg-gradient-to-r from-brand-400 via-aqua-400 to-brand-400 bg-clip-text text-transparent">
              Hamro BCA
            </span>
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-slate-300 sm:text-lg">
            Join the community that is reshaping how BCA students study. Create your free account and
            dive straight into semester-wise notes, question banks and faculty resources.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <button
              onClick={() => navigate(isAuthenticated ? '/dashboard' : '/register')}
              className="group inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 px-7 py-3.5 text-sm font-bold text-white shadow-[0_10px_30px_-8px_rgba(37,99,235,0.75)] transition-all hover:shadow-[0_16px_44px_-8px_rgba(37,99,235,0.9)] hover:brightness-110 active:scale-[0.98] cursor-pointer"
            >
              {isAuthenticated ? 'Go to Dashboard' : 'Create Account'}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>

            <button
              onClick={() => navigate('/resources')}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/[0.06] px-7 py-3.5 text-sm font-bold text-white backdrop-blur-md transition-all hover:border-white/30 hover:bg-white/[0.12] active:scale-[0.98] cursor-pointer"
            >
              Explore Resources
            </button>
          </div>
        </Reveal>
      </div>
    </section>
  );
};
