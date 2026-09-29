import React from 'react';

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
  children: React.ReactNode;
}

export const Label: React.FC<LabelProps> = ({ required, children, className = '', ...rest }) => {
  return (
    <label
      className={`block text-xs font-semibold text-neutral-800 mb-1.5 tracking-tight ${className}`}
      {...rest}
    >
      {children}
      {required && <span className="text-[#F97316] ml-1 font-bold" aria-hidden="true">*</span>}
    </label>
  );
};
