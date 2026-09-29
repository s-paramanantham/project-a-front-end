import React, { forwardRef } from 'react';
import { ChevronDown } from 'lucide-react';
import { Label } from '../Label/Label';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  required?: boolean;
  error?: string;
  options: SelectOption[];
  wrapperClassName?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(({
  label,
  required,
  error,
  options,
  id,
  disabled,
  className = '',
  wrapperClassName = '',
  ...rest
}, ref) => {
  const selectId = id || (label ? `select-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);

  return (
    <div className={`w-full flex flex-col ${wrapperClassName}`}>
      {label && (
        <Label htmlFor={selectId} required={required}>
          {label}
        </Label>
      )}
      <div
        className={`relative flex items-center bg-white border rounded-lg transition-all duration-150 ${
          error
            ? 'border-red-500 focus-within:ring-3 focus-within:ring-red-500/20'
            : 'border-neutral-200 hover:border-neutral-300 focus-within:border-[#F97316] focus-within:ring-3 focus-within:ring-[#F97316]/20'
        } ${disabled ? 'bg-neutral-50 opacity-70 cursor-not-allowed' : ''}`}
      >
        <select
          ref={ref}
          id={selectId}
          disabled={disabled}
          className={`w-full h-11 pl-3.5 pr-9 text-sm text-neutral-900 bg-transparent border-0 outline-none appearance-none cursor-pointer disabled:cursor-not-allowed ${className}`}
          {...rest}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} disabled={opt.disabled}>
              {opt.label}
            </option>
          ))}
        </select>
        <span className="absolute right-3 pointer-events-none text-neutral-400">
          <ChevronDown size={16} />
        </span>
      </div>
      {error && (
        <p className="text-xs text-red-500 mt-1.5 font-medium" role="alert">
          {error}
        </p>
      )}
    </div>
  );
});

Select.displayName = 'Select';
