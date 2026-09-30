import React from 'react';
import {
  BookOpen,
  User,
  ArrowRight,
  Play,
  Settings,
  CalendarCheck,
  Clock,
  CheckCircle2,
  Users,
  ChevronRight
} from 'lucide-react';
import { Button } from '../../reusables/base/Button/Button';
import { AppLayout } from '../../reusables/feature/Navigation/AppLayout';
import { useDashboardVM } from './dashboard.vm';

export const DashboardScreen: React.FC = () => {
  const {
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
    navigate
  } = useDashboardVM();

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-neutral-200/80">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
              Dashboard
            </h1>
            <p className="text-xs sm:text-sm text-neutral-500 mt-0.5">
              Welcome back, {user?.name || 'Learner'}. Track your learning progress, study plan, and active courses.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate('/courses')}
              rightIcon={<ArrowRight size={14} />}
              className="text-xs font-semibold cursor-pointer"
            >
              Course Catalog
            </Button>

            {!isTutor ? (
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate('/todo')}
                leftIcon={<CalendarCheck size={14} />}
                className="text-xs font-semibold shadow-xs cursor-pointer"
              >
                Daily Schedule
              </Button>
            ) : (
              <>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => navigate('/tutor/students')}
                  leftIcon={<Users size={14} />}
                  className="text-xs font-semibold cursor-pointer"
                >
                  Assigned Students
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => navigate('/courses/create')}
                  className="text-xs font-semibold shadow-xs cursor-pointer"
                >
                  + Create Course
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Top KPI Metrics Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white p-4 rounded-xl border border-neutral-200/80 shadow-xs space-y-1">
            <div className="flex items-center justify-between text-neutral-500 text-xs font-medium">
              <span>Enrolled Courses</span>
              <BookOpen size={15} className="text-neutral-400" />
            </div>
            <p className="text-xl sm:text-2xl font-bold text-neutral-900 tabular-nums">
              {enrolledCourses.length}
            </p>
            <p className="text-[11px] text-neutral-500">
              {enrolledCourses.filter((c) => (c.progress_percent || 0) > 0).length} in progress
            </p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-neutral-200/80 shadow-xs space-y-1">
            <div className="flex items-center justify-between text-neutral-500 text-xs font-medium">
              <span>Today's Time</span>
              <Clock size={15} className="text-[#EA580C]" />
            </div>
            <p className="text-xl sm:text-2xl font-bold text-neutral-900 tabular-nums">
              {todayHours} hrs
            </p>
            <p className="text-[11px] text-neutral-500">
              {todayCompletedHours} hrs completed
            </p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-neutral-200/80 shadow-xs space-y-1">
            <div className="flex items-center justify-between text-neutral-500 text-xs font-medium">
              <span>Tasks Progress</span>
              <CheckCircle2 size={15} className="text-emerald-500" />
            </div>
            <p className="text-xl sm:text-2xl font-bold text-neutral-900 tabular-nums">
              {todayTasks.filter((t) => t.status === 'completed').length} / {todayTasks.length}
            </p>
            <p className="text-[11px] text-neutral-500">
              {todayTasks.length > 0
                ? `${Math.round((todayTasks.filter((t) => t.status === 'completed').length / todayTasks.length) * 100)}% completed`
                : 'No tasks today'}
            </p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-neutral-200/80 shadow-xs space-y-1">
            <div className="flex items-center justify-between text-neutral-500 text-xs font-medium">
              <span>Tomorrow (Advance)</span>
              <CalendarCheck size={15} className="text-amber-500" />
            </div>
            <p className="text-xl sm:text-2xl font-bold text-neutral-900 tabular-nums">
              {tomorrowTasks.length}
            </p>
            <p className="text-[11px] text-neutral-500">
              {tomorrowTasks.length > 0 ? 'Milestones scheduled' : 'None scheduled'}
            </p>
          </div>
        </div>

        {/* SECTION: DAILY TODO & STUDY SCHEDULE WIDGET */}
        {!isTutor ? (
          /* STUDENT TODO DASHBOARD WIDGET */
          <div className="bg-white rounded-xl border border-neutral-200/80 p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-neutral-100 text-neutral-700 flex items-center justify-center font-bold">
                  <CalendarCheck size={16} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm sm:text-base font-bold text-neutral-900">
                      Today's Study Plan
                    </h2>
                    <span className="text-[10px] font-semibold text-neutral-600 bg-neutral-100 px-2 py-0.5 rounded">
                      {studentTodoSummary?.today.date || 'Today'}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-500">
                    Your scheduled learning milestones and active sessions for today.
                  </p>
                </div>
              </div>

              <Button
                variant="secondary"
                size="sm"
                onClick={() => navigate('/todo')}
                rightIcon={<ChevronRight size={13} />}
                className="text-xs font-semibold cursor-pointer self-start sm:self-auto"
              >
                Open Calendar
              </Button>
            </div>

            {/* Today's Tasks List Preview */}
            {isLoadingTodos ? (
              <div className="py-6 text-center text-xs text-neutral-400 animate-pulse">
                Loading daily tasks...
              </div>
            ) : todayTasks.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {todayTasks.map((task) => {
                  const isDone = task.status === 'completed';
                  return (
                    <div
                      key={task.id}
                      className={`p-3.5 rounded-2xl border transition-all flex items-start justify-between gap-3 ${
                        isDone
                          ? 'bg-emerald-50/30 border-emerald-200'
                          : 'bg-neutral-50 hover:bg-neutral-100/80 border-neutral-200/80'
                      }`}
                    >
                      <div className="flex items-start gap-2.5 min-w-0 flex-1">
                        <button
                          onClick={() => handleToggleTaskStatus(task)}
                          className={`mt-0.5 w-5 h-5 rounded-lg flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
                            isDone
                              ? 'bg-emerald-500 text-white'
                              : 'border-2 border-neutral-300 hover:border-[#EA580C]'
                          }`}
                          title={isDone ? 'Mark In-Progress' : 'Mark Completed'}
                        >
                          {isDone && <CheckCircle2 size={13} />}
                        </button>
                        <div className="min-w-0 flex-1">
                          <h4
                            className={`text-xs font-bold truncate ${
                              isDone ? 'line-through text-neutral-400' : 'text-neutral-900'
                            }`}
                          >
                            {task.task_name}
                          </h4>
                          <p className="text-[11px] text-neutral-500 mt-0.5 line-clamp-1">
                            {task.description || `${task.category} session`}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-white border border-neutral-200 text-neutral-700">
                          {task.hours}h
                        </span>
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md uppercase ${
                            isDone
                              ? 'bg-emerald-100 text-emerald-800'
                              : task.status === 'in_progress'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-neutral-200 text-neutral-700'
                          }`}
                        >
                          {task.status.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-6 bg-neutral-50 rounded-xl text-center border border-dashed border-neutral-200 flex flex-col items-center justify-center gap-2">
                <Clock size={20} className="text-neutral-400" />
                <p className="text-xs font-semibold text-neutral-800">No tasks planned for today</p>
                <p className="text-[11px] text-neutral-400 max-w-sm">
                  Add learning milestones or study topics to track your daily progress.
                </p>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => navigate('/todo')}
                  className="mt-1 text-xs font-semibold"
                >
                  + Add Today's Tasks
                </Button>
              </div>
            )}
          </div>
        ) : (
          /* TUTOR VIEW: ASSIGNED STUDENTS DAILY ACTIVITY WIDGET */
          <div className="bg-white rounded-xl border border-neutral-200/80 p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-neutral-100 text-neutral-700 flex items-center justify-center font-bold">
                  <Users size={16} />
                </div>
                <div>
                  <h2 className="text-sm sm:text-base font-bold text-neutral-900">
                    Assigned Students Activity
                  </h2>
                  <p className="text-xs text-neutral-500">
                    Daily planned hours and completion status for your enrolled students ({tutorTodoSummary?.date || 'Today'}).
                  </p>
                </div>
              </div>

              <Button
                variant="secondary"
                size="sm"
                onClick={() => navigate('/tutor/students')}
                rightIcon={<ChevronRight size={13} />}
                className="text-xs font-semibold cursor-pointer"
              >
                View All Students
              </Button>
            </div>

            {isLoadingTodos ? (
              <div className="py-6 text-center text-xs text-neutral-400 animate-pulse">
                Loading student activity records...
              </div>
            ) : tutorTodoSummary && tutorTodoSummary.students.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {tutorTodoSummary.students.map((st) => (
                  <div
                    key={st.student_id}
                    onClick={() => navigate('/tutor/students')}
                    className="p-3.5 rounded-xl border border-neutral-200 hover:border-neutral-300 hover:shadow-xs transition-all cursor-pointer bg-neutral-50/50 space-y-2.5"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-neutral-900 text-white font-bold flex items-center justify-center text-xs overflow-hidden shrink-0">
                        {st.avatar_url ? (
                          <img src={st.avatar_url} alt={st.student_name} className="w-full h-full object-cover" />
                        ) : (
                          st.student_name.charAt(0).toUpperCase()
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-xs font-semibold text-neutral-900 truncate">{st.student_name}</h4>
                        <p className="text-[11px] text-neutral-400 truncate">{st.student_email}</p>
                      </div>
                    </div>

                    {/* Hours Gauge */}
                    <div className="bg-white p-2.5 rounded-lg border border-neutral-100 space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-neutral-500 font-medium">Daily Planned</span>
                        <span className="font-semibold text-neutral-900">{st.total_hours}h</span>
                      </div>
                      <div className="w-full h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#EA580C] rounded-full"
                          style={{ width: `${Math.min(100, (st.total_hours / 24) * 100)}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-neutral-400">
                        <span>Completed: <strong className="text-emerald-600">{st.completed_hours}h</strong></span>
                        <span>{st.tasks.length} {st.tasks.length === 1 ? 'task' : 'tasks'}</span>
                      </div>
                    </div>

                    {/* Today's Tasks Snippet */}
                    {st.tasks.length > 0 ? (
                      <div className="space-y-1">
                        {st.tasks.slice(0, 2).map((t) => (
                          <div key={t.id} className="text-[11px] text-neutral-600 truncate flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#EA580C] shrink-0" />
                            <span className="truncate">{t.task_name}</span>
                            <span className="text-neutral-400 font-medium shrink-0">({t.hours}h)</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[10px] text-neutral-400 italic">No tasks logged today yet</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 bg-neutral-50 rounded-xl text-center border border-dashed border-neutral-200">
                <Users size={20} className="text-neutral-400 mx-auto mb-1.5" />
                <p className="text-xs font-semibold text-neutral-800">No student activity logged today</p>
                <p className="text-[11px] text-neutral-400 mt-0.5">
                  As your students schedule daily tasks, their activity will display here.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Learning Quick Overview & Profile */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Courses Summary Card */}
          <div className="md:col-span-2 bg-white rounded-xl border border-neutral-200/80 p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100 mb-4">
              <div className="flex items-center gap-2">
                <BookOpen size={16} className="text-neutral-700" />
                <h2 className="text-sm font-bold text-neutral-900">Enrolled Courses</h2>
              </div>

              <Button
                variant="text"
                size="sm"
                onClick={() => navigate('/courses')}
                rightIcon={<ArrowRight size={13} />}
                className="text-xs font-semibold"
              >
                Browse All
              </Button>
            </div>

            {isLoadingCourses ? (
              <div className="py-6 text-center text-xs text-neutral-400 animate-pulse">
                Loading enrolled courses...
              </div>
            ) : enrolledCourses.length > 0 ? (
              <div className="space-y-2.5">
                {enrolledCourses.slice(0, 3).map((c) => (
                  <div
                    key={c.id}
                    className="p-3 bg-neutral-50/70 hover:bg-neutral-50 border border-neutral-200/70 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-md overflow-hidden shrink-0 bg-neutral-200">
                        <img
                          src={c.image}
                          alt={c.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-neutral-900 truncate">{c.title}</p>
                        <p className="text-[11px] text-neutral-400 truncate">{c.publisher}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="w-20 sm:w-24 h-1.5 bg-neutral-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-[#EA580C] rounded-full transition-all duration-300"
                              style={{ width: `${c.progress_percent || 0}%` }}
                            />
                          </div>
                          <span className="text-[10px] font-semibold text-neutral-600">
                            {c.progress_percent || 0}%
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => navigate(`/courses/${c.id}/study`)}
                        leftIcon={<Play size={11} className="fill-white" />}
                        className="text-xs py-1 px-2.5"
                      >
                        {c.progress_percent && c.progress_percent > 0 ? 'Continue' : 'Start'}
                      </Button>
                    </div>
                  </div>
                ))}
                {enrolledCourses.length > 3 && (
                  <p className="text-xs text-center text-neutral-500 pt-1">
                    + {enrolledCourses.length - 3} more enrolled courses
                  </p>
                )}
              </div>
            ) : (
              <div className="text-center py-6 px-4 bg-neutral-50 rounded-lg border border-dashed border-neutral-200">
                <BookOpen size={20} className="text-neutral-400 mx-auto mb-1.5" />
                <p className="text-xs font-semibold text-neutral-800 mb-0.5">
                  No courses enrolled yet
                </p>
                <p className="text-[11px] text-neutral-400 mb-3 max-w-sm mx-auto">
                  Browse the catalog to enroll in SQL, TypeScript, Python, and more.
                </p>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => navigate('/courses')}
                  rightIcon={<ArrowRight size={13} />}
                  className="text-xs font-semibold"
                >
                  Explore Catalog
                </Button>
              </div>
            )}
          </div>

          {/* Profile & Student Status Card */}
          <div className="bg-white rounded-xl border border-neutral-200/80 p-5 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-neutral-100 mb-3.5">
                <div className="flex items-center gap-2">
                  <User size={16} className="text-neutral-700" />
                  <h2 className="text-sm font-bold text-neutral-900">
                    Profile Overview
                  </h2>
                </div>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-neutral-100 text-neutral-700 border border-neutral-200/70 capitalize">
                  {user?.role || 'Student'}
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="p-2 bg-neutral-50/80 rounded-md">
                  <span className="text-neutral-400 block text-[10px]">Full Name</span>
                  <span className="font-semibold text-neutral-800">{user?.name || 'N/A'}</span>
                </div>
                <div className="p-2 bg-neutral-50/80 rounded-md">
                  <span className="text-neutral-400 block text-[10px]">Email Address</span>
                  <span className="font-semibold text-neutral-800 truncate block">{user?.email || 'N/A'}</span>
                </div>

                {user?.education?.degree ? (
                  <div className="p-2 bg-neutral-50/80 rounded-md">
                    <span className="text-neutral-400 block text-[10px]">Education</span>
                    <span className="font-semibold text-neutral-800 truncate block">
                      {user.education.degree} {user.education.institution ? `• ${user.education.institution}` : ''}
                    </span>
                  </div>
                ) : null}

                {user?.work?.jobTitle ? (
                  <div className="p-2 bg-neutral-50/80 rounded-md">
                    <span className="text-neutral-400 block text-[10px]">Work</span>
                    <span className="font-semibold text-neutral-800 truncate block">
                      {user.work.jobTitle} {user.work.company ? `@ ${user.work.company}` : ''}
                    </span>
                  </div>
                ) : null}
              </div>
            </div>

            <Button
              variant="secondary"
              size="sm"
              fullWidth
              className="mt-4 text-xs font-semibold cursor-pointer"
              onClick={() => navigate('/profile/settings')}
              leftIcon={<Settings size={13} />}
            >
              Account Settings
            </Button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};
