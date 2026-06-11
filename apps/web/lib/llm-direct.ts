export interface GenerateInput {
  text: string;
  model?: 'ollama' | 'openai-compatible';
  localBaseUrl?: string;
  localModel?: string;
  localApiKey?: string;
  localTimeoutMs?: number;
}

export interface GenerateResult {
  ok: boolean;
  html?: string;
  bytes?: number;
  error?: string;
}

const SYSTEM_PROMPT =
  'You are a Phaser 3 game generator. Output a single complete HTML file with Phaser loaded from https://cdn.jsdelivr.net/npm/phaser@3.70.0/dist/phaser.min.js. The HTML must be self-contained, under 200KB, with no fetch/XMLHttpRequest/eval/localStorage/window.parent calls. Do not include explanations, just the HTML.';

function validateBaseUrl(url: string | undefined): string {
  if (!url) throw new Error('localBaseUrl is required');
  let parsed: URL;
  try { parsed = new URL(url); } catch { throw new Error(`baseUrl is not a valid URL: ${url}`); }
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    throw new Error(`baseUrl must be http(s), got ${parsed.protocol}`);
  }
  return url.replace(/\/$/, '');
}

async function callOllama(input: Required<Pick<GenerateInput, 'text' | 'localBaseUrl' | 'localModel' | 'localTimeoutMs'>>): Promise<{ text: string }> {
  const url = `${validateBaseUrl(input.localBaseUrl)}/api/generate`;
  const body = {
    model: input.localModel,
    prompt: `${SYSTEM_PROMPT}\n\n${input.text}`,
    stream: false,
    options: { temperature: 0.4, num_predict: 4000 },
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
    return { text: json.response ?? '' };
  } finally {
    clearTimeout(timer);
  }
}

async function callOpenAiCompatible(input: Required<Pick<GenerateInput, 'text' | 'localBaseUrl' | 'localModel' | 'localTimeoutMs'>> & { localApiKey?: string }): Promise<{ text: string }> {
  const url = `${validateBaseUrl(input.localBaseUrl)}/chat/completions`;
  const body = {
    model: input.localModel,
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: input.text },
    ],
    max_tokens: 4000,
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
    const text = json.choices?.[0]?.message?.content ?? '';
    return { text };
  } finally {
    clearTimeout(timer);
  }
}

export async function generateWithLocalLLM(input: GenerateInput): Promise<GenerateResult> {
  if (!input.model) throw new Error('model is required (set in Settings → Local LLM)');
  if (!input.localBaseUrl) throw new Error('localBaseUrl is required (set in Settings → Local LLM)');
  if (!input.localModel) throw new Error('localModel is required (set in Settings → Local LLM)');

  const normalized = {
    text: input.text,
    localBaseUrl: input.localBaseUrl,
    localModel: input.localModel,
    localTimeoutMs: input.localTimeoutMs ?? 30000,
    localApiKey: input.localApiKey,
  };

  try {
    const r = input.model === 'ollama'
      ? await callOllama(normalized)
      : await callOpenAiCompatible(normalized);
    if (!r.text) {
      return { ok: false, error: 'LLM returned empty response' };
    }
    return { ok: true, html: r.text, bytes: r.text.length };
  } catch (e) {
    const msg = (e as Error).message;
    if (msg.includes('Failed to fetch') || msg.includes('NetworkError')) {
      return { ok: false, error: `Network error — is ${input.model} running at ${input.localBaseUrl}?` };
    }
    return { ok: false, error: msg };
  }
}
