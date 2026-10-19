import type { ModeBookingFormDocumentKind } from '../constants/bookingDocumentKinds';
import { MODE_BOOKING_FORM_DOCUMENT_KINDS } from '../constants/bookingDocumentKinds';

export type BookingFormDocumentMeta = {
  kind: string;
  file_name?: string;
  file_url?: string;
  download_url?: string;
  /** Relative API path e.g. `/jobs/:id/documents/:docId/download`. */
  download_path?: string;
  s3_key?: string;
  id?: string;
  /** True when backend marks the kind attached (may still lack file meta). */
  attached?: boolean;
  missing?: boolean;
};

const ATTACH_TO_KIND: Record<string, ModeBookingFormDocumentKind> = {
  attach_commercial_invoice: 'commercial_invoice',
  attach_packing_list: 'packing_list',
  attach_bl_awb_copy: 'bill_of_lading',
  attach_licence: 'licence',
  attach_permit: 'licence',
  attach_uat_tax_certificate: 'uat_tax_certificate',
  attach_uat: 'uat_tax_certificate',
  attach_tax_certificate: 'uat_tax_certificate',
};

const KIND_ALIASES: Record<string, ModeBookingFormDocumentKind> = {
  commercial_invoice: 'commercial_invoice',
  commercialinvoice: 'commercial_invoice',
  invoice: 'commercial_invoice',
  ci: 'commercial_invoice',
  packing_list: 'packing_list',
  packinglist: 'packing_list',
  packing: 'packing_list',
  pl: 'packing_list',
  bill_of_lading: 'bill_of_lading',
  billlading: 'bill_of_lading',
  bl: 'bill_of_lading',
  bl_awb: 'bill_of_lading',
  bl_awb_copy: 'bill_of_lading',
  awb: 'bill_of_lading',
  air_waybill: 'bill_of_lading',
  licence: 'licence',
  license: 'licence',
  permit: 'licence',
  uat_tax_certificate: 'uat_tax_certificate',
  uat: 'uat_tax_certificate',
  tax_certificate: 'uat_tax_certificate',
  tax: 'uat_tax_certificate',
};

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function normalizeKind(raw: unknown): string {
  return String(raw ?? '')
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, '_');
}

function compactKind(raw: unknown): string {
  return normalizeKind(raw).replace(/_/g, '');
}

/** Map job document_type / kind aliases onto booking-form kinds. */
export function matchBookingKind(raw: unknown): ModeBookingFormDocumentKind | null {
  const kind = normalizeKind(raw);
  if (!kind) return null;

  const alias = KIND_ALIASES[kind] ?? KIND_ALIASES[compactKind(raw)];
  if (alias) return alias;

  for (const known of MODE_BOOKING_FORM_DOCUMENT_KINDS) {
    if (kind === known || kind.includes(known) || known.includes(kind)) return known;
  }
  if (kind.includes('commercial') && kind.includes('invoice')) return 'commercial_invoice';
  if (kind.includes('packing')) return 'packing_list';
  if (
    kind.includes('bill_of_lading') ||
    kind.includes('bl_awb') ||
    kind.includes('air_waybill') ||
    kind === 'awb'
  ) {
    return 'bill_of_lading';
  }
  if (kind.includes('licence') || kind.includes('license') || kind.includes('permit')) {
    return 'licence';
  }
  if (kind.includes('uat') || kind.includes('tax_certificate')) return 'uat_tax_certificate';
  return null;
}

function pickString(...values: unknown[]): string | undefined {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) return value.trim();
  }
  return undefined;
}

function metaFromRow(
  kind: ModeBookingFormDocumentKind,
  row: Record<string, unknown>,
): BookingFormDocumentMeta {
  const attached =
    row.attached === true ||
    row.is_attached === true ||
    row.missing === false
      ? true
      : row.attached === false || row.missing === true
        ? false
        : undefined;
  const missing =
    row.missing === true
      ? true
      : row.missing === false || attached === true
        ? false
        : undefined;
  return {
    kind,
    id: pickString(
      row.job_document_id,
      row.jobDocumentId,
      row.id,
      row.document_id,
      row.documentId,
    ),
    file_name: pickString(
      row.file_name,
      row.fileName,
      row.filename,
      row.original_name,
      row.originalName,
      row.name,
    ),
    file_url: pickString(row.file_url, row.fileUrl, row.url),
    download_url: pickString(row.download_url, row.downloadUrl, row.presigned_url, row.presignedUrl),
    download_path: pickString(
      row.download_path,
      row.downloadPath,
      row.path,
      row.document_download_path,
    ),
    s3_key: pickString(row.s3_key, row.s3Key, row.storage_key, row.storageKey, row.key),
    attached,
    missing,
  };
}

