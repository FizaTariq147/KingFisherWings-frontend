import type {
  CONTRACT_TYPES,
  DOCUMENT_TYPES,
  EMPLOYEE_STATUSES,
  EMPLOYMENT_TYPES,
  GENDERS,
  LEAVE_STATUSES,
  LEAVE_TYPES,
  LETTER_TYPES,
  LOAN_STATUSES,
  MARITAL_STATUSES,
  SALARY_COMPONENT_CODES,
  STAFF_GRADES,
  TIMESHEET_STATUSES,
} from '../constants/hr.constants';

export type EmployeeStatus = (typeof EMPLOYEE_STATUSES)[number];
export type EmploymentType = (typeof EMPLOYMENT_TYPES)[number];
export type Gender = (typeof GENDERS)[number];
export type MaritalStatus = (typeof MARITAL_STATUSES)[number];
export type StaffGrade = (typeof STAFF_GRADES)[number];
export type ContractType = (typeof CONTRACT_TYPES)[number];
export type LeaveType = (typeof LEAVE_TYPES)[number];
export type LeaveStatus = (typeof LEAVE_STATUSES)[number];
export type HrDocumentType = (typeof DOCUMENT_TYPES)[number];
export type SalaryComponentCode = (typeof SALARY_COMPONENT_CODES)[number];

export interface HrOption {
  id: string;
  name: string;
}

export interface CreateEmployeeDto {
  first_name: string;
  last_name: string;
  joining_date: string;
  company_id?: string;
  date_of_birth?: string;
  nationality?: string;
  gender?: Gender;
  marital_status?: MaritalStatus;
  photo_url?: string;
  mobile?: string;
  email?: string;
  emergency_name?: string;
  emergency_phone?: string;
  exit_date?: string;
  department_id?: string;
  designation_id?: string;
  branch_id?: string;
  employment_type?: EmploymentType;
  status?: EmployeeStatus;
  staff_grade?: StaffGrade;
  reporting_manager_id?: string;
  department_head_id?: string;
  skip_level_id?: string;
  basic_salary?: number;
  housing_allowance?: number;
  transport_allowance?: number;
  mobile_allowance?: number;
  overtime_rate?: number;
  other_allowance?: number;
  social_security_amount?: number;
  mol_employee_id?: string;
  iban?: string;
  bank_routing_code?: string;
  bank_name?: string;
  contract_type?: ContractType;
  contract_start?: string;
  contract_end?: string;
  notice_period_days?: number;
  probation_end?: string;
}

export type UpdateEmployeeDto = Partial<CreateEmployeeDto>;

export interface EmployeeRecord extends CreateEmployeeDto {
  id: string;
  code?: string;
  branch_name?: string;
  department_name?: string;
  designation_name?: string;
  visa_expires_at?: string;
  passport_expires_at?: string;
}

export interface LeaveRequestDto {
  employee_id: string;
  leave_type: LeaveType;
  start_date: string;
  end_date: string;
  reason?: string;
  attachment_path?: string;
}

export interface LeaveRequestRecord {
  id: string;
  employee_id: string;
  employee: string;
  department: string;
  type: string;
  from: string;
  to: string;
  days: number;
  status: string;
  reason: string;
  appliedOn: string;
}

export interface LeaveReviewDto {
  status: LeaveStatus;
  review_notes?: string;
}

export interface HrDocumentRecord {
  id: string;
  document_type: string;
  document_no: string;
  issued_at: string;
  expires_at: string;
  file_path: string;
  status: string;
}

export interface DependentRecord {
  id: string;
  full_name: string;
  relation: string;
  date_of_birth: string;
  passport_no: string;
  visa_no: string;
}

export interface CreateDependentDto {
  full_name: string;
  relation: 'SPOUSE' | 'CHILD' | 'OTHER';
  date_of_birth?: string;
  passport_no?: string;
  passport_expires_at?: string;
  visa_no?: string;
  visa_expires_at?: string;
}

export interface EmploymentHistoryRecord {
  id: string;
  employer_name: string;
  job_title: string;
  start_date: string;
  end_date: string;
  remarks: string;
}

export interface CreateEmploymentHistoryDto {
  employer_name: string;
  job_title?: string;
  start_date?: string;
  end_date?: string;
  remarks?: string;
}

export interface QualificationRecord {
  id: string;
  title: string;
  institution: string;
  year_awarded: number | null;
}

export interface CreateQualificationDto {
  title: string;
  institution?: string;
  year_awarded?: number;
}

export interface SkillRecord {
  id: string;
  name: string;
  level: string;
}

export interface CreateSkillDto {
  name: string;
  level?: string;
}

