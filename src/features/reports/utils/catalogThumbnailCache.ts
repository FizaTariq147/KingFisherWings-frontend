/** In-memory cache of OUR catalogue output thumbnails (data URLs), keyed by code+context. */

const cache = new Map<string, string>();
const inflight = new Map<string, Promise<string | null>>();

export function catalogThumbnailCacheKey(code: string, contextKey: string): string {
  return `${code.trim().toUpperCase()}::${contextKey || 'none'}`;
}

export function getCachedCatalogThumbnail(key: string): string | null {
  return cache.get(key) ?? null;
}

export function setCachedCatalogThumbnail(key: string, dataUrl: string): void {
  cache.set(key, dataUrl);
}

export function getOrCreateCatalogThumbnailJob(
  key: string,
  factory: () => Promise<string | null>,
): Promise<string | null> {
  const hit = cache.get(key);
  if (hit) return Promise.resolve(hit);
  const existing = inflight.get(key);
  if (existing) return existing;
  const job = factory()
    .then((url) => {
      if (url) cache.set(key, url);
      return url;
    })
    .finally(() => {
      inflight.delete(key);
    });
  inflight.set(key, job);
  return job;
}

/** Test helper — clear cache between cases. */
export function clearCatalogThumbnailCache(): void {
  cache.clear();
  inflight.clear();
}
