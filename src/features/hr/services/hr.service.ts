import { axiosInstance } from '@/lib/axios';
import { MASTER_PATHS } from '@/features/masters/api/masterPaths';
import { masterService } from '@/features/masters/services/master.service';
import { HR_API } from '../api/hr.api';
import { LEAVE_STATUSES } from '../constants/hr.constants';
import type { EmployeeRow } from '../types/employee.types';
import type {
  AdvanceRecord,
  AttendanceRecord,
  CreateAdvanceDto,
  CreateEmployeeDto,
  CreateEvaluationCycleDto,
  CreateEvaluationDto,
  CreateLoanDto,
  CreateTimesheetDto,
  DependentRecord,
  EvaluationCycleRecord,
  EvaluationRecord,
  EvaluationTemplateRecord,
  GenerateLetterDto,
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
    response?: { data?: { message?: string | string[] }; status?: number };
    message?: string;
  };
  const message = axiosErr.response?.data?.message;
  if (Array.isArray(message)) return new Error(message.map(String).join('; '));
  if (typeof message === 'string' && message.trim()) return new Error(message);
  return new Error(axiosErr.message || 'Request failed');
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
  return {
    id,
    employee_id: str(record, 'employee_id') || nestedId(record.employee),
    employee: nestedName(record.employee) || str(record, 'employee_name') || '—',
    work_date: dateOnly(str(record, 'work_date', 'date')),
    hours: num(record, 'hours'),
    overtime_hours: num(record, 'overtime_hours'),
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
  return {
    id,
    cycle_id: str(record, 'cycle_id') || nestedId(record.cycle),
    employee_id: str(record, 'employee_id') || nestedId(record.employee),
    employee: nestedName(record.employee) || str(record, 'employee_name') || '—',
    status: str(record, 'status') || 'DRAFT',
    self_score: num(record, 'self_score') || undefined,
    manager_score: num(record, 'manager_score') || undefined,
  };
}

function normalizeLetter(raw: unknown): LetterRecord | null {
  const record = asRecord(raw);
  if (!record) return null;
  const id = str(record, 'id');
  if (!id) return null;
  return {
    id,
    employee_id: str(record, 'employee_id') || nestedId(record.employee),
    employee: nestedName(record.employee) || str(record, 'employee_name') || '—',
    letter_type: str(record, 'letter_type', 'type'),
    generated_at: dateOnly(str(record, 'generated_at', 'created_at')),
    status: str(record, 'status') || 'GENERATED',
  };
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

async function triggerBlobDownload(path: string, filename: string): Promise<void> {
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
  }): Promise<PayrollRunRecord | null> {
    try {
      const { data } = await axiosInstance.post<unknown>(HR_API.payrollRuns, dto);
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
      await triggerBlobDownload(HR_API.payrollRunWpsExport(id), `wps-${year}-${month}.xlsx`);
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async downloadWpsSif(id: string, year: string, month: string): Promise<void> {
    try {
      await triggerBlobDownload(HR_API.payrollRunWpsSif(id), `wps-${year}-${month}.sif`);
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

  async generateLetter(dto: GenerateLetterDto): Promise<LetterRecord | null> {
    try {
      const { data } = await axiosInstance.post<unknown>(HR_API.lettersGenerate, compact(dto));
      return normalizeLetter(unwrapOne(data) ?? data);
    } catch (error) {
      throw formatAxiosError(error);
    }
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
