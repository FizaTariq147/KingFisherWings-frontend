import { useState } from 'react';
import { type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useAppForm } from '@/lib/validation';
import { CRM_PAGE_SIZE, FOLLOW_UP_STATUSES, crmLabel, type FollowUpStatus } from '../constants/crm.constants';
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
import {
  useCreateCrmFollowUp,
  useCrmFollowUpCalendar,
  useCrmFollowUps,
  usePatchCrmFollowUp,
} from '../hooks/useCrmFollowUps';
import { createFollowUpSchema, type CreateFollowUpFormValues } from '../schemas/crm.schema';
import { getErrorMessage } from '../utils/getErrorMessage';
import { prepareCrmPayload } from '../utils/prepareCrmPayload';

const defaults: CreateFollowUpFormValues = {
  due_date: '',
  subject: '',
  notes: '',
  lead_id: '',
  party_id: '',
  enquiry_id: '',
  owner_id: '',
};

export default function CrmFollowUpsPage() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<FollowUpStatus | ''>('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [ownerId, setOwnerId] = useState('');
  const [team, setTeam] = useState(false);
  const [tab, setTab] = useState<'list' | 'calendar'>('list');

  const query = useCrmFollowUps({
    page,
    limit: CRM_PAGE_SIZE,
    status: status || undefined,
    from: from || undefined,
    to: to || undefined,
    owner_id: ownerId || undefined,
    team: team || undefined,
  });
  const calendar = useCrmFollowUpCalendar(from, to, tab === 'calendar');
  const create = useCreateCrmFollowUp();
  const patch = usePatchCrmFollowUp();

  const form = useAppForm<CreateFollowUpFormValues>({
    resolver: zodResolver(createFollowUpSchema) as unknown as Resolver<CreateFollowUpFormValues>,
    defaultValues: defaults,
  });
  const { register, handleValidatedSubmit, watch, setValue, reset, formState: { errors } } = form;
  const err = (name: keyof CreateFollowUpFormValues) =>
    errors[name]?.message ? String(errors[name]?.message) : undefined;

  const items = tab === 'calendar' ? calendar.data ?? [] : query.data?.items ?? [];
  const loading = tab === 'calendar' ? calendar.isLoading : query.isLoading;
  const error = tab === 'calendar' ? calendar.error : query.error;

  return (
    <div className="space-y-4">
      <CrmPageHeader
        title="Follow-ups"
        description="Plan sales tasks, review overdue work, and close completed actions."
      />
      <Card className="p-4">
        <form
          className="space-y-3"
          onSubmit={handleValidatedSubmit(async (values) => {
            await create.mutateAsync(prepareCrmPayload(values) as CreateFollowUpFormValues);
            reset(defaults);
          })}
        >
          <h2 className="font-semibold">Create follow-up</h2>
          {create.isError && <CrmAlert>{getErrorMessage(create.error)}</CrmAlert>}
          {create.isSuccess && <CrmAlert success>Follow-up created.</CrmAlert>}
          <div className="grid gap-3 md:grid-cols-3">
            <Field label="Due date" required error={err('due_date')}>
              <TextInput type="datetime-local" {...register('due_date')} />
            </Field>
            <Field label="Subject" required error={err('subject')}>
              <TextInput {...register('subject')} />
            </Field>
            <CrmSalespersonSelect
              label="Owner"
              value={watch('owner_id') ?? ''}
              onChange={(v) => setValue('owner_id', v, { shouldValidate: true })}
              error={err('owner_id')}
            />
            <Field label="Lead ID" error={err('lead_id')}>
              <TextInput {...register('lead_id')} placeholder="UUID" />
            </Field>
            <Field label="Party ID" error={err('party_id')}>
              <TextInput {...register('party_id')} placeholder="UUID" />
            </Field>
            <Field label="Enquiry ID" error={err('enquiry_id')}>
              <TextInput {...register('enquiry_id')} placeholder="UUID" />
            </Field>
          </div>
          <Field label="Notes" error={err('notes')}>
            <TextArea {...register('notes')} />
          </Field>
          <div className="flex justify-end">
            <Button disabled={create.isPending}>Create follow-up</Button>
          </div>
        </form>
      </Card>

      <Card className="overflow-hidden">
        <div className="flex flex-wrap gap-2 border-b p-4">
          <Button size="sm" variant={tab === 'list' ? 'primary' : 'secondary'} onClick={() => setTab('list')}>
            Due list
          </Button>
          <Button size="sm" variant={tab === 'calendar' ? 'primary' : 'secondary'} onClick={() => setTab('calendar')}>
            Calendar
          </Button>
          <SelectInput className="max-w-44" value={status} onChange={(e) => setStatus(e.target.value as FollowUpStatus | '')}>
            <option value="">All statuses</option>
            {FOLLOW_UP_STATUSES.map((x) => (
              <option key={x} value={x}>
                {crmLabel(x)}
              </option>
            ))}
          </SelectInput>
          <TextInput type="date" className="max-w-44" value={from} onChange={(e) => setFrom(e.target.value)} />
          <TextInput type="date" className="max-w-44" value={to} onChange={(e) => setTo(e.target.value)} />
          {tab === 'list' && (
            <div className="min-w-56">
              <CrmSalespersonSelect
                label="Owner"
                placeholder="All owners"
                value={ownerId}
                onChange={setOwnerId}
                allowEmpty
              />
            </div>
          )}
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={team} onChange={(e) => setTeam(e.target.checked)} />
            Team follow-ups
          </label>
        </div>
        {tab === 'calendar' && (!from || !to) ? (
          <CrmEmpty>Choose From and To dates to load the calendar.</CrmEmpty>
        ) : loading || error || !items.length ? (
          <CrmEmpty loading={loading} error={error ? getErrorMessage(error) : undefined} />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className={thClass}>Due</th>
                    <th className={thClass}>Subject</th>
                    <th className={thClass}>Owner</th>
                    <th className={thClass}>Status</th>
                    <th className={thClass}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((x) => (
                    <tr key={x.id} className="border-t">
                      <td className={tdClass}>{new Date(x.due_date).toLocaleString()}</td>
                      <td className={tdClass}>
                        {x.subject}
                        <div className="text-xs text-[var(--color-neutral-400)]">{x.notes}</div>
                      </td>
                      <td className={tdClass}>{x.owner_id || '—'}</td>
                      <td className={tdClass}>
                        <CrmStatusBadge status={x.status} />
                      </td>
                      <td className={tdClass}>
                        <SelectInput
                          value={x.status}
                          className="min-w-36"
                          onChange={(e) =>
                            patch.mutate({ id: x.id, dto: { status: e.target.value as FollowUpStatus } })
                          }
                        >
                          {FOLLOW_UP_STATUSES.map((s) => (
                            <option key={s} value={s}>
                              {crmLabel(s)}
                            </option>
                          ))}
                        </SelectInput>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {tab === 'list' && query.data && <Pagination {...query.data.meta} onPage={setPage} />}
          </>
        )}
      </Card>
    </div>
  );
}