function hasFileRef(meta: BookingFormDocumentMeta | undefined): boolean {
  if (!meta) return false;
  return Boolean(
    meta.id ||
      meta.file_url ||
      meta.download_url ||
      meta.download_path ||
      meta.s3_key ||
      meta.file_name,
  );
}

function preferMeta(
  current: BookingFormDocumentMeta | undefined,
  next: BookingFormDocumentMeta,
): BookingFormDocumentMeta {
  if (!current) return next;
  const currentScore =
    (current.id ? 8 : 0) +
    (current.s3_key ? 4 : 0) +
    (current.file_url || current.download_url || current.download_path ? 2 : 0) +
    (current.file_name ? 1 : 0);
  const nextScore =
    (next.id ? 8 : 0) +
    (next.s3_key ? 4 : 0) +
    (next.file_url || next.download_url || next.download_path ? 2 : 0) +
    (next.file_name ? 1 : 0);
  if (nextScore > currentScore) return { ...current, ...next };
  return {
    ...next,
    ...current,
    file_name: current.file_name || next.file_name,
    file_url: current.file_url || next.file_url,
    download_url: current.download_url || next.download_url,
    download_path: current.download_path || next.download_path,
    s3_key: current.s3_key || next.s3_key,
    id: current.id || next.id,
    attached: current.attached ?? next.attached,
    missing: current.missing ?? next.missing,
  };
}

function rowHasFile(row: Record<string, unknown>): boolean {
  if (row.attached === true && row.missing !== true) {
    // Enriched booking-form documents[] may mark attached without nested file fields yet.
    if (
      pickString(
        row.job_document_id,
        row.jobDocumentId,
        row.id,
        row.document_id,
        row.file_url,
        row.s3_key,
        row.download_path,
      )
    ) {
      return true;
    }
  }
  return Boolean(
    pickString(
      row.file_url,
      row.fileUrl,
      row.download_url,
      row.downloadUrl,
      row.download_path,
      row.downloadPath,
      row.s3_key,
      row.s3Key,
      row.file_name,
      row.fileName,
      row.job_document_id,
      row.jobDocumentId,
      row.id,
      row.document_id,
    ),
  );
}

function matchKindFromRow(row: Record<string, unknown>): ModeBookingFormDocumentKind | null {
  const direct = matchBookingKind(
    row.kind ??
      row.document_kind ??
      row.documentKind ??
      row.document_type ??
      row.documentType ??
      row.type ??
      row.category ??
      row.sub_type ??
      row.subType ??
      row.section ??
      row.source ??
      row.label ??
      row.title,
  );
  if (direct) return direct;

  const haystack = [
    row.notes,
    row.description,
    row.reference_number,
    row.referenceNumber,
    row.tags,
    row.file_name,
    row.fileName,
    row.original_name,
    row.originalName,
    row.section,
    row.source,
  ]
    .flatMap((v) => (Array.isArray(v) ? v : [v]))
    .map((v) => normalizeKind(v))
    .filter(Boolean)
    .join(' ');

  if (!haystack) return null;
  for (const known of MODE_BOOKING_FORM_DOCUMENT_KINDS) {
    if (haystack.includes(known)) return known;
  }
  if (haystack.includes('commercial') && haystack.includes('invoice')) return 'commercial_invoice';
  if (haystack.includes('packing')) return 'packing_list';
  if (haystack.includes('licence') || haystack.includes('license')) return 'licence';
  if (haystack.includes('uat') || haystack.includes('tax')) return 'uat_tax_certificate';
  if (haystack.includes('bill_of_lading') || haystack.includes('awb') || haystack.includes('bl_')) {
    return 'bill_of_lading';
  }
  return null;
}

