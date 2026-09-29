import React, { forwardRef } from 'react';
import { Check } from 'lucide-react';

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: React.ReactNode;
  error?: string;
  wrapperClassName?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(({
  label,
  checked,
  onChange,
  disabled,
  error,
  wrapperClassName = '',
  id,
  ...rest
}, ref) => {
  const checkboxId = id || `chk-${Math.random().toString(36).substring(2, 9)}`;

  return (
    <div className={`w-full ${wrapperClassName}`}>
      <label
        htmlFor={checkboxId}
        className={`inline-flex items-start gap-2.5 cursor-pointer select-none text-xs text-neutral-600 leading-normal ${
          disabled ? 'opacity-60 cursor-not-allowed' : ''
        }`}
      >
        <span className="relative flex items-center justify-center mt-0.5">
          <input
            ref={ref}
            type="checkbox"
            id={checkboxId}
            checked={checked}
            onChange={onChange}
            disabled={disabled}
            className="peer sr-only"
            {...rest}
          />
          <span
            className={`w-4 h-4 rounded border transition-all flex items-center justify-center ${
              checked
                ? 'bg-[#F97316] border-[#F97316] text-white'
                : 'bg-white border-neutral-300 peer-focus-visible:ring-2 peer-focus-visible:ring-[#F97316]/30'
            }`}
          >
            {checked && <Check size={12} strokeWidth={3} />}
          </span>
        </span>
        <span className="flex-1">{label}</span>
      </label>
      {error && <p className="text-xs text-red-500 mt-1 ml-6">{error}</p>}
    </div>
  );
});

Checkbox.displayName = 'Checkbox';
