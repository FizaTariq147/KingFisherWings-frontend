import type { InvoiceFormatUiLayout } from '../types/invoiceFormatUiLayout.types';
import { HBL_FORMAT_UI_LAYOUTS } from './hblFormatUiLayouts.generated.ts';
import { HBL_JASPER_PILOT_UI_LAYOUT } from '../templates/hbl/jasperPilot/hblJasperPilotLayout';

export const HBL_FORMAT_UI_LAYOUT_LIST: InvoiceFormatUiLayout[] = [
  HBL_JASPER_PILOT_UI_LAYOUT,
  ...HBL_FORMAT_UI_LAYOUTS,
];

const byCode = new Map(HBL_FORMAT_UI_LAYOUT_LIST.map((row) => [row.code.toUpperCase(), row]));

const FALLBACK = 'HBL_DRAFT_REPORT_FORMAT_11';

function resolveLayoutCode(code: string): string {
  const needle = code.trim().toUpperCase();
  if (byCode.has(needle)) return needle;
  // Phase-3 Jasper pilot owns HBL_DRAFT_REPORT_FORMAT_JASPER (see jasperPilot/).
  // Leftover marketing alias still maps to the HKG shell — do not change other formats.
  if (needle === 'LEFTOVER_HBL_DRAFT_JASPER') {
    return 'FG_HBL_HKG';
  }
  if (needle === 'LEFTOVER_HBL_DRAFT_JASPER_FORMAT_1') return 'FG_HBL_FORMAT_1';
  if (/^HBL_DRAFT_REPORT_FORMAT_\d+$/.test(needle)) return FALLBACK;
  if (needle.startsWith('FG_HBL_')) {
    if (needle.includes('HKG')) return 'FG_HBL_HKG';
    if (needle.includes('MAGIC')) return 'FG_HBL_MAGICLOGISYS';
    if (needle.includes('ORIGINAL')) return 'FG_HBL_ORIGINAL_FORMAT_87';
    if (byCode.has('FG_HBL_FORMAT_1')) return 'FG_HBL_FORMAT_1';
  }
  return needle;
}

/**
 * Canonical HBL JSON shell for `code`, or undefined when this store has no layout.
 * Aliased Format-N codes resolve to Format-11 / FG shells (not unique designs).
 * Jasper pilot (`HBL_DRAFT_REPORT_FORMAT_JASPER`) resolves to its own layout entry.
 */
export function resolveHblLayoutSourceCode(code: string): string | undefined {
  const needle = code.trim().toUpperCase();
  if (!needle) return undefined;
  const resolved = resolveLayoutCode(needle);
  return byCode.has(resolved) ? resolved : undefined;
}

export function getHblFormatUiLayout(code: string): InvoiceFormatUiLayout | undefined {
  const source = resolveHblLayoutSourceCode(code);
  return source ? byCode.get(source) : undefined;
}

export function hasHblFormatUiLayout(code: string): boolean {
  return Boolean(getHblFormatUiLayout(code));
}

export function listHblFormatUiLayouts(): InvoiceFormatUiLayout[] {
  return HBL_FORMAT_UI_LAYOUT_LIST;
}
