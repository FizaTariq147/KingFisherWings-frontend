import { axiosInstance } from '@/lib/axios';
import { getConfiguredApiBase } from '@/lib/safeHttpUrl';
import {
  parseFilesApiUrl,
  toDurableFilesApiPath,
} from '@/features/files/utils/parseFilesApiUrl';
import { BRAND_LOGO_API } from '@/features/branding/api/brandLogo.api';
import { useAuthStore } from '@/store/authStore';
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

/**
 * Convert a live absolute logo URL into an API-relative path so local `/backend`
 * proxy and production API hosts both work with the same account.
 *
 * Examples:
 * - https://freightnest…/backend/files/t/logo.webp → /files/t/logo.webp
 * - https://api…/files/t/logo.webp → /files/t/logo.webp
 * - /backend/files/t/logo.webp → /files/t/logo.webp
 *
 * External CDN URLs (no `/files/` or `/organization/logo`) are kept absolute so
 * sidebar `<img>` and PDF fetch share the same address — do not strip them to a
 * bare pathname that axios would 404.
 */
export function toApiRelativeLogoUrl(logoUrl?: string | null): string {
  const raw = String(logoUrl ?? '').trim();
  if (!raw || raw.startsWith('blob:')) return '';
  if (raw.startsWith('data:image/')) return raw;

  // Presigned R2/S3 URLs → durable /files/{tenant}/{filename} (strip X-Amz-* expiry).
  const durableFiles = toDurableFilesApiPath(raw);
  if (durableFiles) return durableFiles;

  const repaired = repairOrganizationLogoUrl(raw);
  let path = repaired;
  let absoluteOrigin = '';

  if (/^https?:\/\//i.test(repaired)) {
    try {
      const parsed = new URL(repaired);
      absoluteOrigin = parsed.origin;
      path = `${parsed.pathname}${parsed.search}`;
    } catch {
      return repaired;
    }
  }

  const filesIdx = path.indexOf('/files/');
  if (filesIdx >= 0) return path.slice(filesIdx).split('?')[0];

  const orgLogoIdx = path.indexOf('/organization/logo');
  if (orgLogoIdx >= 0) {
    return path.slice(orgLogoIdx).split('?')[0] || BRAND_LOGO_API.organizationLogo;
  }

  if (path.startsWith('/backend/')) {
    return path.slice('/backend'.length) || '/';
  }

  // Same-origin or configured API host → relative path for axios/proxy.
  if (absoluteOrigin) {
    const apiBase = getConfiguredApiBase();
    try {
      if (!apiBase.startsWith('/')) {
        if (new URL(apiBase).origin === absoluteOrigin) {
          return path.startsWith('/') ? path : repaired;
        }
      } else if (
        typeof window !== 'undefined' &&
        window.location.origin === absoluteOrigin
      ) {
        return path.startsWith('/') ? path : repaired;
      }
    } catch {
      /* keep absolute */
    }
    return repaired;
  }

  return path.startsWith('/') ? path : repaired;
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
 * Path for axiosInstance.get — must NOT include `/backend`.
 * axios baseURL is already `VITE_API_URL` (`/backend` or `https://host/backend`);
 * prepending `/backend` produced live 404s: `/backend/backend/organization/logo`.
 */
function toAxiosPath(url: string): string {
  const relative = toApiRelativeLogoUrl(url);
  if (!relative || relative.startsWith('data:')) return relative;

  let path = relative;
  if (!(path.startsWith('/') && !path.startsWith('//'))) {
    try {
      const parsed = new URL(path);
      path = `${parsed.pathname}${parsed.search}`;
    } catch {
      /* keep */
    }
  }
  if (!path.startsWith('/') || path.startsWith('//')) return path;

  // Strip proxy / absolute-base prefixes; axiosInstance.baseURL supplies them.
  const apiBase = getConfiguredApiBase();
  while (path.startsWith('/backend/')) {
    path = path.slice('/backend'.length) || '/';
  }
  if (path === '/backend') path = '/';
  if (apiBase.startsWith('/') && (path === apiBase || path.startsWith(`${apiBase}/`))) {
    path = path.slice(apiBase.length) || '/';
  }
  if (!apiBase.startsWith('/')) {
    try {
      const basePath = new URL(apiBase).pathname.replace(/\/$/, '');
      if (basePath && (path === basePath || path.startsWith(`${basePath}/`))) {
        path = path.slice(basePath.length) || '/';
      }
    } catch {
      /* keep */
    }
  }
  return path.startsWith('/') ? path : `/${path}`;
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
  canvas.width = Math.max(1, width);
  canvas.height = Math.max(1, height);
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  // Opaque backdrop — matches upload normalizer; avoids transparent PDF logos vanishing.
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(source, 0, 0, canvas.width, canvas.height);
  const pngBlob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob((b) => resolve(b), 'image/png');
  });
  if (!pngBlob) return null;
  return await pngBlob.arrayBuffer();
}

