import { useCallback, useRef, useEffect } from "react";

export type SoundType =
  | "click"
  | "purchase"
  | "achievement"
  | "event"
  | "gameOver"
  | "victory"
  | "zoneUnlock"
  | "goldenClaim"
  | "nickNearby";

// Web Audio API synth sounds - no external files needed
const createOscillator = (
  ctx: AudioContext,
  frequency: number,
  type: OscillatorType,
  duration: number,
  volume: number = 0.3
) => {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = type;
  osc.frequency.value = frequency;
  osc.connect(gain);
  gain.connect(ctx.destination);

  gain.gain.setValueAtTime(volume, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + duration);
};

const playClick = (ctx: AudioContext) => {
  // Cash register "cha-ching" - two quick high notes
  createOscillator(ctx, 1200, "sine", 0.05, 0.2);
  setTimeout(() => createOscillator(ctx, 1800, "sine", 0.08, 0.15), 50);
};

const playPurchase = (ctx: AudioContext) => {
  // Level up chime - ascending arpeggio
  [400, 500, 600, 800].forEach((freq, i) => {
    setTimeout(() => createOscillator(ctx, freq, "sine", 0.15, 0.2), i * 60);
  });
};

const playAchievement = (ctx: AudioContext) => {
  // Victory fanfare - triumphant chord progression
  [523, 659, 784].forEach((freq) => {
    createOscillator(ctx, freq, "sine", 0.4, 0.15);
  });
  setTimeout(() => {
    [587, 740, 880].forEach((freq) => {
      createOscillator(ctx, freq, "sine", 0.5, 0.12);
    });
  }, 200);
};

const playEvent = (ctx: AudioContext) => {
  // Breaking news jingle - attention-grabbing staccato
  [800, 600, 800, 1000].forEach((freq, i) => {
    setTimeout(() => createOscillator(ctx, freq, "square", 0.08, 0.1), i * 100);
  });
};

const playGameOver = (ctx: AudioContext) => {
  // Police siren + descending doom
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sawtooth";
  osc.connect(gain);
  gain.connect(ctx.destination);
  gain.gain.setValueAtTime(0.15, ctx.currentTime);

  // Siren wobble
  osc.frequency.setValueAtTime(600, ctx.currentTime);
  osc.frequency.linearRampToValueAtTime(800, ctx.currentTime + 0.3);
  osc.frequency.linearRampToValueAtTime(600, ctx.currentTime + 0.6);
  osc.frequency.linearRampToValueAtTime(300, ctx.currentTime + 1.0);

  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1.2);

  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 1.2);
};

const playVictory = (ctx: AudioContext) => {
  // Grand victory theme
  const notes = [523, 659, 784, 1047, 784, 1047, 1319];
  notes.forEach((freq, i) => {
    setTimeout(() => createOscillator(ctx, freq, "sine", 0.25, 0.2), i * 120);
  });
};

const playZoneUnlock = (ctx: AudioContext) => {
  // Whooshing unlock sound
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sine";
  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.frequency.setValueAtTime(200, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.3);
  gain.gain.setValueAtTime(0.2, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);

  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.4);
};

const playGoldenClaim = (ctx: AudioContext) => {
  // Sparkle/coin collect sound
  [1200, 1400, 1600, 2000].forEach((freq, i) => {
    setTimeout(() => createOscillator(ctx, freq, "sine", 0.1, 0.15), i * 40);
  });
};

const playNickNearby = (ctx: AudioContext) => {
  // Camera shutter clicks
  [100, 80, 120].forEach((freq, i) => {
    setTimeout(() => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "square";
      osc.frequency.value = freq;
      osc.connect(gain);
      gain.connect(ctx.destination);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.02);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.02);
    }, i * 150);
  });
};

const SOUND_PLAYERS: Record<SoundType, (ctx: AudioContext) => void> = {
  click: playClick,
  purchase: playPurchase,
  achievement: playAchievement,
  event: playEvent,
  gameOver: playGameOver,
  victory: playVictory,
  zoneUnlock: playZoneUnlock,
  goldenClaim: playGoldenClaim,
  nickNearby: playNickNearby,
};

export const useAudio = () => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const enabledRef = useRef(true);

  useEffect(() => {
    // Check localStorage for sound preference
    const stored = localStorage.getItem("minnesota-fraud-sound-enabled");
    enabledRef.current = stored !== "false";
  }, []);

  const getContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
    }
    return audioContextRef.current;
  }, []);

  const play = useCallback(
    (sound: SoundType) => {
      if (!enabledRef.current) return;

      try {
        const ctx = getContext();
        if (ctx.state === "suspended") {
          ctx.resume();
        }
        SOUND_PLAYERS[sound](ctx);
      } catch {
        // Audio not supported or blocked
      }
    },
    [getContext]
  );

  const setEnabled = useCallback((enabled: boolean) => {
    enabledRef.current = enabled;
    localStorage.setItem("minnesota-fraud-sound-enabled", String(enabled));
  }, []);

  const isEnabled = useCallback(() => enabledRef.current, []);

  return { play, setEnabled, isEnabled };
};

// Global singleton for non-hook contexts
let globalAudioContext: AudioContext | null = null;
let globalEnabled = true;

export const playSound = (sound: SoundType) => {
  if (!globalEnabled) return;

  try {
    if (!globalAudioContext) {
      globalAudioContext = new AudioContext();
    }
    if (globalAudioContext.state === "suspended") {
      globalAudioContext.resume();
    }
    SOUND_PLAYERS[sound](globalAudioContext);
  } catch {
    // Audio not supported
  }
};

