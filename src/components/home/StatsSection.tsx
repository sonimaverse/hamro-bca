import React from 'react';
import { Reveal } from './Reveal.js';
import { CountUp } from './CountUp.js';

interface StatItem {
  value: number;
  prefix?: string;
  suffix?: string;
  label: string;
}

const stats: StatItem[] = [
  { value: 8, label: 'Semesters Covered' },
  { value: 500, suffix: '+', label: 'Verified Resources' },
  { value: 200, suffix: '+', label: 'Lecture Notes' },
  { value: 100, suffix: '+', label: 'Question Banks' },
];

export const StatsSection: React.FC = () => {
  return (
    <section className="relative border-y border-white/8 bg-navy-900/60 py-14 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ul className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {stats.map((stat, i) => (
            <Reveal as="li" key={stat.label} delay={i * 0.08} className="text-center sm:text-left">
              <p className="font-outfit text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                <CountUp to={stat.value} prefix={stat.prefix} suffix={stat.suffix} />
              </p>
              <p className="mt-1.5 text-sm font-medium text-slate-400">{stat.label}</p>
            </Reveal>
          ))}
        </ul>

        <Reveal delay={0.1} className="mt-10 flex flex-col items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4 backdrop-blur-md sm:flex-row">
          <div className="flex items-center gap-3">
            <span className="relative flex h-2.5 w-2.5" aria-hidden="true">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-70" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
            </span>
            <p className="text-sm font-semibold text-white">
              An active student community, contributing every single day
            </p>
          </div>
          <p className="text-xs text-slate-400">
            New notes, past papers and lab manuals added continuously
          </p>
        </Reveal>
      </div>
    </section>
  );
};
