import React from 'react';
import { Spinner } from '../Spinner/Spinner';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'soft' | 'text';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  isLoading = false,
  leftIcon,
  rightIcon,
  disabled,
  className = '',
  children,
  ...rest
}) => {
  const isDisabled = disabled || isLoading;

  const baseStyles = 'inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all duration-150 select-none cursor-pointer outline-none focus-visible:ring-3 focus-visible:ring-[#F97316]/25 disabled:opacity-60 disabled:cursor-not-allowed disabled:pointer-events-none active:scale-[0.99]';

  const sizeStyles = {
    sm: 'h-9 px-3 text-xs',
    md: 'h-11 px-4 text-sm',
    lg: 'h-12 px-6 text-base'
  }[size];

  const variantStyles = {
    primary: 'bg-[#F97316] hover:bg-[#EA580C] text-white shadow-sm border border-transparent shadow-[#F97316]/15',
    secondary: 'bg-white hover:bg-neutral-50 text-neutral-800 border border-neutral-200 shadow-sm',
    soft: 'bg-[#FFF7ED] hover:bg-[#FFEDD5] text-[#EA580C] border border-[#FFEDD5]',
    text: 'bg-transparent text-neutral-600 hover:text-[#EA580C] hover:bg-[#FFF7ED]'
  }[variant];

  return (
    <button
      className={`${baseStyles} ${sizeStyles} ${variantStyles} ${fullWidth ? 'w-full' : ''} ${className}`}
      disabled={isDisabled}
      {...rest}
    >
      {isLoading ? (
        <>
          <Spinner size={size === 'lg' ? 'md' : 'sm'} color={variant === 'primary' ? '#FFFFFF' : '#F97316'} />
          <span>Processing...</span>
        </>
      ) : (
        <>
          {leftIcon && <span className="inline-flex items-center">{leftIcon}</span>}
          <span>{children}</span>
          {rightIcon && <span className="inline-flex items-center">{rightIcon}</span>}
        </>
      )}
    </button>
  );
};
