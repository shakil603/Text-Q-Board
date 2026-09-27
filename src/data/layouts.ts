import { KeyboardLayoutDef, LanguageInfo } from '../types/keyboard';

export const SUPPORTED_LANGUAGES: LanguageInfo[] = [
  {
    id: 'en_us',
    name: 'English (US)',
    nativeName: 'English (US)',
    flag: '🇺🇸',
    region: 'popular',
    script: 'Latin',
    defaultLayout: 'qwerty',
    availableLayouts: ['qwerty', 'qwertz', 'azerty', 'dvorak'],
  },
  {
    id: 'en_gb',
    name: 'English (UK)',
    nativeName: 'English (UK)',
    flag: '🇬🇧',
    region: 'europe',
    script: 'Latin',
    defaultLayout: 'qwerty',
    availableLayouts: ['qwerty'],
  },
  {
    id: 'bn_phonetic',
    name: 'Bengali (Phonetic)',
    nativeName: 'বাংলা (ফোনেটিক)',
    flag: '🇧🇩',
    region: 'south_asia',
    script: 'Bengali',
    defaultLayout: 'bengali_phonetic',
    availableLayouts: ['bengali_phonetic', 'bengali_jatiya', 'bengali_probhat'],
  },
  {
    id: 'bn_jatiya',
    name: 'Bengali (Jatiya)',
    nativeName: 'বাংলা (জাতীয়)',
    flag: '🇧🇩',
    region: 'south_asia',
    script: 'Bengali',
    defaultLayout: 'bengali_jatiya',
    availableLayouts: ['bengali_jatiya', 'bengali_probhat', 'bengali_phonetic'],
  },
  {
    id: 'bn_probhat',
    name: 'Bengali (Probhat)',
    nativeName: 'বাংলা (प्रभात)',
    flag: '🇧🇩',
    region: 'south_asia',
    script: 'Bengali',
    defaultLayout: 'bengali_probhat',
    availableLayouts: ['bengali_probhat', 'bengali_jatiya', 'bengali_phonetic'],
  },
  {
    id: 'es_es',
    name: 'Spanish',
    nativeName: 'Español',
    flag: '🇪🇸',
    region: 'popular',
    script: 'Latin',
    defaultLayout: 'spanish_qwerty',
    availableLayouts: ['spanish_qwerty'],
  },
  {
    id: 'pt_br',
    name: 'Portuguese (Brazil / Portugal)',
    nativeName: 'Português',
    flag: '🇧🇷',
    region: 'americas',
    script: 'Latin',
    defaultLayout: 'portuguese_qwerty',
    availableLayouts: ['portuguese_qwerty'],
  },
  {
    id: 'fr_fr',
    name: 'French',
    nativeName: 'Français',
    flag: '🇫🇷',
    region: 'europe',
    script: 'Latin',
    defaultLayout: 'french_azerty',
    availableLayouts: ['french_azerty'],
  },
  {
    id: 'de_de',
    name: 'German',
    nativeName: 'Deutsch',
    flag: '🇩🇪',
    region: 'europe',
    script: 'Latin',
    defaultLayout: 'german_qwertz',
    availableLayouts: ['german_qwertz'],
  },
  {
    id: 'ar_sa',
    name: 'Arabic',
    nativeName: 'العربية',
    flag: '🇸🇦',
    region: 'middle_east',
    script: 'Arabic',
    isRtl: true,
    defaultLayout: 'arabic_standard',
    availableLayouts: ['arabic_standard'],
  },
  {
    id: 'ur_pk',
    name: 'Urdu',
    nativeName: 'اردو',
    flag: '🇵🇰',
    region: 'middle_east',
    script: 'Arabic-Urdu',
    isRtl: true,
    defaultLayout: 'urdu_standard',
    availableLayouts: ['urdu_standard'],
  },
  {
    id: 'fa_ir',
    name: 'Persian / Farsi',
    nativeName: 'فارسی',
    flag: '🇮🇷',
    region: 'middle_east',
    script: 'Perso-Arabic',
    isRtl: true,
    defaultLayout: 'persian_standard',
    availableLayouts: ['persian_standard'],
  },
  {
    id: 'hi_in',
    name: 'Hindi',
    nativeName: 'हिन्दी',
    flag: '🇮🇳',
    region: 'south_asia',
    script: 'Devanagari',
    defaultLayout: 'hindi_inscript',
    availableLayouts: ['hindi_inscript', 'hindi_phonetic'],
  },
  {
    id: 'ta_in',
    name: 'Tamil',
    nativeName: 'தமிழ்',
    flag: '🇮🇳',
    region: 'south_asia',
    script: 'Tamil',
    defaultLayout: 'tamil_inscript',
    availableLayouts: ['tamil_inscript'],
  },
  {
    id: 'te_in',
    name: 'Telugu',
    nativeName: 'తెలుగు',
    flag: '🇮🇳',
    region: 'south_asia',
    script: 'Telugu',
    defaultLayout: 'telugu_inscript',
    availableLayouts: ['telugu_inscript'],
  },
  {
    id: 'ja_jp',
    name: 'Japanese',
    nativeName: '日本語',
    flag: '🇯🇵',
    region: 'asia_pacific',
    script: 'Japanese Kana/Kanji',
    defaultLayout: 'japanese_romaji',
    availableLayouts: ['japanese_romaji'],
  },
  {
    id: 'zh_cn',
    name: 'Chinese (Simplified)',
    nativeName: '简体中文',
    flag: '🇨🇳',
    region: 'asia_pacific',
    script: 'Han (Simplified)',
    defaultLayout: 'chinese_pinyin',
    availableLayouts: ['chinese_pinyin'],
  },
  {
    id: 'ko_kr',
    name: 'Korean',
    nativeName: '한국어',
    flag: '🇰🇷',
    region: 'asia_pacific',
    script: 'Hangul',
    defaultLayout: 'korean_2set',
    availableLayouts: ['korean_2set'],
  },
  {
    id: 'ru_ru',
    name: 'Russian',
    nativeName: 'Русский',
    flag: '🇷🇺',
    region: 'europe',
    script: 'Cyrillic',
    defaultLayout: 'russian_standard',
    availableLayouts: ['russian_standard'],
  },
  {
    id: 'it_it',
    name: 'Italian',
    nativeName: 'Italiano',
    flag: '🇮🇹',
    region: 'europe',
    script: 'Latin',
    defaultLayout: 'italian_qwerty',
    availableLayouts: ['italian_qwerty'],
  },
  {
    id: 'tr_tr',
    name: 'Turkish',
    nativeName: 'Türkçe',
    flag: '🇹🇷',
    region: 'middle_east',
    script: 'Latin-Turkish',
    defaultLayout: 'turkish_qwerty',
    availableLayouts: ['turkish_qwerty'],
  },
  {
    id: 'id_id',
    name: 'Indonesian',
    nativeName: 'Bahasa Indonesia',
    flag: '🇮🇩',
    region: 'asia_pacific',
    script: 'Latin',
    defaultLayout: 'indonesian_qwerty',
    availableLayouts: ['indonesian_qwerty'],
  },
  {
    id: 'vi_vn',
    name: 'Vietnamese',
    nativeName: 'Tiếng Việt',
    flag: '🇻🇳',
    region: 'asia_pacific',
    script: 'Latin-Viet',
    defaultLayout: 'vietnamese_telex',
    availableLayouts: ['vietnamese_telex'],
  },
  {
    id: 'th_th',
    name: 'Thai',
    nativeName: 'ไทย',
    flag: '🇹🇭',
    region: 'asia_pacific',
    script: 'Thai',
    defaultLayout: 'thai_kedmanee',
    availableLayouts: ['thai_kedmanee'],
  },
  {
    id: 'nl_nl',
    name: 'Dutch',
    nativeName: 'Nederlands',
    flag: '🇳🇱',
    region: 'europe',
    script: 'Latin',
    defaultLayout: 'qwerty',
    availableLayouts: ['qwerty'],
  },
  {
    id: 'pl_pl',
    name: 'Polish',
    nativeName: 'Polski',
    flag: '🇵🇱',
    region: 'europe',
    script: 'Latin',
    defaultLayout: 'polish_qwerty',
    availableLayouts: ['polish_qwerty'],
  },
  {
    id: 'sv_se',
    name: 'Swedish',
    nativeName: 'Svenska',
    flag: '🇸🇪',
    region: 'europe',
    script: 'Latin',
    defaultLayout: 'swedish_qwerty',
    availableLayouts: ['swedish_qwerty'],
  },
];

