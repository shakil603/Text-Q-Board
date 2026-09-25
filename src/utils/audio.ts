/**
 * Web Audio API synthesizer for realistic Android keyboard sounds & haptics
 */

class SoundEngine {
  private ctx: AudioContext | null = null;

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  playKeyClick(type: 'standard' | 'space' | 'backspace' | 'enter' | 'special' = 'standard', volume: number = 0.5) {
    if (volume <= 0) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      const now = this.ctx.currentTime;
      const vol = Math.max(0.01, Math.min(1, volume * 0.4));

      filter.type = 'lowpass';
      
      switch (type) {
        case 'space':
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(140, now);
          osc.frequency.exponentialRampToValueAtTime(60, now + 0.04);
          filter.frequency.setValueAtTime(400, now);
          gain.gain.setValueAtTime(vol * 1.2, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);
          osc.connect(filter);
          filter.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(now);
          osc.stop(now + 0.05);
          break;

        case 'backspace':
          osc.type = 'sine';
          osc.frequency.setValueAtTime(320, now);
          osc.frequency.exponentialRampToValueAtTime(160, now + 0.035);
          filter.frequency.setValueAtTime(800, now);
          gain.gain.setValueAtTime(vol * 0.9, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
          osc.connect(filter);
          filter.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(now);
          osc.stop(now + 0.045);
          break;

        case 'enter':
          osc.type = 'sine';
          osc.frequency.setValueAtTime(440, now);
          osc.frequency.exponentialRampToValueAtTime(220, now + 0.05);
          filter.frequency.setValueAtTime(1200, now);
          gain.gain.setValueAtTime(vol * 1.1, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.055);
          osc.connect(filter);
          filter.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(now);
          osc.stop(now + 0.06);
          break;

        case 'special':
          osc.type = 'sine';
          osc.frequency.setValueAtTime(520, now);
          osc.frequency.exponentialRampToValueAtTime(280, now + 0.03);
          filter.frequency.setValueAtTime(900, now);
          gain.gain.setValueAtTime(vol * 0.8, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);
          osc.connect(filter);
          filter.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(now);
          osc.stop(now + 0.04);
          break;

        case 'standard':
        default:
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(260 + Math.random() * 40, now);
          osc.frequency.exponentialRampToValueAtTime(120, now + 0.03);
          filter.frequency.setValueAtTime(1000, now);
          gain.gain.setValueAtTime(vol, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);
          osc.connect(filter);
          filter.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(now);
          osc.stop(now + 0.04);
          break;
      }
    } catch {
      // AudioContext unavailable or blocked
    }
  }

  triggerHaptic(durationMs: number = 10) {
    if (typeof window !== 'undefined' && 'navigator' in window && navigator.vibrate) {
      try {
        navigator.vibrate(durationMs);
      } catch {
        // vibration unsupported or disallowed
      }
    }
  }
}

export const soundEngine = new SoundEngine();
