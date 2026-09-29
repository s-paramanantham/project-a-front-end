import React, { forwardRef } from 'react';
import { Label } from '../Label/Label';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  required?: boolean;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  wrapperClassName?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  required,
  error,
  hint,
  leftIcon,
  rightIcon,
  id,
  disabled,
  className = '',
  wrapperClassName = '',
  ...rest
}, ref) => {
  const inputId = id || (label ? `input-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);

  return (
    <div className={`w-full flex flex-col ${wrapperClassName}`}>
      {label && (
        <Label htmlFor={inputId} required={required}>
          {label}
        </Label>
      )}
      <div className="relative flex items-center w-full">
        {leftIcon && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center pointer-events-none text-neutral-400 z-10">
            {leftIcon}
          </div>
        )}
        <input
          ref={ref}
          id={inputId}
          disabled={disabled}
          className={`w-full h-11 ${leftIcon ? 'pl-10' : 'pl-3.5'} ${
            rightIcon ? 'pr-11' : 'pr-3.5'
          } py-2.5 text-sm text-neutral-900 bg-white border rounded-lg outline-none transition-all duration-150 placeholder:text-neutral-400 ${
            error
              ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
              : 'border-neutral-200 hover:border-neutral-300 focus:border-[#F97316] focus:ring-2 focus:ring-[#F97316]/20'
          } ${disabled ? 'bg-neutral-50 text-neutral-400 cursor-not-allowed' : ''} ${className}`}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
          {...rest}
        />
        {rightIcon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center z-10">
            {rightIcon}
          </div>
        )}
      </div>
      {error && (
        <p id={`${inputId}-error`} className="text-xs text-red-500 mt-1 font-medium flex items-center gap-1" role="alert">
          {error}
        </p>
      )}
      {!error && hint && (
        <p id={`${inputId}-hint`} className="text-xs text-neutral-500 mt-1">
          {hint}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';
