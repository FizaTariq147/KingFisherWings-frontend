import type { InvoiceFormatUiLayout } from '../types/invoiceFormatUiLayout.types';
import { HAWB_FORMAT_UI_LAYOUTS } from './hawbFormatUiLayouts.generated.ts';

export const HAWB_FORMAT_UI_LAYOUT_LIST: InvoiceFormatUiLayout[] = HAWB_FORMAT_UI_LAYOUTS;

const byCode = new Map(HAWB_FORMAT_UI_LAYOUT_LIST.map((row) => [row.code.toUpperCase(), row]));

const FALLBACK_DRAFT = 'HAWB_DRAFT_REPORT_FORMAT';
const FALLBACK_ORIGINAL = 'HAWB_ORIGINAL_PRE_PRINTED_REPORT_FORMAT_1';

function resolveLayoutCode(code: string): string {
  const needle = code.trim().toUpperCase();
  if (byCode.has(needle)) return needle;
  // Extra draft indices (Format-3…N) share the base draft IATA shell.
  if (/^HAWB_DRAFT_REPORT_FORMAT_\d+$/.test(needle)) return FALLBACK_DRAFT;
  if (/^HAWB_ORIGINAL_PRE_PRINTED_REPORT_FORMAT_\d+$/.test(needle)) return FALLBACK_ORIGINAL;
  return needle;
}

/** Canonical HAWB JSON shell, or undefined when this store has no layout. */
export function resolveHawbLayoutSourceCode(code: string): string | undefined {
  const needle = code.trim().toUpperCase();
  if (!needle) return undefined;
  const resolved = resolveLayoutCode(needle);
  return byCode.has(resolved) ? resolved : undefined;
}

export function getHawbFormatUiLayout(code: string): InvoiceFormatUiLayout | undefined {
  const source = resolveHawbLayoutSourceCode(code);
  if (!source) return undefined;
  const resolved = byCode.get(source);
  if (!resolved) return undefined;
  const needle = code.trim().toUpperCase();
  if (needle === resolved.code.toUpperCase()) return resolved;
  // Preserve requested code/name when falling back from Format-N extras.
  return {
    ...resolved,
    code: needle,
    name:
      needle.startsWith('HAWB_DRAFT_REPORT_FORMAT_')
        ? `HAWB Draft Report Format-${needle.replace('HAWB_DRAFT_REPORT_FORMAT_', '')}`
        : needle.startsWith('HAWB_ORIGINAL_PRE_PRINTED_REPORT_FORMAT_')
          ? `HAWB Original Pre Printed Report Format-${needle.replace(
              'HAWB_ORIGINAL_PRE_PRINTED_REPORT_FORMAT_',
              '',
            )}`
          : resolved.name,
  };
}

export function hasHawbFormatUiLayout(code: string): boolean {
  return Boolean(getHawbFormatUiLayout(code));
}

export function listHawbFormatUiLayouts(): InvoiceFormatUiLayout[] {
  return HAWB_FORMAT_UI_LAYOUT_LIST;
}
