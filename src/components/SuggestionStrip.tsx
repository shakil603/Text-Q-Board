import React from 'react';
import {
  Mic,
  Languages,
  Clipboard,
  Palette,
  Settings,
  Move,
  Smartphone,
  Wand2,
  Smile,
  ChevronLeft,
  ChevronDown,
  EyeOff,
  Music
} from 'lucide-react';
import { ThemeConfig, ToolbarView } from '../types/keyboard';

interface SuggestionStripProps {
  suggestions: string[];
  onSelectSuggestion: (word: string) => void;
  activeToolbarView: ToolbarView;
  setActiveToolbarView: (view: ToolbarView) => void;
  onStartVoiceTyping: () => void;
  onOpenSettings?: () => void;
  onHideKeyboard?: () => void;
  theme: ThemeConfig;
  incognito?: boolean;
  isTranslating?: boolean;
  onToggleFloating?: () => void;
  onToggleOneHanded?: () => void;
}

export const SuggestionStrip: React.FC<SuggestionStripProps> = ({
  suggestions,
  onSelectSuggestion,
  activeToolbarView,
  setActiveToolbarView,
  onStartVoiceTyping,
  onOpenSettings,
  onHideKeyboard,
  theme,
  incognito = false,
  onToggleOneHanded,
}) => {
  const isMenuOpen = activeToolbarView === 'more_tools';

  const handleToggleMenu = () => {
    if (activeToolbarView !== 'normal') {
      setActiveToolbarView('normal');
    } else {
      setActiveToolbarView('more_tools');
    }
  };

  return (
    <div
      className={`h-[42px] w-full flex items-center justify-between px-1.5 select-none ${theme.suggestionBg}`}
    >
      {/* Left App Grid / Back Button (Gboard Toolbar Toggle) */}
      <button
        type="button"
        onClick={handleToggleMenu}
        className={`w-9 h-8 flex items-center justify-center rounded-full transition-colors ${
          activeToolbarView !== 'normal'
            ? `${theme.suggestionActiveBg}`
            : `${theme.textSecondary} hover:bg-white/10`
        }`}
        title="Gboard Tools"
      >
        {activeToolbarView !== 'normal' ? (
          <ChevronLeft className="w-[18px] h-[18px]" />
        ) : (
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="opacity-85"
          >
            <rect x="4" y="4" width="6.5" height="6.5" rx="2" />
            <rect x="13.5" y="4" width="6.5" height="6.5" rx="2" />
            <rect x="4" y="13.5" width="6.5" height="6.5" rx="2" />
            <rect x="13.5" y="13.5" width="6.5" height="6.5" rx="2" />
          </svg>
        )}
      </button>

      {/* Incognito Indicator */}
      {incognito && (
        <div
          className="flex items-center px-1.5 text-xs opacity-70"
          title="Incognito Mode"
        >
          <EyeOff className="w-3.5 h-3.5" />
        </div>
      )}

      {/* Center Area: Word Suggestions OR Gboard Quick Action Strip */}
      {isMenuOpen || suggestions.length === 0 ? (
        <div className="flex-1 flex items-center justify-around px-1 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setActiveToolbarView('emoji_picker')}
            className={`p-2 rounded-full transition-colors ${
              activeToolbarView === 'emoji_picker'
                ? theme.suggestionActiveBg
                : `${theme.textSecondary} hover:bg-white/10`
            }`}
            title="Emojis & GIFs"
          >
            <Smile className="w-[18px] h-[18px]" />
          </button>

          <button
            type="button"
            onClick={() => setActiveToolbarView('clipboard')}
            className={`p-2 rounded-full transition-colors ${
              activeToolbarView === 'clipboard'
                ? theme.suggestionActiveBg
                : `${theme.textSecondary} hover:bg-white/10`
            }`}
            title="Clipboard"
          >
            <Clipboard className="w-[18px] h-[18px]" />
          </button>

          <button
            type="button"
            onClick={() => setActiveToolbarView('translate')}
            className={`p-2 rounded-full transition-colors ${
              activeToolbarView === 'translate'
                ? theme.suggestionActiveBg
                : `${theme.textSecondary} hover:bg-white/10`
            }`}
            title="Translate"
          >
            <Languages className="w-[18px] h-[18px]" />
          </button>

          <button
            type="button"
            onClick={() => setActiveToolbarView('sound_studio')}
            className={`p-2 rounded-full transition-colors ${
              activeToolbarView === 'sound_studio'
                ? theme.suggestionActiveBg
                : `${theme.textSecondary} hover:bg-white/10`
            }`}
            title="Sound & Music Studio"
          >
            <Music className="w-[18px] h-[18px]" />
          </button>

          <button
            type="button"
            onClick={() => setActiveToolbarView('themes')}
            className={`p-2 rounded-full transition-colors ${
              activeToolbarView === 'themes'
                ? theme.suggestionActiveBg
                : `${theme.textSecondary} hover:bg-white/10`
            }`}
            title="Themes"
          >
            <Palette className="w-[18px] h-[18px]" />
          </button>

          <button
            type="button"
            onClick={() => setActiveToolbarView('text_edit')}
            className={`p-2 rounded-full transition-colors ${
              activeToolbarView === 'text_edit'
                ? theme.suggestionActiveBg
                : `${theme.textSecondary} hover:bg-white/10`
            }`}
            title="Text Editing Cursor Control"
          >
            <Move className="w-[18px] h-[18px]" />
          </button>

          {isMenuOpen && (
            <>
              <button
                type="button"
                onClick={() => {
                  if (onToggleOneHanded) onToggleOneHanded();
                }}
                className={`p-2 rounded-full transition-colors ${theme.textSecondary} hover:bg-white/10`}
                title="One-Handed Mode"
              >
                <Smartphone className="w-[18px] h-[18px]" />
              </button>

              <button
                type="button"
                onClick={() => setActiveToolbarView('smart_ai')}
                className={`p-2 rounded-full transition-colors ${theme.textSecondary} hover:bg-white/10`}
                title="Smart Rewrite"
              >
                <Wand2 className="w-[18px] h-[18px]" />
              </button>
            </>
          )}

          <button
            type="button"
            onClick={() => {
              if (onOpenSettings) {
                onOpenSettings();
              } else {
                setActiveToolbarView('themes');
              }
            }}
            className={`p-2 rounded-full transition-colors ${theme.textSecondary} hover:bg-white/10`}
            title="Keyboard Settings"
          >
            <Settings className="w-[18px] h-[18px]" />
          </button>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-around overflow-hidden px-1">
          {suggestions.slice(0, 3).map((word, idx) => {
            const isPrimary = idx === 0;
            return (
              <React.Fragment key={`${word}-${idx}`}>
                {idx > 0 && (
                  <div className="h-4 w-px bg-current opacity-15 shrink-0" />
                )}
                <button
                  type="button"
                  onClick={() => onSelectSuggestion(word)}
                  className={`flex-1 mx-1 px-2 py-1 text-center text-[14px] rounded-md truncate transition-colors ${
                    isPrimary
                      ? `${theme.textPrimary} font-semibold`
                      : `${theme.textSecondary} font-normal hover:bg-white/5`
                  }`}
                >
                  {word}
                </button>
              </React.Fragment>
            );
          })}
        </div>
      )}

      {/* Right Voice Typing Microphone Icon */}
      <button
        type="button"
        onClick={onStartVoiceTyping}
        className={`w-9 h-8 flex items-center justify-center rounded-full transition-colors ${theme.textSecondary} hover:bg-white/10 active:bg-white/20`}
        title="Voice Typing"
      >
        <Mic className="w-[18px] h-[18px]" />
      </button>

      {/* Optional Hide Keyboard Button (in Android System IME mode) */}
      {onHideKeyboard && (
        <button
          type="button"
          onClick={onHideKeyboard}
          className={`w-8 h-8 flex items-center justify-center rounded-full transition-colors ${theme.textSecondary} hover:bg-white/10`}
          title="Hide Keyboard"
        >
          <ChevronDown className="w-[18px] h-[18px]" />
        </button>
      )}
    </div>
  );
};