// QWERTY Layout (English US / International)
export const QWERTY_LAYOUT: KeyboardLayoutDef = {
  id: 'qwerty',
  name: 'QWERTY',
  rows: [
    {
      keys: [
        { primary: 'q', secondary: '1', popup: ['1', '¹', '¼'] },
        { primary: 'w', secondary: '2', popup: ['2', '²', '½'] },
        { primary: 'e', secondary: '3', popup: ['3', 'é', 'è', 'ê', 'ë', 'ē', '€'] },
        { primary: 'r', secondary: '4', popup: ['4', '®', '₹'] },
        { primary: 't', secondary: '5', popup: ['5', 'þ', '†'] },
        { primary: 'y', secondary: '6', popup: ['6', '¥', 'ý', 'ÿ'] },
        { primary: 'u', secondary: '7', popup: ['7', 'ú', 'ù', 'û', 'ü', 'ū'] },
        { primary: 'i', secondary: '8', popup: ['8', 'í', 'ì', 'î', 'ï', 'ī'] },
        { primary: 'o', secondary: '9', popup: ['9', 'ó', 'ò', 'ô', 'ö', 'õ', 'ø', 'œ'] },
        { primary: 'p', secondary: '0', popup: ['0', 'π', '¶'] },
      ],
    },
    {
      keys: [
        { primary: 'a', secondary: '@', popup: ['@', 'á', 'à', 'â', 'ä', 'ã', 'å', 'æ', 'ā'] },
        { primary: 's', secondary: '#', popup: ['#', 'ß', 'ś', 'š', '$', '§'] },
        { primary: 'd', secondary: '$', popup: ['$', 'ð', 'ď', 'đ'] },
        { primary: 'f', secondary: '_', popup: ['_', 'ƒ'] },
        { primary: 'g', secondary: '&', popup: ['&', 'ğ'] },
        { primary: 'h', secondary: '-', popup: ['-', '—', '–'] },
        { primary: 'j', secondary: '+', popup: ['+', '±'] },
        { primary: 'k', secondary: '(', popup: ['(', '{', '['] },
        { primary: 'l', secondary: ')', popup: [')', '}', ']', '£', 'ł'] },
      ],
    },
    {
      keys: [
        { primary: 'Shift', type: 'shift', width: 1.5 },
        { primary: 'z', secondary: '*', popup: ['*', 'ź', 'ż', 'ž'] },
        { primary: 'x', secondary: '"', popup: ['"', '«', '»', '“', '”'] },
        { primary: 'c', secondary: "'", popup: ["'", 'ç', 'ć', 'č', '¢'] },
        { primary: 'v', secondary: ':', popup: [':', '·'] },
        { primary: 'b', secondary: ';', popup: [';', '•'] },
        { primary: 'n', secondary: '!', popup: ['!', 'ñ', 'ń'] },
        { primary: 'm', secondary: '?', popup: ['?', '¿'] },
        { primary: 'Backspace', type: 'backspace', width: 1.5 },
      ],
    },
    {
      keys: [
        { primary: '?123', type: 'symbols', width: 1.48 },
        { primary: ',', popup: [',', '⚙️', '😊', "'", '"'] },
        { primary: '🌐', type: 'globe', width: 1 },
        { primary: 'Space', type: 'space', width: 4.04 },
        { primary: '.', popup: ['.', ',', '?', '!', '@', ':', ';', '/', '-', "'"] },
        { primary: 'Enter', type: 'enter', width: 1.48 },
      ],
    },
  ],
};

// Bengali Jatiya (জাতীয়) Layout
export const BENGALI_JATIYA_LAYOUT: KeyboardLayoutDef = {
  id: 'bengali_jatiya',
  name: 'বাংলা (জাতীয়)',
  rows: [
    {
      keys: [
        { primary: 'ড', secondary: 'ঢ' },
        { primary: 'ট', secondary: 'ঠ' },
        { primary: 'চ', secondary: 'ছ' },
        { primary: 'র', secondary: 'ড়' },
        { primary: 'ত', secondary: 'থ' },
        { primary: 'য়', secondary: 'য' },
        { primary: 'প', secondary: 'ফ' },
        { primary: 'খ', secondary: 'খ' },
        { primary: 'ম', secondary: 'ণ' },
        { primary: 'ভ', secondary: 'ভ' },
      ],
    },
    {
      keys: [
        { primary: 'া', secondary: 'আ' },
        { primary: 'ি', secondary: 'ই' },
        { primary: 'ী', secondary: 'ঈ' },
        { primary: 'ু', secondary: 'উ' },
        { primary: 'ূ', secondary: 'ঊ' },
        { primary: 'ে', secondary: 'এ' },
        { primary: 'ৈ', secondary: 'ঐ' },
        { primary: 'ো', secondary: 'ও' },
        { primary: 'ৌ', secondary: 'ঔ' },
      ],
    },
    {
      keys: [
        { primary: 'Shift', type: 'shift', width: 1.5 },
        { primary: 'য', secondary: 'ঝ' },
        { primary: 'শ', secondary: 'ষ' },
        { primary: 'স', secondary: 'হ' },
        { primary: 'দ', secondary: 'ধ' },
        { primary: 'ন', secondary: 'ং' },
        { primary: 'ক', secondary: 'ক' },
        { primary: 'ল', secondary: 'ঁ' },
        { primary: 'Backspace', type: 'backspace', width: 1.5 },
      ],
    },
    {
      keys: [
        { primary: '?১২৩', type: 'symbols', width: 1.48 },
        { primary: '্', popup: ['্', ','] },
        { primary: '🌐', type: 'globe', width: 1 },
        { primary: 'বাংলা (জাতীয়)', type: 'space', width: 4.04 },
        { primary: '।', popup: ['।', '.', ',', '?', '!'] },
        { primary: 'Enter', type: 'enter', width: 1.48 },
      ],
    },
  ],
};

