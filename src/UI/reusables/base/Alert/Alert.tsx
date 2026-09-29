import React from 'react';
import { AlertCircle, CheckCircle2, Info } from 'lucide-react';

export interface AlertProps {
  type?: 'error' | 'success' | 'info';
  message: string;
  className?: string;
}

export const Alert: React.FC<AlertProps> = ({ type = 'error', message, className = '' }) => {
  if (!message) return null;

  const config = {
    error: {
      bg: 'bg-red-50 border-red-200 text-red-700',
      icon: <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
    },
    success: {
      bg: 'bg-emerald-50 border-emerald-200 text-emerald-800',
      icon: <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
    },
    info: {
      bg: 'bg-[#FFF7ED] border-[#FFEDD5] text-[#EA580C]',
      icon: <Info className="w-4 h-4 text-[#F97316] shrink-0 mt-0.5" />
    }
  }[type];

  return (
    <div
      className={`flex items-start gap-2.5 p-3 rounded-lg border text-xs leading-relaxed mb-5 ${config.bg} ${className}`}
      role="alert"
    >
      {config.icon}
      <div className="flex-1 font-medium">{message}</div>
    </div>
  );
};
