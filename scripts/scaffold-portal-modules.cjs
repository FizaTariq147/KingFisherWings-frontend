/**
 * Scaffolds portal modules. Run: node scripts/scaffold-portal-modules.cjs
 */
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..', 'src', 'features');

function write(rel, content) {
  const full = path.join(root, rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content.trimStart().replace(/^\n/, ''));
  if (!full.endsWith('\n')) fs.appendFileSync(full, '\n');
  console.log('+', rel);
}

const N = `import {
  asRecord,
  normalizeMeta,
  pickBoolean,
  pickNumber,
  pickString,
  unwrapData,
  unwrapList,
} from '@/features/portal-shared/normalize';`;

// ========== INVOICES ==========
write('portal-invoices/api/portalInvoices.api.ts', `
export const PORTAL_INVOICES_API = {
  summary: '/portal/invoices/summary',
  list: '/portal/invoices',
  detail: (id: string) => \`/portal/invoices/\${id}\`,
  pdf: (id: string) => \`/portal/invoices/\${id}/pdf\`,
} as const;

export const PORTAL_INVOICE_STATUSES = [
  'DRAFT', 'POSTED', 'SENT', 'PARTIALLY_PAID', 'PAID', 'CANCELLED', 'VOID',
] as const;
export type PortalInvoiceStatus = (typeof PORTAL_INVOICE_STATUSES)[number];
`);

write('portal-invoices/types/portalInvoices.types.ts', `
import type { PortalPaginationMeta } from '@/features/portal-shared/normalize';
import type { PortalInvoiceStatus } from '../api/portalInvoices.api';

export interface PortalInvoiceListParams {
  page?: number; limit?: number; status?: PortalInvoiceStatus | string;
  job_id?: string; search?: string; from_date?: string; to_date?: string;
}
export interface PortalInvoiceSummary {
  total: number; outstanding: number; overdue: number; paid: number;
  byStatus: Record<string, number>;
}
export interface PortalInvoiceLine {
  id: string; description: string; quantity?: number; unitPrice?: number; lineTotal?: number;
}
export interface PortalInvoiceListItem {
  id: string; number: string; status?: string; currencyCode?: string;
  invoiceDate?: string; dueDate?: string; totalAmount?: number;
  outstandingBalance?: number; jobId?: string;
}
export interface PortalInvoiceDetail extends PortalInvoiceListItem {
  subtotal?: number; taxTotal?: number; paidAmount?: number; remarks?: string;
  lines: PortalInvoiceLine[];
}
export interface PortalInvoiceListResult { items: PortalInvoiceListItem[]; meta: PortalPaginationMeta; }
`);

