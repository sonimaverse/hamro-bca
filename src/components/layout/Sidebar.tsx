import React from 'react';
import { useAuth } from '../../context/AuthContext.js';
import { Badge } from '../ui/Badge.js';
import {
  LayoutDashboard,
  BookOpen,
  FileText,
  FolderDown,
  Bell,
  Users,
  PlusCircle,
  UploadCloud,
  CheckSquare,
  ShieldCheck,
  Megaphone,
  User as UserIcon,
  Settings as SettingsIcon,
  LogOut,
  ChevronRight,
} from 'lucide-react';

interface SidebarProps {
  currentPath: string;
  navigate: (path: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentPath, navigate }) => {
  const { user, logout } = useAuth();

  if (!user) return null;

  const role = user.role;

  const studentLinks = [
    { label: 'Overview', path: '/dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { label: 'My Courses', path: '/dashboard/courses', icon: <BookOpen className="w-4 h-4" /> },
    { label: 'Browse Courses', path: '/courses', icon: <ChevronRight className="w-4 h-4" /> },
    { label: 'Notes Library', path: '/notes', icon: <FileText className="w-4 h-4" /> },
    { label: 'Resource Vault', path: '/resources', icon: <FolderDown className="w-4 h-4" /> },
    { label: 'Notices & Board', path: '/announcements', icon: <Bell className="w-4 h-4" /> },
  ];

  const teacherLinks = [
    { label: 'Teacher Dashboard', path: '/teacher', icon: <LayoutDashboard className="w-4 h-4" /> },
    { label: 'My Courses', path: '/teacher/courses', icon: <BookOpen className="w-4 h-4" /> },
    { label: 'Create New Course', path: '/teacher/create-course', icon: <PlusCircle className="w-4 h-4" /> },
    { label: 'Upload Materials', path: '/teacher/upload-material', icon: <UploadCloud className="w-4 h-4" /> },
    { label: 'Course Resources', path: '/resources', icon: <FolderDown className="w-4 h-4" /> },
    { label: 'Announcements', path: '/announcements', icon: <Bell className="w-4 h-4" /> },
  ];

  const adminLinks = [
    { label: 'Admin Command', path: '/admin', icon: <ShieldCheck className="w-4 h-4" /> },
    { label: 'Advertisements', path: '/admin/advertisements', icon: <Megaphone className="w-4 h-4" /> },
    { label: 'User Directory', path: '/admin/users', icon: <Users className="w-4 h-4" /> },
    { label: 'Manage Courses', path: '/courses', icon: <BookOpen className="w-4 h-4" /> },
    { label: 'Manage Resources', path: '/resources', icon: <FolderDown className="w-4 h-4" /> },
    { label: 'Broadcaster', path: '/announcements', icon: <Bell className="w-4 h-4" /> },
  ];

  const links =
    role === 'admin'
      ? adminLinks
      : role === 'teacher'
      ? teacherLinks
      : studentLinks;

  return (
    <aside className="w-64 shrink-0 hidden lg:flex flex-col justify-between border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 h-[calc(100vh-4rem)] sticky top-16">
      <div className="space-y-6">
        {/* User Card */}
        <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800">
          <img
            src={
              user.avatar ||
              `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user.name)}`
            }
            alt={user.name}
            className="w-10 h-10 rounded-xl object-cover bg-slate-200 dark:bg-slate-700"
            referrerPolicy="no-referrer"
          />
          <div className="min-w-0 flex-1">
            <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
              {user.name}
            </h4>
            <div className="flex items-center gap-1.5 mt-0.5">
              <Badge
                variant={role === 'admin' ? 'purple' : role === 'teacher' ? 'amber' : 'blue'}
                size="sm"
              >
                {role.toUpperCase()}
              </Badge>
              {role === 'student' && user.semester && (
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                  Sem {user.semester}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Navigation Section */}
        <div>
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 block mb-2">
            Navigation Menu
          </span>
          <div className="space-y-1">
            {links.map((link) => {
              const isActive = currentPath === link.path;
              return (
                <button
                  key={link.path}
                  onClick={() => navigate(link.path)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-slate-100'
                  }`}
                >
                  <span className={isActive ? 'text-white' : 'text-slate-400'}>
                    {link.icon}
                  </span>
                  <span>{link.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Account Settings & Sign Out */}
      <div className="space-y-1 pt-4 border-t border-slate-100 dark:border-slate-800">
        <button
          onClick={() => navigate('/profile')}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition-colors cursor-pointer ${
            currentPath === '/profile'
              ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <UserIcon className="w-4 h-4 text-slate-400" />
          <span>My Profile</span>
        </button>

        <button
          onClick={() => navigate('/settings')}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition-colors cursor-pointer ${
            currentPath === '/settings'
              ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <SettingsIcon className="w-4 h-4 text-slate-400" />
          <span>Settings</span>
        </button>

        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};