export const setSoundEnabled = (enabled: boolean) => {
  globalEnabled = enabled;
  localStorage.setItem("minnesota-fraud-sound-enabled", String(enabled));
};

export const isSoundEnabled = () => globalEnabled;

// Initialize from localStorage
if (typeof window !== "undefined") {
  const stored = localStorage.getItem("minnesota-fraud-sound-enabled");
  globalEnabled = stored !== "false";
}

// ============================================================================
// MUSIC MANAGER - Background music with track variants
// ============================================================================

export type MusicTrack = "normal" | "danger" | "victory";

const MUSIC_BASE_PATH = "/assets/audio/music/";
const CROSSFADE_DURATION = 1000; // ms

class MusicManagerClass {
  private currentAudio: HTMLAudioElement | null = null;
  private nextAudio: HTMLAudioElement | null = null;
  private currentTrack: MusicTrack | null = null;
  private enabled: boolean = true;
  private volume: number = 0.5;
  private isFading: boolean = false;

  constructor() {
    if (typeof window !== "undefined") {
      const storedEnabled = localStorage.getItem("minnesota-fraud-music-enabled");
      this.enabled = storedEnabled !== "false";
      
      const storedVolume = localStorage.getItem("minnesota-fraud-music-volume");
      this.volume = storedVolume ? parseFloat(storedVolume) : 0.5;
    }
  }

  private getTrackUrl(track: MusicTrack): string {
    // Randomly pick variant 1 or 2
    const variant = Math.random() < 0.5 ? 1 : 2;
    return `${MUSIC_BASE_PATH}${track}-${variant}.mp3`;
  }

  private getFallbackUrl(): string {
    return `${MUSIC_BASE_PATH}main.mp3`;
  }

  private createAudio(src: string): HTMLAudioElement {
    const audio = new Audio(src);
    audio.loop = true;
    audio.volume = 0;
    return audio;
  }

  private fadeIn(audio: HTMLAudioElement, targetVolume: number): Promise<void> {
    return new Promise((resolve) => {
      const startTime = Date.now();
      const startVolume = 0;
      
      const fade = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / CROSSFADE_DURATION, 1);
        audio.volume = startVolume + (targetVolume - startVolume) * progress;
        
        if (progress < 1) {
          requestAnimationFrame(fade);
        } else {
          resolve();
        }
      };
      
      fade();
    });
  }

  private fadeOut(audio: HTMLAudioElement): Promise<void> {
    return new Promise((resolve) => {
      const startTime = Date.now();
      const startVolume = audio.volume;
      
      const fade = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / CROSSFADE_DURATION, 1);
        audio.volume = startVolume * (1 - progress);
        
        if (progress < 1) {
          requestAnimationFrame(fade);
        } else {
          audio.pause();
          resolve();
        }
      };
      
      fade();
    });
  }

  async play(track: MusicTrack): Promise<void> {
    if (!this.enabled) return;
    if (this.currentTrack === track && this.currentAudio && !this.currentAudio.paused) return;
    if (this.isFading) return;

    this.isFading = true;
    this.currentTrack = track;

    // Create new audio element
    const trackUrl = this.getTrackUrl(track);
    this.nextAudio = this.createAudio(trackUrl);

    // Try to load the track, fall back to main.mp3 if not found
    try {
      await new Promise<void>((resolve, reject) => {
        this.nextAudio!.addEventListener("canplaythrough", () => resolve(), { once: true });
        this.nextAudio!.addEventListener("error", () => reject(), { once: true });
        this.nextAudio!.load();
      });
    } catch {
      // Try fallback
      this.nextAudio = this.createAudio(this.getFallbackUrl());
      try {
        await new Promise<void>((resolve, reject) => {
          this.nextAudio!.addEventListener("canplaythrough", () => resolve(), { once: true });
          this.nextAudio!.addEventListener("error", () => reject(), { once: true });
          this.nextAudio!.load();
        });
      } catch {
        // No music available
        this.isFading = false;
        return;
      }
    }

    // Crossfade
    const fadeOutPromise = this.currentAudio ? this.fadeOut(this.currentAudio) : Promise.resolve();
    
    this.nextAudio.play().catch(() => {});
    const fadeInPromise = this.fadeIn(this.nextAudio, this.volume);

    await Promise.all([fadeOutPromise, fadeInPromise]);

    // Cleanup old audio
    if (this.currentAudio) {
      this.currentAudio.src = "";
      this.currentAudio = null;
    }

    this.currentAudio = this.nextAudio;
    this.nextAudio = null;
    this.isFading = false;
  }

  pause(): void {
    if (this.currentAudio) {
      this.fadeOut(this.currentAudio);
    }
  }

  resume(): void {
    if (this.currentAudio && this.enabled) {
      this.currentAudio.play().catch(() => {});
      this.fadeIn(this.currentAudio, this.volume);
    }
  }

  stop(): void {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.src = "";
      this.currentAudio = null;
    }
    this.currentTrack = null;
  }

  setVolume(vol: number): void {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.currentAudio && !this.isFading) {
      this.currentAudio.volume = this.volume;
    }
    localStorage.setItem("minnesota-fraud-music-volume", String(this.volume));
  }

  getVolume(): number {
    return this.volume;
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    localStorage.setItem("minnesota-fraud-music-enabled", String(enabled));
    
    if (!enabled) {
      this.stop();
    }
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  getCurrentTrack(): MusicTrack | null {
    return this.currentTrack;
  }
}

// Global singleton for music
export const MusicManager = new MusicManagerClass();
