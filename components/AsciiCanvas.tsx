import React, { useRef, useEffect, useState, useCallback } from 'react';
import { AsciiOptions } from '../types';
import { getAsciiChar } from '../utils/asciiConverter';
import { playStartupSound, playCaptureSound, playCountdownBeep } from '../utils/soundEffects';
import { Timer, Camera } from 'lucide-react';

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
  const [countdown, setCountdown] = useState<number | null>(null);
  const [showFlash, setShowFlash] = useState(false);

  // Start camera
  useEffect(() => {
    let stream: MediaStream | null = null;

    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 640 },
            height: { ideal: 480 },
            facingMode: 'user'
          }
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(e => console.error("Play error:", e));
          playStartupSound();
        }
      } catch {
        setError("Can't access camera. Please allow permissions!");
      }
    };

    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Handle canvas resizing
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

  // Reset smoothing buffer when font size changes
  useEffect(() => {
    prevFrameRef.current = null;
  }, [options.fontSize]);

  // Render loop
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

      if (!ctx || !hiddenCtx) {
        animationRef.current = requestAnimationFrame(renderLoop);
        return;
      }

      const charHeight = options.fontSize;
      const charWidth = charHeight * 0.6;

      const cols = Math.floor(canvas.width / charWidth);
      const rows = Math.floor(canvas.height / charHeight);

      if (cols <= 0 || rows <= 0) {
        animationRef.current = requestAnimationFrame(renderLoop);
        return;
      }

      if (hiddenCanvas.width !== cols || hiddenCanvas.height !== rows) {
        hiddenCanvas.width = cols;
        hiddenCanvas.height = rows;
        prevFrameRef.current = null;
      }

      // Draw video mirrored (selfie mode)
      hiddenCtx.save();
      hiddenCtx.translate(cols, 0);
      hiddenCtx.scale(-1, 1);
      hiddenCtx.drawImage(video, 0, 0, cols, rows);
      hiddenCtx.restore();

      const frameData = hiddenCtx.getImageData(0, 0, cols, rows);
      const data = frameData.data;

      // Temporal smoothing to reduce ASCII jitter
      const pixelCount = data.length;

      if (!prevFrameRef.current || prevFrameRef.current.length !== pixelCount) {
        prevFrameRef.current = new Float32Array(pixelCount);
        for (let i = 0; i < pixelCount; i++) prevFrameRef.current[i] = data[i];
      }

      const prev = prevFrameRef.current;
      const inertia = 0.75;

      for (let i = 0; i < pixelCount; i++) {
        const target = data[i];
        const current = prev[i];
        const newValue = current + (target - current) * (1 - inertia);
        prev[i] = newValue;
        data[i] = newValue;
      }

      // Clear canvas
      ctx.fillStyle = '#1a0a1a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.font = `${options.fontSize}px 'JetBrains Mono', monospace`;
      ctx.textBaseline = 'top';

      const contrastFactor = (259 * (options.contrast * 255 + 255)) / (255 * (259 - options.contrast * 255));

      if (options.colorMode === 'color') {
        for (let y = 0; y < rows; y++) {
          for (let x = 0; x < cols; x++) {
            const offset = (y * cols + x) * 4;
            const r = data[offset];
            const g = data[offset + 1];
            const b = data[offset + 2];

            let brightness = 0.2126 * r + 0.7152 * g + 0.0722 * b;
            brightness = contrastFactor * (brightness - 128) + 128;
            brightness *= options.brightness;
            brightness = Math.max(0, Math.min(255, brightness));

            const char = getAsciiChar(brightness, options.density);
            ctx.fillStyle = `rgb(${r},${g},${b})`;
            ctx.fillText(char, x * charWidth, y * charHeight);
          }
        }
      } else {
        if (options.colorMode === 'sakura') ctx.fillStyle = '#f9a8d4';
        else if (options.colorMode === 'lavender') ctx.fillStyle = '#d8b4fe';
        else if (options.colorMode === 'sunset') ctx.fillStyle = '#fb923c';
        else ctx.fillStyle = '#ffffff';

        for (let y = 0; y < rows; y++) {
          let rowText = "";
          for (let x = 0; x < cols; x++) {
            const offset = (y * cols + x) * 4;
            const r = data[offset];
            const g = data[offset + 1];
            const b = data[offset + 2];

            let brightness = 0.2126 * r + 0.7152 * g + 0.0722 * b;
            brightness = contrastFactor * (brightness - 128) + 128;
            brightness *= options.brightness;
            brightness = Math.max(0, Math.min(255, brightness));

            rowText += getAsciiChar(brightness, options.density);
          }
          ctx.fillText(rowText, 0, y * charHeight);
        }
      }

      animationRef.current = requestAnimationFrame(renderLoop);
    };

    animationRef.current = requestAnimationFrame(renderLoop);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [options]);

  const doCapture = useCallback(() => {
    if (!canvasRef.current) return;

    setShowFlash(true);
    playCaptureSound();
    setTimeout(() => setShowFlash(false), 300);

    const canvas = canvasRef.current;

    canvas.toBlob((blob) => {
      if (!blob) return;

      const url = URL.createObjectURL(blob);
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

      if (isIOS) {
        const newTab = window.open();
        if (newTab) {
          const img = newTab.document.createElement('img');
          img.src = url;
          img.style.cssText = 'max-width:100%;height:auto';
          newTab.document.body.style.cssText = 'margin:0;display:flex;justify-content:center;align-items:center;min-height:100vh;background:#1a0a1a';
          newTab.document.body.appendChild(img);
        }
      } else {
        const link = document.createElement('a');
        link.href = url;
        link.download = `ascii_photo_${Date.now()}.png`;
        link.click();
        setTimeout(() => URL.revokeObjectURL(url), 5000);
      }
    }, 'image/png');
  }, []);

  const handleTimerCapture = useCallback(() => {
    let count = 3;
    setCountdown(count);
    playCountdownBeep(false);

    const interval = setInterval(() => {
      count--;
      if (count > 0) {
        setCountdown(count);
        playCountdownBeep(false);
      } else {
        setCountdown(null);
        clearInterval(interval);
        playCountdownBeep(true);
        doCapture();
      }
    }, 1000);
  }, [doCapture]);

  return (
    <div className="relative w-full h-full">
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-pink-50/90 z-50 p-6">
          <div className="text-center p-6 bg-white rounded-3xl shadow-lg max-w-xs w-full">
            <div className="text-4xl mb-3">📸</div>
            <p className="text-pink-600 font-medium text-sm">{error}</p>
          </div>
        </div>
      )}

      <video
        ref={videoRef}
        className="absolute top-0 left-0 opacity-0 pointer-events-none -z-10"
        style={{ width: '1px', height: '1px' }}
        playsInline
        autoPlay
        muted
      />
      <canvas ref={hiddenCanvasRef} className="hidden" />
      <canvas ref={canvasRef} className="block w-full h-full" />

      {showFlash && (
        <div className="absolute inset-0 bg-white/60 z-30 pointer-events-none" />
      )}

      {countdown !== null && (
        <div className="absolute inset-0 flex items-center justify-center z-40 pointer-events-none">
          <div className="text-7xl sm:text-8xl font-bold text-white animate-bounce-in"
               style={{ textShadow: '0 0 40px rgba(236,72,153,0.6), 0 0 80px rgba(168,85,247,0.4)' }}>
            {countdown}
          </div>
        </div>
      )}

      <div className="absolute bottom-16 sm:bottom-32 left-1/2 transform -translate-x-1/2 flex items-center gap-4 sm:gap-5 z-40">
        <button
          onClick={doCapture}
          className="group relative bg-gradient-to-br from-pink-400 to-purple-500 hover:from-pink-500 hover:to-purple-600 text-white p-5 sm:p-7 rounded-full shadow-xl hover:shadow-2xl transition-all active:scale-90 hover:scale-105"
        >
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 opacity-40 animate-ping" />
          <Camera className="w-7 h-7 sm:w-8 sm:h-8" />
        </button>

        <button
          onClick={handleTimerCapture}
          className="group bg-white/90 hover:bg-white text-purple-500 hover:text-purple-600 p-3.5 sm:p-4 rounded-full shadow-lg hover:shadow-xl transition-all active:scale-90 hover:scale-110 backdrop-blur-md border border-purple-200"
        >
          <Timer className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
      </div>
    </div>
  );
};
