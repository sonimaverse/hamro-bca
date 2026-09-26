import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext.js';
import { useToast } from '../../context/ToastContext.js';
import { SubscriptionRequest } from '../../types/index.js';
import { Button } from '../ui/Button.js';
import { Badge } from '../ui/Badge.js';
import { Modal } from '../ui/Modal.js';
import { SearchBar } from '../ui/SearchBar.js';
import { Pagination } from '../ui/Pagination.js';
import { EmptyState } from '../ui/EmptyState.js';
import {
  Crown,
  CheckCircle2,
  XCircle,
  Clock,
  RotateCcw,
  RefreshCw,
  Mail,
  CalendarClock,
  StickyNote,
  Inbox,
} from 'lucide-react';

type StatusFilter = 'all' | 'pending' | 'approved' | 'rejected';
type ReviewStatus = 'pending' | 'approved' | 'rejected';

const FILTERS: { key: StatusFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'approved', label: 'Approved' },
  { key: 'rejected', label: 'Rejected' },
];

const statusMeta: Record<
  ReviewStatus,
  { variant: 'blue' | 'emerald' | 'rose'; label: string; icon: React.ReactNode }
> = {
  pending: { variant: 'blue', label: 'PENDING', icon: <Clock className="w-3 h-3" /> },
  approved: { variant: 'emerald', label: 'APPROVED', icon: <CheckCircle2 className="w-3 h-3" /> },
  rejected: { variant: 'rose', label: 'REJECTED', icon: <XCircle className="w-3 h-3" /> },
};

const reviewCopy: Record<ReviewStatus, { title: string; description: string; confirm: string }> = {
  approved: {
    title: 'Approve Premium Subscription',
    description:
      'Approving immediately unlocks every premium resource for this student. The student is notified on their dashboard.',
    confirm: 'Approve Request',
  },
  rejected: {
    title: 'Reject Premium Subscription',
    description:
      'Rejecting keeps premium resources locked. The student can submit a new request later, and will see your note.',
    confirm: 'Reject Request',
  },
  pending: {
    title: 'Move Back to Pending',
    description:
      'This returns the request to the pending queue. Premium access is revoked if the student was already approved.',
    confirm: 'Move to Pending',
  },
};

