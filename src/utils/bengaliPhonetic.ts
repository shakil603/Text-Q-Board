/**
 * Comprehensive Bengali Phonetic Transliteration Engine (Avro-compatible algorithm)
 * Translates romanized text like "amar", "bangla", "dhonnobad" into accurate Bangla script
 */

interface PhoneticRule {
  pattern: RegExp;
  replace: string;
}

const BENGALI_COMMON_WORDS: Record<string, string[]> = {
  'amar': ['আমার', 'আমারি', 'আমারো'],
  'tomar': ['তোমার', 'তোমারি', 'তোমারো'],
  'ami': ['আমি', 'আমীন'],
  'tumi': ['তুমি', 'তুমুল'],
  'apni': ['আপনি', 'আপনার'],
  'bangla': ['বাংলা', 'বাঙ্গালী', 'বাংলাদেশ'],
  'bangladesh': ['বাংলাদেশ', 'বাংলাদেশী', 'বাংলাদেশে'],
  'dhonnobad': ['ধন্যবাদ', 'ধন্যবাদান্তে'],
  'kemon': ['কেমন'],
  'acho': ['আছো', 'আছেন'],
  'achhen': ['আছেন'],
  'achen': ['আছেন'],
  'bhalo': ['ভালো', 'ভালোই', 'ভালোবেসে'],
  'valobasha': ['ভালোবাসা', 'ভালো'],
  'shonar': ['সোনার', 'শোনার'],
  'shona': ['সোনা', 'শোনা'],
  'shob': ['সব', 'শব'],
  'sob': ['সব', 'শব'],
  'desh': ['দেশ', 'দেশের', 'দেশে'],
  'onek': ['অনেক', 'অনেকে', 'অনেকের'],
  'khub': ['খুব', 'খুবি'],
  'shundor': ['সুন্দর', 'সুন্দরী'],
  'bondhu': ['বন্ধু', 'বন্ধুরা', 'বন্ধুত্ব'],
  'bhai': ['ভাই', 'ভাইয়া', 'ভাইরে'],
  'apu': ['আপু', 'আপুনি'],
  'kalke': ['কালকে', 'কাল'],
  'ajke': ['আজকে', 'আজ'],
  'shokal': ['সকাল', 'সকালে'],
  'rat': ['রাত', 'রাত্রি'],
  'khabar': ['খাবার', 'খাব'],
  'pani': ['পানি', 'পানির'],
  'boi': ['বই', 'বইটি', 'বইপত্র'],
  'gaan': ['গান', 'গানের'],
  'mon': ['মন', 'মনের', 'মনে'],
  'kichu': ['কিছু', 'কিছুই', 'কিছুটা'],
  'ki': ['কী', 'কি'],
  'keno': ['কেন', 'কেনো'],
  'kothay': ['কোথায়', 'কোথাও'],
  'kokhon': ['কখন', 'কখনো'],
  'kirokom': ['কিরকম', 'কী রকম'],
  'kolkata': ['কলকাতা', 'কলিকাতা'],
  'dhaka': ['ঢাকা', 'ঢাকায়'],
  'chittagong': ['চট্টগ্রাম'],
  'sylhet': ['সিলেট'],
  'khulna': ['খুলনা'],
  'rajshahi': ['রাজশাহী'],
  'barishal': ['বরিশাল'],
  'inshallah': ['ইনশাআল্লাহ', 'ইনশা আল্লাহ'],
  'mashallah': ['মাশাআল্লাহ', 'মাশা আল্লাহ'],
  'subhanallah': ['সুবহানাল্লাহ'],
  'alhamdulillah': ['আলহামদুলিল্লাহ'],
  'namaz': ['নামাজ', 'নামায'],
  'roza': ['রোজা', 'রোযা'],
  'eid': ['ঈদ', 'ঈদের'],
  'mubarak': ['মুবারক', 'মোবারক'],
  'shuvo': ['শুভ', 'শুভেচ্ছা'],
  'shokal_bela': ['সকালবেলা'],
  'bhalobashi': ['ভালোবাসি'],
  'tahole': ['তাহলে', 'তাহলেই'],
  'ekhon': ['এখন', 'এখনই'],
  'jabo': ['যাব', 'যাবো'],
  'korbo': ['করব', 'করবো'],
  'dekhi': ['দেখি', 'দেখবো'],
  'shunun': ['শুনুন', 'শুনবেন'],
  'bolun': ['বলুন', 'বলবেন'],
};

