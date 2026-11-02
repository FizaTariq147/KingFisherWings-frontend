import { useEffect, useMemo, useRef, useState } from 'react';
import { type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { PhoneInput } from '@/components/ui/PhoneInput';
import { useAppForm } from '@/lib/validation';
import { QuotationWizardNav } from '@/features/quotations/components/quotation-wizard';
import { MASTER_PATHS } from '@/features/masters/api/masterPaths';
import { useMasterOptions } from '@/features/masters/hooks/useMasterResource';
import { ASSIGNABLE_USER_ROLES } from '../../constants/user.constants';
import type { UserRole } from '../../constants/user.constants';
import {
  USER_FUNCTIONAL_FLAGS,
  USER_VISIBILITY_PERMISSIONS,
} from '../../constants/userPermissions';
import { useTenantCompanies } from '../../hooks/useTenantCompanies';
import { useRolePresets } from '../../hooks/useUserPermissionMatrix';
import { createUserSchema, updateUserSchema, USER_STATUSES } from '../../schemas/user.schema';
import type { PermissionMatrixGrant } from '../../types/userPermissionMatrix.types';
import type { CreateUserFormValues, UpdateUserFormValues } from '../../types/user.types';
import { formatUserRole } from '../../utils/formatUserRole';
import { matrixGrantsFromAccessGrants } from '../../utils/normalizeUserPermissionMatrix';
import { UserPermissionMatrixEditor } from '../UserPermissionMatrixEditor';
import { UserRoleSelectGrid, UserWizardStepper } from '../user-wizard';

export type UserFormSubmitMeta = {
  /**
   * Matrix selection as see/read/write (+ access).
   * Create sends `permission_grants` (access) on POST /users when the grid was set;
   * otherwise the backend applies the role preset from `role`.
   */
  permissionGrants: PermissionMatrixGrant[];
  /** True after the admin changes any access radio (not the initial preset load). */
  matrixTouched: boolean;
};

interface UserFormProps {
  mode: 'create' | 'edit';
  /** `wizard` = FRESA-like 3-step create UI; `flat` = existing single-page (edit default). */
  layout?: 'flat' | 'wizard';
  tenantId?: string;
  /** Human-readable tenant label (never show raw UUID in UI). */
  tenantLabel?: string;
  defaultValues?: Partial<CreateUserFormValues>;
  /** Existing matrix grants when editing (GET /users/:id/permission-matrix). */
  initialPermissionGrants?: PermissionMatrixGrant[];
  onSubmit: (
    values: CreateUserFormValues | UpdateUserFormValues,
    meta?: UserFormSubmitMeta,
  ) => void | Promise<void>;
  onCancel?: () => void;
  isSubmitting?: boolean;
  /** When true, hide permission matrix (Overview can keep matrix on its own tab). */
  hidePermissionMatrix?: boolean;
}

function formatFlagLabel(key: string) {
  return key
    .replace(/^can_see_/, 'Can see ')
    .replace(/^is_/, '')
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

const selectClass =
  'h-9 w-full rounded-md border border-[var(--color-neutral-200)] bg-white px-3 text-sm text-[var(--color-neutral-800)] focus:outline-none focus:border-[var(--color-primary-500)] focus:ring-1 focus:ring-[var(--color-primary-500)]';

const FORM_DEFAULTS: Partial<CreateUserFormValues> = {
  // Staff role — not TENANT_ADMIN. Created users get the ops dashboard, not Users admin.
  role: 'SALES_EXECUTIVE',
  status: 'ACTIVE',
  send_email: true,
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
  max_concurrent_sessions: 3,
};

const DETAILS_STEP_FIELDS: (keyof CreateUserFormValues)[] = [
  'email',
  'first_name',
  'last_name',
  'phone',
  'company_id',
  'status',
];

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
  layout = 'flat',
  tenantId,
  tenantLabel,
  defaultValues,
  initialPermissionGrants,
  onSubmit,
  onCancel,
  isSubmitting,
  hidePermissionMatrix = false,
}: UserFormProps) {
  const isWizard = layout === 'wizard' && mode === 'create';
  const [step, setStep] = useState(0);
  const schema = mode === 'create' ? createUserSchema : updateUserSchema;
  const { data: companies = [] } = useTenantCompanies(!!tenantId || isWizard);
  const { data: branches = [] } = useMasterOptions('branches', MASTER_PATHS.branches, true);
  const { data: departments = [] } = useMasterOptions(
    'departments',
    MASTER_PATHS.departments,
    true,
    true,
  );
  const rolePresetsQuery = useRolePresets();
  /** After admin edits the matrix, stop re-applying role presets on role change. */
  const [matrixTouched, setMatrixTouched] = useState(false);

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
    trigger,
    formState: { errors },
  } = form;

  const [showAdvanced, setShowAdvanced] = useState(mode === 'edit');
  const [allowedIpsText, setAllowedIpsText] = useState(joinLines(defaultValues?.allowed_ips));
  const [allowedMacText, setAllowedMacText] = useState(
    joinLines(defaultValues?.allowed_mac_addresses),
  );
  const permissionGrantsRef = useRef<PermissionMatrixGrant[]>([]);
  const skipMatrixTouchRef = useRef(true);

  const fieldError = (name: keyof CreateUserFormValues) => errors[name]?.message;
  const phone = watch('phone') ?? '';
  const role = watch('role');

  const presetGrantsForRole = useMemo(() => {
    if (mode !== 'create' || !role) return [] as PermissionMatrixGrant[];
    const presets = rolePresetsQuery.data?.presets ?? [];
    const match = presets.find((p) => p.code.toUpperCase() === String(role).toUpperCase());
    if (!match?.default_grants?.length) return [] as PermissionMatrixGrant[];
    return matrixGrantsFromAccessGrants(match.default_grants);
  }, [mode, role, rolePresetsQuery.data?.presets]);

  const editorInitialGrants = useMemo(() => {
    if (mode === 'edit' && initialPermissionGrants?.length) {
      return initialPermissionGrants;
    }
    if (mode === 'create' && !matrixTouched && presetGrantsForRole.length) {
      return presetGrantsForRole;
    }
    if (initialPermissionGrants?.length) return initialPermissionGrants;
    return presetGrantsForRole;
  }, [mode, initialPermissionGrants, matrixTouched, presetGrantsForRole]);

  const editorRemountKey = useMemo(() => {
    if (mode === 'edit') return `edit-${JSON.stringify(initialPermissionGrants ?? [])}`;
    if (!matrixTouched) return `role-${role}-${presetGrantsForRole.length}`;
    return `touched-${role}`;
  }, [mode, initialPermissionGrants, matrixTouched, role, presetGrantsForRole.length]);

  // Remount / preset reload emits an initial onChange — don't treat that as a user edit.
  useEffect(() => {
    skipMatrixTouchRef.current = true;
  }, [editorRemountKey]);

  const buildSubmitValues = (values: CreateUserFormValues) => ({
    ...values,
    ...(mode === 'create'
      ? {
          ...(tenantId ? { tenant_id: tenantId } : { tenant_id: '' }),
          role_ids: values.role_ids ?? [],
          permission_ids: values.permission_ids ?? [],
        }
      : {
          role_ids: values.role_ids ?? [],
          permission_ids: values.permission_ids ?? [],
        }),
    allowed_ips: splitLines(allowedIpsText),
    allowed_mac_addresses: splitLines(allowedMacText),
  });

  const submitForm = handleValidatedSubmit((values) => {
    onSubmit(buildSubmitValues(values), {
      permissionGrants: permissionGrantsRef.current,
      matrixTouched,
    });
  });

  const goNext = async () => {
    if (step === 0) {
      const ok = await trigger('role');
      if (!ok || !role) return;
      setStep(1);
      return;
    }
    if (step === 1) {
      const ok = await trigger(DETAILS_STEP_FIELDS);
      if (!ok) return;
      setStep(2);
      return;
    }
    await submitForm();
  };

  const basicFields = (
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
  );

  const assignFields = (
    <Grid>
      {tenantLabel || tenantId ? (
        <div className="flex flex-col gap-1 sm:col-span-2">
          <span className="text-xs font-medium text-[var(--color-neutral-600)]">Tenant</span>
          <div className="flex h-9 items-center rounded-md border border-[var(--color-neutral-200)] bg-[var(--color-neutral-50)] px-3 text-sm text-[var(--color-neutral-800)]">
            {tenantLabel || 'Current workspace'}
          </div>
          {mode === 'create' ? <input type="hidden" {...register('tenant_id')} /> : null}
        </div>
      ) : null}
      <FormSelect label="Company" error={fieldError('company_id')} {...register('company_id')}>
        <option value="">No company assigned</option>
        {companies.map((company) => (
          <option key={company.id} value={company.id}>
            {company.name}
            {company.code ? ` (${company.code})` : ''}
          </option>
        ))}
      </FormSelect>
      <FormSelect label="Branch" error={fieldError('branch_id')} {...register('branch_id')}>
        <option value="">No branch assigned</option>
        {branches.map((b) => {
          const label = String(b.name ?? b.code ?? b.id ?? '').trim() || b.id;
          return (
            <option key={b.id} value={b.id}>
              {label}
            </option>
          );
        })}
      </FormSelect>
      <FormSelect
        label="Department"
        error={fieldError('department_id')}
        {...register('department_id')}
      >
        <option value="">No department assigned</option>
        {departments.map((d) => {
          const label = String(d.name ?? d.code ?? d.id ?? '').trim() || d.id;
          return (
            <option key={d.id} value={d.id}>
              {label}
            </option>
          );
        })}
      </FormSelect>
      {!isWizard ? (
        <FormSelect
          label="Role"
          error={fieldError('role')}
          {...register('role', {
            onChange: () => setMatrixTouched(false),
          })}
        >
          {ASSIGNABLE_USER_ROLES.map((r) => (
            <option key={r} value={r}>
              {formatUserRole(r)}
            </option>
          ))}
        </FormSelect>
      ) : null}
      <FormSelect label="Status" error={fieldError('status')} {...register('status')}>
        {USER_STATUSES.map((status) => (
          <option key={status} value={status}>
            {formatUserRole(status)}
          </option>
        ))}
      </FormSelect>
    </Grid>
  );

  const flagsFields = (
    <div className="space-y-4">
      <div>
        <p className="mb-2 text-xs font-medium text-[var(--color-neutral-600)]">Functional flags</p>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {USER_FUNCTIONAL_FLAGS.map((key) => (
            <label key={key} className="flex items-center gap-2 text-sm text-[var(--color-neutral-800)]">
              <input type="checkbox" className="h-4 w-4" {...register(key)} />
              {formatFlagLabel(key)}
            </label>
          ))}
        </div>
      </div>
      <div>
        <p className="mb-2 text-xs font-medium text-[var(--color-neutral-600)]">
          Visibility permissions
        </p>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {USER_VISIBILITY_PERMISSIONS.map((key) => (
            <label key={key} className="flex items-center gap-2 text-sm text-[var(--color-neutral-800)]">
              <input type="checkbox" className="h-4 w-4" {...register(key)} />
              {formatFlagLabel(key)}
            </label>
          ))}
        </div>
      </div>
    </div>
  );

  const permissionsFields = (
    <div className="space-y-2">
      {mode === 'create' && rolePresetsQuery.data?.available === false ? (
        <p className="text-xs text-[var(--color-neutral-500)]">
          Role presets API is not available yet — matrix starts empty. Defaults will apply after{' '}
          <code className="text-[10px]">GET /users/role-presets</code> is enabled.
        </p>
      ) : null}
      {mode === 'create' && presetGrantsForRole.length > 0 && !matrixTouched ? (
        <p className="text-xs text-[var(--color-neutral-500)]">
          Defaults loaded from role preset for{' '}
          <strong>{formatUserRole(String(role || ''))}</strong>. Change any row to override.
        </p>
      ) : null}
      <UserPermissionMatrixEditor
        key={editorRemountKey}
        initialGrants={editorInitialGrants}
        onChange={(grants) => {
          permissionGrantsRef.current = grants;
          if (skipMatrixTouchRef.current) {
            skipMatrixTouchRef.current = false;
            return;
          }
          setMatrixTouched(true);
        }}
        description="Per submodule: None / Read / Read & Write. Catalog from GET /users/permission-matrix; create sends permission_grants on POST /users."
      />
    </div>
  );

  const securityFields = (
    <Grid>
      <FormTextarea
        label="Allowed IPs"
        value={allowedIpsText}
        onChange={(e) => setAllowedIpsText(e.target.value)}
      />
      <FormTextarea
        label="Allowed MAC addresses"
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
      {mode === 'edit' ? (
        <>
          <label className="inline-flex items-center gap-2 text-sm text-[var(--color-neutral-700)]">
            <input type="checkbox" {...register('single_device_login')} />
            Single-device login
          </label>
          <div className="space-y-1">
            <label className="text-xs font-medium text-[var(--color-neutral-500)]">
              Single-device policy
            </label>
            <select
              className={selectClass}
              {...register('single_device_policy')}
            >
              <option value="">Default</option>
              <option value="TERMINATE_OLDEST">Terminate oldest</option>
              <option value="REJECT_NEW">Reject new</option>
            </select>
          </div>
        </>
      ) : null}
      <Input
        label="Avatar URL"
        type="url"
        error={fieldError('avatar_url')}
        {...register('avatar_url')}
      />
    </Grid>
  );

  if (isWizard) {
    return (
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void goNext();
        }}
        className="mx-auto max-w-5xl space-y-6"
      >
        <input type="hidden" {...register('role')} />

        <UserWizardStepper currentStep={step} />

        {step === 0 ? (
          <div className="rounded-xl bg-white p-5 sm:p-6">
            <UserRoleSelectGrid
              value={role}
              onChange={(next: UserRole) => {
                setMatrixTouched(false);
                setValue('role', next, { shouldValidate: true, shouldDirty: true });
              }}
              error={fieldError('role')}
            />
          </div>
        ) : null}

        {step === 1 ? (
          <div className="rounded-xl bg-white p-5 sm:p-6 space-y-6">
            <div>
              <h3 className="mb-3 text-sm font-semibold text-[var(--color-neutral-800)]">
                Basic Information
              </h3>
              {basicFields}
            </div>
            <div>
              <h3 className="mb-3 text-sm font-semibold text-[var(--color-neutral-800)]">
                Organization & status
              </h3>
              {assignFields}
            </div>
            <div>
              <h3 className="mb-3 text-sm font-semibold text-[var(--color-neutral-800)]">
                Flags & visibility
              </h3>
              {flagsFields}
            </div>
          </div>
        ) : null}

        {step === 2 ? (
          <div className="rounded-xl bg-white p-5 sm:p-6 space-y-6">
            {!hidePermissionMatrix ? (
              <div>
                <h3 className="mb-3 text-sm font-semibold text-[var(--color-neutral-800)]">
                  Assign permissions
                </h3>
                {permissionsFields}
              </div>
            ) : null}
            <label className="flex items-start gap-2 rounded-lg border border-[var(--color-neutral-200)] bg-[var(--color-neutral-50)] px-3 py-2.5 text-sm">
              <input type="checkbox" className="mt-0.5" {...register('send_email')} />
              <span>
                <span className="font-medium text-[var(--color-neutral-800)]">
                  Send credentials email
                </span>
                <span className="mt-0.5 block text-xs text-[var(--color-neutral-500)]">
                  Email login details and a temporary password to the new user (same pattern as
                  portal / vendor invites).
                </span>
              </span>
            </label>
            <div>
              <div className="mb-3 flex items-center justify-between gap-2">
                <h3 className="text-sm font-semibold text-[var(--color-neutral-800)]">
                  Security settings
                </h3>
                <button
                  type="button"
                  onClick={() => setShowAdvanced((v) => !v)}
                  className="text-xs font-medium text-[var(--color-primary-600)] hover:text-[var(--color-primary-700)]"
                >
                  {showAdvanced ? 'Hide' : 'Show'}
                </button>
              </div>
              {showAdvanced ? securityFields : null}
            </div>
          </div>
        ) : null}

        <QuotationWizardNav
          currentStep={step}
          onPrevious={() => setStep((s) => Math.max(0, s - 1))}
          onCancel={onCancel ?? (() => undefined)}
          onNext={() => void goNext()}
          isSubmitting={isSubmitting}
          nextLabel={step === 2 ? 'Create user' : 'Next'}
          disableNext={step === 0 && !role}
        />
      </form>
    );
  }

  return (
    <form onSubmit={submitForm} className="space-y-4">
      <Card>
        <CardHeader className="mb-0 pb-3">
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        {basicFields}
      </Card>

      <Card>
        <CardHeader className="mb-0 pb-3">
          <CardTitle>Organization & role</CardTitle>
        </CardHeader>
        {assignFields}
      </Card>

      {mode === 'create' ? (
        <Card>
          <CardHeader className="mb-0 pb-3">
            <CardTitle>Credentials email</CardTitle>
          </CardHeader>
          <label className="flex items-start gap-2 px-1 pb-1 text-sm">
            <input type="checkbox" className="mt-0.5" {...register('send_email')} />
            <span>
              <span className="font-medium text-[var(--color-neutral-800)]">
                Send credentials email
              </span>
              <span className="mt-0.5 block text-xs text-[var(--color-neutral-500)]">
                Email login + temporary password to the new user (like portal / vendor).
              </span>
            </span>
          </label>
        </Card>
      ) : null}

      <Card>
        <CardHeader className="mb-0 pb-3">
          <CardTitle>Flags & visibility</CardTitle>
        </CardHeader>
        {flagsFields}
      </Card>

      {!hidePermissionMatrix ? (
        <Card>
          <CardHeader className="mb-0 pb-3">
            <CardTitle>Assign permissions</CardTitle>
          </CardHeader>
          {permissionsFields}
        </Card>
      ) : null}

      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setShowAdvanced((v) => !v)}
          className="text-xs font-medium text-[var(--color-primary-600)] hover:text-[var(--color-primary-700)]"
        >
          {showAdvanced ? 'Hide advanced settings' : 'Show advanced settings'}
        </button>
      </div>

      {showAdvanced ? (
        <Card>
          <CardHeader className="mb-0 pb-3">
            <CardTitle>Security Settings</CardTitle>
          </CardHeader>
          {securityFields}
        </Card>
      ) : null}

      <div className="flex justify-end gap-3 pt-2">
        {onCancel ? (
          <Button type="button" variant="secondary" disabled={isSubmitting} onClick={onCancel}>
            Cancel
          </Button>
        ) : null}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving…' : mode === 'create' ? 'Create user' : 'Save changes'}
        </Button>
      </div>
    </form>
  );
}

function Grid({ children }: { children: ReactNode }) {
  return <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{children}</div>;
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
