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
  const [timeoutMs, setTimeoutMs] = useState(readLs(KEYS.timeoutMs, '30000'));
  const [status, setStatus] = useState<string>('');
  const [testing, setTesting] = useState(false);

  useEffect(() => { writeLs(KEYS.provider, provider); }, [provider]);
  useEffect(() => { writeLs(KEYS.baseUrl, baseUrl); }, [baseUrl]);
  useEffect(() => { writeLs(KEYS.model, model); }, [model]);
  useEffect(() => { writeLs(KEYS.apiKey, apiKey); }, [apiKey]);
  useEffect(() => { writeLs(KEYS.timeoutMs, timeoutMs); }, [timeoutMs]);

  async function testConnection() {
    setTesting(true);
    setStatus('Testing...');
    try {
      const url = baseUrl.replace(/\/$/, '') + (provider === 'ollama' ? '/api/tags' : '/models');
      const headers: Record<string, string> = {};
      if (apiKey) headers['Authorization'] = `Bearer ${apiKey}`;
      const res = await fetch(url, { method: 'GET', headers });
      if (res.ok) {
        setStatus(`Connected (${provider} reachable)`);
      } else {
        setStatus(`${res.status} ${res.statusText}`);
      }
    } catch (e) {
      setStatus(`${(e as Error).message}`);
    } finally {
      setTesting(false);
    }
  }

  return (
    <div className="border border-zinc-700 rounded p-3 flex flex-col gap-2 text-sm" data-testid="local-provider-card">
      <h3 className="font-medium text-zinc-200">Local LLM</h3>
      <p className="text-xs text-zinc-500">Run generation on your machine. Saves Cloudflare quota.</p>

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

      <label className="text-zinc-300" htmlFor="local-timeout">Timeout (ms, 1000-120000)</label>
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
