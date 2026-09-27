import { KeyboardSettings } from '../types/keyboard';

interface AndroidImeBridge {
  commitText: (text: string) => void;
  deleteText: (count: number) => void;
  replaceCurrentWord: (deleteCount: number, newText: string) => void;
  getTextBeforeCursor: (maxChars: number) => string;
  sendEnter: () => void;
  moveCursor: (direction: string) => void;
  performContextMenuAction: (action: string) => void;
  vibrate: (durationMs: number) => void;
  playKeySound: () => void;
  switchInputMethod: () => void;
  hideKeyboard: () => void;
  openSettings: () => void;
  setKeyboardHeight: (heightDp: number) => void;
  getSettingsJson: () => string;
  saveSettingsJson: (json: string) => void;
}

interface AndroidNativeSetupBridge {
  isImeEnabled: () => boolean;
  isImeSelected: () => boolean;
  openInputMethodSettings: () => void;
  showInputMethodPicker: () => void;
  getSettingsJson: () => string;
  saveSettingsJson: (json: string) => void;
}

declare global {
  interface Window {
    AndroidIME?: AndroidImeBridge;
    AndroidNative?: AndroidNativeSetupBridge;
    onAndroidImeStart?: (inputType: number, imeOptions: number) => void;
  }
}

const STORAGE_KEY = 'text_q_board_settings_v2';

export function isSystemImeMode(): boolean {
  if (typeof window === 'undefined') return false;
  const params = new URLSearchParams(window.location.search);
  return params.get('mode') === 'ime' || Boolean(window.AndroidIME);
}

export function isNativeAndroidApp(): boolean {
  if (typeof window === 'undefined') return false;
  return Boolean(window.AndroidNative);
}

export function getAndroidImeStatus(): {
  isNativeApp: boolean;
  enabled: boolean;
  selected: boolean;
} {
  if (typeof window !== 'undefined' && window.AndroidNative) {
    try {
      return {
        isNativeApp: true,
        enabled: Boolean(window.AndroidNative.isImeEnabled()),
        selected: Boolean(window.AndroidNative.isImeSelected()),
      };
    } catch {
      return { isNativeApp: true, enabled: false, selected: false };
    }
  }
  return { isNativeApp: false, enabled: false, selected: false };
}

export function openAndroidInputMethodSettings(): boolean {
  if (typeof window !== 'undefined' && window.AndroidNative) {
    try {
      window.AndroidNative.openInputMethodSettings();
      return true;
    } catch {
      return false;
    }
  }
  return false;
}

export function showAndroidInputMethodPicker(): boolean {
  if (typeof window !== 'undefined') {
    if (window.AndroidNative) {
      try {
        window.AndroidNative.showInputMethodPicker();
        return true;
      } catch {
        return false;
      }
    }
    if (window.AndroidIME) {
      try {
        window.AndroidIME.switchInputMethod();
        return true;
      } catch {
        return false;
      }
    }
  }
  return false;
}

export function imeCommitText(text: string): void {
  if (typeof window !== 'undefined' && window.AndroidIME) {
    try {
      window.AndroidIME.commitText(text);
    } catch {}
  }
}

export function imeDeleteText(count: number = 1): void {
  if (typeof window !== 'undefined' && window.AndroidIME) {
    try {
      window.AndroidIME.deleteText(count);
    } catch {}
  }
}

export function imeReplaceCurrentWord(deleteCount: number, newText: string): void {
  if (typeof window !== 'undefined' && window.AndroidIME) {
    try {
      window.AndroidIME.replaceCurrentWord(deleteCount, newText);
    } catch {}
  }
}

export function imeGetTextBeforeCursor(maxChars: number = 60): string {
  if (typeof window !== 'undefined' && window.AndroidIME) {
    try {
      return window.AndroidIME.getTextBeforeCursor(maxChars) || '';
    } catch {}
  }
  return '';
}

export function imeSendEnter(): void {
  if (typeof window !== 'undefined' && window.AndroidIME) {
    try {
      window.AndroidIME.sendEnter();
    } catch {}
  }
}

export function imeMoveCursor(
  direction: 'left' | 'right' | 'up' | 'down' | 'start' | 'end'
): void {
  if (typeof window !== 'undefined' && window.AndroidIME) {
    try {
      window.AndroidIME.moveCursor(direction);
    } catch {}
  }
}

export function imeContextMenuAction(
  action: 'selectAll' | 'copy' | 'cut' | 'paste'
): void {
  if (typeof window !== 'undefined' && window.AndroidIME) {
    try {
      window.AndroidIME.performContextMenuAction(action);
    } catch {}
  }
}

export function imeVibrate(durationMs: number = 12): void {
  if (typeof window !== 'undefined' && window.AndroidIME) {
    try {
      window.AndroidIME.vibrate(durationMs);
    } catch {}
  }
}

export function imePlayKeySound(): void {
  if (typeof window !== 'undefined' && window.AndroidIME) {
    try {
      window.AndroidIME.playKeySound();
    } catch {}
  }
}

export function imeHideKeyboard(): void {
  if (typeof window !== 'undefined' && window.AndroidIME) {
    try {
      window.AndroidIME.hideKeyboard();
    } catch {}
  }
}

export function imeOpenSettings(): void {
  if (typeof window !== 'undefined' && window.AndroidIME) {
    try {
      window.AndroidIME.openSettings();
    } catch {}
  }
}

export function imeSetKeyboardHeight(heightDp: number): void {
  if (typeof window !== 'undefined' && window.AndroidIME) {
    try {
      window.AndroidIME.setKeyboardHeight(heightDp);
    } catch {}
  }
}

export function loadPersistedSettings(
  defaults: KeyboardSettings
): KeyboardSettings {
  try {
    let raw = '';
    if (typeof window !== 'undefined') {
      if (window.AndroidIME) {
        raw = window.AndroidIME.getSettingsJson() || '';
      } else if (window.AndroidNative) {
        raw = window.AndroidNative.getSettingsJson() || '';
      }
      if (!raw) {
        raw = localStorage.getItem(STORAGE_KEY) || '';
      }
    }
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...defaults, ...parsed };
    }
  } catch {}
  return defaults;
}

export function savePersistedSettings(settings: KeyboardSettings): void {
  try {
    const json = JSON.stringify(settings);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, json);
      if (window.AndroidNative) {
        window.AndroidNative.saveSettingsJson(json);
      }
      if (window.AndroidIME) {
        window.AndroidIME.saveSettingsJson(json);
      }
    }
  } catch {}
}
