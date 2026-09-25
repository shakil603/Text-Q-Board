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
  Plus,
  Trash2,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { KeyboardSettings, LanguageId, ThemeConfig } from '../types/keyboard';
import { SUPPORTED_LANGUAGES } from '../data/layouts';
import { KEYBOARD_THEMES } from '../data/themes';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-in fade-in">
      <div
        className={`w-full max-w-lg h-[600px] max-h-[90vh] rounded-3xl flex flex-col overflow-hidden border border-cyan-500/40 shadow-[0_0_35px_rgba(6,182,212,0.35)] ${theme.boardBg}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 bg-black/30">
          <div className="flex items-center gap-2">
            {activeTab !== 'overview' && (
              <button
                onClick={() => setActiveTab('overview')}
                className="text-cyan-400 hover:text-cyan-200 text-xs font-bold mr-1 flex items-center gap-0.5"
              >
                ← Back
              </button>
            )}
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-cyan-400" />
              <span>
                {activeTab === 'overview' && 'Gboard Settings (Text Q Board)'}
                {activeTab === 'languages' && 'Languages & Keyboards'}
                {activeTab === 'preferences' && 'Keyboard Preferences'}
                {activeTab === 'themes' && 'Theme Selection'}
                {activeTab === 'correction' && 'Text Correction'}
                {activeTab === 'glide' && 'Glide / Gesture Typing'}
                {activeTab === 'voice' && 'Voice Typing'}
                {activeTab === 'clipboard' && 'Clipboard Preferences'}
                {activeTab === 'dictionary' && 'Personal Dictionary'}
                {activeTab === 'about' && 'About Text Q Board'}
              </span>
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar text-sm">
          {/* TAB 0: OVERVIEW MAIN MENU */}
          {activeTab === 'overview' && (
            <div className="space-y-1.5">
              {/* App Identity Banner */}
              <div className="p-3 rounded-2xl bg-gradient-to-r from-cyan-950/60 to-slate-900 border border-cyan-500/30 flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <TextQBoardLogo size="sm" showLabel={false} />
                  <div>
                    <h3 className="font-bold text-white text-sm">Text Q Board</h3>
                    <p className="text-[11px] text-cyan-300/80">Android Gboard Replica • Version 12.8</p>
                  </div>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-400/30">
                  Active
                </span>
              </div>

              {/* Navigation Items */}
              {[
                { id: 'languages', label: 'Languages', sub: `${settings.enabledLanguages.length} active languages`, icon: Languages },
                { id: 'preferences', label: 'Preferences', sub: 'Number row, sound, haptics, popups', icon: Sliders },
                { id: 'themes', label: 'Theme', sub: KEYBOARD_THEMES[settings.theme]?.name || 'Cyber Cyan', icon: Palette },
                { id: 'correction', label: 'Text Correction', sub: 'Autocorrect, next-word predictions', icon: SpellCheck },
                { id: 'glide', label: 'Glide Typing', sub: 'Gesture trails, swipe delete', icon: MousePointerClick },
                { id: 'voice', label: 'Voice Typing', sub: 'Web speech recognition engine', icon: Mic },
                { id: 'clipboard', label: 'Clipboard', sub: 'Recent clips, pinned snippets', icon: Clipboard },
                { id: 'dictionary', label: 'Personal Dictionary', sub: `${settings.customShortcuts.length} shortcuts configured`, icon: BookOpen },
                { id: 'about', label: 'About Text Q Board', sub: 'Open-source compliance & licenses', icon: Info },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id as SettingTab)}
                    className="w-full p-3 rounded-xl bg-slate-900/60 hover:bg-cyan-950/40 border border-white/5 hover:border-cyan-500/30 flex items-center justify-between text-left transition-all active:scale-[0.99]"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-cyan-500/15 text-cyan-400 flex items-center justify-center">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-semibold text-white text-xs">{item.label}</p>
                        <p className="text-[11px] text-slate-400">{item.sub}</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-500" />
                  </button>
                );
              })}
            </div>
          )}

          {/* TAB 1: LANGUAGES */}
          {activeTab === 'languages' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-300">
                Select your primary and active keyboard languages. Tap the globe icon on your keyboard to switch quickly.
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
                          ? 'bg-cyan-950/60 border-cyan-400 text-cyan-100 shadow-[0_0_10px_rgba(6,182,212,0.2)]'
                          : 'bg-slate-900/70 border-white/5 text-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{lang.flag}</span>
                        <div>
                          <p className="font-bold text-xs">{lang.name}</p>
                          <p className="text-[10px] text-cyan-300/70">{lang.nativeName}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {isCurrent ? (
                          <span className="px-2 py-0.5 rounded text-[10px] bg-cyan-500 text-slate-950 font-bold">
                            Current
                          </span>
                        ) : (
                          <button
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
                            className="px-2.5 py-1 rounded bg-slate-800 text-cyan-300 hover:bg-cyan-900 text-xs font-semibold"
                          >
                            Set Active
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
                                  activeLanguage: settings.activeLanguage === lang.id ? remaining[0] : settings.activeLanguage,
                                });
                              }
                            }
                          }}
                          className="w-4 h-4 accent-cyan-400 cursor-pointer"
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
                  desc: 'Always show number row (1-0) on top of QWERTY keys',
                  checked: settings.showNumberRow,
                },
                {
                  id: 'soundOnKeypress',
                  title: 'Sound on keypress',
                  desc: 'Synthesized mechanical key click feedback',
                  checked: settings.soundOnKeypress,
                },
                {
                  id: 'hapticFeedback',
                  title: 'Haptic feedback on keypress',
                  desc: 'Vibration on tap (supported devices)',
                  checked: settings.hapticFeedback,
                },
                {
                  id: 'popupOnKeypress',
                  title: 'Popup on keypress',
                  desc: 'Show enlarged key preview character bubble above pressed key',
                  checked: settings.popupOnKeypress,
                },
                {
                  id: 'keyBorders',
                  title: 'Key borders',
                  desc: 'Show distinct borders & glow around each keycap',
                  checked: settings.keyBorders,
                },
                {
                  id: 'incognito',
                  title: 'Incognito Mode',
                  desc: 'Never save typed history or private vocabulary',
                  checked: settings.incognito,
                },
              ].map((pref) => (
                <label
                  key={pref.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-white/5 cursor-pointer hover:bg-slate-800/60"
                >
                  <div className="pr-3">
                    <p className="font-semibold text-white text-xs">{pref.title}</p>
                    <p className="text-[11px] text-slate-400">{pref.desc}</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={pref.checked}
                    onChange={(e) => onUpdateSettings({ [pref.id]: e.target.checked })}
                    className="w-4 h-4 accent-cyan-400 cursor-pointer"
                  />
                </label>
              ))}

              {/* Sound Volume Slider */}
              {settings.soundOnKeypress && (
                <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5 space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-white">Sound volume</span>
                    <span className="text-cyan-400 font-bold">{Math.round(settings.soundVolume * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="1"
                    step="0.1"
                    value={settings.soundVolume}
                    onChange={(e) => onUpdateSettings({ soundVolume: parseFloat(e.target.value) })}
                    className="w-full accent-cyan-400 cursor-pointer"
                  />
                </div>
              )}
            </div>
          )}

          {/* TAB 3: THEMES */}
          {activeTab === 'themes' && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2.5">
                {Object.values(KEYBOARD_THEMES).map((t) => (
                  <button
                    key={t.id}
                    onClick={() => onUpdateSettings({ theme: t.id })}
                    className={`p-3 rounded-2xl border text-left flex flex-col gap-2 transition-all ${
                      settings.theme === t.id
                        ? 'border-cyan-400 ring-2 ring-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.3)] scale-[1.02]'
                        : 'border-white/10 hover:border-white/20'
                    } ${t.boardBg}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-bold ${t.textPrimary}`}>{t.name}</span>
                      {settings.theme === t.id && <Check className="w-4 h-4 text-cyan-400" />}
                    </div>
                    <div className="flex gap-1.5">
                      <div className={`w-5 h-5 rounded-md ${t.keyBg} ${t.keyBorder}`} />
                      <div className={`w-5 h-5 rounded-md ${t.accent}`} />
                      <div className={`w-5 h-5 rounded-md ${t.keySpecialBg}`} />
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
                  desc: 'Spacebar automatically inserts best suggested word or Bangla transliteration',
                  checked: settings.autoCorrection,
                },
                {
                  id: 'nextWordSuggestions',
                  title: 'Next-word suggestions',
                  desc: 'Predict likely next words in sentence',
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
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-white/5 cursor-pointer hover:bg-slate-800/60"
                >
                  <div className="pr-3">
                    <p className="font-semibold text-white text-xs">{item.title}</p>
                    <p className="text-[11px] text-slate-400">{item.desc}</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={item.checked}
                    onChange={(e) => onUpdateSettings({ [item.id]: e.target.checked })}
                    className="w-4 h-4 accent-cyan-400 cursor-pointer"
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
                  title: 'Enable Glide Typing',
                  desc: 'Input words by sliding your finger or mouse through the keys',
                  checked: settings.glideTyping,
                },
                {
                  id: 'showGestureTrail',
                  title: 'Show gesture trail',
                  desc: 'Draw glowing neon cyber cyan trajectory while swiping',
                  checked: settings.showGestureTrail,
                },
                {
                  id: 'gestureDelete',
                  title: 'Enable gesture delete',
                  desc: 'Slide left from the delete key to select words for quick deletion',
                  checked: settings.gestureDelete,
                },
                {
                  id: 'gestureCursorControl',
                  title: 'Enable gesture cursor control',
                  desc: 'Slide finger across space bar to move cursor left and right',
                  checked: settings.gestureCursorControl,
                },
              ].map((item) => (
                <label
                  key={item.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-white/5 cursor-pointer hover:bg-slate-800/60"
                >
                  <div className="pr-3">
                    <p className="font-semibold text-white text-xs">{item.title}</p>
                    <p className="text-[11px] text-slate-400">{item.desc}</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={item.checked}
                    onChange={(e) => onUpdateSettings({ [item.id]: e.target.checked })}
                    className="w-4 h-4 accent-cyan-400 cursor-pointer"
                  />
                </label>
              ))}
            </div>
          )}

          {/* TAB 6: PERSONAL DICTIONARY */}
          {activeTab === 'dictionary' && (
            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-slate-900 border border-cyan-500/30 space-y-2">
                <p className="text-xs font-bold text-cyan-300">Add New Text Shortcut</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Shortcut (e.g. omw)"
                    value={newShortcut}
                    onChange={(e) => setNewShortcut(e.target.value)}
                    className="w-1/3 bg-slate-800 text-xs px-2.5 py-1.5 rounded border border-white/10 outline-none text-white placeholder-slate-500"
                  />
                  <input
                    type="text"
                    placeholder="Expanded text (e.g. On my way!)"
                    value={newExpanded}
                    onChange={(e) => setNewExpanded(e.target.value)}
                    className="flex-1 bg-slate-800 text-xs px-2.5 py-1.5 rounded border border-white/10 outline-none text-white placeholder-slate-500"
                  />
                  <button
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
                    className="px-3 py-1 bg-cyan-500 text-slate-950 font-bold rounded text-xs hover:bg-cyan-400 active:scale-95"
                  >
                    Add
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                {settings.customShortcuts.map((sc, i) => (
                  <div
                    key={i}
                    className="p-2.5 rounded-xl bg-slate-900/70 border border-white/5 flex items-center justify-between"
                  >
                    <div>
                      <span className="font-mono font-bold text-cyan-400 text-xs">{sc.shortcut}</span>
                      <span className="text-slate-500 mx-2">→</span>
                      <span className="text-white text-xs font-medium">{sc.expanded}</span>
                    </div>
                    <button
                      onClick={() => {
                        const next = settings.customShortcuts.filter((_, idx) => idx !== i);
                        onUpdateSettings({ customShortcuts: next });
                      }}
                      className="p-1 rounded text-slate-500 hover:text-red-400"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 7: ABOUT */}
          {activeTab === 'about' && (
            <div className="space-y-4 p-2 text-center">
              <TextQBoardLogo size="md" />
              <div className="space-y-1 mt-2">
                <h3 className="font-bold text-base text-white">Text Q Board</h3>
                <p className="text-xs text-cyan-300">Gboard-Compliant Android Virtual Keyboard</p>
                <p className="text-[11px] text-slate-400">
                  Built with 100% open-source components, zero telemetry, and complete on-device privacy.
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-slate-900 border border-cyan-500/20 text-left text-xs space-y-2">
                <div className="flex items-center gap-2 text-cyan-300 font-bold">
                  <ShieldCheck className="w-4 h-4 text-cyan-400" />
                  <span>Open Source & Privacy Guarantee</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Every feature—including Bengali phonetic transliteration, swipe gesture trails, dictionary lookup, speech recognition, and custom key haptics—runs strictly on open web APIs and client engines.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
