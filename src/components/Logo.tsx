import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'hero';
  showLabel?: boolean;
  className?: string;
}

/**
 * Clean, flat Gboard Material You Vector Emblem for Text Q Board
 * Zero 3D effects or bevels — crisp geometric vector mark
 */
export const TextQBoardLogo: React.FC<LogoProps> = ({
  size = 'md',
  showLabel = true,
  className = '',
}) => {
  const dimensions = {
    sm: { svg: 32, text: 'text-sm font-semibold' },
    md: { svg: 42, text: 'text-base font-bold' },
    lg: { svg: 56, text: 'text-lg font-bold' },
    hero: { svg: 72, text: 'text-xl font-bold' },
  }[size];

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      <svg
        width={dimensions.svg}
        height={dimensions.svg}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0"
      >
        {/* Flat Material 3 Squircle Tile */}
        <rect width="64" height="64" rx="16" fill="#1E232E" />
        <rect
          x="1"
          y="1"
          width="62"
          height="62"
          rx="15"
          stroke="#A8C7FA"
          strokeOpacity="0.22"
          strokeWidth="2"
        />

        {/* Top Gboard-style Material Accent Bar */}
        <circle cx="18" cy="15" r="3" fill="#4285F4" />
        <circle cx="27" cy="15" r="3" fill="#EA4335" />
        <circle cx="36" cy="15" r="3" fill="#FBBC04" />
        <circle cx="45" cy="15" r="3" fill="#34A853" />

        {/* Row 1 Flat Keycaps */}
        <rect x="11" y="23" width="9" height="8" rx="2.5" fill="#2F3542" />
        <rect x="22" y="23" width="9" height="8" rx="2.5" fill="#2F3542" />
        <rect x="33" y="23" width="9" height="8" rx="2.5" fill="#2F3542" />
        <rect x="44" y="23" width="9" height="8" rx="2.5" fill="#2F3542" />

        {/* Row 2 Flat Keycaps with Highlighted Q Key */}
        <rect x="14" y="34" width="9" height="8" rx="2.5" fill="#2F3542" />
        <rect x="25" y="34" width="14" height="8" rx="2.5" fill="#A8C7FA" />
        <rect x="41" y="34" width="9" height="8" rx="2.5" fill="#2F3542" />

        {/* Flat Spacebar Row */}
        <rect x="11" y="45" width="8" height="7" rx="2.5" fill="#252A34" />
        <rect x="21" y="45" width="22" height="7" rx="3.5" fill="#3A4152" />
        <rect x="45" y="45" width="8" height="7" rx="3.5" fill="#A8C7FA" />
      </svg>

      {showLabel && (
        <div className="flex flex-col">
          <span className={`tracking-tight text-[#E3E2E6] leading-tight ${dimensions.text}`}>
            Text Q Board
          </span>
          <span className="text-[11px] text-[#9AA0A6] font-normal">
            Gboard Input Engine
          </span>
        </div>
      )}
    </div>
  );
};
