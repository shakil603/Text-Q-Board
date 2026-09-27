import React from 'react';
import { BoardBannerConfig, BoardMediaBackground } from '../types/keyboard';

interface LogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'hero';
  showLabel?: boolean;
  subtitle?: string;
  className?: string;
}

/**
 * Unified High-Contrast Keyboard Category Icon & Logo for Text Q Board.
 * Identical geometry and color palette across:
 * 1. Android Home Screen Launcher Icon (ic_launcher)
 * 2. Android Launch Splash Screen (splash.png)
 * 3. In-App Header Logo & Initial Setup Hero Banner
 */
export const TextQBoardIconSvg: React.FC<{ size?: number; className?: string }> = ({
  size = 40,
  className = '',
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`shrink-0 ${className}`}
  >
    {/* Deep Material Slate-Indigo Squircle Base */}
    <rect width="64" height="64" rx="16" fill="#151922" />
    <rect
      x="1.5"
      y="1.5"
      width="61"
      height="61"
      rx="14.5"
      stroke="#A8C7FA"
      strokeOpacity="0.4"
      strokeWidth="2"
    />

    {/* Inner Keyboard Chassis Frame */}
    <rect
      x="7"
      y="10"
      width="50"
      height="44"
      rx="10"
      fill="#1E2430"
      stroke="#2E3748"
      strokeWidth="1.2"
    />

    {/* Top 4 Gboard Suggestion Strip Color Dots */}
    <circle cx="19" cy="16" r="2.6" fill="#4285F4" />
    <circle cx="27.6" cy="16" r="2.6" fill="#EA4335" />
    <circle cx="36.3" cy="16" r="2.6" fill="#FBBC04" />
    <circle cx="45" cy="16" r="2.6" fill="#34A853" />

    {/* Row 1: 4 High-Contrast Keycaps */}
    <rect x="11" y="22" width="9.5" height="7.5" rx="2.2" fill="#DCE2EE" />
    <rect x="22" y="22" width="9.5" height="7.5" rx="2.2" fill="#DCE2EE" />
    <rect x="33" y="22" width="9.5" height="7.5" rx="2.2" fill="#DCE2EE" />
    <rect x="44" y="22" width="9" height="7.5" rx="2.2" fill="#DCE2EE" />

    {/* Row 2: Highlighted Center 'Q' Brand Keycap flanked by Crisp Keys */}
    <rect x="12.5" y="32" width="9.5" height="8.5" rx="2.2" fill="#DCE2EE" />
    <rect x="24" y="31.5" width="16" height="9.5" rx="2.8" fill="#A8C7FA" />
    {/* Crisp Geometric 'Q' Emblem inside Center Keycap */}
    <circle
      cx="32"
      cy="36"
      r="2.9"
      stroke="#062E6F"
      strokeWidth="1.8"
    />
    <path
      d="M33.8 37.8L35.6 39.5"
      stroke="#062E6F"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
    <rect x="42" y="32" width="9.5" height="8.5" rx="2.2" fill="#DCE2EE" />

    {/* Row 3: Bottom Functional Keys + Wide Material Blue Spacebar + Pill Enter */}
    <rect x="11" y="43" width="8.5" height="6.5" rx="2.2" fill="#6E7B91" />
    <rect x="21.5" y="43" width="21" height="6.5" rx="3.2" fill="#A8C7FA" />
    <rect x="44.5" y="43" width="8.5" height="6.5" rx="3.2" fill="#4285F4" />
  </svg>
);

