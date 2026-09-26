import React from 'react';
import { Sidebar } from './Sidebar.js';

interface DashboardLayoutProps {
  currentPath: string;
  navigate: (path: string) => void;
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  currentPath,
  navigate,
  children,
}) => {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] bg-slate-50/50 dark:bg-slate-950">
      <Sidebar currentPath={currentPath} navigate={navigate} />
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
        {children}
      </main>
    </div>
  );
};
