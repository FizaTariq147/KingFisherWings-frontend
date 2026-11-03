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

async function resolveJobNumberFormat(): Promise<NumberFormat | null> {
  try {
    return await organizationService.getNumberFormat(JOB_NUMBER_TYPE);
  } catch {
    try {
      const listed = await organizationService.listNumberFormats();
      return findJobNumberInList(listed);
    } catch {
      return null;
    }
  }
}

/**
 * Best-effort JOB_NUMBER housekeeping before job create / quote convert.
 * Never throws — staff without TENANT_ADMIN must still be able to create jobs
 * when the tenant format already exists.
 */
export async function ensureJobNumberFormatReady(): Promise<void> {
  try {
    let format = await resolveJobNumberFormat();

    if (!format) {
      try {
        await organizationService.createNumberFormat(DEFAULT_JOB_NUMBER_FORMAT);
        return;
      } catch {
        // Common for staff: create requires TENANT_ADMIN. Format usually already exists.
        return;
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
        /* staff cannot patch — continue */
      }
    }

    try {
      await organizationService.previewNumberFormat(typeKey);
    } catch {
      /* optional */
    }
  } catch {
    /* never block create/convert */
  }
}
