import type { InvoiceFormatUiLayout } from '../types/invoiceFormatUiLayout.types';
import { ARRIVAL_NOTICE_FORMAT_UI_LAYOUTS } from './arrivalNoticeFormatUiLayouts.generated.ts';

/** Permanent JSON UI layouts for Arrival Notice formats. */
export const ARRIVAL_NOTICE_FORMAT_UI_LAYOUT_LIST: InvoiceFormatUiLayout[] =
  ARRIVAL_NOTICE_FORMAT_UI_LAYOUTS;

const byCode = new Map(
  ARRIVAL_NOTICE_FORMAT_UI_LAYOUT_LIST.map((row) => [row.code.toUpperCase(), row]),
);

/** Canonical Format-1 shell present in generated arrival JSON layouts. */
const ARRIVAL_FORMAT_1_SHELL = 'ARRIVAL_NOTICE_REPORT_FORMAT_1_CARGO_ARRIVAL_NOTICE_JASPER';

/**
 * Intentional sharing: Arrival Format-11+ reuse Format-1 shell when no unique JSON
 * exists (Phase 6 QA — was false coverage with no alias).
 * Registry uses bare `ARRIVAL_NOTICE_REPORT_FORMAT_N` for many formats; Format-1's
 * unique layout id is the Jasper-suffixed code.
 */
function resolveArrivalLayoutCode(code: string): string {
  const needle = code.trim().toUpperCase();
  if (byCode.has(needle)) return needle;
  if (needle === 'ARRIVAL_NOTICE_REPORT_FORMAT_1' || /^ARRIVAL_NOTICE_REPORT_FORMAT_\d+$/.test(needle)) {
    return byCode.has(ARRIVAL_FORMAT_1_SHELL) ? ARRIVAL_FORMAT_1_SHELL : needle;
  }
  if (/^CARGO_ARRIVAL_NOTICE_REPORT_FORMAT/i.test(needle)) {
    if (byCode.has('CARGO_ARRIVAL_NOTICE_REPORT_FORMAT_1')) {
      return 'CARGO_ARRIVAL_NOTICE_REPORT_FORMAT_1';
    }
    return byCode.has(ARRIVAL_FORMAT_1_SHELL) ? ARRIVAL_FORMAT_1_SHELL : needle;
  }
  return needle;
}

export function getArrivalNoticeFormatUiLayout(code: string): InvoiceFormatUiLayout | undefined {
  const needle = code.trim().toUpperCase();
  if (!needle) return undefined;
  const resolved = byCode.get(resolveArrivalLayoutCode(needle));
  if (!resolved) return undefined;
  if (resolved.code.toUpperCase() === needle) return resolved;
  return {
    ...resolved,
    code: needle,
    name: `Arrival Notice Report Format-${needle.replace(/^ARRIVAL_NOTICE_REPORT_FORMAT_/, '')}`,
  };
}

export function hasArrivalNoticeFormatUiLayout(code: string): boolean {
  return Boolean(getArrivalNoticeFormatUiLayout(code));
}

export function listArrivalNoticeFormatUiLayouts(): InvoiceFormatUiLayout[] {
  return ARRIVAL_NOTICE_FORMAT_UI_LAYOUT_LIST;
}
