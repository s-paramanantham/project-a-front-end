import React from 'react';
import { GraduationCap, Award } from 'lucide-react';
import type { UserRole } from '../../../../types/authTypes';

export interface AuthTabsProps {
  activeTab: UserRole;
  onTabChange: (role: UserRole) => void;
  className?: string;
}

export const AuthTabs: React.FC<AuthTabsProps> = ({
  activeTab,
  onTabChange,
  className = ''
}) => {
  return (
    <div
      className={`relative grid grid-cols-2 p-1 bg-neutral-100/90 rounded-xl border border-neutral-200/70 mb-4 select-none ${className}`}
      role="tablist"
      aria-label="Account Type"
    >
      {/* Smooth Sliding Pill Indicator */}
      <div
        aria-hidden="true"
        className={`absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-lg bg-white shadow-sm border border-neutral-200/70 transition-transform duration-200 ease-out pointer-events-none ${
          activeTab === 'student' ? 'left-1 translate-x-0' : 'left-1 translate-x-full'
        }`}
      />

      <button
        type="button"
        role="tab"
        id="tab-student"
        aria-selected={activeTab === 'student'}
        aria-controls="panel-student"
        onClick={() => onTabChange('student')}
        style={{ WebkitTapHighlightColor: 'transparent' }}
        className={`relative z-10 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs sm:text-sm font-semibold transition-colors duration-200 outline-none focus:outline-none focus-visible:outline-none ring-0 focus:ring-0 active:outline-none select-none cursor-pointer ${
          activeTab === 'student'
            ? 'text-neutral-900 font-bold'
            : 'text-neutral-500 hover:text-neutral-800'
        }`}
      >
        <GraduationCap
          size={16}
          className={`transition-colors duration-200 ${
            activeTab === 'student' ? 'text-[#F97316]' : 'text-neutral-400'
          }`}
        />
        <span>Student</span>
      </button>

      <button
        type="button"
        role="tab"
        id="tab-tutor"
        aria-selected={activeTab === 'tutor'}
        aria-controls="panel-tutor"
        onClick={() => onTabChange('tutor')}
        style={{ WebkitTapHighlightColor: 'transparent' }}
        className={`relative z-10 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs sm:text-sm font-semibold transition-colors duration-200 outline-none focus:outline-none focus-visible:outline-none ring-0 focus:ring-0 active:outline-none select-none cursor-pointer ${
          activeTab === 'tutor'
            ? 'text-neutral-900 font-bold'
            : 'text-neutral-500 hover:text-neutral-800'
        }`}
      >
        <Award
          size={16}
          className={`transition-colors duration-200 ${
            activeTab === 'tutor' ? 'text-[#F97316]' : 'text-neutral-400'
          }`}
        />
        <span>Tutor</span>
      </button>
    </div>
  );
};
