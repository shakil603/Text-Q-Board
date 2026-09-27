import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  Copy,
  Scissors,
  Trash2,
  Pin,
  Sparkles,
  Plus,
  Check,
  Languages as LanguagesIcon,
  Volume2,
  VolumeX,
  Music,
  Disc,
  Play,
  Search,
  Globe
} from 'lucide-react';
import {
  ThemeConfig,
  ThemeId,
  ToolbarView,
  ClipboardItem,
  SoundProfileId,
  BgMusicTrackId,
  KeyboardSettings,
  LanguageId
} from '../types/keyboard';
import { KEYBOARD_THEMES } from '../data/themes';
import { SUPPORTED_LANGUAGES } from '../data/layouts';
import { SOUND_PROFILES, BG_MUSIC_TRACKS, soundEngine } from '../utils/audio';

interface ToolbarToolsProps {
  activeView: ToolbarView;
  onClose: () => void;
  theme: ThemeConfig;
  currentText: string;
  onInsertText: (text: string) => void;
  onReplaceAllText: (text: string) => void;
  onMoveCursor: (direction: 'left' | 'right' | 'up' | 'down' | 'start' | 'end') => void;
  onSelectAll: () => void;
  onCopySelection: () => void;
  onCutSelection: () => void;
  onDeleteSelection: () => void;
  clipboardItems: ClipboardItem[];
  onAddClipboardItem: (text: string) => void;
  onTogglePinClipboard: (id: string) => void;
  onDeleteClipboardItem: (id: string) => void;
  onClearClipboard: () => void;
  onSelectTheme: (themeId: ThemeId) => void;
  soundOnKeypress?: boolean;
  soundVolume?: number;
  soundProfile?: SoundProfileId;
  bgMusicTrack?: BgMusicTrackId;
  activeLanguage?: LanguageId;
  onLanguageChange?: (langId: LanguageId) => void;
  settings?: KeyboardSettings;
  onOpenBoardStudio?: () => void;
  onUpdateSettings?: (newSettings: Partial<KeyboardSettings>) => void;
}

const TRANSLATION_LANGUAGES = [
  { code: 'bn', name: 'Bengali / বাংলা' },
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish / Español' },
  { code: 'ar', name: 'Arabic / العربية' },
  { code: 'hi', name: 'Hindi / हिन्दी' },
  { code: 'fr', name: 'French / Français' },
  { code: 'de', name: 'German / Deutsch' },
  { code: 'ja', name: 'Japanese / 日本語' },
  { code: 'zh', name: 'Chinese / 中文' },
  { code: 'ko', name: 'Korean / 한국어' },
  { code: 'ru', name: 'Russian / Русский' },
  { code: 'pt', name: 'Portuguese / Português' },
  { code: 'it', name: 'Italian / Italiano' },
  { code: 'tr', name: 'Turkish / Türkçe' },
  { code: 'vi', name: 'Vietnamese / Tiếng Việt' },
];

