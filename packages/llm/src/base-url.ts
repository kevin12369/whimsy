export function validateLocalBaseUrl(url: string): void {
  if (!url || typeof url !== 'string') {
    throw new Error('baseUrl is required');
  }
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    throw new Error(`baseUrl is not a valid URL: ${url}`);
  }
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    throw new Error(`baseUrl must be http(s), got ${parsed.protocol}`);
  }
}
