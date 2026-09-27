import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Delete,
  CornerDownLeft,
  Globe,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Move
} from 'lucide-react';
import {
  KeyDef,
  KeyboardSettings,
  LanguageId,
  ThemeConfig
} from '../types/keyboard';
import {
  getLayoutForLanguage,
  NUMBER_ROW_KEYS,
  SYMBOLS_1_LAYOUT,
  SYMBOLS_2_LAYOUT
} from '../data/layouts';
import { soundEngine } from '../utils/audio';
import { matchGlideGesture } from '../utils/dictionary';
import { showAndroidInputMethodPicker } from '../utils/androidBridge';
import { BoardBackground } from './BoardBackground';

interface KeyboardProps {
  settings: KeyboardSettings;
  theme: ThemeConfig;
  onInsertText: (char: string) => void;
  onSpacebar?: () => void;
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

const LANGUAGE_LABELS: Record<string, string> = {
  en_us: 'English (US)',
  en_gb: 'English (UK)',
  bn_phonetic: 'বাংলা • English',
  bn_jatiya: 'বাংলা (জাতীয়)',
  bn_probhat: 'বাংলা (प्रभात)',
  es_es: 'Español',
  pt_br: 'Português',
  fr_fr: 'Français',
  de_de: 'Deutsch',
  ar_sa: 'العربية',
  ur_pk: 'اردو',
  fa_ir: 'فارسی',
  hi_in: 'हिन्दी',
  ta_in: 'தமிழ்',
  te_in: 'తెలుగు',
  ja_jp: '日本語',
  zh_cn: '中文',
  ko_kr: '한국어',
  ru_ru: 'Русский',
  it_it: 'Italiano',
  tr_tr: 'Türkçe',
  id_id: 'Bahasa Indonesia',
  vi_vn: 'Tiếng Việt',
  th_th: 'ไทย',
  nl_nl: 'Nederlands',
  pl_pl: 'Polski',
  sv_se: 'Svenska',
};

export const Keyboard: React.FC<KeyboardProps> = ({
  settings,
  theme,
  onInsertText,
  onSpacebar,
  onDeleteText,
  onEnter,
  onMoveCursor,
  onLanguageChange,
  onOpenEmojiPanel,
  onOpenSettings,
  onToggleFloating,
  onToggleOneHanded,
}) => {
  // Shift & Caps Lock State
  const [isShifted, setIsShifted] = useState(false);
  const [isCapsLock, setIsCapsLock] = useState(false);
  const lastShiftTapRef = useRef<number>(0);

  // Symbols Layer State: 'none' | 'sym1' | 'sym2'
  const [symbolsMode, setSymbolsMode] = useState<'none' | 'sym1' | 'sym2'>('none');

  // Active Pressed Key (for flat active state & Gboard key-press preview bubble)
  const [pressedKeyId, setPressedKeyId] = useState<string | null>(null);
  const [pressedCharPreview, setPressedCharPreview] = useState<{
    char: string;
    keyId: string;
  } | null>(null);

  // Long Press Popup Menu State
  const [popupKey, setPopupKey] = useState<{
    key: KeyDef;
    rect: DOMRect;
  } | null>(null);
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isLongPressTriggeredRef = useRef(false);

  // Continuous Backspace Hold Repeat Timer
  const backspaceHoldDelayRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const backspaceRepeatIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Spacebar Cursor Control Drag State
  const spaceStartXRef = useRef<number>(0);
  const isDraggingSpaceRef = useRef(false);
  const didMoveSpaceCursorRef = useRef(false);

  // Backspace Gesture Delete State
  const backspaceStartXRef = useRef<number>(0);
  const isDraggingBackspaceRef = useRef(false);

  // Double Space Period Tracking
  const lastSpaceTapRef = useRef<number>(0);

  // Glide Typing Trail Canvas
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isGlidingRef = useRef(false);
  const glidePointsRef = useRef<{ x: number; y: number }[]>([]);

  // Language switch toast
  const [languageToast, setLanguageToast] = useState<string | null>(null);

  // Determine current active layout
  const activeLayout = (() => {
    if (symbolsMode === 'sym1') return SYMBOLS_1_LAYOUT;
    if (symbolsMode === 'sym2') return SYMBOLS_2_LAYOUT;
    return getLayoutForLanguage(settings.activeLanguage);
  })();

  const clearTimers = useCallback(() => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    if (backspaceHoldDelayRef.current) {
      clearTimeout(backspaceHoldDelayRef.current);
      backspaceHoldDelayRef.current = null;
    }
    if (backspaceRepeatIntervalRef.current) {
      clearInterval(backspaceRepeatIntervalRef.current);
      backspaceRepeatIntervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => clearTimers();
  }, [clearTimers]);

  // Switch to next enabled language
  const handleCycleLanguage = () => {
    const enabled =
      settings.enabledLanguages.length > 0
        ? settings.enabledLanguages
        : (['en_us', 'bn_phonetic'] as LanguageId[]);
    const currentIndex = enabled.indexOf(settings.activeLanguage);
    const nextIndex = (currentIndex + 1) % enabled.length;
    const nextLang = enabled[nextIndex];
    onLanguageChange(nextLang);
    setSymbolsMode('none');

    setLanguageToast(LANGUAGE_LABELS[nextLang] || nextLang.toUpperCase());
    setTimeout(() => setLanguageToast(null), 1100);
  };

  // Handle key action execution
  const executeKeyAction = (key: KeyDef) => {
    if (isLongPressTriggeredRef.current) {
      isLongPressTriggeredRef.current = false;
      return;
    }

    if (settings.hapticFeedback) {
      soundEngine.triggerHaptic(10);
    }

    // Custom actionIds for symbol switching
    if (key.actionId === 'switch_symbols_2') {
      soundEngine.playKeyClick('special', settings.soundOnKeypress ? settings.soundVolume : 0, settings.soundProfile);
      setSymbolsMode('sym2');
      return;
    }
    if (key.actionId === 'switch_symbols_1') {
      soundEngine.playKeyClick('special', settings.soundOnKeypress ? settings.soundVolume : 0, settings.soundProfile);
      setSymbolsMode('sym1');
      return;
    }
    if (key.actionId === 'switch_letters') {
      soundEngine.playKeyClick('special', settings.soundOnKeypress ? settings.soundVolume : 0, settings.soundProfile);
      setSymbolsMode('none');
      return;
    }

    const type = key.type || 'char';

    switch (type) {
      case 'shift': {
        soundEngine.playKeyClick('special', settings.soundOnKeypress ? settings.soundVolume : 0, settings.soundProfile);
        const now = Date.now();
        if (now - lastShiftTapRef.current < 300) {
          setIsCapsLock(true);
          setIsShifted(true);
        } else if (isCapsLock) {
          setIsCapsLock(false);
          setIsShifted(false);
        } else {
          setIsShifted(!isShifted);
        }
        lastShiftTapRef.current = now;
        break;
      }

      case 'backspace':
        // Handled immediately on pointerDown + repeat interval
        break;

      case 'enter':
        soundEngine.playKeyClick('enter', settings.soundOnKeypress ? settings.soundVolume : 0, settings.soundProfile);
        onEnter();
        break;

      case 'space': {
        if (didMoveSpaceCursorRef.current) {
          didMoveSpaceCursorRef.current = false;
          return;
        }
        soundEngine.playKeyClick('space', settings.soundOnKeypress ? settings.soundVolume : 0, settings.soundProfile);
        const now = Date.now();
        if (settings.doubleSpacePeriod && now - lastSpaceTapRef.current < 280) {
          onDeleteText(1);
          onInsertText('. ');
          lastSpaceTapRef.current = 0;
          return;
        }
        lastSpaceTapRef.current = now;

        if (onSpacebar) {
          onSpacebar();
        } else {
          onInsertText(' ');
        }
        break;
      }

      case 'symbols':
        soundEngine.playKeyClick('special', settings.soundOnKeypress ? settings.soundVolume : 0, settings.soundProfile);
        setSymbolsMode((prev) => (prev === 'none' ? 'sym1' : 'none'));
        break;

      case 'globe':
        soundEngine.playKeyClick('special', settings.soundOnKeypress ? settings.soundVolume : 0, settings.soundProfile);
        handleCycleLanguage();
        break;

      case 'emoji':
        soundEngine.playKeyClick('special', settings.soundOnKeypress ? settings.soundVolume : 0, settings.soundProfile);
        onOpenEmojiPanel();
        break;

      case 'char':
      default: {
        soundEngine.playKeyClick('standard', settings.soundOnKeypress ? settings.soundVolume : 0, settings.soundProfile);
        let charToInsert = key.primary;

        if (isShifted || isCapsLock) {
          if (
            key.secondary &&
            (settings.activeLanguage === 'bn_jatiya' || settings.activeLanguage === 'bn_probhat')
          ) {
            charToInsert = key.secondary;
          } else {
            charToInsert = key.primary.toUpperCase();
          }
        }

        onInsertText(charToInsert);

        if (isShifted && !isCapsLock) {
          setIsShifted(false);
        }
        break;
      }
    }
  };

  // Pointer Down on a key
  const handleKeyPointerDown = (
    key: KeyDef,
    keyId: string,
    displayChar: string,
    e: React.PointerEvent<HTMLButtonElement>
  ) => {
    clearTimers();
    setPressedKeyId(keyId);
    isLongPressTriggeredRef.current = false;

    const type = key.type || 'char';

    // Show Gboard Key Preview Bubble for character keys
    if (
      settings.popupOnKeypress &&
      type === 'char' &&
      !key.actionId &&
      displayChar.length <= 2
    ) {
      setPressedCharPreview({ char: displayChar, keyId });
    } else {
      setPressedCharPreview(null);
    }

    // Immediate delete + continuous repeat when holding Backspace
    if (type === 'backspace') {
      soundEngine.playKeyClick('backspace', settings.soundOnKeypress ? settings.soundVolume : 0, settings.soundProfile);
      if (settings.hapticFeedback) soundEngine.triggerHaptic(10);
      onDeleteText(1);

      if (settings.gestureDelete) {
        isDraggingBackspaceRef.current = true;
        backspaceStartXRef.current = e.clientX;
      }

      backspaceHoldDelayRef.current = setTimeout(() => {
        backspaceRepeatIntervalRef.current = setInterval(() => {
          onDeleteText(1);
        }, 55);
      }, 320);
      return;
    }

    // Spacebar cursor slide setup
    if (type === 'space' && settings.gestureCursorControl) {
      isDraggingSpaceRef.current = true;
      didMoveSpaceCursorRef.current = false;
      spaceStartXRef.current = e.clientX;
    }

    // Long press on Globe key opens Android Input Method Picker
    if (type === 'globe') {
      longPressTimerRef.current = setTimeout(() => {
        isLongPressTriggeredRef.current = true;
        setPressedKeyId(null);
        if (settings.hapticFeedback) soundEngine.triggerHaptic(18);
        const opened = showAndroidInputMethodPicker();
        if (!opened) {
          onOpenSettings();
        }
      }, settings.longPressDelay || 350);
      return;
    }

    // Long press for popup characters / numbers
    if (key.popup && key.popup.length > 0) {
      const rect = e.currentTarget.getBoundingClientRect();
      longPressTimerRef.current = setTimeout(() => {
        isLongPressTriggeredRef.current = true;
        setPressedCharPreview(null);
        setPopupKey({ key, rect });
        if (settings.hapticFeedback) soundEngine.triggerHaptic(18);
      }, settings.longPressDelay || 350);
    } else if (key.secondary && symbolsMode === 'none') {
      // If a key has a secondary character (e.g., top row numbers 1-0), long press inserts it directly
      const rect = e.currentTarget.getBoundingClientRect();
      longPressTimerRef.current = setTimeout(() => {
        isLongPressTriggeredRef.current = true;
        setPressedCharPreview(null);
        setPopupKey({
          key: { ...key, popup: [key.secondary!] },
          rect,
        });
        if (settings.hapticFeedback) soundEngine.triggerHaptic(18);
      }, settings.longPressDelay || 350);
    }
  };

  const handleKeyPointerUp = (key: KeyDef) => {
    setPressedKeyId(null);
    setPressedCharPreview(null);
    clearTimers();

    if (!isGlidingRef.current || glidePointsRef.current.length <= 6) {
      executeKeyAction(key);
    }

    isDraggingSpaceRef.current = false;
    isDraggingBackspaceRef.current = false;
  };

  const handleKeyPointerLeave = () => {
    setPressedKeyId(null);
    setPressedCharPreview(null);
    if (backspaceHoldDelayRef.current || backspaceRepeatIntervalRef.current) {
      clearTimers();
    }
  };

  // Pointer move on spacebar or backspace
  const handlePointerMove = (e: React.PointerEvent) => {
    if (isDraggingSpaceRef.current) {
      const deltaX = e.clientX - spaceStartXRef.current;
      if (Math.abs(deltaX) > 14) {
        didMoveSpaceCursorRef.current = true;
        if (deltaX > 0) {
          onMoveCursor('right');
        } else {
          onMoveCursor('left');
        }
        spaceStartXRef.current = e.clientX;
        if (settings.hapticFeedback) soundEngine.triggerHaptic(5);
      }
    }

    if (isDraggingBackspaceRef.current) {
      const deltaX = backspaceStartXRef.current - e.clientX;
      if (deltaX > 28) {
        onDeleteText(1);
        backspaceStartXRef.current = e.clientX;
        if (settings.hapticFeedback) soundEngine.triggerHaptic(8);
      }
    }
  };

  // --- GLIDE TYPING ENGINE ---
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

    if (glidePointsRef.current.length > 6) {
      setPressedCharPreview(null);
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
        longPressTimerRef.current = null;
      }
    }

