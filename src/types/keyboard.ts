export type LanguageId = 
  | 'en_us'
  | 'en_gb'
  | 'bn_phonetic'
  | 'bn_jatiya'
  | 'bn_probhat'
  | 'es_es'
  | 'pt_br'
  | 'fr_fr'
  | 'de_de'
  | 'ar_sa'
  | 'ur_pk'
  | 'fa_ir'
  | 'hi_in'
  | 'hi_phonetic'
  | 'ta_in'
  | 'te_in'
  | 'ja_jp'
  | 'zh_cn'
  | 'ko_kr'
  | 'ru_ru'
  | 'it_it'
  | 'tr_tr'
  | 'id_id'
  | 'vi_vn'
  | 'th_th'
  | 'nl_nl'
  | 'pl_pl'
  | 'sv_se';

export type UILocaleId = 
  | 'en'
  | 'bn'
  | 'es'
  | 'pt'
  | 'fr'
  | 'de'
  | 'ar'
  | 'hi'
  | 'ja'
  | 'zh'
  | 'ko'
  | 'ru'
  | 'it'
  | 'tr'
  | 'id'
  | 'vi';

export type LanguageRegion =
  | 'all'
  | 'popular'
  | 'americas'
  | 'europe'
  | 'asia_pacific'
  | 'south_asia'
  | 'middle_east';

export interface LanguageInfo {
  id: LanguageId;
  name: string;
  nativeName: string;
  flag: string;
  region: LanguageRegion;
  script: string;
  defaultLayout: string;
  availableLayouts: string[];
  isRtl?: boolean;
}

export type KeyType = 
  | 'char' 
  | 'shift' 
  | 'backspace' 
  | 'enter' 
  | 'space' 
  | 'symbols' 
  | 'globe' 
  | 'emoji' 
  | 'voice' 
  | 'action' 
  | 'tab' 
  | 'hide';

export interface KeyDef {
  primary: string;
  secondary?: string;
  type?: KeyType;
  width?: number; // flex basis ratio, default 1
  popup?: string[];
  actionId?: string;
  code?: string;
}

export interface KeyboardRow {
  keys: KeyDef[];
}

export interface KeyboardLayoutDef {
  id: string;
  name: string;
  isRtl?: boolean;
  rows: KeyboardRow[];
  shiftRows?: KeyboardRow[];
}

export type ThemeId = 
  | 'cyber_cyan'
  | 'material_blue'
  | 'dark_amoled'
  | 'light_slate'
  | 'emerald_neon'
  | 'sunset_violet'
  | 'crimson_dark'
  | 'custom';

export type SoundProfileId =
  | 'gboard_soft'
  | 'mechanical'
  | 'typewriter'
  | 'bubble_pop'
  | 'piano_melody'
  | 'bangla_folk'
  | 'guitar_strums'
  | 'synth_arp';

export type BgMusicTrackId =
  | 'off'
  | 'lofi_chill'
  | 'calm_piano'
  | 'bangla_flute'
  | 'cyber_synth';

export interface ThemeConfig {
  id: ThemeId;
  name: string;
  background: string;
  boardBg: string;
  keyBg: string;
  keyActiveBg: string;
  keySpecialBg: string;
  keySpecialActiveBg: string;
  keyBorder: string;
  keyGlow: string;
  textPrimary: string;
  textSecondary: string;
  accent: string;
  accentText: string;
  suggestionBg: string;
  suggestionActiveBg: string;
  trailColor: string;
  previewBg: string;
  isDark: boolean;
}

export type BoardAnimationType =
  | 'none'
  | 'bokeh_orbs'
  | 'matrix_rain'
  | 'starry_night'
  | 'neon_waves'
  | 'aurora_shift'
  | 'falling_petals'
  | 'cyber_grid';

export type BoardBannerTemplateId =
  | 'pro_material'
  | 'bengal_heritage'
  | 'cyberpunk_glow'
  | 'minimal_obsidian'
  | 'sakura_blossom'
  | 'sunset_horizon'
  | 'ocean_breeze'
  | 'aurora_borealis'
  | 'blank_minimal';

