import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ children, className = '', ...rest }) => {
  return (
    <div
      className={`bg-white border border-neutral-200/90 rounded-2xl shadow-sm p-6 sm:p-9 w-full ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
};
