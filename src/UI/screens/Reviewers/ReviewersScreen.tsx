import React from 'react';
import {
  UserCheck,
  Star,
  BookOpen,
  Award,
  Send,
  CheckCircle2,
  Clock,
  AlertCircle,
  GraduationCap,
  Briefcase,
  MessageSquare
} from 'lucide-react';
import { AppLayout } from '../../reusables/feature/Navigation/AppLayout';
import { Button } from '../../reusables/base/Button/Button';
import { useReviewersVM } from './reviewers.vm';

export const ReviewersScreen: React.FC = () => {
  const {
    tutors,
    reviews,
    courses,
    isLoading,
    activeTab,
    setActiveTab,
    assigningId,
    toast,
    setToast,
    isSubmitModalOpen,
    setIsSubmitModalOpen,
    selectedTutor,
    setSelectedTutor,
    selectedCourseId,
    setSelectedCourseId,
    studentNotes,
    setStudentNotes,
    isSubmittingReview,
    primaryReviewer,
    handleAssignPrimary,
    openSubmitModal,
    handleSubmitReview
  } = useReviewersVM();


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

        {/* Developer Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-200/80 pb-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900">
                Reviewers & Tutors
              </h1>
              <span className="px-2 py-0.5 text-[11px] font-medium rounded-md bg-neutral-100 text-neutral-600 border border-neutral-200">
                Code Review
              </span>
            </div>
            <p className="text-xs sm:text-sm text-neutral-500">
              Assign a primary reviewer for 1-on-1 code reviews, curriculum evaluation, and project guidance.
            </p>
          </div>

          {/* Quick Status Pill */}
          <div className="bg-white border border-neutral-200/80 rounded-xl px-4 py-2.5 flex items-center gap-3 shrink-0 shadow-xs">
            <div className="text-xs">
              <span className="text-[10px] text-neutral-400 uppercase tracking-wider font-semibold block">
                Primary Reviewer
              </span>
              {primaryReviewer ? (
                <div className="font-semibold text-neutral-900 flex items-center gap-2 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block shrink-0" />
                  <span>{primaryReviewer.name}</span>
                </div>
              ) : (
                <span className="text-neutral-500 italic mt-0.5 block">Not assigned</span>
              )}
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-neutral-200">
          <button
            onClick={() => setActiveTab('reviewers')}
            className={`pb-3 px-3 text-xs sm:text-sm font-semibold transition-all relative cursor-pointer ${
              activeTab === 'reviewers'
                ? 'text-[#EA580C]'
                : 'text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <div className="flex items-center gap-2">
              <UserCheck size={15} />
              <span>All Tutors & Reviewers ({tutors.length})</span>
            </div>
            {activeTab === 'reviewers' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#EA580C] rounded-full" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('submissions')}
            className={`pb-3 px-3 text-xs sm:text-sm font-semibold transition-all relative cursor-pointer ${
              activeTab === 'submissions'
                ? 'text-[#EA580C]'
                : 'text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <div className="flex items-center gap-2">
              <MessageSquare size={15} />
              <span>My Submissions ({reviews.length})</span>
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
              <div className="bg-white rounded-xl border border-dashed border-neutral-300 p-10 text-center max-w-md mx-auto">
                <div className="w-10 h-10 rounded-lg bg-neutral-100 text-neutral-600 flex items-center justify-center mx-auto mb-3 border border-neutral-200">
                  <UserCheck size={20} />
                </div>
                <h3 className="text-sm font-bold text-neutral-900 mb-1">No Tutors Registered Yet</h3>
                <p className="text-xs text-neutral-500">
                  New authorized tutors will appear here once verified on the platform.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {tutors.map((tutor) => {
                  const isPrimary = tutor.is_primary;
                  const isBusy = assigningId === tutor.id;

                  return (
                    <div
                      key={tutor.id}
                      className={`bg-white rounded-xl border transition-all duration-200 flex flex-col justify-between overflow-hidden shadow-xs hover:shadow-sm ${
                        isPrimary
                          ? 'border-[#EA580C]/40 ring-1 ring-orange-500/20'
                          : 'border-neutral-200/80 hover:border-neutral-300'
                      }`}
                    >
                      {/* Top Accent Banner for Primary Reviewer */}
                      {isPrimary && (
                        <div className="bg-orange-50/80 border-b border-orange-200/70 text-[#EA580C] text-[11px] font-semibold px-4 py-1.5 flex items-center justify-between tracking-wide shrink-0">
                          <span className="flex items-center gap-1.5">
                            <CheckCircle2 size={12} className="text-[#EA580C] shrink-0" />
                            <span>PRIMARY REVIEWER</span>
                          </span>
                          <span className="text-[10px] font-semibold bg-orange-100 text-orange-800 px-2 py-0.2 rounded-md uppercase tracking-wider">
                            Assigned
                          </span>
                        </div>
                      )}

                      {/* Card Header & Avatar */}
                      <div className="p-4 space-y-3.5">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <div className="relative shrink-0">
                              <div className="w-11 h-11 rounded-lg bg-neutral-900 text-white font-bold text-base flex items-center justify-center shadow-xs overflow-hidden shrink-0">
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
                              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white" title="Online & Ready for Review" />
                            </div>

                            <div className="min-w-0 flex-1">
                              <h3 className="text-sm font-semibold text-neutral-900 leading-tight truncate">
                                {tutor.name}
                              </h3>
                              <p className="text-xs text-neutral-500 mt-0.5 truncate">
                                {tutor.email}
                              </p>
                              <div className="flex items-center gap-1 text-amber-500 mt-1">
                                <Star size={12} className="fill-amber-400 text-amber-400 shrink-0" />
                                <span className="text-xs font-semibold text-neutral-800">{tutor.rating}</span>
                                <span className="text-[11px] text-neutral-400 font-normal truncate">· Top Mentor</span>
                              </div>
                            </div>
                          </div>

                          {isPrimary && (
                            <span className="shrink-0 text-[10px] font-semibold text-orange-700 bg-orange-50 border border-orange-200/80 px-2 py-0.5 rounded-md flex items-center gap-1">
                              <CheckCircle2 size={11} className="text-[#EA580C] shrink-0" />
                              <span>Primary</span>
                            </span>
                          )}
                        </div>

                        {/* Education / Work Bio if present */}
                        <div className="bg-neutral-50/80 rounded-lg p-2.5 text-xs text-neutral-600 space-y-1 border border-neutral-100">
                          <div className="flex items-center gap-2 text-neutral-700">
                            <GraduationCap size={12} className="text-[#EA580C] shrink-0" />
                            <span className="truncate">
                              {tutor.education?.degree
                                ? `${tutor.education.degree} (${tutor.education.institution || 'University'})`
                                : 'Verified Academic Instructor'}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-neutral-700">
                            <Briefcase size={12} className="text-neutral-500 shrink-0" />
                            <span className="truncate">
                              {tutor.work?.jobTitle
                                ? `${tutor.work.jobTitle} at ${tutor.work.company || 'Enterprise'}`
                                : 'Platform Senior Curriculum Reviewer'}
                            </span>
                          </div>
                        </div>

                        {/* Created Courses */}
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400 flex items-center gap-1">
                              <BookOpen size={11} className="text-[#EA580C]" />
                              <span>Created Courses ({tutor.created_courses.length})</span>
                            </span>
                          </div>

                          {tutor.created_courses.length > 0 ? (
                            <div className="flex flex-wrap gap-1.5">
                              {tutor.created_courses.map((c) => (
                                <span
                                  key={c.id}
                                  className="text-[11px] font-medium bg-neutral-100 text-neutral-700 px-2 py-0.5 rounded-md border border-neutral-200/80 truncate max-w-full"
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
                      <div className="p-3 bg-neutral-50/70 border-t border-neutral-100 flex items-center gap-2">
                        <Button
                          variant={isPrimary ? 'secondary' : 'primary'}
                          size="sm"
                          isLoading={isBusy}
                          onClick={() => handleAssignPrimary(tutor)}
                          className={`flex-1 text-xs font-semibold ${
                            isPrimary ? 'bg-orange-50 text-[#EA580C] border-orange-200 hover:bg-orange-100' : ''
                          }`}
                        >
                          {isPrimary ? 'Primary Reviewer ✓' : 'Set as Primary'}
                        </Button>

                        <button
                          onClick={() => openSubmitModal(tutor)}
                          className="px-2.5 py-1.5 rounded-lg bg-white border border-neutral-200 text-neutral-700 hover:text-neutral-900 hover:border-neutral-300 text-xs font-semibold transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
                          title="Submit a lesson or course review to this tutor"
                        >
                          <Send size={12} className="text-[#EA580C]" />
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
                <h2 className="text-base sm:text-lg font-bold text-neutral-900">Your Submitted Reviews</h2>
                <p className="text-xs text-neutral-500">
                  Track evaluation status and feedback notes for your completed course modules.
                </p>
              </div>

              <Button
                variant="primary"
                size="sm"
                onClick={() => openSubmitModal()}
                leftIcon={<Send size={13} />}
              >
                Submit Review
              </Button>
            </div>

            {reviews.length === 0 ? (
              <div className="bg-white rounded-xl border border-dashed border-neutral-300 p-10 text-center max-w-md mx-auto space-y-3">
                <div className="w-10 h-10 rounded-lg bg-neutral-100 text-neutral-600 flex items-center justify-center mx-auto border border-neutral-200">
                  <Award size={20} />
                </div>
                <h3 className="text-sm font-bold text-neutral-900">No Review Submissions Yet</h3>
                <p className="text-xs text-neutral-500">
                  Complete lessons and submit them to your primary reviewer for personalized feedback.
                </p>
                <div className="pt-2">
                  <Button variant="primary" size="sm" onClick={() => openSubmitModal()}>
                    Submit for Review
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {reviews.map((rev) => {
                  const isApproved = rev.status === 'APPROVED';
                  const isReviewed = rev.status === 'REVIEWED';

                  return (
                    <div
                      key={rev.id}
                      className="bg-white rounded-xl border border-neutral-200/80 p-4 sm:p-5 shadow-xs space-y-3 transition-all hover:border-neutral-300"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-100">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-orange-50 text-[#EA580C] flex items-center justify-center font-bold text-sm shrink-0 border border-orange-200/60">
                            <BookOpen size={16} />
                          </div>
                          <div>
                            <h4 className="text-sm font-semibold text-neutral-900">
                              {rev.course_title || 'Course Review'}
                            </h4>
                            <p className="text-xs text-neutral-500">
                              Reviewer: <span className="font-semibold text-neutral-800">{rev.tutor_name || 'Primary Reviewer'}</span> · Submitted {new Date(rev.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>

                        <div>
                          {isApproved ? (
                            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
                              <CheckCircle2 size={12} />
                              <span>Approved</span>
                            </span>
                          ) : isReviewed ? (
                            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-200">
                              <CheckCircle2 size={12} />
                              <span>Reviewed</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-md border border-amber-200">
                              <Clock size={12} />
                              <span>Pending Review</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Student Notes */}
                      {rev.student_notes && (
                        <div className="bg-neutral-50 rounded-lg p-2.5 text-xs text-neutral-700">
                          <span className="font-semibold text-neutral-800 block mb-0.5">Your Submission Notes:</span>
                          <p>{rev.student_notes}</p>
                        </div>
                      )}

                      {/* Tutor Feedback */}
                      {rev.feedback ? (
                        <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-lg p-3 text-xs text-emerald-950 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-emerald-800 flex items-center gap-1.5">
                              <span>Tutor Feedback:</span>
                            </span>
                            {rev.rating_given && (
                              <div className="flex items-center gap-1 font-semibold text-amber-600">
                                <Star size={12} className="fill-amber-400 text-amber-400" />
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
            <div className="bg-white rounded-xl border border-neutral-200 max-w-lg w-full p-6 space-y-5 shadow-xl relative animate-in zoom-in-95">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-orange-50 text-[#EA580C] flex items-center justify-center font-bold border border-orange-200/60">
                    <Send size={16} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-neutral-900">Submit for Tutor Review</h3>
                    <p className="text-xs text-neutral-500">
                      Send your progress to your mentor for personalized review
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsSubmitModalOpen(false)}
                  className="p-1 text-neutral-400 hover:text-neutral-700 rounded-md hover:bg-neutral-100 transition-colors"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmitReview} className="space-y-4">
                {/* Target Reviewer */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 mb-1.5">
                    Target Reviewer
                  </label>
                  <select
                    value={selectedTutor?.id || ''}
                    onChange={(e) => {
                      const found = tutors.find((t) => t.id === e.target.value);
                      if (found) setSelectedTutor(found);
                    }}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-lg text-xs sm:text-sm text-neutral-900 focus:outline-none focus:ring-1 focus:ring-orange-500/30 focus:border-[#EA580C]"
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
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 mb-1.5">
                    Select Course
                  </label>
                  <select
                    value={selectedCourseId}
                    onChange={(e) => setSelectedCourseId(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-lg text-xs sm:text-sm text-neutral-900 focus:outline-none focus:ring-1 focus:ring-orange-500/30 focus:border-[#EA580C]"
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
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 mb-1.5">
                    Notes & Questions for Tutor (Optional)
                  </label>
                  <textarea
                    rows={4}
                    value={studentNotes}
                    onChange={(e) => setStudentNotes(e.target.value)}
                    placeholder="Describe any particular challenges, code implementations, or specific questions you'd like feedback on..."
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-lg text-xs sm:text-sm text-neutral-900 focus:outline-none focus:ring-1 focus:ring-orange-500/30 focus:border-[#EA580C]"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2.5">
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
                    leftIcon={<Send size={13} />}
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
