import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { courseService } from '../../../services/CourseService/courseService';
import { reviewerService } from '../../../services/ReviewerService/reviewerService';
import type { Course, Topic, TopicStats, QuizQuestion } from '../../../types/courseTypes';
import type { TutorReviewer } from '../../../types/reviewerTypes';

export function useStudyViewModel() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();

  const [course, setCourse] = useState<Course | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [stats, setStats] = useState<TopicStats | null>(null);
  const [activeTopicIndex, setActiveTopicIndex] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isCompleting, setIsCompleting] = useState<boolean>(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Multi-question state for active topic
  const [activeQuestionIndex, setActiveQuestionIndex] = useState<number>(0);
  const [questionAnswers, setQuestionAnswers] = useState<Record<number, number>>({});
  const [questionChecked, setQuestionChecked] = useState<Record<number, boolean>>({});

  // Reviewer mentorship state
  const [primaryReviewer, setPrimaryReviewer] = useState<TutorReviewer | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState<boolean>(false);
  const [reviewType, setReviewType] = useState<'LESSON' | 'COURSE'>('LESSON');
  const [isSubmittingReview, setIsSubmittingReview] = useState<boolean>(false);

  const fetchCurriculum = useCallback(async () => {
    if (!courseId) return;
    setIsLoading(true);
    try {
      const [data, reviewer] = await Promise.all([
        courseService.getCourseTopics(courseId),
        reviewerService.getMyPrimaryReviewer()
      ]);
      setCourse(data.course);
      setTopics(data.topics);
      setStats(data.stats);
      setPrimaryReviewer(reviewer);

      // Find first uncompleted topic or default to index 0
      const firstUncompleted = data.topics.findIndex((t) => !t.is_completed);
      if (firstUncompleted !== -1) {
        setActiveTopicIndex(firstUncompleted);
      } else {
        setActiveTopicIndex(0);
      }
    } catch (err: any) {
      console.error('Error fetching course topics:', err);
      setToast({
        type: 'error',
        message: err.message || 'Failed to load course lessons.'
      });
    } finally {
      setIsLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    fetchCurriculum();
  }, [fetchCurriculum]);

  const currentTopic: Topic | undefined = topics[activeTopicIndex];

  // Normalized questions list for current topic
  const questionsList: QuizQuestion[] = useMemo(() => {
    if (!currentTopic) return [];
    if (Array.isArray(currentTopic.questions) && currentTopic.questions.length > 0) {
      return currentTopic.questions;
    }
    return [
      {
        id: 'q-1',
        question_text: currentTopic.question_text || '',
        question_options: currentTopic.question_options || [],
        correct_option_index: currentTopic.correct_option_index ?? 0,
        question_explanation: currentTopic.question_explanation || ''
      }
    ];
  }, [currentTopic]);

  // Reset quiz state when active topic changes
  useEffect(() => {
    setActiveQuestionIndex(0);
    if (currentTopic) {
      if (currentTopic.is_completed) {
        // Pre-fill all questions as correctly answered
        const prefilledAnswers: Record<number, number> = {};
        const prefilledChecked: Record<number, boolean> = {};
        questionsList.forEach((q, idx) => {
          prefilledAnswers[idx] = q.correct_option_index;
          prefilledChecked[idx] = true;
        });
        setQuestionAnswers(prefilledAnswers);
        setQuestionChecked(prefilledChecked);
      } else {
        setQuestionAnswers({});
        setQuestionChecked({});
      }
    }
  }, [activeTopicIndex, currentTopic, questionsList]);

  const currentQuestion: QuizQuestion | undefined = questionsList[activeQuestionIndex];
  const selectedOptionForCurrentQ = questionAnswers[activeQuestionIndex] ?? null;
  const isCheckedForCurrentQ = questionChecked[activeQuestionIndex] ?? false;
  const isCorrectForCurrentQ =
    currentQuestion && selectedOptionForCurrentQ !== null
      ? selectedOptionForCurrentQ === currentQuestion.correct_option_index
      : false;

  const isAllQuestionsCorrect = useMemo(() => {
    if (questionsList.length === 0) return false;
    return questionsList.every((q, idx) => {
      const selected = questionAnswers[idx];
      return selected !== undefined && selected === q.correct_option_index;
    });
  }, [questionsList, questionAnswers]);

  const handleSelectOption = (optionIndex: number) => {
    if (!currentQuestion) return;
    setQuestionAnswers((prev) => ({
      ...prev,
      [activeQuestionIndex]: optionIndex
    }));
    setQuestionChecked((prev) => ({
      ...prev,
      [activeQuestionIndex]: true
    }));
  };

  const goToQuestion = (idx: number) => {
    if (idx >= 0 && idx < questionsList.length) {
      setActiveQuestionIndex(idx);
    }
  };

  const handleCompleteTopic = async () => {
    if (!courseId || !currentTopic) return;

    if (!isAllQuestionsCorrect) {
      setToast({
        type: 'error',
        message: 'Please answer all questions correctly before completing the lesson.'
      });
      return;
    }

    setIsCompleting(true);
    setToast(null);

    try {
      const primarySelectedOption = questionAnswers[0] ?? currentTopic.correct_option_index;
      const res = await courseService.completeTopic(courseId, currentTopic.id, primarySelectedOption);

      // Update topic state locally
      setTopics((prev) =>
        prev.map((t, idx) =>
          idx === activeTopicIndex ? { ...t, is_completed: true } : t
        )
      );

      // Update stats
      setStats({
        totalTopics: res.data.stats.totalTopics,
        completedCount: res.data.stats.completedCount,
        progressPercent: res.data.stats.progressPercent,
        isCompleted: res.data.stats.isCourseCompleted
      });

      setToast({
        type: 'success',
        message: res.data.stats.isCourseCompleted
          ? '🎉 Congratulations! You completed all lessons and mastered this course!'
          : `✓ Lesson "${currentTopic.title}" marked as completed!`
      });

      // Advance to next lesson after brief celebration
      if (activeTopicIndex < topics.length - 1) {
        setTimeout(() => {
          setActiveTopicIndex((prev) => prev + 1);
        }, 1200);
      }
    } catch (err: any) {
      setToast({
        type: 'error',
        message: err.message || 'Could not complete lesson.'
      });
    } finally {
      setIsCompleting(false);
    }
  };

  const openReviewModal = (type: 'LESSON' | 'COURSE' = 'LESSON') => {
    setReviewType(type);
    setIsReviewModalOpen(true);
  };

  const closeReviewModal = () => {
    setIsReviewModalOpen(false);
  };

  const submitReviewToMentor = async (notes: string) => {
    if (!courseId) return;
    setIsSubmittingReview(true);
    try {
      await reviewerService.submitReview({
        tutorId: primaryReviewer?.id,
        courseId,
        topicId: reviewType === 'LESSON' ? currentTopic?.id : undefined,
        type: reviewType,
        studentNotes: notes
      });

      setToast({
        type: 'success',
        message: `Your ${reviewType.toLowerCase()} has been sent to ${primaryReviewer?.name || 'your primary reviewer'} for expert evaluation!`
      });
      setIsReviewModalOpen(false);
    } catch (err: any) {
      setToast({
        type: 'error',
        message: err.message || 'Failed to submit review request.'
      });
    } finally {
      setIsSubmittingReview(false);
      setTimeout(() => setToast(null), 5000);
    }
  };

  const goToTopic = (index: number) => {
    if (index >= 0 && index < topics.length) {
      setActiveTopicIndex(index);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const goToNext = () => {
    if (activeTopicIndex < topics.length - 1) {
      goToTopic(activeTopicIndex + 1);
    }
  };

  const goToPrev = () => {
    if (activeTopicIndex > 0) {
      goToTopic(activeTopicIndex - 1);
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  return {
    course,
    topics,
    stats,
    currentTopic,
    activeTopicIndex,
    isLoading,
    isCompleting,
    isSidebarOpen,
    toast,
    setToast,

    // Multi-question properties
    questionsList,
    currentQuestion,
    activeQuestionIndex,
    selectedOption: selectedOptionForCurrentQ,
    isAnswerChecked: isCheckedForCurrentQ,
    isAnswerCorrect: isCorrectForCurrentQ,
    isAllQuestionsCorrect,
    questionAnswers,
    handleSelectOption,
    goToQuestion,
    handleCompleteTopic,

    // Review submission properties
    primaryReviewer,
    isReviewModalOpen,
    reviewType,
    isSubmittingReview,
    openReviewModal,
    closeReviewModal,
    submitReviewToMentor,

    goToTopic,
    goToNext,
    goToPrev,
    toggleSidebar,
    navigateBackToCourses: () => navigate('/courses'),
    navigateBackToDashboard: () => navigate('/dashboard')
  };
}
