import React from 'react';
import { Reveal } from './Reveal.js';
import {
  Layers,
  BadgeCheck,
  HelpCircle,
  BookMarked,
  Users,
  Crown,
  Bell,
  LayoutDashboard,
  type LucideIcon,
} from 'lucide-react';

interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
  /** Tailwind classes for the icon tile. */
  tint: string;
  iconColor: string;
}

const features: Feature[] = [
  {
    icon: Layers,
    title: 'Semester-wise Learning',
    description: 'Structured modules mapped to every TU BCA semester, so you always study the right subject at the right time.',
    tint: 'from-blue-500/20',
    iconColor: 'text-blue-300',
  },
  {
    icon: BadgeCheck,
    title: 'Verified Notes',
    description: 'Lecture notes reviewed for accuracy and alignment with the official syllabus before they are published.',
    tint: 'from-emerald-500/20',
    iconColor: 'text-emerald-300',
  },
  {
    icon: HelpCircle,
    title: 'Past Question Banks',
    description: 'Yearly TU board papers with solutions, organised by year and subject for targeted exam practice.',
    tint: 'from-amber-500/20',
    iconColor: 'text-amber-300',
  },
  {
    icon: BookMarked,
    title: 'Faculty Resources',
    description: 'Handouts, slides and reference material shared directly by teachers across all departments.',
    tint: 'from-violet-500/20',
    iconColor: 'text-violet-300',
  },
  {
    icon: Users,
    title: 'Community Notes',
    description: 'Contribute your own notes, get them reviewed, and help classmates across Nepal study together.',
    tint: 'from-cyan-500/20',
    iconColor: 'text-cyan-300',
  },
  {
    icon: Crown,
    title: 'Premium Resources',
    description: 'Unlock solved papers, premium handouts and exclusive lab manuals with a premium subscription.',
    tint: 'from-amber-400/25',
    iconColor: 'text-amber-300',
  },
  {
    icon: Bell,
    title: 'Announcements',
    description: 'Exam routines, results and university notices delivered in one place the moment they are published.',
    tint: 'from-rose-500/20',
    iconColor: 'text-rose-300',
  },
  {
    icon: LayoutDashboard,
    title: 'Student Dashboard',
    description: 'Track enrolments, continue your learning and manage your premium access from a single dashboard.',
    tint: 'from-indigo-500/20',
    iconColor: 'text-indigo-300',
  },
];

export const FeaturesSection: React.FC = () => {
  return (
    <section className="relative bg-navy-950 py-20 sm:py-24">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-0 h-72 w-[46rem] -translate-x-1/2 rounded-full bg-brand-600/10 blur-[120px]"
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-400">Platform Features</p>
          <h2 className="mt-3 font-outfit text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Everything you need to excel in BCA
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-slate-300 sm:text-base">
            One platform replacing scattered drives, group chats and outdated PDFs.
          </p>
        </Reveal>

        <ul className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, i) => (
            <Reveal as="li" key={feature.title} delay={(i % 4) * 0.07} className="group">
              <article className="relative h-full overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-md transition-all duration-300 hover:-translate-y-1.5 hover:border-brand-400/40 hover:bg-white/[0.07] hover:shadow-[0_24px_60px_-20px_rgba(37,99,235,0.45)]">
                {/* Hover spotlight */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-brand-400/0 blur-2xl transition-all duration-500 group-hover:bg-brand-400/25"
                />

                <div
                  className={`relative flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${feature.tint} to-transparent ring-1 ring-inset ring-white/10`}
                >
                  <feature.icon className={`h-5 w-5 ${feature.iconColor}`} aria-hidden="true" />
                </div>

                <h3 className="relative mt-5 font-outfit text-base font-bold text-white">{feature.title}</h3>
                <p className="relative mt-2 text-sm leading-relaxed text-slate-400">{feature.description}</p>
              </article>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
};
