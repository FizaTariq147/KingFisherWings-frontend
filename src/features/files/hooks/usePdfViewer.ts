import { useCallback, useEffect, useRef, useState } from 'react';
import type { PdfBrandingOptions } from '../utils/pdfBranding';

type PdfViewerState = {
  open: boolean;
  src: string | null;
  blob: Blob | null;
  fileName: string;
  title: string;
  loading: boolean;
  error: string | null;
  branding?: PdfBrandingOptions;
};

const CLOSED: PdfViewerState = {
  open: false,
  src: null,
  blob: null,
  fileName: 'document.pdf',
  title: 'PDF preview',
  loading: false,
  error: null,
};

export function usePdfViewer() {
  const [state, setState] = useState<PdfViewerState>(CLOSED);
  const srcRef = useRef<string | null>(null);
  const ownsSrcRef = useRef(false);

  const revokeSrc = useCallback(() => {
    if (srcRef.current && ownsSrcRef.current) {
      URL.revokeObjectURL(srcRef.current);
    }
    srcRef.current = null;
    ownsSrcRef.current = false;
  }, []);

  useEffect(() => revokeSrc, [revokeSrc]);

  const close = useCallback(() => {
    revokeSrc();
    setState(CLOSED);
  }, [revokeSrc]);

  const showBlob = useCallback(
    (
      blob: Blob,
      meta: { fileName: string; title?: string; branding?: PdfBrandingOptions },
    ) => {
      revokeSrc();
      const src = URL.createObjectURL(blob);
      srcRef.current = src;
      ownsSrcRef.current = true;
      setState({
        open: true,
        src,
        blob,
        fileName: meta.fileName,
        title: meta.title || 'PDF preview',
        loading: false,
        error: null,
        branding: meta.branding,
      });
    },
    [revokeSrc],
  );

  const showSrc = useCallback(
    (
      src: string,
      meta: {
        fileName: string;
        title?: string;
        branding?: PdfBrandingOptions;
        blob?: Blob | null;
      },
    ) => {
      revokeSrc();
      setState({
        open: true,
        src,
        blob: meta.blob ?? null,
        fileName: meta.fileName,
        title: meta.title || 'PDF preview',
        loading: false,
        error: null,
        branding: meta.branding,
      });
    },
    [revokeSrc],
  );

  const loadPreview = useCallback(
    async (
      loader: () => Promise<Blob>,
      meta: { fileName: string; title?: string; branding?: PdfBrandingOptions },
    ) => {
      setState({
        open: true,
        src: null,
        blob: null,
        fileName: meta.fileName,
        title: meta.title || 'PDF preview',
        loading: true,
        error: null,
        branding: meta.branding,
      });
      try {
        const blob = await loader();
        showBlob(blob, meta);
      } catch (err) {
        revokeSrc();
        setState({
          open: true,
          src: null,
          blob: null,
          fileName: meta.fileName,
          title: meta.title || 'PDF preview',
          loading: false,
          error: err instanceof Error ? err.message : 'Could not load PDF.',
          branding: meta.branding,
        });
      }
    },
    [revokeSrc, showBlob],
  );

  return {
    ...state,
    close,
    showBlob,
    showSrc,
    loadPreview,
  };
}
