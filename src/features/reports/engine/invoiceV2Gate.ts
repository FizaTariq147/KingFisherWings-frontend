import { INVOICE_V2_FALLBACK_NOTICE, isReportsV2Code } from './reportsV2Gate';
import { reportsCatalogueGate, type ReportsCatalogueGate } from './reportsEngine';
import { reportConformanceStatus, type ReportConformanceStatus } from '../utils/reportConformanceStatus';

export type InvoicePdfEntry = 'generate' | 'reports' | 'formats';
export type InvoicePdfDocument = 'quotation' | 'invoice' | 'credit_note' | 'debit_note';

/** 'Showing the classic invoice. The selected format could not be built.' Defined once in reportsV2Gate. */
export { INVOICE_V2_FALLBACK_NOTICE };
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
  if (!isReportsV2Code(input.code)) return false;
  const status = input.status ?? reportConformanceStatus(input.code);
  return status !== 'accepted';
}

/**
 * v2 runs for an invoice only from Reports or Formats, or from Generate PDF
 * when the company style is an explicit non-classic code. Credit notes and
 * debit notes stay on the classic generator. Quotation stays classic in this
 * pass. A code that is neither classic nor wired never runs v2.
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
  const classicOrEmpty = code.trim() === '' || code === 'classic';
  if (invoiceV2HardBlocked({ gate: input.gate, code, status: input.status })) return false;
  if (input.entry === 'reports' || input.entry === 'formats') {
    return classicOrEmpty || isReportsV2Code(code);
  }
  return input.style.trim() !== '' && input.style !== 'classic' && isReportsV2Code(input.style);
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

/** Dev routes, tried in order. /__reports/v2 draws any wired spec; the invoice route is the older one. */
const V2_ROUTES = ['/__reports/v2', '/__reports/invoice-v2'] as const;

export async function renderInvoiceV2InBrowser(body: {
  code: string;
  invoice?: unknown;
  job?: unknown;
  party?: unknown;
  organization?: unknown;
  quotation?: unknown;
  voucher?: unknown;
  bank?: unknown;
  session?: unknown;
  logoBase64?: string;
}): Promise<Blob> {
  const payload = JSON.stringify(body);
  for (const route of V2_ROUTES) {
    try {
      const response = await fetch(route, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: payload,
      });
      if (response.ok) return await response.blob();
    } catch {
      /* try the next route */
    }
  }
  throw new InvoiceV2Unavailable();
}
