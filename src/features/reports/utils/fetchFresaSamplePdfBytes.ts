/**
 * Load official Fresa sample PDF bytes for catalogue browse.
 * Browser CORS often blocks fresatechnologies.com — prefer same-origin
 * `/fresa-sample/...` (Vite proxy in vite.config.ts).
 */

const FRESA_ORIGIN = 'https://fresatechnologies.com';

export function toFresaSampleProxyUrl(absoluteUrl: string): string | null {
  const raw = absoluteUrl.trim();
  if (!raw) return null;
  try {
    const u = new URL(raw);
    if (u.origin !== FRESA_ORIGIN) return null;
    return `/fresa-sample${u.pathname}${u.search}`;
  } catch {
    return null;
  }
}

async function fetchArrayBuffer(url: string): Promise<ArrayBuffer> {
  const res = await fetch(url, { method: 'GET', credentials: 'omit', mode: 'cors' });
  if (!res.ok) {
    throw new Error(`Sample PDF fetch failed (${res.status}) for ${url}`);
  }
  const buf = await res.arrayBuffer();
  if (!buf.byteLength) throw new Error(`Empty sample PDF from ${url}`);
  // Basic PDF magic check
  const head = new Uint8Array(buf.slice(0, 5));
  const magic = String.fromCharCode(...head);
  if (!magic.startsWith('%PDF')) {
    throw new Error(`Response is not a PDF (${url})`);
  }
  return buf;
}

/**
 * Try same-origin Vite/nginx proxy first, then direct CDN URL.
 */
export async function fetchFresaSamplePdfBytes(samplePdfUrl: string): Promise<ArrayBuffer> {
  const absolute = samplePdfUrl.trim();
  if (!absolute) throw new Error('No sample PDF URL for this HBL format.');

  const proxy = toFresaSampleProxyUrl(absolute);
  const errors: string[] = [];

  if (proxy) {
    try {
      return await fetchArrayBuffer(proxy);
    } catch (err) {
      errors.push(err instanceof Error ? err.message : String(err));
    }
  }

  try {
    return await fetchArrayBuffer(absolute);
  } catch (err) {
    errors.push(err instanceof Error ? err.message : String(err));
  }

  throw new Error(
    `Could not load official Fresa HBL sample PDF. ${errors.join(' | ')} ` +
      'Configure the /fresa-sample proxy (see vite.config.ts) or bind sea.hbl_draft pack.',
  );
}
