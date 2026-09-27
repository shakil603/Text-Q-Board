/**
 * Web Audio API Sound & Music Engine for Text Q Board
 * Supports classic keyboard clicks, mechanical switches, vintage typewriter,
 * musical keypress melodies (Piano, Bangla Folk, Guitar, Synth), and ambient background music loops.
 */

import { BgMusicTrackId, SoundProfileId } from '../types/keyboard';
import { imePlayKeySound, imeVibrate } from './androidBridge';

export interface SoundProfileMeta {
  id: SoundProfileId;
  name: string;
  subtitle: string;
  category: 'classic' | 'musical';
}

export interface BgMusicTrackMeta {
  id: BgMusicTrackId;
  name: string;
  subtitle: string;
}

export const SOUND_PROFILES: SoundProfileMeta[] = [
  {
    id: 'gboard_soft',
    name: 'Gboard Soft Tap',
    subtitle: 'Crisp Material 3 key tap',
    category: 'classic',
  },
  {
    id: 'mechanical',
    name: 'Mechanical Switch',
    subtitle: 'Tactile MX click-clack',
    category: 'classic',
  },
  {
    id: 'typewriter',
    name: 'Vintage Typewriter',
    subtitle: 'Classic strike + return bell',
    category: 'classic',
  },
  {
    id: 'bubble_pop',
    name: 'Bubble Pop',
    subtitle: 'Soft water droplet pop',
    category: 'classic',
  },
  {
    id: 'piano_melody',
    name: 'Musical Piano',
    subtitle: 'Plays piano melody as you type',
    category: 'musical',
  },
  {
    id: 'bangla_folk',
    name: 'Bangla Folk Tune',
    subtitle: 'Amar Shonar Bangla notes',
    category: 'musical',
  },
  {
    id: 'guitar_strums',
    name: 'Acoustic Guitar',
    subtitle: 'Warm plucked guitar strings',
    category: 'musical',
  },
  {
    id: 'synth_arp',
    name: 'Synthwave Arp',
    subtitle: 'Melodic electronic arpeggio',
    category: 'musical',
  },
];

export const BG_MUSIC_TRACKS: BgMusicTrackMeta[] = [
  { id: 'off', name: 'Off', subtitle: 'No background music' },
  { id: 'lofi_chill', name: 'Lo-Fi Chill', subtitle: 'Warm chords & soft pulse' },
  { id: 'calm_piano', name: 'Calm Piano', subtitle: 'Gentle ambient piano loop' },
  { id: 'bangla_flute', name: 'Bangla Flute', subtitle: 'Peaceful bansuri folk melody' },
  { id: 'cyber_synth', name: 'Night Synth', subtitle: 'Dreamy synthwave horizon' },
];

// Musical note frequencies (Hz)
// Piano Melody (Ode to Joy + Fur Elise inspired pleasant progression)
const PIANO_MELODY_NOTES = [
  329.63, 329.63, 349.23, 392.0, 392.0, 349.23, 329.63, 293.66,
  261.63, 261.63, 293.66, 329.63, 329.63, 293.66, 293.66,
  329.63, 329.63, 349.23, 392.0, 392.0, 349.23, 329.63, 293.66,
  261.63, 261.63, 293.66, 329.63, 293.66, 261.63, 261.63,
];

// Amar Shonar Bangla inspired pentatonic/folk phrase in C major / Bilaval
const BANGLA_MELODY_NOTES = [
  261.63, 293.66, 329.63, 392.0, 440.0, 392.0, 329.63, 293.66,
  261.63, 329.63, 392.0, 440.0, 523.25, 440.0, 392.0, 329.63,
  349.23, 329.63, 293.66, 261.63, 293.66, 329.63, 261.63,
];

// Acoustic Guitar Warm Pentatonic Plucks
const GUITAR_NOTES = [
  196.0, 220.0, 246.94, 293.66, 329.63, 392.0, 440.0, 493.88, 587.33, 440.0, 392.0, 293.66,
];