function ingestDocumentRow(
  row: Record<string, unknown>,
  kinds: Set<string>,
  byKind: Record<string, BookingFormDocumentMeta>,
) {
  const kind = matchKindFromRow(row);
  if (!kind) return;
  const meta = metaFromRow(kind, row);
  // Backend enriched shape: { kind, attached, missing, job_document_id?, … }
  if (meta.attached === true || hasFileRef(meta) || row.attached === true) {
    kinds.add(kind);
  }
  if (hasFileRef(meta) || meta.attached === true) {
    byKind[kind] = preferMeta(byKind[kind], meta);
  } else if (meta.missing === true) {
    // Keep flag-only awareness without inventing a downloadable row.
    kinds.add(kind);
  }
}

function ingestDocumentBucket(
  bucket: unknown,
  kinds: Set<string>,
  byKind: Record<string, BookingFormDocumentMeta>,
) {
  if (Array.isArray(bucket)) {
    for (const item of bucket) {
      const row = asRecord(item);
      if (row) ingestDocumentRow(row, kinds, byKind);
    }
    return;
  }
  const map = asRecord(bucket);
  if (!map) return;
  for (const [key, value] of Object.entries(map)) {
    const row = asRecord(value);
    if (!row) continue;
    const keyed = matchBookingKind(key);
    if (keyed) {
      kinds.add(keyed);
      byKind[keyed] = preferMeta(byKind[keyed], metaFromRow(keyed, row));
      continue;
    }
    ingestDocumentRow(row, kinds, byKind);
  }
}

export function extractBookingFormDocuments(form: Record<string, unknown> | null | undefined): {
  kinds: Set<string>;
  byKind: Record<string, BookingFormDocumentMeta>;
} {
  const kinds = new Set<string>();
  const byKind: Record<string, BookingFormDocumentMeta> = {};

  if (!form) return { kinds, byKind };

  for (const [flag, kind] of Object.entries(ATTACH_TO_KIND)) {
    if (form[flag] === true) kinds.add(kind);
  }

  for (const kind of MODE_BOOKING_FORM_DOCUMENT_KINDS) {
    const nested = asRecord(
      form[kind] ??
        form[`${kind}_document`] ??
        form[`${kind}Document`] ??
        form[`${kind}_file`] ??
        form[`${kind}File`],
    );
    if (nested) {
      kinds.add(kind);
      byKind[kind] = preferMeta(byKind[kind], metaFromRow(kind, nested));
    }

    const fileName = pickString(
      form[`${kind}_file_name`],
      form[`${kind}FileName`],
      form[`${kind}_filename`],
    );
    const fileUrl = pickString(form[`${kind}_file_url`], form[`${kind}FileUrl`], form[`${kind}_url`]);
    const downloadUrl = pickString(form[`${kind}_download_url`], form[`${kind}DownloadUrl`]);
    const downloadPath = pickString(form[`${kind}_download_path`], form[`${kind}DownloadPath`]);
    const s3Key = pickString(form[`${kind}_s3_key`], form[`${kind}S3Key`]);
    const jobDocumentId = pickString(
      form[`${kind}_job_document_id`],
      form[`${kind}JobDocumentId`],
      form[`${kind}_document_id`],
    );
    if (fileName || fileUrl || downloadUrl || downloadPath || s3Key || jobDocumentId) {
      kinds.add(kind);
      byKind[kind] = preferMeta(byKind[kind], {
        kind,
        id: jobDocumentId,
        file_name: fileName,
        file_url: fileUrl,
        download_url: downloadUrl,
        download_path: downloadPath,
        s3_key: s3Key,
        attached: true,
      });
    }
  }

  for (const bucket of [
    form.documents,
    form.uploaded_documents,
    form.uploadedDocuments,
    form.booking_documents,
    form.bookingDocuments,
    form.compliance_documents,
    form.complianceDocuments,
    form.files,
  ]) {
    ingestDocumentBucket(bucket, kinds, byKind);
  }

  return { kinds, byKind };
}

/**
 * Merge job `GET /jobs/:id/documents` (often `uploader_side=CUSTOMER`) into booking kinds.
 * Unmatched customer files are assigned to attach_* flagged kinds that still lack a file.
 */
