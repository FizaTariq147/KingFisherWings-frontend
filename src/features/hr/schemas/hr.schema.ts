import { z } from 'zod';
import { isUuid } from '@/lib/isUuid';
import {
  amountField,
  dateString,
  optionalEmail,
  optionalTextUndef,
  optionalUuid,
  requiredName,
  requiredText,
} from '@/lib/validation';
import { emptyToUndefined } from '@/lib/validation';
import {
  CONTRACT_TYPES,
  DOCUMENT_TYPES,
  EMPLOYEE_STATUSES,
  EMPLOYMENT_TYPES,
  GENDERS,
  LEAVE_TYPES,
  LETTER_TYPES,
  MARITAL_STATUSES,
  SALARY_COMPONENT_CODES,
  STAFF_GRADES,
  TIMESHEET_STATUSES,
} from '../constants/hr.constants';

const optionalEnum = <T extends readonly [string, ...string[]]>(values: T) =>
  z.preprocess(
    (value) => (value === '' || value == null ? undefined : value),
    z.enum(values).optional(),
  );

const optionalPhoneLoose = z.preprocess(
  (value) => {
    if (value == null) return undefined;
    const trimmed = String(value).trim();
    return trimmed === '' ? undefined : trimmed;
  },
  z
    .string()
    .min(7, 'Enter a valid phone number')
    .max(20, 'Phone number is too long')
    .regex(/^\+?[\d\s().-]{7,20}$/, 'Use digits and optional +, spaces, or dashes')
    .optional(),
);

const optionalIban = z.preprocess(
  (value) => {
    if (value == null) return undefined;
    const trimmed = String(value).trim().replace(/\s+/g, '').toUpperCase();
    return trimmed === '' ? undefined : trimmed;
  },
  z
    .string()
    .regex(/^[A-Z]{2}\d{2}[A-Z0-9]{10,30}$/, 'Enter a valid IBAN (e.g. AE070331234567890123456)')
    .optional(),
);

const money = () => amountField({ required: false, min: 0, max: 10_000_000, maxDecimals: 2 });

const employeeFieldsSchema = z.object({
  first_name: requiredName({ min: 1, max: 100 }),
  last_name: requiredName({ min: 1, max: 100 }),
  joining_date: dateString({ required: true }),
  company_id: optionalUuid(),
  date_of_birth: dateString({ required: false }),
  nationality: optionalTextUndef({ max: 80 }),
  gender: optionalEnum(GENDERS),
  marital_status: optionalEnum(MARITAL_STATUSES),
  photo_url: optionalTextUndef({ max: 500 }),
  mobile: optionalPhoneLoose,
  email: optionalEmail(),
  emergency_name: optionalTextUndef({ max: 120 }),
  emergency_phone: optionalPhoneLoose,
  exit_date: dateString({ required: false }),
  department_id: optionalUuid(),
  designation_id: optionalUuid(),
  branch_id: optionalUuid(),
  employment_type: optionalEnum(EMPLOYMENT_TYPES),
  status: optionalEnum(EMPLOYEE_STATUSES),
  staff_grade: optionalEnum(STAFF_GRADES),
  reporting_manager_id: optionalUuid(),
  department_head_id: optionalUuid(),
  skip_level_id: optionalUuid(),
  basic_salary: money(),
  housing_allowance: money(),
  transport_allowance: money(),
  mobile_allowance: money(),
  overtime_rate: money(),
  other_allowance: money(),
  social_security_amount: money(),
  mol_employee_id: optionalTextUndef({ max: 50 }),
  iban: optionalIban,
  bank_routing_code: optionalTextUndef({ max: 50 }),
  bank_name: optionalTextUndef({ max: 120 }),
  contract_type: optionalEnum(CONTRACT_TYPES),
  contract_start: dateString({ required: false }),
  contract_end: dateString({ required: false }),
  notice_period_days: amountField({
    required: false,
    min: 0,
    max: 365,
    maxDecimals: 0,
  }),
  probation_end: dateString({ required: false }),
});

