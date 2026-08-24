import { axiosInstance } from '@/lib/axios';
import { filesService } from '@/features/files/services/files.service';
import { isStoredFileUrl, parseFilesApiUrl } from '@/features/files/utils/parseFilesApiUrl';
import { letterPdfBranding } from '@/features/files/utils/pdfBranding';
import { openBlobInNewTab, triggerBlobDownload, triggerBrandedPdfDownload } from '@/features/files/utils/triggerBlobDownload';
import { resolveSessionTenantIdFromAuth, companyIdFromAccessToken, resolveCompanyIdFromUserLike } from '@/lib/tenantFromAuth';
import { isUuid } from '@/lib/isUuid';
import { withGatewayRetry } from '@/lib/wakeApi';
import { useAuthStore } from '@/store/authStore';
import { fetchTenantCompanyOptions } from '@/features/users/hooks/useTenantCompanies';
import { MASTER_PATHS } from '@/features/masters/api/masterPaths';
import { masterService } from '@/features/masters/services/master.service';
import { HR_API } from '../api/hr.api';
import { LEAVE_STATUSES } from '../constants/hr.constants';
import type { EmployeeRow } from '../types/employee.types';
import { generateHrLetterPdfFallback } from '../utils/generateHrLetterPdfFallback';
import { letterPdfInfoFromGenerateResult, letterPdfReference } from '../utils/normalizeLetterPdf';
import type {
  AdvanceRecord,
  AttendanceRecord,
  CreateAdvanceDto,
  CreateDependentDto,
  CreateEmployeeDto,
  CreateEmploymentHistoryDto,
  CreateEvaluationCycleDto,
  CreateEvaluationDto,
  CreateLoanDto,
  CreateQualificationDto,
  CreateSkillDto,
  CreateTimesheetDto,
  DependentRecord,
  EmploymentHistoryRecord,
  LinkUserDto,
  QualificationRecord,
  SkillRecord,
  EvaluationCycleRecord,
  EvaluationRecord,
  EvaluationTemplateRecord,
  GenerateLetterDto,
  LetterGenerateResult,
  LetterPdfInfo,
  HrDocumentRecord,
  HrOption,
  LeavePolicyDto,
  LeavePolicyRecord,
  LeaveRequestDto,
  LeaveRequestRecord,
  LeaveReviewDto,
  LetterRecord,
  LoanRecord,
  LoanReviewDto,
  PayrollGlSettingDto,
  PayrollLineRecord,
  PayrollRunRecord,
  PayslipEmailDto,
  SalaryComponentRecord,
  SubmitScoresDto,
  TimesheetRecord,
  UpdateEmployeeDto,
  UpdateTimesheetDto,
} from '../types/hr.types';

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function unwrapList(raw: unknown): unknown[] {
  if (Array.isArray(raw)) return raw;
  const envelope = asRecord(raw);
  if (!envelope) return [];
  const data = envelope.data;
  if (Array.isArray(data)) return data;
  const nested = asRecord(data);
  if (!nested) return [];
  for (const key of [
    'items',
    'results',
    'records',
    'employees',
    'requests',
    'runs',
    'components',
    'loans',
    'advances',
    'timesheets',
    'evaluations',
    'letters',
    'policies',
    'cycles',
    'templates',
    'attendance',
    'schedule',
  ]) {
    if (Array.isArray(nested[key])) return nested[key] as unknown[];
  }
  return [];
}

function unwrapOne(raw: unknown): Record<string, unknown> | null {
  const record = asRecord(raw);
  if (!record) return null;
  const inner = asRecord(record.data);
  return inner ?? record;
}

function str(record: Record<string, unknown>, ...keys: string[]): string {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === 'string' && value.trim()) return value.trim();
    if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  }
  return '';
}

function num(record: Record<string, unknown>, ...keys: string[]): number {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === 'number' && Number.isFinite(value)) return value;
    if (typeof value === 'string' && value.trim() && !Number.isNaN(Number(value))) return Number(value);
  }
  return 0;
}

function nestedName(value: unknown): string {
  if (typeof value === 'string') return value;
  const record = asRecord(value);
  if (!record) return '';
  return str(record, 'name', 'title', 'code', 'label');
}

function nestedPersonName(value: unknown): string {
  if (typeof value === 'string' && value.trim()) return value.trim();
  const record = asRecord(value);
  if (!record) return '';
  const firstName = str(record, 'first_name', 'firstName');
  const lastName = str(record, 'last_name', 'lastName');
  return (
    str(record, 'name', 'full_name', 'fullName', 'title', 'label') ||
    `${firstName} ${lastName}`.trim()
  );
}

function averageScoreObject(value: unknown): number | undefined {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return undefined;
  const values = Object.values(value as Record<string, unknown>).filter(
    (item): item is number => typeof item === 'number' && Number.isFinite(item),
  );
  if (!values.length) return undefined;
  const avg = values.reduce((sum, score) => sum + score, 0) / values.length;
  return Math.round(avg * 10) / 10;
}

function pickEvaluationScore(record: Record<string, unknown>, ...keys: string[]): number | undefined {
  for (const key of keys) {
    const direct = num(record, key);
    if (direct > 0) return direct;
    const nested = averageScoreObject(record[key]);
    if (nested != null && nested > 0) return nested;
  }
  return undefined;
}

function hasSubmittedFlag(record: Record<string, unknown>, ...keys: string[]): boolean {
  for (const key of keys) {
    const value = record[key];
    if (value === true) return true;
    if (typeof value === 'string' && value.trim()) return true;
  }
  return false;
}

function inferEvaluationSubmission(
  record: Record<string, unknown>,
  status: string,
  selfScore?: number,
  managerScore?: number,
): { self_submitted: boolean; manager_submitted: boolean } {
  const normalizedStatus = status.toUpperCase();
  const self_submitted =
    hasSubmittedFlag(record, 'self_submitted', 'selfSubmitted') ||
    hasSubmittedFlag(record, 'self_submitted_at', 'selfSubmittedAt') ||
    selfScore != null ||
    /SELF_SUBMITTED|SELF_COMPLETE|SELF_REVIEW/i.test(normalizedStatus);
  const manager_submitted =
    hasSubmittedFlag(record, 'manager_submitted', 'managerSubmitted') ||
    hasSubmittedFlag(record, 'manager_submitted_at', 'managerSubmittedAt') ||
    managerScore != null ||
    /MANAGER_SUBMITTED|MANAGER_COMPLETE|MANAGER_REVIEW/i.test(normalizedStatus);
  return { self_submitted, manager_submitted };
}

function nestedId(value: unknown): string {
  const record = asRecord(value);
  return record ? str(record, 'id') : typeof value === 'string' ? value : '';
}

function dateOnly(value: string): string {
  return value.slice(0, 10);
}

function dayDiff(from: string, to: string): number {
  if (!from || !to) return 0;
  const start = new Date(from);
  const end = new Date(to);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return 0;
  return Math.max(1, Math.round((end.getTime() - start.getTime()) / 86_400_000) + 1);
}

