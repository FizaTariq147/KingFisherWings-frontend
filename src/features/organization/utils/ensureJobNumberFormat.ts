import { organizationService } from '../services/organization.service';
import type { NumberFormatFormValues } from '../types/organization.types';

const DEFAULT_JOB_NUMBER_FORMAT: NumberFormatFormValues = {
  document_type: 'JOB_NUMBER',
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

/**
 * Ensure JOB_NUMBER is active and safe for job create / quotation convert.
 * Auto-creates a default format when missing, and turns OFF include_branch_code
 * (a common cause of opaque 500s when branch_id is not on the quotation/job).
 */
export async function ensureJobNumberFormatReady(): Promise<void> {
  let format;
  try {
    format = await organizationService.getNumberFormat('JOB_NUMBER');
  } catch {
    try {
      await organizationService.createNumberFormat(DEFAULT_JOB_NUMBER_FORMAT);
      return;
    } catch {
      throw new Error(
        'JOB_NUMBER format is missing. Go to Organization → Number Formats, add document type JOB_NUMBER (prefix JOB, active), then retry.',
      );
    }
  }

  const patches: Partial<NumberFormatFormValues> = {};
  if (!format.is_active) patches.is_active = true;
  if (format.include_branch_code) patches.include_branch_code = false;

  if (Object.keys(patches).length === 0) return;

  try {
    await organizationService.updateNumberFormat('JOB_NUMBER', patches);
  } catch {
    if (format.include_branch_code) {
      throw new Error(
        'JOB_NUMBER has “Include branch code” enabled, which often breaks job create. Turn it OFF under Organization → Number Formats → Job Number, then retry convert.',
      );
    }
    if (!format.is_active) {
      throw new Error(
        'JOB_NUMBER format exists but is inactive. Enable it under Organization → Number Formats, then retry.',
      );
    }
  }

  // Warm up numbering on the server (some tenants need preview before first allocate).
  try {
    await organizationService.previewNumberFormat('JOB_NUMBER');
  } catch {
    /* optional */
  }
}
