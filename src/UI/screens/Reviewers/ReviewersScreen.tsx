import React, { useState, useEffect } from 'react';
import {
  UserCheck,
  Star,
  BookOpen,
  Award,
  Send,
  CheckCircle2,
  Clock,
  Sparkles,
  AlertCircle,
  GraduationCap,
  Briefcase,
  MessageSquare
} from 'lucide-react';
import { AppLayout } from '../../reusables/feature/Navigation/AppLayout';
import { Button } from '../../reusables/base/Button/Button';
import { reviewerService } from '../../../services/ReviewerService/reviewerService';
import { courseService } from '../../../services/CourseService/courseService';
import type { TutorReviewer, ReviewSubmission } from '../../../types/reviewerTypes';
import type { Course } from '../../../types/courseTypes';

export const ReviewersScreen: React.FC = () => {
  const [tutors, setTutors] = useState<TutorReviewer[]>([]);
  const [reviews, setReviews] = useState<ReviewSubmission[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'reviewers' | 'submissions'>('reviewers');
  const [assigningId, setAssigningId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Review submission modal state
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [selectedTutor, setSelectedTutor] = useState<TutorReviewer | null>(null);
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [studentNotes, setStudentNotes] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [tutorList, submissionList, coursesRes] = await Promise.all([
        reviewerService.getTutors(),
        reviewerService.getStudentReviews(),
        courseService.getCourses({ filter: 'all' })
      ]);
      setTutors(tutorList);
      setReviews(submissionList);
      setCourses(coursesRes.courses);
    } catch (err) {
      console.error('Failed to load reviewers data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAssignPrimary = async (tutor: TutorReviewer) => {
    setAssigningId(tutor.id);
    try {
      await reviewerService.assignPrimaryReviewer(tutor.id);
      setToast({
        message: `${tutor.name} has been assigned as your Primary Reviewer!`,
        type: 'success'
      });
      // Refresh list
      const updated = await reviewerService.getTutors();
      setTutors(updated);
    } catch (err: any) {
      setToast({
        message: err.message || 'Failed to assign primary reviewer',
        type: 'error'
      });
    } finally {
      setAssigningId(null);
      setTimeout(() => setToast(null), 4000);
    }
  };

  const openSubmitModal = (tutor?: TutorReviewer) => {
    setSelectedTutor(tutor || tutors.find((t) => t.is_primary) || tutors[0] || null);
    if (courses.length > 0 && !selectedCourseId) {
      setSelectedCourseId(courses[0].id);
    }
    setIsSubmitModalOpen(true);
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourseId) {
      setToast({ message: 'Please select a course to review', type: 'error' });
      return;
    }

    setIsSubmittingReview(true);
    try {
      await reviewerService.submitReview({
        tutorId: selectedTutor?.id,
        courseId: selectedCourseId,
        type: 'COURSE',
        studentNotes: studentNotes.trim()
      });

      setToast({
        message: 'Review request submitted successfully to tutor!',
        type: 'success'
      });
      setIsSubmitModalOpen(false);
      setStudentNotes('');

      // Refresh submissions
      const updatedReviews = await reviewerService.getStudentReviews();
      setReviews(updatedReviews);
      setActiveTab('submissions');
    } catch (err: any) {
      setToast({
        message: err.message || 'Failed to submit review request',
        type: 'error'
      });
    } finally {
      setIsSubmittingReview(false);
      setTimeout(() => setToast(null), 4000);
    }
  };

  const primaryReviewer = tutors.find((t) => t.is_primary);

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

        {/* Hero Section */}
        <div className="relative overflow-hidden bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-950 text-white rounded-3xl p-6 sm:p-8 lg:p-10 shadow-xl border border-neutral-800">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/20 border border-orange-500/30 text-orange-400 text-xs font-semibold">
                <Sparkles size={14} />
                <span>Mentorship & Code Review</span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white">
                Expert Reviewers & Tutors
              </h1>
              <p className="text-sm text-neutral-300 leading-relaxed">
                Assign your <span className="text-orange-400 font-semibold">Primary Reviewer</span> to get expert 1-on-1 feedback on your completed lessons, code tasks, and projects.
              </p>
            </div>

            {/* Quick Status Pill */}
            <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-4 sm:p-5 flex flex-col gap-2 shrink-0 md:min-w-[240px]">
              <span className="text-xs text-neutral-400 uppercase tracking-wider font-semibold">
                Primary Reviewer
              </span>
              {primaryReviewer ? (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-orange-500 to-amber-500 text-white font-bold flex items-center justify-center text-sm shadow-sm">
                    {primaryReviewer.avatar_url ? (
                      <img
                        src={primaryReviewer.avatar_url}
                        alt={primaryReviewer.name}
                        className="w-full h-full object-cover rounded-xl"
                      />
                    ) : (
                      primaryReviewer.name.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white flex items-center gap-1.5">
                      {primaryReviewer.name}
                      <CheckCircle2 size={14} className="text-emerald-400" />
                    </p>
                    <p className="text-xs text-neutral-400">Assigned Mentor</p>
                  </div>
                </div>
              ) : (
                <div>
                  <p className="text-sm font-medium text-neutral-300">None assigned yet</p>
                  <p className="text-xs text-orange-400">Select a tutor below to assign</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-neutral-200">
          <button
            onClick={() => setActiveTab('reviewers')}
            className={`pb-3 px-4 text-sm font-bold transition-all relative cursor-pointer ${
              activeTab === 'reviewers'
                ? 'text-[#EA580C]'
                : 'text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <div className="flex items-center gap-2">
              <UserCheck size={16} />
              <span>All Tutors & Reviewers ({tutors.length})</span>
            </div>
            {activeTab === 'reviewers' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#EA580C] rounded-full" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('submissions')}
            className={`pb-3 px-4 text-sm font-bold transition-all relative cursor-pointer ${
              activeTab === 'submissions'
                ? 'text-[#EA580C]'
                : 'text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <div className="flex items-center gap-2">
              <MessageSquare size={16} />
              <span>My Review Submissions ({reviews.length})</span>
            </div>
            {activeTab === 'submissions' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#EA580C] rounded-full" />
            )}
          </button>
        </div>

        {/* TAB 1: ALL REVIEWERS */}
        {activeTab === 'reviewers' && (
          <div className="space-y-6">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="bg-white rounded-2xl border border-neutral-200 p-6 animate-pulse space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-neutral-200" />
                      <div className="space-y-2 flex-1">
                        <div className="h-4 bg-neutral-200 rounded w-3/4" />
                        <div className="h-3 bg-neutral-100 rounded w-1/2" />
                      </div>
                    </div>
                    <div className="h-16 bg-neutral-100 rounded-xl" />
                    <div className="h-10 bg-neutral-200 rounded-xl" />
                  </div>
                ))}
              </div>
            ) : tutors.length === 0 ? (
              <div className="bg-white rounded-2xl border border-neutral-200 p-12 text-center max-w-md mx-auto">
                <div className="w-12 h-12 rounded-2xl bg-orange-100 text-[#EA580C] flex items-center justify-center mx-auto mb-3">
                  <UserCheck size={24} />
                </div>
                <h3 className="text-base font-bold text-neutral-900 mb-1">No Tutors Registered Yet</h3>
                <p className="text-xs text-neutral-500">
                  New authorized tutors will appear here once verified on the platform.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tutors.map((tutor) => {
                  const isPrimary = tutor.is_primary;
                  const isBusy = assigningId === tutor.id;

                  return (
                    <div
                      key={tutor.id}
                      className={`bg-white rounded-3xl border transition-all duration-300 flex flex-col justify-between overflow-hidden shadow-xs hover:shadow-md ${
                        isPrimary
                          ? 'border-orange-500 ring-2 ring-orange-500/20 shadow-orange-500/5'
                          : 'border-neutral-200 hover:border-neutral-300'
                      }`}
                    >
                      {/* Top Accent Banner for Primary Reviewer */}
                      {isPrimary && (
                        <div className="bg-gradient-to-r from-[#EA580C] to-amber-500 text-white text-[11px] font-bold px-5 py-1.5 flex items-center justify-between tracking-wide shrink-0">
                          <span className="flex items-center gap-1.5">
                            <CheckCircle2 size={13} className="text-white shrink-0" />
                            <span>PRIMARY REVIEWER</span>
                          </span>
                          <span className="text-[10px] font-semibold bg-white/20 backdrop-blur-xs px-2 py-0.5 rounded-full uppercase tracking-wider">
                            Assigned
                          </span>
                        </div>
                      )}

                      {/* Card Header & Avatar */}
                      <div className="p-6 space-y-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3.5 min-w-0 flex-1">
                            <div className="relative shrink-0">
                              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-neutral-800 to-neutral-700 text-white font-black text-lg flex items-center justify-center shadow-sm overflow-hidden shrink-0">
                                {tutor.avatar_url ? (
                                  <img
                                    src={tutor.avatar_url}
                                    alt={tutor.name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  tutor.name.charAt(0).toUpperCase()
                                )}
                              </div>
                              <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white" title="Online & Ready for Review" />
                            </div>

                            <div className="min-w-0 flex-1">
                              <h3 className="text-base font-bold text-neutral-900 leading-tight truncate">
                                {tutor.name}
                              </h3>
                              <p className="text-xs text-neutral-500 mt-0.5 truncate">
                                {tutor.email}
                              </p>
                              <div className="flex items-center gap-1 text-amber-500 mt-1">
                                <Star size={13} className="fill-amber-400 text-amber-400 shrink-0" />
                                <span className="text-xs font-bold text-neutral-800">{tutor.rating}</span>
                                <span className="text-[11px] text-neutral-400 font-medium truncate">· Top Mentor</span>
                              </div>
                            </div>
                          </div>

                          {isPrimary && (
                            <span className="shrink-0 text-[11px] font-bold text-orange-700 bg-orange-50 border border-orange-200 px-2.5 py-1 rounded-full flex items-center gap-1 shadow-2xs whitespace-nowrap">
                              <CheckCircle2 size={12} className="text-[#EA580C] shrink-0" />
                              <span>Primary</span>
                            </span>
                          )}
                        </div>

                        {/* Education / Work Bio if present */}
                        <div className="bg-neutral-50 rounded-2xl p-3 text-xs text-neutral-600 space-y-1.5 border border-neutral-100">
                          <div className="flex items-center gap-2 text-neutral-700">
                            <GraduationCap size={13} className="text-[#EA580C] shrink-0" />
                            <span className="truncate">
                              {tutor.education?.degree
                                ? `${tutor.education.degree} (${tutor.education.institution || 'University'})`
                                : 'Verified Academic Instructor'}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-neutral-700">
                            <Briefcase size={13} className="text-neutral-500 shrink-0" />
                            <span className="truncate">
                              {tutor.work?.jobTitle
                                ? `${tutor.work.jobTitle} at ${tutor.work.company || 'Enterprise'}`
                                : 'Platform Senior Curriculum Reviewer'}
                            </span>
                          </div>
                        </div>

                        {/* Created Courses */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold uppercase tracking-wider text-neutral-500 flex items-center gap-1">
                              <BookOpen size={12} className="text-[#EA580C]" />
                              <span>Created Courses ({tutor.created_courses.length})</span>
                            </span>
                          </div>

                          {tutor.created_courses.length > 0 ? (
                            <div className="flex flex-wrap gap-1.5">
                              {tutor.created_courses.map((c) => (
                                <span
                                  key={c.id}
                                  className="text-[11px] font-medium bg-neutral-100 text-neutral-700 px-2.5 py-1 rounded-lg border border-neutral-200 truncate max-w-full"
                                  title={c.title}
                                >
                                  {c.title}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <p className="text-[11px] text-neutral-400 italic">
                              General Curriculum Mentor & Reviewer
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Card Action Footer */}
                      <div className="p-4 bg-neutral-50/80 border-t border-neutral-100 flex items-center gap-2.5">
                        <Button
                          variant={isPrimary ? 'secondary' : 'primary'}
                          size="sm"
                          isLoading={isBusy}
                          onClick={() => handleAssignPrimary(tutor)}
                          className={`flex-1 text-xs font-bold ${
                            isPrimary ? 'bg-orange-50 text-[#EA580C] border-orange-200 hover:bg-orange-100' : ''
                          }`}
                        >
                          {isPrimary ? 'Primary Reviewer ✓' : 'Assign as Primary Reviewer'}
                        </Button>

                        <button
                          onClick={() => openSubmitModal(tutor)}
                          className="px-3 py-2 rounded-xl bg-white border border-neutral-200 text-neutral-700 hover:text-neutral-900 hover:border-neutral-300 text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
                          title="Submit a lesson or course review to this tutor"
                        >
                          <Send size={13} className="text-[#EA580C]" />
                          <span>Review</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: MY REVIEW SUBMISSIONS */}
        {activeTab === 'submissions' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-neutral-900">Your Submitted Reviews</h2>
                <p className="text-xs text-neutral-500">
                  Track the evaluation status and tutor feedback for your completed course materials.
                </p>
              </div>

              <Button
                variant="primary"
                size="sm"
                onClick={() => openSubmitModal()}
                leftIcon={<Send size={14} />}
              >
                Submit New Review
              </Button>
            </div>

            {reviews.length === 0 ? (
              <div className="bg-white rounded-3xl border border-neutral-200 p-12 text-center max-w-md mx-auto space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-orange-100 text-[#EA580C] flex items-center justify-center mx-auto">
                  <Award size={24} />
                </div>
                <h3 className="text-base font-bold text-neutral-900">No Review Submissions Yet</h3>
                <p className="text-xs text-neutral-500">
                  Once you complete lessons in your courses, you can submit them to your primary reviewer for in-depth feedback!
                </p>
                <div className="pt-2">
                  <Button variant="primary" size="sm" onClick={() => openSubmitModal()}>
                    Submit for Review
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {reviews.map((rev) => {
                  const isApproved = rev.status === 'APPROVED';
                  const isReviewed = rev.status === 'REVIEWED';

                  return (
                    <div
                      key={rev.id}
                      className="bg-white rounded-2xl border border-neutral-200 p-5 sm:p-6 shadow-2xs space-y-4 transition-all hover:border-neutral-300"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-100">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-orange-50 text-[#EA580C] flex items-center justify-center font-bold text-sm shrink-0">
                            <BookOpen size={18} />
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-neutral-900">
                              {rev.course_title || 'Course Review'}
                            </h4>
                            <p className="text-xs text-neutral-500">
                              Reviewer: <span className="font-semibold text-neutral-800">{rev.tutor_name || 'Primary Reviewer'}</span> · Submitted {new Date(rev.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>

                        <div>
                          {isApproved ? (
                            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                              <CheckCircle2 size={13} />
                              <span>Approved & Passed</span>
                            </span>
                          ) : isReviewed ? (
                            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                              <CheckCircle2 size={13} />
                              <span>Reviewed with Feedback</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                              <Clock size={13} />
                              <span>Pending Tutor Review</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Student Notes */}
                      {rev.student_notes && (
                        <div className="bg-neutral-50 rounded-xl p-3 text-xs text-neutral-700">
                          <span className="font-bold text-neutral-800 block mb-0.5">Your Submission Notes:</span>
                          <p>{rev.student_notes}</p>
                        </div>
                      )}

                      {/* Tutor Feedback */}
                      {rev.feedback ? (
                        <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-4 text-xs sm:text-sm text-emerald-900 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-emerald-800 flex items-center gap-1.5">
                              <Sparkles size={14} className="text-emerald-600" />
                              <span>Tutor Feedback:</span>
                            </span>
                            {rev.rating_given && (
                              <div className="flex items-center gap-1 font-bold text-amber-600">
                                <Star size={13} className="fill-amber-400 text-amber-400" />
                                <span>{rev.rating_given}/5</span>
                              </div>
                            )}
                          </div>
                          <p className="text-xs leading-relaxed text-emerald-950 mt-1">{rev.feedback}</p>
                        </div>
                      ) : (
                        <p className="text-xs text-neutral-400 italic">
                          Awaiting reviewer evaluation. You will receive detailed notes once the tutor marks this lesson.
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Modal: Submit for Review */}
        {isSubmitModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/50 backdrop-blur-xs animate-in fade-in">
            <div className="bg-white rounded-3xl border border-neutral-200 max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-xl relative animate-in zoom-in-95">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-orange-100 text-[#EA580C] flex items-center justify-center font-bold">
                    <Send size={18} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-neutral-900">Submit for Tutor Review</h3>
                    <p className="text-xs text-neutral-500">
                      Send your progress to your mentor for personalized review
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsSubmitModalOpen(false)}
                  className="p-1.5 text-neutral-400 hover:text-neutral-700 rounded-lg hover:bg-neutral-100 transition-colors"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmitReview} className="space-y-4">
                {/* Target Reviewer */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                    Target Reviewer
                  </label>
                  <select
                    value={selectedTutor?.id || ''}
                    onChange={(e) => {
                      const found = tutors.find((t) => t.id === e.target.value);
                      if (found) setSelectedTutor(found);
                    }}
                    className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-xs sm:text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-[#EA580C]"
                  >
                    {tutors.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} {t.is_primary ? '(Primary Reviewer)' : ''}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Course to Review */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                    Select Course
                  </label>
                  <select
                    value={selectedCourseId}
                    onChange={(e) => setSelectedCourseId(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-xs sm:text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-[#EA580C]"
                  >
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.title}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Student Notes */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                    Notes & Questions for Tutor (Optional)
                  </label>
                  <textarea
                    rows={4}
                    value={studentNotes}
                    onChange={(e) => setStudentNotes(e.target.value)}
                    placeholder="Describe any particular challenges, code implementations, or specific questions you'd like feedback on..."
                    className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-xs sm:text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-[#EA580C]"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-3">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => setIsSubmitModalOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    isLoading={isSubmittingReview}
                    leftIcon={<Send size={14} />}
                  >
                    Send to Reviewer
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default ReviewersScreen;
