import { useState } from 'react';
import { type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useAppForm } from '@/lib/validation';
import { PERIOD_TYPES, SERVICE_TYPES, crmLabel, type PeriodType, type ServiceType } from '../constants/crm.constants';
import { CrmSalespersonSelect } from '../components/CrmFormControls';
import { CrmAlert, CrmEmpty, CrmPageHeader, Field, SelectInput, TextInput, tdClass, thClass } from '../components/CrmUi';
import { useCreateCrmBudget, useCrmBudgets } from '../hooks/useCrmDashboard';
import { createBudgetSchema, type CreateBudgetFormValues } from '../schemas/crm.schema';
import { getErrorMessage } from '../utils/getErrorMessage';
import { prepareCrmPayload } from '../utils/prepareCrmPayload';

const defaults: CreateBudgetFormValues = {
  salesperson_id: '',
  period_type: 'MONTHLY',
  period_start: '',
  target_amount: 0,
};

export default function CrmBudgetsPage() {
  const [salesperson, setSalesperson] = useState('');
  const query = useCrmBudgets(salesperson || undefined);
  const create = useCreateCrmBudget();

  const form = useAppForm<CreateBudgetFormValues>({
    resolver: zodResolver(createBudgetSchema) as unknown as Resolver<CreateBudgetFormValues>,
    defaultValues: defaults,
  });
  const { register, handleValidatedSubmit, watch, setValue, formState: { errors } } = form;
  const err = (name: keyof CreateBudgetFormValues) =>
    errors[name]?.message ? String(errors[name]?.message) : undefined;

  return (
    <div className="space-y-4">
      <CrmPageHeader
        title="Sales Budget"
        description="Set salesperson targets by period and service type, then compare actual performance."
      />
      <Card className="p-4">
        <form
          className="space-y-3"
          onSubmit={handleValidatedSubmit(async (values) => {
            await create.mutateAsync(prepareCrmPayload(values) as CreateBudgetFormValues);
            setSalesperson(values.salesperson_id);
          })}
        >
          <h2 className="font-semibold">Create budget</h2>
          {create.isError && <CrmAlert>{getErrorMessage(create.error)}</CrmAlert>}
          {create.isSuccess && <CrmAlert success>Budget created.</CrmAlert>}
          <div className="grid gap-3 md:grid-cols-3">
            <CrmSalespersonSelect
              label="Salesperson"
              required
              value={watch('salesperson_id') ?? ''}
              onChange={(v) => setValue('salesperson_id', v, { shouldValidate: true })}
              error={err('salesperson_id')}
              allowEmpty={false}
            />
            <Field label="Period type" required error={err('period_type')}>
              <SelectInput {...register('period_type')}>
                {PERIOD_TYPES.map((x) => (
                  <option key={x} value={x}>
                    {crmLabel(x)}
                  </option>
                ))}
              </SelectInput>
            </Field>
            <Field label="Period start" required error={err('period_start')}>
              <TextInput type="date" {...register('period_start')} />
            </Field>
            <Field label="Target amount" required error={err('target_amount')}>
              <TextInput type="number" min={0} step="0.01" {...register('target_amount', { valueAsNumber: true })} />
            </Field>
            <Field label="Target volume" error={err('target_volume')}>
              <TextInput type="number" min={0} {...register('target_volume', { valueAsNumber: true })} />
            </Field>
            <Field label="Service type" error={err('job_type')}>
              <SelectInput
                value={watch('job_type') ?? ''}
                onChange={(e) =>
                  setValue('job_type', (e.target.value as ServiceType) || undefined, { shouldValidate: true })
                }
              >
                <option value="">All services</option>
                {SERVICE_TYPES.map((x) => (
                  <option key={x} value={x}>
                    {crmLabel(x)}
                  </option>
                ))}
              </SelectInput>
            </Field>
          </div>
          <div className="flex justify-end">
            <Button disabled={create.isPending}>Create budget</Button>
          </div>
        </form>
      </Card>

      <Card className="overflow-hidden">
        <div className="p-4">
          <CrmSalespersonSelect
            label="Filter by salesperson"
            value={salesperson}
            onChange={setSalesperson}
            allowEmpty
            placeholder="All salespeople"
          />
        </div>
        {query.isLoading || query.isError || !query.data?.length ? (
          <CrmEmpty loading={query.isLoading} error={query.isError ? getErrorMessage(query.error) : undefined}>
            No budgets found.
          </CrmEmpty>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className={thClass}>Salesperson</th>
                  <th className={thClass}>Period</th>
                  <th className={thClass}>Service</th>
                  <th className={thClass}>Target</th>
                  <th className={thClass}>Actual</th>
                </tr>
              </thead>
              <tbody>
                {query.data.map((x) => (
                  <tr key={x.id} className="border-t">
                    <td className={tdClass}>{x.salesperson_id}</td>
                    <td className={tdClass}>
                      {crmLabel(x.period_type)} · {x.period_start}
                    </td>
                    <td className={tdClass}>{x.job_type ? crmLabel(x.job_type) : 'All'}</td>
                    <td className={tdClass}>{x.target_amount.toLocaleString()}</td>
                    <td className={tdClass}>{x.actual_amount?.toLocaleString() ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
