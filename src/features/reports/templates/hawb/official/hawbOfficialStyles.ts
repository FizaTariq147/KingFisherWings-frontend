import type { CSSProperties } from 'react';
import { FREIGHTNEST_DOCUMENT_TYPOGRAPHY } from '../../../engines/pdf/documentTypography';

const ink = '#101010';

export const hawbInk = ink;

export const hawbCell: CSSProperties = {
  borderWidth: 1,
  borderStyle: 'solid',
  borderColor: ink,
  padding: '3px 5px',
  verticalAlign: 'top',
  color: ink,
  fontSize: FREIGHTNEST_DOCUMENT_TYPOGRAPHY.sizesPx.label,
  lineHeight: FREIGHTNEST_DOCUMENT_TYPOGRAPHY.lineHeights.normal,
  wordBreak: 'break-word',
  overflowWrap: 'anywhere',
  fontFamily: FREIGHTNEST_DOCUMENT_TYPOGRAPHY.fontFamily,
};

export const hawbLabel: CSSProperties = {
  fontSize: 6.5,
  fontWeight: FREIGHTNEST_DOCUMENT_TYPOGRAPHY.weights.bold,
  textTransform: 'uppercase',
  letterSpacing: '0.02em',
  color: ink,
  margin: 0,
  lineHeight: FREIGHTNEST_DOCUMENT_TYPOGRAPHY.lineHeights.tight,
  fontFamily: FREIGHTNEST_DOCUMENT_TYPOGRAPHY.fontFamily,
};

export const hawbBody: CSSProperties = {
  fontSize: FREIGHTNEST_DOCUMENT_TYPOGRAPHY.sizesPx.body,
  margin: '2px 0 0',
  lineHeight: FREIGHTNEST_DOCUMENT_TYPOGRAPHY.lineHeights.normal,
  color: ink,
  whiteSpace: 'pre-line',
  fontFamily: FREIGHTNEST_DOCUMENT_TYPOGRAPHY.fontFamily,
};

export const hawbLegal: CSSProperties = {
  fontSize: FREIGHTNEST_DOCUMENT_TYPOGRAPHY.sizesPx.caption,
  lineHeight: FREIGHTNEST_DOCUMENT_TYPOGRAPHY.lineHeights.tight,
  color: ink,
  margin: '2px 0 0',
  textAlign: 'justify',
  fontFamily: FREIGHTNEST_DOCUMENT_TYPOGRAPHY.fontFamily,
};

export function displayOrBlank(value: string, placeholder = ''): string {
  return value.trim() ? value : placeholder;
}
