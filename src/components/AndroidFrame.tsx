import React, { useState, useEffect, useRef } from 'react';
import {
  Wifi,
  Battery,
  Signal,
  MessageSquare,
  StickyNote,
  Search,
  Zap,
  Languages,
  Smartphone,
  Send,
  Plus,
  Trash2,
  CheckCircle2,
  Play,
  RotateCcw,
  Sparkles,
  ExternalLink,
  Download
} from 'lucide-react';
import { TextQBoardLogo } from './Logo';

export type AndroidAppId = 'chat' | 'notes' | 'search' | 'speed_test' | 'translate_studio' | 'setup_guide';

interface AndroidFrameProps {
  activeApp: AndroidAppId;
  onSelectApp: (app: AndroidAppId) => void;
  inputText: string;
  onInputChange: (text: string) => void;
  onInputFocus: () => void;
  onSendMessage?: (text: string) => void;
  cursorPos: number;
  onCursorChange: (pos: number) => void;
  children: React.ReactNode;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  time: string;
}

interface NoteItem {
  id: string;
  title: string;
  content: string;
  date: string;
}

export const AndroidFrame: React.FC<AndroidFrameProps> = ({
  activeApp,
  onSelectApp,
  inputText,
  onInputChange,
  onInputFocus,
  onSendMessage,
  cursorPos,
  onCursorChange,
  children,
}) => {
  // Current real-time clock
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Chat App State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'bot',
      text: 'Hello! Welcome to Text Q Board. Try typing in English or Bengali (Phonetic: "amar", "bangla", "kemon acho")!',
      time: '09:41',
    },
    {
      id: '2',
      sender: 'bot',
      text: 'You can test Glide Typing (swiping across letters), speech-to-text, and Emoji Kitchen mashups!',
      time: '09:42',
    },
  ]);

  // Notes App State
  const [notes, setNotes] = useState<NoteItem[]>([
    {
      id: 'n1',
      title: 'Text Q Board Features',
      content: '1. Cyber Cyan Neon Keycaps\n2. Bengali Avro phonetic & Jatiya layout\n3. Real-time translation\n4. Emoji Kitchen stickers',
      date: 'Today',
    },
    {
      id: 'n2',
      title: 'বাংলা নোট',
      content: 'আমার সোনার বাংলা, আমি তোমায় ভালোবাসি। চিরদিন তোমার আকাশ, তোমার বাতাস...',
      date: 'Yesterday',
    },
  ]);
  const [selectedNoteId, setSelectedNoteId] = useState<string>('n1');

  // Search App State
  const [searchResults, setSearchResults] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Speed Test State
  const [testText, setTestText] = useState('The quick brown fox jumps over the lazy dog and tests Text Q Board speed');
  const [testStarted, setTestStarted] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [wpm, setWpm] = useState<number>(0);
  const [accuracy, setAccuracy] = useState<number>(100);

  // Focusable input ref
  const inputRef = useRef<HTMLTextAreaElement | HTMLInputElement | null>(null);

  // Sync cursor position from props
  useEffect(() => {
    if (inputRef.current && cursorPos >= 0) {
      try {
        inputRef.current.setSelectionRange(cursorPos, cursorPos);
      } catch {}
    }
  }, [cursorPos]);

  // Send Chat Message
  const handleSendChat = () => {
    if (!inputText.trim()) return;
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: inputText.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
    };

    setChatMessages((prev) => [...prev, userMsg]);
    const sentText = inputText.trim();
    onInputChange('');

    // Simulated Intelligent Bot Reply in English or Bengali
    setTimeout(() => {
      let replyText = 'Got your message! Text Q Board is responding smoothly.';
      const lower = sentText.toLowerCase();

      if (lower.includes('kemon') || lower.includes('কেমন') || lower.includes('valo') || lower.includes('ভালো')) {
        replyText = 'আমি খুব ভালো আছি! আপনি কেমন আছেন? টেক্সট কিউ বোর্ড কিবোর্ড চমৎকার কাজ করছে!';
      } else if (lower.includes('amar') || lower.includes('আমার') || lower.includes('bangla') || lower.includes('বাংলা')) {
        replyText = 'বাংলা ভাষায় নিখুঁত টাইপিং নিশ্চিত করছে আমাদের টেক্সট কিউ বোর্ড ফোনেটিক ইঞ্জিন!';
      } else if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey')) {
        replyText = 'Hey there! How is the typing experience with the cyber cyan neon keys?';
      } else if (lower.includes('gboard') || lower.includes('text q board')) {
        replyText = 'Text Q Board provides all Gboard options with 100% open-source privacy guarantee!';
      }

      const botReply: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: replyText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
      };
      setChatMessages((prev) => [...prev, botReply]);
    }, 600);
  };

  // Run Search
  const handleRunSearch = () => {
    if (!inputText.trim()) return;
    setIsSearching(true);
    setTimeout(() => {
      setSearchResults([
        `Definition: ${inputText} — Top search result with Text Q Board integration.`,
        `Latest news and updates regarding "${inputText}" around the world.`,
        `Wikipedia encyclopedia entry for ${inputText}.`,
        `Bangla dictionary and grammar translation for ${inputText}.`,
      ]);
      setIsSearching(false);
    }, 350);
  };

  // Speed Test calculation
  useEffect(() => {
    if (activeApp === 'speed_test') {
      if (inputText.length > 0 && !testStarted) {
        setTestStarted(true);
        setStartTime(Date.now());
      }
      if (testStarted && startTime) {
        const timeElapsedMin = (Date.now() - startTime) / 60000;
        const words = inputText.trim().split(/\s+/).length;
        if (timeElapsedMin > 0) {
          setWpm(Math.round(words / timeElapsedMin));
        }

        // Accuracy
        let correctChars = 0;
        for (let i = 0; i < inputText.length; i++) {
          if (inputText[i] === testText[i]) correctChars++;
        }
        setAccuracy(Math.round((correctChars / Math.max(1, inputText.length)) * 100));
      }
    }
  }, [inputText, activeApp, testStarted, startTime, testText]);

  return (
    <div className="flex flex-col h-full w-full max-w-md mx-auto bg-slate-950 rounded-[40px] border-[6px] border-slate-800 shadow-[0_20px_60px_rgba(0,0,0,0.8),0_0_25px_rgba(6,182,212,0.25)] overflow-hidden relative">
      {/* Android Camera Pill / Notch */}
      <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-24 h-4 bg-black rounded-full z-40 flex items-center justify-end px-2">
        <div className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-700/60" />
      </div>

      {/* 1. ANDROID STATUS BAR */}
      <div className="h-8 w-full flex items-center justify-between px-6 pt-1 text-[11px] font-semibold text-slate-300 select-none z-30">
        <span>{currentTime || '12:00'}</span>
        <div className="flex items-center gap-1.5 text-slate-300">
          <Signal className="w-3.5 h-3.5" />
          <span className="text-[10px] font-bold text-cyan-400">5G</span>
          <Wifi className="w-3.5 h-3.5" />
          <div className="flex items-center gap-0.5">
            <span className="text-[10px]">98%</span>
            <Battery className="w-3.5 h-3.5 text-cyan-400" />
          </div>
        </div>
      </div>

      {/* 2. ANDROID APP DRAWER TABS BAR */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-slate-900/90 border-b border-white/5 select-none overflow-x-auto no-scrollbar gap-1">
        {[
          { id: 'chat', label: 'Chat', icon: MessageSquare },
          { id: 'notes', label: 'Notes', icon: StickyNote },
          { id: 'search', label: 'Search', icon: Search },
          { id: 'speed_test', label: 'WPM Test', icon: Zap },
          { id: 'setup_guide', label: 'Android Setup', icon: Smartphone },
        ].map((app) => {
          const Icon = app.icon;
          const isActive = activeApp === app.id;
          return (
            <button
              key={app.id}
              onClick={() => onSelectApp(app.id as AndroidAppId)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-cyan-500 text-slate-950 shadow-[0_0_10px_rgba(6,182,212,0.4)]'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
            >
              <Icon className="w-3 h-3" />
              <span>{app.label}</span>
            </button>
          );
        })}
      </div>

      {/* 3. ACTIVE APP SCREEN CONTENT (SCROLLABLE AREA) */}
      <div className="flex-1 overflow-y-auto p-3 flex flex-col no-scrollbar">
        {/* APP 1: CHAT */}
        {activeApp === 'chat' && (
          <div className="flex-1 flex flex-col justify-between space-y-3">
            {/* Chat header */}
            <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-900/60 border border-white/5">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold text-xs">
                Q
              </div>
              <div className="flex-1">
                <p className="text-xs font-bold text-white">Text Q Assistant (বাংলা ও English)</p>
                <p className="text-[10px] text-cyan-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                  <span>Online • Gboard Engine Active</span>
                </p>
              </div>
            </div>

            {/* Messages Feed */}
            <div className="flex-1 space-y-2.5 overflow-y-auto py-1">
              {chatMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${
                    msg.sender === 'user' ? 'items-end' : 'items-start'
                  }`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-xs leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-cyan-500 text-slate-950 font-medium rounded-br-none shadow-[0_2px_8px_rgba(6,182,212,0.3)]'
                        : 'bg-slate-800 text-slate-100 rounded-bl-none border border-white/5'
                    }`}
                  >
                    {msg.text}
                  </div>
                  <span className="text-[9px] text-slate-500 px-1 mt-0.5">{msg.time}</span>
                </div>
              ))}
            </div>

            {/* Chat Input Field Box */}
            <div className="pt-1">
              <div className="flex items-center gap-1.5 bg-slate-900 border border-cyan-500/40 rounded-2xl p-1.5 shadow-[0_0_12px_rgba(6,182,212,0.15)]">
                <input
                  ref={inputRef as React.RefObject<HTMLInputElement>}
                  type="text"
                  value={inputText}
                  onChange={(e) => {
                    onInputChange(e.target.value);
                    onCursorChange(e.target.selectionStart || 0);
                  }}
                  onFocus={onInputFocus}
                  onClick={(e) => onCursorChange((e.target as HTMLInputElement).selectionStart || 0)}
                  onKeyUp={(e) => onCursorChange((e.target as HTMLInputElement).selectionStart || 0)}
                  placeholder="Type message with Text Q Board..."
                  className="flex-1 bg-transparent text-xs text-white placeholder-slate-400 px-2 py-1 outline-none"
                />
                <button
                  onClick={handleSendChat}
                  className="w-8 h-8 rounded-xl bg-cyan-500 text-slate-950 flex items-center justify-center hover:bg-cyan-400 active:scale-95 transition-transform"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* APP 2: NOTES */}
        {activeApp === 'notes' && (
          <div className="flex-1 flex flex-col space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Keep Notes</h3>
              <button
                onClick={() => {
                  const newNote: NoteItem = {
                    id: Date.now().toString(),
                    title: 'New Note',
                    content: '',
                    date: 'Now',
                  };
                  setNotes([newNote, ...notes]);
                  setSelectedNoteId(newNote.id);
                  onInputChange('');
                }}
                className="px-2.5 py-1 rounded-lg bg-cyan-500/20 text-cyan-300 text-xs font-bold flex items-center gap-1 hover:bg-cyan-500/30"
              >
                <Plus className="w-3 h-3" />
                <span>New</span>
              </button>
            </div>

            {/* Note Editor Area */}
            <div className="flex-1 flex flex-col bg-slate-900/80 rounded-2xl p-3 border border-white/5 space-y-2">
              <input
                type="text"
                value={notes.find((n) => n.id === selectedNoteId)?.title || 'Note'}
                onChange={(e) => {
                  const t = e.target.value;
                  setNotes((prev) =>
                    prev.map((n) => (n.id === selectedNoteId ? { ...n, title: t } : n))
                  );
                }}
                className="w-full bg-transparent font-bold text-sm text-white outline-none border-b border-white/10 pb-1"
                placeholder="Title"
              />
              <textarea
                ref={inputRef as React.RefObject<HTMLTextAreaElement>}
                value={inputText}
                onChange={(e) => {
                  onInputChange(e.target.value);
                  onCursorChange(e.target.selectionStart || 0);
                  setNotes((prev) =>
                    prev.map((n) => (n.id === selectedNoteId ? { ...n, content: e.target.value } : n))
                  );
                }}
                onFocus={onInputFocus}
                onClick={(e) => onCursorChange((e.target as HTMLTextAreaElement).selectionStart || 0)}
                onKeyUp={(e) => onCursorChange((e.target as HTMLTextAreaElement).selectionStart || 0)}
                placeholder="Start typing your note in any language..."
                className="w-full flex-1 bg-transparent text-xs text-slate-200 placeholder-slate-500 resize-none outline-none leading-relaxed"
              />
            </div>
          </div>
        )}

        {/* APP 3: SEARCH */}
        {activeApp === 'search' && (
          <div className="flex-1 flex flex-col space-y-3">
            <div className="flex items-center gap-2 bg-slate-900 border border-cyan-500/40 rounded-full px-3 py-2 shadow-[0_0_12px_rgba(6,182,212,0.2)]">
              <Search className="w-4 h-4 text-cyan-400" />
              <input
                ref={inputRef as React.RefObject<HTMLInputElement>}
                type="text"
                value={inputText}
                onChange={(e) => {
                  onInputChange(e.target.value);
                  onCursorChange(e.target.selectionStart || 0);
                }}
                onFocus={onInputFocus}
                placeholder="Search web or type URL..."
                className="flex-1 bg-transparent text-xs text-white placeholder-slate-400 outline-none"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleRunSearch();
                }}
              />
              <button
                onClick={handleRunSearch}
                className="px-2.5 py-0.5 rounded-full bg-cyan-500 text-slate-950 font-bold text-xs"
              >
                Go
              </button>
            </div>

            {/* Results */}
            <div className="flex-1 space-y-2 overflow-y-auto">
              {isSearching ? (
                <div className="text-center py-6 text-xs text-cyan-300 animate-pulse">
                  Searching Google for "{inputText}"...
                </div>
              ) : searchResults.length > 0 ? (
                searchResults.map((res, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-xl bg-slate-900/60 border border-white/5 hover:border-cyan-500/30 text-xs text-slate-200"
                  >
                    <p className="font-semibold text-cyan-300 text-xs mb-0.5">Google Instant Result #{i + 1}</p>
                    <p className="text-slate-300 text-[11px] leading-relaxed">{res}</p>
                  </div>
                ))
              ) : (
                <div className="p-4 rounded-2xl bg-slate-900/40 border border-white/5 text-center text-slate-400 text-xs space-y-2">
                  <Search className="w-8 h-8 mx-auto text-slate-600" />
                  <p>Type any keyword or Bengali query using Text Q Board and press Enter to test search integration.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* APP 4: SPEED TEST */}
        {activeApp === 'speed_test' && (
          <div className="flex-1 flex flex-col space-y-3">
            <div className="p-3 rounded-2xl bg-gradient-to-r from-cyan-950/60 to-slate-900 border border-cyan-500/30 flex items-center justify-around">
              <div className="text-center">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Speed</p>
                <p className="text-xl font-extrabold text-cyan-400 font-mono">{wpm} <span className="text-[10px]">WPM</span></p>
              </div>
              <div className="h-8 w-px bg-white/10" />
              <div className="text-center">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Accuracy</p>
                <p className="text-xl font-extrabold text-emerald-400 font-mono">{accuracy}%</p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/80 border border-white/10 text-xs text-slate-300 leading-relaxed">
              <p className="text-[10px] font-bold text-cyan-400 mb-1">PROMPT TO TYPE:</p>
              <p className="font-mono bg-black/40 p-2 rounded-lg text-cyan-100">{testText}</p>
            </div>

            <div className="flex-1">
              <textarea
                ref={inputRef as React.RefObject<HTMLTextAreaElement>}
                value={inputText}
                onChange={(e) => {
                  onInputChange(e.target.value);
                  onCursorChange(e.target.selectionStart || 0);
                }}
                onFocus={onInputFocus}
                placeholder="Start typing the prompt above with Text Q Board..."
                className="w-full h-24 p-2.5 rounded-xl bg-slate-900 border border-cyan-500/40 text-xs text-white resize-none outline-none"
              />
            </div>

            <button
              onClick={() => {
                onInputChange('');
                setTestStarted(false);
                setStartTime(null);
                setWpm(0);
                setAccuracy(100);
              }}
              className="py-1.5 rounded-xl bg-slate-800 text-xs font-semibold text-slate-300 hover:bg-slate-700 flex items-center justify-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Test</span>
            </button>
          </div>
        )}

        {/* APP 5: ANDROID SETUP GUIDE */}
        {activeApp === 'setup_guide' && (
          <div className="flex-1 space-y-3 text-xs text-slate-200 overflow-y-auto pr-1">
            <div className="text-center space-y-1">
              <TextQBoardLogo size="sm" />
              <h3 className="font-bold text-sm text-white mt-2">How to Enable Text Q Board on Android</h3>
              <p className="text-[11px] text-cyan-300">Official Installation & Configuration Guide</p>
            </div>

            <div className="space-y-2 mt-2">
              <div className="p-3 rounded-xl bg-slate-900 border border-white/5 flex gap-2.5">
                <div className="w-5 h-5 rounded-full bg-cyan-500 text-slate-950 font-bold text-xs flex items-center justify-center shrink-0">
                  1
                </div>
                <div>
                  <p className="font-semibold text-white">Go to Android Settings</p>
                  <p className="text-[11px] text-slate-400">Open <b>Settings → System → Languages & Input → On-Screen Keyboard</b>.</p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-white/5 flex gap-2.5">
                <div className="w-5 h-5 rounded-full bg-cyan-500 text-slate-950 font-bold text-xs flex items-center justify-center shrink-0">
                  2
                </div>
                <div>
                  <p className="font-semibold text-white">Enable Text Q Board</p>
                  <p className="text-[11px] text-slate-400">Toggle the switch next to <b>Text Q Board</b> to enable keyboard permissions.</p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-white/5 flex gap-2.5">
                <div className="w-5 h-5 rounded-full bg-cyan-500 text-slate-950 font-bold text-xs flex items-center justify-center shrink-0">
                  3
                </div>
                <div>
                  <p className="font-semibold text-white">Select Default Input Method</p>
                  <p className="text-[11px] text-slate-400">Tap <b>Current Keyboard</b> and choose <b>Text Q Board</b>. Enjoy cyber cyan typing!</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 4. KEYBOARD CONTAINER SLOT (ANCHORED AT BOTTOM) */}
      <div className="w-full z-30">
        {children}
      </div>

      {/* 5. ANDROID NAVIGATION BAR (BOTTOM GESTURE PILL) */}
      <div className="h-4 w-full bg-black flex items-center justify-center select-none">
        <div className="w-32 h-1 bg-slate-600 rounded-full" />
      </div>
    </div>
  );
};
