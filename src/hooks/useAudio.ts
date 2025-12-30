import { useCallback, useRef, useEffect } from "react";

export type SoundType =
  | "click"
  | "clickMedium"
  | "clickLarge"
  | "purchase"
  | "achievement"
  | "event"
  | "gameOver"
  | "victory"
  | "zoneUnlock"
  | "zoneSwitch"
  | "goldenClaim"
  | "nickNearby"
  | "threatEscalate"
  | "timerWarning"
  | "trialGavel"
  | "verdictGood"
  | "verdictBad"
  | "discountActive";

// Global SFX volume (0-1)
let globalSfxVolume = 0.7;

// Initialize SFX volume from localStorage
if (typeof window !== "undefined") {
  const storedSfxVolume = localStorage.getItem("minnesota-fraud-sfx-volume");
  globalSfxVolume = storedSfxVolume ? parseFloat(storedSfxVolume) : 0.7;
}

export const setSfxVolume = (vol: number) => {
  globalSfxVolume = Math.max(0, Math.min(1, vol));
  localStorage.setItem("minnesota-fraud-sfx-volume", String(globalSfxVolume));
};

export const getSfxVolume = () => globalSfxVolume;

// Web Audio API synth sounds - no external files needed

// Helper: Basic oscillator with envelope
const createOscillator = (
  ctx: AudioContext,
  frequency: number,
  type: OscillatorType,
  duration: number,
  volume: number = 0.3,
  delay: number = 0
) => {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = type;
  osc.frequency.value = frequency;
  osc.connect(gain);
  gain.connect(ctx.destination);

  const adjustedVolume = volume * globalSfxVolume;
  const startTime = ctx.currentTime + delay;
  gain.gain.setValueAtTime(0, startTime);
  gain.gain.linearRampToValueAtTime(adjustedVolume, startTime + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);

  osc.start(startTime);
  osc.stop(startTime + duration);
};

// Helper: Filtered oscillator with low-pass for warmer tones
const createFilteredOscillator = (
  ctx: AudioContext,
  frequency: number,
  type: OscillatorType,
  duration: number,
  volume: number = 0.3,
  filterFreq: number = 2000,
  delay: number = 0
) => {
  const osc = ctx.createOscillator();
  const filter = ctx.createBiquadFilter();
  const gain = ctx.createGain();

  osc.type = type;
  osc.frequency.value = frequency;
  filter.type = "lowpass";
  filter.frequency.value = filterFreq;
  filter.Q.value = 1;

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  const adjustedVolume = volume * globalSfxVolume;
  const startTime = ctx.currentTime + delay;
  gain.gain.setValueAtTime(0, startTime);
  gain.gain.linearRampToValueAtTime(adjustedVolume, startTime + 0.005);
  gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);

  osc.start(startTime);
  osc.stop(startTime + duration);
};

// Helper: Noise burst for texture (paper, impacts, etc.)
const createNoiseBurst = (
  ctx: AudioContext,
  duration: number,
  volume: number = 0.2,
  filterFreq: number = 4000,
  delay: number = 0
) => {
  const bufferSize = Math.floor(ctx.sampleRate * duration);
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);

  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }

  const source = ctx.createBufferSource();
  const filter = ctx.createBiquadFilter();
  const gain = ctx.createGain();

  source.buffer = buffer;
  filter.type = "lowpass";
  filter.frequency.value = filterFreq;

  source.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  const adjustedVolume = volume * globalSfxVolume;
  const startTime = ctx.currentTime + delay;
  gain.gain.setValueAtTime(adjustedVolume, startTime);
  gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);

  source.start(startTime);
};

// Helper: Pitched noise (metallic textures, shimmers)
const createPitchedNoise = (
  ctx: AudioContext,
  centerFreq: number,
  bandwidth: number,
  duration: number,
  volume: number = 0.15,
  delay: number = 0
) => {
  const bufferSize = Math.floor(ctx.sampleRate * duration);
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);

  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }

  const source = ctx.createBufferSource();
  const bandpass = ctx.createBiquadFilter();
  const gain = ctx.createGain();

  source.buffer = buffer;
  bandpass.type = "bandpass";
  bandpass.frequency.value = centerFreq;
  bandpass.Q.value = centerFreq / bandwidth;

  source.connect(bandpass);
  bandpass.connect(gain);
  gain.connect(ctx.destination);

  const adjustedVolume = volume * globalSfxVolume;
  const startTime = ctx.currentTime + delay;
  gain.gain.setValueAtTime(adjustedVolume, startTime);
  gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);

  source.start(startTime);
};

