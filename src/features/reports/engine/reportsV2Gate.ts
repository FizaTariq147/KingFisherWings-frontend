import { breadthBrowseReason, isBreadthWired } from './breadthCodes';
import { invoiceV2SpecCodes } from './invoiceV2Codes';
import { reportsCatalogueGate, type ReportsCatalogueGate } from './reportsEngine';
import { reportConformanceStatus, type ReportConformanceStatus } from '../utils/reportConformanceStatus';

export type ReportsV2Entry = 'generate' | 'reports' | 'formats';

export const REPORTS_V2_FALLBACK_NOTICE = 'Showing the classic document. The selected format could not be built.';
export const INVOICE_V2_FALLBACK_NOTICE = 'Showing the classic invoice. The selected format could not be built.';

/** A code the spec renderer can draw: the breadth set, or an invoice v2 spec code. */
export function isReportsV2Code(code: string): boolean {
  return isBreadthWired(code) || invoiceV2SpecCodes.has(code);
}

/**
 * Hard gating withholds a v2 code until its status is accepted.
 * Soft gating leaves it available. Nothing here marks a code accepted.
 */
export function reportsV2HardBlocked(input: {
  gate?: ReportsCatalogueGate;
  code: string;
  status?: ReportConformanceStatus;
}): boolean {
  const gate = input.gate ?? reportsCatalogueGate();
  if (gate !== 'hard') return false;
  if (!isReportsV2Code(input.code)) return false;
  const status = input.status ?? reportConformanceStatus(input.code);
  return status !== 'accepted';
}

/**
 * v2 runs for a wired code from Reports or Formats, or from Generate when the
 * style names that code. A code that is not wired always stays on classic.
 */
export function shouldUseReportsV2(input: {
  engine: 'legacy' | 'v2';
  entry: ReportsV2Entry;
  code: string;
  style?: string;
  gate?: ReportsCatalogueGate;
  status?: ReportConformanceStatus;
}): boolean {
  if (input.engine !== 'v2') return false;
  if (!isReportsV2Code(input.code)) return false;
  if (reportsV2HardBlocked({ gate: input.gate, code: input.code, status: input.status })) return false;
  if (input.entry === 'reports' || input.entry === 'formats') return true;
  const style = (input.style ?? '').trim();
  return style !== '' && style !== 'classic' && style === input.code;
}

/** Attempt v2, then classic. A v2 failure returns the classic output and a notice. */
export async function generateReportsV2WithFallback(input: {
  attemptV2: boolean;
  renderV2: () => Promise<Blob>;
  renderClassic: () => Promise<Blob>;
}): Promise<{ blob: Blob; notice: string | null }> {
  if (!input.attemptV2) {
    return { blob: await input.renderClassic(), notice: null };
  }
  try {
    return { blob: await input.renderV2(), notice: null };
  } catch {
    return { blob: await input.renderClassic(), notice: REPORTS_V2_FALLBACK_NOTICE };
  }
}

/** Wired codes list first. Everything else keeps its place after them. */
export function reportsV2ListRank(code: string): number {
  return isReportsV2Code(code) ? 0 : 2;
}

export function reportsV2BadgeText(status: 'accepted' | 'in_progress' | 'reference_only'): string {
  return status === 'accepted' ? 'Accepted' : 'approximate, not final';
}

/** "Browse-only · reason" for a code that is not wired. Null for a wired code. */
export function reportsV2BrowseHint(code: string): string | null {
  if (isReportsV2Code(code)) return null;
  return `Browse-only · ${breadthBrowseReason(code)}`;
}
