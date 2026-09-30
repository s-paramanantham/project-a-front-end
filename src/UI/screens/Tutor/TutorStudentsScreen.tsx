import React from 'react';
import {
  Users,
  GraduationCap,
  Briefcase,
  MapPin,
  BookOpen,
  CheckCircle2,
  Clock,
  Star,
  Search,
  ChevronRight,
  Send,
  MessageSquare,
  AlertCircle,
  CalendarCheck,
  X
} from 'lucide-react';
import { AppLayout } from '../../reusables/feature/Navigation/AppLayout';
import { Button } from '../../reusables/base/Button/Button';
import { useTutorStudentsVM } from './tutorStudents.vm';

export const TutorStudentsScreen: React.FC = () => {
  const {
    filteredStudents,
    searchQuery,
    setSearchQuery,
    isLoading,
    selectedStudent,
    setSelectedStudent,
    studentDetails,
    setStudentDetails,
    studentTodos,
    isLoadingDetails,
    toast,
    setToast,
    activeReviewId,
    setActiveReviewId,
    tutorFeedback,
    setTutorFeedback,
    tutorRating,
    setTutorRating,
    isResponding,
    handleOpenStudentDetails,
    handleSendFeedback
  } = useTutorStudentsVM();


  return (
    <AppLayout>
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
        {/* Toast Alert */}
        {toast && (
          <div
            className={`p-4 rounded-xl border flex items-center justify-between text-xs sm:text-sm font-semibold shadow-xs animate-in fade-in duration-200 ${
              toast.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}
          >
            <div className="flex items-center gap-2">
              {toast.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
              <span>{toast.message}</span>
            </div>
            <button onClick={() => setToast(null)} className="p-1 hover:bg-black/5 rounded">
              ✕
            </button>
          </div>
        )}

        {/* Header & Metrics */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 text-[#EA580C] text-xs font-semibold mb-2">
              <Users size={14} />
              <span>Tutor Mentorship Portal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 tracking-tight">
              Assigned Students
            </h1>
            <p className="text-xs sm:text-sm text-neutral-500 mt-1">
              Monitor active learners who have designated you as primary reviewer or enrolled in your courses.
            </p>
          </div>

          {/* Search bar */}
          <div className="relative w-full md:w-72">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400"
            />
            <input
              type="text"
              placeholder="Search student, course, degree..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-neutral-200 rounded-xl text-xs sm:text-sm text-neutral-800 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-[#EA580C]"
            />
          </div>
        </div>

        {/* Students Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-white rounded-xl border border-neutral-200 p-5 animate-pulse space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-lg bg-neutral-200" />
                  <div className="space-y-1.5 flex-1">
                    <div className="h-4 bg-neutral-200 rounded w-3/4" />
                    <div className="h-3 bg-neutral-100 rounded w-1/2" />
                  </div>
                </div>
                <div className="h-16 bg-neutral-100 rounded-lg" />
                <div className="h-9 bg-neutral-200 rounded-lg" />
              </div>
            ))}
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="bg-white rounded-xl border border-dashed border-neutral-300 p-10 text-center max-w-md mx-auto space-y-3">
            <div className="w-10 h-10 rounded-lg bg-neutral-100 text-neutral-600 border border-neutral-200 flex items-center justify-center mx-auto">
              <Users size={20} />
            </div>
            <h3 className="text-sm font-bold text-neutral-900">No Students Found</h3>
            <p className="text-xs text-neutral-500">
              {searchQuery ? 'No students match your search criteria.' : 'No students have been assigned yet.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredStudents.map((st) => {
              const isPrimary = st.is_primary_reviewer;

              return (
                <div
                  key={st.id}
                  onClick={() => handleOpenStudentDetails(st)}
                  className={`bg-white rounded-xl border transition-all duration-200 p-5 flex flex-col justify-between shadow-xs hover:shadow-sm cursor-pointer hover:border-neutral-300 group ${
                    isPrimary
                      ? 'border-orange-500/50 ring-1 ring-orange-500/20'
                      : 'border-neutral-200/80'
                  }`}
                >
                  <div className="space-y-4">
                    {/* Top Row: Avatar & Status */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="w-11 h-11 rounded-lg bg-neutral-900 text-white font-bold text-base flex items-center justify-center shadow-xs overflow-hidden shrink-0">
                          {st.avatar_url ? (
                            <img
                              src={st.avatar_url}
                              alt={st.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            st.name.charAt(0).toUpperCase()
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <h3 className="text-sm font-bold text-neutral-900 group-hover:text-[#EA580C] transition-colors truncate">
                            {st.name}
                          </h3>
                          <p className="text-xs text-neutral-500 truncate mt-0.5">
                            {st.email}
                          </p>
                          {st.phone && (
                            <p className="text-[11px] text-neutral-400 mt-0.5 truncate">{st.phone}</p>
                          )}
                        </div>
                      </div>

                      {isPrimary ? (
                        <span className="shrink-0 text-[10px] font-bold text-orange-700 bg-orange-50 border border-orange-200/80 px-2 py-0.5 rounded-md flex items-center gap-1 whitespace-nowrap shadow-2xs">
                          <CheckCircle2 size={11} className="text-[#EA580C] shrink-0" />
                          <span>Primary</span>
                        </span>
                      ) : (
                        <span className="shrink-0 text-[10px] font-medium text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded-md whitespace-nowrap">
                          Enrolled
                        </span>
                      )}
                    </div>

                    {/* Overall Progress Bar */}
                    <div className="bg-neutral-50 p-3 rounded-lg border border-neutral-100 space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-neutral-600">Progress</span>
                        <span className="font-bold text-neutral-900">{st.overall_progress}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-neutral-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#EA580C] rounded-full transition-all duration-300"
                          style={{ width: `${st.overall_progress}%` }}
                        />
                      </div>
                    </div>

                    {/* Currently Chosen Courses */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-bold text-neutral-500 uppercase tracking-wider">
                        <span className="flex items-center gap-1">
                          <BookOpen size={12} className="text-[#EA580C]" />
                          <span>Enrolled Courses</span>
                        </span>
                        <span>{st.enrolled_courses.length}</span>
                      </div>

                      {st.enrolled_courses.length > 0 ? (
                        <div className="space-y-1.5">
                          {st.enrolled_courses.slice(0, 2).map((c) => (
                            <div
                              key={c.course_id}
                              className="flex items-center justify-between p-2 rounded-xl bg-neutral-50 text-xs border border-neutral-100"
                            >
                              <span className="font-medium text-neutral-800 truncate max-w-[190px]">
                                {c.title}
                              </span>
                              <span className="text-[11px] font-bold text-[#EA580C]">
                                {c.progress_percent}%
                              </span>
                            </div>
                          ))}
                          {st.enrolled_courses.length > 2 && (
                            <p className="text-[11px] text-neutral-400 text-center font-medium">
                              +{st.enrolled_courses.length - 2} more courses
                            </p>
                          )}
                        </div>
                      ) : (
                        <p className="text-xs text-neutral-400 italic">No courses started yet</p>
                      )}
                    </div>

                    {/* Education Details Snippet */}
                    <div className="pt-2 border-t border-neutral-100 flex items-center gap-2 text-xs text-neutral-600">
                      <GraduationCap size={14} className="text-[#EA580C] shrink-0" />
                      <span className="truncate">
                        {st.education?.degree
                          ? `${st.education.degree} · ${st.education.institution || 'University'}`
                          : 'Education details not specified yet'}
                      </span>
                    </div>
                  </div>

                  {/* Card Button */}
                  <div className="pt-4 mt-4 border-t border-neutral-100 flex items-center justify-between text-xs font-bold text-[#EA580C] group-hover:translate-x-1 transition-transform">
                    <span>View Student Profile & Progress</span>
                    <ChevronRight size={15} />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Comprehensive Student Details Slide-Over Modal */}
        {selectedStudent && (
          <div className="fixed inset-0 z-50 flex items-center justify-end bg-neutral-900/50 backdrop-blur-xs animate-in fade-in">
            <div className="bg-white h-full w-full max-w-2xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-300">
              {/* Slide-over Header */}
              <div className="p-6 border-b border-neutral-200 flex items-center justify-between bg-neutral-50/70 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-lg bg-neutral-900 text-white font-bold text-base flex items-center justify-center overflow-hidden shrink-0 shadow-xs">
                    {selectedStudent.avatar_url ? (
                      <img
                        src={selectedStudent.avatar_url}
                        alt={selectedStudent.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      selectedStudent.name.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
                      {selectedStudent.name}
                      {selectedStudent.is_primary_reviewer && (
                        <span className="text-[10px] font-bold text-orange-700 bg-orange-100 px-2 py-0.5 rounded-full">
                          Your Mentee
                        </span>
                      )}
                    </h2>
                    <p className="text-xs text-neutral-500">{selectedStudent.email}</p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setSelectedStudent(null);
                    setStudentDetails(null);
                  }}
                  className="p-2 text-neutral-400 hover:text-neutral-700 rounded-xl hover:bg-neutral-100 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Slide-over Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {isLoadingDetails ? (
                  <div className="text-center py-12 space-y-3">
                    <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-xs font-semibold text-neutral-600">
                      Loading comprehensive student profile...
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Section 1: Education Details */}
                    <div className="bg-neutral-50 rounded-2xl p-5 border border-neutral-200 space-y-3">
                      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-neutral-700">
                        <GraduationCap size={15} className="text-[#EA580C]" />
                        <span>Education Details</span>
                      </div>

                      {studentDetails?.student.education &&
                      (studentDetails.student.education.degree ||
                        studentDetails.student.education.institution) ? (
                        <div className="grid grid-cols-2 gap-3 text-xs">
                          <div>
                            <span className="text-neutral-400 block text-[11px]">Degree / Program</span>
                            <span className="font-semibold text-neutral-900">
                              {studentDetails.student.education.degree || 'N/A'}
                            </span>
                          </div>
                          <div>
                            <span className="text-neutral-400 block text-[11px]">Institution</span>
                            <span className="font-semibold text-neutral-900">
                              {studentDetails.student.education.institution || 'N/A'}
                            </span>
                          </div>
                          <div>
                            <span className="text-neutral-400 block text-[11px]">Field of Study</span>
                            <span className="font-semibold text-neutral-900">
                              {studentDetails.student.education.fieldOfStudy || 'Computer Science'}
                            </span>
                          </div>
                          <div>
                            <span className="text-neutral-400 block text-[11px]">Graduation Year</span>
                            <span className="font-semibold text-neutral-900">
                              {studentDetails.student.education.graduationYear || 'N/A'}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs text-neutral-500 italic">
                          No formal education details recorded by student.
                        </p>
                      )}
                    </div>

                    {/* Section 2: Work & Address */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="bg-neutral-50 rounded-2xl p-4 border border-neutral-200 space-y-2">
                        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-neutral-700">
                          <Briefcase size={14} className="text-neutral-500" />
                          <span>Work & Career</span>
                        </div>
                        <p className="text-xs font-semibold text-neutral-900">
                          {studentDetails?.student.work?.jobTitle || 'Learner / Developer'}
                        </p>
                        <p className="text-[11px] text-neutral-500">
                          {studentDetails?.student.work?.company || 'Independent Contributor'}
                        </p>
                      </div>

                      <div className="bg-neutral-50 rounded-2xl p-4 border border-neutral-200 space-y-2">
                        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-neutral-700">
                          <MapPin size={14} className="text-neutral-500" />
                          <span>Location</span>
                        </div>
                        <p className="text-xs font-semibold text-neutral-900">
                          {studentDetails?.student.address?.city || 'Global Remote'}
                        </p>
                        <p className="text-[11px] text-neutral-500">
                          {studentDetails?.student.address?.country || 'Earth'}
                        </p>
                      </div>
                    </div>

                    {/* Section 2.5: Student Daily Study Tasks & Time Allocation (Todo Tracker) */}
                    <div className="bg-neutral-50 rounded-2xl p-5 border border-neutral-200 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-neutral-700">
                          <CalendarCheck size={15} className="text-[#EA580C]" />
                          <span>Daily Study Schedule & Time Allocation</span>
                        </div>
                        <span className="text-[11px] font-bold text-neutral-700 bg-white border border-neutral-200 px-2.5 py-0.5 rounded-full shadow-2xs">
                          {studentTodos?.today.totalHours || 0}h / 24h planned today
                        </span>
                      </div>

                      {/* Daily 24-hr Capacity Gauge */}
                      <div className="space-y-1.5 pt-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-neutral-500 font-medium">Today's Progress</span>
                          <span className="font-bold text-neutral-900">
                            {studentTodos?.today.completedHours || 0}h completed of {studentTodos?.today.totalHours || 0}h
                          </span>
                        </div>
                        <div className="w-full h-2 bg-neutral-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#EA580C] rounded-full transition-all duration-300"
                            style={{
                              width: `${
                                studentTodos?.today.totalHours
                                  ? Math.min(100, ((studentTodos.today.completedHours || 0) / studentTodos.today.totalHours) * 100)
                                  : 0
                              }%`
                            }}
                          />
                        </div>
                      </div>

                      {/* Today's Tasks */}
                      {studentTodos && studentTodos.today.tasks.length > 0 ? (
                        <div className="space-y-2 pt-2 border-t border-neutral-200/80">
                          <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider block">
                            Tasks Scheduled Today ({studentTodos.today.tasks.length})
                          </span>
                          <div className="space-y-1.5">
                            {studentTodos.today.tasks.map((task) => (
                              <div
                                key={task.id}
                                className="bg-white p-2.5 rounded-xl border border-neutral-200 flex items-center justify-between text-xs shadow-2xs"
                              >
                                <div className="flex items-center gap-2 min-w-0 flex-1">
                                  {task.status === 'completed' ? (
                                    <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />
                                  ) : (
                                    <Clock size={13} className="text-amber-500 shrink-0" />
                                  )}
                                  <span
                                    className={`truncate font-semibold ${
                                      task.status === 'completed' ? 'line-through text-neutral-400' : 'text-neutral-800'
                                    }`}
                                  >
                                    {task.task_name}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                  <span className="text-[10px] font-bold bg-neutral-100 px-2 py-0.5 rounded-md text-neutral-600">
                                    {task.hours}h
                                  </span>
                                  <span
                                    className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md uppercase ${
                                      task.status === 'completed'
                                        ? 'bg-emerald-100 text-emerald-800'
                                        : task.status === 'in_progress'
                                        ? 'bg-amber-100 text-amber-800'
                                        : 'bg-neutral-100 text-neutral-700'
                                    }`}
                                  >
                                    {task.status.replace('_', ' ')}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs text-neutral-400 italic pt-1">
                          No tasks logged by student for today yet.
                        </p>
                      )}

                      {/* Tomorrow's Advance Plan */}
                      {studentTodos && studentTodos.tomorrow.tasks.length > 0 && (
                        <div className="pt-2 border-t border-neutral-200/80">
                          <span className="text-[11px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md inline-block mb-1.5">
                            Tomorrow's Scheduled Advance Plan ({studentTodos.tomorrow.tasks.length} tasks · {studentTodos.tomorrow.totalHours}h)
                          </span>
                          <div className="space-y-1">
                            {studentTodos.tomorrow.tasks.map((t) => (
                              <div key={t.id} className="text-[11px] text-neutral-600 flex items-center gap-2 truncate">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                                <span className="truncate">{t.task_name}</span>
                                <span className="text-neutral-400">({t.hours}h)</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Section 3: Currently Chosen Courses & Progress */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
                          <BookOpen size={16} className="text-[#EA580C]" />
                          <span>Enrolled Courses & Curriculum Progress</span>
                        </h3>
                        <span className="text-xs font-bold text-neutral-500">
                          {studentDetails?.courses.length || 0} active courses
                        </span>
                      </div>

                      {studentDetails?.courses && studentDetails.courses.length > 0 ? (
                        <div className="space-y-4">
                          {studentDetails.courses.map((c) => (
                            <div
                              key={c.course_id}
                              className="bg-white rounded-2xl border border-neutral-200 p-4 space-y-3 shadow-2xs"
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <h4 className="text-sm font-bold text-neutral-900">{c.title}</h4>
                                  <p className="text-[11px] text-neutral-500">
                                    {c.completed_topics} of {c.total_topics} lessons finished
                                  </p>
                                </div>
                                <span className="text-xs font-bold text-[#EA580C] bg-orange-50 px-2.5 py-1 rounded-full border border-orange-200">
                                  {c.calculated_progress}%
                                </span>
                              </div>

                              <div className="w-full h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-[#EA580C] rounded-full transition-all duration-300"
                                  style={{ width: `${c.calculated_progress}%` }}
                                />
                              </div>

                              {/* Lesson checklist */}
                              <div className="pt-2 border-t border-neutral-100 space-y-1">
                                {c.topics.map((t) => (
                                  <div
                                    key={t.id}
                                    className="flex items-center justify-between text-xs py-1"
                                  >
                                    <div className="flex items-center gap-2 min-w-0">
                                      {t.is_completed ? (
                                        <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />
                                      ) : (
                                        <Clock size={13} className="text-neutral-300 shrink-0" />
                                      )}
                                      <span
                                        className={`truncate ${
                                          t.is_completed
                                            ? 'text-neutral-800 font-medium'
                                            : 'text-neutral-400'
                                        }`}
                                      >
                                        Lesson {t.order_index}: {t.title}
                                      </span>
                                    </div>
                                    <span className="text-[10px] text-neutral-400 shrink-0 ml-2">
                                      {t.is_completed ? 'Completed' : 'In Progress'}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-neutral-400 italic bg-neutral-50 p-4 rounded-xl">
                          The student has not started any courses yet.
                        </p>
                      )}
                    </div>

                    {/* Section 4: Submitted Reviews & Direct Evaluation Form */}
                    <div className="space-y-4 pt-4 border-t border-neutral-200">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
                          <MessageSquare size={16} className="text-[#EA580C]" />
                          <span>Review Requests from Student</span>
                        </h3>
                        <span className="text-xs font-bold text-neutral-500">
                          {studentDetails?.reviews.length || 0} reviews
                        </span>
                      </div>

                      {studentDetails?.reviews && studentDetails.reviews.length > 0 ? (
                        <div className="space-y-4">
                          {studentDetails.reviews.map((rev) => {
                            const isRespondingToThis = activeReviewId === rev.id;

                            return (
                              <div
                                key={rev.id}
                                className="bg-neutral-50 rounded-2xl border border-neutral-200 p-4 space-y-3"
                              >
                                <div className="flex items-center justify-between">
                                  <div>
                                    <span className="text-xs font-bold text-neutral-900 block">
                                      {rev.course_title}
                                    </span>
                                    <span className="text-[11px] text-neutral-500">
                                      Submitted on {new Date(rev.created_at).toLocaleDateString()}
                                    </span>
                                  </div>

                                  <span
                                    className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                                      rev.status === 'APPROVED'
                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                        : 'bg-amber-50 text-amber-700 border-amber-200'
                                    }`}
                                  >
                                    {rev.status}
                                  </span>
                                </div>

                                {rev.student_notes && (
                                  <div className="bg-white p-3 rounded-xl text-xs text-neutral-700 border border-neutral-100">
                                    <span className="font-bold text-neutral-900 block mb-0.5">
                                      Student Note:
                                    </span>
                                    <p>{rev.student_notes}</p>
                                  </div>
                                )}

                                {rev.feedback && !isRespondingToThis && (
                                  <div className="bg-emerald-50/70 p-3 rounded-xl text-xs text-emerald-900 border border-emerald-200">
                                    <span className="font-bold text-emerald-800 block mb-0.5">
                                      Your Feedback:
                                    </span>
                                    <p>{rev.feedback}</p>
                                  </div>
                                )}

                                {/* Respond Form */}
                                {isRespondingToThis ? (
                                  <div className="bg-white p-4 rounded-xl border border-orange-200 space-y-3 animate-in fade-in">
                                    <label className="block text-xs font-bold text-neutral-800">
                                      Provide Tutor Evaluation & Feedback:
                                    </label>
                                    <textarea
                                      rows={3}
                                      value={tutorFeedback}
                                      onChange={(e) => setTutorFeedback(e.target.value)}
                                      placeholder="Write comprehensive feedback, suggest improvements, or approve the submission..."
                                      className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-lg text-xs text-neutral-800 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                                    />

                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-1.5">
                                        <span className="text-xs font-semibold text-neutral-600">Score:</span>
                                        {[1, 2, 3, 4, 5].map((s) => (
                                          <button
                                            key={s}
                                            type="button"
                                            onClick={() => setTutorRating(s)}
                                            className="p-0.5 hover:scale-110 transition-transform cursor-pointer"
                                          >
                                            <Star
                                              size={16}
                                              className={
                                                s <= tutorRating
                                                  ? 'fill-amber-400 text-amber-400'
                                                  : 'text-neutral-300'
                                              }
                                            />
                                          </button>
                                        ))}
                                      </div>

                                      <div className="flex items-center gap-2">
                                        <button
                                          type="button"
                                          onClick={() => setActiveReviewId(null)}
                                          className="text-xs font-medium text-neutral-500 hover:text-neutral-800"
                                        >
                                          Cancel
                                        </button>
                                        <Button
                                          variant="primary"
                                          size="sm"
                                          isLoading={isResponding}
                                          onClick={() => handleSendFeedback(rev.id)}
                                          leftIcon={<Send size={12} />}
                                        >
                                          Send Feedback & Approve
                                        </Button>
                                      </div>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="flex justify-end">
                                    <button
                                      onClick={() => {
                                        setActiveReviewId(rev.id);
                                        setTutorFeedback(rev.feedback || '');
                                        setTutorRating(rev.rating_given || 5);
                                      }}
                                      className="text-xs font-bold text-[#EA580C] hover:underline cursor-pointer"
                                    >
                                      {rev.feedback ? 'Update Feedback' : 'Evaluate & Give Feedback →'}
                                    </button>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-xs text-neutral-400 italic bg-neutral-50 p-4 rounded-xl">
                          No review requests pending from this student.
                        </p>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default TutorStudentsScreen;
