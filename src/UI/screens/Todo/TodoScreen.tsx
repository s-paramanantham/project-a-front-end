import React from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  CheckCircle2,
  Check,
  X,
  Edit2,
  Trash2,
  ListTodo,
  AlertCircle,
  Eye,
  Lock
} from 'lucide-react';
import { AppLayout } from '../../reusables/feature/Navigation/AppLayout';
import { Button } from '../../reusables/base/Button/Button';
import { useTodoVM, CATEGORIES, DURATION_PRESETS } from './todo.vm';

export const TodoScreen: React.FC = () => {
  const {
    todayStr,
    tomorrowStr,
    selectedDate,
    monthName,
    selectedDateFormatted,
    isDrawerOpen,
    setIsDrawerOpen,
    drawerTab,
    setDrawerTab,
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
  } = useTodoVM();

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto space-y-5">
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

          <div className="flex flex-wrap items-center gap-2 shrink-0">
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
              leftIcon={<CalendarIcon size={13} className="text-[#EA580C]" />}
              className="font-bold text-xs cursor-pointer"
            >
              Plan Tomorrow
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                if (isSelectedDatePast) {
                  handleSelectDate(todayStr, true);
                } else {
                  setIsDrawerOpen(true);
                }
              }}
              leftIcon={<Plus size={14} />}
              className="font-bold text-xs cursor-pointer shadow-xs"
            >
              Open Daily Planner
            </Button>
          </div>
        </div>

        {/* Calendar Navigation Bar */}
        <div className="bg-white rounded-xl border border-neutral-200/80 p-4 sm:p-5 shadow-xs space-y-3.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-100">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-orange-50 text-[#EA580C] flex items-center justify-center font-bold border border-orange-200/60">
                <CalendarIcon size={16} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-neutral-900">{monthName}</h2>
                  {isLoading && (
                    <span className="text-[10px] font-semibold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full animate-pulse">
                      Updating...
                    </span>
                  )}
                </div>
                <p className="text-xs text-neutral-500">
                  Select a date to schedule tasks. Past dates are view-only; current and tomorrow permit full actions.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <button
                onClick={prevMonth}
                className="p-1.5 rounded-lg border border-neutral-200 hover:bg-neutral-100 text-neutral-600 transition-colors cursor-pointer"
                title="Previous Month"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={goToToday}
                className="px-2.5 py-1 rounded-lg border border-neutral-200 hover:bg-neutral-100 text-xs font-semibold text-neutral-700 transition-colors cursor-pointer"
              >
                Today
              </button>
              <button
                onClick={nextMonth}
                className="p-1.5 rounded-lg border border-neutral-200 hover:bg-neutral-100 text-neutral-600 transition-colors cursor-pointer"
                title="Next Month"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          {/* Weekday Labels */}
          <div className="grid grid-cols-7 gap-1.5 sm:gap-2 text-center text-[11px] font-semibold text-neutral-400 uppercase tracking-wider py-0.5">
            <span>Sun</span>
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
          </div>

          {/* Calendar Day Grid - Compact Developer-Grade Sizing */}
          <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
            {calendarDays.map((day, idx) => {
              const isSelected = day.dateStr === selectedDate;
              const isFull = day.totalHours >= 24;
              const isPast = day.isPast;

              return (
                <div
                  key={`${day.dateStr}-${idx}`}
                  onClick={() => handleSelectDate(day.dateStr, true)}
                  className={`min-h-[58px] sm:min-h-[68px] p-1.5 sm:p-2 rounded-xl border transition-all duration-150 flex flex-col justify-between cursor-pointer relative ${
                    isPast
                      ? 'bg-neutral-50/70 border-neutral-200/60 text-neutral-500 hover:bg-neutral-100/70'
                      : isSelected
                      ? 'border-[#EA580C] bg-orange-50/50 ring-2 ring-orange-500/20 shadow-xs'
                      : day.isToday
                      ? 'border-orange-300 bg-orange-50/20'
                      : day.isCurrentMonth
                      ? 'border-neutral-200/90 bg-white hover:border-neutral-300 hover:bg-neutral-50/70 group'
                      : 'border-neutral-100 bg-neutral-50/50 text-neutral-400 group'
                  }`}
                  title={
                    isPast
                      ? 'Past date (Click to view historical tasks)'
                      : day.isToday
                      ? "Today's Schedule"
                      : day.isTomorrow
                      ? "Tomorrow's Schedule"
                      : 'Click to schedule tasks'
                  }
                >
                  {/* Day Header */}
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-bold flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 rounded-md ${
                        isPast
                          ? 'text-neutral-400 font-semibold'
                          : day.isToday
                          ? 'bg-[#EA580C] text-white shadow-2xs'
                          : isSelected
                          ? 'bg-neutral-900 text-white'
                          : day.isCurrentMonth
                          ? 'text-neutral-800'
                          : 'text-neutral-400'
                      }`}
                    >
                      {day.dayNumber}
                    </span>

                    <div className="flex items-center gap-1">
                      {isPast ? (
                        <span className="text-[9px] font-medium text-neutral-400">
                          Past
                        </span>
                      ) : day.isToday ? (
                        <span className="hidden sm:inline-block text-[9px] font-bold text-[#EA580C] bg-orange-100 px-1 py-0.2 rounded">
                          Today
                        </span>
                      ) : day.isTomorrow ? (
                        <span className="hidden sm:inline-block text-[9px] font-bold text-amber-700 bg-amber-100 px-1 py-0.2 rounded">
                          Tmrw
                        </span>
                      ) : null}

                      {day.taskCount > 0 && (
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.2 rounded-md ${
                            isPast
                              ? 'bg-neutral-200/60 text-neutral-500'
                              : 'bg-neutral-100 text-neutral-700'
                          }`}
                        >
                          {day.taskCount}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Day Body: Hours and status indicator */}
                  <div className="mt-1">
                    {day.totalHours > 0 ? (
                      <div>
                        <div className="flex items-center justify-between text-[10px] sm:text-[11px] font-bold mb-0.5">
                          <span
                            className={
                              isPast
                                ? 'text-neutral-500'
                                : isFull
                                ? 'text-rose-600'
                                : 'text-neutral-700'
                            }
                          >
                            {day.totalHours}h
                          </span>
                          {day.hasCompleted && (
                            <CheckCircle2
                              size={11}
                              className={`${
                                isPast ? 'text-neutral-400' : 'text-emerald-500'
                              } shrink-0`}
                            />
                          )}
                        </div>
                        {/* Progress Bar of up to 24h total */}
                        <div className="w-full h-1 bg-neutral-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              isPast
                                ? 'bg-neutral-300'
                                : isFull
                                ? 'bg-rose-500'
                                : day.totalHours > 16
                                ? 'bg-amber-500'
                                : 'bg-[#EA580C]'
                            }`}
                            style={{ width: `${Math.min(100, (day.totalHours / 24) * 100)}%` }}
                          />
                        </div>
                      </div>
                    ) : isPast ? (
                      <span className="text-[10px] text-neutral-300 hidden sm:block">
                        No tasks
                      </span>
                    ) : (
                      <span className="text-[10px] text-neutral-300 group-hover:text-neutral-500 hidden sm:block">
                        + Add
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick legend */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-neutral-100 text-xs text-neutral-500">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#EA580C]" />
                Scheduled Hours
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 size={13} className="text-emerald-500" />
                Completed Tasks
              </span>
              <span className="flex items-center gap-1.5">
                <Eye size={13} className="text-neutral-400" />
                Past Dates (View Only)
              </span>
            </div>
            <span>
              Selected date: <strong className="text-neutral-900">{selectedDateFormatted}</strong>
            </span>
          </div>
        </div>

        {/* RIGHT-SIDE SLIDE-OVER SCREEN / DRAWER MODAL */}
        <div
          className={`fixed inset-0 z-50 overflow-hidden transition-all duration-300 ${
            isDrawerOpen ? 'pointer-events-auto visible' : 'pointer-events-none invisible'
          }`}
          aria-hidden={!isDrawerOpen}
        >
          {/* Backdrop with smooth fade */}
          <div
            className={`fixed inset-0 bg-neutral-900/40 backdrop-blur-xs transition-opacity duration-300 ease-out ${
              isDrawerOpen ? 'opacity-100' : 'opacity-0'
            }`}
            onClick={() => setIsDrawerOpen(false)}
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
            <div
              className={`w-screen max-w-md sm:max-w-lg bg-white shadow-2xl flex flex-col justify-between transform transition-transform duration-300 ease-out border-l border-neutral-200/80 ${
                isDrawerOpen ? 'translate-x-0' : 'translate-x-full'
              }`}
            >
              {/* Drawer Top Header */}
              <div className="px-5 py-4 border-b border-neutral-100 bg-neutral-50/80 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-neutral-900 flex items-center gap-1.5">
                      <CalendarIcon size={14} className="text-[#EA580C]" />
                      {selectedDateFormatted}
                    </span>

                    {isSelectedDatePast ? (
                      <span className="text-[10px] font-bold bg-neutral-200 text-neutral-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Eye size={11} />
                        View Only
                      </span>
                    ) : selectedDate === todayStr ? (
                      <span className="text-[10px] font-bold bg-orange-100 text-[#EA580C] px-2 py-0.5 rounded-full">
                        Today
                      </span>
                    ) : selectedDate === tomorrowStr ? (
                      <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                        Tomorrow
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                        Scheduled
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => setIsDrawerOpen(false)}
                    className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-200/60 transition-colors text-xs font-medium cursor-pointer"
                    title="Close drawer (Esc)"
                  >
                    <kbd className="text-[10px] font-mono bg-neutral-200/60 border border-neutral-300/80 text-neutral-500 px-1 py-0.5 rounded">
                      ESC
                    </kbd>
                    <X size={15} />
                  </button>
                </div>

                {/* Status Alert for Date Type */}
                {isSelectedDatePast ? (
                  <div className="p-2.5 rounded-lg bg-neutral-100 border border-neutral-200 text-[11px] text-neutral-600 flex items-center gap-2">
                    <Eye size={14} className="text-neutral-500 shrink-0" />
                    <span>
                      <strong>Past Date (View Only):</strong> You can view tasks scheduled for this day, but cannot add, edit, or modify actions.
                    </span>
                  </div>
                ) : isSelectedDateFutureBeyondTomorrow ? (
                  <div className="p-2.5 rounded-lg bg-blue-50 border border-blue-200 text-[11px] text-blue-800 flex items-center gap-2">
                    <Lock size={14} className="text-blue-600 shrink-0" />
                    <span>
                      <strong>Advance Planning:</strong> Tasks scheduled for future dates remain strictly &quot;Scheduled&quot; until the date arrives.
                    </span>
                  </div>
                ) : null}

                {/* Daily Capacity Progress Bar & Status */}
                <div className="bg-white rounded-lg p-3 border border-neutral-200/80 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 font-bold text-neutral-800">
                      <Clock size={14} className="text-[#EA580C]" />
                      <span>{selectedDateTotalHours}h / 24h capacity</span>
                    </div>
                    <span className="text-emerald-600 font-semibold text-[11px] flex items-center gap-1">
                      <CheckCircle2 size={12} />
                      {selectedDateCompletedHours}h completed
                    </span>
                  </div>

                  {/* Visual Segmented Capacity Bar */}
                  <div className="w-full h-2 bg-neutral-100 rounded-full overflow-hidden flex">
                    <div
                      className="h-full bg-emerald-500 transition-all duration-300"
                      style={{
                        width: `${Math.min(100, (selectedDateCompletedHours / 24) * 100)}%`
                      }}
                    />
                    <div
                      className={`h-full transition-all duration-300 ${
                        selectedDateTotalHours >= 24 ? 'bg-rose-500' : 'bg-[#EA580C]'
                      }`}
                      style={{
                        width: `${Math.min(
                          100 - (selectedDateCompletedHours / 24) * 100,
                          Math.max(
                            0,
                            ((selectedDateTotalHours - selectedDateCompletedHours) / 24) * 100
                          )
                        )}%`
                      }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-neutral-500 pt-0.5">
                    <span>
                      {selectedDateTasks.length}{' '}
                      {selectedDateTasks.length === 1 ? 'task' : 'tasks'}
                    </span>
                    <span className="font-medium text-neutral-700">
                      {Math.max(0, 24 - selectedDateTotalHours)}h available
                    </span>
                  </div>
                </div>
              </div>

              {/* Segmented Tab Navigation inside Drawer */}
              <div className="flex border-b border-neutral-200 px-5 bg-neutral-50/50">
                <button
                  type="button"
                  onClick={() => setDrawerTab('tasks')}
                  className={`pb-2.5 pt-2 px-3 text-xs font-bold border-b-2 flex items-center gap-2 transition-colors cursor-pointer ${
                    drawerTab === 'tasks'
                      ? 'border-[#EA580C] text-[#EA580C]'
                      : 'border-transparent text-neutral-500 hover:text-neutral-800'
                  }`}
                >
                  <ListTodo size={14} />
                  <span>Tasks</span>
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                      drawerTab === 'tasks'
                        ? 'bg-orange-100 text-[#EA580C]'
                        : 'bg-neutral-200 text-neutral-600'
                    }`}
                  >
                    {selectedDateTasks.length}
                  </span>
                </button>

                {canAddTasksOnSelectedDate && (
                  <button
                    type="button"
                    onClick={() => {
                      if (!editingTodoId) resetForm();
                      setDrawerTab('form');
                    }}
                    className={`pb-2.5 pt-2 px-3 text-xs font-bold border-b-2 flex items-center gap-2 transition-colors cursor-pointer ${
                      drawerTab === 'form'
                        ? 'border-[#EA580C] text-[#EA580C]'
                        : 'border-transparent text-neutral-500 hover:text-neutral-800'
                    }`}
                  >
                    <Plus size={14} />
                    <span>{editingTodoId ? 'Edit Task' : 'Add New Task'}</span>
                  </button>
                )}
              </div>

              {/* Drawer Scrollable Content */}
              <div className="p-5 overflow-y-auto space-y-4 flex-1">
                {/* Notification Banner */}
                {notification && (
                  <div
                    className={`p-3 rounded-xl text-xs font-semibold flex items-center justify-between gap-2 border transition-all ${
                      notification.type === 'success'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : notification.type === 'info'
                        ? 'bg-amber-50 text-amber-800 border-amber-200'
                        : 'bg-rose-50 text-rose-800 border-rose-200'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <AlertCircle size={14} className="shrink-0" />
                      <span>{notification.message}</span>
                    </div>
                    <button
                      onClick={() => setNotification(null)}
                      className="text-xs opacity-60 hover:opacity-100 p-1 cursor-pointer"
                    >
                      <X size={13} />
                    </button>
                  </div>
                )}

                {/* VIEW 1: TASKS LIST */}
                {drawerTab === 'tasks' && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                        {isSelectedDatePast
                          ? `Historical Tasks (${selectedDateTasks.length})`
                          : `Agenda for ${selectedDate} (${selectedDateTasks.length})`}
                      </h4>

                      {canAddTasksOnSelectedDate && (
                        <button
                          type="button"
                          onClick={() => {
                            resetForm();
                            setDrawerTab('form');
                          }}
                          className="text-xs font-bold text-[#EA580C] hover:text-orange-700 flex items-center gap-1 cursor-pointer"
                        >
                          <Plus size={13} />
                          Add Task
                        </button>
                      )}
                    </div>

                    {selectedDateTasks.length === 0 ? (
                      <div className="bg-neutral-50 rounded-xl p-8 text-center border border-dashed border-neutral-200 space-y-3">
                        <div className="w-10 h-10 rounded-full bg-neutral-100 text-neutral-400 mx-auto flex items-center justify-center">
                          <ListTodo size={20} />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-neutral-800">
                            {isSelectedDatePast
                              ? 'No tasks were scheduled on this date'
                              : 'No tasks scheduled for this day'}
                          </p>
                          <p className="text-[11px] text-neutral-400 mt-1 max-w-xs mx-auto">
                            {isSelectedDatePast
                              ? 'Past dates cannot receive new tasks.'
                              : 'Plan your milestones and allocate up to 8h per task.'}
                          </p>
                        </div>
                        {canAddTasksOnSelectedDate && (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => {
                              resetForm();
                              setDrawerTab('form');
                            }}
                            leftIcon={<Plus size={13} />}
                            className="font-bold text-xs"
                          >
                            Schedule First Task
                          </Button>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {selectedDateTasks.map((t) => {
                          const isCompleted = t.status === 'completed';

                          return (
                            <div
                              key={t.id}
                              className={`p-3 rounded-xl border transition-all duration-200 flex flex-col gap-2 ${
                                isCompleted
                                  ? 'bg-neutral-50/70 border-neutral-200/70'
                                  : 'bg-white border-neutral-200 hover:border-neutral-300 shadow-2xs'
                              }`}
                            >
                              <div className="flex items-start justify-between gap-2.5">
                                <div className="flex items-start gap-2.5 min-w-0 flex-1">
                                  {/* Custom Checkbox: Active for Today/Tomorrow; Disabled for Past and Future Beyond Tomorrow */}
                                  <button
                                    type="button"
                                    disabled={isSelectedDatePast || isSelectedDateFutureBeyondTomorrow}
                                    onClick={() => handleToggleTaskStatus(t)}
                                    className={`mt-0.5 w-5 h-5 rounded-md flex items-center justify-center transition-colors shrink-0 ${
                                      isSelectedDatePast || isSelectedDateFutureBeyondTomorrow
                                        ? isCompleted
                                          ? 'bg-neutral-300 text-white cursor-not-allowed'
                                          : 'border-2 border-neutral-200 cursor-not-allowed bg-neutral-100'
                                        : isCompleted
                                        ? 'bg-emerald-500 text-white cursor-pointer'
                                        : 'border-2 border-neutral-300 hover:border-[#EA580C] cursor-pointer'
                                    }`}
                                    title={
                                      isSelectedDatePast
                                        ? 'Past date: status cannot be modified'
                                        : isSelectedDateFutureBeyondTomorrow
                                        ? 'Future date: tasks must remain Scheduled until the date arrives'
                                        : isCompleted
                                        ? 'Mark as In-Progress'
                                        : 'Mark as Completed'
                                    }
                                  >
                                    {isCompleted && <Check size={12} strokeWidth={3} />}
                                    {!isCompleted && isSelectedDateFutureBeyondTomorrow && (
                                      <Lock size={10} className="text-neutral-400" />
                                    )}
                                  </button>

                                  <div className="min-w-0 flex-1">
                                    <h5
                                      className={`text-xs font-bold leading-snug break-words ${
                                        isCompleted
                                          ? 'text-neutral-400 line-through'
                                          : 'text-neutral-900'
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
                                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-neutral-100 text-neutral-700">
                                    {t.hours}h
                                  </span>

                                  {canModifyTasksOnSelectedDate && (
                                    <>
                                      <button
                                        onClick={() => handleEditClick(t)}
                                        className="p-1 rounded-md text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
                                        title="Edit Task"
                                      >
                                        <Edit2 size={13} />
                                      </button>
                                      <button
                                        onClick={() => handleDeleteTask(t.id)}
                                        className="p-1 rounded-md text-neutral-400 hover:text-rose-600 hover:bg-neutral-100 transition-colors cursor-pointer"
                                        title="Delete Task"
                                      >
                                        <Trash2 size={13} />
                                      </button>
                                    </>
                                  )}
                                </div>
                              </div>

                              {/* Badges: Category & Status */}
                              <div className="flex items-center gap-1.5 text-[10px] pt-1">
                                <span className="px-2 py-0.5 rounded-md bg-orange-50 text-[#EA580C] font-semibold border border-orange-200/60">
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
                )}

                {/* VIEW 2: TASK CREATION & EDIT FORM (Only for today, tomorrow, and future) */}
                {drawerTab === 'form' && canAddTasksOnSelectedDate && (
                  <div className="bg-neutral-50/80 rounded-xl p-4 sm:p-5 border border-neutral-200/90 space-y-4">
                    <div className="flex items-center justify-between pb-2 border-b border-neutral-200">
                      <div>
                        <h4 className="text-xs font-bold text-neutral-900">
                          {editingTodoId ? 'Edit Scheduled Task' : 'Add New Task'}
                        </h4>
                        <p className="text-[11px] text-neutral-500">
                          Date: {selectedDateFormatted}
                        </p>
                      </div>

                      {editingTodoId && (
                        <button
                          type="button"
                          onClick={() => {
                            resetForm();
                            setDrawerTab('tasks');
                          }}
                          className="text-xs font-semibold text-neutral-500 hover:text-neutral-800 cursor-pointer"
                        >
                          Cancel Edit
                        </button>
                      )}
                    </div>

                    <form onSubmit={handleSubmitTask} className="space-y-4">
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

                      {/* Category Selection Pills */}
                      <div>
                        <label className="block text-xs font-bold text-neutral-700 mb-1.5">
                          Category
                        </label>
                        <div className="flex flex-wrap gap-1.5">
                          {CATEGORIES.map((cat) => {
                            const isCatSelected = category === cat;
                            return (
                              <button
                                key={cat}
                                type="button"
                                onClick={() => setCategory(cat)}
                                className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                                  isCatSelected
                                    ? 'bg-[#EA580C] text-white border-[#EA580C] shadow-2xs'
                                    : 'bg-white text-neutral-600 border-neutral-200 hover:border-neutral-300'
                                }`}
                              >
                                {cat}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Hours Quick Presets & Fine Slider */}
                      <div>
                        <div className="flex items-center justify-between text-xs font-bold text-neutral-700 mb-1.5">
                          <span>
                            Allocated Hours *{' '}
                            <span className="font-normal text-neutral-400">
                              (Max 8h per task)
                            </span>
                          </span>
                          <span className="text-[#EA580C] font-extrabold px-2 py-0.5 bg-orange-50 rounded-md border border-orange-200/80">
                            {hours} hrs
                          </span>
                        </div>

                        {/* Quick Presets */}
                        <div className="flex flex-wrap gap-1.5 mb-2.5">
                          {DURATION_PRESETS.map((preset) => (
                            <button
                              key={preset}
                              type="button"
                              onClick={() => setHours(preset)}
                              className={`text-[10px] font-bold px-2 py-1 rounded-md border transition-all cursor-pointer ${
                                hours === preset
                                  ? 'bg-neutral-900 text-white border-neutral-900'
                                  : 'bg-white text-neutral-600 border-neutral-200 hover:border-neutral-300'
                              }`}
                            >
                              {preset}h
                            </button>
                          ))}
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
                          <span>0.5h min</span>
                          <span>4.0h</span>
                          <span>8.0h max</span>
                        </div>
                      </div>

                      {/* Status Selection: Locked to Scheduled for future dates beyond tomorrow */}
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="text-xs font-bold text-neutral-700">Status</label>
                          {isSelectedDateFutureBeyondTomorrow && (
                            <span className="text-[10px] text-blue-700 font-medium flex items-center gap-1">
                              <Lock size={10} /> Locked to Scheduled for future dates
                            </span>
                          )}
                        </div>

                        {isSelectedDateFutureBeyondTomorrow ? (
                          <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-lg text-xs font-bold text-blue-800 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-blue-500" />
                            <span>Scheduled (Advance Plan)</span>
                          </div>
                        ) : (
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                            {(
                              [
                                { val: 'todo', label: 'To Do' },
                                { val: 'in_progress', label: 'In Progress' },
                                { val: 'scheduled', label: 'Scheduled' },
                                { val: 'completed', label: 'Completed' }
                              ] as const
                            ).map((item) => (
                              <button
                                key={item.val}
                                type="button"
                                onClick={() => setStatus(item.val)}
                                className={`text-center py-1.5 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                                  status === item.val
                                    ? 'bg-neutral-900 text-white border-neutral-900 shadow-2xs'
                                    : 'bg-white text-neutral-600 border-neutral-200 hover:border-neutral-300'
                                }`}
                              >
                                {item.label}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Description */}
                      <div>
                        <label className="block text-xs font-bold text-neutral-700 mb-1">
                          Task Details / Notes{' '}
                          <span className="font-normal text-neutral-400">(optional)</span>
                        </label>
                        <textarea
                          rows={2}
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          placeholder="Optional specific topics or goals for this session..."
                          className="w-full text-xs font-medium p-3 rounded-xl border border-neutral-300 focus:outline-none focus:border-[#EA580C] bg-white"
                        />
                      </div>

                      <div className="flex items-center gap-2 pt-1">
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
                        {selectedDateTasks.length > 0 && (
                          <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            onClick={() => setDrawerTab('tasks')}
                            className="font-bold text-xs shrink-0"
                          >
                            Back to Tasks
                          </Button>
                        )}
                      </div>
                    </form>
                  </div>
                )}
              </div>

              {/* Drawer Footer */}
              <div className="p-4 bg-neutral-50/90 border-t border-neutral-100 flex items-center justify-between">
                <span className="text-[11px] text-neutral-500">
                  {isSelectedDatePast
                    ? 'Historical archive (View Only)'
                    : isSelectedDateTodayOrTomorrow
                    ? 'Active scheduling: Max 8h/task · 24h/day'
                    : 'Advance scheduling: Locked to Scheduled status'}
                </span>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsDrawerOpen(false)}
                  className="font-bold text-xs cursor-pointer"
                >
                  Done
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};
