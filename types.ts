export interface AsciiOptions {
  fontSize: number;
  brightness: number;
  contrast: number;
  colorMode: 'sakura' | 'lavender' | 'sunset' | 'color' | 'bw';
  density: 'hearts' | 'stars' | 'flowers' | 'classic' | 'blocks';
  resolution: number;
}

export interface AnalysisResult {
  compliment: string;
  cutenessLevel: string;
  tags: string[];
  loveNote: string;
}

export const DENSITY_MAPS = {
  hearts: " .,~+*oO#@",
  stars: " .+*xX#%@",
  flowers: " .:;+=xX#%@",
  classic: " .:-=+*#%@",
  blocks: " ░▒▓█",
};

// Cute emoji labels for the density maps
export const DENSITY_LABELS: Record<string, string> = {
  hearts: "Hearts",
  stars: "Stars",
  flowers: "Flowers",
  classic: "Classic",
  blocks: "Blocks",
};
