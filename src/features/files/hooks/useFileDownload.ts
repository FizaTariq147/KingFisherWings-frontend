import { useCallback, useState } from 'react';
import { filesService } from '../services/files.service';
import type { FileDownloadParams } from '../types/files.types';

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
    (url: string, displayName?: string) =>
      run(() => filesService.openStoredFile(url, { displayName })),
    [run],
  );

  const downloadStoredFile = useCallback(
    (url: string, displayName?: string) =>
      run(() => filesService.downloadStoredFile(url, { displayName })),
    [run],
  );

  const openFile = useCallback(
    (params: FileDownloadParams, displayName?: string) =>
      run(() => filesService.download(params, 'open', { displayName })),
    [run],
  );

  const downloadFile = useCallback(
    (params: FileDownloadParams, displayName?: string) =>
      run(() => filesService.download(params, 'download', { displayName })),
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