/** Load a public/CDN logo through the browser decoder (same path sidebar `<img>` uses). */
async function fetchLogoBytesViaHtmlImage(url: string): Promise<ArrayBuffer | null> {
  if (typeof document === 'undefined' || !url || url.startsWith('blob:')) return null;
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.crossOrigin = 'anonymous';
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error('Logo image decode failed'));
      el.src = url;
    });
    return await canvasToPngBytes(
      img,
      img.naturalWidth || img.width,
      img.naturalHeight || img.height,
    );
  } catch {
    return null;
  }
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

function bytesToPngDataUrl(bytes: ArrayBuffer): string | null {
  try {
    const u8 = new Uint8Array(bytes);
    let binary = '';
    const chunk = 0x8000;
    for (let i = 0; i < u8.length; i += chunk) {
      binary += String.fromCharCode(...u8.subarray(i, i + chunk));
    }
    return `data:image/png;base64,${btoa(binary)}`;
  } catch {
    return null;
  }
}

function pickLogoUrlFromJson(bytes: ArrayBuffer): string | null {
  try {
    const text = new TextDecoder().decode(new Uint8Array(bytes.slice(0, 4096))).trim();
    if (!text.startsWith('{') && !text.startsWith('[')) return null;
    const data = JSON.parse(text) as Record<string, unknown>;
    const nested =
      data.data && typeof data.data === 'object'
        ? (data.data as Record<string, unknown>)
        : data.organization && typeof data.organization === 'object'
          ? (data.organization as Record<string, unknown>)
          : null;
    const raw =
      data.logo_url ??
      data.logoUrl ??
      data.url ??
      nested?.logo_url ??
      nested?.logoUrl ??
      nested?.url;
    const url = String(raw ?? '').trim();
    return url || null;
  } catch {
    return null;
  }
}

