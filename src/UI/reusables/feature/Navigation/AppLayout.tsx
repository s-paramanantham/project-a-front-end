import React, { useState, useEffect } from 'react';
import { Menu, BookOpen } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { ProfileModal } from './ProfileModal';
import { authService } from '../../../../services/AuthService/authService';
import { courseService } from '../../../../services/CourseService/courseService';
import type { User } from '../../../../types/authTypes';

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem('project_a_sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });
  const [enrolledCount, setEnrolledCount] = useState<number>(0);
  const [currentUser, setCurrentUser] = useState<User | null>(() => authService.getCurrentUser());

  const toggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('project_a_sidebar_collapsed', String(next));
      } catch {}
      return next;
    });
  };

  // Load user enrolled count for badge indicators
  useEffect(() => {
    let isMounted = true;
    async function loadEnrollmentStats() {
      try {
        const res = await courseService.getCourses({ filter: 'enrolled' });
        if (isMounted) {
          setEnrolledCount(res.courses.length);
        }
      } catch {
        // Fallback silently if offline or initial load
      }
    }
    loadEnrollmentStats();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col">
      {/* Left Navigation Bar */}
      <Sidebar
        isOpenMobile={isMobileNavOpen}
        onCloseMobile={() => setIsMobileNavOpen(false)}
        onOpenProfile={() => setIsProfileOpen(true)}
        isCollapsed={isCollapsed}
        onToggleCollapse={toggleCollapse}
        enrolledCount={enrolledCount}
      />

      {/* Main Content Area (Dynamic padding for expanded 256px vs collapsed 80px) */}
      <div
        className={`flex flex-col flex-1 min-w-0 transition-all duration-300 ease-in-out ${
          isCollapsed ? 'lg:pl-20' : 'lg:pl-64'
        }`}
      >
        {/* Mobile / Tablet Top Header Bar */}
        <header className="lg:hidden sticky top-0 z-30 bg-white/95 backdrop-blur-xs border-b border-neutral-200 px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileNavOpen(true)}
              className="p-2 -ml-2 rounded-xl text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 focus:outline-none cursor-pointer"
              aria-label="Open navigation menu"
            >
              <Menu size={20} />
            </button>

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#F97316] text-white flex items-center justify-center shadow-xs">
                <BookOpen size={16} strokeWidth={2.4} />
              </div>
              <span className="font-heading font-extrabold text-base text-neutral-900">
                Project A
              </span>
            </div>
          </div>

          <button
            onClick={() => setIsProfileOpen(true)}
            className="w-8 h-8 rounded-lg bg-orange-100 text-[#EA580C] font-bold text-xs flex items-center justify-center border border-orange-200 cursor-pointer overflow-hidden"
            aria-label="View profile"
          >
            {currentUser?.avatarUrl ? (
              <img src={currentUser.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
            ) : currentUser?.name ? (
              currentUser.name.charAt(0).toUpperCase()
            ) : (
              'U'
            )}
          </button>
        </header>

        {/* Desktop Top Bar: Clean Developer-Grade Navigation */}
        <header className="hidden lg:flex sticky top-0 z-20 bg-white/95 backdrop-blur-xs border-b border-neutral-200/80 px-8 h-14 items-center justify-between">
          <div className="flex items-center gap-2.5 text-xs">
            <span className="font-semibold text-neutral-500">Project A</span>
            <span className="text-neutral-300">/</span>
            <span className="font-semibold text-neutral-800">Workspace</span>
            <span className="inline-flex items-center gap-1.5 ml-2 px-2 py-0.5 rounded-md text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/60">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>Active</span>
            </span>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setIsProfileOpen(true)}
              className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg border border-neutral-200/80 hover:border-neutral-300 hover:bg-neutral-50 transition-colors cursor-pointer text-xs font-medium text-neutral-700"
              title="Open Profile Settings"
            >
              <div className="w-6 h-6 rounded-md bg-neutral-900 text-white font-bold flex items-center justify-center text-[11px] shrink-0">
                {currentUser?.avatarUrl ? (
                  <img src={currentUser.avatarUrl} alt="" className="w-full h-full object-cover rounded-md" />
                ) : (
                  currentUser?.name?.charAt(0).toUpperCase() || 'U'
                )}
              </div>
              <span className="font-semibold text-neutral-800">{currentUser?.name || 'Profile'}</span>
              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-neutral-100 text-neutral-600 border border-neutral-200/60 capitalize">
                {currentUser?.role || 'Student'}
              </span>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>

      {/* User Profile Modal */}
      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        user={currentUser}
        enrolledCount={enrolledCount}
        onUserUpdated={(updated) => setCurrentUser(updated)}
      />
    </div>
  );
};