// Bengali Probhat (प्रभात) Layout
export const BENGALI_PROBHAT_LAYOUT: KeyboardLayoutDef = {
  id: 'bengali_probhat',
  name: 'বাংলা (प्रभात)',
  rows: [
    {
      keys: [
        { primary: 'ক', secondary: 'খ' },
        { primary: 'গ', secondary: 'ঘ' },
        { primary: 'ঙ', secondary: 'ঁ' },
        { primary: 'চ', secondary: 'ছ' },
        { primary: 'জ', secondary: 'ঝ' },
        { primary: 'ঞ', secondary: 'ং' },
        { primary: 'ট', secondary: 'ঠ' },
        { primary: 'ড', secondary: 'ঢ' },
        { primary: 'ণ', secondary: 'ন' },
        { primary: 'ত', secondary: 'থ' },
      ],
    },
    {
      keys: [
        { primary: 'দ', secondary: 'ধ' },
        { primary: 'প', secondary: 'ফ' },
        { primary: 'ব', secondary: 'ভ' },
        { primary: 'ম', secondary: 'য' },
        { primary: 'র', secondary: 'ল' },
        { primary: 'শ', secondary: 'ষ' },
        { primary: 'স', secondary: 'হ' },
        { primary: 'ড়', secondary: 'ঢ়' },
        { primary: 'য়', secondary: 'ৎ' },
      ],
    },
    {
      keys: [
        { primary: 'Shift', type: 'shift', width: 1.5 },
        { primary: 'া', secondary: 'আ' },
        { primary: 'ি', secondary: 'ই' },
        { primary: 'ী', secondary: 'ঈ' },
        { primary: 'ু', secondary: 'উ' },
        { primary: 'ূ', secondary: 'ঊ' },
        { primary: 'ে', secondary: 'এ' },
        { primary: 'ো', secondary: 'ও' },
        { primary: 'Backspace', type: 'backspace', width: 1.5 },
      ],
    },
    {
      keys: [
        { primary: '?১২৩', type: 'symbols', width: 1.48 },
        { primary: '্', popup: ['্', ','] },
        { primary: '🌐', type: 'globe', width: 1 },
        { primary: 'বাংলা (प्रभात)', type: 'space', width: 4.04 },
        { primary: '।', popup: ['।', '!', '?', ','] },
        { primary: 'Enter', type: 'enter', width: 1.48 },
      ],
    },
  ],
};

// Spanish QWERTY (with Ñ)
export const SPANISH_LAYOUT: KeyboardLayoutDef = {
  id: 'spanish_qwerty',
  name: 'Español',
  rows: [
    {
      keys: [
        { primary: 'q', secondary: '1' },
        { primary: 'w', secondary: '2' },
        { primary: 'e', secondary: '3', popup: ['é', '3'] },
        { primary: 'r', secondary: '4' },
        { primary: 't', secondary: '5' },
        { primary: 'y', secondary: '6' },
        { primary: 'u', secondary: '7', popup: ['ú', 'ü', '7'] },
        { primary: 'i', secondary: '8', popup: ['í', '8'] },
        { primary: 'o', secondary: '9', popup: ['ó', '9'] },
        { primary: 'p', secondary: '0' },
      ],
    },
    {
      keys: [
        { primary: 'a', secondary: '@', popup: ['á', '@'] },
        { primary: 's', secondary: '#' },
        { primary: 'd', secondary: '$' },
        { primary: 'f', secondary: '_' },
        { primary: 'g', secondary: '&' },
        { primary: 'h', secondary: '-' },
        { primary: 'j', secondary: '+' },
        { primary: 'k', secondary: '(' },
        { primary: 'l', secondary: ')' },
        { primary: 'ñ', secondary: 'Ñ', popup: ['ñ', 'Ñ'] },
      ],
    },
    {
      keys: [
        { primary: 'Shift', type: 'shift', width: 1.3 },
        { primary: 'z', secondary: '*' },
        { primary: 'x', secondary: '"' },
        { primary: 'c', secondary: "'" },
        { primary: 'v', secondary: ':' },
        { primary: 'b', secondary: ';' },
        { primary: 'n', secondary: '!' },
        { primary: 'm', secondary: '?' },
        { primary: 'Backspace', type: 'backspace', width: 1.3 },
      ],
    },
    {
      keys: [
        { primary: '?123', type: 'symbols', width: 1.48 },
        { primary: ',', popup: [',', '¿', '¡'] },
        { primary: '🌐', type: 'globe', width: 1 },
        { primary: 'Español', type: 'space', width: 4.04 },
        { primary: '.', popup: ['.', '¿', '¡', '?', '!'] },
        { primary: 'Enter', type: 'enter', width: 1.48 },
      ],
    },
  ],
};