async function axiosGetBytes(
  pathOrUrl: string,
  depth = 0,
): Promise<ArrayBuffer | null> {
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
    if (looksLikeImageBytes(data)) return data;

    // Some backends return `{ logo_url }` from GET /organization/logo instead of bytes.
    if (depth < 2) {
      const next = pickLogoUrlFromJson(data);
      if (next && next !== pathOrUrl) {
        const followed = await fetchOneLogoCandidate(next, depth + 1);
        if (followed) return followed;
      }
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Download `/files/{tenant}/{file}` via authenticated axios (local proxy or live API).
 * Avoids CORS: never fetch the live frontend host from localhost.
 */
async function fetchStoredFileLogoBytes(url: string): Promise<ArrayBuffer | null> {
  const relative = toApiRelativeLogoUrl(url);
  const stored = parseFilesApiUrl(relative) || parseFilesApiUrl(url);
  if (!stored) return null;

  const sessionTenant = String(useAuthStore.getState().user?.tenantId ?? '').trim();
  // Session tenant first — URL tenant segment can be a slug that fails on local.
  const tenantCandidates = [sessionTenant, stored.tenantId].filter(
    (v, i, arr) => Boolean(v) && arr.indexOf(v) === i,
  );

  for (const tenantId of tenantCandidates) {
    const path = `/files/${encodeURIComponent(tenantId)}/${stored.filename
      .split('/')
      .map((s) => encodeURIComponent(s))
      .join('/')}`;
    const bytes = await axiosGetBytes(path);
    if (bytes) return bytes;
  }

  return axiosGetBytes(relative);
}

async function fetchOneLogoCandidate(
  url: string,
  depth = 0,
): Promise<ArrayBuffer | null> {
  const raw = String(url ?? '').trim();
  if (!raw || depth > 3) return null;
  if (raw.startsWith('data:image/')) {
    return dataUrlToBytes(raw);
  }

  const relative = toApiRelativeLogoUrl(url);
  if (!relative) return null;

  if (parseFilesApiUrl(relative) || parseFilesApiUrl(raw)) {
    const stored = await fetchStoredFileLogoBytes(raw);
    if (stored) return stored;
  }

  // /organization/logo or other API paths — always through axios (Bearer + proxy).
  if (relative.startsWith('/')) {
    const viaAxios = await axiosGetBytes(relative, depth);
    if (viaAxios) return viaAxios;
  }

  // Absolute CDN / hosted URL — same source the sidebar `<img>` uses.
  const absolute =
    /^https?:\/\//i.test(raw)
      ? raw
      : /^https?:\/\//i.test(relative)
        ? relative
        : '';
  if (
    absolute &&
    !parseFilesApiUrl(absolute) &&
    !absolute.includes('/organization/logo')
  ) {
    try {
      const res = await fetch(absolute, { mode: 'cors', credentials: 'omit' });
      if (res.ok) {
        const bytes = await res.arrayBuffer();
        if (looksLikeImageBytes(bytes)) return bytes;
      }
    } catch {
      /* CORS — try HTMLImageElement next */
    }
    const viaImg = await fetchLogoBytesViaHtmlImage(absolute);
    if (viaImg) return viaImg;
  }

  return null;
}

async function rememberLogoBytes(bytes: ArrayBuffer): Promise<ArrayBuffer> {
  const mime = sniffMime(bytes);
  let out = bytes;
  if (mime === 'image/webp' || mime === 'image/svg+xml' || !mime) {
    const rasterized = await rasterizeToPngBytes(bytes);
    if (rasterized) out = rasterized;
  }
  const png =
    sniffMime(out) === 'image/png' ? out : (await rasterizeToPngBytes(out)) || out;
  const dataUrl = sniffMime(png) === 'image/png' ? bytesToPngDataUrl(png) : null;
  if (dataUrl) cacheOrganizationLogoDataUrl(dataUrl);
  return out;
}

/**
 * Load organization logo bytes for sidebar + client PDFs.
 * Auth paths first (`/files/…`, `/organization/logo`) so every device/session
 * sees the same logo — not this browser’s localStorage alone.
 */
export async function fetchOrganizationLogoBytes(
  logoUrl?: string | null,
): Promise<ArrayBuffer | null> {
  const networkCandidates: string[] = [];
  const raw = String(logoUrl ?? '').trim();
  const durable = toDurableFilesApiPath(raw);
  const relative = toApiRelativeLogoUrl(logoUrl);

  // 1) Durable authenticated file path (R2/S3 object URLs rewrite here).
  if (durable) networkCandidates.push(durable);
  if (relative && relative !== durable) networkCandidates.push(relative);

  // 2) Org logo binary — same for all sessions after POST /organization/logo.
  networkCandidates.push(BRAND_LOGO_API.organizationLogo);

  // 3) Original URL (public CDN) + repairs.
  if (raw && raw !== relative && raw !== durable) networkCandidates.push(raw);
  if (raw.startsWith('data:image/')) networkCandidates.push(raw);
  const repaired = repairOrganizationLogoUrl(logoUrl);
  if (
    repaired &&
    repaired !== relative &&
    repaired !== raw &&
    repaired !== durable
  ) {
    networkCandidates.push(repaired);
  }

  const seen = new Set<string>();
  for (const candidate of networkCandidates) {
    const key = candidate.trim();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    const bytes = await fetchOneLogoCandidate(key);
    if (bytes) return rememberLogoBytes(bytes);
  }

  // Last resort only — never treat cache as cross-device source of truth.
  const cached = readCachedOrganizationLogoDataUrl();
  if (cached) {
    const bytes = dataUrlToBytes(cached);
    if (bytes) return bytes;
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
  // pdf-lib only embeds PNG/JPEG — always rasterize other formats (WebP/SVG/unknown).
  if (mime === 'image/png' || mime === 'image/jpeg') {
    const direct = await embedPngOrJpg(doc, bytes, maxHeight);
    if (direct) return direct;
  }

  const rasterized = await rasterizeToPngBytes(bytes);
  if (rasterized) {
    const embedded = await embedPngOrJpg(doc, rasterized, maxHeight);
    if (embedded) return embedded;
  }

  // Last resort: try original bytes as PNG/JPEG anyway.
  return embedPngOrJpg(doc, bytes, maxHeight);
}

async function fetchBundledAssetBytes(assetUrl: string): Promise<ArrayBuffer | null> {
  const url = String(assetUrl ?? '').trim();
  if (!url || url.startsWith('blob:')) return null;
  try {
    // Vite-bundled /assets/… — same-origin; do not send through axios API base.
    const res = await fetch(url, { credentials: 'same-origin', mode: 'same-origin' });
    if (!res.ok) return null;
    const bytes = await res.arrayBuffer();
    return looksLikeImageBytes(bytes) ? bytes : null;
  } catch {
    return null;
  }
}

/**
 * Embed the organization logo into a pdf-lib document.
 * When `allowProductFallback` is true, uses the bundled commercial PDF logo so
 * invoice/quotation/credit/debit/AR PDFs show a logo on every device.
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

  if (opts?.allowProductFallback === true) {
    const { resolveCommercialPdfLogoUrl, resolveProductFallbackLogoUrl } = await import(
      '@/features/reports/constants/reportBranding.constants'
    );
    const fallback =
      resolveCommercialPdfLogoUrl() || resolveProductFallbackLogoUrl();
    if (fallback) {
      const bytes =
        (await fetchBundledAssetBytes(fallback)) ||
        (await fetchOneLogoCandidate(fallback));
      if (bytes) {
        return (await embedBytes(doc, bytes, maxHeight)) ?? { image: null, width: 0, height: 0 };
      }
    }
  }

  return { image: null, width: 0, height: 0 };
}