// Helper: Impact sound (thuds, stamps, gavels)
const createImpact = (
  ctx: AudioContext,
  frequency: number,
  duration: number,
  volume: number = 0.4,
  delay: number = 0
) => {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = "sine";
  osc.frequency.setValueAtTime(frequency * 2, ctx.currentTime + delay);
  osc.frequency.exponentialRampToValueAtTime(
    frequency,
    ctx.currentTime + delay + 0.02
  );

  osc.connect(gain);
  gain.connect(ctx.destination);

  const adjustedVolume = volume * globalSfxVolume;
  const startTime = ctx.currentTime + delay;
  gain.gain.setValueAtTime(adjustedVolume, startTime);
  gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);

  osc.start(startTime);
  osc.stop(startTime + duration);

  // Add body resonance
  createFilteredOscillator(
    ctx,
    frequency * 0.5,
    "sine",
    duration * 1.5,
    volume * 0.3,
    300,
    delay
  );
};

const playClick = (ctx: AudioContext) => {
  // Rubber stamp thud + paper texture + approval ping
  createImpact(ctx, 180, 0.08, 0.25); // Stamp thud
  createNoiseBurst(ctx, 0.04, 0.08, 3000, 0.01); // Paper rustle
  createOscillator(ctx, 1400, "sine", 0.06, 0.18, 0.03); // High approval ping
  createOscillator(ctx, 1050, "sine", 0.04, 0.1, 0.03); // Harmonic
};

const playClickMedium = (ctx: AudioContext) => {
  // Coin jingle + register drawer slide + richer harmonics
  createImpact(ctx, 150, 0.1, 0.2); // Deeper thud
  createNoiseBurst(ctx, 0.06, 0.1, 2500, 0.02); // Drawer slide texture
  // Coin jingle - multiple high metallic tones
  [1800, 2200, 2600].forEach((freq, i) => {
    createPitchedNoise(ctx, freq, 400, 0.08, 0.06, i * 0.015);
  });
  // Approval tones
  createOscillator(ctx, 880, "sine", 0.1, 0.2, 0.04);
  createOscillator(ctx, 1320, "sine", 0.08, 0.15, 0.06);
  createOscillator(ctx, 1760, "sine", 0.06, 0.1, 0.08);
};

const playClickLarge = (ctx: AudioContext) => {
  // Full cash register + money counter whir + coin cascade
  createImpact(ctx, 120, 0.15, 0.3); // Big drawer thud
  createNoiseBurst(ctx, 0.1, 0.12, 2000, 0.02); // Mechanical noise

  // Money counter whir (filtered sawtooth)
  const osc = ctx.createOscillator();
  const filter = ctx.createBiquadFilter();
  const gain = ctx.createGain();
  osc.type = "sawtooth";
  osc.frequency.value = 80;
  filter.type = "lowpass";
  filter.frequency.value = 400;
  osc.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  gain.gain.setValueAtTime(0.08 * globalSfxVolume, ctx.currentTime + 0.05);
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
  osc.start(ctx.currentTime + 0.05);
  osc.stop(ctx.currentTime + 0.2);

  // Coin cascade - descending metallic sparkles
  [3000, 2700, 2400, 2100, 1800, 1500].forEach((freq, i) => {
    createPitchedNoise(ctx, freq, 500, 0.06, 0.05, i * 0.02 + 0.08);
  });

  // Rich harmonic approval chord
  [660, 880, 1100, 1320, 1760].forEach((freq, i) => {
    createOscillator(ctx, freq, "sine", 0.15 - i * 0.02, 0.12, i * 0.02 + 0.1);
  });
};

const playPurchase = (ctx: AudioContext) => {
  // Filing cabinet slam + paper rustle + approval stamp + success chime
  createImpact(ctx, 100, 0.12, 0.3); // Cabinet slam
  createNoiseBurst(ctx, 0.08, 0.15, 1500, 0.03); // Paper rustle

  // Stamp impact
  createImpact(ctx, 200, 0.06, 0.2, 0.1);
  createNoiseBurst(ctx, 0.03, 0.08, 4000, 0.1);

  // Ascending success arpeggio with harmonics
  [440, 554, 659, 880].forEach((freq, i) => {
    createOscillator(ctx, freq, "sine", 0.18, 0.2, i * 0.05 + 0.15);
    createOscillator(ctx, freq * 2, "sine", 0.12, 0.08, i * 0.05 + 0.15); // Octave shimmer
  });

  // Final sparkle
  createPitchedNoise(ctx, 4000, 1000, 0.1, 0.06, 0.35);
};

