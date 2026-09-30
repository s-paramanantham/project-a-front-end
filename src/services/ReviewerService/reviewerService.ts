import { apiClient } from '../../client/apiClient';
import { authService } from '../AuthService/authService';
import type { TutorReviewer, ReviewSubmission } from '../../types/reviewerTypes';

export class ReviewerService {
  /**
   * Fetch all tutors and their courses/rating with student's primary reviewer flag
   */
  public async getTutors(): Promise<TutorReviewer[]> {
    const user = authService.getCurrentUser();
    const studentId = user?.id || user?.email;

    try {
      const res = await apiClient.get<{ success: boolean; data: TutorReviewer[] }>('/reviewers/tutors', {
        params: { studentId },
        requiresAuth: true
      });
      return res.data || [];
    } catch (err) {
      console.warn('[ReviewerService] Error fetching tutors:', err);
      return [];
    }
  }

  /**
   * Assign tutor as primary reviewer
   */
  public async assignPrimaryReviewer(tutorId: string): Promise<any> {
    const user = authService.getCurrentUser();
    const studentId = user?.id || user?.email;
    if (!studentId) throw new Error('You must be logged in to assign a primary reviewer');

    const res = await apiClient.post<{ success: boolean; message: string; data: any }>(
      '/reviewers/assign-primary',
      {
        studentId,
        tutorId
      },
      { requiresAuth: true }
    );
    return res;
  }

  /**
   * Fetch student's assigned primary reviewer
   */
  public async getMyPrimaryReviewer(): Promise<TutorReviewer | null> {
    const user = authService.getCurrentUser();
    const studentId = user?.id || user?.email;
    if (!studentId) return null;

    try {
      const res = await apiClient.get<{ success: boolean; data: TutorReviewer | null }>(
        '/reviewers/my-primary',
        {
          params: { studentId },
          requiresAuth: true
        }
      );
      return res.data || null;
    } catch (err) {
      return null;
    }
  }

  /**
   * Submit a lesson or course review to reviewer
   */
  public async submitReview(payload: {
    tutorId?: string;
    courseId: string;
    topicId?: string;
    type?: 'LESSON' | 'COURSE';
    studentNotes?: string;
  }): Promise<ReviewSubmission> {
    const user = authService.getCurrentUser();
    const studentId = user?.id || user?.email;
    if (!studentId) throw new Error('You must be logged in to submit a review');

    const res = await apiClient.post<{ success: boolean; message: string; data: ReviewSubmission }>(
      '/reviewers/submit-review',
      {
        studentId,
        tutorId: payload.tutorId,
        courseId: payload.courseId,
        topicId: payload.topicId,
        type: payload.type || (payload.topicId ? 'LESSON' : 'COURSE'),
        studentNotes: payload.studentNotes
      },
      { requiresAuth: true }
    );
    return res.data;
  }

  /**
   * Fetch reviews submitted by student
   */
  public async getStudentReviews(): Promise<ReviewSubmission[]> {
    const user = authService.getCurrentUser();
    const studentId = user?.id || user?.email;
    if (!studentId) return [];

    try {
      const res = await apiClient.get<{ success: boolean; data: ReviewSubmission[] }>(
        '/reviewers/student-reviews',
        {
          params: { studentId },
          requiresAuth: true
        }
      );
      return res.data || [];
    } catch (err) {
      return [];
    }
  }

  /**
   * Fetch reviews received by tutor
   */
  public async getTutorReviews(): Promise<ReviewSubmission[]> {
    const user = authService.getCurrentUser();
    const tutorId = user?.id || user?.email;
    if (!tutorId) return [];

    try {
      const res = await apiClient.get<{ success: boolean; data: ReviewSubmission[] }>(
        '/reviewers/tutor-reviews',
        {
          params: { tutorId },
          requiresAuth: true
        }
      );
      return res.data || [];
    } catch (err) {
      return [];
    }
  }

  /**
   * Tutor responds to a review request
   */
  public async respondToReview(
    reviewId: string,
    feedback: string,
    status: 'REVIEWED' | 'APPROVED' = 'REVIEWED',
    ratingGiven?: number
  ): Promise<ReviewSubmission> {
    const user = authService.getCurrentUser();
    const tutorId = user?.id || user?.email;

    const res = await apiClient.put<{ success: boolean; message: string; data: ReviewSubmission }>(
      `/reviewers/reviews/${reviewId}/respond`,
      {
        tutorId,
        feedback,
        status,
        ratingGiven
      },
      { requiresAuth: true }
    );
    return res.data;
  }
}

export const reviewerService = new ReviewerService();
export default reviewerService;
