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
      className={`grid grid-cols-2 p-1 bg-neutral-100/80 rounded-xl border border-neutral-200/80 mb-6 ${className}`}
      role="tablist"
      aria-label="Account Type"
    >
      <button
        type="button"
        role="tab"
        id="tab-student"
        aria-selected={activeTab === 'student'}
        aria-controls="panel-student"
        onClick={() => onTabChange('student')}
        className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all duration-150 ${activeTab === 'student'
            ? 'bg-white text-neutral-900 shadow-sm border border-neutral-200/60'
            : 'text-neutral-500 hover:text-neutral-900 hover:bg-white/50'
          }`}
      >
        <GraduationCap
          size={16}
          className={activeTab === 'student' ? 'text-[#F97316]' : 'text-neutral-400'}
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
        className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all duration-150 ${activeTab === 'tutor'
            ? 'bg-white text-neutral-900 shadow-sm border border-neutral-200/60'
            : 'text-neutral-500 hover:text-neutral-900 hover:bg-white/50'
          }`}
      >
        <Award
          size={16}
          className={activeTab === 'tutor' ? 'text-[#F97316]' : 'text-neutral-400'}
        />
        <span>Tutor</span>
      </button>
    </div>
  );
};
