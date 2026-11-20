import { invoiceV2SpecCodes } from './invoiceV2Codes';
import { reportsCatalogueGate, type ReportsCatalogueGate } from './reportsEngine';
import { reportConformanceStatus, type ReportConformanceStatus } from '../utils/reportConformanceStatus';

export type InvoicePdfEntry = 'generate' | 'reports' | 'formats';
export type InvoicePdfDocument = 'quotation' | 'invoice' | 'credit_note' | 'debit_note';

export const INVOICE_V2_FALLBACK_NOTICE = 'Showing the classic invoice. The selected format could not be built.';
export const FORMAT_NOT_AVAILABLE_YET = 'format not available yet';

/**
 * Hard gating withholds a v2 invoice code until its status is accepted.
 * Soft gating leaves it available. Nothing in this function marks a code accepted.
 */
export function invoiceV2HardBlocked(input: {
  gate?: ReportsCatalogueGate;
  code: string;
  status?: ReportConformanceStatus;
}): boolean {
  const gate = input.gate ?? reportsCatalogueGate();
  if (gate !== 'hard') return false;
  if (!invoiceV2SpecCodes.has(input.code)) return false;
  const status = input.status ?? reportConformanceStatus(input.code);
  return status !== 'accepted';
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
  if (invoiceV2HardBlocked({ gate: input.gate, code, status: input.status })) return false;
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
