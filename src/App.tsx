import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  KeyboardSettings,
  LanguageId,
  ThemeId,
  ToolbarView,
  ClipboardItem,
  ThemeConfig
} from './types/keyboard';
import { KEYBOARD_THEMES } from './data/themes';
import { SUPPORTED_LANGUAGES } from './data/layouts';
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
  isSystemImeMode,
  getAndroidImeStatus,
  openAndroidInputMethodSettings,
  showAndroidInputMethodPicker,
  imeCommitText,
  imeDeleteText,
  imeReplaceCurrentWord,
  imeGetTextBeforeCursor,
  imeSendEnter,
  imeMoveCursor,
  imeContextMenuAction,
  imeHideKeyboard,
  imeOpenSettings,
  imeSetKeyboardHeight,
  loadPersistedSettings,
  savePersistedSettings,
} from './utils/androidBridge';
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
  CheckCircle2,
  Keyboard as KeyboardIcon
} from 'lucide-react';

const DEFAULT_SETTINGS: KeyboardSettings = {
  hapticFeedback: true,
  soundOnKeypress: true,
  soundVolume: 0.5,
  popupOnKeypress: true,
  longPressDelay: 350,
  showNumberRow: true,
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
  theme: 'cyber_cyan',
  activeLanguage: 'bn_phonetic',
  enabledLanguages: ['bn_phonetic', 'en_us', 'bn_jatiya', 'bn_probhat', 'es_es', 'ar_sa', 'hi_in'],
  incognito: false,
  customShortcuts: [
    { shortcut: 'tqb', expanded: 'Text Q Board' },
    { shortcut: 'omw', expanded: 'On my way!' },
    { shortcut: 'amar', expanded: 'আমার' },
    { shortcut: 'bangla', expanded: 'বাংলা' },
  ],
};

