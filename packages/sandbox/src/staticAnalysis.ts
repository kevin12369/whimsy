import type { ValidationResult } from './types';
import { findDenylistHit } from './denylist';

const SCRIPT_RE = /<script\b[^>]*>([\s\S]*?)<\/script>/gi;
const KEYBOARD_RE = /(addEventListener\(\s*['"]keydown['"]|\.on\(\s*['"]keydown['"]|cursorKeys|createCursorKeys)/i;
const CANVAS_RE = /<canvas\b/i;
const PHASER_INIT_RE = /new\s+Phaser\.Game\s*\(/;

interface ScriptBlock { startIndex: number; code: string; }

function extractScripts(html: string): ScriptBlock[] {
  const out: ScriptBlock[] = [];
  let m: RegExpExecArray | null;
  SCRIPT_RE.lastIndex = 0;
  while ((m = SCRIPT_RE.exec(html)) !== null) {
    out.push({ startIndex: m.index, code: m[1] ?? '' });
  }
  return out;
}

function bracesBalanced(code: string): boolean {
  let depth = 0;
  let inString: string | null = null;
  let prev = '';
  for (let i = 0; i < code.length; i++) {
    const c = code[i];
    if (inString) {
      if (c === inString && prev !== '\\') inString = null;
    } else {
      if (c === '"' || c === "'" || c === '`') inString = c;
      else if (c === '{') depth++;
      else if (c === '}') { depth--; if (depth < 0) return false; }
    }
    prev = c ?? '';
  }
  return depth === 0;
}

export function staticAnalysis(html: string): ValidationResult {
  // 1. Denylist check across the entire HTML
  const hit = findDenylistHit(html);
  if (hit) {
    return { ok: false, reason: `forbidden API: ${hit.pattern}`, hit };
  }

  // 2. Each script must have balanced braces
  const scripts = extractScripts(html);
  if (scripts.length === 0) {
    return { ok: false, reason: 'no <script> block found' };
  }
  for (const s of scripts) {
    if (!bracesBalanced(s.code)) {
      return { ok: false, reason: `unbalanced braces in script starting at ${s.startIndex}` };
    }
  }

  // 3. Must have a canvas OR a Phaser init
  const hasCanvas = CANVAS_RE.test(html);
  const hasPhaser = PHASER_INIT_RE.test(html);
  if (!hasCanvas && !hasPhaser) {
    return { ok: false, reason: 'no <canvas> element and no `new Phaser.Game(` call' };
  }

  // 4. Must have a keyboard handler somewhere
  if (!KEYBOARD_RE.test(html)) {
    return { ok: false, reason: 'no keyboard handler (keydown or cursorKeys) found' };
  }

  return { ok: true };
}
