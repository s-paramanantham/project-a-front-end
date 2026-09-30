import React, { useState, useEffect } from 'react';
import { Menu, BookOpen, GraduationCap, Award, Sparkles } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { ProfileModal } from './ProfileModal';
import { authService } from '../../../../services/AuthService/authService';
import { courseService } from '../../../../services/CourseService/courseService';
import type { User } from '../../../../types/authTypes';

interface AppLayoutProps {
  children: React.ReactNode;
}

const MOTIVATIONAL_QUOTES = [
  "Small daily improvements over time lead to stunning results.",
  "The secret of getting ahead is getting started.",
  "Every expert was once a beginner. Keep coding!",
  "Consistency is the key to mastering any programming language.",
  "Code every day, stay curious, and keep building.",
  "The beautiful thing about learning is that no one can take it away from you.",
  "Dream big. Start small. Learn continuously."
];

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
  const [quoteIndex, setQuoteIndex] = useState(0);

  // Rotating motivational quotes with 5s delay
  useEffect(() => {
    const timer = setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % MOTIVATIONAL_QUOTES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

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

        {/* Desktop Top Sub-Bar with Student Name in Linear Gradient & Rotating Motivational Quotes */}
        <header className="hidden lg:flex sticky top-0 z-20 bg-white/90 backdrop-blur-xs border-b border-neutral-200/80 px-8 h-16 items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <span className="text-sm font-extrabold bg-gradient-to-r from-orange-600 via-amber-600 to-orange-500 bg-clip-text text-transparent shrink-0">
              {currentUser?.name || 'Welcome Learner'}
            </span>
            <span className="text-neutral-300 hidden md:inline shrink-0">•</span>
            <div className="flex items-center gap-2 text-xs text-neutral-500 italic min-w-0 transition-all duration-700 ease-in-out">
              <Sparkles size={13} className="text-amber-500 shrink-0 animate-pulse" />
              <span className="truncate">"{MOTIVATIONAL_QUOTES[quoteIndex]}"</span>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setIsProfileOpen(true)}
              className="flex items-center gap-2.5 text-xs py-1.5 px-3 rounded-full bg-neutral-50 hover:bg-orange-50 border border-neutral-200 hover:border-orange-200 transition-colors cursor-pointer"
              title="Open Profile Settings"
            >
              <span className="inline-flex items-center gap-1 font-semibold text-[#EA580C]">
                {currentUser?.role === 'tutor' ? <Award size={13} /> : <GraduationCap size={13} />}
                <span className="capitalize">{currentUser?.role || 'Student'}</span>
              </span>
              <span className="text-neutral-800 font-bold">{currentUser?.name || 'Profile'}</span>
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