function refineEmployeeDates(
  value: {
    date_of_birth?: string;
    joining_date?: string;
    contract_start?: string;
    contract_end?: string;
    exit_date?: string;
  },
  ctx: z.RefinementCtx,
) {
  if (value.date_of_birth && value.joining_date) {
    const birth = Date.parse(value.date_of_birth);
    const join = Date.parse(value.joining_date);
    if (!Number.isNaN(birth) && !Number.isNaN(join) && birth >= join) {
      ctx.addIssue({
        code: 'custom',
        path: ['date_of_birth'],
        message: 'Date of birth must be before joining date',
      });
    }
  }
  if (value.contract_start && value.contract_end) {
    const start = Date.parse(value.contract_start);
    const end = Date.parse(value.contract_end);
    if (!Number.isNaN(start) && !Number.isNaN(end) && end < start) {
      ctx.addIssue({
        code: 'custom',
        path: ['contract_end'],
        message: 'Contract end must be on or after contract start',
      });
    }
  }
  if (value.exit_date && value.joining_date) {
    const exit = Date.parse(value.exit_date);
    const join = Date.parse(value.joining_date);
    if (!Number.isNaN(exit) && !Number.isNaN(join) && exit < join) {
      ctx.addIssue({
        code: 'custom',
        path: ['exit_date'],
        message: 'Exit date cannot be before joining date',
      });
    }
  }
}

export const createEmployeeSchema = employeeFieldsSchema.superRefine(refineEmployeeDates);

export const updateEmployeeSchema = employeeFieldsSchema
  .partial()
  .extend({
    first_name: requiredName({ min: 1, max: 100 }).optional(),
    last_name: requiredName({ min: 1, max: 100 }).optional(),
    joining_date: dateString({ required: false }),
  })
  .superRefine(refineEmployeeDates);

export const leaveRequestSchema = z
  .object({
    employee_id: z.preprocess(
      emptyToUndefined,
      z
        .string({ error: 'Select an employee' })
        .refine((value) => isUuid(value), 'Select an employee'),
    ),
    leave_type: z.enum(LEAVE_TYPES, { error: 'Select a leave type' }),
    start_date: dateString({ required: true }),
    end_date: dateString({ required: true }),
    reason: optionalTextUndef({ max: 500 }),
    attachment_path: optionalTextUndef({ max: 500 }),
  })
  .superRefine((value, ctx) => {
    if (value.start_date && value.end_date) {
      const start = Date.parse(value.start_date);
      const end = Date.parse(value.end_date);
      if (!Number.isNaN(start) && !Number.isNaN(end) && end < start) {
        ctx.addIssue({
          code: 'custom',
          path: ['end_date'],
          message: 'End date must be on or after start date',
        });
      }
    }
  });

export const createDocumentSchema = z
  .object({
    document_type: z.enum(DOCUMENT_TYPES, { error: 'Select a document type' }),
    document_no: optionalTextUndef({ max: 80 }),
    issued_at: dateString({ required: false }),
    expires_at: dateString({ required: false }),
    file_path: optionalTextUndef({ max: 500 }),
  })
  .superRefine((value, ctx) => {
    if (value.issued_at && value.expires_at) {
      const issued = Date.parse(value.issued_at);
      const expires = Date.parse(value.expires_at);
      if (!Number.isNaN(issued) && !Number.isNaN(expires) && expires < issued) {
        ctx.addIssue({
          code: 'custom',
          path: ['expires_at'],
          message: 'Expiry must be on or after issue date',
        });
      }
    }
  });

export const salaryComponentSchema = z.object({
  code: z.enum(SALARY_COMPONENT_CODES, { error: 'Select a component code' }),
  name: requiredText({ min: 1, max: 100 }),
  is_earning: z.boolean().default(true),
  sort_order: amountField({ required: false, min: 0, max: 10_000, maxDecimals: 0 }).optional(),
});

