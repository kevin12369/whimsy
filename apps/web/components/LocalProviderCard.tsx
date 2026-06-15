import { useState, useEffect } from 'react';

const PROVIDERS = [
  { id: 'ollama', label: 'Ollama' },
  { id: 'openai-compatible', label: 'OpenAI Compatible' },
] as const;

const BASEURL_PRESETS = [
  { label: 'Ollama (http://localhost:11434)', value: 'http://localhost:11434' },
  { label: 'LM Studio (http://localhost:1234/v1)', value: 'http://localhost:1234/v1' },
  { label: 'vLLM (http://localhost:8000/v1)', value: 'http://localhost:8000/v1' },
  { label: 'llama.cpp server (http://localhost:8080/v1)', value: 'http://localhost:8080/v1' },
  { label: 'Custom', value: '__custom__' },
];

const KEYS = {
  provider: 'whimsy:local:provider',
  baseUrl: 'whimsy:local:baseUrl',
  model: 'whimsy:local:model',
  apiKey: 'whimsy:local:apiKey',
  timeoutMs: 'whimsy:local:timeoutMs',
} as const;

function readLs(key: string, fallback = ''): string {
  if (typeof localStorage === 'undefined') return fallback;
  return localStorage.getItem(key) ?? fallback;
}

function writeLs(key: string, value: string) {
  if (typeof localStorage !== 'undefined') localStorage.setItem(key, value);
}

