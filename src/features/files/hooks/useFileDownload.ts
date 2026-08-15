import { useCallback, useState } from 'react';
import { filesService } from '../services/files.service';
import type { FileDisplayOptions, FileDownloadParams } from '../types/files.types';

function normalizeFileOptions(
  displayNameOrOptions?: string | FileDisplayOptions,
): FileDisplayOptions | undefined {
  if (!displayNameOrOptions) return undefined;
  if (typeof displayNameOrOptions === 'string') return { displayName: displayNameOrOptions };
  return displayNameOrOptions;
}

export function useFileDownload() {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(async (fn: () => Promise<void>) => {
    setIsPending(true);
    setError(null);
    try {
      await fn();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'File download failed';
      setError(message);
      throw err;
    } finally {
      setIsPending(false);
    }
  }, []);

  const openStoredFile = useCallback(
    (url: string, displayNameOrOptions?: string | FileDisplayOptions) =>
      run(() => filesService.openStoredFile(url, normalizeFileOptions(displayNameOrOptions))),
    [run],
  );

  const downloadStoredFile = useCallback(
    (url: string, displayNameOrOptions?: string | FileDisplayOptions) =>
      run(() => filesService.downloadStoredFile(url, normalizeFileOptions(displayNameOrOptions))),
    [run],
  );

  const openFile = useCallback(
    (params: FileDownloadParams, displayNameOrOptions?: string | FileDisplayOptions) =>
      run(() => filesService.download(params, 'open', normalizeFileOptions(displayNameOrOptions))),
    [run],
  );

  const downloadFile = useCallback(
    (params: FileDownloadParams, displayNameOrOptions?: string | FileDisplayOptions) =>
      run(() => filesService.download(params, 'download', normalizeFileOptions(displayNameOrOptions))),
    [run],
  );

  return {
    isPending,
    error,
    openStoredFile,
    downloadStoredFile,
    openFile,
    downloadFile,
    clearError: () => setError(null),
  };
}