export const createPayrollRunSchema = z.object({
  payroll_year: z
    .number({ error: 'Enter a valid year' })
    .int('Year must be a whole number')
    .min(2000, 'Year must be 2000 or later')
    .max(2100, 'Year must be 2100 or earlier'),
  payroll_month: z
    .number({ error: 'Enter a valid month' })
    .int('Month must be a whole number')
    .min(1, 'Month must be between 1 and 12')
    .max(12, 'Month must be between 1 and 12'),
  company_id: optionalUuid(),
  currency_code: z
    .string()
    .trim()
    .toUpperCase()
    .length(3, 'Currency must be a 3-letter code')
    .default('AED'),
});

export const payrollGlSettingSchema = z.object({
  company_id: z.preprocess(
    emptyToUndefined,
    z.string({ error: 'Company is required' }).refine((value) => isUuid(value), 'Select a valid company'),
  ),
  salary_expense_account_id: z.preprocess(
    emptyToUndefined,
    z
      .string({ error: 'Salary expense account is required' })
      .refine((value) => isUuid(value), 'Select a valid account'),
  ),
  payroll_payable_account_id: z.preprocess(
    emptyToUndefined,
    z
      .string({ error: 'Payroll payable account is required' })
      .refine((value) => isUuid(value), 'Select a valid account'),
  ),
  deduction_account_id: z.preprocess(
    emptyToUndefined,
    z
      .string({ error: 'Deduction account is required' })
      .refine((value) => isUuid(value), 'Select a valid account'),
  ),
  bonus_percent_per_score_point: amountField({ required: false, min: 0, max: 100, maxDecimals: 4 }).optional(),
});

export const payslipEmailSchema = z.object({
  subject: optionalTextUndef({ max: 200 }),
  body: optionalTextUndef({ max: 5000 }),
});

export const createTimesheetSchema = z.object({
  employee_id: z.preprocess(
    emptyToUndefined,
    z.string({ error: 'Select an employee' }).refine((value) => isUuid(value), 'Select an employee'),
  ),
  work_date: dateString({ required: true }),
  hours: amountField({ required: true, min: 0, max: 24, maxDecimals: 2 }),
  overtime_hours: amountField({ required: false, min: 0, max: 24, maxDecimals: 2 }).optional(),
  notes: optionalTextUndef({ max: 500 }),
  status: z.enum(TIMESHEET_STATUSES).optional(),
});

export const createLoanSchema = z.object({
  employee_id: z.preprocess(
    emptyToUndefined,
    z.string({ error: 'Select an employee' }).refine((value) => isUuid(value), 'Select an employee'),
  ),
  principal: amountField({ required: true, min: 1, max: 10_000_000, maxDecimals: 2 }),
  interest_rate: amountField({ required: false, min: 0, max: 100, maxDecimals: 2 }).optional(),
  tenure_months: amountField({ required: true, min: 1, max: 360, maxDecimals: 0 }),
  purpose: optionalTextUndef({ max: 300 }),
});

export const createAdvanceSchema = z.object({
  employee_id: z.preprocess(
    emptyToUndefined,
    z.string({ error: 'Select an employee' }).refine((value) => isUuid(value), 'Select an employee'),
  ),
  amount: amountField({ required: true, min: 1, max: 10_000_000, maxDecimals: 2 }),
  reason: optionalTextUndef({ max: 300 }),
});

export const leavePolicySchema = z.object({
  leave_type: z.enum(LEAVE_TYPES, { error: 'Select a leave type' }),
  staff_grade: z.enum(STAFF_GRADES, { error: 'Select a staff grade' }),
  entitlement_days: amountField({ required: true, min: 0, max: 365, maxDecimals: 0 }),
  carry_forward_max: amountField({ required: false, min: 0, max: 365, maxDecimals: 0 }).optional(),
  encashment_allowed: z.boolean().optional(),
});

