import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { courseService } from '../../../services/CourseService/courseService';
import { authService } from '../../../services/AuthService/authService';

export interface QuizQuestionForm {
  question_text: string;
  question_options: [string, string, string, string];
  correct_option_index: number;
  question_explanation: string;
}

export interface LessonForm {
  title: string;
  description: string;
  explanation: string;
  code_example: string;
  code_language: string;
  image_url: string;
  key_takeaways: string[];
  questions: QuizQuestionForm[];
}

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

export const DEFAULT_IMAGE_PLACEHOLDERS = [
  'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=800&auto=format&fit=crop'
];

export function useCreateCourseVM() {
  const navigate = useNavigate();
  const currentUser = authService.getCurrentUser();

  // Wizard Steps: 1 = Course Details, 2 = Lessons Builder, 3 = Review & Publish
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  // Page 1: Course Info
  const [title, setTitle] = useState('');
  const [publisher, setPublisher] = useState(currentUser?.name || 'Tutor');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState(DEFAULT_IMAGE_PLACEHOLDERS[0]);
  const [level, setLevel] = useState('Beginner');
  const [duration, setDuration] = useState('12 Hours');
  const [category, setCategory] = useState(CATEGORIES[0]);

  // Image crop modal for thumbnail
  const [isCropperOpen, setIsCropperOpen] = useState(false);
  const [rawImageForCrop, setRawImageForCrop] = useState<string | null>(null);

  // Page 2: Lessons
  const [lessons, setLessons] = useState<LessonForm[]>([
    {
      title: '',
      description: '',
      explanation: '',
      code_example: '',
      code_language: 'javascript',
      image_url: DEFAULT_IMAGE_PLACEHOLDERS[1],
      key_takeaways: [''],
      questions: [
        {
          question_text: '',
          question_options: ['', '', '', ''],
          correct_option_index: 0,
          question_explanation: ''
        }
      ]
    }
  ]);
  const [activeLessonIndex, setActiveLessonIndex] = useState(0);

  // Validation / Submission states
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  // Step 1 Validation
  const validateStep1 = (): boolean => {
    setErrorMessage(null);
    if (!title.trim()) {
      setErrorMessage('Please enter a course title.');
      return false;
    }
    if (!publisher.trim()) {
      setErrorMessage('Please enter the publisher / instructor name.');
      return false;
    }
    if (!category.trim()) {
      setErrorMessage('Please select a course category.');
      return false;
    }
    if (!level.trim()) {
      setErrorMessage('Please select a difficulty level.');
      return false;
    }
    if (!duration.trim()) {
      setErrorMessage('Please enter estimated course duration (e.g. 10 Hours).');
      return false;
    }
    if (!image.trim()) {
      setErrorMessage('Please provide a course thumbnail image.');
      return false;
    }
    if (!description.trim()) {
      setErrorMessage('Please enter a comprehensive course description.');
      return false;
    }
    return true;
  };

  // Step 2 Validation
  const validateStep2 = (): boolean => {
    setErrorMessage(null);
    if (lessons.length === 0) {
      setErrorMessage('At least one curriculum lesson is required.');
      return false;
    }

    for (let i = 0; i < lessons.length; i++) {
      const l = lessons[i];
      const num = i + 1;

      if (!l.title.trim()) {
        setActiveLessonIndex(i);
        setErrorMessage(`Lesson #${num}: Title cannot be empty.`);
        return false;
      }
      if (!l.description.trim()) {
        setActiveLessonIndex(i);
        setErrorMessage(`Lesson #${num}: Short summary description is required.`);
        return false;
      }
      if (!l.explanation.trim()) {
        setActiveLessonIndex(i);
        setErrorMessage(`Lesson #${num}: Full concept explanation is required.`);
        return false;
      }
      if (!l.code_example.trim()) {
        setActiveLessonIndex(i);
        setErrorMessage(`Lesson #${num}: Code example is required.`);
        return false;
      }
      if (!l.code_language.trim()) {
        setActiveLessonIndex(i);
        setErrorMessage(`Lesson #${num}: Code language must be selected.`);
        return false;
      }
      const validTakeaways = l.key_takeaways.filter((t) => t.trim().length > 0);
      if (validTakeaways.length === 0) {
        setActiveLessonIndex(i);
        setErrorMessage(`Lesson #${num}: Must include at least 1 key takeaway.`);
        return false;
      }
      if (!l.questions || l.questions.length === 0) {
        setActiveLessonIndex(i);
        setErrorMessage(`Lesson #${num}: Must include at least 1 quiz question.`);
        return false;
      }
      for (let qIdx = 0; qIdx < l.questions.length; qIdx++) {
        const q = l.questions[qIdx];
        const qNum = qIdx + 1;
        if (!q.question_text.trim()) {
          setActiveLessonIndex(i);
          setErrorMessage(`Lesson #${num}, Question #${qNum}: Quiz question text is required.`);
          return false;
        }
        for (let o = 0; o < 4; o++) {
          if (!q.question_options[o]?.trim()) {
            setActiveLessonIndex(i);
            setErrorMessage(`Lesson #${num}, Question #${qNum}: Option ${String.fromCharCode(65 + o)} is empty.`);
            return false;
          }
        }
        if (!q.question_explanation.trim()) {
          setActiveLessonIndex(i);
          setErrorMessage(`Lesson #${num}, Question #${qNum}: Quiz answer explanation is required.`);
          return false;
        }
      }
    }
    return true;
  };

  const handleNextToStep2 = () => {
    if (validateStep1()) {
      setCurrentStep(2);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleNextToStep3 = () => {
    if (validateStep2()) {
      setCurrentStep(3);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Add another lesson
  const handleAddLesson = () => {
    const newLesson: LessonForm = {
      title: '',
      description: '',
      explanation: '',
      code_example: '',
      code_language: 'javascript',
      image_url: DEFAULT_IMAGE_PLACEHOLDERS[(lessons.length + 1) % DEFAULT_IMAGE_PLACEHOLDERS.length],
      key_takeaways: [''],
      questions: [
        {
          question_text: '',
          question_options: ['', '', '', ''],
          correct_option_index: 0,
          question_explanation: ''
        }
      ]
    };
    setLessons([...lessons, newLesson]);
    setActiveLessonIndex(lessons.length);
  };

  // Remove lesson
  const handleRemoveLesson = (indexToRemove: number) => {
    if (lessons.length <= 1) {
      setErrorMessage('Courses must contain at least one lesson.');
      return;
    }
    const filtered = lessons.filter((_, idx) => idx !== indexToRemove);
    setLessons(filtered);
    setActiveLessonIndex(Math.max(0, indexToRemove - 1));
  };

  // Update active lesson fields
  const updateCurrentLesson = (fields: Partial<LessonForm>) => {
    setLessons((prev) => {
      const copy = [...prev];
      copy[activeLessonIndex] = { ...copy[activeLessonIndex], ...fields };
      return copy;
    });
  };

  // Takeaway helpers
  const handleTakeawayChange = (tIdx: number, val: string) => {
    const list = [...lessons[activeLessonIndex].key_takeaways];
    list[tIdx] = val;
    updateCurrentLesson({ key_takeaways: list });
  };

  const handleAddTakeaway = () => {
    const list = [...lessons[activeLessonIndex].key_takeaways, ''];
    updateCurrentLesson({ key_takeaways: list });
  };

  const handleRemoveTakeaway = (tIdx: number) => {
    if (lessons[activeLessonIndex].key_takeaways.length <= 1) return;
    const list = lessons[activeLessonIndex].key_takeaways.filter((_, idx) => idx !== tIdx);
    updateCurrentLesson({ key_takeaways: list });
  };

  // Question / Quiz helpers for active lesson
  const handleAddQuestion = () => {
    const curQuestions = lessons[activeLessonIndex].questions || [];
    const newQ: QuizQuestionForm = {
      question_text: '',
      question_options: ['', '', '', ''],
      correct_option_index: 0,
      question_explanation: ''
    };
    updateCurrentLesson({ questions: [...curQuestions, newQ] });
  };

  const handleDuplicateQuestion = (qIdx: number) => {
    const curQuestions = lessons[activeLessonIndex].questions || [];
    const target = curQuestions[qIdx];
    if (!target) return;
    const dupQ: QuizQuestionForm = {
      question_text: target.question_text ? `${target.question_text} (Copy)` : '',
      question_options: [...target.question_options],
      correct_option_index: target.correct_option_index,
      question_explanation: target.question_explanation
    };
    updateCurrentLesson({ questions: [...curQuestions, dupQ] });
  };

  const handleRemoveQuestion = (qIdx: number) => {
    const curQuestions = lessons[activeLessonIndex].questions || [];
    if (curQuestions.length <= 1) return;
    const filtered = curQuestions.filter((_, idx) => idx !== qIdx);
    updateCurrentLesson({ questions: filtered });
  };

  const handleQuestionFieldChange = (qIdx: number, fields: Partial<QuizQuestionForm>) => {
    const curQuestions = [...(lessons[activeLessonIndex].questions || [])];
    curQuestions[qIdx] = { ...curQuestions[qIdx], ...fields };
    updateCurrentLesson({ questions: curQuestions });
  };

  const handleQuestionOptionChange = (qIdx: number, optIdx: number, val: string) => {
    const curQuestions = [...(lessons[activeLessonIndex].questions || [])];
    const opts: [string, string, string, string] = [...curQuestions[qIdx].question_options];
    opts[optIdx] = val;
    curQuestions[qIdx] = { ...curQuestions[qIdx], question_options: opts };
    updateCurrentLesson({ questions: curQuestions });
  };

  // Final Publish Handler
  const handlePublishCourse = async () => {
    if (!validateStep1()) {
      setCurrentStep(1);
      return;
    }
    if (!validateStep2()) {
      setCurrentStep(2);
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const payload = {
        title: title.trim(),
        publisher: publisher.trim(),
        description: description.trim(),
        image: image.trim(),
        level,
        duration,
        category,
        topics: lessons.map((l, idx) => ({
          order_index: idx + 1,
          title: l.title.trim(),
          description: l.description.trim(),
          explanation: l.explanation.trim(),
          code_example: l.code_example.trim(),
          code_language: l.code_language.trim(),
          image_url: l.image_url.trim() || null,
          key_takeaways: l.key_takeaways.map((k) => k.trim()).filter(Boolean),
          question_text: l.questions[0].question_text.trim(),
          question_options: l.questions[0].question_options.map((o) => o.trim()),
          correct_option_index: l.questions[0].correct_option_index,
          question_explanation: l.questions[0].question_explanation.trim(),
          questions: l.questions.map((q, qIndex) => ({
            id: `q-${qIndex + 1}`,
            question_text: q.question_text.trim(),
            question_options: q.question_options.map((o) => o.trim()),
            correct_option_index: q.correct_option_index,
            question_explanation: q.question_explanation.trim()
          }))
        }))
      };

      const result = await courseService.createCourse(payload);
      navigate(`/courses/${result.course.id}/study`);
    } catch (err: any) {
      console.error('Course creation failed:', err);
      setErrorMessage(
        err?.response?.data?.message || err?.message || 'Failed to create course. Please review all fields.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const activeLesson = lessons[activeLessonIndex] || lessons[0];

  return {
    navigate,
    currentUser,
    currentStep,
    setCurrentStep,
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
    isCropperOpen,
    setIsCropperOpen,
    rawImageForCrop,
    setRawImageForCrop,
    lessons,
    setLessons,
    activeLessonIndex,
    setActiveLessonIndex,
    activeLesson,
    errorMessage,
    setErrorMessage,
    isSubmitting,
    validateStep1,
    validateStep2,
    handleFileChange,
    handleNextToStep2,
    handleNextToStep3,
    handleAddLesson,
    handleRemoveLesson,
    updateCurrentLesson,
    handleTakeawayChange,
    handleAddTakeaway,
    handleRemoveTakeaway,
    handleAddQuestion,
    handleDuplicateQuestion,
    handleRemoveQuestion,
    handleQuestionFieldChange,
    handleQuestionOptionChange,
    handlePublishCourse
  };
}
