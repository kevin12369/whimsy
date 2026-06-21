export type HexColor = `#${string}`;

export function hexToInt(hex: string): number {
  return parseInt(hex.replace('#', ''), 16);
}

export function lerpColor(a: string, b: string, t: number): string {
  const ai = hexToInt(a), bi = hexToInt(b);
  const ar = (ai >> 16) & 0xff, ag = (ai >> 8) & 0xff, ab = ai & 0xff;
  const br = (bi >> 16) & 0xff, bg = (bi >> 8) & 0xff, bb = bi & 0xff;
  const r = Math.round(ar + (br - ar) * t);
  const g = Math.round(ag + (bg - ag) * t);
  const b2 = Math.round(ab + (bb - ab) * t);
  return `#${[r, g, b2].map(n => n.toString(16).padStart(2, '0')).join('')}`;
}