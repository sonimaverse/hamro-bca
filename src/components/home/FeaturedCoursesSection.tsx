import React from 'react';
import { Reveal } from './Reveal.js';
import { Course } from '../../types/index.js';
import { CourseCard } from '../ui/CourseCard.js';
import { Button } from '../ui/Button.js';
import { ArrowRight } from 'lucide-react';

interface FeaturedCoursesSectionProps {
  courses: Course[];
  isLoading: boolean;
  navigate: (path: string) => void;
}

export const FeaturedCoursesSection: React.FC<FeaturedCoursesSectionProps> = ({
  courses,
  isLoading,
  navigate,
}) => {
  return (
    <section className="relative bg-navy-950 py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-400">Curriculum</p>
            <h2 className="mt-3 font-outfit text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
              Featured academic courses
            </h2>
            <p className="mt-3 text-sm text-slate-400">
              Structured modular content with lesson-level progress tracking across every semester.
            </p>
          </div>

          <button
            onClick={() => navigate('/courses')}
            className="group inline-flex shrink-0 items-center gap-1.5 self-start text-sm font-semibold text-brand-400 transition-colors hover:text-brand-300 sm:self-auto"
          >
            Explore all courses
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </button>
        </Reveal>

        {isLoading ? (
          <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-52 animate-pulse rounded-2xl border border-white/10 bg-white/[0.04]" aria-hidden="true" />
            ))}
          </div>
        ) : (
          <ul className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((course, i) => (
              <Reveal as="li" key={course._id} delay={(i % 3) * 0.07}>
                <CourseCard course={course} onSelect={(c) => navigate(`/courses/${c._id}`)} />
              </Reveal>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
};
