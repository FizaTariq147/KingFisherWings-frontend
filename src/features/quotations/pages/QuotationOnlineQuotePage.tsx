import { useState } from 'react';
import { type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { isUuid } from '@/lib/isUuid';
import { useAppForm } from '@/lib/validation';
import { MASTER_PATHS } from '@/features/masters/api/masterPaths';
import { useMasterOptions } from '@/features/masters/hooks/useMasterResource';
import { JOB_TYPE_LABELS, JOB_TYPES } from '../constants/quotation.constants';
import { useCreateOnlineQuote } from '../hooks/useQuotations';
import { createOnlineQuoteSchema } from '../schemas/quotation.schema';
import type { CreateOnlineQuoteFormValues } from '../types/quotation.types';
import { getErrorMessage } from '../utils/getErrorMessage';
import { quotationDisplayNumber } from '../utils/normalizeQuotation';

const selectClass =
  'h-9 w-full rounded-md border border-[var(--color-neutral-200)] bg-white px-3 text-sm focus:outline-none focus:border-[var(--color-primary-500)]';

export default function QuotationOnlineQuotePage() {
  const navigate = useNavigate();
  const create = useCreateOnlineQuote();
  const [error, setError] = useState<string | null>(null);
  const [resultMsg, setResultMsg] = useState<string | null>(null);
  const { data: ports = [] } = useMasterOptions('ports', MASTER_PATHS.ports, true);

  const {
    register,
    handleValidatedSubmit,
    applyApiErrors,
    formState: { errors },
  } = useAppForm<CreateOnlineQuoteFormValues>({
    resolver: zodResolver(createOnlineQuoteSchema) as Resolver<CreateOnlineQuoteFormValues>,
    defaultValues: {
      tenant_slug: '',
      job_type: 'SEA_FCL_EXPORT',
      currency_code: 'AED',
      contact_name: '',
      contact_email: '',
    },
  });

  return (
    <div className="space-y-4 max-w-3xl">
      <button
        type="button"
        className="text-xs font-medium text-[var(--color-neutral-400)] hover:text-[var(--color-neutral-600)]"
        onClick={() => navigate('/quotations')}
      >
        ← Quotations
      </button>
      <div>
        <h2 className="text-lg font-semibold text-[var(--color-neutral-800)]">Online quote</h2>
        <p className="text-sm text-[var(--color-neutral-400)] mt-0.5">
          POST /quotations/online-quote — tariff auto-calc widget payload.
        </p>
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-lg border px-4 py-3 text-sm"
          style={{
            background: 'var(--color-danger-100)',
            borderColor: '#FECACA',
            color: 'var(--color-danger-700)',
          }}
        >
          {error}
        </div>
      )}
      {resultMsg && (
        <div
          role="status"
          className="rounded-lg border px-4 py-3 text-sm"
          style={{
            background: 'var(--color-success-100)',
            borderColor: '#BBF7D0',
            color: 'var(--color-success-700)',
          }}
        >
          {resultMsg}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Quote request</CardTitle>
        </CardHeader>
        <form
          className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 pt-0"
          onSubmit={handleValidatedSubmit(async (values) => {
            setError(null);
            setResultMsg(null);
            try {
              const q = await create.mutateAsync(values);
              const label =
                q && typeof q === 'object' && 'id' in q
                  ? quotationDisplayNumber(q as Parameters<typeof quotationDisplayNumber>[0])
                  : 'Quote created';
              setResultMsg(`${label} created via online-quote.`);
              if (q && typeof q === 'object' && 'id' in q) {
                navigate(`/quotations/${(q as { id: string }).id}`);
              }
            } catch (err) {
              applyApiErrors(err);
              const msg = getErrorMessage(err);
              setError(msg);
              // Accepted with empty body — still useful to open the list
              if (/accepted by the server/i.test(msg)) {
                setResultMsg('Request accepted. Check All Quotations for the new draft.');
              }
            }
          })}
        >
          <Input
            label="Tenant slug *"
            error={errors.tenant_slug?.message as string | undefined}
            {...register('tenant_slug')}
          />
          <div className="space-y-1">
            <label htmlFor="job_type" className="text-xs font-medium text-[var(--color-neutral-500)]">Job type *</label>
            <select id="job_type" className={selectClass} {...register('job_type')}>
              {JOB_TYPES.map((jt) => (
                <option key={jt} value={jt}>
                  {JOB_TYPE_LABELS[jt] ?? jt}
                </option>
              ))}
            </select>
          </div>
          <Input label="Currency *" {...register('currency_code')} />
          <Input label="Contact name" {...register('contact_name')} />
          <Input label="Contact email" type="email" {...register('contact_email')} />
          <div className="space-y-1">
            <label htmlFor="origin_port_id" className="text-xs font-medium text-[var(--color-neutral-500)]">Origin port</label>
            <select id="origin_port_id" className={selectClass} {...register('origin_port_id')}>
              <option value="">Select…</option>
              {(() => {
                const opts = [];
                for (const p of ports) {
                  if (!isUuid(String(p.id))) continue;
                  opts.push(
                    <option key={String(p.id)} value={String(p.id)}>
                      {[p.code, p.name].filter(Boolean).join(' — ') || String(p.id)}
                    </option>,
                  );
                }
                return opts;
              })()}
            </select>
          </div>
          <div className="space-y-1">
            <label htmlFor="dest_port_id" className="text-xs font-medium text-[var(--color-neutral-500)]">
              Destination port
            </label>
            <select id="dest_port_id" className={selectClass} {...register('dest_port_id')}>
              <option value="">Select…</option>
              {(() => {
                const opts = [];
                for (const p of ports) {
                  if (!isUuid(String(p.id))) continue;
                  opts.push(
                    <option key={String(p.id)} value={String(p.id)}>
                      {[p.code, p.name].filter(Boolean).join(' — ') || String(p.id)}
                    </option>,
                  );
                }
                return opts;
              })()}
            </select>
          </div>
          <Input label="Commodity" {...register('commodity')} />
          <Input
            label="Gross weight"
            type="number"
            step="any"
            {...register('gross_weight', { valueAsNumber: true })}
          />
          <Input
            label="Volume (CBM)"
            type="number"
            step="any"
            {...register('volume_cbm', { valueAsNumber: true })}
          />
          <Input
            label="Pieces"
            type="number"
            step="any"
            {...register('pieces', { valueAsNumber: true })}
          />
          <Input type="date" label="Valid until" {...register('valid_until')} />
          <div className="space-y-1 sm:col-span-2">
            <label htmlFor="special_requirements" className="text-xs font-medium text-[var(--color-neutral-500)]">
              Special requirements
            </label>
            <textarea
              id="special_requirements"
              className="min-h-[72px] w-full rounded-md border border-[var(--color-neutral-200)] px-3 py-2 text-sm"
              {...register('special_requirements')}
            />
          </div>
          <div className="sm:col-span-2 flex justify-end">
            <Button type="submit" disabled={create.isPending}>
              {create.isPending ? 'Submitting…' : 'Request online quote'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
