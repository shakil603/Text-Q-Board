import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  Copy,
  Scissors,
  ClipboardPaste,
  Trash2,
  Pin,
  Sparkles,
  Plus,
  RotateCcw,
  Check,
  Languages,
  CheckCheck
} from 'lucide-react';
import { ThemeConfig, ThemeId, ToolbarView, ClipboardItem } from '../types/keyboard';
import { KEYBOARD_THEMES } from '../data/themes';

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
}

const TRANSLATION_LANGUAGES = [
  { code: 'bn', name: 'Bengali / বাংলা' },
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'ar', name: 'Arabic' },
  { code: 'hi', name: 'Hindi' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'ja', name: 'Japanese' },
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
}) => {
  // Translate states
  const [sourceLang, setSourceLang] = useState('en');
  const [targetLang, setTargetLang] = useState('bn');
  const [transInput, setTransInput] = useState('');
  const [transOutput, setTransOutput] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);

  // Text Edit Select Mode
  const [isSelectMode, setIsSelectMode] = useState(false);

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
      // Simulate real-time translation
      const lower = transInput.trim().toLowerCase();
      let translated = '';

      if (sourceLang === 'en' && targetLang === 'bn') {
        const enBnMap: Record<string, string> = {
          'hello': 'হ্যালো / নমস্কার',
          'how are you': 'আপনি কেমন আছেন?',
          'good morning': 'শুভ সকাল',
          'good night': 'শুভ রাত্রি',
          'thank you': 'আপনাকে অনেক ধন্যবাদ',
          'welcome': 'স্বাগতম',
          'i love you': 'আমি তোমাকে ভালোবাসি',
          'what is your name': 'আপনার নাম কী?',
          'see you tomorrow': 'কাল দেখা হবে',
          'i am on my way': 'আমি আসছি পথে',
          'have a great day': 'দিনটি শুভ হোক',
          'text q board': 'টেক্সট কিউ বোর্ড',
        };
        translated = enBnMap[lower] || `[বাংলা অনুবাদ] ${transInput}`;
      } else if (sourceLang === 'bn' && targetLang === 'en') {
        const bnEnMap: Record<string, string> = {
          'কেমন আছেন': 'How are you?',
          'ভালো': 'Good / Fine',
          'ধন্যবাদ': 'Thank you',
          'শুভ সকাল': 'Good morning',
          'আমি তোমাকে ভালোবাসি': 'I love you',
          'দেখা হবে': 'See you soon',
        };
        translated = bnEnMap[lower] || `[English translation] ${transInput}`;
      } else {
        translated = `[${targetLang.toUpperCase()}] ${transInput}`;
      }

      setTransOutput(translated);
      setIsTranslating(false);
    }, 250);

    return () => clearTimeout(timer);
  }, [transInput, sourceLang, targetLang]);

  // AI Tone Rephrase
  const handleAiRephrase = (tone: 'polite' | 'casual' | 'bengali' | 'concise' | 'expanded') => {
    if (!currentText.trim()) return;
    setAiGenerating(true);

    setTimeout(() => {
      let options: string[] = [];
      const text = currentText.trim();
      switch (tone) {
        case 'polite':
          options = [
            `I would like to kindly let you know that ${text}.`,
            `Could you please note that: ${text}? Best regards.`,
          ];
          break;
        case 'casual':
          options = [
            `Hey! Just wanted to say ${text} 😊`,
            `Quick note: ${text} 🙌`,
          ];
          break;
        case 'bengali':
          options = [
            `আপনাকে জানাচ্ছি যে: ${text}`,
            `সহজ ভাষায়: ${text}`,
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
    }, 400);
  };

  if (activeView === 'normal' || activeView === 'more_tools') return null;

  return (
    <div
      className={`w-full p-2 select-none border-b border-white/10 text-xs transition-all ${theme.suggestionBg}`}
    >
      {/* Header bar with Back button & Title */}
      <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-white/5">
        <button
          onClick={onClose}
          className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 font-semibold px-1 py-0.5 rounded active:scale-95"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back</span>
        </button>
        <span className="font-bold text-slate-200 uppercase tracking-wider text-[11px]">
          {activeView === 'translate' && 'Google Translate Bar'}
          {activeView === 'clipboard' && 'Clipboard Manager'}
          {activeView === 'text_edit' && 'Text Editing Tool'}
          {activeView === 'themes' && 'Select Theme'}
          {activeView === 'smart_ai' && 'Smart AI Assistant & Tone'}
        </span>
        <div className="w-12" />
      </div>

      {/* 1. TRANSLATE TOOL */}
      {activeView === 'translate' && (
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <select
              value={sourceLang}
              onChange={(e) => setSourceLang(e.target.value)}
              className="bg-slate-800 text-cyan-200 rounded px-2 py-1 border border-cyan-500/30 text-xs flex-1 outline-none"
            >
              {TRANSLATION_LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.name}
                </option>
              ))}
            </select>
            <button
              onClick={() => {
                const s = sourceLang;
                setSourceLang(targetLang);
                setTargetLang(s);
              }}
              className="p-1 rounded bg-white/10 hover:bg-white/20 active:scale-90 text-cyan-300"
              title="Swap Languages"
            >
              <Languages className="w-4 h-4" />
            </button>
            <select
              value={targetLang}
              onChange={(e) => setTargetLang(e.target.value)}
              className="bg-slate-800 text-cyan-200 rounded px-2 py-1 border border-cyan-500/30 text-xs flex-1 outline-none"
            >
              {TRANSLATION_LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-1.5">
            <input
              type="text"
              value={transInput}
              onChange={(e) => setTransInput(e.target.value)}
              placeholder="Type or paste to translate..."
              className="flex-1 bg-slate-900 border border-white/10 rounded px-2.5 py-1 text-slate-100 placeholder-slate-500 outline-none focus:border-cyan-400"
            />
          </div>

          {transOutput && (
            <div className="p-2 rounded bg-cyan-950/60 border border-cyan-500/30 flex items-center justify-between">
              <span className="text-cyan-100 font-medium">{transOutput}</span>
              <button
                onClick={() => {
                  onInsertText(transOutput);
                  onClose();
                }}
                className="px-2 py-1 bg-cyan-500 text-slate-950 font-bold rounded flex items-center gap-1 active:scale-95 shadow-sm"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Insert</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* 2. CLIPBOARD MANAGER */}
      {activeView === 'clipboard' && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-400">
              Tap any clip to paste. Pin to keep indefinitely.
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setShowAddClip(!showAddClip)}
                className="p-1 rounded bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30"
                title="Add custom clip"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={onClearClipboard}
                className="p-1 rounded bg-red-500/20 text-red-300 hover:bg-red-500/30"
                title="Clear unpinned clips"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {showAddClip && (
            <div className="flex gap-1">
              <input
                type="text"
                value={newClipText}
                onChange={(e) => setNewClipText(e.target.value)}
                placeholder="Enter text to save in clipboard..."
                className="flex-1 bg-slate-900 border border-cyan-500/40 rounded px-2 py-1 text-white text-xs outline-none"
              />
              <button
                onClick={() => {
                  if (newClipText.trim()) {
                    onAddClipboardItem(newClipText.trim());
                    setNewClipText('');
                    setShowAddClip(false);
                  }
                }}
                className="px-2 py-1 bg-cyan-500 text-slate-950 font-bold rounded"
              >
                Save
              </button>
            </div>
          )}

          <div className="grid grid-cols-2 gap-1.5 max-h-36 overflow-y-auto pr-1">
            {clipboardItems.map((item) => (
              <div
                key={item.id}
                className={`group relative p-2 rounded-lg border text-left cursor-pointer transition-all active:scale-95 ${
                  item.pinned
                    ? 'bg-cyan-950/40 border-cyan-500/50 text-cyan-100'
                    : 'bg-slate-800/80 border-slate-700/60 text-slate-200 hover:border-cyan-500/30'
                }`}
              >
                <p
                  onClick={() => {
                    onInsertText(item.text);
                    onClose();
                  }}
                  className="line-clamp-2 text-[11px] font-medium"
                >
                  {item.text}
                </p>
                <div className="flex items-center justify-end gap-1 mt-1 pt-1 border-t border-white/5">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onTogglePinClipboard(item.id);
                    }}
                    className={`p-0.5 rounded ${
                      item.pinned ? 'text-cyan-400' : 'text-slate-500 hover:text-slate-300'
                    }`}
                    title={item.pinned ? 'Unpin' : 'Pin clip'}
                  >
                    <Pin className="w-3 h-3" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteClipboardItem(item.id);
                    }}
                    className="p-0.5 rounded text-slate-500 hover:text-red-400"
                    title="Delete clip"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. TEXT EDITING D-PAD TOOL */}
      {activeView === 'text_edit' && (
        <div className="flex flex-col items-center gap-2 py-1">
          {/* Action Row */}
          <div className="flex items-center justify-center gap-1.5 w-full">
            <button
              onClick={() => setIsSelectMode(!isSelectMode)}
              className={`px-3 py-1 rounded font-semibold transition-all ${
                isSelectMode
                  ? 'bg-cyan-500 text-slate-950 shadow-[0_0_10px_rgba(6,182,212,0.5)]'
                  : 'bg-slate-800 text-cyan-200 hover:bg-slate-700'
              }`}
            >
              {isSelectMode ? 'Selecting...' : 'Select'}
            </button>
            <button
              onClick={onSelectAll}
              className="px-2.5 py-1 rounded bg-slate-800 text-slate-200 hover:bg-slate-700 flex items-center gap-1"
            >
              <CheckCheck className="w-3 h-3 text-cyan-400" />
              <span>All</span>
            </button>
            <button
              onClick={onCutSelection}
              className="px-2 py-1 rounded bg-slate-800 text-slate-200 hover:bg-slate-700"
              title="Cut"
            >
              <Scissors className="w-3.5 h-3.5 text-cyan-300" />
            </button>
            <button
              onClick={onCopySelection}
              className="px-2 py-1 rounded bg-slate-800 text-slate-200 hover:bg-slate-700"
              title="Copy"
            >
              <Copy className="w-3.5 h-3.5 text-cyan-300" />
            </button>
            <button
              onClick={onDeleteSelection}
              className="px-2 py-1 rounded bg-slate-800 text-red-300 hover:bg-slate-700"
              title="Delete selection"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* D-Pad Arrows Grid */}
          <div className="grid grid-cols-3 gap-1.5 w-48">
            <div className="flex justify-center">
              <button
                onClick={() => onMoveCursor('start')}
                className="w-12 h-8 rounded bg-slate-800 text-slate-300 hover:bg-cyan-900/50 hover:text-cyan-200 font-bold active:scale-95"
              >
                |◀
              </button>
            </div>
            <div className="flex justify-center">
              <button
                onClick={() => onMoveCursor('up')}
                className="w-12 h-8 rounded bg-slate-800 text-slate-200 hover:bg-cyan-900/50 hover:text-cyan-200 flex items-center justify-center active:scale-95"
              >
                <ArrowUp className="w-4 h-4" />
              </button>
            </div>
            <div className="flex justify-center">
              <button
                onClick={() => onMoveCursor('end')}
                className="w-12 h-8 rounded bg-slate-800 text-slate-300 hover:bg-cyan-900/50 hover:text-cyan-200 font-bold active:scale-95"
              >
                ▶|
              </button>
            </div>

            <div className="flex justify-center">
              <button
                onClick={() => onMoveCursor('left')}
                className="w-12 h-8 rounded bg-slate-800 text-slate-200 hover:bg-cyan-900/50 hover:text-cyan-200 flex items-center justify-center active:scale-95"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            </div>
            <div className="flex justify-center items-center">
              <div className="w-3 h-3 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]" />
            </div>
            <div className="flex justify-center">
              <button
                onClick={() => onMoveCursor('right')}
                className="w-12 h-8 rounded bg-slate-800 text-slate-200 hover:bg-cyan-900/50 hover:text-cyan-200 flex items-center justify-center active:scale-95"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div />
            <div className="flex justify-center">
              <button
                onClick={() => onMoveCursor('down')}
                className="w-12 h-8 rounded bg-slate-800 text-slate-200 hover:bg-cyan-900/50 hover:text-cyan-200 flex items-center justify-center active:scale-95"
              >
                <ArrowDown className="w-4 h-4" />
              </button>
            </div>
            <div />
          </div>
        </div>
      )}

      {/* 4. THEMES SELECTOR */}
      {activeView === 'themes' && (
        <div className="grid grid-cols-3 gap-2 max-h-36 overflow-y-auto p-1">
          {Object.values(KEYBOARD_THEMES).map((t) => (
            <button
              key={t.id}
              onClick={() => {
                onSelectTheme(t.id);
                onClose();
              }}
              className={`p-2 rounded-lg border text-left flex flex-col gap-1 transition-all active:scale-95 ${
                theme.id === t.id
                  ? 'border-cyan-400 ring-2 ring-cyan-500/40 shadow-lg'
                  : 'border-white/10 hover:border-white/30'
              } ${t.boardBg}`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-[11px] font-bold ${t.textPrimary}`}>{t.name}</span>
                {theme.id === t.id && <Check className="w-3.5 h-3.5 text-cyan-400" />}
              </div>
              <div className="flex gap-1">
                <div className={`w-3.5 h-3.5 rounded ${t.keyBg} ${t.keyBorder}`} />
                <div className={`w-3.5 h-3.5 rounded ${t.accent}`} />
                <div className={`w-3.5 h-3.5 rounded ${t.keySpecialBg}`} />
              </div>
            </button>
          ))}
        </div>
      )}

      {/* 5. SMART AI ASSISTANT & TONE REWRITE */}
      {activeView === 'smart_ai' && (
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
            <button
              onClick={() => handleAiRephrase('polite')}
              className="px-2.5 py-1 rounded-full bg-slate-800 text-cyan-200 hover:bg-cyan-950 border border-cyan-500/30 whitespace-nowrap active:scale-95"
            >
              👔 Polite
            </button>
            <button
              onClick={() => handleAiRephrase('casual')}
              className="px-2.5 py-1 rounded-full bg-slate-800 text-cyan-200 hover:bg-cyan-950 border border-cyan-500/30 whitespace-nowrap active:scale-95"
            >
              😎 Casual
            </button>
            <button
              onClick={() => handleAiRephrase('bengali')}
              className="px-2.5 py-1 rounded-full bg-slate-800 text-cyan-200 hover:bg-cyan-950 border border-cyan-500/30 whitespace-nowrap active:scale-95"
            >
              🇧🇩 বাংলা
            </button>
            <button
              onClick={() => handleAiRephrase('concise')}
              className="px-2.5 py-1 rounded-full bg-slate-800 text-cyan-200 hover:bg-cyan-950 border border-cyan-500/30 whitespace-nowrap active:scale-95"
            >
              ⚡ Concise
            </button>
            <button
              onClick={() => handleAiRephrase('expanded')}
              className="px-2.5 py-1 rounded-full bg-slate-800 text-cyan-200 hover:bg-cyan-950 border border-cyan-500/30 whitespace-nowrap active:scale-95"
            >
              📝 Elaborate
            </button>
          </div>

          {aiGenerating && (
            <div className="flex items-center justify-center py-3 text-cyan-300 gap-2">
              <Sparkles className="w-4 h-4 animate-spin text-cyan-400" />
              <span>Text Q AI is composing suggestions...</span>
            </div>
          )}

          {aiOptions.length > 0 && !aiGenerating && (
            <div className="space-y-1.5 max-h-32 overflow-y-auto">
              {aiOptions.map((opt, i) => (
                <div
                  key={i}
                  className="p-2 rounded bg-cyan-950/40 border border-cyan-500/30 flex items-center justify-between gap-2"
                >
                  <p className="text-cyan-100 text-xs flex-1">{opt}</p>
                  <button
                    onClick={() => {
                      onReplaceAllText(opt);
                      onClose();
                    }}
                    className="px-2 py-1 bg-cyan-500 text-slate-950 font-bold rounded shrink-0 active:scale-95"
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
