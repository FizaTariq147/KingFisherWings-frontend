import { listAllRegisteredFormatCatalogEntries, type RegisteredFormatCatalogEntry } from '../data/resolveAnyFormatUiLayout';
import { reportsCatalogCodeVisible } from '../engine/invoiceV2Gate';
import { shouldExposeHawbInPrimaryCatalogue } from './officialFormatGovernance';
import { catalogFamiliesForJobType } from './moduleCatalogFamily';
import { reportFamilyAllowed } from './reportModuleAccess';

export type JobRelatedReport = RegisteredFormatCatalogEntry;

/**
 * Formats that belong on a job: context includes job, family matches the job type,
 * and the catalogue visibility rules still allow the code.
 */
export function filterJobRelatedReports(
  entries: readonly JobRelatedReport[],
  input: {
    jobType?: string | null;
    enabledModules?: readonly string[] | null;
    query?: string;
  } = {},
): JobRelatedReport[] {
  const families = new Set(catalogFamiliesForJobType(input.jobType));
  const q = (input.query || '').trim().toLowerCase();
  return entries
    .filter((entry) => {
      if (!(entry.contexts ?? []).includes('job')) return false;
      if (!families.has(entry.family)) return false;
      if (!reportFamilyAllowed(entry.family, input.enabledModules)) return false;
      if (!reportsCatalogCodeVisible({ code: entry.code })) return false;
      if (/^HAWB_/i.test(entry.code) && !shouldExposeHawbInPrimaryCatalogue(entry.code)) return false;
      if (!q) return true;
      return entry.code.toLowerCase().includes(q) || entry.name.toLowerCase().includes(q);
    })
    .slice()
    .sort((a, b) => a.family.localeCompare(b.family) || a.name.localeCompare(b.name));
}

export function listJobRelatedReports(input: {
  jobType?: string | null;
  enabledModules?: readonly string[] | null;
  query?: string;
} = {}): JobRelatedReport[] {
  return filterJobRelatedReports(listAllRegisteredFormatCatalogEntries(), input);
}
