import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  KeyboardSettings,
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
  Settings,
  Download,
  Copy,
  Check,
  RotateCcw,
  CheckCircle2,
  Mic
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
  enabledLanguages: [
    'bn_phonetic',
    'en_us',
    'bn_jatiya',
    'bn_probhat',
    'es_es',
    'ar_sa',
    'hi_in',
  ],
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
  const currentTheme: ThemeConfig =
    KEYBOARD_THEMES[settings.theme] || KEYBOARD_THEMES.cyber_cyan;

  // Active Android App in Phone Simulator
  const [activeApp, setActiveApp] = useState<AndroidAppId>('chat');

  // Active Typed Text & Cursor Position
  const [inputText, setInputText] = useState<string>(() =>
    inImeMode ? imeGetTextBeforeCursor(60) : 'আমার সোনার বাংলা '
  );
  const [cursorPos, setCursorPos] = useState<number>(() => inputText.length);

  // Active Toolbar View
  const [activeToolbarView, setActiveToolbarView] = useState<ToolbarView>('normal');

  // Modals / Voice Panel
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  // Viewport mode: 'gboard_app' (Native Gboard Launcher & Test View), 'phone' (Simulator), or 'expanded' (Desktop Studio)
  const [viewMode, setViewMode] = useState<'gboard_app' | 'phone' | 'expanded'>('gboard_app');

  // Dynamically update Android IME window height when in system IME mode
  useEffect(() => {
    if (!inImeMode) return;
    let targetDp = settings.showNumberRow ? 320 : 280;
    if (isVoiceModalOpen) {
      targetDp = 295;
    } else if (activeToolbarView === 'emoji_picker') {
      targetDp = 330;
    } else if (
      activeToolbarView === 'translate' ||
      activeToolbarView === 'clipboard' ||
      activeToolbarView === 'text_edit' ||
      activeToolbarView === 'themes' ||
      activeToolbarView === 'smart_ai'
    ) {
      targetDp = settings.showNumberRow ? 380 : 345;
    }
    imeSetKeyboardHeight(targetDp);
  }, [inImeMode, settings.showNumberRow, activeToolbarView, isVoiceModalOpen]);

  // Clipboard items
  const [clipboardItems, setClipboardItems] = useState<ClipboardItem[]>([
    {
      id: '1',
      text: 'Text Q Board — Gboard Input Method',
      timestamp: Date.now() - 10000,
      pinned: true,
    },
    {
      id: '2',
      text: 'আমার সোনার বাংলা, আমি তোমায় ভালোবাসি',
      timestamp: Date.now() - 50000,
      pinned: true,
    },
    {
      id: '3',
      text: 'আপনি কেমন আছেন? ধন্যবাদ!',
      timestamp: Date.now() - 120000,
      pinned: false,
    },
  ]);

  // Toast / Copy Feedback
  const [copiedToast, setCopiedToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setCopiedToast(msg);
    setTimeout(() => setCopiedToast(null), 1800);
  };

  // Update Settings helper (saves to SharedPreferences + localStorage)
  const handleUpdateSettings = useCallback(
    (newSettings: Partial<KeyboardSettings>) => {
      setSettings((prev) => {
        const updated = { ...prev, ...newSettings };
        savePersistedSettings(updated);
        return updated;
      });
    },
    []
  );

  // Find current word being typed before cursor
  const currentWord = useMemo(() => {
    const textBeforeCursor = inputText.slice(0, cursorPos);
    const match = textBeforeCursor.match(/([^\s]+)$/);
    return match ? match[1] : '';
  }, [inputText, cursorPos]);

  // Compute live predictive suggestions / Bengali transliterations
  const suggestions = useMemo(() => {
    if (settings.activeLanguage === 'bn_phonetic' && currentWord) {
      const banglaCandidates = transliterateBengali(currentWord);
      const list = [...banglaCandidates];
      if (!list.includes(currentWord)) {
        list.push(currentWord);
      }
      return list.slice(0, 3);
    } else {
      const textBeforeCursor = inputText.slice(0, cursorPos - currentWord.length);
      return getWordPredictions(
        currentWord,
        textBeforeCursor,
        settings.customShortcuts
      );
    }
  }, [
    currentWord,
    settings.activeLanguage,
    settings.customShortcuts,
    inputText,
    cursorPos,
  ]);

  // --- KEYBOARD ACTIONS ---

  const handleInsertText = useCallback(
    (text: string) => {
      if (inImeMode) {
        imeCommitText(text);
      }
      setInputText((prev) => {
        const before = prev.slice(0, cursorPos);
        const after = prev.slice(cursorPos);
        return before + text + after;
      });
      setCursorPos((prev) => prev + text.length);
    },
    [cursorPos, inImeMode]
  );

  const handleSelectSuggestion = useCallback(
    (chosenWord: string) => {
      if (inImeMode) {
        imeReplaceCurrentWord(currentWord.length, chosenWord + ' ');
      }
      setInputText((prev) => {
        const beforeWord = prev.slice(
          0,
          Math.max(0, cursorPos - currentWord.length)
        );
        const after = prev.slice(cursorPos);
        return beforeWord + chosenWord + ' ' + after;
      });
      setCursorPos(
        (prev) =>
          Math.max(0, prev - currentWord.length) + chosenWord.length + 1
      );
    },
    [cursorPos, currentWord, inImeMode]
  );

  // Spacebar handler: auto-commits Bengali phonetic conversion or shortcut
  const handleSpacebar = useCallback(() => {
    if (
      currentWord &&
      settings.activeLanguage === 'bn_phonetic' &&
      suggestions.length > 0
    ) {
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
  }, [
    currentWord,
    settings.activeLanguage,
    settings.autoCorrection,
    settings.customShortcuts,
    suggestions,
    handleSelectSuggestion,
    handleInsertText,
  ]);

  const handleDeleteText = useCallback(
    (count: number = 1) => {
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
    },
    [cursorPos, inImeMode]
  );

  const handleEnter = useCallback(() => {
    if (inImeMode) {
      imeSendEnter();
      setInputText('');
      setCursorPos(0);
      return;
    }
    handleInsertText('\n');
  }, [handleInsertText, inImeMode]);

  const handleMoveCursor = useCallback(
    (direction: 'left' | 'right' | 'up' | 'down' | 'start' | 'end') => {
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
    },
    [inputText.length, inImeMode]
  );

  const handleReplaceAllText = useCallback(
    (newText: string) => {
      if (inImeMode) {
        imeReplaceCurrentWord(inputText.length, newText);
      }
      setInputText(newText);
      setCursorPos(newText.length);
    },
    [inImeMode, inputText.length]
  );

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
        {
          id: Date.now().toString(),
          text: inputText,
          timestamp: Date.now(),
          pinned: false,
        },
        ...prev.slice(0, 19),
      ]);
      showToast('Copied to clipboard');
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

  const handleAddClipboardItem = (text: string) => {
    setClipboardItems((prev) => [
      { id: Date.now().toString(), text, timestamp: Date.now(), pinned: false },
      ...prev,
    ]);
  };

  const handleTogglePinClipboard = (id: string) => {
    setClipboardItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, pinned: !item.pinned } : item
      )
    );
  };

  const handleDeleteClipboardItem = (id: string) => {
    setClipboardItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleClearClipboard = () => {
    setClipboardItems((prev) => prev.filter((item) => item.pinned));
  };

  // Complete Gboard Unit (Suggestion Strip + Tools / Voice / Emoji / Keys)
  const renderKeyboardEngine = () => (
    <div className={`w-full overflow-hidden transition-colors ${currentTheme.boardBg}`}>
      {/* 1. Suggestion Strip / Toolbar Action Bar */}
      <SuggestionStrip
        suggestions={suggestions}
        onSelectSuggestion={handleSelectSuggestion}
        activeToolbarView={activeToolbarView}
        setActiveToolbarView={(view) => {
          setIsVoiceModalOpen(false);
          setActiveToolbarView(view);
        }}
        onStartVoiceTyping={() => {
          setActiveToolbarView('normal');
          setIsVoiceModalOpen((prev) => !prev);
        }}
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
      {!isVoiceModalOpen && (
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
      )}

      {/* 3. Main Keyboard Body: Voice Typing Panel OR Emoji/GIF Panel OR Flat Gboard Keys */}
      {isVoiceModalOpen ? (
        <VoiceModal
          isOpen={isVoiceModalOpen}
          onClose={() => setIsVoiceModalOpen(false)}
          onInsertVoiceText={(txt) => handleInsertText(txt + ' ')}
          theme={currentTheme}
          activeLanguage={settings.activeLanguage}
        />
      ) : activeToolbarView === 'emoji_picker' ? (
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
          onLanguageChange={(langId) =>
            handleUpdateSettings({ activeLanguage: langId })
          }
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
          onToggleOneHanded={(side) =>
            handleUpdateSettings({ oneHandedMode: side })
          }
        />
      )}
    </div>
  );

  // ============================================================================
  // SYSTEM-WIDE ANDROID KEYBOARD MODE (?mode=ime inside TextQBoardIMEService)
  // ============================================================================
  if (inImeMode) {
    return (
      <div
        className={`w-full h-full flex flex-col justify-end select-none overflow-hidden ${currentTheme.boardBg}`}
      >
        {renderKeyboardEngine()}
      </div>
    );
  }

  // ============================================================================
  // GBOARD LAUNCHER & SETUP APP + INTERACTIVE STUDIO
  // ============================================================================
  return (
    <div className="min-h-screen bg-[#111318] text-[#e3e2e6] flex flex-col font-sans">
      {/* Top Bar: 3 Clean Zones */}
      <header className="h-14 w-full flex items-center justify-between px-4 md:px-6 border-b border-white/10 bg-[#1b1b1f] sticky top-0 z-40">
        {/* Zone 1: Brand Wordmark */}
        <a
          href="#top"
          className="text-base font-semibold tracking-tight text-[#e3e2e6]"
        >
          Text Q Board
        </a>

        {/* Zone 2: Clean Text Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-[#c4c6d0]">
          <button
            type="button"
            onClick={() => setViewMode('gboard_app')}
            className={`transition-colors whitespace-nowrap ${
              viewMode === 'gboard_app'
                ? 'text-[#a8c7fa] underline underline-offset-4'
                : 'hover:text-white'
            }`}
          >
            Keyboard Setup
          </button>
          <button
            type="button"
            onClick={() => setViewMode('phone')}
            className={`transition-colors whitespace-nowrap ${
              viewMode === 'phone'
                ? 'text-[#a8c7fa] underline underline-offset-4'
                : 'hover:text-white'
            }`}
          >
            App Simulator
          </button>
          <button
            type="button"
            onClick={() => setViewMode('expanded')}
            className={`transition-colors whitespace-nowrap ${
              viewMode === 'expanded'
                ? 'text-[#a8c7fa] underline underline-offset-4'
                : 'hover:text-white'
            }`}
          >
            Desktop Studio
          </button>
          <button
            type="button"
            onClick={() => setIsSettingsModalOpen(true)}
            className="hover:text-white transition-colors whitespace-nowrap"
          >
            Preferences
          </button>
        </nav>

        {/* Zone 3: Primary Action */}
        <div className="flex items-center gap-2">
          <a
            href="https://github.com/shakil603/Text-Q-Board/actions"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 rounded-lg bg-[#2f3036] text-[#e3e2e6] hover:bg-[#373940] font-medium text-xs flex items-center gap-1.5 transition-colors whitespace-nowrap"
          >
            <Download className="w-3.5 h-3.5 text-[#a8c7fa]" />
            <span>Get APK</span>
          </a>
          <button
            type="button"
            onClick={() => setIsSettingsModalOpen(true)}
            className="px-3.5 py-1.5 rounded-lg bg-[#a8c7fa] text-[#062e6f] font-semibold text-xs flex items-center gap-1.5 hover:bg-[#b8d2fc] transition-colors whitespace-nowrap"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Settings</span>
          </button>
        </div>
      </header>

      {/* Toast Notification */}
      {copiedToast && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full bg-[#2f3036] text-[#e3e2e6] border border-white/10 shadow-lg text-xs font-medium flex items-center gap-1.5">
          <Check className="w-4 h-4 text-[#a8c7fa]" />
          <span>{copiedToast}</span>
        </div>
      )}

      {/* Main Content */}
      {viewMode === 'gboard_app' ? (
        <div className="flex-1 flex flex-col justify-between max-w-xl w-full mx-auto">
          {/* Top Setup & Live Typing Section */}
          <div className="p-3.5 sm:p-4 space-y-3 overflow-y-auto">
            {/* Clean Material 3 Gboard Banner */}
            <div className="p-4 rounded-2xl bg-[#1b1b1f] border border-white/8 space-y-3.5">
              <div className="flex items-center justify-between gap-3">
                <TextQBoardLogo size="sm" />
                <button
                  type="button"
                  onClick={() => setIsVoiceModalOpen(true)}
                  className="px-3 py-1.5 rounded-full bg-[#2f3036] hover:bg-[#373940] text-xs font-medium text-[#a8c7fa] flex items-center gap-1.5 transition-colors"
                >
                  <Mic className="w-3.5 h-3.5" />
                  <span>Voice Typing</span>
                </button>
              </div>

              {/* 2-Step Android System Keyboard Activation */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    const ok = openAndroidInputMethodSettings();
                    if (!ok) {
                      showToast(
                        'Install the Android APK to open system keyboard settings'
                      );
                    }
                  }}
                  className={`p-3 rounded-xl border text-left flex items-center justify-between transition-colors ${
                    imeStatus.enabled
                      ? 'bg-[#1e2a24] border-[#6dd58c]/30 text-[#e1e9e4]'
                      : 'bg-[#232429] border-white/8 text-[#e3e2e6] hover:bg-[#2f3036]'
                  }`}
                >
                  <div>
                    <p className="text-xs font-semibold text-white">
                      01. Enable in Settings
                    </p>
                    <p className="text-[11px] text-[#9aa0a6] mt-0.5">
                      Turn on Text Q Board in system keyboards
                    </p>
                  </div>
                  {imeStatus.enabled ? (
                    <CheckCircle2 className="w-5 h-5 text-[#6dd58c] shrink-0" />
                  ) : (
                    <span className="px-2.5 py-1 rounded-md bg-[#a8c7fa] text-[#062e6f] font-semibold text-xs shrink-0">
                      Enable
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const ok = showAndroidInputMethodPicker();
                    if (!ok) {
                      showToast(
                        'Install the Android APK to switch system input method'
                      );
                    }
                  }}
                  className={`p-3 rounded-xl border text-left flex items-center justify-between transition-colors ${
                    imeStatus.selected
                      ? 'bg-[#1e2a24] border-[#6dd58c]/30 text-[#e1e9e4]'
                      : 'bg-[#232429] border-white/8 text-[#e3e2e6] hover:bg-[#2f3036]'
                  }`}
                >
                  <div>
                    <p className="text-xs font-semibold text-white">
                      02. Select Input Method
                    </p>
                    <p className="text-[11px] text-[#9aa0a6] mt-0.5">
                      Set Text Q Board as default keyboard
                    </p>
                  </div>
                  {imeStatus.selected ? (
                    <CheckCircle2 className="w-5 h-5 text-[#6dd58c] shrink-0" />
                  ) : (
                    <span className="px-2.5 py-1 rounded-md bg-[#a8c7fa] text-[#062e6f] font-semibold text-xs shrink-0">
                      Select
                    </span>
                  )}
                </button>
              </div>

              {/* Clean Segmented Language Bar */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1">
                {SUPPORTED_LANGUAGES.slice(0, 6).map((lang) => (
                  <button
                    key={lang.id}
                    type="button"
                    onClick={() =>
                      handleUpdateSettings({ activeLanguage: lang.id })
                    }
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                      settings.activeLanguage === lang.id
                        ? 'bg-[#a8c7fa] text-[#062e6f] font-semibold'
                        : 'bg-[#232429] text-[#c4c6d0] hover:bg-[#2f3036]'
                    }`}
                  >
                    {lang.nativeName}
                  </button>
                ))}
              </div>
            </div>

            {/* Live Typing Test Area */}
            <div className="p-3.5 rounded-2xl bg-[#1b1b1f] border border-white/8 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-[#c4c6d0]">
                  Test Keyboard & Voice Input
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={handleCopySelection}
                    className="px-2.5 py-1 rounded-md bg-[#2f3036] hover:bg-[#373940] text-xs text-[#e3e2e6] flex items-center gap-1"
                  >
                    <Copy className="w-3 h-3" />
                    <span>Copy</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setInputText('');
                      setCursorPos(0);
                    }}
                    className="px-2.5 py-1 rounded-md bg-[#2f3036] hover:bg-[#373940] text-xs text-[#c4c6d0] flex items-center gap-1"
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
                onClick={(e) =>
                  setCursorPos(
                    (e.target as HTMLTextAreaElement).selectionStart || 0
                  )
                }
                onKeyUp={(e) =>
                  setCursorPos(
                    (e.target as HTMLTextAreaElement).selectionStart || 0
                  )
                }
                placeholder="Type here using the Gboard layout below (or tap the microphone icon to dictate)..."
                className="w-full h-24 p-3 rounded-xl bg-[#111318] border border-white/10 text-[#e3e2e6] placeholder-[#9aa0a6] text-sm leading-relaxed resize-none outline-none focus:border-[#a8c7fa]"
              />
            </div>
          </div>

          {/* Bottom Docked Flat Gboard Keyboard */}
          <div className="w-full sticky bottom-0 z-30 border-t border-white/8">
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
        <main className="flex-1 max-w-6xl w-full mx-auto p-4 md:p-6">
          <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Text Editor */}
            <div className="lg:col-span-5 space-y-4">
              <div className="p-5 rounded-2xl bg-[#1b1b1f] border border-white/8 space-y-3">
                <div className="flex items-center justify-between">
                  <TextQBoardLogo size="sm" />
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={handleCopySelection}
                      className="p-1.5 rounded-lg bg-[#2f3036] hover:bg-[#373940] text-[#e3e2e6]"
                      title="Copy"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setInputText('');
                        setCursorPos(0);
                      }}
                      className="p-1.5 rounded-lg bg-[#2f3036] hover:bg-[#373940] text-[#e3e2e6]"
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
                  placeholder="Type or dictate with Text Q Board..."
                  className="w-full h-44 p-3.5 rounded-xl bg-[#111318] border border-white/10 text-[#e3e2e6] placeholder-[#9aa0a6] text-sm leading-relaxed resize-none outline-none focus:border-[#a8c7fa]"
                />

                <div className="flex items-center justify-between text-xs text-[#9aa0a6] tabular-nums">
                  <div className="flex items-center gap-2">
                    <span>{inputText.length} characters</span>
                    <span>·</span>
                    <span>
                      {inputText.trim()
                        ? inputText.trim().split(/\s+/).length
                        : 0}{' '}
                      words
                    </span>
                  </div>
                  <span>{settings.activeLanguage.replace('_', ' ')}</span>
                </div>
              </div>
            </div>

            {/* Right Column: Flat Gboard Keyboard */}
            <div className="lg:col-span-7 flex flex-col items-center">
              <div className="w-full max-w-xl rounded-2xl border border-white/10 overflow-hidden">
                {renderKeyboardEngine()}
              </div>
            </div>
          </div>
        </main>
      )}

      {/* Settings Modal */}
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
