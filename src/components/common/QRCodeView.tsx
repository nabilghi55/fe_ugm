import React from 'react';
import { QRCodeSVG } from 'qrcode.react';

interface Props {
  value: string;
  size?: number;
  label?: string;
}

export const QRCodeView: React.FC<Props> = ({ value, size = 120, label }) => {
  return (
    <div className="flex flex-col items-center justify-center p-2.5 bg-white rounded-xl border border-slate-200 shadow-xs">
      <QRCodeSVG value={value} size={size} level="M" />
      {label && <span className="mt-1.5 text-[10px] font-mono font-bold text-slate-800 tracking-wider text-center">{label}</span>}
    </div>
  );
};

