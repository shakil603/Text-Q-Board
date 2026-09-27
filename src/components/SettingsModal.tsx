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
  Volume2,
  VolumeX,
  Music
} from 'lucide-react';
import { KeyboardSettings, ThemeConfig } from '../types/keyboard';
import { SUPPORTED_LANGUAGES } from '../data/layouts';
import { KEYBOARD_THEMES } from '../data/themes';
import { TextQBoardLogo } from './Logo';
import { SOUND_PROFILES, BG_MUSIC_TRACKS, soundEngine } from '../utils/audio';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: KeyboardSettings;
  onUpdateSettings: (newSettings: Partial<KeyboardSettings>) => void;
  theme: ThemeConfig;
  onOpenBoardStudio?: () => void;
}

type SettingTab =
  | 'overview'
  | 'sound_music'
  | 'languages'
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
  onOpenBoardStudio,
}) => {
  const [activeTab, setActiveTab] = useState<SettingTab>('overview');
  const [newShortcut, setNewShortcut] = useState('');
  const [newExpanded, setNewExpanded] = useState('');

  if (!isOpen) return null;

  const activeSoundProfileMeta =
    SOUND_PROFILES.find((p) => p.id === (settings.soundProfile || 'gboard_soft')) ||
    SOUND_PROFILES[0];

  const activeBgMusicMeta =
    BG_MUSIC_TRACKS.find((t) => t.id === (settings.bgMusicTrack || 'off')) ||
    BG_MUSIC_TRACKS[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4">
      <div
        className={`w-full max-w-lg h-[620px] max-h-[90vh] rounded-2xl flex flex-col overflow-hidden border border-white/10 shadow-2xl ${theme.boardBg}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/10 bg-[#151922]">
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
            <h2 className="text-sm font-semibold text-[#e3e2e6] flex items-center gap-2">
              <Sliders className="w-4 h-4 text-[#a8c7fa]" />
              <span>
                {activeTab === 'overview' && 'Text Q Board Settings'}
                {activeTab === 'sound_music' && 'Typing Sound & Music'}
                {activeTab === 'languages' && 'Languages & Keyboards'}
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
              {/* Unified Keyboard Category App Identity Banner */}
              <div className="p-3.5 rounded-xl bg-[#151922] border border-[#a8c7fa]/25 flex items-center justify-between mb-3">
                <TextQBoardLogo size="sm" />
                <button
                  type="button"
                  onClick={() => {
                    const next = !settings.soundOnKeypress;
                    onUpdateSettings({ soundOnKeypress: next });
                    if (next) {
                      soundEngine.playKeyClick(
                        'standard',
                        settings.soundVolume,
                        settings.soundProfile || 'gboard_soft'
                      );
                    }
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                    settings.soundOnKeypress
                      ? 'bg-[#a8c7fa] text-[#062e6f]'
                      : 'bg-[#2f3036] text-[#9aa0a6]'
                  }`}
                >
                  {settings.soundOnKeypress ? (
                    <Volume2 className="w-3.5 h-3.5" />
                  ) : (
                    <VolumeX className="w-3.5 h-3.5" />
                  )}
                  <span>{settings.soundOnKeypress ? 'Sound On' : 'Sound Off'}</span>
                </button>
              </div>

              {/* Navigation Items */}
              {[
                {
                  id: 'sound_music',
                  label: 'Typing sound & music',
                  sub: `${
                    settings.soundOnKeypress ? activeSoundProfileMeta.name : 'Muted'
                  } · Music: ${activeBgMusicMeta.name}`,
                  icon: Music,
                },
                {
                  id: 'languages',
                  label: 'Languages',
                  sub: `${settings.enabledLanguages.length} active keyboards`,
                  icon: Languages,
                },
                {
                  id: 'preferences',
                  label: 'Preferences',
                  sub: 'Number row, sound, haptics, key borders',
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
                  sub: 'Privacy & keyboard package details',
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

          {/* TAB: TYPING SOUND & MUSIC STUDIO */}
          {activeTab === 'sound_music' && (
            <div className="space-y-4">
              {/* Master Typing Sound Toggle + Volume */}
              <div className="p-3.5 rounded-xl bg-[#232429] border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-white text-xs">
                      Keyboard Typing Sound
                    </p>
                    <p className="text-[11px] text-[#9aa0a6]">
                      Play key clicks or musical notes when typing
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const next = !settings.soundOnKeypress;
                      onUpdateSettings({ soundOnKeypress: next });
                      if (next) {
                        soundEngine.playKeyClick(
                          'standard',
                          settings.soundVolume,
                          settings.soundProfile || 'gboard_soft'
                        );
                      }
                    }}
                    className={`px-3.5 py-1.5 rounded-lg font-semibold text-xs flex items-center gap-1.5 transition-colors ${
                      settings.soundOnKeypress
                        ? 'bg-[#a8c7fa] text-[#062e6f]'
                        : 'bg-[#2f3036] text-[#9aa0a6]'
                    }`}
                  >
                    {settings.soundOnKeypress ? (
                      <Volume2 className="w-4 h-4" />
                    ) : (
                      <VolumeX className="w-4 h-4" />
                    )}
                    <span>{settings.soundOnKeypress ? 'ON' : 'OFF'}</span>
                  </button>
                </div>

                {/* Volume Slider */}
                <div className="pt-2 border-t border-white/5 space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-[#c4c6d0]">Sound & Music Volume</span>
                    <span className="text-[#a8c7fa] font-semibold tabular-nums">
                      {Math.round(settings.soundVolume * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="1"
                    step="0.05"
                    value={settings.soundVolume}
                    onChange={(e) => {
                      const vol = parseFloat(e.target.value);
                      onUpdateSettings({ soundVolume: vol });
                      soundEngine.playKeyClick(
                        'standard',
                        vol,
                        settings.soundProfile || 'gboard_soft'
                      );
                    }}
                    className="w-full accent-[#a8c7fa] cursor-pointer"
                  />
                </div>
              </div>

              {/* Section 1: Classic & Musical Keypress Sounds */}
              <div className="space-y-2">
                <p className="text-xs font-semibold text-[#e3e2e6]">
                  Keypress Sound & Musical Modes (Tap to preview)
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {SOUND_PROFILES.map((profile) => {
                    const isSelected =
                      (settings.soundProfile || 'gboard_soft') === profile.id;
                    return (
                      <button
                        key={profile.id}
                        type="button"
                        onClick={() => {
                          onUpdateSettings({
                            soundProfile: profile.id,
                            soundOnKeypress: true,
                          });
                          soundEngine.playKeyClick(
                            'standard',
                            settings.soundVolume,
                            profile.id
                          );
                        }}
                        className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-colors ${
                          isSelected
                            ? 'bg-[#1e2a38] border-[#a8c7fa] text-white'
                            : 'bg-[#232429] border-white/5 text-[#c4c6d0] hover:bg-[#2f3036]'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-xs">{profile.name}</span>
                          {isSelected && (
                            <Check className="w-4 h-4 text-[#a8c7fa] shrink-0" />
                          )}
                        </div>
                        <span className="text-[11px] text-[#9aa0a6] mt-0.5">
                          {profile.subtitle}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Section 2: Ambient Background Music Loops */}
              <div className="space-y-2 pt-2 border-t border-white/10">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-[#e3e2e6] flex items-center gap-1.5">
                    <Music className="w-4 h-4 text-[#a8c7fa]" />
                    <span>Background Music While Typing</span>
                  </p>
                  {settings.bgMusicTrack && settings.bgMusicTrack !== 'off' && (
                    <span className="text-[11px] text-[#a8c7fa] font-medium">
                      Playing
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {BG_MUSIC_TRACKS.map((track) => {
                    const isSelected =
                      (settings.bgMusicTrack || 'off') === track.id;
                    return (
                      <button
                        key={track.id}
                        type="button"
                        onClick={() => {
                          onUpdateSettings({ bgMusicTrack: track.id });
                          soundEngine.setBackgroundMusic(
                            track.id,
                            settings.soundVolume
                          );
                        }}
                        className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition-colors ${
                          isSelected
                            ? 'bg-[#1e2a38] border-[#a8c7fa] text-white'
                            : 'bg-[#232429] border-white/5 text-[#c4c6d0] hover:bg-[#2f3036]'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-xs">{track.name}</span>
                          {isSelected && (
                            <Check className="w-3.5 h-3.5 text-[#a8c7fa] shrink-0" />
                          )}
                        </div>
                        <span className="text-[10px] text-[#9aa0a6] mt-0.5">
                          {track.subtitle}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 1: LANGUAGES */}
          {activeTab === 'languages' && (
            <div className="space-y-3">
              <p className="text-xs text-[#c4c6d0]">
                Select your active keyboard languages. Tap the globe key on the keyboard to cycle between enabled languages.
              </p>

              <div className="space-y-1.5">
                {SUPPORTED_LANGUAGES.map((lang) => {
                  const isEnabled = settings.enabledLanguages.includes(lang.id);
                  const isCurrent = settings.activeLanguage === lang.id;

                  return (
                    <div
                      key={lang.id}
                      className={`p-3 rounded-xl border flex items-center justify-between ${
                        isCurrent
                          ? 'bg-[#2f3036] border-[#a8c7fa]/50 text-[#e3e2e6]'
                          : 'bg-[#232429] border-white/5 text-[#c4c6d0]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
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
                                const remaining = settings.enabledLanguages.filter(
                                  (id) => id !== lang.id
                                );
                                onUpdateSettings({
                                  enabledLanguages: remaining,
                                  activeLanguage:
                                    settings.activeLanguage === lang.id
                                      ? remaining[0]
                                      : settings.activeLanguage,
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
                  id: 'soundOnKeypress',
                  title: 'Sound on keypress',
                  desc: 'Play typing sound or musical notes on key tap',
                  checked: settings.soundOnKeypress,
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

              <button
                type="button"
                onClick={() => setActiveTab('sound_music')}
                className="w-full p-3 rounded-xl bg-[#1e2a38] border border-[#a8c7fa]/30 text-left flex items-center justify-between"
              >
                <div className="flex items-center gap-2.5">
                  <Music className="w-4 h-4 text-[#a8c7fa]" />
                  <div>
                    <p className="text-xs font-semibold text-white">
                      Customize Typing Sounds & Background Music
                    </p>
                    <p className="text-[11px] text-[#9aa0a6]">
                      Choose Piano, Bangla Folk, Guitar, Mechanical, or Lo-Fi Music
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-[#a8c7fa]" />
              </button>
            </div>
          )}

          {/* TAB 3: THEMES */}
          {activeTab === 'themes' && (
            <div className="space-y-3">
              {onOpenBoardStudio && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenBoardStudio();
                  }}
                  className="w-full p-3 rounded-xl bg-gradient-to-r from-[#1e2a3a] via-[#243347] to-[#1e2a3a] border border-[#a8c7fa]/40 flex items-center justify-between hover:border-[#a8c7fa] transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-xl">🎨</span>
                    <div className="text-left">
                      <p className="font-bold text-xs text-white">
                        Open Board Studio & Customizer
                      </p>
                      <p className="text-[11px] text-[#a8c7fa]">
                        Edit Banners · Upload Photos · Matrix & Bokeh FX · Custom Colors
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-[#a8c7fa] px-2.5 py-1 rounded bg-white/5">
                    Open Studio →
                  </span>
                </button>
              )}

              <div className="grid grid-cols-2 gap-2.5">
                {Object.values(KEYBOARD_THEMES).map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => {
                      onUpdateSettings({ theme: t.id, isBlankBoard: false });
                    }}
                    className={`p-3 rounded-xl border text-left flex flex-col gap-2 transition-colors ${
                      settings.theme === t.id && !settings.isBlankBoard
                        ? 'border-[#a8c7fa] ring-1 ring-[#a8c7fa]'
                        : 'border-white/10 hover:border-white/20'
                    } ${t.boardBg}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-semibold ${t.textPrimary}`}>{t.name}</span>
                      {settings.theme === t.id && !settings.isBlankBoard && (
                        <Check className="w-4 h-4 text-[#a8c7fa]" />
                      )}
                    </div>
                    <div className="flex gap-1.5">
                      <div className={`w-5 h-5 rounded ${t.keyBg} ${t.keyBorder}`} />
                      <div className={`w-5 h-5 rounded-full ${t.accent}`} />
                      <div className={`w-5 h-5 rounded ${t.keySpecialBg}`} />
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
                  desc: 'Spacebar commits best word prediction or phonetic Bangla conversion',
                  checked: settings.autoCorrection,
                },
                {
                  id: 'nextWordSuggestions',
                  title: 'Next-word suggestions',
                  desc: 'Use previous words in making suggestions',
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
                  desc: 'Double-tap on spacebar inserts a period followed by a space',
                  checked: settings.doubleSpacePeriod,
                },
                {
                  id: 'blockOffensiveWords',
                  title: 'Block offensive words',
                  desc: 'Do not suggest potentially offensive words',
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
                  title: 'Enable glide typing',
                  desc: 'Input a word by sliding through the letters',
                  checked: settings.glideTyping,
                },
                {
                  id: 'showGestureTrail',
                  title: 'Show gesture trail',
                  desc: 'Show smooth path while sliding across keys',
                  checked: settings.showGestureTrail,
                },
                {
                  id: 'gestureDelete',
                  title: 'Enable gesture delete',
                  desc: 'Slide left from the delete key to quickly delete characters',
                  checked: settings.gestureDelete,
                },
                {
                  id: 'gestureCursorControl',
                  title: 'Enable gesture cursor control',
                  desc: 'Move cursor by sliding across the space bar',
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

          {/* TAB 6: VOICE & CLIPBOARD INFO */}
          {(activeTab === 'voice' || activeTab === 'clipboard') && (
            <div className="p-4 rounded-xl bg-[#232429] border border-white/8 space-y-2 text-xs text-[#c4c6d0]">
              <p className="font-semibold text-white">
                {activeTab === 'voice' ? 'Voice Typing Engine' : 'Clipboard Manager'}
              </p>
              <p className="leading-relaxed">
                {activeTab === 'voice'
                  ? 'Tap the microphone icon on the top-right of the keyboard suggestion strip to dictate in Bengali (বাংলা), English, Hindi, Arabic, or Spanish.'
                  : 'Tap the clipboard icon in the keyboard toolbar to pin frequently used phrases or paste recent snippets.'}
              </p>
            </div>
          )}

          {/* TAB 7: PERSONAL DICTIONARY */}
          {activeTab === 'dictionary' && (
            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-[#232429] border border-white/10 space-y-2">
                <p className="text-xs font-semibold text-[#a8c7fa]">Add Text Shortcut</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Shortcut (e.g. omw)"
                    value={newShortcut}
                    onChange={(e) => setNewShortcut(e.target.value)}
                    className="w-1/3 bg-[#111318] text-xs px-2.5 py-1.5 rounded-lg border border-white/10 outline-none text-white placeholder-[#9aa0a6]"
                  />
                  <input
                    type="text"
                    placeholder="Expanded phrase"
                    value={newExpanded}
                    onChange={(e) => setNewExpanded(e.target.value)}
                    className="flex-1 bg-[#111318] text-xs px-2.5 py-1.5 rounded-lg border border-white/10 outline-none text-white placeholder-[#9aa0a6]"
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
                    className="px-3 py-1 bg-[#a8c7fa] text-[#062e6f] font-semibold rounded-lg text-xs hover:bg-[#b8d2fc]"
                  >
                    Add
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                {settings.customShortcuts.map((sc, i) => (
                  <div
                    key={i}
                    className="p-2.5 rounded-xl bg-[#232429] border border-white/5 flex items-center justify-between"
                  >
                    <div>
                      <span className="font-mono font-semibold text-[#a8c7fa] text-xs">{sc.shortcut}</span>
                      <span className="text-[#9aa0a6] mx-2">→</span>
                      <span className="text-white text-xs">{sc.expanded}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const next = settings.customShortcuts.filter((_, idx) => idx !== i);
                        onUpdateSettings({ customShortcuts: next });
                      }}
                      className="p-1 rounded text-[#9aa0a6] hover:text-red-400"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 8: ABOUT */}
          {activeTab === 'about' && (
            <div className="space-y-4 p-2 text-center">
              <TextQBoardLogo size="md" />
              <div className="space-y-1 mt-2">
                <h3 className="font-semibold text-base text-white">Text Q Board</h3>
                <p className="text-xs text-[#a8c7fa]">Multilingual & Phonetic Android Keyboard</p>
                <p className="text-[11px] text-[#9aa0a6]">
                  100% open-source virtual keyboard with on-device privacy.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#232429] border border-white/8 text-left text-xs space-y-1.5">
                <div className="flex items-center gap-2 text-[#a8c7fa] font-semibold">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Privacy Guarantee</span>
                </div>
                <p className="text-[11px] text-[#c4c6d0] leading-relaxed">
                  Bengali phonetic transliteration, word predictions, glide typing, musical sound effects, and voice recognition run with zero keystroke logging.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
