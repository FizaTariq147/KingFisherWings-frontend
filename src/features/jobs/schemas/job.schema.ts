import { z } from 'zod';
import {
  amountField,
  integerField,
  optionalTextUndef,
  optionalUuid,
  requiredText,
} from '@/lib/validation';
import { JOB_TYPES } from '../constants/job.constants';

const jobTypeSchema = z.enum(JOB_TYPES);

export const createJobSchema = z.object({
  job_type: jobTypeSchema,
  shipper_id: z.string().uuid('Select a valid shipper'),
  company_id: optionalUuid(),
  branch_id: optionalUuid(),
  department_id: optionalUuid(),
  parent_job_id: optionalUuid(),
  consignee_id: optionalUuid(),
  agent_id: optionalUuid(),
  salesperson_id: optionalUuid(),
  ops_user_id: optionalUuid(),
  origin_port_id: optionalUuid(),
  dest_port_id: optionalUuid(),
  commodity: optionalTextUndef({ max: 500 }),
  hs_code: optionalTextUndef({ max: 20 }),
  gross_weight: amountField({ required: false, min: 0, allowNegative: false, maxDecimals: 3 }),
  chargeable_weight: amountField({ required: false, min: 0, allowNegative: false, maxDecimals: 3 }),
  volume_cbm: amountField({ required: false, min: 0, allowNegative: false, maxDecimals: 3 }),
  pieces: integerField({ required: false, min: 0, allowNegative: false }),
  container_type_id: optionalUuid(),
  container_count: integerField({ required: false, min: 0, allowNegative: false }),
  incoterms: optionalTextUndef({ max: 10 }),
  is_dg: z.boolean().optional(),
  dg_class: optionalTextUndef({ max: 50 }),
  notes: optionalTextUndef({ max: 2000 }),
  customer_remarks: optionalTextUndef({ max: 2000 }),
  tags: z.array(z.string()).optional(),
  etd: optionalTextUndef({ max: 32 }),
  eta: optionalTextUndef({ max: 32 }),
});

export const updateJobSchema = createJobSchema.partial();

export const createJobChargeSchema = z.object({
  charge_code_id: z.string().uuid('Select a charge code'),
  description: requiredText({ min: 1, max: 500 }),
  unit_price: amountField({ required: true, min: 0, allowNegative: false, maxDecimals: 4 }),
  currency_code: z.string().length(3, 'Use a 3-letter currency code'),
  quantity: amountField({ required: false, min: 0, allowNegative: false, maxDecimals: 4 }),
  exchange_rate: amountField({ required: false, min: 0, allowNegative: false, maxDecimals: 6 }),
  tax_rate_id: optionalUuid(),
  is_cost: z.boolean().optional(),
  is_billable: z.boolean().optional(),
  party_id: optionalUuid(),
});

export const updateJobChargeSchema = createJobChargeSchema.partial();

export const createJobNoteSchema = z.object({
  note: requiredText({ min: 1, max: 5000 }),
});

export const updateJobNoteSchema = createJobNoteSchema.partial();

export const createJobMilestoneSchema = z.object({
  milestone: requiredText({ min: 1, max: 100 }),
  planned_date: optionalTextUndef({ max: 32 }),
});

export const updateJobMilestoneSchema = z.object({
  actual_date: optionalTextUndef({ max: 32 }),
  planned_date: optionalTextUndef({ max: 32 }),
});

export const sendPreAlertSchema = z.object({
  to_email: z.string().email('Enter a valid email'),
  message: optionalTextUndef({ max: 500 }),
});

export type CreateJobFormValues = z.infer<typeof createJobSchema>;
export type UpdateJobFormValues = z.infer<typeof updateJobSchema>;
export type CreateJobChargeFormValues = z.infer<typeof createJobChargeSchema>;
export type CreateJobNoteFormValues = z.infer<typeof createJobNoteSchema>;