write('portal-invoices/utils/normalizePortalInvoices.ts', `
${N}
import type {
  PortalInvoiceDetail, PortalInvoiceLine, PortalInvoiceListItem,
  PortalInvoiceListResult, PortalInvoiceSummary,
} from '../types/portalInvoices.types';

export function normalizeInvoiceSummary(raw: unknown): PortalInvoiceSummary {
  const data = asRecord(unwrapData(raw)) ?? asRecord(raw) ?? {};
  const byStatusRaw = asRecord(data.by_status) ?? asRecord(data.byStatus) ?? {};
  const byStatus: Record<string, number> = {};
  for (const [k, v] of Object.entries(byStatusRaw)) {
    const n = pickNumber(v); if (n !== undefined) byStatus[k] = n;
  }
  const sum = Object.values(byStatus).reduce((s, n) => s + n, 0);
  return {
    total: pickNumber(data.total, data.count) ?? sum,
    outstanding: pickNumber(data.outstanding, data.outstanding_total, data.outstandingTotal) ?? 0,
    overdue: pickNumber(data.overdue, data.overdue_count, data.overdueCount) ?? 0,
    paid: pickNumber(data.paid, data.paid_count, data.paidCount) ?? 0,
    byStatus,
  };
}

export function normalizeInvoiceLine(raw: unknown): PortalInvoiceLine | null {
  const r = asRecord(raw); if (!r) return null;
  return {
    id: pickString(r.id) || Math.random().toString(36).slice(2),
    description: pickString(r.description) || 'Line',
    quantity: pickNumber(r.quantity, r.qty),
    unitPrice: pickNumber(r.unit_price, r.unitPrice),
    lineTotal: pickNumber(r.line_total, r.lineTotal, r.amount, r.total),
  };
}

export function normalizeInvoiceListItem(raw: unknown): PortalInvoiceListItem | null {
  const r = asRecord(raw); if (!r) return null;
  const id = pickString(r.id); if (!id) return null;
  return {
    id,
    number: pickString(r.invoice_number, r.invoiceNumber, r.number, r.ref) || id,
    status: pickString(r.status) || undefined,
    currencyCode: pickString(r.currency_code, r.currencyCode, r.currency) || undefined,
    invoiceDate: pickString(r.invoice_date, r.invoiceDate) || undefined,
    dueDate: pickString(r.due_date, r.dueDate) || undefined,
    totalAmount: pickNumber(r.total_amount, r.totalAmount, r.total),
    outstandingBalance: pickNumber(r.outstanding_balance, r.outstandingBalance, r.balance),
    jobId: pickString(r.job_id, r.jobId) || undefined,
  };
}

export function normalizeInvoiceList(raw: unknown, params: { page?: number; limit?: number }): PortalInvoiceListResult {
  const { items, meta } = unwrapList(raw, ['items', 'results', 'invoices', 'data']);
  const normalized = items.map(normalizeInvoiceListItem).filter((x): x is PortalInvoiceListItem => Boolean(x));
  return { items: normalized, meta: normalizeMeta(meta, normalized.length, params) };
}

export function normalizeInvoiceDetail(raw: unknown): PortalInvoiceDetail | null {
  const data = asRecord(unwrapData(raw)) ?? asRecord(raw); if (!data) return null;
  const base = normalizeInvoiceListItem(data); if (!base) return null;
  const linesRaw = Array.isArray(data.lines) ? data.lines : [];
  return {
    ...base,
    subtotal: pickNumber(data.subtotal),
    taxTotal: pickNumber(data.tax_total, data.taxTotal),
    paidAmount: pickNumber(data.paid_amount, data.paidAmount),
    remarks: pickString(data.remarks) || undefined,
    lines: linesRaw.map(normalizeInvoiceLine).filter((l): l is PortalInvoiceLine => Boolean(l)),
  };
}
`);

write('portal-invoices/services/portalInvoices.service.ts', `
import { portalApiClient } from '@/lib/portalApiClient';
import { filenameFromContentDisposition } from '@/features/portal-shared/normalize';
import { triggerBlobDownload } from '@/features/files/utils/triggerBlobDownload';
import { PORTAL_INVOICES_API } from '../api/portalInvoices.api';
import type { PortalInvoiceDetail, PortalInvoiceListParams, PortalInvoiceListResult, PortalInvoiceSummary } from '../types/portalInvoices.types';
import { normalizeInvoiceDetail, normalizeInvoiceList, normalizeInvoiceSummary } from '../utils/normalizePortalInvoices';

export const portalInvoicesService = {
  async summary(): Promise<PortalInvoiceSummary> {
    const res = await portalApiClient.get(PORTAL_INVOICES_API.summary);
    return normalizeInvoiceSummary(res.data);
  },
  async list(params: PortalInvoiceListParams = {}): Promise<PortalInvoiceListResult> {
    const res = await portalApiClient.get(PORTAL_INVOICES_API.list, { params });
    return normalizeInvoiceList(res.data, params);
  },
  async getById(id: string): Promise<PortalInvoiceDetail> {
    const res = await portalApiClient.get(PORTAL_INVOICES_API.detail(id));
    const detail = normalizeInvoiceDetail(res.data);
    if (!detail) throw new Error('Invoice not found.');
    return detail;
  },
  async downloadPdf(id: string, fallbackName = 'invoice.pdf'): Promise<void> {
    const res = await portalApiClient.get(PORTAL_INVOICES_API.pdf(id), { responseType: 'blob' });
    const filename = filenameFromContentDisposition(
      typeof res.headers['content-disposition'] === 'string' ? res.headers['content-disposition'] : undefined,
    ) || fallbackName;
    triggerBlobDownload(res.data as Blob, filename);
  },
};
`);