// Patterns for phonetics
const rules: PhoneticRule[] = [
  // Special dual vowels
  { pattern: /oi/gi, replace: 'ঐ' },
  { pattern: /ou/gi, replace: 'ঔ' },
  { pattern: /oo/gi, replace: 'উ' },
  { pattern: /ee/gi, replace: 'ঈ' },

  // Conjuncts
  { pattern: /kkh/gi, replace: 'ক্ষ' },
  { pattern: /kkhN/gi, replace: 'ক্ষ্ণ' },
  { pattern: /kkhm/gi, replace: 'ক্ষ্ম' },
  { pattern: /ggh/gi, replace: 'জ্ঞ' },
  { pattern: /ngk/gi, replace: 'ঙ্ক' },
  { pattern: /ngkh/gi, replace: 'ঙ্খ' },
  { pattern: /ngg/gi, replace: 'ঙ্গ' },
  { pattern: /nggh/gi, replace: 'ঙ্ঘ' },
  { pattern: /cch/gi, replace: 'চ্ছ' },
  { pattern: /cchh/gi, replace: 'চ্ছ্ব' },
  { pattern: /jjh/gi, replace: 'জ্ঝ' },
  { pattern: /nch/gi, replace: 'ঞ্চ' },
  { pattern: /nchh/gi, replace: 'ঞ্ছ' },
  { pattern: /nj/gi, replace: 'ঞ্জ' },
  { pattern: /njh/gi, replace: 'ঞ্ঝ' },
  { pattern: /TTh/gi, replace: 'ট্হ' },
  { pattern: /DDh/gi, replace: 'ড্হ' },
  { pattern: /nT/gi, replace: 'ন্ট' },
  { pattern: /nTh/gi, replace: 'ন্ঠ' },
  { pattern: /nD/gi, replace: 'ন্ড' },
  { pattern: /nDh/gi, replace: 'ন্ঢ' },
  { pattern: /tth/gi, replace: 'ত্থ' },
  { pattern: /ttr/gi, replace: 'ত্র' },
  { pattern: /nt/gi, replace: 'ন্ত' },
  { pattern: /nth/gi, replace: 'ন্থ' },
  { pattern: /nd/gi, replace: 'ন্দ' },
  { pattern: /ndh/gi, replace: 'ন্ধ' },
  { pattern: /bbh/gi, replace: 'ব্ভ' },
  { pattern: /mp/gi, replace: 'ম্প' },
  { pattern: /mph/gi, replace: 'ম্ফ' },
  { pattern: /mb/gi, replace: 'ম্ব' },
  { pattern: /mbh/gi, replace: 'ম্ভ' },
  { pattern: /mm/gi, replace: 'ম্ম' },
  { pattern: /shch/gi, replace: 'শ্চ' },
  { pattern: /shT/gi, replace: 'ষ্ট' },
  { pattern: /shTh/gi, replace: 'ষ্ঠ' },
  { pattern: /shk/gi, replace: 'স্ক' },
  { pattern: /sT/gi, replace: 'স্ট' },
  { pattern: /st/gi, replace: 'স্ত' },
  { pattern: /sth/gi, replace: 'স্থ' },
  { pattern: /sp/gi, replace: 'স্প' },
  { pattern: /sph/gi, replace: 'স্ফ' },
  { pattern: /sn/gi, replace: 'স্ন' },
  { pattern: /sm/gi, replace: 'স্ম' },
  { pattern: /hl/gi, replace: 'হ্ল' },
  { pattern: /hn/gi, replace: 'হ্ন' },
  { pattern: /hm/gi, replace: 'হ্ম' },

  // Consonants
  { pattern: /kh/gi, replace: 'খ' },
  { pattern: /gh/gi, replace: 'ঘ' },
  { pattern: /ng/gi, replace: 'ঙ' },
  { pattern: /ch/gi, replace: 'চ' },
  { pattern: /chh/gi, replace: 'ছ' },
  { pattern: /jh/gi, replace: 'ঝ' },
  { pattern: /Th/gi, replace: 'ঠ' },
  { pattern: /Dh/gi, replace: 'ঢ' },
  { pattern: /th/gi, replace: 'থ' },
  { pattern: /dh/gi, replace: 'ধ' },
  { pattern: /ph/gi, replace: 'ফ' },
  { pattern: /bh/gi, replace: 'ভ' },
  { pattern: /sh/gi, replace: 'শ' },
  { pattern: /Sh/gi, replace: 'ষ' },
  { pattern: /Rh/gi, replace: 'ঢ়' },
  { pattern: /R/g, replace: 'ড়' },
  { pattern: /r/g, replace: 'র' },
  { pattern: /k/gi, replace: 'ক' },
  { pattern: /g/gi, replace: 'গ' },
  { pattern: /j/gi, replace: 'জ' },
  { pattern: /z/gi, replace: 'য' },
  { pattern: /T/g, replace: 'ট' },
  { pattern: /D/g, replace: 'ড' },
  { pattern: /N/g, replace: 'ণ' },
  { pattern: /t/g, replace: 'ত' },
  { pattern: /d/g, replace: 'দ' },
  { pattern: /n/g, replace: 'ন' },
  { pattern: /p/gi, replace: 'প' },
  { pattern: /f/gi, replace: 'ফ' },
  { pattern: /b/gi, replace: 'ব' },
  { pattern: /v/gi, replace: 'ভ' },
  { pattern: /m/gi, replace: 'ম' },
  { pattern: /l/gi, replace: 'ল' },
  { pattern: /s/gi, replace: 'স' },
  { pattern: /h/gi, replace: 'হ' },
  { pattern: /y/gi, replace: 'য়' },
  { pattern: /w/gi, replace: 'ওয়' },

  // Vowels
  { pattern: /aa/gi, replace: 'আ' },
  { pattern: /a/gi, replace: 'অ' },
  { pattern: /i/gi, replace: 'ই' },
  { pattern: /I/g, replace: 'ঈ' },
  { pattern: /u/gi, replace: 'উ' },
  { pattern: /U/g, replace: 'ঊ' },
  { pattern: /e/gi, replace: 'এ' },
  { pattern: /o/gi, replace: 'ও' },
  { pattern: /O/g, replace: 'ঔ' },
];

