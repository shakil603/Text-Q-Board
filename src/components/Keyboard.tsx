import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  ArrowUp,
  Delete,
  CornerDownLeft,
  Globe,
  Smile,
  Mic,
  Maximize2,
  X,
  ChevronLeft,
  ChevronRight,
  Move,
  Space
} from 'lucide-react';
import {
  KeyboardLayoutDef,
  KeyboardSettings,
  KeyDef,
  LanguageId,
  ThemeConfig,
  ToolbarView
} from '../types/keyboard';
import { getLayoutForLanguage, NUMBER_ROW_KEYS, SYMBOLS_1_LAYOUT, SYMBOLS_2_LAYOUT } from '../data/layouts';
import { soundEngine } from '../utils/audio';
import { matchGlideGesture } from '../utils/dictionary';

interface KeyboardProps {
  settings: KeyboardSettings;
  theme: ThemeConfig;
  onInsertText: (char: string) => void;
  onDeleteText: (count?: number) => void;
  onEnter: () => void;
  onMoveCursor: (direction: 'left' | 'right') => void;
  onLanguageChange: (langId: LanguageId) => void;
  onOpenEmojiPanel: () => void;
  onOpenVoiceModal: () => void;
  onOpenSettings: () => void;
  onToggleFloating: () => void;
  onToggleOneHanded: (side: 'left' | 'right' | 'off') => void;
}