write('portal-invoices/hooks/usePortalInvoices.ts', `
import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query';
import { usePortalQueryScope } from '@/features/portal-shared/usePortalQueryScope';
import { usePortalAuthStore } from '@/features/portal-auth/store/portalAuthStore';
import { portalInvoicesService } from '../services/portalInvoices.service';
import type { PortalInvoiceListParams } from '../types/portalInvoices.types';

export const portalInvoiceKeys = {
  all: (scope: string) => ['portal', scope, 'invoices'] as const,
  summary: (scope: string) => [...portalInvoiceKeys.all(scope), 'summary'] as const,
  list: (scope: string, params: PortalInvoiceListParams) => [...portalInvoiceKeys.all(scope), 'list', params] as const,
  detail: (scope: string, id: string) => [...portalInvoiceKeys.all(scope), 'detail', id] as const,
};

export function usePortalInvoiceSummary(enabled = true) {
  const accessToken = usePortalAuthStore((s) => s.accessToken);
  const scope = usePortalQueryScope();
  return useQuery({
    queryKey: portalInvoiceKeys.summary(scope),
    queryFn: () => portalInvoicesService.summary(),
    enabled: Boolean(accessToken) && enabled && scope !== 'anon',
    staleTime: 0,
  });
}

export function usePortalInvoices(params: PortalInvoiceListParams) {
  const accessToken = usePortalAuthStore((s) => s.accessToken);
  const scope = usePortalQueryScope();
  return useQuery({
    queryKey: portalInvoiceKeys.list(scope, params),
    queryFn: () => portalInvoicesService.list(params),
    enabled: Boolean(accessToken) && scope !== 'anon',
    staleTime: 0,
    placeholderData: keepPreviousData,
  });
}

export function usePortalInvoice(id: string) {
  const accessToken = usePortalAuthStore((s) => s.accessToken);
  const scope = usePortalQueryScope();
  return useQuery({
    queryKey: portalInvoiceKeys.detail(scope, id),
    queryFn: () => portalInvoicesService.getById(id),
    enabled: Boolean(accessToken) && Boolean(id) && scope !== 'anon',
    staleTime: 0,
  });
}

export function useDownloadPortalInvoicePdf() {
  return useMutation({
    mutationFn: ({ id, name }: { id: string; name?: string }) =>
      portalInvoicesService.downloadPdf(id, name || 'invoice.pdf'),
  });
}
`);

// ========== CREDIT NOTES ==========
write('portal-credit-notes/api/portalCreditNotes.api.ts', `
export const PORTAL_CREDIT_NOTES_API = {
  list: '/portal/credit-notes',
  detail: (id: string) => \`/portal/credit-notes/\${id}\`,
} as const;
`);

write('portal-credit-notes/types/portalCreditNotes.types.ts', `
import type { PortalPaginationMeta } from '@/features/portal-shared/normalize';

export interface PortalCreditNoteListParams {
  page?: number; limit?: number; status?: string; job_id?: string;
  search?: string; from_date?: string; to_date?: string;
}
export interface PortalCreditNoteLine {
  id: string; description: string; quantity?: number; unitPrice?: number; lineTotal?: number;
}
export interface PortalCreditNoteListItem {
  id: string; number: string; status?: string; currencyCode?: string;
  creditDate?: string; totalAmount?: number; creditedInvoiceId?: string; creditedInvoiceNumber?: string;
}
export interface PortalCreditNoteDetail extends PortalCreditNoteListItem {
  remarks?: string; lines: PortalCreditNoteLine[];
}
export interface PortalCreditNoteListResult { items: PortalCreditNoteListItem[]; meta: PortalPaginationMeta; }
`);