export function LocalProviderCard() {
  const [provider, setProvider] = useState(readLs(KEYS.provider, 'ollama'));
  const [baseUrl, setBaseUrl] = useState(readLs(KEYS.baseUrl, 'http://localhost:11434'));
  const [model, setModel] = useState(readLs(KEYS.model));
  const [apiKey, setApiKey] = useState(readLs(KEYS.apiKey));
  const [timeoutMs, setTimeoutMs] = useState(readLs(KEYS.timeoutMs, '120000'));
  const [useLocal, setUseLocal] = useState(readLs('whimsy:useLocal') === 'true');
  const [status, setStatus] = useState<string>('');
  const [testing, setTesting] = useState(false);

  useEffect(() => { writeLs(KEYS.provider, provider); }, [provider]);
  useEffect(() => { writeLs(KEYS.baseUrl, baseUrl); }, [baseUrl]);
  useEffect(() => { writeLs(KEYS.model, model); }, [model]);
  useEffect(() => { writeLs(KEYS.apiKey, apiKey); }, [apiKey]);
  useEffect(() => { writeLs(KEYS.timeoutMs, timeoutMs); }, [timeoutMs]);
  useEffect(() => { writeLs('whimsy:useLocal', useLocal ? 'true' : 'false'); }, [useLocal]);

  async function testConnection() {
    setTesting(true);
    setStatus('Testing...');
    // Build URL + headers outside try so the no-cors fallback can reuse them.
    const trimmed = baseUrl.replace(/\/$/, '');
    // Ollama uses root + /api/tags; OpenAI-compatible providers (LM Studio /
    // vLLM / llama.cpp) expose models at /v1/models. If the user's baseUrl
    // already ends with /v1, dedupe so we don't request /v1/v1/models.
    const path = provider === 'ollama'
      ? '/api/tags'
      : trimmed.endsWith('/v1') ? '/models' : '/v1/models';
    const url = trimmed + path;
    const headers: Record<string, string> = {};
    if (apiKey) headers['Authorization'] = `Bearer ${apiKey}`;
    try {
      const res = await fetch(url, { method: 'GET', headers });
      if (res.ok) {
        setStatus(`Connected (${provider} reachable)`);
        return;
      }
      setStatus(`${res.status} ${res.statusText}`);
    } catch {
      // Normal fetch blocked — most likely mixed-content (https page -> http
      // localhost) or CORS. Retry in no-cors mode: browser sends the request
      // (so we can confirm reachability) but the response is opaque and unread.
      try {
        await fetch(url, { method: 'GET', mode: 'no-cors', headers, signal: AbortSignal.timeout(5000) });
        const onHttps = typeof window !== 'undefined' && window.location.protocol === 'https:';
        const tip = onHttps
          ? `Network reachable, but this page is https — it can't read http://${trimmed.replace(/^https?:\/\//, '')} response. ` +
            `Run \`pnpm --filter @whimsy/web dev\` and open http://localhost:3000/whimsy/ locally to test.`
          : `Network reachable, but the browser blocked the response. ` +
            `Check your LLM server is running and its CORS allowlist includes ${window.location.origin}.`;
        setStatus(tip);
      } catch (e2) {
        setStatus(`Unreachable: ${(e2 as Error).message}`);
      }
    } finally {
      setTesting(false);
    }
  }

  return (
    <div className="border border-zinc-700 rounded p-3 flex flex-col gap-2 text-sm" data-testid="local-provider-card">
      <h3 className="font-medium text-zinc-200">Local LLM</h3>
      <p className="text-xs text-zinc-500">Run generation on your machine. Saves Cloudflare quota.</p>
      <label className="flex items-center gap-2 text-zinc-200 cursor-pointer" htmlFor="local-useLocal">
        <input
          id="local-useLocal"
          type="checkbox"
          checked={useLocal}
          onChange={(e) => setUseLocal(e.target.checked)}
          data-testid="local-use-local-toggle"
          className="rounded bg-zinc-800 border-zinc-700"
        />
        <span>Use local LLM (route generation here instead of Cloudflare)</span>
      </label>
      <p className="text-xs text-amber-400/80">
        LM Studio: enable CORS in <em>Local Server &rarr; CORS &rarr; Allow any origin</em>, then restart the server.<br />
        Ollama: set <code className="text-amber-300">OLLAMA_ORIGINS=*</code> before <code className="text-amber-300">ollama serve</code>.<br />
        On GitHub Pages (https) the request is sent but the response is unread; run <code className="text-amber-300">pnpm dev</code> locally to test end-to-end.
      </p>

      <label className="text-zinc-300" htmlFor="local-prov">Provider</label>
      <select id="local-prov" value={provider} onChange={(e) => setProvider(e.target.value)}
        className="rounded bg-zinc-800 border border-zinc-700 px-2 py-1">
        {PROVIDERS.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
      </select>

      <label className="text-zinc-300" htmlFor="local-url-preset">Base URL preset</label>
      <select id="local-url-preset"
        value={BASEURL_PRESETS.some(p => p.value === baseUrl) ? baseUrl : '__custom__'}
        onChange={(e) => {
          const v = e.target.value;
          if (v !== '__custom__') setBaseUrl(v);
        }}
        className="rounded bg-zinc-800 border border-zinc-700 px-2 py-1">
        {BASEURL_PRESETS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
      </select>
      <label className="text-zinc-300" htmlFor="local-url">Base URL</label>
      <input id="local-url" type="text" value={baseUrl} onChange={(e) => setBaseUrl(e.target.value)}
        placeholder="http://localhost:11434"
        className="rounded bg-zinc-800 border border-zinc-700 px-2 py-1 text-xs" />

      <label className="text-zinc-300" htmlFor="local-model">Local model</label>
      <input id="local-model" type="text" value={model} onChange={(e) => setModel(e.target.value)}
        placeholder={provider === 'ollama' ? 'e.g. llama3.1:8b' : 'e.g. qwen2.5-coder-7b-instruct'}
        className="rounded bg-zinc-800 border border-zinc-700 px-2 py-1" />

      <label className="text-zinc-300" htmlFor="local-key">Local API key (optional)</label>
      <input id="local-key" type="password" value={apiKey} onChange={(e) => setApiKey(e.target.value)}
        className="rounded bg-zinc-800 border border-zinc-700 px-2 py-1" />

      <label className="text-zinc-300" htmlFor="local-timeout">Timeout (ms, 1000-120000, default 120000 for big local models)</label>
      <input id="local-timeout" type="number" min={1000} max={120000} value={timeoutMs}
        onChange={(e) => setTimeoutMs(e.target.value)}
        className="rounded bg-zinc-800 border border-zinc-700 px-2 py-1" />

      <button type="button" onClick={testConnection} disabled={testing || !baseUrl}
        className="rounded bg-zinc-700 hover:bg-zinc-600 text-zinc-100 px-3 py-1 text-sm disabled:opacity-50">
        {testing ? 'Testing...' : 'Test connection'}
      </button>

      {status && <p className="text-xs text-zinc-400">{status}</p>}
    </div>
  );
}