const playAchievement = (ctx: AudioContext) => {
  // Triumphant fanfare with brass-like harmonics + sparkle shimmer
  // First chord - majestic entry
  [523, 659, 784].forEach((freq) => {
    createFilteredOscillator(ctx, freq, "sawtooth", 0.5, 0.12, 3000);
    createOscillator(ctx, freq, "sine", 0.5, 0.15);
  });

  // Second chord - resolution
  setTimeout(() => {
    [587, 740, 880].forEach((freq) => {
      createFilteredOscillator(ctx, freq, "sawtooth", 0.6, 0.1, 2500);
      createOscillator(ctx, freq, "sine", 0.6, 0.12);
    });
  }, 200);

  // Final chord - triumphant conclusion
  setTimeout(() => {
    [659, 830, 988, 1318].forEach((freq) => {
      createOscillator(ctx, freq, "sine", 0.7, 0.1);
    });
    // Sparkle shimmer cascade
    [5000, 6000, 7000, 8000].forEach((freq, i) => {
      createPitchedNoise(ctx, freq, 800, 0.15, 0.04, i * 0.03);
    });
  }, 400);
};

const playEvent = (ctx: AudioContext) => {
  // Breaking news jingle with urgency + teletype clicks
  // Teletype clicks
  [0, 0.04, 0.08, 0.12].forEach((delay) => {
    createNoiseBurst(ctx, 0.02, 0.12, 6000, delay);
  });

  // Breaking news jingle - more dramatic
  const newsNotes = [
    { freq: 880, delay: 0.1 },
    { freq: 660, delay: 0.18 },
    { freq: 880, delay: 0.26 },
    { freq: 1100, delay: 0.34 },
  ];
  newsNotes.forEach(({ freq, delay }) => {
    createFilteredOscillator(ctx, freq, "square", 0.1, 0.12, 2000, delay);
    createOscillator(ctx, freq * 2, "sine", 0.08, 0.05, delay); // Harmonic
  });

  // Attention grabber sub hit
  createImpact(ctx, 80, 0.1, 0.2, 0.1);
};

const playGameOver = (ctx: AudioContext) => {
  // Full police siren + handcuff click + cell door slam
  // Police siren (two-tone wail)
  const sirenOsc = ctx.createOscillator();
  const sirenFilter = ctx.createBiquadFilter();
  const sirenGain = ctx.createGain();
  sirenOsc.type = "sawtooth";
  sirenFilter.type = "lowpass";
  sirenFilter.frequency.value = 1500;
  sirenOsc.connect(sirenFilter);
  sirenFilter.connect(sirenGain);
  sirenGain.connect(ctx.destination);
  sirenGain.gain.setValueAtTime(0.15 * globalSfxVolume, ctx.currentTime);

  // Realistic siren wobble pattern
  const now = ctx.currentTime;
  sirenOsc.frequency.setValueAtTime(650, now);
  sirenOsc.frequency.linearRampToValueAtTime(850, now + 0.25);
  sirenOsc.frequency.linearRampToValueAtTime(650, now + 0.5);
  sirenOsc.frequency.linearRampToValueAtTime(850, now + 0.75);
  sirenOsc.frequency.linearRampToValueAtTime(400, now + 1.0);

  sirenGain.gain.exponentialRampToValueAtTime(0.01, now + 1.1);
  sirenOsc.start(now);
  sirenOsc.stop(now + 1.1);

  // Handcuff click sound
  setTimeout(() => {
    createImpact(ctx, 250, 0.04, 0.2);
    createNoiseBurst(ctx, 0.03, 0.15, 5000);
    createPitchedNoise(ctx, 1200, 600, 0.05, 0.1, 0.02);
  }, 500);

  // Cell door slam
  setTimeout(() => {
    createImpact(ctx, 60, 0.25, 0.45);
    createNoiseBurst(ctx, 0.1, 0.2, 800);
    createPitchedNoise(ctx, 300, 400, 0.15, 0.15, 0.02);
    // Metal reverb
    [400, 600, 800].forEach((freq, i) => {
      createPitchedNoise(ctx, freq, 200, 0.12, 0.04, 0.05 + i * 0.02);
    });
  }, 900);

  // Sub bass of finality
  createFilteredOscillator(ctx, 40, "sine", 1.2, 0.2, 80);
};

