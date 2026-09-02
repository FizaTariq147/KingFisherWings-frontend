import {
  asRecord,
  normalizeMeta,
  pickBoolean,
  pickNumber,
  pickString,
  unwrapData,
  unwrapList,
} from '@/features/portal-shared/normalize';
import type {
  PortalQuotationDetail,
  PortalQuotationListItem,
  PortalQuotationListResult,
  PortalQuotationSummary,
  PortalQuotationPackage,
} from '../types/portalQuotations.types';

function portLabel(record: Record<string, unknown>, side: 'origin' | 'dest'): string {
  const nested =
    asRecord(record[`${side}_port`]) ||
    asRecord(record[side]) ||
    asRecord(record[side === 'dest' ? 'destination' : 'origin']);
  return (
    pickString(
      record[`${side}_name`],
      record[side === 'dest' ? 'destination' : 'origin'],
      nested?.name,
      nested?.code,
    ) || ''
  );
}

const OPEN_QUOTE_STATUSES = new Set([
  'DRAFT',
  'SUBMITTED',
  'APPROVED',
  'SENT',
  'PENDING',
  'OPEN',
]);

function sumByStatus(byStatus: Record<string, number>, statuses: Set<string>) {
  return Object.entries(byStatus).reduce((sum, [status, count]) => {
    return statuses.has(status.toUpperCase()) ? sum + count : sum;
  }, 0);
}

export function normalizeQuotationSummary(raw: unknown): PortalQuotationSummary {
  const data = asRecord(unwrapData(raw)) ?? asRecord(raw) ?? {};
  const byStatusRaw = asRecord(data.by_status) ?? asRecord(data.byStatus) ?? {};
  const byStatus: Record<string, number> = {};
  for (const [k, v] of Object.entries(byStatusRaw)) {
    const n = pickNumber(v);
    if (n !== undefined) byStatus[k] = n;
  }

  const byStatusTotal = Object.values(byStatus).reduce((sum, n) => sum + n, 0);

  return {
    total: pickNumber(data.total, data.count) ?? byStatusTotal,
    open: pickNumber(data.open, data.pending, data.active) ?? sumByStatus(byStatus, OPEN_QUOTE_STATUSES),
    won: pickNumber(data.won, data.approved) ?? sumByStatus(byStatus, new Set(['WON', 'CONVERTED'])),
    lost: pickNumber(data.lost, data.rejected) ?? sumByStatus(byStatus, new Set(['LOST', 'REJECTED', 'EXPIRED'])),
    byStatus,
    raw: data,
  };
}

export function normalizeQuotationListItem(raw: unknown): PortalQuotationListItem | null {
  const record = asRecord(raw);
  if (!record) return null;
  const id = pickString(record.id);
  if (!id) return null;
  return {
    id,
    number:
      pickString(record.number, record.quotation_number, record.quotationNumber, record.ref) || id,
    status: pickString(record.status) || undefined,
    jobType: pickString(record.job_type, record.jobType) || undefined,
    currencyCode: pickString(record.currency_code, record.currencyCode, record.currency) || undefined,
    origin: portLabel(record, 'origin') || undefined,
    destination: portLabel(record, 'dest') || undefined,
    validUntil: pickString(record.valid_until, record.validUntil) || undefined,
    createdAt: pickString(record.created_at, record.createdAt) || undefined,
    raw: record,
  };
}

export function normalizeQuotationList(
  raw: unknown,
  params: { page?: number; limit?: number },
): PortalQuotationListResult {
  const { items, meta } = unwrapList(raw, ['items', 'results', 'quotations', 'data']);
  const normalized = items
    .map(normalizeQuotationListItem)
    .filter((q): q is PortalQuotationListItem => Boolean(q));
  return {
    items: normalized,
    meta: normalizeMeta(meta, normalized.length, params),
  };
}

export function normalizeQuotationDetail(raw: unknown): PortalQuotationDetail | null {
  const data = asRecord(unwrapData(raw)) ?? asRecord(raw);
  if (!data) return null;
  const base = normalizeQuotationListItem(data);
  if (!base) return null;

  const linesRaw = data.lines ?? data.charge_lines ?? data.items;
  const lines = Array.isArray(linesRaw)
    ? linesRaw
        .map((line) => {
          const r = asRecord(line);
          if (!r) return null;
          const id = pickString(r.id) || pickString(r.description) || Math.random().toString(36);
          return {
            id,
            description: pickString(r.description, r.name, r.charge_name) || 'Line',
            amount: pickNumber(r.amount, r.total, r.line_total),
            currencyCode: pickString(r.currency_code, r.currencyCode) || undefined,
          };
        })
        .filter((l): l is NonNullable<typeof l> => Boolean(l))
    : undefined;

  return {
    ...base,
    commodity: pickString(data.commodity) || undefined,
    pieces: pickNumber(data.pieces),
    grossWeight: pickNumber(data.gross_weight, data.grossWeight),
    chargeableWeight: pickNumber(data.chargeable_weight, data.chargeableWeight),
    volumeCbm: pickNumber(data.volume_cbm, data.volumeCbm),
    specialRequirements:
      pickString(data.special_requirements, data.specialRequirements, data.notes) || undefined,
    source: pickString(data.source) || undefined,
    negotiationRound: pickNumber(data.negotiation_round, data.negotiationRound),
    convertedJobNumber:
      pickString(data.converted_job_number, data.convertedJobNumber, data.job_number) || undefined,
    packages: normalizePortalPackages(data.packages),
    pdfUrl: (() => {
      const raw = pickString(
        data.customer_pdf_url,
        data.customerPdfUrl,
        data.pdf_url,
        data.pdfUrl,
        data.download_url,
        data.downloadUrl,
      );
      // Relative API paths must not be opened in the SPA (frontend 404).
      return raw && /^https?:\/\//i.test(raw) ? raw : undefined;
    })(),
    pdfReady:
      pickBoolean(
        data.pdf_ready,
        data.pdfReady,
        data.has_customer_pdf,
        data.hasCustomerPdf,
        data.customer_pdf_ready,
      ) ?? undefined,
    lines,
  };
}

function normalizePortalPackages(raw: unknown): PortalQuotationPackage[] | undefined {
  if (!Array.isArray(raw)) return undefined;
  const packages: PortalQuotationPackage[] = [];
  for (const entry of raw) {
    const r = asRecord(entry);
    if (!r) continue;
    packages.push({
      id: pickString(r.id) || undefined,
      lengthCm: pickNumber(r.length_cm, r.lengthCm),
      widthCm: pickNumber(r.width_cm, r.widthCm),
      heightCm: pickNumber(r.height_cm, r.heightCm),
      grossWeightKg: pickNumber(r.gross_weight_kg, r.grossWeightKg),
      pieces: pickNumber(r.pieces),
      cbm: pickNumber(r.cbm, r.volume_cbm),
    });
  }
  return packages.length ? packages : undefined;
}
