import { JOB_EDI_TYPES, type JobEdiSubmission, type JobEdiTypeOption } from '@/features/jobs/types/job.types';
import { openSafeHttpUrl } from '@/lib/safeHttpUrl';

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function unwrapList(raw: unknown): unknown[] {
  if (Array.isArray(raw)) return raw;
  const rec = asRecord(raw);
  if (!rec) return [];
  for (const key of [
    'items',
    'data',
    'results',
    'types',
    'edi_types',
    'submissions',
  ]) {
    const val = rec[key];
    if (Array.isArray(val)) return val;
    const nested = asRecord(val);
    if (nested) {
      for (const nk of ['items', 'data', 'results', 'types', 'submissions']) {
        if (Array.isArray(nested[nk])) return nested[nk] as unknown[];
      }
    }
  }
  return [];
}

export function normalizeEdiTypeOptions(raw: unknown): JobEdiTypeOption[] {
  const list = unwrapList(raw);
  const out: JobEdiTypeOption[] = [];
  const seen = new Set<string>();

  for (const row of list) {
    if (typeof row === 'string' && row.trim()) {
      const code = row.trim();
      if (seen.has(code)) continue;
      seen.add(code);
      out.push({ code, label: code.replaceAll('_', ' ') });
      continue;
    }
    const rec = asRecord(row);
    if (!rec) continue;
    const code = String(
      rec.edi_type ?? rec.code ?? rec.type ?? rec.value ?? rec.id ?? '',
    ).trim();
    if (!code || seen.has(code)) continue;
    seen.add(code);
    out.push({
      code,
      label:
        String(rec.label ?? rec.name ?? rec.description ?? code).trim() ||
        code.replaceAll('_', ' '),
      description:
        typeof rec.description === 'string' ? rec.description : undefined,
    });
  }

  if (!out.length) {
    return JOB_EDI_TYPES.map((code) => ({
      code,
      label: code.replaceAll('_', ' '),
    }));
  }
  return out;
}

export function normalizeEdiSubmissions(raw: unknown): JobEdiSubmission[] {
  return unwrapList(raw)
    .map((row) => {
      const rec = asRecord(row);
      if (!rec) return null;
      const id = String(rec.id ?? rec.submission_id ?? '').trim();
      if (!id) return null;
      return {
        id,
        edi_type: String(rec.edi_type ?? rec.type ?? rec.code ?? '').trim() || undefined,
        status: String(rec.status ?? '').trim() || undefined,
        file_name:
          String(rec.file_name ?? rec.fileName ?? rec.filename ?? '').trim() ||
          undefined,
        created_at:
          String(rec.created_at ?? rec.createdAt ?? rec.submitted_at ?? '').trim() ||
          undefined,
        raw: rec,
      } satisfies JobEdiSubmission;
    })
    .filter((x): x is JobEdiSubmission => Boolean(x));
}

/** Pull a usable download URL from EDI download-url responses. */
export function pickEdiDownloadUrl(raw: unknown): string | null {
  if (typeof raw === 'string' && /^https?:\/\//i.test(raw.trim())) {
    return raw.trim();
  }
  const rec = asRecord(raw);
  if (!rec) return null;
  for (const key of [
    'download_url',
    'downloadUrl',
    'url',
    'file_url',
    'fileUrl',
    'signed_url',
    'signedUrl',
    'href',
  ]) {
    const val = rec[key];
    if (typeof val === 'string' && val.trim()) return val.trim();
  }
  const nested = asRecord(rec.data);
  if (nested) return pickEdiDownloadUrl(nested);
  return null;
}

export function openEdiDownload(raw: unknown): void {
  const url = pickEdiDownloadUrl(raw);
  if (!url) throw new Error('No download URL returned for this EDI submission.');
  openSafeHttpUrl(url);
}
