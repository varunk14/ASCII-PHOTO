export interface AsciiOptions {
  fontSize: number;
  brightness: number;
  contrast: number;
  colorMode: 'ice' | 'ember' | 'neon' | 'color' | 'bw';
  density: 'dots' | 'code' | 'runes' | 'classic' | 'blocks';
}

export const DENSITY_MAPS = {
  dots: "  ..··::;;++**ooOO@@##",
  code: "  ..^^!!**<<&&%%$$##@@",
  runes: "  ..::;;++==xxXX##%%@@",
  classic: "  ..::--==++**##%%@@",
  blocks: "  ░░▒▒▓▓██",
};

export const DENSITY_LABELS: Record<string, string> = {
  dots: "Dots",
  code: "Code",
  runes: "Runes",
  classic: "Classic",
  blocks: "Blocks",
};

export const COLOR_LABELS: Record<string, string> = {
  ice: "Ice",
  ember: "Ember",
  neon: "Neon",
  color: "Color",
  bw: "B&W",
};
