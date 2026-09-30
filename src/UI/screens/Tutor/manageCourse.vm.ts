import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { courseService } from '../../../services/CourseService/courseService';
import type { Course, Topic, QuizQuestion } from '../../../types/courseTypes';

export const CATEGORIES = [
  'Web Development',
  'Frontend Engineering',
  'Backend Engineering',
  'Cloud & DevOps',
  'Data Science & AI',
  'Programming Languages',
  'Database Management',
  'Cybersecurity'
];

export const CODE_LANGUAGES = [
  'javascript',
  'typescript',
  'html',
  'css',
  'python',
  'sql',
  'bash',
  'json'
];

export interface TopicModalForm {
  id?: string;
  title: string;
  description: string;
  explanation: string;
  code_example: string;
  code_language: string;
  image_url: string;
  key_takeaways: string[];
  questions: Array<{
    id?: string;
    question_text: string;
    question_options: [string, string, string, string];
    correct_option_index: number;
    question_explanation: string;
  }>;
}

export function useManageCourseVM() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();

  const [course, setCourse] = useState<Course | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Course edit fields
  const [title, setTitle] = useState('');
  const [publisher, setPublisher] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [level, setLevel] = useState('Beginner');
  const [duration, setDuration] = useState('10 Hours');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [isSavingCourse, setIsSavingCourse] = useState(false);

  // Image Cropper modal state
  const [isCropperOpen, setIsCropperOpen] = useState(false);
  const [rawImageForCrop, setRawImageForCrop] = useState<string | null>(null);

  // Lesson Edit / Add Modal state
  const [isLessonModalOpen, setIsLessonModalOpen] = useState(false);
  const [editingTopicId, setEditingTopicId] = useState<string | null>(null);
  const [lessonForm, setLessonForm] = useState<TopicModalForm>({
    title: '',
    description: '',
    explanation: '',
    code_example: '',
    code_language: 'javascript',
    image_url: '',
    key_takeaways: [''],
    questions: [
      {
        question_text: '',
        question_options: ['', '', '', ''],
        correct_option_index: 0,
        question_explanation: ''
      }
    ]
  });
  const [isSavingLesson, setIsSavingLesson] = useState(false);
  const [deletingTopicId, setDeletingTopicId] = useState<string | null>(null);

  const loadCourseData = useCallback(async () => {
    if (!courseId) return;
    setIsLoading(true);
    try {
      const data = await courseService.getCourseTopics(courseId);
      setCourse(data.course);
      setTopics(data.topics);

      // Populate course form
      setTitle(data.course.title || '');
      setPublisher(data.course.publisher || '');
      setDescription(data.course.description || '');
      setImage(data.course.image || '');
      setLevel(data.course.level || 'Beginner');
      setDuration(data.course.duration || '10 Hours');
      setCategory(data.course.category || CATEGORIES[0]);
    } catch (err: any) {
      setToast({ message: err.message || 'Failed to load course details', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    loadCourseData();
  }, [loadCourseData]);

  // Handle Cover file selection for crop
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setRawImageForCrop(reader.result as string);
      setIsCropperOpen(true);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleSaveCourseInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseId) return;

    setIsSavingCourse(true);
    try {
      const updated = await courseService.updateCourse(courseId, {
        title: title.trim(),
        publisher: publisher.trim(),
        description: description.trim(),
        image: image.trim(),
        level,
        duration,
        category
      });
      setCourse(updated);
      setToast({ message: 'Course metadata updated successfully!', type: 'success' });
    } catch (err: any) {
      setToast({ message: err.message || 'Failed to update course', type: 'error' });
    } finally {
      setIsSavingCourse(false);
      setTimeout(() => setToast(null), 4000);
    }
  };

  const handleOpenAddLesson = () => {
    setEditingTopicId(null);
    setLessonForm({
      title: '',
      description: '',
      explanation: '',
      code_example: '',
      code_language: 'javascript',
      image_url: image || '',
      key_takeaways: [''],
      questions: [
        {
          question_text: '',
          question_options: ['', '', '', ''],
          correct_option_index: 0,
          question_explanation: ''
        }
      ]
    });
    setIsLessonModalOpen(true);
  };

  const handleOpenEditLesson = (topic: Topic) => {
    setEditingTopicId(topic.id);

    const questionsList =
      Array.isArray(topic.questions) && topic.questions.length > 0
        ? topic.questions.map((q: QuizQuestion) => ({
            id: q.id,
            question_text: q.question_text || '',
            question_options: (q.question_options && q.question_options.length === 4
              ? q.question_options
              : [
                  q.question_options?.[0] || '',
                  q.question_options?.[1] || '',
                  q.question_options?.[2] || '',
                  q.question_options?.[3] || ''
                ]) as [string, string, string, string],
            correct_option_index: q.correct_option_index ?? 0,
            question_explanation: q.question_explanation || ''
          }))
        : [
            {
              id: 'q-1',
              question_text: topic.question_text || '',
              question_options: (topic.question_options && topic.question_options.length === 4
                ? topic.question_options
                : [
                    topic.question_options?.[0] || '',
                    topic.question_options?.[1] || '',
                    topic.question_options?.[2] || '',
                    topic.question_options?.[3] || ''
                  ]) as [string, string, string, string],
              correct_option_index: topic.correct_option_index ?? 0,
              question_explanation: topic.question_explanation || ''
            }
          ];

    setLessonForm({
      id: topic.id,
      title: topic.title,
      description: topic.description,
      explanation: topic.explanation,
      code_example: topic.code_example || '',
      code_language: topic.code_language || 'javascript',
      image_url: topic.image_url || '',
      key_takeaways: topic.key_takeaways && topic.key_takeaways.length > 0 ? topic.key_takeaways : [''],
      questions: questionsList
    });
    setIsLessonModalOpen(true);
  };

  const handleDuplicateQuestionInModal = (qIdx: number) => {
    const target = lessonForm.questions[qIdx];
    if (!target) return;
    const dupQ = {
      id: `q-${Date.now()}`,
      question_text: target.question_text ? `${target.question_text} (Copy)` : '',
      question_options: [...target.question_options] as [string, string, string, string],
      correct_option_index: target.correct_option_index,
      question_explanation: target.question_explanation
    };
    setLessonForm({
      ...lessonForm,
      questions: [...lessonForm.questions, dupQ]
    });
  };

  const handleDeleteLesson = async (topicId: string) => {
    if (!courseId) return;
    if (!window.confirm('Are you sure you want to delete this lesson from the curriculum?')) return;

    setDeletingTopicId(topicId);
    try {
      await courseService.deleteTopic(courseId, topicId);
      setToast({ message: 'Lesson deleted successfully', type: 'success' });
      await loadCourseData();
    } catch (err: any) {
      setToast({ message: err.message || 'Failed to delete lesson', type: 'error' });
    } finally {
      setDeletingTopicId(null);
      setTimeout(() => setToast(null), 4000);
    }
  };

  const handleSaveLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseId) return;

    // Strict validation
    if (!lessonForm.title.trim()) {
      setToast({ message: 'Lesson title is required.', type: 'error' });
      return;
    }
    if (!lessonForm.description.trim()) {
      setToast({ message: 'Lesson description is required.', type: 'error' });
      return;
    }
    if (!lessonForm.explanation.trim()) {
      setToast({ message: 'Full lesson explanation is required.', type: 'error' });
      return;
    }
    if (!lessonForm.code_example.trim()) {
      setToast({ message: 'Code example is required.', type: 'error' });
      return;
    }

    for (let qIdx = 0; qIdx < lessonForm.questions.length; qIdx++) {
      const q = lessonForm.questions[qIdx];
      const qNum = qIdx + 1;
      if (!q.question_text.trim()) {
        setToast({ message: `Question #${qNum} text is required.`, type: 'error' });
        return;
      }
      for (let o = 0; o < 4; o++) {
        if (!q.question_options[o]?.trim()) {
          setToast({ message: `Question #${qNum}, Option ${String.fromCharCode(65 + o)} is empty.`, type: 'error' });
          return;
        }
      }
      if (!q.question_explanation.trim()) {
        setToast({ message: `Question #${qNum} explanation is required.`, type: 'error' });
        return;
      }
    }

    setIsSavingLesson(true);
    try {
      const payload = {
        title: lessonForm.title.trim(),
        description: lessonForm.description.trim(),
        explanation: lessonForm.explanation.trim(),
        code_example: lessonForm.code_example.trim(),
        code_language: lessonForm.code_language.trim(),
        image_url: lessonForm.image_url.trim() || null,
        key_takeaways: lessonForm.key_takeaways.map((k) => k.trim()).filter(Boolean),
        question_text: lessonForm.questions[0].question_text.trim(),
        question_options: lessonForm.questions[0].question_options.map((o) => o.trim()),
        correct_option_index: lessonForm.questions[0].correct_option_index,
        question_explanation: lessonForm.questions[0].question_explanation.trim(),
        questions: lessonForm.questions.map((q, idx) => ({
          id: q.id || `q-${idx + 1}`,
          question_text: q.question_text.trim(),
          question_options: q.question_options.map((o) => o.trim()),
          correct_option_index: q.correct_option_index,
          question_explanation: q.question_explanation.trim()
        }))
      };

      if (editingTopicId) {
        await courseService.updateTopic(courseId, editingTopicId, payload);
        setToast({ message: 'Lesson updated successfully!', type: 'success' });
      } else {
        await courseService.addTopic(courseId, payload);
        setToast({ message: 'New lesson added to course successfully!', type: 'success' });
      }

      setIsLessonModalOpen(false);
      await loadCourseData();
    } catch (err: any) {
      setToast({ message: err.message || 'Failed to save lesson', type: 'error' });
    } finally {
      setIsSavingLesson(false);
      setTimeout(() => setToast(null), 4000);
    }
  };

  return {
    courseId,
    navigate,
    course,
    setCourse,
    topics,
    isLoading,
    toast,
    setToast,
    title,
    setTitle,
    publisher,
    setPublisher,
    description,
    setDescription,
    image,
    setImage,
    level,
    setLevel,
    duration,
    setDuration,
    category,
    setCategory,
    isSavingCourse,
    isCropperOpen,
    setIsCropperOpen,
    rawImageForCrop,
    setRawImageForCrop,
    isLessonModalOpen,
    setIsLessonModalOpen,
    editingTopicId,
    lessonForm,
    setLessonForm,
    isSavingLesson,
    deletingTopicId,
    loadCourseData,
    handleFileChange,
    handleSaveCourseInfo,
    handleOpenAddLesson,
    handleOpenEditLesson,
    handleDuplicateQuestionInModal,
    handleDeleteLesson,
    handleSaveLesson
  };
}
