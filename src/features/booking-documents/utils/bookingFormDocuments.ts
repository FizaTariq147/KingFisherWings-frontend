import type { ModeBookingFormDocumentKind } from '../constants/bookingDocumentKinds';
import { MODE_BOOKING_FORM_DOCUMENT_KINDS } from '../constants/bookingDocumentKinds';

export type BookingFormDocumentMeta = {
  kind: string;
  file_name?: string;
  file_url?: string;
  download_url?: string;
  s3_key?: string;
  id?: string;
};

const ATTACH_TO_KIND: Record<string, ModeBookingFormDocumentKind> = {
  attach_commercial_invoice: 'commercial_invoice',
  attach_packing_list: 'packing_list',
  attach_bl_awb_copy: 'bill_of_lading',
  attach_licence: 'licence',
  attach_permit: 'licence',
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

/** Map job document_type / kind aliases onto booking-form kinds. */
function matchBookingKind(raw: unknown): ModeBookingFormDocumentKind | null {
  const kind = normalizeKind(raw);
  if (!kind) return null;
  for (const known of MODE_BOOKING_FORM_DOCUMENT_KINDS) {
    if (kind === known || kind.includes(known) || known.includes(kind)) return known;
  }
  if (kind.includes('commercial') && kind.includes('invoice')) return 'commercial_invoice';
  if (kind.includes('packing')) return 'packing_list';
  if (kind.includes('bill_of_lading') || kind.includes('bl_awb') || kind === 'awb') {
    return 'bill_of_lading';
  }
  if (kind.includes('licence') || kind.includes('license')) return 'licence';
  if (kind.includes('uat') || kind.includes('tax_certificate')) return 'uat_tax_certificate';
  return null;
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

  const buckets = [
    form.documents,
    form.uploaded_documents,
    form.uploadedDocuments,
    form.booking_documents,
    form.bookingDocuments,
  ];
  for (const bucket of buckets) {
    if (!Array.isArray(bucket)) continue;
    for (const item of bucket) {
      const row = asRecord(item);
      if (!row) continue;
      const kind =
        matchBookingKind(
          row.kind ?? row.document_kind ?? row.documentKind ?? row.document_type ?? row.documentType,
        ) ?? null;
      if (!kind) continue;
      kinds.add(kind);
      byKind[kind] = {
        kind,
        id: typeof row.id === 'string' ? row.id : undefined,
        file_name:
          typeof row.file_name === 'string'
            ? row.file_name
            : typeof row.fileName === 'string'
              ? row.fileName
              : undefined,
        file_url:
          typeof row.file_url === 'string'
            ? row.file_url
            : typeof row.fileUrl === 'string'
              ? row.fileUrl
              : undefined,
        download_url:
          typeof row.download_url === 'string'
            ? row.download_url
            : typeof row.downloadUrl === 'string'
              ? row.downloadUrl
              : undefined,
        s3_key:
          typeof row.s3_key === 'string'
            ? row.s3_key
            : typeof row.s3Key === 'string'
              ? row.s3Key
              : undefined,
      };
    }
  }

  return { kinds, byKind };
}

/** Merge job `GET /jobs/:id/documents` rows that match booking kinds. */
export function mergeJobDocumentsIntoBooking(
  docs: unknown[],
  existing: Record<string, BookingFormDocumentMeta>,
): { kinds: Set<string>; byKind: Record<string, BookingFormDocumentMeta> } {
  const byKind = { ...existing };
  const kinds = new Set(Object.keys(byKind));
  for (const item of docs) {
    const row = asRecord(item);
    if (!row) continue;
    const kind = matchBookingKind(
      row.document_type ?? row.documentType ?? row.kind ?? row.document_kind,
    );
    if (!kind) continue;
    kinds.add(kind);
    if (byKind[kind]?.file_url || byKind[kind]?.download_url || byKind[kind]?.s3_key) continue;
    byKind[kind] = {
      kind,
      id: typeof row.id === 'string' ? row.id : undefined,
      file_name:
        typeof row.file_name === 'string'
          ? row.file_name
          : typeof row.fileName === 'string'
            ? row.fileName
            : undefined,
      file_url:
        typeof row.file_url === 'string'
          ? row.file_url
          : typeof row.fileUrl === 'string'
            ? row.fileUrl
            : undefined,
      download_url:
        typeof row.download_url === 'string'
          ? row.download_url
          : typeof row.downloadUrl === 'string'
            ? row.downloadUrl
            : undefined,
      s3_key:
        typeof row.s3_key === 'string'
          ? row.s3_key
          : typeof row.s3Key === 'string'
            ? row.s3Key
            : undefined,
    };
  }
  return { kinds, byKind };
}