export const ToolbarTools: React.FC<ToolbarToolsProps> = ({
  activeView,
  onClose,
  theme,
  currentText,
  onInsertText,
  onReplaceAllText,
  onMoveCursor,
  onSelectAll,
  onCopySelection,
  onCutSelection,
  onDeleteSelection,
  clipboardItems,
  onAddClipboardItem,
  onTogglePinClipboard,
  onDeleteClipboardItem,
  onClearClipboard,
  onSelectTheme,
  soundOnKeypress = true,
  soundVolume = 0.5,
  soundProfile = 'gboard_soft',
  bgMusicTrack = 'off',
  activeLanguage = 'en_us',
  onLanguageChange,
  settings,
  onOpenBoardStudio,
  onUpdateSettings,
}) => {
  // Translate states
  const [sourceLang, setSourceLang] = useState('en');
  const [targetLang, setTargetLang] = useState('bn');
  const [transInput, setTransInput] = useState('');
  const [transOutput, setTransOutput] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);

  // Language search state
  const [langSearch, setLangSearch] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<string>('all');

  // New clip input
  const [newClipText, setNewClipText] = useState('');
  const [showAddClip, setShowAddClip] = useState(false);

  // AI assistant rewrite state
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiOptions, setAiOptions] = useState<string[]>([]);

  // Simple instant bilingual lookup dictionary for live translator
  useEffect(() => {
    if (activeView === 'translate' && currentText && !transInput) {
      setTransInput(currentText);
    }
  }, [activeView, currentText, transInput]);

  useEffect(() => {
    if (!transInput.trim()) {
      setTransOutput('');
      return;
    }

    setIsTranslating(true);
    const timer = setTimeout(() => {
      const lower = transInput.trim().toLowerCase();
      let output = '';

      if (targetLang === 'bn') {
        const dict: Record<string, string> = {
          hello: 'হ্যালো / নমস্কার',
          hi: 'হাই / সালাম',
          welcome: 'স্বাগতম',
          good: 'ভালো',
          thanks: 'ধন্যবাদ',
          'thank you': 'আপনাকে অনেক ধন্যবাদ',
          yes: 'হ্যাঁ',
          no: 'না',
          bangla: 'বাংলা',
          bengali: 'বাংলা',
          love: 'ভালোবাসা',
          beautiful: 'সুন্দর',
          keyboard: 'কীবোর্ড',
          how: 'কেমন',
          'how are you': 'আপনি কেমন আছেন?',
          'good morning': 'শুভ সকাল',
          'good night': 'শুভ রাত্রি',
          name: 'নাম',
          friend: 'বন্ধু',
        };
        output = dict[lower] || `${transInput} (অনুবাদ)`;
      } else if (targetLang === 'en') {
        const dict: Record<string, string> = {
          হ্যালো: 'Hello',
          ধন্যবাদ: 'Thank you',
          ভালো: 'Good',
          সুন্দর: 'Beautiful',
          কীবোর্ড: 'Keyboard',
          'শুভ সকাল': 'Good morning',
          'কেমন আছেন': 'How are you?',
          বন্ধু: 'Friend',
          বাংলা: 'Bengali',
        };
        output = dict[lower] || `${transInput} (translated)`;
      } else if (targetLang === 'es') {
        const dict: Record<string, string> = {
          hello: 'Hola',
          thanks: 'Gracias',
          good: 'Bueno',
          keyboard: 'Teclado',
        };
        output = dict[lower] || `${transInput} (traducido)`;
      } else if (targetLang === 'ar') {
        const dict: Record<string, string> = {
          hello: 'مرحباً',
          thanks: 'شكراً',
          good: 'جيد',
          keyboard: 'لوحة المفاتيح',
        };
        output = dict[lower] || `${transInput} (مترجم)`;
      } else {
        output = `${transInput} (${targetLang.toUpperCase()})`;
      }

      setTransOutput(output);
      setIsTranslating(false);
    }, 280);

    return () => clearTimeout(timer);
  }, [transInput, sourceLang, targetLang]);

  // AI assistant mock rephrase
  const handleAiRephrase = (tone: string) => {
    const text = currentText.trim() || 'Hello, I am testing the new keyboard design.';
    setAiGenerating(true);
    setTimeout(() => {
      let options: string[] = [];
      switch (tone) {
        case 'polite':
          options = [
            `I would like to kindly share that ${text.toLowerCase().replace(/\.$/, '')}.`,
            `Please be informed: ${text}`,
            `With utmost respect, ${text}`,
          ];
          break;
        case 'casual':
          options = [
            `Hey! ${text} 😊`,
            `Quick note: ${text} ✨`,
            `Check it out: ${text}`,
          ];
          break;
        case 'bengali':
          options = [
            `আমার সোনার বাংলা, ${text}`,
            `সহজ সুন্দর ভাষায়: ${text}`,
            `বাংলা কিউবোর্ড স্টাইলে: ${text}`,
          ];
          break;
        case 'concise':
          options = [
            text.split(' ').slice(0, 5).join(' ') + '.',
            `Summary: ${text}`,
          ];
          break;
        case 'expanded':
          options = [
            `To provide additional clarity regarding this matter, ${text}. Please let me know if you need further details.`,
          ];
          break;
      }
      setAiOptions(options);
      setAiGenerating(false);
    }, 350);
  };

  // Filtered world languages
  const filteredLanguages = SUPPORTED_LANGUAGES.filter((lang) => {
    const matchesSearch =
      lang.name.toLowerCase().includes(langSearch.toLowerCase()) ||
      lang.nativeName.toLowerCase().includes(langSearch.toLowerCase()) ||
      lang.id.toLowerCase().includes(langSearch.toLowerCase());
    const matchesRegion =
      selectedRegion === 'all' || lang.region === selectedRegion;
    return matchesSearch && matchesRegion;
  });

  if (activeView === 'normal' || activeView === 'more_tools') return null;

  return (
    <div
      className={`w-full p-2 select-none border-b border-white/10 text-xs transition-all ${theme.suggestionBg}`}
    >
      {/* Header bar with Back button & Title */}
      <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-white/5">
        <button
          onClick={onClose}
          className="flex items-center gap-1 text-[#a8c7fa] hover:text-[#d3e3fd] font-semibold px-1 py-0.5 rounded active:scale-95 transition-colors"
        >
          <span>← Back</span>
        </button>

        <span className="font-semibold text-[#e3e2e6] tracking-wide uppercase text-[11px]">
          {activeView === 'languages' && '🌐 Universal World Languages'}
          {activeView === 'sound_studio' && '🎵 Sound & Music Studio'}
          {activeView === 'translate' && '🌐 Real-Time Translator'}
          {activeView === 'clipboard' && '📋 Smart Clipboard'}
          {activeView === 'text_edit' && '✍️ Precise Text Cursor Control'}
          {activeView === 'themes' && '🎨 Keyboard Themes & Board'}
          {activeView === 'smart_ai' && '✨ Text Q Smart Assistant'}
        </span>

        <button
          onClick={onClose}
          className="text-[#9aa0a6] hover:text-white px-1.5 py-0.5 rounded text-xs"
        >
          ✕
        </button>
      </div>

      {/* 1. UNIVERSAL WORLD LANGUAGES SELECTOR */}
      {activeView === 'languages' && (
        <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
          {/* Search bar */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#9aa0a6]" />
            <input
              type="text"
              value={langSearch}
              onChange={(e) => setLangSearch(e.target.value)}
              placeholder="Search 25+ world languages, countries..."
              className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-[#232429] text-white border border-white/10 outline-none text-xs focus:border-[#a8c7fa]"
            />
          </div>

          {/* Region Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pb-0.5">
            {[
              { id: 'all', label: 'All' },
              { id: 'popular', label: 'Popular' },
              { id: 'south_asia', label: 'South Asia' },
              { id: 'middle_east', label: 'Middle East' },
              { id: 'europe', label: 'Europe' },
              { id: 'asia_pacific', label: 'Asia-Pacific' },
              { id: 'americas', label: 'Americas' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedRegion(tab.id)}
                className={`px-2 py-0.5 rounded-full text-[11px] whitespace-nowrap transition-colors ${
                  selectedRegion === tab.id
                    ? 'bg-[#a8c7fa] text-[#062e6f] font-bold'
                    : 'bg-[#232429] text-[#9aa0a6] hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Languages Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
            {filteredLanguages.map((lang) => {
              const isActive = activeLanguage === lang.id;
              return (
                <button
                  key={lang.id}
                  onClick={() => {
                    if (onLanguageChange) {
                      onLanguageChange(lang.id);
                    }
                    if (onUpdateSettings) {
                      onUpdateSettings({ activeLanguage: lang.id });
                    }
                    onClose();
                  }}
                  className={`p-2 rounded-xl text-left border flex items-center justify-between transition-all active:scale-95 ${
                    isActive
                      ? 'bg-[#a8c7fa]/20 border-[#a8c7fa] text-white ring-1 ring-[#a8c7fa]'
                      : 'bg-[#232429] border-white/5 text-[#c4c6d0] hover:bg-[#2c2d35]'
                  }`}
                >
                  <div className="flex items-center gap-2 overflow-hidden">
                    <span className="text-base shrink-0">{lang.flag}</span>
                    <div className="truncate">
                      <p className="font-semibold text-xs truncate">{lang.nativeName}</p>
                      <p className="text-[10px] text-[#9aa0a6] truncate">{lang.name}</p>
                    </div>
                  </div>
                  {isActive && <Check className="w-3.5 h-3.5 text-[#a8c7fa] shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. SOUND & MUSIC STUDIO */}
      {activeView === 'sound_studio' && (
        <div className="space-y-2.5 max-h-52 overflow-y-auto pr-1">
          {/* Sound On / Off Toggle + Master Volume */}
          <div className="p-2.5 rounded-xl bg-[#232429] border border-white/10 flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                if (onUpdateSettings) {
                  onUpdateSettings({ soundOnKeypress: !soundOnKeypress });
                }
              }}
              className={`p-2 rounded-lg flex items-center gap-1.5 font-semibold text-xs transition-colors ${
                soundOnKeypress
                  ? 'bg-[#a8c7fa] text-[#062e6f]'
                  : 'bg-[#2f3036] text-[#9aa0a6]'
              }`}
            >
              {soundOnKeypress ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              <span>{soundOnKeypress ? 'Typing Sound: ON' : 'Typing Sound: OFF'}</span>
            </button>

            {soundOnKeypress && (
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-[#9aa0a6]">Vol:</span>
                <input
                  type="range"
                  min="0.1"
                  max="1"
                  step="0.1"
                  value={soundVolume}
                  onChange={(e) => {
                    if (onUpdateSettings) {
                      onUpdateSettings({ soundVolume: parseFloat(e.target.value) });
                    }
                  }}
                  className="w-20 accent-[#a8c7fa] cursor-pointer"
                />
                <span className="text-[11px] text-[#a8c7fa] font-bold w-7 text-right">
                  {Math.round(soundVolume * 100)}%
                </span>
              </div>
            )}
          </div>

          {/* Typing Sound Profiles */}
          <div className="space-y-1">
            <p className="text-[11px] font-semibold text-[#c4c6d0]">Keyboard Sound Effects</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              {SOUND_PROFILES.map((prof) => {
                const isActive = soundProfile === prof.id;
                return (
                  <button
                    key={prof.id}
                    onClick={() => {
                      if (onUpdateSettings) {
                        onUpdateSettings({
                          soundProfile: prof.id,
                          soundOnKeypress: true,
                        });
                      }
                      soundEngine.playKeyClick('standard', soundVolume || 0.6, prof.id);
                    }}
                    className={`p-2 rounded-xl text-left border flex flex-col gap-0.5 transition-all active:scale-95 ${
                      isActive && soundOnKeypress
                        ? 'bg-[#a8c7fa]/20 border-[#a8c7fa] text-white ring-1 ring-[#a8c7fa]'
                        : 'bg-[#232429] border-white/5 text-[#c4c6d0] hover:bg-[#2c2d35]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-xs">{prof.name}</span>
                      {isActive && soundOnKeypress && (
                        <Check className="w-3 h-3 text-[#a8c7fa]" />
                      )}
                    </div>
                    <span className="text-[10px] text-[#9aa0a6] line-clamp-1">
                      {prof.subtitle}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Ambient Background Music Loops */}
          <div className="space-y-1">
            <p className="text-[11px] font-semibold text-[#c4c6d0] flex items-center gap-1">
              <Music className="w-3.5 h-3.5 text-[#a8c7fa]" />
              <span>Ambient Background Music While Typing</span>
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
              {BG_MUSIC_TRACKS.map((track) => {
                const isTrackActive = bgMusicTrack === track.id;
                return (
                  <button
                    key={track.id}
                    onClick={() => {
                      if (onUpdateSettings) {
                        onUpdateSettings({ bgMusicTrack: track.id });
                      }
                    }}
                    className={`p-2 rounded-xl text-left border flex flex-col gap-0.5 transition-all active:scale-95 ${
                      isTrackActive
                        ? 'bg-[#a8c7fa]/25 border-[#a8c7fa] text-white ring-1 ring-[#a8c7fa]'
                        : 'bg-[#232429] border-white/5 text-[#c4c6d0] hover:bg-[#2c2d35]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-xs flex items-center gap-1">
                        {track.id !== 'off' && <Disc className="w-3 h-3 text-[#a8c7fa]" />}
                        {track.name}
                      </span>
                      {isTrackActive && <Check className="w-3 h-3 text-[#a8c7fa]" />}
                    </div>
                    <span className="text-[10px] text-[#9aa0a6] line-clamp-1">
                      {track.subtitle}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 3. REAL-TIME TRANSLATOR */}
      {activeView === 'translate' && (
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <select
                value={sourceLang}
                onChange={(e) => setSourceLang(e.target.value)}
                className="bg-[#232429] text-white px-2 py-1 rounded border border-white/10 outline-none text-xs"
              >
                {TRANSLATION_LANGUAGES.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.name}
                  </option>
                ))}
              </select>
              <span className="text-[#9aa0a6]">➔</span>
              <select
                value={targetLang}
                onChange={(e) => setTargetLang(e.target.value)}
                className="bg-[#232429] text-white px-2 py-1 rounded border border-white/10 outline-none text-xs"
              >
                {TRANSLATION_LANGUAGES.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.name}
                  </option>
                ))}
              </select>
            </div>

            {transOutput && (
              <button
                onClick={() => {
                  onInsertText(transOutput);
                  onClose();
                }}
                className="px-2.5 py-1 bg-[#a8c7fa] text-[#062e6f] font-bold rounded hover:bg-[#b8d2fc] flex items-center gap-1"
              >
                <span>Insert</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              value={transInput}
              onChange={(e) => setTransInput(e.target.value)}
              placeholder="Type or paste to translate..."
              className="bg-[#1a1c22] text-white p-2 rounded-lg border border-white/10 outline-none text-xs"
            />
            <div className="bg-[#232429] text-white p-2 rounded-lg border border-white/10 text-xs flex items-center">
              {isTranslating ? (
                <span className="text-[#9aa0a6] animate-pulse">Translating...</span>
              ) : transOutput ? (
                <span className="text-[#a8c7fa] font-medium">{transOutput}</span>
              ) : (
                <span className="text-[#9aa0a6]">Translation will appear here</span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 4. SMART CLIPBOARD */}
      {activeView === 'clipboard' && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-[#9aa0a6]">
              {clipboardItems.length} clips stored
            </span>
            <div className="flex gap-1.5">
              <button
                onClick={() => setShowAddClip(!showAddClip)}
                className="flex items-center gap-1 px-2 py-0.5 rounded bg-[#2f3036] text-[#a8c7fa] hover:bg-[#373940]"
              >
                <Plus className="w-3 h-3" />
                <span>Add snippet</span>
              </button>
              {clipboardItems.length > 0 && (
                <button
                  onClick={onClearClipboard}
                  className="flex items-center gap-1 px-2 py-0.5 rounded bg-[#2f3036] text-rose-300 hover:bg-rose-950/40"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Clear</span>
                </button>
              )}
            </div>
          </div>

          {showAddClip && (
            <div className="flex gap-1.5">
              <input
                type="text"
                value={newClipText}
                onChange={(e) => setNewClipText(e.target.value)}
                placeholder="Type new snippet to save..."
                className="flex-1 bg-[#1a1c22] text-white px-2 py-1 rounded border border-white/10 outline-none text-xs"
              />
              <button
                onClick={() => {
                  if (newClipText.trim()) {
                    onAddClipboardItem(newClipText.trim());
                    setNewClipText('');
                    setShowAddClip(false);
                  }
                }}
                className="px-2.5 py-1 bg-[#a8c7fa] text-[#062e6f] font-bold rounded hover:bg-[#b8d2fc]"
              >
                Save
              </button>
            </div>
          )}

          <div className="flex gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            {clipboardItems.map((item) => (
              <div
                key={item.id}
                className="flex-shrink-0 max-w-[200px] p-2 rounded-lg bg-[#232429] border border-white/10 flex flex-col justify-between gap-1.5"
              >
                <p
                  onClick={() => {
                    onInsertText(item.text);
                    onClose();
                  }}
                  className="text-white text-xs line-clamp-2 cursor-pointer hover:text-[#a8c7fa]"
                >
                  {item.text}
                </p>
                <div className="flex items-center justify-between pt-1 border-t border-white/5">
                  <button
                    onClick={() => onTogglePinClipboard(item.id)}
                    className={`p-1 rounded ${
                      item.pinned ? 'text-[#a8c7fa]' : 'text-[#9aa0a6] hover:text-white'
                    }`}
                  >
                    <Pin className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => onDeleteClipboardItem(item.id)}
                    className="p-1 text-[#9aa0a6] hover:text-rose-400"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. TEXT EDITING CURSOR CONTROL */}
      {activeView === 'text_edit' && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex gap-1">
              <button
                onClick={onSelectAll}
                className="px-2 py-1 rounded bg-[#2f3036] text-white hover:bg-[#373940]"
              >
                Select All
              </button>
              <button
                onClick={onCopySelection}
                className="px-2 py-1 rounded bg-[#2f3036] text-white hover:bg-[#373940] flex items-center gap-1"
              >
                <Copy className="w-3 h-3" /> Copy
              </button>
              <button
                onClick={onCutSelection}
                className="px-2 py-1 rounded bg-[#2f3036] text-white hover:bg-[#373940] flex items-center gap-1"
              >
                <Scissors className="w-3 h-3" /> Cut
              </button>
              <button
                onClick={onDeleteSelection}
                className="px-2 py-1 rounded bg-rose-950/40 text-rose-300 hover:bg-rose-900/60"
              >
                Delete
              </button>
            </div>
            <div className="flex gap-1">
              <button
                onClick={() => onMoveCursor('start')}
                className="px-2 py-1 rounded bg-[#2f3036] text-[#a8c7fa] hover:bg-[#373940]"
              >
                ⇤ Start
              </button>
              <button
                onClick={() => onMoveCursor('end')}
                className="px-2 py-1 rounded bg-[#2f3036] text-[#a8c7fa] hover:bg-[#373940]"
              >
                End ⇥
              </button>
            </div>
          </div>

          {/* D-Pad Arrows */}
          <div className="grid grid-cols-3 gap-1 max-w-[180px] mx-auto pt-1">
            <div />
            <div className="flex justify-center">
              <button
                onClick={() => onMoveCursor('up')}
                className="w-12 h-8 rounded bg-[#2f3036] text-white hover:bg-[#373940] flex items-center justify-center active:scale-95"
              >
                <ArrowUp className="w-4 h-4" />
              </button>
            </div>
            <div />

            <div className="flex justify-center">
              <button
                onClick={() => onMoveCursor('left')}
                className="w-12 h-8 rounded bg-[#2f3036] text-white hover:bg-[#373940] flex items-center justify-center active:scale-95"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            </div>
            <div className="flex justify-center items-center">
              <div className="w-2.5 h-2.5 rounded-full bg-[#a8c7fa]" />
            </div>
            <div className="flex justify-center">
              <button
                onClick={() => onMoveCursor('right')}
                className="w-12 h-8 rounded bg-[#2f3036] text-white hover:bg-[#373940] flex items-center justify-center active:scale-95"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div />
            <div className="flex justify-center">
              <button
                onClick={() => onMoveCursor('down')}
                className="w-12 h-8 rounded bg-[#2f3036] text-white hover:bg-[#373940] flex items-center justify-center active:scale-95"
              >
                <ArrowDown className="w-4 h-4" />
              </button>
            </div>
            <div />
          </div>
        </div>
      )}

      {/* 6. THEMES & BOARD STUDIO SELECTOR */}
      {(activeView === 'themes' || activeView === 'board_studio') && (
        <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
          {/* Direct Button to Open Full Board Studio */}
          {onOpenBoardStudio && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenBoardStudio();
              }}
              className="w-full p-2.5 rounded-xl bg-gradient-to-r from-[#1e2a3a] via-[#243347] to-[#1e2a3a] border border-[#a8c7fa]/40 flex items-center justify-between hover:border-[#a8c7fa] transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="text-base">🎨</span>
                <div className="text-left">
                  <p className="font-bold text-xs text-white">
                    Open Board Studio & Customizer
                  </p>
                  <p className="text-[10px] text-[#a8c7fa]">
                    Edit Banners & Names · Upload Photos · Matrix/Bokeh FX · Custom Colors
                  </p>
                </div>
              </div>
              <span className="text-xs font-semibold text-[#a8c7fa] px-2 py-0.5 rounded bg-white/5">
                Customize →
              </span>
            </button>
          )}

          <div className="grid grid-cols-3 gap-2 p-1">
            {Object.values(KEYBOARD_THEMES).map((t) => (
              <button
                key={t.id}
                onClick={() => {
                  onSelectTheme(t.id);
                  if (onUpdateSettings) {
                    onUpdateSettings({ isBlankBoard: false });
                  }
                  onClose();
                }}
                className={`p-2 rounded-xl border text-left flex flex-col gap-1 transition-all active:scale-95 ${
                  theme.id === t.id && !settings?.isBlankBoard
                    ? 'border-[#a8c7fa] ring-2 ring-[#a8c7fa]/40 shadow-lg'
                    : 'border-white/10 hover:border-white/30'
                } ${t.boardBg}`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-[11px] font-bold ${t.textPrimary}`}>{t.name}</span>
                  {theme.id === t.id && !settings?.isBlankBoard && (
                    <Check className="w-3.5 h-3.5 text-[#a8c7fa]" />
                  )}
                </div>
                <div className="flex gap-1">
                  <div className={`w-3.5 h-3.5 rounded ${t.keyBg} ${t.keyBorder}`} />
                  <div className={`w-3.5 h-3.5 rounded ${t.accent}`} />
                  <div className={`w-3.5 h-3.5 rounded ${t.keySpecialBg}`} />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 7. SMART AI ASSISTANT */}
      {activeView === 'smart_ai' && (
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
            <button
              onClick={() => handleAiRephrase('polite')}
              className="px-2.5 py-1 rounded-full bg-[#232429] text-[#c4c6d0] hover:bg-[#2f3036] border border-white/5 whitespace-nowrap active:scale-95"
            >
              👔 Polite
            </button>
            <button
              onClick={() => handleAiRephrase('casual')}
              className="px-2.5 py-1 rounded-full bg-[#232429] text-[#c4c6d0] hover:bg-[#2f3036] border border-white/5 whitespace-nowrap active:scale-95"
            >
              😎 Casual
            </button>
            <button
              onClick={() => handleAiRephrase('bengali')}
              className="px-2.5 py-1 rounded-full bg-[#232429] text-[#c4c6d0] hover:bg-[#2f3036] border border-white/5 whitespace-nowrap active:scale-95"
            >
              🇧🇩 বাংলা
            </button>
            <button
              onClick={() => handleAiRephrase('concise')}
              className="px-2.5 py-1 rounded-full bg-[#232429] text-[#c4c6d0] hover:bg-[#2f3036] border border-white/5 whitespace-nowrap active:scale-95"
            >
              ⚡ Concise
            </button>
            <button
              onClick={() => handleAiRephrase('expanded')}
              className="px-2.5 py-1 rounded-full bg-[#232429] text-[#c4c6d0] hover:bg-[#2f3036] border border-white/5 whitespace-nowrap active:scale-95"
            >
              📝 Elaborate
            </button>
          </div>

          {aiGenerating && (
            <div className="flex items-center justify-center py-3 text-[#a8c7fa] gap-2">
              <Sparkles className="w-4 h-4 animate-spin text-[#a8c7fa]" />
              <span>Text Q AI is composing suggestions...</span>
            </div>
          )}

          {aiOptions.length > 0 && !aiGenerating && (
            <div className="space-y-1.5 max-h-32 overflow-y-auto">
              {aiOptions.map((opt, i) => (
                <div
                  key={i}
                  className="p-2 rounded bg-[#232429] border border-white/10 flex items-center justify-between gap-2"
                >
                  <p className="text-[#e3e2e6] text-xs flex-1">{opt}</p>
                  <button
                    onClick={() => {
                      onReplaceAllText(opt);
                      onClose();
                    }}
                    className="px-2 py-1 bg-[#a8c7fa] text-[#062e6f] font-bold rounded shrink-0 active:scale-95"
                  >
                    Apply
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
