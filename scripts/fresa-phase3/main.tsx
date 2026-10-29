import '../../src/index.css';
import * as pdfjs from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.mjs?url';
import { generateCatalogLayoutPdf } from '@/features/reports/utils/generateCatalogLayoutPdf';
import { resolveAnyFormatUiLayout } from '@/features/reports/data/resolveAnyFormatUiLayout';

pdfjs.GlobalWorkerOptions.workerSrc = pdfWorker;

type GenerateResult = {
  ok: boolean;
  base64?: string;
  error?: string;
  name?: string;
  paper?: string;
  code?: string;
  hasLayout?: boolean;
  usedDemoData?: boolean;
};

type PageImage = {
  page: number;
  width: number;
  height: number;
  pngBase64: string;
};

type RasterResult = {
  ok: boolean;
  pageCount?: number;
  pages?: PageImage[];
  error?: string;
};

declare global {
  interface Window {
    __FRESA_PHASE3_READY?: boolean;
    __FRESA_PHASE3?: {
      generate: (
        code: string,
        options?: { appendCustomerTerms?: boolean },
      ) => Promise<GenerateResult>;
      generateDefault: (code: string) => Promise<GenerateResult>;
      hasLayout: (code: string) => boolean;
      rasterizePdf: (base64: string, scale?: number) => Promise<RasterResult>;
    };
  }
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result || '');
      const i = dataUrl.indexOf(',');
      resolve(i >= 0 ? dataUrl.slice(i + 1) : dataUrl);
    };
    reader.onerror = () => reject(reader.error || new Error('FileReader failed'));
    reader.readAsDataURL(blob);
  });
}

function base64ToUint8(base64: string): Uint8Array {
  const bin = atob(base64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i += 1) out[i] = bin.charCodeAt(i);
  return out;
}

async function generateOne(
  code: string,
  options: { appendCustomerTerms?: boolean } = {},
): Promise<GenerateResult> {
  try {
    const layout = resolveAnyFormatUiLayout(code);
    if (!layout) {
      return { ok: false, code, hasLayout: false, error: `No JSON layout for ${code}` };
    }
    const result = await generateCatalogLayoutPdf(code, {}, options);
    if (!result) {
      return { ok: false, code, hasLayout: true, error: 'generateCatalogLayoutPdf returned null' };
    }
    const base64 = await blobToBase64(result.blob);
    return {
      ok: true,
      code,
      hasLayout: true,
      base64,
      name: result.preview.name,
      paper: result.preview.paper,
      usedDemoData: true,
    };
  } catch (err) {
    return {
      ok: false,
      code,
      hasLayout: Boolean(resolveAnyFormatUiLayout(code)),
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

window.__FRESA_PHASE3 = {
  hasLayout(code: string) {
    return Boolean(resolveAnyFormatUiLayout(code));
  },
  /** Layout-only or explicit override. */
  async generate(
    code: string,
    options: { appendCustomerTerms?: boolean } = {},
  ): Promise<GenerateResult> {
    return generateOne(code, {
      appendCustomerTerms:
        typeof options.appendCustomerTerms === 'boolean'
          ? options.appendCustomerTerms
          : false,
    });
  },
  /** Product default: omit override so heuristics / layout.appendCustomerTerms apply. */
  async generateDefault(code: string): Promise<GenerateResult> {
    return generateOne(code, {});
  },
  async rasterizePdf(base64: string, scale = 2): Promise<RasterResult> {
    try {
      const data = base64ToUint8(base64);
      const doc = await pdfjs.getDocument({ data }).promise;
      const pages: PageImage[] = [];
      for (let i = 1; i <= doc.numPages; i += 1) {
        const page = await doc.getPage(i);
        const viewport = page.getViewport({ scale });
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.floor(viewport.width));
        canvas.height = Math.max(1, Math.floor(viewport.height));
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Canvas 2D unavailable');
        await page.render({ canvasContext: ctx, viewport, canvas }).promise;
        const pngBase64 = canvas.toDataURL('image/png').split(',')[1] || '';
        pages.push({
          page: i,
          width: canvas.width,
          height: canvas.height,
          pngBase64,
        });
      }
      return { ok: true, pageCount: doc.numPages, pages };
    } catch (err) {
      return { ok: false, error: err instanceof Error ? err.message : String(err) };
    }
  },
};

window.__FRESA_PHASE3_READY = true;
const root = document.getElementById('root');
if (root) root.textContent = 'Phase 3 harness ready';