export const Keyboard: React.FC<KeyboardProps> = ({
  settings,
  theme,
  onInsertText,
  onDeleteText,
  onEnter,
  onMoveCursor,
  onLanguageChange,
  onOpenEmojiPanel,
  onOpenVoiceModal,
  onOpenSettings,
  onToggleFloating,
  onToggleOneHanded,
}) => {
  // Mode states
  const [isShifted, setIsShifted] = useState(false);
  const [isCapsLock, setIsCapsLock] = useState(false);
  const [symbolsMode, setSymbolsMode] = useState<'none' | 'symbols_1' | 'symbols_2'>('none');
  const [pressedKey, setPressedKey] = useState<string | null>(null);
  const [popupKey, setPopupKey] = useState<{ key: KeyDef; rect: DOMRect } | null>(null);
  const [languageToast, setLanguageToast] = useState<string | null>(null);

  // Long press timer ref
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isLongPressTriggeredRef = useRef(false);

  // Spacebar swipe cursor drag state
  const isDraggingSpaceRef = useRef(false);
  const spaceStartXRef = useRef(0);

  // Backspace swipe delete state
  const isDraggingBackspaceRef = useRef(false);
  const backspaceStartXRef = useRef(0);

  // Glide Typing Canvas ref
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isGlidingRef = useRef(false);
  const glidePointsRef = useRef<{ x: number; y: number }[]>([]);

  // Active Layout
  const activeLayout: KeyboardLayoutDef = (() => {
    if (symbolsMode === 'symbols_1') return SYMBOLS_1_LAYOUT;
    if (symbolsMode === 'symbols_2') return SYMBOLS_2_LAYOUT;
    return getLayoutForLanguage(settings.activeLanguage);
  })();

  // Shift double-click for caps lock
  const lastShiftTapRef = useRef<number>(0);

  const handleShiftClick = () => {
    soundEngine.playKeyClick('special', settings.soundOnKeypress ? settings.soundVolume : 0);
    if (settings.hapticFeedback) soundEngine.triggerHaptic(8);

    const now = Date.now();
    if (now - lastShiftTapRef.current < 350) {
      // Double tap = Caps Lock
      setIsCapsLock(!isCapsLock);
      setIsShifted(true);
    } else {
      if (isCapsLock) {
        setIsCapsLock(false);
        setIsShifted(false);
      } else {
        setIsShifted(!isShifted);
      }
    }
    lastShiftTapRef.current = now;
  };

  // Switch Language (Globe key)
  const handleNextLanguage = () => {
    soundEngine.playKeyClick('special', settings.soundOnKeypress ? settings.soundVolume : 0);
    const enabled = settings.enabledLanguages;
    if (enabled.length <= 1) return;

    const currentIdx = enabled.indexOf(settings.activeLanguage);
    const nextIdx = (currentIdx + 1) % enabled.length;
    const nextLang = enabled[nextIdx];
    onLanguageChange(nextLang);

    // Show toast
    const langNames: Record<string, string> = {
      en_us: 'English (US)',
      bn_phonetic: 'বাংলা (Phonetic)',
      bn_jatiya: 'বাংলা (জাতীয়)',
      bn_probhat: 'বাংলা (प्रभात)',
      es_es: 'Español',
      fr_fr: 'Français',
      de_de: 'Deutsch',
      ar_sa: 'العربية',
      hi_in: 'हिन्दी',
      ru_ru: 'Русский',
    };
    setLanguageToast(langNames[nextLang] || nextLang);
    setTimeout(() => setLanguageToast(null), 1200);
  };

  // Handle standard key tap
  const handleKeyTap = (key: KeyDef) => {
    if (isLongPressTriggeredRef.current) return;

    if (settings.hapticFeedback) soundEngine.triggerHaptic(10);

    if (key.actionId) {
      if (key.actionId === 'switch_symbols_1') setSymbolsMode('symbols_1');
      if (key.actionId === 'switch_symbols_2') setSymbolsMode('symbols_2');
      if (key.actionId === 'switch_letters') setSymbolsMode('none');
      soundEngine.playKeyClick('special', settings.soundOnKeypress ? settings.soundVolume : 0);
      return;
    }

    switch (key.type) {
      case 'shift':
        handleShiftClick();
        break;

      case 'backspace':
        soundEngine.playKeyClick('backspace', settings.soundOnKeypress ? settings.soundVolume : 0);
        onDeleteText(1);
        break;

      case 'enter':
        soundEngine.playKeyClick('enter', settings.soundOnKeypress ? settings.soundVolume : 0);
        onEnter();
        break;

      case 'space':
        soundEngine.playKeyClick('space', settings.soundOnKeypress ? settings.soundVolume : 0);
        onInsertText(' ');
        break;

      case 'symbols':
        soundEngine.playKeyClick('special', settings.soundOnKeypress ? settings.soundVolume : 0);
        setSymbolsMode(symbolsMode === 'none' ? 'symbols_1' : 'none');
        break;

      case 'globe':
        handleNextLanguage();
        break;

      case 'emoji':
        soundEngine.playKeyClick('special', settings.soundOnKeypress ? settings.soundVolume : 0);
        onOpenEmojiPanel();
        break;

      case 'voice':
        soundEngine.playKeyClick('special', settings.soundOnKeypress ? settings.soundVolume : 0);
        onOpenVoiceModal();
        break;

      case 'char':
      default:
        soundEngine.playKeyClick('standard', settings.soundOnKeypress ? settings.soundVolume : 0);
        const char = (isShifted || isCapsLock) ? key.primary.toUpperCase() : key.primary.toLowerCase();
        onInsertText(char);

        // Turn off shift after 1 character if not in caps lock
        if (isShifted && !isCapsLock) {
          setIsShifted(false);
        }
        break;
    }
  };

  // Long press start
  const handleKeyPointerDown = (key: KeyDef, e: React.PointerEvent<HTMLButtonElement>) => {
    setPressedKey(key.primary);
    isLongPressTriggeredRef.current = false;

    // If spacebar, initialize cursor drag tracking
    if (key.type === 'space' && settings.gestureCursorControl) {
      isDraggingSpaceRef.current = true;
      spaceStartXRef.current = e.clientX;
    }

    // If backspace, initialize swipe delete tracking
    if (key.type === 'backspace' && settings.gestureDelete) {
      isDraggingBackspaceRef.current = true;
      backspaceStartXRef.current = e.clientX;
    }

    // Long press for popup characters / numbers
    if (key.popup && key.popup.length > 0) {
      const rect = e.currentTarget.getBoundingClientRect();
      longPressTimerRef.current = setTimeout(() => {
        isLongPressTriggeredRef.current = true;
        setPopupKey({ key, rect });
        if (settings.hapticFeedback) soundEngine.triggerHaptic(20);
      }, settings.longPressDelay || 350);
    }
  };

  const handleKeyPointerUp = () => {
    setPressedKey(null);
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
    }
    isDraggingSpaceRef.current = false;
    isDraggingBackspaceRef.current = false;
  };

  // Pointer move on spacebar or backspace
  const handlePointerMove = (e: React.PointerEvent) => {
    // Spacebar cursor move
    if (isDraggingSpaceRef.current) {
      const deltaX = e.clientX - spaceStartXRef.current;
      if (Math.abs(deltaX) > 16) {
        if (deltaX > 0) {
          onMoveCursor('right');
        } else {
          onMoveCursor('left');
        }
        spaceStartXRef.current = e.clientX;
        if (settings.hapticFeedback) soundEngine.triggerHaptic(5);
      }
    }

    // Backspace swipe delete
    if (isDraggingBackspaceRef.current) {
      const deltaX = backspaceStartXRef.current - e.clientX;
      if (deltaX > 35) {
        onDeleteText(1);
        backspaceStartXRef.current = e.clientX;
        if (settings.hapticFeedback) soundEngine.triggerHaptic(12);
      }
    }
  };

  // --- GLIDE TYPING ENGINE (SWIPE ON KEYBOARD) ---
  const handleGlidePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!settings.glideTyping) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    isGlidingRef.current = true;
    glidePointsRef.current = [{ x, y }];
  };

  const handleGlidePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isGlidingRef.current || !settings.glideTyping) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    glidePointsRef.current.push({ x, y });

    // Draw neon trail
    if (settings.showGestureTrail) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = theme.trailColor || '#06b6d4';
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.shadowColor = theme.trailColor || '#06b6d4';
        ctx.shadowBlur = 10;

        ctx.beginPath();
        const pts = glidePointsRef.current;
        if (pts.length > 0) {
          ctx.moveTo(pts[0].x, pts[0].y);
          for (let i = 1; i < pts.length; i++) {
            ctx.lineTo(pts[i].x, pts[i].y);
          }
        }
        ctx.stroke();
      }
    }
  };

  const handleGlidePointerUp = () => {
    if (!isGlidingRef.current) return;
    isGlidingRef.current = false;

    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    if (glidePointsRef.current.length > 6) {
      const rect = canvas?.getBoundingClientRect();
      if (rect) {
        // Normalize points
        const normalized = glidePointsRef.current.map((p) => ({
          x: p.x / rect.width,
          y: p.y / rect.height,
        }));
        const matchedWord = matchGlideGesture(normalized);
        if (matchedWord) {
          onInsertText(matchedWord + ' ');
          soundEngine.playKeyClick('standard', settings.soundOnKeypress ? settings.soundVolume : 0);
          if (settings.hapticFeedback) soundEngine.triggerHaptic(15);
        }
      }
    }
    glidePointsRef.current = [];
  };

  // Close long-press popup when tapping anywhere outside
  useEffect(() => {
    const handleGlobalClick = () => {
      if (popupKey) setPopupKey(null);
    };
    window.addEventListener('pointerup', handleGlobalClick);
    return () => window.removeEventListener('pointerup', handleGlobalClick);
  }, [popupKey]);

  return (
    <div
      onPointerMove={handlePointerMove}
      className={`relative w-full select-none transition-all duration-200 pb-2 ${theme.boardBg} ${
        settings.oneHandedMode === 'left'
          ? 'max-w-[85%] mr-auto'
          : settings.oneHandedMode === 'right'
          ? 'max-w-[85%] ml-auto'
          : 'w-full'
      }`}
    >
      {/* Toast popup for language change */}
      {languageToast && (
        <div className="absolute top-2 left-1/2 -translate-x-1/2 z-40 px-3 py-1 rounded-full bg-cyan-950 text-cyan-200 text-xs font-bold border border-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.4)] animate-bounce">
          {languageToast}
        </div>
      )}

      {/* Floating Keyboard Drag Header (if floating) */}
      {settings.isFloating && (
        <div className="h-6 w-full flex items-center justify-between px-2 bg-black/40 border-b border-white/5 cursor-grab">
          <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1">
            <Move className="w-3 h-3 text-cyan-400" />
            <span>Floating Text Q Board</span>
          </span>
          <button
            onClick={onToggleFloating}
            className="p-0.5 rounded text-slate-400 hover:text-white"
          >
            <Maximize2 className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* One-Handed Mode Side Controls */}
      {settings.oneHandedMode !== 'off' && (
        <div
          className={`absolute top-0 bottom-0 flex flex-col justify-around py-6 z-30 px-1 ${
            settings.oneHandedMode === 'left' ? 'left-[86%]' : 'right-[86%]'
          }`}
        >
          <button
            onClick={() => onToggleOneHanded('off')}
            className="w-8 h-8 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center shadow-md hover:bg-cyan-900 active:scale-95"
            title="Expand to Full Keyboard"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() =>
              onToggleOneHanded(settings.oneHandedMode === 'left' ? 'right' : 'left')
            }
            className="w-8 h-8 rounded-full bg-slate-800 text-cyan-300 flex items-center justify-center shadow-md hover:bg-cyan-900 active:scale-95"
            title="Switch Side"
          >
            {settings.oneHandedMode === 'left' ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>
        </div>
      )}

      {/* Gesture Glide Canvas Overlay */}
      <canvas
        ref={canvasRef}
        width={400}
        height={220}
        className="absolute inset-0 pointer-events-none z-20 w-full h-full"
      />

      {/* Keyboard Key Rows Container */}
      <div
        onPointerDown={handleGlidePointerDown}
        onPointerMove={handleGlidePointerMove}
        onPointerUp={handleGlidePointerUp}
        className="flex flex-col gap-1.5 p-1.5 pt-2 relative z-10"
      >
        {/* OPTIONAL NUMBER ROW (1-9-0) */}
        {settings.showNumberRow && symbolsMode === 'none' && (
          <div className="flex gap-1 justify-center w-full">
            {NUMBER_ROW_KEYS.map((key) => (
              <button
                key={key.primary}
                onClick={() => handleKeyTap({ primary: key.primary, type: 'char' })}
                className={`flex-1 h-10 rounded-lg text-sm font-semibold flex flex-col items-center justify-center transition-all ${theme.keyBg} ${
                  settings.keyBorders ? theme.keyBorder : ''
                } ${theme.textPrimary} hover:brightness-125 active:scale-95`}
              >
                <span>{key.primary}</span>
              </button>
            ))}
          </div>
        )}

        {/* MAIN KEYBOARD ROWS */}
        {activeLayout.rows.map((row, rowIdx) => (
          <div key={rowIdx} className="flex gap-1 justify-center w-full">
            {row.keys.map((key, keyIdx) => {
              const isSpecial =
                key.type === 'shift' ||
                key.type === 'backspace' ||
                key.type === 'enter' ||
                key.type === 'symbols' ||
                key.type === 'globe';

              const flexBasis = key.width ? `${key.width * 10}%` : '9%';
              const isSpace = key.type === 'space';
              const isShift = key.type === 'shift';

              const displayPrimary = (() => {
                if (key.type === 'char') {
                  return isShifted || isCapsLock ? key.primary.toUpperCase() : key.primary.toLowerCase();
                }
                return key.primary;
              })();

              return (
                <button
                  key={`${key.primary}-${keyIdx}`}
                  style={{ flex: key.width || 1 }}
                  onPointerDown={(e) => handleKeyPointerDown(key, e)}
                  onPointerUp={handleKeyPointerUp}
                  onClick={() => handleKeyTap(key)}
                  className={`relative h-11 rounded-lg flex flex-col items-center justify-center select-none font-medium transition-transform active:scale-95 ${
                    isSpecial ? theme.keySpecialBg : theme.keyBg
                  } ${settings.keyBorders ? theme.keyBorder : ''} ${
                    pressedKey === key.primary ? theme.keyGlow : ''
                  } ${
                    isShift && (isShifted || isCapsLock)
                      ? 'bg-cyan-500 text-slate-950 shadow-[0_0_15px_#22d3ee]'
                      : isSpecial
                      ? theme.textSecondary
                      : theme.textPrimary
                  } hover:brightness-110 active:brightness-90`}
                >
                  {/* Secondary small label on key top right */}
                  {key.secondary && symbolsMode === 'none' && !isShifted && !isCapsLock && (
                    <span className="absolute top-0.5 right-1 text-[9px] text-cyan-300/50 font-mono">
                      {key.secondary}
                    </span>
                  )}

                  {/* Primary Key Content */}
                  {isShift ? (
                    <div className="flex flex-col items-center justify-center">
                      <ArrowUp
                        className={`w-4 h-4 ${
                          isCapsLock ? 'stroke-[3]' : 'stroke-[2]'
                        }`}
                      />
                      {isCapsLock && (
                        <div className="w-1.5 h-1.5 rounded-full bg-cyan-900 mt-0.5" />
                      )}
                    </div>
                  ) : key.type === 'backspace' ? (
                    <Delete className="w-5 h-5 text-cyan-200" />
                  ) : key.type === 'enter' ? (
                    <CornerDownLeft className="w-5 h-5 text-cyan-300" />
                  ) : key.type === 'globe' ? (
                    <Globe className="w-4 h-4 text-cyan-300" />
                  ) : isSpace ? (
                    <div className="flex items-center gap-1 text-xs text-slate-400/80 font-normal">
                      <span>{displayPrimary}</span>
                    </div>
                  ) : (
                    <span className="text-base font-medium">{displayPrimary}</span>
                  )}

                  {/* Keypress Pop-up Preview Bubble */}
                  {settings.popupOnKeypress && pressedKey === key.primary && !isSpecial && (
                    <div
                      className={`absolute -top-12 left-1/2 -translate-x-1/2 w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold z-50 pointer-events-none animate-in zoom-in-75 ${theme.previewBg}`}
                    >
                      {displayPrimary}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* LONG-PRESS POPUP MENU (Accents & Numbers) */}
      {popupKey && (
        <div
          style={{
            top: `${popupKey.rect.top - 55}px`,
            left: `${popupKey.rect.left - 20}px`,
          }}
          className="fixed z-50 flex items-center gap-1 p-1.5 rounded-2xl bg-slate-900 border border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.6)] animate-in fade-in zoom-in-95"
        >
          {popupKey.key.popup?.map((char) => (
            <button
              key={char}
              onClick={(e) => {
                e.stopPropagation();
                onInsertText(char);
                setPopupKey(null);
                soundEngine.playKeyClick('standard', settings.soundOnKeypress ? settings.soundVolume : 0);
              }}
              className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-cyan-500 hover:text-slate-950 text-white font-bold text-sm flex items-center justify-center transition-all active:scale-95"
            >
              {char}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
