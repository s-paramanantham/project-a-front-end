import React from 'react';
import { Card } from '../../base/Card/Card';

export interface AuthLayoutProps {
  title: string;
  subtitle?: string;
  badgeText?: string;
  children: React.ReactNode;
  footerContent?: React.ReactNode;
  cardMaxWidth?: 'sm' | 'md' | 'lg';
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({
  title,
  subtitle,
  children,
  footerContent,
  cardMaxWidth = 'md'
}) => {
  const maxWidthClass = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-xl'
  }[cardMaxWidth];

  return (
    <div className="min-h-screen w-full bg-[#FAFAFA] flex flex-col justify-center items-center px-4 py-8 sm:py-12">
      {/* Main Centered Form Card */}
      <main className={`w-full ${maxWidthClass} flex flex-col items-center`}>
        <Card className="w-full bg-white border border-neutral-200 rounded-2xl shadow-sm p-6 sm:p-8">
          <div className="mb-6 text-center sm:text-left">
            <h1 className="text-2xl sm:text-[26px] font-bold text-neutral-900 tracking-tight leading-tight">
              {title}
            </h1>
            {subtitle && (
              <p className="text-sm text-neutral-500 mt-1.5 leading-relaxed font-normal">
                {subtitle}
              </p>
            )}
          </div>

          {children}
        </Card>

        {footerContent && (
          <div className="mt-5 text-center text-xs text-neutral-500">
            {footerContent}
          </div>
        )}
      </main>
    </div>
  );
};
