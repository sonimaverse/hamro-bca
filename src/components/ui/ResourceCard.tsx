import React from 'react';
import { Resource } from '../../types/index.js';
import { Badge } from './Badge.js';
import { Button } from './Button.js';
import {
  FileText,
  FileCode,
  HelpCircle,
  ClipboardList,
  Presentation,
  Download,
  Calendar,
  Layers,
  User,
  Image,
  File,
  Lock,
  Crown,
  Clock,
} from 'lucide-react';

interface ResourceCardProps {
  resource: Resource;
  onDownload: (res: Resource) => void;
  onDelete?: (res: Resource) => void;
  canManage?: boolean;
  showUploader?: boolean;
  isPremiumViewer?: boolean;
  isAuthenticated?: boolean;
  onRequestPremium?: () => void;
  isPremiumRequestPending?: boolean;
}

const imageMimes = ['image/jpeg', 'image/png', 'image/webp'];

function isImageFile(resource: Resource): boolean {
  const ext = resource.fileName?.split('.').pop()?.toLowerCase();
  return ['jpg', 'jpeg', 'png', 'webp'].includes(ext || '');
}

export const ResourceCard: React.FC<ResourceCardProps> = ({
  resource,
  onDownload,
  onDelete,
  canManage = false,
  showUploader = false,
  isPremiumViewer = false,
  isAuthenticated = false,
  onRequestPremium,
  isPremiumRequestPending = false,
}) => {
  const typeIcons = {
    PDF: <FileText className="w-5 h-5 text-rose-500" />,
    Notes: <FileCode className="w-5 h-5 text-blue-500" />,
    'Past Questions': <HelpCircle className="w-5 h-5 text-amber-500" />,
    Assignments: <ClipboardList className="w-5 h-5 text-emerald-500" />,
    Slides: <Presentation className="w-5 h-5 text-purple-500" />,
    Other: <FileText className="w-5 h-5 text-slate-500" />,
  };

  const badgeVariants: Record<string, 'rose' | 'blue' | 'amber' | 'emerald' | 'purple' | 'slate'> = {
    PDF: 'rose',
    Notes: 'blue',
    'Past Questions': 'amber',
    Assignments: 'emerald',
    Slides: 'purple',
    Other: 'slate',
  };

  const showImagePreview =
    isImageFile(resource) && !!resource.fileUrl && !resource.fileUrl.includes('github.com');

  const isPremium = resource.isPremiumContent === true;
  // The backend nulls fileUrl for locked rows, so a missing URL is treated as locked too.
  const isLocked = isPremium && !isPremiumViewer;
  // Non-premium resources keep their existing download behaviour untouched.
  const canDownload = isPremium ? isPremiumViewer && !!resource.fileUrl : true;
  const isPremiumViewerWithoutFile = isPremium && isPremiumViewer && !resource.fileUrl;

  return (
    <div
      className={`flex flex-col justify-between p-5 rounded-2xl bg-white dark:bg-slate-900 border shadow-xs transition-all ${
        isLocked
          ? 'border-amber-300 dark:border-amber-800/70'
          : 'border-slate-200 dark:border-slate-800 hover:shadow-lg'
      }`}
    >
      <div>
        {isLocked && (
          <div className="relative mb-3 flex items-center justify-center gap-2 rounded-xl border border-amber-200 dark:border-amber-800/70 bg-amber-50 dark:bg-amber-950/40 px-3 py-4 text-center">
            <Lock className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <span className="text-xs font-semibold text-amber-800 dark:text-amber-300">
              {isAuthenticated ? 'Premium subscription required' : 'Login to access premium resources'}
            </span>
          </div>
        )}

        {showImagePreview && (
          <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 mb-3">
            <img
              src={resource.fileUrl as string}
              alt={resource.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.nextElementSibling?.classList.remove('hidden');
              }}
            />
            <div className="hidden absolute inset-0 flex items-center justify-center bg-slate-100 dark:bg-slate-800">
              <FileText className="w-10 h-10 text-slate-400" />
            </div>
          </div>
        )}

        <div className="flex items-start justify-between gap-3 mb-3">
          {!showImagePreview && (
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 shrink-0">
              {typeIcons[resource.type] || <FileText className="w-5 h-5 text-blue-500" />}
            </div>
          )}
          <div className="flex flex-wrap gap-1.5 justify-end">
            {isPremium && (
              <Badge variant="amber" size="sm">
                <Crown className="w-3 h-3" />
                Premium
              </Badge>
            )}
            {isLocked && (
              <Badge variant="slate" size="sm">
                <Lock className="w-3 h-3" />
                Locked
              </Badge>
            )}
            <Badge variant={badgeVariants[resource.type] || 'blue'} size="sm">
              {resource.type}
            </Badge>
            <Badge variant="slate" size="sm">
              Sem {resource.semester}
            </Badge>
          </div>
        </div>

        <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 line-clamp-2 leading-snug">
          {resource.title}
        </h4>

        <p className="text-xs font-medium text-blue-600 dark:text-blue-400 mt-1 line-clamp-1">
          {resource.subject}
        </p>

        {resource.description && (
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-2 leading-relaxed">
            {resource.description}
          </p>
        )}

        {showUploader && resource.uploaderName && (
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 flex items-center gap-1">
            <User className="w-3 h-3" />
            Shared by {resource.uploaderName}
          </p>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
        {!isLocked && (
          <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mb-3">
            <span className="flex items-center gap-1">
              <Layers className="w-3.5 h-3.5" />
              {resource.fileSize || '1.4 MB'}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {new Date(resource.createdAt).toLocaleDateString()}
            </span>
          </div>
        )}

        <div className="flex items-center gap-2">
          {canDownload ? (
            <Button
              size="sm"
              variant="outline"
              className="flex-1"
              onClick={() => onDownload(resource)}
              leftIcon={<Download className="w-3.5 h-3.5" />}
            >
              Download ({resource.downloads || 0})
            </Button>
          ) : (
            <div className="flex-1 space-y-2">
              {isPremiumViewerWithoutFile ? (
                <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                  This material is temporarily unavailable. Please try again later.
                </p>
              ) : (
                <>
                  <p className="text-[11px] font-medium text-amber-700 dark:text-amber-400">
                    {isAuthenticated
                      ? 'Premium subscription required'
                      : 'Login to access premium resources'}
                  </p>
                  {isAuthenticated ? (
                    isPremiumRequestPending ? (
                      <div className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-blue-200 bg-blue-50 px-3 py-1.5 text-[11px] font-semibold text-blue-700 dark:border-blue-800 dark:bg-blue-950/60 dark:text-blue-300">
                        <Clock className="w-3.5 h-3.5" />
                        Request Pending
                      </div>
                    ) : (
                      onRequestPremium && (
                        <Button
                          size="sm"
                          variant="primary"
                          className="w-full"
                          onClick={onRequestPremium}
                          leftIcon={<Crown className="w-3.5 h-3.5" />}
                        >
                          Request Premium Access
                        </Button>
                      )
                    )
                  ) : (
                    onRequestPremium && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full"
                        onClick={onRequestPremium}
                        leftIcon={<Lock className="w-3.5 h-3.5" />}
                      >
                        Log In to Unlock
                      </Button>
                    )
                  )}
                </>
              )}
            </div>
          )}
          {canManage && onDelete && (
            <Button
              size="sm"
              variant="danger"
              onClick={() => onDelete(resource)}
            >
              Delete
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
