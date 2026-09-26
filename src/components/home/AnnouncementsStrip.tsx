import React from 'react';
import { Reveal } from './Reveal.js';
import { Announcement } from '../../types/index.js';
import { Badge } from '../ui/Badge.js';
import { Button } from '../ui/Button.js';
import { Bell } from 'lucide-react';

interface AnnouncementsStripProps {
  announcements: Announcement[];
  navigate: (path: string) => void;
}

const priorityMeta = {
  urgent: { variant: 'rose' as const, label: 'Urgent' },
  important: { variant: 'amber' as const, label: 'Important' },
  normal: { variant: 'blue' as const, label: 'Notice' },
};

export const AnnouncementsStrip: React.FC<AnnouncementsStripProps> = ({ announcements, navigate }) => {
  if (!announcements.length) return null;

  return (
    <section className="relative bg-navy-900/40 py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-400">Notice Board</p>
            <h2 className="mt-3 font-outfit text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
              University updates &amp; announcements
            </h2>
          </div>
          <button
            onClick={() => navigate('/announcements')}
            className="shrink-0 text-sm font-semibold text-brand-400 transition-colors hover:text-brand-300"
          >
            View all notices →
          </button>
        </Reveal>

        <ul className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {announcements.map((a, i) => {
            const meta = priorityMeta[a.priority] || priorityMeta.normal;
            return (
              <Reveal as="li" key={a._id} delay={(i % 3) * 0.07}>
                <article className="flex h-full flex-col rounded-2xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-md transition-all hover:-translate-y-1 hover:border-brand-400/35">
                  <div className="flex items-center justify-between gap-2">
                    <Badge variant={meta.variant} size="sm">
                      {meta.label}
                    </Badge>
                    <span className="text-[11px] text-slate-400">
                      {new Date(a.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </div>

                  <h3 className="mt-3 font-outfit text-base font-bold text-white line-clamp-1">{a.title}</h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-400 line-clamp-3">{a.content}</p>

                  <p className="mt-4 text-[11px] font-medium text-slate-500">
                    By {a.authorName || 'TU Department'}
                  </p>
                </article>
              </Reveal>
            );
          })}
        </ul>
      </div>
    </section>
  );
};
