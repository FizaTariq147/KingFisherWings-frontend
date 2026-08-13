import { useState } from 'react';
import { type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useAppForm } from '@/lib/validation';
import { CrmCountryField } from '../components/CrmFormControls';
import { CrmAlert, CrmEmpty, CrmPageHeader, Field, TextArea, TextInput, tdClass, thClass } from '../components/CrmUi';
import { CrmStatusBadge } from '../components/CrmStatusBadge';
import {
  useCreateCrmCampaign,
  useCreateCrmSubscriber,
  useCreateCrmTemplate,
  useCrmCampaigns,
  useCrmSubscribers,
  useCrmTemplates,
  useImportCrmSubscribers,
  useScheduleCrmCampaign,
  useSendCrmCampaign,
  useUnsubscribeCrmSubscriber,
} from '../hooks/useCrmEmail';
import {
  createCampaignSchema,
  createCampaignTemplateSchema,
  createSubscriberSchema,
  toCreateSubscriberDto,
  type CreateCampaignFormValues,
  type CreateCampaignTemplateFormValues,
  type CreateSubscriberFormValues,
} from '../schemas/crm.schema';
import { getErrorMessage } from '../utils/getErrorMessage';
import { prepareCrmPayload } from '../utils/prepareCrmPayload';

const subscriberDefaults: CreateSubscriberFormValues = {
  email: '',
  full_name: '',
  country_code: '',
  party_id: '',
  tags: '',
};

const templateDefaults: CreateCampaignTemplateFormValues = {
  name: '',
  subject: '',
  body: '',
};

const campaignDefaults: CreateCampaignFormValues = {
  name: '',
  subject: '',
  body: '',
  scheduled_at: '',
  filter_party_type: '',
  filter_country: '',
};