export default function App() {
  const [inImeMode] = useState<boolean>(() => isSystemImeMode());

  // Master Keyboard Settings State (persisted across App & Android IME Service)
  const [settings, setSettings] = useState<KeyboardSettings>(() =>
    loadPersistedSettings(DEFAULT_SETTINGS)
  );

  // Android Native IME Status (Enabled / Selected)
  const [imeStatus, setImeStatus] = useState(() => getAndroidImeStatus());

  // Refresh IME status & settings when returning from Android Settings or starting IME input
  useEffect(() => {
    const handleRefresh = () => {
      setImeStatus(getAndroidImeStatus());
      setSettings((prev) => loadPersistedSettings(prev));
    };

    window.addEventListener('imeStatusChanged', handleRefresh);
    window.addEventListener('focus', handleRefresh);
    window.onAndroidImeStart = () => {
      setSettings((prev) => loadPersistedSettings(prev));
      const before = imeGetTextBeforeCursor(60);
      setInputText(before);
      setCursorPos(before.length);
    };

    return () => {
      window.removeEventListener('imeStatusChanged', handleRefresh);
      window.removeEventListener('focus', handleRefresh);
    };
  }, []);

  // Current Active Theme
  const currentTheme: ThemeConfig = KEYBOARD_THEMES[settings.theme] || KEYBOARD_THEMES.cyber_cyan;

  // Active Android App in Phone Simulator
  const [activeApp, setActiveApp] = useState<AndroidAppId>('chat');

  // Active Typed Text & Cursor Position
  const [inputText, setInputText] = useState<string>(() =>
    inImeMode ? imeGetTextBeforeCursor(60) : 'আমার সোনার বাংলা '
  );
  const [cursorPos, setCursorPos] = useState<number>(() => inputText.length);

  // Active Toolbar View
  const [activeToolbarView, setActiveToolbarView] = useState<ToolbarView>('normal');

  // Modals
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  // Viewport mode: 'gboard_app' (Native Gboard Launcher & Test View), 'phone' (Simulator), or 'expanded' (Desktop Studio)
  const [viewMode, setViewMode] = useState<'gboard_app' | 'phone' | 'expanded'>('gboard_app');

  // Dynamically update Android IME window height when in system IME mode
  useEffect(() => {
    if (!inImeMode) return;
    let targetDp = settings.showNumberRow ? 328 : 286;
    if (activeToolbarView === 'emoji_picker') {
      targetDp = 345;
    } else if (
      activeToolbarView === 'translate' ||
      activeToolbarView === 'clipboard' ||
      activeToolbarView === 'text_edit' ||
      activeToolbarView === 'themes' ||
      activeToolbarView === 'smart_ai'
    ) {
      targetDp = settings.showNumberRow ? 390 : 355;
    }
    imeSetKeyboardHeight(targetDp);
  }, [inImeMode, settings.showNumberRow, activeToolbarView]);

  // Clipboard items
  const [clipboardItems, setClipboardItems] = useState<ClipboardItem[]>([
    { id: '1', text: 'Text Q Board — Next-Gen Android Keyboard', timestamp: Date.now() - 10000, pinned: true },
    { id: '2', text: 'আমার সোনার বাংলা, আমি তোমায় ভালোবাসি', timestamp: Date.now() - 50000, pinned: true },
    { id: '3', text: 'আপনি কেমন আছেন? ধন্যবাদ!', timestamp: Date.now() - 120000, pinned: false },
  ]);

  // Toast / Copy Feedback
  const [copiedToast, setCopiedToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setCopiedToast(msg);
    setTimeout(() => setCopiedToast(null), 1800);
  };

  // Update Settings helper (saves to SharedPreferences + localStorage)
  const handleUpdateSettings = useCallback((newSettings: Partial<KeyboardSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      savePersistedSettings(updated);
      return updated;
    });
  }, []);

  // Find current word being typed before cursor
  const currentWord = useMemo(() => {
    const textBeforeCursor = inputText.slice(0, cursorPos);
    const match = textBeforeCursor.match(/([^\s]+)$/);
    return match ? match[1] : '';
  }, [inputText, cursorPos]);

  // Compute live predictive suggestions / Bengali transliterations
  const suggestions = useMemo(() => {
    if (settings.activeLanguage === 'bn_phonetic' && currentWord) {
      // Use Bengali Avro-style Phonetic Engine
      const banglaCandidates = transliterateBengali(currentWord);
      const list = [...banglaCandidates];
      if (!list.includes(currentWord)) {
        list.push(currentWord);
      }
      return list.slice(0, 3);
    } else {
      // English / standard dictionary next-word predictions
      const textBeforeCursor = inputText.slice(0, cursorPos - currentWord.length);
      return getWordPredictions(currentWord, textBeforeCursor, settings.customShortcuts);
    }
  }, [currentWord, settings.activeLanguage, settings.customShortcuts, inputText, cursorPos]);

  // --- KEYBOARD ACTIONS (Supporting both System-Wide Android IME & In-App Preview) ---

  // Insert Text at cursor
  const handleInsertText = useCallback((text: string) => {
    if (inImeMode) {
      imeCommitText(text);
    }
    setInputText((prev) => {
      const before = prev.slice(0, cursorPos);
      const after = prev.slice(cursorPos);
      return before + text + after;
    });
    setCursorPos((prev) => prev + text.length);
  }, [cursorPos, inImeMode]);

  // Select Suggestion (Replaces currentWord with chosenWord + space)
  const handleSelectSuggestion = useCallback((chosenWord: string) => {
    if (inImeMode) {
      imeReplaceCurrentWord(currentWord.length, chosenWord + ' ');
    }
    setInputText((prev) => {
      const beforeWord = prev.slice(0, Math.max(0, cursorPos - currentWord.length));
      const after = prev.slice(cursorPos);
      return beforeWord + chosenWord + ' ' + after;
    });
    setCursorPos((prev) => Math.max(0, prev - currentWord.length) + chosenWord.length + 1);
  }, [cursorPos, currentWord, inImeMode]);

  // Spacebar handler: In Bengali Phonetic mode (or with shortcut/autocorrect), auto-commits the primary conversion!
  const handleSpacebar = useCallback(() => {
    if (currentWord && settings.activeLanguage === 'bn_phonetic' && suggestions.length > 0) {
      const primaryBangla = suggestions[0];
      handleSelectSuggestion(primaryBangla);
      return;
    }
    if (currentWord && settings.autoCorrection) {
      const shortcutMatch = settings.customShortcuts.find(
        (s) => s.shortcut.toLowerCase() === currentWord.toLowerCase()
      );
      if (shortcutMatch) {
        handleSelectSuggestion(shortcutMatch.expanded);
        return;
      }
    }
    handleInsertText(' ');
  }, [currentWord, settings.activeLanguage, settings.autoCorrection, settings.customShortcuts, suggestions, handleSelectSuggestion, handleInsertText]);

  // Delete Text before cursor
  const handleDeleteText = useCallback((count: number = 1) => {
    if (inImeMode) {
      imeDeleteText(count);
    }
    if (cursorPos === 0) return;
    setInputText((prev) => {
      const deleteCount = Math.min(count, cursorPos);
      const before = prev.slice(0, cursorPos - deleteCount);
      const after = prev.slice(cursorPos);
      return before + after;
    });
    setCursorPos((prev) => Math.max(0, prev - count));
  }, [cursorPos, inImeMode]);

  // Enter Key
  const handleEnter = useCallback(() => {
    if (inImeMode) {
      imeSendEnter();
      setInputText('');
      setCursorPos(0);
      return;
    }
    handleInsertText('\n');
  }, [handleInsertText, inImeMode]);

  // Move Cursor
  const handleMoveCursor = useCallback((direction: 'left' | 'right' | 'up' | 'down' | 'start' | 'end') => {
    if (inImeMode) {
      imeMoveCursor(direction);
    }
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
  }, [inputText.length, inImeMode]);

  // Replace Entire Text (AI Rewrite)
  const handleReplaceAllText = useCallback((newText: string) => {
    if (inImeMode) {
      imeReplaceCurrentWord(inputText.length, newText);
    }
    setInputText(newText);
    setCursorPos(newText.length);
  }, [inImeMode, inputText.length]);

  // Text Edit Actions
  const handleSelectAll = useCallback(() => {
    if (inImeMode) {
      imeContextMenuAction('selectAll');
    }
    setCursorPos(inputText.length);
  }, [inputText.length, inImeMode]);

  const handleCopySelection = useCallback(() => {
    if (inImeMode) {
      imeContextMenuAction('copy');
    }
    if (inputText) {
      navigator.clipboard?.writeText(inputText);
      setClipboardItems((prev) => [
        { id: Date.now().toString(), text: inputText, timestamp: Date.now(), pinned: false },
        ...prev.slice(0, 19),
      ]);
      showToast('Copied to clipboard!');
    }
  }, [inputText, inImeMode]);

  const handleCutSelection = useCallback(() => {
    if (inImeMode) {
      imeContextMenuAction('cut');
    }
    handleCopySelection();
    setInputText('');
    setCursorPos(0);
  }, [handleCopySelection, inImeMode]);

  const handleDeleteSelection = useCallback(() => {
    if (inImeMode) {
      imeDeleteText(Math.max(1, inputText.length));
    }
    setInputText('');
    setCursorPos(0);
  }, [inImeMode, inputText.length]);

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
    <div className={`w-full overflow-hidden shadow-2xl transition-all ${currentTheme.boardBg}`}>
      {/* 1. Suggestion Strip / Toolbar Action Bar */}
      <SuggestionStrip
        suggestions={suggestions}
        onSelectSuggestion={handleSelectSuggestion}
        activeToolbarView={activeToolbarView}
        setActiveToolbarView={setActiveToolbarView}
        onStartVoiceTyping={() => setIsVoiceModalOpen(true)}
        onOpenSettings={() => {
          if (inImeMode) {
            imeOpenSettings();
          } else {
            setIsSettingsModalOpen(true);
          }
        }}
        onHideKeyboard={inImeMode ? () => imeHideKeyboard() : undefined}
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
          onSpacebar={handleSpacebar}
          onDeleteText={handleDeleteText}
          onEnter={handleEnter}
          onMoveCursor={handleMoveCursor}
          onLanguageChange={(langId) => handleUpdateSettings({ activeLanguage: langId })}
          onOpenEmojiPanel={() => setActiveToolbarView('emoji_picker')}
          onOpenVoiceModal={() => setIsVoiceModalOpen(true)}
          onOpenSettings={() => {
            if (inImeMode) {
              imeOpenSettings();
            } else {
              setIsSettingsModalOpen(true);
            }
          }}
          onToggleFloating={() =>
            handleUpdateSettings({ isFloating: !settings.isFloating })
          }
          onToggleOneHanded={(side) => handleUpdateSettings({ oneHandedMode: side })}
        />
      )}
    </div>
  );

  // ============================================================================
  // SYSTEM-WIDE ANDROID KEYBOARD MODE (?mode=ime inside TextQBoardIMEService)
  // Renders ONLY the pure Gboard keyboard unit at the bottom of the phone screen
  // ============================================================================
  if (inImeMode) {
    return (
      <div className={`w-full h-full flex flex-col justify-end select-none overflow-hidden ${currentTheme.boardBg}`}>
        {renderKeyboardEngine()}
        <VoiceModal
          isOpen={isVoiceModalOpen}
          onClose={() => setIsVoiceModalOpen(false)}
          onInsertVoiceText={(txt) => handleInsertText(txt + ' ')}
          theme={currentTheme}
          activeLanguage={settings.activeLanguage}
        />
      </div>
    );
  }

  // ============================================================================
  // GBOARD LAUNCHER & SETUP APP + INTERACTIVE STUDIO
  // ============================================================================
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950">
      {/* 1. TOP BAR CONTRACT: Exactly 3 Zones */}
      <header className="h-14 w-full flex items-center justify-between px-4 md:px-6 border-b border-cyan-500/20 bg-slate-950/90 backdrop-blur-md sticky top-0 z-40">
        {/* Zone 1: Single text element wordmark */}
        <a href="#top" className="text-base md:text-lg font-extrabold tracking-tight text-cyan-300">
          Text Q Board
        </a>

        {/* Zone 2: Navigation / Quick Modes */}
        <nav className="hidden md:flex items-center gap-5 text-xs font-semibold text-slate-300">
          <button
            onClick={() => setViewMode('gboard_app')}
            className={`transition-colors whitespace-nowrap ${
              viewMode === 'gboard_app' ? 'text-cyan-300 underline underline-offset-4' : 'hover:text-white'
            }`}
          >
            Keyboard Setup
          </button>
          <button
            onClick={() => setViewMode('phone')}
            className={`transition-colors whitespace-nowrap ${
              viewMode === 'phone' ? 'text-cyan-300 underline underline-offset-4' : 'hover:text-white'
            }`}
          >
            App Simulator
          </button>
          <button
            onClick={() => setViewMode('expanded')}
            className={`transition-colors whitespace-nowrap ${
              viewMode === 'expanded' ? 'text-cyan-300 underline underline-offset-4' : 'hover:text-white'
            }`}
          >
            Desktop Studio
          </button>
          <button
            onClick={() => setIsSettingsModalOpen(true)}
            className="hover:text-cyan-300 transition-colors whitespace-nowrap"
          >
            Preferences
          </button>
        </nav>

        {/* Zone 3: Primary Actions */}
        <div className="flex items-center gap-2">
          <a
            href="https://github.com/shakil603/Text-Q-Board/actions"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 rounded-xl bg-slate-800 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-950 font-bold text-xs flex items-center gap-1.5 transition-all whitespace-nowrap"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>Download APK</span>
          </a>
          <button
            onClick={() => setIsSettingsModalOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 hover:brightness-110 active:scale-95 shadow-[0_0_12px_rgba(6,182,212,0.4)] whitespace-nowrap"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Settings</span>
          </button>
        </div>
      </header>

      {/* Toast Notification */}
      {copiedToast && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full bg-cyan-950 text-cyan-200 border border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.6)] text-xs font-bold flex items-center gap-1.5 animate-in fade-in">
          <Check className="w-4 h-4 text-cyan-400" />
          <span>{copiedToast}</span>
        </div>
      )}

      {/* 2. MAIN APPLICATION CONTENT */}
      {viewMode === 'gboard_app' ? (
        <div className="flex-1 flex flex-col justify-between max-w-2xl w-full mx-auto">
          {/* Top Scrollable Setup & Customization Area */}
          <div className="p-3 sm:p-4 space-y-3 overflow-y-auto">
            {/* Compact Identity & Android IME Setup Wizard Card */}
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-cyan-500/30 shadow-lg space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <TextQBoardLogo size="sm" showLabel={false} />
                  <div>
                    <h1 className="text-sm sm:text-base font-extrabold text-white">
                      Text Q Board — Gboard Android Keyboard
                    </h1>
                    <p className="text-[11px] text-cyan-300/80">
                      ফোনের সব অ্যাপে (WhatsApp, Messenger, Chrome) কিবোর্ডটি চালু করতে নিচের ২টি ধাপ সম্পন্ন করুন:
                    </p>
                  </div>
                </div>
              </div>

              {/* Step 1 & Step 2 Action Buttons for Real Android System IME */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                <button
                  onClick={() => {
                    const ok = openAndroidInputMethodSettings();
                    if (!ok) {
                      showToast('Install the Android APK to open Android Keyboard Settings!');
                    }
                  }}
                  className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all active:scale-[0.98] ${
                    imeStatus.enabled
                      ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                      : 'bg-cyan-950/50 border-cyan-400/50 text-cyan-100 hover:bg-cyan-900/50'
                  }`}
                >
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">
                      Step 1 • প্রথম ধাপ
                    </div>
                    <div className="text-xs font-bold text-white mt-0.5">
                      1. Enable in Settings (চালু করুন)
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Turn ON &quot;Text Q Board&quot; in system keyboards
                    </div>
                  </div>
                  {imeStatus.enabled ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  ) : (
                    <span className="px-2.5 py-1 rounded-lg bg-cyan-500 text-slate-950 font-extrabold text-xs shrink-0">
                      Enable
                    </span>
                  )}
                </button>

                <button
                  onClick={() => {
                    const ok = showAndroidInputMethodPicker();
                    if (!ok) {
                      showToast('Install the Android APK to switch system input method!');
                    }
                  }}
                  className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all active:scale-[0.98] ${
                    imeStatus.selected
                      ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                      : 'bg-cyan-950/50 border-cyan-400/50 text-cyan-100 hover:bg-cyan-900/50'
                  }`}
                >
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">
                      Step 2 • দ্বিতীয় ধাপ
                    </div>
                    <div className="text-xs font-bold text-white mt-0.5">
                      2. Select Input Method (সিলেক্ট করুন)
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Choose &quot;Text Q Board&quot; as default keyboard
                    </div>
                  </div>
                  {imeStatus.selected ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  ) : (
                    <span className="px-2.5 py-1 rounded-lg bg-cyan-500 text-slate-950 font-extrabold text-xs shrink-0">
                      Select
                    </span>
                  )}
                </button>
              </div>

              {/* Quick Language & Theme Switcher Strip */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-white/10">
                <span className="text-[11px] font-bold text-slate-400 mr-1 flex items-center gap-1">
                  <Languages className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Language:</span>
                </span>
                {SUPPORTED_LANGUAGES.slice(0, 6).map((lang) => (
                  <button
                    key={lang.id}
                    onClick={() => handleUpdateSettings({ activeLanguage: lang.id })}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all active:scale-95 ${
                      settings.activeLanguage === lang.id
                        ? 'bg-cyan-500 text-slate-950 font-bold shadow-[0_0_10px_rgba(6,182,212,0.4)]'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {lang.flag} {lang.nativeName}
                  </button>
                ))}
              </div>
            </div>

            {/* Live Typing Test Area */}
            <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-cyan-500/30 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
                  <KeyboardIcon className="w-3.5 h-3.5" />
                  <span>এখানে টাইপ করে পরীক্ষা করুন (Live Keyboard Test Pad)</span>
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={handleCopySelection}
                    className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-cyan-200 flex items-center gap-1"
                  >
                    <Copy className="w-3 h-3" />
                    <span>Copy</span>
                  </button>
                  <button
                    onClick={() => {
                      setInputText('');
                      setCursorPos(0);
                    }}
                    className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Clear</span>
                  </button>
                </div>
              </div>

              <textarea
                value={inputText}
                inputMode="none"
                onChange={(e) => {
                  setInputText(e.target.value);
                  setCursorPos(e.target.selectionStart || 0);
                }}
                onClick={(e) => setCursorPos((e.target as HTMLTextAreaElement).selectionStart || 0)}
                onKeyUp={(e) => setCursorPos((e.target as HTMLTextAreaElement).selectionStart || 0)}
                placeholder="Type here using Text Q Board below (e.g., type 'amar bangla' and press Space for 'আমার বাংলা')..."
                className="w-full h-24 p-3 rounded-xl bg-slate-950 border border-cyan-500/30 text-cyan-50 placeholder-slate-500 text-sm leading-relaxed resize-none outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          {/* Bottom Docked Full-Width Interactive Text Q Board Keyboard */}
          <div className="w-full sticky bottom-0 z-30 border-t border-cyan-500/30 shadow-[0_-10px_30px_rgba(0,0,0,0.6)]">
            {renderKeyboardEngine()}
          </div>
        </div>
      ) : viewMode === 'phone' ? (
        <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 flex flex-col items-center justify-center">
          <div className="w-full max-w-md h-[760px] flex flex-col justify-between">
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
        </main>
      ) : (
        <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6">
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
                  <div className="flex items-center gap-2 tabular-nums">
                    <span><b>{inputText.length}</b> characters</span>
                    <span>·</span>
                    <span><b>{inputText.trim() ? inputText.trim().split(/\s+/).length : 0}</b> words</span>
                  </div>
                  <span className="text-cyan-400 font-semibold text-[11px]">
                    {settings.activeLanguage.replace('_', ' ')}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-2xl bg-slate-900/50 border border-white/5 space-y-1">
                  <div className="text-cyan-400 font-bold text-xs flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Avro Bengali Phonetic</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Type romanized English words (e.g. &quot;amar&quot;, &quot;bangla&quot;) and press Space for instant Bengali conversion.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-900/50 border border-white/5 space-y-1">
                  <div className="text-cyan-400 font-bold text-xs flex items-center gap-1.5">
                    <Palette className="w-3.5 h-3.5" />
                    <span>System-Wide Android IME</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Includes native Android InputMethodService to work across WhatsApp, Messenger, Chrome, and all apps.
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
        </main>
      )}

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
