import { invoiceV2SpecCodes } from './invoiceV2Codes';
import { isFlowInvoiceCode } from '../flow/invoiceFlowCode';
import { isReportsV2Code } from './reportsV2Gate';
import { reportsCatalogueGate, reportsEngine, type ReportsCatalogueGate, type ReportsEngine } from './reportsEngine';
import { isReportsCodeRuntimeDisabled } from './reportsRuntimeConfig';
import { reportConformanceStatus, type ReportConformanceStatus } from '../utils/reportConformanceStatus';

export type InvoicePdfEntry = 'generate' | 'reports' | 'formats';
export type InvoicePdfDocument = 'quotation' | 'invoice' | 'credit_note' | 'debit_note';

export const INVOICE_V2_FALLBACK_NOTICE = 'Showing the classic invoice. The selected format could not be built.';
export const FORMAT_NOT_AVAILABLE_YET = 'format not available yet';

/** True when the code is a gated v2-spec or flow catalogue entry. */
export function isGatedReportsCode(code: string): boolean {
  const key = String(code || '').trim().toUpperCase();
  return invoiceV2SpecCodes.has(key) || isFlowInvoiceCode(key) || isReportsV2Code(key);
}

/**
 * Hard gating withholds a v2 / flow code until its status is accepted.
 * Soft gating leaves it available. Nothing in this function marks a code accepted.
 */
export function invoiceV2HardBlocked(input: {
  gate?: ReportsCatalogueGate;
  code: string;
  status?: ReportConformanceStatus;
}): boolean {
  const gate = input.gate ?? reportsCatalogueGate();
  if (gate !== 'hard') return false;
  if (!isGatedReportsCode(input.code)) return false;
  const status = input.status ?? reportConformanceStatus(input.code);
  return status !== 'accepted';
}

/**
 * A flow code may be generated only when:
 * 1. status.json says accepted
 * 2. runtime engine is v2
 * 3. the code is not in runtime disabledCodes
 *
 * Non-flow codes return false (caller should use other gates).
 */
export function flowCodeGeneratable(input: {
  code: string;
  engine?: ReportsEngine;
  status?: ReportConformanceStatus;
  disabledCodes?: string[];
}): boolean {
  const code = String(input.code || '').trim().toUpperCase();
  if (!isFlowInvoiceCode(code)) return false;
  const engine = input.engine ?? reportsEngine();
  if (engine !== 'v2') return false;
  const status = input.status ?? reportConformanceStatus(code);
  if (status !== 'accepted') return false;
  if (input.disabledCodes != null) {
    const set = new Set(input.disabledCodes.map((c) => String(c || '').trim().toUpperCase()).filter(Boolean));
    if (set.has(code)) return false;
  } else if (isReportsCodeRuntimeDisabled(code)) {
    return false;
  }
  return true;
}

/**
 * Whether Generate / preview should withhold a gated code.
 * Flow codes always need accepted + runtime v2 + not disabled (even under soft gate).
 * Other gated codes follow hard/soft plus disabledCodes.
 */
export function reportsCodeGenerateBlocked(input: {
  code: string;
  engine?: ReportsEngine;
  gate?: ReportsCatalogueGate;
  status?: ReportConformanceStatus;
  disabledCodes?: string[];
}): boolean {
  const code = String(input.code || '').trim().toUpperCase();
  if (!isGatedReportsCode(code)) return false;
  const engine = input.engine ?? reportsEngine();
  if (engine !== 'v2') return true;
  if (input.disabledCodes != null) {
    const set = new Set(input.disabledCodes.map((c) => String(c || '').trim().toUpperCase()).filter(Boolean));
    if (set.has(code)) return true;
  } else if (isReportsCodeRuntimeDisabled(code)) {
    return true;
  }
  if (isFlowInvoiceCode(code)) {
    return !flowCodeGeneratable({
      code,
      engine,
      status: input.status,
      disabledCodes: input.disabledCodes,
    });
  }
  return invoiceV2HardBlocked({
    gate: input.gate,
    code,
    status: input.status,
  });
}

/**
 * Whether a catalogue entry should appear at all.
 * - Engine unset/legacy: no v2 or flow codes anywhere.
 * - Hard gate: only accepted v2/flow codes (staging CN/DN still require the staging flag via listFlowCatalogEntries).
 * Soft gate: all non-staging flow + v2 codes remain listed (badge may say approximate).
 * - disabledCodes: hidden regardless of soft/hard.
 */
export function reportsCatalogCodeVisible(input: {
  code: string;
  engine?: ReportsEngine;
  gate?: ReportsCatalogueGate;
  status?: ReportConformanceStatus;
  disabledCodes?: string[];
}): boolean {
  const code = String(input.code || '').trim().toUpperCase();
  if (!isGatedReportsCode(code)) return true;
  const engine = input.engine ?? reportsEngine();
  if (engine !== 'v2') return false;
  if (input.disabledCodes != null) {
    const set = new Set(input.disabledCodes.map((c) => String(c || '').trim().toUpperCase()).filter(Boolean));
    if (set.has(code)) return false;
  } else if (isReportsCodeRuntimeDisabled(code)) {
    return false;
  }
  if (invoiceV2HardBlocked({ gate: input.gate, code, status: input.status })) return false;
  return true;
}

/**
 * v2 runs for an invoice only from Reports or Formats, or from Generate PDF
 * when the company style is an explicit non-classic code. Credit notes and
 * debit notes stay on the classic generator. Quotation stays classic in this
 * pass.
 */
export function shouldUseInvoiceV2(input: {
  engine: 'legacy' | 'v2';
  entry: InvoicePdfEntry;
  document: InvoicePdfDocument;
  style: string;
  code?: string;
  gate?: ReportsCatalogueGate;
  status?: ReportConformanceStatus;
}): boolean {
  if (input.document !== 'invoice') return false;
  if (input.engine !== 'v2') return false;
  const code = input.code || input.style;
  if (reportsCodeGenerateBlocked({
    gate: input.gate,
    code,
    status: input.status,
    engine: input.engine,
  })) return false;
  if (input.entry === 'reports' || input.entry === 'formats') return true;
  return input.style.trim() !== '' && input.style !== 'classic';
}

/** Generate PDF. A non-classic company style is attempted, then classic. */
export async function generateInvoicePdfChoice(input: {
  engine: 'legacy' | 'v2';
  style: string;
  renderV2: () => Promise<Blob>;
  renderClassic: () => Promise<Blob>;
}): Promise<{ blob: Blob; notice: string | null }> {
  return generateWithFallback({
    attemptV2: shouldUseInvoiceV2({
      engine: input.engine,
      entry: 'generate',
      document: 'invoice',
      style: input.style,
    }),
    renderV2: input.renderV2,
    renderClassic: input.renderClassic,
  });
}

export async function generateWithFallback(input: {
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
    return { blob: await input.renderClassic(), notice: INVOICE_V2_FALLBACK_NOTICE };
  }
}

/** Thrown when the dev renderer is off or the spec draw fails. */
export class InvoiceV2Unavailable extends Error {
  constructor() {
    super('Invoice v2 could not be built.');
    this.name = 'InvoiceV2Unavailable';
  }
}

export async function renderInvoiceV2InBrowser(body: {
  code: string;
  invoice?: unknown;
  job?: unknown;
  party?: unknown;
  organization?: unknown;
  logoBase64?: string;
}): Promise<Blob> {
  const response = await fetch('/__reports/invoice-v2', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!response.ok) throw new InvoiceV2Unavailable();
  return response.blob();
}
