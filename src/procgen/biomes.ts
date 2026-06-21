import type { Tile } from './wfc';

export interface Biome {
  id: string;
  name: string;
  palette: [string, string, string, string, string]; // 5 hex
}

export const BIOMES: Biome[] = [
  { id: 'forest',    name: 'Forest',    palette: ['#1b4332','#2d6a4f','#52b788','#95d5b2','#d8f3dc'] },
  { id: 'ocean',     name: 'Ocean',     palette: ['#03045e','#0077b6','#00b4d8','#90e0ef','#caf0f8'] },
  { id: 'dungeon',   name: 'Dungeon',   palette: ['#1a1a1d','#3b1c32','#a64942','#ff9b54','#fff7e1'] },
  { id: 'scifi',     name: 'Sci-Fi',    palette: ['#0b132b','#1c2541','#3a506b','#5bc0be','#6fffe9'] },
  { id: 'desert',    name: 'Desert',    palette: ['#7f4f24','#b08968','#ddb892','#ede0d4','#fefae0'] },
];

export function biomeWeights(biomeId: string): Record<Tile, number> {
  switch (biomeId) {
    case 'forest':  return { 0:5, 1:2, 2:0, 3:3, 4:1 };
    case 'ocean':   return { 0:3, 1:1, 2:5, 3:0, 4:1 };
    case 'dungeon': return { 0:4, 1:4, 2:0, 3:1, 4:1 };
    case 'scifi':   return { 0:6, 1:2, 2:0, 3:1, 4:1 };
    case 'desert':  return { 0:5, 1:1, 2:0, 3:2, 4:2 };
    default:        return { 0:5, 1:2, 2:1, 3:1, 4:1 };
  }
}
