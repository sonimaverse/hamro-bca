import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { useToast } from '../context/ToastContext.js';
import { Course, Enrollment, Resource, Announcement } from '../types/index.js';
import { StatCard } from '../components/ui/StatCard.js';
import { CourseCard } from '../components/ui/CourseCard.js';
import { ResourceCard } from '../components/ui/ResourceCard.js';
import { Badge } from '../components/ui/Badge.js';
import { Button } from '../components/ui/Button.js';
import { EmptyState } from '../components/ui/EmptyState.js';
import { AdvertisementCard } from '../components/ui/AdvertisementCard.js';
import { PremiumStatusCard, PremiumRequestState } from '../components/ui/PremiumStatusCard.js';
import {
  GraduationCap,
  BookOpen,
  Award,
  Clock,
  Sparkles,
  ArrowRight,
  FolderDown,
  Bell,
} from 'lucide-react';

interface StudentDashboardProps {
  navigate: (path: string) => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({ navigate }) => {
  const { user, token } = useAuth();
  const { success, error } = useToast();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [recentResources, setRecentResources] = useState<Resource[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Premium Subscription State
  const [premiumState, setPremiumState] = useState<PremiumRequestState>('none');
  const [premiumNote, setPremiumNote] = useState<string>('');
  const [isPremiumLoading, setIsPremiumLoading] = useState(true);
  const [isRequestingPremium, setIsRequestingPremium] = useState(false);

  const fetchPremiumStatus = async () => {
    if (!token) {
      setIsPremiumLoading(false);
      return;
    }
    try {
      const res = await fetch('/api/subscriptions/my-request', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        setPremiumState(user?.isPremium ? 'approved' : 'none');
        return;
      }
      const data = await res.json();
      const requests: any[] = Array.isArray(data.requests) ? data.requests : [];

      // The approval flag on the user is authoritative for the unlocked state.
      if (user?.isPremium) {
        setPremiumState('approved');
        return;
      }

      if (requests.length === 0) {
        setPremiumState('none');
        return;
      }

      // The API returns requests newest-first.
      const latest = requests[0];
      setPremiumNote(latest.adminNote || '');
      setPremiumState(latest.status === 'approved' ? 'approved' : latest.status === 'pending' ? 'pending' : 'rejected');
    } catch (err) {
      console.warn('Failed to load premium status', err);
      setPremiumState(user?.isPremium ? 'approved' : 'none');
    } finally {
      setIsPremiumLoading(false);
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
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ fullName: user.name, email: user.email }),
      });

