import React, { useEffect, useState } from 'react';
import { Course } from '../types/index.js';
import { CourseCard } from '../components/ui/CourseCard.js';
import { SearchBar } from '../components/ui/SearchBar.js';
import { Pagination } from '../components/ui/Pagination.js';
import { EmptyState } from '../components/ui/EmptyState.js';
import { CardSkeleton } from '../components/ui/LoadingSkeleton.js';
import { AdvertisementCard } from '../components/ui/AdvertisementCard.js';
import { BookOpen } from 'lucide-react';

interface CoursesProps {
  navigate: (path: string) => void;
  initialSemester?: number;
}

export const Courses: React.FC<CoursesProps> = ({ navigate, initialSemester }) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedSemester, setSelectedSemester] = useState<number | null>(
    initialSemester || null
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCourses = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedSemester) params.append('semester', selectedSemester.toString());
      if (searchQuery.trim()) params.append('search', searchQuery.trim());
      params.append('page', page.toString());
      params.append('limit', '9');

      const res = await fetch(`/api/courses?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setCourses(data.courses || []);
        setTotalPages(data.pages || 1);
      }
    } catch (err) {
      console.error('Failed to load courses', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [selectedSemester, searchQuery, page]);

  const semesters = [1, 2, 3, 4, 5, 6, 7, 8];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 font-outfit">
          BCA Academic Courses
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Explore Tribhuvan University accredited 4-year curriculum by semester, topic, and code
        </p>
      </div>

      {/* Featured Educational / Certification Partner */}
      <AdvertisementCard placement="course_pages" variant="banner" navigate={navigate} />

      {/* Controls: Search and Semester Filter Tabs */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="flex-1 max-w-md">
          <SearchBar
            value={searchQuery}
            onChange={(q) => {
              setSearchQuery(q);
              setPage(1);
            }}
            placeholder="Search by title, subject code (e.g., CACS102, DSA)..."
          />
        </div>

        {/* Semester Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
          <button
            onClick={() => {
              setSelectedSemester(null);
              setPage(1);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              selectedSemester === null
                ? 'bg-blue-600 text-white'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            All Semesters
          </button>
          {semesters.map((sem) => (
            <button
              key={sem}
              onClick={() => {
                setSelectedSemester(sem);
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                selectedSemester === sem
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              Sem {sem}
            </button>
          ))}
        </div>
      </div>

      {/* Course Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : courses.length === 0 ? (
        <EmptyState
          icon={<BookOpen className="w-8 h-8 text-blue-500" />}
          title="No Courses Found"
          description="We couldn't find any courses matching your semester filter or keyword search."
          actionText="Clear Filters"
          onAction={() => {
            setSelectedSemester(null);
            setSearchQuery('');
            setPage(1);
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <CourseCard
              key={course._id}
              course={course}
              onSelect={(c) => navigate(`/courses/${c._id}`)}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      <Pagination
        currentPage={page}
        totalPages={totalPages}
        onPageChange={(p) => setPage(p)}
      />
    </div>
  );
};
