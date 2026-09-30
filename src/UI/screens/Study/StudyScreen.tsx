import React, { useState } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  BookOpen,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  HelpCircle,
  Copy,
  Check,
  Award,
  Layers,
  Lightbulb,
  Send,
  X
} from 'lucide-react';
import { useStudyViewModel } from './study.vm';
import { Button } from '../../reusables/base/Button/Button';

export const StudyScreen: React.FC = () => {
  const {
    course,
    topics,
    stats,
    currentTopic,
    activeTopicIndex,
    isLoading,
    isCompleting,
    isSidebarOpen,
    toast,
    setToast,

    // Multi-question properties
    questionsList,
    currentQuestion,
    activeQuestionIndex,
    selectedOption,
    isAnswerChecked,
    isAnswerCorrect,
    isAllQuestionsCorrect,
    handleSelectOption,
    goToQuestion,
    handleCompleteTopic,

    // Review submission properties
    primaryReviewer,
    isReviewModalOpen,
    reviewType,
    isSubmittingReview,
    openReviewModal,
    closeReviewModal,
    submitReviewToMentor,

    goToTopic,
    goToNext,
    goToPrev,
    toggleSidebar,
    navigateBackToCourses
  } = useStudyViewModel();

  const [copiedCode, setCopiedCode] = useState(false);
  const [reviewNotes, setReviewNotes] = useState('');

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-orange-100 text-[#EA580C] flex items-center justify-center mx-auto animate-pulse">
            <BookOpen size={24} />
          </div>
          <p className="text-sm font-semibold text-neutral-700">Loading course curriculum...</p>
        </div>
      </div>
    );
  }

  if (!course || !currentTopic) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl border border-neutral-200 p-8 text-center max-w-md shadow-sm">
          <h2 className="text-lg font-bold text-neutral-900 mb-2">Course or Topic Not Found</h2>
          <p className="text-xs text-neutral-500 mb-5">
            Unable to load the requested course content. Please return to the course catalog.
          </p>
          <Button variant="primary" size="sm" onClick={navigateBackToCourses}>
            Back to Courses
          </Button>
        </div>
      </div>
    );
  }

  const isLastTopic = activeTopicIndex === topics.length - 1;
  const isFirstTopic = activeTopicIndex === 0;

  return (
    <div className="h-screen overflow-hidden bg-[#FAFAFA] flex flex-col">
      {/* Top Navbar */}
      <header className="h-16 shrink-0 bg-white/95 backdrop-blur-xs border-b border-neutral-200 px-4 sm:px-6 flex items-center justify-between z-30">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={navigateBackToCourses}
            className="p-2 -ml-2 rounded-xl text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 transition-colors cursor-pointer"
            title="Back to Courses"
            aria-label="Back to Courses"
          >
            <ArrowLeft size={18} />
          </button>

          {/* Toggle Curriculum Sidebar - Strictly using Chevron icons */}
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-xl text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 transition-colors cursor-pointer flex items-center justify-center"
            title={isSidebarOpen ? 'Collapse Curriculum Sidebar' : 'Expand Curriculum Sidebar'}
            aria-label="Toggle Curriculum Sidebar"
          >
            {isSidebarOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
          </button>

          <div className="h-5 w-px bg-neutral-200 mx-1 hidden sm:block" />

          <div className="min-w-0">
            <span className="text-[11px] font-bold text-[#EA580C] uppercase tracking-wider block truncate">
              {course.title}
            </span>
            <span className="text-xs text-neutral-500 truncate block">
              Lesson {activeTopicIndex + 1} of {topics.length}: {currentTopic.title}
            </span>
          </div>
        </div>

        {/* Course Progress Indicator */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-xs font-bold text-neutral-800">
              {stats?.progressPercent || 0}% Completed
            </span>
            <span className="text-[10px] text-neutral-400 font-medium">
              {stats?.completedCount || 0} of {stats?.totalTopics || topics.length} lessons
            </span>
          </div>

          <div className="w-24 sm:w-28 h-2.5 bg-neutral-100 rounded-full overflow-hidden border border-neutral-200">
            <div
              className="h-full bg-gradient-to-r from-orange-500 to-amber-500 rounded-full transition-all duration-500"
              style={{ width: `${stats?.progressPercent || 0}%` }}
            />
          </div>

          {stats?.isCompleted && (
            <span className="hidden md:inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              <Award size={13} />
              <span>Mastered</span>
            </span>
          )}
        </div>
      </header>

      {/* Main Container with Left Sidebar & Topic Content */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* Left Curriculum Sidebar (Independent scroller) */}
        {isSidebarOpen && (
          <aside className="w-72 sm:w-80 shrink-0 bg-white border-r border-neutral-200 flex flex-col h-full overflow-y-auto">
            {/* Sidebar Header */}
            <div className="p-4 border-b border-neutral-100 bg-neutral-50/50 sticky top-0 z-10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-600 flex items-center gap-1.5">
                  <Layers size={14} className="text-[#EA580C]" />
                  <span>Course Curriculum</span>
                </span>
                <span className="text-xs font-semibold text-neutral-500">
                  {stats?.completedCount || 0}/{topics.length} Done
                </span>
              </div>

              <div className="w-full h-1.5 bg-neutral-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#EA580C] rounded-full transition-all duration-300"
                  style={{ width: `${stats?.progressPercent || 0}%` }}
                />
              </div>
            </div>

            {/* Topics List */}
            <div className="p-3 space-y-1.5 flex-1">
              {topics.map((t, index) => {
                const isActive = index === activeTopicIndex;
                const isCompleted = t.is_completed;

                return (
                  <button
                    key={t.id}
                    onClick={() => goToTopic(index)}
                    className={`w-full flex items-start gap-3 p-3 rounded-xl text-left transition-all cursor-pointer ${
                      isActive
                        ? 'bg-orange-50 border border-orange-200 shadow-xs'
                        : 'hover:bg-neutral-50 border border-transparent'
                    }`}
                  >
                    <div className="shrink-0 mt-0.5">
                      {isCompleted ? (
                        <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                          <CheckCircle2 size={15} />
                        </div>
                      ) : (
                        <div
                          className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                            isActive
                              ? 'bg-[#F97316] text-white'
                              : 'bg-neutral-200 text-neutral-600'
                          }`}
                        >
                          {index + 1}
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p
                        className={`text-xs font-bold leading-snug truncate ${
                          isActive ? 'text-[#EA580C]' : 'text-neutral-800'
                        }`}
                      >
                        {t.title}
                      </p>
                      <p className="text-[11px] text-neutral-500 line-clamp-1 mt-0.5">
                        {t.description}
                      </p>
                    </div>

                    {isActive && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#EA580C] shrink-0 mt-2" />
                    )}
                  </button>
                );
              })}
            </div>
          </aside>
        )}

        {/* Main Content Area (Independent scroller) */}
        <main className="flex-1 h-full overflow-y-auto min-w-0">
          <div className="p-4 sm:p-8 lg:p-10 max-w-4xl mx-auto space-y-8">
            {/* Toast Notification */}
            {toast && (
              <div
                className={`p-4 rounded-xl border flex items-center justify-between text-xs sm:text-sm font-semibold shadow-xs animate-in fade-in slide-in-from-top-2 duration-200 ${
                  toast.type === 'success'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-rose-50 border-rose-200 text-rose-800'
                }`}
              >
              <span>{toast.message}</span>
              <button onClick={() => setToast(null)} className="p-1 hover:bg-black/5 rounded">
                <X size={14} />
              </button>
            </div>
          )}

          {/* Mastered Celebration Banner if all completed */}
          {stats?.isCompleted && (
            <div className="p-5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-2xl shadow-sm flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                  <Award size={22} className="text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">Course Mastered! (100% Complete)</h3>
                  <p className="text-xs text-emerald-100">
                    You have finished every lesson and passed all comprehension questions for {course.title}.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Lesson Header */}
          <div className="space-y-3 pb-6 border-b border-neutral-200">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-orange-100 text-[#EA580C]">
                <BookOpen size={12} />
                <span>Lesson {activeTopicIndex + 1} of {topics.length}</span>
              </span>

              {currentTopic.is_completed && (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700">
                  <CheckCircle2 size={12} />
                  <span>Lesson Completed</span>
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-neutral-900 tracking-tight">
              {currentTopic.title}
            </h1>

            <p className="text-sm text-neutral-600 leading-relaxed max-w-3xl">
              {currentTopic.description}
            </p>
          </div>

          {/* Concept Illustration / Example Image */}
          {currentTopic.image_url && (
            <div className="rounded-2xl overflow-hidden border border-neutral-200/90 shadow-xs aspect-video max-h-72 w-full bg-neutral-100">
              <img
                src={currentTopic.image_url}
                alt={currentTopic.title}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
          )}

          {/* In-Depth Explanation & Reading */}
          <section className="bg-white rounded-2xl border border-neutral-200 p-6 sm:p-8 space-y-4 shadow-xs">
            <h2 className="text-base font-bold text-neutral-900 flex items-center gap-2">
              <Sparkles size={16} className="text-[#EA580C]" />
              <span>Detailed Explanation & Principles</span>
            </h2>

            <div className="text-sm text-neutral-700 leading-relaxed whitespace-pre-line space-y-3">
              {currentTopic.explanation}
            </div>

            {/* Key Takeaways */}
            {currentTopic.key_takeaways && currentTopic.key_takeaways.length > 0 && (
              <div className="p-4 bg-orange-50/70 border border-orange-200/80 rounded-xl space-y-2 mt-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#EA580C] flex items-center gap-1.5">
                  <Lightbulb size={14} />
                  <span>Key Takeaways</span>
                </h4>
                <ul className="space-y-1.5 text-xs text-neutral-700">
                  {currentTopic.key_takeaways.map((point, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-[#EA580C] font-bold">•</span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>

          {/* Interactive Code Example & Live Sample */}
          {currentTopic.code_example && (
            <section className="bg-neutral-900 text-neutral-100 rounded-2xl overflow-hidden border border-neutral-800 shadow-md">
              <div className="px-5 py-3 bg-neutral-950 border-b border-neutral-800 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-mono text-neutral-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span className="ml-2 uppercase">{currentTopic.code_language || 'code'} Sample</span>
                </div>

                <button
                  onClick={() => copyCode(currentTopic.code_example || '')}
                  className="inline-flex items-center gap-1 text-xs text-neutral-400 hover:text-white px-2.5 py-1 rounded bg-neutral-800 hover:bg-neutral-700 transition-colors cursor-pointer"
                >
                  {copiedCode ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                  <span>{copiedCode ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              <pre className="p-5 font-mono text-xs sm:text-[13px] overflow-x-auto text-amber-200 leading-relaxed">
                <code>{currentTopic.code_example}</code>
              </pre>
            </section>
          )}

          {/* Topic Question & Knowledge Check (Required to Complete Lesson) */}
          <section className="bg-white rounded-2xl border-2 border-orange-200/90 p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-neutral-100 gap-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-orange-100 text-[#EA580C] flex items-center justify-center">
                  <HelpCircle size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-neutral-900">
                    Topic Knowledge Check {questionsList.length > 1 && `(${activeQuestionIndex + 1}/${questionsList.length})`}
                  </h3>
                  <p className="text-xs text-neutral-500">
                    {questionsList.length > 1
                      ? 'Answer all questions correctly to unlock lesson completion'
                      : 'Answer correctly to enable the "Lesson Completed" button'}
                  </p>
                </div>
              </div>

              {/* Multi-question stepper pills */}
              {questionsList.length > 1 ? (
                <div className="flex items-center gap-1.5 self-start sm:self-auto">
                  {questionsList.map((_, qIdx) => {
                    const isActive = qIdx === activeQuestionIndex;
                    return (
                      <button
                        key={qIdx}
                        type="button"
                        onClick={() => goToQuestion(qIdx)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          isActive
                            ? 'bg-[#EA580C] text-white shadow-xs'
                            : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                        }`}
                      >
                        Q{qIdx + 1}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <span className="text-[11px] font-semibold text-[#EA580C] bg-orange-50 px-2.5 py-0.5 rounded-full border border-orange-200">
                  Required
                </span>
              )}
            </div>

            {/* Question Text */}
            {currentQuestion && (
              <>
                <p className="text-sm sm:text-base font-bold text-neutral-900 leading-snug">
                  {currentQuestion.question_text}
                </p>

                {/* Options */}
                <div className="space-y-3">
                  {currentQuestion.question_options.map((option, optIdx) => {
                    const isSelected = selectedOption === optIdx;
                    const isCorrectOption = optIdx === currentQuestion.correct_option_index;

                    let optionStyles = 'border-neutral-200 hover:border-orange-300 hover:bg-neutral-50 text-neutral-800';

                    if (isSelected) {
                      if (isAnswerCorrect) {
                        optionStyles = 'border-emerald-500 bg-emerald-50/70 text-emerald-900 font-semibold ring-2 ring-emerald-500/20';
                      } else {
                        optionStyles = 'border-rose-500 bg-rose-50/70 text-rose-900 font-semibold ring-2 ring-rose-500/20';
                      }
                    } else if (isAnswerChecked && isCorrectOption) {
                      optionStyles = 'border-emerald-400 bg-emerald-50/40 text-emerald-800';
                    }

                    return (
                      <button
                        key={optIdx}
                        onClick={() => handleSelectOption(optIdx)}
                        className={`w-full flex items-center justify-between p-3.5 sm:p-4 rounded-xl border text-left text-xs sm:text-sm transition-all cursor-pointer ${optionStyles}`}
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                              isSelected
                                ? isAnswerCorrect
                                  ? 'bg-emerald-600 text-white'
                                  : 'bg-rose-600 text-white'
                                : 'bg-neutral-100 text-neutral-600'
                            }`}
                          >
                            {String.fromCharCode(65 + optIdx)}
                          </span>
                          <span>{option}</span>
                        </div>

                        {isSelected && (
                          <span className="shrink-0 ml-2">
                            {isAnswerCorrect ? (
                              <CheckCircle2 size={18} className="text-emerald-600" />
                            ) : (
                              <X size={18} className="text-rose-600" />
                            )}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Multi-question stepper navigation inside card */}
                {questionsList.length > 1 && (
                  <div className="flex items-center justify-between pt-2">
                    <button
                      type="button"
                      disabled={activeQuestionIndex === 0}
                      onClick={() => goToQuestion(activeQuestionIndex - 1)}
                      className="text-xs font-bold text-neutral-500 hover:text-neutral-900 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    >
                      ← Previous Question
                    </button>

                    <span className="text-xs font-medium text-neutral-400">
                      Question {activeQuestionIndex + 1} of {questionsList.length}
                    </span>

                    <button
                      type="button"
                      disabled={activeQuestionIndex === questionsList.length - 1}
                      onClick={() => goToQuestion(activeQuestionIndex + 1)}
                      className="text-xs font-bold text-[#EA580C] hover:underline disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    >
                      Next Question →
                    </button>
                  </div>
                )}

                {/* Explanation box after answering */}
                {isAnswerChecked && (
                  <div
                    className={`p-4 rounded-xl text-xs sm:text-sm leading-relaxed animate-in fade-in duration-200 ${
                      isAnswerCorrect
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : 'bg-rose-50 text-rose-800 border border-rose-200'
                    }`}
                  >
                    <p className="font-bold mb-1">
                      {isAnswerCorrect ? '✓ Correct Answer!' : '✗ Not quite right'}
                    </p>
                    <p>{currentQuestion.question_explanation}</p>
                    {!isAnswerCorrect && (
                      <p className="mt-2 text-xs font-semibold text-rose-700">
                        Try choosing another option above to enable completion.
                      </p>
                    )}
                  </div>
                )}
              </>
            )}

            {/* Complete Lesson Action Button & Review Submission */}
            <div className="pt-4 border-t border-neutral-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="text-xs text-neutral-500">
                {!isAnswerChecked ? (
                  <span>Select an option above to check understanding.</span>
                ) : isAllQuestionsCorrect ? (
                  <span className="text-emerald-700 font-semibold flex items-center gap-1">
                    <CheckCircle2 size={13} /> All questions answered correctly! You may now complete this lesson.
                  </span>
                ) : (
                  <span className="text-rose-600 font-semibold">
                    All questions must be answered correctly to enable completion.
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                {currentTopic.is_completed && (
                  <Button
                    variant="secondary"
                    size="md"
                    onClick={() => openReviewModal('LESSON')}
                    leftIcon={<Send size={15} className="text-[#EA580C]" />}
                    className="border-orange-200 text-[#EA580C] hover:bg-orange-50 font-bold"
                  >
                    Send to Reviewer
                  </Button>
                )}

                <Button
                  variant={isAllQuestionsCorrect ? 'primary' : 'secondary'}
                  size="md"
                  disabled={!isAllQuestionsCorrect || isCompleting}
                  isLoading={isCompleting}
                  onClick={handleCompleteTopic}
                  leftIcon={<CheckCircle2 size={16} />}
                  className={
                    isAllQuestionsCorrect
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/20'
                      : 'opacity-50 cursor-not-allowed'
                  }
                >
                  {currentTopic.is_completed ? 'Lesson Completed ✓' : 'Complete Lesson'}
                </Button>
              </div>
            </div>
          </section>

          {/* Navigation Controls: Prev & Next Lesson */}
          <div className="flex items-center justify-between pt-6 border-t border-neutral-200 pb-12">
            <Button
              variant="secondary"
              size="sm"
              disabled={isFirstTopic}
              onClick={goToPrev}
              leftIcon={<ChevronLeft size={14} />}
            >
              Previous Lesson
            </Button>

            <span className="text-xs text-neutral-500">
              Lesson {activeTopicIndex + 1} of {topics.length}
            </span>

            <Button
              variant="secondary"
              size="sm"
              disabled={isLastTopic}
              onClick={goToNext}
              rightIcon={<ChevronRight size={14} />}
            >
              Next Lesson
            </Button>
          </div>
        </div>
      </main>
    </div>

    {/* Send to Reviewer Modal */}
    {isReviewModalOpen && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/50 backdrop-blur-xs animate-in fade-in">
        <div className="bg-white rounded-3xl border border-neutral-200 max-w-md w-full p-6 sm:p-8 space-y-5 shadow-2xl relative animate-in zoom-in-95">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-100 text-[#EA580C] flex items-center justify-center">
                <Send size={18} />
              </div>
              <div>
                <h3 className="text-base font-bold text-neutral-900">
                  Send {reviewType === 'LESSON' ? 'Lesson' : 'Course'} to Reviewer
                </h3>
                <p className="text-xs text-neutral-500">
                  {primaryReviewer ? `Mentor: ${primaryReviewer.name}` : 'Submit to Assigned Reviewer'}
                </p>
              </div>
            </div>
            <button
              onClick={closeReviewModal}
              className="p-1.5 text-neutral-400 hover:text-neutral-700 rounded-lg hover:bg-neutral-100"
            >
              <X size={18} />
            </button>
          </div>

          <div className="bg-neutral-50 rounded-2xl p-3.5 border border-neutral-100 text-xs text-neutral-700 space-y-1">
            <p className="font-bold text-neutral-900">{course.title}</p>
            {reviewType === 'LESSON' && currentTopic && (
              <p className="text-neutral-600">
                Lesson {activeTopicIndex + 1}: {currentTopic.title}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
              Notes or Questions for Reviewer (Optional)
            </label>
            <textarea
              rows={4}
              value={reviewNotes}
              onChange={(e) => setReviewNotes(e.target.value)}
              placeholder="e.g. Please review my answer implementation and recommend best practices..."
              className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-xs sm:text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-[#EA580C]"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button variant="secondary" size="sm" onClick={closeReviewModal}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              isLoading={isSubmittingReview}
              onClick={() => submitReviewToMentor(reviewNotes)}
              leftIcon={<Send size={14} />}
            >
              Send to Mentor
            </Button>
          </div>
        </div>
      </div>
    )}
  </div>
);
};

export default StudyScreen;
