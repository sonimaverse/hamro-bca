import React, { useEffect, useState, useRef } from 'react';
import { Advertisement, AdPlacement } from '../../types/index.js';
import { ExternalLink, Sparkles, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';

interface AdvertisementCardProps {
  placement: AdPlacement;
  variant?: 'banner' | 'card' | 'sidebar' | 'compact';
  className?: string;
  ad?: Advertisement; // If provided, used directly (e.g., live preview in admin)
  onAdLoaded?: (ad: Advertisement | null) => void;
  navigate?: (path: string) => void;
}

export const AdvertisementCard: React.FC<AdvertisementCardProps> = ({
  placement,
  variant = 'card',
  className = '',
  ad: fixedAd,
  onAdLoaded,
  navigate,
}) => {
  const { user } = useAuth();
  const [ad, setAd] = useState<Advertisement | null>(fixedAd || null);
  const [isLoading, setIsLoading] = useState(!fixedAd);
  const impressionTrackedRef = useRef(false);

  useEffect(() => {
    if (fixedAd) {
      setAd(fixedAd);
      setIsLoading(false);
      return;
    }

    let isMounted = true;
    const fetchActiveAd = async () => {
      try {
        const audience = user?.role === 'student' ? 'students' : user?.role === 'teacher' ? 'teachers' : 'all';
        const res = await fetch(`/api/advertisements/active?placement=${placement}&audience=${audience}`);
        if (res.ok) {
          const ads: Advertisement[] = await res.json();
          if (isMounted) {
            if (ads && ads.length > 0) {
              // Pick highest priority or first eligible
              const selected = ads[0];
              setAd(selected);
              onAdLoaded?.(selected);
            } else {
              setAd(null);
              onAdLoaded?.(null);
            }
          }
        }
      } catch (err) {
        console.error('Error fetching active advertisement:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchActiveAd();

    return () => {
      isMounted = false;
    };
  }, [placement, user?.role, fixedAd]);

  // Track Impression once per mount
  useEffect(() => {
    if (!ad || !ad._id || fixedAd || impressionTrackedRef.current) return;

    impressionTrackedRef.current = true;
    fetch(`/api/advertisements/${ad._id}/impression`, {
      method: 'POST',
    }).catch((err) => console.debug('Impression track error:', err));
  }, [ad?._id, fixedAd]);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!ad) return;

    // Track click
    if (ad._id && !fixedAd) {
      fetch(`/api/advertisements/${ad._id}/click`, {
        method: 'POST',
      }).catch((err) => console.debug('Click track error:', err));
    }

    const url = ad.buttonUrl || '#';
    if (url.startsWith('http://') || url.startsWith('https://')) {
      window.open(url, '_blank', 'noopener,noreferrer');
    } else if (navigate) {
      navigate(url);
    } else {
      window.location.href = url;
    }
  };

  if (isLoading) {
    return (
      <div className={`rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 p-6 animate-pulse ${className}`}>
        <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded-full mb-3" />
        <div className="h-6 w-3/4 bg-slate-200 dark:bg-slate-700 rounded-lg mb-2" />
        <div className="h-4 w-1/2 bg-slate-200 dark:bg-slate-700 rounded-lg" />
      </div>
    );
  }

  if (!ad) return null;

  // Render Variant: Banner (Horizontal Wide)
  if (variant === 'banner') {
    return (
      <div
        id={`ad-banner-${ad._id || 'preview'}`}
        className={`relative overflow-hidden rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-linear-to-r from-slate-900 via-slate-800 to-blue-950 text-white shadow-md group ${className}`}
      >
        <div className="absolute inset-0 bg-radial-at-c from-blue-600/10 via-transparent to-transparent opacity-60 pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6 p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 max-w-3xl">
            {ad.imageUrl && (
              <div className="w-20 h-20 sm:w-24 sm:h-24 shrink-0 rounded-xl overflow-hidden bg-slate-800 border border-white/10 shadow-sm">
                <img
                  src={ad.imageUrl}
                  alt={ad.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  referrerPolicy="no-referrer"
                />
              </div>
            )}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-500/20 text-blue-300 border border-blue-400/30">
                  <Sparkles className="w-3 h-3 text-blue-400" />
                  Sponsored Spotlight
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold tracking-tight text-white line-clamp-1">
                {ad.title}
              </h3>
              {ad.description && (
                <p className="text-sm text-slate-300 line-clamp-2 mt-1 leading-relaxed">
                  {ad.description}
                </p>
              )}
            </div>
          </div>

          <div className="shrink-0 w-full sm:w-auto">
            <button
              onClick={handleClick}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold shadow-md hover:shadow-lg transition-all cursor-pointer group-hover:translate-x-0.5"
            >
              <span>{ad.buttonText || 'Learn More'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Render Variant: Sidebar (Vertical Compact)
  if (variant === 'sidebar') {
    return (
      <div
        id={`ad-sidebar-${ad._id || 'preview'}`}
        className={`rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs hover:border-blue-400/40 dark:hover:border-blue-500/40 transition-all flex flex-col group ${className}`}
      >
        <div className="flex items-center justify-between mb-3">
          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
            Partner
          </span>
          <span className="text-[10px] text-slate-400">Ad</span>
        </div>

        {ad.imageUrl && (
          <div className="w-full h-32 rounded-xl overflow-hidden mb-3 bg-slate-100 dark:bg-slate-800 border border-slate-100 dark:border-slate-800/80">
            <img
              src={ad.imageUrl}
              alt={ad.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              referrerPolicy="no-referrer"
            />
          </div>
        )}

        <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 line-clamp-2 leading-snug">
          {ad.title}
        </h4>

        {ad.description && (
          <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mt-1.5 leading-relaxed">
            {ad.description}
          </p>
        )}

        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/60">
          <button
            onClick={handleClick}
            className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 dark:hover:text-white transition-colors cursor-pointer"
          >
            <span>{ad.buttonText || 'Learn More'}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  }

  // Render Variant: Compact Strip
  if (variant === 'compact') {
    return (
      <div
        id={`ad-compact-${ad._id || 'preview'}`}
        className={`flex items-center justify-between gap-4 p-3.5 rounded-xl border border-blue-200/60 dark:border-blue-900/40 bg-blue-50/70 dark:bg-blue-950/30 text-slate-800 dark:text-slate-200 ${className}`}
      >
        <div className="flex items-center gap-3 min-w-0">
          {ad.imageUrl && (
            <img
              src={ad.imageUrl}
              alt={ad.title}
              className="w-10 h-10 rounded-lg object-cover shrink-0 border border-blue-200 dark:border-blue-900"
              referrerPolicy="no-referrer"
            />
          )}
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                Ad
              </span>
              <h5 className="text-xs sm:text-sm font-bold truncate text-slate-900 dark:text-slate-100">
                {ad.title}
              </h5>
            </div>
            {ad.description && (
              <p className="text-xs text-slate-600 dark:text-slate-400 truncate hidden sm:block">
                {ad.description}
              </p>
            )}
          </div>
        </div>

        <button
          onClick={handleClick}
          className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
        >
          <span>{ad.buttonText || 'Explore'}</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>
    );
  }

  // Default Variant: Bento / Grid Card
  return (
    <div
      id={`ad-card-${ad._id || 'preview'}`}
      className={`rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group relative overflow-hidden ${className}`}
    >
      <div className="absolute top-3 right-3 z-10">
        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100/90 dark:bg-slate-800/90 backdrop-blur-xs text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
          <Sparkles className="w-2.5 h-2.5 text-amber-500" />
          Sponsored
        </span>
      </div>

      <div>
        {ad.imageUrl && (
          <div className="w-full h-44 rounded-xl overflow-hidden mb-4 bg-slate-100 dark:bg-slate-800 relative">
            <img
              src={ad.imageUrl}
              alt={ad.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              referrerPolicy="no-referrer"
            />
          </div>
        )}

        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 leading-snug line-clamp-2">
          {ad.title}
        </h3>

        {ad.description && (
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-2 line-clamp-3 leading-relaxed">
            {ad.description}
          </p>
        )}
      </div>

      <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
        <span className="text-[11px] text-slate-400 font-medium">Verified Partner</span>
        <button
          onClick={handleClick}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors cursor-pointer shadow-xs"
        >
          <span>{ad.buttonText || 'Learn More'}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