write('portal-credit-notes/utils/normalizePortalCreditNotes.ts', `
${N}
import type {
  PortalCreditNoteDetail, PortalCreditNoteLine, PortalCreditNoteListItem, PortalCreditNoteListResult,
} from '../types/portalCreditNotes.types';

export function normalizeCreditNoteLine(raw: unknown): PortalCreditNoteLine | null {
  const r = asRecord(raw); if (!r) return null;
  return {
    id: pickString(r.id) || Math.random().toString(36).slice(2),
    description: pickString(r.description) || 'Line',
    quantity: pickNumber(r.quantity),
    unitPrice: pickNumber(r.unit_price, r.unitPrice),
    lineTotal: pickNumber(r.line_total, r.lineTotal, r.amount, r.total),
  };
}

export function normalizeCreditNoteListItem(raw: unknown): PortalCreditNoteListItem | null {
  const r = asRecord(raw); if (!r) return null;
  const id = pickString(r.id); if (!id) return null;
  return {
    id,
    number: pickString(r.credit_note_number, r.creditNoteNumber, r.number, r.ref) || id,
    status: pickString(r.status) || undefined,
    currencyCode: pickString(r.currency_code, r.currencyCode) || undefined,
    creditDate: pickString(r.credit_date, r.creditDate, r.invoice_date, r.created_at) || undefined,
    totalAmount: pickNumber(r.total_amount, r.totalAmount, r.total),
    creditedInvoiceId: pickString(r.credited_invoice_id, r.creditedInvoiceId, r.invoice_id) || undefined,
    creditedInvoiceNumber: pickString(r.credited_invoice_number, r.creditedInvoiceNumber) || undefined,
  };
}

export function normalizeCreditNoteList(raw: unknown, params: { page?: number; limit?: number }): PortalCreditNoteListResult {
  const { items, meta } = unwrapList(raw, ['items', 'results', 'credit_notes', 'creditNotes', 'data']);
  const normalized = items.map(normalizeCreditNoteListItem).filter((x): x is PortalCreditNoteListItem => Boolean(x));
  return { items: normalized, meta: normalizeMeta(meta, normalized.length, params) };
}

export function normalizeCreditNoteDetail(raw: unknown): PortalCreditNoteDetail | null {
  const data = asRecord(unwrapData(raw)) ?? asRecord(raw); if (!data) return null;
  const base = normalizeCreditNoteListItem(data); if (!base) return null;
  const linesRaw = Array.isArray(data.lines) ? data.lines : [];
  return {
    ...base,
    remarks: pickString(data.remarks) || undefined,
    lines: linesRaw.map(normalizeCreditNoteLine).filter((l): l is PortalCreditNoteLine => Boolean(l)),
  };
}
`);

write('portal-credit-notes/services/portalCreditNotes.service.ts', `
import { portalApiClient } from '@/lib/portalApiClient';
import { PORTAL_CREDIT_NOTES_API } from '../api/portalCreditNotes.api';
import type { PortalCreditNoteDetail, PortalCreditNoteListParams, PortalCreditNoteListResult } from '../types/portalCreditNotes.types';
import { normalizeCreditNoteDetail, normalizeCreditNoteList } from '../utils/normalizePortalCreditNotes';

export const portalCreditNotesService = {
  async list(params: PortalCreditNoteListParams = {}): Promise<PortalCreditNoteListResult> {
    const res = await portalApiClient.get(PORTAL_CREDIT_NOTES_API.list, { params });
    return normalizeCreditNoteList(res.data, params);
  },
  async getById(id: string): Promise<PortalCreditNoteDetail> {
    const res = await portalApiClient.get(PORTAL_CREDIT_NOTES_API.detail(id));
    const detail = normalizeCreditNoteDetail(res.data);
    if (!detail) throw new Error('Credit note not found.');
    return detail;
  },
};
`);

write('portal-credit-notes/hooks/usePortalCreditNotes.ts', `
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { usePortalQueryScope } from '@/features/portal-shared/usePortalQueryScope';
import { usePortalAuthStore } from '@/features/portal-auth/store/portalAuthStore';
import { portalCreditNotesService } from '../services/portalCreditNotes.service';
import type { PortalCreditNoteListParams } from '../types/portalCreditNotes.types';

export const portalCreditNoteKeys = {
  all: (scope: string) => ['portal', scope, 'credit-notes'] as const,
  list: (scope: string, params: PortalCreditNoteListParams) => [...portalCreditNoteKeys.all(scope), 'list', params] as const,
  detail: (scope: string, id: string) => [...portalCreditNoteKeys.all(scope), 'detail', id] as const,
};

export function usePortalCreditNotes(params: PortalCreditNoteListParams) {
  const accessToken = usePortalAuthStore((s) => s.accessToken);
  const scope = usePortalQueryScope();
  return useQuery({
    queryKey: portalCreditNoteKeys.list(scope, params),
    queryFn: () => portalCreditNotesService.list(params),
    enabled: Boolean(accessToken) && scope !== 'anon',
    staleTime: 0,
    placeholderData: keepPreviousData,
  });
}

export function usePortalCreditNote(id: string) {
  const accessToken = usePortalAuthStore((s) => s.accessToken);
  const scope = usePortalQueryScope();
  return useQuery({
    queryKey: portalCreditNoteKeys.detail(scope, id),
    queryFn: () => portalCreditNotesService.getById(id),
    enabled: Boolean(accessToken) && Boolean(id) && scope !== 'anon',
    staleTime: 0,
  });
}
`);

console.log('chunk1 ok');
