import { apiClient } from '../../client/apiClient';
import { authService } from '../AuthService/authService';
import type {
  StudentTodo,
  CreateTodoPayload,
  UpdateTodoPayload,
  TodoDashboardSummary,
  TutorStudentTodoSummary
} from '../../types/todoTypes';

export class TodoService {
  /**
   * Get todos for student with optional date filters
   */
  public async getTodos(options?: {
    date?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<{
    todos: StudentTodo[];
    totalHours: number;
    completedHours: number;
    remainingCapacity: number;
  }> {
    const user = authService.getCurrentUser();
    const studentId = user?.id || user?.email || 'mock-student-id-1';

    try {
      const res = await apiClient.get<{
        success: boolean;
        data: {
          todos: StudentTodo[];
          date: string | null;
          totalHours: number;
          completedHours: number;
          remainingCapacity: number;
        };
      }>('/todos', {
        params: {
          studentId,
          date: options?.date,
          startDate: options?.startDate,
          endDate: options?.endDate
        },
        requiresAuth: true
      });

      if (res.data) {
        return {
          todos: res.data.todos || [],
          totalHours: res.data.totalHours || 0,
          completedHours: res.data.completedHours || 0,
          remainingCapacity: res.data.remainingCapacity !== undefined ? res.data.remainingCapacity : 24
        };
      }
      return { todos: [], totalHours: 0, completedHours: 0, remainingCapacity: 24 };
    } catch (err) {
      console.warn('[TodoService] Error fetching todos:', err);
      return { todos: [], totalHours: 0, completedHours: 0, remainingCapacity: 24 };
    }
  }

  /**
   * Create a new task with 24-hr check & rollover
   */
  public async createTodo(payload: Omit<CreateTodoPayload, 'studentId'>): Promise<{
    todo: StudentTodo;
    rolledOver: boolean;
    message?: string;
  }> {
    const user = authService.getCurrentUser();
    const studentId = user?.id || user?.email || 'mock-student-id-1';

    const res = await apiClient.post<{
      success: boolean;
      message: string;
      data: StudentTodo;
      rolledOver: boolean;
    }>(
      '/todos',
      {
        ...payload,
        studentId
      },
      { requiresAuth: true }
    );

    return {
      todo: res.data,
      rolledOver: res.rolledOver || false,
      message: res.message
    };
  }

  /**
   * Update an existing task
   */
  public async updateTodo(
    id: string,
    payload: Omit<UpdateTodoPayload, 'studentId'>
  ): Promise<{
    todo: StudentTodo;
    rolledOver: boolean;
    message?: string;
  }> {
    const user = authService.getCurrentUser();
    const studentId = user?.id || user?.email || 'mock-student-id-1';

    const res = await apiClient.put<{
      success: boolean;
      message: string;
      data: StudentTodo;
      rolledOver: boolean;
    }>(
      `/todos/${id}`,
      {
        ...payload,
        studentId
      },
      { requiresAuth: true }
    );

    return {
      todo: res.data,
      rolledOver: res.rolledOver || false,
      message: res.message
    };
  }

  /**
   * Delete a task
   */
  public async deleteTodo(id: string): Promise<boolean> {
    const user = authService.getCurrentUser();
    const studentId = user?.id || user?.email || 'mock-student-id-1';

    await apiClient.delete<{ success: boolean; message: string }>(`/todos/${id}`, {
      params: { studentId },
      requiresAuth: true
    });
    return true;
  }

  /**
   * Get student dashboard summary (Today's hours & tomorrow's scheduled tasks)
   */
  public async getDashboardSummary(customStudentId?: string): Promise<TodoDashboardSummary | null> {
    const user = authService.getCurrentUser();
    const studentId = customStudentId || user?.id || user?.email || 'mock-student-id-1';

    try {
      const res = await apiClient.get<{
        success: boolean;
        data: TodoDashboardSummary;
      }>('/todos/dashboard-summary', {
        params: { studentId },
        requiresAuth: true
      });
      return res.data || null;
    } catch (err) {
      console.warn('[TodoService] Error fetching dashboard summary:', err);
      return null;
    }
  }

  /**
   * Get tutor summary for assigned students' daily activity
   */
  public async getTutorSummary(date?: string): Promise<TutorStudentTodoSummary | null> {
    const user = authService.getCurrentUser();
    const tutorId = user?.id || user?.email || 'mock-tutor-id';

    try {
      const res = await apiClient.get<{
        success: boolean;
        data: TutorStudentTodoSummary;
      }>('/todos/tutor-summary', {
        params: { tutorId, date },
        requiresAuth: true
      });
      return res.data || null;
    } catch (err) {
      console.warn('[TodoService] Error fetching tutor summary:', err);
      return null;
    }
  }
}

export const todoService = new TodoService();
