import axios from 'axios';
import { axiosInstance } from '@/lib/axios';
import { resolveSessionTenantIdFromAuth } from '@/lib/tenantFromAuth';
import { useAuthStore } from '@/store/authStore';
import { withGatewayRetry } from '@/lib/wakeApi';
import { FILES_API } from '../api/files.api';
import type { FileDownloadParams, StoredFileAction } from '../types/files.types';
import { parseFilesApiUrl } from '../utils/parseFilesApiUrl';
import {
  openBlankPreviewTab,
  openBlobInNewTab,
  triggerBlobDownload,
} from '../utils/triggerBlobDownload';

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
  if (explicit && explicit.trim()) return explicit.trim();
  const { accessToken, user } = useAuthStore.getState();
  return resolveSessionTenantIdFromAuth({ accessToken, user });
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

    const filename = params.filename.trim();
    if (!filename) throw new Error('Filename is required.');

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
    openBlobInNewTab(blob);
  },

  async saveBlob(blob: Blob, filename: string): Promise<void> {
    triggerBlobDownload(blob, filename);
  },

  /** Fetch by tenant + filename, then open or save in the browser. */
  async download(
    params: FileDownloadParams,
    action: StoredFileAction = 'download',
    options?: { signal?: AbortSignal; displayName?: string },
  ): Promise<void> {
    const name = options?.displayName?.trim() || params.filename;
    if (action === 'open') {
      // Open the tab in the same turn as the user click, then navigate after fetch.
      const preview = openBlankPreviewTab();
      try {
        const blob = await this.downloadBlob(params, options);
        openBlobInNewTab(blob, preview);
      } catch (err) {
        preview.close();
        throw err;
      }
      return;
    }
    const blob = await this.downloadBlob(params, options);
    await this.saveBlob(blob, name);
  },

  /**
   * Open or download a stored file URL.
   * Uses authenticated GET for `/files/{tenantId}/{filename}` paths;
   * falls back to `window.open` for external URLs.
   */
  async openStoredFile(
    url: string,
    options?: { signal?: AbortSignal; displayName?: string },
  ): Promise<void> {
    const parsed = parseFilesApiUrl(url);
    if (!parsed) {
      window.open(url, '_blank', 'noopener,noreferrer');
      return;
    }
    await this.download(
      { tenantId: parsed.tenantId, filename: parsed.filename },
      'open',
      { ...options, displayName: options?.displayName ?? parsed.filename },
    );
  },

  async downloadStoredFile(
    url: string,
    options?: { signal?: AbortSignal; displayName?: string },
  ): Promise<void> {
    const parsed = parseFilesApiUrl(url);
    if (!parsed) {
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = options?.displayName ?? guessFilenameFromUrl(url);
      anchor.target = '_blank';
      anchor.rel = 'noopener noreferrer';
      anchor.click();
      return;
    }
    await this.download(
      { tenantId: parsed.tenantId, filename: parsed.filename },
      'download',
      { ...options, displayName: options?.displayName ?? parsed.filename },
    );
  },
};
