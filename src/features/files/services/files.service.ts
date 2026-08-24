import axios from 'axios';
import { axiosInstance } from '@/lib/axios';
import { resolveSessionTenantIdFromAuth } from '@/lib/tenantFromAuth';
import { useAuthStore } from '@/store/authStore';
import { withGatewayRetry } from '@/lib/wakeApi';
import { FILES_API } from '../api/files.api';
import type { FileDisplayOptions, FileDownloadParams, StoredFileAction } from '../types/files.types';
import type { PdfBrandingOptions } from '../utils/pdfBranding';
import { isSafeHttpUrl, openSafeHttpUrl } from '@/lib/safeHttpUrl';
import { parseFilesApiUrl } from '../utils/parseFilesApiUrl';
import {
  openBlankPreviewTab,
  openBlobInNewTab,
  triggerBlobDownload,
  triggerBrandedPdfDownload,
} from '../utils/triggerBlobDownload';
import { isPdfBlob, isPdfUrl, openBrandedPdfUrl } from '../utils/pdfBranding';
import { resolvePdfDownloadFilename, stripPdfExtension } from '../utils/pdfFilename';

async function readAxiosErrorData(data: unknown): Promise<unknown> {
  if (typeof Blob !== 'undefined' && data instanceof Blob) {
    try {
      const text = await data.text();
      if (!text.trim()) return null;
      try {
        return JSON.parse(text) as unknown;
      } catch {
        return { message: text.slice(0, 300) };
      }
    } catch {
      return null;
    }
  }
  return data;
}

async function formatAxiosError(error: unknown): Promise<Error> {
  if (axios.isCancel(error)) throw error;
  const axiosErr = error as {
    code?: string;
    name?: string;
    response?: { data?: unknown; status?: number };
    message?: string;
  };
  if (axiosErr.code === 'ERR_CANCELED' || axiosErr.name === 'CanceledError') {
    throw error;
  }
  if (error instanceof Error && !axiosErr.response) return error;

  const data = await readAxiosErrorData(axiosErr.response?.data);
  const record =
    data && typeof data === 'object' && !Array.isArray(data)
      ? (data as { message?: string | string[]; error?: string })
      : null;
  const message = record?.message;
  if (Array.isArray(message)) return new Error(message.map(String).join('; '));
  if (typeof message === 'string' && message.trim()) {
    const status = axiosErr.response?.status;
    if (status != null && status >= 500 && /internal server error/i.test(message)) {
      return new Error(
        'File download failed on the server. Confirm GET /files/{tenantId}/{filename} with Bearer JWT.',
      );
    }
    return new Error(message);
  }
  if (typeof record?.error === 'string' && record.error.trim()) return new Error(record.error);
  return new Error(axiosErr.message || 'File download failed');
}

function resolveTenantId(explicit?: string): string {
  const { accessToken, user } = useAuthStore.getState();
  const sessionTenant = resolveSessionTenantIdFromAuth({ accessToken, user });
  // Never trust a client-supplied tenantId that differs from the JWT/session tenant.
  if (explicit && explicit.trim()) {
    const requested = explicit.trim();
    if (sessionTenant && requested !== sessionTenant) {
      throw new Error('File tenant does not match your session.');
    }
    return sessionTenant || requested;
  }
  return sessionTenant;
}

function sanitizeDownloadFilename(filename: string): string {
  const trimmed = filename.trim();
  if (!trimmed) throw new Error('Filename is required.');
  if (trimmed.includes('..') || trimmed.includes('/') || trimmed.includes('\\')) {
    throw new Error('Invalid filename.');
  }
  if (!/^[\w.\- ()[\]]+$/i.test(trimmed)) {
    throw new Error('Invalid filename characters.');
  }
  return trimmed;
}