    if (settings.showGestureTrail && glidePointsRef.current.length > 3) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = theme.trailColor || '#a8c7fa';
        ctx.lineWidth = 3.5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        ctx.beginPath();
        const pts = glidePointsRef.current;
        ctx.moveTo(pts[0].x, pts[0].y);
        for (let i = 1; i < pts.length; i++) {
          ctx.lineTo(pts[i].x, pts[i].y);
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

    if (glidePointsRef.current.length > 8) {
      const rect = canvas?.getBoundingClientRect();
      if (rect) {
        const normalized = glidePointsRef.current.map((p) => ({
          x: p.x / rect.width,
          y: p.y / rect.height,
        }));
        const matchedWord = matchGlideGesture(normalized);
        if (matchedWord) {
          onInsertText(matchedWord + ' ');
          soundEngine.playKeyClick('standard', settings.soundOnKeypress ? settings.soundVolume : 0);
          if (settings.hapticFeedback) soundEngine.triggerHaptic(12);
        }
      }
    }
    glidePointsRef.current = [];
  };

  // Close long-press popup when tapping outside
  useEffect(() => {
    const handleGlobalClick = () => {
      if (popupKey) setPopupKey(null);
    };
    window.addEventListener('pointerup', handleGlobalClick);
    return () => window.removeEventListener('pointerup', handleGlobalClick);
  }, [popupKey]);

