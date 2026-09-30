import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Search,
  Sparkles,
  CheckCircle2,
  Compass,
  GraduationCap,
  Layers,
  X,
  AlertCircle,
  PlusCircle
} from 'lucide-react';
import { AppLayout } from '../../reusables/feature/Navigation/AppLayout';
import { CourseCard } from '../../reusables/feature/Courses/CourseCard';
import { useCoursesViewModel } from './courses.vm';
import { Button } from '../../reusables/base/Button/Button';
import { authService } from '../../../services/AuthService/authService';

export const CoursesScreen: React.FC = () => {
  const navigate = useNavigate();
  const currentUser = authService.getCurrentUser();
  const {
    courses,
    meta,
    activeTab,
    setActiveTab,
    selectedCategory,
    setSelectedCategory,
    categories,
    searchQuery,
    setSearchQuery,
    isLoading,
    enrollingCourseId,
    toast,
    setToast,
    handleEnroll,
    handleUnenroll
  } = useCoursesViewModel();

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Toast Notification */}
        {toast && (
          <div
            className={`flex items-center justify-between p-4 rounded-xl border shadow-sm animate-in fade-in slide-in-from-top-2 duration-200 ${
              toast.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}
          >
            <div className="flex items-center gap-3">
              {toast.type === 'success' ? (
                <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle size={18} className="text-rose-600 shrink-0" />
              )}
              <span className="text-sm font-medium">{toast.message}</span>
            </div>
            <button
              onClick={() => setToast(null)}
              className="p-1 rounded-lg hover:bg-black/5 text-neutral-500 cursor-pointer"
            >
              <X size={15} />
            </button>
          </div>
        )}

        {/* Hero Section Banner */}
        <div className="bg-gradient-to-r from-orange-600 via-[#EA580C] to-amber-600 text-white rounded-3xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold bg-white/20 backdrop-blur-md px-3 py-1 rounded-full mb-3 text-orange-50">
              <Sparkles size={13} />
              <span>Full Curriculum • Interactive Enrollment</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-heading font-extrabold tracking-tight mb-2 text-white">
              Course Catalog & Learning Paths
            </h1>
            <p className="text-orange-100 text-xs sm:text-sm leading-relaxed">
              Explore hands-on technical training across SQL, HTML, CSS, JavaScript, TypeScript, Node.js, and Python.
              Enroll with one click to personalize your curriculum.
            </p>
          </div>

          {/* Decorative Background Accents */}
          <div className="absolute right-0 -bottom-10 opacity-10 pointer-events-none hidden md:block">
            <GraduationCap size={240} />
          </div>
        </div>

        {/* Tab Switcher & Search Bar Bar */}
        <div className="bg-white rounded-2xl border border-neutral-200/90 p-4 sm:p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Tabs: My Courses vs Explore All */}
          <div className="flex items-center gap-2 p-1 bg-neutral-100/80 rounded-xl self-start md:self-auto">
            <button
              onClick={() => setActiveTab('auto')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'auto' || activeTab === 'enrolled'
                  ? 'bg-white text-[#EA580C] shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              <Layers size={14} />
              <span>
                {meta?.hasEnrolled ? 'My Courses' : 'All Courses'}
              </span>
              {meta?.hasEnrolled && (
                <span className="bg-[#FFF7ED] text-[#EA580C] border border-[#FFEDD5] text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                  {meta.enrolledCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('all')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'all'
                  ? 'bg-white text-[#EA580C] shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              <Compass size={14} />
              <span>Explore All Courses</span>
              {meta && (
                <span className="bg-neutral-200/80 text-neutral-700 text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                  {meta.totalCourses}
                </span>
              )}
            </button>
          </div>

          {/* Right Action: Search Box & Tutor Create Course Button */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-72">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by title, publisher, tech..."
                className="w-full pl-10 pr-9 py-2 bg-neutral-50 hover:bg-neutral-100/50 focus:bg-white text-xs border border-neutral-200 rounded-xl outline-none focus:border-[#F97316] focus:ring-2 focus:ring-orange-500/10 transition-all text-neutral-800"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 cursor-pointer"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {currentUser?.role === 'tutor' && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate('/courses/create')}
                leftIcon={<PlusCircle size={14} />}
                className="shrink-0 text-xs py-2 shadow-xs"
              >
                Create Course
              </Button>
            )}
          </div>
        </div>

        {/* Category Pills */}
        {categories.length > 1 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-[#F97316] text-white shadow-xs'
                    : 'bg-white text-neutral-600 border border-neutral-200/90 hover:bg-neutral-50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* Prompt banner if student has enrolled courses and is viewing My Courses */}
        {meta?.hasEnrolled && activeTab !== 'all' && (
          <div className="p-4 bg-orange-50/70 border border-orange-200/80 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-[#EA580C]">
              <CheckCircle2 size={16} className="shrink-0" />
              <span>
                You are enrolled in <strong>{meta.enrolledCount} course{meta.enrolledCount > 1 ? 's' : ''}</strong>. Click below to browse the rest of our catalog!
              </span>
            </div>
            <button
              onClick={() => setActiveTab('all')}
              className="text-[#EA580C] hover:text-[#C2410C] font-bold underline cursor-pointer text-left sm:text-right"
            >
              Browse all {meta.totalCourses} courses →
            </button>
          </div>
        )}

        {/* Courses Cards Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-neutral-200 p-4 space-y-4 animate-pulse"
              >
                <div className="aspect-video w-full bg-neutral-200 rounded-xl" />
                <div className="h-4 bg-neutral-200 rounded w-1/3" />
                <div className="h-5 bg-neutral-200 rounded w-4/5" />
                <div className="h-12 bg-neutral-100 rounded w-full" />
                <div className="h-9 bg-neutral-200 rounded w-full pt-2" />
              </div>
            ))}
          </div>
        ) : courses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                isEnrolling={enrollingCourseId === course.id}
                onEnroll={handleEnroll}
                onUnenroll={handleUnenroll}
              />
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="bg-white rounded-3xl border border-dashed border-neutral-300 p-12 text-center max-w-lg mx-auto my-8">
            <div className="w-14 h-14 rounded-2xl bg-orange-100 text-[#EA580C] flex items-center justify-center mx-auto mb-4">
              <BookOpen size={28} />
            </div>
            <h3 className="font-heading font-bold text-lg text-neutral-900 mb-1">
              {searchQuery ? 'No courses found' : 'No courses in this view'}
            </h3>
            <p className="text-xs text-neutral-500 leading-relaxed mb-6">
              {searchQuery
                ? `No courses matched "${searchQuery}". Try searching for SQL, HTML, CSS, JavaScript, TypeScript, Node, or Python.`
                : 'Switch to "Explore All Courses" to view all available sample courses and enroll.'}
            </p>
            {searchQuery ? (
              <Button variant="secondary" size="sm" onClick={() => setSearchQuery('')}>
                Clear Search
              </Button>
            ) : (
              <Button variant="primary" size="sm" onClick={() => setActiveTab('all')}>
                Explore All Courses
              </Button>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default CoursesScreen;