export interface LinkUserDto {
  user_id: string;
}

export interface PayrollLineRecord {
  id?: string;
  employee_id: string;
  employee_name: string;
  gross_pay: number;
  net_pay: number;
}

export interface PayrollRunRecord {
  id: string;
  year: string;
  month: string;
  status: string;
  currency: string;
  company_id?: string;
  lines?: PayrollLineRecord[];
}

export interface PayrollGlSettingDto {
  company_id: string;
  salary_expense_account_id: string;
  payroll_payable_account_id: string;
  deduction_account_id: string;
  bonus_percent_per_score_point?: number;
}

export interface PayslipEmailDto {
  subject?: string;
  body?: string;
}

export interface SalaryComponentRecord {
  id: string;
  code: string;
  name: string;
  is_earning: boolean;
  sort_order: number;
}

export interface TimesheetRecord {
  id: string;
  employee_id: string;
  employee: string;
  work_date: string;
  hours: number;
  overtime_hours: number;
  status: string;
  notes: string;
}

export type TimesheetStatus = (typeof TIMESHEET_STATUSES)[number];
export type LoanStatus = (typeof LOAN_STATUSES)[number];
export type LetterType = (typeof LETTER_TYPES)[number];

export interface CreateTimesheetDto {
  employee_id: string;
  work_date: string;
  hours: number;
  overtime_hours?: number;
  job_id?: string;
  billable?: boolean;
  notes?: string;
  status?: TimesheetStatus;
}

export interface UpdateTimesheetDto {
  hours?: number;
  overtime_hours?: number;
  job_id?: string;
  billable?: boolean;
  notes?: string;
  status?: TimesheetStatus;
}

export interface CreateLoanDto {
  employee_id: string;
  principal: number;
  interest_rate?: number;
  tenure_months: number;
  purpose?: string;
}

export interface LoanRecord {
  id: string;
  employee_id: string;
  employee: string;
  principal: number;
  interest_rate: number;
  tenure_months: number;
  purpose: string;
  status: string;
  created_at: string;
}

export interface LoanReviewDto {
  status: LoanStatus;
  review_notes?: string;
}

export interface CreateAdvanceDto {
  employee_id: string;
  amount: number;
  reason?: string;
}

export interface AdvanceRecord {
  id: string;
  employee_id: string;
  employee: string;
  amount: number;
  reason: string;
  status: string;
  created_at: string;
}

export interface LeavePolicyRecord {
  id: string;
  leave_type: LeaveType;
  staff_grade: StaffGrade;
  entitlement_days: number;
  carry_forward_max: number;
  encashment_allowed: boolean;
}

export interface LeavePolicyDto {
  leave_type: LeaveType;
  staff_grade: StaffGrade;
  entitlement_days: number;
  carry_forward_max?: number;
  encashment_allowed?: boolean;
}

export interface EvaluationTemplateRecord {
  id: string;
  name: string;
  kpis: Record<string, unknown>[];
}

export interface EvaluationCycleRecord {
  id: string;
  template_id: string;
  template_name: string;
  name: string;
  year: number;
  start_date: string;
  end_date: string;
  status: string;
}

export interface CreateEvaluationCycleDto {
  template_id: string;
  name: string;
  year: number;
  start_date: string;
  end_date: string;
}

export interface EvaluationRecord {
  id: string;
  cycle_id: string;
  employee_id: string;
  employee: string;
  status: string;
  self_score?: number;
  manager_score?: number;
  self_submitted?: boolean;
  manager_submitted?: boolean;
}

export interface CreateEvaluationDto {
  cycle_id: string;
  employee_id: string;
}

export interface SubmitScoresDto {
  scores: Record<string, number>;
  comments?: string;
  promotion_recommended?: boolean;
}

export interface LetterRecord {
  id: string;
  employee_id: string;
  employee: string;
  letter_type: string;
  generated_at: string;
  status: string;
  pdf_url?: string;
  file_url?: string;
  file_path?: string;
}

export interface GenerateLetterDto {
  employee_id: string;
  letter_type: LetterType;
  payload?: Record<string, unknown>;
}

export interface LetterGenerateResult {
  letter: LetterRecord | null;
  pdfBlob?: Blob;
  pdfUrl?: string;
}

export interface LetterPdfInfo {
  pdf_url?: string;
  pdfBlob?: Blob;
  letter_id?: string;
  letter?: LetterRecord;
  status?: string;
}

export interface AttendanceRecord {
  id: string;
  employee_id: string;
  employee: string;
  work_date: string;
  clock_in: string;
  clock_out: string;
  hours: number;
}