export const generateLetterSchema = z.object({
  employee_id: z.preprocess(
    emptyToUndefined,
    z.string({ error: 'Select an employee' }).refine((value) => isUuid(value), 'Select an employee'),
  ),
  letter_type: z.enum(LETTER_TYPES, { error: 'Select a letter type' }),
});

export const createEvaluationSchema = z.object({
  cycle_id: z.preprocess(
    emptyToUndefined,
    z.string({ error: 'Select a cycle' }).refine((value) => isUuid(value), 'Select a cycle'),
  ),
  employee_id: z.preprocess(
    emptyToUndefined,
    z.string({ error: 'Select an employee' }).refine((value) => isUuid(value), 'Select an employee'),
  ),
});

export const evaluationCycleSchema = z
  .object({
    template_id: z.preprocess(
      emptyToUndefined,
      z.string({ error: 'Select a template' }).refine((value) => isUuid(value), 'Select a template'),
    ),
    name: requiredText({ min: 1, max: 200 }),
    year: amountField({ required: true, min: 2000, max: 2100, maxDecimals: 0 }),
    start_date: dateString({ required: true }),
    end_date: dateString({ required: true }),
  })
  .superRefine((value, ctx) => {
    if (value.start_date && value.end_date) {
      const start = Date.parse(value.start_date);
      const end = Date.parse(value.end_date);
      if (!Number.isNaN(start) && !Number.isNaN(end) && end < start) {
        ctx.addIssue({
          code: 'custom',
          path: ['end_date'],
          message: 'End date must be on or after start date',
        });
      }
    }
  });

export const evaluationTemplateSchema = z.object({
  name: requiredText({ min: 1, max: 200 }),
  kpisJson: requiredText({ min: 2, max: 10_000 }),
});

export type CreateEmployeeFormValues = z.infer<typeof createEmployeeSchema>;
export type LeaveRequestFormValues = z.infer<typeof leaveRequestSchema>;
export type CreateDocumentFormValues = z.infer<typeof createDocumentSchema>;
export type SalaryComponentFormValues = z.infer<typeof salaryComponentSchema>;
export type CreatePayrollRunFormValues = z.infer<typeof createPayrollRunSchema>;
export type PayrollGlSettingFormValues = z.infer<typeof payrollGlSettingSchema>;
export type PayslipEmailFormValues = z.infer<typeof payslipEmailSchema>;
export type CreateTimesheetFormValues = z.infer<typeof createTimesheetSchema>;
export type CreateLoanFormValues = z.infer<typeof createLoanSchema>;
export type CreateAdvanceFormValues = z.infer<typeof createAdvanceSchema>;
export type LeavePolicyFormValues = z.infer<typeof leavePolicySchema>;
export type GenerateLetterFormValues = z.infer<typeof generateLetterSchema>;
export type CreateEvaluationFormValues = z.infer<typeof createEvaluationSchema>;
export type EvaluationCycleFormValues = z.infer<typeof evaluationCycleSchema>;
export type EvaluationTemplateFormValues = z.infer<typeof evaluationTemplateSchema>;

export type FieldErrors = Record<string, string>;

/** Flatten Zod issues into a field → message map (first error per field). */
export function zodFieldErrors(error: z.ZodError): FieldErrors {
  const out: FieldErrors = {};
  for (const issue of error.issues) {
    const key = issue.path.join('.') || '_form';
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}

export function parseWithFieldErrors<T>(
  schema: z.ZodType<T>,
  data: unknown,
): { success: true; data: T } | { success: false; fieldErrors: FieldErrors; message: string } {
  const result = schema.safeParse(data);
  if (result.success) return { success: true, data: result.data };
  const fieldErrors = zodFieldErrors(result.error);
  const message =
    Object.values(fieldErrors)[0] ?? 'Please correct the highlighted fields.';
  return { success: false, fieldErrors, message };
}
