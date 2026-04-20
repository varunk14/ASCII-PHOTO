import React, { useRef, useEffect, useState, useCallback } from 'react';
import { AsciiOptions } from '../types';
import { getAsciiChar } from '../utils/asciiConverter';
import { playStartupSound, playCaptureSound } from '../utils/soundEffects';
import { Camera } from 'lucide-react';

interface AsciiCanvasProps {
  options: AsciiOptions;
}

export const AsciiCanvas: React.FC<AsciiCanvasProps> = ({ options }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hiddenCanvasRef = useRef<HTMLCanvasElement>(null);
  const prevFrameRef = useRef<Float32Array | null>(null);
  const animationRef = useRef<number>();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let stream: MediaStream | null = null;
    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' }
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(() => {});
          playStartupSound();
        }
      } catch {
        setError("Can't access camera. Please allow permissions!");
      }
    };
    startCamera();
    return () => { if (stream) stream.getTracks().forEach(t => t.stop()); };
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        const parent = canvasRef.current.parentElement;
        if (parent) {
          canvasRef.current.width = parent.clientWidth;
          canvasRef.current.height = parent.clientHeight;
        } else {
          canvasRef.current.width = window.innerWidth;
          canvasRef.current.height = window.innerHeight;
        }
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => { prevFrameRef.current = null; }, [options.fontSize]);

  useEffect(() => {
    const renderLoop = () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const hiddenCanvas = hiddenCanvasRef.current;

      if (!video || !canvas || !hiddenCanvas || video.readyState < 2) {
        animationRef.current = requestAnimationFrame(renderLoop);
        return;
      }

      const ctx = canvas.getContext('2d', { alpha: false });
      const hiddenCtx = hiddenCanvas.getContext('2d', { willReadFrequently: true });
      if (!ctx || !hiddenCtx) { animationRef.current = requestAnimationFrame(renderLoop); return; }

      const charHeight = options.fontSize;
      const charWidth = charHeight * 0.6;
      const cols = Math.floor(canvas.width / charWidth);
      const rows = Math.floor(canvas.height / charHeight);
      if (cols <= 0 || rows <= 0) { animationRef.current = requestAnimationFrame(renderLoop); return; }

      if (hiddenCanvas.width !== cols || hiddenCanvas.height !== rows) {
        hiddenCanvas.width = cols;
        hiddenCanvas.height = rows;
        prevFrameRef.current = null;
      }

      hiddenCtx.save();
      hiddenCtx.translate(cols, 0);
      hiddenCtx.scale(-1, 1);
      hiddenCtx.drawImage(video, 0, 0, cols, rows);
      hiddenCtx.restore();

      const frameData = hiddenCtx.getImageData(0, 0, cols, rows);
      const data = frameData.data;
      const pixelCount = data.length;

      if (!prevFrameRef.current || prevFrameRef.current.length !== pixelCount) {
        prevFrameRef.current = new Float32Array(pixelCount);
        for (let i = 0; i < pixelCount; i++) prevFrameRef.current[i] = data[i];
      }
      const prev = prevFrameRef.current;
      const smoothing = 0.45;
      for (let i = 0; i < pixelCount; i++) {
        const v = prev[i] + (data[i] - prev[i]) * smoothing;
        prev[i] = v;
        data[i] = v;
      }

      ctx.fillStyle = '#020617';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.font = `${options.fontSize}px 'JetBrains Mono', monospace`;
      ctx.textBaseline = 'top';

      // Contrast: 1.0 = no change, <1 = less contrast, >1 = more contrast
      const c = options.contrast;
      const contrastFactor = c * c; // quadratic curve for natural feel

      if (options.colorMode === 'color') {
        for (let y = 0; y < rows; y++) {
          for (let x = 0; x < cols; x++) {
            const offset = (y * cols + x) * 4;
            let lum = 0.2126 * data[offset] + 0.7152 * data[offset+1] + 0.0722 * data[offset+2];
            // Apply contrast around midpoint, then brightness
            lum = contrastFactor * (lum - 128) + 128;
            lum = lum * options.brightness;
            lum = Math.max(0, Math.min(255, lum));
            // Boost original colors by brightness for display
            const br = options.brightness;
            const cr = Math.min(255, data[offset] * br);
            const cg = Math.min(255, data[offset+1] * br);
            const cb = Math.min(255, data[offset+2] * br);
            ctx.fillStyle = `rgb(${cr|0},${cg|0},${cb|0})`;
            ctx.fillText(getAsciiChar(lum, options.density), x * charWidth, y * charHeight);
          }
        }
      } else {
        if (options.colorMode === 'ice') ctx.fillStyle = '#38bdf8';
        else if (options.colorMode === 'ember') ctx.fillStyle = '#f97316';
        else if (options.colorMode === 'neon') ctx.fillStyle = '#a855f7';
        else ctx.fillStyle = '#e2e8f0';

        for (let y = 0; y < rows; y++) {
          let row = "";
          for (let x = 0; x < cols; x++) {
            const offset = (y * cols + x) * 4;
            let lum = 0.2126 * data[offset] + 0.7152 * data[offset+1] + 0.0722 * data[offset+2];
            lum = contrastFactor * (lum - 128) + 128;
            lum = lum * options.brightness;
            lum = Math.max(0, Math.min(255, lum));
            row += getAsciiChar(lum, options.density);
          }
          ctx.fillText(row, 0, y * charHeight);
        }
      }

      animationRef.current = requestAnimationFrame(renderLoop);
    };

    animationRef.current = requestAnimationFrame(renderLoop);
    return () => { if (animationRef.current) cancelAnimationFrame(animationRef.current); };
  }, [options]);

  const [countdown, setCountdown] = useState<number | null>(null);
  const [timerDelay, setTimerDelay] = useState(0); // 0 = instant, 3, 5, 10

  const doCapture = useCallback(() => {
    if (!canvasRef.current) return;
    playCaptureSound();
    const canvas = canvasRef.current;
    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png');
    link.download = `ascii_${Date.now()}.png`;
    link.click();
  }, []);

  const startCapture = useCallback(() => {
    if (countdown !== null) return;
    if (timerDelay === 0) {
      doCapture();
    } else {
      let remaining = timerDelay;
      setCountdown(remaining);
      const interval = setInterval(() => {
        remaining--;
        if (remaining <= 0) {
          clearInterval(interval);
          setCountdown(null);
          doCapture();
        } else {
          setCountdown(remaining);
        }
      }, 1000);
    }
  }, [timerDelay, countdown, doCapture]);

  const timerOptions = [0, 3, 5, 10];

  return (
    <div className="relative w-full h-full">
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-900/90 z-50">
          <p className="text-cyan-400 text-sm">{error}</p>
        </div>
      )}

      {/* Countdown overlay */}
      {countdown !== null && (
        <div style={{
          position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 50, pointerEvents: 'none',
        }}>
          <span style={{
            fontSize: '120px', fontWeight: 'bold', color: '#22d3ee',
            textShadow: '0 0 40px rgba(34,211,238,0.5)', opacity: 0.8,
          }}>{countdown}</span>
        </div>
      )}

      <video ref={videoRef} playsInline autoPlay muted style={{ position: 'fixed', top: '-9999px', left: '-9999px', width: '1px', height: '1px', opacity: 0, pointerEvents: 'none' }} />
      <canvas ref={hiddenCanvasRef} className="hidden" />
      <canvas ref={canvasRef} className="block w-full h-full" />

      {/* Timer selector + capture button */}
      <div style={{
        position: 'absolute', bottom: '140px', left: '50%', transform: 'translateX(-50%)',
        zIndex: 40, display: 'flex', alignItems: 'center', gap: '12px',
      }}>
        {/* Timer pills */}
        <div style={{ display: 'flex', gap: '4px' }}>
          {timerOptions.map(t => (
            <button key={t} onClick={() => setTimerDelay(t)} style={{
              padding: '4px 10px', borderRadius: '12px', fontSize: '12px', border: 'none', cursor: 'pointer',
              background: timerDelay === t ? '#22d3ee' : 'rgba(15,23,42,0.8)',
              color: timerDelay === t ? '#0f172a' : '#94a3b8',
              fontWeight: timerDelay === t ? 'bold' : 'normal',
              backdropFilter: 'blur(4px)',
            }}>{t === 0 ? 'Off' : `${t}s`}</button>
          ))}
        </div>

        {/* Capture button */}
        <button
          onClick={startCapture}
          disabled={countdown !== null}
          style={{
            background: countdown !== null ? 'rgba(34,211,238,0.4)' : 'rgba(34,211,238,0.8)',
            color: '#0f172a', padding: '14px', borderRadius: '50%', border: 'none', cursor: countdown !== null ? 'default' : 'pointer',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          }}
        >
          <Camera className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};
