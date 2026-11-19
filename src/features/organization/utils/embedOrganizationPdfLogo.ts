import { axiosInstance } from '@/lib/axios';
import { getConfiguredApiBase, isApiOriginUrl } from '@/lib/safeHttpUrl';
import { parseFilesApiUrl } from '@/features/files/utils/parseFilesApiUrl';
import { BRAND_LOGO_API } from '@/features/branding/api/brandLogo.api';
import type { PDFDocument, PDFImage } from 'pdf-lib';
import {
  cacheOrganizationLogoDataUrl,
  readCachedOrganizationLogoDataUrl,
} from './orgLogoCache';

export type EmbeddedPdfLogo = {
  image: PDFImage | null;
  width: number;
  height: number;
};

/**
 * Repair logo URLs mangled by older form normalizeUrl
 * (`/files/...` → `https:///files/...` or `https://files/...`).
 */
export function repairOrganizationLogoUrl(logoUrl?: string | null): string {
  const trimmed = String(logoUrl ?? '').trim();
  if (!trimmed) return '';
  if (trimmed.startsWith('blob:')) return '';

  const triple = trimmed.match(/^https?:\/\/\/(.+)$/i);
  if (triple?.[1]) {
    const rest = triple[1];
    if (rest.startsWith('files/') || rest.startsWith('backend/')) {
      return `/${rest}`;
    }
  }

  try {
    const parsed = new URL(trimmed);
    if (
      (!parsed.hostname || parsed.hostname === 'files') &&
      /^\/files\//i.test(parsed.pathname)
    ) {
      return parsed.pathname + parsed.search;
    }
  } catch {
    /* not absolute */
  }

  const hostFiles = trimmed.match(/^https?:\/\/files\/(.+)$/i);
  if (hostFiles?.[1]) return `/files/${hostFiles[1]}`;

  return trimmed;
}

function dataUrlToBytes(dataUrl: string): ArrayBuffer | null {
  const comma = dataUrl.indexOf(',');
  if (comma < 0) return null;
  const meta = dataUrl.slice(0, comma);
  const payload = dataUrl.slice(comma + 1);
  if (!payload) return null;
  try {
    const binary = meta.includes(';base64')
      ? atob(payload)
      : decodeURIComponent(payload);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
    return bytes.buffer;
  } catch {
    return null;
  }
}

/**
 * Map a logo URL onto an axios path that goes through the `/backend` proxy
 * when VITE_API_URL is relative (e.g. `/files/x` → `/backend/files/x`).
 */
function toAxiosPath(url: string): string {
  let path = url;
  if (!(url.startsWith('/') && !url.startsWith('//'))) {
    try {
      path = `${new URL(url).pathname}${new URL(url).search}`;
    } catch {
      path = url;
    }
  }
  if (!path.startsWith('/') || path.startsWith('//')) return path;

  const apiBase = getConfiguredApiBase();
  if (!apiBase.startsWith('/')) return path;
  if (path === apiBase || path.startsWith(`${apiBase}/`)) return path;
  return `${apiBase}${path}`;
}

function sniffMime(bytes: ArrayBuffer): string | undefined {
  const u8 = new Uint8Array(bytes);
  if (u8.length >= 8 && u8[0] === 0x89 && u8[1] === 0x50) return 'image/png';
  if (u8.length >= 3 && u8[0] === 0xff && u8[1] === 0xd8 && u8[2] === 0xff) {
    return 'image/jpeg';
  }
  if (
    u8.length >= 12 &&
    u8[0] === 0x52 &&
    u8[1] === 0x49 &&
    u8[2] === 0x46 &&
    u8[3] === 0x46 &&
    u8[8] === 0x57 &&
    u8[9] === 0x45 &&
    u8[10] === 0x42 &&
    u8[11] === 0x50
  ) {
    return 'image/webp';
  }
  const head = new TextDecoder().decode(u8.slice(0, 64)).trimStart();
  if (head.startsWith('<svg') || head.startsWith('<?xml')) return 'image/svg+xml';
  return undefined;
}

