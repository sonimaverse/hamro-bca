import React from 'react';
import { Reveal } from './Reveal.js';
import { ChevronRight } from 'lucide-react';

interface SemesterStripProps {
  navigate: (path: string) => void;
}

/** Subject focus per semester, carried over from the previous homepage. */
const semesterMeta: Record<number, string> = {
  1: 'C Prog, DL',
  2: 'C++, Discrete',
  3: 'DSA, DBMS',
  4: 'Web Tech, OS',
  5: 'Electives',
  6: 'Electives',
  7: 'AI, Cyber Law',
  8: 'Project, Capstone',
};

const semesters = [1, 2, 3, 4, 5, 6, 7, 8];

export const SemesterStrip: React.FC<SemesterStripProps> = ({ navigate }) => {
  return (
    <section className="relative bg-navy-950 py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-400">Explore by Semester</p>
            <h2 className="mt-3 font-outfit text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
              Jump straight to your academic year
            </h2>
            <p className="mt-3 text-sm text-slate-400">
              Select your active semester to see its subjects, modules and materials.
            </p>
          </div>

          <button
            onClick={() => navigate('/courses')}
            className="group inline-flex shrink-0 items-center gap-1.5 self-start text-sm font-semibold text-brand-400 transition-colors hover:text-brand-300 cursor-pointer sm:self-auto"
          >
            View all courses
            <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </button>
        </Reveal>

        <ul className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
          {semesters.map((sem, i) => (
            <Reveal as="li" key={sem} delay={i * 0.04}>
              <button
                onClick={() => navigate(`/courses?semester=${sem}`)}
                className="group flex w-full flex-col items-center rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-5 text-center backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-brand-400/50 hover:bg-brand-500/10 hover:shadow-[0_20px_44px_-18px_rgba(37,99,235,0.6)] cursor-pointer"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/[0.06] font-outfit text-sm font-extrabold text-white ring-1 ring-inset ring-white/10 transition-colors duration-300 group-hover:bg-gradient-to-br group-hover:from-brand-500 group-hover:to-brand-700 group-hover:text-white">
                  {sem}
                </span>
                <span className="mt-3 text-xs font-bold text-white">Sem {sem}</span>
                <span className="mt-0.5 text-[10px] leading-tight text-slate-400">{semesterMeta[sem]}</span>
              </button>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
};
