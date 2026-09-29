import React from 'react';

export interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  color?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({ size = 'md', className = '', color }) => {
  const sizeClasses = {
    sm: 'w-3.5 h-3.5 border-2',
    md: 'w-5 h-5 border-2',
    lg: 'w-8 h-8 border-[3px]'
  }[size];

  return (
    <span
      className={`inline-block rounded-full animate-spin border-t-transparent ${sizeClasses} ${className}`}
      style={{
        borderColor: color ? `${color}40` : 'rgba(255, 255, 255, 0.35)',
        borderTopColor: color || 'currentColor'
      }}
      role="status"
      aria-label="Loading"
    />
  );
};