// Synthwave Arpeggio (A minor 9 / F major 7)
const SYNTH_ARP_NOTES = [
  220.0, 261.63, 329.63, 392.0, 493.88, 392.0, 329.63, 261.63,
  174.61, 220.0, 261.63, 329.63, 440.0, 329.63, 261.63, 220.0,
];

class SoundEngine {
  private ctx: AudioContext | null = null;
  private melodyIndex: number = 0;
  private bgMusicInterval: ReturnType<typeof setInterval> | null = null;
  private currentBgTrack: BgMusicTrackId = 'off';
  private bgStepIndex: number = 0;
  private bgVolume: number = 0.4;

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public playKeyClick(
    type: 'standard' | 'space' | 'backspace' | 'enter' | 'special' = 'standard',
    volume: number = 0.5,
    profile: SoundProfileId = 'gboard_soft'
  ) {
    if (volume <= 0) return;

    // Also trigger native Android sound effect for classic Gboard tap
    if (profile === 'gboard_soft') {
      imePlayKeySound();
    }

    try {
      this.initCtx();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const vol = Math.max(0.02, Math.min(1, volume * 0.55));

      switch (profile) {
        case 'mechanical':
          this.playMechanicalSwitch(type, now, vol);
          break;
        case 'typewriter':
          this.playTypewriter(type, now, vol);
          break;
        case 'bubble_pop':
          this.playBubblePop(type, now, vol);
          break;
        case 'piano_melody':
          this.playMusicalNote(PIANO_MELODY_NOTES, 'triangle', type, now, vol, 0.28);
          break;
        case 'bangla_folk':
          this.playMusicalNote(BANGLA_MELODY_NOTES, 'sine', type, now, vol, 0.34);
          break;
        case 'guitar_strums':
          this.playMusicalNote(GUITAR_NOTES, 'sawtooth', type, now, vol * 0.75, 0.3);
          break;
        case 'synth_arp':
          this.playMusicalNote(SYNTH_ARP_NOTES, 'sawtooth', type, now, vol * 0.7, 0.24);
          break;
        case 'gboard_soft':
        default:
          this.playGboardSoft(type, now, vol);
          break;
      }
    } catch {
      // AudioContext unavailable or blocked
    }
  }

  private playGboardSoft(
    type: 'standard' | 'space' | 'backspace' | 'enter' | 'special',
    now: number,
    vol: number
  ) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';

