import type { GameConfig } from '@whimsy/templates';

export interface GenerateResult {
  ok: boolean;
  config?: GameConfig;
  raw?: string;
  error?: string;
}

const SYSTEM_PROMPT = `You are a game configuration generator. Output a single JSON object with these fields:
- type (REQUIRED): one of "sideScroller", "verticalShmup", "twinStickBattler", "tileMatch", "sokoban"
- primary, secondary, enemyColor: hex colors like "#3aa6ff"
- playerLabel, enemyLabel: short names like "comet", "asteroid"
- type-specific numeric fields (playerSpeed, jumpVelocity, scrollSpeed, boardSize, gridSize, etc.)

Output ONLY the JSON object, no markdown, no explanations, no code fences. Example:
{"type":"sideScroller","primary":"#3aa6ff","secondary":"#ffffff","enemyColor":"#ff4444","playerLabel":"comet","enemyLabel":"asteroid","playerSpeed":220,"jumpVelocity":460,"gravity":900,"enemyCount":5,"lives":3}`;

function validateBaseUrl(url: string | undefined): string {
  if (!url) throw new Error('localBaseUrl is required');
  let parsed: URL;
  try { parsed = new URL(url); } catch { throw new Error(`baseUrl is not a valid URL: ${url}`); }
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    throw new Error(`baseUrl must be http(s), got ${parsed.protocol}`);
  }
  return url.replace(/\/$/, '');
}

export interface GenerateInput {
  text: string;
  model?: 'ollama' | 'openai-compatible';
  localBaseUrl?: string;
  localModel?: string;
  localApiKey?: string;
  localTimeoutMs?: number;
}

async function callOllama(input: Required<Pick<GenerateInput, 'text' | 'localBaseUrl' | 'localModel' | 'localTimeoutMs'>>): Promise<string> {
  const url = `${validateBaseUrl(input.localBaseUrl)}/api/generate`;
  const body = {
    model: input.localModel,
    prompt: `${SYSTEM_PROMPT}\n\nUser prompt: ${input.text}`,
    stream: false,
    options: { temperature: 0.4, num_predict: -1 },
  };
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), input.localTimeoutMs);
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Ollama ${res.status}: ${text}`);
    }
    const json = (await res.json()) as { response?: string };
    return json.response ?? '';
  } finally {
    clearTimeout(timer);
  }
}

async function callOpenAiCompatible(input: Required<Pick<GenerateInput, 'text' | 'localBaseUrl' | 'localModel' | 'localTimeoutMs'>> & { localApiKey?: string }): Promise<string> {
  const url = `${validateBaseUrl(input.localBaseUrl)}/chat/completions`;
  const body = {
    model: input.localModel,
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: input.text },
    ],
    max_tokens: -1,
    temperature: 0.4,
  };
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (input.localApiKey) headers['Authorization'] = `Bearer ${input.localApiKey}`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), input.localTimeoutMs);
  try {
    const res = await fetch(url, {
      method: 'POST', headers, body: JSON.stringify(body), signal: controller.signal,
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`OAI-compatible ${res.status}: ${text}`);
    }
    const json = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    return json.choices?.[0]?.message?.content ?? '';
  } finally {
    clearTimeout(timer);
  }
}

export async function generateGameConfig(input: GenerateInput): Promise<GenerateResult> {
  if (!input.model) return { ok: false, error: 'model is required (set in Settings → Local LLM)' };
  if (!input.localBaseUrl) return { ok: false, error: 'localBaseUrl is required (set in Settings → Local LLM)' };
  if (!input.localModel) return { ok: false, error: 'localModel is required (set in Settings → Local LLM)' };

  const timeoutMs = input.localTimeoutMs ?? 300000;
  const fn = input.model === 'ollama' ? callOllama : callOpenAiCompatible;
  try {
    const raw = await fn({
      text: input.text,
      localBaseUrl: input.localBaseUrl,
      localModel: input.localModel,
      localTimeoutMs: timeoutMs,
      ...(input.localApiKey ? { localApiKey: input.localApiKey } : {}),
    });
    return { ok: true, config: parseConfigClient(raw), raw };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

// Lazy import to avoid circular dependency with templates package at module-load time.
function parseConfigClient(raw: string): GameConfig {
  // Strip markdown fence if present.
  const stripped = raw
    .replace(/^[\s\S]*?```(?:json|JSON)?\s*\n/, '')
    .replace(/\n```\s*$/, '')
    .trim();
  const m = stripped.match(/\{[\s\S]*\}/);
  let parsed: any = {};
  if (m) {
    try { parsed = JSON.parse(m[0]); } catch { parsed = {}; }
  }
  const VALID_TYPES = ['sideScroller', 'verticalShmup', 'twinStickBattler', 'tileMatch', 'sokoban'] as const;
  const type = VALID_TYPES.includes(parsed.type) ? parsed.type : VALID_TYPES[Math.floor(Math.random() * VALID_TYPES.length)]!;
  const isHex = (s: unknown) => typeof s === 'string' && /^#[0-9a-fA-F]{6}$/.test(s);
  const clamp = (v: any, lo: number, hi: number, fallback: number): number => {
    if (typeof v !== 'number' || !Number.isFinite(v)) return fallback;
    return Math.max(lo, Math.min(hi, Math.round(v)));
  };
  return {
    type,
    primary: isHex(parsed.primary) ? parsed.primary : '#3aa6ff',
    secondary: isHex(parsed.secondary) ? parsed.secondary : '#ffffff',
    enemyColor: isHex(parsed.enemyColor) ? parsed.enemyColor : '#ff4444',
    playerLabel: typeof parsed.playerLabel === 'string' ? parsed.playerLabel.slice(0, 32) : 'hero',
    enemyLabel: typeof parsed.enemyLabel === 'string' ? parsed.enemyLabel.slice(0, 32) : 'enemy',
    playerSpeed: clamp(parsed.playerSpeed, 50, 400, 220),
    jumpVelocity: clamp(parsed.jumpVelocity, 200, 600, 460),
    gravity: clamp(parsed.gravity, 400, 1200, 900),
    enemyCount: clamp(parsed.enemyCount, 1, 15, 5),
    enemySpeed: clamp(parsed.enemySpeed, 50, 300, 200),
    spawnIntervalMs: clamp(parsed.spawnIntervalMs, 500, 3000, 1400),
    scrollSpeed: clamp(parsed.scrollSpeed, 1, 3, 1.5),
    enemyFireRateMs: clamp(parsed.enemyFireRateMs, 0, 3000, 1500),
    enemyRows: clamp(parsed.enemyRows, 1, 5, 3),
    roomCount: clamp(parsed.roomCount, 1, 8, 4),
    enemiesPerRoom: clamp(parsed.enemiesPerRoom, 2, 10, 5),
    enemyFireMs: clamp(parsed.enemyFireMs, 0, 3000, 1500),
    boardSize: clamp(parsed.boardSize, 6, 10, 8),
    moves: clamp(parsed.moves, 10, 50, 20),
    targetScore: clamp(parsed.targetScore, 500, 5000, 1500),
    iceBlocks: clamp(parsed.iceBlocks, 0, 10, 0),
    gridSize: clamp(parsed.gridSize, 5, 8, 6),
    boxCount: clamp(parsed.boxCount, 1, 8, 3),
    movingTarget: Boolean(parsed.movingTarget),
    lives: clamp(parsed.lives, 1, 9, 3),
  } as GameConfig;
}
