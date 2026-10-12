import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple';
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'default' }) => {
  const styles = {
    default: 'bg-slate-100 text-slate-700 border-slate-200',
    success: 'bg-emerald-50 text-emerald-800 border-emerald-200 font-semibold',
    warning: 'bg-amber-50 text-amber-800 border-amber-200 font-semibold',
    danger: 'bg-red-50 text-red-700 border-red-200 font-semibold',
    info: 'bg-cyan-50 text-cyan-800 border-cyan-200 font-semibold',
    purple: 'bg-slate-100 text-slate-700 border-slate-300 font-semibold',
  };

  return (
    <span className={`inline-flex items-center rounded px-2 py-1 text-[10px] font-medium uppercase tracking-[0.06em] border ${styles[variant]}`}>
      {children}
    </span>
  );
};
