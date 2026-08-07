/**
 * Scaffold remaining portal modules — run: node scripts/scaffold-portal-modules-2.cjs
 */
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..', 'src', 'features');

function write(rel, content) {
  const full = path.join(root, rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content.trim() + '\n');
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

// PAYMENTS
write('portal-payments/api/portalPayments.api.ts', `
export const PORTAL_PAYMENTS_API = { list: '/portal/payments' } as const;
`);

write('portal-payments/types/portalPayments.types.ts', `
import type { PortalPaginationMeta } from '@/features/portal-shared/normalize';
export interface PortalPaymentListParams {
  page?: number; limit?: number; from_date?: string; to_date?: string; search?: string;
}
export interface PortalPaymentListItem {
  id: string; reference?: string; paymentDate?: string; amount?: number;
  currencyCode?: string; method?: string; status?: string; direction?: string;
}
export interface PortalPaymentListResult { items: PortalPaymentListItem[]; meta: PortalPaginationMeta; }
`);

write('portal-payments/utils/normalizePortalPayments.ts', `
${N}
import type { PortalPaymentListItem, PortalPaymentListResult } from '../types/portalPayments.types';

export function normalizePaymentItem(raw: unknown): PortalPaymentListItem | null {
  const r = asRecord(raw); if (!r) return null;
  const id = pickString(r.id); if (!id) return null;
  return {
    id,
    reference: pickString(r.reference_number, r.referenceNumber, r.reference, r.number) || undefined,
    paymentDate: pickString(r.payment_date, r.paymentDate, r.created_at) || undefined,
    amount: pickNumber(r.amount, r.total_amount, r.totalAmount),
    currencyCode: pickString(r.currency_code, r.currencyCode) || undefined,
    method: pickString(r.payment_method, r.paymentMethod, r.method) || undefined,
    status: pickString(r.status) || undefined,
    direction: pickString(r.direction) || undefined,
  };
}

export function normalizePaymentList(raw: unknown, params: { page?: number; limit?: number }): PortalPaymentListResult {
  const { items, meta } = unwrapList(raw, ['items', 'results', 'payments', 'data']);
  const normalized = items.map(normalizePaymentItem).filter((x): x is PortalPaymentListItem => Boolean(x));
  return { items: normalized, meta: normalizeMeta(meta, normalized.length, params) };
}
`);

write('portal-payments/services/portalPayments.service.ts', `
import { portalApiClient } from '@/lib/portalApiClient';
import { PORTAL_PAYMENTS_API } from '../api/portalPayments.api';
import type { PortalPaymentListParams, PortalPaymentListResult } from '../types/portalPayments.types';
import { normalizePaymentList } from '../utils/normalizePortalPayments';

export const portalPaymentsService = {
  async list(params: PortalPaymentListParams = {}): Promise<PortalPaymentListResult> {
    const res = await portalApiClient.get(PORTAL_PAYMENTS_API.list, { params });
    return normalizePaymentList(res.data, params);
  },
};
`);

write('portal-payments/hooks/usePortalPayments.ts', `
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { usePortalQueryScope } from '@/features/portal-shared/usePortalQueryScope';
import { usePortalAuthStore } from '@/features/portal-auth/store/portalAuthStore';
import { portalPaymentsService } from '../services/portalPayments.service';
import type { PortalPaymentListParams } from '../types/portalPayments.types';

export const portalPaymentKeys = {
  all: (scope: string) => ['portal', scope, 'payments'] as const,
  list: (scope: string, params: PortalPaymentListParams) => [...portalPaymentKeys.all(scope), 'list', params] as const,
};

export function usePortalPayments(params: PortalPaymentListParams) {
  const accessToken = usePortalAuthStore((s) => s.accessToken);
  const scope = usePortalQueryScope();
  return useQuery({
    queryKey: portalPaymentKeys.list(scope, params),
    queryFn: () => portalPaymentsService.list(params),
    enabled: Boolean(accessToken) && scope !== 'anon',
    staleTime: 0,
    placeholderData: keepPreviousData,
  });
}
`);

// CREDIT CCP
write('portal-credit/api/portalCredit.api.ts', `
export const PORTAL_CREDIT_API = {
  summary: '/portal/credit/summary',
  aging: '/portal/credit/aging',
  statement: '/portal/credit/statement',
  statementPdf: '/portal/credit/statement.pdf',
} as const;
`);

write('portal-credit/types/portalCredit.types.ts', `
export interface PortalCreditSummary {
  creditLimit?: number; used?: number; available?: number; currencyCode?: string; creditStatus?: string; creditDays?: number;
}
export interface PortalAgingBucket { label: string; amount: number; }
export interface PortalAgingResult { asOf?: string; buckets: PortalAgingBucket[]; total?: number; }
export interface PortalStatementLine {
  id: string; date?: string; type?: string; reference?: string; debit?: number; credit?: number; balance?: number; description?: string;
}
export interface PortalStatementResult { asOf?: string; openingBalance?: number; closingBalance?: number; lines: PortalStatementLine[]; }
`);

write('portal-credit/utils/normalizePortalCredit.ts', `
${N}
import type {
  PortalAgingBucket, PortalAgingResult, PortalCreditSummary, PortalStatementLine, PortalStatementResult,
} from '../types/portalCredit.types';

export function normalizeCreditSummary(raw: unknown): PortalCreditSummary {
  const d = asRecord(unwrapData(raw)) ?? asRecord(raw) ?? {};
  return {
    creditLimit: pickNumber(d.credit_limit, d.creditLimit, d.limit),
    used: pickNumber(d.used, d.used_credit, d.usedCredit, d.outstanding),
    available: pickNumber(d.available, d.available_credit, d.availableCredit),
    currencyCode: pickString(d.currency_code, d.currencyCode) || undefined,
    creditStatus: pickString(d.credit_status, d.creditStatus, d.status) || undefined,
    creditDays: pickNumber(d.credit_days, d.creditDays),
  };
}

export function normalizeAging(raw: unknown): PortalAgingResult {
  const d = asRecord(unwrapData(raw)) ?? asRecord(raw) ?? {};
  const bucketsRaw =
    (Array.isArray(d.buckets) && d.buckets) ||
    (Array.isArray(d.aging) && d.aging) ||
    [];
  let buckets: PortalAgingBucket[] = [];
  if (bucketsRaw.length) {
    buckets = bucketsRaw.map((b, i) => {
      const r = asRecord(b) ?? {};
      return {
        label: pickString(r.label, r.bucket, r.name) || \`Bucket \${i + 1}\`,
        amount: pickNumber(r.amount, r.balance, r.total) ?? 0,
      };
    });
  } else {
    const known = [
      ['current', 'Current'],
      ['days_1_30', '1–30'],
      ['days_31_60', '31–60'],
      ['days_61_90', '61–90'],
      ['days_90_plus', '90+'],
      ['over_90', '90+'],
    ];
    for (const [key, label] of known) {
      const n = pickNumber(d[key], d[key.replace(/_/g, '')]);
      if (n !== undefined) buckets.push({ label, amount: n });
    }
  }
  return {
    asOf: pickString(d.as_of, d.asOf) || undefined,
    total: pickNumber(d.total, d.total_outstanding),
    buckets,
  };
}

export function normalizeStatement(raw: unknown): PortalStatementResult {
  const d = asRecord(unwrapData(raw)) ?? asRecord(raw) ?? {};
  const linesRaw = Array.isArray(d.lines) ? d.lines : Array.isArray(d.transactions) ? d.transactions : Array.isArray(d.items) ? d.items : [];
  const lines: PortalStatementLine[] = linesRaw.map((line, i) => {
    const r = asRecord(line) ?? {};
    return {
      id: pickString(r.id) || String(i),
      date: pickString(r.date, r.txn_date, r.transaction_date) || undefined,
      type: pickString(r.type, r.doc_type, d.document_type) || undefined,
      reference: pickString(r.reference, r.ref, r.document_number) || undefined,
      debit: pickNumber(r.debit, r.debit_amount),
      credit: pickNumber(r.credit, r.credit_amount),
      balance: pickNumber(r.balance, r.running_balance),
      description: pickString(r.description, r.narration) || undefined,
    };
  });
  return {
    asOf: pickString(d.as_of, d.asOf) || undefined,
    openingBalance: pickNumber(d.opening_balance, d.openingBalance),
    closingBalance: pickNumber(d.closing_balance, d.closingBalance),
    lines,
  };
}
`);

write('portal-credit/services/portalCredit.service.ts', `
import { portalApiClient } from '@/lib/portalApiClient';
import { filenameFromContentDisposition } from '@/features/portal-shared/normalize';
import { triggerBlobDownload } from '@/features/files/utils/triggerBlobDownload';
import { PORTAL_CREDIT_API } from '../api/portalCredit.api';
import type { PortalAgingResult, PortalCreditSummary, PortalStatementResult } from '../types/portalCredit.types';
import { normalizeAging, normalizeCreditSummary, normalizeStatement } from '../utils/normalizePortalCredit';

export const portalCreditService = {
  async summary(): Promise<PortalCreditSummary> {
    const res = await portalApiClient.get(PORTAL_CREDIT_API.summary);
    return normalizeCreditSummary(res.data);
  },
  async aging(asOf?: string): Promise<PortalAgingResult> {
    const res = await portalApiClient.get(PORTAL_CREDIT_API.aging, { params: asOf ? { as_of: asOf } : undefined });
    return normalizeAging(res.data);
  },
  async statement(asOf?: string): Promise<PortalStatementResult> {
    const res = await portalApiClient.get(PORTAL_CREDIT_API.statement, { params: asOf ? { as_of: asOf } : undefined });
    return normalizeStatement(res.data);
  },
  async downloadStatementPdf(asOf?: string): Promise<void> {
    const res = await portalApiClient.get(PORTAL_CREDIT_API.statementPdf, {
      params: asOf ? { as_of: asOf } : undefined,
      responseType: 'blob',
    });
    const filename = filenameFromContentDisposition(
      typeof res.headers['content-disposition'] === 'string' ? res.headers['content-disposition'] : undefined,
    ) || 'statement.pdf';
    triggerBlobDownload(res.data as Blob, filename);
  },
};
`);

write('portal-credit/hooks/usePortalCredit.ts', `
import { useMutation, useQuery } from '@tanstack/react-query';
import { usePortalQueryScope } from '@/features/portal-shared/usePortalQueryScope';
import { usePortalAuthStore } from '@/features/portal-auth/store/portalAuthStore';
import { portalCreditService } from '../services/portalCredit.service';

export const portalCreditKeys = {
  all: (scope: string) => ['portal', scope, 'credit'] as const,
  summary: (scope: string) => [...portalCreditKeys.all(scope), 'summary'] as const,
  aging: (scope: string, asOf?: string) => [...portalCreditKeys.all(scope), 'aging', asOf ?? ''] as const,
  statement: (scope: string, asOf?: string) => [...portalCreditKeys.all(scope), 'statement', asOf ?? ''] as const,
};

export function usePortalCreditSummary() {
  const accessToken = usePortalAuthStore((s) => s.accessToken);
  const scope = usePortalQueryScope();
  return useQuery({
    queryKey: portalCreditKeys.summary(scope),
    queryFn: () => portalCreditService.summary(),
    enabled: Boolean(accessToken) && scope !== 'anon',
    staleTime: 0,
  });
}

export function usePortalCreditAging(asOf?: string) {
  const accessToken = usePortalAuthStore((s) => s.accessToken);
  const scope = usePortalQueryScope();
  return useQuery({
    queryKey: portalCreditKeys.aging(scope, asOf),
    queryFn: () => portalCreditService.aging(asOf),
    enabled: Boolean(accessToken) && scope !== 'anon',
    staleTime: 0,
  });
}

export function usePortalCreditStatement(asOf?: string) {
  const accessToken = usePortalAuthStore((s) => s.accessToken);
  const scope = usePortalQueryScope();
  return useQuery({
    queryKey: portalCreditKeys.statement(scope, asOf),
    queryFn: () => portalCreditService.statement(asOf),
    enabled: Boolean(accessToken) && scope !== 'anon',
    staleTime: 0,
  });
}

export function useDownloadPortalStatementPdf() {
  return useMutation({
    mutationFn: (asOf?: string) => portalCreditService.downloadStatementPdf(asOf),
  });
}
`);

// CREDIT REQUESTS
write('portal-credit-requests/api/portalCreditRequests.api.ts', `
export const PORTAL_CREDIT_REQUESTS_API = {
  list: '/portal/credit/limit-requests',
  create: '/portal/credit/limit-requests',
} as const;
`);

write('portal-credit-requests/types/portalCreditRequests.types.ts', `
export interface PortalCreditLimitRequestDto { requested_limit: number; justification: string; }
export interface PortalCreditLimitRequest {
  id: string; requestedLimit?: number; justification?: string; status?: string;
  createdAt?: string; reviewNotes?: string; approvedLimit?: number;
}
`);

write('portal-credit-requests/utils/normalizePortalCreditRequests.ts', `
${N}
import type { PortalCreditLimitRequest } from '../types/portalCreditRequests.types';

export function normalizeCreditLimitRequest(raw: unknown): PortalCreditLimitRequest | null {
  const r = asRecord(raw); if (!r) return null;
  const id = pickString(r.id); if (!id) return null;
  return {
    id,
    requestedLimit: pickNumber(r.requested_limit, r.requestedLimit),
    justification: pickString(r.justification) || undefined,
    status: pickString(r.status) || undefined,
    createdAt: pickString(r.created_at, r.createdAt) || undefined,
    reviewNotes: pickString(r.review_notes, r.reviewNotes) || undefined,
    approvedLimit: pickNumber(r.approved_limit, r.approvedLimit),
  };
}

export function normalizeCreditLimitRequests(raw: unknown): PortalCreditLimitRequest[] {
  const { items } = unwrapList(raw, ['items', 'results', 'requests', 'data']);
  const unwrapped = unwrapData(raw);
  const list = items.length ? items : Array.isArray(unwrapped) ? unwrapped : [];
  return list.map(normalizeCreditLimitRequest).filter((x): x is PortalCreditLimitRequest => Boolean(x));
}
`);

write('portal-credit-requests/services/portalCreditRequests.service.ts', `
import { portalApiClient } from '@/lib/portalApiClient';
import { PORTAL_CREDIT_REQUESTS_API } from '../api/portalCreditRequests.api';
import type { PortalCreditLimitRequest, PortalCreditLimitRequestDto } from '../types/portalCreditRequests.types';
import { normalizeCreditLimitRequest, normalizeCreditLimitRequests } from '../utils/normalizePortalCreditRequests';

export const portalCreditRequestsService = {
  async list(): Promise<PortalCreditLimitRequest[]> {
    const res = await portalApiClient.get(PORTAL_CREDIT_REQUESTS_API.list);
    return normalizeCreditLimitRequests(res.data);
  },
  async create(dto: PortalCreditLimitRequestDto): Promise<PortalCreditLimitRequest> {
    const res = await portalApiClient.post(PORTAL_CREDIT_REQUESTS_API.create, dto);
    const item = normalizeCreditLimitRequest(res.data?.data ?? res.data);
    if (!item) throw new Error('Could not create credit limit request.');
    return item;
  },
};
`);

write('portal-credit-requests/hooks/usePortalCreditRequests.ts', `
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { usePortalQueryScope } from '@/features/portal-shared/usePortalQueryScope';
import { usePortalAuthStore } from '@/features/portal-auth/store/portalAuthStore';
import { portalCreditRequestsService } from '../services/portalCreditRequests.service';
import type { PortalCreditLimitRequestDto } from '../types/portalCreditRequests.types';

export const portalCreditRequestKeys = {
  all: (scope: string) => ['portal', scope, 'credit-requests'] as const,
  list: (scope: string) => [...portalCreditRequestKeys.all(scope), 'list'] as const,
};

export function usePortalCreditRequests() {
  const accessToken = usePortalAuthStore((s) => s.accessToken);
  const scope = usePortalQueryScope();
  return useQuery({
    queryKey: portalCreditRequestKeys.list(scope),
    queryFn: () => portalCreditRequestsService.list(),
    enabled: Boolean(accessToken) && scope !== 'anon',
    staleTime: 0,
  });
}

export function useCreatePortalCreditRequest() {
  const qc = useQueryClient();
  const scope = usePortalQueryScope();
  return useMutation({
    mutationFn: (dto: PortalCreditLimitRequestDto) => portalCreditRequestsService.create(dto),
    onSuccess: () => { void qc.invalidateQueries({ queryKey: portalCreditRequestKeys.all(scope) }); },
  });
}
`);

console.log('scaffold-2 done');
