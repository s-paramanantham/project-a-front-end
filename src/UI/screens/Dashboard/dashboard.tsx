import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen,
  GraduationCap,
  Award,
  User,
  ArrowRight,
  Sparkles,
  Play,
  Flame,
  Settings,
  CalendarCheck,
  Clock,
  CheckCircle2,
  Users,
  ChevronRight
} from 'lucide-react';
import { authService } from '../../../services/AuthService/authService';
import { courseService } from '../../../services/CourseService/courseService';
import { todoService } from '../../../services/TodoService/todoService';
import type { Course } from '../../../types/courseTypes';
import type { TodoDashboardSummary, TutorStudentTodoSummary, StudentTodo } from '../../../types/todoTypes';
import { Card } from '../../reusables/base/Card/Card';
import { Button } from '../../reusables/base/Button/Button';
import { AppLayout } from '../../reusables/feature/Navigation/AppLayout';

export const DashboardScreen: React.FC = () => {
  const navigate = useNavigate();
  const user = authService.getCurrentUser();
  const isTutor = user?.role?.toLowerCase() === 'tutor';

  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);
  const [isLoadingCourses, setIsLoadingCourses] = useState(true);

  // Todo States for Student & Tutor
  const [studentTodoSummary, setStudentTodoSummary] = useState<TodoDashboardSummary | null>(null);
  const [tutorTodoSummary, setTutorTodoSummary] = useState<TutorStudentTodoSummary | null>(null);
  const [isLoadingTodos, setIsLoadingTodos] = useState(true);

  const loadData = async () => {
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
  };

  useEffect(() => {
    loadData();
  }, [isTutor]);

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

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-orange-500 via-[#EA580C] to-amber-600 text-white rounded-3xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
          <div className="max-w-2xl relative z-10">
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold bg-white/20 backdrop-blur-xs px-3 py-1 rounded-full mb-3 text-orange-50">
              <Sparkles size={13} className="text-amber-200" />
              <span>Project A Active Learner Track</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-2">
              Welcome back, {user?.name || 'Learner'}!
            </h1>
            <p className="text-orange-100 text-sm leading-relaxed mb-4">
              Your personalized learning platform is ready. Explore our newly seeded technical curriculum
              including SQL, HTML, CSS, JavaScript, TypeScript, Node.js, and Python.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => navigate('/courses')}
                rightIcon={<ArrowRight size={14} />}
                className="bg-white text-orange-600 hover:bg-orange-50 font-bold border-none"
              >
                Go to Courses
              </Button>

              {!isTutor ? (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => navigate('/todo')}
                  leftIcon={<CalendarCheck size={14} />}
                  className="bg-black/30 hover:bg-black/40 text-white font-bold border border-white/30 backdrop-blur-xs"
                >
                  Daily Todo Planner
                </Button>
              ) : (
                <>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => navigate('/tutor/students')}
                    leftIcon={<Users size={14} />}
                    className="bg-black/30 hover:bg-black/40 text-white font-bold border border-white/30 backdrop-blur-xs"
                  >
                    View Assigned Students
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => navigate('/courses/create')}
                    className="bg-amber-500 hover:bg-amber-400 text-neutral-900 font-bold border-none shadow-sm"
                  >
                    + Create New Course
                  </Button>
                </>
              )}
            </div>
          </div>

          <div className="absolute right-4 -bottom-6 opacity-10 hidden sm:block pointer-events-none">
            <BookOpen size={160} />
          </div>
        </div>

        {/* SECTION: DAILY TODO & STUDY SCHEDULE WIDGET */}
        {!isTutor ? (
          /* STUDENT TODO DASHBOARD WIDGET */
          <div className="bg-white rounded-3xl border border-neutral-200/90 p-6 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-orange-100 text-[#EA580C] flex items-center justify-center font-bold">
                  <CalendarCheck size={20} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base sm:text-lg font-bold text-neutral-900">
                      Today's Study Plan & Tasks
                    </h2>
                    <span className="text-[11px] font-bold text-orange-700 bg-orange-50 border border-orange-200 px-2 py-0.5 rounded-full">
                      {studentTodoSummary?.today.date || 'Today'}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-500">
                    Track your daily hours (up to 24h capacity). Plan tomorrow 1 day in advance with scheduled status.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => navigate('/todo')}
                  rightIcon={<ChevronRight size={14} />}
                  className="text-xs font-bold"
                >
                  Open Full Calendar & Planner
                </Button>
              </div>
            </div>

            {/* Daily Hours Capacity Gauge */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-neutral-50 rounded-2xl p-4 border border-neutral-100 flex items-center gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-orange-100 text-[#EA580C] flex items-center justify-center shrink-0">
                  <Clock size={18} />
                </div>
                <div>
                  <span className="text-[10px] text-neutral-400 font-semibold uppercase block">
                    Today's Allocation
                  </span>
                  <span className="text-sm font-extrabold text-neutral-900">
                    {todayHours} hrs planned
                  </span>
                </div>
              </div>

              <div className="bg-neutral-50 rounded-2xl p-4 border border-neutral-100 flex items-center gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                  <CheckCircle2 size={18} />
                </div>
                <div>
                  <span className="text-[10px] text-neutral-400 font-semibold uppercase block">
                    Completed Today
                  </span>
                  <span className="text-sm font-extrabold text-neutral-900">
                    {todayCompletedHours} hrs ({todayTasks.filter((t) => t.status === 'completed').length} tasks)
                  </span>
                </div>
              </div>

              <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl p-4 border border-orange-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-neutral-500 font-semibold uppercase block">
                    Tomorrow (1-Day Advance)
                  </span>
                  <span className="text-sm font-extrabold text-[#EA580C]">
                    {tomorrowTasks.length} {tomorrowTasks.length === 1 ? 'task' : 'tasks'} scheduled
                  </span>
                </div>
                <button
                  onClick={() => navigate('/todo')}
                  className="text-xs font-bold text-[#EA580C] hover:underline cursor-pointer"
                >
                  + Plan
                </button>
              </div>
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
              <div className="p-6 bg-neutral-50 rounded-2xl text-center border border-dashed border-neutral-200 flex flex-col items-center justify-center gap-2">
                <Clock size={24} className="text-neutral-400" />
                <p className="text-xs font-bold text-neutral-800">No tasks logged for today yet</p>
                <p className="text-[11px] text-neutral-400 max-w-sm">
                  Plan your hours and schedule tasks using our interactive 24-hour study calendar.
                </p>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => navigate('/todo')}
                  className="mt-1 text-xs font-bold"
                >
                  + Add Today's Tasks
                </Button>
              </div>
            )}
          </div>
        ) : (
          /* TUTOR VIEW: ASSIGNED STUDENTS DAILY ACTIVITY WIDGET */
          <div className="bg-white rounded-3xl border border-neutral-200/90 p-6 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-orange-100 text-[#EA580C] flex items-center justify-center font-bold">
                  <Users size={20} />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-neutral-900">
                    Assigned Students Daily Study Tasks & Hours
                  </h2>
                  <p className="text-xs text-neutral-500">
                    Real-time diligence tracking of your students' planned hours and progress today ({tutorTodoSummary?.date || 'Today'}).
                  </p>
                </div>
              </div>

              <Button
                variant="secondary"
                size="sm"
                onClick={() => navigate('/tutor/students')}
                rightIcon={<ChevronRight size={14} />}
                className="text-xs font-bold"
              >
                View All Assigned Students
              </Button>
            </div>

            {isLoadingTodos ? (
              <div className="py-6 text-center text-xs text-neutral-400 animate-pulse">
                Loading students daily study records...
              </div>
            ) : tutorTodoSummary && tutorTodoSummary.students.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {tutorTodoSummary.students.map((st) => (
                  <div
                    key={st.student_id}
                    onClick={() => navigate('/tutor/students')}
                    className="p-4 rounded-2xl border border-neutral-200 hover:border-orange-300 hover:shadow-xs transition-all cursor-pointer bg-neutral-50/60 space-y-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-neutral-800 to-neutral-700 text-white font-bold flex items-center justify-center text-xs overflow-hidden shrink-0">
                        {st.avatar_url ? (
                          <img src={st.avatar_url} alt={st.student_name} className="w-full h-full object-cover" />
                        ) : (
                          st.student_name.charAt(0).toUpperCase()
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-xs font-bold text-neutral-900 truncate">{st.student_name}</h4>
                        <p className="text-[11px] text-neutral-500 truncate">{st.student_email}</p>
                      </div>
                    </div>

                    {/* Hours Gauge */}
                    <div className="bg-white p-2.5 rounded-xl border border-neutral-100 space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-neutral-500 font-medium">Daily Planned</span>
                        <span className="font-extrabold text-neutral-900">{st.total_hours}h / 24h</span>
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
              <div className="p-6 bg-neutral-50 rounded-2xl text-center border border-dashed border-neutral-200">
                <Users size={24} className="text-neutral-400 mx-auto mb-2" />
                <p className="text-xs font-bold text-neutral-800">No student activity logged today</p>
                <p className="text-[11px] text-neutral-400 mt-0.5">
                  As your students add daily study tasks and plan schedules, their hours will appear here.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Learning Quick Overview & Profile */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Courses Summary Card */}
          <Card className="md:col-span-2">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-100 mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-orange-100 text-[#EA580C] flex items-center justify-center">
                  <BookOpen size={18} />
                </div>
                <div>
                  <h2 className="text-base font-bold text-neutral-900">Enrolled Courses</h2>
                  <p className="text-xs text-neutral-500">Your current learning journey</p>
                </div>
              </div>

              <Button
                variant="text"
                size="sm"
                onClick={() => navigate('/courses')}
                rightIcon={<ArrowRight size={14} />}
              >
                View Catalog
              </Button>
            </div>

            {isLoadingCourses ? (
              <div className="py-6 text-center text-xs text-neutral-400 animate-pulse">
                Loading enrolled courses...
              </div>
            ) : enrolledCourses.length > 0 ? (
              <div className="space-y-3">
                {enrolledCourses.slice(0, 3).map((c) => (
                  <div
                    key={c.id}
                    className="p-3.5 bg-neutral-50 hover:bg-orange-50/40 border border-neutral-100 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-11 h-11 rounded-lg overflow-hidden shrink-0 bg-neutral-200">
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
                        <p className="text-xs font-bold text-neutral-900 truncate">{c.title}</p>
                        <p className="text-[11px] text-neutral-500 truncate">{c.publisher}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="w-20 sm:w-24 h-1.5 bg-neutral-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-[#EA580C] rounded-full transition-all duration-300"
                              style={{ width: `${c.progress_percent || 0}%` }}
                            />
                          </div>
                          <span className="text-[10px] font-bold text-neutral-600">
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
                        leftIcon={<Play size={12} className="fill-white" />}
                        className="text-xs py-1.5 px-3"
                      >
                        {c.progress_percent && c.progress_percent > 0 ? 'Continue' : 'Study'}
                      </Button>
                    </div>
                  </div>
                ))}
                {enrolledCourses.length > 3 && (
                  <p className="text-xs text-center text-neutral-500 pt-1">
                    + {enrolledCourses.length - 3} more courses
                  </p>
                )}
              </div>
            ) : (
              <div className="text-center py-6 px-4 bg-orange-50/40 rounded-xl border border-orange-100">
                <Sparkles size={24} className="text-[#EA580C] mx-auto mb-2" />
                <p className="text-xs font-semibold text-neutral-800 mb-1">
                  You haven't enrolled in any courses yet
                </p>
                <p className="text-[11px] text-neutral-500 mb-4 max-w-sm mx-auto">
                  Sample courses like SQL, HTML, CSS, JavaScript, TypeScript, Node.js, and Python are waiting!
                </p>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => navigate('/courses')}
                  rightIcon={<ArrowRight size={13} />}
                >
                  Explore & Enroll
                </Button>
              </div>
            )}
          </Card>

          {/* Profile & Student Status Card */}
          <Card>
            <div className="flex items-center justify-between pb-4 border-b border-neutral-100 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-orange-100 text-[#EA580C] flex items-center justify-center">
                  <User size={18} />
                </div>
                <h2 className="text-sm font-bold text-neutral-900">
                  {isTutor ? 'Tutor Profile' : 'Student Profile'}
                </h2>
              </div>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-orange-50 text-[#EA580C] border border-orange-200">
                {isTutor ? <Award size={12} /> : <GraduationCap size={12} />}
                <span className="capitalize">{user?.role || 'Student'}</span>
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-2.5 bg-neutral-50 rounded-lg">
                <span className="text-neutral-400 block text-[10px]">Full Name</span>
                <span className="font-semibold text-neutral-800">{user?.name || 'N/A'}</span>
              </div>
              <div className="p-2.5 bg-neutral-50 rounded-lg">
                <span className="text-neutral-400 block text-[10px]">Email Address</span>
                <span className="font-semibold text-neutral-800 truncate block">{user?.email || 'N/A'}</span>
              </div>

              {user?.education?.degree ? (
                <div className="p-2.5 bg-neutral-50 rounded-lg">
                  <span className="text-neutral-400 block text-[10px]">Education</span>
                  <span className="font-semibold text-neutral-800 truncate block">
                    {user.education.degree} {user.education.institution ? `• ${user.education.institution}` : ''}
                  </span>
                </div>
              ) : null}

              {user?.work?.jobTitle ? (
                <div className="p-2.5 bg-neutral-50 rounded-lg">
                  <span className="text-neutral-400 block text-[10px]">Work</span>
                  <span className="font-semibold text-neutral-800 truncate block">
                    {user.work.jobTitle} {user.work.company ? `@ ${user.work.company}` : ''}
                  </span>
                </div>
              ) : null}

              {user?.address?.city ? (
                <div className="p-2.5 bg-neutral-50 rounded-lg">
                  <span className="text-neutral-400 block text-[10px]">Location</span>
                  <span className="font-semibold text-neutral-800 truncate block">
                    {user.address.city}, {user.address.country}
                  </span>
                </div>
              ) : null}
            </div>

            <div className="mt-4 p-3 bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl border border-orange-100 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-orange-100 text-[#EA580C] flex items-center justify-center shrink-0">
                <Flame size={16} />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-neutral-800">Learning Streak</p>
                <p className="text-[10px] text-neutral-500">Keep studying daily to maintain momentum!</p>
              </div>
            </div>

            <Button
              variant="soft"
              size="sm"
              fullWidth
              className="mt-3 text-xs"
              onClick={() => navigate('/profile/settings')}
              leftIcon={<Settings size={14} />}
            >
              Profile Settings & Edit Details
            </Button>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};
