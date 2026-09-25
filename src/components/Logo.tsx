import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'hero';
  showLabel?: boolean;
  className?: string;
}

export const TextQBoardLogo: React.FC<LogoProps> = ({
  size = 'md',
  showLabel = true,
  className = '',
}) => {
  const sizeClasses = {
    sm: {
      container: 'gap-1',
      key: 'w-6 h-6 text-xs rounded-md',
      pill: 'px-2.5 py-0.5 text-[10px] mt-1.5',
    },
    md: {
      container: 'gap-1.5',
      key: 'w-9 h-9 text-sm rounded-lg',
      pill: 'px-3.5 py-1 text-xs font-bold mt-2',
    },
    lg: {
      container: 'gap-2',
      key: 'w-12 h-12 text-base rounded-xl',
      pill: 'px-5 py-1.5 text-sm font-extrabold mt-3',
    },
    hero: {
      container: 'gap-3',
      key: 'w-16 h-16 text-xl rounded-2xl',
      pill: 'px-8 py-2.5 text-lg font-black mt-4',
    },
  }[size];

  const keyStyle =
    'relative flex items-center justify-center font-bold text-white bg-gradient-to-b from-[#1c2b3e] to-[#0c1420] border-[1.5px] border-cyan-400/70 shadow-[0_0_12px_rgba(6,182,212,0.45),inset_0_1px_2px_rgba(255,255,255,0.3)] transition-transform hover:scale-105 active:scale-95 select-none';

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      {/* 8 Keys Grid matching the uploaded image */}
      <div className={`grid grid-cols-4 ${sizeClasses.container}`}>
        {/* Row 1: T + ● — */}
        <div className={`${keyStyle} ${sizeClasses.key}`}>
          <span className="text-cyan-100 drop-shadow-[0_0_6px_rgba(34,211,238,0.8)]">T</span>
        </div>
        <div className={`${keyStyle} ${sizeClasses.key}`}>
          <span className="text-cyan-200 drop-shadow-[0_0_6px_rgba(34,211,238,0.8)]">+</span>
        </div>
        <div className={`${keyStyle} ${sizeClasses.key}`}>
          <div className="w-2.5 h-2.5 rounded-full bg-cyan-200 shadow-[0_0_8px_#22d3ee]" />
        </div>
        <div className={`${keyStyle} ${sizeClasses.key}`}>
          <span className="text-cyan-200 drop-shadow-[0_0_6px_rgba(34,211,238,0.8)]">—</span>
        </div>

        {/* Row 2: — Q + B */}
        <div className={`${keyStyle} ${sizeClasses.key}`}>
          <span className="text-cyan-200 drop-shadow-[0_0_6px_rgba(34,211,238,0.8)]">—</span>
        </div>
        <div className={`${keyStyle} ${sizeClasses.key}`}>
          <span className="text-cyan-100 drop-shadow-[0_0_6px_rgba(34,211,238,0.8)]">Q</span>
        </div>
        <div className={`${keyStyle} ${sizeClasses.key}`}>
          <span className="text-cyan-200 drop-shadow-[0_0_6px_rgba(34,211,238,0.8)]">+</span>
        </div>
        <div className={`${keyStyle} ${sizeClasses.key}`}>
          <span className="text-cyan-100 drop-shadow-[0_0_6px_rgba(34,211,238,0.8)]">B</span>
        </div>
      </div>

      {/* Pill Badge matching "Text Q Board" */}
      {showLabel && (
        <div
          className={`glass-pill rounded-full border border-cyan-300/80 text-slate-900 tracking-tight flex items-center justify-center shadow-[0_4px_14px_rgba(6,182,212,0.4)] ${sizeClasses.pill}`}
        >
          <span>Text Q Board</span>
        </div>
      )}
    </div>
  );
};
