import { apiClient } from '../../client/api.client';
import { authService } from '../AuthService/authService';
import type { AssignedStudent, StudentProgressDetails } from '../../types/reviewerTypes';

export class TutorStudentService {
  /**
   * Fetch all assigned students for the logged-in tutor
   */
  public async getAssignedStudents(): Promise<AssignedStudent[]> {
    const user = authService.getCurrentUser();
    const tutorId = user?.id || user?.email;
    if (!tutorId) return [];

    try {
      const res = await apiClient.get<{ success: boolean; data: AssignedStudent[] }>(
        '/tutors/students',
        {
          params: { tutorId },
          requiresAuth: true
        }
      );
      return res.data || [];
    } catch (err) {
      console.warn('[TutorStudentService] Error fetching assigned students:', err);
      return [];
    }
  }

  /**
   * Fetch detailed single student progress, course curriculum completions, and reviews
   */
  public async getStudentDetails(studentId: string): Promise<StudentProgressDetails | null> {
    const user = authService.getCurrentUser();
    const tutorId = user?.id || user?.email;

    try {
      const res = await apiClient.get<{ success: boolean; data: StudentProgressDetails }>(
        `/tutors/students/${studentId}`,
        {
          params: { tutorId },
          requiresAuth: true
        }
      );
      return res.data || null;
    } catch (err) {
      console.error('[TutorStudentService] Error fetching student details:', err);
      return null;
    }
  }
}

export const tutorStudentService = new TutorStudentService();
export default tutorStudentService;
