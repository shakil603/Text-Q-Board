import React, { useState } from 'react';
import {
  X,
  Languages,
  Sliders,
  Palette,
  SpellCheck,
  MousePointerClick,
  Mic,
  Clipboard,
  BookOpen,
  Info,
  ChevronRight,
  Check,
  Trash2,
  ShieldCheck,
  Music,
  Volume2,
  VolumeX,
  Play
} from 'lucide-react';
import { KeyboardSettings, ThemeConfig } from '../types/keyboard';
import { SUPPORTED_LANGUAGES } from '../data/layouts';
import { KEYBOARD_THEMES } from '../data/themes';
import { SOUND_PROFILES, BG_MUSIC_TRACKS, soundEngine } from '../utils/audio';
import { TextQBoardLogo } from './Logo';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: KeyboardSettings;
  onUpdateSettings: (newSettings: Partial<KeyboardSettings>) => void;
  theme: ThemeConfig;
}

type SettingTab =
  | 'overview'
  | 'languages'
  | 'sound'
  | 'preferences'
  | 'themes'
  | 'correction'
  | 'glide'
  | 'voice'
  | 'clipboard'
  | 'dictionary'
  | 'about';

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  theme,
}) => {
  const [activeTab, setActiveTab] = useState<SettingTab>('overview');
  const [newShortcut, setNewShortcut] = useState('');
  const [newExpanded, setNewExpanded] = useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div
        className={`w-full max-w-lg h-[600px] max-h-[90vh] rounded-2xl flex flex-col overflow-hidden border border-white/10 shadow-2xl ${theme.boardBg}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 bg-[#111318]">
          <div className="flex items-center gap-2">
            {activeTab !== 'overview' && (
              <button
                type="button"
                onClick={() => setActiveTab('overview')}
                className="text-[#a8c7fa] hover:opacity-80 text-xs font-semibold mr-1 flex items-center gap-0.5"
              >
                ← Back
              </button>
            )}
            <h2 className="text-base font-semibold text-[#e3e2e6] flex items-center gap-2">
              <Sliders className="w-4 h-4 text-[#a8c7fa]" />
              <span>
                {activeTab === 'overview' && 'Settings'}
                {activeTab === 'languages' && 'Languages & Keyboards'}
                {activeTab === 'sound' && 'Sound & Music Studio'}
                {activeTab === 'preferences' && 'Preferences'}
                {activeTab === 'themes' && 'Theme'}
                {activeTab === 'correction' && 'Text Correction'}
                {activeTab === 'glide' && 'Glide Typing'}
                {activeTab === 'voice' && 'Voice Typing'}
                {activeTab === 'clipboard' && 'Clipboard'}
                {activeTab === 'dictionary' && 'Personal Dictionary'}
                {activeTab === 'about' && 'About Text Q Board'}
              </span>
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full bg-[#2f3036] text-[#c4c6d0] hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar text-sm">
          {/* TAB 0: OVERVIEW MAIN MENU */}
          {activeTab === 'overview' && (
            <div className="space-y-1.5">
              {/* Clean Flat App Identity Banner */}
              <div className="p-3.5 rounded-xl bg-[#232429] border border-white/8 flex items-center justify-between mb-3">
                <TextQBoardLogo size="sm" />
                <span className="text-[11px] px-2.5 py-0.5 rounded-md bg-[#2f3036] text-[#a8c7fa] font-medium">
                  v14.0
                </span>
              </div>

              {/* Navigation Items */}
              {[
                {
                  id: 'languages',
                  label: 'Languages',
                  sub: `${settings.enabledLanguages.length} active keyboards`,
                  icon: Languages,
                },
                {
                  id: 'sound',
                  label: 'Sound & Music Studio',
                  sub: `${settings.soundOnKeypress ? 'Typing Sound: ON' : 'Typing Sound: OFF'} • ${
                    SOUND_PROFILES.find((p) => p.id === settings.soundProfile)?.name || 'Gboard Soft'
                  }`,
                  icon: Music,
                },
                {
                  id: 'preferences',
                  label: 'Preferences',
                  sub: 'Number row, haptics, key borders, popups',
                  icon: Sliders,
                },
                {
                  id: 'themes',
                  label: 'Theme',
                  sub: KEYBOARD_THEMES[settings.theme]?.name || 'Gboard System Dark',
                  icon: Palette,
                },
                {
                  id: 'correction',
                  label: 'Text correction',
                  sub: 'Auto-correction, next-word suggestions',
                  icon: SpellCheck,
                },
                {
                  id: 'glide',
                  label: 'Glide typing',
                  sub: 'Swipe gesture typing & cursor control',
                  icon: MousePointerClick,
                },
                {
                  id: 'voice',
                  label: 'Voice typing',
                  sub: 'Multi-language speech recognition',
                  icon: Mic,
                },
                {
                  id: 'clipboard',
                  label: 'Clipboard',
                  sub: 'Recent clips & pinned snippets',
                  icon: Clipboard,
                },
                {
                  id: 'dictionary',
                  label: 'Personal dictionary',
                  sub: `${settings.customShortcuts.length} shortcuts configured`,
                  icon: BookOpen,
                },
                {
                  id: 'about',
                  label: 'About',
                  sub: 'Privacy & open-source details',
                  icon: Info,
                },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveTab(item.id as SettingTab)}
                    className="w-full p-3 rounded-xl bg-[#232429] hover:bg-[#2f3036] border border-white/5 flex items-center justify-between text-left transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#2f3036] text-[#a8c7fa] flex items-center justify-center">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-medium text-[#e3e2e6] text-xs">{item.label}</p>
                        <p className="text-[11px] text-[#9aa0a6]">{item.sub}</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#9aa0a6]" />
                  </button>
                );
              })}
            </div>
          )}

          {/* TAB 1: LANGUAGES */}
          {activeTab === 'languages' && (
            <div className="space-y-3">
              <p className="text-xs text-[#9aa0a6]">
                Select active languages and layouts for fast spacebar switching:
              </p>

              <div className="space-y-2">
                {SUPPORTED_LANGUAGES.map((lang) => {
                  const isEnabled = settings.enabledLanguages.includes(lang.id);
                  const isCurrent = settings.activeLanguage === lang.id;

                  return (
                    <div
                      key={lang.id}
                      className={`p-3 rounded-xl border flex items-center justify-between transition-colors ${
                        isCurrent
                          ? 'bg-[#1e2a38] border-[#a8c7fa]'
                          : 'bg-[#232429] border-white/5'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-xl">{lang.flag}</span>
                        <div>
                          <p className="font-semibold text-xs text-white">{lang.name}</p>
                          <p className="text-[11px] text-[#9aa0a6]">{lang.nativeName}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {isCurrent ? (
                          <span className="px-2 py-0.5 rounded text-[10px] bg-[#a8c7fa] text-[#062e6f] font-semibold">
                            Active
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              if (!isEnabled) {
                                onUpdateSettings({
                                  enabledLanguages: [...settings.enabledLanguages, lang.id],
                                  activeLanguage: lang.id,
                                });
                              } else {
                                onUpdateSettings({ activeLanguage: lang.id });
                              }
                            }}
                            className="px-2.5 py-1 rounded bg-[#2f3036] text-[#a8c7fa] hover:bg-[#373940] text-xs font-medium"
                          >
                            Use
                          </button>
                        )}

                        <input
                          type="checkbox"
                          checked={isEnabled}
                          onChange={(e) => {
                            if (e.target.checked) {
                              onUpdateSettings({
                                enabledLanguages: [...settings.enabledLanguages, lang.id],
                              });
                            } else {
                              if (settings.enabledLanguages.length > 1) {
                                const remaining = settings.enabledLanguages.filter((id) => id !== lang.id);
                                onUpdateSettings({
                                  enabledLanguages: remaining,
                                  activeLanguage:
                                    settings.activeLanguage === lang.id ? remaining[0] : settings.activeLanguage,
                                });
                              }
                            }
                          }}
                          className="w-4 h-4 accent-[#a8c7fa] cursor-pointer"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 1.5: SOUND & MUSIC STUDIO */}
          {activeTab === 'sound' && (
            <div className="space-y-4">
              {/* Master Sound On / Off Toggle */}
              <div className="p-3.5 rounded-xl bg-[#232429] border border-white/5 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-white text-xs">Sound on keypress</p>
                    <p className="text-[11px] text-[#9aa0a6]">
                      Play subtle audio clicks or musical notes on tap
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.soundOnKeypress}
                    onChange={(e) => onUpdateSettings({ soundOnKeypress: e.target.checked })}
                    className="w-4 h-4 accent-[#a8c7fa] cursor-pointer"
                  />
                </div>

                {/* Volume Slider */}
                {settings.soundOnKeypress && (
                  <div className="pt-2 border-t border-white/5 space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="font-medium text-white">Sound volume</span>
                      <span className="text-[#a8c7fa] font-semibold">
                        {Math.round(settings.soundVolume * 100)}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0.1"
                      max="1"
                      step="0.1"
                      value={settings.soundVolume}
                      onChange={(e) => onUpdateSettings({ soundVolume: parseFloat(e.target.value) })}
                      className="w-full accent-[#a8c7fa] cursor-pointer"
                    />
                  </div>
                )}
              </div>

              {/* Sound Profiles */}
              <div className="space-y-2">
                <p className="text-xs font-semibold text-[#e3e2e6]">Typing Sound Profiles</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {SOUND_PROFILES.map((p) => {
                    const isSelected = settings.soundProfile === p.id;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                          onUpdateSettings({ soundProfile: p.id, soundOnKeypress: true });
                          soundEngine.playKeyClick('standard', settings.soundVolume, p.id);
                        }}
                        className={`p-3 rounded-xl border text-left flex items-center justify-between transition-colors ${
                          isSelected
                            ? 'bg-[#1e2a38] border-[#a8c7fa] text-white ring-1 ring-[#a8c7fa]'
                            : 'bg-[#232429] border-white/5 text-[#c4c6d0] hover:bg-[#2f3036]'
                        }`}
                      >
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-xs text-white">{p.name}</span>
                            {p.category === 'musical' && (
                              <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#a8c7fa]/20 text-[#a8c7fa]">
                                Music
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-[#9aa0a6] mt-0.5">{p.subtitle}</p>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-[#a8c7fa] shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Ambient Background Music Loops */}
              <div className="space-y-2 pt-2 border-t border-white/5">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-[#e3e2e6] flex items-center gap-1.5">
                    <Music className="w-3.5 h-3.5 text-[#a8c7fa]" />
                    <span>Ambient Background Music</span>
                  </p>
                  {settings.bgMusicTrack !== 'off' && (
                    <span className="text-[11px] text-[#a8c7fa] font-medium animate-pulse">
                      Playing
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {BG_MUSIC_TRACKS.map((track) => {
                    const isSelected = settings.bgMusicTrack === track.id;
                    return (
                      <button
                        key={track.id}
                        type="button"
                        onClick={() => {
                          onUpdateSettings({ bgMusicTrack: track.id });
                          soundEngine.setBackgroundMusic(track.id, settings.soundVolume);
                        }}
                        className={`p-3 rounded-xl border text-left flex items-center justify-between transition-colors ${
                          isSelected
                            ? 'bg-[#1e2a38] border-[#a8c7fa] text-white ring-1 ring-[#a8c7fa]'
                            : 'bg-[#232429] border-white/5 text-[#c4c6d0] hover:bg-[#2f3036]'
                        }`}
                      >
                        <div>
                          <p className="font-semibold text-xs text-white">{track.name}</p>
                          <p className="text-[11px] text-[#9aa0a6] mt-0.5">{track.subtitle}</p>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-[#a8c7fa] shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PREFERENCES */}
          {activeTab === 'preferences' && (
            <div className="space-y-2">
              {[
                {
                  id: 'showNumberRow',
                  title: 'Number row',
                  desc: 'Always show number row (1–0) at the top of the keyboard',
                  checked: settings.showNumberRow,
                },
                {
                  id: 'keyBorders',
                  title: 'Key borders',
                  desc: 'Show clean flat borders around keys',
                  checked: settings.keyBorders,
                },
                {
                  id: 'hapticFeedback',
                  title: 'Haptic feedback on keypress',
                  desc: 'Vibrate on key tap',
                  checked: settings.hapticFeedback,
                },
                {
                  id: 'popupOnKeypress',
                  title: 'Popup on keypress',
                  desc: 'Show character preview bubble above pressed key',
                  checked: settings.popupOnKeypress,
                },
                {
                  id: 'incognito',
                  title: 'Incognito mode',
                  desc: 'Do not save typed history',
                  checked: settings.incognito,
                },
              ].map((pref) => (
                <label
                  key={pref.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-[#232429] border border-white/5 cursor-pointer hover:bg-[#2f3036]"
                >
                  <div className="pr-3">
                    <p className="font-medium text-white text-xs">{pref.title}</p>
                    <p className="text-[11px] text-[#9aa0a6]">{pref.desc}</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={pref.checked}
                    onChange={(e) => onUpdateSettings({ [pref.id]: e.target.checked })}
                    className="w-4 h-4 accent-[#a8c7fa] cursor-pointer"
                  />
                </label>
              ))}
            </div>
          )}

          {/* TAB 3: THEMES */}
          {activeTab === 'themes' && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2.5">
                {Object.values(KEYBOARD_THEMES).map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => onUpdateSettings({ theme: t.id })}
                    className={`p-3 rounded-xl border text-left flex flex-col gap-2 transition-colors ${
                      settings.theme === t.id
                        ? 'border-[#a8c7fa] ring-1 ring-[#a8c7fa]'
                        : 'border-white/10 hover:border-white/20'
                    } ${t.boardBg}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-bold ${t.textPrimary}`}>{t.name}</span>
                      {settings.theme === t.id && (
                        <Check className="w-3.5 h-3.5 text-[#a8c7fa]" />
                      )}
                    </div>
                    <div className="flex gap-1.5">
                      <div className={`w-4 h-4 rounded ${t.keyBg} ${t.keyBorder}`} />
                      <div className={`w-4 h-4 rounded ${t.accent}`} />
                      <div className={`w-4 h-4 rounded ${t.keySpecialBg}`} />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: TEXT CORRECTION */}
          {activeTab === 'correction' && (
            <div className="space-y-2">
              {[
                {
                  id: 'autoCorrection',
                  title: 'Auto-correction',
                  desc: 'Spacebar and punctuation automatically correct mistyped words',
                  checked: settings.autoCorrection,
                },
                {
                  id: 'nextWordSuggestions',
                  title: 'Next-word suggestions',
                  desc: 'Use predictive language model to suggest next likely word',
                  checked: settings.nextWordSuggestions,
                },
                {
                  id: 'autoCapitalization',
                  title: 'Auto-capitalization',
                  desc: 'Capitalize the first word of each sentence',
                  checked: settings.autoCapitalization,
                },
                {
                  id: 'doubleSpacePeriod',
                  title: 'Double-space period',
                  desc: 'Double-tapping spacebar inserts a period followed by a space',
                  checked: settings.doubleSpacePeriod,
                },
                {
                  id: 'blockOffensiveWords',
                  title: 'Block offensive words',
                  desc: 'Do not suggest potentially offensive or sensitive words',
                  checked: settings.blockOffensiveWords,
                },
              ].map((item) => (
                <label
                  key={item.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-[#232429] border border-white/5 cursor-pointer hover:bg-[#2f3036]"
                >
                  <div className="pr-3">
                    <p className="font-medium text-white text-xs">{item.title}</p>
                    <p className="text-[11px] text-[#9aa0a6]">{item.desc}</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={item.checked}
                    onChange={(e) => onUpdateSettings({ [item.id]: e.target.checked })}
                    className="w-4 h-4 accent-[#a8c7fa] cursor-pointer"
                  />
                </label>
              ))}
            </div>
          )}

          {/* TAB 5: GLIDE TYPING */}
          {activeTab === 'glide' && (
            <div className="space-y-2">
              {[
                {
                  id: 'glideTyping',
                  title: 'Enable Glide typing',
                  desc: 'Input words by sliding your finger from letter to letter',
                  checked: settings.glideTyping,
                },
                {
                  id: 'showGestureTrail',
                  title: 'Show gesture trail',
                  desc: 'Display a smooth visual dynamic line trail while gliding',
                  checked: settings.showGestureTrail,
                },
                {
                  id: 'gestureDelete',
                  title: 'Enable gesture delete',
                  desc: 'Slide left from the backspace key to quickly delete words',
                  checked: settings.gestureDelete,
                },
                {
                  id: 'gestureCursorControl',
                  title: 'Enable gesture cursor control',
                  desc: 'Slide finger across the spacebar to move cursor position smoothly',
                  checked: settings.gestureCursorControl,
                },
              ].map((item) => (
                <label
                  key={item.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-[#232429] border border-white/5 cursor-pointer hover:bg-[#2f3036]"
                >
                  <div className="pr-3">
                    <p className="font-medium text-white text-xs">{item.title}</p>
                    <p className="text-[11px] text-[#9aa0a6]">{item.desc}</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={item.checked}
                    onChange={(e) => onUpdateSettings({ [item.id]: e.target.checked })}
                    className="w-4 h-4 accent-[#a8c7fa] cursor-pointer"
                  />
                </label>
              ))}
            </div>
          )}

          {/* TAB 6: VOICE TYPING */}
          {activeTab === 'voice' && (
            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-[#232429] border border-white/5 space-y-2">
                <div className="flex items-center gap-2">
                  <Mic className="w-5 h-5 text-[#a8c7fa]" />
                  <p className="font-semibold text-white text-xs">Multi-Language Speech Recognition</p>
                </div>
                <p className="text-xs text-[#9aa0a6] leading-relaxed">
                  Text Q Board supports offline and online voice typing for Bengali, English, Spanish, Hindi, and Arabic.
                </p>
              </div>
            </div>
          )}

          {/* TAB 7: CLIPBOARD */}
          {activeTab === 'clipboard' && (
            <div className="space-y-3">
              <p className="text-xs text-[#9aa0a6]">
                Recent text copied to your clipboard is saved here for quick pasting into any app.
              </p>
            </div>
          )}

          {/* TAB 8: PERSONAL DICTIONARY */}
          {activeTab === 'dictionary' && (
            <div className="space-y-3">
              <p className="text-xs text-[#9aa0a6]">
                Add custom text expansion shortcuts (e.g. typing &quot;tqb&quot; suggests &quot;Text Q Board&quot;):
              </p>

              <div className="p-3 rounded-xl bg-[#232429] border border-white/5 space-y-2">
                <p className="text-xs font-semibold text-white">Add New Shortcut</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newShortcut}
                    onChange={(e) => setNewShortcut(e.target.value)}
                    placeholder="Shortcut (e.g. omw)"
                    className="w-1/3 bg-[#1a1c22] text-white px-2.5 py-1.5 rounded-lg border border-white/10 outline-none text-xs"
                  />
                  <input
                    type="text"
                    value={newExpanded}
                    onChange={(e) => setNewExpanded(e.target.value)}
                    placeholder="Expanded text (e.g. On my way!)"
                    className="flex-1 bg-[#1a1c22] text-white px-2.5 py-1.5 rounded-lg border border-white/10 outline-none text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (newShortcut.trim() && newExpanded.trim()) {
                        onUpdateSettings({
                          customShortcuts: [
                            ...settings.customShortcuts,
                            { shortcut: newShortcut.trim(), expanded: newExpanded.trim() },
                          ],
                        });
                        setNewShortcut('');
                        setNewExpanded('');
                      }
                    }}
                    className="px-3 py-1.5 bg-[#a8c7fa] text-[#062e6f] font-bold rounded-lg text-xs hover:bg-[#b8d2fc]"
                  >
                    Add
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                {settings.customShortcuts.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-xl bg-[#232429] border border-white/5 flex items-center justify-between"
                  >
                    <div>
                      <span className="font-semibold text-xs text-[#a8c7fa] mr-2">
                        {item.shortcut}
                      </span>
                      <span className="text-xs text-[#e3e2e6]">{item.expanded}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const next = settings.customShortcuts.filter((_, i) => i !== idx);
                        onUpdateSettings({ customShortcuts: next });
                      }}
                      className="text-[#9aa0a6] hover:text-rose-400 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 9: ABOUT */}
          {activeTab === 'about' && (
            <div className="p-4 rounded-xl bg-[#232429] border border-white/5 space-y-3">
              <div className="flex items-center gap-3">
                <TextQBoardLogo size="md" />
                <div>
                  <h3 className="font-bold text-sm text-white">Text Q Board</h3>
                  <p className="text-xs text-[#9aa0a6]">v14.0 Production Build</p>
                </div>
              </div>
              <p className="text-xs text-[#c4c6d0] leading-relaxed">
                Text Q Board is a production-grade multilingual keyboard for Android and Web with full phonetic Bengali input, Material 3 styling, Web Audio tactile sound & music engine, and offline speech recognition.
              </p>
              <div className="flex items-center gap-1.5 text-xs text-[#6dd58c]">
                <ShieldCheck className="w-4 h-4" />
                <span>100% Privacy Focused — No Keystrokes Logged</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