// Portuguese QWERTY (with Ç, ã, é)
export const PORTUGUESE_LAYOUT: KeyboardLayoutDef = {
  id: 'portuguese_qwerty',
  name: 'Português',
  rows: [
    {
      keys: [
        { primary: 'q', secondary: '1' },
        { primary: 'w', secondary: '2' },
        { primary: 'e', secondary: '3', popup: ['é', 'ê', '3'] },
        { primary: 'r', secondary: '4' },
        { primary: 't', secondary: '5' },
        { primary: 'y', secondary: '6' },
        { primary: 'u', secondary: '7', popup: ['ú', '7'] },
        { primary: 'i', secondary: '8', popup: ['í', '8'] },
        { primary: 'o', secondary: '9', popup: ['ó', 'ô', 'õ', '9'] },
        { primary: 'p', secondary: '0' },
      ],
    },
    {
      keys: [
        { primary: 'a', secondary: '@', popup: ['á', 'à', 'â', 'ã', '@'] },
        { primary: 's', secondary: '#' },
        { primary: 'd', secondary: '$' },
        { primary: 'f', secondary: '_' },
        { primary: 'g', secondary: '&' },
        { primary: 'h', secondary: '-' },
        { primary: 'j', secondary: '+' },
        { primary: 'k', secondary: '(' },
        { primary: 'l', secondary: ')' },
        { primary: 'ç', secondary: 'Ç', popup: ['ç', 'Ç'] },
      ],
    },
    {
      keys: [
        { primary: 'Shift', type: 'shift', width: 1.3 },
        { primary: 'z', secondary: '*' },
        { primary: 'x', secondary: '"' },
        { primary: 'c', secondary: "'" },
        { primary: 'v', secondary: ':' },
        { primary: 'b', secondary: ';' },
        { primary: 'n', secondary: '!' },
        { primary: 'm', secondary: '?' },
        { primary: 'Backspace', type: 'backspace', width: 1.3 },
      ],
    },
    {
      keys: [
        { primary: '?123', type: 'symbols', width: 1.48 },
        { primary: ',', popup: [',', '!'] },
        { primary: '🌐', type: 'globe', width: 1 },
        { primary: 'Português', type: 'space', width: 4.04 },
        { primary: '.', popup: ['.', ',', '?', '!'] },
        { primary: 'Enter', type: 'enter', width: 1.48 },
      ],
    },
  ],
};

// French AZERTY
export const FRENCH_LAYOUT: KeyboardLayoutDef = {
  id: 'french_azerty',
  name: 'Français',
  rows: [
    {
      keys: [
        { primary: 'a', secondary: '1', popup: ['à', 'â', 'æ', '1'] },
        { primary: 'z', secondary: '2' },
        { primary: 'e', secondary: '3', popup: ['é', 'è', 'ê', 'ë', '€', '3'] },
        { primary: 'r', secondary: '4' },
        { primary: 't', secondary: '5' },
        { primary: 'y', secondary: '6' },
        { primary: 'u', secondary: '7', popup: ['ù', 'û', 'ü', '7'] },
        { primary: 'i', secondary: '8', popup: ['î', 'ï', '8'] },
        { primary: 'o', secondary: '9', popup: ['ô', 'œ', '9'] },
        { primary: 'p', secondary: '0' },
      ],
    },
    {
      keys: [
        { primary: 'q', secondary: '@' },
        { primary: 's', secondary: '#' },
        { primary: 'd', secondary: '$' },
        { primary: 'f', secondary: '_' },
        { primary: 'g', secondary: '&' },
        { primary: 'h', secondary: '-' },
        { primary: 'j', secondary: '+' },
        { primary: 'k', secondary: '(' },
        { primary: 'l', secondary: ')' },
        { primary: 'm', secondary: '%' },
      ],
    },
    {
      keys: [
        { primary: 'Shift', type: 'shift', width: 1.3 },
        { primary: 'w', secondary: '*' },
        { primary: 'x', secondary: '"' },
        { primary: 'c', secondary: "'", popup: ['ç', '©'] },
        { primary: 'v', secondary: ':' },
        { primary: 'b', secondary: ';' },
        { primary: 'n', secondary: '!' },
        { primary: 'é', secondary: 'è', popup: ['é', 'è', 'ê', 'ë'] },
        { primary: 'Backspace', type: 'backspace', width: 1.3 },
      ],
    },
    {
      keys: [
        { primary: '?123', type: 'symbols', width: 1.48 },
        { primary: "'", popup: ["'", ',', '«', '»'] },
        { primary: '🌐', type: 'globe', width: 1 },
        { primary: 'Français', type: 'space', width: 4.04 },
        { primary: '.', popup: ['.', ',', '!', '?', ':'] },
        { primary: 'Enter', type: 'enter', width: 1.48 },
      ],
    },
  ],
};

// German QWERTZ
export const GERMAN_LAYOUT: KeyboardLayoutDef = {
  id: 'german_qwertz',
  name: 'Deutsch',
  rows: [
    {
      keys: [
        { primary: 'q', secondary: '1' },
        { primary: 'w', secondary: '2' },
        { primary: 'e', secondary: '3', popup: ['€', '3'] },
        { primary: 'r', secondary: '4' },
        { primary: 't', secondary: '5' },
        { primary: 'z', secondary: '6' },
        { primary: 'u', secondary: '7', popup: ['ü', '7'] },
        { primary: 'i', secondary: '8' },
        { primary: 'o', secondary: '9', popup: ['ö', '9'] },
        { primary: 'p', secondary: '0' },
        { primary: 'ü', secondary: 'Ü' },
      ],
    },
    {
      keys: [
        { primary: 'a', secondary: '@', popup: ['ä', 'Ä', '@'] },
        { primary: 's', secondary: '#', popup: ['ß', 's'] },
        { primary: 'd', secondary: '$' },
        { primary: 'f', secondary: '_' },
        { primary: 'g', secondary: '&' },
        { primary: 'h', secondary: '-' },
        { primary: 'j', secondary: '+' },
        { primary: 'k', secondary: '(' },
        { primary: 'l', secondary: ')' },
        { primary: 'ö', secondary: 'Ö' },
        { primary: 'ä', secondary: 'Ä' },
      ],
    },
    {
      keys: [
        { primary: 'Shift', type: 'shift', width: 1.2 },
        { primary: 'y', secondary: '*' },
        { primary: 'x', secondary: '"' },
        { primary: 'c', secondary: "'" },
        { primary: 'v', secondary: ':' },
        { primary: 'b', secondary: ';' },
        { primary: 'n', secondary: '!' },
        { primary: 'm', secondary: '?' },
        { primary: 'Backspace', type: 'backspace', width: 1.2 },
      ],
    },
    {
      keys: [
        { primary: '?123', type: 'symbols', width: 1.48 },
        { primary: ',', popup: [',', 'ß'] },
        { primary: '🌐', type: 'globe', width: 1 },
        { primary: 'Deutsch', type: 'space', width: 4.04 },
        { primary: '.', popup: ['.', ',', '?', '!'] },
        { primary: 'Enter', type: 'enter', width: 1.48 },
      ],
    },
  ],
};