function looksLikeImageBytes(bytes: ArrayBuffer): boolean {
  if (!bytes || bytes.byteLength < 24) return false;
  if (sniffMime(bytes)) return true;
  const head = new TextDecoder().decode(new Uint8Array(bytes.slice(0, 32))).trimStart();
  if (head.startsWith('{') || head.startsWith('<!DOCTYPE') || head.startsWith('<html')) {
    return false;
  }
  return bytes.byteLength > 256;
}

async function canvasToPngBytes(
  source: CanvasImageSource,
  width: number,
  height: number,
): Promise<ArrayBuffer | null> {
  if (!width || !height) return null;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  ctx.drawImage(source, 0, 0, width, height);
  const pngBlob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob((b) => resolve(b), 'image/png');
  });
  if (!pngBlob) return null;
  return await pngBlob.arrayBuffer();
}

async function rasterizeToPngBytes(bytes: ArrayBuffer): Promise<ArrayBuffer | null> {
  if (typeof document === 'undefined') return null;
  const mime = sniffMime(bytes) || 'application/octet-stream';
  const blob = new Blob([bytes], { type: mime });

  if (typeof createImageBitmap === 'function') {
    try {
      const bitmap = await createImageBitmap(blob);
      try {
        const png = await canvasToPngBytes(bitmap, bitmap.width, bitmap.height);
        if (png) return png;
      } finally {
        bitmap.close();
      }
    } catch {
      /* fall through */
    }
  }

  const objectUrl = URL.createObjectURL(blob);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error('Logo image decode failed'));
      el.src = objectUrl;
    });
    return await canvasToPngBytes(
      img,
      img.naturalWidth || img.width,
      img.naturalHeight || img.height,
    );
  } catch {
    return null;
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

async function axiosGetBytes(pathOrUrl: string): Promise<ArrayBuffer | null> {
  try {
    const res = await axiosInstance.get<ArrayBuffer | Blob>(toAxiosPath(pathOrUrl), {
      responseType: 'arraybuffer',
      skipErrorToast: true,
    } as Parameters<typeof axiosInstance.get>[1]);
    let data: ArrayBuffer | null = null;
    if (res.data instanceof ArrayBuffer) {
      data = res.data;
    } else if (typeof Blob !== 'undefined' && res.data instanceof Blob) {
      data = await res.data.arrayBuffer();
    }
    if (!data || data.byteLength < 24) return null;
    if (!looksLikeImageBytes(data)) return null;
    return data;
  } catch {
    return null;
  }
}

async function fetchOneLogoCandidate(url: string): Promise<ArrayBuffer | null> {
  const trimmed = repairOrganizationLogoUrl(url);
  if (!trimmed && !String(url ?? '').trim().startsWith('data:image/')) {
    const raw = String(url ?? '').trim();
    if (raw.startsWith('data:image/')) return dataUrlToBytes(raw);
    return null;
  }

  const raw = String(url ?? '').trim();
  if (raw.startsWith('data:image/')) {
    return dataUrlToBytes(raw);
  }
  if (!trimmed) return null;

  if (isApiOriginUrl(trimmed) || trimmed.startsWith('/')) {
    const viaAxios = await axiosGetBytes(trimmed);
    if (viaAxios) return viaAxios;

    const stored = parseFilesApiUrl(trimmed);
    if (stored) {
      const encoded = `/files/${encodeURIComponent(stored.tenantId)}/${stored.filename
        .split('/')
        .map((s) => encodeURIComponent(s))
        .join('/')}`;
      const viaFiles = await axiosGetBytes(encoded);
      if (viaFiles) return viaFiles;
    }
  }

  try {
    const absolute = /^https?:\/\//i.test(trimmed)
      ? trimmed
      : new URL(trimmed, window.location.origin).href;
    const res = await fetch(absolute, {
      mode: 'cors',
      credentials: isApiOriginUrl(trimmed) ? 'include' : 'omit',
    });
    if (!res.ok) return null;
    const bytes = await res.arrayBuffer();
    return looksLikeImageBytes(bytes) ? bytes : null;
  } catch {
    return null;
  }
}

/**
 * Load organization logo bytes for client PDF embedding.
 * Order: local PNG cache → profile logo_url → GET /organization/logo.
 */
export async function fetchOrganizationLogoBytes(
  logoUrl?: string | null,
): Promise<ArrayBuffer | null> {
  const candidates: string[] = [];
  const cached = readCachedOrganizationLogoDataUrl();
  if (cached) candidates.push(cached);

  const repaired = repairOrganizationLogoUrl(logoUrl);
  if (repaired) candidates.push(repaired);
  if (String(logoUrl ?? '').trim().startsWith('data:image/')) {
    candidates.push(String(logoUrl).trim());
  }
  candidates.push(BRAND_LOGO_API.organizationLogo);

  const seen = new Set<string>();
  for (const candidate of candidates) {
    const key = candidate.trim();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    const bytes = await fetchOneLogoCandidate(key);
    if (bytes) {
      // Refresh cache with a PNG data URL when we successfully load remote bytes.
      if (!key.startsWith('data:image/') && sniffMime(bytes) === 'image/png') {
        try {
          const u8 = new Uint8Array(bytes);
          let binary = '';
          for (let i = 0; i < u8.length; i += 1) binary += String.fromCharCode(u8[i]);
          cacheOrganizationLogoDataUrl(`data:image/png;base64,${btoa(binary)}`);
        } catch {
          /* ignore cache write */
        }
      } else if (!key.startsWith('data:image/')) {
        const png = await rasterizeToPngBytes(bytes);
        if (png) {
          try {
            const u8 = new Uint8Array(png);
            let binary = '';
            for (let i = 0; i < u8.length; i += 1) binary += String.fromCharCode(u8[i]);
            cacheOrganizationLogoDataUrl(`data:image/png;base64,${btoa(binary)}`);
            return png;
          } catch {
            return bytes;
          }
        }
      }
      return bytes;
    }
  }
  return null;
}

async function embedPngOrJpg(
  doc: PDFDocument,
  bytes: ArrayBuffer,
  maxHeight: number,
): Promise<EmbeddedPdfLogo | null> {
  try {
    let image: PDFImage;
    try {
      image = await doc.embedPng(bytes);
    } catch {
      image = await doc.embedJpg(bytes);
    }
    const scale = maxHeight / image.height;
    return { image, width: image.width * scale, height: maxHeight };
  } catch {
    return null;
  }
}

async function embedBytes(
  doc: PDFDocument,
  bytes: ArrayBuffer,
  maxHeight: number,
): Promise<EmbeddedPdfLogo | null> {
  const mime = sniffMime(bytes);
  if (mime === 'image/webp' || mime === 'image/svg+xml' || !mime) {
    const rasterized = await rasterizeToPngBytes(bytes);
    if (rasterized) {
      const embedded = await embedPngOrJpg(doc, rasterized, maxHeight);
      if (embedded) return embedded;
    }
  }

  const direct = await embedPngOrJpg(doc, bytes, maxHeight);
  if (direct) return direct;

  const rasterized = await rasterizeToPngBytes(bytes);
  if (rasterized) return embedPngOrJpg(doc, rasterized, maxHeight);
  return null;
}

/**
 * Embed the organization logo into a pdf-lib document.
 * Does NOT fall back to the product KingFisher asset — that looked like a
 * "system logo" on invoices when the org logo failed to load.
 */
export async function embedOrganizationPdfLogo(
  doc: PDFDocument,
  preferredLogoUrl?: string | null,
  opts?: { maxHeight?: number; allowProductFallback?: boolean },
): Promise<EmbeddedPdfLogo> {
  const maxHeight = opts?.maxHeight ?? 48;

  const orgBytes = await fetchOrganizationLogoBytes(preferredLogoUrl || null);
  if (orgBytes) {
    const embedded = await embedBytes(doc, orgBytes, maxHeight);
    if (embedded) return embedded;
  }

  // Product fallback disabled by default for commercial PDFs (invoice/quote/CN/DN).
  if (opts?.allowProductFallback === true) {
    const { resolveProductFallbackLogoUrl } = await import(
      '@/features/reports/constants/reportBranding.constants'
    );
    const fallback = resolveProductFallbackLogoUrl();
    if (fallback) {
      const bytes = await fetchOneLogoCandidate(fallback);
      if (bytes) {
        return (await embedBytes(doc, bytes, maxHeight)) ?? { image: null, width: 0, height: 0 };
      }
    }
  }

  return { image: null, width: 0, height: 0 };
}
