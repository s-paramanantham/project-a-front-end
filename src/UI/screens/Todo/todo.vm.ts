import { useState, useEffect, useMemo } from 'react';
import { todoService } from '../../../services/TodoService/todoService';
import type { StudentTodo, TodoStatus, TodoCategory } from '../../../types/todoTypes';

export const CATEGORIES: TodoCategory[] = [
  'Study',
  'Project',
  'Assignment',
  'Revision',
  'Practice',
  'Reading',
  'Exam Prep',
  'Other'
];

export const DURATION_PRESETS = [0.5, 1, 2, 3, 4, 6, 8];

export function formatDate(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseDateStr(str: string): Date {
  const [y, m, d] = str.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function addDaysToDate(dateStr: string, days: number): string {
  const d = parseDateStr(dateStr);
  d.setDate(d.getDate() + days);
  return formatDate(d);
}

export interface CalendarDayItem {
  dateStr: string;
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  isTomorrow: boolean;
  isPast: boolean;
  isFutureBeyondTomorrow: boolean;
  isSelected: boolean;
  totalHours: number;
  taskCount: number;
  hasCompleted: boolean;
}

export function useTodoVM() {
  const todayStr = useMemo(() => formatDate(new Date()), []);
  const tomorrowStr = useMemo(() => addDaysToDate(todayStr, 1), [todayStr]);

  // Current view calendar month
  const [currentMonthDate, setCurrentMonthDate] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [drawerTab, setDrawerTab] = useState<'tasks' | 'form'>('tasks');

  // Todo Data
  const [monthTodos, setMonthTodos] = useState<StudentTodo[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [notification, setNotification] = useState<{
    type: 'success' | 'info' | 'error';
    message: string;
  } | null>(null);

  // Form State
  const [editingTodoId, setEditingTodoId] = useState<string | null>(null);
  const [taskName, setTaskName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [hours, setHours] = useState<number>(2.0);
  const [status, setStatus] = useState<TodoStatus>('todo');
  const [category, setCategory] = useState<TodoCategory>('Study');

  // Month navigation
  const prevMonth = () => {
    setCurrentMonthDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };
  const nextMonth = () => {
    setCurrentMonthDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };
  const goToToday = () => {
    const now = new Date();
    setCurrentMonthDate(now);
    setSelectedDate(todayStr);
  };

  // Keyboard shortcut (Escape to close drawer)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isDrawerOpen) {
        setIsDrawerOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDrawerOpen]);

  // Prevent body scrolling when drawer is open
  useEffect(() => {
    if (isDrawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isDrawerOpen]);

  // Fetch month todos
  const fetchMonthTodos = async () => {
    setIsLoading(true);
    try {
      const year = currentMonthDate.getFullYear();
      const month = currentMonthDate.getMonth();
      const startDate = formatDate(new Date(year, month - 1, 20)); // include buffer for edge calendar days
      const endDate = formatDate(new Date(year, month + 2, 10));

      const res = await todoService.getTodos({ startDate, endDate });
      setMonthTodos(res.todos || []);
    } catch (err) {
      console.warn('Could not fetch month todos:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMonthTodos();
  }, [currentMonthDate]);

  // Map of todos by date: "YYYY-MM-DD" -> StudentTodo[]
  const todosByDateMap = useMemo(() => {
    const map = new Map<string, StudentTodo[]>();
    for (const t of monthTodos) {
      if (!map.has(t.task_date)) {
        map.set(t.task_date, []);
      }
      map.get(t.task_date)!.push(t);
    }
    return map;
  }, [monthTodos]);

  // Tasks for currently selected date
  const selectedDateTasks = useMemo(() => {
    return todosByDateMap.get(selectedDate) || [];
  }, [todosByDateMap, selectedDate]);

  const selectedDateTotalHours = useMemo(() => {
    return selectedDateTasks.reduce((sum, t) => sum + t.hours, 0);
  }, [selectedDateTasks]);

  const selectedDateCompletedHours = useMemo(() => {
    return selectedDateTasks
      .filter((t) => t.status === 'completed')
      .reduce((sum, t) => sum + t.hours, 0);
  }, [selectedDateTasks]);

  // Permissions based on user rules:
  // - Past (date < todayStr): view-only, NO actions (no add, no edit, no delete, no status toggle).
  // - Today (date === todayStr) and Tomorrow (date === tomorrowStr): fully enabled for add / edit / delete / status toggle.
  // - Future beyond tomorrow (date > tomorrowStr): can add tasks, but status is locked to 'scheduled' (cannot change to in_progress or completed).
  const isSelectedDatePast = selectedDate < todayStr;
  const isSelectedDateTodayOrTomorrow = selectedDate === todayStr || selectedDate === tomorrowStr;
  const isSelectedDateFutureBeyondTomorrow = selectedDate > tomorrowStr;

  const canAddTasksOnSelectedDate = !isSelectedDatePast; // Today, Tomorrow, and Future can add tasks
  const canModifyTasksOnSelectedDate = !isSelectedDatePast; // Today, Tomorrow, and Future can edit task details

  // Reset form defaults based on selected date
  const resetForm = (dateStr = selectedDate) => {
    setEditingTodoId(null);
    setTaskName('');
    setDescription('');
    setHours(2.0);

    if (dateStr > tomorrowStr) {
      // Future dates strictly require 'scheduled' status
      setStatus('scheduled');
    } else if (dateStr === tomorrowStr) {
      setStatus('scheduled');
    } else {
      setStatus('todo');
    }
    setCategory('Study');
  };

  // Handle selecting a date from calendar
  const handleSelectDate = (dateStr: string, openDrawer = true) => {
    setSelectedDate(dateStr);
    resetForm(dateStr);
    const existing = todosByDateMap.get(dateStr) || [];

    // If past date: always show tasks view alone
    if (dateStr < todayStr) {
      setDrawerTab('tasks');
    } else {
      setDrawerTab(existing.length > 0 ? 'tasks' : 'form');
    }

    if (openDrawer) {
      setIsDrawerOpen(true);
    }
  };

  // Start editing a task
  const handleEditClick = (todo: StudentTodo) => {
    if (todo.task_date < todayStr) {
      setNotification({
        type: 'error',
        message: 'Past dates are view-only. Tasks from past dates cannot be modified.'
      });
      return;
    }
    setEditingTodoId(todo.id);
    setTaskName(todo.task_name);
    setDescription(todo.description || '');
    setHours(todo.hours);

    // If task is on future date beyond tomorrow, enforce scheduled status
    if (todo.task_date > tomorrowStr) {
      setStatus('scheduled');
    } else {
      setStatus(todo.status);
    }

    setCategory((todo.category as TodoCategory) || 'Study');
    setDrawerTab('form');
  };

  // Submit new or edited task
  const handleSubmitTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskName.trim()) return;

    if (selectedDate < todayStr) {
      setNotification({
        type: 'error',
        message: 'Cannot schedule tasks for past dates. Past dates are view-only.'
      });
      return;
    }

    const numHours = Number(hours);
    if (numHours > 8) {
      setNotification({
        type: 'error',
        message: 'A single task cannot exceed 8 hours.'
      });
      return;
    }

    if (!editingTodoId && selectedDateTotalHours + numHours > 24) {
      setNotification({
        type: 'error',
        message: `Adding ${numHours}h would exceed the 24-hour total daily limit (${selectedDateTotalHours}h already scheduled).`
      });
      return;
    }

    // Enforce scheduled status for future dates beyond tomorrow
    let finalStatus = status;
    if (selectedDate > tomorrowStr) {
      finalStatus = 'scheduled';
    }

    setIsSubmitting(true);
    setNotification(null);

    try {
      if (editingTodoId) {
        const res = await todoService.updateTodo(editingTodoId, {
          task_name: taskName,
          description,
          task_date: selectedDate,
          hours: numHours,
          status: finalStatus,
          category
        });

        if (res.rolledOver) {
          setNotification({
            type: 'info',
            message: res.message || 'Task moved to next day with In-Progress status.'
          });
        } else {
          setNotification({
            type: 'success',
            message: 'Task updated successfully!'
          });
        }
      } else {
        const res = await todoService.createTodo({
          task_name: taskName,
          description,
          task_date: selectedDate,
          hours: numHours,
          status: finalStatus,
          category
        });

        if (res.rolledOver) {
          setNotification({
            type: 'info',
            message: res.message || 'Task moved to next day with In-Progress status.'
          });
        } else {
          setNotification({
            type: 'success',
            message: 'New task added to schedule!'
          });
        }
      }

      resetForm();
      await fetchMonthTodos();
      setDrawerTab('tasks');
    } catch (err: any) {
      setNotification({
        type: 'error',
        message: err.message || 'Failed to save task. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete task
  const handleDeleteTask = async (id: string) => {
    if (selectedDate < todayStr) {
      setNotification({
        type: 'error',
        message: 'Past dates are view-only. You cannot delete past tasks.'
      });
      return;
    }

    if (!confirm('Are you sure you want to delete this task?')) return;
    try {
      await todoService.deleteTodo(id);
      if (editingTodoId === id) resetForm();
      await fetchMonthTodos();
    } catch (err) {
      console.warn('Error deleting task:', err);
    }
  };

  // Toggle task status
  const handleToggleTaskStatus = async (todo: StudentTodo) => {
    if (todo.task_date < todayStr) {
      setNotification({
        type: 'error',
        message: 'Past dates are view-only. You cannot modify status of past tasks.'
      });
      return;
    }

    if (todo.task_date > tomorrowStr) {
      setNotification({
        type: 'info',
        message: 'Tasks for future dates must remain "Scheduled". You cannot mark them in-progress or completed until the date arrives.'
      });
      return;
    }

    try {
      let nextStatus: TodoStatus = 'completed';
      if (todo.status === 'completed') {
        nextStatus = 'in_progress';
      } else if (todo.status === 'in_progress') {
        nextStatus = 'completed';
      } else if (todo.status === 'todo' || todo.status === 'scheduled') {
        nextStatus = 'completed';
      }

      const res = await todoService.updateTodo(todo.id, {
        status: nextStatus
      });

      if (res.rolledOver) {
        setNotification({
          type: 'info',
          message:
            res.message ||
            'Daily 24-hour completed limit reached. Task moved to next day with In-Progress status.'
        });
      }

      await fetchMonthTodos();
    } catch (err: any) {
      alert(err.message || 'Could not update task status.');
    }
  };

  // Calendar matrix generator
  const calendarDays: CalendarDayItem[] = useMemo(() => {
    const year = currentMonthDate.getFullYear();
    const month = currentMonthDate.getMonth();

    const firstDayIndex = new Date(year, month, 1).getDay(); // 0 = Sun
    const totalDaysInMonth = new Date(year, month + 1, 0).getDate();
    const prevMonthTotalDays = new Date(year, month, 0).getDate();

    const days: CalendarDayItem[] = [];

    // Preceding days from previous month
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const dayNum = prevMonthTotalDays - i;
      const d = new Date(year, month - 1, dayNum);
      const str = formatDate(d);
      const tasks = todosByDateMap.get(str) || [];
      const totalH = tasks.reduce((sum, t) => sum + t.hours, 0);

      days.push({
        dateStr: str,
        dayNumber: dayNum,
        isCurrentMonth: false,
        isToday: str === todayStr,
        isTomorrow: str === tomorrowStr,
        isPast: str < todayStr,
        isFutureBeyondTomorrow: str > tomorrowStr,
        isSelected: str === selectedDate,
        totalHours: totalH,
        taskCount: tasks.length,
        hasCompleted: tasks.some((t) => t.status === 'completed')
      });
    }

    // Days in current month
    for (let dayNum = 1; dayNum <= totalDaysInMonth; dayNum++) {
      const d = new Date(year, month, dayNum);
      const str = formatDate(d);
      const tasks = todosByDateMap.get(str) || [];
      const totalH = tasks.reduce((sum, t) => sum + t.hours, 0);

      days.push({
        dateStr: str,
        dayNumber: dayNum,
        isCurrentMonth: true,
        isToday: str === todayStr,
        isTomorrow: str === tomorrowStr,
        isPast: str < todayStr,
        isFutureBeyondTomorrow: str > tomorrowStr,
        isSelected: str === selectedDate,
        totalHours: totalH,
        taskCount: tasks.length,
        hasCompleted: tasks.some((t) => t.status === 'completed')
      });
    }

    // Dynamic grid: 35 slots if it fits in 5 rows, otherwise 42 slots (6 rows)
    const totalSlots = days.length > 35 ? 42 : 35;
    const remainingSlots = totalSlots - days.length;
    for (let dayNum = 1; dayNum <= remainingSlots; dayNum++) {
      const d = new Date(year, month + 1, dayNum);
      const str = formatDate(d);
      const tasks = todosByDateMap.get(str) || [];
      const totalH = tasks.reduce((sum, t) => sum + t.hours, 0);

      days.push({
        dateStr: str,
        dayNumber: dayNum,
        isCurrentMonth: false,
        isToday: str === todayStr,
        isTomorrow: str === tomorrowStr,
        isPast: str < todayStr,
        isFutureBeyondTomorrow: str > tomorrowStr,
        isSelected: str === selectedDate,
        totalHours: totalH,
        taskCount: tasks.length,
        hasCompleted: tasks.some((t) => t.status === 'completed')
      });
    }

    return days;
  }, [currentMonthDate, todosByDateMap, todayStr, tomorrowStr, selectedDate]);

  const monthName = currentMonthDate.toLocaleString('default', { month: 'long', year: 'numeric' });
  const selectedDateFormatted = parseDateStr(selectedDate).toLocaleDateString('default', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return {
    todayStr,
    tomorrowStr,
    currentMonthDate,
    selectedDate,
    monthName,
    selectedDateFormatted,
    isDrawerOpen,
    setIsDrawerOpen,
    drawerTab,
    setDrawerTab,
    monthTodos,
    isLoading,
    isSubmitting,
    notification,
    setNotification,
    editingTodoId,
    taskName,
    setTaskName,
    description,
    setDescription,
    hours,
    setHours,
    status,
    setStatus,
    category,
    setCategory,
    prevMonth,
    nextMonth,
    goToToday,
    handleSelectDate,
    resetForm,
    handleEditClick,
    handleSubmitTask,
    handleDeleteTask,
    handleToggleTaskStatus,
    calendarDays,
    selectedDateTasks,
    selectedDateTotalHours,
    selectedDateCompletedHours,
    isSelectedDatePast,
    isSelectedDateTodayOrTomorrow,
    isSelectedDateFutureBeyondTomorrow,
    canAddTasksOnSelectedDate,
    canModifyTasksOnSelectedDate
  };
}
