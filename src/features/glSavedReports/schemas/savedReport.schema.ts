import { z } from 'zod';
import {
  emptyToUndefined,
  optionalTextUndef,
  optionalUuid,
  requiredText,
} from '@/lib/validation';
import { SAVED_REPORT_TYPES } from '../constants/savedReport.constants';

/** Swagger `CreateSavedReportDto`. */
export const createSavedReportSchema = z.object({
  name: requiredText({ min: 1, max: 200 }),
  report_type: z.enum(SAVED_REPORT_TYPES),
  description: optionalTextUndef({ max: 2000 }),
  filters: z.record(z.string(), z.unknown()).optional(),
  company_id: optionalUuid(),
  is_shared: z.boolean().optional(),
});

/** Swagger `UpdateSavedReportDto`. */
export const updateSavedReportSchema = z.object({
  name: z.preprocess(
    emptyToUndefined,
    z.string().trim().min(1).max(200).optional(),
  ),
  report_type: z.preprocess(emptyToUndefined, z.enum(SAVED_REPORT_TYPES).optional()),
  description: optionalTextUndef({ max: 2000 }),
  filters: z.record(z.string(), z.unknown()).optional(),
  company_id: optionalUuid(),
  is_shared: z.boolean().optional(),
});

export type CreateSavedReportFormValues = z.infer<typeof createSavedReportSchema>;
export type UpdateSavedReportFormValues = z.infer<typeof updateSavedReportSchema>;
