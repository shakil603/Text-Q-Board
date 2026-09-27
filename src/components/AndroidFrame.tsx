import React, { useState, useEffect, useRef } from 'react';
import {
  Wifi,
  Battery,
  Signal,
  MessageSquare,
  StickyNote,
  Search,
  Zap,
  Smartphone,
  Send,
  Plus,
  RotateCcw,
  Download
} from 'lucide-react';
import { TextQBoardLogo } from './Logo';
import { openAndroidInputMethodSettings, showAndroidInputMethodPicker } from '../utils/androidBridge';

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
  cursorPos,
  onCursorChange,
  children,
}) => {
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

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'bot',
      text: 'Welcome to Text Q Board. Type in English or Bengali (Phonetic: "amar", "bangla", "kemon acho") or tap the microphone icon for Voice Typing.',
      time: '09:41',
    },
  ]);

  const [notes, setNotes] = useState<NoteItem[]>([
    {
      id: 'n1',
      title: 'Text Q Board Features',
      content: '1. Authentic Gboard Material 3 Layout\n2. Bengali Phonetic & Jatiya Layouts\n3. Voice Typing & Glide Typing\n4. Emoji Kitchen & Clipboard',
      date: 'Today',
    },
    {
      id: 'n2',
      title: 'বাংলা নোট',
      content: 'আমার সোনার বাংলা, আমি তোমায় ভালোবাসি।',
      date: 'Yesterday',
    },
  ]);
  const [selectedNoteId, setSelectedNoteId] = useState<string>('n1');

  const [searchResults, setSearchResults] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const [testText] = useState('The quick brown fox jumps over the lazy dog and tests Text Q Board speed');
  const [testStarted, setTestStarted] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [wpm, setWpm] = useState<number>(0);
  const [accuracy, setAccuracy] = useState<number>(100);

  const inputRef = useRef<HTMLTextAreaElement | HTMLInputElement | null>(null);

  useEffect(() => {
    if (inputRef.current && cursorPos >= 0) {
      try {
        inputRef.current.setSelectionRange(cursorPos, cursorPos);
      } catch {}
    }
  }, [cursorPos]);

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

    setTimeout(() => {
      let replyText = 'Message received via Text Q Board Gboard engine.';
      const lower = sentText.toLowerCase();

      if (lower.includes('kemon') || lower.includes('কেমন') || lower.includes('valo') || lower.includes('ভালো')) {
        replyText = 'আমি ভালো আছি! আপনি কেমন আছেন?';
      } else if (lower.includes('amar') || lower.includes('আমার') || lower.includes('bangla') || lower.includes('বাংলা')) {
        replyText = 'বাংলা ফোনেটিক এবং জাতীয় লেআউট নিখুঁতভাবে কাজ করছে।';
      }

      const botReply: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: replyText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
      };
      setChatMessages((prev) => [...prev, botReply]);
    }, 500);
  };

  const handleRunSearch = () => {
    if (!inputText.trim()) return;
    setIsSearching(true);
    setTimeout(() => {
      setSearchResults([
        `Result: ${inputText} — Gboard search integration.`,
        `Latest articles and definitions for "${inputText}".`,
        `Bengali and English dictionary lookup for ${inputText}.`,
      ]);
      setIsSearching(false);
    }, 300);
  };

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

        let correctChars = 0;
        for (let i = 0; i < inputText.length; i++) {
          if (inputText[i] === testText[i]) correctChars++;
        }
        setAccuracy(Math.round((correctChars / Math.max(1, inputText.length)) * 100));
      }
    }
  }, [inputText, activeApp, testStarted, startTime, testText]);

  return (
    <div className="flex flex-col h-full w-full max-w-md mx-auto bg-[#111318] rounded-[36px] border-[5px] border-[#232429] shadow-2xl overflow-hidden relative">
      {/* 1. ANDROID STATUS BAR */}
      <div className="h-8 w-full flex items-center justify-between px-6 pt-1 text-[11px] font-medium text-[#c4c6d0] select-none z-30 bg-[#1b1b1f]">
        <span>{currentTime || '12:00'}</span>
        <div className="flex items-center gap-1.5 text-[#c4c6d0]">
          <Signal className="w-3.5 h-3.5" />
          <span className="text-[10px] font-semibold text-[#a8c7fa]">5G</span>
          <Wifi className="w-3.5 h-3.5" />
          <div className="flex items-center gap-0.5">
            <span className="text-[10px]">98%</span>
            <Battery className="w-3.5 h-3.5 text-[#a8c7fa]" />
          </div>
        </div>
      </div>

      {/* 2. ANDROID APP TABS BAR */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-[#1b1b1f] border-b border-white/8 select-none overflow-x-auto no-scrollbar gap-1">
        {[
          { id: 'chat', label: 'Messages', icon: MessageSquare },
          { id: 'notes', label: 'Notes', icon: StickyNote },
          { id: 'search', label: 'Search', icon: Search },
          { id: 'speed_test', label: 'WPM Test', icon: Zap },
          { id: 'setup_guide', label: 'APK Setup', icon: Smartphone },
        ].map((app) => {
          const Icon = app.icon;
          const isActive = activeApp === app.id;
          return (
            <button
              key={app.id}
              type="button"
              onClick={() => onSelectApp(app.id as AndroidAppId)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                isActive
                  ? 'bg-[#a8c7fa] text-[#062e6f] font-semibold'
                  : 'bg-[#232429] text-[#c4c6d0] hover:bg-[#2f3036] hover:text-white'
              }`}
            >
              <Icon className="w-3 h-3" />
              <span>{app.label}</span>
            </button>
          );
        })}
      </div>

      {/* 3. ACTIVE APP SCREEN CONTENT */}
      <div className="flex-1 overflow-y-auto p-3 flex flex-col no-scrollbar">
        {/* APP 1: MESSAGES */}
        {activeApp === 'chat' && (
          <div className="flex-1 flex flex-col justify-between space-y-3">
            <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-[#1b1b1f] border border-white/8">
              <TextQBoardLogo size="sm" showLabel={false} />
              <div className="flex-1">
                <p className="text-xs font-semibold text-white">Messages (বাংলা • English)</p>
                <p className="text-[11px] text-[#9aa0a6]">Gboard Material 3 Input Active</p>
              </div>
            </div>

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
                        ? 'bg-[#a8c7fa] text-[#062e6f] font-medium rounded-br-sm'
                        : 'bg-[#232429] text-[#e3e2e6] rounded-bl-sm border border-white/5'
                    }`}
                  >
                    {msg.text}
                  </div>
                  <span className="text-[9px] text-[#9aa0a6] px-1 mt-0.5">{msg.time}</span>
                </div>
              ))}
            </div>

            <div className="pt-1">
              <div className="flex items-center gap-1.5 bg-[#1b1b1f] border border-white/12 rounded-full px-3 py-1.5">
                <input
                  ref={inputRef as React.RefObject<HTMLInputElement>}
                  type="text"
                  inputMode="none"
                  value={inputText}
                  onChange={(e) => {
                    onInputChange(e.target.value);
                    onCursorChange(e.target.selectionStart || 0);
                  }}
                  onFocus={onInputFocus}
                  onClick={(e) => onCursorChange((e.target as HTMLInputElement).selectionStart || 0)}
                  onKeyUp={(e) => onCursorChange((e.target as HTMLInputElement).selectionStart || 0)}
                  placeholder="Text message"
                  className="flex-1 bg-transparent text-xs text-white placeholder-[#9aa0a6] outline-none"
                />
                <button
                  type="button"
                  onClick={handleSendChat}
                  className="w-7 h-7 rounded-full bg-[#a8c7fa] text-[#062e6f] flex items-center justify-center hover:bg-[#b8d2fc]"
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
              <h3 className="text-xs font-semibold text-[#a8c7fa]">Keep Notes</h3>
              <button
                type="button"
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
                className="px-2.5 py-1 rounded-lg bg-[#2f3036] text-[#a8c7fa] text-xs font-medium flex items-center gap-1 hover:bg-[#373940]"
              >
                <Plus className="w-3 h-3" />
                <span>New</span>
              </button>
            </div>

            <div className="flex-1 flex flex-col bg-[#1b1b1f] rounded-xl p-3 border border-white/8 space-y-2">
              <input
                type="text"
                value={notes.find((n) => n.id === selectedNoteId)?.title || 'Note'}
                onChange={(e) => {
                  const t = e.target.value;
                  setNotes((prev) =>
                    prev.map((n) => (n.id === selectedNoteId ? { ...n, title: t } : n))
                  );
                }}
                className="w-full bg-transparent font-semibold text-sm text-white outline-none border-b border-white/10 pb-1"
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
                placeholder="Start typing your note..."
                className="w-full flex-1 bg-transparent text-xs text-[#e3e2e6] placeholder-[#9aa0a6] resize-none outline-none leading-relaxed"
              />
            </div>
          </div>
        )}

        {/* APP 3: SEARCH */}
        {activeApp === 'search' && (
          <div className="flex-1 flex flex-col space-y-3">
            <div className="flex items-center gap-2 bg-[#1b1b1f] border border-white/12 rounded-full px-3 py-2">
              <Search className="w-4 h-4 text-[#a8c7fa]" />
              <input
                ref={inputRef as React.RefObject<HTMLInputElement>}
                type="text"
                inputMode="none"
                value={inputText}
                onChange={(e) => {
                  onInputChange(e.target.value);
                  onCursorChange(e.target.selectionStart || 0);
                }}
                onFocus={onInputFocus}
                placeholder="Search or type URL..."
                className="flex-1 bg-transparent text-xs text-white placeholder-[#9aa0a6] outline-none"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleRunSearch();
                }}
              />
              <button
                type="button"
                onClick={handleRunSearch}
                className="px-2.5 py-0.5 rounded-full bg-[#a8c7fa] text-[#062e6f] font-semibold text-xs"
              >
                Go
              </button>
            </div>

            <div className="flex-1 space-y-2 overflow-y-auto">
              {isSearching ? (
                <div className="text-center py-6 text-xs text-[#a8c7fa]">
                  Searching for "{inputText}"...
                </div>
              ) : searchResults.length > 0 ? (
                searchResults.map((res, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-xl bg-[#1b1b1f] border border-white/8 text-xs text-[#e3e2e6]"
                  >
                    <p className="font-semibold text-[#a8c7fa] text-xs mb-0.5">Search Result #{i + 1}</p>
                    <p className="text-[#c4c6d0] text-[11px] leading-relaxed">{res}</p>
                  </div>
                ))
              ) : (
                <div className="p-4 rounded-xl bg-[#1b1b1f] border border-white/8 text-center text-[#9aa0a6] text-xs space-y-2">
                  <Search className="w-7 h-7 mx-auto text-[#9aa0a6]" />
                  <p>Type any query using Text Q Board and press Enter.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* APP 4: SPEED TEST */}
        {activeApp === 'speed_test' && (
          <div className="flex-1 flex flex-col space-y-3">
            <div className="p-3 rounded-xl bg-[#1b1b1f] border border-white/8 flex items-center justify-around">
              <div className="text-center">
                <p className="text-[10px] font-semibold text-[#9aa0a6] uppercase">Speed</p>
                <p className="text-xl font-bold text-[#a8c7fa] tabular-nums">{wpm} <span className="text-[10px]">WPM</span></p>
              </div>
              <div className="h-8 w-px bg-white/10" />
              <div className="text-center">
                <p className="text-[10px] font-semibold text-[#9aa0a6] uppercase">Accuracy</p>
                <p className="text-xl font-bold text-[#6dd58c] tabular-nums">{accuracy}%</p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#1b1b1f] border border-white/8 text-xs text-[#c4c6d0] leading-relaxed">
              <p className="text-[10px] font-semibold text-[#a8c7fa] mb-1">PROMPT TO TYPE:</p>
              <p className="font-mono bg-[#111318] p-2 rounded-lg text-[#e3e2e6]">{testText}</p>
            </div>

            <div className="flex-1">
              <textarea
                ref={inputRef as React.RefObject<HTMLTextAreaElement>}
                inputMode="none"
                value={inputText}
                onChange={(e) => {
                  onInputChange(e.target.value);
                  onCursorChange(e.target.selectionStart || 0);
                }}
                onFocus={onInputFocus}
                placeholder="Start typing the prompt above..."
                className="w-full h-24 p-2.5 rounded-xl bg-[#1b1b1f] border border-white/12 text-xs text-white resize-none outline-none"
              />
            </div>

            <button
              type="button"
              onClick={() => {
                onInputChange('');
                setTestStarted(false);
                setStartTime(null);
                setWpm(0);
                setAccuracy(100);
              }}
              className="py-1.5 rounded-xl bg-[#2f3036] text-xs font-medium text-[#e3e2e6] hover:bg-[#373940] flex items-center justify-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Test</span>
            </button>
          </div>
        )}

        {/* APP 5: ANDROID SETUP GUIDE & APK DOWNLOAD */}
        {activeApp === 'setup_guide' && (
          <div className="flex-1 space-y-3 text-xs text-[#e3e2e6] overflow-y-auto pr-1">
            <div className="p-3.5 rounded-xl bg-[#1b1b1f] border border-white/8 space-y-2.5">
              <TextQBoardLogo size="sm" />
              <p className="text-[11px] text-[#c4c6d0] leading-relaxed">
                Install the compiled APK from GitHub Actions to use <b>Text Q Board</b> as your system-wide Android keyboard across all apps.
              </p>
              <a
                href="https://github.com/shakil603/Text-Q-Board/actions"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2 px-3 rounded-lg bg-[#a8c7fa] text-[#062e6f] font-semibold text-xs flex items-center justify-center gap-1.5 hover:bg-[#b8d2fc] transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Android APK</span>
              </a>
            </div>

            <div className="space-y-2">
              <div className="p-3 rounded-xl bg-[#1b1b1f] border border-white/8 flex items-center justify-between gap-2.5">
                <div>
                  <p className="font-semibold text-white">01. Enable in System Settings</p>
                  <p className="text-[11px] text-[#9aa0a6]">Turn on Text Q Board in On-screen Keyboards</p>
                </div>
                <button
                  type="button"
                  onClick={() => openAndroidInputMethodSettings()}
                  className="px-2.5 py-1.5 rounded-lg bg-[#2f3036] text-[#a8c7fa] font-semibold text-[11px] shrink-0"
                >
                  Enable
                </button>
              </div>

              <div className="p-3 rounded-xl bg-[#1b1b1f] border border-white/8 flex items-center justify-between gap-2.5">
                <div>
                  <p className="font-semibold text-white">02. Select Input Method</p>
                  <p className="text-[11px] text-[#9aa0a6]">Choose Text Q Board in the input method picker</p>
                </div>
                <button
                  type="button"
                  onClick={() => showAndroidInputMethodPicker()}
                  className="px-2.5 py-1.5 rounded-lg bg-[#2f3036] text-[#a8c7fa] font-semibold text-[11px] shrink-0"
                >
                  Select
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 4. KEYBOARD CONTAINER SLOT */}
      <div className="w-full z-30">
        {children}
      </div>

      {/* 5. ANDROID NAVIGATION BAR */}
      <div className="h-4 w-full bg-[#1b1b1f] flex items-center justify-center select-none">
        <div className="w-32 h-1 bg-white/25 rounded-full" />
      </div>
    </div>
  );
};
