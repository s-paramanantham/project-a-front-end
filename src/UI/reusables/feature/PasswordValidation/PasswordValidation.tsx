import React from 'react';
import { Check, Dot } from 'lucide-react';
import type { PasswordValidationRules } from '../../../../types/authTypes';

export interface PasswordValidationProps {
  rules: PasswordValidationRules;
  hasTyped: boolean;
  showMatchRule?: boolean;
  className?: string;
}

export const PasswordValidation: React.FC<PasswordValidationProps> = ({
  rules,
  hasTyped,
  showMatchRule = true,
  className = ''
}) => {
  // If the user hasn't started typing at all, show subtle rules
  const items = [
    { key: 'minLength', label: 'At least 8 characters', met: rules.minLength },
    { key: 'hasUppercase', label: 'One uppercase letter (A-Z)', met: rules.hasUppercase },
    { key: 'hasLowercase', label: 'One lowercase letter (a-z)', met: rules.hasLowercase },
    { key: 'hasNumber', label: 'One number (0-9)', met: rules.hasNumber },
    { key: 'hasSpecialChar', label: 'One special character (!@#$%^&*)', met: rules.hasSpecialChar },
    ...(showMatchRule
      ? [{ key: 'passwordsMatch', label: 'Passwords match', met: rules.passwordsMatch }]
      : [])
  ];

  return (
    <div
      className={`p-3 bg-neutral-50/80 rounded-xl border border-neutral-200/70 text-xs ${className}`}
      aria-live="polite"
      aria-label="Password requirements"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-1.5 gap-x-3">
        {items.map((item) => {
          const isPassed = hasTyped && item.met;

          return (
            <div
              key={item.key}
              className={`flex items-center gap-1.5 transition-colors duration-150 ${isPassed
                  ? 'text-emerald-700 font-medium'
                  : hasTyped
                    ? 'text-neutral-500'
                    : 'text-neutral-400'
                }`}
            >
              <span
                className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 transition-colors ${isPassed
                    ? 'bg-emerald-100 text-emerald-600'
                    : 'bg-neutral-200/60 text-neutral-400'
                  }`}
              >
                {isPassed ? <Check size={11} strokeWidth={3} /> : <Dot size={14} />}
              </span>
              <span>{item.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