const playVictory = (ctx: AudioContext) => {
  // Grand fanfare + champagne pop + confetti shimmer
  // Champagne pop
  createNoiseBurst(ctx, 0.04, 0.25, 6000);
  createImpact(ctx, 300, 0.06, 0.2);

  // Champagne fizz
  setTimeout(() => {
    for (let i = 0; i < 8; i++) {
      createPitchedNoise(
        ctx,
        4000 + Math.random() * 4000,
        1000,
        0.15,
        0.03,
        i * 0.02
      );
    }
  }, 50);

  // Grand fanfare melody
  const notes = [
    { freq: 523, delay: 0.1, dur: 0.2 },
    { freq: 659, delay: 0.22, dur: 0.2 },
    { freq: 784, delay: 0.34, dur: 0.2 },
    { freq: 1047, delay: 0.46, dur: 0.3 },
    { freq: 784, delay: 0.64, dur: 0.15 },
    { freq: 1047, delay: 0.76, dur: 0.25 },
    { freq: 1319, delay: 0.94, dur: 0.4 },
  ];

  notes.forEach(({ freq, delay, dur }) => {
    createOscillator(ctx, freq, "sine", dur, 0.18, delay);
    createFilteredOscillator(ctx, freq, "sawtooth", dur, 0.08, 2000, delay); // Brass-like
    createOscillator(ctx, freq * 2, "sine", dur * 0.8, 0.05, delay); // Shimmer
  });

  // Triumphant final chord
  setTimeout(() => {
    [1047, 1319, 1568, 2093].forEach((freq) => {
      createOscillator(ctx, freq, "sine", 0.6, 0.12);
    });
  }, 1100);

  // Confetti shimmer cascade
  setTimeout(() => {
    for (let i = 0; i < 12; i++) {
      const freq = 3000 + Math.random() * 5000;
      createPitchedNoise(ctx, freq, 800, 0.12, 0.03, i * 0.04);
    }
  }, 1200);
};

const playZoneUnlock = (ctx: AudioContext) => {
  // Vault door mechanism + whooshing unlock + light beam shimmer
  // Door mechanism click
  createImpact(ctx, 80, 0.08, 0.25);
  createNoiseBurst(ctx, 0.05, 0.1, 1000);

  // Heavy lock mechanism
  createFilteredOscillator(ctx, 60, "sawtooth", 0.15, 0.2, 200, 0.05);
  createImpact(ctx, 150, 0.1, 0.2, 0.12);

  // Rising whoosh
  const osc = ctx.createOscillator();
  const filter = ctx.createBiquadFilter();
  const gain = ctx.createGain();
  osc.type = "sine";
  filter.type = "lowpass";
  filter.frequency.setValueAtTime(400, ctx.currentTime + 0.15);
  filter.frequency.exponentialRampToValueAtTime(4000, ctx.currentTime + 0.45);
  osc.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  osc.frequency.setValueAtTime(150, ctx.currentTime + 0.15);
  osc.frequency.exponentialRampToValueAtTime(1400, ctx.currentTime + 0.45);
  gain.gain.setValueAtTime(0.2 * globalSfxVolume, ctx.currentTime + 0.15);
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);

  osc.start(ctx.currentTime + 0.15);
  osc.stop(ctx.currentTime + 0.5);

  // Light beam shimmer (reveals the new zone)
  [2000, 3000, 4000, 5000].forEach((freq, i) => {
    createPitchedNoise(ctx, freq, 600, 0.2, 0.06, 0.35 + i * 0.03);
  });

  // Triumphant reveal chord
  setTimeout(() => {
    [523, 659, 784, 1047].forEach((freq) => {
      createOscillator(ctx, freq, "sine", 0.4, 0.1);
    });
  }, 400);
};

const playGoldenClaim = (ctx: AudioContext) => {
  // Coin pickup + jackpot jingle + gold shimmer
  // Coin impact
  createImpact(ctx, 400, 0.05, 0.2);
  createPitchedNoise(ctx, 2500, 800, 0.06, 0.15);

  // Jackpot jingle - ascending with harmonics
  const jingle = [
    { freq: 880, delay: 0.03, dur: 0.12 },
    { freq: 1100, delay: 0.08, dur: 0.12 },
    { freq: 1320, delay: 0.13, dur: 0.12 },
    { freq: 1760, delay: 0.18, dur: 0.15 },
    { freq: 2200, delay: 0.25, dur: 0.18 },
  ];

  jingle.forEach(({ freq, delay, dur }) => {
    createOscillator(ctx, freq, "sine", dur, 0.18, delay);
    createOscillator(ctx, freq * 1.5, "sine", dur * 0.7, 0.06, delay); // 5th
  });

  // Gold shimmer (metallic sparkle)
  [3500, 4500, 5500, 6500].forEach((freq, i) => {
    createPitchedNoise(ctx, freq, 600, 0.12, 0.05, 0.15 + i * 0.025);
  });

  // Rich harmonic tail
  setTimeout(() => {
    [1760, 2200, 2640].forEach((freq) => {
      createOscillator(ctx, freq, "sine", 0.2, 0.08);
    });
  }, 300);
};