function formatAxiosError(error: unknown): Error {
  if (error instanceof Error && !(error as { response?: unknown }).response) return error;
  const axiosErr = error as {
    response?: { data?: { message?: string | string[]; error?: string }; status?: number };
    message?: string;
  };
  const message = axiosErr.response?.data?.message;
  if (Array.isArray(message)) return new Error(message.map(String).join('; '));
  if (typeof message === 'string' && message.trim()) {
    if (axiosErr.response?.status === 500 && /internal server error/i.test(message)) {
      return new Error(
        'Payroll run could not be created (server error). Check that company is set, the month is not duplicated, and salary components are seeded.',
      );
    }
    return new Error(message);
  }
  return new Error(axiosErr.message || 'Request failed');
}

function resolveHrCompanyId(override?: string): string {
  const trimmed = override?.trim();
  if (trimmed && isUuid(trimmed)) return trimmed;
  const { accessToken, user } = useAuthStore.getState();
  const fromSession =
    user?.companyId?.trim() ||
    resolveCompanyIdFromUserLike(user) ||
    companyIdFromAccessToken(accessToken) ||
    '';
  return fromSession && isUuid(fromSession) ? fromSession : '';
}

async function resolveHrCompanyIdForPayroll(override?: string): Promise<string> {
  const direct = resolveHrCompanyId(override);
  if (direct) return direct;

  try {
    const companies = await fetchTenantCompanyOptions();
    if (companies.length === 1) return companies[0]!.id;
    const { accessToken, user } = useAuthStore.getState();
    const sessionHint =
      user?.companyId?.trim() ||
      resolveCompanyIdFromUserLike(user) ||
      companyIdFromAccessToken(accessToken) ||
      '';
    const matched = companies.find((company) => company.id === sessionHint);
    if (matched) return matched.id;
  } catch {
    // fall through to error below
  }

  return '';
}

function compact<T extends object>(dto: T): T {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(dto as Record<string, unknown>)) {
    if (value === '' || value === undefined || value === null) continue;
    out[key] = value;
  }
  return out as T;
}

export function normalizeEmployee(raw: unknown): EmployeeRow | null {
  const record = asRecord(raw);
  if (!record) return null;
  const id = str(record, 'id');
  if (!id) return null;
  const firstName = str(record, 'first_name', 'firstName');
  const lastName = str(record, 'last_name', 'lastName');
  const name = str(record, 'name', 'full_name', 'fullName') || `${firstName} ${lastName}`.trim();
  return {
    id,
    branch: nestedName(record.branch) || str(record, 'branch_name'),
    branchId: str(record, 'branch_id') || nestedId(record.branch),
    name: name || '—',
    firstName,
    lastName,
    code: str(record, 'code', 'employee_code', 'employeeCode', 'mol_employee_id'),
    type: str(record, 'employment_type', 'employmentType'),
    designation: nestedName(record.designation) || str(record, 'designation_name'),
    designationId: str(record, 'designation_id') || nestedId(record.designation),
    department: nestedName(record.department) || str(record, 'department_name'),
    departmentId: str(record, 'department_id') || nestedId(record.department),
    birthDate: dateOnly(str(record, 'date_of_birth', 'dateOfBirth', 'birth_date')),
    employment: str(record, 'employment_type', 'contract_type'),
    gender: str(record, 'gender'),
    grade: str(record, 'staff_grade', 'grade'),
    joinDate: dateOnly(str(record, 'joining_date', 'join_date', 'joinDate')),
    mobile: str(record, 'mobile', 'phone'),
    email: str(record, 'email'),
    nationality: str(record, 'nationality'),
    status: str(record, 'status') || 'ACTIVE',
    visaExpiry: dateOnly(str(record, 'visa_expires_at', 'visaExpiry')),
    passportExpiry: dateOnly(str(record, 'passport_expires_at', 'passportExpiry')),
    contractType: str(record, 'contract_type', 'employment_type'),
    basicSalary: num(record, 'basic_salary', 'basicSalary'),
    housingAllowance: num(record, 'housing_allowance'),
    transportAllowance: num(record, 'transport_allowance'),
    emergencyName: str(record, 'emergency_name'),
    emergencyPhone: str(record, 'emergency_phone'),
    maritalStatus: str(record, 'marital_status'),
    iban: str(record, 'iban'),
    bankName: str(record, 'bank_name'),
  };
}

function normalizeLeave(raw: unknown): LeaveRequestRecord | null {
  const record = asRecord(raw);
  if (!record) return null;
  const id = str(record, 'id');
  if (!id) return null;
  const from = dateOnly(str(record, 'start_date', 'from', 'from_date'));
  const to = dateOnly(str(record, 'end_date', 'to', 'to_date'));
  return {
    id,
    employee_id: str(record, 'employee_id') || nestedId(record.employee),
    employee:
      nestedName(record.employee) ||
      str(record, 'employee_name', 'employeeName') ||
      str(record, 'employee_id') ||
      '—',
    department: nestedName(record.department) || str(record, 'department_name'),
    type: str(record, 'leave_type', 'type'),
    from,
    to,
    days: num(record, 'days', 'day_count') || dayDiff(from, to),
    status: str(record, 'status') || 'PENDING',
    reason: str(record, 'reason'),
    appliedOn: dateOnly(str(record, 'created_at', 'applied_on', 'appliedOn')),
  };
}

function normalizePayrollLine(raw: unknown): PayrollLineRecord | null {
  const record = asRecord(raw);
  if (!record) return null;
  const employee_id = str(record, 'employee_id');
  if (!employee_id) return null;
  return {
    id: str(record, 'id') || undefined,
    employee_id,
    employee_name: str(record, 'employee_name', 'employee', 'full_name', 'name'),
    gross_pay: num(record, 'gross_pay', 'gross', 'total_earnings'),
    net_pay: num(record, 'net_pay', 'net', 'total_net'),
  };
}

function normalizePayroll(raw: unknown): PayrollRunRecord | null {
  const record = asRecord(raw);
  if (!record) return null;
  const id = str(record, 'id');
  if (!id) return null;
  const linesRaw = record.lines ?? record.payroll_lines ?? record.items ?? record.employees;
  const lines = Array.isArray(linesRaw)
    ? linesRaw
        .map(normalizePayrollLine)
        .filter((row): row is PayrollLineRecord => Boolean(row))
    : undefined;
  return {
    id,
    year: str(record, 'payroll_year', 'year'),
    month: str(record, 'payroll_month', 'month'),
    status: str(record, 'status') || 'DRAFT',
    currency: str(record, 'currency_code', 'currency') || 'AED',
    company_id: str(record, 'company_id') || undefined,
    lines: lines?.length ? lines : undefined,
  };
}

function normalizeDocument(raw: unknown): HrDocumentRecord | null {
  const record = asRecord(raw);
  if (!record) return null;
  const id = str(record, 'id');
  if (!id) return null;
  const expires = dateOnly(str(record, 'expires_at', 'expiry', 'expiry_date'));
  let status = 'Valid';
  if (expires) {
    const diff = (new Date(expires).getTime() - Date.now()) / 86_400_000;
    if (diff < 0) status = 'Expired';
    else if (diff <= 90) status = 'Expiring';
  }
  return {
    id,
    document_type: str(record, 'document_type', 'type', 'name') || 'DOCUMENT',
    document_no: str(record, 'document_no', 'number'),
    issued_at: dateOnly(str(record, 'issued_at')),
    expires_at: expires,
    file_path: str(record, 'file_path', 'url'),
    status,
  };
}

