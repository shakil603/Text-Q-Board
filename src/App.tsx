import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  KeyboardSettings,
  LanguageId,
  ThemeId,
  ToolbarView,
  ClipboardItem,
  ThemeConfig
} from './types/keyboard';
import { KEYBOARD_THEMES } from './data/themes';
import { SuggestionStrip } from './components/SuggestionStrip';
import { ToolbarTools } from './components/ToolbarTools';
import { EmojiGifPanel } from './components/EmojiGifPanel';
import { VoiceModal } from './components/VoiceModal';
import { SettingsModal } from './components/SettingsModal';
import { Keyboard } from './components/Keyboard';
import { AndroidFrame, AndroidAppId } from './components/AndroidFrame';
import { TextQBoardLogo } from './components/Logo';
import { transliterateBengali } from './utils/bengaliPhonetic';
import { getWordPredictions } from './utils/dictionary';
import { 
  Smartphone, 
  Monitor, 
  Settings, 
  Sparkles, 
  Palette, 
  Download, 
  Languages, 
  Copy, 
  Check, 
  RotateCcw,
  Sliders,
  Share2
} from 'lucide-react';

export default function App() {
  // Master Keyboard Settings State
  const [settings, setSettings] = useState<KeyboardSettings>({
    hapticFeedback: true,
    soundOnKeypress: true,
    soundVolume: 0.5,
    popupOnKeypress: true,
    longPressDelay: 350,
    showNumberRow: false,
    glideTyping: true,
    showGestureTrail: true,
    gestureDelete: true,
    gestureCursorControl: true,
    autoCorrection: true,
    nextWordSuggestions: true,
    autoCapitalization: true,
    doubleSpacePeriod: true,
    blockOffensiveWords: true,
    oneHandedMode: 'off',
    isFloating: false,
    floatingPosition: { x: 50, y: 100 },
    keyboardHeight: 'medium',
    keyBorders: true,
    theme: 'cyber_cyan', // Matches the uploaded image icon by default!
    activeLanguage: 'bn_phonetic',
    enabledLanguages: ['bn_phonetic', 'en_us', 'bn_jatiya', 'es_es', 'ar_sa', 'hi_in'],
    incognito: false,
    customShortcuts: [
      { shortcut: 'tqb', expanded: 'Text Q Board' },
      { shortcut: 'omw', expanded: 'On my way!' },
      { shortcut: 'amar', expanded: 'আমার' },
      { shortcut: 'bangla', expanded: 'বাংলা' },
    ],
  });

  // Current Active Theme
  const currentTheme: ThemeConfig = KEYBOARD_THEMES[settings.theme] || KEYBOARD_THEMES.cyber_cyan;

  // Active Android App in Phone Simulator
  const [activeApp, setActiveApp] = useState<AndroidAppId>('chat');

  // Active Typed Text & Cursor Position
  const [inputText, setInputText] = useState<string>('amar sonar bangla');
  const [cursorPos, setCursorPos] = useState<number>(inputText.length);

  // Active Toolbar View
  const [activeToolbarView, setActiveToolbarView] = useState<ToolbarView>('normal');

  // Modals
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  // Viewport mode: 'phone' (Android 15 device simulation) or 'expanded' (full desktop studio)
  const [viewMode, setViewMode] = useState<'phone' | 'expanded'>('phone');

  // Clipboard items
  const [clipboardItems, setClipboardItems] = useState<ClipboardItem[]>([
    { id: '1', text: 'Text Q Board — Next-Gen Android Keyboard', timestamp: Date.now() - 10000, pinned: true },
    { id: '2', text: 'আমার সোনার বাংলা, আমি তোমায় ভালোবাসি', timestamp: Date.now() - 50000, pinned: true },
    { id: '3', text: 'https://textqboard.app', timestamp: Date.now() - 120000, pinned: false },
  ]);

  // Toast / Copy Feedback
  const [copiedToast, setCopiedToast] = useState(false);

  // Update Settings helper
  const handleUpdateSettings = (newSettings: Partial<KeyboardSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  // Find current word being typed before cursor
  const currentWord = useMemo(() => {
    const textBeforeCursor = inputText.slice(0, cursorPos);
    const words = textBeforeCursor.split(/\s+/);
    return words[words.length - 1] || '';
  }, [inputText, cursorPos]);

  // Compute live predictive suggestions / Bengali transliterations
  const suggestions = useMemo(() => {
    if (settings.activeLanguage === 'bn_phonetic' && currentWord) {
      // Use Bengali Avro-style Phonetic Engine
      const banglaCandidates = transliterateBengali(currentWord);
      return banglaCandidates.length > 0 ? banglaCandidates : [currentWord];
    } else {
      // English / standard dictionary next-word predictions
      const textBeforeCursor = inputText.slice(0, cursorPos - currentWord.length);
      return getWordPredictions(currentWord, textBeforeCursor, settings.customShortcuts);
    }
  }, [currentWord, settings.activeLanguage, settings.customShortcuts, inputText, cursorPos]);

  // --- KEYBOARD ACTIONS ---

  // Insert Text at cursor
  const handleInsertText = useCallback((text: string) => {
    setInputText((prev) => {
      const before = prev.slice(0, cursorPos);
      const after = prev.slice(cursorPos);
      return before + text + after;
    });
    setCursorPos((prev) => prev + text.length);
  }, [cursorPos]);

  // Delete Text before cursor
  const handleDeleteText = useCallback((count: number = 1) => {
    if (cursorPos === 0) return;
    setInputText((prev) => {
      const deleteCount = Math.min(count, cursorPos);
      const before = prev.slice(0, cursorPos - deleteCount);
      const after = prev.slice(cursorPos);
      return before + after;
    });
    setCursorPos((prev) => Math.max(0, prev - count));
  }, [cursorPos]);

  // Enter Key
  const handleEnter = useCallback(() => {
    handleInsertText('\n');
  }, [handleInsertText]);

  // Move Cursor
  const handleMoveCursor = useCallback((direction: 'left' | 'right' | 'up' | 'down' | 'start' | 'end') => {
    switch (direction) {
      case 'left':
        setCursorPos((prev) => Math.max(0, prev - 1));
        break;
      case 'right':
        setCursorPos((prev) => Math.min(inputText.length, prev + 1));
        break;
      case 'start':
        setCursorPos(0);
        break;
      case 'end':
        setCursorPos(inputText.length);
        break;
      default:
        break;
    }
  }, [inputText.length]);

  // Select Suggestion
  const handleSelectSuggestion = useCallback((chosenWord: string) => {
    setInputText((prev) => {
      const beforeWord = prev.slice(0, cursorPos - currentWord.length);
      const after = prev.slice(cursorPos);
      return beforeWord + chosenWord + ' ' + after;
    });
    setCursorPos((prev) => prev - currentWord.length + chosenWord.length + 1);
  }, [cursorPos, currentWord]);

  // Replace Entire Text (AI Rewrite)
  const handleReplaceAllText = useCallback((newText: string) => {
    setInputText(newText);
    setCursorPos(newText.length);
  }, []);

  // Text Edit Actions
  const handleSelectAll = useCallback(() => {
    setCursorPos(inputText.length);
  }, [inputText.length]);

  const handleCopySelection = useCallback(() => {
    if (inputText) {
      navigator.clipboard?.writeText(inputText);
      // Also add to Gboard clipboard history
      setClipboardItems((prev) => [
        { id: Date.now().toString(), text: inputText, timestamp: Date.now(), pinned: false },
        ...prev.slice(0, 19),
      ]);
      setCopiedToast(true);
      setTimeout(() => setCopiedToast(false), 1500);
    }
  }, [inputText]);

  const handleCutSelection = useCallback(() => {
    handleCopySelection();
    setInputText('');
    setCursorPos(0);
  }, [handleCopySelection]);

  const handleDeleteSelection = useCallback(() => {
    setInputText('');
    setCursorPos(0);
  }, []);

  // Clipboard operations
  const handleAddClipboardItem = (text: string) => {
    setClipboardItems((prev) => [
      { id: Date.now().toString(), text, timestamp: Date.now(), pinned: false },
      ...prev,
    ]);
  };

  const handleTogglePinClipboard = (id: string) => {
    setClipboardItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, pinned: !item.pinned } : item))
    );
  };

  const handleDeleteClipboardItem = (id: string) => {
    setClipboardItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleClearClipboard = () => {
    setClipboardItems((prev) => prev.filter((item) => item.pinned));
  };

  // Keyboard Sub-component rendering
  const renderKeyboardEngine = () => (
    <div className={`w-full rounded-b-3xl overflow-hidden shadow-2xl transition-all ${currentTheme.boardBg}`}>
      {/* 1. Suggestion Strip / Toolbar Action Bar */}
      <SuggestionStrip
        suggestions={suggestions}
        onSelectSuggestion={handleSelectSuggestion}
        activeToolbarView={activeToolbarView}
        setActiveToolbarView={setActiveToolbarView}
        onStartVoiceTyping={() => setIsVoiceModalOpen(true)}
        theme={currentTheme}
        incognito={settings.incognito}
        onToggleFloating={() =>
          handleUpdateSettings({ isFloating: !settings.isFloating })
        }
        onToggleOneHanded={() => {
          const next =
            settings.oneHandedMode === 'off'
              ? 'right'
              : settings.oneHandedMode === 'right'
              ? 'left'
              : 'off';
          handleUpdateSettings({ oneHandedMode: next });
        }}
      />

      {/* 2. Expanded Tools Bar (Translate, Clipboard, Text Edit D-Pad, Themes, Smart AI) */}
      <ToolbarTools
        activeView={activeToolbarView}
        onClose={() => setActiveToolbarView('normal')}
        theme={currentTheme}
        currentText={inputText}
        onInsertText={handleInsertText}
        onReplaceAllText={handleReplaceAllText}
        onMoveCursor={handleMoveCursor}
        onSelectAll={handleSelectAll}
        onCopySelection={handleCopySelection}
        onCutSelection={handleCutSelection}
        onDeleteSelection={handleDeleteSelection}
        clipboardItems={clipboardItems}
        onAddClipboardItem={handleAddClipboardItem}
        onTogglePinClipboard={handleTogglePinClipboard}
        onDeleteClipboardItem={handleDeleteClipboardItem}
        onClearClipboard={handleClearClipboard}
        onSelectTheme={(themeId) => handleUpdateSettings({ theme: themeId })}
      />

      {/* 3. Main Keyboard Keys or Emoji/GIF Panel */}
      {activeToolbarView === 'emoji_picker' ? (
        <EmojiGifPanel
          onInsertEmoji={handleInsertText}
          onBackspace={() => handleDeleteText(1)}
          onClose={() => setActiveToolbarView('normal')}
          theme={currentTheme}
        />
      ) : (
        <Keyboard
          settings={settings}
          theme={currentTheme}
          onInsertText={handleInsertText}
          onDeleteText={handleDeleteText}
          onEnter={handleEnter}
          onMoveCursor={handleMoveCursor}
          onLanguageChange={(langId) => handleUpdateSettings({ activeLanguage: langId })}
          onOpenEmojiPanel={() => setActiveToolbarView('emoji_picker')}
          onOpenVoiceModal={() => setIsVoiceModalOpen(true)}
          onOpenSettings={() => setIsSettingsModalOpen(true)}
          onToggleFloating={() =>
            handleUpdateSettings({ isFloating: !settings.isFloating })
          }
          onToggleOneHanded={(side) => handleUpdateSettings({ oneHandedMode: side })}
        />
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950">
      {/* 1. TOP BAR CONTRACT: Exactly 3 Zones */}
      <header className="h-16 w-full flex items-center justify-between px-6 border-b border-cyan-500/20 bg-slate-950/90 backdrop-blur-md sticky top-0 z-40">
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-3">
          <TextQBoardLogo size="sm" showLabel={false} />
          <span className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
            <span>Text Q Board</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
              Android Gboard Replica
            </span>
          </span>
        </div>

        {/* Zone 2: Navigation / Quick Modes */}
        <nav className="hidden md:flex items-center gap-4 text-xs font-semibold text-slate-300">
          <button
            onClick={() => setViewMode('phone')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
              viewMode === 'phone' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'hover:text-white'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Android Phone View</span>
          </button>
          <button
            onClick={() => setViewMode('expanded')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
              viewMode === 'expanded' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'hover:text-white'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>Keyboard Studio View</span>
          </button>
          <button
            onClick={() => setIsSettingsModalOpen(true)}
            className="flex items-center gap-1.5 hover:text-cyan-300 transition-colors"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Gboard Settings</span>
          </button>
        </nav>

        {/* Zone 3: Primary Action */}
        <div className="flex items-center gap-2">
          <a
            href="https://github.com/shakil603/Text-Q-Board/actions"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 rounded-xl bg-slate-800 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-950 font-bold text-xs flex items-center gap-1.5 transition-all"
            title="Download Android APK from GitHub Actions"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Build & Get APK</span>
          </a>
          <button
            onClick={() => setIsSettingsModalOpen(true)}
            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 hover:brightness-110 active:scale-95 shadow-[0_0_12px_rgba(6,182,212,0.4)]"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Settings</span>
          </button>
        </div>
      </header>

      {/* Toast Notification */}
      {copiedToast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full bg-cyan-950 text-cyan-200 border border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.6)] text-xs font-bold flex items-center gap-1.5 animate-in fade-in">
          <Check className="w-4 h-4 text-cyan-400" />
          <span>Text copied to clipboard!</span>
        </div>
      )}

      {/* 2. MAIN APPLICATION CONTENT */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 flex flex-col items-center justify-center">
        {viewMode === 'phone' ? (
          // ANDROID 15 PHONE SIMULATOR MODE
          <div className="w-full flex flex-col items-center">
            <div className="w-full max-w-md h-[780px] flex flex-col justify-between">
              <AndroidFrame
                activeApp={activeApp}
                onSelectApp={setActiveApp}
                inputText={inputText}
                onInputChange={setInputText}
                onInputFocus={() => {}}
                cursorPos={cursorPos}
                onCursorChange={setCursorPos}
              >
                {renderKeyboardEngine()}
              </AndroidFrame>
            </div>
          </div>
        ) : (
          // EXPANDED KEYBOARD STUDIO MODE (DESKTOP WORKBENCH)
          <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Live Text Playground & Controls */}
            <div className="lg:col-span-5 space-y-4">
              <div className="p-5 rounded-3xl bg-slate-900/80 border border-cyan-500/30 shadow-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TextQBoardLogo size="sm" showLabel={false} />
                    <h3 className="font-bold text-sm text-white">Live Text Playground</h3>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={handleCopySelection}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                      title="Copy"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        setInputText('');
                        setCursorPos(0);
                      }}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                      title="Clear"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <textarea
                  value={inputText}
                  onChange={(e) => {
                    setInputText(e.target.value);
                    setCursorPos(e.target.selectionStart || 0);
                  }}
                  placeholder="Click here and test typing on Text Q Board..."
                  className="w-full h-40 p-3.5 rounded-2xl bg-slate-950 border border-white/10 text-cyan-50 placeholder-slate-500 text-sm leading-relaxed resize-none outline-none focus:border-cyan-400 font-sans"
                />

                <div className="flex items-center justify-between text-xs text-slate-400">
                  <div className="flex items-center gap-2">
                    <span><b>{inputText.length}</b> characters</span>
                    <span>•</span>
                    <span><b>{inputText.trim() ? inputText.trim().split(/\s+/).length : 0}</b> words</span>
                  </div>
                  <span className="text-cyan-400 font-semibold uppercase text-[11px]">
                    {settings.activeLanguage.replace('_', ' ')}
                  </span>
                </div>
              </div>

              {/* Quick Feature Highlights Cards */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-2xl bg-slate-900/50 border border-white/5 space-y-1">
                  <div className="text-cyan-400 font-bold text-xs flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Avro Bengali Phonetic</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Type romanized English words (e.g. "amar", "bangla") for instant Bengali conversion.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-900/50 border border-white/5 space-y-1">
                  <div className="text-cyan-400 font-bold text-xs flex items-center gap-1.5">
                    <Palette className="w-3.5 h-3.5" />
                    <span>Cyber Cyan Theme</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Exact dark metallic cyan-glowing keycaps matching the uploaded logo icon.
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column: Full Interactive Keyboard */}
            <div className="lg:col-span-7 flex flex-col items-center">
              <div className="w-full max-w-2xl rounded-3xl border border-cyan-500/30 overflow-hidden shadow-[0_0_30px_rgba(6,182,212,0.2)]">
                {renderKeyboardEngine()}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* 3. MODALS */}
      <VoiceModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        onInsertVoiceText={handleInsertText}
        theme={currentTheme}
        activeLanguage={settings.activeLanguage}
      />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
        theme={currentTheme}
      />
    </div>
  );
}
