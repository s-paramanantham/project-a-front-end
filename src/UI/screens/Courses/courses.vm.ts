import { useState, useEffect, useCallback, useMemo } from 'react';
import { courseService } from '../../../services/CourseService/courseService';
import type { Course, CourseMeta } from '../../../types/courseTypes';

export function useCoursesViewModel() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [meta, setMeta] = useState<CourseMeta | null>(null);
  const [activeTab, setActiveTab] = useState<'auto' | 'enrolled' | 'all'>('auto');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [enrollingCourseId, setEnrollingCourseId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fetchCourses = useCallback(async (tabToFetch = activeTab, search = searchQuery) => {
    setIsLoading(true);
    try {
      const res = await courseService.getCourses({
        filter: tabToFetch,
        search: search.trim() || undefined
      });
      setCourses(res.courses);
      setMeta(res.meta);
    } catch (err: any) {
      console.error('Error fetching courses:', err);
      setToast({
        type: 'error',
        message: err.message || 'Failed to fetch courses. Please check connection.'
      });
    } finally {
      setIsLoading(false);
    }
  }, [activeTab, searchQuery]);

  useEffect(() => {
    fetchCourses(activeTab, searchQuery);
  }, [activeTab, searchQuery, fetchCourses]);

  const handleEnroll = async (courseId: string) => {
    setEnrollingCourseId(courseId);
    setToast(null);

    try {
      const result = await courseService.enrollCourse(courseId);

      // Optimistically update local courses list
      setCourses((prev) =>
        prev.map((c) =>
          c.id === courseId
            ? { ...c, is_enrolled: true, enrollment_status: 'ENROLLED' }
            : c
        )
      );

      // Refresh meta counters
      setMeta((prev) =>
        prev
          ? {
              ...prev,
              hasEnrolled: true,
              enrolledCount: prev.enrolledCount + 1
            }
          : null
      );

      setToast({
        type: 'success',
        message: result.message || 'Successfully enrolled in course!'
      });
    } catch (error: any) {
      setToast({
        type: 'error',
        message: error.message || 'Could not enroll in course. Please try again.'
      });
    } finally {
      setEnrollingCourseId(null);
    }
  };

  const handleUnenroll = async (courseId: string) => {
    setEnrollingCourseId(courseId);
    try {
      await courseService.unenrollCourse(courseId);

      setCourses((prev) =>
        prev.map((c) =>
          c.id === courseId
            ? { ...c, is_enrolled: false, enrollment_status: undefined }
            : c
        )
      );

      setToast({
        type: 'success',
        message: 'Course dropped successfully.'
      });
      fetchCourses(activeTab, searchQuery);
    } catch (err: any) {
      setToast({
        type: 'error',
        message: err.message || 'Could not unenroll from course.'
      });
    } finally {
      setEnrollingCourseId(null);
    }
  };

  // Filter by category on client side
  const filteredCourses = useMemo(() => {
    if (selectedCategory === 'All') return courses;
    return courses.filter((c) => c.category?.toLowerCase() === selectedCategory.toLowerCase());
  }, [courses, selectedCategory]);

  const categories = useMemo(() => {
    const set = new Set<string>(['All']);
    courses.forEach((c) => {
      if (c.category) set.add(c.category);
    });
    return Array.from(set);
  }, [courses]);

  return {
    courses: filteredCourses,
    rawCoursesCount: courses.length,
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
    handleUnenroll,
    refreshCourses: () => fetchCourses(activeTab, searchQuery)
  };
}