// Arabic Standard (العربية)
export const ARABIC_LAYOUT: KeyboardLayoutDef = {
  id: 'arabic_standard',
  name: 'العربية',
  isRtl: true,
  rows: [
    {
      keys: [
        { primary: 'ض', secondary: '۱' },
        { primary: 'ص', secondary: '۲' },
        { primary: 'ث', secondary: '۳' },
        { primary: 'ق', secondary: '۴' },
        { primary: 'ف', secondary: '۵' },
        { primary: 'غ', secondary: '۶' },
        { primary: 'ع', secondary: '۷' },
        { primary: 'ه', secondary: '۸' },
        { primary: 'خ', secondary: '۹' },
        { primary: 'ح', secondary: '۰' },
        { primary: 'ج', secondary: ']' },
        { primary: 'د', secondary: '[' },
      ],
    },
    {
      keys: [
        { primary: 'ش', secondary: '!' },
        { primary: 'س', secondary: '@' },
        { primary: 'ي', secondary: '#' },
        { primary: 'ب', secondary: '$' },
        { primary: 'ل', secondary: '%' },
        { primary: 'ا', secondary: 'أ', popup: ['أ', 'إ', 'آ', 'ء'] },
        { primary: 'ت', secondary: '&' },
        { primary: 'ن', secondary: '*' },
        { primary: 'م', secondary: '(' },
        { primary: 'ك', secondary: ')' },
        { primary: 'ط', secondary: '"' },
      ],
    },
    {
      keys: [
        { primary: 'Shift', type: 'shift', width: 1.2 },
        { primary: 'ئ', secondary: 'ء' },
        { primary: 'ء', secondary: 'ؤ' },
        { primary: 'ؤ', secondary: 'ئ' },
        { primary: 'ر', secondary: 'ـ' },
        { primary: 'لا', secondary: 'لآ' },
        { primary: 'ى', secondary: 'ئ' },
        { primary: 'ة', secondary: 'ه' },
        { primary: 'و', secondary: '،' },
        { primary: 'ز', secondary: '.' },
        { primary: 'ظ', secondary: '؟' },
        { primary: 'Backspace', type: 'backspace', width: 1.2 },
      ],
    },
    {
      keys: [
        { primary: '؟۱۲۳', type: 'symbols', width: 1.48 },
        { primary: '،', popup: ['،', '؛', '؟'] },
        { primary: '🌐', type: 'globe', width: 1 },
        { primary: 'العربية', type: 'space', width: 4.04 },
        { primary: '.', popup: ['.', '،', '؟', '!'] },
        { primary: 'Enter', type: 'enter', width: 1.48 },
      ],
    },
  ],
};

// Urdu Standard (اردو)
export const URDU_LAYOUT: KeyboardLayoutDef = {
  id: 'urdu_standard',
  name: 'اردو',
  isRtl: true,
  rows: [
    {
      keys: [
        { primary: 'ٹ', secondary: '۱' },
        { primary: 'پ', secondary: '۲' },
        { primary: 'ت', secondary: '۳' },
        { primary: 'ب', secondary: '۴' },
        { primary: 'ج', secondary: '۵' },
        { primary: 'چ', secondary: '۶' },
        { primary: 'ح', secondary: '۷' },
        { primary: 'خ', secondary: '۸' },
        { primary: 'د', secondary: '۹' },
        { primary: 'ڈ', secondary: '۰' },
      ],
    },
    {
      keys: [
        { primary: 'ا', secondary: 'آ' },
        { primary: 'س', secondary: 'ش' },
        { primary: 'ی', secondary: 'ے' },
        { primary: 'ن', secondary: 'ں' },
        { primary: 'م', secondary: 'ل' },
        { primary: 'ک', secondary: 'گ' },
        { primary: 'ر', secondary: 'ڑ' },
        { primary: 'و', secondary: 'ؤ' },
        { primary: 'ہ', secondary: 'ھ' },
      ],
    },
    {
      keys: [
        { primary: 'Shift', type: 'shift', width: 1.3 },
        { primary: 'ز', secondary: 'ژ' },
        { primary: 'ف', secondary: 'ق' },
        { primary: 'ص', secondary: 'ض' },
        { primary: 'ط', secondary: 'ظ' },
        { primary: 'ع', secondary: 'غ' },
        { primary: 'ث', secondary: 'ذ' },
        { primary: 'Backspace', type: 'backspace', width: 1.3 },
      ],
    },
    {
      keys: [
        { primary: '؟۱۲۳', type: 'symbols', width: 1.48 },
        { primary: '،' },
        { primary: '🌐', type: 'globe', width: 1 },
        { primary: 'اردو', type: 'space', width: 4.04 },
        { primary: '۔' },
        { primary: 'Enter', type: 'enter', width: 1.48 },
      ],
    },
  ],
};

// Hindi InScript (हिन्दी)
export const HINDI_LAYOUT: KeyboardLayoutDef = {
  id: 'hindi_inscript',
  name: 'हिन्दी',
  rows: [
    {
      keys: [
        { primary: 'ौ', secondary: '१' },
        { primary: 'ै', secondary: '२' },
        { primary: 'ा', secondary: '३' },
        { primary: 'ी', secondary: '४' },
        { primary: 'ू', secondary: '५' },
        { primary: 'ब', secondary: '६' },
        { primary: 'ह', secondary: '७' },
        { primary: 'ग', secondary: '८' },
        { primary: 'द', secondary: '९' },
        { primary: 'ज', secondary: '०' },
        { primary: 'ड', secondary: 'ऋ' },
      ],
    },
    {
      keys: [
        { primary: 'ो', secondary: 'औ' },
        { primary: 'े', secondary: 'ऐ' },
        { primary: '्', secondary: 'आ' },
        { primary: 'ि', secondary: 'इ' },
        { primary: 'ु', secondary: 'उ' },
        { primary: 'प', secondary: 'फ' },
        { primary: 'र', secondary: 'ल' },
        { primary: 'क', secondary: 'ख' },
        { primary: 'त', secondary: 'थ' },
        { primary: 'च', secondary: 'छ' },
        { primary: 'ट', secondary: 'ठ' },
      ],
    },
    {
      keys: [
        { primary: 'Shift', type: 'shift', width: 1.3 },
        { primary: 'ं', secondary: 'ँ' },
        { primary: 'म', secondary: 'ण' },
        { primary: 'न', secondary: 'ङ' },
        { primary: 'व', secondary: 'भ' },
        { primary: 'ल', secondary: 'ळ' },
        { primary: 'स', secondary: 'श', popup: ['स', 'श', 'ष'] },
        { primary: 'य', secondary: 'ज्ञ' },
        { primary: 'Backspace', type: 'backspace', width: 1.3 },
      ],
    },
    {
      keys: [
        { primary: '?१२३', type: 'symbols', width: 1.48 },
        { primary: '्', popup: ['्', ','] },
        { primary: '🌐', type: 'globe', width: 1 },
        { primary: 'हिन्दी', type: 'space', width: 4.04 },
        { primary: '।', popup: ['।', '.', '?', '!'] },
        { primary: 'Enter', type: 'enter', width: 1.48 },
      ],
    },
  ],
};

