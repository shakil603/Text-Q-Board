import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Mic, MicOff, X, Check, Globe, ShieldAlert } from 'lucide-react';
import { ThemeConfig } from '../types/keyboard';
import {
  hasNativeVoiceBridge,
  hasNativeMicPermission,
  requestNativeMicPermission,
  startNativeVoiceListening,
  stopNativeVoiceListening,
} from '../utils/androidBridge';

interface VoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertVoiceText: (text: string) => void;
  theme: ThemeConfig;
  activeLanguage: string;
}

const VOICE_LANGUAGES = [
  { code: 'bn-BD', label: 'বাংলা (Bangladesh)' },
  { code: 'en-US', label: 'English (US)' },
  { code: 'hi-IN', label: 'हिन्दी (India)' },
  { code: 'ar-SA', label: 'العربية (Arabic)' },
  { code: 'es-ES', label: 'Español' },
  { code: 'fr-FR', label: 'Français' },
  { code: 'de-DE', label: 'Deutsch' },
  { code: 'ru-RU', label: 'Русский' },
];

const QUICK_VOICE_SAMPLES: Record<string, string[]> = {
  'bn-BD': ['আমার সোনার বাংলা', 'আপনি কেমন আছেন?', 'ধন্যবাদ আপনাকে'],
  'en-US': ['Hello how are you', 'On my way now', 'Thank you very much'],
};

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
  const [statusMessage, setStatusMessage] = useState('Tap microphone to speak');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [needsPermission, setNeedsPermission] = useState(false);
  const [audioLevels, setAudioLevels] = useState<number[]>([22, 36, 52, 36, 22]);

  const [selectedLang, setSelectedLang] = useState(() => {
    if (activeLanguage.startsWith('bn')) return 'bn-BD';
    if (activeLanguage.startsWith('hi')) return 'hi-IN';
    if (activeLanguage.startsWith('ar')) return 'ar-SA';
    if (activeLanguage.startsWith('es')) return 'es-ES';
    if (activeLanguage.startsWith('fr')) return 'fr-FR';
    if (activeLanguage.startsWith('de')) return 'de-DE';
    if (activeLanguage.startsWith('ru')) return 'ru-RU';
    return 'en-US';
  });

  const recognitionRef = useRef<any>(null);
  const waveIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const onInsertRef = useRef(onInsertVoiceText);

  useEffect(() => {
    onInsertRef.current = onInsertVoiceText;
  }, [onInsertVoiceText]);

  // Sync default language when activeLanguage changes
  useEffect(() => {
    if (activeLanguage.startsWith('bn')) setSelectedLang('bn-BD');
    else if (activeLanguage.startsWith('hi')) setSelectedLang('hi-IN');
    else if (activeLanguage.startsWith('ar')) setSelectedLang('ar-SA');
    else if (activeLanguage.startsWith('es')) setSelectedLang('es-ES');
    else if (activeLanguage.startsWith('fr')) setSelectedLang('fr-FR');
    else if (activeLanguage.startsWith('de')) setSelectedLang('de-DE');
    else if (activeLanguage.startsWith('ru')) setSelectedLang('ru-RU');
    else setSelectedLang('en-US');
  }, [activeLanguage]);

  const stopWaveformAnimation = useCallback(() => {
    if (waveIntervalRef.current) {
      clearInterval(waveIntervalRef.current);
      waveIntervalRef.current = null;
    }
    setAudioLevels([20, 28, 36, 28, 20]);
  }, []);

  const startWaveformAnimation = useCallback(() => {
    if (waveIntervalRef.current) clearInterval(waveIntervalRef.current);
    waveIntervalRef.current = setInterval(() => {
      setAudioLevels([
        25 + Math.round(Math.random() * 55),
        35 + Math.round(Math.random() * 60),
        45 + Math.round(Math.random() * 55),
        35 + Math.round(Math.random() * 60),
        25 + Math.round(Math.random() * 55),
      ]);
    }, 110);
  }, []);

  const stopAllRecognition = useCallback(() => {
    stopNativeVoiceListening();
    if (recognitionRef.current) {
      try {
        recognitionRef.current.onend = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.onresult = null;
        recognitionRef.current.stop();
      } catch {}
      recognitionRef.current = null;
    }
    stopWaveformAnimation();
    setIsListening(false);
  }, [stopWaveformAnimation]);

  // Main function to activate microphone (Android Native SpeechRecognizer OR Web Speech API)
  const startListening = useCallback(async () => {
    setErrorMessage(null);
    setNeedsPermission(false);
    setInterimText('');

    // 1. Check if running inside our Native Android APK (IME or MainActivity)
    if (hasNativeVoiceBridge()) {
      if (!hasNativeMicPermission()) {
        setNeedsPermission(true);
        setStatusMessage('Microphone permission required');
        requestNativeMicPermission();
        return;
      }
      setStatusMessage('Listening... Speak now');
      setIsListening(true);
      startWaveformAnimation();
      startNativeVoiceListening(selectedLang);
      return;
    }

    // 2. Running in Web Browser: Use Web SpeechRecognition API directly (without locking mic via getUserMedia)
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      // Fallback: request microphone permission via getUserMedia to verify mic access
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        try {
          setStatusMessage('Activating microphone...');
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          stream.getTracks().forEach((t) => t.stop());
          setIsListening(true);
          startWaveformAnimation();
          setStatusMessage('Microphone active — tap a phrase below or speak in Chrome/Android');
        } catch {
          setNeedsPermission(true);
          setErrorMessage('Microphone permission blocked. Allow mic access or tap a phrase below.');
        }
      } else {
        setErrorMessage('Voice API unavailable in this browser. Tap a quick phrase below or use the Android APK.');
      }
      return;
    }

    try {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.onend = null;
          recognitionRef.current.stop();
        } catch {}
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = selectedLang;

      setStatusMessage('Listening... Speak now');
      setIsListening(true);
      startWaveformAnimation();

      recognition.onstart = () => {
        setIsListening(true);
        setErrorMessage(null);
        setStatusMessage('Listening... Speak now');
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

        if (currentFinal.trim()) {
          const clean = currentFinal.trim();
          setTranscript((prev) => (prev ? prev + ' ' + clean : clean));
          onInsertRef.current(clean);
        }
        setInterimText(currentInterim);
      };

      recognition.onerror = (event: any) => {
        const code = event?.error;
        if (code === 'not-allowed' || code === 'service-not-allowed') {
          setNeedsPermission(true);
          setErrorMessage('Microphone permission blocked. Please allow microphone access in your browser.');
          stopAllRecognition();
        } else if (code === 'no-speech') {
          setStatusMessage('No speech detected. Tap microphone to speak again.');
          stopWaveformAnimation();
          setIsListening(false);
        } else if (code === 'audio-capture') {
          setErrorMessage('No microphone hardware found. You can tap a quick voice phrase below.');
          stopWaveformAnimation();
          setIsListening(false);
        } else if (code !== 'aborted') {
          setStatusMessage('Tap microphone to speak');
          stopWaveformAnimation();
          setIsListening(false);
        }
      };

      recognition.onend = () => {
        stopWaveformAnimation();
        setIsListening(false);
        setStatusMessage('Tap microphone to speak');
      };

      recognition.start();
      recognitionRef.current = recognition;
    } catch (e: any) {
      stopWaveformAnimation();
      setIsListening(false);
      setErrorMessage('Tap microphone to activate voice typing');
    }
  }, [selectedLang, startWaveformAnimation, stopAllRecognition, stopWaveformAnimation]);

  // Register listener for Native Android SpeechRecognizer events
  useEffect(() => {
    if (!isOpen) return;

    window.dispatchNativeVoiceEvent = (type: string, payload: string) => {
      switch (type) {
        case 'listening':
          setIsListening(true);
          setNeedsPermission(false);
          setErrorMessage(null);
          setStatusMessage('Listening... Speak now');
          startWaveformAnimation();
          break;
        case 'rms': {
          const rms = parseFloat(payload) || 0;
          const norm = Math.max(18, Math.min(100, Math.round((rms + 2) * 9)));
          setAudioLevels([
            Math.max(18, norm * 0.6),
            Math.max(24, norm * 0.85),
            norm,
            Math.max(24, norm * 0.85),
            Math.max(18, norm * 0.6),
          ]);
          break;
        }
        case 'partial':
          setInterimText(payload);
          break;
        case 'final':
          setInterimText('');
          if (payload && payload.trim()) {
            const clean = payload.trim();
            setTranscript((prev) => (prev ? prev + ' ' + clean : clean));
            onInsertRef.current(clean);
          }
          stopWaveformAnimation();
          setIsListening(false);
          setStatusMessage('Tap microphone to speak more');
          break;
        case 'permission_requested':
          setNeedsPermission(true);
          stopWaveformAnimation();
          setIsListening(false);
          setStatusMessage(payload || 'Please allow microphone access.');
          break;
        case 'permission_granted':
          setNeedsPermission(false);
          setErrorMessage(null);
          startListening();
          break;
        case 'error':
          stopWaveformAnimation();
          setIsListening(false);
          setErrorMessage(payload || 'Tap microphone to try again');
          setStatusMessage('Tap microphone to retry');
          break;
        case 'end':
          stopWaveformAnimation();
          setIsListening(false);
          setStatusMessage('Tap microphone to speak');
          break;
      }
    };

    return () => {
      window.dispatchNativeVoiceEvent = undefined;
    };
  }, [isOpen, startListening, startWaveformAnimation, stopWaveformAnimation]);

  // Automatically start listening when opened or language switched
  useEffect(() => {
    if (!isOpen) {
      stopAllRecognition();
      setTranscript('');
      setInterimText('');
      setErrorMessage(null);
      return;
    }

    startListening();

    return () => {
      stopAllRecognition();
    };
  }, [isOpen, selectedLang, startListening, stopAllRecognition]);

  const handleDone = () => {
    if (interimText.trim()) {
      onInsertVoiceText(interimText.trim());
    }
    stopAllRecognition();
    onClose();
  };

  if (!isOpen) return null;

  const samplePhrases =
    QUICK_VOICE_SAMPLES[selectedLang] || QUICK_VOICE_SAMPLES['en-US'];

  return (
    <div
      className={`w-full h-[250px] flex flex-col justify-between p-3.5 select-none border-t border-white/10 ${theme.boardBg}`}
    >
      {/* Top Bar: Language Selector & Close */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Globe className={`w-4 h-4 ${theme.textSecondary}`} />
          <select
            value={selectedLang}
            onChange={(e) => setSelectedLang(e.target.value)}
            className={`text-xs font-medium rounded-lg px-2.5 py-1.5 outline-none border border-white/10 ${theme.keyBg} ${theme.textPrimary}`}
          >
            {VOICE_LANGUAGES.map((l) => (
              <option key={l.code} value={l.code} className="bg-[#1b1b1f] text-white">
                {l.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleDone}
            className={`px-3 py-1 rounded-full text-xs flex items-center gap-1 ${theme.accent} ${theme.accentText}`}
          >
            <Check className="w-3.5 h-3.5" />
            <span>Done</span>
          </button>
          <button
            type="button"
            onClick={() => {
              stopAllRecognition();
              onClose();
            }}
            className={`w-8 h-8 rounded-full flex items-center justify-center ${theme.keySpecialBg} ${theme.textSecondary} hover:opacity-80`}
            title="Close Voice Typing"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Center Gboard Voice Microphone & Live Waveform */}
      <div className="flex flex-col items-center justify-center gap-2 my-auto">
        <div className="flex items-center gap-4">
          {/* Left Audio Bars */}
          <div className="flex items-center gap-1 h-8">
            {audioLevels.slice(0, 2).map((lvl, idx) => (
              <div
                key={`l-${idx}`}
                style={{ height: `${isListening ? lvl : 20}%` }}
                className="w-1 rounded-full bg-[#a8c7fa] transition-all duration-100"
              />
            ))}
          </div>

          {/* Main Microphone Button */}
          <button
            type="button"
            onClick={() => {
              if (isListening) {
                stopAllRecognition();
                setStatusMessage('Paused. Tap microphone to speak');
              } else {
                startListening();
              }
            }}
            className={`w-14 h-14 rounded-full flex items-center justify-center transition-all active:scale-95 ${
              isListening
                ? `${theme.accent} ${theme.accentText}`
                : `${theme.keyBg} ${theme.textPrimary} border border-white/10`
            }`}
            title={isListening ? 'Stop Listening' : 'Start Listening'}
          >
            {isListening ? (
              <Mic className="w-6 h-6" />
            ) : (
              <MicOff className="w-6 h-6 opacity-80" />
            )}
          </button>

          {/* Right Audio Bars */}
          <div className="flex items-center gap-1 h-8">
            {audioLevels.slice(2, 4).map((lvl, idx) => (
              <div
                key={`r-${idx}`}
                style={{ height: `${isListening ? lvl : 20}%` }}
                className="w-1 rounded-full bg-[#a8c7fa] transition-all duration-100"
              />
            ))}
          </div>
        </div>

        {/* Status or Permission Action */}
        {needsPermission ? (
          <button
            type="button"
            onClick={() => {
              if (hasNativeVoiceBridge()) {
                requestNativeMicPermission();
              } else {
                startListening();
              }
            }}
            className="px-3.5 py-1.5 rounded-full bg-amber-500/20 text-amber-200 border border-amber-400/30 text-xs font-medium flex items-center gap-1.5"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Allow Microphone Access</span>
          </button>
        ) : (
          <p className={`text-xs font-medium text-center px-2 ${theme.textSecondary}`}>
            {errorMessage || statusMessage}
          </p>
        )}

        {/* Quick Dictation Phrases (Helpful when testing without mic or quick insert) */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar max-w-full px-2 pt-0.5">
          {samplePhrases.map((phrase) => (
            <button
              key={phrase}
              type="button"
              onClick={() => {
                setTranscript((prev) => (prev ? prev + ' ' + phrase : phrase));
                onInsertVoiceText(phrase);
              }}
              className={`px-2.5 py-1 rounded-full text-[11px] whitespace-nowrap border border-white/8 transition-colors ${theme.keySpecialBg} ${theme.textSecondary} hover:opacity-90 active:scale-95`}
            >
              “{phrase}”
            </button>
          ))}
        </div>
      </div>

      {/* Bottom Live Transcript Preview Bar */}
      <div
        className={`w-full min-h-[38px] px-3 py-1.5 rounded-xl flex items-center justify-between gap-2 ${theme.keySpecialBg}`}
      >
        <div className="flex-1 text-xs truncate">
          {transcript || interimText ? (
            <span className={theme.textPrimary}>
              {transcript}{' '}
              <span className="opacity-65 italic">{interimText}</span>
            </span>
          ) : (
            <span className={`opacity-55 ${theme.textSecondary}`}>
              Speak in {VOICE_LANGUAGES.find((l) => l.code === selectedLang)?.label || selectedLang}...
            </span>
          )}
        </div>

        {(transcript || interimText) && (
          <button
            type="button"
            onClick={() => {
              setTranscript('');
              setInterimText('');
            }}
            className={`text-[11px] px-2 py-0.5 rounded ${theme.textSecondary} hover:opacity-100 opacity-70`}
          >
            Clear
          </button>
        )}
      </div>
    </div>
  );
};
