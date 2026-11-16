import {
  pageGeometryToAtPageCss,
  resolvePageGeometry,
  type PageGeometry,
  type ResolvePageGeometryInput,
} from './pageGeometry';
import {
  documentTypographyToCss,
  resolveDocumentTypography,
  type DocumentTypography,
  type TypographyOverrides,
} from './documentTypography';
import {
  documentStructureToCss,
  type DocumentStructureOptions,
} from './documentStructure';

export type BuildDocumentPrintCssInput = {
  page?: ResolvePageGeometryInput | PageGeometry;
  typography?: TypographyOverrides;
  structure?: DocumentStructureOptions;
  /** Extra CSS appended after foundation rules. */
  extraCss?: string;
};

export type { DocumentTypography };

function isPageGeometry(value: ResolvePageGeometryInput | PageGeometry): value is PageGeometry {
  return (
    typeof (value as PageGeometry).widthMm === 'number' &&
    typeof (value as PageGeometry).heightMm === 'number' &&
    typeof (value as PageGeometry).contentWidthMm === 'number'
  );
}

/**
 * Single print stylesheet used by HTML print pilots and as the contract for
 * preview hosts that embed the same document DOM as download capture.
 */
export function buildDocumentPrintCss(input: BuildDocumentPrintCssInput = {}): {
  css: string;
  geometry: PageGeometry;
  typography: DocumentTypography;
} {
  const geometry = input.page
    ? isPageGeometry(input.page)
      ? input.page
      : resolvePageGeometry(input.page)
    : resolvePageGeometry({ paper: 'A4', orientation: 'portrait' });

  // Always merge through resolveDocumentTypography so partial overrides stay complete.
  const typography = resolveDocumentTypography(
    (input.typography as TypographyOverrides | undefined) ?? {},
  );

  const css = [
    pageGeometryToAtPageCss(geometry),
    documentTypographyToCss(typography),
    documentStructureToCss(input.structure),
    `
html, body {
  margin: 0;
  padding: 0;
  background: #fff;
}
.fn-doc {
  width: ${geometry.contentWidthMm}mm;
  min-height: ${geometry.contentHeightMm}mm;
  margin: 0 auto;
}
@media print {
  .fn-no-print { display: none !important; }
}
`.trim(),
    input.extraCss?.trim() ?? '',
  ]
    .filter(Boolean)
    .join('\n\n');

  return { css, geometry, typography };
}
