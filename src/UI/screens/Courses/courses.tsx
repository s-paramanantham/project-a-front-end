import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Search,
  CheckCircle2,
  Compass,
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
            className={`flex items-center justify-between p-3.5 rounded-xl border shadow-xs animate-in fade-in slide-in-from-top-2 duration-200 ${
              toast.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}
          >
            <div className="flex items-center gap-3">
              {toast.type === 'success' ? (
                <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle size={16} className="text-rose-600 shrink-0" />
              )}
              <span className="text-xs sm:text-sm font-medium">{toast.message}</span>
            </div>
            <button
              onClick={() => setToast(null)}
              className="p-1 rounded-md hover:bg-black/5 text-neutral-500 cursor-pointer"
            >
              <X size={14} />
            </button>
          </div>
        )}

        {/* Developer Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200/80 pb-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900">
                Courses
              </h1>
              <span className="px-2 py-0.5 text-[11px] font-medium rounded-md bg-neutral-100 text-neutral-600 border border-neutral-200">
                Curriculum
              </span>
            </div>
            <p className="text-xs sm:text-sm text-neutral-500">
              Explore technical training tracks, syllabus modules, and hands-on developer certifications.
            </p>
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

        {/* Tab Switcher & Search Bar Bar */}
        <div className="bg-white rounded-xl border border-neutral-200/80 p-3.5 sm:p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Tabs: My Courses vs Explore All */}
          <div className="flex items-center gap-1.5 p-1 bg-neutral-100/80 rounded-lg self-start md:self-auto">
            <button
              onClick={() => setActiveTab('auto')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'auto' || activeTab === 'enrolled'
                  ? 'bg-white text-neutral-900 shadow-xs border border-neutral-200/80'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              <Layers size={13} className={activeTab === 'auto' || activeTab === 'enrolled' ? 'text-[#EA580C]' : ''} />
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
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'all'
                  ? 'bg-white text-neutral-900 shadow-xs border border-neutral-200/80'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              <Compass size={13} className={activeTab === 'all' ? 'text-[#EA580C]' : ''} />
              <span>Explore All Courses</span>
              {meta && (
                <span className="bg-neutral-200/80 text-neutral-700 text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                  {meta.totalCourses}
                </span>
              )}
            </button>
          </div>

          {/* Right Action: Search Box */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-72">
              <Search
                size={14}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by title, publisher, tech..."
                className="w-full pl-9 pr-8 py-1.5 bg-neutral-50 hover:bg-neutral-100/50 focus:bg-white text-xs border border-neutral-200 rounded-lg outline-none focus:border-[#EA580C] focus:ring-1 focus:ring-orange-500/20 transition-all text-neutral-800"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 cursor-pointer"
                >
                  <X size={13} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Category Pills */}
        {categories.length > 1 && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-md text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-neutral-900 text-white shadow-xs'
                    : 'bg-white text-neutral-600 border border-neutral-200/80 hover:bg-neutral-50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* Prompt banner if student has enrolled courses and is viewing My Courses */}
        {meta?.hasEnrolled && activeTab !== 'all' && (
          <div className="p-3.5 bg-orange-50/60 border border-orange-200/70 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-neutral-700">
              <CheckCircle2 size={15} className="text-[#EA580C] shrink-0" />
              <span>
                You are enrolled in <strong className="text-neutral-900">{meta.enrolledCount} course{meta.enrolledCount > 1 ? 's' : ''}</strong>. Browse catalog for additional tracks.
              </span>
            </div>
            <button
              onClick={() => setActiveTab('all')}
              className="text-[#EA580C] hover:text-[#C2410C] font-semibold cursor-pointer text-left sm:text-right"
            >
              Browse all {meta.totalCourses} courses →
            </button>
          </div>
        )}

        {/* Courses Cards Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5, 6].map((idx) => (
              <div
                key={idx}
                className="bg-white rounded-xl border border-neutral-200/80 p-4 space-y-4 animate-pulse"
              >
                <div className="aspect-video w-full bg-neutral-200 rounded-lg" />
                <div className="h-4 bg-neutral-200 rounded w-1/3" />
                <div className="h-5 bg-neutral-200 rounded w-4/5" />
                <div className="h-12 bg-neutral-100 rounded w-full" />
                <div className="h-9 bg-neutral-200 rounded w-full pt-2" />
              </div>
            ))}
          </div>
        ) : courses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
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
          <div className="bg-white rounded-xl border border-dashed border-neutral-300 p-10 text-center max-w-lg mx-auto my-8">
            <div className="w-11 h-11 rounded-lg bg-neutral-100 text-neutral-600 flex items-center justify-center mx-auto mb-3 border border-neutral-200">
              <BookOpen size={20} />
            </div>
            <h3 className="font-bold text-sm text-neutral-900 mb-1">
              {searchQuery ? 'No courses found' : 'No courses in this view'}
            </h3>
            <p className="text-xs text-neutral-500 leading-relaxed mb-5">
              {searchQuery
                ? `No courses matched "${searchQuery}". Try searching for SQL, HTML, CSS, JavaScript, TypeScript, Node, or Python.`
                : 'Switch to "Explore All Courses" to view all available courses.'}
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
