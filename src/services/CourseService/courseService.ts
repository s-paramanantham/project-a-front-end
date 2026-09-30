import { apiClient } from '../../client/api.client';
import { authService } from '../AuthService/authService';
import type {
  Course,
  CourseMeta,
  CoursesResponse,
  EnrollResponse,
  Topic,
  TopicStats,
  CourseTopicsResponse,
  CompleteTopicResponse
} from '../../types/courseTypes';

export interface GetCoursesParams {
  userId?: string;
  filter?: 'auto' | 'all' | 'enrolled';
  search?: string;
}

export class CourseService {
  /**
   * Fetch courses for the student:
   * - If student has any courses, returns those enrolled courses; otherwise returns all courses.
   * - Can also pass explicit filter 'all' or 'enrolled'.
   */
  public async getCourses(params: GetCoursesParams = {}): Promise<{ courses: Course[]; meta: CourseMeta }> {
    const currentUser = authService.getCurrentUser();
    const userId = params.userId || currentUser?.id || currentUser?.email;

    try {
      const queryParams: Record<string, string | undefined> = {
        userId: userId || undefined,
        filter: params.filter || 'auto',
        search: params.search?.trim() || undefined
      };

      const response = await apiClient.get<CoursesResponse>('/courses', {
        params: queryParams,
        requiresAuth: true
      });

      return {
        courses: response.data || [],
        meta: response.meta || {
          mode: 'all',
          hasEnrolled: false,
          enrolledCount: 0,
          totalCourses: (response.data || []).length,
          filterApplied: params.filter || 'auto'
        }
      };
    } catch (error) {
      console.warn('[CourseService] Backend request failed, utilizing local fallback if needed:', error);
      throw error;
    }
  }

  /**
   * Enroll the student in a course
   */
  public async enrollCourse(courseId: string, customUserId?: string): Promise<EnrollResponse> {
    const currentUser = authService.getCurrentUser();
    const userId = customUserId || currentUser?.id || currentUser?.email || 'guest-learner';

    try {
      const response = await apiClient.post<EnrollResponse>(
        '/courses/enroll',
        {
          courseId,
          userId
        },
        { requiresAuth: true }
      );

      return response;
    } catch (error) {
      console.error('[CourseService] Failed to enroll in course:', error);
      throw error;
    }
  }

  /**
   * Unenroll the student from a course
   */
  public async unenrollCourse(courseId: string, customUserId?: string): Promise<{ success: boolean; message: string }> {
    const currentUser = authService.getCurrentUser();
    const userId = customUserId || currentUser?.id || currentUser?.email || 'guest-learner';

    try {
      const response = await apiClient.post<{ success: boolean; message: string }>(
        '/courses/unenroll',
        {
          courseId,
          userId
        },
        { requiresAuth: true }
      );

      return response;
    } catch (error) {
      console.error('[CourseService] Failed to unenroll from course:', error);
      throw error;
    }
  }

  /**
   * Fetch all topics/lessons and progress for a course
   */
  public async getCourseTopics(
    courseId: string,
    customUserId?: string
  ): Promise<{ course: Course; topics: Topic[]; stats: TopicStats }> {
    const currentUser = authService.getCurrentUser();
    const userId = customUserId || currentUser?.id || currentUser?.email;

    const response = await apiClient.get<CourseTopicsResponse>(`/courses/${courseId}/topics`, {
      params: { userId },
      requiresAuth: true
    });

    return response.data;
  }

  /**
   * Fetch single topic detail
   */
  public async getTopicDetail(
    courseId: string,
    topicId: string,
    customUserId?: string
  ): Promise<{ course: Course; topic: Topic }> {
    const currentUser = authService.getCurrentUser();
    const userId = customUserId || currentUser?.id || currentUser?.email;

    const response = await apiClient.get<{ success: boolean; data: { course: Course; topic: Topic } }>(
      `/courses/${courseId}/topics/${topicId}`,
      {
        params: { userId },
        requiresAuth: true
      }
    );

    return response.data;
  }

  /**
   * Submit topic question answer and complete lesson
   */
  public async completeTopic(
    courseId: string,
    topicId: string,
    selectedOptionIndex: number,
    customUserId?: string
  ): Promise<CompleteTopicResponse> {
    const currentUser = authService.getCurrentUser();
    const userId = customUserId || currentUser?.id || currentUser?.email || 'guest-learner';

    const response = await apiClient.post<CompleteTopicResponse>(
      `/courses/${courseId}/topics/${topicId}/complete`,
      {
        userId,
        selectedOptionIndex
      },
      { requiresAuth: true }
    );

    return response;
  }

  /**
   * Create a new course with lessons (for tutors)
   */
  public async createCourse(payload: {
    title: string;
    publisher: string;
    description: string;
    image: string;
    level: string;
    duration: string;
    category: string;
    topics: {
      title: string;
      description: string;
      explanation: string;
      code_example: string;
      code_language: string;
      image_url?: string | null;
      key_takeaways: string[];
      question_text?: string;
      question_options?: string[];
      correct_option_index?: number;
      question_explanation?: string;
      questions?: Array<{
        question_text: string;
        question_options: string[];
        correct_option_index: number;
        question_explanation: string;
      }>;
    }[];
  }): Promise<{ course: Course; topics: any[] }> {
    const response = await apiClient.post<{ success: boolean; data: { course: Course; topics: any[] } }>(
      '/courses',
      payload,
      { requiresAuth: true }
    );
    return response.data;
  }

  /**
   * Update an existing course (for tutors)
   */
  public async updateCourse(
    courseId: string,
    payload: Partial<{
      title: string;
      publisher: string;
      description: string;
      image: string;
      level: string;
      duration: string;
      category: string;
    }>
  ): Promise<Course> {
    const response = await apiClient.put<{ success: boolean; data: Course }>(
      `/courses/${courseId}`,
      payload,
      { requiresAuth: true }
    );
    return response.data;
  }

  /**
   * Add a new lesson / topic to an existing course (for tutors)
   */
  public async addTopic(courseId: string, payload: any): Promise<Topic> {
    const response = await apiClient.post<{ success: boolean; data: Topic }>(
      `/courses/${courseId}/topics`,
      payload,
      { requiresAuth: true }
    );
    return response.data;
  }

  /**
   * Update an existing lesson / topic in a course (for tutors)
   */
  public async updateTopic(courseId: string, topicId: string, payload: any): Promise<Topic> {
    const response = await apiClient.put<{ success: boolean; data: Topic }>(
      `/courses/${courseId}/topics/${topicId}`,
      payload,
      { requiresAuth: true }
    );
    return response.data;
  }

  /**
   * Delete a lesson from a course (for tutors)
   */
  public async deleteTopic(courseId: string, topicId: string): Promise<boolean> {
    await apiClient.delete<{ success: boolean; message: string }>(
      `/courses/${courseId}/topics/${topicId}`,
      { requiresAuth: true }
    );
    return true;
  }
}

export const courseService = new CourseService();
export default courseService;