const playNickNearby = (ctx: AudioContext) => {
  // Camera motor whir + shutter mechanisms + flash pops
  // Camera motor/autofocus whir
  const motorOsc = ctx.createOscillator();
  const motorFilter = ctx.createBiquadFilter();
  const motorGain = ctx.createGain();
  motorOsc.type = "sawtooth";
  motorOsc.frequency.value = 200;
  motorFilter.type = "bandpass";
  motorFilter.frequency.value = 800;
  motorFilter.Q.value = 3;
  motorOsc.connect(motorFilter);
  motorFilter.connect(motorGain);
  motorGain.connect(ctx.destination);
  motorGain.gain.setValueAtTime(0.08 * globalSfxVolume, ctx.currentTime);
  motorGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
  motorOsc.start(ctx.currentTime);
  motorOsc.stop(ctx.currentTime + 0.15);

  // Mechanical shutter clicks with more character
  [0, 0.12, 0.22, 0.32, 0.4].forEach((delay, i) => {
    // Shutter mechanism impact
    createImpact(ctx, 150 + (i % 2) * 40, 0.03, 0.15, delay);
    // Mechanical click noise
    createNoiseBurst(ctx, 0.025, 0.12, 4000 + i * 500, delay);
  });

  // Flash capacitor pop (higher pitched burst)
  createPitchedNoise(ctx, 2000, 1500, 0.05, 0.1, 0.15);
  createPitchedNoise(ctx, 3500, 1000, 0.04, 0.08, 0.27);
};

const playZoneSwitch = (ctx: AudioContext) => {
  // File folder tab click + paper shuffle - quick and satisfying
  // Folder tab click
  createImpact(ctx, 300, 0.04, 0.2);
  createNoiseBurst(ctx, 0.03, 0.1, 5000);

  // Paper shuffle
  createNoiseBurst(ctx, 0.06, 0.08, 2500, 0.02);

  // Quick confirmation tone
  createOscillator(ctx, 600, "sine", 0.08, 0.12, 0.04);
  createOscillator(ctx, 900, "sine", 0.06, 0.08, 0.06);
};

const playThreatEscalate = (ctx: AudioContext) => {
  // Ominous sub-bass rumble + alarm undertone + tension risers
  // Deep sub rumble
  const subOsc = ctx.createOscillator();
  const subFilter = ctx.createBiquadFilter();
  const subGain = ctx.createGain();
  subOsc.type = "sine";
  subOsc.frequency.setValueAtTime(40, ctx.currentTime);
  subOsc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.6);
  subFilter.type = "lowpass";
  subFilter.frequency.value = 120;
  subOsc.connect(subFilter);
  subFilter.connect(subGain);
  subGain.connect(ctx.destination);
  subGain.gain.setValueAtTime(0.25 * globalSfxVolume, ctx.currentTime);
  subGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.7);
  subOsc.start(ctx.currentTime);
  subOsc.stop(ctx.currentTime + 0.7);

  // Ominous rising sawtooth (filtered for menace)
  const riseOsc = ctx.createOscillator();
  const riseFilter = ctx.createBiquadFilter();
  const riseGain = ctx.createGain();
  riseOsc.type = "sawtooth";
  riseOsc.frequency.setValueAtTime(100, ctx.currentTime + 0.1);
  riseOsc.frequency.exponentialRampToValueAtTime(350, ctx.currentTime + 0.5);
  riseFilter.type = "lowpass";
  riseFilter.frequency.setValueAtTime(400, ctx.currentTime + 0.1);
  riseFilter.frequency.exponentialRampToValueAtTime(
    1200,
    ctx.currentTime + 0.5
  );
  riseOsc.connect(riseFilter);
  riseFilter.connect(riseGain);
  riseGain.connect(ctx.destination);
  riseGain.gain.setValueAtTime(0.1 * globalSfxVolume, ctx.currentTime + 0.1);
  riseGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.6);
  riseOsc.start(ctx.currentTime + 0.1);
  riseOsc.stop(ctx.currentTime + 0.6);

  // Alarm undertone pulse
  [0.15, 0.35].forEach((delay) => {
    createFilteredOscillator(ctx, 440, "square", 0.1, 0.06, 800, delay);
  });
};

const playTimerWarning = (ctx: AudioContext) => {
  // Urgent accelerating beeps with increasing pitch + alarm character
  const beeps = [
    { freq: 880, delay: 0, dur: 0.08 },
    { freq: 960, delay: 0.1, dur: 0.07 },
    { freq: 1080, delay: 0.18, dur: 0.06 },
    { freq: 1200, delay: 0.25, dur: 0.05 },
    { freq: 1400, delay: 0.31, dur: 0.05 },
  ];

  beeps.forEach(({ freq, delay, dur }) => {
    // Main beep with harmonics for urgency
    createFilteredOscillator(ctx, freq, "square", dur, 0.15, 2500, delay);
    createOscillator(ctx, freq * 1.5, "sine", dur * 0.8, 0.05, delay); // 5th harmonic
  });

  // Subtle alarm undertone
  createFilteredOscillator(ctx, 200, "sawtooth", 0.35, 0.04, 400, 0);
};

