import { useState, useEffect, useCallback } from 'react';
import { reviewerService } from '../../../services/ReviewerService/reviewerService';
import { courseService } from '../../../services/CourseService/courseService';
import type { TutorReviewer, ReviewSubmission } from '../../../types/reviewerTypes';
import type { Course } from '../../../types/courseTypes';

export function useReviewersVM() {
  const [tutors, setTutors] = useState<TutorReviewer[]>([]);
  const [reviews, setReviews] = useState<ReviewSubmission[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'reviewers' | 'submissions'>('reviewers');
  const [assigningId, setAssigningId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Review submission modal state
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [selectedTutor, setSelectedTutor] = useState<TutorReviewer | null>(null);
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [studentNotes, setStudentNotes] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [tutorList, submissionList, coursesRes] = await Promise.all([
        reviewerService.getTutors(),
        reviewerService.getStudentReviews(),
        courseService.getCourses({ filter: 'all' })
      ]);
      setTutors(tutorList);
      setReviews(submissionList);
      setCourses(coursesRes.courses);
    } catch (err) {
      console.error('Failed to load reviewers data:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleAssignPrimary = async (tutor: TutorReviewer) => {
    setAssigningId(tutor.id);
    try {
      await reviewerService.assignPrimaryReviewer(tutor.id);
      setToast({
        message: `${tutor.name} has been assigned as your Primary Reviewer!`,
        type: 'success'
      });
      const updated = await reviewerService.getTutors();
      setTutors(updated);
    } catch (err: any) {
      setToast({
        message: err.message || 'Failed to assign primary reviewer',
        type: 'error'
      });
    } finally {
      setAssigningId(null);
      setTimeout(() => setToast(null), 4000);
    }
  };

  const openSubmitModal = (tutor?: TutorReviewer) => {
    setSelectedTutor(tutor || tutors.find((t) => t.is_primary) || tutors[0] || null);
    if (courses.length > 0 && !selectedCourseId) {
      setSelectedCourseId(courses[0].id);
    }
    setIsSubmitModalOpen(true);
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourseId) {
      setToast({ message: 'Please select a course to review', type: 'error' });
      return;
    }

    setIsSubmittingReview(true);
    try {
      await reviewerService.submitReview({
        tutorId: selectedTutor?.id,
        courseId: selectedCourseId,
        type: 'COURSE',
        studentNotes: studentNotes.trim()
      });

      setToast({
        message: 'Review request submitted successfully to tutor!',
        type: 'success'
      });
      setIsSubmitModalOpen(false);
      setStudentNotes('');

      const updatedReviews = await reviewerService.getStudentReviews();
      setReviews(updatedReviews);
      setActiveTab('submissions');
    } catch (err: any) {
      setToast({
        message: err.message || 'Failed to submit review request',
        type: 'error'
      });
    } finally {
      setIsSubmittingReview(false);
      setTimeout(() => setToast(null), 4000);
    }
  };

  const primaryReviewer = tutors.find((t) => t.is_primary);

  return {
    tutors,
    reviews,
    courses,
    isLoading,
    activeTab,
    setActiveTab,
    assigningId,
    toast,
    setToast,
    isSubmitModalOpen,
    setIsSubmitModalOpen,
    selectedTutor,
    setSelectedTutor,
    selectedCourseId,
    setSelectedCourseId,
    studentNotes,
    setStudentNotes,
    isSubmittingReview,
    primaryReviewer,
    handleAssignPrimary,
    openSubmitModal,
    handleSubmitReview,
    refreshData: loadData
  };
}
