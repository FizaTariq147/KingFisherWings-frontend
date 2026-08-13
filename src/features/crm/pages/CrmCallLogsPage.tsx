import { useState } from 'react';
import { type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useAppForm } from '@/lib/validation';
import {
  CALL_OUTCOMES,
  CALL_PURPOSES,
  CALL_TYPES,
  CRM_PAGE_SIZE,
  crmLabel,
} from '../constants/crm.constants';
import { CrmSalespersonSelect } from '../components/CrmFormControls';
import { CrmStatusBadge } from '../components/CrmStatusBadge';
import {
  CrmAlert,
  CrmEmpty,
  CrmPageHeader,
  Field,
  Pagination,
  SelectInput,
  TextArea,
  TextInput,
  tdClass,
  thClass,
} from '../components/CrmUi';
import { useCreateCrmCallLog, useCrmCallLogs, useCrmDailyCallLogs } from '../hooks/useCrmCallLogs';
import { createCallLogSchema, type CreateCallLogFormValues } from '../schemas/crm.schema';
import { getErrorMessage } from '../utils/getErrorMessage';
import { prepareCrmPayload } from '../utils/prepareCrmPayload';

const defaults: CreateCallLogFormValues = {
  date_time: new Date().toISOString().slice(0, 16),
  contact_person: '',
  call_type: 'PHONE',
  purpose: 'FOLLOW_UP',
  discussion_summary: '',
  outcome: 'NEUTRAL',
  lead_id: '',
  party_id: '',
  next_action: '',
  next_followup_date: '',
};