function normalizeDependent(raw: unknown): DependentRecord | null {
  const record = asRecord(raw);
  if (!record) return null;
  const id = str(record, 'id');
  if (!id) return null;
  return {
    id,
    full_name: str(record, 'full_name', 'name'),
    relation: str(record, 'relation'),
    date_of_birth: dateOnly(str(record, 'date_of_birth')),
    passport_no: str(record, 'passport_no'),
    visa_no: str(record, 'visa_no'),
  };
}

function normalizeEmploymentHistory(raw: unknown): EmploymentHistoryRecord | null {
  const record = asRecord(raw);
  if (!record) return null;
  const id = str(record, 'id');
  if (!id) return null;
  return {
    id,
    employer_name: str(record, 'employer_name', 'employer'),
    job_title: str(record, 'job_title', 'title'),
    start_date: dateOnly(str(record, 'start_date')),
    end_date: dateOnly(str(record, 'end_date')),
    remarks: str(record, 'remarks', 'notes'),
  };
}

function normalizeQualification(raw: unknown): QualificationRecord | null {
  const record = asRecord(raw);
  if (!record) return null;
  const id = str(record, 'id');
  if (!id) return null;
  const year = num(record, 'year_awarded', 'year');
  return {
    id,
    title: str(record, 'title', 'name'),
    institution: str(record, 'institution', 'school'),
    year_awarded: year > 0 ? year : null,
  };
}

function normalizeSkill(raw: unknown): SkillRecord | null {
  const record = asRecord(raw);
  if (!record) return null;
  const id = str(record, 'id');
  if (!id) return null;
  return {
    id,
    name: str(record, 'name', 'skill'),
    level: str(record, 'level'),
  };
}

function normalizeComponent(raw: unknown): SalaryComponentRecord | null {
  const record = asRecord(raw);
  if (!record) return null;
  const id = str(record, 'id', 'code');
  if (!id) return null;
  return {
    id,
    code: str(record, 'code'),
    name: str(record, 'name'),
    is_earning: record.is_earning !== false,
    sort_order: num(record, 'sort_order'),
  };
}

function normalizeTimesheet(raw: unknown): TimesheetRecord | null {
  const record = asRecord(raw);
  if (!record) return null;
  const id = str(record, 'id');
  if (!id) return null;
  const employee_id = str(record, 'employee_id', 'employeeId') || nestedId(record.employee);
  return {
    id,
    employee_id,
    employee:
      nestedPersonName(record.employee) ||
      str(record, 'employee_name', 'employeeName', 'employee_full_name', 'full_name') ||
      '—',
    work_date: dateOnly(str(record, 'work_date', 'date')),
    hours: num(record, 'hours'),
    overtime_hours: num(record, 'overtime_hours', 'overtimeHours'),
    status: str(record, 'status') || 'DRAFT',
    notes: str(record, 'notes'),
  };
}

function normalizeLoan(raw: unknown): LoanRecord | null {
  const record = asRecord(raw);
  if (!record) return null;
  const id = str(record, 'id');
  if (!id) return null;
  return {
    id,
    employee_id: str(record, 'employee_id') || nestedId(record.employee),
    employee: nestedName(record.employee) || str(record, 'employee_name') || '—',
    principal: num(record, 'principal'),
    interest_rate: num(record, 'interest_rate'),
    tenure_months: num(record, 'tenure_months'),
    purpose: str(record, 'purpose'),
    status: str(record, 'status') || 'PENDING',
    created_at: dateOnly(str(record, 'created_at')),
  };
}

function normalizeAdvance(raw: unknown): AdvanceRecord | null {
  const record = asRecord(raw);
  if (!record) return null;
  const id = str(record, 'id');
  if (!id) return null;
  return {
    id,
    employee_id: str(record, 'employee_id') || nestedId(record.employee),
    employee: nestedName(record.employee) || str(record, 'employee_name') || '—',
    amount: num(record, 'amount'),
    reason: str(record, 'reason'),
    status: str(record, 'status') || 'OPEN',
    created_at: dateOnly(str(record, 'created_at')),
  };
}

function normalizeLeavePolicy(raw: unknown): LeavePolicyRecord | null {
  const record = asRecord(raw);
  if (!record) return null;
  const id = str(record, 'id');
  if (!id) return null;
  return {
    id,
    leave_type: str(record, 'leave_type') as LeavePolicyRecord['leave_type'],
    staff_grade: str(record, 'staff_grade') as LeavePolicyRecord['staff_grade'],
    entitlement_days: num(record, 'entitlement_days'),
    carry_forward_max: num(record, 'carry_forward_max'),
    encashment_allowed: record.encashment_allowed === true,
  };
}

function normalizeEvaluationTemplate(raw: unknown): EvaluationTemplateRecord | null {
  const record = asRecord(raw);
  if (!record) return null;
  const id = str(record, 'id');
  if (!id) return null;
  const kpisRaw = record.kpis;
  const kpis = Array.isArray(kpisRaw)
    ? (kpisRaw.filter((item) => item && typeof item === 'object') as Record<string, unknown>[])
    : [];
  return {
    id,
    name: str(record, 'name'),
    kpis,
  };
}

function normalizeEvaluationCycle(raw: unknown): EvaluationCycleRecord | null {
  const record = asRecord(raw);
  if (!record) return null;
  const id = str(record, 'id');
  if (!id) return null;
  return {
    id,
    template_id: str(record, 'template_id') || nestedId(record.template),
    template_name: nestedName(record.template) || str(record, 'template_name'),
    name: str(record, 'name'),
    year: num(record, 'year'),
    start_date: dateOnly(str(record, 'start_date')),
    end_date: dateOnly(str(record, 'end_date')),
    status: str(record, 'status') || 'DRAFT',
  };
}

function normalizeEvaluation(raw: unknown): EvaluationRecord | null {
  const record = asRecord(raw);
  if (!record) return null;
  const id = str(record, 'id');
  if (!id) return null;
  const employeeId = str(record, 'employee_id') || nestedId(record.employee);
  const status = str(record, 'status') || 'DRAFT';
  const self_score = pickEvaluationScore(
    record,
    'self_score',
    'selfScore',
    'self_rating',
    'selfRating',
    'self_total',
    'selfTotal',
    'self_scores',
    'selfScores',
  );
  const manager_score = pickEvaluationScore(
    record,
    'manager_score',
    'managerScore',
    'manager_rating',
    'managerRating',
    'manager_total',
    'managerTotal',
    'manager_scores',
    'managerScores',
  );
  const submission = inferEvaluationSubmission(record, status, self_score, manager_score);
  return {
    id,
    cycle_id: str(record, 'cycle_id') || nestedId(record.cycle),
    employee_id: employeeId,
    employee:
      nestedPersonName(record.employee) ||
      str(record, 'employee_name', 'employeeName', 'employee_full_name', 'full_name') ||
      '—',
    status,
    self_score,
    manager_score,
    ...submission,
  };
}

function isPdfArrayBuffer(data: ArrayBuffer): boolean {
  if (data.byteLength < 4) return false;
  const bytes = new Uint8Array(data);
  return bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46;
}