export default function CrmEmailMarketingPage() {
  const [tab, setTab] = useState<'subscribers' | 'templates' | 'campaigns'>('subscribers');
  const subscribers = useCrmSubscribers();
  const templates = useCrmTemplates();
  const campaigns = useCrmCampaigns();
  const addSubscriber = useCreateCrmSubscriber();
  const importSubscribers = useImportCrmSubscribers();
  const unsubscribe = useUnsubscribeCrmSubscriber();
  const addTemplate = useCreateCrmTemplate();
  const addCampaign = useCreateCrmCampaign();
  const schedule = useScheduleCrmCampaign();
  const send = useSendCrmCampaign();

  const subscriberForm = useAppForm<CreateSubscriberFormValues>({
    resolver: zodResolver(createSubscriberSchema) as unknown as Resolver<CreateSubscriberFormValues>,
    defaultValues: subscriberDefaults,
  });
  const templateForm = useAppForm<CreateCampaignTemplateFormValues>({
    resolver: zodResolver(createCampaignTemplateSchema) as unknown as Resolver<CreateCampaignTemplateFormValues>,
    defaultValues: templateDefaults,
  });
  const campaignForm = useAppForm<CreateCampaignFormValues>({
    resolver: zodResolver(createCampaignSchema) as unknown as Resolver<CreateCampaignFormValues>,
    defaultValues: campaignDefaults,
  });

  const error =
    addSubscriber.error ||
    importSubscribers.error ||
    unsubscribe.error ||
    addTemplate.error ||
    addCampaign.error ||
    schedule.error ||
    send.error;

  const subErr = (name: keyof CreateSubscriberFormValues) =>
    subscriberForm.formState.errors[name]?.message
      ? String(subscriberForm.formState.errors[name]?.message)
      : undefined;

  const tplErr = (name: keyof CreateCampaignTemplateFormValues) =>
    templateForm.formState.errors[name]?.message
      ? String(templateForm.formState.errors[name]?.message)
      : undefined;

  const campErr = (name: keyof CreateCampaignFormValues) =>
    campaignForm.formState.errors[name]?.message
      ? String(campaignForm.formState.errors[name]?.message)
      : undefined;

  return (
    <div className="space-y-4">
      <CrmPageHeader
        title="Email Marketing"
        description="Manage opted-in subscribers, reusable templates, and outbound campaigns."
      />
      {error && <CrmAlert>{getErrorMessage(error)}</CrmAlert>}
      <div className="flex gap-2">
        {(['subscribers', 'templates', 'campaigns'] as const).map((x) => (
          <Button key={x} variant={tab === x ? 'primary' : 'secondary'} onClick={() => setTab(x)}>
            {x[0].toUpperCase() + x.slice(1)}
          </Button>
        ))}
      </div>

      {tab === 'subscribers' && (
        <>
          <Card className="p-4">
            <form
              className="grid gap-3 md:grid-cols-5"
              onSubmit={subscriberForm.handleValidatedSubmit(async (values) => {
                await addSubscriber.mutateAsync(toCreateSubscriberDto(values));
                subscriberForm.reset(subscriberDefaults);
              })}
            >
              <Field label="Email" required error={subErr('email')}>
                <TextInput type="email" {...subscriberForm.register('email')} />
              </Field>
              <Field label="Full name" error={subErr('full_name')}>
                <TextInput {...subscriberForm.register('full_name')} />
              </Field>
              <CrmCountryField
                label="Country"
                value={subscriberForm.watch('country_code') ?? ''}
                onChange={(iso) =>
                  subscriberForm.setValue('country_code', iso, { shouldValidate: true })
                }
                error={subErr('country_code')}
              />
              <Field label="Tags" error={subErr('tags')}>
                <TextInput {...subscriberForm.register('tags')} placeholder="customer, air" />
              </Field>
              <div className="flex items-end">
                <Button disabled={addSubscriber.isPending}>Add subscriber</Button>
              </div>
            </form>
            <label className="mt-3 inline-flex cursor-pointer rounded-md border px-3 py-2 text-sm">
              Import CSV
              <input
                className="hidden"
                type="file"
                accept=".csv,text/csv"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) importSubscribers.mutate(f);
                }}
              />
            </label>
          </Card>
          <Card className="overflow-hidden">
            {subscribers.isLoading || subscribers.isError || !subscribers.data?.length ? (
              <CrmEmpty
                loading={subscribers.isLoading}
                error={subscribers.isError ? getErrorMessage(subscribers.error) : undefined}
              />
            ) : (
              <table className="w-full">
                <thead>
                  <tr>
                    <th className={thClass}>Email</th>
                    <th className={thClass}>Name</th>
                    <th className={thClass}>Tags</th>
                    <th className={thClass}>Status</th>
                    <th className={thClass}></th>
                  </tr>
                </thead>
                <tbody>
                  {subscribers.data.map((x) => (
                    <tr key={x.id} className="border-t">
                      <td className={tdClass}>{x.email}</td>
                      <td className={tdClass}>{x.full_name || '—'}</td>
                      <td className={tdClass}>{x.tags.join(', ') || '—'}</td>
                      <td className={tdClass}>
                        <CrmStatusBadge
                          status={x.unsubscribed_at || x.is_subscribed === false ? 'UNSUBSCRIBED' : 'ACTIVE'}
                        />
                      </td>
                      <td className={tdClass}>
                        <Button
                          size="sm"
                          variant="secondary"
                          disabled={Boolean(x.unsubscribed_at || x.is_subscribed === false)}
                          onClick={() => unsubscribe.mutate(x.id)}
                        >
                          Unsubscribe
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Card>
        </>
      )}

      {tab === 'templates' && (
        <>
          <Card className="p-4">
            <form
              className="space-y-3"
              onSubmit={templateForm.handleValidatedSubmit(async (values) => {
                await addTemplate.mutateAsync(values);
                templateForm.reset(templateDefaults);
              })}
            >
              <div className="grid gap-3 md:grid-cols-2">
                <Field label="Name" required error={tplErr('name')}>
                  <TextInput {...templateForm.register('name')} className={tplErr('name') ? 'border-red-400' : ''} />
                </Field>
                <Field label="Subject" required error={tplErr('subject')}>
                  <TextInput {...templateForm.register('subject')} className={tplErr('subject') ? 'border-red-400' : ''} />
                </Field>
              </div>
              <Field label="Body" required error={tplErr('body')}>
                <TextArea {...templateForm.register('body')} className={tplErr('body') ? 'border-red-400' : ''} />
              </Field>
              <Button disabled={addTemplate.isPending}>Create template</Button>
            </form>
          </Card>
          <Card className="p-4">
            {templates.isLoading || templates.isError || !templates.data?.length ? (
              <CrmEmpty
                loading={templates.isLoading}
                error={templates.isError ? getErrorMessage(templates.error) : undefined}
              />
            ) : (
              <div className="grid gap-3 md:grid-cols-2">
                {templates.data.map((x) => (
                  <div key={x.id} className="rounded-lg border p-3">
                    <h3 className="font-semibold">{x.name}</h3>
                    <p className="text-sm">{x.subject}</p>
                    <p className="mt-2 line-clamp-3 text-xs text-[var(--color-neutral-500)]">{x.body}</p>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </>
      )}

      {tab === 'campaigns' && (
        <>
          <Card className="p-4">
            <form
              className="space-y-3"
              onSubmit={campaignForm.handleValidatedSubmit(async (values) => {
                await addCampaign.mutateAsync(prepareCrmPayload(values) as CreateCampaignFormValues);
                campaignForm.reset(campaignDefaults);
              })}
            >
              <div className="grid gap-3 md:grid-cols-3">
                <Field label="Name" required error={campErr('name')}>
                  <TextInput {...campaignForm.register('name')} className={campErr('name') ? 'border-red-400' : ''} />
                </Field>
                <Field label="Subject" required error={campErr('subject')}>
                  <TextInput {...campaignForm.register('subject')} className={campErr('subject') ? 'border-red-400' : ''} />
                </Field>
                <Field label="Scheduled at" error={campErr('scheduled_at')}>
                  <TextInput type="datetime-local" {...campaignForm.register('scheduled_at')} />
                </Field>
                <Field label="Party type filter" error={campErr('filter_party_type')}>
                  <TextInput {...campaignForm.register('filter_party_type')} />
                </Field>
                <CrmCountryField
                  label="Country filter"
                  value={campaignForm.watch('filter_country') ?? ''}
                  onChange={(iso) => campaignForm.setValue('filter_country', iso, { shouldValidate: true })}
                  error={campErr('filter_country')}
                />
              </div>
              <Field label="Body" required error={campErr('body')}>
                <TextArea {...campaignForm.register('body')} className={campErr('body') ? 'border-red-400' : ''} />
              </Field>
              <Button disabled={addCampaign.isPending}>Create campaign</Button>
            </form>
          </Card>
          <Card className="overflow-hidden">
            {campaigns.isLoading || campaigns.isError || !campaigns.data?.length ? (
              <CrmEmpty
                loading={campaigns.isLoading}
                error={campaigns.isError ? getErrorMessage(campaigns.error) : undefined}
              />
            ) : (
              <table className="w-full">
                <thead>
                  <tr>
                    <th className={thClass}>Campaign</th>
                    <th className={thClass}>Schedule</th>
                    <th className={thClass}>Status</th>
                    <th className={thClass}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {campaigns.data.map((x) => (
                    <tr key={x.id} className="border-t">
                      <td className={tdClass}>
                        <strong>{x.name}</strong>
                        <div className="text-xs">{x.subject}</div>
                      </td>
                      <td className={tdClass}>
                        {x.scheduled_at ? new Date(x.scheduled_at).toLocaleString() : '—'}
                      </td>
                      <td className={tdClass}>
                        <CrmStatusBadge status={x.status} />
                      </td>
                      <td className={tdClass}>
                        <div className="flex gap-2">
                          <Button size="sm" variant="secondary" onClick={() => schedule.mutate(x.id)}>
                            Schedule
                          </Button>
                          <Button size="sm" onClick={() => send.mutate(x.id)}>
                            Send
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Card>
        </>
      )}
    </div>
  );
}
