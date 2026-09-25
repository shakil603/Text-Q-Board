export type LanguageId = 
  | 'en_us'
  | 'bn_phonetic'
  | 'bn_jatiya'
  | 'bn_probhat'
  | 'es_es'
  | 'fr_fr'
  | 'de_de'
  | 'ar_sa'
  | 'hi_in'
  | 'ru_ru';

export interface LanguageInfo {
  id: LanguageId;
  name: string;
  nativeName: string;
  flag: string;
  defaultLayout: string;
  availableLayouts: string[];
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
  | 'crimson_dark';

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

export interface KeyboardSettings {
  hapticFeedback: boolean;
  soundOnKeypress: boolean;
  soundVolume: number;
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
  incognito: boolean;
  customShortcuts: { shortcut: string; expanded: string }[];
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