// Russian Standard (Русский)
export const RUSSIAN_LAYOUT: KeyboardLayoutDef = {
  id: 'russian_standard',
  name: 'Русский',
  rows: [
    {
      keys: [
        { primary: 'й', secondary: '1' },
        { primary: 'ц', secondary: '2' },
        { primary: 'у', secondary: '3' },
        { primary: 'к', secondary: '4' },
        { primary: 'е', secondary: '5', popup: ['е', 'ё'] },
        { primary: 'н', secondary: '6' },
        { primary: 'г', secondary: '7' },
        { primary: 'ш', secondary: '8' },
        { primary: 'щ', secondary: '9' },
        { primary: 'з', secondary: '0' },
        { primary: 'х', secondary: '%' },
        { primary: 'ъ', secondary: '=' },
      ],
    },
    {
      keys: [
        { primary: 'ф', secondary: '@' },
        { primary: 'ы', secondary: '#' },
        { primary: 'в', secondary: '$' },
        { primary: 'а', secondary: '_' },
        { primary: 'п', secondary: '&' },
        { primary: 'р', secondary: '-' },
        { primary: 'о', secondary: '+' },
        { primary: 'л', secondary: '(' },
        { primary: 'д', secondary: ')' },
        { primary: 'ж', secondary: '"' },
        { primary: 'э', secondary: "'" },
      ],
    },
    {
      keys: [
        { primary: 'Shift', type: 'shift', width: 1.2 },
        { primary: 'я', secondary: '*' },
        { primary: 'ч', secondary: '/' },
        { primary: 'с', secondary: ':' },
        { primary: 'м', secondary: ';' },
        { primary: 'и', secondary: '!' },
        { primary: 'т', secondary: '?' },
        { primary: 'ь', secondary: 'ъ' },
        { primary: 'б', secondary: ',' },
        { primary: 'ю', secondary: '.' },
        { primary: 'Backspace', type: 'backspace', width: 1.2 },
      ],
    },
    {
      keys: [
        { primary: '?123', type: 'symbols', width: 1.48 },
        { primary: ',' },
        { primary: '🌐', type: 'globe', width: 1 },
        { primary: 'Русский', type: 'space', width: 4.04 },
        { primary: '.' },
        { primary: 'Enter', type: 'enter', width: 1.48 },
      ],
    },
  ],
};

// Korean 2-Set Hangul (한국어)
export const KOREAN_LAYOUT: KeyboardLayoutDef = {
  id: 'korean_2set',
  name: '한국어 (두벌식)',
  rows: [
    {
      keys: [
        { primary: 'ㅂ', secondary: 'ㅃ' },
        { primary: 'ㅈ', secondary: 'ㅉ' },
        { primary: 'ㄷ', secondary: 'ㄸ' },
        { primary: 'ㄱ', secondary: 'ㄲ' },
        { primary: 'ㅅ', secondary: 'ㅆ' },
        { primary: 'ㅛ', secondary: '1' },
        { primary: 'ㅕ', secondary: '2' },
        { primary: 'ㅑ', secondary: '3' },
        { primary: 'ㅐ', secondary: 'ㅒ' },
        { primary: 'ㅔ', secondary: 'ㅖ' },
      ],
    },
    {
      keys: [
        { primary: 'ㅁ', secondary: '4' },
        { primary: 'ㄴ', secondary: '5' },
        { primary: 'ㅇ', secondary: '6' },
        { primary: 'ㄹ', secondary: '7' },
        { primary: 'ㅎ', secondary: '8' },
        { primary: 'ㅗ', secondary: '9' },
        { primary: 'ㅓ', secondary: '0' },
        { primary: 'ㅏ', secondary: '@' },
        { primary: 'ㅣ', secondary: '#' },
      ],
    },
    {
      keys: [
        { primary: 'Shift', type: 'shift', width: 1.4 },
        { primary: 'ㅋ', secondary: '*' },
        { primary: 'ㅌ', secondary: '-' },
        { primary: 'ㅊ', secondary: '+' },
        { primary: 'ㅍ', secondary: '=' },
        { primary: 'ㅠ', secondary: '(' },
        { primary: 'ㅜ', secondary: ')' },
        { primary: 'ㅡ', secondary: '!' },
        { primary: 'Backspace', type: 'backspace', width: 1.4 },
      ],
    },
    {
      keys: [
        { primary: '?123', type: 'symbols', width: 1.48 },
        { primary: ',', popup: [',', '~'] },
        { primary: '🌐', type: 'globe', width: 1 },
        { primary: '한국어', type: 'space', width: 4.04 },
        { primary: '.', popup: ['.', '?', '!'] },
        { primary: 'Enter', type: 'enter', width: 1.48 },
      ],
    },
  ],
};

// Japanese Romaji & Hiragana (日本語)
export const JAPANESE_LAYOUT: KeyboardLayoutDef = {
  id: 'japanese_romaji',
  name: '日本語 (Romaji)',
  rows: [
    {
      keys: [
        { primary: 'q', secondary: '1' },
        { primary: 'w', secondary: '2' },
        { primary: 'e', secondary: '3' },
        { primary: 'r', secondary: '4' },
        { primary: 't', secondary: '5' },
        { primary: 'y', secondary: '6' },
        { primary: 'u', secondary: '7' },
        { primary: 'i', secondary: '8' },
        { primary: 'o', secondary: '9' },
        { primary: 'p', secondary: '0' },
      ],
    },
    {
      keys: [
        { primary: 'a', secondary: '@' },
        { primary: 's', secondary: '#' },
        { primary: 'd', secondary: '$' },
        { primary: 'f', secondary: '_' },
        { primary: 'g', secondary: '&' },
        { primary: 'h', secondary: '-' },
        { primary: 'j', secondary: '+' },
        { primary: 'k', secondary: '(' },
        { primary: 'l', secondary: ')' },
      ],
    },
    {
      keys: [
        { primary: 'Shift', type: 'shift', width: 1.5 },
        { primary: 'z', secondary: '*' },
        { primary: 'x', secondary: '"' },
        { primary: 'c', secondary: "'" },
        { primary: 'v', secondary: ':' },
        { primary: 'b', secondary: ';' },
        { primary: 'n', secondary: '!' },
        { primary: 'm', secondary: '?' },
        { primary: 'Backspace', type: 'backspace', width: 1.5 },
      ],
    },
    {
      keys: [
        { primary: '?123', type: 'symbols', width: 1.48 },
        { primary: '、', popup: ['、', ','] },
        { primary: '🌐', type: 'globe', width: 1 },
        { primary: '日本語', type: 'space', width: 4.04 },
        { primary: '。', popup: ['。', '.'] },
        { primary: 'Enter', type: 'enter', width: 1.48 },
      ],
    },
  ],
};

