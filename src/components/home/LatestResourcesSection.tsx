import React from 'react';
import { Reveal } from './Reveal.js';
import { Download, Crown, Lock, ArrowRight, FileText, FileCode, HelpCircle, ClipboardList, Presentation } from 'lucide-react';
import { Resource } from '../../types/index.js';

interface LatestResourcesSectionProps {
  resources: Resource[];
  isLoading: boolean;
  navigate: (path: string) => void;
  isAuthenticated: boolean;
  isPremiumViewer: boolean;
  isPremiumRequestPending: boolean;
  onDownload: (res: Resource) => void;
  onRequestPremium: () => void;
}

const typeIcons: Record<string, React.ReactNode> = {
  PDF: <FileText className="h-4 w-4 text-rose-300" aria-hidden="true" />,
  Notes: <FileCode className="h-4 w-4 text-blue-300" aria-hidden="true" />,
  'Past Questions': <HelpCircle className="h-4 w-4 text-amber-300" aria-hidden="true" />,
  Assignments: <ClipboardList className="h-4 w-4 text-emerald-300" aria-hidden="true" />,
  Slides: <Presentation className="h-4 w-4 text-violet-300" aria-hidden="true" />,
};

export const LatestResourcesSection: React.FC<LatestResourcesSectionProps> = ({
  resources,
  isLoading,
  navigate,
  isAuthenticated,
  isPremiumViewer,
  isPremiumRequestPending,
  onDownload,
  onRequestPremium,
}) => {
  const isLocked = (res: Resource) => res.isPremiumContent === true && !isPremiumViewer;

  return (
    <section className="relative bg-navy-950 py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-400">Latest Resources</p>
            <h2 className="mt-3 font-outfit text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              Freshly added study material
            </h2>
            <p className="mt-3 text-sm text-slate-400">
              The newest notes, papers and manuals uploaded by faculty and students.
            </p>
          </div>

          <button
            onClick={() => navigate('/resources')}
            className="group inline-flex shrink-0 items-center gap-1.5 self-start text-sm font-semibold text-brand-400 transition-colors hover:text-brand-300 cursor-pointer sm:self-auto"
          >
            Browse the full vault
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </button>
        </Reveal>

        {isLoading ? (
          <ul className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[0, 1, 2, 3].map((i) => (
              <li
                key={i}
                className="h-52 animate-pulse rounded-2xl border border-white/10 bg-white/[0.04]"
                aria-hidden="true"
              />
            ))}
          </ul>
        ) : resources.length === 0 ? (
          <Reveal className="mt-12 rounded-2xl border border-dashed border-white/15 bg-white/[0.02] px-6 py-14 text-center">
            <p className="text-sm font-semibold text-white">No resources published yet</p>
            <p className="mx-auto mt-2 max-w-md text-sm text-slate-400">
              Materials are being prepared. Check back shortly or browse the curriculum in the meantime.
            </p>
            <button
              onClick={() => navigate('/resources')}
              className="mt-6 inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/[0.06] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/[0.12] cursor-pointer"
            >
              Open resource vault
              <ArrowRight className="h-4 w-4" />
            </button>
          </Reveal>
        ) : (
          <ul className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {resources.map((res, i) => {
              const locked = isLocked(res);
              const isPremium = res.isPremiumContent === true;
              const canDownload = isPremium ? isPremiumViewer && !!res.fileUrl : true;

              return (
                <Reveal as="li" key={res._id} delay={(i % 4) * 0.06} className="group h-full">
                  <article
                    className={`flex h-full flex-col overflow-hidden rounded-2xl border backdrop-blur-md transition-all duration-300 hover:-translate-y-1.5 ${
                      locked
                        ? 'border-amber-400/30 bg-amber-400/[0.05]'
                        : 'border-white/10 bg-white/[0.04] hover:border-brand-400/40 hover:shadow-[0_24px_60px_-20px_rgba(37,99,235,0.45)]'
                    }`}
                  >
                    <div className="flex-1 p-5">
                      <div className="flex items-start justify-between gap-2">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/[0.06] ring-1 ring-inset ring-white/10">
                          {typeIcons[res.type] ?? <FileText className="h-4 w-4 text-blue-300" aria-hidden="true" />}
                        </span>

                        <div className="flex flex-wrap items-center justify-end gap-1.5">
                          {isPremium && (
                            <span className="inline-flex items-center gap-1 rounded-full border border-amber-400/30 bg-amber-400/15 px-2 py-0.5 text-[10px] font-bold text-amber-300">
                              <Crown className="h-3 w-3" aria-hidden="true" />
                              Premium
                            </span>
                          )}
                          {locked && (
                            <span className="inline-flex items-center gap-1 rounded-full border border-white/12 bg-white/[0.06] px-2 py-0.5 text-[10px] font-bold text-slate-300">
                              <Lock className="h-3 w-3" aria-hidden="true" />
                              Locked
                            </span>
                          )}
                        </div>
                      </div>

                      <h3 className="mt-4 line-clamp-2 font-outfit text-sm font-bold leading-snug text-white">
                        {res.title}
                      </h3>
                      <p className="mt-1.5 line-clamp-1 text-xs font-medium text-brand-300">{res.subject}</p>

                      <div className="mt-4 flex flex-wrap items-center gap-1.5">
                        <span className="rounded-full border border-white/12 bg-white/[0.05] px-2.5 py-0.5 text-[10px] font-semibold text-slate-300">
                          Sem {res.semester}
                        </span>
                        <span className="rounded-full border border-white/12 bg-white/[0.05] px-2.5 py-0.5 text-[10px] font-semibold text-slate-300">
                          {res.type}
                        </span>
                      </div>
                    </div>

                    <div className="border-t border-white/8 p-4">
                      {canDownload ? (
                        <button
                          onClick={() => onDownload(res)}
                          className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/12 bg-white/[0.06] px-4 py-2.5 text-xs font-bold text-white transition-all hover:border-brand-400/40 hover:bg-brand-500/20 active:scale-[0.98] cursor-pointer"
                        >
                          <Download className="h-3.5 w-3.5" aria-hidden="true" />
                          Download ({res.downloads || 0})
                        </button>
                      ) : isAuthenticated ? (
                        isPremiumRequestPending ? (
                          <p className="flex items-center justify-center gap-1.5 rounded-xl border border-blue-400/25 bg-blue-500/10 px-4 py-2.5 text-center text-[11px] font-semibold text-blue-200">
                            Request Pending
                          </p>
                        ) : (
                          <button
                            onClick={onRequestPremium}
                            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 px-4 py-2.5 text-xs font-bold text-white transition-all hover:brightness-110 active:scale-[0.98] cursor-pointer"
                          >
                            <Crown className="h-3.5 w-3.5" aria-hidden="true" />
                            Request Premium Access
                          </button>
                        )
                      ) : (
                        <>
                          <p className="mb-2 text-center text-[11px] font-medium text-amber-200">
                            Login to access premium resources
                          </p>
                          <button
                            onClick={() => navigate('/login')}
                            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/[0.06] px-4 py-2.5 text-xs font-bold text-white transition-colors hover:bg-white/[0.12] active:scale-[0.98] cursor-pointer"
                          >
                            <Lock className="h-3.5 w-3.5" aria-hidden="true" />
                            Log In to Unlock
                          </button>
                        </>
                      )}
                    </div>
                  </article>
                </Reveal>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
};