export default function CrmCallLogsPage() {
  const [page, setPage] = useState(1);
  const [date, setDate] = useState('');
  const [salesperson, setSalesperson] = useState('');
  const [tab, setTab] = useState<'list' | 'daily'>('list');

  const list = useCrmCallLogs({
    page,
    limit: CRM_PAGE_SIZE,
    date: date || undefined,
    salesperson_id: salesperson || undefined,
  });
  const daily = useCrmDailyCallLogs(date, salesperson, tab === 'daily');
  const create = useCreateCrmCallLog();

  const form = useAppForm<CreateCallLogFormValues>({
    resolver: zodResolver(createCallLogSchema) as unknown as Resolver<CreateCallLogFormValues>,
    defaultValues: defaults,
  });
  const { register, handleValidatedSubmit, watch, setValue, reset, formState: { errors } } = form;
  const err = (name: keyof CreateCallLogFormValues) =>
    errors[name]?.message ? String(errors[name]?.message) : undefined;

  const items = tab === 'daily' ? daily.data ?? [] : list.data?.items ?? [];
  const loading = tab === 'daily' ? daily.isLoading : list.isLoading;
  const error = tab === 'daily' ? daily.error : list.error;

  return (
    <div className="space-y-4">
      <CrmPageHeader
        title="Call Sheet"
        description="Record customer interactions and review daily salesperson activity."
      />
      <Card className="p-4">
        <form
          className="space-y-4"
          onSubmit={handleValidatedSubmit(async (values) => {
            await create.mutateAsync(prepareCrmPayload(values) as CreateCallLogFormValues);
            reset(defaults);
          })}
        >
          <h2 className="font-semibold">New call log</h2>
          {create.isError && <CrmAlert>{getErrorMessage(create.error)}</CrmAlert>}
          {create.isSuccess && <CrmAlert success>Call logged successfully.</CrmAlert>}
          <div className="grid gap-3 md:grid-cols-3">
            <Field label="Date & time" required error={err('date_time')}>
              <TextInput type="datetime-local" {...register('date_time')} />
            </Field>
            <Field label="Contact person" required error={err('contact_person')}>
              <TextInput {...register('contact_person')} />
            </Field>
            <Field label="Type" error={err('call_type')}>
              <SelectInput {...register('call_type')}>
                {CALL_TYPES.map((x) => (
                  <option key={x} value={x}>
                    {crmLabel(x)}
                  </option>
                ))}
              </SelectInput>
            </Field>
            <Field label="Purpose" error={err('purpose')}>
              <SelectInput {...register('purpose')}>
                {CALL_PURPOSES.map((x) => (
                  <option key={x} value={x}>
                    {crmLabel(x)}
                  </option>
                ))}
              </SelectInput>
            </Field>
            <Field label="Outcome" error={err('outcome')}>
              <SelectInput {...register('outcome')}>
                {CALL_OUTCOMES.map((x) => (
                  <option key={x} value={x}>
                    {crmLabel(x)}
                  </option>
                ))}
              </SelectInput>
            </Field>
            <Field label="Duration (minutes)" error={err('duration_minutes')}>
              <TextInput
                type="number"
                min={0}
                {...register('duration_minutes', { valueAsNumber: true })}
              />
            </Field>
            <Field label="Lead ID" error={err('lead_id')}>
              <TextInput {...register('lead_id')} placeholder="UUID" />
            </Field>
            <Field label="Party ID" error={err('party_id')}>
              <TextInput {...register('party_id')} placeholder="UUID" />
            </Field>
            <Field label="Next follow-up date" error={err('next_followup_date')}>
              <TextInput type="date" {...register('next_followup_date')} />
              <span className="mt-1 block text-xs font-normal text-[var(--color-neutral-400)]">
                When set, the backend creates a linked follow-up.
              </span>
            </Field>
          </div>
          <Field label="Discussion summary" required error={err('discussion_summary')}>
            <TextArea {...register('discussion_summary')} />
          </Field>
          <Field label="Next action" error={err('next_action')}>
            <TextInput {...register('next_action')} />
          </Field>
          <div className="flex justify-end">
            <Button disabled={create.isPending}>{create.isPending ? 'Saving…' : 'Save call log'}</Button>
          </div>
        </form>
      </Card>

      <Card className="overflow-hidden">
        <div className="flex flex-wrap items-end gap-3 border-b p-4">
          <div className="flex gap-2">
            <Button variant={tab === 'list' ? 'primary' : 'secondary'} onClick={() => setTab('list')}>
              All calls
            </Button>
            <Button variant={tab === 'daily' ? 'primary' : 'secondary'} onClick={() => setTab('daily')}>
              Daily sheet
            </Button>
          </div>
          <TextInput type="date" className="max-w-44" value={date} onChange={(e) => setDate(e.target.value)} />
          <div className="min-w-64 flex-1">
            <CrmSalespersonSelect
              label="Salesperson"
              value={salesperson}
              onChange={setSalesperson}
              allowEmpty
              placeholder="All salespeople"
            />
          </div>
        </div>
        {loading || error || !items.length ? (
          <CrmEmpty loading={loading} error={error ? getErrorMessage(error) : undefined}>
            {tab === 'daily' && (!date || !salesperson)
              ? 'Choose a date and salesperson to load the daily sheet.'
              : 'No call logs found.'}
          </CrmEmpty>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className={thClass}>Date</th>
                    <th className={thClass}>Contact</th>
                    <th className={thClass}>Type</th>
                    <th className={thClass}>Purpose</th>
                    <th className={thClass}>Outcome</th>
                    <th className={thClass}>Summary</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((x) => (
                    <tr key={x.id} className="border-t">
                      <td className={tdClass}>{new Date(x.date_time).toLocaleString()}</td>
                      <td className={tdClass}>{x.contact_person}</td>
                      <td className={tdClass}>{crmLabel(x.call_type)}</td>
                      <td className={tdClass}>{crmLabel(x.purpose)}</td>
                      <td className={tdClass}>
                        <CrmStatusBadge status={x.outcome} />
                      </td>
                      <td className={tdClass}>{x.discussion_summary}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {tab === 'list' && list.data && <Pagination {...list.data.meta} onPage={setPage} />}
          </>
        )}
      </Card>
    </div>
  );
}