// Helper to convert raw roman string to phonetic bengali
export function transliterateBengali(input: string): string[] {
  if (!input) return [];
  const cleanInput = input.trim().toLowerCase();

  // If in custom dictionary, prioritize dictionary candidates
  if (BENGALI_COMMON_WORDS[cleanInput]) {
    return BENGALI_COMMON_WORDS[cleanInput];
  }

  // Generate algorithmic transliteration
  let result = input;
  for (const rule of rules) {
    result = result.replace(rule.pattern, rule.replace);
  }

  // Convert post-consonant vowels to Kars
  result = result
    .replace(/([ক-হড়-য়])অ/g, '$1')
    .replace(/([ক-হড়-য়])আ/g, '$1া')
    .replace(/([ক-হড়-য়])ই/g, '$1ি')
    .replace(/([ক-হড়-য়])ঈ/g, '$1ী')
    .replace(/([ক-হড়-য়])উ/g, '$1ু')
    .replace(/([ক-হড়-য়])ঊ/g, '$1ূ')
    .replace(/([ক-হড়-য়])ঋ/g, '$1ৃ')
    .replace(/([ক-হড়-য়])এ/g, '$1ে')
    .replace(/([ক-হড়-য়])ঐ/g, '$1ৈ')
    .replace(/([ক-হড়-য়])ও/g, '$1ো')
    .replace(/([ক-হড়-য়])ঔ/g, '$1ৌ');

  const candidates: string[] = [result];
  return candidates;
}