const playTrialGavel = (ctx: AudioContext) => {
  // Wooden gavel impact with room reverb + wood rattle
  // Initial wood crack
  createNoiseBurst(ctx, 0.02, 0.25, 3000);
  createImpact(ctx, 120, 0.15, 0.5);

  // Wood body resonance
  createFilteredOscillator(ctx, 180, "sine", 0.2, 0.25, 400, 0.01);
  createFilteredOscillator(ctx, 90, "sine", 0.3, 0.2, 200, 0.02);

  // Room reverb simulation (delayed quieter impacts)
  [0.08, 0.15, 0.22].forEach((delay, i) => {
    const vol = 0.08 - i * 0.02;
    createFilteredOscillator(ctx, 100 + i * 20, "sine", 0.1, vol, 300, delay);
  });

  // Wood rattle/table vibration
  createNoiseBurst(ctx, 0.08, 0.06, 800, 0.05);
};

const playVerdictGood = (ctx: AudioContext) => {
  // Choir-like shimmer + relief swell + hopeful resolution
  // Relief gasp - soft noise swell
  createNoiseBurst(ctx, 0.15, 0.04, 1500);

  // First chord - hopeful start (G major)
  [392, 494, 587].forEach((freq) => {
    createOscillator(ctx, freq, "sine", 0.5, 0.15);
    createOscillator(ctx, freq * 2, "sine", 0.4, 0.06); // Octave shimmer
  });

  // Choir shimmer pad
  [784, 988, 1175].forEach((freq) => {
    createFilteredOscillator(ctx, freq, "triangle", 0.6, 0.05, 2000, 0.1);
  });

  // Resolution chord (A major - bright hope)
  setTimeout(() => {
    [440, 554, 659].forEach((freq) => {
      createOscillator(ctx, freq, "sine", 0.6, 0.12);
      createOscillator(ctx, freq * 2, "sine", 0.5, 0.05);
    });
    // Angelic shimmer
    [1760, 2200, 2640].forEach((freq, i) => {
      createPitchedNoise(ctx, freq, 400, 0.3, 0.03, i * 0.02);
    });
  }, 280);

  // Final uplifting sparkle
  setTimeout(() => {
    [3000, 4000, 5000, 6000].forEach((freq, i) => {
      createPitchedNoise(ctx, freq, 800, 0.2, 0.025, i * 0.025);
    });
  }, 500);
};

const playVerdictBad = (ctx: AudioContext) => {
  // Prison door clang + doom bell + descending despair
  // Metal clang (prison door)
  createImpact(ctx, 80, 0.2, 0.4);
  createPitchedNoise(ctx, 400, 600, 0.15, 0.2);
  createPitchedNoise(ctx, 800, 400, 0.1, 0.12, 0.02);

  // Doom bell toll
  const bellFreq = 110;
  createOscillator(ctx, bellFreq, "sine", 0.8, 0.2, 0.05);
  createOscillator(ctx, bellFreq * 2, "sine", 0.6, 0.1, 0.05);
  createOscillator(ctx, bellFreq * 3, "sine", 0.4, 0.05, 0.05);

  // First doom chord - minor and ominous
  setTimeout(() => {
    [196, 233, 294].forEach((freq) => {
      // G minor
      createFilteredOscillator(ctx, freq, "sawtooth", 0.5, 0.1, 600);
    });
  }, 150);

  // Descending doom chord - deeper despair
  setTimeout(() => {
    [165, 196, 247].forEach((freq) => {
      // E minor
      createFilteredOscillator(ctx, freq, "sawtooth", 0.6, 0.08, 500);
    });
    // Sub rumble of finality
    createFilteredOscillator(ctx, 55, "sine", 0.8, 0.15, 100);
  }, 400);

  // Handcuff click
  setTimeout(() => {
    createImpact(ctx, 200, 0.04, 0.15);
    createNoiseBurst(ctx, 0.03, 0.1, 3000);
  }, 650);
};

const playDiscountActive = (ctx: AudioContext) => {
  // Sale bell + price scanner beep + receipt printer
  // Attention-grabbing sale bell
  createOscillator(ctx, 1400, "sine", 0.15, 0.25);
  createOscillator(ctx, 2100, "sine", 0.12, 0.12);
  createPitchedNoise(ctx, 3000, 1000, 0.08, 0.08);

  // Scanner beep pattern
  [0.08, 0.14].forEach((delay) => {
    createFilteredOscillator(ctx, 2400, "square", 0.04, 0.15, 3000, delay);
  });

  // Receipt printer sound (rhythmic noise bursts)
  [0.2, 0.24, 0.28, 0.32, 0.36].forEach((delay) => {
    createNoiseBurst(ctx, 0.025, 0.08, 2500, delay);
  });

  // Excited arpeggio flourish
  [660, 880, 1100, 1320, 1540, 1760].forEach((freq, i) => {
    createOscillator(ctx, freq, "sine", 0.1, 0.15, 0.15 + i * 0.035);
  });

  // Final "deal confirmed" chime
  setTimeout(() => {
    [1320, 1650, 1980].forEach((freq) => {
      createOscillator(ctx, freq, "sine", 0.2, 0.1);
    });
  }, 400);
};

