/**
 * Multi-language dictionary, predictive text, next-word predictor, and glide-typing word path matcher
 */

export interface WordSuggestion {
  text: string;
  source: 'autocorrect' | 'prediction' | 'phonetic' | 'shortcut';
  confidence: number;
}

const COMMON_ENGLISH_WORDS = [
  'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'I',
  'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at',
  'this', 'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she',
  'or', 'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their', 'what',
  'so', 'up', 'out', 'if', 'about', 'who', 'get', 'which', 'go', 'me',
  'when', 'make', 'can', 'like', 'time', 'no', 'just', 'him', 'know', 'take',
  'people', 'into', 'year', 'your', 'good', 'some', 'could', 'them', 'see', 'other',
  'than', 'then', 'now', 'look', 'only', 'come', 'its', 'over', 'think', 'also',
  'back', 'after', 'use', 'two', 'how', 'our', 'work', 'first', 'well', 'way',
  'even', 'new', 'want', 'because', 'any', 'these', 'give', 'day', 'most', 'us',
  'great', 'hello', 'keyboard', 'android', 'google', 'gboard', 'message', 'friend',
  'thanks', 'thank', 'welcome', 'please', 'love', 'happy', 'today', 'tomorrow',
  'tonight', 'beautiful', 'awesome', 'amazing', 'perfect', 'together', 'always',
  'never', 'morning', 'night', 'night', 'coffee', 'meeting', 'phone', 'quick',
  'question', 'problem', 'solution', 'project', 'music', 'water', 'world', 'school'
];

const NEXT_WORD_MAP: Record<string, string[]> = {
  'how': ['are', 'is', 'was', 'about', 'can', 'do'],
  'how are': ['you', 'things', 'we', 'they'],
  'thank': ['you', 'so', 'much', 'god'],
  'i': ['am', 'will', 'have', 'want', 'think', 'can', 'know', 'love', 'hope'],
  'i am': ['so', 'very', 'doing', 'here', 'going', 'happy', 'ready'],
  'what': ['is', 'are', 'time', 'about', 'do', 'can'],
  'good': ['morning', 'night', 'afternoon', 'evening', 'job', 'idea', 'luck'],
  'see': ['you', 'it', 'them', 'soon', 'later'],
  'let': ['me', 'us', 'know', 'go'],
  'let me': ['know', 'see', 'check', 'think'],
  'where': ['are', 'is', 'did', 'can', 'were'],
  'are': ['you', 'we', 'they', 'there'],
  'can': ['you', 'i', 'we', 'they', 'be'],
  'on': ['my', 'the', 'time', 'top', 'your', 'way'],
  'on my': ['way', 'way!', 'phone', 'mind'],
  'have': ['a', 'to', 'been', 'you', 'done', 'fun'],
  'have a': ['great', 'good', 'nice', 'wonderful', 'safe'],
  'text': ['me', 'you', 'q', 'board', 'message'],
  'text q': ['board', 'app', 'keyboard'],
};

// Common keyboard key coordinate positions (0-1 normalized) for swipe gesture distance
const KEY_POSITIONS: Record<string, { x: number; y: number }> = {
  'q': { x: 0.05, y: 0.2 }, 'w': { x: 0.15, y: 0.2 }, 'e': { x: 0.25, y: 0.2 }, 'r': { x: 0.35, y: 0.2 }, 't': { x: 0.45, y: 0.2 },
  'y': { x: 0.55, y: 0.2 }, 'u': { x: 0.65, y: 0.2 }, 'i': { x: 0.75, y: 0.2 }, 'o': { x: 0.85, y: 0.2 }, 'p': { x: 0.95, y: 0.2 },
  'a': { x: 0.1, y: 0.5 },  's': { x: 0.2, y: 0.5 },  'd': { x: 0.3, y: 0.5 },  'f': { x: 0.4, y: 0.5 },  'g': { x: 0.5, y: 0.5 },
  'h': { x: 0.6, y: 0.5 },  'j': { x: 0.7, y: 0.5 },  'k': { x: 0.8, y: 0.5 },  'l': { x: 0.9, y: 0.5 },
  'z': { x: 0.2, y: 0.8 },  'x': { x: 0.3, y: 0.8 },  'c': { x: 0.4, y: 0.8 },  'v': { x: 0.5, y: 0.8 },  'b': { x: 0.6, y: 0.8 },
  'n': { x: 0.7, y: 0.8 },  'm': { x: 0.8, y: 0.8 },
};

