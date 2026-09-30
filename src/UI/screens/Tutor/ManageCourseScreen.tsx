import React from 'react';
import {
  BookOpen,
  Layers,
  Plus,
  Trash2,
  Edit3,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Save,
  HelpCircle,
  Eye,
  Camera,
  X,
  Copy
} from 'lucide-react';
import { AppLayout } from '../../reusables/feature/Navigation/AppLayout';
import { Card } from '../../reusables/base/Card/Card';
import { Button } from '../../reusables/base/Button/Button';
import { Input } from '../../reusables/base/Input/Input';
import { ImageCropperModal } from '../../reusables/feature/Navigation/ImageCropperModal';
import { CATEGORIES, CODE_LANGUAGES, useManageCourseVM } from './manageCourse.vm';

export const ManageCourseScreen: React.FC = () => {
  const {
    navigate,
    course,
    topics,
    isLoading,
    toast,
    setToast,
    title,
    setTitle,
    publisher,
    setPublisher,
    description,
    setDescription,
    image,
    setImage,
    level,
    setLevel,
    duration,
    setDuration,
    category,
    setCategory,
    isSavingCourse,
    isCropperOpen,
    setIsCropperOpen,
    rawImageForCrop,
    isLessonModalOpen,
    setIsLessonModalOpen,
    editingTopicId,
    lessonForm,
    setLessonForm,
    isSavingLesson,
    deletingTopicId,
    handleFileChange,
    handleSaveCourseInfo,
    handleOpenAddLesson,
    handleOpenEditLesson,
    handleDuplicateQuestionInModal,
    handleDeleteLesson,
    handleSaveLesson
  } = useManageCourseVM();


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

        {/* Top Header & Breadcrumb */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/courses')}
              className="p-2 -ml-2 rounded-xl text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 transition-colors cursor-pointer"
              title="Back to Courses"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#EA580C]">
                Tutor Course Management
              </span>
              <h1 className="text-2xl font-black text-neutral-900 tracking-tight">
                {course ? course.title : 'Loading Course...'}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {course && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => navigate(`/courses/${course.id}/study`)}
                leftIcon={<Eye size={14} />}
              >
                View in Study Mode
              </Button>
            )}
            <Button
              variant="primary"
              size="sm"
              onClick={handleOpenAddLesson}
              leftIcon={<Plus size={14} />}
            >
              Add New Lesson
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="py-20 text-center space-y-3">
            <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-semibold text-neutral-600">Loading course curriculum...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left 5 Cols: Course Metadata Form */}
            <div className="lg:col-span-5">
              <Card>
                <div className="flex items-center gap-2 pb-3 border-b border-neutral-100 mb-4">
                  <BookOpen size={16} className="text-[#EA580C]" />
                  <h2 className="text-sm font-bold text-neutral-900">Course Metadata & Settings</h2>
                </div>

                <form onSubmit={handleSaveCourseInfo} className="space-y-4">
                  <Input
                    label="Course Title *"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />

                  <Input
                    label="Publisher / Tutor Name *"
                    value={publisher}
                    onChange={(e) => setPublisher(e.target.value)}
                    required
                  />

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-neutral-700 block mb-1">Category *</label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#EA580C]/20"
                      >
                        {CATEGORIES.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-medium text-neutral-700 block mb-1">Level *</label>
                      <select
                        value={level}
                        onChange={(e) => setLevel(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#EA580C]/20"
                      >
                        <option value="Beginner">Beginner</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Advanced">Advanced</option>
                      </select>
                    </div>
                  </div>

                  <Input
                    label="Duration (e.g. 12 Hours) *"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    required
                  />

                  {/* Thumbnail Banner with Crop */}
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-neutral-700 block">Thumbnail Image *</label>
                    <div className="flex items-center gap-3">
                      <div className="w-20 h-14 rounded-lg overflow-hidden bg-neutral-100 border border-neutral-200 shrink-0">
                        {image && <img src={image} alt="Thumbnail" className="w-full h-full object-cover" />}
                      </div>
                      <div className="flex-1 space-y-1.5">
                        <Input
                          placeholder="Image URL"
                          value={image}
                          onChange={(e) => setImage(e.target.value)}
                          required
                        />
                        <label className="px-2.5 py-1 rounded-lg border border-neutral-200 text-[11px] font-semibold text-neutral-700 hover:bg-neutral-50 inline-flex items-center gap-1.5 cursor-pointer">
                          <Camera size={12} className="text-[#EA580C]" />
                          <span>Upload & Crop</span>
                          <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-neutral-700 block">Course Description *</label>
                    <textarea
                      rows={4}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#EA580C]/20 leading-relaxed"
                      required
                    />
                  </div>

                  <div className="pt-2">
                    <Button
                      type="submit"
                      variant="primary"
                      size="sm"
                      isLoading={isSavingCourse}
                      leftIcon={<Save size={14} />}
                      fullWidth
                    >
                      Save Course Details
                    </Button>
                  </div>
                </form>
              </Card>
            </div>

            {/* Right 7 Cols: Lessons List */}
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Layers size={18} className="text-[#EA580C]" />
                  <h2 className="text-base font-bold text-neutral-900">
                    Curriculum Lessons ({topics.length})
                  </h2>
                </div>

                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleOpenAddLesson}
                  leftIcon={<Plus size={14} />}
                >
                  Add Lesson
                </Button>
              </div>

              {topics.length === 0 ? (
                <div className="bg-white rounded-xl border border-dashed border-neutral-300 p-10 text-center space-y-3">
                  <div className="w-10 h-10 rounded-lg bg-neutral-100 text-neutral-600 border border-neutral-200 flex items-center justify-center mx-auto">
                    <BookOpen size={20} />
                  </div>
                  <h3 className="text-sm font-bold text-neutral-900">No Lessons in this Course Yet</h3>
                  <p className="text-xs text-neutral-500">
                    Add lessons with comprehensive explanations and multi-question quizzes.
                  </p>
                  <Button variant="primary" size="sm" onClick={handleOpenAddLesson}>
                    Add First Lesson
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {topics.map((t, idx) => {
                    const qCount = Array.isArray(t.questions) && t.questions.length > 0 ? t.questions.length : 1;
                    const isDeleting = deletingTopicId === t.id;

                    return (
                      <div
                        key={t.id}
                        className="bg-white rounded-xl border border-neutral-200/80 p-4 sm:p-5 shadow-xs hover:border-neutral-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                      >
                        <div className="flex items-start gap-3 min-w-0">
                          <span className="w-6 h-6 rounded-md bg-neutral-100 text-neutral-700 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 border border-neutral-200">
                            {idx + 1}
                          </span>
                          <div className="min-w-0">
                            <h3 className="text-sm font-bold text-neutral-900 truncate">{t.title}</h3>
                            <p className="text-xs text-neutral-500 line-clamp-1 mt-0.5">{t.description}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-600 uppercase">
                                {t.code_language || 'Code'}
                              </span>
                              <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                {qCount} {qCount === 1 ? 'Quiz' : 'Quizzes'}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleOpenEditLesson(t)}
                            leftIcon={<Edit3 size={12} />}
                          >
                            Edit
                          </Button>
                          <button
                            type="button"
                            disabled={isDeleting}
                            onClick={() => handleDeleteLesson(t.id)}
                            className="p-1.5 text-neutral-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors disabled:opacity-50 cursor-pointer"
                            title="Delete Lesson"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Modal: Add / Edit Lesson with Multi-Questions */}
        {isLessonModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/50 backdrop-blur-xs animate-in fade-in overflow-y-auto">
            <div className="bg-white rounded-xl border border-neutral-200 max-w-3xl w-full p-6 sm:p-8 space-y-6 shadow-xl relative my-8 animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-orange-50 text-[#EA580C] border border-orange-200/60 flex items-center justify-center font-bold">
                    <Layers size={16} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-neutral-900">
                      {editingTopicId ? 'Edit Lesson & Comprehension Questions' : 'Add New Lesson to Curriculum'}
                    </h3>
                    <p className="text-xs text-neutral-500">
                      Configure comprehensive lesson material, code samples, and multiple quiz questions
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsLessonModalOpen(false)}
                  className="p-1.5 text-neutral-400 hover:text-neutral-700 rounded-lg hover:bg-neutral-100"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSaveLesson} className="space-y-5">
                <Input
                  label="Lesson Title *"
                  placeholder="e.g. Asynchronous JavaScript & Promises"
                  value={lessonForm.title}
                  onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })}
                  required
                />

                <Input
                  label="Short Summary Description *"
                  placeholder="e.g. Master Promise chaining, async/await syntax, and error catching."
                  value={lessonForm.description}
                  onChange={(e) => setLessonForm({ ...lessonForm, description: e.target.value })}
                  required
                />

                <div className="space-y-1">
                  <label className="text-xs font-medium text-neutral-700 block">
                    Detailed Concept Explanation *
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Provide in-depth conceptual breakdown, architecture patterns, and best practices..."
                    value={lessonForm.explanation}
                    onChange={(e) => setLessonForm({ ...lessonForm, explanation: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#EA580C]/20 leading-relaxed font-mono"
                    required
                  />
                </div>

                {/* Code Example & Language */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-neutral-700">Code Example *</label>
                    <select
                      value={lessonForm.code_language}
                      onChange={(e) => setLessonForm({ ...lessonForm, code_language: e.target.value })}
                      className="text-xs px-2.5 py-1 rounded-lg border border-neutral-300 bg-white"
                    >
                      {CODE_LANGUAGES.map((lang) => (
                        <option key={lang} value={lang}>
                          {lang.toUpperCase()}
                        </option>
                      ))}
                    </select>
                  </div>
                  <textarea
                    rows={5}
                    placeholder="// Enter runnable code demonstration..."
                    value={lessonForm.code_example}
                    onChange={(e) => setLessonForm({ ...lessonForm, code_example: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 bg-neutral-900 text-neutral-100 font-mono focus:outline-none focus:ring-2 focus:ring-[#EA580C]/20 leading-relaxed"
                    required
                  />
                </div>

                {/* Key Takeaways */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-neutral-700">Key Takeaways *</label>
                    <button
                      type="button"
                      onClick={() =>
                        setLessonForm({ ...lessonForm, key_takeaways: [...lessonForm.key_takeaways, ''] })
                      }
                      className="text-xs font-bold text-[#EA580C] hover:underline flex items-center gap-1"
                    >
                      <Plus size={12} /> Add Takeaway
                    </button>
                  </div>

                  {lessonForm.key_takeaways.map((k, kIdx) => (
                    <div key={kIdx} className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-orange-100 text-[#EA580C] text-[10px] font-bold flex items-center justify-center shrink-0">
                        {kIdx + 1}
                      </span>
                      <input
                        type="text"
                        value={k}
                        onChange={(e) => {
                          const updated = [...lessonForm.key_takeaways];
                          updated[kIdx] = e.target.value;
                          setLessonForm({ ...lessonForm, key_takeaways: updated });
                        }}
                        className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-neutral-300"
                        placeholder="Key learning takeaway point..."
                        required
                      />
                      {lessonForm.key_takeaways.length > 1 && (
                        <button
                          type="button"
                          onClick={() => {
                            const updated = lessonForm.key_takeaways.filter((_, idx) => idx !== kIdx);
                            setLessonForm({ ...lessonForm, key_takeaways: updated });
                          }}
                          className="p-1 text-neutral-400 hover:text-rose-600"
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {/* Interactive Multi-Quiz Section for Lesson */}
                <div className="pt-4 border-t border-neutral-200 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <HelpCircle size={16} className="text-[#EA580C]" />
                        <h4 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
                          Lesson Quizzes ({lessonForm.questions.length})
                        </h4>
                      </div>
                      <p className="text-[11px] text-neutral-500 mt-0.5">
                        Tutors can create multiple quizzes for this lesson to evaluate student comprehension.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        setLessonForm({
                          ...lessonForm,
                          questions: [
                            ...lessonForm.questions,
                            {
                              question_text: '',
                              question_options: ['', '', '', ''],
                              correct_option_index: 0,
                              question_explanation: ''
                            }
                          ]
                        })
                      }
                      className="self-start sm:self-auto px-2.5 py-1 text-xs font-bold text-[#EA580C] bg-orange-50 hover:bg-orange-100 rounded-lg border border-orange-200 flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Plus size={13} />
                      <span>Add Another Quiz</span>
                    </button>
                  </div>

                  <div className="space-y-4">
                    {lessonForm.questions.map((q, qIdx) => (
                      <div
                        key={qIdx}
                        className="bg-neutral-50 rounded-xl border border-neutral-200 p-4 sm:p-5 space-y-3"
                      >
                        <div className="flex items-center justify-between pb-2 border-b border-neutral-200">
                          <span className="text-xs font-bold text-neutral-800 flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded-full bg-[#EA580C] text-white text-[10px] font-bold">
                              Quiz #{qIdx + 1}
                            </span>
                            <span className="text-neutral-500 text-[11px]">Assessment Question</span>
                          </span>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleDuplicateQuestionInModal(qIdx)}
                              className="text-neutral-500 hover:text-neutral-800 p-1 flex items-center gap-1 text-[11px] font-semibold cursor-pointer"
                              title="Duplicate Quiz"
                            >
                              <Copy size={12} />
                              <span className="hidden sm:inline">Duplicate</span>
                            </button>

                            {lessonForm.questions.length > 1 && (
                              <button
                                type="button"
                                onClick={() => {
                                  const updated = lessonForm.questions.filter((_, idx) => idx !== qIdx);
                                  setLessonForm({ ...lessonForm, questions: updated });
                                }}
                                className="text-neutral-400 hover:text-rose-600 text-xs flex items-center gap-1 cursor-pointer"
                                title="Remove Quiz"
                              >
                                <Trash2 size={12} />
                                <span className="hidden sm:inline">Remove</span>
                              </button>
                            )}
                          </div>
                        </div>

                        <Input
                          label="Quiz Question *"
                          placeholder="e.g. Which keyword prevents reassignment of a variable?"
                          value={q.question_text}
                          onChange={(e) => {
                            const updated = [...lessonForm.questions];
                            updated[qIdx].question_text = e.target.value;
                            setLessonForm({ ...lessonForm, questions: updated });
                          }}
                          required
                        />

                        {/* Options A-D */}
                        <div className="space-y-2">
                          <label className="text-xs font-medium text-neutral-700 block">
                            Options & Correct Key *
                          </label>
                          {q.question_options.map((opt, optIdx) => {
                            const isCorrect = q.correct_option_index === optIdx;
                            const letter = String.fromCharCode(65 + optIdx);
                            return (
                              <div
                                key={optIdx}
                                className={`p-2 rounded-xl border flex items-center gap-2.5 ${
                                  isCorrect ? 'bg-emerald-50 border-emerald-300' : 'bg-white border-neutral-200'
                                }`}
                              >
                                <label className="flex items-center gap-1 cursor-pointer shrink-0">
                                  <input
                                    type="radio"
                                    name={`modal_correct_${qIdx}`}
                                    checked={isCorrect}
                                    onChange={() => {
                                      const updated = [...lessonForm.questions];
                                      updated[qIdx].correct_option_index = optIdx;
                                      setLessonForm({ ...lessonForm, questions: updated });
                                    }}
                                    className="text-emerald-600 focus:ring-emerald-500"
                                  />
                                  <span
                                    className={`w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center ${
                                      isCorrect ? 'bg-emerald-600 text-white' : 'bg-neutral-200 text-neutral-700'
                                    }`}
                                  >
                                    {letter}
                                  </span>
                                </label>
                                <input
                                  type="text"
                                  value={opt}
                                  onChange={(e) => {
                                    const updated = [...lessonForm.questions];
                                    const opts = [...updated[qIdx].question_options] as [string, string, string, string];
                                    opts[optIdx] = e.target.value;
                                    updated[qIdx].question_options = opts;
                                    setLessonForm({ ...lessonForm, questions: updated });
                                  }}
                                  className="flex-1 px-2.5 py-1 text-xs rounded-lg border border-neutral-200 bg-white"
                                  placeholder={`Option ${letter}...`}
                                  required
                                />
                                {isCorrect && (
                                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                                    Correct
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>

                        {/* Explanation */}
                        <div className="space-y-1">
                          <label className="text-xs font-medium text-neutral-700 block">
                            Answer Explanation *
                          </label>
                          <textarea
                            rows={2}
                            value={q.question_explanation}
                            onChange={(e) => {
                              const updated = [...lessonForm.questions];
                              updated[qIdx].question_explanation = e.target.value;
                              setLessonForm({ ...lessonForm, questions: updated });
                            }}
                            className="w-full px-3 py-1.5 text-xs rounded-xl border border-neutral-300 bg-white"
                            placeholder="Explain why this option is correct..."
                            required
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-neutral-200 flex items-center justify-end gap-3">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => setIsLessonModalOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    isLoading={isSavingLesson}
                    leftIcon={<Save size={14} />}
                  >
                    {editingTopicId ? 'Save Changes' : 'Add Lesson to Course'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Thumbnail Crop Modal */}
        <ImageCropperModal
          isOpen={isCropperOpen}
          imageSrc={rawImageForCrop}
          title="Crop Course Thumbnail Banner"
          aspectRatio={16 / 9}
          onClose={() => setIsCropperOpen(false)}
          onCropSave={(croppedDataUrl: string) => {
            setImage(croppedDataUrl);
            setIsCropperOpen(false);
          }}
        />
      </div>
    </AppLayout>
  );
};

export default ManageCourseScreen;
