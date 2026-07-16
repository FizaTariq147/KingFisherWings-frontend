export interface FileDownloadParams {
  tenantId: string;
  filename: string;
}

export interface ParsedFilesApiUrl extends FileDownloadParams {
  /** Original URL or path that was parsed. */
  source: string;
}

export type StoredFileAction = 'open' | 'download';