function guessFilenameFromUrl(url: string, fallback = 'download'): string {
  const parsed = parseFilesApiUrl(url);
  if (parsed?.filename) return parsed.filename;
  const clean = url.split(/[?#]/)[0] ?? url;
  const last = clean.split('/').filter(Boolean).pop();
  return last || fallback;
}

function guessMimeType(filename: string, headerType?: string): string | undefined {
  if (headerType && headerType !== 'application/octet-stream') return headerType;
  const lower = filename.toLowerCase();
  if (lower.endsWith('.pdf')) return 'application/pdf';
  if (lower.endsWith('.png')) return 'image/png';
  if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) return 'image/jpeg';
  if (lower.endsWith('.xml')) return 'application/xml';
  if (lower.endsWith('.csv')) return 'text/csv';
  return headerType;
}

export const filesService = {
  /** Swagger: GET /files/{tenantId}/{filename} */
  async downloadBlob(
    params: FileDownloadParams,
    options?: { signal?: AbortSignal },
  ): Promise<Blob> {
    const tenantId = resolveTenantId(params.tenantId);
    if (!tenantId) throw new Error('Tenant context is required to download files.');

    const filename = sanitizeDownloadFilename(params.filename);

    try {
      const res = await withGatewayRetry(() =>
        axiosInstance.get<Blob>(FILES_API.download(tenantId, filename), {
          responseType: 'blob',
          signal: options?.signal,
        }),
      );

      const headerType =
        typeof res.headers?.['content-type'] === 'string'
          ? res.headers['content-type']
          : undefined;

      // Nest JSON errors can arrive as application/json blobs when responseType is 'blob'.
      if (
        res.data instanceof Blob &&
        /json/i.test(headerType || res.data.type || '') &&
        res.data.size < 4096
      ) {
        const text = await res.data.text();
        try {
          const parsed = JSON.parse(text) as { message?: string | string[]; error?: string };
          const message = Array.isArray(parsed.message)
            ? parsed.message.map(String).join('; ')
            : parsed.message || parsed.error;
          if (message) throw new Error(String(message));
        } catch (parseErr) {
          if (parseErr instanceof Error && !parseErr.message.includes('JSON')) {
            throw parseErr;
          }
          // Not an error payload — rebuild blob from the text we already read.
          res.data = new Blob([text], { type: headerType || 'application/json' });
        }
      }

      const mimeType = guessMimeType(filename, headerType);

      if (res.data instanceof Blob) {
        if (!mimeType || res.data.type === mimeType) return res.data;
        return new Blob([res.data], { type: mimeType });
      }

      return new Blob([res.data], { type: mimeType });
    } catch (error) {
      throw await formatAxiosError(error);
    }
  },

  async openBlob(blob: Blob): Promise<void> {
    await openBlobInNewTab(blob);
  },

  async saveBlob(blob: Blob, filename: string, branding?: PdfBrandingOptions): Promise<void> {
    const downloadName = resolvePdfDownloadFilename(filename, branding);
    if (isPdfBlob(blob, filename)) {
      await triggerBrandedPdfDownload(blob, downloadName, { filename: downloadName, branding });
      return;
    }
    triggerBlobDownload(blob, downloadName);
  },

  /** Fetch by tenant + filename, then open or save in the browser. */
  async download(
    params: FileDownloadParams,
    action: StoredFileAction = 'download',
    options?: FileDisplayOptions,
  ): Promise<void> {
    const name = options?.displayName?.trim() || params.filename;
    const blobOptions = { filename: name, branding: options?.branding };
    if (action === 'open') {
      const preview = openBlankPreviewTab(blobOptions);
      try {
        const blob = await this.downloadBlob(params, options);
        await openBlobInNewTab(blob, preview, blobOptions);
      } catch (err) {
        preview.close();
        throw err;
      }
      return;
    }
    const blob = await this.downloadBlob(params, options);
    await this.saveBlob(blob, name, options?.branding);
  },

  /**
   * Open or download a stored file URL.
   * Uses authenticated GET for `/files/{tenantId}/{filename}` paths;
   * falls back to `window.open` for external URLs.
   */
  async openStoredFile(url: string, options?: FileDisplayOptions): Promise<void> {
    const parsed = parseFilesApiUrl(url);
    const displayName = options?.displayName ?? (parsed?.filename || guessFilenameFromUrl(url));
    const downloadName = resolvePdfDownloadFilename(displayName, options?.branding);
    const branding = {
      ...options?.branding,
      title: options?.branding?.title || stripPdfExtension(downloadName),
      documentNumber: options?.branding?.documentNumber || stripPdfExtension(downloadName),
    };
    if (!parsed) {
      if (!isSafeHttpUrl(url)) {
        throw new Error('Blocked an unsafe file URL.');
      }
      if (isPdfUrl(url, displayName)) {
        void openBrandedPdfUrl(url, branding);
        return;
      }
      openSafeHttpUrl(url);
      return;
    }
    await this.download(
      { tenantId: parsed.tenantId, filename: parsed.filename },
      'open',
      { ...options, displayName: downloadName, branding },
    );
  },

  async downloadStoredFile(url: string, options?: FileDisplayOptions): Promise<void> {
    const parsed = parseFilesApiUrl(url);
    const displayName = options?.displayName ?? (parsed?.filename || guessFilenameFromUrl(url));
    const downloadName = resolvePdfDownloadFilename(displayName, options?.branding);
    const branding = {
      ...options?.branding,
      title: options?.branding?.title || stripPdfExtension(downloadName),
      documentNumber: options?.branding?.documentNumber || stripPdfExtension(downloadName),
    };
    if (!parsed) {
      if (!isSafeHttpUrl(url)) {
        throw new Error('Blocked an unsafe file URL.');
      }
      if (isPdfUrl(url, displayName)) {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Could not download PDF.');
        const blob = await response.blob();
        await triggerBrandedPdfDownload(blob, downloadName, { filename: downloadName, branding });
        return;
      }
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = downloadName;
      anchor.target = '_blank';
      anchor.rel = 'noopener noreferrer';
      anchor.click();
      return;
    }
    await this.download(
      { tenantId: parsed.tenantId, filename: parsed.filename },
      'download',
      { ...options, displayName: downloadName, branding },
    );
  },
};
