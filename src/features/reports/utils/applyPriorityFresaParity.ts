import { FRESA_UI, normalizeFresaThemeColors } from '../constants/fresaInvoiceColors';
import { isPriorityFresaFormat } from '../constants/priorityFresaFormats';
import type { InvoiceFormatUiLayout } from '../types/invoiceFormatUiLayout.types';

/**
 * Surgical Fresa visual parity for priority document formats.
 * Restores sample PDF theme accents only — does not rewrite body blocks or demo data.
 */
export function applyPriorityFresaParity(layout: InvoiceFormatUiLayout): InvoiceFormatUiLayout {
  const baseTheme = normalizeFresaThemeColors(layout.theme);

  if (!isPriorityFresaFormat(layout.code, layout.formatNumber)) {
    return { ...layout, theme: baseTheme };
  }

  return {
    ...layout,
    theme: normalizeFresaThemeColors({
      ...baseTheme,
      orange: baseTheme.orange || FRESA_UI.orange,
      red: baseTheme.red || FRESA_UI.red,
      cyan: baseTheme.cyan || FRESA_UI.cyan,
      gray: baseTheme.gray || FRESA_UI.gray,
      ink: baseTheme.ink || FRESA_UI.ink,
      white: baseTheme.white || FRESA_UI.white,
      fill: baseTheme.fill || FRESA_UI.fill,
      panel: baseTheme.panel || FRESA_UI.panel,
    }),
  };
}