/**
 * Returns suggestions for the current word being typed
 */
export function getWordPredictions(
  currentWord: string, 
  previousWords: string = '',
  customShortcuts: { shortcut: string; expanded: string }[] = []
): string[] {
  const clean = currentWord.trim().toLowerCase();
  const suggestions: string[] = [];

  // 1. Check custom shortcuts first
  for (const item of customShortcuts) {
    if (item.shortcut.toLowerCase() === clean) {
      suggestions.push(item.expanded);
    }
  }

  // Default built-in shortcuts
  if (clean === 'omw') suggestions.push('On my way!');
  if (clean === 'tqb') suggestions.push('Text Q Board');
  if (clean === 'ty') suggestions.push('Thank you');
  if (clean === 'np') suggestions.push('No problem');
  if (clean === 'brb') suggestions.push('Be right back');
  if (clean === 'idk') suggestions.push("I don't know");
  if (clean === 'imo') suggestions.push('In my opinion');
  if (clean === 'hru') suggestions.push('How are you?');

  if (!clean) {
    // Return next-word predictions based on previous text context
    const prevClean = previousWords.trim().toLowerCase();
    const lastTwo = prevClean.split(/\s+/).slice(-2).join(' ');
    const lastOne = prevClean.split(/\s+/).slice(-1)[0];

    if (NEXT_WORD_MAP[lastTwo]) {
      return NEXT_WORD_MAP[lastTwo].slice(0, 3);
    }
    if (NEXT_WORD_MAP[lastOne]) {
      return NEXT_WORD_MAP[lastOne].slice(0, 3);
    }
    return ['I', 'The', 'How'];
  }

  // 2. Exact match or prefix match from common words
  for (const word of COMMON_ENGLISH_WORDS) {
    if (word.startsWith(clean) && !suggestions.includes(word)) {
      suggestions.push(word);
    }
    if (suggestions.length >= 4) break;
  }

  // 3. Fallback to capitalized or current clean if not enough
  if (suggestions.length === 0) {
    suggestions.push(currentWord);
  }

  return suggestions.slice(0, 3);
}

/**
 * Calculates gesture trail matching word from glide path points
 */
export function matchGlideGesture(points: { x: number; y: number }[]): string | null {
  if (points.length < 3) return null;

  // Find start and end key
  const startPt = points[0];
  const endPt = points[points.length - 1];

  let startKey = '';
  let endKey = '';
  let minStartDist = 999;
  let minEndDist = 999;

  for (const [key, pos] of Object.entries(KEY_POSITIONS)) {
    const dStart = Math.hypot(pos.x - startPt.x, pos.y - startPt.y);
    const dEnd = Math.hypot(pos.x - endPt.x, pos.y - endPt.y);
    if (dStart < minStartDist) {
      minStartDist = dStart;
      startKey = key;
    }
    if (dEnd < minEndDist) {
      minEndDist = dEnd;
      endKey = key;
    }
  }

  // Find candidate words starting with startKey and ending with endKey
  const candidates = COMMON_ENGLISH_WORDS.filter(w => 
    w.startsWith(startKey) && (w.length <= 3 || w.endsWith(endKey))
  );

  if (candidates.length > 0) {
    return candidates[0];
  }

  // Fallback to start letter + end letter word
  const anyMatch = COMMON_ENGLISH_WORDS.find(w => w.startsWith(startKey));
  return anyMatch || startKey;
}
