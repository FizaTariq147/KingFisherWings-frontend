import { axiosInstance } from '@/lib/axios';
import { isApiOriginUrl } from '@/lib/safeHttpUrl';
import { filesService } from '@/features/files/services/files.service';
import { parseFilesApiUrl } from '@/features/files/utils/parseFilesApiUrl';
import { resolveProductFallbackLogoUrl } from '@/features/reports/constants/reportBranding.constants';
import type { PDFDocument, PDFImage } from 'pdf-lib';

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
    if (
      parsed.hostname &&
      /^files\./i.test(parsed.hostname) === false &&
      parsed.pathname.startsWith('/files/')
    ) {
      // Normal absolute API URL — keep as-is
      return trimmed;
    }
  } catch {
    /* not absolute */
  }

  // https://files/tenant/file.png (host=files) from prefixing relative "files/..."
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

/** Axios path for absolute API URLs (strip origin; keep `/backend/...` proxies). */
function toAxiosPath(url: string): string {
  if (url.startsWith('/') && !url.startsWith('//')) return url;
  try {
    const parsed = new URL(url);
    return `${parsed.pathname}${parsed.search}`;
  } catch {
    return url;
  }
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

/**
 * pdf-lib only embeds PNG/JPEG. Rasterize WebP/SVG (and other browser-decodable
 * formats) to PNG via canvas so organization WebP logos still appear on PDFs.
 */
async function rasterizeToPngBytes(bytes: ArrayBuffer): Promise<ArrayBuffer | null> {
  if (typeof document === 'undefined') return null;
  const mime = sniffMime(bytes) || 'application/octet-stream';
  const blob = new Blob([bytes], { type: mime });

  // createImageBitmap handles WebP reliably in Chromium/Edge/Firefox.
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
      /* fall through to <img> */
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

/**
 * Load organization logo bytes for client PDF embedding.
 * Supports data URLs, authenticated `/files/{tenant}/{file}` paths, API-origin
 * relative/absolute URLs (Bearer via axios), and public https CDNs.
 */
export async function fetchOrganizationLogoBytes(
  logoUrl?: string | null,
): Promise<ArrayBuffer | null> {
  const trimmed = repairOrganizationLogoUrl(logoUrl);
  if (!trimmed) return null;

  if (trimmed.startsWith('data:image/')) {
    return dataUrlToBytes(trimmed);
  }

  const stored = parseFilesApiUrl(trimmed);
  if (stored) {
    try {
      const blob = await filesService.downloadBlob({
        tenantId: stored.tenantId,
        filename: stored.filename,
      });
      return await blob.arrayBuffer();
    } catch {
      /* try axios / fetch below */
    }
  }

  if (isApiOriginUrl(trimmed)) {
    try {
      const res = await axiosInstance.get<ArrayBuffer>(toAxiosPath(trimmed), {
        responseType: 'arraybuffer',
        skipErrorToast: true,
      } as Parameters<typeof axiosInstance.get>[1]);
      if (res.data && (res.data as ArrayBuffer).byteLength > 0) {
        return res.data;
      }
    } catch {
      /* try fetch */
    }
  }

  try {
    const absolute =
      /^https?:\/\//i.test(trimmed) || trimmed.startsWith('blob:')
        ? trimmed
        : new URL(trimmed, window.location.origin).href;
    const res = await fetch(absolute, {
      mode: 'cors',
      credentials: isApiOriginUrl(trimmed) ? 'include' : 'omit',
    });
    if (!res.ok) return null;
    return await res.arrayBuffer();
  } catch {
    return null;
  }
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
  // WebP/SVG (and unknown) → rasterize to PNG first so org WebP logos show on PDFs.
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
 * Embed the registered organization logo into a pdf-lib document.
 * When `preferredLogoUrl` is set, never substitute the product KF asset on failure.
 * Product fallback is only used when no organization logo URL was provided.
 */
export async function embedOrganizationPdfLogo(
  doc: PDFDocument,
  preferredLogoUrl?: string | null,
  opts?: { maxHeight?: number; allowProductFallback?: boolean },
): Promise<EmbeddedPdfLogo> {
  const maxHeight = opts?.maxHeight ?? 48;
  const preferred = repairOrganizationLogoUrl(preferredLogoUrl);
  const allowProductFallback = opts?.allowProductFallback !== false;

  if (preferred) {
    const bytes = await fetchOrganizationLogoBytes(preferred);
    if (bytes) {
      const embedded = await embedBytes(doc, bytes, maxHeight);
      if (embedded) return embedded;
    }
    // Org logo was registered but could not be loaded — leave blank (do not show KF asset as tenant).
    return { image: null, width: 0, height: 0 };
  }

  if (!allowProductFallback) {
    return { image: null, width: 0, height: 0 };
  }

  const fallback = resolveProductFallbackLogoUrl();
  if (!fallback) return { image: null, width: 0, height: 0 };
  const bytes = await fetchOrganizationLogoBytes(fallback);
  if (!bytes) return { image: null, width: 0, height: 0 };
  return (await embedBytes(doc, bytes, maxHeight)) ?? { image: null, width: 0, height: 0 };
}