function isLetterFileReference(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) return false;
  if (/(^|\/)hr\/letters(\/|$)/i.test(trimmed)) return false;
  if (parseFilesApiUrl(trimmed)) return true;
  if (/\.pdf(?:$|[?#])/i.test(trimmed)) return true;
  if (/^data:application\/pdf/i.test(trimmed)) return true;
  if (/^https?:\/\/.+\/files\//i.test(trimmed)) return true;
  return false;
}

function base64ToPdfBlob(base64: string): Blob {
  const normalized = base64.replace(/^data:application\/pdf;base64,/, '').trim();
  const binary = atob(normalized);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new Blob([bytes], { type: 'application/pdf' });
}

function extractLetterPdfBase64(raw: unknown, depth = 0): string {
  if (depth > 4 || raw == null) return '';
  if (typeof raw === 'string' && raw.length > 100 && /^[A-Za-z0-9+/=\r\n]+$/.test(raw.trim())) {
    return raw.trim();
  }
  const record = asRecord(raw);
  if (!record) return '';
  for (const key of [
    'pdf_base64',
    'pdfBase64',
    'base64',
    'pdf_content',
    'content_base64',
    'file_base64',
  ]) {
    const value = record[key];
    if (typeof value === 'string' && value.trim()) {
      const trimmed = value.trim();
      if (trimmed.length > 100 && /^[A-Za-z0-9+/=\r\n]+$/.test(trimmed)) return trimmed;
    }
  }
  const pdfValue = record.pdf;
  if (typeof pdfValue === 'string' && pdfValue.trim()) {
    const trimmed = pdfValue.trim();
    if (trimmed.length > 100 && /^[A-Za-z0-9+/=\r\n]+$/.test(trimmed)) return trimmed;
  }
  for (const key of ['file', 'document', 'pdf', 'storage', 'data']) {
    const nested = extractLetterPdfBase64(record[key], depth + 1);
    if (nested) return nested;
  }
  return '';
}

function extractLetterFileReference(raw: unknown, depth = 0): string {
  if (depth > 4 || raw == null) return '';
  if (typeof raw === 'string' && isLetterFileReference(raw)) return raw.trim();
  const record = asRecord(raw);
  if (!record) return '';
  for (const key of [
    'pdf_url',
    'file_url',
    'file_path',
    'storage_path',
    'storage_key',
    'filename',
    'file_name',
    'fileName',
    'path',
    'download_url',
    'document_url',
    'pdf_path',
    'pdfPath',
    'rendered_pdf_url',
    'object_key',
    's3_key',
  ]) {
    const value = record[key];
    if (typeof value === 'string' && isLetterFileReference(value)) return value.trim();
  }
  for (const key of ['file', 'document', 'pdf', 'storage', 'attachment', 'result']) {
    const nested = extractLetterFileReference(record[key], depth + 1);
    if (nested) return nested;
  }
  return '';
}

function resolveLetterStoredUrl(url: string): string {
  if (/^https?:\/\//i.test(url) || url.startsWith('blob:') || url.startsWith('data:')) {
    return url;
  }
  if (parseFilesApiUrl(url)) return url;
  if (/^\/files\//i.test(url) || /^\/backend\/files\//i.test(url)) {
    return url.startsWith('/backend/') ? url.replace(/^\/backend/, '') : url;
  }
  if (/^[^/]+\/.+\.pdf$/i.test(url)) {
    return `/files/${url.replace(/^\/+/, '')}`;
  }
  if (/^[^/]+\.pdf$/i.test(url)) {
    const { accessToken, user } = useAuthStore.getState();
    const tenantId = resolveSessionTenantIdFromAuth({ accessToken, user });
    if (tenantId) return `/files/${tenantId}/${url.replace(/^\/+/, '')}`;
  }
  const base = String(import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '');
  if (url.startsWith('/') && isLetterFileReference(url)) return `${base}${url}`;
  return url;
}

function letterPdfFilename(letterType: string, employeeId: string): string {
  const type = letterType.toLowerCase().replace(/_/g, '-');
  const suffix = employeeId.trim().slice(0, 8) || 'employee';
  return `hr-letter-${type}-${suffix}-${new Date().toISOString().slice(0, 10)}.pdf`;
}

function parseGenerateLetterResponse(
  data: ArrayBuffer,
  contentType: string,
  _dto: GenerateLetterDto,
): LetterGenerateResult {
  const parsed = parseLetterPdfArrayBuffer(data, contentType);
  const letter = parsed.letter ?? null;
  // Ignore server PDF bytes — backend currently returns a blank template with
  // checkbox fields for every letter type instead of a filled letter PDF.
  return {
    letter,
    pdfUrl: parsed.pdf_url,
    pdfBlob: undefined,
  };
}

function formatArrayBufferAxiosError(error: unknown): Error {
  const axiosErr = error as {
    response?: { data?: ArrayBuffer | unknown; status?: number };
    message?: string;
  };
  const raw = axiosErr.response?.data;
  if (raw instanceof ArrayBuffer && raw.byteLength > 0 && raw.byteLength < 8192) {
    try {
      const text = new TextDecoder().decode(raw);
      const parsed = JSON.parse(text) as { message?: string | string[]; error?: string };
      const message = parsed.message;
      if (Array.isArray(message)) return new Error(message.map(String).join('; '));
      if (typeof message === 'string' && message.trim()) return new Error(message);
      if (typeof parsed.error === 'string' && parsed.error.trim()) return new Error(parsed.error);
    } catch {
      /* fall through */
    }
  }
  return formatAxiosError(error);
}

function normalizeLetter(raw: unknown): LetterRecord | null {
  const record = asRecord(raw);
  if (!record) return null;
  const id = str(record, 'id');
  if (!id) return null;
  const fileRef = extractLetterFileReference(record);
  const pdf_url = fileRef ? resolveLetterStoredUrl(fileRef) : undefined;
  return {
    id,
    employee_id: str(record, 'employee_id') || nestedId(record.employee),
    employee: nestedName(record.employee) || str(record, 'employee_name') || '—',
    letter_type: str(record, 'letter_type', 'type'),
    generated_at: dateOnly(str(record, 'generated_at', 'created_at')),
    status: str(record, 'status') || 'GENERATED',
    pdf_url,
    file_url: pdf_url,
    file_path: fileRef && !pdf_url?.includes('/files/') ? fileRef : str(record, 'file_path') || undefined,
  };
}

function parseLetterPdfArrayBuffer(
  data: ArrayBuffer,
  contentType: string | undefined,
): { pdf_url?: string; pdfBlob?: Blob; letter?: LetterRecord | null } {
  const type = String(contentType ?? '');
  if (type.includes('application/pdf') || isPdfArrayBuffer(data)) {
    return { pdfBlob: new Blob([data], { type: 'application/pdf' }) };
  }

  const text = new TextDecoder().decode(data).trim();
  if (!text.startsWith('{') && !text.startsWith('[')) return {};

  try {
    const json = JSON.parse(text) as unknown;
    const record = unwrapOne(json) ?? asRecord(json);
    const letter = normalizeLetter(record ?? json);
    const base64 = extractLetterPdfBase64(record ?? json);
    if (base64) {
      return { pdfBlob: base64ToPdfBlob(base64), letter };
    }
    const fileRef = extractLetterFileReference(record ?? json);
    const pdf_url = fileRef ? resolveLetterStoredUrl(fileRef) : letter?.pdf_url;
    return {
      pdf_url: pdf_url && isLetterFileReference(pdf_url) ? pdf_url : undefined,
      letter,
    };
  } catch {
    return {};
  }
}

async function resolveLetterPdfFromApi(id: string): Promise<LetterPdfInfo> {
  try {
    const { data } = await axiosInstance.get<unknown>(HR_API.letter(id));
    const letter = normalizeLetter(unwrapOne(data) ?? data);
    if (letter) {
      return {
        letter_id: id,
        letter,
        status: 'READY',
      };
    }
  } catch {
    /* fall through */
  }

  return { letter_id: id, status: 'PENDING' };
}

async function openResolvedLetterPdf(
  letter: LetterRecord,
  pdfBlob: Blob | undefined,
  pdfUrl: string | undefined,
  getEmployee: (id: string) => Promise<EmployeeRow>,
): Promise<void> {
  const displayName = letterPdfFilename(letter.letter_type, letter.employee_id);
  const branding = letterPdfBranding(letterPdfReference(letter), letter.generated_at);
  if (pdfBlob) {
    await openBlobInNewTab(pdfBlob, undefined, { filename: displayName, branding });
    return;
  }
  if (pdfUrl && isStoredFileUrl(pdfUrl)) {
    await filesService.openStoredFile(pdfUrl, { displayName });
    return;
  }
  const info = await buildFallbackLetterPdfInfo(letter, getEmployee);
  if (info.pdfBlob) {
    await openBlobInNewTab(info.pdfBlob, undefined, { filename: displayName, branding });
    return;
  }
  throw new Error('No PDF is available for this letter yet.');
}

function normalizeAttendance(raw: unknown): AttendanceRecord | null {
  const record = asRecord(raw);
  if (!record) return null;
  const id = str(record, 'id');
  if (!id) return null;
  return {
    id,
    employee_id: str(record, 'employee_id') || nestedId(record.employee),
    employee: nestedName(record.employee) || str(record, 'employee_name') || '—',
    work_date: dateOnly(str(record, 'work_date', 'date')),
    clock_in: str(record, 'clock_in', 'clock_in_at'),
    clock_out: str(record, 'clock_out', 'clock_out_at'),
    hours: num(record, 'hours', 'total_hours'),
  };
}

async function listMasterOptions(basePath: string): Promise<HrOption[]> {
  try {
    const result = await masterService.list(basePath, { page: 1, limit: 100, is_active: true });
    return result.items
      .map((item) => ({
        id: String(item.id ?? ''),
        name: String(item.name ?? item.code ?? item.id ?? ''),
      }))
      .filter((item) => item.id);
  } catch {
    return [];
  }
}

async function buildFallbackLetterPdfInfo(
  letter: LetterRecord,
  getEmployee: (id: string) => Promise<EmployeeRow>,
): Promise<LetterPdfInfo> {
  const employee = letter.employee_id
    ? await getEmployee(letter.employee_id).catch(() => null)
    : null;
  const blob = await generateHrLetterPdfFallback(letter, employee);
  return {
    pdf_url: URL.createObjectURL(blob),
    pdfBlob: blob,
    letter_id: letter.id || undefined,
    letter,
    status: 'READY',
  };
}

async function ensureLetterPdfInfo(
  _info: LetterPdfInfo,
  letter: LetterRecord,
  getEmployee: (id: string) => Promise<EmployeeRow>,
): Promise<LetterPdfInfo> {
  return buildFallbackLetterPdfInfo(letter, getEmployee);
}

async function downloadBlobFromPath(path: string, filename: string): Promise<void> {
  const { data } = await axiosInstance.get<Blob>(path, { responseType: 'blob' });
  const blob = data instanceof Blob ? data : new Blob([data]);
  const href = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = href;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(href);
}

export const hrService = {
  async listMasterOptions() {
    const [branches, departments, designations] = await Promise.all([
      listMasterOptions(MASTER_PATHS.branches),
      listMasterOptions(MASTER_PATHS.departments),
      listMasterOptions(MASTER_PATHS.designations),
    ]);
    return { branches, departments, designations };
  },

  async listEmployees(params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    department_id?: string;
    branch_id?: string;
  }): Promise<EmployeeRow[]> {
    try {
      const { data } = await axiosInstance.get<unknown>(HR_API.employees, {
        params: {
          page: params?.page ?? 1,
          limit: params?.limit ?? 100,
          ...(params?.search?.trim() ? { search: params.search.trim() } : {}),
          ...(params?.status && params.status !== 'All' ? { status: params.status } : {}),
          ...(params?.department_id ? { department_id: params.department_id } : {}),
          ...(params?.branch_id ? { branch_id: params.branch_id } : {}),
        },
      });
      return unwrapList(data)
        .map(normalizeEmployee)
        .filter((row): row is EmployeeRow => Boolean(row));
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async getEmployee(id: string): Promise<EmployeeRow> {
    try {
      const { data } = await axiosInstance.get<unknown>(HR_API.employee(id));
      const row = normalizeEmployee(unwrapOne(data) ?? data);
      if (!row) throw new Error('Employee not found.');
      return row;
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async createEmployee(dto: CreateEmployeeDto): Promise<EmployeeRow> {
    try {
      const { data } = await axiosInstance.post<unknown>(HR_API.employees, compact(dto));
      const row = normalizeEmployee(unwrapOne(data) ?? data);
      if (!row) throw new Error('Employee was created but the response could not be read.');
      return row;
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async updateEmployee(id: string, dto: UpdateEmployeeDto): Promise<EmployeeRow> {
    try {
      const { data } = await axiosInstance.patch<unknown>(HR_API.employee(id), compact(dto));
      const row = normalizeEmployee(unwrapOne(data) ?? data);
      if (!row) return this.getEmployee(id);
      return row;
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async deleteEmployee(id: string): Promise<void> {
    try {
      await axiosInstance.delete(HR_API.employee(id));
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async listDocuments(employeeId: string): Promise<HrDocumentRecord[]> {
    try {
      const { data } = await axiosInstance.get<unknown>(HR_API.employeeDocuments(employeeId));
      return unwrapList(data)
        .map(normalizeDocument)
        .filter((row): row is HrDocumentRecord => Boolean(row));
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async createDocument(
    employeeId: string,
    dto: { document_type: string; document_no?: string; issued_at?: string; expires_at?: string; file_path?: string },
  ): Promise<void> {
    try {
      await axiosInstance.post(HR_API.employeeDocuments(employeeId), compact(dto));
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async deleteDocument(employeeId: string, docId: string): Promise<void> {
    try {
      await axiosInstance.delete(HR_API.employeeDocument(employeeId, docId));
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async listDependents(employeeId: string): Promise<DependentRecord[]> {
    try {
      const { data } = await axiosInstance.get<unknown>(HR_API.employeeDependents(employeeId));
      return unwrapList(data)
        .map(normalizeDependent)
        .filter((row): row is DependentRecord => Boolean(row));
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async addDependent(employeeId: string, dto: CreateDependentDto): Promise<void> {
    try {
      await axiosInstance.post(HR_API.employeeDependents(employeeId), compact(dto));
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async listEmploymentHistory(employeeId: string): Promise<EmploymentHistoryRecord[]> {
    try {
      const { data } = await axiosInstance.get<unknown>(HR_API.employeeEmploymentHistory(employeeId));
      return unwrapList(data)
        .map(normalizeEmploymentHistory)
        .filter((row): row is EmploymentHistoryRecord => Boolean(row));
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async addEmploymentHistory(employeeId: string, dto: CreateEmploymentHistoryDto): Promise<void> {
    try {
      await axiosInstance.post(HR_API.employeeEmploymentHistory(employeeId), compact(dto));
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async listQualifications(employeeId: string): Promise<QualificationRecord[]> {
    try {
      const { data } = await axiosInstance.get<unknown>(HR_API.employeeQualifications(employeeId));
      return unwrapList(data)
        .map(normalizeQualification)
        .filter((row): row is QualificationRecord => Boolean(row));
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async addQualification(employeeId: string, dto: CreateQualificationDto): Promise<void> {
    try {
      await axiosInstance.post(HR_API.employeeQualifications(employeeId), compact(dto));
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async listSkills(employeeId: string): Promise<SkillRecord[]> {
    try {
      const { data } = await axiosInstance.get<unknown>(HR_API.employeeSkills(employeeId));
      return unwrapList(data)
        .map(normalizeSkill)
        .filter((row): row is SkillRecord => Boolean(row));
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async addSkill(employeeId: string, dto: CreateSkillDto): Promise<void> {
    try {
      await axiosInstance.post(HR_API.employeeSkills(employeeId), compact(dto));
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async linkEmployeeUser(employeeId: string, dto: LinkUserDto): Promise<void> {
    try {
      await axiosInstance.post(HR_API.employeeLinkUser(employeeId), dto);
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async listLeaveBalances(employeeId: string): Promise<unknown[]> {
    try {
      const { data } = await axiosInstance.get<unknown>(HR_API.employeeLeaveBalances(employeeId));
      return unwrapList(data);
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async listLeaveRequests(params?: {
    employee_id?: string;
    status?: string;
    from?: string;
    to?: string;
  }): Promise<LeaveRequestRecord[]> {
    if (!params?.employee_id) {
      const year = new Date().getFullYear();
      return this.listLeaveCalendar(params?.from || `${year}-01-01`, params?.to || `${year}-12-31`);
    }

    const fetchWith = async (query: Record<string, string>) => {
      const { data } = await axiosInstance.get<unknown>(HR_API.leaveRequests, { params: query });
      return unwrapList(data)
        .map(normalizeLeave)
        .filter((row): row is LeaveRequestRecord => Boolean(row));
    };

    try {
      const query: Record<string, string> = { employee_id: params.employee_id };
      if (params.status && params.status !== 'All') query.status = params.status;
      return await fetchWith(query);
    } catch (error) {
      if (params.status && params.status !== 'All') throw formatAxiosError(error);
      const batches = await Promise.all(
        LEAVE_STATUSES.map(async (status) => {
          try {
            return await fetchWith({ employee_id: params.employee_id!, status });
          } catch {
            return [];
          }
        }),
      );
      const seen = new Set<string>();
      return batches.flat().filter((row) => {
        if (seen.has(row.id)) return false;
        seen.add(row.id);
        return true;
      });
    }
  },

  async createLeaveRequest(dto: LeaveRequestDto): Promise<void> {
    try {
      await axiosInstance.post(HR_API.leaveRequests, compact(dto));
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async approveLeave(id: string): Promise<void> {
    try {
      await axiosInstance.patch(HR_API.leaveRequestApprove(id));
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async rejectLeave(id: string, review?: LeaveReviewDto): Promise<void> {
    try {
      if (review) {
        await axiosInstance.patch(HR_API.leaveRequestReview(id), review);
        return;
      }
      await axiosInstance.patch(HR_API.leaveRequestReject(id));
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async returnLeave(id: string): Promise<void> {
    try {
      await axiosInstance.patch(HR_API.leaveRequestReturn(id));
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async reviewLeave(id: string, review: LeaveReviewDto): Promise<void> {
    try {
      await axiosInstance.patch(HR_API.leaveRequestReview(id), review);
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async listLeavePolicies(): Promise<LeavePolicyRecord[]> {
    try {
      const { data } = await axiosInstance.get<unknown>(HR_API.leavePolicies);
      return unwrapList(data)
        .map(normalizeLeavePolicy)
        .filter((row): row is LeavePolicyRecord => Boolean(row));
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async createLeavePolicy(dto: LeavePolicyDto): Promise<void> {
    try {
      await axiosInstance.post(HR_API.leavePolicies, dto);
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async updateLeavePolicy(id: string, dto: Partial<LeavePolicyDto>): Promise<void> {
    try {
      await axiosInstance.patch(HR_API.leavePolicy(id), compact(dto));
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async deleteLeavePolicy(id: string): Promise<void> {
    try {
      await axiosInstance.delete(HR_API.leavePolicy(id));
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async listLeaveCalendar(from: string, to: string, department_id?: string): Promise<LeaveRequestRecord[]> {
    try {
      const { data } = await axiosInstance.get<unknown>(HR_API.leaveCalendar, {
        params: { from, to, ...(department_id ? { department_id } : {}) },
      });
      return unwrapList(data)
        .map(normalizeLeave)
        .filter((row): row is LeaveRequestRecord => Boolean(row));
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async listPayrollRuns(): Promise<PayrollRunRecord[]> {
    try {
      const { data } = await axiosInstance.get<unknown>(HR_API.payrollRuns);
      return unwrapList(data)
        .map(normalizePayroll)
        .filter((row): row is PayrollRunRecord => Boolean(row));
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async createPayrollRun(dto: {
    payroll_year: number;
    payroll_month: number;
    currency_code?: string;
    company_id?: string;
  }): Promise<PayrollRunRecord | null> {
    const company_id = await resolveHrCompanyIdForPayroll(dto.company_id);
    if (!company_id) {
      throw new Error(
        'Select a company for this payroll run. Ask your Tenant Admin to set up a company profile if none appear.',
      );
    }
    try {
      const { data } = await axiosInstance.post<unknown>(
        HR_API.payrollRuns,
        compact({
          payroll_year: dto.payroll_year,
          payroll_month: dto.payroll_month,
          currency_code: dto.currency_code,
          company_id,
        }),
      );
      return normalizePayroll(unwrapOne(data) ?? data);
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async getPayrollRun(id: string): Promise<PayrollRunRecord | null> {
    try {
      const { data } = await axiosInstance.get<unknown>(HR_API.payrollRun(id));
      return normalizePayroll(unwrapOne(data) ?? data);
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async generatePayrollFull(id: string): Promise<void> {
    try {
      await axiosInstance.post(HR_API.payrollRunGenerate(id));
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async finalizePayroll(id: string): Promise<void> {
    try {
      await axiosInstance.post(HR_API.payrollRunFinalize(id));
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async generatePayroll(id: string): Promise<void> {
    try {
      await axiosInstance.post(HR_API.payrollRunGenerateLines(id));
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async emailPayslip(runId: string, employeeId: string, dto?: PayslipEmailDto): Promise<void> {
    try {
      await axiosInstance.post(HR_API.payrollPayslipEmail(runId, employeeId), dto ?? {});
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async generatePayslip(runId: string, employeeId: string): Promise<void> {
    try {
      await axiosInstance.post(HR_API.payrollPayslip(runId, employeeId));
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async postPayrollGl(id: string): Promise<void> {
    try {
      await axiosInstance.post(HR_API.payrollRunPostGl(id));
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async downloadWps(id: string, year: string, month: string): Promise<void> {
    try {
      await downloadBlobFromPath(HR_API.payrollRunWpsExport(id), `wps-${year}-${month}.xlsx`);
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async downloadWpsSif(id: string, year: string, month: string): Promise<void> {
    try {
      await downloadBlobFromPath(HR_API.payrollRunWpsSif(id), `wps-${year}-${month}.sif`);
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async listSalaryComponents(): Promise<SalaryComponentRecord[]> {
    try {
      const { data } = await axiosInstance.get<unknown>(HR_API.salaryComponents);
      return unwrapList(data)
        .map(normalizeComponent)
        .filter((row): row is SalaryComponentRecord => Boolean(row));
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async upsertSalaryComponent(dto: {
    code: string;
    name: string;
    is_earning?: boolean;
    sort_order?: number;
  }): Promise<void> {
    try {
      await axiosInstance.post(HR_API.salaryComponents, dto);
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async seedSalaryComponents(): Promise<void> {
    try {
      await axiosInstance.post(HR_API.salaryComponentsSeed);
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async savePayrollGlSettings(dto: PayrollGlSettingDto): Promise<void> {
    try {
      await axiosInstance.post(HR_API.payrollGlSettings, dto);
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async getGratuity(employee_id: string, as_of?: string): Promise<unknown> {
    try {
      const { data } = await axiosInstance.get<unknown>(HR_API.gratuity, {
        params: { employee_id, ...(as_of ? { as_of } : {}) },
      });
      return unwrapOne(data) ?? data;
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async exportTimesheetsToPayroll(payroll_year: number, payroll_month: number): Promise<void> {
    try {
      await axiosInstance.post(HR_API.timesheetsExportToPayroll, { payroll_year, payroll_month });
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async listTimesheets(params?: {
    employee_id?: string;
    from?: string;
    to?: string;
    status?: string;
  }): Promise<TimesheetRecord[]> {
    try {
      const { data } = await axiosInstance.get<unknown>(HR_API.timesheets, {
        params: {
          page: 1,
          limit: 100,
          ...(params?.employee_id ? { employee_id: params.employee_id } : {}),
          ...(params?.from ? { from: params.from } : {}),
          ...(params?.to ? { to: params.to } : {}),
          ...(params?.status ? { status: params.status } : {}),
        },
      });
      return unwrapList(data)
        .map(normalizeTimesheet)
        .filter((row): row is TimesheetRecord => Boolean(row));
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async createTimesheet(dto: CreateTimesheetDto): Promise<void> {
    try {
      await axiosInstance.post(HR_API.timesheets, compact(dto));
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async updateTimesheet(id: string, dto: UpdateTimesheetDto): Promise<void> {
    try {
      await axiosInstance.patch(HR_API.timesheet(id), compact(dto));
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async deleteTimesheet(id: string): Promise<void> {
    try {
      await axiosInstance.delete(HR_API.timesheet(id));
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async approveTimesheet(id: string): Promise<void> {
    try {
      await axiosInstance.post(HR_API.timesheetApprove(id));
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async exportTimesheetsPayrollOt(payroll_year: number, payroll_month: number): Promise<void> {
    try {
      await axiosInstance.post(HR_API.timesheetsExportPayrollOt, { payroll_year, payroll_month });
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async listLoans(employee_id: string, status: string): Promise<LoanRecord[]> {
    try {
      const { data } = await axiosInstance.get<unknown>(HR_API.loans, {
        params: { employee_id, status },
      });
      return unwrapList(data)
        .map(normalizeLoan)
        .filter((row): row is LoanRecord => Boolean(row));
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async createLoan(dto: CreateLoanDto): Promise<void> {
    try {
      await axiosInstance.post(HR_API.loans, compact(dto));
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async approveLoan(id: string): Promise<void> {
    try {
      await axiosInstance.patch(HR_API.loanApprove(id));
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async rejectLoan(id: string): Promise<void> {
    try {
      await axiosInstance.patch(HR_API.loanReject(id));
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async reviewLoan(id: string, review: LoanReviewDto): Promise<void> {
    try {
      await axiosInstance.patch(HR_API.loanReview(id), review);
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async getLoanSchedule(id: string): Promise<unknown[]> {
    try {
      const { data } = await axiosInstance.get<unknown>(HR_API.loanSchedule(id));
      return unwrapList(data);
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async loansOutstandingReport(): Promise<unknown[]> {
    try {
      const { data } = await axiosInstance.get<unknown>(HR_API.loansOutstandingReport);
      return unwrapList(data);
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async listAdvances(employee_id: string): Promise<AdvanceRecord[]> {
    try {
      const { data } = await axiosInstance.get<unknown>(HR_API.advances, {
        params: { employee_id },
      });
      return unwrapList(data)
        .map(normalizeAdvance)
        .filter((row): row is AdvanceRecord => Boolean(row));
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async createAdvance(dto: CreateAdvanceDto): Promise<void> {
    try {
      await axiosInstance.post(HR_API.advances, compact(dto));
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async closeAdvance(id: string): Promise<void> {
    try {
      await axiosInstance.patch(HR_API.advanceClose(id));
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async listEvaluationTemplates(): Promise<EvaluationTemplateRecord[]> {
    try {
      const { data } = await axiosInstance.get<unknown>(HR_API.evaluationTemplates);
      return unwrapList(data)
        .map(normalizeEvaluationTemplate)
        .filter((row): row is EvaluationTemplateRecord => Boolean(row));
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async createEvaluationTemplate(dto: { name: string; kpis: Record<string, unknown>[] }): Promise<void> {
    try {
      await axiosInstance.post(HR_API.evaluationTemplates, dto);
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async updateEvaluationTemplate(
    id: string,
    dto: Partial<{ name: string; kpis: Record<string, unknown>[] }>,
  ): Promise<void> {
    try {
      await axiosInstance.patch(HR_API.evaluationTemplate(id), compact(dto));
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async listEvaluationCycles(year = new Date().getFullYear()): Promise<EvaluationCycleRecord[]> {
    try {
      const { data } = await axiosInstance.get<unknown>(HR_API.evaluationCycles, {
        params: { year },
      });
      return unwrapList(data)
        .map(normalizeEvaluationCycle)
        .filter((row): row is EvaluationCycleRecord => Boolean(row));
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async createEvaluationCycle(dto: CreateEvaluationCycleDto): Promise<void> {
    try {
      await axiosInstance.post(HR_API.evaluationCycles, dto);
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async listEvaluations(cycle_id: string, employee_id: string): Promise<EvaluationRecord[]> {
    try {
      const { data } = await axiosInstance.get<unknown>(HR_API.evaluations, {
        params: { cycle_id, employee_id },
      });
      return unwrapList(data)
        .map(normalizeEvaluation)
        .filter((row): row is EvaluationRecord => Boolean(row));
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async createEvaluation(dto: CreateEvaluationDto): Promise<void> {
    try {
      await axiosInstance.post(HR_API.evaluations, dto);
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async submitSelfEvaluation(id: string, dto: SubmitScoresDto): Promise<void> {
    try {
      await axiosInstance.post(HR_API.evaluationSubmitSelf(id), dto);
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async submitManagerEvaluation(id: string, dto: SubmitScoresDto): Promise<void> {
    try {
      await axiosInstance.post(HR_API.evaluationSubmitManager(id), dto);
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async finalizeEvaluation(id: string): Promise<void> {
    try {
      await axiosInstance.post(HR_API.evaluationFinalize(id));
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async listLetters(employee_id: string): Promise<LetterRecord[]> {
    try {
      const { data } = await axiosInstance.get<unknown>(HR_API.letters, {
        params: { employee_id },
      });
      return unwrapList(data)
        .map(normalizeLetter)
        .filter((row): row is LetterRecord => Boolean(row));
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async generateLetter(dto: GenerateLetterDto): Promise<LetterGenerateResult> {
    try {
      const res = await withGatewayRetry(() =>
        axiosInstance.post<ArrayBuffer>(HR_API.lettersGenerate, compact(dto), {
          responseType: 'arraybuffer',
        }),
      );
      const contentType = String(res.headers?.['content-type'] ?? '');
      return parseGenerateLetterResponse(res.data, contentType, dto);
    } catch (error) {
      throw formatArrayBufferAxiosError(error);
    }
  },

  async generateLetterPdf(dto: GenerateLetterDto): Promise<LetterPdfInfo> {
    const result = await this.generateLetter(dto);
    let info = letterPdfInfoFromGenerateResult(result);
    const letterId = info.letter_id || info.letter?.id;
    if (!info.pdfBlob && letterId) {
      const resolved = await resolveLetterPdfFromApi(letterId);
      info = {
        ...info,
        ...resolved,
        letter: info.letter ?? resolved.letter,
        letter_id: letterId,
      };
    }
    const letter =
      info.letter ??
      (letterId ? await this.getLetter(letterId) : null) ??
      ({
        id: letterId || '',
        employee_id: dto.employee_id,
        employee: '—',
        letter_type: dto.letter_type,
        generated_at: new Date().toISOString().slice(0, 10),
        status: 'GENERATED',
      } satisfies LetterRecord);
    return ensureLetterPdfInfo(
      info,
      { ...letter, letter_type: dto.letter_type },
      (id) => this.getEmployee(id),
    );
  },

  async getLetterPdf(id: string): Promise<LetterPdfInfo> {
    const resolved = await resolveLetterPdfFromApi(id);
    const letter = resolved.letter ?? (await this.getLetter(id));
    if (!letter) return { status: 'NOT_FOUND' };
    return ensureLetterPdfInfo(
      { ...resolved, letter_id: id, letter },
      letter,
      (empId) => this.getEmployee(empId),
    );
  },

  async openLetterPdf(source: LetterRecord | string): Promise<void> {
    const id = typeof source === 'string' ? source : source.id;
    const info = await this.getLetterPdf(id);
    const letter = info.letter ?? (await this.getLetter(id));
    if (!letter) throw new Error('Letter not found.');
    const displayName = letterPdfFilename(letter.letter_type, letter.employee_id);
    const branding = letterPdfBranding(letterPdfReference(letter), letter.generated_at);
    if (info.pdfBlob) {
      await openBlobInNewTab(info.pdfBlob, undefined, { filename: displayName, branding });
      return;
    }
    if (!info.pdf_url) throw new Error('Could not open letter PDF.');
    if (info.pdf_url.startsWith('blob:')) {
      const response = await fetch(info.pdf_url);
      const blob = await response.blob();
      await openBlobInNewTab(blob, undefined, { filename: displayName, branding });
      return;
    }
    await filesService.openStoredFile(info.pdf_url, { displayName });
  },

  async openGeneratedLetterPdf(
    result: LetterGenerateResult,
    fallbackType: string,
    fallbackEmployeeId: string,
  ): Promise<void> {
    const letter: LetterRecord =
      result.letter ?? {
        id: '',
        employee_id: fallbackEmployeeId,
        employee: '—',
        letter_type: fallbackType,
        generated_at: '',
        status: 'GENERATED',
      };
    await openResolvedLetterPdf(letter, result.pdfBlob, result.pdfUrl, (empId) =>
      this.getEmployee(empId),
    );
  },

  async downloadLetterPdf(source: LetterRecord | string): Promise<void> {
    const id = typeof source === 'string' ? source : source.id;
    const info = await this.getLetterPdf(id);
    const letter = info.letter ?? (await this.getLetter(id));
    if (!letter) throw new Error('Letter not found.');
    const displayName = letterPdfFilename(letter.letter_type, letter.employee_id);
    const branding = letterPdfBranding(letterPdfReference(letter), letter.generated_at);
    if (info.pdfBlob) {
      await triggerBrandedPdfDownload(info.pdfBlob, displayName, { filename: displayName, branding });
      return;
    }
    if (!info.pdf_url) throw new Error('Could not download letter PDF.');
    if (info.pdf_url.startsWith('blob:')) {
      const response = await fetch(info.pdf_url);
      const blob = await response.blob();
      await triggerBrandedPdfDownload(blob, displayName, { filename: displayName, branding });
      return;
    }
    await filesService.downloadStoredFile(info.pdf_url, { displayName });
  },

  async getLetter(id: string): Promise<LetterRecord | null> {
    try {
      const { data } = await axiosInstance.get<unknown>(HR_API.letter(id));
      return normalizeLetter(unwrapOne(data) ?? data);
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async listAttendance(employee_id: string, from: string, to: string): Promise<AttendanceRecord[]> {
    try {
      const { data } = await axiosInstance.get<unknown>(HR_API.attendance, {
        params: { employee_id, from, to },
      });
      return unwrapList(data)
        .map(normalizeAttendance)
        .filter((row): row is AttendanceRecord => Boolean(row));
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async clockIn(employee_id: string, work_date?: string): Promise<void> {
    try {
      await axiosInstance.post(HR_API.attendanceClockIn, compact({ employee_id, work_date }));
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async clockOut(employee_id: string, work_date?: string): Promise<void> {
    try {
      await axiosInstance.post(HR_API.attendanceClockOut, compact({ employee_id, work_date }));
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async getEmployeeGratuity(employeeId: string, as_of?: string): Promise<unknown> {
    try {
      const date = as_of ?? new Date().toISOString().slice(0, 10);
      const { data } = await axiosInstance.get<unknown>(HR_API.employeeGratuity(employeeId), {
        params: { as_of: date },
      });
      return unwrapOne(data) ?? data;
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async leaveEncashment(employeeId: string, dto: { days: number; leave_type?: string }): Promise<void> {
    try {
      await axiosInstance.post(HR_API.employeeLeaveEncashment(employeeId), dto);
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async documentExpiryReport(within_days = 90): Promise<unknown[]> {
    try {
      const { data } = await axiosInstance.get<unknown>(HR_API.documentExpiryReport, {
        params: { within_days },
      });
      return unwrapList(data);
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async absentReport(date: string, department_id?: string): Promise<unknown[]> {
    try {
      const { data } = await axiosInstance.get<unknown>(HR_API.absentReport, {
        params: { date, ...(department_id ? { department_id } : {}) },
      });
      return unwrapList(data);
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async timesheetsMissingReport(): Promise<unknown[]> {
    try {
      const { data } = await axiosInstance.get<unknown>(HR_API.timesheetsMissingReport);
      return unwrapList(data);
    } catch (error) {
      throw formatAxiosError(error);
    }
  },
};
