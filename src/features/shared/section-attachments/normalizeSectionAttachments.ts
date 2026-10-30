import type {
  SectionAttachment,
  SectionAttachmentsListResult,
} from './sectionAttachment.types';

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function unwrapList(raw: unknown): unknown[] {
  if (Array.isArray(raw)) return raw;
  const rec = asRecord(raw);
  if (!rec) return [];
  for (const key of ['attachments', 'items', 'data', 'results', 'documents']) {
    const val = rec[key];
    if (Array.isArray(val)) return val;
    const nested = asRecord(val);
    if (nested) {
      for (const nk of ['attachments', 'items', 'data', 'results']) {
        if (Array.isArray(nested[nk])) return nested[nk] as unknown[];
      }
    }
  }
  return [];
}

function flag(rec: Record<string, unknown>, ...keys: string[]): boolean | undefined {
  for (const key of keys) {
    const v = rec[key];
    if (typeof v === 'boolean') return v;
  }
  return undefined;
}

export function normalizeSectionAttachment(raw: unknown): SectionAttachment | null {
  const rec = asRecord(raw);
  if (!rec) return null;
  const id = String(rec.id ?? rec.document_id ?? rec.attachment_id ?? '').trim();
  if (!id) return null;
  return {
    id,
    file_name:
      String(rec.file_name ?? rec.fileName ?? rec.filename ?? rec.name ?? '').trim() ||
      undefined,
    mime_type:
      String(rec.mime_type ?? rec.mimeType ?? rec.content_type ?? '').trim() || undefined,
    size_bytes: Number.isFinite(Number(rec.size_bytes ?? rec.sizeBytes ?? rec.size))
      ? Number(rec.size_bytes ?? rec.sizeBytes ?? rec.size)
      : undefined,
    record_id:
      String(rec.record_id ?? rec.recordId ?? '').trim() || undefined,
    visible_to_customer: flag(
      rec,
      'visible_to_customer',
      'visibleToCustomer',
    ),
    visible_to_vendor: flag(rec, 'visible_to_vendor', 'visibleToVendor'),
    downloadable_by_customer: flag(
      rec,
      'downloadable_by_customer',
      'downloadableByCustomer',
      'can_download',
      'canDownload',
    ),
    downloadable_by_vendor: flag(
      rec,
      'downloadable_by_vendor',
      'downloadableByVendor',
    ),
    created_at:
      String(rec.created_at ?? rec.createdAt ?? '').trim() || undefined,
    raw: rec,
  };
}

export function normalizeSectionAttachmentsList(
  raw: unknown,
): SectionAttachmentsListResult {
  const rec = asRecord(raw);
  const items = unwrapList(raw)
    .map(normalizeSectionAttachment)
    .filter((x): x is SectionAttachment => Boolean(x));

  const actions = asRecord(rec?.actions);
  const pathHints = asRecord(rec?.path_hints) ?? asRecord(rec?.pathHints);
  const canUpload =
    flag(rec ?? {}, 'can_upload', 'canUpload') === true ||
    flag(actions ?? {}, 'can_upload', 'canUpload') === true ||
    flag(pathHints ?? {}, 'upload') === true ||
    // Default allow upload when API omits the flag (backend may gate later).
    (flag(rec ?? {}, 'can_upload', 'canUpload') !== false &&
      flag(actions ?? {}, 'can_upload', 'canUpload') !== false);

  return { items, can_upload: canUpload };
}

/** Pull attachments nested on a section list row (e.g. deposit.attachments). */
export function pickRowAttachments(row: unknown): SectionAttachment[] {
  const rec = asRecord(row);
  if (!rec) return [];
  const list = rec.attachments ?? rec.documents;
  if (!Array.isArray(list)) return [];
  return list
    .map(normalizeSectionAttachment)
    .filter((x): x is SectionAttachment => Boolean(x));
}
