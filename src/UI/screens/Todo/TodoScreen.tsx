import React, { useState, useEffect, useMemo } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { AppLayout } from '../../reusables/feature/Navigation/AppLayout';
import { Button } from '../../reusables/base/Button/Button';
import { todoService } from '../../../services/TodoService/todoService';
import type { StudentTodo, TodoStatus, TodoCategory } from '../../../types/todoTypes';

const CATEGORIES: TodoCategory[] = [
  'Study',
  'Project',
  'Assignment',
  'Revision',
  'Practice',
  'Reading',
  'Exam Prep',
  'Other'
];

function formatDate(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function parseDateStr(str: string): Date {
  const [y, m, d] = str.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function addDaysToDate(dateStr: string, days: number): string {
  const d = parseDateStr(dateStr);
  d.setDate(d.getDate() + days);
  return formatDate(d);
}

export const TodoScreen: React.FC = () => {
  const todayStr = useMemo(() => formatDate(new Date()), []);
  const tomorrowStr = useMemo(() => addDaysToDate(todayStr, 1), [todayStr]);

  // Current view calendar month
  const [currentMonthDate, setCurrentMonthDate] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);

  // Todo Data
  const [monthTodos, setMonthTodos] = useState<StudentTodo[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'info' | 'error'; message: string } | null>(null);

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
    return selectedDateTasks.filter((t) => t.status === 'completed').reduce((sum, t) => sum + t.hours, 0);
  }, [selectedDateTasks]);

  // When date changes, reset form defaults
  const handleSelectDate = (dateStr: string, openDrawer = true) => {
    setSelectedDate(dateStr);
    resetForm(dateStr);
    if (openDrawer) {
      setIsDrawerOpen(true);
    }
  };

  const resetForm = (dateStr = selectedDate) => {
    setEditingTodoId(null);
    setTaskName('');
    setDescription('');
    setHours(2.0);
    // If date is tomorrow or future, default to scheduled
    if (dateStr > todayStr) {
      setStatus('scheduled');
    } else {
      setStatus('todo');
    }
    setCategory('Study');
  };

  const handleEditClick = (todo: StudentTodo) => {
    setEditingTodoId(todo.id);
    setTaskName(todo.task_name);
    setDescription(todo.description || '');
    setHours(todo.hours);
    setStatus(todo.status);
    setCategory((todo.category as TodoCategory) || 'Study');
  };

  const handleSubmitTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskName.trim()) return;

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

    setIsSubmitting(true);
    setNotification(null);

    try {
      if (editingTodoId) {
        const res = await todoService.updateTodo(editingTodoId, {
          task_name: taskName,
          description,
          task_date: selectedDate,
          hours: numHours,
          status,
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
          status,
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
    } catch (err: any) {
      setNotification({
        type: 'error',
        message: err.message || 'Failed to save task. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTask = async (id: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return;
    try {
      await todoService.deleteTodo(id);
      if (editingTodoId === id) resetForm();
      await fetchMonthTodos();
    } catch (err) {
      console.warn('Error deleting task:', err);
    }
  };

  const handleToggleTaskStatus = async (todo: StudentTodo) => {
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
          message: res.message || 'Daily 24-hour completed limit reached. Task moved to next day with In-Progress status.'
        });
      }

      await fetchMonthTodos();
    } catch (err: any) {
      alert(err.message || 'Could not update task status.');
    }
  };

  // Calendar matrix generator
  const calendarDays = useMemo(() => {
    const year = currentMonthDate.getFullYear();
    const month = currentMonthDate.getMonth();

    const firstDayIndex = new Date(year, month, 1).getDay(); // 0 = Sun
    const totalDaysInMonth = new Date(year, month + 1, 0).getDate();
    const prevMonthTotalDays = new Date(year, month, 0).getDate();

    const days: {
      dateStr: string;
      dayNumber: number;
      isCurrentMonth: boolean;
      isToday: boolean;
      isTomorrow: boolean;
      isSelected: boolean;
      totalHours: number;
      taskCount: number;
      hasCompleted: boolean;
    }[] = [];

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
        isSelected: str === selectedDate,
        totalHours: totalH,
        taskCount: tasks.length,
        hasCompleted: tasks.some((t) => t.status === 'completed')
      });
    }

    // Remaining slots to fill 35 or 42 grid cells
    const remainingSlots = 42 - days.length;
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
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Clean Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight">
              Daily Todo & Schedule
            </h1>
            <p className="text-xs sm:text-sm text-neutral-500 mt-1">
              Plan, organize, and track your daily learning milestones and study sessions.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <Button
              variant="secondary"
              size="sm"
              onClick={goToToday}
              className="font-bold text-xs cursor-pointer"
            >
              Today
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleSelectDate(tomorrowStr, true)}
              leftIcon={<Sparkles size={14} className="text-[#EA580C]" />}
              className="font-bold text-xs cursor-pointer"
            >
              Plan Tomorrow
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsDrawerOpen(true)}
              leftIcon={<Plus size={14} />}
              className="font-bold text-xs cursor-pointer shadow-sm"
            >
              Open Daily Planner
            </Button>
          </div>
        </div>

        {/* Calendar Navigation Bar */}
        <div className="bg-white rounded-3xl border border-neutral-200/90 p-4 sm:p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-orange-100 text-[#EA580C] flex items-center justify-center font-bold">
                <CalendarIcon size={20} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg sm:text-xl font-bold text-neutral-900">{monthName}</h2>
                  {isLoading && (
                    <span className="text-[10px] font-semibold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full animate-pulse">
                      Updating...
                    </span>
                  )}
                </div>
                <p className="text-xs text-neutral-500">
                  Click on any date to manage tasks, log hours, or view daily capacity.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <button
                onClick={prevMonth}
                className="p-2 rounded-xl border border-neutral-200 hover:bg-neutral-100 text-neutral-600 transition-colors cursor-pointer"
                title="Previous Month"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={goToToday}
                className="px-3 py-1.5 rounded-xl border border-neutral-200 hover:bg-neutral-100 text-xs font-bold text-neutral-700 transition-colors cursor-pointer"
              >
                Today
              </button>
              <button
                onClick={nextMonth}
                className="p-2 rounded-xl border border-neutral-200 hover:bg-neutral-100 text-neutral-600 transition-colors cursor-pointer"
                title="Next Month"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>

          {/* Weekday Labels */}
          <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-neutral-400 uppercase tracking-wider py-1">
            <span>Sun</span>
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
          </div>

          {/* Calendar Day Grid */}
          <div className="grid grid-cols-7 gap-2">
            {calendarDays.map((day, idx) => {
              const isSelected = day.dateStr === selectedDate;
              const isFull = day.totalHours >= 24;

              return (
                <div
                  key={`${day.dateStr}-${idx}`}
                  onClick={() => handleSelectDate(day.dateStr, true)}
                  className={`min-h-[92px] sm:min-h-[110px] p-2 sm:p-2.5 rounded-2xl border transition-all duration-200 flex flex-col justify-between cursor-pointer group relative ${
                    isSelected
                      ? 'border-[#EA580C] bg-orange-50/40 ring-2 ring-orange-500/20 shadow-xs'
                      : day.isToday
                      ? 'border-orange-300 bg-orange-50/20'
                      : day.isCurrentMonth
                      ? 'border-neutral-200/90 bg-white hover:border-neutral-300 hover:bg-neutral-50/60'
                      : 'border-neutral-100 bg-neutral-50/50 text-neutral-400'
                  }`}
                >
                  {/* Day Header */}
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs sm:text-sm font-bold flex items-center justify-center w-6 h-6 rounded-lg ${
                        day.isToday
                          ? 'bg-[#EA580C] text-white'
                          : isSelected
                          ? 'bg-neutral-900 text-white'
                          : day.isCurrentMonth
                          ? 'text-neutral-800'
                          : 'text-neutral-400'
                      }`}
                    >
                      {day.dayNumber}
                    </span>

                    {day.isTomorrow && (
                      <span className="hidden sm:inline-block text-[9px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded-md">
                        Tomorrow
                      </span>
                    )}

                    {day.taskCount > 0 && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-neutral-100 text-neutral-700">
                        {day.taskCount} {day.taskCount === 1 ? 'task' : 'tasks'}
                      </span>
                    )}
                  </div>

                  {/* Day Body: Hours and status indicator */}
                  <div className="space-y-1.5 mt-2">
                    {day.totalHours > 0 ? (
                      <div>
                        <div className="flex items-center justify-between text-[11px] font-bold">
                          <span className={isFull ? 'text-rose-600' : 'text-neutral-700'}>
                            {day.totalHours}h
                          </span>
                          {day.hasCompleted && (
                            <CheckCircle2 size={12} className="text-emerald-500" />
                          )}
                        </div>
                        {/* Progress Bar of up to 24h total */}
                        <div className="w-full h-1.5 bg-neutral-100 rounded-full overflow-hidden mt-1">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              isFull
                                ? 'bg-rose-500'
                                : day.totalHours > 16
                                ? 'bg-amber-500'
                                : 'bg-[#EA580C]'
                            }`}
                            style={{ width: `${Math.min(100, (day.totalHours / 24) * 100)}%` }}
                          />
                        </div>
                      </div>
                    ) : (
                      <span className="text-[10px] text-neutral-300 group-hover:text-neutral-400 hidden sm:block">
                        + Add task
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick legend */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-neutral-100 text-xs text-neutral-500">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#EA580C]" />
                Scheduled Hours
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 size={13} className="text-emerald-500" />
                Completed Tasks
              </span>
            </div>
            <span>Selected date: <strong className="text-neutral-900">{selectedDateFormatted}</strong></span>
          </div>
        </div>

        {/* RIGHT-SIDE SLIDE-OVER SCREEN / DRAWER MODAL */}
        {isDrawerOpen && (
          <div className="fixed inset-0 z-50 overflow-hidden">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-neutral-900/50 backdrop-blur-xs transition-opacity"
              onClick={() => setIsDrawerOpen(false)}
            />

            <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
              <div className="w-screen max-w-md sm:max-w-lg bg-white shadow-2xl flex flex-col justify-between">
                {/* Drawer Header */}
                <div className="p-6 border-b border-neutral-100 bg-neutral-50/80 flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#EA580C]">
                        Daily Task Planner
                      </span>
                      {selectedDate === todayStr ? (
                        <span className="text-[10px] font-bold bg-orange-100 text-[#EA580C] px-2 py-0.5 rounded-full">
                          Today
                        </span>
                      ) : selectedDate === tomorrowStr ? (
                        <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                          Tomorrow (Advance Plan)
                        </span>
                      ) : null}
                    </div>
                    <h3 className="text-lg font-extrabold text-neutral-900">
                      {selectedDateFormatted}
                    </h3>
                  </div>

                  <button
                    onClick={() => setIsDrawerOpen(false)}
                    className="p-2 rounded-xl text-neutral-400 hover:text-neutral-600 hover:bg-neutral-200/60 transition-colors cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                {/* Drawer Body: Capacity Banner + Task Entry Form + Scheduled Tasks */}
                <div className="p-6 overflow-y-auto space-y-6 flex-1">
                  {/* Daily Summary Overview */}
                  <div className="bg-neutral-50 rounded-2xl p-4 border border-neutral-200/90 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Clock size={16} className="text-[#EA580C]" />
                        <span className="text-xs font-bold text-neutral-800">
                          Day Total: {selectedDateTotalHours} hrs
                        </span>
                      </div>
                      <span className="text-xs font-semibold text-emerald-600">
                        {selectedDateCompletedHours} hrs completed
                      </span>
                    </div>

                    <div className="w-full h-2 bg-neutral-200/70 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          selectedDateTotalHours >= 24
                            ? 'bg-rose-500'
                            : selectedDateTotalHours > 16
                            ? 'bg-amber-500'
                            : 'bg-[#EA580C]'
                        }`}
                        style={{ width: `${Math.min(100, (selectedDateTotalHours / 24) * 100)}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-neutral-500">
                      <span>Tasks: <strong className="text-neutral-700">{selectedDateTasks.length}</strong></span>
                      <span>Remaining of 24h: <strong className="text-neutral-700">{Math.max(0, 24 - selectedDateTotalHours)} hrs</strong></span>
                    </div>
                  </div>

                  {/* Notification Alert if any */}
                  {notification && (
                    <div
                      className={`p-3.5 rounded-xl text-xs font-semibold flex items-center justify-between gap-2 border ${
                        notification.type === 'success'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : notification.type === 'info'
                          ? 'bg-amber-50 text-amber-800 border-amber-200'
                          : 'bg-rose-50 text-rose-800 border-rose-200'
                      }`}
                    >
                      <span>{notification.message}</span>
                      <button
                        onClick={() => setNotification(null)}
                        className="text-xs opacity-60 hover:opacity-100"
                      >
                        ✕
                      </button>
                    </div>
                  )}

                  {/* Task Creation / Edit Form */}
                  <div className="bg-neutral-50 rounded-2xl p-4 sm:p-5 border border-neutral-200 space-y-4">
                    <div className="flex items-center justify-between pb-2 border-b border-neutral-200">
                      <span className="text-xs font-bold uppercase tracking-wider text-neutral-700 flex items-center gap-1.5">
                        <Plus size={14} className="text-[#EA580C]" />
                        <span>{editingTodoId ? 'Edit Task' : 'Add New Task for This Date'}</span>
                      </span>
                      {editingTodoId && (
                        <button
                          onClick={() => resetForm()}
                          className="text-xs font-semibold text-neutral-500 hover:text-neutral-800 cursor-pointer"
                        >
                          Cancel Edit
                        </button>
                      )}
                    </div>

                    <form onSubmit={handleSubmitTask} className="space-y-3.5">
                      {/* Task Name */}
                      <div>
                        <label className="block text-xs font-bold text-neutral-700 mb-1">
                          Task Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={taskName}
                          onChange={(e) => setTaskName(e.target.value)}
                          placeholder="e.g. Master React Hooks & Context"
                          className="w-full text-xs font-medium px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:outline-none focus:border-[#EA580C] focus:ring-2 focus:ring-orange-500/20 bg-white"
                        />
                      </div>

                      {/* Category & Status */}
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-neutral-700 mb-1">
                            Category
                          </label>
                          <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value as TodoCategory)}
                            className="w-full text-xs font-medium px-3 py-2 rounded-xl border border-neutral-300 focus:outline-none focus:border-[#EA580C] bg-white cursor-pointer"
                          >
                            {CATEGORIES.map((cat) => (
                              <option key={cat} value={cat}>
                                {cat}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-neutral-700 mb-1">
                            Status
                          </label>
                          <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value as TodoStatus)}
                            className="w-full text-xs font-medium px-3 py-2 rounded-xl border border-neutral-300 focus:outline-none focus:border-[#EA580C] bg-white cursor-pointer"
                          >
                            <option value="todo">To Do</option>
                            <option value="in_progress">In Progress</option>
                            <option value="scheduled">Scheduled</option>
                            <option value="completed">Completed</option>
                          </select>
                        </div>
                      </div>

                      {/* Hours Slider & Input */}
                      <div>
                        <div className="flex items-center justify-between text-xs font-bold text-neutral-700 mb-1">
                          <span>Allocated Hours * <span className="font-normal text-neutral-400">(max 8h per task)</span></span>
                          <span className="text-[#EA580C] font-extrabold">{hours} hrs</span>
                        </div>
                        <input
                          type="range"
                          min="0.5"
                          max="8"
                          step="0.5"
                          value={hours}
                          onChange={(e) => setHours(parseFloat(e.target.value))}
                          className="w-full accent-[#EA580C] cursor-pointer"
                        />
                        <div className="flex justify-between text-[10px] text-neutral-400 mt-1">
                          <span>0.5h</span>
                          <span>2h</span>
                          <span>4h</span>
                          <span>6h</span>
                          <span>8h max</span>
                        </div>
                      </div>

                      {/* Description */}
                      <div>
                        <label className="block text-xs font-bold text-neutral-700 mb-1">
                          Task Details / Notes
                        </label>
                        <textarea
                          rows={2}
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          placeholder="Optional specific topics or goals for this session..."
                          className="w-full text-xs font-medium p-3 rounded-xl border border-neutral-300 focus:outline-none focus:border-[#EA580C] bg-white"
                        />
                      </div>

                      <Button
                        type="submit"
                        variant="primary"
                        size="sm"
                        fullWidth
                        isLoading={isSubmitting}
                        className="font-bold text-xs"
                      >
                        {editingTodoId ? 'Update Task' : '+ Save Task to Schedule'}
                      </Button>
                    </form>
                  </div>

                  {/* Existing Tasks List for Selected Date */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-600">
                        Tasks for {selectedDate} ({selectedDateTasks.length})
                      </h4>
                      <span className="text-xs font-semibold text-neutral-500">
                        {selectedDateTotalHours} hours total
                      </span>
                    </div>

                    {selectedDateTasks.length === 0 ? (
                      <div className="bg-neutral-50 rounded-2xl p-6 text-center border border-dashed border-neutral-200">
                        <Clock size={24} className="text-neutral-400 mx-auto mb-2" />
                        <p className="text-xs font-bold text-neutral-800">No tasks planned yet</p>
                        <p className="text-[11px] text-neutral-400 mt-0.5">
                          Use the form above to add your study milestones for this date.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2.5">
                        {selectedDateTasks.map((t) => {
                          const isCompleted = t.status === 'completed';

                          return (
                            <div
                              key={t.id}
                              className={`p-3.5 rounded-2xl border transition-all duration-200 flex flex-col gap-2 ${
                                isCompleted
                                  ? 'bg-emerald-50/40 border-emerald-200/80'
                                  : 'bg-white border-neutral-200 hover:border-neutral-300 shadow-2xs'
                              }`}
                            >
                              <div className="flex items-start justify-between gap-2.5">
                                <div className="flex items-start gap-2.5 min-w-0 flex-1">
                                  <button
                                    onClick={() => handleToggleTaskStatus(t)}
                                    className={`mt-0.5 w-5 h-5 rounded-lg flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
                                      isCompleted
                                        ? 'bg-emerald-500 text-white'
                                        : 'border-2 border-neutral-300 hover:border-[#EA580C]'
                                    }`}
                                    title={isCompleted ? 'Mark as In-Progress' : 'Mark as Completed'}
                                  >
                                    {isCompleted && <CheckCircle2 size={13} />}
                                  </button>

                                  <div className="min-w-0 flex-1">
                                    <h5
                                      className={`text-xs font-bold leading-snug truncate ${
                                        isCompleted ? 'text-neutral-500 line-through' : 'text-neutral-900'
                                      }`}
                                    >
                                      {t.task_name}
                                    </h5>
                                    {t.description && (
                                      <p className="text-[11px] text-neutral-500 mt-0.5 line-clamp-2">
                                        {t.description}
                                      </p>
                                    )}
                                  </div>
                                </div>

                                <div className="flex items-center gap-1.5 shrink-0">
                                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-neutral-100 text-neutral-700">
                                    {t.hours}h
                                  </span>

                                  <button
                                    onClick={() => handleEditClick(t)}
                                    className="p-1 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors text-xs"
                                    title="Edit"
                                  >
                                    ✎
                                  </button>
                                  <button
                                    onClick={() => handleDeleteTask(t.id)}
                                    className="p-1 rounded-lg text-neutral-400 hover:text-rose-600 hover:bg-neutral-100 transition-colors text-xs"
                                    title="Delete"
                                  >
                                    ✕
                                  </button>
                                </div>
                              </div>

                              {/* Badges: Category & Status */}
                              <div className="flex items-center gap-2 text-[10px]">
                                <span className="px-2 py-0.5 rounded-md bg-orange-50 text-[#EA580C] font-semibold border border-orange-200">
                                  {t.category}
                                </span>

                                <span
                                  className={`px-2 py-0.5 rounded-md font-semibold capitalize ${
                                    t.status === 'completed'
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : t.status === 'in_progress'
                                      ? 'bg-amber-100 text-amber-800'
                                      : t.status === 'scheduled'
                                      ? 'bg-blue-100 text-blue-800'
                                      : 'bg-neutral-100 text-neutral-700'
                                  }`}
                                >
                                  {t.status.replace('_', ' ')}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {/* Drawer Footer */}
                <div className="p-4 bg-neutral-50 border-t border-neutral-100 flex items-center justify-between">
                  <span className="text-xs text-neutral-500">
                    Max 8h per task · Up to 24h total per day
                  </span>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setIsDrawerOpen(false)}
                    className="font-bold text-xs"
                  >
                    Done
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
};
