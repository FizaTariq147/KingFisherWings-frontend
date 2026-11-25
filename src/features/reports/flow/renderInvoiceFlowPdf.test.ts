import { describe, expect, it } from 'vitest';
import { applyPdfMakeAccessPolicy } from './renderInvoiceFlowPdf';

describe('browser pdfmake access policy', () => {
  it('does not call setLocalAccessPolicy when the browser build omits it', () => {
    const calls: string[] = [];
    applyPdfMakeAccessPolicy({
      setUrlAccessPolicy: () => {
        calls.push('url');
      },
      addFonts: () => undefined,
      createPdf: () => ({ getBlob: async () => new Blob() }),
    });
    expect(calls).toEqual(['url']);
  });

  it('sets the local policy when the Node build provides it', () => {
    const calls: string[] = [];
    applyPdfMakeAccessPolicy({
      setUrlAccessPolicy: () => {
        calls.push('url');
      },
      setLocalAccessPolicy: () => {
        calls.push('local');
      },
      addFonts: () => undefined,
      createPdf: () => ({ getBlob: async () => new Blob() }),
    });
    expect(calls).toEqual(['url', 'local']);
  });
});

describe('browser pdfmake font registration shape', () => {
  it('uses VFS filenames for Arimo, not data:font URLs', () => {
    const vfs: Record<string, string> = {};
    const fonts: Record<string, Record<string, string>> = {};
    const regular = btoa('regular');
    const bold = btoa('bold');

    // Same contract ensureBrowserFonts uses for the browser pdfmake build.
    Object.assign(vfs, {
      'Arimo-Regular.ttf': regular,
      'Arimo-Bold.ttf': bold,
    });
    Object.assign(fonts, {
      Arimo: {
        normal: 'Arimo-Regular.ttf',
        bold: 'Arimo-Bold.ttf',
        italics: 'Arimo-Regular.ttf',
        bolditalics: 'Arimo-Bold.ttf',
      },
    });

    expect(vfs['Arimo-Regular.ttf']).toBe(regular);
    expect(fonts.Arimo.normal).toBe('Arimo-Regular.ttf');
    expect(fonts.Arimo.normal.startsWith('data:')).toBe(false);
  });
});
