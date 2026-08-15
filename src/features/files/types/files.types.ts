export interface FileDownloadParams {
  tenantId: string;
  filename: string;
}

export interface ParsedFilesApiUrl extends FileDownloadParams {
  /** Original URL or path that was parsed. */
  source: string;
}

import type { PdfBrandingOptions } from '../utils/pdfBranding';

export type StoredFileAction = 'open' | 'download';

export type FileDisplayOptions = {
  signal?: AbortSignal;
  displayName?: string;
  branding?: PdfBrandingOptions;
};