  const rowHeightClass =
    settings.keyboardHeight === 'short'
      ? 'h-[41px]'
      : settings.keyboardHeight === 'tall'
      ? 'h-[50px]'
      : 'h-[45px]';

  return (
    <div
      onPointerMove={handlePointerMove}
      className={`relative w-full select-none pb-1.5 pt-1 overflow-hidden ${
        !settings.customColors?.useCustomColors && !settings.isBlankBoard
          ? theme.boardBg
          : ''
      } ${
        settings.oneHandedMode === 'left'
          ? 'max-w-[84%] mr-auto'
          : settings.oneHandedMode === 'right'
          ? 'max-w-[84%] ml-auto'
          : 'w-full'
      }`}
    >
      {/* Dynamic Animated Board Background, Wallpapers & Canvas FX */}
      <BoardBackground
        theme={theme}
        animation={settings.boardAnimation || 'none'}
        animationSpeed={settings.animationSpeed || 1}
        mediaBackground={settings.mediaBackground}
        customColors={settings.customColors}
        isBlankBoard={settings.isBlankBoard}
      />

      {/* Language Switch Pill Toast */}
      {languageToast && (
        <div className="absolute top-2 left-1/2 -translate-x-1/2 z-40 px-3.5 py-1 rounded-full bg-[#2f3036] text-[#e3e2e6] text-xs font-medium shadow-md border border-white/10">
          {languageToast}
        </div>
      )}

      {/* Floating Keyboard Header */}
      {settings.isFloating && (
        <div className="h-6 w-full flex items-center justify-between px-3 bg-black/20 border-b border-white/5">
          <span className="text-[11px] text-[#c4c6d0] font-medium flex items-center gap-1.5">
            <Move className="w-3 h-3" />
            <span>Floating Keyboard</span>
          </span>
          <button
            onClick={onToggleFloating}
            className="p-0.5 rounded text-[#c4c6d0] hover:text-white"
          >
            <Maximize2 className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* One-Handed Mode Side Gutter Controls */}
      {settings.oneHandedMode !== 'off' && (
        <div
          className={`absolute top-0 bottom-0 flex flex-col justify-around py-6 z-30 px-1 ${
            settings.oneHandedMode === 'left' ? 'left-[85%]' : 'right-[85%]'
          }`}
        >
          <button
            onClick={() => onToggleOneHanded('off')}
            className="w-8 h-8 rounded-full bg-[#2f3036] text-[#e3e2e6] flex items-center justify-center"
            title="Full Width Keyboard"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() =>
              onToggleOneHanded(settings.oneHandedMode === 'left' ? 'right' : 'left')
            }
            className="w-8 h-8 rounded-full bg-[#2f3036] text-[#a8c7fa] flex items-center justify-center"
            title="Switch Hand Side"
          >
            {settings.oneHandedMode === 'left' ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>
        </div>
      )}

      {/* Glide Typing Trail Canvas */}
      <canvas
        ref={canvasRef}
        width={400}
        height={240}
        className="absolute inset-0 pointer-events-none z-20 w-full h-full"
      />

      {/* Keyboard Rows Container (Exact Gboard Spacing & Proportions) */}
      <div
        onPointerDown={handleGlidePointerDown}
        onPointerMove={handleGlidePointerMove}
        onPointerUp={handleGlidePointerUp}
        className="flex flex-col gap-[6px] px-1.5 relative z-10"
      >
        {/* NUMBER ROW (1 2 3 4 5 6 7 8 9 0) */}
        {settings.showNumberRow && symbolsMode === 'none' && (
          <div className="flex gap-[5px] justify-center w-full">
            {NUMBER_ROW_KEYS.map((key, idx) => {
              const keyId = `num-${idx}`;
              const isPressed = pressedKeyId === keyId;
              return (
                <button
                  key={key.primary}
                  type="button"
                  onPointerDown={(e) =>
                    handleKeyPointerDown(
                      { primary: key.primary, type: 'char' },
                      keyId,
                      key.primary,
                      e
                    )
                  }
                  onPointerUp={() => handleKeyPointerUp({ primary: key.primary, type: 'char' })}
                  onPointerLeave={handleKeyPointerLeave}
                  className={`relative flex-1 h-[38px] rounded-[6px] text-[15px] font-normal flex items-center justify-center select-none transition-colors duration-75 ${
                    isPressed ? theme.keyActiveBg : theme.keyBg
                  } ${settings.keyBorders ? theme.keyBorder : ''} ${theme.textPrimary}`}
                >
                  {pressedCharPreview?.keyId === keyId && (
                    <div
                      className={`absolute -top-12 left-1/2 -translate-x-1/2 w-11 h-12 rounded-xl flex items-center justify-center text-xl font-medium z-50 pointer-events-none ${theme.previewBg}`}
                    >
                      {pressedCharPreview.char}
                    </div>
                  )}
                  <span>{key.primary}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* MAIN KEYBOARD ROWS */}
        {activeLayout.rows.map((row, rowIdx) => {
          // Authentic Gboard Row 2 stagger: 9-key middle alphabet rows get 4.8% side padding
          const isNineKeyAlphabetRow =
            rowIdx === 1 &&
            row.keys.length === 9 &&
            row.keys.every((k) => !k.type || k.type === 'char');

          return (
            <div
              key={rowIdx}
              className={`flex gap-[5px] justify-center w-full ${
                isNineKeyAlphabetRow ? 'px-[4.8%]' : ''
              }`}
            >
              {row.keys.map((key, keyIdx) => {
                const keyId = `r${rowIdx}-k${keyIdx}`;
                const isPressed = pressedKeyId === keyId;
                const type = key.type || 'char';

                const isEnter = type === 'enter';
                const isShift = type === 'shift';
                const isBackspace = type === 'backspace';
                const isSpace = type === 'space';
                const isGlobe = type === 'globe';
                const isSymbols = type === 'symbols' || Boolean(key.actionId);
                const isPunctuationSideKey =
                  rowIdx === 3 && (key.primary === ',' || key.primary === '.' || key.primary === '।' || key.primary === '্');

                const isFunctional =
                  isShift || isBackspace || isSymbols || isGlobe || isPunctuationSideKey;

                const displayPrimary = (() => {
                  if (type === 'char' && !key.actionId) {
                    if (
                      (isShifted || isCapsLock) &&
                      key.secondary &&
                      (settings.activeLanguage === 'bn_jatiya' ||
                        settings.activeLanguage === 'bn_probhat')
                    ) {
                      return key.secondary;
                    }
                    return isShifted || isCapsLock
                      ? key.primary.toUpperCase()
                      : key.primary;
                  }
                  return key.primary;
                })();

                // Determine Flat Material 3 Key Surface Color
                let surfaceClass = isPressed ? theme.keyActiveBg : theme.keyBg;
                let textClass = theme.textPrimary;
                let radiusClass = 'rounded-[6px]';

                if (isEnter) {
                  // Authentic Gboard Material You Pill Enter Key
                  surfaceClass = theme.accent;
                  textClass = theme.accentText;
                  radiusClass = 'rounded-full';
                } else if (isShift && (isShifted || isCapsLock)) {
                  surfaceClass = theme.accent;
                  textClass = theme.accentText;
                } else if (isFunctional) {
                  surfaceClass = isPressed ? theme.keySpecialActiveBg : theme.keySpecialBg;
                  textClass = theme.textSecondary;
                }

                return (
                  <button
                    key={keyId}
                    type="button"
                    style={{ flex: key.width || 1 }}
                    onPointerDown={(e) =>
                      handleKeyPointerDown(key, keyId, displayPrimary, e)
                    }
                    onPointerUp={() => handleKeyPointerUp(key)}
                    onPointerLeave={handleKeyPointerLeave}
                    className={`relative ${rowHeightClass} ${radiusClass} flex flex-col items-center justify-center select-none transition-colors duration-75 ${surfaceClass} ${
                      settings.keyBorders && !isEnter ? theme.keyBorder : ''
                    } ${textClass}`}
                  >
                    {/* Gboard Key-Press Preview Bubble */}
                    {pressedCharPreview?.keyId === keyId && (
                      <div
                        className={`absolute -top-12 left-1/2 -translate-x-1/2 min-w-[44px] h-12 px-2.5 rounded-xl flex items-center justify-center text-[22px] font-medium z-50 pointer-events-none ${theme.previewBg}`}
                      >
                        {pressedCharPreview.char}
                      </div>
                    )}

                    {/* Top-right secondary superscript label (Gboard style) */}
                    {key.secondary &&
                      symbolsMode === 'none' &&
                      !isShifted &&
                      !isCapsLock &&
                      !isFunctional && (
                        <span
                          className={`absolute top-1 right-1.5 text-[9px] leading-none opacity-65 font-normal ${theme.textSecondary}`}
                        >
                          {key.secondary}
                        </span>
                      )}

                    {/* Main Key Content */}
                    {isBackspace ? (
                      <Delete className="w-[19px] h-[19px] stroke-[1.9]" />
                    ) : isEnter ? (
                      <CornerDownLeft className="w-[19px] h-[19px] stroke-[2.2]" />
                    ) : isShift ? (
                      <div className="flex flex-col items-center justify-center">
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill={isShifted || isCapsLock ? 'currentColor' : 'none'}
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M12 4L4 13h5v6h6v-6h5L12 4z" />
                        </svg>
                        {isCapsLock && (
                          <span className="w-2.5 h-[2px] bg-current rounded-full mt-0.5" />
                        )}
                      </div>
                    ) : isGlobe ? (
                      <Globe className="w-[18px] h-[18px] stroke-[1.8]" />
                    ) : isSpace ? (
                      <span className="text-[12px] font-normal opacity-80 tracking-normal truncate max-w-[140px]">
                        {LANGUAGE_LABELS[settings.activeLanguage] || displayPrimary}
                      </span>
                    ) : isSymbols ? (
                      <span className="text-[13px] font-medium tracking-tight">
                        {displayPrimary}
                      </span>
                    ) : (
                      <span className="text-[18px] font-normal leading-none">
                        {displayPrimary}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* LONG PRESS POPUP MENU (Accents, Symbols, Settings/Emoji shortcuts) */}
      {popupKey && (
        <div
          style={{
            position: 'fixed',
            left: Math.min(
              Math.max(12, popupKey.rect.left - 16),
              window.innerWidth - 220
            ),
            top: Math.max(12, popupKey.rect.top - 52),
          }}
          className={`z-50 flex items-center gap-1 p-1.5 rounded-xl ${theme.previewBg}`}
        >
          {(popupKey.key.popup || [popupKey.key.primary]).map((char) => (
            <button
              key={char}
              type="button"
              onPointerDown={(e) => {
                e.stopPropagation();
                if (char === '⚙️') {
                  onOpenSettings();
                } else if (char === '😊') {
                  onOpenEmojiPanel();
                } else {
                  onInsertText(char);
                }
                setPopupKey(null);
                soundEngine.playKeyClick(
                  'standard',
                  settings.soundOnKeypress ? settings.soundVolume : 0
                );
              }}
              className="w-8 h-9 rounded-lg flex items-center justify-center text-sm font-medium hover:bg-white/15 active:bg-white/25 transition-colors"
            >
              {char}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
