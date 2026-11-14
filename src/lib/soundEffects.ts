// Sound synthesis system using Web Audio API (Zero external latency, 100% offline, Duolingo-style)

let audioCtx: AudioContext | null = null;
let soundEnabled = true;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

export function setSoundEnabled(enabled: boolean) {
  soundEnabled = enabled;
}

export function isSoundEnabled(): boolean {
  return soundEnabled;
}

/**
 * 1. Bubble Pop ("como una burbujita")
 * Tactile, juicy pop sound when selecting an option or tapping an interactive card.
 */
export function playBubblePop() {
  if (!soundEnabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    const now = ctx.currentTime;
    osc.type = 'sine';

    // Fast pitch contour mimicking a popping water bubble (450Hz -> 900Hz -> 300Hz in 70ms)
    osc.frequency.setValueAtTime(450, now);
    osc.frequency.exponentialRampToValueAtTime(900, now + 0.025);
    osc.frequency.exponentialRampToValueAtTime(320, now + 0.08);

    // Fast decay envelope
    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.1);
  } catch (e) {
    // Graceful fallback if Web Audio is blocked
  }
}

/**
 * 2. Whoosh / Shhh ("como un shhh")
 * Smooth airy swoop when pressing Continuar or transitioning between screens.
 */
export function playWhoosh() {
  if (!soundEnabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const bufferSize = ctx.sampleRate * 0.16; // 160ms of filtered noise
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      // White noise with a gentle fade
      data[i] = (Math.random() * 2 - 1) * Math.sin((i / bufferSize) * Math.PI);
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    // Bandpass filter to create the clean 'shhh/whoosh' effect
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    const now = ctx.currentTime;
    filter.frequency.setValueAtTime(1400, now);
    filter.frequency.exponentialRampToValueAtTime(450, now + 0.15);
    filter.Q.setValueAtTime(2.5, now);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    noise.start(now);
    noise.stop(now + 0.17);
  } catch (e) {
    // Graceful fallback
  }
}

/**
 * 3. Question Chime ("el de nuevo la pregunta")
 * Friendly, soft bell chime when presenting a new question or tip from Kipu.
 */
export function playQuestionChime() {
  if (!soundEnabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // Two pleasant notes (C5 = 523.25Hz, G5 = 783.99Hz)
    [
      { freq: 523.25, time: now, duration: 0.18 },
      { freq: 783.99, time: now + 0.08, duration: 0.25 },
    ].forEach(({ freq, time, duration }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, time);

      gain.gain.setValueAtTime(0.12, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(time);
      osc.stop(time + duration);
    });
  } catch (e) {
    // Graceful fallback
  }
}

/**
 * 4. Success Fanfare (Al terminar wizard o guardar chacra)
 * Bright, joyful Andean major chord (C - E - G - C6)
 */
export function playSuccessFanfare() {
  if (!soundEnabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6

    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      const time = now + i * 0.08;
      const duration = 0.35;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, time);

      gain.gain.setValueAtTime(0.18, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(time);
      osc.stop(time + duration);
    });
  } catch (e) {
    // Graceful fallback
  }
}
