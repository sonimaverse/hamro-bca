import React from 'react';
import { Button } from '../ui/Button.js';
import { Badge } from '../ui/Badge.js';
import { Crown, Clock, CheckCircle2, XCircle, Sparkles, Loader2 } from 'lucide-react';

export type PremiumRequestState = 'none' | 'pending' | 'approved' | 'rejected';

interface PremiumStatusCardProps {
  state: PremiumRequestState;
  adminNote?: string;
  isLoading: boolean;
  isSubmitting: boolean;
  onRequest: () => void;
}

export const PremiumStatusCard: React.FC<PremiumStatusCardProps> = ({
  state,
  adminNote,
  isLoading,
  isSubmitting,
  onRequest,
}) => {
  if (isLoading) {
    return (
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-3">
          <Loader2 className="w-5 h-5 text-slate-400 animate-spin" />
          <span className="text-sm text-slate-500 dark:text-slate-400">Loading premium status...</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`p-6 sm:p-8 rounded-3xl border shadow-xs ${
        state === 'approved'
          ? 'bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/40 dark:to-orange-950/30 border-amber-300 dark:border-amber-800'
          : state === 'rejected'
          ? 'bg-rose-50/70 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/60'
          : state === 'pending'
          ? 'bg-blue-50/70 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900/60'
          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-start gap-3 min-w-0">
          <div
            className={`p-2.5 rounded-xl shrink-0 ${
              state === 'approved'
                ? 'bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400'
                : state === 'rejected'
                ? 'bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-400'
                : state === 'pending'
                ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
            }`}
          >
            {state === 'approved' ? (
              <Crown className="w-5 h-5" />
            ) : state === 'rejected' ? (
              <XCircle className="w-5 h-5" />
            ) : state === 'pending' ? (
              <Clock className="w-5 h-5" />
            ) : (
              <Sparkles className="w-5 h-5" />
            )}
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 font-outfit">
                Premium Access
              </h3>
              {state === 'approved' && (
                <Badge variant="amber" size="sm">
                  <Crown className="w-3 h-3" />
                  ACTIVE
                </Badge>
              )}
              {state === 'pending' && (
                <Badge variant="blue" size="sm">
                  PENDING
                </Badge>
              )}
              {state === 'rejected' && (
                <Badge variant="rose" size="sm">
                  REJECTED
                </Badge>
              )}
              {state === 'none' && (
                <Badge variant="slate" size="sm">
                  NOT REQUESTED
                </Badge>
              )}
            </div>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1.5 leading-relaxed">
              {state === 'approved' && (
                <>Your premium subscription is active. All premium notes, solved papers, and lab manuals are unlocked.</>
              )}
              {state === 'pending' && (
                <>Your request is awaiting administrator review. You will keep full access to free materials while you wait.</>
              )}
              {state === 'rejected' && (
                <>
                  Your last request was not approved.
                  {adminNote ? ` Reviewer note: "${adminNote}"` : ' You may submit a new request if your details have changed.'}
                </>
              )}
              {state === 'none' && (
                <>
                  Unlock the complete BCA resource vault including solved board papers, premium handouts, and exclusive lab
                  manuals.
                </>
              )}
            </p>
          </div>
        </div>

        {state === 'none' && (
          <Button
            onClick={onRequest}
            isLoading={isSubmitting}
            disabled={isSubmitting}
            className="shrink-0 w-full sm:w-auto"
            leftIcon={<Crown className="w-4 h-4" />}
          >
            {isSubmitting ? 'Submitting...' : 'Request Premium Access'}
          </Button>
        )}

        {state === 'rejected' && (
          <Button
            onClick={onRequest}
            isLoading={isSubmitting}
            disabled={isSubmitting}
            variant="outline"
            className="shrink-0 w-full sm:w-auto"
            leftIcon={<Crown className="w-4 h-4" />}
          >
            {isSubmitting ? 'Submitting...' : 'Request Again'}
          </Button>
        )}

        {state === 'approved' && (
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 shrink-0">
            <CheckCircle2 className="w-5 h-5" />
            <span className="text-sm font-semibold">Premium Active</span>
          </div>
        )}
      </div>
    </div>
  );
};