export interface BoardBannerConfig {
  templateId: BoardBannerTemplateId;
  showTitle: boolean;
  title: string;
  showSubtitle: boolean;
  subtitle: string;
  showBadge: boolean;
  badgeText: string;
  accentColor: string;
  bgGradient: string;
}

export interface BoardMediaBackground {
  type: 'none' | 'image' | 'gif' | 'video';
  url: string;
  name?: string;
  dimmerOpacity: number; // 0 to 0.95, default 0.45
  blur: number; // 0 to 12px
  brightness: number; // 0.5 to 1.5
}

export interface BoardCustomColorConfig {
  useCustomColors: boolean;
  boardBgColor: string;
  keyBgColor: string;
  keyTextColor: string;
  keySpecialBgColor: string;
  accentColor: string;
  accentTextColor: string;
  boardGradient?: string;
}

export interface BoardTemplateDef {
  id: string;
  name: string;
  category: 'nature' | 'minimal' | 'bengali' | 'cyber' | 'abstract';
  description: string;
  previewColor: string;
  boardBg: string;
  boardGradient?: string;
  keyBg: string;
  keySpecialBg: string;
  keyTextColor: string;
  accentColor: string;
  accentTextColor: string;
  animation: BoardAnimationType;
  bannerTemplate: BoardBannerTemplateId;
  defaultBannerTitle: string;
  defaultBannerSubtitle: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'gif' | 'video';
}

export interface KeyboardSettings {
  hapticFeedback: boolean;
  soundOnKeypress: boolean;
  soundVolume: number;
  soundProfile: SoundProfileId;
  bgMusicTrack: BgMusicTrackId;
  popupOnKeypress: boolean;
  longPressDelay: number;
  showNumberRow: boolean;
  glideTyping: boolean;
  showGestureTrail: boolean;
  gestureDelete: boolean;
  gestureCursorControl: boolean;
  autoCorrection: boolean;
  nextWordSuggestions: boolean;
  autoCapitalization: boolean;
  doubleSpacePeriod: boolean;
  blockOffensiveWords: boolean;
  oneHandedMode: 'off' | 'left' | 'right';
  isFloating: boolean;
  floatingPosition: { x: number; y: number };
  keyboardHeight: 'short' | 'medium' | 'tall';
  keyBorders: boolean;
  theme: ThemeId;
  activeLanguage: LanguageId;
  enabledLanguages: LanguageId[];
  uiLocale: UILocaleId;
  incognito: boolean;
  customShortcuts: { shortcut: string; expanded: string }[];

  // Board Customization & Animation Suite
  boardAnimation: BoardAnimationType;
  animationSpeed: number; // 0.5 to 2.0
  bannerConfig: BoardBannerConfig;
  mediaBackground: BoardMediaBackground;
  customColors: BoardCustomColorConfig;
  boardTemplateId: string;
  isBlankBoard: boolean;
}

export interface ClipboardItem {
  id: string;
  text: string;
  timestamp: number;
  pinned: boolean;
}

export interface EmojiItem {
  char: string;
  name: string;
  category: 'smileys' | 'people' | 'nature' | 'food' | 'travel' | 'activities' | 'objects' | 'symbols' | 'flags';
  keywords: string[];
}

export interface EmojiKitchenPair {
  id: string;
  emoji1: string;
  emoji2: string;
  result: string;
  title: string;
}

export type ToolbarView = 
  | 'normal'
  | 'more_tools'
  | 'sound_studio'
  | 'board_studio'
  | 'languages'
  | 'translate'
  | 'clipboard'
  | 'text_edit'
  | 'themes'
  | 'settings'
  | 'emoji_picker'
  | 'smart_ai';

export interface TranslationState {
  sourceLang: string;
  targetLang: string;
  sourceText: string;
  translatedText: string;
  isTranslating: boolean;
}
