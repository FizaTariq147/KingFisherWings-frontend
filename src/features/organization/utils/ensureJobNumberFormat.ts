import {
  isTenantUserManagerRole,
  resolveAuthRoleSlug,
} from '@/features/users/constants/userPermissions';
import { useAuthStore } from '@/store/authStore';
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

function canManageNumberFormats(): boolean {
  const user = useAuthStore.getState().user;
  if (!user?.role) return false;
  return isTenantUserManagerRole(resolveAuthRoleSlug(user.role));
}

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
 *
 * Staff (non–Tenant Admin) skip entirely — they cannot create/update formats
 * (BE requires TENANT_ADMIN) and must not be blocked when the format already exists.
 * Tenant Admin may auto-create / patch include_branch_code.
 * Never throws.
 */
export async function ensureJobNumberFormatReady(): Promise<void> {
  // Staff portal / ops users: do not call number-format APIs at all.
  if (!canManageNumberFormats()) return;

  try {
    let format = await resolveJobNumberFormat();

    if (!format) {
      try {
        await organizationService.createNumberFormat(DEFAULT_JOB_NUMBER_FORMAT);
      } catch {
        /* ignore — job create will still run */
      }
      return;
    }

    const typeKey = String(format.document_type || JOB_NUMBER_TYPE).trim() || JOB_NUMBER_TYPE;
    const patches: Partial<NumberFormatFormValues> = {};
    if (!format.is_active) patches.is_active = true;
    if (format.include_branch_code) patches.include_branch_code = false;

    if (Object.keys(patches).length > 0) {
      try {
        await organizationService.updateNumberFormat(typeKey, patches);
      } catch {
        /* ignore */
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
