import { useEffect, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/Button';
import { hrService } from '../services/hr.service';
import {
  CONTRACT_TYPES,
  EMPLOYEE_STATUSES,
  EMPLOYMENT_TYPES,
  GENDERS,
  MARITAL_STATUSES,
  STAFF_GRADES,
  labelEnum,
} from '../constants/hr.constants';
import { createEmployeeSchema, parseWithFieldErrors, type FieldErrors } from '../schemas/hr.schema';
import type { CreateEmployeeDto } from '../types/hr.types';
import type { EmployeeRow } from '../types/employee.types';

const fieldClass =
  'w-full border border-gray-300 rounded px-3 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#FF751F] focus:border-[#FF751F] bg-white';
const fieldErrorClass =
  'w-full border border-red-400 rounded px-3 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-red-400 focus:border-red-400 bg-white';
const labelClass = 'block text-xs font-medium text-gray-600 mb-1';

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className={labelClass}>{label}</span>
      {children}
      {error ? (
        <span className="mt-1 block text-xs text-red-600" role="alert">
          {error}
        </span>
      ) : null}
    </label>
  );
}

function fromRow(row?: EmployeeRow | null): CreateEmployeeDto {
  return {
    first_name: row?.firstName ?? '',
    last_name: row?.lastName ?? '',
    joining_date: row?.joinDate ?? '',
    email: row?.email ?? '',
    mobile: row?.mobile ?? '',
    nationality: row?.nationality ?? '',
    date_of_birth: row?.birthDate ?? '',
    gender: (row?.gender as CreateEmployeeDto['gender']) || undefined,
    marital_status: (row?.maritalStatus as CreateEmployeeDto['marital_status']) || undefined,
    employment_type: (row?.type as CreateEmployeeDto['employment_type']) || 'FULL_TIME',
    status: (row?.status as CreateEmployeeDto['status']) || 'ACTIVE',
    staff_grade: (row?.grade as CreateEmployeeDto['staff_grade']) || undefined,
    department_id: row?.departmentId || undefined,
    designation_id: row?.designationId || undefined,
    branch_id: row?.branchId || undefined,
    basic_salary: row?.basicSalary || undefined,
    housing_allowance: row?.housingAllowance || undefined,
    transport_allowance: row?.transportAllowance || undefined,
    emergency_name: row?.emergencyName || undefined,
    emergency_phone: row?.emergencyPhone || undefined,
    mol_employee_id: row?.code || undefined,
    contract_type: (row?.contractType as CreateEmployeeDto['contract_type']) || undefined,
    iban: row?.iban || undefined,
    bank_name: row?.bankName || undefined,
  };
}

