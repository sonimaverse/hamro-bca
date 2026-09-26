import React from 'react';
import { Reveal } from './Reveal.js';
import { CheckCircle2 } from 'lucide-react';

const benefits = [
  {
    title: 'TU BCA Focused',
    description: 'Built exclusively around the Tribhuvan University BCA syllabus — no irrelevant content.',
  },
  {
    title: 'All 8 Semesters Covered',
    description: 'From introductory C programming to your final-year capstone project.',
  },
  {
    title: 'Verified Resources',
    description: 'Materials are reviewed for syllabus alignment before they reach students.',
  },
  {
    title: 'Community Driven',
    description: 'Students contribute and peer-review material, so the library keeps growing.',
  },
  {
    title: 'Faculty Support',
    description: 'Teachers share official handouts, slides and reference material directly.',
  },
  {
    title: 'Premium Learning Materials',
    description: 'Optional premium tier unlocks solved papers and exclusive lab manuals.',
  },
];

export const WhySection: React.FC = () => {
  return (
    <section className="relative overflow-hidden bg-navy-900/40 py-20 sm:py-24">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-32 top-1/3 h-96 w-96 rounded-full bg-brand-600/12 blur-[120px]"
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-16">
          <Reveal className="lg:sticky lg:top-28 lg:self-start">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-400">Why Hamro BCA</p>
            <h2 className="mt-3 font-outfit text-3xl font-extrabold leading-tight tracking-tight text-white sm:text-4xl">
              A single, dependable home for your entire BCA journey
            </h2>
            <p className="mt-5 text-sm leading-relaxed text-slate-300 sm:text-base">
              We removed the guesswork — no more outdated shared folders, no more hunting for the right
              semester notes the night before an exam.
            </p>

            <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-md">
              <p className="text-sm font-semibold text-white">Trusted by students across Nepal</p>
              <p className="mt-1.5 text-xs leading-relaxed text-slate-400">
                Every semester, every subject, every resource type — organised, searchable and free to
                browse.
              </p>
            </div>
          </Reveal>

          <ul className="grid gap-3 sm:grid-cols-2">
            {benefits.map((benefit, i) => (
              <Reveal as="li" key={benefit.title} delay={(i % 2) * 0.07}>
                <div className="group h-full rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-emerald-400/35 hover:bg-white/[0.07]">
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-emerald-500/15 ring-1 ring-inset ring-emerald-400/25">
                      <CheckCircle2 className="h-4 w-4 text-emerald-300" aria-hidden="true" />
                    </span>
                    <div>
                      <h3 className="font-outfit text-sm font-bold text-white">{benefit.title}</h3>
                      <p className="mt-1.5 text-sm leading-relaxed text-slate-400">{benefit.description}</p>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
};
