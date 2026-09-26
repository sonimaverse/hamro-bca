import React, { useState, useEffect } from 'react';
import { ThemeProvider } from './context/ThemeContext.js';
import { ToastProvider } from './context/ToastContext.js';
import { AuthProvider, useAuth } from './context/AuthContext.js';
import { Navbar } from './components/layout/Navbar.js';
import { Footer } from './components/layout/Footer.js';
import { DashboardLayout } from './components/layout/DashboardLayout.js';

// Pages
import { Home } from './pages/Home.js';
import { Courses } from './pages/Courses.js';
import { CourseDetail } from './pages/CourseDetail.js';
import { Notes } from './pages/Notes.js';
import { Resources } from './pages/Resources.js';
import { Announcements } from './pages/Announcements.js';
import { Login } from './pages/Login.js';
import { Register } from './pages/Register.js';
import { ForgotPassword } from './pages/ForgotPassword.js';
import { ResetPassword } from './pages/ResetPassword.js';
import { VerifyEmail } from './pages/VerifyEmail.js';
import { StudentDashboard } from './pages/StudentDashboard.js';
import { TeacherDashboard } from './pages/TeacherDashboard.js';
import { AdminDashboard } from './pages/AdminDashboard.js';
import { AdminAdvertisements } from './pages/AdminAdvertisements.js';
import { Profile } from './pages/Profile.js';
import { Settings } from './pages/Settings.js';

function AppContent() {
  const { user, isLoading } = useAuth();
  const [currentPath, setCurrentPath] = useState(() => window.location.pathname || '/');

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path: string) => {
    if (path === currentPath) return;
    window.history.pushState({}, '', path);
    setCurrentPath(path.split('?')[0]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Check URL parameters for semester or filters
  const searchParams = new URLSearchParams(window.location.search);
  const semParam = searchParams.get('semester');

  // Match Course Detail: /courses/:id
  const courseMatch = currentPath.match(/^\/courses\/([a-zA-Z0-9_-]+)$/);
  const courseId = courseMatch ? courseMatch[1] : null;

  // Determine which page to render
  const renderPage = () => {
    if (isLoading) {
      return (
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-xs font-semibold text-slate-500 tracking-wider uppercase">
              Loading Hamro BCA Portal...
            </span>
          </div>
        </div>
      );
    }

    if (courseId) {
      return <CourseDetail courseId={courseId} navigate={navigate} />;
    }

    switch (currentPath) {
      case '/':
        return <Home navigate={navigate} />;

      case '/courses':
        return (
          <Courses
            navigate={navigate}
            initialSemester={semParam ? Number(semParam) : undefined}
          />
        );

      case '/notes':
        return <Notes navigate={navigate} />;

      case '/resources':
        return <Resources navigate={navigate} />;

      case '/announcements':
        return <Announcements navigate={navigate} />;

      case '/login':
        return <Login navigate={navigate} />;

      case '/register':
        return <Register navigate={navigate} />;

      case '/forgot-password':
        return <ForgotPassword navigate={navigate} />;

      case '/reset-password':
        return <ResetPassword navigate={navigate} />;

      case '/verify-email':
        return <VerifyEmail navigate={navigate} />;

      // Dashboards
      case '/dashboard':
      case '/dashboard/courses':
        if (!user) {
          navigate('/login');
          return <Login navigate={navigate} />;
        }
        if (user.role === 'admin') {
          return (
            <DashboardLayout currentPath={currentPath} navigate={navigate}>
              <AdminDashboard navigate={navigate} />
            </DashboardLayout>
          );
        }
        if (user.role === 'teacher') {
          return (
            <DashboardLayout currentPath={currentPath} navigate={navigate}>
              <TeacherDashboard navigate={navigate} />
            </DashboardLayout>
          );
        }
        return (
          <DashboardLayout currentPath={currentPath} navigate={navigate}>
            <StudentDashboard navigate={navigate} />
          </DashboardLayout>
        );

      case '/teacher':
      case '/teacher/courses':
      case '/teacher/create-course':
      case '/teacher/upload-material':
        if (!user) {
          navigate('/login');
          return <Login navigate={navigate} />;
        }
        return (
          <DashboardLayout currentPath={currentPath} navigate={navigate}>
            <TeacherDashboard navigate={navigate} />
          </DashboardLayout>
        );

      case '/admin':
      case '/admin/users':
        if (!user) {
          navigate('/login');
          return <Login navigate={navigate} />;
        }
        return (
          <DashboardLayout currentPath={currentPath} navigate={navigate}>
            <AdminDashboard navigate={navigate} />
          </DashboardLayout>
        );

      case '/admin/advertisements':
        if (!user) {
          navigate('/login');
          return <Login navigate={navigate} />;
        }
        if (user.role !== 'admin') {
          navigate('/dashboard');
          return null;
        }
        return (
          <DashboardLayout currentPath={currentPath} navigate={navigate}>
            <AdminAdvertisements navigate={navigate} />
          </DashboardLayout>
        );

      case '/profile':
        if (!user) {
          navigate('/login');
          return <Login navigate={navigate} />;
        }
        return (
          <DashboardLayout currentPath={currentPath} navigate={navigate}>
            <Profile navigate={navigate} />
          </DashboardLayout>
        );

      case '/settings':
        if (!user) {
          navigate('/login');
          return <Login navigate={navigate} />;
        }
        return (
          <DashboardLayout currentPath={currentPath} navigate={navigate}>
            <Settings navigate={navigate} />
          </DashboardLayout>
        );

      default:
        return <Home navigate={navigate} />;
    }
  };

  const isDashboardView =
    currentPath.startsWith('/dashboard') ||
    currentPath.startsWith('/teacher') ||
    currentPath.startsWith('/admin') ||
    currentPath === '/profile' ||
    currentPath === '/settings';

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans antialiased transition-colors">
      <Navbar currentPath={currentPath} navigate={navigate} />
      <div className="flex-1">{renderPage()}</div>
      {!isDashboardView && <Footer navigate={navigate} />}
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
