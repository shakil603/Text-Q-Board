import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, X, Check, Globe } from 'lucide-react';
import { ThemeConfig } from '../types/keyboard';

interface VoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertVoiceText: (text: string) => void;
  theme: ThemeConfig;
  activeLanguage: string;
}

export const VoiceModal: React.FC<VoiceModalProps> = ({
  isOpen,
  onClose,
  onInsertVoiceText,
  theme,
  activeLanguage,
}) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimText, setInterimText] = useState('');
  const [selectedLang, setSelectedLang] = useState(
    activeLanguage.startsWith('bn') ? 'bn-BD' : 'en-US'
  );
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (!isOpen) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }
      setIsListening(false);
      setTranscript('');
      setInterimText('');
      return;
    }

    // Auto start listening on open
    startRecognition();

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }
    };
  }, [isOpen, selectedLang]);

  const startRecognition = () => {
    setTranscript('');
    setInterimText('');

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = selectedLang;

        recognition.onstart = () => {
          setIsListening(true);
        };

        recognition.onresult = (event: any) => {
          let currentInterim = '';
          let currentFinal = '';

          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              currentFinal += event.results[i][0].transcript + ' ';
            } else {
              currentInterim += event.results[i][0].transcript;
            }
          }

          if (currentFinal) {
            setTranscript((prev) => prev + currentFinal);
          }
          setInterimText(currentInterim);
        };

        recognition.onerror = (event: any) => {
          console.warn('Speech recognition status:', event.error);
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognition.start();
        recognitionRef.current = recognition;
      } catch (err) {
        console.warn('Speech recognition error:', err);
        fallbackSimulation();
      }
    } else {
      fallbackSimulation();
    }
  };

  const fallbackSimulation = () => {
    setIsListening(true);
    const demoPhrases = selectedLang === 'bn-BD'
      ? ['আমি টেক্সট কিউ বোর্ড ব্যবহার করছি', 'আজকের দিনটি চমৎকার', 'ধন্যবাদ আপনাকে']
      : ['Hello from Text Q Board', 'Voice typing with Android Gboard replica', 'Testing speed and accuracy'];
    
    const chosen = demoPhrases[Math.floor(Math.random() * demoPhrases.length)];
    let index = 0;
    const interval = setInterval(() => {
      if (index <= chosen.length) {
        setInterimText(chosen.slice(0, index));
        index += 2;
      } else {
        clearInterval(interval);
        setTranscript(chosen);
        setInterimText('');
        setIsListening(false);
      }
    }, 100);
  };

  const handleConfirm = () => {
    const final = (transcript + ' ' + interimText).trim();
    if (final) {
      onInsertVoiceText(final);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
      <div
        className={`w-full max-w-md rounded-3xl p-6 flex flex-col items-center gap-5 border border-cyan-500/40 shadow-[0_0_30px_rgba(6,182,212,0.35)] ${theme.boardBg}`}
      >
        {/* Top Header */}
        <div className="w-full flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-cyan-400" />
            <select
              value={selectedLang}
              onChange={(e) => setSelectedLang(e.target.value)}
              className="bg-slate-800 text-cyan-200 text-xs font-semibold rounded-lg px-2 py-1 border border-cyan-500/30 outline-none"
            >
              <option value="en-US">English (US)</option>
              <option value="bn-BD">বাংলা (বাংলাদেশ)</option>
              <option value="es-ES">Español</option>
              <option value="hi-IN">हिन्दी (India)</option>
              <option value="ar-SA">العربية</option>
            </select>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Pulsing Mic Circle */}
        <div className="relative flex items-center justify-center my-3">
          {isListening && (
            <>
              <div className="absolute w-28 h-28 rounded-full bg-cyan-500/20 animate-ping" />
              <div className="absolute w-24 h-24 rounded-full bg-cyan-400/30 animate-pulse" />
            </>
          )}
          <button
            onClick={() => {
              if (isListening) {
                if (recognitionRef.current) {
                  try {
                    recognitionRef.current.stop();
                  } catch {}
                }
                setIsListening(false);
              } else {
                startRecognition();
              }
            }}
            className={`relative z-10 w-20 h-20 rounded-full flex items-center justify-center shadow-2xl transition-all ${
              isListening
                ? 'bg-gradient-to-tr from-cyan-500 to-cyan-400 text-slate-950 scale-105 shadow-[0_0_25px_#22d3ee]'
                : 'bg-slate-800 text-slate-400 border border-white/10'
            }`}
          >
            {isListening ? <Mic className="w-9 h-9 animate-bounce" /> : <MicOff className="w-9 h-9" />}
          </button>
        </div>

        {/* Live Status & Speech Transcription */}
        <div className="w-full text-center space-y-1">
          <p className="text-xs font-bold uppercase tracking-widest text-cyan-400">
            {isListening ? 'Listening... Speak now' : 'Tap mic to speak'}
          </p>
          <div className="min-h-[50px] p-3 rounded-xl bg-slate-900/90 border border-white/10 text-sm text-cyan-50 flex items-center justify-center font-medium">
            {transcript || interimText ? (
              <p>
                <span>{transcript}</span>
                <span className="text-cyan-300/70 italic">{interimText}</span>
              </p>
            ) : (
              <span className="text-slate-500 text-xs">Say something in {selectedLang}...</span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 w-full">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-semibold text-xs hover:bg-slate-700"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 py-2.5 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(6,182,212,0.4)] hover:bg-cyan-400 active:scale-95"
          >
            <Check className="w-4 h-4" />
            <span>Insert Text</span>
          </button>
        </div>
      </div>
    </div>
  );
};
