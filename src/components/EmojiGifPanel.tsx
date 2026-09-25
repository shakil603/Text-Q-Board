import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Delete, 
  Sparkles, 
  Smile, 
  Image as ImageIcon, 
  Heart, 
  X, 
  CornerDownLeft 
} from 'lucide-react';
import { ThemeConfig } from '../types/keyboard';
import { 
  EMOJI_CATEGORIES, 
  EMOJI_DATABASE, 
  EMOJI_KITCHEN_COMBOS, 
  KAOMOJI_CATEGORIES, 
  SAMPLE_GIFS 
} from '../data/emojis';

interface EmojiGifPanelProps {
  onInsertEmoji: (emoji: string) => void;
  onBackspace: () => void;
  onClose: () => void;
  theme: ThemeConfig;
}

type TabType = 'emoji' | 'kitchen' | 'stickers' | 'gif' | 'kaomoji';

export const EmojiGifPanel: React.FC<EmojiGifPanelProps> = ({
  onInsertEmoji,
  onBackspace,
  onClose,
  theme,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('emoji');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('smileys');
  const [recentEmojis, setRecentEmojis] = useState<string[]>([
    '😀', '😂', '🔥', '❤️', '👍', '✨', '🇧🇩', '🥰', '🙏', '🎉'
  ]);

  // Handle emoji click & update recents
  const handleEmojiClick = (char: string) => {
    onInsertEmoji(char);
    setRecentEmojis((prev) => {
      const next = [char, ...prev.filter((e) => e !== char)].slice(0, 15);
      return next;
    });
  };

  // Filtered emojis
  const filteredEmojis = useMemo(() => {
    if (!searchQuery.trim()) {
      return EMOJI_DATABASE.filter((e) => e.category === selectedCategory);
    }
    const q = searchQuery.toLowerCase();
    return EMOJI_DATABASE.filter(
      (e) =>
        e.name.toLowerCase().includes(q) ||
        e.keywords.some((k) => k.toLowerCase().includes(q))
    );
  }, [searchQuery, selectedCategory]);

  // Filtered kitchen mashups
  const filteredKitchen = useMemo(() => {
    if (!searchQuery.trim()) return EMOJI_KITCHEN_COMBOS;
    const q = searchQuery.toLowerCase();
    return EMOJI_KITCHEN_COMBOS.filter(
      (k) =>
        k.title.toLowerCase().includes(q) ||
        k.emoji1.includes(q) ||
        k.emoji2.includes(q)
    );
  }, [searchQuery]);

  return (
    <div
      className={`h-[285px] w-full flex flex-col select-none border-t border-white/10 ${theme.boardBg}`}
    >
      {/* Search & Action Header */}
      <div className="flex items-center gap-1.5 px-3 py-1.5 border-b border-white/5 bg-black/20">
        <div className="flex-1 flex items-center bg-slate-800/90 rounded-full px-3 py-1 gap-2 border border-white/10">
          <Search className="w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Search ${activeTab}...`}
            className="flex-1 bg-transparent text-xs text-white placeholder-slate-400 outline-none"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="text-slate-400 hover:text-white">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <button
          onClick={onBackspace}
          className="p-1.5 rounded-full bg-slate-800 text-slate-300 hover:bg-cyan-900/50 hover:text-cyan-300 active:scale-90 transition-transform"
          title="Backspace"
        >
          <Delete className="w-4 h-4" />
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-2 no-scrollbar">
        {/* 1. EMOJI TAB */}
        {activeTab === 'emoji' && (
          <div className="space-y-3">
            {!searchQuery && (
              <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 px-1">
                  Recently Used
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {recentEmojis.map((em, idx) => (
                    <button
                      key={`${em}-${idx}`}
                      onClick={() => handleEmojiClick(em)}
                      className="w-9 h-9 flex items-center justify-center text-xl rounded-lg hover:bg-white/10 active:scale-125 transition-transform"
                    >
                      {em}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div>
              {!searchQuery && (
                <div className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider mb-1 px-1">
                  {EMOJI_CATEGORIES.find((c) => c.id === selectedCategory)?.label}
                </div>
              )}
              <div className="grid grid-cols-7 gap-1">
                {filteredEmojis.map((em) => (
                  <button
                    key={em.name}
                    onClick={() => handleEmojiClick(em.char)}
                    className="w-10 h-10 flex items-center justify-center text-2xl rounded-lg hover:bg-cyan-500/20 active:scale-125 transition-all"
                    title={em.name}
                  >
                    {em.char}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 2. EMOJI KITCHEN MASHUPS TAB */}
        {activeTab === 'kitchen' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <span className="text-[11px] font-bold text-cyan-400 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Gboard Emoji Kitchen Mashups</span>
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {filteredKitchen.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleEmojiClick(item.result)}
                  className="p-2 rounded-xl bg-slate-800/80 border border-cyan-500/30 hover:border-cyan-400 flex flex-col items-center justify-center gap-1 active:scale-95 transition-all hover:shadow-[0_0_10px_rgba(6,182,212,0.3)]"
                >
                  <span className="text-2xl">{item.result}</span>
                  <span className="text-[10px] text-slate-300 truncate max-w-[80px]">
                    {item.title}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 3. KAOMOJI TAB */}
        {activeTab === 'kaomoji' && (
          <div className="space-y-3">
            {KAOMOJI_CATEGORIES.map((cat) => (
              <div key={cat.name}>
                <div className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider mb-1 px-1">
                  {cat.name}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {cat.list.map((km, i) => (
                    <button
                      key={i}
                      onClick={() => handleEmojiClick(km)}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-800/90 text-xs text-cyan-100 hover:bg-cyan-900/50 hover:text-cyan-200 border border-white/5 active:scale-95 transition-transform"
                    >
                      {km}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 4. GIFS TAB */}
        {activeTab === 'gif' && (
          <div className="grid grid-cols-2 gap-2">
            {SAMPLE_GIFS.map((gif) => (
              <div
                key={gif.id}
                onClick={() => handleEmojiClick(`[GIF: ${gif.title}]`)}
                className="group relative rounded-lg overflow-hidden border border-cyan-500/30 cursor-pointer active:scale-95 transition-transform aspect-video"
              >
                <img
                  src={gif.url}
                  alt={gif.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-1.5">
                  <span className="text-[10px] text-white font-medium truncate">{gif.title}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Category Selector & Navigation Footer */}
      <div className="h-11 flex items-center justify-between px-2 bg-black/40 border-t border-white/5">
        {/* ABC Return Button */}
        <button
          onClick={onClose}
          className="px-3 py-1 rounded-lg bg-slate-800 text-xs font-bold text-cyan-300 hover:bg-slate-700 active:scale-95"
        >
          ABC
        </button>

        {/* Panel Main Tabs */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveTab('emoji')}
            className={`p-1.5 rounded-lg transition-colors ${
              activeTab === 'emoji' ? 'bg-cyan-500/30 text-cyan-300' : 'text-slate-400 hover:text-white'
            }`}
            title="Emojis"
          >
            <Smile className="w-4 h-4" />
          </button>
          <button
            onClick={() => setActiveTab('kitchen')}
            className={`p-1.5 rounded-lg transition-colors ${
              activeTab === 'kitchen' ? 'bg-cyan-500/30 text-cyan-300' : 'text-slate-400 hover:text-white'
            }`}
            title="Emoji Kitchen"
          >
            <Sparkles className="w-4 h-4" />
          </button>
          <button
            onClick={() => setActiveTab('kaomoji')}
            className={`px-2 py-1 rounded-lg text-xs font-bold transition-colors ${
              activeTab === 'kaomoji' ? 'bg-cyan-500/30 text-cyan-300' : 'text-slate-400 hover:text-white'
            }`}
            title="Kaomoji"
          >
            ^_^
          </button>
          <button
            onClick={() => setActiveTab('gif')}
            className={`p-1.5 rounded-lg transition-colors ${
              activeTab === 'gif' ? 'bg-cyan-500/30 text-cyan-300' : 'text-slate-400 hover:text-white'
            }`}
            title="GIFs"
          >
            <ImageIcon className="w-4 h-4" />
          </button>
        </div>

        {/* Categories if on Emoji Tab */}
        {activeTab === 'emoji' && !searchQuery ? (
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar max-w-[140px]">
            {EMOJI_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`p-1 text-sm rounded ${
                  selectedCategory === cat.id ? 'bg-cyan-500/40 scale-110' : 'opacity-60 hover:opacity-100'
                }`}
              >
                {cat.icon}
              </button>
            ))}
          </div>
        ) : (
          <div className="w-10" />
        )}
      </div>
    </div>
  );
};
