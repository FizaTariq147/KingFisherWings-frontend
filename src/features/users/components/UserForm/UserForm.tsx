import { useState } from 'react';
import { type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { PhoneInput } from '@/components/ui/PhoneInput';
import { useAppForm } from '@/lib/validation';
import { ASSIGNABLE_USER_ROLES } from '../../constants/user.constants';
import {
  USER_FUNCTIONAL_FLAGS,
  USER_VISIBILITY_PERMISSIONS,
} from '../../constants/userPermissions';
import { useTenantCompanies } from '../../hooks/useTenantCompanies';
import { createUserSchema, updateUserSchema, USER_STATUSES } from '../../schemas/user.schema';
import type { CreateUserFormValues, UpdateUserFormValues } from '../../types/user.types';
import { formatUserRole } from '../../utils/formatUserRole';

interface UserFormProps {
  mode: 'create' | 'edit';
  tenantId?: string;
  defaultValues?: Partial<CreateUserFormValues>;
  onSubmit: (values: CreateUserFormValues | UpdateUserFormValues) => void | Promise<void>;
  isSubmitting?: boolean;
}

const selectClass =
  'h-9 w-full rounded-md border border-[var(--color-neutral-200)] bg-white px-3 text-sm text-[var(--color-neutral-800)] focus:outline-none focus:border-[var(--color-primary-500)] focus:ring-1 focus:ring-[var(--color-primary-500)]';

const FORM_DEFAULTS: Partial<CreateUserFormValues> = {
  // Staff role — not TENANT_ADMIN. Created users get the ops dashboard, not Users admin.
  role: 'SALES_EXECUTIVE',
  status: 'ACTIVE',
  phone: '',
  avatar_url: '',
  company_id: '',
  branch_id: '',
  department_id: '',
  role_ids: [],
  permission_ids: [],
  is_salesperson: false,
  is_cs_rep: false,
  is_operations: false,
  is_finance: false,
  can_see_sales: false,
  can_see_cost: false,
  can_see_gp: false,
  can_see_invoices: false,
  can_see_payments: false,
  can_see_bank_balances: false,
  can_see_ar_ap: false,
  can_see_mgmt_reports: false,
  can_see_job_pnl: false,
  allowed_ips: [],
  allowed_mac_addresses: [],
  office_hours_start: '',
  office_hours_end: '',
  office_hours_timezone: 'Asia/Dubai',
  two_factor_enabled: false,
  max_concurrent_sessions: 3,
};

function splitLines(value: string): string[] {
  return value
    .split(/[\n,]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function joinLines(values?: string[]) {
  return values?.join('\n') ?? '';
}

export function UserForm({
  mode,
  tenantId,
  defaultValues,
  onSubmit,
  isSubmitting,
}: UserFormProps) {
  const schema = mode === 'create' ? createUserSchema : updateUserSchema;
  const { data: companies = [] } = useTenantCompanies(!!tenantId);

  const form = useAppForm<CreateUserFormValues>({
    resolver: zodResolver(schema) as unknown as Resolver<CreateUserFormValues>,
    defaultValues: {
      ...FORM_DEFAULTS,
      tenant_id: tenantId || '',
      ...defaultValues,
    },
  });

  const {
    register,
    handleValidatedSubmit,
    setValue,
    watch,
    formState: { errors },
  } = form;

  const [showAdvanced, setShowAdvanced] = useState(mode === 'edit');
  const [allowedIpsText, setAllowedIpsText] = useState(joinLines(defaultValues?.allowed_ips));
  const [allowedMacText, setAllowedMacText] = useState(
    joinLines(defaultValues?.allowed_mac_addresses),
  );

  const fieldError = (name: keyof CreateUserFormValues) => errors[name]?.message;
  const phone = watch('phone') ?? '';

  const handleFormSubmit = handleValidatedSubmit((values) => {
    onSubmit({
      ...values,
      ...(mode === 'create'
        ? {
            ...(tenantId ? { tenant_id: tenantId } : { tenant_id: '' }),
            branch_id: '',
            department_id: '',
            role_ids: [],
            permission_ids: [],
          }
        : {
            role_ids: values.role_ids ?? [],
            permission_ids: values.permission_ids ?? [],
          }),
      allowed_ips: splitLines(allowedIpsText),
      allowed_mac_addresses: splitLines(allowedMacText),
    });
  });

  return (
    <form onSubmit={handleFormSubmit} className="space-y-4">
      {mode === 'create' && <input type="hidden" {...register('tenant_id')} />}

      <Card>
        <CardHeader className="mb-0 pb-3">
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <Grid>
          <Input label="Email" type="email" error={fieldError('email')} {...register('email')} />
          <Input label="First name" error={fieldError('first_name')} {...register('first_name')} />
          <Input label="Last name" error={fieldError('last_name')} {...register('last_name')} />
          <PhoneInput
            label="Phone"
            name="phone"
            value={phone}
            countryIso="AE"
            error={fieldError('phone')}
            onChange={(v) => setValue('phone', v, { shouldValidate: true, shouldDirty: true })}
          />
        </Grid>
        {mode === 'create' && (
          <p className="mt-3 text-xs text-[var(--color-neutral-500)]">
            Password is generated by the API after create. Use that temporary password on ERP Login →
            Staff / User (slug + email + password).
          </p>
        )}
      </Card>

      <Card>
        <CardHeader className="mb-0 pb-3">
          <CardTitle>Assign role</CardTitle>
        </CardHeader>
        <p className="mb-3 text-xs text-[var(--color-neutral-400)]">
          This user will be created in your tenant only. Tenant cannot be changed.
        </p>
        <p className="mb-3 rounded-md bg-[var(--color-neutral-50)] px-3 py-2 font-mono text-xs text-[var(--color-neutral-600)]">
          {tenantId ? `Tenant ID: ${tenantId}` : 'Tenant: scoped by your signed-in session'}
        </p>
        <Grid>
          <FormSelect label="Company" error={fieldError('company_id')} {...register('company_id')}>
            <option value="">No company assigned</option>
            {companies.map((company) => (
              <option key={company.id} value={company.id}>
                {company.name}
                {company.code ? ` (${company.code})` : ''}
              </option>
            ))}
          </FormSelect>
          <FormSelect label="Role" error={fieldError('role')} {...register('role')}>
            {ASSIGNABLE_USER_ROLES.map((role) => (
              <option key={role} value={role}>
                {formatUserRole(role)}
              </option>
            ))}
          </FormSelect>
          <FormSelect label="Status" error={fieldError('status')} {...register('status')}>
            {USER_STATUSES.map((status) => (
              <option key={status} value={status}>
                {formatUserRole(status)}
              </option>
            ))}
          </FormSelect>
          <input type="hidden" {...register('branch_id')} />
          <input type="hidden" {...register('department_id')} />
        </Grid>
      </Card>

      <Card>
        <CardHeader className="mb-0 pb-3">
          <CardTitle>Assign permissions</CardTitle>
        </CardHeader>
        <p className="mb-3 text-xs text-[var(--color-neutral-400)]">
          Functional flags and data visibility for this user within your tenant.
        </p>
        <div className="space-y-4">
          <div>
            <p className="mb-2 text-xs font-medium text-[var(--color-neutral-600)]">
              Functional flags
            </p>
            <CheckboxGrid>
              {USER_FUNCTIONAL_FLAGS.map((key) => (
                <CheckboxField key={key} label={formatFieldLabel(key)} {...register(key)} />
              ))}
            </CheckboxGrid>
          </div>
          <div>
            <p className="mb-2 text-xs font-medium text-[var(--color-neutral-600)]">
              Visibility permissions
            </p>
            <CheckboxGrid cols={3}>
              {USER_VISIBILITY_PERMISSIONS.map((key) => (
                <CheckboxField key={key} label={formatFieldLabel(key)} {...register(key)} />
              ))}
            </CheckboxGrid>
          </div>
        </div>
      </Card>

      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setShowAdvanced((v) => !v)}
          className="text-xs font-medium text-[var(--color-primary-600)] hover:text-[var(--color-primary-700)]"
        >
          {showAdvanced ? 'Hide advanced settings' : 'Show advanced settings'}
        </button>
      </div>

      {showAdvanced && (
        <>
          <Card>
            <CardHeader className="mb-0 pb-3">
              <CardTitle>Security Settings</CardTitle>
            </CardHeader>
            <div className="space-y-4">
              <Grid>
                <FormTextarea
                  label="Allowed IPs"
                  hint="One per line. Empty = unrestricted."
                  value={allowedIpsText}
                  onChange={(e) => setAllowedIpsText(e.target.value)}
                />
                <FormTextarea
                  label="Allowed MAC addresses"
                  hint="One per line. Empty = unrestricted."
                  value={allowedMacText}
                  onChange={(e) => setAllowedMacText(e.target.value)}
                />
                <Input
                  label="Office hours start"
                  placeholder="09:00"
                  error={fieldError('office_hours_start')}
                  {...register('office_hours_start')}
                />
                <Input
                  label="Office hours end"
                  placeholder="18:00"
                  error={fieldError('office_hours_end')}
                  {...register('office_hours_end')}
                />
                <Input
                  label="Office hours timezone"
                  error={fieldError('office_hours_timezone')}
                  {...register('office_hours_timezone')}
                />
                <Input
                  label="Max concurrent sessions"
                  type="number"
                  min={1}
                  max={20}
                  error={fieldError('max_concurrent_sessions')}
                  {...register('max_concurrent_sessions', { valueAsNumber: true })}
                />
                <Input
                  label="Avatar URL"
                  type="url"
                  error={fieldError('avatar_url')}
                  {...register('avatar_url')}
                />
              </Grid>
              <CheckboxField label="Two-factor enabled" {...register('two_factor_enabled')} />
            </div>
          </Card>
        </>
      )}

      <div className="flex justify-end gap-3 pt-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving…' : mode === 'create' ? 'Create user' : 'Save changes'}
        </Button>
      </div>
    </form>
  );
}

function formatFieldLabel(key: string) {
  return key
    .replace(/^can_see_/, 'Can see ')
    .replace(/^is_/, '')
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function Grid({ children }: { children: ReactNode }) {
  return <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{children}</div>;
}

function CheckboxGrid({ children, cols = 2 }: { children: ReactNode; cols?: 2 | 3 }) {
  const colClass = cols === 3 ? 'sm:grid-cols-2 lg:grid-cols-3' : 'sm:grid-cols-2';
  return <div className={`grid grid-cols-1 ${colClass} gap-3`}>{children}</div>;
}

function CheckboxField({
  label,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  const id = label.toLowerCase().replace(/\s+/g, '-');
  return (
    <label htmlFor={id} className="inline-flex items-center gap-2 text-sm text-[var(--color-neutral-700)] cursor-pointer">
      <input
        id={id}
        type="checkbox"
        className="h-4 w-4 rounded border-[var(--color-neutral-300)] text-[var(--color-primary-500)] focus:ring-[var(--color-primary-500)]"
        {...props}
      />
      {label}
    </label>
  );
}

function FormSelect({
  label,
  error,
  hint,
  children,
  className,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & { label: string; error?: string; hint?: string }) {
  const id = label.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-xs font-medium text-[var(--color-neutral-600)]">
        {label}
      </label>
      <select
        id={id}
        className={`${selectClass} ${error ? 'border-[var(--color-danger-500)]' : ''} ${className ?? ''}`}
        {...props}
      >
        {children}
      </select>
      {hint && <p className="text-xs text-[var(--color-neutral-400)]">{hint}</p>}
      {error && <p className="text-xs text-[var(--color-danger-500)]">{error}</p>}
    </div>
  );
}

function FormTextarea({
  label,
  hint,
  error,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string; hint?: string; error?: string }) {
  const id = label.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-xs font-medium text-[var(--color-neutral-600)]">
        {label}
      </label>
      <textarea
        id={id}
        rows={3}
        className={`w-full rounded-md border border-[var(--color-neutral-200)] bg-white px-3 py-2 text-sm text-[var(--color-neutral-800)] focus:outline-none focus:border-[var(--color-primary-500)] ${error ? 'border-[var(--color-danger-500)]' : ''}`}
        {...props}
      />
      {hint && <p className="text-xs text-[var(--color-neutral-400)]">{hint}</p>}
      {error && <p className="text-xs text-[var(--color-danger-500)]">{error}</p>}
    </div>
  );
}
