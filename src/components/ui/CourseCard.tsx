import React from 'react';
import { Course } from '../../types/index.js';
import { Badge } from './Badge.js';
import { BookOpen, Users, Clock, ArrowRight } from 'lucide-react';

interface CourseCardProps {
  course: Course;
  onSelect: (course: Course) => void;
  isEnrolled?: boolean;
  progress?: number;
}

export const CourseCard: React.FC<CourseCardProps> = ({
  course,
  onSelect,
  isEnrolled = false,
  progress,
}) => {
  const totalLessons = course.modules?.reduce((acc, m) => acc + (m.lessons?.length || 0), 0) || 0;

  return (
    <div
      onClick={() => onSelect(course)}
      className="group flex flex-col rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs hover:shadow-xl hover:border-blue-400 dark:hover:border-blue-600 transition-all duration-200 cursor-pointer"
    >
      <div className="relative h-44 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
        <img
          src={course.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80'}
          alt={course.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          referrerPolicy="no-referrer"
        />
        <div className="absolute top-3 left-3 flex gap-2">
          <Badge variant="blue" size="sm">
            Semester {course.semester}
          </Badge>
          {isEnrolled && (
            <Badge variant="emerald" size="sm">
              Enrolled
            </Badge>
          )}
        </div>
      </div>

      <div className="flex-1 p-5 flex flex-col justify-between">
        <div>
          <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider block mb-1">
            {course.subject}
          </span>
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1">
            {course.title}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-2 leading-relaxed">
            {course.description}
          </p>
        </div>

        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
          {isEnrolled && progress !== undefined ? (
            <div className="space-y-1.5 mb-3">
              <div className="flex justify-between text-xs font-semibold text-slate-600 dark:text-slate-300">
                <span>Course Progress</span>
                <span className="text-blue-600 dark:text-blue-400">{progress}%</span>
              </div>
              <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-3">
              <div className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-slate-400" />
                <span>{course.enrolledCount || 0} Scholars</span>
              </div>
              <div className="flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                <span>{totalLessons} Lessons</span>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              {course.instructorName || 'Faculty Instructor'}
            </span>
            <span className="text-xs font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              {isEnrolled ? 'Continue' : 'View Course'} <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
