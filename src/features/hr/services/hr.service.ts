import { axiosInstance } from '@/lib/axios';
import { HR_API, VESSEL_SCHEDULES_API } from '../api/hr.api';
import type { EmployeeRow } from '../types/employee.types';

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
  if (Array.isArray(nested.items)) return nested.items;
  if (Array.isArray(nested.results)) return nested.results;
  if (Array.isArray(nested.records)) return nested.records;
  if (Array.isArray(nested.employees)) return nested.employees;
  return [];
}

function str(record: Record<string, unknown>, ...keys: string[]): string {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === 'string' && value.trim()) return value.trim();
    if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  }
  return '';
}

function nestedName(value: unknown): string {
  if (typeof value === 'string') return value;
  const record = asRecord(value);
  if (!record) return '';
  return str(record, 'name', 'title', 'code', 'label');
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

export interface LeaveRequestRow {
  id: string;
  employee: string;
  type: string;
  from: string;
  to: string;
  status: string;
  reason: string;
}

export interface PayrollRunRow {
  id: string;
  year: string;
  month: string;
  status: string;
  currency: string;
}

function normalizeEmployee(raw: unknown): EmployeeRow | null {
  const record = asRecord(raw);
  if (!record) return null;
  const id = str(record, 'id');
  if (!id) return null;
  const first = str(record, 'first_name', 'firstName');
  const last = str(record, 'last_name', 'lastName');
  const name = str(record, 'name', 'full_name', 'fullName') || `${first} ${last}`.trim();
  const statusRaw = str(record, 'status').toUpperCase();
  return {
    id,
    branch: nestedName(record.branch) || str(record, 'branch_name'),
    name: name || '—',
    code: str(record, 'code', 'employee_code', 'employeeCode', 'mol_employee_id', 'staff_code'),
    type: str(record, 'employment_type', 'employmentType', 'type'),
    designation: nestedName(record.designation) || str(record, 'designation_name'),
    department: nestedName(record.department) || str(record, 'department_name'),
    birthDate: str(record, 'date_of_birth', 'dateOfBirth', 'birth_date').slice(0, 10),
    employment: str(record, 'employment_type', 'contract_type', 'employment'),
    gender: str(record, 'gender'),
    grade: str(record, 'staff_grade', 'grade'),
    joinDate: str(record, 'joining_date', 'join_date', 'joinDate').slice(0, 10),
    mobile: str(record, 'mobile', 'phone'),
    status: statusRaw === 'ACTIVE' || statusRaw === 'PROBATION' ? 'ACTIVE' : 'INACTIVE',
  };
}

function normalizeLeaveRequest(raw: unknown): LeaveRequestRow | null {
  const record = asRecord(raw);
  if (!record) return null;
  const id = str(record, 'id');
  if (!id) return null;
  const employee =
    nestedName(record.employee) ||
    str(record, 'employee_name', 'employeeName') ||
    str(record, 'employee_id');
  return {
    id,
    employee: employee || '—',
    type: str(record, 'leave_type', 'type'),
    from: str(record, 'start_date', 'from', 'from_date').slice(0, 10),
    to: str(record, 'end_date', 'to', 'to_date').slice(0, 10),
    status: str(record, 'status') || 'PENDING',
    reason: str(record, 'reason'),
  };
}

function normalizePayrollRun(raw: unknown): PayrollRunRow | null {
  const record = asRecord(raw);
  if (!record) return null;
  const id = str(record, 'id');
  if (!id) return null;
  return {
    id,
    year: str(record, 'payroll_year', 'year'),
    month: str(record, 'payroll_month', 'month'),
    status: str(record, 'status') || 'DRAFT',
    currency: str(record, 'currency_code', 'currency') || 'AED',
  };
}

export const hrService = {
  async listEmployees(params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
  }): Promise<EmployeeRow[]> {
    try {
      const { data } = await axiosInstance.get<unknown>(HR_API.employees, {
        params: {
          page: params?.page ?? 1,
          limit: params?.limit ?? 100,
          ...(params?.search?.trim() ? { search: params.search.trim() } : {}),
          ...(params?.status && params.status !== 'All' ? { status: params.status } : {}),
        },
      });
      return unwrapList(data)
        .map(normalizeEmployee)
        .filter((row): row is EmployeeRow => Boolean(row));
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async listLeaveRequests(params?: {
    employee_id?: string;
    status?: string;
  }): Promise<LeaveRequestRow[]> {
    try {
      const query: Record<string, string> = {};
      if (params?.employee_id) query.employee_id = params.employee_id;
      if (params?.status) query.status = params.status;
      const { data } = await axiosInstance.get<unknown>(HR_API.leaveRequests, {
        params: Object.keys(query).length ? query : undefined,
      });
      return unwrapList(data)
        .map(normalizeLeaveRequest)
        .filter((row): row is LeaveRequestRow => Boolean(row));
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async listPayrollRuns(): Promise<PayrollRunRow[]> {
    try {
      const { data } = await axiosInstance.get<unknown>(HR_API.payrollRuns);
      return unwrapList(data)
        .map(normalizePayrollRun)
        .filter((row): row is PayrollRunRow => Boolean(row));
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async createPayrollRun(dto: {
    payroll_year: number;
    payroll_month: number;
    currency_code?: string;
  }): Promise<PayrollRunRow | null> {
    try {
      const { data } = await axiosInstance.post<unknown>(HR_API.payrollRuns, dto);
      const record = asRecord(data);
      const inner = record?.data ?? data;
      return normalizePayrollRun(inner);
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async listLeaveCalendar(from: string, to: string): Promise<unknown[]> {
    try {
      const { data } = await axiosInstance.get<unknown>(HR_API.leaveCalendar, {
        params: { from, to },
      });
      return unwrapList(data);
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async listVesselSchedules(vesselId: string): Promise<unknown[]> {
    try {
      const { data } = await axiosInstance.get<unknown>(VESSEL_SCHEDULES_API.list(vesselId));
      return unwrapList(data);
    } catch (error) {
      throw formatAxiosError(error);
    }
  },
};
