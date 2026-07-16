import type { CreateSavedReportFormValues } from '../types/savedReport.types';
import type { SavedReport } from '../types/savedReport.types';

export const SAVED_REPORT_FORM_DEFAULTS: CreateSavedReportFormValues = {
  name: '',
  report_type: 'PROFIT_AND_LOSS',
  description: undefined,
  filters: undefined,
  company_id: undefined,
  is_shared: false,
};

export function savedReportToFormValues(
  report: Partial<SavedReport>,
): CreateSavedReportFormValues {
  return {
    ...SAVED_REPORT_FORM_DEFAULTS,
    name: report.name ?? '',
    report_type: report.report_type ?? 'PROFIT_AND_LOSS',
    description: report.description,
    filters: report.filters,
    company_id: report.company_id,
    is_shared: report.is_shared ?? false,
  };
}
