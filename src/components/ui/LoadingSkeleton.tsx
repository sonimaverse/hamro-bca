import React from 'react';

export const LoadingSkeleton: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div
      className={`animate-pulse bg-slate-200 dark:bg-slate-800 rounded-xl ${className}`}
    />
  );
};

export const CardSkeleton: React.FC = () => {
  return (
    <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col gap-4">
      <LoadingSkeleton className="h-44 w-full rounded-xl" />
      <div className="flex gap-2">
        <LoadingSkeleton className="h-5 w-16 rounded-full" />
        <LoadingSkeleton className="h-5 w-24 rounded-full" />
      </div>
      <LoadingSkeleton className="h-6 w-3/4 rounded-md" />
      <LoadingSkeleton className="h-4 w-full rounded-md" />
      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
        <LoadingSkeleton className="h-4 w-28 rounded-md" />
        <LoadingSkeleton className="h-8 w-20 rounded-lg" />
      </div>
    </div>
  );
};
