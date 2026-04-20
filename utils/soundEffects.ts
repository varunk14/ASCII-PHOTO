const AudioContextClass = (window.AudioContext || (window as any).webkitAudioContext);
let audioCtx: AudioContext | null = null;

const getContext = () => {
  if (!audioCtx) audioCtx = new AudioContextClass();
  return audioCtx;
};

const ensureContext = async () => {
  const ctx = getContext();
  if (ctx.state === 'suspended') {
    try { await ctx.resume(); } catch {}
  }
  return ctx;
};

// Deep ocean startup — rising sonar ping
export const playStartupSound = async () => {
  try {
    const ctx = await ensureContext();
    const t = ctx.currentTime;

    // Sonar sweep rising
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.type = 'sine';
    osc.frequency.setValueAtTime(200, t);
    osc.frequency.exponentialRampToValueAtTime(1200, t + 0.6);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(800, t);
    filter.Q.value = 2;

    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.06, t + 0.15);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.8);

    osc.start(t);
    osc.stop(t + 0.8);

    // Echo ping
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(1400, t + 0.3);
    gain2.gain.setValueAtTime(0.03, t + 0.3);
    gain2.gain.exponentialRampToValueAtTime(0.001, t + 1.0);
    osc2.start(t + 0.3);
    osc2.stop(t + 1.0);
  } catch {}
};

// Shutter capture — crisp digital snap
export const playCaptureSound = async () => {
  try {
    const ctx = await ensureContext();
    const t = ctx.currentTime;

    for (let i = 0; i < 4; i++) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.type = 'sine';
      osc.frequency.setValueAtTime(1800 - i * 250, t + i * 0.03);
      gain.gain.setValueAtTime(0.05, t + i * 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.03 + 0.1);
      osc.start(t + i * 0.03);
      osc.stop(t + i * 0.03 + 0.1);
    }
  } catch {}
};

// Countdown beep
export const playCountdownBeep = async (final: boolean = false) => {
  try {
    const ctx = await ensureContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = 'sine';
    osc.frequency.setValueAtTime(final ? 980 : 740, ctx.currentTime);
    gain.gain.setValueAtTime(0.06, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + (final ? 0.3 : 0.12));
    osc.start();
    osc.stop(ctx.currentTime + (final ? 0.3 : 0.12));
  } catch {}
};

// Soft UI click
export const playButtonSound = async () => {
  try {
    const ctx = await ensureContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1100, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1600, ctx.currentTime + 0.04);
    gain.gain.setValueAtTime(0.02, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.04);
    osc.start();
    osc.stop(ctx.currentTime + 0.04);
  } catch {}
};
