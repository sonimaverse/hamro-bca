import React from 'react';
import { GraduationCap, Github, BookOpen, Heart, Mail, ExternalLink } from 'lucide-react';

interface FooterProps {
  navigate: (path: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ navigate }) => {
  return (
    <footer className="w-full bg-slate-900 text-slate-400 text-xs sm:text-sm border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand Col */}
          <div className="md:col-span-1 space-y-3">
            <div className="flex items-center gap-2 text-white">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold font-outfit text-white">
                Hamro <span className="text-blue-400">BCA</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Nepal's centralized academic platform dedicated to Bachelor of Computer Application (BCA) scholars, faculty, and institutions under Tribhuvan University syllabus standards.
            </p>
          </div>

          {/* Quick Curricula */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200 mb-3">
              TU BCA Semesters
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => navigate('/courses?semester=1')}
                  className="hover:text-white transition-colors"
                >
                  1st Semester (C Programming, DL)
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/courses?semester=2')}
                  className="hover:text-white transition-colors"
                >
                  2nd Semester (OOP in C++, Discrete)
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/courses?semester=3')}
                  className="hover:text-white transition-colors"
                >
                  3rd Semester (DSA, DBMS, SAD)
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/courses?semester=4')}
                  className="hover:text-white transition-colors"
                >
                  4th Semester (Web Tech, Operating System)
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/courses?semester=7')}
                  className="hover:text-white transition-colors"
                >
                  7th Semester (AI, Cyber Law, Cloud)
                </button>
              </li>
            </ul>
          </div>

          {/* Academic Vault */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200 mb-3">
              Academic Materials
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => navigate('/notes')}
                  className="hover:text-white transition-colors"
                >
                  Lecture Notes & Handouts
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/resources?type=Past+Questions')}
                  className="hover:text-white transition-colors"
                >
                  TU Board Past Question Bank
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/resources?type=Slides')}
                  className="hover:text-white transition-colors"
                >
                  Professor Presentation Slides
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/announcements')}
                  className="hover:text-white transition-colors"
                >
                  University Examination Notices
                </button>
              </li>
            </ul>
          </div>

          {/* Standards & TU Compliance */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200 mb-3">
              Standard Compliance
            </h4>
            <p className="text-xs text-slate-400 mb-3 leading-relaxed">
              Curriculum aligned with Tribhuvan University, Faculty of Humanities and Social Sciences (FOHSS) BCA 4-year credit structure.
            </p>
            <div className="flex items-center gap-2 text-xs text-blue-400 font-medium">
              <BookOpen className="w-4 h-4" />
              <span>126 Total Credit Hours</span>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <p>© {new Date().getFullYear()} Hamro BCA Academic Portal. All Rights Reserved.</p>
          <div className="flex items-center gap-6">
            <span className="text-slate-500">Built for BCA Scholars of Nepal</span>
            <button
              onClick={() => navigate('/login')}
              className="hover:text-white transition-colors"
            >
              Faculty Sign In
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
