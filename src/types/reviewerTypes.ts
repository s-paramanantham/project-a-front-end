export interface CreatedCourseSummary {
  id: string;
  title: string;
  image: string;
  category: string;
}

export interface TutorReviewer {
  id: string;
  name: string;
  email: string;
  avatar_url?: string | null;
  cover_url?: string | null;
  education?: {
    degree?: string;
    institution?: string;
    graduationYear?: string;
    fieldOfStudy?: string;
  };
  work?: {
    company?: string;
    jobTitle?: string;
    experienceYears?: string;
    industry?: string;
  };
  rating: number;
  total_courses: number;
  created_courses: CreatedCourseSummary[];
  is_primary: boolean;
  assigned_at?: string | null;
}

export interface ReviewSubmission {
  id: string;
  student_id: string;
  student_name?: string;
  student_email?: string;
  student_avatar?: string | null;
  tutor_id: string;
  tutor_name?: string;
  course_id: string;
  course_title?: string;
  topic_id?: string | null;
  topic_title?: string | null;
  type: 'LESSON' | 'COURSE';
  status: 'PENDING' | 'REVIEWED' | 'APPROVED';
  student_notes?: string | null;
  feedback?: string | null;
  rating_given?: number | null;
  created_at: string;
  reviewed_at?: string | null;
}

export interface EnrolledCourseSummary {
  course_id: string;
  title: string;
  image: string;
  progress_percent: number;
  status: string;
  enrolled_at: string;
  completed_topics_count: number;
  total_topics_count: number;
}

export interface AssignedStudent {
  id: string;
  cognito_user_id: string;
  name: string;
  email: string;
  phone?: string | null;
  avatar_url?: string | null;
  education?: {
    degree?: string;
    institution?: string;
    graduationYear?: string;
    fieldOfStudy?: string;
  };
  work?: {
    company?: string;
    jobTitle?: string;
    experienceYears?: string;
    industry?: string;
  };
  address?: {
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
  assigned_at?: string;
  is_primary_reviewer: boolean;
  enrolled_courses: EnrolledCourseSummary[];
  overall_progress: number;
  pending_reviews_count: number;
}

export interface StudentProgressDetails {
  student: {
    id: string;
    cognito_user_id: string;
    name: string;
    email: string;
    phone?: string | null;
    avatar_url?: string | null;
    cover_url?: string | null;
    education?: any;
    work?: any;
    address?: any;
    created_at?: string;
  };
  courses: Array<{
    course_id: string;
    title: string;
    publisher: string;
    image: string;
    category: string;
    level: string;
    progress_percent: number;
    status: string;
    enrolled_at: string;
    total_topics: number;
    completed_topics: number;
    calculated_progress: number;
    topics: Array<{
      id: string;
      title: string;
      order_index: number;
      is_completed: boolean;
      completed_at?: string;
    }>;
  }>;
  reviews: ReviewSubmission[];
}
