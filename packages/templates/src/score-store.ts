const PREFIX = 'whimsy:score:';

export function recordEnd(templateId: string, _level: number, score: number): { isNewHigh: boolean } {
  if (typeof localStorage === 'undefined') return { isNewHigh: false };
  const key = PREFIX + templateId;
  const raw = localStorage.getItem(key);
  const data = raw ? JSON.parse(raw) : { high: 0, plays: 0 };
  data.plays++;
  const isNewHigh = score > data.high;
  if (isNewHigh) data.high = score;
  localStorage.setItem(key, JSON.stringify(data));
  return { isNewHigh };
}

export function getHighScore(templateId: string): number {
  if (typeof localStorage === 'undefined') return 0;
  const raw = localStorage.getItem(PREFIX + templateId);
  return raw ? JSON.parse(raw).high : 0;
}

export function clearAll(): void {
  if (typeof localStorage === 'undefined') return;
  for (let i = localStorage.length - 1; i >= 0; i--) {
    const k = localStorage.key(i);
    if (k && k.startsWith(PREFIX)) localStorage.removeItem(k);
  }
}
