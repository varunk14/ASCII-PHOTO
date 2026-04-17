import React, { useState } from 'react';
import { AsciiOptions, DENSITY_MAPS, DENSITY_LABELS } from '../types';
import { Sun, Contrast, Palette, Type, ChevronUp, ChevronDown, Sparkles } from 'lucide-react';
import { playButtonSound } from '../utils/soundEffects';

interface ControlPanelProps {
  options: AsciiOptions;
  setOptions: React.Dispatch<React.SetStateAction<AsciiOptions>>;
}

const COLOR_MODE_CONFIG = {
  sakura: { label: 'Pink' },
  lavender: { label: 'Purple' },
  sunset: { label: 'Warm' },
  color: { label: 'Color' },
  bw: { label: 'B&W' },
} as const;

export const ControlPanel: React.FC<ControlPanelProps> = ({ options, setOptions }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleChange = (key: keyof AsciiOptions, value: any) => {
    setOptions(prev => ({ ...prev, [key]: value }));
  };

  const handleModeChange = (key: keyof AsciiOptions, value: any) => {
    playButtonSound();
    handleChange(key, value);
  };

  return (
    <div className={`absolute bottom-0 w-full z-30 transition-all duration-500 ease-out ${isExpanded ? 'translate-y-0' : 'translate-y-[calc(100%-40px)]'}`}>
      {/* Toggle button */}
      <div className="flex justify-center">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="bg-white/90 backdrop-blur-md px-5 sm:px-6 py-1.5 rounded-t-2xl border border-b-0 border-pink-200 text-pink-500 hover:text-pink-600 transition-colors flex items-center gap-1 text-xs font-medium shadow-lg active:scale-95"
        >
          <Sparkles className="w-3 h-3" />
          {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          Controls
          {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          <Sparkles className="w-3 h-3" />
        </button>
      </div>

      {/* Control panel body */}
      <div className="bg-white/90 backdrop-blur-xl border-t border-pink-200 px-4 sm:px-6 py-4 sm:py-5 shadow-[0_-10px_30px_rgba(236,72,153,0.1)] max-h-[60vh] overflow-y-auto">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row flex-wrap gap-5 sm:gap-6 justify-center items-start">

          {/* Sliders row */}
          <div className="flex flex-row gap-4 sm:gap-6 w-full sm:w-auto justify-center">
            {/* Font Size */}
            <div className="flex flex-col gap-2 flex-1 sm:flex-none sm:w-36 max-w-[140px]">
              <div className="flex items-center gap-1.5">
                <Type className="w-3.5 h-3.5 text-pink-500 shrink-0" />
                <label className="text-[11px] font-semibold text-gray-600 truncate">Size: {options.fontSize}px</label>
              </div>
              <input
                type="range"
                min="6"
                max="24"
                value={options.fontSize}
                onChange={(e) => handleChange('fontSize', Number(e.target.value))}
              />
            </div>

            {/* Brightness */}
            <div className="flex flex-col gap-2 flex-1 sm:flex-none sm:w-36 max-w-[140px]">
              <div className="flex items-center gap-1.5">
                <Sun className="w-3.5 h-3.5 text-pink-500 shrink-0" />
                <label className="text-[11px] font-semibold text-gray-600 truncate">Bright: {options.brightness.toFixed(1)}</label>
              </div>
              <input
                type="range"
                min="0.5"
                max="2.0"
                step="0.1"
                value={options.brightness}
                onChange={(e) => handleChange('brightness', Number(e.target.value))}
              />
            </div>

            {/* Contrast */}
            <div className="flex flex-col gap-2 flex-1 sm:flex-none sm:w-36 max-w-[140px]">
              <div className="flex items-center gap-1.5">
                <Contrast className="w-3.5 h-3.5 text-pink-500 shrink-0" />
                <label className="text-[11px] font-semibold text-gray-600 truncate">Contrast: {options.contrast.toFixed(1)}</label>
              </div>
              <input
                type="range"
                min="0.5"
                max="3.0"
                step="0.1"
                value={options.contrast}
                onChange={(e) => handleChange('contrast', Number(e.target.value))}
              />
            </div>
          </div>

          {/* Color Mode */}
          <div className="flex flex-col gap-2 w-full sm:w-auto">
            <div className="flex items-center gap-2">
              <Palette className="w-3.5 h-3.5 text-pink-500" />
              <span className="text-[11px] font-semibold text-gray-600">Theme</span>
            </div>
            <div className="flex gap-1.5 flex-wrap">
              {(Object.entries(COLOR_MODE_CONFIG) as [AsciiOptions['colorMode'], typeof COLOR_MODE_CONFIG[keyof typeof COLOR_MODE_CONFIG]][]).map(([mode, config]) => (
                <button
                  key={mode}
                  onClick={() => handleModeChange('colorMode', mode)}
                  className={`px-2.5 py-1.5 rounded-full text-[11px] font-medium transition-all active:scale-95 ${
                    options.colorMode === mode
                      ? 'bg-gradient-to-r from-pink-400 to-purple-400 text-white shadow-md scale-105'
                      : 'bg-pink-50 text-gray-500 hover:bg-pink-100 hover:text-pink-600'
                  }`}
                >
                  {config.label}
                </button>
              ))}
            </div>
          </div>

          {/* Charset / Density */}
          <div className="flex flex-col gap-2 w-full sm:w-auto">
            <div className="flex items-center gap-2">
              <Type className="w-3.5 h-3.5 text-pink-500" />
              <span className="text-[11px] font-semibold text-gray-600">Style</span>
            </div>
            <div className="flex gap-1.5 flex-wrap">
              {(Object.keys(DENSITY_MAPS) as Array<keyof typeof DENSITY_MAPS>).map(mode => (
                <button
                  key={mode}
                  onClick={() => handleModeChange('density', mode)}
                  className={`px-2.5 py-1.5 rounded-full text-[11px] font-medium transition-all active:scale-95 ${
                    options.density === mode
                      ? 'bg-gradient-to-r from-pink-400 to-purple-400 text-white shadow-md scale-105'
                      : 'bg-pink-50 text-gray-500 hover:bg-pink-100 hover:text-pink-600'
                  }`}
                >
                  {DENSITY_LABELS[mode]}
                </button>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
