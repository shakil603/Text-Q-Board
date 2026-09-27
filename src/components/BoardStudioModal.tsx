import React, { useState, useRef } from 'react';
import {
  X,
  Palette,
  Image as ImageIcon,
  Sparkles,
  Type,
  Layout,
  Upload,
  Trash2,
  Check,
  Eye,
  EyeOff,
  RotateCcw,
  Sliders,
  SlidersHorizontal,
  Film,
  SunMedium,
  Layers,
  Wand2
} from 'lucide-react';
import {
  BoardAnimationType,
  BoardBannerConfig,
  BoardCustomColorConfig,
  BoardMediaBackground,
  KeyboardSettings,
  ThemeConfig
} from '../types/keyboard';
import {
  PRESET_BANNERS,
  BOARD_TEMPLATES,
  PRESET_ANIMATIONS_INFO,
  PRESET_COLOR_PALETTES,
  CURATED_MEDIA_WALLPAPERS
} from '../data/boardTemplates';

interface BoardStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: KeyboardSettings;
  onUpdateSettings: (newSettings: Partial<KeyboardSettings>) => void;
  theme: ThemeConfig;
}

type StudioTab = 'banners' | 'photos' | 'animations' | 'colors' | 'templates';

export const BoardStudioModal: React.FC<BoardStudioModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  theme,
}) => {
  const [activeTab, setActiveTab] = useState<StudioTab>('banners');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  // Banner Config Helpers
  const bannerConfig: BoardBannerConfig = settings.bannerConfig || {
    templateId: 'pro_material',
    showTitle: true,
    title: 'Text Q Board',
    showSubtitle: true,
    subtitle: 'Multilingual & Phonetic Bengali Keyboard',
    showBadge: true,
    badgeText: 'Pro Edition',
    accentColor: '#A8C7FA',
    bgGradient: 'from-[#1b1e28] via-[#1f2433] to-[#171b24]',
  };

  const mediaBg: BoardMediaBackground = settings.mediaBackground || {
    type: 'none',
    url: '',
    dimmerOpacity: 0.45,
    blur: 0,
    brightness: 1,
  };

  const customColors: BoardCustomColorConfig = settings.customColors || {
    useCustomColors: false,
    boardBgColor: '#1b1b1f',
    keyBgColor: '#2f3036',
    keySpecialBgColor: '#232429',
    keyTextColor: '#e3e2e6',
    accentColor: '#a8c7fa',
    accentTextColor: '#062e6f',
  };

  // Handle Photo / GIF / Video Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isVideo = file.type.startsWith('video/');
    const isGif = file.type === 'image/gif';
    const isImage = file.type.startsWith('image/');

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        onUpdateSettings({
          isBlankBoard: false,
          mediaBackground: {
            type: isVideo ? 'video' : isGif ? 'gif' : 'image',
            url: dataUrl,
            name: file.name,
            dimmerOpacity: 0.45,
            blur: 0,
            brightness: 1,
          },
        });
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3 sm:p-4 backdrop-blur-sm">
      <div
        className={`w-full max-w-2xl h-[650px] max-h-[92vh] rounded-2xl flex flex-col overflow-hidden border border-white/10 shadow-2xl bg-[#151922] text-[#e3e2e6]`}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/10 bg-[#111318]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#a8c7fa]/20 text-[#a8c7fa] flex items-center justify-center">
              <Palette className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-tight">
                Text Board Studio & Customizer
              </h2>
              <p className="text-[11px] text-[#9aa0a6]">
                Customize board colors, banners, upload photos, or apply animations
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full bg-[#232936] text-[#c4c6d0] hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Studio Navigation Tabs */}
        <div className="flex items-center gap-1 px-4 pt-3 pb-2 border-b border-white/5 bg-[#171b24] overflow-x-auto no-scrollbar">
          {[
            { id: 'banners', label: 'Banners & Names', icon: Type },
            { id: 'photos', label: 'Photos & Wallpaper', icon: ImageIcon },
            { id: 'animations', label: 'Animations', icon: Sparkles },
            { id: 'colors', label: 'Board Colors', icon: Palette },
            { id: 'templates', label: 'Design Templates', icon: Layout },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as StudioTab)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap ${
                  isActive
                    ? 'bg-[#a8c7fa] text-[#062e6f] shadow-sm'
                    : 'bg-[#232936] text-[#c4c6d0] hover:bg-[#2c3444] hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Studio Body Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
          {/* TAB 1: BANNERS & NAME CUSTOMIZATION */}
          {activeTab === 'banners' && (
            <div className="space-y-4">
              {/* Banner Live Preview */}
              <div className="p-4 rounded-2xl bg-[#1e2430] border border-[#a8c7fa]/30 space-y-2">
                <div className="flex items-center justify-between text-[11px] text-[#9aa0a6]">
                  <span>Live Banner Preview</span>
                  {bannerConfig.showBadge && bannerConfig.badgeText && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#a8c7fa]/20 text-[#a8c7fa] border border-[#a8c7fa]/30">
                      {bannerConfig.badgeText}
                    </span>
                  )}
                </div>

                <div
                  className={`p-4 rounded-xl bg-gradient-to-r ${bannerConfig.bgGradient} border border-white/10`}
                >
                  <div className="space-y-1">
                    {bannerConfig.showTitle ? (
                      <h3
                        className="text-base font-bold tracking-tight text-white"
                        style={{
                          color: bannerConfig.accentColor || '#A8C7FA',
                        }}
                      >
                        {bannerConfig.title || 'Text Q Board'}
                      </h3>
                    ) : (
                      <p className="text-xs text-[#9aa0a6] italic">
                        [Banner Name Removed / Hidden]
                      </p>
                    )}

                    {bannerConfig.showSubtitle && bannerConfig.subtitle && (
                      <p className="text-xs text-[#c4c6d0]">
                        {bannerConfig.subtitle}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Banner Name & Text Controls */}
              <div className="p-4 rounded-xl bg-[#1b202c] border border-white/5 space-y-3">
                <p className="text-xs font-bold text-white">Edit Banner Text</p>

                {/* Title Input + Show/Hide Toggle */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#c4c6d0]">Banner Title / Name</span>
                    <button
                      type="button"
                      onClick={() =>
                        onUpdateSettings({
                          bannerConfig: {
                            ...bannerConfig,
                            showTitle: !bannerConfig.showTitle,
                          },
                        })
                      }
                      className="text-[#a8c7fa] text-[11px] flex items-center gap-1 hover:underline"
                    >
                      {bannerConfig.showTitle ? (
                        <>
                          <Eye className="w-3 h-3" />
                          <span>Visible</span>
                        </>
                      ) : (
                        <>
                          <EyeOff className="w-3 h-3" />
                          <span>Hidden</span>
                        </>
                      )}
                    </button>
                  </div>
                  <input
                    type="text"
                    value={bannerConfig.title}
                    onChange={(e) =>
                      onUpdateSettings({
                        bannerConfig: {
                          ...bannerConfig,
                          title: e.target.value,
                          showTitle: true,
                        },
                      })
                    }
                    placeholder="Enter custom board name (or leave blank to remove)"
                    className="w-full bg-[#111318] text-white px-3 py-2 rounded-lg border border-white/10 text-xs outline-none focus:border-[#a8c7fa]"
                  />
                </div>

                {/* Subtitle Input + Show/Hide Toggle */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#c4c6d0]">Subtitle Description</span>
                    <button
                      type="button"
                      onClick={() =>
                        onUpdateSettings({
                          bannerConfig: {
                            ...bannerConfig,
                            showSubtitle: !bannerConfig.showSubtitle,
                          },
                        })
                      }
                      className="text-[#a8c7fa] text-[11px] flex items-center gap-1 hover:underline"
                    >
                      {bannerConfig.showSubtitle ? (
                        <>
                          <Eye className="w-3 h-3" />
                          <span>Visible</span>
                        </>
                      ) : (
                        <>
                          <EyeOff className="w-3 h-3" />
                          <span>Hidden</span>
                        </>
                      )}
                    </button>
                  </div>
                  <input
                    type="text"
                    value={bannerConfig.subtitle}
                    onChange={(e) =>
                      onUpdateSettings({
                        bannerConfig: {
                          ...bannerConfig,
                          subtitle: e.target.value,
                          showSubtitle: true,
                        },
                      })
                    }
                    placeholder="Enter subtitle (e.g. Multilingual & Phonetic Keyboard)"
                    className="w-full bg-[#111318] text-white px-3 py-2 rounded-lg border border-white/10 text-xs outline-none focus:border-[#a8c7fa]"
                  />
                </div>

                {/* Quick Action: Remove Name or Reset to Default */}
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() =>
                      onUpdateSettings({
                        bannerConfig: {
                          ...bannerConfig,
                          title: '',
                          subtitle: '',
                          showTitle: false,
                          showSubtitle: false,
                          showBadge: false,
                        },
                      })
                    }
                    className="px-3 py-1.5 rounded-lg bg-[#2f3545] hover:bg-[#394258] text-xs text-[#ffb3ad] flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove Banner Text (Blank)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      onUpdateSettings({
                        bannerConfig: {
                          templateId: 'pro_material',
                          showTitle: true,
                          title: 'Text Q Board',
                          showSubtitle: true,
                          subtitle:
                            'Multilingual & Phonetic Bengali Keyboard',
                          showBadge: true,
                          badgeText: 'Pro Edition',
                          accentColor: '#A8C7FA',
                          bgGradient:
                            'from-[#1b1e28] via-[#1f2433] to-[#171b24]',
                        },
                      })
                    }
                    className="px-3 py-1.5 rounded-lg bg-[#2f3545] hover:bg-[#394258] text-xs text-[#a8c7fa] flex items-center gap-1"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset Default Name</span>
                  </button>
                </div>
              </div>

              {/* Pre-designed Stunning Banners */}
              <div className="space-y-2">
                <p className="text-xs font-bold text-white">
                  Choose from Pre-Designed Banners
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {PRESET_BANNERS.map((preset) => {
                    const isSelected =
                      bannerConfig.templateId === preset.id;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => {
                          onUpdateSettings({
                            isBlankBoard: preset.id === 'blank_minimal',
                            bannerConfig: {
                              templateId: preset.id,
                              showTitle: preset.id !== 'blank_minimal',
                              title: preset.title,
                              showSubtitle: preset.id !== 'blank_minimal',
                              subtitle: preset.subtitle,
                              showBadge: preset.id !== 'blank_minimal',
                              badgeText: preset.badgeText,
                              bgGradient: preset.bgGradient,
                              accentColor: preset.accentColor,
                            },
                          });
                        }}
                        className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-colors ${
                          isSelected
                            ? 'bg-[#1e2a3a] border-[#a8c7fa] ring-1 ring-[#a8c7fa]'
                            : 'bg-[#1a1f2c] border-white/5 hover:bg-[#23293a]'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span
                            className="font-bold text-xs"
                            style={{ color: preset.accentColor }}
                          >
                            {preset.name}
                          </span>
                          {isSelected && (
                            <Check className="w-4 h-4 text-[#a8c7fa] shrink-0" />
                          )}
                        </div>
                        <p className="text-[11px] text-[#c4c6d0] mt-1 line-clamp-1">
                          {preset.title || '[Blank Minimal]'}
                        </p>
                        <span className="text-[9px] text-[#9aa0a6] mt-0.5">
                          {preset.category}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PHOTOS, GIFS & VIDEO WALLPAPERS */}
          {activeTab === 'photos' && (
            <div className="space-y-4">
              {/* Photo Upload Card */}
              <div className="p-4 rounded-xl bg-[#1b202c] border border-white/8 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Upload className="w-4 h-4 text-[#a8c7fa]" />
                    <span className="text-xs font-bold text-white">
                      Upload Custom Photo, GIF, or Video Loop
                    </span>
                  </div>
                  {mediaBg.type !== 'none' && (
                    <button
                      type="button"
                      onClick={() =>
                        onUpdateSettings({
                          mediaBackground: {
                            type: 'none',
                            url: '',
                            dimmerOpacity: 0.45,
                            blur: 0,
                            brightness: 1,
                          },
                        })
                      }
                      className="text-xs text-rose-300 hover:text-rose-200 flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove</span>
                    </button>
                  )}
                </div>

                <p className="text-xs text-[#9aa0a6]">
                  Upload any photo from your device (JPEG, PNG, WebP, animated GIF, or video loop). The board will automatically apply a dimmer overlay so your keyboard keys stay clear and easy to type on.
                </p>

                <div className="flex items-center gap-3 pt-1">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,video/mp4,video/webm"
                    onChange={handleFileUpload}
                    className="hidden"
                  />

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 rounded-xl bg-[#a8c7fa] hover:bg-[#b8d2fc] text-[#062e6f] font-bold text-xs flex items-center gap-2 transition-colors shadow-sm"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Choose Photo / Video File</span>
                  </button>

                  {mediaBg.type !== 'none' && (
                    <span className="text-xs text-[#a8c7fa] font-medium truncate max-w-xs">
                      Active: {mediaBg.name || mediaBg.type.toUpperCase()}
                    </span>
                  )}
                </div>
              </div>

              {/* Adjustments: Dimmer (Contrast), Blur, Brightness */}
              {mediaBg.type !== 'none' && (
                <div className="p-4 rounded-xl bg-[#1b202c] border border-white/8 space-y-3">
                  <p className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Sliders className="w-4 h-4 text-[#a8c7fa]" />
                    <span>Keyboard Photo Contrast & Blur Adjustments</span>
                  </p>

                  {/* Dimmer / Opacity Slider */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-[#c4c6d0]">
                        Key Legibility Dark Dimmer (Dark overlay)
                      </span>
                      <span className="text-[#a8c7fa] font-semibold">
                        {Math.round(mediaBg.dimmerOpacity * 100)}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0.1"
                      max="0.85"
                      step="0.05"
                      value={mediaBg.dimmerOpacity}
                      onChange={(e) =>
                        onUpdateSettings({
                          mediaBackground: {
                            ...mediaBg,
                            dimmerOpacity: parseFloat(e.target.value),
                          },
                        })
                      }
                      className="w-full accent-[#a8c7fa] cursor-pointer"
                    />
                  </div>

                  {/* Blur Slider */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-[#c4c6d0]">Background Blur</span>
                      <span className="text-[#a8c7fa] font-semibold">
                        {mediaBg.blur}px
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="8"
                      step="1"
                      value={mediaBg.blur}
                      onChange={(e) =>
                        onUpdateSettings({
                          mediaBackground: {
                            ...mediaBg,
                            blur: parseInt(e.target.value, 10),
                          },
                        })
                      }
                      className="w-full accent-[#a8c7fa] cursor-pointer"
                    />
                  </div>
                </div>
              )}

              {/* Curated Pre-set Wallpapers */}
              <div className="space-y-2">
                <p className="text-xs font-bold text-white">
                  Or Pick a Curated Landscape & Cyber Wallpaper
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {CURATED_MEDIA_WALLPAPERS.map((wp) => {
                    const isSelected =
                      mediaBg.url === wp.url && mediaBg.type !== 'none';
                    return (
                      <button
                        key={wp.id}
                        type="button"
                        onClick={() =>
                          onUpdateSettings({
                            isBlankBoard: false,
                            mediaBackground: {
                              type: wp.type,
                              url: wp.url,
                              name: wp.name,
                              dimmerOpacity: 0.45,
                              blur: 0,
                              brightness: 1,
                            },
                          })
                        }
                        className={`group relative h-24 rounded-xl overflow-hidden border text-left flex flex-col justify-end p-2 transition-all ${
                          isSelected
                            ? 'border-[#a8c7fa] ring-2 ring-[#a8c7fa]'
                            : 'border-white/10 hover:border-white/30'
                        }`}
                      >
                        <img
                          src={wp.url}
                          alt={wp.name}
                          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                        <div className="relative z-10 flex items-center justify-between w-full">
                          <span className="text-white text-[11px] font-semibold truncate">
                            {wp.name}
                          </span>
                          {isSelected && (
                            <Check className="w-3.5 h-3.5 text-[#a8c7fa] shrink-0" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: ANIMATIONS */}
          {activeTab === 'animations' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-[#1b202c] border border-white/8 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">
                    Animation Speed Multiplier
                  </span>
                  <span className="text-xs text-[#a8c7fa] font-semibold">
                    {(settings.animationSpeed || 1).toFixed(1)}x
                  </span>
                </div>
                <input
                  type="range"
                  min="0.4"
                  max="2.0"
                  step="0.2"
                  value={settings.animationSpeed || 1}
                  onChange={(e) =>
                    onUpdateSettings({
                      animationSpeed: parseFloat(e.target.value),
                    })
                  }
                  className="w-full accent-[#a8c7fa] cursor-pointer"
                />
              </div>

              <div className="space-y-2">
                <p className="text-xs font-bold text-white">
                  Select Board Background Animation
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {PRESET_ANIMATIONS_INFO.map((anim) => {
                    const isSelected =
                      (settings.boardAnimation || 'none') === anim.id &&
                      !settings.isBlankBoard;
                    return (
                      <button
                        key={anim.id}
                        type="button"
                        onClick={() =>
                          onUpdateSettings({
                            isBlankBoard: false,
                            boardAnimation: anim.id,
                          })
                        }
                        className={`p-3 rounded-xl border text-left flex items-center justify-between transition-colors ${
                          isSelected
                            ? 'bg-[#1e2a3a] border-[#a8c7fa] ring-1 ring-[#a8c7fa]'
                            : 'bg-[#1a1f2c] border-white/5 hover:bg-[#23293a]'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{anim.icon}</span>
                          <div>
                            <p className="font-bold text-xs text-white">
                              {anim.name}
                            </p>
                            <p className="text-[11px] text-[#9aa0a6] mt-0.5">
                              {anim.description}
                            </p>
                          </div>
                        </div>
                        {isSelected && (
                          <Check className="w-4 h-4 text-[#a8c7fa] shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: BOARD COLORS & CUSTOM PALETTE */}
          {activeTab === 'colors' && (
            <div className="space-y-4">
              {/* Enable Custom Colors Toggle */}
              <div className="p-3.5 rounded-xl bg-[#1b202c] border border-white/8 flex items-center justify-between">
                <div>
                  <p className="font-bold text-xs text-white">
                    Use Custom Color Palette
                  </p>
                  <p className="text-[11px] text-[#9aa0a6]">
                    Override theme defaults with your personalized board colors
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={customColors.useCustomColors}
                  onChange={(e) =>
                    onUpdateSettings({
                      isBlankBoard: false,
                      customColors: {
                        ...customColors,
                        useCustomColors: e.target.checked,
                      },
                    })
                  }
                  className="w-4 h-4 accent-[#a8c7fa] cursor-pointer"
                />
              </div>

              {/* Color Pickers */}
              {customColors.useCustomColors && (
                <div className="p-4 rounded-xl bg-[#1b202c] border border-white/8 space-y-3">
                  <p className="text-xs font-bold text-white">
                    Custom Color Pickers
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {/* Board Background Color */}
                    <label className="flex flex-col gap-1 text-xs">
                      <span className="text-[#c4c6d0]">Board Surface</span>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={customColors.boardBgColor}
                          onChange={(e) =>
                            onUpdateSettings({
                              customColors: {
                                ...customColors,
                                boardBgColor: e.target.value,
                              },
                            })
                          }
                          className="w-8 h-8 rounded border-none cursor-pointer bg-transparent"
                        />
                        <span className="font-mono text-[11px] text-[#9aa0a6]">
                          {customColors.boardBgColor}
                        </span>
                      </div>
                    </label>

                    {/* Keycap Color */}
                    <label className="flex flex-col gap-1 text-xs">
                      <span className="text-[#c4c6d0]">Keycap Surface</span>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={customColors.keyBgColor}
                          onChange={(e) =>
                            onUpdateSettings({
                              customColors: {
                                ...customColors,
                                keyBgColor: e.target.value,
                              },
                            })
                          }
                          className="w-8 h-8 rounded border-none cursor-pointer bg-transparent"
                        />
                        <span className="font-mono text-[11px] text-[#9aa0a6]">
                          {customColors.keyBgColor}
                        </span>
                      </div>
                    </label>

                    {/* Key Text Color */}
                    <label className="flex flex-col gap-1 text-xs">
                      <span className="text-[#c4c6d0]">Key Text / Glyphs</span>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={customColors.keyTextColor}
                          onChange={(e) =>
                            onUpdateSettings({
                              customColors: {
                                ...customColors,
                                keyTextColor: e.target.value,
                              },
                            })
                          }
                          className="w-8 h-8 rounded border-none cursor-pointer bg-transparent"
                        />
                        <span className="font-mono text-[11px] text-[#9aa0a6]">
                          {customColors.keyTextColor}
                        </span>
                      </div>
                    </label>

                    {/* Accent Color */}
                    <label className="flex flex-col gap-1 text-xs">
                      <span className="text-[#c4c6d0]">Accent / Spacebar</span>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={customColors.accentColor}
                          onChange={(e) =>
                            onUpdateSettings({
                              customColors: {
                                ...customColors,
                                accentColor: e.target.value,
                              },
                            })
                          }
                          className="w-8 h-8 rounded border-none cursor-pointer bg-transparent"
                        />
                        <span className="font-mono text-[11px] text-[#9aa0a6]">
                          {customColors.accentColor}
                        </span>
                      </div>
                    </label>
                  </div>
                </div>
              )}

              {/* One-Tap Curated Palettes */}
              <div className="space-y-2">
                <p className="text-xs font-bold text-white">
                  Or Pick a Curated Color Palette
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {PRESET_COLOR_PALETTES.map((palette, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() =>
                        onUpdateSettings({
                          isBlankBoard: false,
                          customColors: {
                            useCustomColors: true,
                            boardBgColor: palette.board,
                            keyBgColor: palette.key,
                            keySpecialBgColor: palette.keySpecial,
                            keyTextColor: palette.text,
                            accentColor: palette.accent,
                            accentTextColor: palette.accentText,
                          },
                        })
                      }
                      className="p-3 rounded-xl border border-white/10 hover:border-white/25 text-left flex flex-col gap-2 transition-colors bg-[#1a1f2c]"
                    >
                      <span className="font-semibold text-xs text-white">
                        {palette.name}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <div
                          className="w-5 h-5 rounded-md border border-white/20"
                          style={{ backgroundColor: palette.board }}
                          title="Board Background"
                        />
                        <div
                          className="w-5 h-5 rounded-md border border-white/20"
                          style={{ backgroundColor: palette.key }}
                          title="Keycap"
                        />
                        <div
                          className="w-5 h-5 rounded-md border border-white/20"
                          style={{ backgroundColor: palette.accent }}
                          title="Accent"
                        />
                        <div
                          className="w-5 h-5 rounded-md border border-white/20"
                          style={{ backgroundColor: palette.text }}
                          title="Text"
                        />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: COMPLETE DESIGN TEMPLATES & BLANK MODE */}
          {activeTab === 'templates' && (
            <div className="space-y-4">
              {/* Option to Make Board Completely Blank */}
              <div className="p-4 rounded-xl bg-[#1e2430] border border-[#a8c7fa]/30 flex items-center justify-between">
                <div>
                  <p className="font-bold text-xs text-white">
                    Blank Board Mode
                  </p>
                  <p className="text-[11px] text-[#9aa0a6]">
                    Leaves the board completely clean without any banner texts or animations
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    onUpdateSettings({
                      isBlankBoard: !settings.isBlankBoard,
                      boardAnimation: 'none',
                      mediaBackground: {
                        type: 'none',
                        url: '',
                        dimmerOpacity: 0.45,
                        blur: 0,
                        brightness: 1,
                      },
                    })
                  }
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                    settings.isBlankBoard
                      ? 'bg-[#a8c7fa] text-[#062e6f]'
                      : 'bg-[#2f3545] text-[#c4c6d0] hover:text-white'
                  }`}
                >
                  {settings.isBlankBoard ? 'Blank Mode: ON' : 'Enable Blank Board'}
                </button>
              </div>

              {/* Complete Curated Templates */}
              <div className="space-y-2">
                <p className="text-xs font-bold text-white">
                  Curated Complete Design Templates
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {BOARD_TEMPLATES.map((tmpl) => {
                    const isSelected =
                      settings.boardTemplateId === tmpl.id;
                    return (
                      <button
                        key={tmpl.id}
                        type="button"
                        onClick={() => {
                          const isBlank = tmpl.id === 'template_amoled_blank';
                          onUpdateSettings({
                            boardTemplateId: tmpl.id,
                            isBlankBoard: isBlank,
                            boardAnimation: tmpl.animation,
                            customColors: {
                              useCustomColors: true,
                              boardBgColor: tmpl.boardBg,
                              boardGradient: tmpl.boardGradient,
                              keyBgColor: tmpl.keyBg,
                              keySpecialBgColor: tmpl.keySpecialBg,
                              keyTextColor: tmpl.keyTextColor,
                              accentColor: tmpl.accentColor,
                              accentTextColor: tmpl.accentTextColor,
                            },
                            bannerConfig: {
                              ...bannerConfig,
                              templateId: tmpl.bannerTemplate,
                              title: tmpl.defaultBannerTitle,
                              subtitle: tmpl.defaultBannerSubtitle,
                              showTitle: !isBlank,
                              showSubtitle: !isBlank,
                            },
                          });
                        }}
                        className={`p-3.5 rounded-xl border text-left flex flex-col justify-between transition-colors ${
                          isSelected
                            ? 'bg-[#1e2a3a] border-[#a8c7fa] ring-1 ring-[#a8c7fa]'
                            : 'bg-[#1a1f2c] border-white/5 hover:bg-[#23293a]'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span
                            className="font-bold text-xs"
                            style={{ color: tmpl.accentColor }}
                          >
                            {tmpl.name}
                          </span>
                          {isSelected && (
                            <Check className="w-4 h-4 text-[#a8c7fa] shrink-0" />
                          )}
                        </div>
                        <p className="text-[11px] text-[#c4c6d0] mt-1 line-clamp-2">
                          {tmpl.description}
                        </p>
                        <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-white/5">
                          <span className="text-[9px] px-2 py-0.5 rounded bg-white/5 text-[#9aa0a6]">
                            {tmpl.category.toUpperCase()}
                          </span>
                          {tmpl.animation !== 'none' && (
                            <span className="text-[9px] px-2 py-0.5 rounded bg-[#a8c7fa]/20 text-[#a8c7fa]">
                              ✨ {tmpl.animation.replace('_', ' ')}
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