const SOUND_PLAYERS: Record<SoundType, (ctx: AudioContext) => void> = {
  click: playClick,
  clickMedium: playClickMedium,
  clickLarge: playClickLarge,
  purchase: playPurchase,
  achievement: playAchievement,
  event: playEvent,
  gameOver: playGameOver,
  victory: playVictory,
  zoneUnlock: playZoneUnlock,
  zoneSwitch: playZoneSwitch,
  goldenClaim: playGoldenClaim,
  nickNearby: playNickNearby,
  threatEscalate: playThreatEscalate,
  timerWarning: playTimerWarning,
  trialGavel: playTrialGavel,
  verdictGood: playVerdictGood,
  verdictBad: playVerdictBad,
  discountActive: playDiscountActive,
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

export type MusicTrack = "normal" | "tension" | "danger" | "trial" | "victory";

const MUSIC_BASE_PATH = "/assets/audio/music/";
const CROSSFADE_DURATION = 1000; // ms

class MusicManagerClass {
  private currentAudio: HTMLAudioElement | null = null;
  private nextAudio: HTMLAudioElement | null = null;
  private currentTrack: MusicTrack | null = null;
  private currentVariant: number = 1;
  private enabled: boolean = true;
  private volume: number = 0.5;
  private isFading: boolean = false;
  private pendingTrack: MusicTrack | null = null;
  private hasUserInteracted: boolean = false;
  // Track recently played variants per track type (most recent first)
  private recentVariants: Map<MusicTrack, number[]> = new Map();

  constructor() {
    if (typeof window !== "undefined") {
      const storedEnabled = localStorage.getItem(
        "minnesota-fraud-music-enabled"
      );
      this.enabled = storedEnabled !== "false";

      const storedVolume = localStorage.getItem("minnesota-fraud-music-volume");
      this.volume = storedVolume ? parseFloat(storedVolume) : 0.5;

      // Listen for user interaction to retry blocked music
      const onInteraction = () => {
        this.hasUserInteracted = true;
        if (this.pendingTrack) {
          const track = this.pendingTrack;
          this.pendingTrack = null;
          this.play(track);
        }
      };

      ["click", "keydown", "touchstart"].forEach((event) => {
        document.addEventListener(event, onInteraction, {
          once: true,
          passive: true,
        });
      });
    }
  }

  private getMaxVariant(track: MusicTrack): number {
    // Normal has 6 variants (2 corporate + 4 Somali), others have 2
    return track === "normal" ? 6 : 2;
  }

  // Shuffled orders for each track type - feels more random than sequential
  private readonly shuffledOrders: Record<MusicTrack, number[]> = {
    normal: [3, 6, 1, 5, 2, 4], // Mix corporate and Somali tracks
    tension: [2, 1],
    danger: [2, 1],
    trial: [1, 2],
    victory: [2, 1],
  };

  private getTrackUrl(track: MusicTrack, variant?: number): string {
    const maxVariant = this.getMaxVariant(track);
    if (variant) {
      this.currentVariant = variant;
    } else {
      // Use time-based index into shuffled order for deterministic shared selection
      // Changes every 10 minutes (600000ms) so different sessions get variety
      const timeSeed = Math.floor(Date.now() / 600000);
      const shuffledIndex = timeSeed % maxVariant;
      this.currentVariant = this.shuffledOrders[track][shuffledIndex];
    }
    return `${MUSIC_BASE_PATH}${track}-${this.currentVariant}.mp3`;
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
    if (
      this.currentTrack === track &&
      this.currentAudio &&
      !this.currentAudio.paused
    )
      return;
    if (this.isFading) return;

    this.isFading = true;
    this.currentTrack = track;

    // Create new audio element
    const trackUrl = this.getTrackUrl(track);
    this.nextAudio = this.createAudio(trackUrl);

    // Try to load the track, fall back to main.mp3 if not found
    try {
      await new Promise<void>((resolve, reject) => {
        this.nextAudio!.addEventListener("canplaythrough", () => resolve(), {
          once: true,
        });
        this.nextAudio!.addEventListener("error", () => reject(), {
          once: true,
        });
        this.nextAudio!.load();
      });
    } catch {
      // Try fallback
      this.nextAudio = this.createAudio(this.getFallbackUrl());
      try {
        await new Promise<void>((resolve, reject) => {
          this.nextAudio!.addEventListener("canplaythrough", () => resolve(), {
            once: true,
          });
          this.nextAudio!.addEventListener("error", () => reject(), {
            once: true,
          });
          this.nextAudio!.load();
        });
      } catch {
        // No music available
        this.isFading = false;
        return;
      }
    }

    // Crossfade
    const fadeOutPromise = this.currentAudio
      ? this.fadeOut(this.currentAudio)
      : Promise.resolve();

    try {
      await this.nextAudio.play();
    } catch {
      // Playback blocked by autoplay policy - store pending track for retry on interaction
      if (!this.hasUserInteracted) {
        this.pendingTrack = track;
      }
      this.isFading = false;
      return;
    }
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

    // Track this variant as recently played
    this.trackVariantPlayed(track, this.currentVariant);
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

  private trackVariantPlayed(track: MusicTrack, variant: number): void {
    const history = this.recentVariants.get(track) ?? [];
    // Remove if already in history, then add to front
    const filtered = history.filter((v) => v !== variant);
    filtered.unshift(variant);
    // Keep only last N (half the variants, minimum 2)
    const maxHistory = Math.max(2, Math.floor(this.getMaxVariant(track) / 2));
    this.recentVariants.set(track, filtered.slice(0, maxHistory));
  }

  private pickWeightedVariant(track: MusicTrack): number {
    const maxVariant = this.getMaxVariant(track);
    const history = this.recentVariants.get(track) ?? [];

    // Build weighted list: recent variants get lower weight
    const weights: number[] = [];
    for (let v = 1; v <= maxVariant; v++) {
      const recencyIndex = history.indexOf(v);
      // Not in history = full weight, most recent = lowest weight
      const weight =
        recencyIndex === -1 ? 10 : Math.max(1, 10 - recencyIndex * 3);
      weights.push(weight);
    }

    // Exclude current variant entirely
    if (this.currentVariant >= 1 && this.currentVariant <= maxVariant) {
      weights[this.currentVariant - 1] = 0;
    }

    const totalWeight = weights.reduce((a, b) => a + b, 0);
    if (totalWeight === 0) {
      // Fallback: just pick any different one
      let v: number;
      do {
        v = Math.floor(Math.random() * maxVariant) + 1;
      } while (v === this.currentVariant && maxVariant > 1);
      return v;
    }

    let random = Math.random() * totalWeight;
    for (let v = 1; v <= maxVariant; v++) {
      random -= weights[v - 1];
      if (random <= 0) return v;
    }
    return 1;
  }

  async skip(): Promise<void> {
    if (!this.currentTrack || this.isFading) return;

    const track = this.currentTrack;
    const nextVariant = this.pickWeightedVariant(track);

    // Force a new track load by clearing current track
    this.currentTrack = null;
    await this.playVariant(track, nextVariant);
  }

  private async playVariant(track: MusicTrack, variant: number): Promise<void> {
    if (!this.enabled) return;
    if (this.isFading) return;

    this.isFading = true;
    this.currentTrack = track;

    const trackUrl = this.getTrackUrl(track, variant);
    this.nextAudio = this.createAudio(trackUrl);

    try {
      await new Promise<void>((resolve, reject) => {
        this.nextAudio!.addEventListener("canplaythrough", () => resolve(), {
          once: true,
        });
        this.nextAudio!.addEventListener("error", () => reject(), {
          once: true,
        });
        this.nextAudio!.load();
      });
    } catch {
      this.nextAudio = this.createAudio(this.getFallbackUrl());
      try {
        await new Promise<void>((resolve, reject) => {
          this.nextAudio!.addEventListener("canplaythrough", () => resolve(), {
            once: true,
          });
          this.nextAudio!.addEventListener("error", () => reject(), {
            once: true,
          });
          this.nextAudio!.load();
        });
      } catch {
        this.isFading = false;
        return;
      }
    }

    const fadeOutPromise = this.currentAudio
      ? this.fadeOut(this.currentAudio)
      : Promise.resolve();

    try {
      await this.nextAudio.play();
    } catch {
      if (!this.hasUserInteracted) {
        this.pendingTrack = track;
      }
      this.isFading = false;
      return;
    }
    const fadeInPromise = this.fadeIn(this.nextAudio, this.volume);

    await Promise.all([fadeOutPromise, fadeInPromise]);

    if (this.currentAudio) {
      this.currentAudio.src = "";
      this.currentAudio = null;
    }

    this.currentAudio = this.nextAudio;
    this.nextAudio = null;
    this.isFading = false;

    // Track this variant as recently played
    this.trackVariantPlayed(track, this.currentVariant);
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
