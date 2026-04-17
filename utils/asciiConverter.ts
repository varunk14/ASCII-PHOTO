import { DENSITY_MAPS, AsciiOptions } from '../types';

export const getAsciiChar = (brightness: number, densityType: keyof typeof DENSITY_MAPS): string => {
  const map = DENSITY_MAPS[densityType];
  const index = Math.floor((brightness / 255) * (map.length - 1));
  return map[index];
};

// Get fill color based on color mode and optional per-pixel RGB
export const getColorForMode = (
  mode: AsciiOptions['colorMode'],
  brightness?: number,
  r?: number, g?: number, b?: number
): string => {
  switch (mode) {
    case 'sakura':
      return `rgb(${200 + Math.floor((brightness || 128) / 255 * 55)}, ${80 + Math.floor((brightness || 128) / 255 * 100)}, ${120 + Math.floor((brightness || 128) / 255 * 80)})`;
    case 'lavender':
      return `rgb(${140 + Math.floor((brightness || 128) / 255 * 80)}, ${100 + Math.floor((brightness || 128) / 255 * 80)}, ${200 + Math.floor((brightness || 128) / 255 * 55)})`;
    case 'sunset':
      return `rgb(${200 + Math.floor((brightness || 128) / 255 * 55)}, ${100 + Math.floor((brightness || 128) / 255 * 80)}, ${60 + Math.floor((brightness || 128) / 255 * 80)})`;
    case 'color':
      return `rgb(${r || 255},${g || 255},${b || 255})`;
    case 'bw':
      return '#ffffff';
    default:
      return '#f9a8d4';
  }
};