      const data = await res.json();
      if (!res.ok) {
        error(data.error || 'Failed to submit premium access request');
        if (res.status === 409) {
          setPremiumState('pending');
        }
      } else {
        success('Premium access request submitted for review.');
        setPremiumState('pending');
        setPremiumNote('');
      }
    } catch (err: any) {
      error(err.message || 'Request failed');
    } finally {
      setIsRequestingPremium(false);
    }
  };

  useEffect(() => {
    const fetchStudentData = async () => {
      setIsLoading(true);
      try {
        const headers: Record<string, string> = { Authorization: `Bearer ${token}` };

        const [enRes, resRes, annRes] = await Promise.all([
          fetch('/api/courses/enrolled/my', { headers }),
          fetch(`/api/resources?semester=${user?.semester || 1}&limit=4`),
          fetch('/api/announcements', { headers }),
        ]);

        if (enRes.ok) {
          const enData = await enRes.json();
          setEnrollments(enData);
        }

        if (resRes.ok) {
          const rData = await resRes.json();
          setRecentResources(rData.resources || []);
        }

        if (annRes.ok) {
          const aData = await annRes.json();
          setAnnouncements(aData.slice(0, 3) || []);
        }
      } catch (err) {
        console.error('Error fetching student dashboard', err);
      } finally {
        setIsLoading(false);
      }
    };

    if (token) fetchStudentData();
  }, [token, user?.semester]);

  useEffect(() => {
    if (token) {
      fetchPremiumStatus();
    } else {
      setIsPremiumLoading(false);
    }
  }, [token, user?.isPremium]);

  const totalEnrolled = enrollments.length;
  const completedCourses = enrollments.filter((e) => e.progress === 100).length;
  const averageProgress = totalEnrolled > 0
    ? Math.round(enrollments.reduce((acc, e) => acc + (e.progress || 0), 0) / totalEnrolled)
    : 0;

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-xs font-semibold mb-3 backdrop-blur-xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Active BCA Semester {user?.semester || 1} Scholar</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-outfit">
            Namaste, {user?.name}!
          </h1>
          <p className="text-xs sm:text-sm text-blue-100 mt-2 leading-relaxed">
            Welcome to your academic workspace. Keep track of course completion, access verified semester handouts, and view university examination alerts.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate('/courses')}
              rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
            >
              Browse All Semester Courses
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-white border-white/40 hover:bg-white/10"
              onClick={() => navigate('/resources')}
            >
              Semester {user?.semester || 1} Notes
            </Button>
          </div>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Enrolled Courses"
          value={totalEnrolled}
          icon={<BookOpen className="w-6 h-6" />}
          color="blue"
          description="Active learning modules"
        />
        <StatCard
          label="Average Progress"
          value={`${averageProgress}%`}
          icon={<Clock className="w-6 h-6" />}
          color="emerald"
          description="Across enrolled subjects"
        />
        <StatCard
          label="Completed Courses"
          value={completedCourses}
          icon={<Award className="w-6 h-6" />}
          color="purple"
          description="100% finished curriculum"
        />
      </div>

      {/* Premium Subscription Status */}
      <PremiumStatusCard
        state={premiumState}
        adminNote={premiumNote}
        isLoading={isPremiumLoading}
        isSubmitting={isRequestingPremium}
        onRequest={handleRequestPremium}
      />

      {/* Enrolled Courses Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 font-outfit">
              My Enrolled Courses
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Continue where you left off or check off completed topics
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/courses')}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Find More Courses
          </Button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse"></div>
            <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse"></div>
          </div>
        ) : enrollments.length === 0 ? (
          <EmptyState
            icon={<GraduationCap className="w-8 h-8 text-blue-500" />}
            title="No Course Enrollments Yet"
            description="You haven't enrolled in any BCA courses yet. Explore your semester curriculum and begin learning."
            actionText="Browse Courses"
            onAction={() => navigate('/courses')}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {enrollments.map((item) => {
              const courseObj = typeof item.course === 'object' ? item.course : null;
              if (!courseObj) return null;
              return (
                <CourseCard
                  key={courseObj._id}
                  course={courseObj}
                  onSelect={(c) => navigate(`/courses/${c._id}`)}
                  isEnrolled={true}
                  progress={item.progress}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Career, Hackathon & Opportunities Spotlight */}
      <AdvertisementCard
        placement="student_dashboard"
        variant="banner"
        navigate={navigate}
      />

      {/* Recommended Semester Notes */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 font-outfit">
              Handouts for Semester {user?.semester || 1}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Verified lecture slides, PDFs, and model questions for your active semester
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/resources?semester=${user?.semester || 1}`)}
          >
            View All
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {recentResources.map((res) => (
            <ResourceCard
              key={res._id}
              resource={res}
              isPremiumViewer={user?.isPremium === true}
              isAuthenticated={!!user}
              isPremiumRequestPending={premiumState === 'pending' || isRequestingPremium}
              onRequestPremium={handleRequestPremium}
              onDownload={(r) => {
                if (!r.fileUrl) {
                  error('Premium subscription required to download this material.');
                  return;
                }
                fetch(`/api/resources/${r._id}/download`, { method: 'POST' });
                window.open(r.fileUrl, '_blank');
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
