import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { useInlineValidation } from '@/lib/validation';
import { useJobActions, useJobChargeMutations } from '../../hooks/useJobActions';
import {
  createJobChargeSchema,
  prorateCostFormSchema,
} from '../../schemas/job.schema';
import type { Job, JobCharge } from '../../types/job.types';
import { getErrorMessage } from '../../utils/getErrorMessage';

interface JobChargesPanelProps {
  job: Job;
  onChanged?: () => void;
}

export function JobChargesPanel({ job, onChanged }: JobChargesPanelProps) {
  const charges = job.charges ?? [];
  const mutations = useJobChargeMutations(job.id);
  const actions = useJobActions(job.id);
  const validation = useInlineValidation();
  const prorateValidation = useInlineValidation();
  const [error, setError] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [chargeCodeId, setChargeCodeId] = useState('');
  const [description, setDescription] = useState('');
  const [unitPrice, setUnitPrice] = useState('');
  const [currency, setCurrency] = useState('AED');
  const [prorateCodeId, setProrateCodeId] = useState('');

  const run = async (fn: () => Promise<unknown>, success?: string) => {
    setError(null);
    setMsg(null);
    try {
      await fn();
      if (success) setMsg(success);
      onChanged?.();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const addCharge = async () => {
    const ok = await validation.runValidated(
      createJobChargeSchema,
      {
        charge_code_id: chargeCodeId.trim(),
        description: description.trim(),
        unit_price: unitPrice === '' ? undefined : Number(unitPrice),
        currency_code: currency.trim(),
      },
      async (dto) => {
        await mutations.create.mutateAsync(dto);
        setChargeCodeId('');
        setDescription('');
        setUnitPrice('');
        setMsg('Charge added.');
        onChanged?.();
      },
    );
    if (!ok) setError(null);
  };

  const prorate = async () => {
    const ok = await prorateValidation.runValidated(
      prorateCostFormSchema,
      { charge_code_id: prorateCodeId.trim() },
      async (dto) => {
        await actions.prorateCost.mutateAsync(dto.charge_code_id);
        setProrateCodeId('');
        setMsg('Cost prorated.');
        onChanged?.();
      },
    );
    if (!ok) setError(null);
  };

  return (
    <div className="space-y-4">
      {(error || validation.formError || prorateValidation.formError) && (
        <p className="text-sm text-[var(--color-danger-600)]">
          {error || validation.formError || prorateValidation.formError}
        </p>
      )}
      {msg && <p className="text-sm text-[var(--color-success-700)]">{msg}</p>}
      <Card>
        <CardHeader>
          <CardTitle>Charge lines</CardTitle>
        </CardHeader>
        <div className="px-4 pb-4 space-y-2">
          {charges.length === 0 ? (
            <p className="text-sm text-[var(--color-neutral-400)]">No charges yet.</p>
          ) : (
            charges.map((c: JobCharge) => (
              <div
                key={c.id}
                className="flex flex-wrap items-center justify-between gap-2 py-2 border-b border-[var(--color-neutral-100)] text-sm"
              >
                <div>
                  <p className="font-medium">{c.description}</p>
                  <p className="text-xs text-[var(--color-neutral-400)]">
                    {c.currency_code} {c.unit_price}
                    {c.quantity != null ? ` × ${c.quantity}` : ''}
                    {c.charge_code_id ? ` · code ${c.charge_code_id.slice(0, 8)}` : ''}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={() =>
                      run(
                        () =>
                          mutations.update.mutateAsync({
                            chargeId: c.id,
                            dto: {
                              description: c.description,
                              unit_price: c.unit_price,
                              currency_code: c.currency_code,
                            },
                          }),
                        'Charge updated.',
                      )
                    }
                  >
                    Touch update
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="danger"
                    onClick={() =>
                      run(() => mutations.remove.mutateAsync(c.id), 'Charge removed.')
                    }
                  >
                    Remove
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Add charge</CardTitle>
        </CardHeader>
        <div className="px-4 pb-4 grid gap-3 sm:grid-cols-2">
          <Input
            label="Charge code UUID"
            placeholder="Charge code UUID"
            value={chargeCodeId}
            error={validation.fieldError('charge_code_id')}
            onChange={(e) => {
              setChargeCodeId(e.target.value);
              validation.clearField('charge_code_id');
            }}
          />
          <Input
            label="Description"
            placeholder="Description"
            value={description}
            error={validation.fieldError('description')}
            onChange={(e) => {
              setDescription(e.target.value);
              validation.clearField('description');
            }}
          />
          <Input
            label="Unit price"
            placeholder="Unit price"
            type="number"
            value={unitPrice}
            error={validation.fieldError('unit_price')}
            onChange={(e) => {
              setUnitPrice(e.target.value);
              validation.clearField('unit_price');
            }}
          />
          <Input
            label="Currency"
            placeholder="Currency"
            value={currency}
            error={validation.fieldError('currency_code')}
            onChange={(e) => {
              setCurrency(e.target.value);
              validation.clearField('currency_code');
            }}
          />
          <Button
            type="button"
            disabled={mutations.create.isPending}
            onClick={() => void addCharge()}
            className="sm:col-span-2 w-fit"
          >
            Add charge
          </Button>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Prorate master cost to houses</CardTitle>
        </CardHeader>
        <div className="px-4 pb-4 space-y-2">
          <div className="flex flex-wrap gap-2 items-start">
            <Input
              placeholder="Charge code UUID to prorate"
              value={prorateCodeId}
              error={prorateValidation.fieldError('charge_code_id')}
              onChange={(e) => {
                setProrateCodeId(e.target.value);
                prorateValidation.clearField('charge_code_id');
              }}
              className="max-w-xs"
            />
            <Button
              type="button"
              variant="secondary"
              disabled={actions.prorateCost.isPending}
              onClick={() => void prorate()}
            >
              Prorate cost
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
