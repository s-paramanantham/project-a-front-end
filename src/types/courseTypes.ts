export interface Course {
  id: string;
  title: string;
  publisher: string;
  description: string;
  image: string;
  level?: string;
  duration?: string;
  rating?: number | string;
  category?: string;
  created_at?: string;
  updated_at?: string;
  is_enrolled?: boolean;
  enrolled_at?: string;
  enrollment_status?: string;
  progress_percent?: number;
}

export interface CourseMeta {
  mode: 'all' | 'enrolled';
  hasEnrolled: boolean;
  enrolledCount: number;
  totalCourses: number;
  filterApplied: string;
}

export interface CoursesResponse {
  success: boolean;
  message: string;
  data: Course[];
  meta: CourseMeta;
}

export interface EnrollResponse {
  success: boolean;
  message: string;
  data?: {
    enrollment?: {
      id: string;
      user_id: string;
      course_id: string;
      enrolled_at: string;
      status: string;
    };
    course?: Course;
  };
}

export interface QuizQuestion {
  id?: string;
  question_text: string;
  question_options: string[];
  correct_option_index: number;
  question_explanation: string;
}

export interface Topic {
  id: string;
  course_id: string;
  order_index: number;
  title: string;
  description: string;
  explanation: string;
  code_example?: string;
  code_language?: string;
  image_url?: string;
  key_takeaways?: string[];
  question_text: string;
  question_options: string[];
  correct_option_index: number;
  question_explanation: string;
  questions?: QuizQuestion[];
  is_completed?: boolean;
  completed_at?: string;
  selected_option_index?: number;
}

export interface TopicStats {
  totalTopics: number;
  completedCount: number;
  progressPercent: number;
  isCompleted: boolean;
}

export interface CourseTopicsResponse {
  success: boolean;
  data: {
    course: Course;
    topics: Topic[];
    stats: TopicStats;
  };
}

export interface CompleteTopicResponse {
  success: boolean;
  message: string;
  data: {
    message: string;
    topic: Topic;
    stats: {
      totalTopics: number;
      completedCount: number;
      progressPercent: number;
      isCourseCompleted: boolean;
    };
  };
}

