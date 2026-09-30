import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../../services/AuthService/authService';
import { courseService } from '../../../services/CourseService/courseService';
import { todoService } from '../../../services/TodoService/todoService';
import type { Course } from '../../../types/courseTypes';
import type {
  TodoDashboardSummary,
  TutorStudentTodoSummary,
  StudentTodo
} from '../../../types/todoTypes';

export function useDashboardVM() {
  const navigate = useNavigate();
  const user = authService.getCurrentUser();
  const isTutor = user?.role?.toLowerCase() === 'tutor';

  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);
  const [isLoadingCourses, setIsLoadingCourses] = useState(true);

  // Todo States for Student & Tutor
  const [studentTodoSummary, setStudentTodoSummary] = useState<TodoDashboardSummary | null>(null);
  const [tutorTodoSummary, setTutorTodoSummary] = useState<TutorStudentTodoSummary | null>(null);
  const [isLoadingTodos, setIsLoadingTodos] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const courseRes = await courseService.getCourses({ filter: 'enrolled' });
      setEnrolledCourses(courseRes.courses);
    } catch (err) {
      console.warn('Dashboard could not load enrolled courses:', err);
    } finally {
      setIsLoadingCourses(false);
    }

    try {
      if (isTutor) {
        const tSummary = await todoService.getTutorSummary();
        setTutorTodoSummary(tSummary);
      } else {
        const sSummary = await todoService.getDashboardSummary();
        setStudentTodoSummary(sSummary);
      }
    } catch (err) {
      console.warn('Dashboard could not load todos summary:', err);
    } finally {
      setIsLoadingTodos(false);
    }
  }, [isTutor]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleToggleTaskStatus = async (task: StudentTodo) => {
    try {
      const nextStatus = task.status === 'completed' ? 'in_progress' : 'completed';
      const res = await todoService.updateTodo(task.id, { status: nextStatus });
      if (res.rolledOver && res.message) {
        alert(res.message);
      }
      // Reload summary
      const sSummary = await todoService.getDashboardSummary();
      setStudentTodoSummary(sSummary);
    } catch (err: any) {
      alert(err.message || 'Could not update task');
    }
  };

  const todayHours = studentTodoSummary?.today.totalHours || 0;
  const todayCompletedHours = studentTodoSummary?.today.completedHours || 0;
  const todayTasks = studentTodoSummary?.today.tasks || [];
  const tomorrowTasks = studentTodoSummary?.tomorrow.tasks || [];

  return {
    user,
    isTutor,
    enrolledCourses,
    isLoadingCourses,
    studentTodoSummary,
    tutorTodoSummary,
    isLoadingTodos,
    todayHours,
    todayCompletedHours,
    todayTasks,
    tomorrowTasks,
    handleToggleTaskStatus,
    navigate,
    refreshData: loadData
  };
}
