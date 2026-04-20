import { DENSITY_MAPS } from '../types';

export const getAsciiChar = (brightness: number, densityType: keyof typeof DENSITY_MAPS): string => {
  const map = DENSITY_MAPS[densityType];
  const index = Math.floor((brightness / 255) * (map.length - 1));
  return map[index];
};
