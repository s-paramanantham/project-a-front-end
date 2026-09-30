import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Clock,
  Star,
  CheckCircle2,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  Tag,
  Play,
  Edit3
} from 'lucide-react';
import type { Course } from '../../../../types/courseTypes';
import { Button } from '../../base/Button/Button';
import { authService } from '../../../../services/AuthService/authService';

interface CourseCardProps {
  course: Course;
  isEnrolling?: boolean;
  onEnroll: (courseId: string) => void;
  onUnenroll?: (courseId: string) => void;
}

export const CourseCard: React.FC<CourseCardProps> = ({
  course,
  isEnrolling = false,
  onEnroll,
  onUnenroll
}) => {
  const navigate = useNavigate();
  const [imageError, setImageError] = useState(false);
  const currentUser = authService.getCurrentUser();
  const isTutor = currentUser?.role?.toLowerCase() === 'tutor';

  // Fallback gradient based on course category/title
  const getFallbackGradient = (title: string) => {
    if (title.includes('SQL')) return 'from-blue-600 to-indigo-700';
    if (title.includes('HTML')) return 'from-orange-500 to-amber-600';
    if (title.includes('CSS')) return 'from-sky-500 to-blue-600';
    if (title.includes('JavaScript') || title.includes('JS')) return 'from-amber-400 to-yellow-600';
    if (title.includes('TypeScript') || title.includes('TS')) return 'from-blue-500 to-sky-700';
    if (title.includes('Node')) return 'from-emerald-600 to-green-700';
    if (title.includes('Python')) return 'from-teal-600 to-cyan-700';
    return 'from-orange-500 to-amber-600';
  };

  return (
    <div className="group bg-white rounded-xl border border-neutral-200/80 shadow-xs hover:border-neutral-300 hover:shadow-sm transition-all flex flex-col overflow-hidden">
      {/* Course Thumbnail Image */}
      <div className="relative aspect-video w-full overflow-hidden bg-neutral-100 border-b border-neutral-100">
        {!imageError && course.image ? (
          <img
            src={course.image}
            alt={course.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={() => setImageError(true)}
            loading="lazy"
          />
        ) : (
          <div
            className={`w-full h-full bg-gradient-to-tr ${getFallbackGradient(
              course.title
            )} flex flex-col items-center justify-center text-white p-4 text-center`}
          >
            <BookOpen size={30} className="opacity-80 mb-2" />
            <span className="font-semibold text-xs tracking-tight">{course.title}</span>
          </div>
        )}

        {/* Top Badges Overlay */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
          {course.category && (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md bg-neutral-900/80 text-white backdrop-blur-xs">
              <Tag size={10} />
              <span>{course.category}</span>
            </span>
          )}

          {course.level && (
            <span className="inline-flex items-center text-[11px] font-medium px-2 py-0.5 rounded-md bg-white/95 text-neutral-800 shadow-2xs">
              {course.level}
            </span>
          )}
        </div>

        {/* Enrolled Status Overlay Banner */}
        {course.is_enrolled && (
          <div className="absolute bottom-2.5 left-2.5 inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md bg-emerald-600 text-white shadow-xs">
            <CheckCircle2 size={12} className="text-white" />
            <span>Enrolled</span>
          </div>
        )}
      </div>

      {/* Card Body */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Publisher Info */}
          <div className="flex items-center gap-1.5 text-xs font-medium text-neutral-500 mb-1.5">
            <ShieldCheck size={13} className="text-[#EA580C]" />
            <span className="truncate">{course.publisher}</span>
          </div>

          {/* Course Title */}
          <h3 className="font-semibold text-sm sm:text-base text-neutral-900 leading-snug mb-1.5 group-hover:text-[#EA580C] transition-colors line-clamp-1">
            {course.title}
          </h3>

          {/* Course Description */}
          <p className="text-neutral-500 text-xs leading-relaxed line-clamp-2 mb-3">
            {course.description}
          </p>
        </div>

        {/* Card Footer: Metadata & Action */}
        <div className="pt-3 border-t border-neutral-100 mt-1">
          {/* Stats: Rating and Duration */}
          <div className="flex items-center justify-between text-xs text-neutral-500 mb-3">
            <div className="flex items-center gap-1 text-amber-500 font-medium">
              <Star size={13} className="fill-amber-400 text-amber-400" />
              <span className="text-neutral-800 font-semibold">{course.rating || '4.8'}</span>
              <span className="text-neutral-400 text-[11px]">(420+)</span>
            </div>

            <div className="flex items-center gap-1 text-neutral-400 text-[11px]">
              <Clock size={12} />
              <span>{course.duration || '10 Hours'}</span>
            </div>
          </div>

          {/* Action Button */}
          {course.is_enrolled ? (
            <div className="space-y-2">
              {/* Progress bar if enrolled */}
              <div className="flex items-center justify-between text-[11px] text-neutral-500 font-medium mb-1">
                <span>Progress</span>
                <span className="text-[#EA580C] font-semibold">{course.progress_percent || 0}%</span>
              </div>
              <div className="w-full h-1.5 bg-neutral-100 rounded-full overflow-hidden border border-neutral-200/80">
                <div
                  className="h-full bg-[#EA580C] rounded-full transition-all duration-300"
                  style={{ width: `${course.progress_percent || 0}%` }}
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <Button
                  variant="primary"
                  size="sm"
                  fullWidth
                  onClick={() => navigate(`/courses/${course.id}/study`)}
                  leftIcon={<Play size={12} className="fill-white" />}
                >
                  {course.progress_percent && course.progress_percent > 0
                    ? 'Continue Learning'
                    : 'Study Course'}
                </Button>
                {onUnenroll && (
                  <button
                    onClick={() => onUnenroll(course.id)}
                    title="Drop Course"
                    className="px-2.5 py-1.5 text-xs text-neutral-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-neutral-200 hover:border-rose-200 cursor-pointer"
                  >
                    Drop
                  </button>
                )}
              </div>
            </div>
          ) : (
            <Button
              variant="primary"
              size="sm"
              fullWidth
              isLoading={isEnrolling}
              onClick={() => onEnroll(course.id)}
              rightIcon={<ArrowRight size={13} />}
            >
              Enroll Now
            </Button>
          )}

          {isTutor && (
            <div className="pt-2">
              <Button
                variant="secondary"
                size="sm"
                fullWidth
                onClick={() => navigate(`/tutor/courses/${course.id}/edit`)}
                leftIcon={<Edit3 size={12} />}
                className="text-xs font-semibold"
              >
                Edit Course & Lessons
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
