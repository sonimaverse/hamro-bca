import React from 'react';
import { Reveal } from './Reveal.js';
import { ArrowUpRight, type LucideIcon } from 'lucide-react';
import { FileCode, HelpCircle, ScrollText, FlaskConical, Presentation, ClipboardList, Megaphone } from 'lucide-react';

interface Category {
  icon: LucideIcon;
  title: string;
  description: string;
  path: string;
  tint: string;
  iconColor: string;
  count: string;
}

const categories: Category[] = [
  {
    icon: FileCode,
    title: 'Notes',
    description: 'Unit-wise lecture notes, handwritten summaries and class handouts for every subject.',
    path: '/notes',
    tint: 'from-blue-500/20',
    iconColor: 'text-blue-300',
    count: '200+ notes',
  },
  {
    icon: HelpCircle,
    title: 'Past Questions',
    description: 'Full TU board papers by year with model solutions and marking schemes.',
    path: '/resources?type=Past+Questions',
    tint: 'from-amber-500/20',
    iconColor: 'text-amber-300',
    count: '100+ papers',
  },
  {
    icon: ScrollText,
    title: 'Syllabus',
    description: 'Complete subject-wise syllabus and credit structure for all eight semesters.',
    path: '/courses',
    tint: 'from-violet-500/20',
    iconColor: 'text-violet-300',
    count: '8 semesters',
  },
  {
    icon: FlaskConical,
    title: 'Lab Manuals',
    description: 'Practical record guidance, lab exercises and viva questions for each subject.',
    path: '/resources',
    tint: 'from-emerald-500/20',
    iconColor: 'text-emerald-300',
    count: 'Practical sets',
  },
  {
    icon: Presentation,
    title: 'Presentations',
    description: 'Slide decks shared by faculty to accompany lectures and revise key topics.',
    path: '/resources?type=Slides',
    tint: 'from-cyan-500/20',
    iconColor: 'text-cyan-300',
    count: 'Slide decks',
  },
  {
    icon: ClipboardList,
    title: 'Assignments',
    description: 'Coursework, submission briefs and deadlines tracked against your enrolments.',
    path: '/dashboard',
    tint: 'from-rose-500/20',
    iconColor: 'text-rose-300',
    count: 'Per course',
  },
  {
    icon: Megaphone,
    title: 'Important Notices',
    description: 'Exam routines, results and campus announcements the moment TU releases them.',
    path: '/announcements',
    tint: 'from-indigo-500/20',
    iconColor: 'text-indigo-300',
    count: 'Live updates',
  },
];

export const CategoriesSection: React.FC<{ navigate: (path: string) => void }> = ({ navigate }) => {
  return (
    <section className="relative bg-navy-900/40 py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-400">Resource Categories</p>
          <h2 className="mt-3 font-outfit text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Find exactly what you need
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-slate-300 sm:text-base">
            Browse by material type instead of hunting through folders and old drives.
          </p>
        </Reveal>

        <ul className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category, i) => (
            <Reveal as="li" key={category.title} delay={(i % 3) * 0.07}>
              <button
                onClick={() => navigate(category.path)}
                className="group relative flex h-full w-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-6 text-left backdrop-blur-md transition-all duration-300 hover:-translate-y-1.5 hover:border-brand-400/40 hover:bg-white/[0.07] hover:shadow-[0_24px_60px_-20px_rgba(37,99,235,0.45)] cursor-pointer"
              >
                <div className="flex items-start justify-between gap-3">
                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${category.tint} to-transparent ring-1 ring-inset ring-white/10 transition-transform duration-300 group-hover:scale-110`}
                  >
                    <category.icon className={`h-5 w-5 ${category.iconColor}`} aria-hidden="true" />
                  </div>
                  <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-semibold text-slate-400">
                    {category.count}
                  </span>
                </div>

                <h3 className="mt-5 font-outfit text-base font-bold text-white">{category.title}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-400">{category.description}</p>

                <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-400 transition-colors group-hover:text-brand-300">
                  Browse {category.title}
                  <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </span>
              </button>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
};