// Chinese Pinyin (中文)
export const CHINESE_LAYOUT: KeyboardLayoutDef = {
  id: 'chinese_pinyin',
  name: '中文 (Pinyin)',
  rows: [
    {
      keys: [
        { primary: 'q', secondary: '1' },
        { primary: 'w', secondary: '2' },
        { primary: 'e', secondary: '3' },
        { primary: 'r', secondary: '4' },
        { primary: 't', secondary: '5' },
        { primary: 'y', secondary: '6' },
        { primary: 'u', secondary: '7' },
        { primary: 'i', secondary: '8' },
        { primary: 'o', secondary: '9' },
        { primary: 'p', secondary: '0' },
      ],
    },
    {
      keys: [
        { primary: 'a', secondary: '@' },
        { primary: 's', secondary: '#' },
        { primary: 'd', secondary: '$' },
        { primary: 'f', secondary: '_' },
        { primary: 'g', secondary: '&' },
        { primary: 'h', secondary: '-' },
        { primary: 'j', secondary: '+' },
        { primary: 'k', secondary: '(' },
        { primary: 'l', secondary: ')' },
      ],
    },
    {
      keys: [
        { primary: 'Shift', type: 'shift', width: 1.5 },
        { primary: 'z', secondary: '*' },
        { primary: 'x', secondary: '"' },
        { primary: 'c', secondary: "'" },
        { primary: 'v', secondary: 'ü' },
        { primary: 'b', secondary: ';' },
        { primary: 'n', secondary: '!' },
        { primary: 'm', secondary: '?' },
        { primary: 'Backspace', type: 'backspace', width: 1.5 },
      ],
    },
    {
      keys: [
        { primary: '?123', type: 'symbols', width: 1.48 },
        { primary: '，', popup: ['，', ','] },
        { primary: '🌐', type: 'globe', width: 1 },
        { primary: '中文', type: 'space', width: 4.04 },
        { primary: '。', popup: ['。', '.'] },
        { primary: 'Enter', type: 'enter', width: 1.48 },
      ],
    },
  ],
};

// Turkish QWERTY (Türkçe)
export const TURKISH_LAYOUT: KeyboardLayoutDef = {
  id: 'turkish_qwerty',
  name: 'Türkçe',
  rows: [
    {
      keys: [
        { primary: 'q', secondary: '1' },
        { primary: 'w', secondary: '2' },
        { primary: 'e', secondary: '3' },
        { primary: 'r', secondary: '4' },
        { primary: 't', secondary: '5' },
        { primary: 'y', secondary: '6' },
        { primary: 'u', secondary: '7' },
        { primary: 'ı', secondary: '8', popup: ['ı', 'I', 'i', 'İ'] },
        { primary: 'o', secondary: '9', popup: ['o', 'ö'] },
        { primary: 'p', secondary: '0' },
        { primary: 'ğ', secondary: 'Ğ' },
        { primary: 'ü', secondary: 'Ü' },
      ],
    },
    {
      keys: [
        { primary: 'a', secondary: '@' },
        { primary: 's', secondary: '#', popup: ['s', 'ş'] },
        { primary: 'd', secondary: '$' },
        { primary: 'f', secondary: '_' },
        { primary: 'g', secondary: '&' },
        { primary: 'h', secondary: '-' },
        { primary: 'j', secondary: '+' },
        { primary: 'k', secondary: '(' },
        { primary: 'l', secondary: ')' },
        { primary: 'ş', secondary: 'Ş' },
        { primary: 'i', secondary: 'İ' },
      ],
    },
    {
      keys: [
        { primary: 'Shift', type: 'shift', width: 1.2 },
        { primary: 'z', secondary: '*' },
        { primary: 'x', secondary: '"' },
        { primary: 'c', secondary: "'", popup: ['c', 'ç'] },
        { primary: 'v', secondary: ':' },
        { primary: 'b', secondary: ';' },
        { primary: 'n', secondary: '!' },
        { primary: 'm', secondary: '?' },
        { primary: 'ö', secondary: 'Ö' },
        { primary: 'ç', secondary: 'Ç' },
        { primary: 'Backspace', type: 'backspace', width: 1.2 },
      ],
    },
    {
      keys: [
        { primary: '?123', type: 'symbols', width: 1.48 },
        { primary: ',', popup: [',', '₺'] },
        { primary: '🌐', type: 'globe', width: 1 },
        { primary: 'Türkçe', type: 'space', width: 4.04 },
        { primary: '.', popup: ['.', ',', '?', '!'] },
        { primary: 'Enter', type: 'enter', width: 1.48 },
      ],
    },
  ],
};

// Vietnamese Telex (Tiếng Việt)
export const VIETNAMESE_LAYOUT: KeyboardLayoutDef = {
  id: 'vietnamese_telex',
  name: 'Tiếng Việt',
  rows: [
    {
      keys: [
        { primary: 'q', secondary: '1' },
        { primary: 'w', secondary: '2', popup: ['w', 'ư', 'ơ'] },
        { primary: 'e', secondary: '3', popup: ['e', 'ê', 'é', 'è', 'ẻ', 'ẽ', 'ẹ'] },
        { primary: 'r', secondary: '4' },
        { primary: 't', secondary: '5' },
        { primary: 'y', secondary: '6', popup: ['y', 'ý', 'ỳ', 'ỷ', 'ỹ', 'ỵ'] },
        { primary: 'u', secondary: '7', popup: ['u', 'ư', 'ú', 'ù', 'ủ', 'ũ', 'ụ'] },
        { primary: 'i', secondary: '8', popup: ['i', 'í', 'ì', 'ỉ', 'ĩ', 'ị'] },
        { primary: 'o', secondary: '9', popup: ['o', 'ô', 'ơ', 'ó', 'ò', 'ỏ', 'õ', 'ọ'] },
        { primary: 'p', secondary: '0' },
      ],
    },
    {
      keys: [
        { primary: 'a', secondary: '@', popup: ['a', 'ă', 'â', 'á', 'à', 'ả', 'ã', 'ạ'] },
        { primary: 's', secondary: '#' },
        { primary: 'd', secondary: '$', popup: ['d', 'đ'] },
        { primary: 'f', secondary: '_' },
        { primary: 'g', secondary: '&' },
        { primary: 'h', secondary: '-' },
        { primary: 'j', secondary: '+' },
        { primary: 'k', secondary: '(' },
        { primary: 'l', secondary: ')' },
      ],
    },
    {
      keys: [
        { primary: 'Shift', type: 'shift', width: 1.5 },
        { primary: 'z', secondary: '*' },
        { primary: 'x', secondary: '"' },
        { primary: 'c', secondary: "'" },
        { primary: 'v', secondary: ':' },
        { primary: 'b', secondary: ';' },
        { primary: 'n', secondary: '!' },
        { primary: 'm', secondary: '?' },
        { primary: 'Backspace', type: 'backspace', width: 1.5 },
      ],
    },
    {
      keys: [
        { primary: '?123', type: 'symbols', width: 1.48 },
        { primary: ',', popup: [',', '₫'] },
        { primary: '🌐', type: 'globe', width: 1 },
        { primary: 'Tiếng Việt', type: 'space', width: 4.04 },
        { primary: '.', popup: ['.', ',', '?', '!'] },
        { primary: 'Enter', type: 'enter', width: 1.48 },
      ],
    },
  ],
};