const formatDate = (value: string) => {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return 'Unknown';
  return d.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const formatDateTime = (value: string) => {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return 'Unknown';
  return `${d.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })}, ${d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}`;
};

export const AdminSubscriptionRequests: React.FC = () => {
  const { token } = useAuth();
  const { success, error } = useToast();

  const [requests, setRequests] = useState<SubscriptionRequest[]>([]);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Review modal state
  const [reviewTarget, setReviewTarget] = useState<{
    request: SubscriptionRequest;
    status: ReviewStatus;
  } | null>(null);
  const [reviewNote, setReviewNote] = useState('');
  const [isReviewing, setIsReviewing] = useState(false);
  const [reviewingId, setReviewingId] = useState<string | null>(null);

  const fetchRequests = async (showSpinner = true) => {
    if (showSpinner) setIsLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('status', statusFilter);
      params.append('page', String(page));
      params.append('limit', '10');
      if (searchQuery.trim()) params.append('search', searchQuery.trim());

      const res = await fetch(`/api/subscriptions/admin/requests?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setLoadError(data.error || 'Failed to load subscription requests');
        setRequests([]);
        return;
      }

      const data = await res.json();
      const items = Array.isArray(data.items) ? data.items : [];
      setRequests(items);
      setTotalPages(data.pages || 1);
      setTotalCount(data.total || 0);
      setLoadError(null);

      // A review can empty the final page of a filtered view; fall back to page 1.
      if (items.length === 0 && page > 1) {
        setPage(1);
      }
    } catch (err: any) {
      setLoadError(err.message || 'Failed to load subscription requests');
      setRequests([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchRequests();
  }, [token, statusFilter, searchQuery, page]);

  const openReview = (request: SubscriptionRequest, status: ReviewStatus) => {
    setReviewTarget({ request, status });
    setReviewNote(request.adminNote || '');
  };

  const closeReview = () => {
    if (isReviewing) return;
    setReviewTarget(null);
    setReviewNote('');
  };

  const confirmReview = async () => {
    if (!reviewTarget || isReviewing) return;
    const { request, status } = reviewTarget;

    setIsReviewing(true);
    setReviewingId(request._id);
    try {
      const res = await fetch(`/api/subscriptions/admin/requests/${request._id}/review`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status, adminNote: reviewNote.trim() }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        error(data.error || 'Failed to update subscription request');
        return;
      }

      const name = request.fullName || request.email;
      if (status === 'approved') {
        success(`Premium subscription approved for ${name}.`);
      } else if (status === 'rejected') {
        success(`Request rejected for ${name}.`);
      } else {
        success(`Request moved back to pending for ${name}.`);
      }

      setReviewTarget(null);
      setReviewNote('');
      // Refresh so the row reflects the new status and any active filter stays correct.
      await fetchRequests(false);
    } catch (err: any) {
      error(err.message || 'Review action failed');
    } finally {
      setIsReviewing(false);
      setReviewingId(null);
    }
  };

  const isFilterEmpty = !isLoading && !loadError && requests.length === 0;

  return (
    <div className="space-y-4">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 font-outfit">
            Premium Subscription Requests
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Review student premium access requests. Approving unlocks all premium materials instantly.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchRequests(false)}
            disabled={isLoading}
            className="flex items-center gap-1.5"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </Button>

          {/* Status Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                onClick={() => {
                  setStatusFilter(f.key);
                  setPage(1);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  statusFilter === f.key
                    ? 'bg-purple-600 text-white'
                    : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {f.label.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      <SearchBar
        value={searchQuery}
        onChange={(q) => {
          setSearchQuery(q);
          setPage(1);
        }}
        placeholder="Search requests by student name or email address..."
      />

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-28 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 animate-pulse"
            />
          ))}
        </div>
      )}

      {/* Load Error */}
      {!isLoading && loadError && (
        <div className="p-6 rounded-2xl border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/30 text-center">
          <XCircle className="w-6 h-6 text-rose-500 mx-auto mb-2" />
          <p className="text-sm font-semibold text-rose-700 dark:text-rose-300">{loadError}</p>
          <Button variant="outline" size="sm" className="mt-3" onClick={() => fetchRequests()}>
            Try Again
          </Button>
        </div>
      )}

      {/* Request List */}
      {!isLoading && !loadError && !isFilterEmpty && (
        <div className="space-y-3">
          {requests.map((req) => {
            const meta = statusMeta[req.status] ?? statusMeta.pending;
            const populated =
              req.userId && typeof req.userId === 'object' ? (req.userId as any) : null;
            const studentIsPremium = populated?.isPremium === true;
            const isBusy = isReviewing && reviewingId === req._id;

            return (
              <div
                key={req._id}
                className={`p-4 sm:p-5 rounded-2xl border bg-white dark:bg-slate-900 shadow-xs transition-colors ${
                  req.status === 'pending'
                    ? 'border-blue-200 dark:border-blue-900'
                    : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                  {/* Student Identity */}
                  <div className="flex items-start gap-3 min-w-0 lg:w-64 shrink-0">
                    <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 shrink-0">
                      <Crown className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                        {req.fullName || 'Unknown student'}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5 break-all">
                        <Mail className="w-3 h-3 shrink-0" />
                        {req.email}
                      </p>
                      {studentIsPremium && (
                        <span className="inline-flex items-center gap-1 mt-1.5 text-[10px] font-semibold text-amber-700 dark:text-amber-400">
                          <Crown className="w-3 h-3" />
                          Premium currently active
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Request Date */}
                  <div className="shrink-0 lg:w-44">
                    <p className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">
                      Request Date
                    </p>
                    <p className="text-xs text-slate-700 dark:text-slate-300 flex items-center gap-1 mt-1">
                      <CalendarClock className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                      {formatDate(req.createdAt)}
                    </p>
                  </div>

                  {/* Current Status */}
                  <div className="shrink-0 lg:w-32">
                    <p className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">
                      Status
                    </p>
                    <div className="mt-1">
                      <Badge variant={meta.variant} size="sm">
                        {meta.icon}
                        {meta.label}
                      </Badge>
                    </div>
                  </div>

                  {/* Admin Note */}
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">
                      Admin Note
                    </p>
                    <p
                      className={`text-xs mt-1 leading-relaxed break-words ${
                        req.adminNote
                          ? 'text-slate-700 dark:text-slate-300'
                          : 'text-slate-400 italic'
                      }`}
                    >
                      {req.adminNote ? (
                        <span className="inline-flex items-start gap-1">
                          <StickyNote className="w-3.5 h-3.5 shrink-0 mt-0.5 text-slate-400" />
                          {req.adminNote}
                        </span>
                      ) : (
                        'No note added'
                      )}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center gap-2">
                  {req.status === 'pending' ? (
                    <>
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => openReview(req, 'approved')}
                        disabled={isBusy}
                        className="flex items-center gap-1.5"
                        leftIcon={<CheckCircle2 className="w-4 h-4" />}
                      >
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => openReview(req, 'rejected')}
                        disabled={isBusy}
                        className="flex items-center gap-1.5"
                        leftIcon={<XCircle className="w-4 h-4" />}
                      >
                        Reject
                      </Button>
                    </>
                  ) : (
                    <>
                      <span className="text-xs text-slate-500 dark:text-slate-400 mr-auto">
                        Reviewed {formatDateTime(req.updatedAt || req.createdAt)}
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openReview(req, 'pending')}
                        disabled={isBusy}
                        className="flex items-center gap-1.5"
                        leftIcon={<RotateCcw className="w-4 h-4" />}
                      >
                        Move to Pending
                      </Button>
                      <Button
                        size="sm"
                        variant={req.status === 'approved' ? 'danger' : 'primary'}
                        onClick={() =>
                          openReview(req, req.status === 'approved' ? 'rejected' : 'approved')
                        }
                        disabled={isBusy}
                        className="flex items-center gap-1.5"
                        leftIcon={
                          req.status === 'approved' ? (
                            <XCircle className="w-4 h-4" />
                          ) : (
                            <CheckCircle2 className="w-4 h-4" />
                          )
                        }
                      >
                        {req.status === 'approved' ? 'Revoke' : 'Approve'}
                      </Button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Empty State */}
      {isFilterEmpty && (
        <EmptyState
          icon={<Inbox className="w-7 h-7" />}
          title={
            statusFilter === 'all' && !searchQuery
              ? 'No subscription requests yet'
              : 'No matching requests'
          }
          description={
            statusFilter === 'all' && !searchQuery
              ? 'Student premium access requests will appear here for review as soon as they are submitted.'
              : `No requests match the current ${statusFilter !== 'all' ? statusFilter : ''} filter${
                  searchQuery ? ' and search' : ''
                }. Try a different filter or clear the search.`
          }
        />
      )}

      {/* Pagination */}
      {!isLoading && !loadError && requests.length > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Showing {requests.length} of {totalCount} request{totalCount === 1 ? '' : 's'}
          </p>
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={(p) => setPage(p)} />
        </div>
      )}

      {/* Review Modal */}
      <Modal
        isOpen={!!reviewTarget}
        onClose={closeReview}
        title={reviewTarget ? reviewCopy[reviewTarget.status].title : ''}
        description={reviewTarget ? reviewCopy[reviewTarget.status].description : ''}
        maxWidth="md"
      >
        {reviewTarget && (
          <div className="space-y-4">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
              <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                {reviewTarget.request.fullName || 'Unknown student'}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 break-all mt-0.5">
                {reviewTarget.request.email}
              </p>
              <p className="text-[10px] text-slate-400 mt-1">
                Requested {formatDateTime(reviewTarget.request.createdAt)}
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                Admin Note (optional)
              </label>
              <textarea
                value={reviewNote}
                onChange={(e) => setReviewNote(e.target.value)}
                rows={3}
                maxLength={500}
                placeholder="Add a reason or confirmation message for the student..."
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-y"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Visible to the student on their dashboard. {reviewNote.length}/500
              </p>
            </div>

            {reviewTarget.status === 'approved' && (
              <div className="p-3 rounded-xl border border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/30">
                <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
                  Approving sets this student's premium flag immediately, unlocking all premium notes, solved
                  papers, and lab manuals.
                </p>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <Button type="button" variant="outline" onClick={closeReview} disabled={isReviewing}>
                Cancel
              </Button>
              <Button
                type="button"
                variant={
                  reviewTarget.status === 'approved'
                    ? 'primary'
                    : reviewTarget.status === 'rejected'
                    ? 'danger'
                    : 'outline'
                }
                onClick={confirmReview}
                isLoading={isReviewing}
              >
                {reviewCopy[reviewTarget.status].confirm}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
