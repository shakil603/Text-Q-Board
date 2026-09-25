import React from 'react';
import { 
  Menu, 
  Mic, 
  Languages, 
  Clipboard, 
  Palette, 
  Settings, 
  Move, 
  Smartphone, 
  Wand2, 
  Search, 
  ChevronLeft,
  EyeOff
} from 'lucide-react';
import { ThemeConfig, ToolbarView } from '../types/keyboard';

interface SuggestionStripProps {
  suggestions: string[];
  onSelectSuggestion: (word: string) => void;
  activeToolbarView: ToolbarView;
  setActiveToolbarView: (view: ToolbarView) => void;
  onStartVoiceTyping: () => void;
  theme: ThemeConfig;
  incognito?: boolean;
  isTranslating?: boolean;
  onToggleIncognito?: () => void;
  onToggleFloating?: () => void;
  onToggleOneHanded?: () => void;
  currentLanguageName?: string;
}

export const SuggestionStrip: React.FC<SuggestionStripProps> = ({
  suggestions,
  onSelectSuggestion,
  activeToolbarView,
  setActiveToolbarView,
  onStartVoiceTyping,
  theme,
  incognito = false,
  onToggleFloating,
  onToggleOneHanded,
}) => {
  const isMenuOpen = activeToolbarView === 'more_tools';

  return (
    <div
      className={`h-11 w-full flex items-center px-1.5 select-none border-b border-white/5 transition-colors ${theme.suggestionBg}`}
    >
      {/* Left Menu / Collapse Button */}
      <button
        onClick={() => setActiveToolbarView(isMenuOpen ? 'normal' : 'more_tools')}
        className={`w-9 h-9 flex items-center justify-center rounded-full transition-all ${
          isMenuOpen
            ? 'bg-cyan-500/30 text-cyan-200'
            : 'text-slate-400 hover:text-cyan-200 hover:bg-white/5 active:scale-95'
        }`}
        title={isMenuOpen ? 'Close Menu' : 'Open Gboard Features'}
      >
        {isMenuOpen ? <ChevronLeft className="w-5 h-5" /> : <Menu className="w-4 h-4" />}
      </button>

      {/* Incognito icon if active */}
      {incognito && (
        <div className="flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-neutral-800 text-neutral-300 gap-1 mr-1">
          <EyeOff className="w-3 h-3 text-cyan-400" />
          <span>Incognito</span>
        </div>
      )}

      {/* Main Bar: Either Toolbar Feature Icons OR Word Suggestions */}
      {isMenuOpen ? (
        // Expanded Toolbar Action Icons (Gboard style)
        <div className="flex-1 flex items-center justify-around gap-1 overflow-x-auto no-scrollbar px-1">
          <button
            onClick={() => setActiveToolbarView('translate')}
            className="flex flex-col items-center justify-center p-1.5 rounded-lg hover:bg-white/10 active:scale-90 text-cyan-200"
            title="Google Translate"
          >
            <Languages className="w-4 h-4" />
          </button>
          <button
            onClick={() => setActiveToolbarView('clipboard')}
            className="flex flex-col items-center justify-center p-1.5 rounded-lg hover:bg-white/10 active:scale-90 text-cyan-200"
            title="Clipboard"
          >
            <Clipboard className="w-4 h-4" />
          </button>
          <button
            onClick={() => setActiveToolbarView('text_edit')}
            className="flex flex-col items-center justify-center p-1.5 rounded-lg hover:bg-white/10 active:scale-90 text-cyan-200"
            title="Text Editing D-Pad"
          >
            <Move className="w-4 h-4" />
          </button>
          <button
            onClick={() => setActiveToolbarView('themes')}
            className="flex flex-col items-center justify-center p-1.5 rounded-lg hover:bg-white/10 active:scale-90 text-cyan-200"
            title="Themes"
          >
            <Palette className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              if (onToggleOneHanded) onToggleOneHanded();
            }}
            className="flex flex-col items-center justify-center p-1.5 rounded-lg hover:bg-white/10 active:scale-90 text-cyan-200"
            title="One-Handed Mode"
          >
            <Smartphone className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              if (onToggleFloating) onToggleFloating();
            }}
            className="flex flex-col items-center justify-center p-1.5 rounded-lg hover:bg-white/10 active:scale-90 text-cyan-200"
            title="Floating Keyboard"
          >
            <Search className="w-4 h-4" />
          </button>
          <button
            onClick={() => setActiveToolbarView('smart_ai')}
            className="flex flex-col items-center justify-center p-1.5 rounded-lg hover:bg-white/10 active:scale-90 text-cyan-300"
            title="Smart Compose & AI Rewrite"
          >
            <Wand2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setActiveToolbarView('settings')}
            className="flex flex-col items-center justify-center p-1.5 rounded-lg hover:bg-white/10 active:scale-90 text-cyan-200"
            title="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      ) : (
        // Word Suggestions List
        <div className="flex-1 flex items-center justify-around overflow-hidden px-1">
          {suggestions.length > 0 ? (
            suggestions.slice(0, 3).map((word, idx) => (
              <button
                key={`${word}-${idx}`}
                onClick={() => onSelectSuggestion(word)}
                className={`flex-1 mx-1 px-2 py-1.5 text-center text-sm font-medium rounded-md truncate transition-all active:scale-95 ${
                  idx === 1
                    ? `${theme.suggestionActiveBg} font-semibold`
                    : `${theme.textPrimary} hover:bg-white/10`
                }`}
              >
                {word}
              </button>
            ))
          ) : (
            <div className="flex items-center gap-2 text-xs text-slate-400/80">
              <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
              <span>Text Q Board Engine Ready</span>
            </div>
          )}
        </div>
      )}

      {/* Voice Typing Button */}
      <button
        onClick={onStartVoiceTyping}
        className="w-9 h-9 flex items-center justify-center rounded-full text-slate-300 hover:text-cyan-300 hover:bg-white/5 active:scale-90 transition-transform"
        title="Voice Typing (Microphone)"
      >
        <Mic className="w-4 h-4" />
      </button>
    </div>
  );
};