// Numeric & Common Symbols (?123)
export const SYMBOLS_1_LAYOUT: KeyboardLayoutDef = {
  id: 'symbols_1',
  name: '?123',
  rows: [
    {
      keys: [
        { primary: '1', secondary: '¹' },
        { primary: '2', secondary: '²' },
        { primary: '3', secondary: '³' },
        { primary: '4', secondary: '⁴' },
        { primary: '5', secondary: '⁵' },
        { primary: '6', secondary: '⁶' },
        { primary: '7', secondary: '⁷' },
        { primary: '8', secondary: '⁸' },
        { primary: '9', secondary: '⁹' },
        { primary: '0', secondary: '⁰' },
      ],
    },
    {
      keys: [
        { primary: '@' },
        { primary: '#' },
        { primary: '$', popup: ['$', '€', '£', '¥', '₹', '৳', '¢'] },
        { primary: '_' },
        { primary: '&' },
        { primary: '-' },
        { primary: '+' },
        { primary: '(' },
        { primary: ')' },
        { primary: '/' },
      ],
    },
    {
      keys: [
        { primary: '=\\<', secondary: '2/2', width: 1.4, actionId: 'switch_symbols_2' },
        { primary: '*' },
        { primary: '"', popup: ['"', '«', '»', '“', '”'] },
        { primary: "'" },
        { primary: ':' },
        { primary: ';' },
        { primary: '!' },
        { primary: '?' },
        { primary: 'Backspace', type: 'backspace', width: 1.4 },
      ],
    },
    {
      keys: [
        { primary: 'ABC', type: 'char', width: 1.48, actionId: 'switch_letters' },
        { primary: ',' },
        { primary: '🌐', type: 'globe', width: 1 },
        { primary: 'Space', type: 'space', width: 4.04 },
        { primary: '.' },
        { primary: 'Enter', type: 'enter', width: 1.48 },
      ],
    },
  ],
};

// Math & Extended Symbols (=\<)
export const SYMBOLS_2_LAYOUT: KeyboardLayoutDef = {
  id: 'symbols_2',
  name: '=\\<',
  rows: [
    {
      keys: [
        { primary: '~' },
        { primary: '`' },
        { primary: '|' },
        { primary: '•' },
        { primary: '√' },
        { primary: 'π' },
        { primary: '÷' },
        { primary: '×' },
        { primary: '¶' },
        { primary: '∆' },
      ],
    },
    {
      keys: [
        { primary: '£' },
        { primary: '€' },
        { primary: '¥' },
        { primary: '৳', popup: ['৳', '₹', '$'] },
        { primary: '¢' },
        { primary: '^' },
        { primary: '°' },
        { primary: '=' },
        { primary: '{' },
        { primary: '}' },
      ],
    },
    {
      keys: [
        { primary: '?123', secondary: '1/2', width: 1.4, actionId: 'switch_symbols_1' },
        { primary: '\\' },
        { primary: '©' },
        { primary: '®' },
        { primary: '™' },
        { primary: '℅' },
        { primary: '[' },
        { primary: ']' },
        { primary: 'Backspace', type: 'backspace', width: 1.4 },
      ],
    },
    {
      keys: [
        { primary: 'ABC', type: 'char', width: 1.4, actionId: 'switch_letters' },
        { primary: '<' },
        { primary: '>' },
        { primary: 'Space', type: 'space', width: 3.4 },
        { primary: '¡' },
        { primary: '¿' },
        { primary: 'Enter', type: 'enter', width: 1.4 },
      ],
    },
  ],
};

export const NUMBER_ROW_KEYS = [
  { primary: '1', secondary: '¹' },
  { primary: '2', secondary: '²' },
  { primary: '3', secondary: '³' },
  { primary: '4', secondary: '⁴' },
  { primary: '5', secondary: '⁵' },
  { primary: '6', secondary: '⁶' },
  { primary: '7', secondary: '⁷' },
  { primary: '8', secondary: '⁸' },
  { primary: '9', secondary: '⁹' },
  { primary: '0', secondary: '⁰' },
];

export function getLayoutForLanguage(langId: string, layoutVariant?: string): KeyboardLayoutDef {
  switch (langId) {
    case 'bn_phonetic':
      return QWERTY_LAYOUT; // Phonetic uses QWERTY physical keys + Avro transliteration engine
    case 'bn_jatiya':
      return BENGALI_JATIYA_LAYOUT;
    case 'bn_probhat':
      return BENGALI_PROBHAT_LAYOUT;
    case 'es_es':
      return SPANISH_LAYOUT;
    case 'pt_br':
      return PORTUGUESE_LAYOUT;
    case 'fr_fr':
      return FRENCH_LAYOUT;
    case 'de_de':
      return GERMAN_LAYOUT;
    case 'ar_sa':
    case 'fa_ir':
      return ARABIC_LAYOUT;
    case 'ur_pk':
      return URDU_LAYOUT;
    case 'hi_in':
    case 'ta_in':
    case 'te_in':
      return HINDI_LAYOUT;
    case 'ru_ru':
      return RUSSIAN_LAYOUT;
    case 'ko_kr':
      return KOREAN_LAYOUT;
    case 'ja_jp':
      return JAPANESE_LAYOUT;
    case 'zh_cn':
      return CHINESE_LAYOUT;
    case 'tr_tr':
      return TURKISH_LAYOUT;
    case 'vi_vn':
      return VIETNAMESE_LAYOUT;
    case 'it_it':
    case 'id_id':
    case 'th_th':
    case 'nl_nl':
    case 'pl_pl':
    case 'sv_se':
    case 'en_gb':
    case 'en_us':
    default:
      return QWERTY_LAYOUT;
  }
}
