import React from 'react';

export const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => {
  return (
    <div className={`rounded-[10px] border border-slate-200 bg-white p-6 shadow-[0_1px_2px_rgba(23,32,28,0.04)] ${className}`}>
      {children}
    </div>
  );
};
