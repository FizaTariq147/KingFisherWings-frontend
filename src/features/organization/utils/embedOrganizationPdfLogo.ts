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

/**
 * Load organization logo bytes for client PDF embedding.
 * Supports data URLs, authenticated `/files/{tenant}/{file}` paths, API-origin
 * relative/absolute URLs (Bearer via axios), and public https CDNs.
 */
export async function fetchOrganizationLogoBytes(
  logoUrl?: string | null,
): Promise<ArrayBuffer | null> {
  const trimmed = String(logoUrl ?? '').trim();
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
      });
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

async function embedBytes(
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
  const preferred = String(preferredLogoUrl ?? '').trim();
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
