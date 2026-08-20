/**
 * Allow only same-app relative paths under a prefix.
 * Blocks protocol-relative (`//evil.com`), `javascript:`, and `/prefix.evil` prefix tricks.
 */
export function safeInternalPath(
  candidate: unknown,
  options: { prefix: string; fallback: string },
): string {
  if (typeof candidate !== 'string') return options.fallback;
  const path = candidate.trim();
  if (!path.startsWith('/') || path.startsWith('//')) return options.fallback;
  if (path.includes('\\') || path.includes('://') || path.includes('..')) return options.fallback;
  if (/[\s<>'"]/.test(path)) return options.fallback;

  const { prefix, fallback } = options;
  if (path === prefix) return path;
  if (path.startsWith(`${prefix}/`) || path.startsWith(`${prefix}?`) || path.startsWith(`${prefix}#`)) {
    return path;
  }
  return fallback;
}