    if (type === 'space') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.exponentialRampToValueAtTime(65, now + 0.045);
      filter.frequency.setValueAtTime(450, now);
      gain.gain.setValueAtTime(vol * 1.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
    } else if (type === 'backspace') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(310, now);
      osc.frequency.exponentialRampToValueAtTime(150, now + 0.038);
      filter.frequency.setValueAtTime(800, now);
      gain.gain.setValueAtTime(vol * 0.9, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.042);
    } else if (type === 'enter') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(460, now);
      osc.frequency.exponentialRampToValueAtTime(240, now + 0.055);
      filter.frequency.setValueAtTime(1200, now);
      gain.gain.setValueAtTime(vol * 1.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
    } else {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(270 + Math.random() * 25, now);
      osc.frequency.exponentialRampToValueAtTime(120, now + 0.032);
      filter.frequency.setValueAtTime(1050, now);
      gain.gain.setValueAtTime(vol, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.036);
    }

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.065);
  }

  private playMechanicalSwitch(
    type: 'standard' | 'space' | 'backspace' | 'enter' | 'special',
    now: number,
    vol: number
  ) {
    if (!this.ctx) return;
    // Crisp high-frequency switch click + lower bottom-out thock
    const clickOsc = this.ctx.createOscillator();
    const clickGain = this.ctx.createGain();
    clickOsc.type = 'square';
    const baseFreq = type === 'space' ? 950 : type === 'enter' ? 1100 : 1450 + Math.random() * 150;
    clickOsc.frequency.setValueAtTime(baseFreq, now);
    clickOsc.frequency.exponentialRampToValueAtTime(280, now + 0.018);
    clickGain.gain.setValueAtTime(vol * 0.65, now);
    clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.022);

    clickOsc.connect(clickGain);
    clickGain.connect(this.ctx.destination);
    clickOsc.start(now);
    clickOsc.stop(now + 0.025);

    // Thock body resonance
    const bodyOsc = this.ctx.createOscillator();
    const bodyGain = this.ctx.createGain();
    bodyOsc.type = 'triangle';
    bodyOsc.frequency.setValueAtTime(type === 'space' ? 180 : 240, now + 0.005);
    bodyOsc.frequency.exponentialRampToValueAtTime(75, now + 0.045);
    bodyGain.gain.setValueAtTime(vol * 0.9, now + 0.005);
    bodyGain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

    bodyOsc.connect(bodyGain);
    bodyGain.connect(this.ctx.destination);
    bodyOsc.start(now + 0.005);
    bodyOsc.stop(now + 0.055);
  }

  private playTypewriter(
    type: 'standard' | 'space' | 'backspace' | 'enter' | 'special',
    now: number,
    vol: number
  ) {
    if (!this.ctx) return;
    if (type === 'enter') {
      // Vintage carriage return bell "ding!"
      const bellOsc = this.ctx.createOscillator();
      const bellGain = this.ctx.createGain();
      bellOsc.type = 'sine';
      bellOsc.frequency.setValueAtTime(2093, now); // C7 bell
      bellGain.gain.setValueAtTime(vol * 0.9, now);
      bellGain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);
      bellOsc.connect(bellGain);
      bellGain.connect(this.ctx.destination);
      bellOsc.start(now);
      bellOsc.stop(now + 0.4);
      return;
    }

    const strikeOsc = this.ctx.createOscillator();
    const strikeGain = this.ctx.createGain();
    strikeOsc.type = 'sawtooth';
    strikeOsc.frequency.setValueAtTime(type === 'space' ? 420 : 820 + Math.random() * 120, now);
    strikeOsc.frequency.exponentialRampToValueAtTime(110, now + 0.035);
    strikeGain.gain.setValueAtTime(vol * 0.85, now);
    strikeGain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    strikeOsc.connect(strikeGain);
    strikeGain.connect(this.ctx.destination);
    strikeOsc.start(now);
    strikeOsc.stop(now + 0.045);
  }

  private playBubblePop(
    type: 'standard' | 'space' | 'backspace' | 'enter' | 'special',
    now: number,
    vol: number
  ) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    const startFreq = type === 'space' ? 280 : type === 'enter' ? 520 : 380 + Math.random() * 140;
    // Bubble pitch sweeps UP rapidly
    osc.frequency.setValueAtTime(startFreq, now);
    osc.frequency.exponentialRampToValueAtTime(startFreq * 2.1, now + 0.055);
    gain.gain.setValueAtTime(vol * 0.9, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.065);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.07);
  }

  private playMusicalNote(
    scale: number[],
    wave: OscillatorType,
    type: 'standard' | 'space' | 'backspace' | 'enter' | 'special',
    now: number,
    vol: number,
    duration: number
  ) {
    if (!this.ctx) return;

    if (type === 'backspace') {
      this.melodyIndex = Math.max(0, this.melodyIndex - 1);
    }

    const freq = scale[this.melodyIndex % scale.length];
    this.melodyIndex = (this.melodyIndex + 1) % scale.length;

    const playTone = (f: number, delay: number, gainScale: number) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = wave;
      osc.frequency.setValueAtTime(f, now + delay);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(wave === 'sawtooth' ? 1800 : 3200, now + delay);
      filter.frequency.exponentialRampToValueAtTime(600, now + delay + duration);

      gain.gain.setValueAtTime(0.001, now + delay);
      gain.gain.linearRampToValueAtTime(vol * gainScale, now + delay + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.001, now + delay + duration);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now + delay);
      osc.stop(now + delay + duration + 0.02);
    };

    if (type === 'enter') {
      // Play a pleasant 3-note major/octave chord flourish on Enter
      playTone(freq, 0, 0.75);
      playTone(freq * 1.25, 0.04, 0.65);
      playTone(freq * 1.5, 0.08, 0.65);
    } else if (type === 'space') {
      // Warm fifth interval on Spacebar
      playTone(freq * 0.5, 0, 0.7);
      playTone(freq, 0.02, 0.65);
    } else {
      playTone(freq, 0, 0.9);
    }
  }

  /**
   * Ambient Background Music Loop Controller
   */
  public setBackgroundMusic(track: BgMusicTrackId, volume: number = 0.5) {
    this.bgVolume = Math.max(0.05, Math.min(1, volume));
    if (this.currentBgTrack === track && track !== 'off' && this.bgMusicInterval) {
      return;
    }

    this.stopBackgroundMusic();
    this.currentBgTrack = track;

    if (track === 'off') return;

    this.initCtx();
    this.bgStepIndex = 0;

    // Play first note immediately
    this.playBgMusicStep(track);

    const stepMs =
      track === 'lofi_chill'
        ? 650
        : track === 'calm_piano'
        ? 550
        : track === 'bangla_flute'
        ? 600
        : 420;

    this.bgMusicInterval = setInterval(() => {
      this.playBgMusicStep(track);
    }, stepMs);
  }

  public stopBackgroundMusic() {
    if (this.bgMusicInterval) {
      clearInterval(this.bgMusicInterval);
      this.bgMusicInterval = null;
    }
    this.currentBgTrack = 'off';
  }

  public getActiveBackgroundMusic(): BgMusicTrackId {
    return this.currentBgTrack;
  }

  private playBgMusicStep(track: BgMusicTrackId) {
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const vol = this.bgVolume * 0.18;

      const step = this.bgStepIndex++;

      if (track === 'lofi_chill') {
        const chords = [
          [261.63, 329.63, 392.0, 493.88], // Cmaj7
          [220.0, 261.63, 329.63, 392.0],  // Am7
          [174.61, 220.0, 261.63, 349.23], // Fmaj7
          [196.0, 246.94, 293.66, 392.0],  // G6
        ];
        const chord = chords[Math.floor(step / 4) % chords.length];
        const note = chord[step % chord.length];
        this.triggerAmbientNote(note, 'triangle', now, vol, 0.55);
      } else if (track === 'calm_piano') {
        const notes = [
          261.63, 329.63, 392.0, 523.25, 392.0, 329.63,
          220.0, 261.63, 329.63, 440.0, 329.63, 261.63,
        ];
        const note = notes[step % notes.length];
        this.triggerAmbientNote(note, 'sine', now, vol * 1.1, 0.5);
      } else if (track === 'bangla_flute') {
        const note = BANGLA_MELODY_NOTES[step % BANGLA_MELODY_NOTES.length];
        this.triggerAmbientNote(note, 'sine', now, vol * 1.15, 0.55);
      } else if (track === 'cyber_synth') {
        const note = SYNTH_ARP_NOTES[step % SYNTH_ARP_NOTES.length];
        this.triggerAmbientNote(note, 'sawtooth', now, vol * 0.8, 0.35);
      }
    } catch {
      // ignore audio errors
    }
  }

  private triggerAmbientNote(
    freq: number,
    wave: OscillatorType,
    now: number,
    vol: number,
    duration: number
  ) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = wave;
    osc.frequency.setValueAtTime(freq, now);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(wave === 'sawtooth' ? 1100 : 2000, now);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(vol, now + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + duration + 0.03);
  }

  public triggerHaptic(durationMs: number = 10) {
    imeVibrate(durationMs);
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
