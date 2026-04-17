const AudioContextClass = (window.AudioContext || (window as any).webkitAudioContext);
let audioCtx: AudioContext | null = null;

const getContext = () => {
  if (!audioCtx) {
    audioCtx = new AudioContextClass();
  }
  return audioCtx;
};

const ensureContext = async () => {
  const ctx = getContext();
  if (ctx.state === 'suspended') {
    try {
      await ctx.resume();
    } catch (e) {
      console.warn("Audio context resume failed", e);
    }
  }
  return ctx;
};

// Cute startup chime - a bright, happy arpeggio
export const playStartupSound = async () => {
  try {
    const ctx = await ensureContext();
    const t = ctx.currentTime;

    // Happy major arpeggio: C5 E5 G5 C6
    const notes = [523.25, 659.25, 783.99, 1046.50];

    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t + i * 0.12);

      osc.connect(gain);
      gain.connect(ctx.destination);

      gain.gain.setValueAtTime(0, t + i * 0.12);
      gain.gain.linearRampToValueAtTime(0.06, t + i * 0.12 + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.12 + 0.6);

      osc.start(t + i * 0.12);
      osc.stop(t + i * 0.12 + 0.6);
    });
  } catch (e) { console.error(e); }
};

// Cute camera shutter / sparkle sound
export const playCaptureSound = async () => {
  try {
    const ctx = await ensureContext();
    const t = ctx.currentTime;

    // Sparkle: descending high-pitched twinkles
    for (let i = 0; i < 5; i++) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      const freq = 2000 - i * 200 + Math.random() * 300;
      osc.frequency.setValueAtTime(freq, t + i * 0.04);

      osc.connect(gain);
      gain.connect(ctx.destination);

      gain.gain.setValueAtTime(0.04, t + i * 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.04 + 0.15);

      osc.start(t + i * 0.04);
      osc.stop(t + i * 0.04 + 0.15);
    }
  } catch (e) { console.error(e); }
};

// Cute "thinking" sound - gentle bubbling
export const playAnalysisStartSound = async () => {
  try {
    const ctx = await ensureContext();
    const t = ctx.currentTime;

    for (let i = 0; i < 6; i++) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.type = 'sine';
      const freq = 800 + Math.random() * 600;
      osc.frequency.setValueAtTime(freq, t + i * 0.08);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.5, t + i * 0.08 + 0.06);

      gain.gain.setValueAtTime(0.025, t + i * 0.08);
      gain.gain.linearRampToValueAtTime(0, t + i * 0.08 + 0.06);

      osc.start(t + i * 0.08);
      osc.stop(t + i * 0.08 + 0.06);
    }
  } catch (e) { console.error(e); }
};

// Happy completion sound - celebratory fanfare
export const playAnalysisCompleteSound = async () => {
  try {
    const ctx = await ensureContext();
    const t = ctx.currentTime;

    // Celebratory: C5 E5 G5 (hold) C6
    const notes = [
      { freq: 523.25, time: 0, dur: 0.3 },
      { freq: 659.25, time: 0.1, dur: 0.3 },
      { freq: 783.99, time: 0.2, dur: 0.5 },
      { freq: 1046.50, time: 0.4, dur: 0.8 },
    ];

    notes.forEach(({ freq, time, dur }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t + time);

      osc.connect(gain);
      gain.connect(ctx.destination);

      gain.gain.setValueAtTime(0, t + time);
      gain.gain.linearRampToValueAtTime(0.05, t + time + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, t + time + dur);

      osc.start(t + time);
      osc.stop(t + time + dur);
    });
  } catch (e) { console.error(e); }
};

// Soft button click
export const playButtonSound = async () => {
  try {
    const ctx = await ensureContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1200, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1800, ctx.currentTime + 0.06);

    gain.gain.setValueAtTime(0.025, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.06);

    osc.start();
    osc.stop(ctx.currentTime + 0.06);
  } catch (e) {}
};

// Countdown beep (for photo countdown)
export const playCountdownBeep = async (final: boolean = false) => {
  try {
    const ctx = await ensureContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = 'sine';
    osc.frequency.setValueAtTime(final ? 880 : 660, ctx.currentTime);

    gain.gain.setValueAtTime(0.06, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + (final ? 0.3 : 0.15));

    osc.start();
    osc.stop(ctx.currentTime + (final ? 0.3 : 0.15));
  } catch (e) {}
};