export const TextQBoardLogo: React.FC<LogoProps> = ({
  size = 'md',
  showLabel = true,
  subtitle = 'Multilingual & Phonetic Keyboard',
  className = '',
}) => {
  const dimensions = {
    xs: { svg: 28, text: 'text-sm font-bold', sub: 'text-[10px]' },
    sm: { svg: 36, text: 'text-sm font-bold', sub: 'text-[11px]' },
    md: { svg: 44, text: 'text-base font-bold', sub: 'text-xs' },
    lg: { svg: 56, text: 'text-lg font-bold', sub: 'text-xs' },
    hero: { svg: 68, text: 'text-xl font-bold', sub: 'text-xs' },
  }[size];

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      <TextQBoardIconSvg size={dimensions.svg} />

      {showLabel && (
        <div className="flex flex-col">
          <span className={`tracking-tight text-[#E3E2E6] leading-tight ${dimensions.text}`}>
            Text Q Board
          </span>
          {subtitle && (
            <span className={`${dimensions.sub} text-[#9AA0A6] font-normal leading-tight`}>
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

/**
 * Cohesive Hero Banner Card with Customizable Banner Names, Gradients, and Photos
 */
export const TextQBoardHeroBanner: React.FC<{
  bannerConfig?: BoardBannerConfig;
  mediaBackground?: BoardMediaBackground;
  isBlankBoard?: boolean;
  onOpenVoice?: () => void;
  onOpenSoundStudio?: () => void;
  onOpenBoardStudio?: () => void;
}> = ({
  bannerConfig,
  mediaBackground,
  isBlankBoard = false,
  onOpenVoice,
  onOpenSoundStudio,
  onOpenBoardStudio,
}) => {
  const isCustomMedia =
    !isBlankBoard &&
    mediaBackground &&
    mediaBackground.type !== 'none' &&
    Boolean(mediaBackground.url);

  const bgGradient =
    bannerConfig?.bgGradient || 'from-[#1b1e28] via-[#1f2433] to-[#171b24]';

  const showTitle = !isBlankBoard && (bannerConfig?.showTitle ?? true);
  const showSubtitle = !isBlankBoard && (bannerConfig?.showSubtitle ?? true);
  const showBadge = !isBlankBoard && (bannerConfig?.showBadge ?? true);

  const titleText = bannerConfig?.title || 'Text Q Board';
  const subtitleText =
    bannerConfig?.subtitle ||
    'Material 3 Multilingual, Phonetic Bengali & Sound Studio Keyboard';
  const badgeText = bannerConfig?.badgeText || 'Pro Engine';
  const accentColor = bannerConfig?.accentColor || '#A8C7FA';

  return (
    <div
      className={`relative p-4 rounded-2xl overflow-hidden border border-[#a8c7fa]/20 shadow-lg select-none ${
        isBlankBoard
          ? 'bg-black'
          : `bg-gradient-to-r ${bgGradient}`
      }`}
    >
      {/* Optional Custom Photo/Video Wallpaper in Hero Banner */}
      {isCustomMedia && (
        <div className="absolute inset-0 pointer-events-none">
          {mediaBackground?.type === 'video' ? (
            <video
              src={mediaBackground.url}
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover"
              style={{
                filter: `brightness(${mediaBackground.brightness ?? 1}) blur(${
                  mediaBackground.blur ?? 0
                }px)`,
              }}
            />
          ) : (
            <img
              src={mediaBackground?.url}
              alt="Banner Wallpaper"
              className="w-full h-full object-cover"
              style={{
                filter: `brightness(${mediaBackground?.brightness ?? 1}) blur(${
                  mediaBackground?.blur ?? 0
                }px)`,
              }}
            />
          )}
          <div
            className="absolute inset-0 bg-black"
            style={{ opacity: mediaBackground?.dimmerOpacity ?? 0.45 }}
          />
        </div>
      )}

      {/* Main Banner Content */}
      <div className="relative z-10 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <TextQBoardIconSvg size={46} />
          <div>
            <div className="flex items-center gap-2">
              {showTitle ? (
                <h1
                  className="text-base font-bold tracking-tight text-white"
                  style={{ color: accentColor }}
                >
                  {titleText}
                </h1>
              ) : isBlankBoard ? (
                <span className="text-xs text-[#9aa0a6] italic">
                  [Blank Minimalist Board]
                </span>
              ) : (
                <span className="text-xs text-[#9aa0a6] italic">
                  [Banner Name Hidden]
                </span>
              )}

              {showBadge && badgeText && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#a8c7fa]/20 text-[#a8c7fa] border border-[#a8c7fa]/30">
                  {badgeText}
                </span>
              )}
            </div>

            {showSubtitle && subtitleText && (
              <p className="text-[11px] text-[#c4c6d0] mt-0.5 max-w-md line-clamp-1">
                {subtitleText}
              </p>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-1.5 shrink-0">
          {onOpenBoardStudio && (
            <button
              type="button"
              onClick={onOpenBoardStudio}
              className="px-3 py-1.5 rounded-full bg-[#232936] hover:bg-[#2c3444] text-xs font-semibold text-[#a8c7fa] flex items-center gap-1.5 transition-colors border border-white/10"
              title="Customize Board & Banners"
            >
              <span>🎨</span>
              <span className="hidden sm:inline">Customize Board</span>
            </button>
          )}

          {onOpenSoundStudio && (
            <button
              type="button"
              onClick={onOpenSoundStudio}
              className="px-2.5 py-1.5 rounded-full bg-[#232936] hover:bg-[#2c3444] text-xs font-medium text-[#c4c6d0] hover:text-white flex items-center gap-1 transition-colors"
              title="Typing Sound & Music"
            >
              <span>🎵</span>
            </button>
          )}

          {onOpenVoice && (
            <button
              type="button"
              onClick={onOpenVoice}
              className="px-3 py-1.5 rounded-full bg-[#a8c7fa] hover:bg-[#b8d2fc] text-xs font-semibold text-[#062e6f] flex items-center gap-1.5 transition-colors shadow-sm"
              title="Voice Typing"
            >
              <span>🎤</span>
              <span className="hidden sm:inline">Voice</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