export function EmployeeForm({
  employee,
  submitting,
  error,
  onSubmit,
}: {
  employee?: EmployeeRow | null;
  submitting?: boolean;
  error?: string | null;
  onSubmit: (dto: CreateEmployeeDto) => void | Promise<void>;
}) {
  const navigate = useNavigate();
  const [values, setValues] = useState<CreateEmployeeDto>(() => fromRow(employee));
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const { data: options } = useQuery({
    queryKey: ['hr', 'master-options'],
    queryFn: () => hrService.listMasterOptions(),
    staleTime: 60_000,
  });

  useEffect(() => {
    setValues(fromRow(employee));
    setFieldErrors({});
  }, [employee]);

  const set = (key: keyof CreateEmployeeDto, value: string) => {
    setFieldErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
    setValues((prev) => {
      const numeric =
        key === 'basic_salary' ||
        key === 'housing_allowance' ||
        key === 'transport_allowance' ||
        key === 'mobile_allowance' ||
        key === 'overtime_rate' ||
        key === 'other_allowance' ||
        key === 'social_security_amount' ||
        key === 'notice_period_days';
      return {
        ...prev,
        [key]: numeric ? (value === '' ? undefined : Number(value)) : value || undefined,
      };
    });
  };

  const inputClass = (key: string) => (fieldErrors[key] ? fieldErrorClass : fieldClass);

  return (
    <form
      className="space-y-4"
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        const parsed = parseWithFieldErrors(createEmployeeSchema, {
          ...values,
          first_name: values.first_name?.trim() ?? '',
          last_name: values.last_name?.trim() ?? '',
          joining_date: values.joining_date,
        });
        if (!parsed.success) {
          setFieldErrors(parsed.fieldErrors);
          return;
        }
        setFieldErrors({});
        void onSubmit(parsed.data as CreateEmployeeDto);
      }}
    >
      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Field label="First name *" error={fieldErrors.first_name}>
          <input
            required
            maxLength={100}
            autoComplete="given-name"
            className={inputClass('first_name')}
            value={values.first_name}
            onChange={(e) => set('first_name', e.target.value)}
          />
        </Field>
        <Field label="Last name *" error={fieldErrors.last_name}>
          <input
            required
            maxLength={100}
            autoComplete="family-name"
            className={inputClass('last_name')}
            value={values.last_name}
            onChange={(e) => set('last_name', e.target.value)}
          />
        </Field>
        <Field label="Joining date *" error={fieldErrors.joining_date}>
          <input
            required
            type="date"
            className={inputClass('joining_date')}
            value={values.joining_date}
            onChange={(e) => set('joining_date', e.target.value)}
          />
        </Field>
        <Field label="Email" error={fieldErrors.email}>
          <input
            type="email"
            maxLength={254}
            autoComplete="email"
            inputMode="email"
            className={inputClass('email')}
            value={values.email ?? ''}
            onChange={(e) => set('email', e.target.value)}
          />
        </Field>
        <Field label="Mobile" error={fieldErrors.mobile}>
          <input
            type="tel"
            maxLength={20}
            autoComplete="tel"
            inputMode="tel"
            placeholder="+971501234567"
            className={inputClass('mobile')}
            value={values.mobile ?? ''}
            onChange={(e) => set('mobile', e.target.value)}
          />
        </Field>
        <Field label="MOL / staff code" error={fieldErrors.mol_employee_id}>
          <input
            maxLength={50}
            className={inputClass('mol_employee_id')}
            value={values.mol_employee_id ?? ''}
            onChange={(e) => set('mol_employee_id', e.target.value)}
          />
        </Field>
        <Field label="Date of birth" error={fieldErrors.date_of_birth}>
          <input
            type="date"
            className={inputClass('date_of_birth')}
            value={values.date_of_birth ?? ''}
            onChange={(e) => set('date_of_birth', e.target.value)}
          />
        </Field>
        <Field label="Nationality" error={fieldErrors.nationality}>
          <input
            maxLength={80}
            className={inputClass('nationality')}
            value={values.nationality ?? ''}
            onChange={(e) => set('nationality', e.target.value)}
          />
        </Field>
        <Field label="Gender" error={fieldErrors.gender}>
          <select
            className={inputClass('gender')}
            value={values.gender ?? ''}
            onChange={(e) => set('gender', e.target.value)}
          >
            <option value="">Select</option>
            {GENDERS.map((item) => (
              <option key={item} value={item}>
                {labelEnum(item)}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Marital status" error={fieldErrors.marital_status}>
          <select
            className={inputClass('marital_status')}
            value={values.marital_status ?? ''}
            onChange={(e) => set('marital_status', e.target.value)}
          >
            <option value="">Select</option>
            {MARITAL_STATUSES.map((item) => (
              <option key={item} value={item}>
                {labelEnum(item)}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Employment type" error={fieldErrors.employment_type}>
          <select
            className={inputClass('employment_type')}
            value={values.employment_type ?? 'FULL_TIME'}
            onChange={(e) => set('employment_type', e.target.value)}
          >
            {EMPLOYMENT_TYPES.map((item) => (
              <option key={item} value={item}>
                {labelEnum(item)}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Status" error={fieldErrors.status}>
          <select
            className={inputClass('status')}
            value={values.status ?? 'ACTIVE'}
            onChange={(e) => set('status', e.target.value)}
          >
            {EMPLOYEE_STATUSES.map((item) => (
              <option key={item} value={item}>
                {labelEnum(item)}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Staff grade" error={fieldErrors.staff_grade}>
          <select
            className={inputClass('staff_grade')}
            value={values.staff_grade ?? ''}
            onChange={(e) => set('staff_grade', e.target.value)}
          >
            <option value="">Select</option>
            {STAFF_GRADES.map((item) => (
              <option key={item} value={item}>
                {labelEnum(item)}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Contract type" error={fieldErrors.contract_type}>
          <select
            className={inputClass('contract_type')}
            value={values.contract_type ?? ''}
            onChange={(e) => set('contract_type', e.target.value)}
          >
            <option value="">Select</option>
            {CONTRACT_TYPES.map((item) => (
              <option key={item} value={item}>
                {labelEnum(item)}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Branch" error={fieldErrors.branch_id}>
          <select
            className={inputClass('branch_id')}
            value={values.branch_id ?? ''}
            onChange={(e) => set('branch_id', e.target.value)}
          >
            <option value="">Select</option>
            {(options?.branches ?? []).map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Department" error={fieldErrors.department_id}>
          <select
            className={inputClass('department_id')}
            value={values.department_id ?? ''}
            onChange={(e) => set('department_id', e.target.value)}
          >
            <option value="">Select</option>
            {(options?.departments ?? []).map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Designation" error={fieldErrors.designation_id}>
          <select
            className={inputClass('designation_id')}
            value={values.designation_id ?? ''}
            onChange={(e) => set('designation_id', e.target.value)}
          >
            <option value="">Select</option>
            {(options?.designations ?? []).map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Basic salary" error={fieldErrors.basic_salary}>
          <input
            type="number"
            min={0}
            step="0.01"
            inputMode="decimal"
            className={inputClass('basic_salary')}
            value={values.basic_salary ?? ''}
            onChange={(e) => set('basic_salary', e.target.value)}
          />
        </Field>
        <Field label="Housing allowance" error={fieldErrors.housing_allowance}>
          <input
            type="number"
            min={0}
            step="0.01"
            inputMode="decimal"
            className={inputClass('housing_allowance')}
            value={values.housing_allowance ?? ''}
            onChange={(e) => set('housing_allowance', e.target.value)}
          />
        </Field>
        <Field label="Transport allowance" error={fieldErrors.transport_allowance}>
          <input
            type="number"
            min={0}
            step="0.01"
            inputMode="decimal"
            className={inputClass('transport_allowance')}
            value={values.transport_allowance ?? ''}
            onChange={(e) => set('transport_allowance', e.target.value)}
          />
        </Field>
        <Field label="Emergency name" error={fieldErrors.emergency_name}>
          <input
            maxLength={120}
            className={inputClass('emergency_name')}
            value={values.emergency_name ?? ''}
            onChange={(e) => set('emergency_name', e.target.value)}
          />
        </Field>
        <Field label="Emergency phone" error={fieldErrors.emergency_phone}>
          <input
            type="tel"
            maxLength={20}
            inputMode="tel"
            className={inputClass('emergency_phone')}
            value={values.emergency_phone ?? ''}
            onChange={(e) => set('emergency_phone', e.target.value)}
          />
        </Field>
        <Field label="IBAN" error={fieldErrors.iban}>
          <input
            maxLength={34}
            autoComplete="off"
            spellCheck={false}
            placeholder="AE070331234567890123456"
            className={inputClass('iban')}
            value={values.iban ?? ''}
            onChange={(e) => set('iban', e.target.value.toUpperCase())}
          />
        </Field>
        <Field label="Bank name" error={fieldErrors.bank_name}>
          <input
            maxLength={120}
            className={inputClass('bank_name')}
            value={values.bank_name ?? ''}
            onChange={(e) => set('bank_name', e.target.value)}
          />
        </Field>
      </div>

      <div className="flex gap-2">
        <Button type="submit" disabled={submitting}>
          {submitting ? 'Saving…' : employee ? 'Save employee' : 'Create employee'}
        </Button>
        <Button type="button" variant="secondary" onClick={() => navigate('/hr/employee-master')}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
