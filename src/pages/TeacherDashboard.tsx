import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { useToast } from '../context/ToastContext.js';
import { Course, TeacherStats, Enrollment, Resource } from '../types/index.js';
import { StatCard } from '../components/ui/StatCard.js';
import { Button } from '../components/ui/Button.js';
import { Input } from '../components/ui/Input.js';
import { Badge } from '../components/ui/Badge.js';
import { Modal } from '../components/ui/Modal.js';
import { ConfirmDialog } from '../components/ui/ConfirmDialog.js';
import { FileUploader } from '../components/ui/FileUploader.js';
import { EmptyState } from '../components/ui/EmptyState.js';
import {
  BookOpen,
  Users,
  FolderDown,
  Plus,
  Edit2,
  Trash2,
  Eye,
  CheckSquare,
  UploadCloud,
} from 'lucide-react';

interface TeacherDashboardProps {
  navigate: (path: string) => void;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ navigate }) => {
  const { user, token } = useAuth();
  const { success, error } = useToast();

  const [stats, setStats] = useState<TeacherStats>({
    totalCourses: 0,
    totalResources: 0,
    totalStudents: 0,
    recentCourses: [],
  });
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Create Course Modal State
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [courseTitle, setCourseTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [semester, setSemester] = useState(1);
  const [description, setDescription] = useState('');
  const [thumbnail, setThumbnail] = useState('');
  const [moduleTitle, setModuleTitle] = useState('');
  const [moduleLessons, setModuleLessons] = useState('');
  const [isSavingCourse, setIsSavingCourse] = useState(false);

  // Student Roster Modal
  const [rosterCourse, setRosterCourse] = useState<Course | null>(null);
  const [rosterStudents, setRosterStudents] = useState<Enrollment[]>([]);
  const [loadingRoster, setLoadingRoster] = useState(false);

  // Delete Dialog
  const [deleteCourseItem, setDeleteCourseItem] = useState<Course | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchTeacherData = async () => {
    setIsLoading(true);
    try {
      const headers: Record<string, string> = { Authorization: `Bearer ${token}` };
      const [statsRes, coursesRes] = await Promise.all([
        fetch('/api/users/teacher/stats', { headers }),
        fetch(`/api/courses?instructor=${user?.id}&limit=50`),
      ]);

      if (statsRes.ok) {
        const sData = await statsRes.json();
        setStats(sData);
      }

      if (coursesRes.ok) {
        const cData = await coursesRes.json();
        setCourses(cData.courses || []);
      }
    } catch (err) {
      console.error('Error fetching teacher data', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchTeacherData();
  }, [token]);

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingCourse(true);

    try {
      // Parse module lessons from newline string
      const lessonTitles = moduleLessons
        .split('\n')
        .map((l) => l.trim())
        .filter(Boolean);

      const payload = {
        title: courseTitle,
        subject,
        semester: Number(semester),
        description,
        thumbnail:
          thumbnail ||
          'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80',
        modules: [
          {
            id: 'mod-1',
            title: moduleTitle || 'Unit 1: Fundamentals & Concepts',
            description: 'Core syllabus foundations and architectural principles.',
            order: 1,
            duration: '4h',
            lessons:
              lessonTitles.length > 0
                ? lessonTitles.map((t, idx) => ({
                    id: `les-1-${idx + 1}`,
                    title: t,
                    duration: '45m',
                  }))
                : [
                    { id: 'les-1-1', title: 'Course Introduction & Objectives', duration: '30m' },
                    { id: 'les-1-2', title: 'Fundamental Concepts & Theory', duration: '50m' },
                  ],
          },
        ],
      };

      const res = await fetch('/api/courses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        error(data.error || 'Failed to create course');
      } else {
        success('Course created and published successfully!');
        setIsCourseModalOpen(false);
        setCourseTitle('');
        setSubject('');
        setDescription('');
        setModuleTitle('');
        setModuleLessons('');
        fetchTeacherData();
      }
    } catch (err: any) {
      error(err.message || 'Course creation error');
    } finally {
      setIsSavingCourse(false);
    }
  };

  const handleViewRoster = async (course: Course) => {
    setRosterCourse(course);
    setLoadingRoster(true);
    try {
      const res = await fetch(`/api/courses/${course._id}/students`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setRosterStudents(data);
      }
    } catch (e) {
      console.error('Failed to fetch roster', e);
    } finally {
      setLoadingRoster(false);
    }
  };

  const handleDeleteCourse = async () => {
    if (!deleteCourseItem) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/courses/${deleteCourseItem._id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        success('Course deleted successfully');
        setDeleteCourseItem(null);
        fetchTeacherData();
      } else {
        const data = await res.json();
        error(data.error || 'Failed to delete course');
      }
    } catch (err: any) {
      error(err.message || 'Deletion error');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-900 text-amber-700 dark:text-amber-300 text-xs font-semibold mb-2">
            Faculty Instructor Portal
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 font-outfit">
            Instructor Control Panel
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage your BCA curriculum modules, lecture materials, and enrolled students
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => navigate('/resources')}
            leftIcon={<UploadCloud className="w-4 h-4" />}
          >
            Upload Notes
          </Button>
          <Button
            onClick={() => setIsCourseModalOpen(true)}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Create New Course
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Courses Authored"
          value={stats.totalCourses || courses.length}
          icon={<BookOpen className="w-6 h-6" />}
          color="blue"
          description="Active published subjects"
        />
        <StatCard
          label="Total Scholars Enrolled"
          value={stats.totalStudents || 0}
          icon={<Users className="w-6 h-6" />}
          color="emerald"
          description="Learners in your courses"
        />
        <StatCard
          label="Resources Uploaded"
          value={stats.totalResources || 0}
          icon={<FolderDown className="w-6 h-6" />}
          color="purple"
          description="Notes & slides in vault"
        />
      </div>

      {/* Course List Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 font-outfit">
          My Authored Courses
        </h3>

        {courses.length === 0 ? (
          <EmptyState
            icon={<BookOpen className="w-8 h-8 text-amber-500" />}
            title="No Courses Published"
            description="You have not created any courses yet. Begin by setting up your first BCA semester module."
            actionText="Create Course"
            onAction={() => setIsCourseModalOpen(true)}
          />
        ) : (
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold">
                  <tr>
                    <th className="p-4">Course Title & Subject</th>
                    <th className="p-4">Semester</th>
                    <th className="p-4">Units / Modules</th>
                    <th className="p-4">Enrolled Scholars</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {courses.map((c) => (
                    <tr key={c._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={c.thumbnail}
                            alt=""
                            className="w-10 h-10 rounded-lg object-cover bg-slate-100 dark:bg-slate-800 shrink-0"
                            referrerPolicy="no-referrer"
                          />
                          <div>
                            <span className="font-bold text-slate-900 dark:text-slate-100 block">
                              {c.title}
                            </span>
                            <span className="text-[11px] text-blue-600 dark:text-blue-400">
                              {c.subject}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge variant="blue" size="sm">
                          Sem {c.semester}
                        </Badge>
                      </td>
                      <td className="p-4 text-slate-600 dark:text-slate-400">
                        {c.modules?.length || 0} Modules
                      </td>
                      <td className="p-4">
                        <button
                          onClick={() => handleViewRoster(c)}
                          className="font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <Users className="w-3.5 h-3.5" /> {c.enrolledCount || 0} Students
                        </button>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => navigate(`/courses/${c._id}`)}
                            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                            title="View Public Course"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteCourseItem(c)}
                            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                            title="Delete Course"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Create Course Modal */}
      <Modal
        isOpen={isCourseModalOpen}
        onClose={() => setIsCourseModalOpen(false)}
        title="Create New BCA Course"
        description="Structure a semester syllabus with modules and lessons."
        maxWidth="2xl"
      >
        <form onSubmit={handleCreateCourse} className="space-y-4">
          <Input
            label="Course Name"
            value={courseTitle}
            onChange={(e) => setCourseTitle(e.target.value)}
            placeholder="e.g. Object Oriented Programming in C++"
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Subject Code / Name"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. OOP in C++ (CACS152)"
              required
            />

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                Semester
              </label>
              <select
                value={semester}
                onChange={(e) => setSemester(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                  <option key={s} value={s}>
                    Semester {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <Input
            label="Course Thumbnail Image URL"
            value={thumbnail}
            onChange={(e) => setThumbnail(e.target.value)}
            placeholder="https://images.unsplash.com/... (optional)"
          />

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
              Course Overview & Objectives
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the topics and laboratory expectations..."
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Initial Unit & Lesson Config */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Module 1: Initial Setup
            </h4>
            <Input
              label="Module 1 Title"
              value={moduleTitle}
              onChange={(e) => setModuleTitle(e.target.value)}
              placeholder="e.g. Unit 1: Principles of Object-Oriented Methodology"
            />
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                Lessons (One per line)
              </label>
              <textarea
                rows={3}
                value={moduleLessons}
                onChange={(e) => setModuleLessons(e.target.value)}
                placeholder={"Classes, Objects, and Encapsulation\nConstructors & Destructors\nDynamic Memory Allocation with new/delete"}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsCourseModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={isSavingCourse}>
              Publish Course
            </Button>
          </div>
        </form>
      </Modal>

      {/* Roster Modal */}
      <Modal
        isOpen={!!rosterCourse}
        onClose={() => setRosterCourse(null)}
        title={`Enrolled Scholars — ${rosterCourse?.title}`}
        description="Students currently enrolled and tracking progress in this course."
      >
        {loadingRoster ? (
          <div className="p-8 text-center text-xs text-slate-400">Loading student roster...</div>
        ) : rosterStudents.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">
            No scholars enrolled in this course yet.
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {rosterStudents.map((en) => {
              const u = typeof en.user === 'object' ? (en.user as any) : null;
              return (
                <div key={en._id} className="py-3 flex items-center justify-between gap-3 text-xs">
                  <div>
                    <span className="font-bold text-slate-900 dark:text-slate-100 block">
                      {u?.name || 'BCA Student'}
                    </span>
                    <span className="text-slate-400">{u?.email || 'Registered student'}</span>
                  </div>
                  <div className="text-right">
                    <Badge variant="blue" size="sm">
                      {en.progress}% Done
                    </Badge>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      Enrolled {new Date(en.enrolledAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Modal>

      {/* Delete Course Dialog */}
      <ConfirmDialog
        isOpen={!!deleteCourseItem}
        onClose={() => setDeleteCourseItem(null)}
        onConfirm={handleDeleteCourse}
        title="Delete Course"
        message={`Are you sure you want to permanently delete "${deleteCourseItem?.title}"? All student progress records for this course will be archived.`}
        confirmText="Delete Course"
        isDanger={true}
        isLoading={isDeleting}
      />
    </div>
  );
};
