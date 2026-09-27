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
import { BoardStudioModal } from './components/BoardStudioModal';
import { Keyboard } from './components/Keyboard';
import { AndroidFrame, AndroidAppId } from './components/AndroidFrame';
import { TextQBoardLogo, TextQBoardHeroBanner } from './components/Logo';
import { transliterateBengali } from './utils/bengaliPhonetic';
import { getWordPredictions } from './utils/dictionary';
import { SOUND_PROFILES, BG_MUSIC_TRACKS, soundEngine } from './utils/audio';
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
  Mic,
  Volume2,
  VolumeX,
  Music,
  Palette,
  Sparkles
} from 'lucide-react';

const DEFAULT_SETTINGS: KeyboardSettings = {
  hapticFeedback: true,
  soundOnKeypress: true,
  soundVolume: 0.6,
  soundProfile: 'gboard_soft',
  bgMusicTrack: 'off',
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
  uiLocale: 'en',
  incognito: false,
  customShortcuts: [
    { shortcut: 'tqb', expanded: 'Text Q Board' },
    { shortcut: 'omw', expanded: 'On my way!' },
    { shortcut: 'amar', expanded: 'আমার' },
    { shortcut: 'bangla', expanded: 'বাংলা' },
  ],

  // Board Customization, Banners, Photos & Animations
  boardAnimation: 'none',
  animationSpeed: 1,
  bannerConfig: {
    templateId: 'pro_material',
    showTitle: true,
    title: 'Text Q Board',
    showSubtitle: true,
    subtitle: 'Multilingual & Phonetic Bengali Keyboard',
    showBadge: true,
    badgeText: 'Pro Edition',
    accentColor: '#A8C7FA',
    bgGradient: 'from-[#1b1e28] via-[#1f2433] to-[#171b24]',
  },
  mediaBackground: {
    type: 'none',
    url: '',
    dimmerOpacity: 0.45,
    blur: 0,
    brightness: 1,
  },
  customColors: {
    useCustomColors: false,
    boardBgColor: '#1b1b1f',
    keyBgColor: '#2f3036',
    keySpecialBgColor: '#232429',
    keyTextColor: '#e3e2e6',
    accentColor: '#a8c7fa',
    accentTextColor: '#062e6f',
  },
  boardTemplateId: 'template_default',
  isBlankBoard: false,
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

  // Modals / Voice Panel / Board Studio Customizer
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isBoardStudioOpen, setIsBoardStudioOpen] = useState(false);

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
      activeToolbarView === 'sound_studio' ||
      activeToolbarView === 'board_studio' ||
      activeToolbarView === 'translate' ||
      activeToolbarView === 'clipboard' ||
      activeToolbarView === 'text_edit' ||
      activeToolbarView === 'themes' ||
      activeToolbarView === 'smart_ai'
    ) {
      targetDp = settings.showNumberRow ? 400 : 365;
    }
    imeSetKeyboardHeight(targetDp);
  }, [inImeMode, settings.showNumberRow, activeToolbarView, isVoiceModalOpen]);

  // Synchronize Background Music Engine
  useEffect(() => {
    soundEngine.setBackgroundMusic(settings.bgMusicTrack, settings.soundVolume);
  }, [settings.bgMusicTrack, settings.soundVolume]);

  // Clipboard items
  const [clipboardItems, setClipboardItems] = useState<ClipboardItem[]>([
    {
      id: '1',
      text: 'Text Q Board — Multilingual & Phonetic Keyboard',
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
        onOpenBoardStudio={() => setIsBoardStudioOpen(true)}
        onHideKeyboard={inImeMode ? () => imeHideKeyboard() : undefined}
        theme={currentTheme}
        incognito={settings.incognito}
        soundOnKeypress={settings.soundOnKeypress}
        bgMusicActive={Boolean(settings.bgMusicTrack && settings.bgMusicTrack !== 'off')}
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

      {/* 2. Expanded Tools Bar (Languages, Sound & Music, Board Studio, Translate, Clipboard, Text Edit D-Pad, Themes, Smart AI) */}
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
          soundOnKeypress={settings.soundOnKeypress}
          soundVolume={settings.soundVolume}
          soundProfile={settings.soundProfile || 'gboard_soft'}
          bgMusicTrack={settings.bgMusicTrack || 'off'}
          activeLanguage={settings.activeLanguage}
          onLanguageChange={(langId) =>
            handleUpdateSettings({ activeLanguage: langId })
          }
          settings={settings}
          onOpenBoardStudio={() => setIsBoardStudioOpen(true)}
          onUpdateSettings={handleUpdateSettings}
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
      {/* Top Bar: Unified App Icon + Wordmark */}
      <header className="h-14 w-full flex items-center justify-between px-3.5 md:px-6 border-b border-white/10 bg-[#151922] sticky top-0 z-40">
        {/* Zone 1: Brand Icon + Wordmark (Matches Android Launcher Icon & Initial Banner) */}
        <a href="#top" className="flex items-center">
          <TextQBoardLogo size="xs" subtitle="" />
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
            onClick={() => setIsBoardStudioOpen(true)}
            className="hover:text-white text-[#a8c7fa] transition-colors whitespace-nowrap flex items-center gap-1 font-semibold"
          >
            <Palette className="w-3.5 h-3.5" />
            <span>Customize Board</span>
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

        {/* Zone 3: Primary Actions (Board Studio + Quick Sound Toggle + Get APK + Settings) */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setIsBoardStudioOpen(true)}
            className="px-2.5 py-1.5 rounded-lg bg-[#232936] hover:bg-[#2c3444] text-[#a8c7fa] font-semibold text-xs flex items-center gap-1.5 transition-colors border border-white/5"
            title="Customize Board, Banners, Photos & Animations"
          >
            <Palette className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Customize</span>
          </button>

          <button
            type="button"
            onClick={() => {
              const next = !settings.soundOnKeypress;
              handleUpdateSettings({ soundOnKeypress: next });
              if (next) {
                soundEngine.playKeyClick(
                  'standard',
                  settings.soundVolume,
                  settings.soundProfile || 'gboard_soft'
                );
              }
              showToast(next ? 'Typing Sound: ON' : 'Typing Sound: OFF');
            }}
            className={`p-2 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors ${
              settings.soundOnKeypress
                ? 'bg-[#252d3d] text-[#a8c7fa] border border-[#a8c7fa]/30'
                : 'bg-[#232429] text-[#9aa0a6]'
            }`}
            title={settings.soundOnKeypress ? 'Mute Typing Sound' : 'Enable Typing Sound'}
          >
            {settings.soundOnKeypress ? (
              <Volume2 className="w-3.5 h-3.5" />
            ) : (
              <VolumeX className="w-3.5 h-3.5" />
            )}
          </button>

          <a
            href="https://github.com/shakil603/Text-Q-Board/actions"
            target="_blank"
            rel="noopener noreferrer"
            className="px-2.5 py-1.5 rounded-lg bg-[#232429] text-[#e3e2e6] hover:bg-[#2f3036] font-medium text-xs flex items-center gap-1.5 transition-colors whitespace-nowrap"
          >
            <Download className="w-3.5 h-3.5 text-[#a8c7fa]" />
            <span>Get APK</span>
          </a>

          <button
            type="button"
            onClick={() => setIsSettingsModalOpen(true)}
            className="px-3 py-1.5 rounded-lg bg-[#a8c7fa] text-[#062e6f] font-semibold text-xs flex items-center gap-1.5 hover:bg-[#b8d2fc] transition-colors whitespace-nowrap"
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
          <div className="p-3 sm:p-4 space-y-2.5 overflow-y-auto">
            {/* Unified Customizable Hero Banner (With Name, Gradients, Photos, and Edit button) */}
            <TextQBoardHeroBanner
              bannerConfig={settings.bannerConfig}
              mediaBackground={settings.mediaBackground}
              isBlankBoard={settings.isBlankBoard}
              onOpenVoice={() => setIsVoiceModalOpen(true)}
              onOpenSoundStudio={() => {
                setIsVoiceModalOpen(false);
                setActiveToolbarView((prev) =>
                  prev === 'sound_studio' ? 'normal' : 'sound_studio'
                );
              }}
              onOpenBoardStudio={() => setIsBoardStudioOpen(true)}
            />

            {/* Clean Material 3 Setup & Audio Control Card */}
            <div className="p-3.5 rounded-2xl bg-[#151922] border border-[#a8c7fa]/25 space-y-3">
              {/* 2-Step Android System Keyboard Activation */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
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
                  className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition-colors ${
                    imeStatus.enabled
                      ? 'bg-[#1b2822] border-[#6dd58c]/35 text-[#e1e9e4]'
                      : 'bg-[#1e2430] border-white/10 text-[#e3e2e6] hover:bg-[#262d3d]'
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
                  className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition-colors ${
                    imeStatus.selected
                      ? 'bg-[#1b2822] border-[#6dd58c]/35 text-[#e1e9e4]'
                      : 'bg-[#1e2430] border-white/10 text-[#e3e2e6] hover:bg-[#262d3d]'
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

              {/* Quick Board Customization & Typing Sound Strip */}
              <div className="pt-1 border-t border-white/8 space-y-1.5">
                <div className="flex items-center justify-between text-[11px]">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsBoardStudioOpen(true)}
                      className="text-[#a8c7fa] font-semibold hover:underline flex items-center gap-1"
                    >
                      <Palette className="w-3 h-3" />
                      <span>Customize Colors, Banner & Photos</span>
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      const next = !settings.soundOnKeypress;
                      handleUpdateSettings({ soundOnKeypress: next });
                      if (next) {
                        soundEngine.playKeyClick(
                          'standard',
                          settings.soundVolume,
                          settings.soundProfile || 'gboard_soft'
                        );
                      }
                    }}
                    className={`font-semibold flex items-center gap-1 ${
                      settings.soundOnKeypress ? 'text-[#6dd58c]' : 'text-[#9aa0a6]'
                    }`}
                  >
                    {settings.soundOnKeypress ? (
                      <>
                        <Volume2 className="w-3 h-3" />
                        <span>Sound ON</span>
                      </>
                    ) : (
                      <>
                        <VolumeX className="w-3 h-3" />
                        <span>Sound OFF</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                  {SOUND_PROFILES.map((sp) => {
                    const isActive =
                      settings.soundOnKeypress &&
                      (settings.soundProfile || 'gboard_soft') === sp.id;
                    return (
                      <button
                        key={sp.id}
                        type="button"
                        onClick={() => {
                          handleUpdateSettings({
                            soundOnKeypress: true,
                            soundProfile: sp.id,
                          });
                          soundEngine.playKeyClick(
                            'standard',
                            settings.soundVolume,
                            sp.id
                          );
                        }}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-medium whitespace-nowrap transition-colors ${
                          isActive
                            ? 'bg-[#a8c7fa] text-[#062e6f] font-semibold'
                            : 'bg-[#1e2430] text-[#c4c6d0] hover:bg-[#262d3d]'
                        }`}
                      >
                        {sp.name}
                      </button>
                    );
                  })}
                </div>

                {/* Ambient Background Music Quick Selector */}
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-0.5">
                  <span className="text-[11px] text-[#9aa0a6] shrink-0 flex items-center gap-1 pr-1">
                    <Music className="w-3 h-3 text-[#a8c7fa]" />
                    <span>Music:</span>
                  </span>
                  {BG_MUSIC_TRACKS.map((track) => {
                    const isPlaying = (settings.bgMusicTrack || 'off') === track.id;
                    return (
                      <button
                        key={track.id}
                        type="button"
                        onClick={() => {
                          handleUpdateSettings({ bgMusicTrack: track.id });
                          soundEngine.setBackgroundMusic(
                            track.id,
                            settings.soundVolume
                          );
                        }}
                        className={`px-2 py-0.5 rounded-md text-[11px] font-medium whitespace-nowrap transition-colors ${
                          isPlaying
                            ? 'bg-[#4285f4] text-white font-semibold'
                            : 'bg-[#1e2430] text-[#9aa0a6] hover:text-white'
                        }`}
                      >
                        {track.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Clean Segmented Universal World Language Bar */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1.5 border-t border-white/8">
                <span className="text-[11px] text-[#9aa0a6] shrink-0 font-medium pl-0.5">
                  Language:
                </span>
                {SUPPORTED_LANGUAGES.slice(0, 10).map((lang) => (
                  <button
                    key={lang.id}
                    type="button"
                    onClick={() =>
                      handleUpdateSettings({ activeLanguage: lang.id })
                    }
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                      settings.activeLanguage === lang.id
                        ? 'bg-[#a8c7fa] text-[#062e6f] font-semibold shadow-sm'
                        : 'bg-[#1e2430] text-[#c4c6d0] hover:bg-[#262d3d] hover:text-white'
                    }`}
                  >
                    <span>{lang.flag}</span>
                    <span>{lang.nativeName}</span>
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    setIsVoiceModalOpen(false);
                    setActiveToolbarView('languages');
                  }}
                  className="px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap bg-[#232936] text-[#a8c7fa] hover:bg-[#2c3444] flex items-center gap-1 border border-white/5"
                >
                  <span>🌐 All Languages...</span>
                </button>
              </div>
            </div>

            {/* Live Typing Test Area */}
            <div className="p-3 rounded-2xl bg-[#151922] border border-white/8 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-[#c4c6d0]">
                  Test Keyboard, Customized Board & Voice
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setIsBoardStudioOpen(true)}
                    className="px-2.5 py-1 rounded-md bg-[#232936] hover:bg-[#2c3444] text-xs text-[#a8c7fa] flex items-center gap-1"
                  >
                    <Palette className="w-3 h-3" />
                    <span>Board Studio</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleCopySelection}
                    className="px-2.5 py-1 rounded-md bg-[#232936] hover:bg-[#2c3444] text-xs text-[#e3e2e6] flex items-center gap-1"
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
                    className="px-2.5 py-1 rounded-md bg-[#232936] hover:bg-[#2c3444] text-xs text-[#c4c6d0] flex items-center gap-1"
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
                placeholder="Type here using the customized keyboard below..."
                className="w-full h-20 p-2.5 rounded-xl bg-[#0e1117] border border-white/10 text-[#e3e2e6] placeholder-[#9aa0a6] text-sm leading-relaxed resize-none outline-none focus:border-[#a8c7fa]"
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
            {/* Left Column: Text Editor & Board Customizer Card */}
            <div className="lg:col-span-5 space-y-4">
              <div className="p-5 rounded-2xl bg-[#151922] border border-[#a8c7fa]/20 space-y-3">
                <div className="flex items-center justify-between">
                  <TextQBoardLogo size="sm" />
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setIsBoardStudioOpen(true)}
                      className="px-2.5 py-1 rounded-lg bg-[#232936] hover:bg-[#2c3444] text-[#a8c7fa] text-xs font-semibold flex items-center gap-1"
                    >
                      <Palette className="w-3.5 h-3.5" />
                      <span>Customize</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleCopySelection}
                      className="p-1.5 rounded-lg bg-[#232936] hover:bg-[#2c3444] text-[#e3e2e6]"
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
                      className="p-1.5 rounded-lg bg-[#232936] hover:bg-[#2c3444] text-[#e3e2e6]"
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
                  className="w-full h-44 p-3.5 rounded-xl bg-[#0e1117] border border-white/10 text-[#e3e2e6] placeholder-[#9aa0a6] text-sm leading-relaxed resize-none outline-none focus:border-[#a8c7fa]"
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
        onOpenBoardStudio={() => setIsBoardStudioOpen(true)}
      />

      {/* Board Studio Modal: Colors, Editable Banners, Photos, Animations, and Templates */}
      <BoardStudioModal
        isOpen={isBoardStudioOpen}
        onClose={() => setIsBoardStudioOpen(false)}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
        theme={currentTheme}
      />
    </div>
  );
}
