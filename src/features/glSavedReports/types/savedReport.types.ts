import type { SavedReportType } from '../constants/savedReport.constants';
import type {
  CreateSavedReportFormValues,
  UpdateSavedReportFormValues,
} from '../schemas/savedReport.schema';

export type { CreateSavedReportFormValues, UpdateSavedReportFormValues };

export interface SavedReport {
  id: string;
  name: string;
  report_type: SavedReportType;
  description?: string;
  filters?: Record<string, unknown>;
  company_id?: string;
  is_shared?: boolean;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
}

export type CreateSavedReportDto = CreateSavedReportFormValues;
export type UpdateSavedReportDto = UpdateSavedReportFormValues;

export interface SavedReportListParams {
  report_type?: SavedReportType;
  shared_only?: boolean;
}
