import { organizationService } from '../services/organization.service';
import type { NumberFormat, NumberFormatFormValues } from '../types/organization.types';

const JOB_NUMBER_TYPE = 'JOB_NUMBER';

const DEFAULT_JOB_NUMBER_FORMAT: NumberFormatFormValues = {
  document_type: JOB_NUMBER_TYPE,
  prefix: 'JOB',
  include_branch_code: false,
  include_year: true,
  year_digits: 2,
  include_month: false,
  sequence_length: 5,
  separator: '/',
  reset_frequency: 'YEARLY',
  is_active: true,
};

function normalizeDocTypeKey(value: string | null | undefined): string {
  return String(value ?? '')
    .trim()
    .toUpperCase()
    .replace(/[\s-]+/g, '_');
}

/** Match JOB_NUMBER even if BE stored aliases / display labels. */
function isJobNumberDocumentType(value: string | null | undefined): boolean {
  const key = normalizeDocTypeKey(value);
  return (
    key === 'JOB_NUMBER' ||
    key === 'JOBNUMBER' ||
    key === 'JOB' ||
    key === 'JOB_NO' ||
    key === 'JOBNO'
  );
}

function findJobNumberInList(formats: NumberFormat[]): NumberFormat | null {
  return formats.find((f) => isJobNumberDocumentType(f.document_type)) ?? null;
}

async function resolveJobNumberFormat(): Promise<NumberFormat> {
  try {
    return await organizationService.getNumberFormat(JOB_NUMBER_TYPE);
  } catch {
    // GET-by-type can 404 even when the row exists in the list (tenant quirks / aliases).
    const listed = await organizationService.listNumberFormats().catch(() => [] as NumberFormat[]);
    const fromList = findJobNumberInList(listed);
    if (fromList) return fromList;
    throw new Error('NOT_FOUND');
  }
}

/**
 * Ensure JOB_NUMBER is active and safe for job create / quotation convert.
 * Auto-creates a default format when missing, and turns OFF include_branch_code
 * (a common cause of opaque 500s when branch_id is not on the quotation/job).
 */
export async function ensureJobNumberFormatReady(): Promise<void> {
  let format: NumberFormat;
  try {
    format = await resolveJobNumberFormat();
  } catch {
    try {
      await organizationService.createNumberFormat(DEFAULT_JOB_NUMBER_FORMAT);
      return;
    } catch (createErr) {
      // Create often fails with conflict when the format already exists under list
      // but GET-by-type failed — re-check list before blaming "missing".
      const listed = await organizationService.listNumberFormats().catch(() => [] as NumberFormat[]);
      const existing = findJobNumberInList(listed);
      if (existing) {
        format = existing;
      } else {
        const detail =
          createErr instanceof Error && createErr.message.trim()
            ? ` (${createErr.message.trim()})`
            : '';
        throw new Error(
          `JOB_NUMBER format is missing or could not be created${detail}. ` +
            'Go to Organization → Number Formats, add document type JOB_NUMBER (shown as “Job Number”, prefix JOB, active), then retry.',
        );
      }
    }
  }

  const typeKey = String(format.document_type || JOB_NUMBER_TYPE).trim() || JOB_NUMBER_TYPE;
  const patches: Partial<NumberFormatFormValues> = {};
  if (!format.is_active) patches.is_active = true;
  if (format.include_branch_code) patches.include_branch_code = false;

  if (Object.keys(patches).length > 0) {
    try {
      await organizationService.updateNumberFormat(typeKey, patches);
    } catch {
      if (format.include_branch_code) {
        throw new Error(
          'JOB_NUMBER has “Include branch code” enabled, which often breaks job create. Turn it OFF under Organization → Number Formats → Job Number, then retry.',
        );
      }
      if (!format.is_active) {
        throw new Error(
          'JOB_NUMBER format exists but is inactive. Enable it under Organization → Number Formats, then retry.',
        );
      }
    }
  }

  // Warm up numbering on the server (some tenants need preview before first allocate).
  try {
    await organizationService.previewNumberFormat(typeKey);
  } catch {
    /* optional — Preview column may stay “—” until first successful allocate */
  }
}
