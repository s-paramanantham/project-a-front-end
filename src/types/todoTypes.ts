export type TodoStatus = 'todo' | 'in_progress' | 'completed' | 'scheduled';

export type TodoCategory =
  | 'Study'
  | 'Project'
  | 'Assignment'
  | 'Revision'
  | 'Practice'
  | 'Reading'
  | 'Exam Prep'
  | 'Other';

export interface StudentTodo {
  id: string;
  student_id: string;
  task_name: string;
  description?: string;
  task_date: string; // YYYY-MM-DD
  hours: number;
  status: TodoStatus;
  category: TodoCategory | string;
  created_at: string;
  updated_at: string;
}

export interface CreateTodoPayload {
  studentId: string;
  task_name: string;
  description?: string;
  task_date: string; // YYYY-MM-DD
  hours: number;
  status?: TodoStatus;
  category?: string;
}

export interface UpdateTodoPayload {
  studentId: string;
  task_name?: string;
  description?: string;
  task_date?: string;
  hours?: number;
  status?: TodoStatus;
  category?: string;
}

export interface DayTodoSummary {
  date: string;
  totalHours: number;
  completedHours: number;
  remainingCapacity: number;
  tasks: StudentTodo[];
}

export interface TodoDashboardSummary {
  today: {
    date: string;
    totalHours: number;
    completedHours: number;
    remainingHours: number;
    tasks: StudentTodo[];
  };
  tomorrow: {
    date: string;
    totalHours: number;
    tasks: StudentTodo[];
  };
}

export interface TutorStudentTodoSummary {
  date: string;
  students: {
    student_id: string;
    student_name: string;
    student_email: string;
    avatar_url?: string;
    total_hours: number;
    completed_hours: number;
    tasks: StudentTodo[];
  }[];
}
