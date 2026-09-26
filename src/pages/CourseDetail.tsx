import React, { useEffect, useState } from 'react';
import { Course, Enrollment, Resource } from '../types/index.js';
import { useAuth } from '../context/AuthContext.js';
import { useToast } from '../context/ToastContext.js';
import { Button } from '../components/ui/Button.js';
import { Badge } from '../components/ui/Badge.js';
import { ResourceCard } from '../components/ui/ResourceCard.js';
import {
  BookOpen,
  CheckCircle2,
  Circle,
  Clock,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  Users,
  Award,
  Sparkles,
  FileText,
  Lock,
} from 'lucide-react';

interface CourseDetailProps {
  courseId: string;
  navigate: (path: string) => void;
}

export const CourseDetail: React.FC<CourseDetailProps> = ({ courseId, navigate }) => {
  const { user, token } = useAuth();
  const { success, error } = useToast();

  const [course, setCourse] = useState<Course | null>(null);
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [resources, setResources] = useState<Resource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({});

  const fetchCourseData = async () => {
    setIsLoading(true);
    try {
      const headers: Record<string, string> = {};
      if (token) headers.Authorization = `Bearer ${token}`;

      const res = await fetch(`/api/courses/${courseId}`, { headers });
      if (res.ok) {
        const data = await res.json();
        setCourse(data.course);
        setEnrollment(data.enrollment);

        // Expand first module by default
        if (data.course?.modules?.length > 0) {
          setExpandedModules({ [data.course.modules[0].id]: true });
        }

        // Fetch associated course resources
        const resRes = await fetch(`/api/resources?subject=${encodeURIComponent(data.course.subject)}`);
        if (resRes.ok) {
          const rData = await resRes.json();
          setResources(rData.resources || []);
        }
      }
    } catch (err) {
      console.error('Failed to load course details', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCourseData();
  }, [courseId, token]);

  const handleEnroll = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    setIsEnrolling(true);
    try {
      const res = await fetch(`/api/courses/${courseId}/enroll`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (!res.ok) {
        error(data.error || 'Enrollment failed');
      } else {
        success('Successfully enrolled in course! You can now track your progress.');
        setEnrollment(data.enrollment);
      }
    } catch (err: any) {
      error(err.message || 'Failed to complete enrollment');
    } finally {
      setIsEnrolling(false);
    }
  };

  const handleToggleLesson = async (lessonId: string) => {
    if (!enrollment) return;

    const isCompleted = enrollment.completedLessons.includes(lessonId);
    try {
      const res = await fetch(`/api/courses/${courseId}/progress`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          lessonId,
          completed: !isCompleted,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setEnrollment(data.enrollment);
      }
    } catch (err) {
      console.error('Failed to update lesson progress', err);
    }
  };

  const toggleModuleAccordion = (modId: string) => {
    setExpandedModules((prev) => ({ ...prev, [modId]: !prev[modId] }));
  };

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
          Loading course syllabus & modules...
        </p>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">
          Course Not Found
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 mb-6">
          The requested course could not be located or has been archived.
        </p>
        <Button onClick={() => navigate('/courses')} leftIcon={<ArrowLeft className="w-4 h-4" />}>
          Back to Courses
        </Button>
      </div>
    );
  }

  const totalLessons = course.modules?.reduce((acc, m) => acc + (m.lessons?.length || 0), 0) || 0;
  const completedCount = enrollment?.completedLessons?.length || 0;
  const progressPct = enrollment ? enrollment.progress : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back Button */}
      <button
        onClick={() => navigate('/courses')}
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-blue-600 transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Curriculum
      </button>

      {/* Hero Course Banner */}
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
        <div className="grid grid-cols-1 lg:grid-cols-3">
          <div className="p-6 sm:p-8 lg:col-span-2 flex flex-col justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <Badge variant="blue" size="md">
                  Semester {course.semester}
                </Badge>
                <Badge variant="slate" size="md">
                  {course.subject}
                </Badge>
                {enrollment && (
                  <Badge variant="emerald" size="md">
                    Enrolled ({progressPct}%)
                  </Badge>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-slate-100 font-outfit">
                {course.title}
              </h1>

              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-3 leading-relaxed">
                {course.description}
              </p>

              <div className="flex flex-wrap items-center gap-6 mt-6 text-xs text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-slate-400" />
                  <span>{course.enrolledCount || 0} Registered Scholars</span>
                </div>
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-slate-400" />
                  <span>{totalLessons} Modules & Topics</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-slate-400" />
                  <span>Faculty: {course.instructorName || 'TU BCA Faculty'}</span>
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
              {enrollment ? (
                <div className="flex-1 max-w-md">
                  <div className="flex justify-between text-xs font-semibold mb-1.5">
                    <span className="text-slate-700 dark:text-slate-300">
                      Completed {completedCount} of {totalLessons} topics
                    </span>
                    <span className="text-blue-600 dark:text-blue-400 font-bold">
                      {progressPct}%
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600 rounded-full transition-all duration-300"
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                </div>
              ) : (
                <Button
                  size="lg"
                  onClick={handleEnroll}
                  isLoading={isEnrolling}
                  leftIcon={<Sparkles className="w-4 h-4" />}
                >
                  Enroll in This Course
                </Button>
              )}
            </div>
          </div>

          {/* Course Visual Thumbnail */}
          <div className="relative h-64 lg:h-auto overflow-hidden bg-slate-100 dark:bg-slate-800">
            <img
              src={course.thumbnail}
              alt={course.title}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      </div>

      {/* Curriculum Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Modules & Lessons Section */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 font-outfit">
              Syllabus & Course Modules
            </h3>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {enrollment ? 'Click checkboxes to mark topic completed' : 'Enroll to track learning progress'}
            </span>
          </div>

          <div className="space-y-3">
            {course.modules?.map((mod, idx) => {
              const isOpen = !!expandedModules[mod.id];
              return (
                <div
                  key={mod.id || idx}
                  className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs"
                >
                  {/* Module Header */}
                  <button
                    onClick={() => toggleModuleAccordion(mod.id)}
                    className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 bg-slate-50/50 dark:bg-slate-900/50 hover:bg-slate-100/50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                          Module {idx + 1}
                        </span>
                        {mod.duration && (
                          <span className="text-[11px] text-slate-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {mod.duration}
                          </span>
                        )}
                      </div>
                      <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                        {mod.title}
                      </h4>
                      {mod.description && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          {mod.description}
                        </p>
                      )}
                    </div>
                    {isOpen ? (
                      <ChevronUp className="w-5 h-5 text-slate-400 shrink-0" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-slate-400 shrink-0" />
                    )}
                  </button>

                  {/* Lessons List */}
                  {isOpen && (
                    <div className="p-4 sm:p-5 pt-2 divide-y divide-slate-100 dark:divide-slate-800">
                      {mod.lessons?.map((lesson, lIdx) => {
                        const isDone = enrollment?.completedLessons?.includes(lesson.id);
                        return (
                          <div
                            key={lesson.id || lIdx}
                            className="py-3 flex items-center justify-between gap-3 text-xs sm:text-sm"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              {enrollment ? (
                                <button
                                  onClick={() => handleToggleLesson(lesson.id)}
                                  className="text-blue-600 dark:text-blue-400 hover:scale-110 transition-transform shrink-0 cursor-pointer"
                                  aria-label="Toggle lesson completion"
                                >
                                  {isDone ? (
                                    <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-50 dark:fill-emerald-950" />
                                  ) : (
                                    <Circle className="w-5 h-5 text-slate-300 dark:text-slate-600" />
                                  )}
                                </button>
                              ) : (
                                <span className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 flex items-center justify-center text-[10px] font-bold shrink-0">
                                  {lIdx + 1}
                                </span>
                              )}
                              <span
                                className={`font-medium truncate ${
                                  isDone
                                    ? 'line-through text-slate-400 dark:text-slate-500'
                                    : 'text-slate-800 dark:text-slate-200'
                                }`}
                              >
                                {lesson.title}
                              </span>
                            </div>
                            {lesson.duration && (
                              <span className="text-[11px] text-slate-400 shrink-0">
                                {lesson.duration}
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Course Documents & Handouts Sidebar */}
        <div className="space-y-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 font-outfit">
            Course Documents & Notes
          </h3>

          {resources.length === 0 ? (
            <div className="p-6 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-center text-xs text-slate-500 dark:text-slate-400">
              No supplementary notes attached to this subject yet.
            </div>
          ) : (
            <div className="space-y-3">
              {resources.map((res) => {
                const isLocked = res.isPremiumContent === true && !res.fileUrl;
                return (
                <div
                  key={res._id}
                  className={`p-4 rounded-xl bg-white dark:bg-slate-900 border flex items-center justify-between gap-3 shadow-xs ${
                    isLocked ? 'border-amber-300 dark:border-amber-800/70' : 'border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <div className="min-w-0 flex items-center gap-3">
                    {isLocked ? (
                      <Lock className="w-5 h-5 text-amber-500 shrink-0" />
                    ) : (
                      <FileText className="w-5 h-5 text-blue-500 shrink-0" />
                    )}
                    <div>
                      <h5 className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                        {res.title}
                        {res.isPremiumContent === true && (
                          <span className="ml-2 text-[10px] font-semibold text-amber-600 dark:text-amber-400">
                            PREMIUM
                          </span>
                        )}
                      </h5>
                      <span className="text-[10px] text-slate-400">
                        {isLocked
                          ? 'Premium subscription required'
                          : `${res.type} • ${res.fileSize || '1.2 MB'}`}
                      </span>
                    </div>
                  </div>
                  {isLocked ? (
                    <span className="text-[10px] font-semibold text-amber-700 dark:text-amber-400 shrink-0">
                      Locked
                    </span>
                  ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      if (!res.fileUrl) return;
                      fetch(`/api/resources/${res._id}/download`, { method: 'POST' });
                      window.open(res.fileUrl, '_blank');
                    }}
                  >
                    View
                  </Button>
                  )}
                </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
