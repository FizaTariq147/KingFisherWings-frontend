/** True for http(s) URLs only — blocks javascript:, data:, and other dangerous schemes. */
export function isSafeHttpUrl(url: string): boolean {
  const value = url.trim();
  if (!value) return false;
  try {
    const parsed = new URL(value, typeof window !== 'undefined' ? window.location.origin : 'https://local.invalid');
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

export function openSafeHttpUrl(url: string, target = '_blank'): Window | null {
  if (!isSafeHttpUrl(url)) return null;
  return window.open(url, target, 'noopener,noreferrer');
}
