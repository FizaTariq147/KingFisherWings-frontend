import { useState } from 'react';
import { useFieldArray, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { isUuid } from '@/lib/isUuid';
import { useAppForm } from '@/lib/validation';
import { QuotationWizardNav } from '@/features/quotations/components/quotation-wizard';
import { MASTER_PATHS } from '@/features/masters/api/masterPaths';
import { useMasterOptions } from '@/features/masters/hooks/useMasterResource';
import { useParties } from '@/features/parties/hooks/useParties';
import { loadPartyCurrencyOptions } from '@/features/parties/utils/partyCurrencyOptions';
import { useTenantCompanies } from '@/features/users/hooks/useTenantCompanies';
import {
  INVOICE_CREATE_WIZARD_STEPS,
  type InvoiceCreateMode,
} from '../../constants/invoiceWizard.constants';
import { createInvoiceSchema, updateInvoiceSchema } from '../../schemas/invoice.schema';
import type { CreateInvoiceFormValues, UpdateInvoiceFormValues } from '../../types/invoice.types';
import { INVOICE_FORM_DEFAULTS } from '../../utils/invoiceToFormValues';
import { InvoiceSourceSelectGrid, InvoiceWizardStepper } from '../invoice-wizard';

const selectClass =
  'h-9 w-full rounded-md border border-[var(--color-neutral-200)] bg-white px-3 text-sm focus:outline-none focus:border-[var(--color-primary-500)]';

const labelClass = 'text-xs font-medium text-[var(--color-neutral-500)]';

interface InvoiceFormProps {
  mode: 'create' | 'edit';
  /** `wizard` = create-job-like multi-step UI; `flat` = existing single-page (edit default). */
  layout?: 'flat' | 'wizard';
  defaultValues?: Partial<CreateInvoiceFormValues>;
  onSubmit: (values: CreateInvoiceFormValues | UpdateInvoiceFormValues) => void | Promise<void>;
  /** Same API as before: POST create-from-job when user chose that path. */
  onCreateFromJob?: (jobId: string) => void | Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-xs text-[var(--color-danger-500)]">{message}</p>;
}

const INFO_STEP_FIELDS: (keyof CreateInvoiceFormValues)[] = [
  'party_id',
  'currency_code',
  'company_id',
  'branch_id',
  'department_id',
  'job_id',
  'exchange_rate',
  'vat_rate',
  'invoice_date',
  'due_date',
  'lpo_number',
];

export function InvoiceForm({
  mode,
  layout = 'flat',
  defaultValues,
  onSubmit,
  onCreateFromJob,
  onCancel,
  isSubmitting,
}: InvoiceFormProps) {
  const isWizard = layout === 'wizard' && mode === 'create';
  const [step, setStep] = useState(0);
  const [createMode, setCreateMode] = useState<InvoiceCreateMode>('MANUAL');
  const [fromJobId, setFromJobId] = useState('');
  const [sourceError, setSourceError] = useState<string | null>(null);

  const schema = mode === 'create' ? createInvoiceSchema : updateInvoiceSchema;
  const { data: companies = [] } = useTenantCompanies(true);
  const { data: partiesResult } = useParties({
    page: 1,
    limit: 200,
    party_type: 'CUSTOMER',
    order: 'asc',
  });
  const { data: allPartiesResult } = useParties({ page: 1, limit: 200, order: 'asc' });
  const { data: branches = [] } = useMasterOptions('branches', MASTER_PATHS.branches, true);
  const { data: departments = [] } = useMasterOptions(
    'departments',
    MASTER_PATHS.departments,
    true,
  );
  const { data: currencies = [] } = useQuery({
    queryKey: ['tenant', 'invoices', 'currency-options'],
    queryFn: loadPartyCurrencyOptions,
    staleTime: 60_000,
  });

  const parties = (
    (partiesResult?.parties?.length ? partiesResult.parties : allPartiesResult?.parties) ?? []
  ).filter((p) => isUuid(p.id));

  const {
    register,
    control,
    handleValidatedSubmit,
    applyApiErrors,
    watch,
    getValues,
    trigger,
    formState: { errors, isSubmitted, isValid },
  } = useAppForm<CreateInvoiceFormValues>({
    mode: 'onBlur',
    resolver: zodResolver(schema) as Resolver<CreateInvoiceFormValues>,
    defaultValues: { ...INVOICE_FORM_DEFAULTS, ...defaultValues },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'lines',
  });

  const watched = watch();

  const fieldError = (name: keyof CreateInvoiceFormValues) =>
    errors[name]?.message as string | undefined;

  const uuidSelect = {
    setValueAs: (v: unknown) => {
      if (v == null) return undefined;
      const s = String(v).trim();
      return s && isUuid(s) ? s : undefined;
    },
  };

  const submitManual = handleValidatedSubmit(async (values) => {
    try {
      await onSubmit(values);
    } catch (err) {
      applyApiErrors(err);
      throw err;
    }
  });

  const goNext = async () => {
    setSourceError(null);
    if (step === 0) {
      if (!createMode) {
        setSourceError('Select how you want to create the invoice.');
        return;
      }
      if (createMode === 'FROM_JOB') {
        if (!isUuid(fromJobId.trim())) {
          setSourceError('Enter a valid job UUID to continue.');
          return;
        }
      }
      setStep(1);
      return;
    }

    if (createMode === 'FROM_JOB') {
      // From-job path: skip detailed validation; jump toward summary or advance steps.
      if (step < INVOICE_CREATE_WIZARD_STEPS.length - 1) {
        setStep((s) => s + 1);
        return;
      }
      if (!onCreateFromJob) {
        setSourceError('Create from job is not available.');
        return;
      }
      await onCreateFromJob(fromJobId.trim());
      return;
    }

    if (step === 1) {
      const ok = await trigger(INFO_STEP_FIELDS);
      if (!ok) return;
      setStep(2);
      return;
    }
    if (step === 2) {
      setStep(3);
      return;
    }
    if (step === 3) {
      setStep(4);
      return;
    }
    await submitManual();
  };

  const partyOptions = parties.map((p) => (
    <option key={p.id} value={p.id}>
      {p.code ? `${p.name} (${p.code})` : p.name}
    </option>
  ));

  const currencyOptions = (currencies.length ? currencies : [{ value: 'AED', label: 'AED' }]).map(
    (c) => (
      <option key={String(c.value)} value={String(c.value)}>
        {String(c.label ?? c.value)}
      </option>
    ),
  );

  const companyOptions = companies
    .filter((c) => isUuid(String(c.id)))
    .map((c) => (
      <option key={String(c.id)} value={String(c.id)}>
        {String(c.name ?? c.code ?? c.id)}
      </option>
    ));

  const branchOptions = branches
    .filter((b) => isUuid(String(b.id)))
    .map((b) => (
      <option key={String(b.id)} value={String(b.id)}>
        {String(b.name ?? b.code ?? b.id)}
      </option>
    ));

  const departmentOptions = departments
    .filter((d) => isUuid(String(d.id)))
    .map((d) => (
      <option key={String(d.id)} value={String(d.id)}>
        {String(d.name ?? d.code ?? d.id)}
      </option>
    ));

  const headerFields = (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div className="space-y-1 sm:col-span-2">
        <label htmlFor="invoice-party" className={labelClass}>
          Party *
        </label>
        <select id="invoice-party" className={selectClass} {...register('party_id')}>
          <option value="">Select…</option>
          {partyOptions}
        </select>
        <FieldError message={fieldError('party_id')} />
      </div>
      <div className="space-y-1">
        <label htmlFor="invoice-currency" className={labelClass}>
          Currency *
        </label>
        <select id="invoice-currency" className={selectClass} {...register('currency_code')}>
          {currencyOptions}
        </select>
        <FieldError message={fieldError('currency_code')} />
      </div>
      <div className="space-y-1">
        <label htmlFor="invoice-company" className={labelClass}>
          Company
        </label>
        <select id="invoice-company" className={selectClass} {...register('company_id', uuidSelect)}>
          <option value="">—</option>
          {companyOptions}
        </select>
      </div>
      <Input label="Job ID" placeholder="UUID" {...register('job_id', uuidSelect)} />
      <Input
        label="Exchange rate"
        type="number"
        step="any"
        {...register('exchange_rate', {
          setValueAs: (v) => {
            if (v === '' || v == null) return undefined;
            const n = Number(v);
            return Number.isFinite(n) ? n : undefined;
          },
        })}
      />
      <Input
        label="VAT rate %"
        type="number"
        step="any"
        {...register('vat_rate', {
          setValueAs: (v) => {
            if (v === '' || v == null) return undefined;
            const n = Number(v);
            return Number.isFinite(n) ? n : undefined;
          },
        })}
      />
      <Input label="Invoice date" type="date" {...register('invoice_date')} />
      <Input label="Due date" type="date" {...register('due_date')} />
      <Input label="LPO number" {...register('lpo_number')} />
    </div>
  );

  const orgFields = (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div className="space-y-1">
        <label htmlFor="invoice-branch" className={labelClass}>
          Branch
        </label>
        <select id="invoice-branch" className={selectClass} {...register('branch_id', uuidSelect)}>
          <option value="">—</option>
          {branchOptions}
        </select>
      </div>
      <div className="space-y-1">
        <label htmlFor="invoice-department" className={labelClass}>
          Department
        </label>
        <select
          id="invoice-department"
          className={selectClass}
          {...register('department_id', uuidSelect)}
        >
          <option value="">—</option>
          {departmentOptions}
        </select>
      </div>
    </div>
  );

  const notesFields = (
    <div className="grid grid-cols-1 gap-4">
      <div className="space-y-1">
        <label htmlFor="invoice-remarks" className={labelClass}>
          Remarks
        </label>
        <textarea
          id="invoice-remarks"
          className="min-h-[72px] w-full rounded-md border border-[var(--color-neutral-200)] px-3 py-2 text-sm"
          {...register('remarks')}
        />
      </div>
      <div className="space-y-1">
        <label htmlFor="invoice-internal-notes" className={labelClass}>
          Internal notes
        </label>
        <textarea
          id="invoice-internal-notes"
          className="min-h-[72px] w-full rounded-md border border-[var(--color-neutral-200)] px-3 py-2 text-sm"
          {...register('internal_notes')}
        />
      </div>
    </div>
  );

  const lineRows = fields.map((field, index) => (
    <div
      key={field.id}
      className="grid grid-cols-1 items-end gap-2 border-b border-[var(--color-neutral-100)] pb-3 sm:grid-cols-12"
    >
      <div className="sm:col-span-5">
        <Input label="Description *" {...register(`lines.${index}.description`)} />
      </div>
      <div className="sm:col-span-2">
        <Input
          label="Qty"
          type="number"
          step="any"
          {...register(`lines.${index}.quantity`, { valueAsNumber: true })}
        />
      </div>
      <div className="sm:col-span-3">
        <Input
          label="Unit price *"
          type="number"
          step="any"
          {...register(`lines.${index}.unit_price`, { valueAsNumber: true })}
        />
      </div>
      <div className="flex justify-end pb-1 sm:col-span-2">
        <Button type="button" variant="danger" onClick={() => remove(index)}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  ));

  const linesEditor = (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-[var(--color-neutral-800)]">Charge lines</h3>
        {createMode === 'MANUAL' || !isWizard ? (
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() =>
              append({
                description: '',
                quantity: 1,
                unit_price: 0,
                is_taxable: true,
                sort_order: fields.length,
              })
            }
          >
            <Plus className="h-4 w-4" />
            Add line
          </Button>
        ) : null}
      </div>
      {createMode === 'FROM_JOB' && isWizard ? (
        <p className="text-sm text-[var(--color-neutral-500)]">
          Charge lines will be generated from the selected job when you submit.
        </p>
      ) : null}
      {fields.length === 0 && createMode === 'MANUAL' ? (
        <p className="text-sm text-[var(--color-neutral-400)]">
          No lines yet. You can add lines here or on the detail page after save.
        </p>
      ) : null}
      {lineRows}
    </div>
  );

  const summaryPanel = (
    <div className="space-y-4 text-sm">
      <h3 className="text-sm font-semibold text-[var(--color-neutral-800)]">Summary</h3>
      {createMode === 'FROM_JOB' ? (
        <dl className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <div>
            <dt className="text-xs text-[var(--color-neutral-400)]">Create mode</dt>
            <dd className="mt-0.5 text-[var(--color-neutral-800)]">Create from Job</dd>
          </div>
          <div>
            <dt className="text-xs text-[var(--color-neutral-400)]">Job ID</dt>
            <dd className="mt-0.5 font-mono text-[var(--color-neutral-800)]">{fromJobId.trim()}</dd>
          </div>
        </dl>
      ) : (
        <dl className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <div>
            <dt className="text-xs text-[var(--color-neutral-400)]">Party</dt>
            <dd className="mt-0.5 text-[var(--color-neutral-800)]">
              {parties.find((p) => p.id === watched.party_id)?.name || watched.party_id || '—'}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-[var(--color-neutral-400)]">Currency</dt>
            <dd className="mt-0.5 text-[var(--color-neutral-800)]">{watched.currency_code || '—'}</dd>
          </div>
          <div>
            <dt className="text-xs text-[var(--color-neutral-400)]">Invoice date</dt>
            <dd className="mt-0.5 text-[var(--color-neutral-800)]">{watched.invoice_date || '—'}</dd>
          </div>
          <div>
            <dt className="text-xs text-[var(--color-neutral-400)]">Due date</dt>
            <dd className="mt-0.5 text-[var(--color-neutral-800)]">{watched.due_date || '—'}</dd>
          </div>
          <div>
            <dt className="text-xs text-[var(--color-neutral-400)]">Job ID</dt>
            <dd className="mt-0.5 font-mono text-[var(--color-neutral-800)]">
              {watched.job_id || '—'}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-[var(--color-neutral-400)]">Lines</dt>
            <dd className="mt-0.5 text-[var(--color-neutral-800)]">
              {(getValues('lines') ?? []).length}
            </dd>
          </div>
        </dl>
      )}
    </div>
  );

  if (isWizard) {
    const totalSteps = INVOICE_CREATE_WIZARD_STEPS.length;
    const nextLabel =
      step === totalSteps - 1
        ? createMode === 'FROM_JOB'
          ? 'Create from job'
          : 'Create invoice'
        : 'Next';

    return (
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void goNext();
        }}
        className="mx-auto max-w-5xl space-y-6"
        noValidate
      >
        <InvoiceWizardStepper currentStep={step} />

        {step === 0 ? (
          <div className="space-y-5 rounded-xl border border-[var(--color-neutral-200)] bg-white p-5 sm:p-6">
            {orgFields}
            <InvoiceSourceSelectGrid
              value={createMode}
              onChange={(m) => {
                setCreateMode(m);
                setSourceError(null);
              }}
              error={sourceError ?? undefined}
            />
            {createMode === 'FROM_JOB' ? (
              <Input
                label="Job UUID *"
                value={fromJobId}
                onChange={(e) => {
                  setFromJobId(e.target.value);
                  setSourceError(null);
                }}
                placeholder="Uninvoiced job id"
              />
            ) : null}
          </div>
        ) : null}

        {step === 1 ? (
          <div className="rounded-xl border border-[var(--color-neutral-200)] bg-white p-5 sm:p-6">
            {createMode === 'FROM_JOB' ? (
              <p className="text-sm text-[var(--color-neutral-500)]">
                Invoice header fields will be filled from the job on create. Continue to review and
                submit.
              </p>
            ) : (
              headerFields
            )}
          </div>
        ) : null}

        {step === 2 ? (
          <div className="rounded-xl border border-[var(--color-neutral-200)] bg-white p-5 sm:p-6">
            {createMode === 'FROM_JOB' ? (
              <p className="text-sm text-[var(--color-neutral-500)]">
                Remarks can be edited on the invoice detail page after creation.
              </p>
            ) : (
              notesFields
            )}
          </div>
        ) : null}

        {step === 3 ? (
          <div className="rounded-xl border border-[var(--color-neutral-200)] bg-white p-5 sm:p-6">
            {linesEditor}
          </div>
        ) : null}

        {step === 4 ? (
          <div className="rounded-xl border border-[var(--color-neutral-200)] bg-white p-5 sm:p-6">
            {summaryPanel}
          </div>
        ) : null}

        <QuotationWizardNav
          currentStep={step}
          totalSteps={totalSteps}
          onPrevious={() => setStep((s) => Math.max(0, s - 1))}
          onCancel={onCancel}
          onNext={() => void goNext()}
          isSubmitting={isSubmitting}
          nextLabel={nextLabel}
          disableNext={step === 0 && !createMode}
        />
      </form>
    );
  }

  return (
    <form
      onSubmit={handleValidatedSubmit(async (values) => {
        try {
          await onSubmit(values);
        } catch (err) {
          applyApiErrors(err);
          throw err;
        }
      })}
      className="max-w-4xl space-y-4"
      noValidate
    >
      {isSubmitted && !isValid && (
        <div
          role="alert"
          className="rounded-lg border px-3 py-2 text-sm"
          style={{
            background: 'var(--color-danger-100)',
            borderColor: '#FECACA',
            color: 'var(--color-danger-700)',
          }}
        >
          Please fix the highlighted fields before saving.
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Invoice header</CardTitle>
        </CardHeader>
        <div className="grid grid-cols-1 gap-4 p-4 pt-0 sm:grid-cols-2">
          <div className="space-y-1 sm:col-span-2">
            <label htmlFor="invoice-party-flat" className={labelClass}>
              Party *
            </label>
            <select id="invoice-party-flat" className={selectClass} {...register('party_id')}>
              <option value="">Select…</option>
              {partyOptions}
            </select>
            <FieldError message={fieldError('party_id')} />
          </div>
          <div className="space-y-1">
            <label htmlFor="invoice-currency-flat" className={labelClass}>
              Currency *
            </label>
            <select id="invoice-currency-flat" className={selectClass} {...register('currency_code')}>
              {currencyOptions}
            </select>
            <FieldError message={fieldError('currency_code')} />
          </div>
          <div className="space-y-1">
            <label htmlFor="invoice-company-flat" className={labelClass}>
              Company
            </label>
            <select
              id="invoice-company-flat"
              className={selectClass}
              {...register('company_id', uuidSelect)}
            >
              <option value="">—</option>
              {companyOptions}
            </select>
          </div>
          <div className="space-y-1">
            <label htmlFor="invoice-branch-flat" className={labelClass}>
              Branch
            </label>
            <select
              id="invoice-branch-flat"
              className={selectClass}
              {...register('branch_id', uuidSelect)}
            >
              <option value="">—</option>
              {branchOptions}
            </select>
          </div>
          <div className="space-y-1">
            <label htmlFor="invoice-department-flat" className={labelClass}>
              Department
            </label>
            <select
              id="invoice-department-flat"
              className={selectClass}
              {...register('department_id', uuidSelect)}
            >
              <option value="">—</option>
              {departmentOptions}
            </select>
          </div>
          <Input label="Job ID" placeholder="UUID" {...register('job_id', uuidSelect)} />
          <Input
            label="Exchange rate"
            type="number"
            step="any"
            {...register('exchange_rate', {
              setValueAs: (v) => {
                if (v === '' || v == null) return undefined;
                const n = Number(v);
                return Number.isFinite(n) ? n : undefined;
              },
            })}
          />
          <Input
            label="VAT rate %"
            type="number"
            step="any"
            {...register('vat_rate', {
              setValueAs: (v) => {
                if (v === '' || v == null) return undefined;
                const n = Number(v);
                return Number.isFinite(n) ? n : undefined;
              },
            })}
          />
          <Input label="Invoice date" type="date" {...register('invoice_date')} />
          <Input label="Due date" type="date" {...register('due_date')} />
          <Input label="LPO number" {...register('lpo_number')} />
          <div className="space-y-1 sm:col-span-2">
            <label htmlFor="invoice-remarks-flat" className={labelClass}>
              Remarks
            </label>
            <textarea
              id="invoice-remarks-flat"
              className="min-h-[64px] w-full rounded-md border border-[var(--color-neutral-200)] px-3 py-2 text-sm"
              {...register('remarks')}
            />
          </div>
          <div className="space-y-1 sm:col-span-2">
            <label htmlFor="invoice-internal-notes-flat" className={labelClass}>
              Internal notes
            </label>
            <textarea
              id="invoice-internal-notes-flat"
              className="min-h-[64px] w-full rounded-md border border-[var(--color-neutral-200)] px-3 py-2 text-sm"
              {...register('internal_notes')}
            />
          </div>
        </div>
      </Card>

      {mode === 'create' && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2">
            <CardTitle>Lines (optional)</CardTitle>
            <Button
              type="button"
              variant="secondary"
              onClick={() =>
                append({
                  description: '',
                  quantity: 1,
                  unit_price: 0,
                  is_taxable: true,
                  sort_order: fields.length,
                })
              }
            >
              <Plus className="h-4 w-4" />
              Add line
            </Button>
          </CardHeader>
          <div className="space-y-3 p-4 pt-0">
            {fields.length === 0 && (
              <p className="text-sm text-[var(--color-neutral-400)]">
                No lines yet. You can add lines here or on the detail page after save.
              </p>
            )}
            {lineRows}
          </div>
        </Card>
      )}

      <div className="flex justify-end gap-2">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving…' : mode === 'create' ? 'Create invoice' : 'Save changes'}
        </Button>
      </div>
    </form>
  );
}
