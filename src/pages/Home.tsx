import React, { useEffect, useState } from 'react';
import { Course, Announcement, Resource } from '../types/index.js';
import { useAuth } from '../context/AuthContext.js';
import { useToast } from '../context/ToastContext.js';
import { CourseCard } from '../components/ui/CourseCard.js';
import { ResourceCard } from '../components/ui/ResourceCard.js';
import { Button } from '../components/ui/Button.js';
import { Badge } from '../components/ui/Badge.js';
import { CardSkeleton } from '../components/ui/LoadingSkeleton.js';
import { AdvertisementCard } from '../components/ui/AdvertisementCard.js';
import {
  Sparkles,
  ArrowRight,
  ChevronRight,
  Bell,
} from 'lucide-react';

import {
  HeroSection,
  StatsSection,
  FeaturesSection,
  CategoriesSection,
  SemesterStrip,
  WhySection,
  LatestResourcesSection,
  CommunitySection,
  AnnouncementsStrip,
  FeaturedCoursesSection,
  SponsorSection,
  FinalCtaSection,
} from '../components/home/index.js';

interface HomeProps {
  navigate: (path: string) => void;
}

export const Home: React.FC<HomeProps> = ({ navigate }) => {
  const { user } = useAuth();
  const { success, error } = useToast();
  const [courses, setCourses] = useState<Course[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isRequestingPremium, setIsRequestingPremium] = useState(false);
  const [premiumRequested, setPremiumRequested] = useState(false);

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        const [cRes, aRes, rRes] = await Promise.all([
          fetch('/api/courses?limit=6'),
          fetch('/api/announcements'),
          fetch('/api/resources?limit=4'),
        ]);

        if (cRes.ok) {
          const cData = await cRes.json();
          setCourses(cData.courses || []);
        }
        if (aRes.ok) {
          const aData = await aRes.json();
          setAnnouncements(Array.isArray(aData) ? aData.slice(0, 3) : []);
        }
        if (rRes.ok) {
          const rData = await rRes.json();
          setResources(rData.items || rData.resources || []);
        }
      } catch (err) {
        console.error('Error fetching home data:', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadHomeData();
  }, []);

  const handleDownload = async (res: Resource) => {
    if (!res.fileUrl) {
      error('Premium subscription required to download this material.');
      return;
    }
    try {
      await fetch(`/api/resources/${res._id}/download`, { method: 'POST' });
      window.open(res.fileUrl, '_blank');
    } catch (e) {
      window.open(res.fileUrl, '_blank');
    }
  };

  const handleRequestPremium = async () => {
    if (!user || isRequestingPremium) return;
    setIsRequestingPremium(true);
    try {
      const res = await fetch('/api/subscriptions/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('hamro_bca_token') || ''}`,
        },
        body: JSON.stringify({ fullName: user.name, email: user.email }),
      });
      const data = await res.json();
      if (!res.ok) {
        error(data.error || 'Failed to submit premium access request');
        if (res.status === 409) setPremiumRequested(true);
      } else {
        success('Premium access request submitted for review.');
        setPremiumRequested(true);
      }
    } catch (err: any) {
      error(err.message || 'Request failed');
    } finally {
      setIsRequestingPremium(false);
    }
  };

  const isPremiumViewer = user?.isPremium === true;
  const isAuthenticated = !!user;

  return (
    <div className="flex flex-col">
      <HeroSection navigate={navigate} isAuthenticated={isAuthenticated} />
      <StatsSection />
      <FeaturesSection />
      <CategoriesSection navigate={navigate} />

      {/* Preserved: semester quick selector */}
      <SemesterStrip navigate={navigate} />

      <WhySection />
      <LatestResourcesSection
        resources={resources}
        isLoading={isLoading}
        navigate={navigate}
        isAuthenticated={isAuthenticated}
        isPremiumViewer={isPremiumViewer}
        isPremiumRequestPending={premiumRequested || isRequestingPremium}
        onDownload={handleDownload}
        onRequestPremium={handleRequestPremium}
      />

      {/* Preserved: announcements */}
      <AnnouncementsStrip announcements={announcements} navigate={navigate} />

      {/* Preserved: featured courses */}
      <FeaturedCoursesSection courses={courses} isLoading={isLoading} navigate={navigate} />

      <CommunitySection navigate={navigate} isAuthenticated={isAuthenticated} />

      {/* Preserved: ad banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <AdvertisementCard placement="homepage" variant="banner" navigate={navigate} />
      </section>

      <SponsorSection navigate={navigate} />
      <FinalCtaSection navigate={navigate} isAuthenticated={isAuthenticated} />
    </div>
  );
};