export function mergeJobDocumentsIntoBooking(
  docs: unknown[],
  existing: Record<string, BookingFormDocumentMeta>,
  opts?: { flaggedKinds?: Iterable<string> },
): { kinds: Set<string>; byKind: Record<string, BookingFormDocumentMeta> } {
  const byKind = { ...existing };
  const kinds = new Set([...Object.keys(byKind), ...(opts?.flaggedKinds ?? [])]);
  const usedIds = new Set<string>();
  const unmatched: Record<string, unknown>[] = [];

  for (const item of docs) {
    const row = asRecord(item);
    if (!row || !rowHasFile(row)) continue;
    const kind = matchKindFromRow(row);
    if (!kind) {
      unmatched.push(row);
      continue;
    }
    kinds.add(kind);
    const meta = metaFromRow(kind, row);
    if (meta.id) usedIds.add(meta.id);
    byKind[kind] = preferMeta(byKind[kind], meta);
  }

  // Customer uploads often land as OTHER / untyped — map leftover files onto flagged kinds.
  const leftovers = unmatched.filter((row) => {
    const id = pickString(row.id, row.document_id, row.documentId);
    return !id || !usedIds.has(id);
  });

  for (const kind of MODE_BOOKING_FORM_DOCUMENT_KINDS) {
    if (!kinds.has(kind)) continue;
    const current = byKind[kind];
    if (current?.s3_key || current?.file_url || current?.download_url || current?.id) continue;
    const row = leftovers.shift();
    if (!row) break;
    const meta = metaFromRow(kind, row);
    if (meta.id) usedIds.add(meta.id);
    byKind[kind] = preferMeta(current, meta);
  }

  return { kinds, byKind };
}

/** Pull file meta from a booking-form / compliance upload API response when present. */
export function extractUploadResponseMeta(
  kind: string,
  response: unknown,
  fallbackFileName?: string,
): BookingFormDocumentMeta {
  const root = asRecord(response);
  const data = asRecord(root?.data) ?? root;
  const nested =
    asRecord(data?.document) ??
    asRecord(data?.file) ??
    asRecord(data?.uploaded_document) ??
    data;
  const base: BookingFormDocumentMeta = {
    kind,
    file_name: fallbackFileName,
  };
  if (!nested) return base;
  // 201 body: { id, document_type, file_url, s3_key, kind, form, job_document_id? }
  const fromBody = metaFromRow(kind as ModeBookingFormDocumentKind, {
    ...nested,
    kind: nested.kind ?? kind,
    job_document_id:
      nested.job_document_id ?? nested.jobDocumentId ?? nested.id ?? data?.job_document_id,
    id: nested.job_document_id ?? nested.jobDocumentId ?? nested.id,
  });
  return preferMeta(base, { ...fromBody, attached: true, missing: false });
}

/** Flat customer/staff document row for admin checklist — never drop API rows. */
export type BookingDocumentListItem = BookingFormDocumentMeta & {
  document_type?: string;
  uploader_side?: string;
};

/**
 * Normalize GET /jobs/:id/documents (and similar) into downloadable rows.
 * Preserves every file the API returns — kind matching is best-effort only.
 */
export function listBookingDocumentsFromJobDocs(docs: unknown[]): BookingDocumentListItem[] {
  const out: BookingDocumentListItem[] = [];
  const seen = new Set<string>();
  for (const item of docs) {
    const row = asRecord(item);
    if (!row || !rowHasFile(row)) continue;
    const kind = matchKindFromRow(row) ?? 'other';
    const meta = metaFromRow(kind as ModeBookingFormDocumentKind, row);
    const key = meta.id || `${meta.file_name || ''}|${meta.s3_key || ''}|${meta.file_url || ''}`;
    if (key && seen.has(key)) continue;
    if (key) seen.add(key);
    out.push({
      ...meta,
      kind: kind === 'other' ? (pickString(row.document_type, row.documentType, row.kind) || 'other') : kind,
      document_type: pickString(row.document_type, row.documentType, row.kind),
      uploader_side: pickString(row.uploader_side, row.uploaderSide, row.side),
    });
  }
  return out;
}
