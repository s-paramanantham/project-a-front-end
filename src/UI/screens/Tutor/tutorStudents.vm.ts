import { useState, useEffect, useCallback } from 'react';
import { tutorStudentService } from '../../../services/TutorService/tutorStudentService';
import { reviewerService } from '../../../services/ReviewerService/reviewerService';
import { todoService } from '../../../services/TodoService/todoService';
import type { AssignedStudent, StudentProgressDetails } from '../../../types/reviewerTypes';
import type { TodoDashboardSummary } from '../../../types/todoTypes';

export function useTutorStudentsVM() {
  const [students, setStudents] = useState<AssignedStudent[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<AssignedStudent[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState<AssignedStudent | null>(null);
  const [studentDetails, setStudentDetails] = useState<StudentProgressDetails | null>(null);
  const [studentTodos, setStudentTodos] = useState<TodoDashboardSummary | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Review response state
  const [activeReviewId, setActiveReviewId] = useState<string | null>(null);
  const [tutorFeedback, setTutorFeedback] = useState('');
  const [tutorRating, setTutorRating] = useState<number>(5);
  const [isResponding, setIsResponding] = useState(false);

  const loadStudents = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await tutorStudentService.getAssignedStudents();
      setStudents(data);
      setFilteredStudents(data);
    } catch (err) {
      console.error('Failed to load assigned students:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStudents();
  }, [loadStudents]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredStudents(students);
    } else {
      const q = searchQuery.toLowerCase();
      setFilteredStudents(
        students.filter(
          (s) =>
            s.name.toLowerCase().includes(q) ||
            s.email.toLowerCase().includes(q) ||
            s.education?.degree?.toLowerCase().includes(q) ||
            s.enrolled_courses.some((c) => c.title.toLowerCase().includes(q))
        )
      );
    }
  }, [searchQuery, students]);

  const handleOpenStudentDetails = async (student: AssignedStudent) => {
    setSelectedStudent(student);
    setIsLoadingDetails(true);
    try {
      const [details, todos] = await Promise.all([
        tutorStudentService.getStudentDetails(student.id),
        todoService.getDashboardSummary(student.id)
      ]);
      setStudentDetails(details);
      setStudentTodos(todos);
    } catch (err) {
      console.error('Failed to load student details or todos:', err);
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const handleCloseStudentDetails = () => {
    setSelectedStudent(null);
    setStudentDetails(null);
    setStudentTodos(null);
    setActiveReviewId(null);
  };

  const handleSendFeedback = async (reviewId: string) => {
    if (!tutorFeedback.trim()) {
      setToast({ message: 'Please provide constructive feedback before submitting', type: 'error' });
      return;
    }

    setIsResponding(true);
    try {
      await reviewerService.respondToReview(reviewId, tutorFeedback.trim(), 'APPROVED', tutorRating);
      setToast({ message: 'Feedback and approval recorded successfully!', type: 'success' });
      setActiveReviewId(null);
      setTutorFeedback('');

      // Refresh student details
      if (selectedStudent) {
        const details = await tutorStudentService.getStudentDetails(selectedStudent.id);
        setStudentDetails(details);
      }
    } catch (err: any) {
      setToast({ message: err.message || 'Failed to submit feedback', type: 'error' });
    } finally {
      setIsResponding(false);
      setTimeout(() => setToast(null), 4000);
    }
  };

  return {
    students,
    filteredStudents,
    searchQuery,
    setSearchQuery,
    isLoading,
    selectedStudent,
    setSelectedStudent,
    studentDetails,
    setStudentDetails,
    studentTodos,
    setStudentTodos,
    isLoadingDetails,
    toast,
    setToast,
    activeReviewId,
    setActiveReviewId,
    tutorFeedback,
    setTutorFeedback,
    tutorRating,
    setTutorRating,
    isResponding,
    loadStudents,
    handleOpenStudentDetails,
    handleCloseStudentDetails,
    handleSendFeedback
  };
}
