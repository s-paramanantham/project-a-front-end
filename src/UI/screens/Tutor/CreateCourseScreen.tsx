import React from 'react';
import {
  BookOpen,
  Layers,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Plus,
  Trash2,
  Code2,
  HelpCircle,
  Camera,
  AlertCircle,
  Clock,
  Check,
  Copy
} from 'lucide-react';
import { AppLayout } from '../../reusables/feature/Navigation/AppLayout';
import { Card } from '../../reusables/base/Card/Card';
import { Button } from '../../reusables/base/Button/Button';
import { Input } from '../../reusables/base/Input/Input';
import { ImageCropperModal } from '../../reusables/feature/Navigation/ImageCropperModal';
import {
  CATEGORIES,
  CODE_LANGUAGES,
  DEFAULT_IMAGE_PLACEHOLDERS,
  useCreateCourseVM
} from './createCourse.vm';

export const CreateCourseScreen: React.FC = () => {
  const {
    navigate,
    currentStep,
    setCurrentStep,
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
    isCropperOpen,
    setIsCropperOpen,
    rawImageForCrop,
    setRawImageForCrop,
    lessons,
    activeLessonIndex,
    setActiveLessonIndex,
    activeLesson,
    errorMessage,
    isSubmitting,
    validateStep1,
    validateStep2,
    handleFileChange,
    handleNextToStep2,
    handleNextToStep3,
    handleAddLesson,
    handleRemoveLesson,
    updateCurrentLesson,
    handleTakeawayChange,
    handleAddTakeaway,
    handleRemoveTakeaway,
    handleAddQuestion,
    handleDuplicateQuestion,
    handleRemoveQuestion,
    handleQuestionFieldChange,
    handleQuestionOptionChange,
    handlePublishCourse
  } = useCreateCourseVM();


  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto space-y-6 pb-16">
        {/* Top Header & Breadcrumbs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/courses')}
              className="p-2 rounded-xl text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 transition-colors cursor-pointer"
              title="Back to Catalog"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#EA580C] bg-orange-50 px-2 py-0.5 rounded-full border border-orange-200">
                  Tutor Studio
                </span>
                <span className="text-xs text-neutral-400">• Step {currentStep} of 3</span>
              </div>
              <h1 className="text-2xl font-heading font-extrabold text-neutral-900 tracking-tight mt-0.5">
                Create New Technical Course
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={() => navigate('/courses')}>
              Cancel
            </Button>
            {currentStep === 1 && (
              <Button
                variant="primary"
                size="sm"
                onClick={handleNextToStep2}
                rightIcon={<ArrowRight size={14} />}
              >
                Next: Add Lessons
              </Button>
            )}
            {currentStep === 2 && (
              <Button
                variant="primary"
                size="sm"
                onClick={handleNextToStep3}
                rightIcon={<ArrowRight size={14} />}
              >
                Next: Review & Publish
              </Button>
            )}
            {currentStep === 3 && (
              <Button
                variant="primary"
                size="sm"
                onClick={handlePublishCourse}
                isLoading={isSubmitting}
                leftIcon={<Check size={14} />}
              >
                Publish Course
              </Button>
            )}
          </div>
        </div>

        {/* Wizard Steps Tabs */}
        <div className="grid grid-cols-3 gap-2 p-1.5 bg-neutral-100/80 rounded-xl border border-neutral-200/60">
          <button
            onClick={() => setCurrentStep(1)}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              currentStep === 1
                ? 'bg-white text-[#EA580C] shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <BookOpen size={15} />
            <span className="hidden sm:inline">1. Course Details</span>
            <span className="sm:hidden">1. Course</span>
          </button>

          <button
            onClick={() => {
              if (validateStep1()) setCurrentStep(2);
            }}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              currentStep === 2
                ? 'bg-white text-[#EA580C] shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <Layers size={15} />
            <span className="hidden sm:inline">2. Lessons & Quizzes ({lessons.length})</span>
            <span className="sm:hidden">2. Lessons</span>
          </button>

          <button
            onClick={() => {
              if (validateStep1() && validateStep2()) setCurrentStep(3);
            }}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              currentStep === 3
                ? 'bg-white text-[#EA580C] shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <CheckCircle2 size={15} />
            <span className="hidden sm:inline">3. Review & Publish</span>
            <span className="sm:hidden">3. Review</span>
          </button>
        </div>

        {/* Error Notification Alert */}
        {errorMessage && (
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-semibold flex items-center gap-2.5 shadow-xs animate-in fade-in duration-200">
            <AlertCircle size={16} className="text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* ================= PAGE 1: COURSE DETAILS ================= */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <Card>
              <div className="flex items-center gap-2 pb-4 border-b border-neutral-100 mb-5">
                <div className="w-8 h-8 rounded-lg bg-orange-100 text-[#EA580C] flex items-center justify-center">
                  <BookOpen size={18} />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-neutral-900">Course Fundamentals</h2>
                  <p className="text-xs text-neutral-500">Provide core metadata, category, and target audience level</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Course Title *"
                    placeholder="e.g. Master Full-Stack TypeScript & Node"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />

                  <Input
                    label="Publisher / Instructor Name *"
                    placeholder="e.g. Prof. David Miller"
                    value={publisher}
                    onChange={(e) => setPublisher(e.target.value)}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Category */}
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-neutral-700">Category *</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-200 bg-white font-medium focus:outline-none focus:ring-2 focus:ring-[#EA580C]/20"
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Level */}
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-neutral-700">Difficulty Level *</label>
                    <select
                      value={level}
                      onChange={(e) => setLevel(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-200 bg-white font-medium focus:outline-none focus:ring-2 focus:ring-[#EA580C]/20"
                    >
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                    </select>
                  </div>

                  {/* Duration */}
                  <Input
                    label="Estimated Duration *"
                    placeholder="e.g. 14 Hours"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    required
                  />
                </div>

                {/* Course Thumbnail Image */}
                <div className="space-y-2 pt-2">
                  <label className="text-xs font-medium text-neutral-700 block">
                    Course Thumbnail Banner *
                  </label>
                  <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                    <div className="w-40 h-24 rounded-xl overflow-hidden border border-neutral-200 bg-neutral-100 shrink-0">
                      <img src={image} alt="Thumbnail preview" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 space-y-2 w-full">
                      <Input
                        placeholder="Paste image URL here"
                        value={image}
                        onChange={(e) => setImage(e.target.value)}
                      />
                      <div className="flex items-center gap-2">
                        <label className="px-3 py-1.5 rounded-xl border border-neutral-200 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 flex items-center gap-1.5 cursor-pointer">
                          <Camera size={13} className="text-[#EA580C]" />
                          <span>Upload & Crop Image</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleFileChange}
                          />
                        </label>
                        <span className="text-[11px] text-neutral-400">or choose from presets below</span>
                      </div>
                    </div>
                  </div>

                  {/* Thumbnail Presets */}
                  <div className="flex items-center gap-2 pt-1 overflow-x-auto pb-1">
                    {DEFAULT_IMAGE_PLACEHOLDERS.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setImage(preset)}
                        className={`w-14 h-9 rounded-lg overflow-hidden border-2 shrink-0 transition-transform ${
                          image === preset ? 'border-[#EA580C] scale-105 shadow-xs' : 'border-transparent opacity-70 hover:opacity-100'
                        }`}
                      >
                        <img src={preset} alt={`Preset ${idx + 1}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-1 pt-2">
                  <label className="text-xs font-medium text-neutral-700">Course Description & Overview *</label>
                  <textarea
                    rows={4}
                    placeholder="Provide a thorough, compelling introduction to this course. Explain what students will learn and build."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-200 bg-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#EA580C]/20 leading-relaxed"
                    required
                  />
                </div>
              </div>

              <div className="pt-6 border-t border-neutral-100 mt-6 flex justify-end">
                <Button
                  variant="primary"
                  size="md"
                  onClick={handleNextToStep2}
                  rightIcon={<ArrowRight size={14} />}
                >
                  Continue to Lessons Builder
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* ================= PAGE 2: LESSONS & QUIZZES BUILDER ================= */}
        {currentStep === 2 && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Lesson Selector & Add Lesson */}
            <div className="lg:col-span-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-600 flex items-center gap-1.5">
                  <Layers size={14} className="text-[#EA580C]" />
                  <span>Curriculum Lessons ({lessons.length})</span>
                </span>
                <button
                  type="button"
                  onClick={handleAddLesson}
                  className="text-xs font-bold text-[#EA580C] hover:text-[#C2410C] flex items-center gap-1 cursor-pointer"
                >
                  <Plus size={14} />
                  <span>Add Lesson</span>
                </button>
              </div>

              <div className="space-y-2">
                {lessons.map((l, index) => {
                  const isActive = index === activeLessonIndex;
                  return (
                    <div
                      key={index}
                      onClick={() => setActiveLessonIndex(index)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2 ${
                        isActive
                          ? 'bg-orange-50/80 border-orange-200 shadow-xs'
                          : 'bg-white hover:bg-neutral-50 border-neutral-200/80'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span
                          className={`w-6 h-6 rounded-lg text-[11px] font-bold flex items-center justify-center shrink-0 ${
                            isActive ? 'bg-[#F97316] text-white' : 'bg-neutral-100 text-neutral-600'
                          }`}
                        >
                          {index + 1}
                        </span>
                        <div className="min-w-0">
                          <p
                            className={`text-xs font-bold truncate ${
                              isActive ? 'text-[#EA580C]' : 'text-neutral-800'
                            }`}
                          >
                            {l.title.trim() || `Lesson #${index + 1} (Untitled)`}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] text-neutral-400 truncate max-w-[130px]">
                              {l.description.trim() || 'No description yet'}
                            </span>
                            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-orange-100/80 text-[#EA580C] shrink-0">
                              {(l.questions || []).length} {(l.questions || []).length === 1 ? 'Quiz' : 'Quizzes'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {lessons.length > 1 && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveLesson(index);
                          }}
                          className="p-1 text-neutral-400 hover:text-rose-600 transition-colors"
                          title="Delete Lesson"
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>

              <Button
                variant="soft"
                size="sm"
                fullWidth
                onClick={handleAddLesson}
                leftIcon={<Plus size={14} />}
              >
                + Add Another Lesson
              </Button>
            </div>

            {/* Right Column: Active Lesson Detailed Form */}
            <div className="lg:col-span-8 space-y-5">
              <Card>
                <div className="flex items-center justify-between pb-3 border-b border-neutral-100 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-orange-100 text-[#EA580C] font-extrabold text-xs flex items-center justify-center">
                      #{activeLessonIndex + 1}
                    </span>
                    <div>
                      <h3 className="text-sm font-bold text-neutral-900">
                        Editing Lesson {activeLessonIndex + 1} of {lessons.length}
                      </h3>
                      <p className="text-[11px] text-neutral-500">Every single field is required for students</p>
                    </div>
                  </div>

                  <span className="text-xs text-neutral-400 font-mono">
                    Topic {activeLessonIndex + 1}
                  </span>
                </div>

                <div className="space-y-4">
                  {/* Lesson Title */}
                  <Input
                    label="Lesson Title *"
                    placeholder="e.g. 1. Introduction to Variables and Scope"
                    value={activeLesson.title}
                    onChange={(e) => updateCurrentLesson({ title: e.target.value })}
                    required
                  />

                  {/* Short Summary Description */}
                  <Input
                    label="Short Summary Description *"
                    placeholder="e.g. Understand let, const, and var difference in modern ES6"
                    value={activeLesson.description}
                    onChange={(e) => updateCurrentLesson({ description: e.target.value })}
                    required
                  />

                  {/* Comprehensive Explanation */}
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-neutral-700">
                      Comprehensive Lesson Explanation & Study Content *
                    </label>
                    <textarea
                      rows={5}
                      placeholder="Write thorough concept explanations, architectural context, best practices, and mental models."
                      value={activeLesson.explanation}
                      onChange={(e) => updateCurrentLesson({ explanation: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-200 bg-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#EA580C]/20 leading-relaxed font-sans"
                      required
                    />
                  </div>

                  {/* Code Example & Code Language */}
                  <div className="p-3 bg-neutral-900 rounded-xl space-y-2 border border-neutral-800">
                    <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
                      <span className="text-xs font-bold text-neutral-200 flex items-center gap-1.5">
                        <Code2 size={14} className="text-[#F97316]" />
                        <span>Practical Code Example *</span>
                      </span>

                      <select
                        value={activeLesson.code_language}
                        onChange={(e) => updateCurrentLesson({ code_language: e.target.value })}
                        className="px-2.5 py-1 text-[11px] rounded-lg bg-neutral-800 text-neutral-200 border border-neutral-700 focus:outline-none"
                      >
                        {CODE_LANGUAGES.map((lang) => (
                          <option key={lang} value={lang}>
                            {lang.toUpperCase()}
                          </option>
                        ))}
                      </select>
                    </div>

                    <textarea
                      rows={4}
                      placeholder="// Insert working code example snippet here..."
                      value={activeLesson.code_example}
                      onChange={(e) => updateCurrentLesson({ code_example: e.target.value })}
                      className="w-full p-2 text-xs font-mono text-emerald-400 bg-black/40 rounded-xl border border-neutral-800 focus:outline-none focus:border-orange-500"
                      required
                    />
                  </div>

                  {/* Key Takeaways */}
                  <div className="space-y-2 pt-1">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-medium text-neutral-700">
                        Key Takeaways (Minimum 1) *
                      </label>
                      <button
                        type="button"
                        onClick={handleAddTakeaway}
                        className="text-[11px] font-bold text-[#EA580C] hover:underline flex items-center gap-0.5 cursor-pointer"
                      >
                        <Plus size={12} />
                        <span>Add Takeaway</span>
                      </button>
                    </div>

                    <div className="space-y-2">
                      {activeLesson.key_takeaways.map((takeaway, tIdx) => (
                        <div key={tIdx} className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-orange-100 text-[#EA580C] text-[10px] font-bold flex items-center justify-center shrink-0">
                            {tIdx + 1}
                          </span>
                          <input
                            type="text"
                            placeholder="e.g. Always prefer const over let for immutability"
                            value={takeaway}
                            onChange={(e) => handleTakeawayChange(tIdx, e.target.value)}
                            className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-[#EA580C]/20"
                            required
                          />
                          {activeLesson.key_takeaways.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveTakeaway(tIdx)}
                              className="p-1 text-neutral-400 hover:text-rose-500"
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Interactive Lesson Quizzes (Supports multiple quizzes per lesson) */}
                  <div className="pt-4 border-t border-neutral-100 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <HelpCircle size={16} className="text-[#EA580C]" />
                          <h4 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
                            Lesson Quizzes & Practice Checks ({(activeLesson.questions || []).length})
                          </h4>
                        </div>
                        <p className="text-[11px] text-neutral-500 mt-0.5">
                          Tutors can create multiple quizzes for this lesson to thoroughly evaluate student understanding.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={handleAddQuestion}
                        className="self-start sm:self-auto px-2.5 py-1 text-xs font-bold text-[#EA580C] bg-orange-50 hover:bg-orange-100 rounded-lg border border-orange-200 flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Plus size={13} />
                        <span>Add Another Quiz</span>
                      </button>
                    </div>

                    <div className="space-y-4">
                      {(activeLesson.questions || []).map((q, qIdx) => (
                        <div
                          key={qIdx}
                          className="bg-neutral-50/70 border border-neutral-200 rounded-xl p-4 sm:p-5 space-y-3.5 relative"
                        >
                          <div className="flex items-center justify-between pb-2 border-b border-neutral-200/80">
                            <span className="text-xs font-bold text-neutral-800 flex items-center gap-2">
                              <span className="px-2 py-0.5 rounded-full bg-[#EA580C] text-white text-[10px] font-bold">
                                Quiz #{qIdx + 1}
                              </span>
                              <span className="text-neutral-500 text-[11px]">Assessment Question</span>
                            </span>

                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => handleDuplicateQuestion(qIdx)}
                                className="text-neutral-500 hover:text-neutral-800 p-1 flex items-center gap-1 text-[11px] font-semibold cursor-pointer"
                                title="Duplicate Quiz"
                              >
                                <Copy size={12} />
                                <span className="hidden sm:inline">Duplicate</span>
                              </button>

                              {(activeLesson.questions || []).length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => handleRemoveQuestion(qIdx)}
                                  className="text-neutral-400 hover:text-rose-600 p-1 flex items-center gap-1 text-[11px] font-semibold cursor-pointer"
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
                            placeholder="e.g. What is the difference between synchronous and asynchronous code?"
                            value={q.question_text}
                            onChange={(e) => handleQuestionFieldChange(qIdx, { question_text: e.target.value })}
                            required
                          />

                          {/* 4 Options with Radio for Correct Option */}
                          <div className="space-y-2">
                            <label className="text-xs font-medium text-neutral-700 block">
                              Answer Options & Correct Key (Select which option is correct) *
                            </label>

                            {q.question_options.map((opt, optIdx) => {
                              const isCorrect = q.correct_option_index === optIdx;
                              const letter = String.fromCharCode(65 + optIdx);

                              return (
                                <div
                                  key={optIdx}
                                  className={`p-2.5 rounded-xl border flex items-center gap-3 transition-colors ${
                                    isCorrect
                                      ? 'bg-emerald-50/70 border-emerald-300'
                                      : 'bg-white border-neutral-200'
                                  }`}
                                >
                                  <label className="flex items-center gap-1.5 cursor-pointer shrink-0">
                                    <input
                                      type="radio"
                                      name={`correct_option_${activeLessonIndex}_${qIdx}`}
                                      checked={isCorrect}
                                      onChange={() => handleQuestionFieldChange(qIdx, { correct_option_index: optIdx })}
                                      className="text-emerald-600 focus:ring-emerald-500 cursor-pointer"
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
                                    placeholder={`Option ${letter} text...`}
                                    value={opt}
                                    onChange={(e) => handleQuestionOptionChange(qIdx, optIdx, e.target.value)}
                                    className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-neutral-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                                    required
                                  />

                                  {isCorrect && (
                                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-full shrink-0">
                                      Correct Key
                                    </span>
                                  )}
                                </div>
                              );
                            })}
                          </div>

                          {/* Explanation */}
                          <div className="space-y-1">
                            <label className="text-xs font-medium text-neutral-700">
                              Answer Explanation (Shown to students after answering) *
                            </label>
                            <textarea
                              rows={2}
                              placeholder="Explain why the chosen option is correct and provide learning insight."
                              value={q.question_explanation}
                              onChange={(e) => handleQuestionFieldChange(qIdx, { question_explanation: e.target.value })}
                              className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-200 bg-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#EA580C]/20 leading-relaxed"
                              required
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Footer Navigation */}
                <div className="pt-6 border-t border-neutral-100 mt-6 flex items-center justify-between">
                  <Button variant="secondary" size="sm" onClick={() => setCurrentStep(1)}>
                    Back to Course Details
                  </Button>

                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleNextToStep3}
                    rightIcon={<ArrowRight size={14} />}
                  >
                    Next: Review & Publish
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* ================= PAGE 3: REVIEW & PUBLISH ================= */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <Card>
              <div className="flex items-center gap-2 pb-4 border-b border-neutral-100 mb-5">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
                  <CheckCircle2 size={18} />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-neutral-900">Review Complete Curriculum</h2>
                  <p className="text-xs text-neutral-500">
                    Verify all course metadata and lessons before publishing to the student catalog
                  </p>
                </div>
              </div>

              {/* Course Overview Card Preview */}
              <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200/80 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                <div className="w-24 h-24 rounded-lg overflow-hidden bg-neutral-200 shrink-0">
                  <img src={image} alt={title} className="w-full h-full object-cover" />
                </div>
                <div className="space-y-1.5 min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-orange-100 text-[#EA580C]">
                      {category}
                    </span>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-neutral-200 text-neutral-700">
                      {level}
                    </span>
                    <span className="text-[11px] text-neutral-500 flex items-center gap-1">
                      <Clock size={12} /> {duration}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-neutral-900">{title}</h3>
                  <p className="text-xs text-neutral-500 line-clamp-2">{description}</p>
                  <p className="text-[11px] text-neutral-600 font-semibold">Tutor: {publisher}</p>
                </div>
              </div>

              {/* Lessons Summary List */}
              <div className="space-y-3 pt-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-600">
                  Included Lessons ({lessons.length})
                </h4>

                <div className="space-y-2">
                  {lessons.map((lesson, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 bg-white border border-neutral-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        <span className="w-6 h-6 rounded-full bg-orange-100 text-[#EA580C] text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-neutral-900">{lesson.title}</p>
                          <p className="text-[11px] text-neutral-500 line-clamp-1">{lesson.description}</p>
                          <span className="text-[10px] text-emerald-700 font-semibold inline-flex items-center gap-1 mt-1">
                            <Check size={11} /> {lesson.questions.length} {lesson.questions.length === 1 ? 'Quiz' : 'Quizzes'} Configured
                          </span>
                        </div>
                      </div>

                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          setActiveLessonIndex(idx);
                          setCurrentStep(2);
                        }}
                        className="text-xs self-end sm:self-auto"
                      >
                        Edit Lesson
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Ready to Publish Action Bar */}
              <div className="pt-6 border-t border-neutral-100 mt-6 flex items-center justify-between">
                <Button variant="secondary" size="sm" onClick={() => setCurrentStep(2)}>
                  Back to Lessons
                </Button>

                <Button
                  variant="primary"
                  size="md"
                  onClick={handlePublishCourse}
                  isLoading={isSubmitting}
                  leftIcon={<Check size={16} />}
                >
                  Publish Course Now
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>

      {/* Image Cropper Modal for Course Thumbnail */}
      <ImageCropperModal
        isOpen={isCropperOpen}
        imageSrc={rawImageForCrop}
        aspectRatio={16 / 9}
        isCircular={false}
        title="Crop Course Thumbnail (16:9)"
        onCropSave={(cropped) => {
          setImage(cropped);
          setIsCropperOpen(false);
          setRawImageForCrop(null);
        }}
        onClose={() => {
          setIsCropperOpen(false);
          setRawImageForCrop(null);
        }}
      />
    </AppLayout>
  );
};

export default CreateCourseScreen;
